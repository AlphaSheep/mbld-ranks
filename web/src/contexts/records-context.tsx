import React, { createContext, useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";

import { resultsService } from "../services/results-service";
import Result from "../interfaces/result";
import MeanType from "../interfaces/mean-type";

interface RecordsContextProps {
  region: string;
  setRegion: (region: string) => void;
  meanType: MeanType;
  setMeanType: (meanType: MeanType) => void;
  records: Result[];
  getRecords: (region: string, meanType: MeanType) => void;
  loadingRecords: boolean;
}

export const RecordsContext = createContext<RecordsContextProps | undefined>(
  undefined
);

export default function RecordsProvider({ children }: { children: React.ReactNode }) {
  const [query, setQuery] = useSearchParams();

  const [records, setRecords] = useState<Result[]>([]);
  const [loadingRecords, setLoadingRecords] = useState<boolean>(false);
  const [region, setRegion] = useState<string>("world");
  const [meanType, setMeanType] = useState<MeanType>(MeanType.Single);

  const getRecords = async (region: string, meanType: MeanType) => {
    setLoadingRecords(true);
    try {
      const records = await resultsService.getRecordsHistory(region, meanType);
      setRecords(records);
    } catch (error) {
      console.error(error);
      setRecords([]);
    } finally {
      setLoadingRecords(false);
    }
  };

  useEffect(() => {
    const region = query.get("region") || "world";
    const meanType = query.get("type") as MeanType || MeanType.Single;
    setRegion(region);
    setMeanType(meanType);
    getRecords(region, meanType);
  }, [region, meanType]);

  return (
    <RecordsContext.Provider
      value={{
        region,
        setRegion,
        meanType,
        setMeanType,
        records,
        getRecords,
        loadingRecords,
      }}
    >
      {children}
    </RecordsContext.Provider>
  );
}
