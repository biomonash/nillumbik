-- name: CreateSpecies :one
INSERT INTO species (scientific_name, common_name, native, taxa, indicator, reportable)
VALUES ($1, $2, $3, $4, $5, $6)
RETURNING *;

-- name: GetSpecies :one
SELECT * FROM species
WHERE id = $1 LIMIT 1;

-- name: GetSpeciesByCommonName :one
SELECT * FROM species
WHERE lower(common_name) = LOWER($1) LIMIT 1;

-- name: ListSpecies :many
SELECT * FROM species
ORDER BY scientific_name;

-- name: UpdateSpecies :one
UPDATE species
SET scientific_name = $2, common_name = $3, native = $4,
    taxa = $5, indicator = $6, reportable = $7
WHERE id = $1
RETURNING *;

-- name: DeleteSpecies :exec
DELETE FROM species
WHERE id = $1;

-- name: CountSpecies :one
SELECT COUNT(*) FROM species;

-- name: SearchSpecies :many
SELECT * FROM species
WHERE scientific_name ILIKE $1 OR common_name ILIKE $1
ORDER BY scientific_name;
