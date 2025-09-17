import logging
import math
import os
from functools import cache

import duckdb
import pandas as pd
from mysql import connector as mysql


_logger = logging.getLogger(__name__)


_RESULTS_IMPORT_QUERY = """
    SELECT
        competitionId,
        roundTypeId,
        personName,
        personId,
        personCountryId,
        value1,
        value2,
        value3,
        regionalSingleRecord as wcaRecord,
        pos as wcaPos
    FROM Results
    WHERE eventId = '333mbf'
"""

_COUNTRIES_IMPORT_QUERY = """
    SELECT
        id,
        name,
        continentId,
        iso2
    FROM Countries
"""

_CONTINENTS_IMPORT_QUERY = """
    SELECT
        id,
        name,
        recordName
    FROM Continents
    WHERE recordName != ''
"""

_COMPETITIONS_IMPORT_QUERY = """
    SELECT
        id,
        name,
        countryId,
        DATE(CONCAT(year, '-', LPAD(month, 2, '0'), '-', LPAD(day, 2, '0'))) AS startdate
    FROM Competitions
    WHERE cancelled = 0
"""

_PERSONS_IMPORT_QUERY = """
    SELECT
        id,
        subId,
        name,
        countryId,
        gender
    FROM Persons
"""

_ROUND_TYPES_IMPORT_QUERY = """
    SELECT
        id,
        name,
        cellName,
        `rank`,
        final
    FROM RoundTypes
"""

_GET_BEST_RESULT_QUERY = """
    SELECT
        GREATEST(score1, score2, score3) AS best_score,
        CASE
            WHEN score1 = GREATEST(score1, score2, score3) THEN value1
            WHEN score2 = GREATEST(score1, score2, score3) THEN value2
            ELSE value3
        END AS best_result
    FROM Results
"""

_UPDATE_TIMESTAMP_QUERY = """
    SELECT updated_at FROM ar_internal_metadata WHERE value='production';
"""

_GET_WCA_SINGLE_RANKS_QUERY = """
    SELECT
        personId,
        RanksSingle.worldRank as wcaWorldRank,
        RanksSingle.continentRank as wcaContinentRank,
        RanksSingle.countryRank as wcaCountryRank
    FROM RanksSingle
    WHERE eventId = '333mbf'
"""

_JOIN_WCA_RANKS_QUERY = """
    SELECT
        rankings.*,
        wcaWorldRank,
        wcaContinentRank,
        wcaCountryRank
    FROM rankings
    LEFT JOIN wca_ranks ON rankings.personId = wca_ranks.personId
"""


def _fetch_data_from_mysql(query: str) -> pd.DataFrame:
    with mysql.connect(
        host=os.getenv("WCA_MYSQL_HOST"),
        port=os.getenv("WCA_MYSQL_PORT"),
        database=os.getenv("WCA_MYSQL_DATABASE"),
        user=os.environ["WCA_MYSQL_USER"],
        password=os.environ["WCA_MYSQL_PASSWORD"],
    ) as conn:
        return pd.read_sql(query, conn)  # type: ignore # expecting _SQLConnection, get MySQLConnectionAbstract


@cache
def _get_duckdb_file() -> str:
    duckdb_file = os.getenv("DUCKDB_FILE")
    if duckdb_file is None:
        duckdb_file = ":memory:"
    return duckdb_file


def _write_data_to_duckdb(data: pd.DataFrame, table_name: str) -> None:
    duckdb_file = _get_duckdb_file()

    with duckdb.connect(duckdb_file) as conn:
        conn.execute(f"DROP TABLE IF EXISTS {table_name}")
        conn.register("data", data)
        conn.execute(f"CREATE TABLE {table_name} AS SELECT * FROM data")


def _multi_result_to_components(result: int) -> tuple[int, int, int]:
    points = 99 - result // 10_000_000
    seconds = (result % 10_000_000) // 100
    missed = result % 100
    solved = points + missed
    attempted = solved + missed

    return solved, attempted, seconds


