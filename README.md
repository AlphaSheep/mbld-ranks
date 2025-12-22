# Multiple Blindfolded Alternative Ranks

An alternative ranking system for Rubik's cube multiple blindfolded solves.

This proof-of-concept website that displays unofficial rankings using the scoring formula:

```
accuracy = solved / attempted
time_used = time_in_seconds / time_available_in_seconds

score = solved * (accuracy) / sqrt(time_used)
```

For detailed analysis and justification for this scoring system, please see [this article](https://bgray-dev.medium.com/multiblind-scoring-system-353c18a61dfe).


## Details

* The analysis was done in Python using Pandas and Seaborn for analysis and visualisation, with SciPy Optimize to fit the final equation.
* The ETL uses Pandas and DuckDB to transfer the data from an existing MySQL instance with the WCA official results export into a small DuckDB for with the data in a more efficient format for querying.
* The API is a very lightweight system written using FastAPI to serve data from the DuckDB database.
* A simple React website written in TypeScript and bundled using Parcel. It allows users to view:
   - All results for a person
   - All results for a competition
   - Alternative current rankings
   - Alternative record history


## Running the project

### Prerequisites

You will need to have Python 3.10 or higher and Node.js 20 or higher installed.

You will also need an instance MySQL or MariaDB running with the [WCA results export](https://www.worldcubeassociation.org/export/results). The easiest way to do this is to run either MySQL or MariaDB in a Docker container.

### Setting up the environment

1. Create `etl/.env` with the following contents:

   ```
   WCA_MYSQL_HOST=127.0.0.1
   WCA_MYSQL_PORT=3306
   WCA_MYSQL_DATABASE=wca
   WCA_MYSQL_USER=wca
   WCA_MYSQL_PASSWORD=wca
   DUCKDB_FILE=../data.duckdb
   ```

2. Create a `api/.env` file with the following contents:
   ```
   DUCKDB_FILE=../data.duckdb
   ```

3. Create a `web/.env` file with the following contents:
   ```
   API_URL=http://localhost:8000/api/v0
   ```

4. Create a `.env` file in the project root folder with the following contents:
   ```
   MARIADB_ROOT_PASSWORD=wca
   MARIADB_DATABASE=wca
   ```

Change these as appropriate for your setup.


### Running Locally

1. It's recommended to create seperate virtual environments for the ETL. In the `etl` directory, run
   ```
   python -m venv .venv
   .venv/bin/activate
   pip install -r requirements.txt
   ```

2. Run the ETL script to create the local DuckDB database. In the `etl` directory with the virtual environment activated, run
   ```
   python etl.py
   ```

3. The API uses [`uv`](https://docs.astral.sh/uv/) for package management. To set up a virtual environment and install dependencies, from the `api` directory run
   ```
   uv sync
   ```

4. Run the API. From the `api` directory with the API virtual environment activated, run
   ```
   uv run uvicorn api:app --host 0.0.0.0 --port 8000 --reload
   ```
   This will start the API on port 8000. You can access the documentation at http://localhost:8000/docs.

5. Run the React website. From the `web` directory, run
   ```
   bun install
   bun start
   ```
   This will start a development server on port 1234.

### Running in Docker

After ensuring that you have created the necessary `.env` files as described above, you can run the entire project in Docker by running the following command from the root directory:
```
docker compose up --build --detach
```



