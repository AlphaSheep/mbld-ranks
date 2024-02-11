# mbld-ranks

An alternative ranking system for Rubik's cube multiple blindfolded solves.

This is a POC website that displays unofficial rankings using the scoring formula:

```
accuracy = solved / attempted
time_used = time_in_seconds / time_available_in_seconds

score = solved * (accuracy) / sqrt(time_used)
```

For detailed analysis and justification for this scoring system, please see [this article](https://medium.com/@caring_lion_hedgehog_829/multiblind-scoring-system-353c18a61dfe).

## Details

* The analysis was done in Python using Pandas and Seaborn for analysis and visualisation, with SciPy Optimize to fit the final equation.
* The ETL uses Pandas and DuckDB to transfer the data from an existing MySQL instance with the WCA official results export into a small DuckDB for with the data in a more efficient format for querying.
* The API is a very lightweight system written using FastAPI to serve data from the DuckDB database.
* A simple React website written in TypeScript and bundled using Parcel. It allows users to view:
   - All results for a person
   - All results for a competition
   - Alternative current rankings
   - Alternative record history
