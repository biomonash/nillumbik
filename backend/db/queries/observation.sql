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
  confidence
)
VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
RETURNING id, site_id, species_id, "timestamp", method, appearance_start, appearance_end, temperature, narrative, confidence;

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
  confidence
)
VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9);

-- name: GetObservation :one
SELECT id, site_id, species_id, "timestamp", method, appearance_start, appearance_end, temperature, narrative, confidence
FROM observations
WHERE id = $1 LIMIT 1;

-- name: ListObservations :many
SELECT id, site_id, species_id, "timestamp", method, appearance_start, appearance_end, temperature, narrative, confidence
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
    confidence = $10
WHERE id = $1
RETURNING id, site_id, species_id, "timestamp", method, appearance_start, appearance_end, temperature, narrative, confidence;

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
