from typing import Literal, Type, TypeVar

import os
from functools import cache
import duckdb
import dbqueries as db


from schema import (
    Competition,
    Continent,
    Country,
    Metadata,
    Person,
    Ranking,
    Result,
    RoundType,
)


DUCKDB = os.getenv("DUCKDB_FILE", ":memory:")


T = TypeVar("T")


class NotFoundError(Exception):
    pass


class InvalidRequestError(Exception):
    pass


def _fetch_structured_data(query: str, result_type: Type[T], params=()) -> list[T]:
    with duckdb.connect(DUCKDB) as conn:
        cursor = conn.execute(query, params)
        data = cursor.fetchall()
        if not cursor.description:
            raise ValueError("Cursor has no description")
        columns = [column[0] for column in cursor.description]
        return [result_type(**dict(zip(columns, row))) for row in data]


def _fetch_string_list(query: str, params=()) -> list[str]:
    with duckdb.connect(DUCKDB) as conn:
        cursor = conn.execute(query, params)
        data = cursor.fetchall()
        if not data:
            raise NotFoundError("No data found")
        return [row[0] for row in data]


@cache
def fetch_countries() -> list[Country]:
    return _fetch_structured_data(db.SELECT_COUNTRIES, Country)


@cache
def fetch_continents() -> list[Continent]:
    return _fetch_structured_data(db.SELECT_CONTINENTS, Continent)


@cache
def fetch_round_types() -> list[RoundType]:
    return _fetch_structured_data(db.SELECT_ROUND_TYPES, RoundType)


@cache
def fetch_continent_ids() -> list[str]:
    return _fetch_string_list(db.SELECT_CONTINENT_IDS)


@cache
def fetch_country_ids() -> list[str]:
    return _fetch_string_list(db.SELECT_COUNTRY_IDS)


@cache
def fetch_country_by_id(country_id: str) -> Country:
    countries = _fetch_structured_data(db.SELECT_COUNTRY_BY_ID, Country, (country_id,))
    if not countries:
        raise NotFoundError(f"Country with id {country_id} not found")
    return countries[0]


@cache
def fetch_record_id_for_continent(continent: str) -> str:
    record = _fetch_string_list(db.SELECT_RECORD_ID_FOR_CONTINENT, (continent,))
    if not record:
        raise NotFoundError(f"Continent with id {continent} not found")
    return record[0]


def fetch_person_by_id(person_id: str) -> Person:
    persons = _fetch_structured_data(db.SELECT_PERSON_BY_ID, Person, (person_id,))
    if not persons:
        raise NotFoundError(f"Person with id {person_id} not found")
    return persons[0]


def fetch_results_by_person_id(person_id: str) -> list[Result]:
    results = _fetch_structured_data(
        db.SELECT_RESULT_BY_PERSON_ID, Result, (person_id,)
    )
    if not results:
        raise NotFoundError(f"Results for person with id {person_id} not found")
    return results


def fetch_single_ranking_for_person(person_id: str) -> list[Ranking]:
    rankings = _fetch_structured_data(
        db.SELECT_SINGLE_RANKING_BY_PERSON_ID, Ranking, (person_id,)
    )
    if not rankings:
        raise NotFoundError(f"Rankings for person with id {person_id} not found")
    return rankings


def fetch_mean_ranking_for_person(person_id: str) -> list[Ranking]:
    rankings = _fetch_structured_data(
        db.SELECT_MEAN_RANKING_BY_PERSON_ID, Ranking, (person_id,)
    )
    if not rankings:
        raise NotFoundError(f"Mean rankings for person with id {person_id} not found")
    return rankings


def fetch_competition_by_id(competition_id: str) -> Competition:
    competitions = _fetch_structured_data(
        db.SELECT_COMPETITION_BY_ID, Competition, (competition_id,)
    )
    if not competitions:
        raise NotFoundError(f"Competition with id {competition_id} not found")
    return competitions[0]


