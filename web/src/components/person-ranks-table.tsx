import React from "react";
import Ranking from "../interfaces/ranking";
import Country from "../interfaces/country";
import RankMovementTag from "./rank-movement-tag";

import "./person-ranks-table.less";
import FormattedResult from "./formatted-result";
import { FormattedMeanWithResults } from "./formatted-mean";
import { CompetitionLinkForResult } from "./competition-link";

export default function PersonRanksTable({
  personSingleRanks,
  personMeanRanks,
  personCountry,
  personContinent,
}: {
  personSingleRanks: Ranking | undefined;
  personMeanRanks: Ranking | undefined;
  personCountry: Country | undefined;
  personContinent: string | undefined;
}) {
  return (
    <table className="person-rank-table">
      <thead>
        <tr>
          <th>Single</th>
          <th></th>
          <th></th>
          {personMeanRanks?.worldRank && <th>Mean</th>}
        </tr>
      </thead>
      <tbody>

        <tr>
          <td>
            <FormattedResult
              value={personSingleRanks?.best_result}
              score={personSingleRanks?.best_score}
            />
          </td>
          <td></td>
          <td></td>
          {personMeanRanks?.worldRank && (
            <td>
              <FormattedMeanWithResults result={personMeanRanks} />
            </td>
          )}
        </tr>

        <tr>
          <td>
            <CompetitionLinkForResult result={personSingleRanks} />
          </td>
          <td></td>
          <td></td>
          {personMeanRanks?.worldRank && (
            <td>
              <CompetitionLinkForResult result={personMeanRanks} />
            </td>
          )}
        </tr>

        <tr>
          <td className="rank">{personSingleRanks?.worldRank || "--"}</td>
          <td>
            <RankMovementTag
              oldRank={personSingleRanks?.wcaWorldRank}
              newRank={personSingleRanks?.worldRank}
            />
          </td>
          <td>
            <a href="/rankings?region=world">World</a> rank
          </td>
          {personMeanRanks?.worldRank && (
            <td className="rank">{personMeanRanks?.worldRank || "--"}</td>
          )}
        </tr>
        <tr>
          <td className="rank">{personSingleRanks?.continentRank || "--"}</td>
          <td>
            <RankMovementTag
              oldRank={personSingleRanks?.wcaContinentRank}
              newRank={personSingleRanks?.continentRank}
            />
          </td>
          <td>
            <a href={`/rankings?region=${personCountry?.continentId}`}>
              {personContinent}
            </a>{" "}
            rank
          </td>
          {personMeanRanks?.worldRank && (
            <td className="rank">{personMeanRanks?.continentRank || "--"}</td>
          )}
        </tr>
        <tr>
          <td className="rank">{personSingleRanks?.countryRank || "--"}</td>
          <td>
            <RankMovementTag
              oldRank={personSingleRanks?.wcaCountryRank}
              newRank={personSingleRanks?.countryRank}
            />
          </td>
          <td>
            <a href={`/rankings?region=${personCountry?.id}`}>
              {personCountry?.name}
            </a>{" "}
            rank
          </td>
          {personMeanRanks?.worldRank && (
            <td className="rank">{personMeanRanks?.countryRank || "--"}</td>
          )}
        </tr>

      </tbody>
    </table>
  );
}
