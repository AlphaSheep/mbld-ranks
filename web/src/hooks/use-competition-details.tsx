import { useState, useEffect } from "react";
import Result from "../interfaces/result";
import Ranking from "../interfaces/ranking";
import { CompetitionDict } from "../interfaces/competition";
import { resultsService } from "../services/results-service";

export default function useCompetitionDetails(results: Result[] | Ranking[]): CompetitionDict {

  const [compDetails, setCompDetails] = useState<CompetitionDict>({});

  useEffect(()=>{
    resultsService.batchGetCompetition(results.map(result => result.competitionId))
    .then(setCompDetails);
  }, [results]);

  return compDetails;
}