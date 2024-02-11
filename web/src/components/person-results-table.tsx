import React from "react";
import Result from "../interfaces/result";
import FormattedResult from "./formatted-result";
import RecordTag from "./record-tag";
import { resultsService } from "../services/results-service";
import CompetitionLink from "./competition-link";

export default function PersonResultsTable({ results }: { results: Result[] }) {
  return <div className="table-container">
    { results && results.length > 0 ?
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
              <CompetitionLink compId={result.competitionId} />
            </td>
            <td>
              {resultsService.getRoundName(result.roundTypeId)}
            </td>
            <td>{result.pos}</td>
            <td>
              <FormattedResult value={result.best_result} score={result.best_score} />
              <RecordTag result={result} />
            </td>
            <td>
              <div><FormattedResult value={result.value1} score={result.score1} /></div>
              <div><FormattedResult value={result.value2} score={result.score2} /></div>
              <div><FormattedResult value={result.value3} score={result.score3} /></div>
            </td>
          </tr>)}
        </tbody>
      </table> : <div>
        Please enter a person's WCA ID to see their results.
      </div>
    }
  </div>;
}