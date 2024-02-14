import React from "react";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCaretUp, faCaretDown } from "@fortawesome/free-solid-svg-icons";

import "./rank-movement-tag.less";

export default function RankMovementTag({ oldRank, newRank }: { oldRank: number | undefined, newRank: number | undefined }) {
  if (oldRank === newRank || oldRank === undefined || newRank === undefined) {
    return <></>
  }

  const change = oldRank - newRank;

  return <span className={`rank-movement-tag ${change > 0 ? "up" : "down"}`}>
    <FontAwesomeIcon icon={change > 0 ? faCaretUp : faCaretDown} />
    {Math.abs(change)}
  </span>;
}
