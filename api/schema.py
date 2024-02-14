from dataclasses import dataclass
from datetime import date


@dataclass
class Ranking:
    competitionId: str
    personName: str
    personId: str
    personCountryId: str
    wcaRecord: str
    best_score: float
    best_result: int
    continentId: str
    startdate: date
    regionalRecord: str
    worldRank: int | None
    continentRank: int | None
    countryRank: int | None
    wcaWorldRank: int | None
    wcaContinentRank: int | None
    wcaCountryRank: int | None


@dataclass
class Result:
    competitionId: str
    roundTypeId: str
    personName: str
    personId: str
    personCountryId: str
    value1: int
    value2: int
    value3: int
    wcaRecord: str
    wcaPos: int
    score1: float
    score2: float
    score3: float
    best_score: float
    best_result: int
    continentId: str
    startdate: date
    regionalRecord: str
    pos: int


@dataclass
class RoundType:
    id: str
    name: str
    cellName: str
    rank: str
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