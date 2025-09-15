package importer

import (
	"context"
	"encoding/csv"
	"errors"
	"fmt"
	"os"
	"strings"

	"github.com/biomonash/nillumbik/internal/db"
	"github.com/jackc/pgx/v5"
)

func ImportCSV(ctx context.Context, q *db.Queries, filename string) error {
	file, err := os.Open(filename)
	if err != nil {
		return fmt.Errorf("failed to open CSV: %w", err)
	}
	defer file.Close()

	cache := NewCache(q)

	reader := csv.NewReader(file)
	reader.TrimLeadingSpace = true
	records, err := reader.ReadAll()
	if err != nil {
		return fmt.Errorf("failed to read CSV: %w", err)
	}

	const minCols = 23 // adjust if your CSV has more/less columns
	for i, row := range records[:1000] {
		if i == 0 {
			continue // skip header
		}

		if len(row) < minCols {
			return fmt.Errorf("row %d: unexpected column count %d, want >= %d", i+1, len(row), minCols)
		}

		// --- Parse site ---
		siteCode := strings.TrimSpace(row[1])
		// Check if site exists
		site, err := cache.GetSite(ctx, siteCode)
		if errors.Is(err, pgx.ErrNoRows) {
			// Site does not exist, insert and get full site
			siteParam, err := parseSite(i, row)
			if err != nil {
				return fmt.Errorf("parse site failed: %w", err)
			}
			site, err = q.CreateSite(ctx, siteParam)
			if err != nil {
				return fmt.Errorf("insert site failed: %w", err)
			}
			cache.AddSite(site)
		} else if err != nil {
			return fmt.Errorf("failed to get site id by code: %w", err)
		}

		scientific := row[14]
		// --- Parse species ---
		species, err := cache.GetSpecies(ctx, scientific)

		if errors.Is(err, pgx.ErrNoRows) {
			speciesParam, err := parseSpecies(i, row)
			if err != nil {
				return fmt.Errorf("Failed to parse species: %w", err)
			}
			species, err = q.CreateSpecies(ctx, speciesParam)
			if err != nil {
				return fmt.Errorf("insert species failed: %w", err)
			}
			cache.AddSpecies(species)
		} else if err != nil {
			panic(err)
		}

		// --- Parse observation ---
		params, err := parseObservation(i, row, site.ID, species.ID)
		if err != nil {
			return fmt.Errorf("Row %d: failed to parse observation: %w", i, err)
		}
		obs, err := q.CreateObservation(ctx, params)
		if err != nil {
			return fmt.Errorf("insert observation failed: %s\n %w", params, err)
		}

		fmt.Println("Inserted observation ID:", obs.ID)
	}

	return nil
}
