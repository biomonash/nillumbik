-- name: CreateSpecies :one
INSERT INTO species (scientific_name, common_name, native, taxa, indicator, reportable, images)
VALUES ($1, $2, $3, $4, $5, $6, $7)
RETURNING id, scientific_name, common_name, native, taxa, indicator, reportable, images;

-- name: GetSpecies :one
SELECT id, scientific_name, common_name, native, taxa, indicator, reportable, images
FROM species
WHERE id = $1 LIMIT 1;

-- name: GetSpeciesByCommonName :one
SELECT id, scientific_name, common_name, native, taxa, indicator, reportable, images
FROM species
WHERE lower(common_name) = LOWER($1) LIMIT 1;

-- name: GetSpeciesByScientificName :one
SELECT id, scientific_name, common_name, native, taxa, indicator, reportable, images
FROM species
WHERE lower(scientific_name) = LOWER($1) LIMIT 1;

-- name: ListSpecies :many
SELECT id, scientific_name, common_name, native, taxa, indicator, reportable, images
FROM species
ORDER BY scientific_name;

-- name: UpdateSpecies :one
UPDATE species
SET scientific_name = $2, common_name = $3, native = $4,
    taxa = $5, indicator = $6, reportable = $7, images = $8
WHERE id = $1
RETURNING id, scientific_name, common_name, native, taxa, indicator, reportable, images;

-- name: DeleteSpecies :exec
DELETE FROM species
WHERE id = $1;

-- name: CountSpecies :one
SELECT COUNT(*) FROM species;

-- name: SearchSpecies :many
SELECT id, scientific_name, common_name, native, taxa, indicator, reportable, images
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
  sp.native,
  sp.taxa,
  sp.indicator,
  sp.reportable,
  sp.images,
  observation_count
FROM species sp
JOIN
(
  SELECT
      species_id,
      COUNT(id) AS observation_count
  FROM observations_with_details
  WHERE
    (sqlc.narg('from')::timestamp IS NULL OR timestamp >= sqlc.narg('from')::timestamp)
    AND (sqlc.narg('to')::timestamp IS NULL OR timestamp <= sqlc.narg('to')::timestamp)
    AND (
        sqlc.narg('site_codes')::text[] IS NULL
        OR site_code = ANY(sqlc.narg('site_codes'))
      )
    AND (
        sqlc.narg('blocks')::integer[] IS NULL
        OR block = ANY(sqlc.narg('blocks'))
      )
    AND (
        sqlc.narg('taxa')::taxa IS NULL
        OR taxa = sqlc.narg('taxa')::taxa
      )
  GROUP BY species_id
) as observed
ON sp.id = species_id
ORDER BY observation_count DESC;
