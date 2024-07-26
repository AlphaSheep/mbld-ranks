import React, { createContext, useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";

import { resultsService } from "../services/results-service";
import Ranking from "../interfaces/ranking";
import MeanType from "../interfaces/mean-type";

interface RankingsContextProps {
  region: string;
  setRegion: (region: string) => void;
  meanType: MeanType;
  setMeanType: (meanType: MeanType) => void;
  page: number;
  setPage: (page: number) => void;
  rankings: Ranking[];
  getRankings: (region: string, meanType: MeanType, page: number) => void;
  loadingRankings: boolean;
}

export const RankingsContext = createContext<RankingsContextProps | undefined>(undefined);


export default function RankingsProvider({ children }) {
  const [query, setQuery] = useSearchParams();

  const [rankings, setRankings] = useState<Ranking[]>([]);
  const [loadingRankings, setLoadingRankings] = useState<boolean>(false);
  const [region, setRegion] = useState<string>("world");
  const [meanType, setMeanType] = useState<MeanType>(MeanType.Single);
  const [page, setPage] = useState<number>(1);

  const getRankings = async (region: string, meanType: MeanType, page: number) => {
    setLoadingRankings(true);
    try {
      const rankings = await resultsService.getRankings(region, meanType, page);
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
    const meanType = query.get('type') as MeanType || MeanType.Single;
    setRegion(region);
    setMeanType(meanType);
    getRankings(region, meanType, page);
  }, [region, page, meanType]);

  return (
    <RankingsContext.Provider value={{
      region,
      setRegion,
      meanType,
      setMeanType,
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
