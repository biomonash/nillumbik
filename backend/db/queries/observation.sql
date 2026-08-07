-- name: CreateObservation :one
INSERT INTO observations (
  site_id,
  species_id,
  "timestamp",
  method,
  appearance_start,
  appearance_end,
  temperature,
  narrative,
  confidence,
  file
)
VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
RETURNING id, site_id, species_id, "timestamp", method, appearance_start, appearance_end, temperature, narrative, confidence, file;

-- name: CreateObservations :copyfrom
INSERT INTO observations (
  site_id,
  species_id,
  "timestamp",
  method,
  appearance_start,
  appearance_end,
  temperature,
  narrative,
  confidence,
  file
)
VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10);

-- name: GetObservation :one
SELECT id, site_id, species_id, "timestamp", method, appearance_start, appearance_end, temperature, narrative, confidence, file
FROM observations
WHERE id = $1 LIMIT 1;

-- name: ListObservations :many
SELECT id, site_id, species_id, "timestamp", method, appearance_start, appearance_end, temperature, narrative, confidence, file
FROM observations
ORDER BY timestamp
LIMIT $1
OFFSET $2;


-- name: UpdateObservation :one
UPDATE observations
SET site_id = $2,
    species_id = $3,
    "timestamp" = $4,
    method = $5,
    appearance_start = $6,
    appearance_end = $7,
    temperature = $8,
    narrative = $9,
    confidence = $10,
    file = $11
WHERE id = $1
RETURNING id, site_id, species_id, "timestamp", method, appearance_start, appearance_end, temperature, narrative, confidence, file;

-- name: DeleteObservation :exec
DELETE FROM observations
WHERE id = $1;

-- name: CountObservations :one
SELECT COUNT(*) FROM observations;

-- name: SearchObservations :many
SELECT o.*, s.code as site_code, s.name as site_name, sp.scientific_name, sp.common_name, sp.taxa
FROM observations o
JOIN sites s ON o.site_id = s.id
JOIN species sp ON o.species_id = sp.id
WHERE sp.scientific_name ILIKE $1 OR sp.common_name ILIKE $1 OR o.narrative ILIKE $1
ORDER BY o.timestamp DESC;


-- name: ExportObservations :many
SELECT
EXTRACT(YEAR FROM "timestamp")::integer AS YEAR,
site_code AS site,
"timestamp"::date AS date,
"timestamp"::time AS time,
method,
file,
appearance_start,
appearance_end,
temperature,
narrative,
confidence,
scientific_name,
common_name,
forest,
indicator,
native,
tenure,
reportable,
block,
taxa 
FROM observations_with_details 
WHERE (sqlc.narg('from')::timestamp IS NULL OR "timestamp" >= sqlc.narg('from')::timestamp)
  AND (sqlc.narg('to')::timestamp IS NULL OR "timestamp" <= sqlc.narg('to')::timestamp)
  AND (sqlc.narg('blocks')::int[] IS NULL OR block = ANY(sqlc.narg('blocks')))
  AND (sqlc.narg('site_codes')::text[] IS NULL OR site_code = ANY(sqlc.narg('site_codes')))
  AND (sqlc.narg('taxa')::taxa IS NULL OR taxa = sqlc.narg('taxa')::taxa)
  AND (sqlc.narg('common_name')::text IS NULL OR LOWER(common_name) = LOWER(sqlc.narg('common_name')::text))
  AND (sqlc.narg('native')::boolean IS NULL OR native = sqlc.narg('native')::boolean)
ORDER BY "timestamp"
LIMIT sqlc.arg('limit')
OFFSET sqlc.arg('offset');