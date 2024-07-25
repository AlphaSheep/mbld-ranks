from dataclasses import dataclass
from datetime import date


@dataclass
class BaseResult:
    competitionId: str
    personName: str
    personId: str
    personCountryId: str
    wcaRecord: str
    best_score: float
    mean_score: float
    best_result: int
    continentId: str
    startdate: date
    regionalRecord: str
    regionalMeanRecord: str
    value1: int
    value2: int
    value3: int
    score1: float
    score2: float
    score3: float


@dataclass
class Ranking(BaseResult):
    worldRank: int | None = None
    continentRank: int | None = None
    countryRank: int | None = None
    wcaWorldRank: int | None = None
    wcaContinentRank: int | None = None
    wcaCountryRank: int | None = None


@dataclass
class Result(BaseResult):
    roundTypeId: str
    wcaPos: int
    pos: int


@dataclass
class RoundType:
    id: str
    name: str
    cellName: str
    rank: int
    final: int


@dataclass
class Competition:
    id: str
    name: str
    countryId: str
    startdate: date


@dataclass
class Person:
    id: str
    subId: int
    name: str
    countryId: str
    gender: str


@dataclass
class Country:
    id: str
    name: str
    continentId: str
    iso2: str
    hasResults: bool


@dataclass
class Continent:
    id: str
    name: str
    recordName: str

@dataclass
class Metadata:
    updated_at: date


@dataclass
class ErrorMessage:
    detail: str
