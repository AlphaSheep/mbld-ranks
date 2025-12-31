import React from "react";
import Result from "../interfaces/result";
import Ranking from "../interfaces/ranking";

import "./record-tag.less";

export default function RecordTag({ result }: { result: Result | Ranking }) {
  const oldRecord = result.wca_record;
  const newRecord = result.regional_record;
  return <RecordTagDifference oldRecord={oldRecord} newRecord={newRecord} />;
}

export function RecordTagForMean({ result }: { result: Result | Ranking }) {
  const oldRecord = "";
  const newRecord = result.regional_meanRecord;
  return <RecordTagDifference oldRecord={oldRecord} newRecord={newRecord} />;
}

function RecordTagDifference({ oldRecord, newRecord }: { oldRecord: string, newRecord: string }) {
  if ((!oldRecord || oldRecord === "") && (!newRecord || newRecord === "")) {
    return null;
  }

  let oldLevel = getRecordLevel(oldRecord);
  let newLevel = getRecordLevel(newRecord);

  if (oldLevel > newLevel) {
    return <span className="record-tag downgraded-record">
      <span className="replaced-record">{oldRecord}</span>
      {newLevel ? " " + newRecord : ""}
    </span>;
  }

  if (oldLevel < newLevel) {
    return <span className="record-tag upgraded-record">
      {oldLevel ? <><span className="replaced-record">{oldRecord}</span> </> : ""}
      {newRecord}
    </span>;
  }

  return <span className="record-tag">
    {newRecord}
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