-- name: CreateSite :one
INSERT INTO sites (code, block, name, location, tenure, forest)
VALUES ($1, $2, $3, $4, $5, $6)
RETURNING *;

-- name: GetSite :one
SELECT * FROM sites
WHERE id = $1 LIMIT 1;

-- name: GetSiteByCode :one
SELECT * FROM sites
WHERE code = $1 LIMIT 1;

-- name: ListSites :many
SELECT * FROM sites
ORDER BY code;

-- name: UpdateSite :one
UPDATE sites
SET code = $2, block = $3, name = $4, location = $5, tenure = $6, forest = $7
WHERE id = $1
RETURNING *;

-- name: UpdateSiteByCode :one
UPDATE sites
SET block = $2, name = $3, location = $4, tenure = $5, forest = $6
WHERE code = $1
RETURNING *;

-- name: DeleteSite :exec
DELETE FROM sites
WHERE id = $1;

-- name: DeleteSiteByCode :exec
DELETE FROM sites
WHERE code = $1;

-- name: CountSites :one
SELECT COUNT(*) FROM sites;

-- name: SearchSites :many
SELECT * FROM sites
WHERE code ILIKE $1 OR name ILIKE $1
ORDER BY code;