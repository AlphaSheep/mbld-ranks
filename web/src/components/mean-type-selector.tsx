import React from "react";
import MeanType from "../interfaces/mean-type";

import "./mean-type-selector.less";


export default function MeanTypeSelector({
  meanType,
  onChange,
}: {
  meanType: MeanType;
  onChange: (newMeanType: MeanType) => void;
}) {
  return (
    <div className="single-mean-select">
      <button
        onClick={() => onChange(MeanType.Single)}
        className={meanType === MeanType.Single ? "selected" : ""}
      >
        Single
      </button>
      <button
        onClick={() => onChange(MeanType.Mean)}
        className={meanType === MeanType.Mean ? "selected" : ""}
      >
        Mean
      </button>
    </div>
  );
}
