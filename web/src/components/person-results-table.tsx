import React from "react";
import Result from "../interfaces/result";
import FormattedResult from "./formatted-result";
import RecordTag, { RecordTagForMean } from "./record-tag";
import { resultsService } from "../services/results-service";
import CompetitionLink from "./competition-link";
import useCompetitionDetails from "../hooks/use-competition-details";

import "./results-table.less";
import { TagLegend } from "./tag-legend";
import RankMovementTag from "./rank-movement-tag";
import Ranking from "../interfaces/ranking";
import FormattedMean from "./formatted-mean";

export default function PersonResultsTable({ results }: { results: Result[] }) {
  const compDetails = useCompetitionDetails(results);

  return (
    <div className="table-container">
      {results && results.length > 0 ? (
        <>
          <table>
            <thead>
              <tr>
                <th>Competition</th>
                <th>Round</th>
                <th>Place</th>
                <th>Best</th>
                <th className="drop-if-small">Solves</th>
              </tr>
            </thead>
            <tbody>
              {results.map((result) => (
                <tr key={`${result.competitionId}-${result.roundTypeId}`}>
                  <td>
                    <CompetitionLink
                      competition={
                        compDetails[result.competitionId] ||
                        result.competitionId
                      }
                    />
                  </td>
                  <td>{resultsService.getRoundName(result.roundTypeId)}</td>
                  <td>
                    {result.pos}
                    <RankMovementTag
                      oldRank={result.wcaPos}
                      newRank={result.pos}
                    />
                  </td>
                  <td>
                    <div className="result-best-single">
                      <FormattedResult
                        value={result.best_result}
                        score={result.best_score}
                      />
                      <RecordTag result={result} />
                    </div>
                    <div className="result-mean">
                      <FormattedMean result={result} />
                      <RecordTagForMean result={result} />
                    </div>
                  </td>
                  <td className="individual-results-list drop-if-small">
                    <div>
                      <FormattedResult
                        value={result.value1}
                        score={result.score1}
                      />
                    </div>
                    <div>
                      <FormattedResult
                        value={result.value2}
                        score={result.score2}
                      />
                    </div>
                    <div>
                      <FormattedResult
                        value={result.value3}
                        score={result.score3}
                      />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <TagLegend />
        </>
      ) : null}
    </div>
  );
}
