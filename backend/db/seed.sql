BEGIN;

INSERT INTO sites (code, block, tenure, forest) VALUES
    ('1D5', 1, 'private', 'dry'),
    ('2D2', 2, 'private', 'dry'),
    ('5D7', 5, 'public', 'dry'),
    ('3W5', 3, 'private', 'wet'),
    ('5W7', 5, 'public', 'wet');

INSERT INTO species (scientific_name, common_name, native, taxa) VALUES
    ('Porphyrio melanotus', 'Australasian swamphen', true, 'bird'),
    ('Alisterus scapularis', 'Australian king-parrot', true, 'bird'),
    ('Acridotheres tristis', 'Common myna', false, 'bird'),
    ('Antechinus agilis', 'Agile antechinus', true, 'mammal'),
    ('Vulpes vulpes', 'Fox', false, 'mammal'),
    ('Tiliqua nigrolutea', 'Blotched blue-tongued lizard', true, 'reptile');

INSERT INTO observations (site_id, species_id, timestamp, method, appearance_time, temperature, narrative, confidence, indicator, reportable) VALUES
    ((SELECT id FROM sites WHERE code = '1D5'), (SELECT id FROM species WHERE scientific_name = 'Alisterus scapularis'), '2021-10-27 06:30:00+10', 'audio', '[21, 24]', NULL, NULL, 0.8148, true, false),
    ((SELECT id FROM sites WHERE code = '2D2'), (SELECT id FROM species WHERE scientific_name = 'Alisterus scapularis'), '2021-10-27 09:30:00+10', 'audio', '[105, 108]', NULL, NULL, 0.9128, true, false);

COMMIT;