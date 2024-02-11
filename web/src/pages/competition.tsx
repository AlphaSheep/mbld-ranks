import React, { useState, useContext } from "react";
import { useSearchParams } from "react-router-dom";

import PageLayout from "../layouts/page-layout";
import { CompetitionContext } from "../contexts/competition-context";
import CompetitionDetails from "../components/competition-details";
import CompetitionResultsTable from "../components/competition-results-table";
import Competition from "../interfaces/competition";
import { resultsService } from "../services/results-service";


export default function CompetitionPage () {
  const [query, setQuery] = useSearchParams();

  const [searchQuery, setSearchQuery] = useState<string>('');
  const [competitionList, setCompetitionList] = useState<Competition[]>([]);

  const context = useContext(CompetitionContext);
  if (!context) {
    throw new Error('CompetitionContext is not available');
  }

  const { competition, getCompetition, loadingCompetition, results, getResults, loadingResults } = context;

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setSearchQuery(newValue);
  };

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    resultsService.searchCompetitions(searchQuery).then(setCompetitionList);
    // getCompetition(searchQuery);
    // getResults(searchQuery);
    // setQuery({ compId: searchQuery });
  };

  return <PageLayout>

    <form onSubmit={onSubmit}>
      <input type="text" placeholder="Search" value={searchQuery} onChange={onChange} />
      <button>Search</button>

      <ul>
        {competitionList.map(c => <li key={c.id}>
          <a href={`?compId=${c.id}`}>{c.name}</a>
        </li>)}
      </ul>
    </form>

    {loadingCompetition ? <div>Loading competition...</div> :
      <CompetitionDetails competition={competition} />
    }

    {loadingResults ? <div>Loading results...</div> :
      <CompetitionResultsTable results={results} />
    }

  </PageLayout>;
};