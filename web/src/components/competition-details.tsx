import React from "react";
import Competition from "../interfaces/competition";
import CountryWithFlag from "./country-with-flag";

export default function CompetitionDetails({ competition }: { competition: Competition | undefined }) {

    return <div>
      <h1>{competition?.name}</h1>
      <p><CountryWithFlag countryId={competition?.countryId} /></p>
    </div>;
  }