SELECT_COUNTRIES = "SELECT * FROM countries"
SELECT_COUNTRY_IDS = "SELECT id FROM countries"
SELECT_COUNTRY_BY_ID = "SELECT * FROM countries WHERE id = ?"
SELECT_CONTINENTS = "SELECT * FROM continents"
SELECT_CONTINENT_IDS = "SELECT id FROM continents"
SELECT_RECORD_ID_FOR_CONTINENT = "SELECT record_name FROM continents WHERE id = ?"

SELECT_COMPETITION_BY_ID = "SELECT * FROM competitions WHERE id = ?"
SELECT_COMPETITION_SEARCH = """
    SELECT * FROM competitions
    WHERE LOWER(id) LIKE ? OR LOWER(name) LIKE ? OR LOWER(country_id) LIKE ?
"""
SELECT_RESULT_BY_COMPETITION_ID = "SELECT * FROM results WHERE competition_id = ?"

SELECT_ROUND_TYPES = "SELECT * FROM round_types"

SELECT_PERSON_BY_ID = "SELECT * FROM persons WHERE wca_id = ?"
SELECT_SINGLE_RANKING_BY_PERSON_ID = "SELECT * FROM rankings WHERE person_id = ?"
SELECT_MEAN_RANKING_BY_PERSON_ID = "SELECT * FROM mean_rankings WHERE person_id = ?"
SELECT_RESULT_BY_PERSON_ID = "SELECT * FROM results WHERE person_id = ?"

SELECT_WORLD_SINGLE_RANKINGS = """
    SELECT * FROM rankings
    WHERE world_rank > ? AND world_rank <= ? AND best_result > 0
"""
SELECT_CONTINENT_SINGLE_RANKINGS = """
    SELECT * FROM rankings
    WHERE continent_id = ? AND continent_rank > ? AND continent_rank <= ? AND best_result > 0
"""
SELECT_COUNTRY_SINGLE_RANKINGS = """
    SELECT * FROM rankings
    WHERE person_country_id = ? AND country_rank > ? AND country_rank <= ? AND best_result > 0
"""

SELECT_WORLD_MEAN_RANKINGS = """
    SELECT * FROM mean_rankings
    WHERE world_rank > ? AND world_rank <= ? AND best_result > 0
"""
SELECT_CONTINENT_MEAN_RANKINGS = """
    SELECT * FROM mean_rankings
    WHERE continent_id = ? AND continent_rank > ? AND continent_rank <= ? AND best_result > 0
"""
SELECT_COUNTRY_MEAN_RANKINGS = """
    SELECT * FROM mean_rankings
    WHERE person_country_id = ? AND country_rank > ? AND country_rank <= ? AND best_result > 0
"""

SELECT_WORLD_RECORD_SINGLE_HISTORY = """
    SELECT * FROM results
    WHERE wca_record = 'WR' OR regional_record = 'WR'
"""
SELECT_CONTINENT_RECORD_SINGLE_HISTORY = """
    SELECT * FROM results
    WHERE continent_id = ? AND (wca_record in (?, 'WR') OR regional_record in (?, 'WR'))
"""
SELECT_COUNTRY_RECORD_SINGLE_HISTORY = """
    SELECT * FROM results
    WHERE person_country_id = ?
    AND ((wca_record <> '' AND wca_record <> 'PR') OR (regional_record <> '' AND regional_record <> 'PR'))
"""

SELECT_WORLD_RECORD_MEAN_HISTORY = """
    SELECT * FROM results
    WHERE regional_mean_record = 'WR'
"""
SELECT_CONTINENT_RECORD_MEAN_HISTORY = """
    SELECT * FROM results
    WHERE continent_id = ? AND regional_mean_record in (?, 'WR')
"""
SELECT_COUNTRY_RECORD_MEAN_HISTORY = """
    SELECT * FROM results
    WHERE person_country_id = ?
    AND (regional_mean_record <> '' AND regional_mean_record <> 'PR')
"""

SELECT_METADATA = "SELECT export_date AS updated_at FROM metadata"

