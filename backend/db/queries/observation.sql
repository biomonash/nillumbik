-- name: CreateObservation :one
INSERT INTO observations (site_id, species_id, timestamp, method, appearance_time, temperature, narrative, confidence)
VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
RETURNING *;

-- name: GetObservation :one
SELECT sqlc.embed(s), sqlc.embed(sp), sqlc.embed(o)
FROM observations o
JOIN sites s ON o.site_id = s.id
JOIN species sp ON o.species_id = sp.id
WHERE o.id = $1 LIMIT 1;

-- name: ListObservations :many
SELECT sqlc.embed(s), sqlc.embed(sp), sqlc.embed(o)
FROM observations o
JOIN sites s ON o.site_id = s.id
JOIN species sp ON o.species_id = sp.id
ORDER BY o.timestamp DESC;

-- name: UpdateObservation :one
UPDATE observations
SET site_id = $2, species_id = $3, timestamp = $4, method = $5, appearance_time = $6, 
    temperature = $7, narrative = $8, confidence = $9
WHERE id = $1
RETURNING *;

-- name: DeleteObservation :exec
DELETE FROM observations
WHERE id = $1;

-- name: CountObservations :one
SELECT COUNT(*) FROM observations;

-- name: CountObservationsBySite :one
SELECT COUNT(*) FROM observations
WHERE site_id = $1;

-- name: CountObservationsBySpecies :one
SELECT COUNT(*) FROM observations
WHERE species_id = $1;

-- name: SearchObservations :many
SELECT o.*, s.code as site_code, s.name as site_name, sp.scientific_name, sp.common_name, sp.taxa
FROM observations o
JOIN sites s ON o.site_id = s.id
JOIN species sp ON o.species_id = sp.id
WHERE sp.scientific_name ILIKE $1 OR sp.common_name ILIKE $1 OR o.narrative ILIKE $1
ORDER BY o.timestamp DESC;
