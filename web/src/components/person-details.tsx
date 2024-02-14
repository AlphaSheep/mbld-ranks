import React from "react";
import Person from "../interfaces/person";
import CountryWithFlag from "./country-with-flag";
import Ranking from "../interfaces/ranking";
import RankMovementTag from "./rank-movement-tag";
import { resultsService } from "../services/results-service";

import "./person-details.less";

export default function PersonDetails({ person, personRanks }: { person: Person | undefined, personRanks: Ranking | undefined }) {
  const personCountry = resultsService.getCountry(person?.countryId);
  const personContinent = resultsService.getContinentName(personCountry?.continentId);

  if (!person) {
    return null;
  }

  return <div className="person-details">
    <h1>{person?.name}</h1>
    <p><WcaIdLink wcaId={person?.id} /></p>
    <p><CountryWithFlag countryId={person?.countryId} /></p>

    <table className="person-rank-table">
      <tbody>
        <tr>
          <td>
            {personRanks?.worldRank || "--"}
          </td>
          <td>
            <RankMovementTag oldRank={personRanks?.wcaWorldRank} newRank={personRanks?.worldRank} />
          </td>
          <td><a href="/rankings?region=world">World</a> rank</td>
        </tr>
        <tr>
          <td>
            {personRanks?.continentRank || "--"}
          </td>
          <td>
            <RankMovementTag oldRank={personRanks?.wcaContinentRank} newRank={personRanks?.continentRank} />
          </td>
          <td><a href={`/rankings?region=${personCountry?.continentId}`}>{personContinent}</a> rank</td>
        </tr>
        <tr>
          <td>
            {personRanks?.countryRank || "--"}
          </td>
          <td>
            <RankMovementTag oldRank={personRanks?.wcaCountryRank} newRank={personRanks?.countryRank} />
          </td>
          <td><a href={`/rankings?region=${personCountry?.id}`}>{personCountry?.name}</a> rank</td>
        </tr>
      </tbody>

    </table>
  </div>;
}

function WcaIdLink({ wcaId }: { wcaId: string | undefined }) {
  return <a href={`https://www.worldcubeassociation.org/persons/${wcaId}`} target="_blank" rel="noreferrer">
    {wcaId}
  </a>;
}