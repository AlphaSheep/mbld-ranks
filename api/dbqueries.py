SELECT_COUNTRIES = "SELECT * FROM countries"
SELECT_COUNTRY_IDS = "SELECT id FROM countries"
SELECT_COUNTRY_BY_ID = "SELECT * FROM countries WHERE id = ?"
SELECT_CONTINENTS = "SELECT * FROM continents"
SELECT_CONTINENT_IDS = "SELECT id FROM continents"
SELECT_RECORD_ID_FOR_CONTINENT = "SELECT recordName FROM continents WHERE id = ?"

SELECT_COMPETITION_BY_ID = "SELECT * FROM competitions WHERE id = ?"
SELECT_COMPETITION_SEARCH = """
    SELECT * FROM competitions
    WHERE LOWER(id) LIKE ? OR LOWER(name) LIKE ? OR LOWER(countryId) LIKE ?
"""
SELECT_RESULT_BY_COMPETITION_ID = "SELECT * FROM results WHERE competitionId = ?"

SELECT_ROUND_TYPES = "SELECT * FROM round_types"

SELECT_PERSON_BY_ID = "SELECT * FROM persons WHERE id = ?"
SELECT_SINGLE_RANKING_BY_PERSON_ID = "SELECT * FROM rankings WHERE personId = ?"
SELECT_MEAN_RANKING_BY_PERSON_ID = "SELECT * FROM mean_rankings WHERE personId = ?"
SELECT_RESULT_BY_PERSON_ID = "SELECT * FROM results WHERE personId = ?"

SELECT_WORLD_SINGLE_RANKINGS = """
    SELECT * FROM rankings
    WHERE worldRank > ? AND worldRank <= ? AND best_result > 0
"""
SELECT_CONTINENT_SINGLE_RANKINGS = """
    SELECT * FROM rankings
    WHERE continentId = ? AND continentRank > ? AND continentRank <= ? AND best_result > 0
"""
SELECT_COUNTRY_SINGLE_RANKINGS = """
    SELECT * FROM rankings
    WHERE personCountryId = ? AND countryRank > ? AND countryRank <= ? AND best_result > 0
"""

SELECT_WORLD_MEAN_RANKINGS = """
    SELECT * FROM mean_rankings
    WHERE worldRank > ? AND worldRank <= ? AND best_result > 0
"""
SELECT_CONTINENT_MEAN_RANKINGS = """
    SELECT * FROM mean_rankings
    WHERE continentId = ? AND continentRank > ? AND continentRank <= ? AND best_result > 0
"""
SELECT_COUNTRY_MEAN_RANKINGS = """
    SELECT * FROM mean_rankings
    WHERE personCountryId = ? AND countryRank > ? AND countryRank <= ? AND best_result > 0
"""

SELECT_WORLD_RECORD_SINGLE_HISTORY = """
    SELECT * FROM results
    WHERE wcaRecord = 'WR' OR regionalRecord = 'WR'
"""
SELECT_CONTINENT_RECORD_SINGLE_HISTORY = """
    SELECT * FROM results
    WHERE continentId = ? AND (wcaRecord in (?, 'WR') OR regionalRecord in (?, 'WR'))
"""
SELECT_COUNTRY_RECORD_SINGLE_HISTORY = """
    SELECT * FROM results
    WHERE personCountryId = ?
    AND ((wcaRecord <> '' AND wcaRecord <> 'PR') OR (regionalRecord <> '' AND regionalRecord <> 'PR'))
"""

SELECT_WORLD_RECORD_MEAN_HISTORY = """
    SELECT * FROM results
    WHERE regionalMeanRecord = 'WR'
"""
SELECT_CONTINENT_RECORD_MEAN_HISTORY = """
    SELECT * FROM results
    WHERE continentId = ? AND regionalMeanRecord in (?, 'WR')
"""
SELECT_COUNTRY_RECORD_MEAN_HISTORY = """
    SELECT * FROM results
    WHERE personCountryId = ?
    AND (regionalMeanRecord <> '' AND regionalMeanRecord <> 'PR')
"""

SELECT_METADATA = "SELECT updated_at FROM metadata"

