import React from "react";
import Competition from "../interfaces/competition";
import { resultsService } from "../services/results-service";
import FlagIcon from "./flag-icon";
import useCompetitionDetails from "../hooks/use-competition-details";
import Result from "../interfaces/result";
import Ranking from "../interfaces/ranking";

export default function CompetitionLink({ competition }: { competition: Competition | undefined }) {
  const country = resultsService.getCountry(competition?.countryId);

  return <a href={`/competition?compId=${competition?.id}`}>
    <FlagIcon country={country}></FlagIcon>
    <span>{competition?.name || ""}</span>
  </a>;
}

export function CompetitionLinkForResult({ result }: { result: Result | Ranking | undefined }) {
  if (!result) return null;
  const compDetails = useCompetitionDetails([result] as Result[] | Ranking[]);

  return <CompetitionLink competition={compDetails[result.competitionId]} />;
}