def _multi_result_to_score(result: int) -> float | None:
    if result == 0 or result is None:
        # Handle no result
        return None

    if result < 0:
        # Handle DNF and DNS
        return result

    solved, attempted, seconds = _multi_result_to_components(result)
    time_limit = attempted * 600 if attempted < 6 else 3600
    accuracy = solved / attempted
    time_used = seconds / time_limit

    return solved * accuracy / math.sqrt(time_used)


def _enhance_results(
    results: pd.DataFrame, countries: pd.DataFrame, competitions: pd.DataFrame
) -> pd.DataFrame:
    results["score1"] = results["value1"].apply(_multi_result_to_score)
    results["score2"] = results["value2"].apply(_multi_result_to_score)
    results["score3"] = results["value3"].apply(_multi_result_to_score)
    results.reset_index(drop=True, inplace=True)

    duckdb.register("results", results)
    results[["best_score", "best_result"]] = duckdb.sql(
        _GET_BEST_RESULT_QUERY
    ).fetchall()

    results["best_result"] = results["best_result"].astype(int)
    results = _calculate_mean_score(results)

    results = results.join(
        countries[["id", "continentId"]].set_index("id"), on="personCountryId"
    )
    results = results.join(
        competitions[["id", "startdate"]].set_index("id"), on="competitionId"
    )

    return results


def _calculate_mean_score(results: pd.DataFrame) -> pd.DataFrame:
    has_three_solves = (
        (results["value1"] != 0) & (results["value2"] != 0) & (results["value3"] != 0)
    )
    has_dnf = (
        (results["score1"] < 0) | (results["score2"] < 0) | (results["score3"] < 0)
    )
    has_three_valid_results = (
        (results["score1"] > 0) & (results["score2"] > 0) & (results["score3"] > 0)
    )

    results.loc[has_three_valid_results, "mean_score"] = (
        results["score1"] + results["score2"] + results["score3"]
    ) / 3

    results.loc[has_three_solves & has_dnf, "mean_score"] = -1

    return results


def _get_rankings(results: pd.DataFrame, wca_ranks: pd.DataFrame) -> pd.DataFrame:
    return _get_rankings_by_field(results, wca_ranks, "best_score")


def _get_mean_score_rankings(
    results: pd.DataFrame, wca_ranks: pd.DataFrame
) -> pd.DataFrame:
    return _get_rankings_by_field(results, wca_ranks, "mean_score")


def _get_rankings_by_field(
    results: pd.DataFrame, wca_ranks: pd.DataFrame, rank_field: str
) -> pd.DataFrame:
    # Get best result for each person
    best_index = results.groupby("personId")[rank_field].idxmax()
    rankings = results.loc[best_index]
    rankings.drop(
        columns=[
            "roundTypeId",
            "pos",
            "wcaPos",
        ],
        inplace=True,
    )

    rankings.sort_values(by=rank_field, ascending=False, inplace=True)

    # World ranking
    rankings["worldRank"] = (
        rankings[rank_field].rank(method="min", ascending=False).astype("Int64")
    )
    rankings["continentRank"] = (
        rankings.groupby("continentId")[rank_field]
        .rank(method="min", ascending=False)
        .astype("Int64")
    )
    rankings["countryRank"] = (
        rankings.groupby("personCountryId")[rank_field]
        .rank(method="min", ascending=False)
        .astype("Int64")
    )

    # Remove ranking for competitors with no results
    is_missing = rankings[rank_field] <= 0
    rankings.loc[is_missing, "worldRank"] = None
    rankings.loc[is_missing, "continentRank"] = None
    rankings.loc[is_missing, "countryRank"] = None

    # WCA ranking
    duckdb.register("rankings", rankings)
    duckdb.register("wca_ranks", wca_ranks)
    rankings = duckdb.sql(_JOIN_WCA_RANKS_QUERY).fetchdf()
    rankings["wcaWorldRank"] = rankings["wcaWorldRank"].astype("Int64")
    rankings["wcaContinentRank"] = rankings["wcaContinentRank"].astype("Int64")
    rankings["wcaCountryRank"] = rankings["wcaCountryRank"].astype("Int64")
    rankings["worldRank"] = rankings["worldRank"].astype("Int64")
    rankings["continentRank"] = rankings["continentRank"].astype("Int64")
    rankings["countryRank"] = rankings["countryRank"].astype("Int64")

    return rankings


