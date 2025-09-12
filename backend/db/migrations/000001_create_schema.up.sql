BEGIN;

-- CREATE EXTENSION postgis;

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
    common_name TEXT UNIQUE NOT NULL,
    native BOOLEAN NOT NULL,
    taxa taxa NOT NULL,
    indicator BOOLEAN NOT NULL,
    reportable BOOLEAN NOT NULL
);

CREATE TABLE IF NOT EXISTS observations (
    id  BIGSERIAL PRIMARY KEY,    
    site_id BIGSERIAL NOT NULL REFERENCES sites(id),
    species_id BIGSERIAL NOT NULL REFERENCES species(id),
    timestamp TIMESTAMP WITH TIME ZONE NOT NULL,
    method observation_method NOT NULL,
    -- Skip file field for now
    appearance_time int4range,
    temperature integer,
    narrative text,
    -- Skip image path field for now
    confidence real
);

COMMIT;