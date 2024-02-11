export default interface Ranking {
  competitionId: string;
  personName: string;
  personId: string;
  personCountryId: string;
  wcaRecord: string;
  wcaPos: number;
  best_score: number;
  best_result: number;
  continentId: string;
  startdate: Date;
  regionalRecord: string;
  pos: number;
  worldRank: number;
  continentRank: number;
  countryRank: number;
  rank?: number;
}
