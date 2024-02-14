import React from "react";
import Ranking from "../interfaces/ranking";
import FormattedResult from "./formatted-result";
import PersonLink from "./person-link";
import CompetitionLink from "./competition-link";
import useCompetitionDetails from "../hooks/use-competition-details";
import RankMovementTag from "./rank-movement-tag";
import { TagLegend } from "./tag-legend";

export default function RankingsTable({ rankings }: { rankings: Ranking[] }) {
  const compDetails = useCompetitionDetails(rankings);
  return <div className="table-container">
    { (rankings && rankings.length > 0) ?
      <>
        <table>
          <thead>
            <tr>
              <th>Rank</th>
              <th>Person</th>
              <th>Best</th>
              <th>Competition</th>
            </tr>
          </thead>
          <tbody>
            {rankings.map(ranking => <tr key={`${ranking.rank}-${ranking.personId}-${ranking.competitionId}`}>
              <td>
                {ranking.rank}
                <RankMovementTag oldRank={ranking.wcaRank} newRank={ranking.rank} />
              </td>
              <td>
                <PersonLink personId={ranking.personId} personName={ranking.personName}  personCountryId={ranking.personCountryId} />
              </td>
              <td>
                <FormattedResult value={ranking.best_result} score={ranking.best_score} />
              </td>
              <td>
                <CompetitionLink competition={compDetails[ranking.competitionId]} />
              </td>
            </tr>)}
          </tbody>
        </table>
      </>: null }
  </div>;
}