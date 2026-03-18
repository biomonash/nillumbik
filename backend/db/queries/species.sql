-- name: CreateSpecies :one
INSERT INTO species (scientific_name, common_name, native, taxa, indicator, reportable)
VALUES ($1, $2, $3, $4, $5, $6)
RETURNING id, scientific_name, common_name, native, taxa, indicator, reportable;

-- name: GetSpecies :one
SELECT id, scientific_name, common_name, native, taxa, indicator, reportable
FROM species
WHERE id = $1 LIMIT 1;

-- name: GetSpeciesByCommonName :one
SELECT id, scientific_name, common_name, native, taxa, indicator, reportable
FROM species
WHERE lower(common_name) = LOWER($1) LIMIT 1;

-- name: GetSpeciesByScientificName :one
SELECT id, scientific_name, common_name, native, taxa, indicator, reportable
FROM species
WHERE lower(scientific_name) = LOWER($1) LIMIT 1;

-- name: ListSpecies :many
SELECT id, scientific_name, common_name, native, taxa, indicator, reportable
FROM species
ORDER BY scientific_name;

-- name: UpdateSpecies :one
UPDATE species
SET scientific_name = $2, common_name = $3, native = $4,
    taxa = $5, indicator = $6, reportable = $7
WHERE id = $1
RETURNING id, scientific_name, common_name, native, taxa, indicator, reportable;

-- name: DeleteSpecies :exec
DELETE FROM species
WHERE id = $1;

-- name: CountSpecies :one
SELECT COUNT(*) FROM species;

-- name: SearchSpecies :many
SELECT id, scientific_name, common_name, native, taxa, indicator, reportable
FROM species
WHERE scientific_name ILIKE $1 OR common_name ILIKE $1
ORDER BY scientific_name;


-- name: ListObservedSpecies :many
-- ListObservedSpecies returns species observed within a time range.
-- If site_code is NULL, results include all sites.
-- Returns species details along with observation count.
SELECT
    sp.id,
    sp.scientific_name,
    sp.common_name,
    COUNT(o.id) AS observation_count
FROM observations o
JOIN species sp ON o.species_id = sp.id
JOIN sites s ON o.site_id = s.id
WHERE o.timestamp BETWEEN sqlc.arg(from_time) AND sqlc.arg(to_time)
  AND (
      sqlc.arg(site_code) = ''
      OR s.code = sqlc.arg(site_code)
    )
GROUP BY sp.id, sp.scientific_name, sp.common_name
ORDER BY observation_count DESC;