import React from "react";
import FlagIcon from "./flag-icon";
import { resultsService } from "../services/results-service";

export default function CountryWithFlag({ countryId }: { countryId: string | undefined }) {
  const country = resultsService.getCountry(countryId);
  return <span>
    <FlagIcon country={country} />
    <span><CountryRanksLink countryId={countryId} countryName={country?.name} /></span>
  </span>;
}

function CountryRanksLink({ countryId, countryName }: { countryId: string | undefined, countryName: string | undefined }) {
  return <a href={`/rankings?region=${countryId}`}>
    {countryName}
  </a>;
}