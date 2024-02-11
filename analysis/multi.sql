-- Extract only the 3x3x3 Multi-Blind results to have a smaller table to work with.

DROP TABLE IF EXISTS MultiResultsExtract;

CREATE TABLE MultiResultsExtract AS
    SELECT *
    FROM Results
    WHERE eventId='333mbf'
;

-- Stack the 3 attempts into a single column.

DROP TABLE IF EXISTS RawMultiSolves;

CREATE TABLE RawMultiSolves AS
    SELECT personId, competitionId,  value1 as result
    FROM MultiResultsExtract
    WHERE value1 > 0
UNION
    SELECT personId, competitionId, value2 as result
    FROM MultiResultsExtract
    WHERE value2 > 0
UNION
    SELECT personId, competitionId, value3 as result
    FROM MultiResultsExtract
    WHERE value3 > 0
;

-- Get the date of each competition.

DROP TABLE IF EXISTS CompDates;

CREATE TABLE CompDates AS
    SELECT
        id AS competitionId,
        year*1e4 + month*1e2 + day AS date
    FROM Competitions
;

-- Calculate the number of cubes solved, attempted, and seconds taken, and date of each attempt.

DROP TABLE IF EXISTS MultiSolves;

CREATE TABLE MultiSolves AS
    SELECT
        personId,
        RawMultiSolves.competitionId,
        date,
        result,
        (99 - (FLOOR(result / 1e7) % 100)) + (result % 100) as solved,
        (99 - (FLOOR(result / 1e7) % 100)) + 2 * (result % 100) as attempted,
        FLOOR(result / 100) % 1e5 as seconds,
        row_number() over (partition by personId order by date) as attempt_num
    FROM
        RawMultiSolves
        LEFT JOIN CompDates on RawMultiSolves.competitionId = CompDates.competitionId
;

-- Add columns for the time per cube and accuracy.

ALTER TABLE MultiSolves
    ADD COLUMN timePerCube DOUBLE,
    ADD COLUMN accuracy DOUBLE
;

UPDATE MultiSolves
    SET
        timePerCube = seconds / attempted,
        accuracy = solved / attempted
;
