import React, { useEffect, useState } from "react";
import Result from "../interfaces/result";
import FormattedResult from "./formatted-result";
import RecordTag from "./record-tag";
import { resultsService } from "../services/results-service";
import CompetitionLink from "./competition-link";
import useCompetitionDetails from "../hooks/use-competition-details";

import "./results-table.less";
import { TagLegend } from "./tag-legend";
import RankMovementTag from "./rank-movement-tag";

export default function PersonResultsTable({ results }: { results: Result[] }) {
  const compDetails = useCompetitionDetails(results);

  return <div className="table-container">
    { results && results.length > 0 ?
      <>
        <table>
          <thead>
            <tr>
              <th>Competition</th>
              <th>Round</th>
              <th>Place</th>
              <th>Best</th>
              <th>Solves</th>
            </tr>
          </thead>
          <tbody>
            {results.map(result => <tr key={`${result.competitionId}-${result.roundTypeId}`}>
              <td>
                <CompetitionLink competition={compDetails[result.competitionId] || result.competitionId} />
              </td>
              <td>
                {resultsService.getRoundName(result.roundTypeId)}
              </td>
              <td>
                {result.pos}
                <RankMovementTag oldRank={result.wcaPos} newRank={result.pos} />
              </td>
              <td>
                <FormattedResult value={result.best_result} score={result.best_score} />
                <RecordTag result={result} />
              </td>
              <td className="individual-results-list">
                <div><FormattedResult value={result.value1} score={result.score1} /></div>
                <div><FormattedResult value={result.value2} score={result.score2} /></div>
                <div><FormattedResult value={result.value3} score={result.score3} /></div>
              </td>
            </tr>)}
          </tbody>
        </table>
        <TagLegend />
      </>
        : null
    }
  </div>;
}