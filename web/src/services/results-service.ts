import Competition, { CompetitionDict } from "../interfaces/competition";
import Person from "../interfaces/person";
import Ranking from "../interfaces/ranking";
import Result from "../interfaces/result";
import Country from "../interfaces/country";
import RoundType from "../interfaces/round-type";
import Metadata from "../interfaces/metadata";
import alertService from "./alert-service";
import MeanType from "../interfaces/mean-type";

class ResultsService {
  private _api: string = process.env.API_URL || "api/v0";

  private _countries_fetch_in_progress: Promise<Country[]> | undefined;

  private _round_types: RoundType[] = [];
  private _countries: Country[] = [];
  private _continents: string[] = [];

  private _competitionDetails: CompetitionDict = {};

  private async _fetch(url: string, options?: RequestInit): Promise<Response> {
    return await fetch(url, options);
  }

  public async getMetadata(): Promise<Metadata> {
    const response = await this._fetch(`${this._api}/metadata`);
    const metadata = await response.json();
    metadata.updated_at = new Date(metadata.updated_at);
    return metadata;
  }

  public async getResultsForPerson(wcaId: string): Promise<Result[]> {
    const resultsRequest = this._fetch(`${this._api}/person/results/${wcaId}`);
    const roundTypesRequest = this.getRoundTypes();
    const [resultsResponse, roundTypes] = await Promise.all([
      resultsRequest,
      roundTypesRequest,
    ]);
    if (await this._checkForErrors(resultsResponse)) return [];
    const results = await resultsResponse.json();
    this._sortResultsByDateAndRound(results, roundTypes);
    this._fixResults(results);
    return results;
  }

  public async getPerson(wcaId: string): Promise<Person | undefined> {
    const response = await this._fetch(`${this._api}/person/${wcaId}`);
    if (await this._checkForErrors(response)) return;
    return response.json();
  }

  public async getPersonSingleRanks(
    wcaId: string
  ): Promise<Ranking | undefined> {
    const rankingResponse = await this._fetch(
      `${this._api}/person/ranking/single/${wcaId}`
    );
    if (await this._checkForErrors(rankingResponse)) return;
    let rankings = await rankingResponse.json();
    this._fixResults(rankings);
    return rankings[0];
  }

  public async getPersonMeanRanks(wcaId: string): Promise<Ranking | undefined> {
    const rankingResponse = await this._fetch(
      `${this._api}/person/ranking/mean/${wcaId}`
    );
    if (rankingResponse.status === 404) return undefined;
    if (await this._checkForErrors(rankingResponse)) return;
    let rankings = await rankingResponse.json();
    this._fixResults(rankings);
    return rankings[0];
  }

  public async getRoundTypes(): Promise<RoundType[]> {
    if (!this._round_types || this._round_types.length === 0) {
      const response = await this._fetch(`${this._api}/competition/roundtypes`);
      if (await this._checkForErrors(response)) return [];
      this._round_types = await response.json();
    }
    return this._round_types;
  }

  public getRoundName(roundTypeId: string): string {
    const roundType = this._round_types.find((rt) => rt.id === roundTypeId);
    return roundType ? roundType.name : roundTypeId;
  }

  public async getContinentIds(): Promise<string[]> {
    if (this._continents.length === 0) {
      const response = await this._fetch(`${this._api}/continents`);
      if (await this._checkForErrors(response)) return [];
      this._continents = await response.json();
    }
    return this._continents;
  }

  public async getCountries(): Promise<Country[]> {
    if (this._countries_fetch_in_progress) {
      return this._countries_fetch_in_progress;
    }
    const result = this._fetchCountriesAsync();
    this._countries_fetch_in_progress = result;
    return result;
  }

  private async _fetchCountriesAsync(): Promise<Country[]> {
    if (this._countries.length === 0) {
      const response = await this._fetch(`${this._api}/countries`);
      if (await this._checkForErrors(response)) return [];
      this._countries = await response.json();
    }
    return this._countries.filter((country) => country.has_results);
  }

  public async getCountryIds(): Promise<string[]> {
    const countries = await this.getCountries();
    return countries.map((c) => c.id);
  }

  public getCountry(countryId: string | undefined): Country | undefined {
    if (!this._countries || this._countries.length === 0) {
      this.getCountries();
    }
    if (!countryId) {
      return undefined;
    }
    const results = this._countries.filter(
      (country) => country.id === countryId
    );
    if (results.length > 0) {
      return results[0];
    }
  }

  public getContinentName(continentId: string | undefined): string | undefined {
    if (!continentId) {
      return undefined;
    }
    return continentId.replace(/_/g, "");
  }

