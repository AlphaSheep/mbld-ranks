import React from "react";
import Competition from "../interfaces/competition";
import { resultsService } from "../services/results-service";
import FlagIcon from "./flag-icon";

export default function CompetitionLink({ competition }: { competition: Competition | undefined }) {
  const country = resultsService.getCountry(competition?.countryId);

  return <a href={`/competition?compId=${competition?.id}`}>
    <FlagIcon country={country}></FlagIcon>
    <span>{competition?.name || ""}</span>
  </a>;
}