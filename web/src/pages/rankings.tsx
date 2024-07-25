import React, { useState, useContext, useEffect } from "react";
import { useSearchParams } from "react-router-dom";

import PageLayout from "../layouts/page-layout";
import { RankingsContext } from "../contexts/rankings-context";
import { resultsService } from "../services/results-service";
import RankingsTable from "../components/rankings-table";
import MeanTypeSelector from "../components/mean-type-selector";
import MeanType from "../interfaces/mean-type";

export default function RankingsPage() {
  const [query, setQuery] = useSearchParams();

  const context = useContext(RankingsContext);
  if (!context) {
    throw new Error("RankingsContext is not available");
  }

  const {
    region,
    setRegion,
    meanType,
    setMeanType,
    page,
    setPage,
    rankings,
    getRankings,
    loadingRankings,
  } = context;

  const onRegionChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newRegion = e.target.value;
    if (newRegion.length === 0) return;
    setRegion(newRegion);
    setQuery({ region: newRegion, type: meanType });
  };

  const onMeanTypeChange = (newMeanType: MeanType) => {
    setMeanType(newMeanType);
    setQuery({ region: region, type: newMeanType });
  };

  let [continents, setContinents] = useState<string[]>([]);
  let [countries, setCountries] = useState<string[]>([]);

  useEffect(() => {
    resultsService.getContinentIds().then(setContinents);
    resultsService.getCountryIds().then(setCountries);
  }, []);

  return (
    <PageLayout>
      <div className="region-select">
        <label>
          Region:
          <select value={region} onChange={onRegionChange}>
            <option value="world">World</option>
            <option value="">----</option>
            {continents.map((continent) => (
              <option key={continent} value={continent}>
                {continent}
              </option>
            ))}
            <option value="">----</option>
            {countries.map((country) => (
              <option key={country} value={country}>
                {country}
              </option>
            ))}
          </select>
        </label>
      </div>

      <MeanTypeSelector meanType={meanType} onChange={onMeanTypeChange} />

      {loadingRankings ? (
        <div>Loading rankings...</div>
      ) : (
        <RankingsTable rankings={rankings} meanType={meanType} />
      )}
    </PageLayout>
  );
}