  public async searchCompetitions(query: string): Promise<Competition[]> {
    const response = await this._fetch(
      `${this._api}/competition/search?query=${query}`,
      {
        method: "POST",
      }
    );
    if (await this._checkForErrors(response)) return [];
    const comps = await response.json();
    this._cacheCompetitionDetails(comps);
    return comps;
  }

  public async getCompetition(id: string): Promise<Competition | undefined> {
    const response = await this._fetch(`${this._api}/competition/${id}`);
    if (await this._checkForErrors(response)) return;
    const competition = await response.json();
    if (competition.startdate) {
      competition.startdate = new Date(competition.startdate);
    }
    this._competitionDetails[id] = competition;
    return competition;
  }

  public async batchGetCompetition(ids: string[]): Promise<CompetitionDict> {
    if (ids.length === 0) return {};

    let idsToFetch: string[] = [];
    ids.forEach((id) => {
      if (!this._competitionDetails[id]) {
        idsToFetch.push(id);
      }
    });

    if (idsToFetch.length > 0) {
      const response = await this._fetch(`${this._api}/competition/details`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(idsToFetch),
      });
      if (await this._checkForErrors(response)) return {};
      const newComps = await response.json();
      this._cacheCompetitionDetails(newComps);
    }

    const result: CompetitionDict = {};
    ids.forEach((id) => (result[id] = this._competitionDetails[id]));
    return result;
  }

  private _cacheCompetitionDetails(competitions: Competition[]) {
    competitions.forEach((comp) => (this._competitionDetails[comp.id] = comp));
  }

  public async getResultsForCompetition(id: string): Promise<Result[]> {
    const resultsRequest = this._fetch(
      `${this._api}/competition/results/${id}`
    );
    const roundTypesRequest = this.getRoundTypes();

    const [resultsResponse, roundTypes] = await Promise.all([
      resultsRequest,
      roundTypesRequest,
    ]);
    if (await this._checkForErrors(resultsResponse)) return [];

    const results = await resultsResponse.json();
    this._sortResultsByDateAndRound(results, roundTypes);
    this._fixResults(results);
    return results;
  }

  public async getRankings(region: string, meanType: string, page: number): Promise<Ranking[]> {
    const results = await this._fetch(
      `${this._api}/ranking/${meanType}/${region}/${page}`
    );
    if (await this._checkForErrors(results)) return [];
    const rankings = await results.json();
    this._fixResults(rankings);
    await this._sortRankingsByRank(rankings, region);
    return rankings;
  }

  public async getRecordsHistory(
    region: string,
    meanType: MeanType
  ): Promise<Result[]> {
    const resultsRequest = await this._fetch(
      `${this._api}/records/history/${meanType}/${region}`
    );
    const roundTypesRequest = this.getRoundTypes();

    const [resultsResponse, roundTypes] = await Promise.all([
      resultsRequest,
      roundTypesRequest,
    ]);
    if (await this._checkForErrors(resultsResponse)) return [];

    const results = await resultsResponse.json();
    this._sortResultsByDateAndRound(results, roundTypes);
    this._fixResults(results);
    return results;
  }

  private _fixResults(results: Result[] | Ranking[]) {
    results.forEach((r) => {
      r.startdate = new Date(r.startdate);
    });
  }

  private _sortResultsByDateAndRound(
    results: Result[],
    roundTypes: RoundType[]
  ) {
    results.sort((a, b) => {
      if (a.startdate < b.startdate) {
        return 1;
      }
      if (a.startdate > b.startdate) {
        return -1;
      }

      const aRound = roundTypes.find((rt) => rt.id === a.round_type_id);
      const bRound = roundTypes.find((rt) => rt.id === b.round_type_id);

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

    let rankColumn: keyof Ranking = "world_rank";
    let wcaRankColumn: keyof Ranking = "wca_world_rank";
    if (region === "world") {
      rankColumn = "world_rank";
      wcaRankColumn = "wca_world_rank";
    } else if ((await continents).includes(region)) {
      rankColumn = "continent_rank";
      wcaRankColumn = "wca_continent_rank";
    } else {
      rankColumn = "country_rank";
      wcaRankColumn = "wca_country_rank";
    }

    rankings.forEach((r) => {
      r.rank = r[rankColumn];
      r.wca_rank = r[wcaRankColumn];
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

  private async _checkForErrors(response: Response): Promise<boolean> {
    if (response.status === 429) {
      alertService.error("Too many requests. Please wait and try again later.");
      return true;
    }

    if (!response.ok) {
      const details = await response.json();
      console.log(details);
      alertService.error(details.detail);
      return true;
    }
    return false;
  }
}

export const resultsService = new ResultsService();
