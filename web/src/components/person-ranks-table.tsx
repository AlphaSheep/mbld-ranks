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
          {personMeanRanks?.world_rank && <th>Mean</th>}
        </tr>
      </thead>
      <tbody>
        <tr>
          <td className="rank">
            {personSingleRanks?.world_rank || "--"}
            <RankMovementTag
              oldRank={personSingleRanks?.wca_world_rank}
              newRank={personSingleRanks?.world_rank}
            />
          </td>
          <td>
            <a href="/rankings?region=world">World</a> rank
          </td>
          {personMeanRanks?.world_rank && (
            <td className="rank">{personMeanRanks?.world_rank || "--"}</td>
          )}
        </tr>
        <tr>
          <td className="rank">
            {personSingleRanks?.continent_rank || "--"}
            <RankMovementTag
              oldRank={personSingleRanks?.wca_continent_rank}
              newRank={personSingleRanks?.continent_rank}
            />
          </td>
          <td>
            <a href={`/rankings?region=${personCountry?.continent_id}`}>
              {personContinent}
            </a>{" "}
            rank
          </td>
          {personMeanRanks?.world_rank && (
            <td className="rank">{personMeanRanks?.continent_rank || "--"}</td>
          )}
        </tr>
        <tr>
          <td className="rank">
            {personSingleRanks?.country_rank || "--"}
            <RankMovementTag
              oldRank={personSingleRanks?.wca_country_rank}
              newRank={personSingleRanks?.country_rank}
            />
          </td>
          <td>
            <a href={`/rankings?region=${personCountry?.id}`}>
              {personCountry?.name}
            </a>{" "}
            rank
          </td>
          {personMeanRanks?.world_rank && (
            <td className="rank">{personMeanRanks?.country_rank || "--"}</td>
          )}
        </tr>
      </tbody>
    </table>
  );
}
