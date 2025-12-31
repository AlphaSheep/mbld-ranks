import React from "react";
import Ranking from "../interfaces/ranking";
import FormattedResult from "./formatted-result";
import PersonLink from "./person-link";
import CompetitionLink from "./competition-link";
import useCompetitionDetails from "../hooks/use-competition-details";
import RankMovementTag from "./rank-movement-tag";
import MeanType from "../interfaces/mean-type";
import { FormattedMeanWithResults } from "./formatted-mean";

export default function RankingsTable({
  rankings,
  meanType,
}: {
  rankings: Ranking[];
  meanType: MeanType;
}) {
  const compDetails = useCompetitionDetails(rankings);
  return (
    <div className="table-container">
      {rankings && rankings.length > 0 ? (
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
              {rankings.map((ranking) => (
                <tr
                  key={`${ranking.rank}-${ranking.person_id}-${ranking.competition_id}`}
                >
                  <td>
                    {ranking.rank}
                    {meanType === MeanType.Single ? (
                      <RankMovementTag
                        oldRank={ranking.wca_rank}
                        newRank={ranking.rank}
                      />
                    ) : null}
                  </td>
                  <td>
                    <PersonLink
                      personId={ranking.person_id}
                      personName={ranking.person_name}
                      personCountryId={ranking.person_country_id}
                    />
                  </td>
                  <td>
                    {meanType === MeanType.Single ? (
                      <FormattedResult
                        value={ranking.best_result}
                        score={ranking.best_score}
                      />
                    ) : (
                      <FormattedMeanWithResults result={ranking} />
                    )}
                  </td>
                  <td>
                    <CompetitionLink
                      competition={compDetails[ranking.competition_id]}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      ) : null}
    </div>
  );
}
