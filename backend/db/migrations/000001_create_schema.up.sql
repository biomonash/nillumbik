BEGIN;

CREATE EXTENSION IF NOT EXISTS postgis;

CREATE TYPE tenure_type AS ENUM ('public', 'private');
CREATE TYPE forest_type AS ENUM ('dry', 'wet');
CREATE TYPE taxa AS ENUM ('bird', 'mammal', 'reptile');
CREATE TYPE observation_method AS ENUM ('audio', 'camera', 'observed');

CREATE TABLE IF NOT EXISTS sites (
    id  BIGSERIAL PRIMARY KEY,
    code TEXT UNIQUE NOT NULL,
    block integer NOT NULL,
    name TEXT,
    location geometry(POINT, 4326),
    tenure tenure_type NOT NULL,
    forest forest_type NOT NULL
);

CREATE TABLE IF NOT EXISTS species (
    id  BIGSERIAL PRIMARY KEY,
    scientific_name TEXT UNIQUE NOT NULL,
    common_name TEXT NOT NULL,
    native BOOLEAN NOT NULL,
    taxa taxa NOT NULL,
    indicator BOOLEAN NOT NULL,
    reportable BOOLEAN NOT NULL
);

CREATE TABLE IF NOT EXISTS observations (
    id  BIGSERIAL PRIMARY KEY,
    site_id BIGINT NOT NULL REFERENCES sites(id),
    species_id BIGINT NOT NULL REFERENCES species(id),
    "timestamp" TIMESTAMP NOT NULL,
    method observation_method NOT NULL,
    appearance_start integer,
    appearance_end integer,
    temperature integer,
    narrative text,
    confidence real
);

CREATE VIEW observations_with_details AS
SELECT 
    o.id,
    o.site_id,
    o.species_id,
    o.timestamp,
    o.method,
    o.appearance_start,
    o.appearance_end,
    o.temperature,
    o.narrative,
    o.confidence,
    s.native,
    s.taxa,
    s.scientific_name,
    s.common_name,
    s.indicator,
    s.reportable,
    si.block,
    si.code AS site_code,
    si.name AS site_name,
    si.tenure,
    si.forest
FROM observations o
JOIN species s ON o.species_id = s.id
JOIN sites si ON o.site_id = si.id;

COMMIT;
