from dataclasses import dataclass
from datetime import date, datetime


@dataclass
class BaseResult:
    competition_id: str
    person_name: str
    person_id: str
    person_country_id: str
    wca_record: str
    best_score: float
    mean_score: float
    best_result: int
    continent_id: str
    startdate: date
    regional_record: str
    regional_mean_record: str
    value1: int
    value2: int
    value3: int
    score1: float
    score2: float
    score3: float


@dataclass
class Ranking(BaseResult):
    world_rank: int | None = None
    continent_rank: int | None = None
    country_rank: int | None = None
    wca_world_rank: int | None = None
    wca_continent_rank: int | None = None
    wca_country_rank: int | None = None


@dataclass
class Result(BaseResult):
    round_type_id: str
    wca_pos: int
    pos: int


@dataclass
class RoundType:
    id: str
    name: str
    cell_name: str
    rank: int
    final: int


@dataclass
class Competition:
    id: str
    name: str
    country_id: str
    startdate: date


@dataclass
class Person:
    wca_id: str
    sub_id: int
    name: str
    country_id: str
    gender: str


@dataclass
class Country:
    id: str
    name: str
    continent_id: str
    iso2: str
    has_results: bool


@dataclass
class Continent:
    id: str
    name: str
    record_name: str


@dataclass
class Metadata:
    updated_at: datetime


@dataclass
class ErrorMessage:
    detail: str
