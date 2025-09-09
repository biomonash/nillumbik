package importer

import (
	"context"
	"encoding/csv"
	"fmt"
	"os"
	"strconv"
	"strings"
	"time"

	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgtype"
	"github.com/lancatlin/nillumbik/internal/db"
	"github.com/lancatlin/nillumbik/internal/species"
)

func ImportCSV(ctx context.Context, q *db.Queries, filename string) error {
	file, err := os.Open(filename)
	if err != nil {
		return fmt.Errorf("failed to open CSV: %w", err)
	}
	defer file.Close()

	reader := csv.NewReader(file)
	reader.TrimLeadingSpace = true
	records, err := reader.ReadAll()
	if err != nil {
		return fmt.Errorf("failed to read CSV: %w", err)
	}

	for i, row := range records {
		if i == 0 {
			continue // skip header
		}

		// --- Parse site ---
		siteCode := row[1]
		block, _ := strconv.Atoi(row[21])
		forest := strings.ToLower(row[16])
		tenure := strings.ToLower(row[19])
		lat, lon := parseCoords(row[2], row[3])

		// Convert to PostGIS point
		location := fmt.Sprintf("SRID=4326;POINT(%f %f)", lon, lat)

		var tenureEnum db.TenureType
		switch tenure {
		case "private":
			tenureEnum = db.TenureTypePrivate
		case "public":
			tenureEnum = db.TenureTypePublic
		default:
			return fmt.Errorf("unknown tenure type: %s", tenure)
		}

		var forestEnum db.ForestType
		switch forest {
		case "dry":
			forestEnum = db.ForestTypeDry
		case "wet":
			forestEnum = db.ForestTypeWet
		default:
			return fmt.Errorf("unknown forest type: %s", forest)
		}

		// Check if site exists
		site, err := q.GetSiteByCode(ctx, siteCode)
		if err != nil {
			if err == pgx.ErrNoRows {
				// Site does not exist, insert
				site, err = q.CreateSite(ctx, db.CreateSiteParams{
					Code:     siteCode,
					Block:    int32(block),
					Name:     &siteCode,
					Tenure:   tenureEnum,
					Forest:   forestEnum,
					Location: location,
				})
				if err != nil {
					return fmt.Errorf("insert site failed: %w", err)
				}
			} else {
				// Some other error occurred
				return fmt.Errorf("failed to get site by code: %w", err)
			}
		}
		siteID := site.ID

		// --- Parse species ---
		scientific := row[14]
		common := row[15]
		native := strings.ToLower(row[18]) == "native"
		taxa := strings.ToLower(row[22])

		var taxaEnum db.Taxa
		switch taxa {
		case "bird":
			taxaEnum = db.TaxaBird
		case "mammal":
			taxaEnum = db.TaxaMammal
		case "reptile":
			taxaEnum = db.TaxaReptile
		default:
			return fmt.Errorf("unknown taxa: %s", taxa)
		}
		species, err := q.GetSpecies(ctx, scientific)
		if err != nil && err != pgx.ErrNoRows {
			species, err := q.CreateSpecies(ctx, db.CreateSpeciesParams{
			ScientificName: scientific,
			CommonName:     common,
			Native:         native,
			Taxa:           taxaEnum,
		})
			return fmt.Errorf("failed to get species: %w", err)
		}
		
		if err != nil {
			return fmt.Errorf("insert species failed: %w", err)
		}
		speciesID := species.ID

		// --- Parse observation ---
		ts := parseTimestamp(row[4], row[5])

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

		tsPG := pgtype.Timestamptz{
			Time: ts,
		}

		indicator := strings.ToLower(row[17]) == "y"
		reportable := strings.ToLower(row[20]) == "y"

		params := db.CreateObservationParams{
			SiteID:         siteID,
			SpeciesID:      speciesID,
			Timestamp:      tsPG,
			Method:         method,
			AppearanceTime: appearance,
			Temperature:    temp,
			Narrative:      narrativePtr,
			Confidence:     confidencePtr,
			Indicator:      indicator,
			Reportable:     reportable,
		}

		obs, err := q.CreateObservation(ctx, params)
		if err != nil {
			return fmt.Errorf("insert observation failed: %w", err)
		}

		fmt.Println("Inserted observation ID:", obs.ID)
	}

	return nil
}

// --- Helpers ---
func parseCoords(latStr, lonStr string) (float64, float64) {
	lat, _ := strconv.ParseFloat(latStr, 64)
	lon, _ := strconv.ParseFloat(lonStr, 64)
	return lat, lon
}

func parseTimestamp(dateStr, timeStr string) time.Time {
	layout := "2-Jan-06 3:04 pm"
	t, err := time.Parse(layout, dateStr+" "+timeStr)
	if err != nil {
		panic(err)
	}
	return t
}

func parseOptionalInt(s string) *int32 {
	if s == "" {
		return nil
	}
	v, _ := strconv.Atoi(s)
	val := int32(v)
	return &val
}
