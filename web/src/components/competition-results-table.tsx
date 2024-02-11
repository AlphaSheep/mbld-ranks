import React from "react";
import Result from "../interfaces/result";
import FormattedResult from "./formatted-result";
import RecordTag from "./record-tag";
import { resultsService } from "../services/results-service";
import PersonLink from "./person-link";

export default function CompetitionResultsTable({ results }: { results: Result[] }) {

  // Find distinct round types.
  const rounds = [...new Set(results.map(result => result.roundTypeId))];

  return <>
    { (results && results.length) > 0 ?

      rounds.map((round: string) => <div key={round} className="table-container">

        <h2>{resultsService.getRoundName(round)}</h2>

        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Place</th>
                <th>Person</th>
                <th>Best</th>
                <th>Solves</th>
              </tr>
            </thead>
            <tbody>
              {results.filter(result => result.roundTypeId === round)
                .map(result => <tr key={`${result.roundTypeId}-${result.pos}-${result.personId}`}>
                <td>{result.pos}</td>
                <td>
                  <PersonLink personId={result.personId} personName={result.personName} />
                </td>
                <td>
                  <FormattedResult value={result.best_result} score={result.best_score} />
                  <RecordTag result={result} />
                </td>
                <td>
                  <div><FormattedResult value={result.value1} score={result.score1} /></div>
                  <div><FormattedResult value={result.value2} score={result.score2} /></div>
                  <div><FormattedResult value={result.value3} score={result.score3} /></div>
                </td>
              </tr>
              )}
            </tbody>
          </table>
        </div>

      </div>)

    : <div>
      Search for a competition to see results.
    </div> }
  </>;
}