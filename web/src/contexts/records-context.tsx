import React, { createContext, useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";

import { resultsService } from "../services/results-service";
import Result from "../interfaces/result";

interface RecordsContextProps {
  region: string;
  setRegion: (region: string) => void;
  records: Result[];
  getRecords: (region: string) => void;
  loadingRecords: boolean;
}


export const RecordsContext = createContext<RecordsContextProps | undefined>(undefined);


export default function RecordsProvider({ children }) {
  const [query, setQuery] = useSearchParams();

  const [records, setRecords] = useState<Result[]>([]);
  const [loadingRecords, setLoadingRecords] = useState<boolean>(false);
  const [region, setRegion] = useState<string>("world");

  const getRecords = async (region: string) => {
    setLoadingRecords(true);
    try {
      const records = await resultsService.getRecords(region);
      setRecords(records);
    } catch (error) {
      console.error(error);
      setRecords([]);
    } finally {
      setLoadingRecords(false);
    }
  }

  useEffect(() => {
    const region = query.get('region') || "world";
    setRegion(region);
    getRecords(region);
  }, [region]);

  return (
    <RecordsContext.Provider value={{
      region,
      setRegion,
      records,
      getRecords,
      loadingRecords,
    }}>
      {children}
    </RecordsContext.Provider>
  );
}
