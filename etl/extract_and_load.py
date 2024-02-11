import math
import os
import duckdb
import pandas as pd
from mysql import connector as mysql


_RESULTS_IMPORT_QUERY = '''
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
    FROM results
    WHERE eventId = '333mbf'
'''

_COUNTRIES_IMPORT_QUERY = '''
    SELECT
        id,
        name,
        continentId,
        iso2
    FROM countries
'''

_CONTINENTS_IMPORT_QUERY = '''
    SELECT
        id,
        name,
        recordName
    FROM continents
'''

_COMPETITIONS_IMPORT_QUERY = '''
    SELECT
        id,
        name,
        countryId,
        DATE(CONCAT(year, '-', LPAD(month, 2, '0'), '-', LPAD(day, 2, '0'))) AS startdate
    FROM competitions
    WHERE cancelled = 0
'''

_PERSONS_IMPORT_QUERY = '''
    SELECT
        id,
        subId,
        name,
        countryId,
        gender
    FROM persons
'''

_ROUND_TYPES_IMPORT_QUERY = '''
    SELECT
        id,
        name,
        cellName,
        `rank`,
        final
    FROM roundtypes
'''

_GET_BEST_RESULT_QUERY = '''
    SELECT
        GREATEST(score1, score2, score3) AS best_score,
        CASE
            WHEN score1 = GREATEST(score1, score2, score3) THEN value1
            WHEN score2 = GREATEST(score1, score2, score3) THEN value2
            ELSE value3
        END AS best_result
    FROM results
'''

_UPDATE_TIMESTAMP_QUERY = '''
    SELECT updated_at FROM ar_internal_metadata WHERE value='production';
'''


def _fetch_data_from_mysql(query: str) -> pd.DataFrame:
    with mysql.connect(
        database=os.getenv('WCA_MYSQL_DATABASE'),
        user = os.environ['WCA_MYSQL_USER'],
        password = os.environ['WCA_MYSQL_PASSWORD'],
    ) as conn:
        return pd.read_sql(query, conn) # type: ignore # expecting _SQLConnection, get MySQLConnectionAbstract


def _write_data_to_duckdb(data: pd.DataFrame, table_name: str) -> None:
    duckdb_file = os.getenv("DUCKDB_FILE")
    if duckdb_file is None:
        duckdb_file = ":memory:"

    with duckdb.connect(duckdb_file) as conn:
        conn.execute(f'DROP TABLE IF EXISTS {table_name}')
        conn.register('data', data)
        conn.execute(f'CREATE TABLE {table_name} AS SELECT * FROM data')


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


def _enhance_results(results: pd.DataFrame, countries: pd.DataFrame, competitions: pd.DataFrame) -> pd.DataFrame:
    results['score1'] = results['value1'].apply(_multi_result_to_score)
    results['score2'] = results['value2'].apply(_multi_result_to_score)
    results['score3'] = results['value3'].apply(_multi_result_to_score)
    results.reset_index(drop=True, inplace=True)

    duckdb.register('results', results)
    results[['best_score', 'best_result']] = duckdb.sql(_GET_BEST_RESULT_QUERY).fetchall()

    results['best_result'] = results['best_result'].astype(int)

    results = results.join(countries[['id', 'continentId']].set_index('id'), on='personCountryId')
    results = results.join(competitions[['id', 'startdate']].set_index('id'), on='competitionId')

    return results


def _get_rankings(results: pd.DataFrame) -> pd.DataFrame:
    # Get best result for each person
    best_index = results.groupby('personId')['best_score'].idxmax()
    rankings = results.loc[best_index]
    rankings.drop(columns=['roundTypeId', 'value1', 'value2', 'value3', 'score1', 'score2', 'score3'], inplace=True)

    rankings.sort_values(by='best_score', ascending=False, inplace=True)

    # World ranking
    rankings['worldRank'] = rankings['best_score'].rank(method='min', ascending=False).astype(int)
    rankings['continentRank'] = rankings.groupby('continentId')['best_score'].rank(method='min', ascending=False).astype(int)
    rankings['countryRank'] = rankings.groupby('personCountryId')['best_score'].rank(method='min', ascending=False).astype(int)

    return rankings


def _mark_regional_records(results: pd.DataFrame) -> pd.DataFrame:
    results.sort_values(by=['startdate', 'best_score'], inplace=True, ascending=[True, False])
    valid_results = results['best_score'] > 0

    world_records = results['best_score'] == results['best_score'].cummax()
    continent_records = results['best_score'] == results.groupby('continentId')['best_score'].cummax()
    country_records = results['best_score'] == results.groupby('personCountryId')['best_score'].cummax()
    personal_records = results['best_score'] == results.groupby('personId')['best_score'].cummax()

    results['regionalRecord'] = None
    results['regionalRecord'][personal_records & valid_results] = 'PR'
    results['regionalRecord'][country_records & valid_results] = 'NR'
    results['regionalRecord'][continent_records & valid_results] = 'CR'
    results['regionalRecord'][world_records & valid_results] = 'WR'

    return results


def _add_competitor_rankings(results: pd.DataFrame) -> pd.DataFrame:
    results['pos'] = results.groupby(['competitionId', 'roundTypeId'])['best_score'].rank(method='min', ascending=False).astype(int)
    return results


def load_from_mysql_to_duckdb():
    countries = _fetch_data_from_mysql(_COUNTRIES_IMPORT_QUERY)
    _write_data_to_duckdb(countries, 'countries')

    continents = _fetch_data_from_mysql(_CONTINENTS_IMPORT_QUERY)
    _write_data_to_duckdb(continents, 'continents')

    competitions = _fetch_data_from_mysql(_COMPETITIONS_IMPORT_QUERY)
    _write_data_to_duckdb(competitions, 'competitions')

    persons = _fetch_data_from_mysql(_PERSONS_IMPORT_QUERY)
    _write_data_to_duckdb(persons, 'persons')

    round_types = _fetch_data_from_mysql(_ROUND_TYPES_IMPORT_QUERY)
    _write_data_to_duckdb(round_types, 'round_types')

    results = _fetch_data_from_mysql(_RESULTS_IMPORT_QUERY)
    results = _enhance_results(results, countries, competitions)
    results = _mark_regional_records(results)
    results = _add_competitor_rankings(results)
    _write_data_to_duckdb(results, 'results')

    rankings = _get_rankings(results)
    _write_data_to_duckdb(rankings, 'rankings')

    update_timestamp = _fetch_data_from_mysql(_UPDATE_TIMESTAMP_QUERY)
    _write_data_to_duckdb(update_timestamp, 'metadata')

    print(results)


if __name__ == '__main__':
    load_from_mysql_to_duckdb()
