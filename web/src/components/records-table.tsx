import React from "react";
import Result from "../interfaces/result";
import FormattedResult from "./formatted-result";
import RecordTag from "./record-tag";
import PersonLink from "./person-link";
import CompetitionLink from "./competition-link";

export default function RecordsTable( { results }: { results: Result[] } ) {
  return <div className="table-container">
    { (results && results.length > 0) ?
      <table>
        <thead>
          <tr>
            <th>Date</th>
            <th>Record</th>
            <th>Result</th>
            <th>Name</th>
            <th>Competition</th>
          </tr>
        </thead>
        <tbody>
          {results.map(result => <tr key={`${result.competitionId}-${result.roundTypeId}`}>
            <td>{formatDate(result.startdate)}</td>
            <td>
              <RecordTag result={result} />
            </td>
            <td>
              <FormattedResult value={result.best_result} score={result.best_score} />
            </td>
            <td>
              <PersonLink personId={result.personId} personName={result.personName} />
            </td>
            <td>
              <CompetitionLink compId={result.competitionId} />
            </td>
          </tr>)}
        </tbody>
      </table> : null }
  </div>;
}

function formatDate(date: Date) {
  return date.toISOString().split('T')[0];
}