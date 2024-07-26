import React from "react";
import Person from "../interfaces/person";
import CountryWithFlag from "./country-with-flag";
import Ranking from "../interfaces/ranking";
import RankMovementTag from "./rank-movement-tag";
import { resultsService } from "../services/results-service";

import "./person-details.less";
import PersonRanksTable from "./person-ranks-table";
import PersonBestsTable from "./person-bests-table";

export default function PersonDetails({
  person,
  personSingleRanks,
  personMeanRanks,
}: {
  person: Person | undefined;
  personSingleRanks: Ranking | undefined;
  personMeanRanks: Ranking | undefined;
}) {
  const personCountry = resultsService.getCountry(person?.countryId);
  const personContinent = resultsService.getContinentName(
    personCountry?.continentId
  );

  if (!person) {
    return null;
  }

  return (
    <div className="person-details">
      <h1>{person?.name}</h1>
      <p>
        <WcaIdLink wcaId={person?.id} />
      </p>
      <p>
        <CountryWithFlag countryId={person?.countryId} />
      </p>

      <PersonBestsTable
        personSingleRanks={personSingleRanks}
        personMeanRanks={personMeanRanks}
      />

      <PersonRanksTable
        personSingleRanks={personSingleRanks}
        personMeanRanks={personMeanRanks}
        personCountry={personCountry}
        personContinent={personContinent}
      />
    </div>
  );
}

function WcaIdLink({ wcaId }: { wcaId: string | undefined }) {
  return (
    <a
      href={`https://www.worldcubeassociation.org/persons/${wcaId}`}
      target="_blank"
      rel="noreferrer"
    >
      {wcaId}
    </a>
  );
}
