-- name: CountDistinctSpeciesObserved :one
SELECT COUNT(DISTINCT species_id)
FROM observations
WHERE (sqlc.narg('from')::timestamp IS NULL OR "timestamp" >= sqlc.narg('from')::timestamp)
  AND (sqlc.narg('to')::timestamp IS NULL OR "timestamp" <= sqlc.narg('to')::timestamp);

-- name: CountSpeciesByNative :many
SELECT s.native AS is_native, COUNT(DISTINCT o.species_id) AS species_count, COUNT(*) AS observation_count
FROM observations o
JOIN species s ON o.species_id = s.id
JOIN sites si ON o.site_id = si.id
WHERE (sqlc.narg('from')::timestamp IS NULL OR o."timestamp" >= sqlc.narg('from')::timestamp)
  AND (sqlc.narg('to')::timestamp IS NULL OR o."timestamp" <= sqlc.narg('to')::timestamp)
  AND (sqlc.narg('block')::int IS NULL OR si.block = sqlc.narg('block')::int)
GROUP BY s.native;

-- name: ListSpeciesCountByTaxa :many
SELECT s.taxa, COUNT(DISTINCT o.species_id) AS count
FROM observations o
JOIN species s ON o.species_id = s.id
JOIN sites si ON o.site_id = si.id
WHERE (sqlc.narg('from')::timestamp IS NULL OR o."timestamp" >= sqlc.narg('from')::timestamp)
  AND (sqlc.narg('to')::timestamp IS NULL OR o."timestamp" <= sqlc.narg('to')::timestamp)
  AND (sqlc.narg('block')::int IS NULL OR si.block = sqlc.narg('block')::int)
GROUP BY s.taxa;

-- name: SpeciesObservationTimeSeries :many
SELECT date_trunc('month', "timestamp")::timestamp AS month, COUNT(*) AS count
FROM observations
WHERE (sqlc.narg('from')::timestamp IS NULL OR "timestamp" >= sqlc.narg('from')::timestamp)
  AND (sqlc.narg('to')::timestamp IS NULL OR "timestamp" <= sqlc.narg('to')::timestamp)
GROUP BY month
ORDER BY month;