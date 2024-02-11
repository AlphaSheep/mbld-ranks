import React from "react";
import Result from "../interfaces/result";
import Ranking from "../interfaces/ranking";

import "./record-tag.less";

export default function RecordTag({ result }: { result: Result | Ranking }) {
  const oldRecord = result.wcaRecord;
  const newRecord = result.regionalRecord;

  if ((!oldRecord || oldRecord === "") && (!newRecord || newRecord === "")) {
    return null;
  }

  let oldLevel = getRecordLevel(oldRecord);
  let newLevel = getRecordLevel(newRecord);

  if (oldLevel > newLevel) {
    return <span className="record-tag downgraded-record">
      <span className="replaced-record">{result.wcaRecord}</span>
      {newLevel ? " " + result.regionalRecord : ""}
    </span>;
  }

  if (oldLevel < newLevel) {
    return <span className="record-tag upgraded-record">
      {oldLevel ? <><span className="replaced-record">{result.wcaRecord}</span> </> : ""}
      {result.regionalRecord}
    </span>;
  }

  return <span className="record-tag">
    {result.regionalRecord}
  </span>;
}

function getRecordLevel(record: string): number {
  if (!record || record === "") {
    return 0;
  }
  if (record === "PR") {
    return 1;
  }
  if (record === "NR") {
    return 2;
  }
  if (record === "WR") {
    return 4;
  }
  return 3;
}