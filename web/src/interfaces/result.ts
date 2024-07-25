export default interface Result {
  competitionId: string;
  roundTypeId: string;
  personName: string;
  personId: string;
  personCountryId: string;
  value1: number;
  value2: number;
  value3: number;
  wcaRecord: string;
  wcaPos: number;
  score1: number;
  score2: number;
  score3: number;
  best_score: number;
  best_result: number;
  mean_score: number | null;
  continentId: string;
  startdate: Date;
  regionalRecord: string;
  regionalMeanRecord: string;
  pos: number;
}
