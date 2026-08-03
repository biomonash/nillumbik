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
  AND (sqlc.narg('blocks')::int[] IS NULL OR block = ANY(sqlc.narg('blocks')))
  AND (sqlc.narg('site_codes')::text[] IS NULL OR site_code = ANY(sqlc.narg('site_codes')))
  AND (sqlc.narg('taxa')::taxa IS NULL OR taxa = sqlc.narg('taxa')::taxa)
  AND (sqlc.narg('common_name')::text IS NULL OR LOWER(common_name) = LOWER(sqlc.narg('common_name')::text))
GROUP BY native;

-- name: ListSpeciesCountByTaxa :many
SELECT taxa, COUNT(DISTINCT species_id) AS count
FROM observations_with_details
WHERE (sqlc.narg('from')::timestamp IS NULL OR "timestamp" >= sqlc.narg('from')::timestamp)
  AND (sqlc.narg('to')::timestamp IS NULL OR "timestamp" <= sqlc.narg('to')::timestamp)
  AND (sqlc.narg('blocks')::int[] IS NULL OR block = ANY(sqlc.narg('blocks')))
  AND (sqlc.narg('site_codes')::text[] IS NULL OR site_code = ANY(sqlc.narg('site_codes')))
  AND (sqlc.narg('taxa')::taxa IS NULL OR taxa = sqlc.narg('taxa')::taxa)
  AND (sqlc.narg('common_name')::text IS NULL OR LOWER(common_name) = LOWER(sqlc.narg('common_name')::text))
GROUP BY taxa;

-- name: ObservationTimeSeriesGroupByNative :many
SELECT native as is_native, date_trunc('year', "timestamp")::timestamp AS year, COUNT(DISTINCT species_id) AS species_count, COUNT(*) AS observation_count
FROM observations_with_details
WHERE (sqlc.narg('from')::timestamp IS NULL OR "timestamp" >= sqlc.narg('from')::timestamp)
  AND (sqlc.narg('to')::timestamp IS NULL OR "timestamp" <= sqlc.narg('to')::timestamp)
  AND (sqlc.narg('blocks')::int[] IS NULL OR block = ANY(sqlc.narg('blocks')))
  AND (sqlc.narg('site_codes')::text[] IS NULL OR site_code = ANY(sqlc.narg('site_codes')))
  AND (sqlc.narg('taxa')::taxa IS NULL OR taxa = sqlc.narg('taxa')::taxa)
  AND (sqlc.narg('common_name')::text IS NULL OR LOWER(common_name) = LOWER(sqlc.narg('common_name')::text))
GROUP BY year, native
ORDER BY year;

-- name: ObservationGroupBySites :many
SELECT site_code, COUNT(DISTINCT species_id) AS species_count, COUNT(*) AS observation_count
FROM observations_with_details
WHERE (sqlc.narg('from')::timestamp IS NULL OR "timestamp" >= sqlc.narg('from')::timestamp)
  AND (sqlc.narg('to')::timestamp IS NULL OR "timestamp" <= sqlc.narg('to')::timestamp)
  AND (sqlc.narg('blocks')::int[] IS NULL OR block = ANY(sqlc.narg('blocks')))
  AND (sqlc.narg('site_codes')::text[] IS NULL OR site_code = ANY(sqlc.narg('site_codes')))
  AND (sqlc.narg('taxa')::taxa IS NULL OR taxa = sqlc.narg('taxa')::taxa)
  AND (sqlc.narg('common_name')::text IS NULL OR LOWER(common_name) = LOWER(sqlc.narg('common_name')::text))
GROUP BY site_code
ORDER BY site_code;

-- name: ObservationGroupByBlocks :many
SELECT block, COUNT(DISTINCT species_id) AS species_count, COUNT(*) AS observation_count
FROM observations_with_details
WHERE (sqlc.narg('from')::timestamp IS NULL OR "timestamp" >= sqlc.narg('from')::timestamp)
  AND (sqlc.narg('to')::timestamp IS NULL OR "timestamp" <= sqlc.narg('to')::timestamp)
  AND (sqlc.narg('blocks')::int[] IS NULL OR block = ANY(sqlc.narg('blocks')))
  AND (sqlc.narg('site_codes')::text[] IS NULL OR site_code = ANY(sqlc.narg('site_codes')))
  AND (sqlc.narg('taxa')::taxa IS NULL OR taxa = sqlc.narg('taxa')::taxa)
  AND (sqlc.narg('common_name')::text IS NULL OR LOWER(common_name) = LOWER(sqlc.narg('common_name')::text))
GROUP BY block
ORDER BY block;

-- name: CountActiveSites :one
SELECT COUNT(DISTINCT site_id) as sites_count
FROM observations_with_details
WHERE (sqlc.narg('from')::timestamp IS NULL OR "timestamp" >= sqlc.narg('from')::timestamp)
  AND (sqlc.narg('to')::timestamp IS NULL OR "timestamp" <= sqlc.narg('to')::timestamp);
