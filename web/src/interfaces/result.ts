export default interface Result {
  competition_id: string;
  round_type_id: string;
  person_name: string;
  person_id: string;
  person_country_id: string;
  value1: number;
  value2: number;
  value3: number;
  wca_record: string;
  wca_pos: number;
  score1: number;
  score2: number;
  score3: number;
  best_score: number;
  best_result: number;
  mean_score: number | null;
  continent_id: string;
  startdate: Date;
  regional_record: string;
  regional_mean_record: string;
  pos: number;
}