def _mark_wca_prs(results: pd.DataFrame) -> pd.DataFrame:
    results.sort_values(
        by=["startdate", "best_result"], inplace=True, ascending=[True, True]
    )
    results["temp_best_result"] = results["best_result"].copy()
    results.loc[results["temp_best_result"] <= 0, "temp_best_result"] = None
    wca_personal_records = (
        results["best_result"]
        == results.groupby("personId")["temp_best_result"].cummin()
    )
    not_wca_records = results["wcaRecord"].isna() & (results["best_result"] > 0)
    results.loc[wca_personal_records & not_wca_records, "wcaRecord"] = "PR"
    results.drop(columns=["temp_best_result"], inplace=True)

    return results


def _mark_regional_single_records(
    results: pd.DataFrame, continents: pd.DataFrame
) -> pd.DataFrame:
    return _mark_regional_records(
        results, continents, "best_score", "regionalRecord"
    )


def _mark_regional_mean_records(
    results: pd.DataFrame, continents: pd.DataFrame
) -> pd.DataFrame:
    return _mark_regional_records(
        results, continents, "mean_score", "regionalMeanRecord"
    )


def _mark_regional_records(
    results: pd.DataFrame,
    continents: pd.DataFrame,
    score_column: str,
    record_column: str,
) -> pd.DataFrame:
    results.sort_values(
        by=["startdate", score_column], inplace=True, ascending=[True, False]
    )
    valid_results = results[score_column] > 0

    world_records = results[score_column] == results[score_column].cummax()
    continent_records = (
        results[score_column] == results.groupby("continentId")[score_column].cummax()
    )
    country_records = (
        results[score_column]
        == results.groupby("personCountryId")[score_column].cummax()
    )
    personal_records = (
        results[score_column] == results.groupby("personId")[score_column].cummax()
    )

    results[record_column] = None
    results.loc[personal_records & valid_results, record_column] = "PR"
    results.loc[country_records & valid_results, record_column] = "NR"
    results.loc[continent_records & valid_results, record_column] = "CR"
    results.loc[world_records & valid_results, record_column] = "WR"

    results[record_column] = results.apply(
        lambda row: _convert_CR_to_record_name(row, continents, record_column), axis=1
    )

    return results


def _convert_CR_to_record_name(result: pd.Series, continents: pd.DataFrame, record_column: str) -> str:
    if result[record_column] == "CR":
        return continents.recordName[continents.id == result.continentId].values[0]
    return result[record_column]


def _add_competitor_rankings(results: pd.DataFrame) -> pd.DataFrame:
    results["pos"] = (
        results.groupby(["competitionId", "roundTypeId"])["best_score"]
        .rank(method="min", ascending=False)
        .astype(int)
    )
    return results


def _add_has_results_for_country(
    countries: pd.DataFrame, results: pd.DataFrame
) -> pd.DataFrame:
    countriesWithResults = set(results.personCountryId)
    countries["hasResults"] = countries.apply(
        lambda country: country.id in countriesWithResults, axis=1
    )
    return countries


def _load_metadata_into_duckdb():
    metadata_file = os.getenv("WCA_METADATA_FILE", "../wca-metadata/metadata.json")
    duckdb_file = _get_duckdb_file()

    if not os.path.exists(metadata_file):
        _logger.warning("Metadata file %s does not exist, skipping metadata load", metadata_file)
        return

    with duckdb.connect(duckdb_file) as conn:
        _logger.info("Loading metadata from %s into DuckDB", metadata_file)
        conn.execute("DROP TABLE IF EXISTS metadata")
        conn.execute(
            f"CREATE TABLE metadata AS SELECT * FROM read_json_auto('{metadata_file}')"
        )


