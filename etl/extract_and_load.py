import logging
import math
import os
from functools import cache

import duckdb
import pandas as pd
from mysql import connector as mysql


_logger = logging.getLogger(__name__)


_RESULTS_IMPORT_QUERY = """
FROM mysql_query('wca', '
    SELECT
        id as result_id,
        competition_id,
        round_type_id,
        person_name,
        person_id,
        person_country_id,
        regional_single_record as wca_record,
        pos as wca_pos
    FROM results
    WHERE event_id = ''333mbf''
')"""

_ATTEMPTS_IMPORT_QUERY = """
FROM mysql_query('wca', '
    SELECT
        result_attempts.result_id,
        result_attempts.attempt_number,
        result_attempts.value
    FROM result_attempts
    LEFT JOIN results ON result_attempts.result_id = results.id
    WHERE results.event_id = ''333mbf''
')"""

_COUNTRIES_IMPORT_QUERY = """
FROM mysql_query('wca', '
    SELECT
        id,
        name,
        continent_id,
        iso2
    FROM countries
')"""

_CONTINENTS_IMPORT_QUERY = """
FROM mysql_query('wca', '
    SELECT
        id,
        name,
        record_name
    FROM continents
    WHERE record_name != ''''
')"""

_COMPETITIONS_IMPORT_QUERY = """
FROM mysql_query('wca', '
    SELECT
        id,
        name,
        country_id,
        DATE(CONCAT(year, ''-'', LPAD(month, 2, ''0''), ''-'', LPAD(day, 2, ''0''))) AS startdate
    FROM competitions
    WHERE cancelled = 0
')"""

_PERSONS_IMPORT_QUERY = """
FROM mysql_query('wca', '
    SELECT
        wca_id,
        sub_id,
        name,
        country_id,
        gender
    FROM persons
')"""

_ROUND_TYPES_IMPORT_QUERY = """
FROM mysql_query('wca', '
    SELECT
        id,
        name,
        cell_name,
        `rank`,
        final
    FROM round_types
')"""

_GET_WCA_SINGLE_RANKS_QUERY = """
FROM mysql_query('wca', '
    SELECT
        person_id,
        world_rank as wca_world_rank,
        continent_rank as wca_continent_rank,
        country_rank as wca_country_rank
    FROM ranks_single
    WHERE event_id = ''333mbf''
')"""

_JOIN_WCA_RANKS_QUERY = """
    SELECT
        rankings.*,
        wca_world_rank,
        wca_continent_rank,
        wca_country_rank
    FROM rankings
    LEFT JOIN wca_ranks ON rankings.person_id = wca_ranks.person_id
"""

_GET_BEST_RESULT_QUERY = """
    SELECT
        GREATEST(score1, score2, score3) AS best_score,
        CASE
            WHEN score1 = GREATEST(score1, score2, score3) THEN value1
            WHEN score2 = GREATEST(score1, score2, score3) THEN value2
            ELSE value3
        END AS best_result
    FROM results
"""


def _create_indices() -> None:
    with mysql.connect(
        host=os.getenv("WCA_MYSQL_HOST"),
        port=os.getenv("WCA_MYSQL_PORT"),
        database=os.getenv("WCA_MYSQL_DATABASE"),
        user=os.environ["WCA_MYSQL_USER"],
        password=os.environ["WCA_MYSQL_PASSWORD"],
    ) as conn:
        with conn.cursor() as cursor:
            for sql in [
                "ALTER TABLE results ADD INDEX idx_results_event_id (event_id), ALGORITHM=INPLACE, LOCK=NONE",
                "ALTER TABLE result_attempts ADD INDEX idx_attempts_result_id (result_id), ALGORITHM=INPLACE, LOCK=NONE",
            ]:
                try:
                    cursor.execute(sql)
                except mysql.errors.ProgrammingError:
                    # Index already exists
                    pass


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


def _write_from_wca_into_duckdb(table_name: str, query: str) -> None:
    """Write data directly from MySQL to DuckDB using DuckDB's MySQL extension."""
    duckdb_file = _get_duckdb_file()
    with duckdb.connect(duckdb_file) as conn:
        _attach_mysql_to_duckdb(conn)

        # Drop existing table and create new one from query
        conn.execute(f"DROP TABLE IF EXISTS {table_name}")
        conn.execute(f"CREATE TABLE {table_name} AS {query}")

        # Detach from MySQL
        conn.execute("DETACH wca")


def _attach_mysql_to_duckdb(conn: duckdb.DuckDBPyConnection) -> None:
    """Attach to MySQL database using DuckDB's MySQL extension."""
    # Build PostgreSQL-style connection string from environment variables
    host = os.getenv("WCA_MYSQL_HOST")
    port = os.getenv("WCA_MYSQL_PORT")
    database = os.getenv("WCA_MYSQL_DATABASE")
    user = os.environ["WCA_MYSQL_USER"]
    password = os.environ["WCA_MYSQL_PASSWORD"]

    connection_string = f"host={host} user={user} password={password} port={port} database={database}"

    # Install and load the MySQL extension
    conn.execute("INSTALL mysql")
    conn.execute("LOAD mysql")

    # Attach to MySQL database
    conn.execute(f"ATTACH '{connection_string}' AS wca (TYPE mysql, READ_ONLY)")


