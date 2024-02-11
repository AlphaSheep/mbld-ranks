import React from "react";

export default function CompetitionLink({ compId }: { compId: string }) {
  return <a href={`/competition?compId=${compId}`}>{compId}</a>;
}