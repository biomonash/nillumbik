package importer

import (
	"context"
	"encoding/csv"
	"errors"
	"fmt"
	"os"
	"strconv"
	"strings"

	"github.com/biomonash/nillumbik/internal/db"
	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgtype"
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
		ts, err := parseTimestamp(row[4], row[5])
		var tsPG pgtype.Timestamptz
		if err != nil {
			// leave timestamp NULL if you prefer; or set fallback if schema requires NOT NULL
			return fmt.Errorf("failed to parse timestamp: %w", err)
		} else {
			tsPG = pgtype.Timestamptz{Time: ts, Valid: true}
		}

		var method db.ObservationMethod
		switch strings.ToLower(row[6]) {
		case "audio":
			method = db.ObservationMethodAudio
		case "camera":
			method = db.ObservationMethodCamera
		case "observed":
			method = db.ObservationMethodObserved
		default:
			return fmt.Errorf("unknown observation method: %s", row[6])
		}

		start, _ := strconv.Atoi(row[8])
		end, _ := strconv.Atoi(row[9])
		appearance := pgtype.Range[pgtype.Int4]{
			Lower:     pgtype.Int4{Int32: int32(start), Valid: true},
			Upper:     pgtype.Int4{Int32: int32(end), Valid: true},
			LowerType: pgtype.Inclusive,
			UpperType: pgtype.Inclusive,
		}

		temp := parseOptionalInt(row[10])

		var narrativePtr *string
		if row[11] != "" {
			narrativePtr = &row[11]
		}

		var confidencePtr *float32
		if row[13] != "" {
			c, _ := strconv.ParseFloat(row[13], 32)
			conf := float32(c)
			confidencePtr = &conf
		}

		params := db.CreateObservationParams{
			SiteID:         site.ID,
			SpeciesID:      species.ID,
			Timestamp:      tsPG,
			Method:         method,
			AppearanceTime: appearance,
			Temperature:    temp,
			Narrative:      narrativePtr,
			Confidence:     confidencePtr,
		}

		obs, err := q.CreateObservation(ctx, params)
		if err != nil {
			return fmt.Errorf("insert observation failed: %s\n %w", params, err)
		}

		fmt.Println("Inserted observation ID:", obs.ID)
	}

	return nil
}
