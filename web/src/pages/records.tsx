import React, { useContext, useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";

import PageLayout from "../layouts/page-layout";
import { RecordsContext } from "../contexts/records-context";
import { resultsService } from "../services/results-service";
import RecordsTable from "../components/records-table";

export default function RecordsPage () {
  const [query, setQuery] = useSearchParams();

  const context = useContext(RecordsContext);
  if (!context) {
    throw new Error('RecordsContext is not available');
  }

  const { region, setRegion, records, getRecords, loadingRecords } = context;

  const onRegionChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newRegion = e.target.value;
    if (newRegion.length === 0) return;
    setRegion(newRegion);
    setQuery({ region: newRegion });
  }

  let [continents, setContinents] = useState<string[]>([]);
  let [countries, setCountries] = useState<string[]>([]);

  useEffect(() => {
    resultsService.getContinentIds().then(setContinents);
    resultsService.getCountryIds().then(setCountries);
  }, []);

  return <PageLayout>

    <div className="region-select">
      <label>
        Region:
        <select value={region} onChange={onRegionChange}>
          <option value="world">World</option>
          <option value="">----</option>
          {continents.map(continent =>
            <option key={continent} value={continent}>{continent}</option>
          )}
          <option value="">----</option>
          {countries.map(country =>
            <option key={country} value={country}>{country}</option>
          )}
        </select>
      </label>
    </div>

    {loadingRecords ? <div>Loading records...</div> :
      <RecordsTable results={records} />
    }

  </PageLayout>;

};