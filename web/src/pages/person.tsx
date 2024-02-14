import React, { useState, useContext } from "react";
import { useSearchParams } from "react-router-dom";
import PageLayout from "../layouts/page-layout";
import { PersonContext } from "../contexts/person-context";

import PersonDetails from "../components/person-details";
import PersonResultsTable from "../components/person-results-table";


export default function PersonPage () {
  const [query, setQuery] = useSearchParams();

  const [wcaId, setWcaId] = useState<string>('');
  const [validWcaId, setValidWcaId] = useState<boolean>(false);

  const context = useContext(PersonContext);
  if (!context) {
    throw new Error('PersonContext is not available');
  }

  const { person, getPerson, loadingPerson, personRanks, getPersonRanks, results, getResults, loadingResults } = context;

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value.toUpperCase();
    setWcaId(newValue);
    if (newValue.match(/^\d{4}[A-Z]{4}\d{2}$/)) {
      setValidWcaId(true);
    } else {
      setValidWcaId(false);
    }
  };

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    getPerson(wcaId);
    getPersonRanks(wcaId);
    getResults(wcaId);
    setQuery({ wcaid: wcaId });
  };

  return <PageLayout>

    <form onSubmit={onSubmit}>
      <div className={"wca-id-input "+(validWcaId ? 'valid' : 'invalid')}>
        <input type="text" placeholder="WCA ID" value={wcaId} onChange={onChange} />
        <button>GO</button>
      </div>
    </form>

    {person ? null : <p>Enter a WCA ID to get started</p>}

    {loadingPerson ? <div>Loading person...</div> :
      <PersonDetails person={person} personRanks={personRanks} />
    }

    {loadingResults ? <div>Loading results...</div> :
      <PersonResultsTable results={results} />
    }
  </PageLayout>;
}
