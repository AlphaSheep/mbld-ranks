import React from "react";

export default function FormattedResult({ value, score }: { value: number, score: number }) {
  return <span>
    {formatResult(value, score)}
  </span>;
}

function formatResult(value: number, score: number): string {
  if (value === 0) return "";
  if (value === -1) return "DNF";
  if (value === -2) return "DNS";

  const points = 99 - Math.floor(value / 1e7);
  const time = Math.floor(value / 1e2) % 1e5;
  const missed = value % 1e2;
  const solved = points + missed;
  const attempted = solved + missed;
  const minutes = Math.floor(time / 60);
  const seconds = time % 60;
  const formattedMinutes = minutes === 60 ? "1:00" : minutes.toString();
  const formattedTime = `${formattedMinutes}:${seconds.toString().padStart(2, '0')}`;
  return `${solved}/${attempted} ${formattedTime} (${score.toFixed(2)})`;
}