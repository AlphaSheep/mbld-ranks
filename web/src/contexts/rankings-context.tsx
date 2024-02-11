import React, { createContext, useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";

import { resultsService } from "../services/results-service";
import Ranking from "../interfaces/ranking";

interface RankingsContextProps {
  region: string;
  setRegion: (region: string) => void;
  page: number;
  setPage: (page: number) => void;
  rankings: Ranking[];
  getRankings: (region: string, page: number) => void;
  loadingRankings: boolean;
}

export const RankingsContext = createContext<RankingsContextProps | undefined>(undefined);


export default function RankingsProvider({ children }) {
  const [query, setQuery] = useSearchParams();

  const [rankings, setRankings] = useState<Ranking[]>([]);
  const [loadingRankings, setLoadingRankings] = useState<boolean>(false);
  const [region, setRegion] = useState<string>("world");
  const [page, setPage] = useState<number>(1);

  const getRankings = async (region: string, page: number) => {
    setLoadingRankings(true);
    try {
      const rankings = await resultsService.getRankings(region, page);
      setRankings(rankings);
    } catch (error) {
      console.error(error);
      setRankings([]);
    } finally {
      setLoadingRankings(false);
    }
  };

  useEffect(() => {
    const region = query.get('region') || "world";
    setRegion(region);
    getRankings(region, page);
  }, [region, page]);

  return (
    <RankingsContext.Provider value={{
      region,
      setRegion,
      page,
      setPage,
      rankings,
      getRankings,
      loadingRankings,
    }}>
      {children}
    </RankingsContext.Provider>
  );
}