def _select_from_duckdb(table_name: str) -> pd.DataFrame:
    duckdb_file = _get_duckdb_file()
    with duckdb.connect(duckdb_file) as conn:
        return conn.execute(f"SELECT * FROM {table_name}").fetchdf()


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


def _merge_attempts(results: pd.DataFrame, attempts: pd.DataFrame) -> pd.DataFrame:
    for attempt_number in range(1, 4):
        col_name = f"value{attempt_number}"
        values = attempts[attempts["attempt_number"] == attempt_number][["result_id", "value"]].rename(
            columns={"value": col_name}
        )
        results = results.merge(values, how="left", on="result_id")
        results[col_name] = results[col_name].fillna(0).astype(int)

    results.drop(columns=["result_id"], inplace=True)
    return results


def _enhance_results(results: pd.DataFrame, countries: pd.DataFrame, competitions: pd.DataFrame) -> pd.DataFrame:
    results["score1"] = results["value1"].apply(_multi_result_to_score)
    results["score2"] = results["value2"].apply(_multi_result_to_score)
    results["score3"] = results["value3"].apply(_multi_result_to_score)
    results.reset_index(drop=True, inplace=True)

    duckdb.register("results", results)
    results[["best_score", "best_result"]] = duckdb.sql(_GET_BEST_RESULT_QUERY).fetchall()

    results["best_result"] = results["best_result"].astype(int)
    results = _calculate_mean_score(results)

    results = results.join(countries[["id", "continent_id"]].set_index("id"), on="person_country_id")
    results = results.join(competitions[["id", "startdate"]].set_index("id"), on="competition_id")

    return results


def _calculate_mean_score(results: pd.DataFrame) -> pd.DataFrame:
    has_three_solves = (results["value1"] != 0) & (results["value2"] != 0) & (results["value3"] != 0)
    has_dnf = (results["score1"] < 0) | (results["score2"] < 0) | (results["score3"] < 0)
    has_three_valid_results = (results["score1"] > 0) & (results["score2"] > 0) & (results["score3"] > 0)

    results.loc[has_three_valid_results, "mean_score"] = (results["score1"] + results["score2"] + results["score3"]) / 3

    results.loc[has_three_solves & has_dnf, "mean_score"] = -1

    return results


def _get_rankings(results: pd.DataFrame, wca_ranks: pd.DataFrame) -> pd.DataFrame:
    return _get_rankings_by_field(results, wca_ranks, "best_score")


def _get_mean_score_rankings(results: pd.DataFrame, wca_ranks: pd.DataFrame) -> pd.DataFrame:
    return _get_rankings_by_field(results, wca_ranks, "mean_score")


def _get_rankings_by_field(results: pd.DataFrame, wca_ranks: pd.DataFrame, rank_field: str) -> pd.DataFrame:
    # Get best result for each person
    best_index = results.groupby("person_id")[rank_field].idxmax()
    rankings = results.loc[best_index[best_index.notna()]].copy()

    rankings.drop(
        columns=[
            "round_type_id",
            "pos",
            "wca_pos",
        ],
        inplace=True,
    )

    rankings.sort_values(by=rank_field, ascending=False, inplace=True)

    # World ranking
    rankings["world_rank"] = rankings[rank_field].rank(method="min", ascending=False).astype("Int64")
    rankings["continent_rank"] = (
        rankings.groupby("continent_id")[rank_field].rank(method="min", ascending=False).astype("Int64")
    )
    rankings["country_rank"] = (
        rankings.groupby("person_country_id")[rank_field].rank(method="min", ascending=False).astype("Int64")
    )

    # Remove ranking for competitors with no results
    is_missing = rankings[rank_field] <= 0
    rankings.loc[is_missing, "world_rank"] = None
    rankings.loc[is_missing, "continent_rank"] = None
    rankings.loc[is_missing, "country_rank"] = None

    # WCA ranking
    duckdb.register("rankings", rankings)
    duckdb.register("wca_ranks", wca_ranks)
    rankings = duckdb.sql(_JOIN_WCA_RANKS_QUERY).fetchdf()
    rankings["wca_world_rank"] = rankings["wca_world_rank"].astype("Int64")
    rankings["wca_continent_rank"] = rankings["wca_continent_rank"].astype("Int64")
    rankings["wca_country_rank"] = rankings["wca_country_rank"].astype("Int64")
    rankings["world_rank"] = rankings["world_rank"].astype("Int64")
    rankings["continent_rank"] = rankings["continent_rank"].astype("Int64")
    rankings["country_rank"] = rankings["country_rank"].astype("Int64")

    return rankings


