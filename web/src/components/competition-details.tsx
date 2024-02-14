import React from "react";
import Competition from "../interfaces/competition";
import CountryWithFlag from "./country-with-flag";

import "./competition-details.less";

export default function CompetitionDetails({ competition }: { competition: Competition | undefined }) {
  return <div className="competition-details">
    <h1><a href={`https://www.worldcubeassociation.org/competitions/${competition?.id}`} target="_blank" rel="noreferrer">
      {competition?.name}
    </a></h1>
    <p><CountryWithFlag countryId={competition?.countryId} /></p>
    <p>{competition?.startdate.toDateString()}</p>
  </div>;
}