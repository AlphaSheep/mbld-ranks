export default interface Competition {
  id: string;
  name: string;
  countryId: string;
  startdate: Date;
}

export type CompetitionDict = { [competitionId: string] : Competition };