def load_from_mysql_to_duckdb():
    _logger.info("Starting load_from_mysql_to_duckdb")

    _logger.info("Fetching countries from WCA MySQL")
    countries = _fetch_data_from_mysql(_COUNTRIES_IMPORT_QUERY)
    _logger.info("Fetched countries: %d rows", len(countries))
    _write_data_to_duckdb(countries, "countries")
    _logger.info("Wrote 'countries' to DuckDB")

    _logger.info("Fetching continents from WCA MySQL")
    continents = _fetch_data_from_mysql(_CONTINENTS_IMPORT_QUERY)
    _logger.info("Fetched continents: %d rows", len(continents))
    _write_data_to_duckdb(continents, "continents")
    _logger.info("Wrote 'continents' to DuckDB")

    _logger.info("Fetching competitions from WCA MySQL")
    competitions = _fetch_data_from_mysql(_COMPETITIONS_IMPORT_QUERY)
    _logger.info("Fetched competitions: %d rows", len(competitions))
    _write_data_to_duckdb(competitions, "competitions")
    _logger.info("Wrote 'competitions' to DuckDB")

    _logger.info("Fetching persons from WCA MySQL")
    persons = _fetch_data_from_mysql(_PERSONS_IMPORT_QUERY)
    _logger.info("Fetched persons: %d rows", len(persons))
    _write_data_to_duckdb(persons, "persons")
    _logger.info("Wrote 'persons' to DuckDB")

    _logger.info("Fetching round types from WCA MySQL")
    round_types = _fetch_data_from_mysql(_ROUND_TYPES_IMPORT_QUERY)
    _logger.info("Fetched round types: %d rows", len(round_types))
    _write_data_to_duckdb(round_types, "round_types")
    _logger.info("Wrote 'round_types' to DuckDB")

    _logger.info("Fetching WCA single ranks from WCA MySQL")
    wca_ranks = _fetch_data_from_mysql(_GET_WCA_SINGLE_RANKS_QUERY)
    _logger.info("Fetched WCA ranks: %d rows", len(wca_ranks))
    _write_data_to_duckdb(wca_ranks, "wca_ranks")
    _logger.info("Wrote 'wca_ranks' to DuckDB")

    _logger.info("Fetching results from WCA MySQL")
    results = _fetch_data_from_mysql(_RESULTS_IMPORT_QUERY)
    _logger.info("Fetched results: %d rows", len(results))

    results = _enhance_results(results, countries, competitions)
    results = _mark_wca_prs(results)
    results = _mark_regional_single_records(results, continents)
    results = _mark_regional_mean_records(results, continents)
    results = _add_competitor_rankings(results)
    _write_data_to_duckdb(results, "results")
    _logger.info("Wrote 'results' to DuckDB: %d rows", len(results))

    countries = _add_has_results_for_country(countries, results)
    _write_data_to_duckdb(countries, "countries")
    _logger.info("Updated 'countries' with hasResults and wrote to DuckDB")

    rankings = _get_rankings(results, wca_ranks)
    _write_data_to_duckdb(rankings, "rankings")
    _logger.info("Wrote 'rankings' to DuckDB: %d rows", len(rankings))

    mean_score_rankings = _get_mean_score_rankings(results, wca_ranks)
    _write_data_to_duckdb(mean_score_rankings, "mean_rankings")
    _logger.info("Wrote 'mean_rankings' to DuckDB: %d rows", len(mean_score_rankings))

    _load_metadata_into_duckdb()
    _logger.info("Loaded metadata into DuckDB (if present)")

    _logger.info("Finished load_from_mysql_to_duckdb")


if __name__ == "__main__":
    load_from_mysql_to_duckdb()