def _mark_wca_prs(results: pd.DataFrame) -> pd.DataFrame:
    results.sort_values(by=["startdate", "best_result"], inplace=True, ascending=[True, True])
    results["temp_best_result"] = results["best_result"].copy()
    results.loc[results["temp_best_result"] <= 0, "temp_best_result"] = None
    wca_personal_records = results["best_result"] == results.groupby("person_id")["temp_best_result"].cummin()
    not_wca_records = results["wca_record"].isna() & (results["best_result"] > 0)
    results.loc[wca_personal_records & not_wca_records, "wca_record"] = "PR"
    results.drop(columns=["temp_best_result"], inplace=True)

    return results


def _mark_regional_single_records(results: pd.DataFrame, continents: pd.DataFrame) -> pd.DataFrame:
    return _mark_regional_records(results, continents, "best_score", "regional_record")


def _mark_regional_mean_records(results: pd.DataFrame, continents: pd.DataFrame) -> pd.DataFrame:
    return _mark_regional_records(results, continents, "mean_score", "regional_mean_record")


def _mark_regional_records(
    results: pd.DataFrame,
    continents: pd.DataFrame,
    score_column: str,
    record_column: str,
) -> pd.DataFrame:
    results.sort_values(by=["startdate", score_column], inplace=True, ascending=[True, False])
    valid_results = results[score_column] > 0

    world_records = results[score_column] == results[score_column].cummax()
    continent_records = results[score_column] == results.groupby("continent_id")[score_column].cummax()
    country_records = results[score_column] == results.groupby("person_country_id")[score_column].cummax()
    personal_records = results[score_column] == results.groupby("person_id")[score_column].cummax()

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
        return continents.record_name[continents.id == result.continent_id].values[0]
    return result[record_column]


def _add_competitor_rankings(results: pd.DataFrame) -> pd.DataFrame:
    results["pos"] = (
        results.groupby(["competition_id", "round_type_id"])["best_score"]
        .rank(method="min", ascending=False)
        .astype(int)
    )
    return results


def _add_has_results_for_country(countries: pd.DataFrame, results: pd.DataFrame) -> pd.DataFrame:
    countries_with_results = set(results.person_country_id)
    countries["has_results"] = countries.apply(lambda country: country.id in countries_with_results, axis=1)
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
        conn.execute(f"CREATE TABLE metadata AS SELECT * FROM read_json_auto('{metadata_file}')")


def load_from_mysql_to_duckdb():
    _logger.info("Creating indices in WCA DB")
    _create_indices()
    _logger.info("Created indices in WCA DB")

    _logger.info("Starting load_from_mysql_to_duckdb")

    _logger.info("Writing countries from WCA DB into DuckDB")
    _write_from_wca_into_duckdb("countries", _COUNTRIES_IMPORT_QUERY)
    countries = _select_from_duckdb("countries")
    _logger.info("Wrote 'countries' to DuckDB")

    _logger.info("Writing continents from WCA DB into DuckDB")
    _write_from_wca_into_duckdb("continents", _CONTINENTS_IMPORT_QUERY)
    continents = _select_from_duckdb("continents")
    _logger.info("Wrote 'continents' to DuckDB")

    _logger.info("Writing competitions from WCA DB into DuckDB")
    _write_from_wca_into_duckdb("competitions", _COMPETITIONS_IMPORT_QUERY)
    competitions = _select_from_duckdb("competitions")
    _logger.info("Wrote 'competitions' to DuckDB")

    _logger.info("Writing persons from WCA DB into DuckDB")
    _write_from_wca_into_duckdb("persons", _PERSONS_IMPORT_QUERY)
    _logger.info("Wrote 'persons' to DuckDB")

    _logger.info("Writing round types from WCA DB into DuckDB")
    _write_from_wca_into_duckdb("round_types", _ROUND_TYPES_IMPORT_QUERY)
    _logger.info("Wrote 'round_types' to DuckDB")

    _logger.info("Writing WCA single ranks from WCA DB into DuckDB")
    _write_from_wca_into_duckdb("wca_ranks", _GET_WCA_SINGLE_RANKS_QUERY)
    wca_ranks = _select_from_duckdb("wca_ranks")
    _logger.info("Wrote 'wca_ranks' to DuckDB")

    _logger.info("Writing results from WCA DB into DuckDB")
    _write_from_wca_into_duckdb("results_raw", _RESULTS_IMPORT_QUERY)
    _logger.info("Wrote 'results_raw' to DuckDB")

    _logger.info("Writing attempts from WCA DB into DuckDB")
    _write_from_wca_into_duckdb("attempts", _ATTEMPTS_IMPORT_QUERY)
    _logger.info("Wrote 'attempts' to DuckDB")

    _logger.info("Merging results with attempts")
    attempts = _select_from_duckdb("attempts")
    results = _select_from_duckdb("results_raw")
    results = _merge_attempts(results, attempts)
    _logger.info("Merged results with attempts: %d rows", len(results))

    _logger.info("Enhancing results with scores and best results")
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
    logging.basicConfig(level=logging.INFO, format="%(asctime)s %(levelname)s %(message)s")
    load_from_mysql_to_duckdb()
