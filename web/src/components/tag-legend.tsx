import React from "react";

import "./record-tag.less";

export function TagLegend() {
  return <div className="tag-legend">
    <h3>Record labels</h3>
    <ul>
      <li><span className="record-tag upgraded-record">New</span></li>
      <li><span className="record-tag upgraded-record">
        <span className="replaced-record">Old</span> <span>Upgrade</span>
      </span></li>
      <li><span className="record-tag">Unchanged</span></li>
      <li><span className="record-tag downgraded-record">
        <span className="replaced-record">Old</span> <span>Downgrade</span>
      </span></li>
      <li><span className="record-tag downgraded-record">
        <span className="replaced-record">Lost</span>
      </span></li>
    </ul>
  </div>;
}