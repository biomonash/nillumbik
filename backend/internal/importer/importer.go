package importer

import (
	"context"
	"encoding/csv"
	"errors"
	"fmt"
	"io"
	"os"
	"strings"

	"github.com/biomonash/nillumbik/internal/db"
	"github.com/jackc/pgx/v5"
)

const BATCH_SIZE = 1000

func ImportCSV(ctx context.Context, q *db.Queries, filename string) error {
	file, err := os.Open(filename)
	if err != nil {
		return fmt.Errorf("failed to open CSV: %w", err)
	}
	defer file.Close()

	cache := NewCache(q)

	reader := csv.NewReader(file)
	reader.TrimLeadingSpace = true
	// records, err := reader.ReadAll()

	const minCols = 23 // adjust if your CSV has more/less columns

	batch := make([]db.CreateObservationsParams, 0, BATCH_SIZE)
	i := 0
	for {
		row, err := reader.Read()
		if errors.Is(err, io.EOF) {
			break
		}
		if err != nil {
			return fmt.Errorf("failed to read CSV: %w", err)
		}
		if i == 0 {
			i++
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
				return fmt.Errorf("failed to parse species: %w", err)
			}
			species, err = q.CreateSpecies(ctx, speciesParam)
			if err != nil {
				return fmt.Errorf("row: %d insert species failed: %w\n%s", i, err, fmt.Sprintf("%+v", speciesParam))
			}
			cache.AddSpecies(species)
		} else if err != nil {
			panic(err)
		}

		// --- Parse observation ---
		params, err := parseObservation(i, row, site.ID, species.ID)
		if err != nil {
			return fmt.Errorf("row %d: failed to parse observation: %w", i, err)
		}
		batch = append(batch, params)

		if len(batch) == BATCH_SIZE {
			count, err := q.CreateObservations(ctx, batch)
			if err != nil {
				return fmt.Errorf("failed to insert observations: %w", err)
			}
			fmt.Printf("Successfully inserted %d observations to row %d\n", count, i)
			batch = make([]db.CreateObservationsParams, 0, BATCH_SIZE)
		}
		i++
	}

	if len(batch) != 0 {
		count, err := q.CreateObservations(ctx, batch)
		if err != nil {
			return fmt.Errorf("failed to insert observations: %w", err)
		}
		fmt.Printf("Successfully inserted %d observations to row %d\n", count, i)
	}

	return nil
}
