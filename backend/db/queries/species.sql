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

-- name: CountDistinctSpeciesObserved :one
SELECT COUNT(DISTINCT species_id) FROM observations;

-- name: CountActiveMonitoringSites :one
SELECT COUNT(DISTINCT site_id) FROM observations;

-- name: CountDetectionEvents :one
SELECT COUNT(*) FROM observations;

-- name: CountDistinctNativeSpeciesObserved :one
SELECT COUNT(DISTINCT o.species_id)
FROM observations o
JOIN species s ON o.species_id = s.id
WHERE s.native = TRUE;

-- name: CountDistinctSpeciesObservedInPeriod :one
SELECT COUNT(DISTINCT species_id)
FROM observations
WHERE ($1::timestamptz IS NULL OR "timestamp" >= $1::timestamptz)
  AND ($2::timestamptz IS NULL OR "timestamp" <= $2::timestamptz);

-- name: CountDistinctNativeSpeciesObservedInPeriod :one
SELECT COUNT(DISTINCT o.species_id)
FROM observations o
JOIN species s ON o.species_id = s.id
WHERE s.native = TRUE
  AND ($1::timestamptz IS NULL OR o."timestamp" >= $1::timestamptz)
  AND ($2::timestamptz IS NULL OR o."timestamp" <= $2::timestamptz);

-- name: ListSpeciesCountByTaxaInPeriod :many
SELECT s.taxa, COUNT(DISTINCT o.species_id) AS count
FROM observations o
JOIN species s ON o.species_id = s.id
WHERE ($1::timestamptz IS NULL OR o."timestamp" >= $1::timestamptz)
  AND ($2::timestamptz IS NULL OR o."timestamp" <= $2::timestamptz)
GROUP BY s.taxa;

-- name: SpeciesObservationTimeSeries :many
SELECT date_trunc('month', "timestamp")::timestamp AS month, COUNT(*) AS count
FROM observations
WHERE ($1::timestamptz IS NULL OR "timestamp" >= $1::timestamptz)
  AND ($2::timestamptz IS NULL OR "timestamp" <= $2::timestamptz)
GROUP BY month
ORDER BY month;
