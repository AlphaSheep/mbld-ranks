import React from "react";
import Ranking from "../interfaces/ranking";

import "./person-bests-table.less";
import FormattedResult from "./formatted-result";
import { CompetitionLinkForResult } from "./competition-link";
import { FormattedMeanWithResults } from "./formatted-mean";

export default function PersonBestsTable({
  personSingleRanks,
  personMeanRanks,
}: {
  personSingleRanks: Ranking | undefined;
  personMeanRanks: Ranking | undefined;
}) {
  return (
    <table className="person-bests-table">
      <tbody>
        <tr>
          <td>
            <FormattedResult
              value={personSingleRanks?.best_result}
              score={personSingleRanks?.best_score}
            />
          </td>
          <td>
            <CompetitionLinkForResult result={personSingleRanks} />
          </td>
        </tr>
        {personMeanRanks?.world_rank && (
          <tr>
            <td>
              <FormattedMeanWithResults result={personMeanRanks} />
            </td>
            <td>
              <CompetitionLinkForResult result={personMeanRanks} />
            </td>
          </tr>
        )}
      </tbody>
    </table>
  );
}
