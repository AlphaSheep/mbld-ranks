import React, { createContext, useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";

import { resultsService } from "../services/results-service";
import Person from "../interfaces/person";
import Result from "../interfaces/result";
import Ranking from "../interfaces/ranking";


interface PersonContextProps {
  person: Person | undefined;
  getPerson: (wcaId: string) => void;
  loadingPerson: boolean;
  personSingleRanks: Ranking | undefined;
  getPersonSingleRanks: (wcaId: string) => void;
  loadingPersonSingleRanks: boolean;
  personMeanRanks: Ranking | undefined;
  getPersonMeanRanks: (wcaId: string) => void;
  loadingPersonMeanRanks: boolean;
  results: Result[];
  getResults: (wcaId: string) => void;
  loadingResults: boolean;
}


export const PersonContext = createContext<PersonContextProps | undefined>(undefined);


export default function PersonProvider({ children }) {
  const [query, setQuery] = useSearchParams();

  const [person, setPerson] = useState<Person | undefined>(undefined);
  const [personSingleRanks, setPersonSingleRanks] = useState<Ranking | undefined>(undefined);
  const [personMeanRanks, setPersonMeanRanks] = useState<Ranking | undefined>(undefined);
  const [results, setResults] = useState<Result[]>([]);
  const [loadingPerson, setLoadingPerson] = useState<boolean>(false);
  const [loadingPersonSingleRanks, setLoadingPersonSingleRanks] = useState<boolean>(false);
  const [loadingPersonMeanRanks, setLoadingPersonMeanRanks] = useState<boolean>(false);
  const [loadingResults, setLoadingResults] = useState<boolean>(false);

  const getPerson = async (wcaId: string) => {
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

  const getPersonSingleRanks = async (wcaId: string) => {
    setLoadingPersonSingleRanks(true);
    try {
      const personRanks = await resultsService.getPersonSingleRanks(wcaId);
      setPersonSingleRanks(personRanks);

    } catch (error) {
      console.error(error);
      setPersonSingleRanks(undefined);
    } finally {
      setLoadingPersonSingleRanks(false);
    }
  }

  const getPersonMeanRanks = async (wcaId: string) => {
    setLoadingPersonMeanRanks(true);
    try {
      const personRanks = await resultsService.getPersonMeanRanks(wcaId);
      setPersonMeanRanks(personRanks);
    } catch (error) {
      console.error(error);
      setPersonMeanRanks(undefined);
    } finally {
      setLoadingPersonMeanRanks(false);
    }
  }

  const getResults = async (wcaId: string) => {
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
      getPersonSingleRanks(wcaId);
      getPersonMeanRanks(wcaId);
      getPerson(wcaId);
      getResults(wcaId);
    }
  }, []);

  return (
    <PersonContext.Provider value={{
      person,
      getPerson,
      loadingPerson,
      personSingleRanks,
      getPersonSingleRanks,
      loadingPersonSingleRanks,
      personMeanRanks,
      getPersonMeanRanks,
      loadingPersonMeanRanks,
      results,
      getResults,
      loadingResults
     }}>
      {children}
    </PersonContext.Provider>
  );
}
