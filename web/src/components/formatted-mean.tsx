import React from "react";
import Result from "../interfaces/result";
import Ranking from "../interfaces/ranking";
import FormattedResult from "./formatted-result";


import "./formatted-mean.less";


export default function FormattedMean({
  result,
}: {
  result?: Result | Ranking;
}) {
  if (!result || !result.mean_score || result.mean_score === 0) return null;

  return (
    <span className="mean-score">
      (Mean: <strong>{meanToString(result.mean_score)}</strong>)
    </span>
  );
}

export function FormattedMeanWithResults({
  result,
}: {
  result: Ranking | Result | undefined;
}) {
  if (!result || !result.mean_score || result.mean_score === 0) {
    return null;
  }

  return (
    <div className="mean-with-results">
      <div className="mean-score">{meanToString(result.mean_score)}</div>
      <div className="individual-results-list">
        <div>
          <FormattedResult value={result.value1} score={result.score1} />
        </div>
        <div>
          <FormattedResult value={result.value2} score={result.score2} />
        </div>
        <div>
          <FormattedResult value={result.value3} score={result.score3} />
        </div>
      </div>
    </div>
  );
}

function meanToString(mean: number | undefined): string {
  if (mean === undefined) return "";
  if (mean === -1) return "DNF";
  if (mean === -2) return "DNS";
  return mean.toFixed(2);
}
