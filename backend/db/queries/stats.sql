-- name: CountDistinctSpeciesObserved :one
SELECT COUNT(DISTINCT species_id)
FROM observations
WHERE (sqlc.narg('from')::timestamp IS NULL OR "timestamp" >= sqlc.narg('from')::timestamp)
  AND (sqlc.narg('to')::timestamp IS NULL OR "timestamp" <= sqlc.narg('to')::timestamp);

-- name: CountSpeciesByNative :many
SELECT native AS is_native, COUNT(DISTINCT species_id) AS species_count, COUNT(*) AS observation_count
FROM observations_with_details
WHERE (sqlc.narg('from')::timestamp IS NULL OR "timestamp" >= sqlc.narg('from')::timestamp)
  AND (sqlc.narg('to')::timestamp IS NULL OR "timestamp" <= sqlc.narg('to')::timestamp)
  AND (sqlc.narg('block')::int IS NULL OR block = sqlc.narg('block')::int)
  AND (sqlc.narg('site_code')::text IS NULL OR site_code = sqlc.narg('site_code'))
  AND (sqlc.narg('taxa')::taxa IS NULL OR taxa = sqlc.narg('taxa')::taxa)
  AND (sqlc.narg('common_name')::text IS NULL OR LOWER(common_name) = LOWER(sqlc.narg('common_name')::text))
GROUP BY native;

-- name: ListSpeciesCountByTaxa :many
SELECT taxa, COUNT(DISTINCT species_id) AS count
FROM observations_with_details
WHERE (sqlc.narg('from')::timestamp IS NULL OR "timestamp" >= sqlc.narg('from')::timestamp)
  AND (sqlc.narg('to')::timestamp IS NULL OR "timestamp" <= sqlc.narg('to')::timestamp)
  AND (sqlc.narg('block')::int IS NULL OR block = sqlc.narg('block')::int)
  AND (sqlc.narg('site_code')::text IS NULL OR site_code = sqlc.narg('site_code'))
  AND (sqlc.narg('taxa')::taxa IS NULL OR taxa = sqlc.narg('taxa')::taxa)
  AND (sqlc.narg('common_name')::text IS NULL OR LOWER(common_name) = LOWER(sqlc.narg('common_name')::text))
GROUP BY taxa;

-- name: ObservationTimeSeriesGroupByNative :many
SELECT native as is_native, date_trunc('year', "timestamp")::timestamp AS year, COUNT(*) AS count
FROM observations_with_details
WHERE (sqlc.narg('from')::timestamp IS NULL OR "timestamp" >= sqlc.narg('from')::timestamp)
  AND (sqlc.narg('to')::timestamp IS NULL OR "timestamp" <= sqlc.narg('to')::timestamp)
  AND (sqlc.narg('block')::int IS NULL OR block = sqlc.narg('block')::int)
  AND (sqlc.narg('site_code')::text IS NULL OR site_code = sqlc.narg('site_code'))
  AND (sqlc.narg('taxa')::taxa IS NULL OR taxa = sqlc.narg('taxa')::taxa)
  AND (sqlc.narg('common_name')::text IS NULL OR LOWER(common_name) = LOWER(sqlc.narg('common_name')::text))
GROUP BY year, native
ORDER BY year;