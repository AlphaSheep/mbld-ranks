from typing import Any

from fastapi import FastAPI, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware

from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded
from slowapi.middleware import SlowAPIMiddleware

from data import InvalidRequestError, NotFoundError, fetch_competition_by_id, fetch_countries, fetch_continent_ids, fetch_countries_with_results, fetch_metadata, fetch_person_by_id, fetch_ranking_by_region, fetch_ranking_for_person, fetch_record_history_by_region, fetch_results_by_competition_id, fetch_results_by_person_id, fetch_round_types, fetch_competitions_matching_query
from schema import Competition, Country, ErrorMessage, Person, Ranking, Result, RoundType, Metadata


description = '''
An API providing an alternative ranking system for Multi-Blind.
'''


BAD_REQUEST: dict[int | str, dict[str, Any]] = {400: {"model": ErrorMessage}}
NOT_FOUND: dict[int | str, dict[str, Any]] = {404: {"model": ErrorMessage}}


app = FastAPI(
    title="Multi-Blind Alternative Ranking API",
    description=description,
    version="0.1.0",
    license_info={
        "name": "MIT",
        "url": "https://opensource.org/license/mit/"
    }
)


limiter = Limiter(key_func=get_remote_address, application_limits=["50/minute"])
app.state.limiter = limiter


app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
app.add_middleware(SlowAPIMiddleware)



@app.exception_handler(NotFoundError)
async def not_found_exception_handler(_, exc: NotFoundError):
    raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(exc))

@app.exception_handler(InvalidRequestError)
async def invalid_request(_, exc: InvalidRequestError):
    raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc))

@app.exception_handler(RateLimitExceeded)
async def rate_limited(request, exc):
    return _rate_limit_exceeded_handler(request, exc)



@app.get("/api/v0/person/results/{wca_id}", tags=["People"], responses={**NOT_FOUND})
async def get_results_for_person(wca_id: str) -> list[Result]:
    '''
    Get results for a person by WCA ID.
    '''
    return fetch_results_by_person_id(wca_id)


@app.get("/api/v0/person/ranking/{wca_id}", tags=["People"], responses={**NOT_FOUND})
async def get_ranking_for_person(wca_id: str) -> list[Ranking]:
    '''
    Get the ranks and best results for a person by WCA ID.
    '''
    return fetch_ranking_for_person(wca_id)


@app.get("/api/v0/person/{wca_id}", tags=["People"], responses={**NOT_FOUND})
async def get_person(wca_id: str) -> Person:
    '''
    Get person by WCA ID.
    '''
    return fetch_person_by_id(wca_id)


@app.get("/api/v0/competition/results/{competition_id}", tags=["Competitions"], responses={**NOT_FOUND})
async def get_results_for_competition(competition_id: str) -> list[Result]:
    '''
    Get results for a competition by competition ID.
    '''
    return fetch_results_by_competition_id(competition_id)


@app.get("/api/v0/competition/roundtypes", tags=["Competitions"])
async def get_round_types() -> list[RoundType]:
    '''
    Get available round types.
    '''
    return fetch_round_types()


@app.post("/api/v0/competition/details", tags=["Competitions"])
async def get_batch_competition_details(competition_ids: list[str]) -> list[Competition]:
    '''
    Get details for multiple competitions for a list of  competition IDs.
    '''
    return [fetch_competition_by_id(competition_id) for competition_id in competition_ids]


@app.post("/api/v0/competition/search", tags=["Competitions"], responses={**BAD_REQUEST})
async def search_competitions(query: str) -> list[Competition]:
    '''
    Search for competitions by name, ID, or country. The query must be at least 3 characters long.
    '''
    return fetch_competitions_matching_query(query)


@app.get("/api/v0/competition/{competition_id}", tags=["Competitions"], responses={**NOT_FOUND})
async def get_competition(competition_id: str) -> Competition:
    '''
    Get competition by ID.
    '''
    return fetch_competition_by_id(competition_id)


@app.get("/api/v0/countries/withresults", tags=["Regions"])
async def get_countries_with_results() -> list[Country]:
    '''
    Get all countries with valid results.
    '''
    return fetch_countries_with_results()


@app.get("/api/v0/countries", tags=["Regions"])
async def get_countries() -> list[Country]:
    '''
    Get all countries.
    '''
    return fetch_countries()


@app.get("/api/v0/continents", tags=["Regions"])
async def get_continents() -> list[str]:
    '''
    Get all continents.
    '''
    return fetch_continent_ids()


@app.get("/api/v0/ranking/{region}", tags=["Rankings"], responses={**NOT_FOUND})
async def get_ranking_for_region(region: str) -> list[Ranking]:
    '''
    Get the top 100 rankings for a region. The region can be 'world' or a continent or country ID.
    '''
    return fetch_ranking_by_region(region)


@app.get("/api/v0/ranking/{region}/{page}", tags=["Rankings"], responses={**NOT_FOUND})
async def get_ranking_for_region_for_page(region: str, page: int) -> list[Ranking]:
    '''
    Get paged rankings for a region. The region can be 'world' or a continent or country ID.
    '''
    return fetch_ranking_by_region(region, page)


@app.get("/api/v0/records/history/{region}", tags=["Records"], responses={**NOT_FOUND})
async def get_records_history(region: str) -> list[Result]:
    '''
    Get the record history for a region. The region can be 'world' or a continent or country ID.
    '''
    return fetch_record_history_by_region(region)


@app.get("/api/v0/metadata", tags=["Metadata"])
async def get_metadata() -> Metadata:
    '''
    Get metadata, including the last updated date of the database.
    '''
    return fetch_metadata()
