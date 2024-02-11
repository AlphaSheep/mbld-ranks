import React, { createContext, useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";

import { resultsService } from "../services/results-service";
import Person from "../interfaces/person";
import Result from "../interfaces/result";


interface PersonContextProps {
  person: Person | undefined;
  getPerson: (wcaId: string) => void;
  loadingPerson: boolean;
  results: Result[];
  getResults: (wcaId: string) => void;
  loadingResults: boolean;
}


export const PersonContext = createContext<PersonContextProps | undefined>(undefined);


export default function PersonProvider({ children }) {
  const [query, setQuery] = useSearchParams();

  const [person, setPerson] = useState<Person | undefined>(undefined);
  const [results, setResults] = useState<Result[]>([]);
  const [loadingPerson, setLoadingPerson] = useState<boolean>(false);
  const [loadingResults, setLoadingResults] = useState<boolean>(false);

  const getPerson = async (wcaId) => {
    setLoadingPerson(true);
    try {
      const person = await resultsService.getPerson(wcaId);
      setPerson(person);
    } catch (error) {
      console.error(error);
      setPerson(undefined);
    } finally {
      setLoadingPerson(false);
    }
  };

  const getResults = async (wcaId) => {
    setLoadingResults(true);
    try {
      const results = await resultsService.getResultsForPerson(wcaId);
      setResults(results);
    } catch (error) {
      console.error(error);
      setResults([]);
    } finally {
      setLoadingResults(false);
    }
  };

  useEffect(() => {
    const wcaId = query.get('wcaid');
    if (wcaId) {
      getPerson(wcaId);
      getResults(wcaId);
    }
  }, []);

  return (
    <PersonContext.Provider value={{
      person,
      getPerson,
      loadingPerson,
      results,
      getResults,
      loadingResults
     }}>
      {children}
    </PersonContext.Provider>
  );
}
