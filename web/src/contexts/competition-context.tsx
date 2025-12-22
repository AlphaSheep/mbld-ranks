import React, { createContext, useEffect, useState } from "react";

import { resultsService } from "../services/results-service";
import Competition from "../interfaces/competition";
import Result from "../interfaces/result";
import { useSearchParams } from "react-router-dom";


interface CompetitionContextProps {
  competition: Competition | undefined;
  getCompetition: (id: string) => void;
  loadingCompetition: boolean;
  results: Result[];
  getResults: (id: string) => void;
  loadingResults: boolean;
}


export const CompetitionContext = createContext<CompetitionContextProps | undefined>(undefined);


export default function CompetitionProvider({ children }: { children: React.ReactNode }) {
  const [query, setQuery] = useSearchParams();

  const [competition, setCompetition] = useState<Competition | undefined>(undefined);
  const [results, setResults] = useState<Result[]>([]);
  const [loadingCompetition, setLoadingCompetition] = useState<boolean>(false);
  const [loadingResults, setLoadingResults] = useState<boolean>(false);

  const getCompetition = async (id: string) => {
    setLoadingCompetition(true);
    try {
      const competition = await resultsService.getCompetition(id);
      setCompetition(competition);
    } catch (error) {
      console.error(error);
      setCompetition(undefined);
    } finally {
      setLoadingCompetition(false);
    }
  };

  const getResults = async (id: string) => {
    setLoadingResults(true);
    try {
      const results = await resultsService.getResultsForCompetition(id);
      setResults(results);
    } catch (error) {
      console.error(error);
      setResults([]);
    } finally {
      setLoadingResults(false);
    }
  };

  useEffect(() => {
    const id = query.get('compId');
    if (id) {
      getCompetition(id);
      getResults(id);
    }
  }, []);

  return (
    <CompetitionContext.Provider value={{
      competition,
      getCompetition,
      loadingCompetition,
      results,
      getResults,
      loadingResults
    }}>
      {children}
    </CompetitionContext.Provider>
  );
}
