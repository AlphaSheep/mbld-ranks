import React from "react";
import Result from "../interfaces/result";
import FormattedResult from "./formatted-result";
import RecordTag from "./record-tag";
import { resultsService } from "../services/results-service";
import PersonLink from "./person-link";

import "./results-table.less";
import RankMovementTag from "./rank-movement-tag";
import { TagLegend } from "./tag-legend";

export default function CompetitionResultsTable({ results }: { results: Result[] }) {

  // Find distinct round types.
  const rounds = [...new Set(results.map(result => result.roundTypeId))];

  return <>
    { (results && results.length) > 0 ?
      <>
        {rounds.map((round: string) => <div key={round} className="table-container">

          <h2>{resultsService.getRoundName(round)}</h2>

          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Place</th>
                  <th>Person</th>
                  <th>Best</th>
                  <th className="drop-if-small">Solves</th>
                </tr>
              </thead>
              <tbody>
                {results.filter(result => result.roundTypeId === round)
                  .map(result => <tr key={`${result.roundTypeId}-${result.pos}-${result.personId}`}>
                  <td>
                    {result.pos}
                    <RankMovementTag oldRank={result.wcaPos} newRank={result.pos} />
                  </td>
                  <td>
                    <PersonLink personId={result.personId} personName={result.personName} personCountryId={result.personCountryId} />
                  </td>
                  <td>
                    <FormattedResult value={result.best_result} score={result.best_score} />
                    <RecordTag result={result} />
                  </td>
                  <td className="individual-results-list drop-if-small">
                    <div><FormattedResult value={result.value1} score={result.score1} /></div>
                    <div><FormattedResult value={result.value2} score={result.score2} /></div>
                    <div><FormattedResult value={result.value3} score={result.score3} /></div>
                  </td>
                </tr>
                )}
              </tbody>
            </table>
          </div>

        </div>)}
        <TagLegend />
      </>

    : <div>
      Search for a competition to see results.
    </div> }
  </>;
}