import Competition from '../interfaces/competition';
import Person from '../interfaces/person';
import Ranking from '../interfaces/ranking';
import Result from '../interfaces/result';
import Country from '../interfaces/country';
import RoundType from '../interfaces/round-type';
import Metadata from '../interfaces/metadata';

class ResultsService {

  private _api: string = process.env.API_URL || "";

  private _round_types: RoundType[] = [];
  private _countries: Country[] = [];
  private _continents: string[] = [];


  public async getMetadata(): Promise<Metadata> {
    const response = await fetch(`${this._api}/metadata`);
    const metadata = await response.json();
    metadata.updated_at = new Date(metadata.updated_at);
    return metadata;
  }

  public async getResultsForPerson(wcaId: string): Promise<Result[]> {
    const resultsRequest = fetch(`${this._api}/person/results/${wcaId}`);
    const roundTypesRequest = this.getRoundTypes();

    const [resultsResponse, roundTypes] = await Promise.all([resultsRequest, roundTypesRequest]);
    const results = await resultsResponse.json();

    this._sortResultsByDateAndRound(results, roundTypes);
    this._fixResults(results);
    return results;
  }

  public async getPerson(wcaId: string): Promise<Person> {
    const response = await fetch(`${this._api}/person/${wcaId}`);
    return response.json();
  }

  public async getRoundTypes(): Promise<RoundType[]> {
    if (!this._round_types || this._round_types.length === 0) {
      const response = await fetch(`${this._api}/competition/roundtypes`);
      if (response.status === 200) {
        this._round_types = await response.json();
      }
    }
    return this._round_types;
  }

  public getRoundName(roundTypeId: string): string {
    const roundType = this._round_types.find(rt => rt.id === roundTypeId);
    return roundType ? roundType.name : roundTypeId;
  }

  public async getContinentIds(): Promise<string[]> {
    if (this._continents.length === 0) {
      const response = await fetch(`${this._api}/continents`);
      this._continents = await response.json();
    }
    return this._continents;
  }

  public async getCountries(): Promise<Country[]> {
    if (this._countries.length === 0) {
      const response = await fetch(`${this._api}/countries/withresults`);
      this._countries = await response.json();
    }
    console.log(this._countries);

    return this._countries;
  }

  public async getCountryIds(): Promise<string[]> {
    const countries = await this.getCountries();
    return countries.map(c => c.id);
  }

  public async searchCompetitions(query: string): Promise<Competition[]> {
    const response = await fetch(`${this._api}/competition/search?query=${query}`, {
      method: "POST",
    });
    return response.json();
  }

  public async getCompetition(id: string): Promise<Competition> {
    const response = await fetch(`${this._api}/competition/${id}`);
    return response.json();
  }

  public async getResultsForCompetition(id: string): Promise<Result[]> {
    const resultsRequest = fetch(`${this._api}/competition/results/${id}`);
    const roundTypesRequest = this.getRoundTypes();

    const [resultsResponse, roundTypes] = await Promise.all([resultsRequest, roundTypesRequest]);

    const results = await resultsResponse.json();
    this._sortResultsByDateAndRound(results, roundTypes);
    this._fixResults(results);
    return results;
  }

  public async getRankings(region: string, page: number): Promise<Ranking[]> {
    const results = await fetch(`${this._api}/ranking/${region}/${page}`);
    const rankings = await results.json();
    await this._sortRankingsByRank(rankings, region);
    return rankings;
  }

  public async getRecords(region: string): Promise<Result[]> {
    const resultsRequest = await fetch(`${this._api}/records/history/${region}`);
    const roundTypesRequest = this.getRoundTypes();

    const [resultsResponse, roundTypes] = await Promise.all([resultsRequest, roundTypesRequest]);

    const results = await resultsResponse.json();
    this._sortResultsByDateAndRound(results, roundTypes);
    this._fixResults(results);
    return results;
  }

  private _fixResults(results: Result[]) {
    results.forEach(r => {
      r.startdate = new Date(r.startdate);
    });
  }

  private _sortResultsByDateAndRound(results: Result[], roundTypes: RoundType[]) {
    results.sort((a, b) => {
      if (a.startdate < b.startdate) {
        return 1;
      }
      if (a.startdate > b.startdate) {
        return -1;
      }

      const aRound = roundTypes.find(rt => rt.id === a.roundTypeId);
      const bRound = roundTypes.find(rt => rt.id === b.roundTypeId);

      if (!aRound || !bRound) {
        return 0;
      }
      if (aRound.rank < bRound.rank) {
        return 1;
      }
      if (aRound.rank > bRound.rank) {
        return -1;
      }

      if (a.pos < b.pos) {
        return -1;
      }
      if (a.pos > b.pos) {
        return 1;
      }
      return 0;
    });
  }

  private async _sortRankingsByRank(rankings: Ranking[], region: string) {
    const continents = this.getContinentIds();

    let rankColumn = "worldRank";
    if (region === "world") {
      rankColumn = "worldRank";
    } else if ((await continents).includes(region)) {
      rankColumn = "continentRank";
    } else {
      rankColumn = "countryRank";
    }

    rankings.forEach(r => {
      r.rank = r[rankColumn];
    });

    rankings.sort((a, b) => {
      if (a.rank && b.rank && a.rank < b.rank) {
        return -1;
      }
      if (a.rank && b.rank && a.rank > b.rank) {
        return 1;
      }
      return 0;
    });
  }


}

export const resultsService = new ResultsService();
