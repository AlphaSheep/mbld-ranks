import { useState, useEffect } from "react";
import Result from "../interfaces/result";
import Ranking from "../interfaces/ranking";
import { CompetitionDict } from "../interfaces/competition";
import { resultsService } from "../services/results-service";

export default function useCompetitionDetails(results: Result[] | Ranking[]): CompetitionDict {

  const [compDetails, setCompDetails] = useState<CompetitionDict>({});

  const compIds = results.map(result => result.competition_id);

  useEffect(()=>{
    resultsService.batchGetCompetition(compIds)
    .then(setCompDetails);
  }, []);

  return compDetails;
}