import React from "react";
import { resultsService } from "../services/results-service";
import FlagIcon from "./flag-icon";

export default function PersonLink({ personId, personName, personCountryId }: { personId: string, personName: string, personCountryId: string }) {
  const country = resultsService.getCountry(personCountryId);
  return <a href={`/person?wcaid=${personId}`}>
    <FlagIcon country={country} />
    <span>{personName}</span>
  </a>;
}