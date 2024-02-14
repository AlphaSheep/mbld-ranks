import React from "react";
import Result from "../interfaces/result";
import FormattedResult from "./formatted-result";
import RecordTag from "./record-tag";
import PersonLink from "./person-link";
import CompetitionLink from "./competition-link";
import useCompetitionDetails from "../hooks/use-competition-details";
import { TagLegend } from "./tag-legend";

export default function RecordsTable( { results }: { results: Result[] } ) {
  const compDetails = useCompetitionDetails(results);
  return <div className="table-container">
    { (results && results.length > 0) ?
      <>
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
                <PersonLink personId={result.personId} personName={result.personName} personCountryId={result.personCountryId} />
              </td>
              <td>
                <CompetitionLink competition={compDetails[result.competitionId]} />
              </td>
            </tr>)}
          </tbody>
        </table>
        <TagLegend />
      </> : null }
  </div>;
}

function formatDate(date: Date) {
  return date.toISOString().split('T')[0];
}