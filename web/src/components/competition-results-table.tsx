import React from "react";
import Result from "../interfaces/result";
import FormattedResult from "./formatted-result";
import RecordTag, { RecordTagForMean } from "./record-tag";
import { resultsService } from "../services/results-service";
import PersonLink from "./person-link";

import "./results-table.less";
import RankMovementTag from "./rank-movement-tag";
import { TagLegend } from "./tag-legend";
import FormattedMean from "./formatted-mean";

export default function CompetitionResultsTable({ results }: { results: Result[] }) {

  // Find distinct round types.
  const rounds = [...new Set(results.map(result => result.round_type_id))];

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
                {results.filter(result => result.round_type_id === round)
                  .map(result => <tr key={`${result.round_type_id}-${result.pos}-${result.person_id}`}>
                  <td>
                    {result.pos}
                    <RankMovementTag oldRank={result.wca_pos} newRank={result.pos} />
                  </td>
                  <td>
                    <PersonLink personId={result.person_id} personName={result.person_name} personCountryId={result.person_country_id} />
                  </td>
                  <td>
                  <div className="result-best-single">
                      <FormattedResult value={result.best_result} score={result.best_score} />
                      <RecordTag result={result} />
                    </div>
                    <div className="result-mean">
                      <FormattedMean result={result} />
                      <RecordTagForMean result={result} />
                    </div>
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