def fetch_competitions_matching_query(query: str) -> list[Competition]:
    if (not query) or (len(query) < 3):
        raise InvalidRequestError("Query must be at least 3 characters long")
    return _fetch_structured_data(
        db.SELECT_COMPETITION_SEARCH, Competition, (f"%{query.lower()}%",) * 3
    )


def fetch_results_by_competition_id(competition_id: str) -> list[Result]:
    results = _fetch_structured_data(
        db.SELECT_RESULT_BY_COMPETITION_ID, Result, (competition_id,)
    )
    if not results:
        raise NotFoundError(
            f"Results for competition with id {competition_id} not found"
        )
    return results


def get_rankings_query(region: str, single_or_mean: Literal["single", "mean"]) -> str:
    match single_or_mean:
        case "single":
            if region in fetch_continent_ids():
                return db.SELECT_CONTINENT_SINGLE_RANKINGS
            if region in fetch_country_ids():
                return db.SELECT_COUNTRY_SINGLE_RANKINGS
            raise NotFoundError(f"Region with id {region} not found")
        case "mean":
            if region in fetch_continent_ids():
                return db.SELECT_CONTINENT_MEAN_RANKINGS
            if region in fetch_country_ids():
                return db.SELECT_COUNTRY_MEAN_RANKINGS
            raise NotFoundError(f"Region with id {region} not found")
        case _:
            raise ValueError(
                f"Invalid value for single_or_mean: {single_or_mean}. This should not happen."
            )


def fetch_single_ranking_by_region(region: str, page: int = 1) -> list[Ranking]:
    PAGE_SIZE = 100

    limits = (page - 1) * PAGE_SIZE, page * PAGE_SIZE

    if region == "world":
        return _fetch_structured_data(db.SELECT_WORLD_SINGLE_RANKINGS, Ranking, limits)
    else:
        query = get_rankings_query(region, "single")
        return _fetch_structured_data(query, Ranking, (region, *limits))


def fetch_mean_ranking_by_region(region: str, page: int = 1) -> list[Ranking]:
    PAGE_SIZE = 100

    limits = (page - 1) * PAGE_SIZE, page * PAGE_SIZE

    if region == "world":
        return _fetch_structured_data(db.SELECT_WORLD_MEAN_RANKINGS, Ranking, limits)
    else:
        query = get_rankings_query(region, "mean")
        return _fetch_structured_data(query, Ranking, (region, *limits))


def fetch_record_single_history_by_region(region: str) -> list[Result]:
    if region == "world":
        return _fetch_structured_data(db.SELECT_WORLD_RECORD_SINGLE_HISTORY, Result)
    if region in fetch_continent_ids():
        recordName = fetch_record_id_for_continent(region)
        return _fetch_structured_data(
            db.SELECT_CONTINENT_RECORD_SINGLE_HISTORY,
            Result,
            (region, recordName, recordName),
        )
    if region in fetch_country_ids():
        return _fetch_structured_data(
            db.SELECT_COUNTRY_RECORD_SINGLE_HISTORY, Result, (region,)
        )
    raise NotFoundError(f"Region with id {region} not found")


def fetch_record_mean_history_by_region(region: str) -> list[Result]:
    if region == "world":
        return _fetch_structured_data(db.SELECT_WORLD_RECORD_MEAN_HISTORY, Result)
    if region in fetch_continent_ids():
        recordName = fetch_record_id_for_continent(region)
        return _fetch_structured_data(
            db.SELECT_CONTINENT_RECORD_MEAN_HISTORY,
            Result,
            (region, recordName),
        )
    if region in fetch_country_ids():
        return _fetch_structured_data(
            db.SELECT_COUNTRY_RECORD_MEAN_HISTORY, Result, (region,)
        )
    raise NotFoundError(f"Region with id {region} not found")


def fetch_metadata() -> Metadata:
    return _fetch_structured_data(db.SELECT_METADATA, Metadata)[0]
