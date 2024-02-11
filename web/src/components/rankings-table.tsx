import React from "react";
import Ranking from "../interfaces/ranking";
import FormattedResult from "./formatted-result";
import PersonLink from "./person-link";
import CompetitionLink from "./competition-link";

export default function RankingsTable({ rankings }: { rankings: Ranking[] }) {
  return <div className="table-container">
    { (rankings && rankings.length > 0) ?
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
            <td>{ranking.rank}</td>
            <td>
              <PersonLink personId={ranking.personId} personName={ranking.personName} />
            </td>
            <td>
              <FormattedResult value={ranking.best_result} score={ranking.best_score} />
            </td>
            <td>
              <CompetitionLink compId={ranking.competitionId} />
            </td>
          </tr>)}
        </tbody>
      </table> : null }
  </div>;
}