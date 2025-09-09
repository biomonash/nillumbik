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

	const minCols = 23 // adjust if your CSV has more/less columns
	for i, row := range records {
		if i == 0 {
			continue // skip header
		}

		if len(row) < minCols {
			return fmt.Errorf("row %d: unexpected column count %d, want >= %d", i+1, len(row), minCols)
		}

		// --- Parse site ---
		siteCode := strings.TrimSpace(row[1])

		blockInt, err := strconv.Atoi(strings.TrimSpace(row[21]))
		if err != nil {
			return fmt.Errorf("row %d: invalid block value %q: %w", i+1, row[21], err)
		}
		block := int32(blockInt)

		forest := strings.ToLower(strings.TrimSpace(row[16]))
		tenure := strings.ToLower(strings.TrimSpace(row[19]))

		latStr, lonStr := strings.TrimSpace(row[2]), strings.TrimSpace(row[3])

		// location for CreateSiteParams is interface{} in generated code.
		// Provide WKT string when coords present, otherwise nil to insert NULL.
		var location interface{}
		if latStr != "" && lonStr != "" && latStr != "####" && lonStr != "####" {
			lat, lon, err := parseCoords(latStr, lonStr)
			if err != nil {
				return fmt.Errorf("row %d: invalid coords %q,%q: %w", i+1, latStr, lonStr, err)
			}
			// WKT: POINT(lon lat)
			location = fmt.Sprintf("POINT(%f %f)", lon, lat)
		} else {
			location = nil
		}

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
		siteID, err := q.GetSiteIDByCode(ctx, siteCode)
		if err != nil {
			if err == pgx.ErrNoRows {
				// Site does not exist, insert and get full site
				site, err := q.CreateSite(ctx, db.CreateSiteParams{
					Code:     siteCode,
					Block:    block,
					Name:     &siteCode,
					Tenure:   tenureEnum,
					Forest:   forestEnum,
					Location: location,
				})
				if err != nil {
					return fmt.Errorf("insert site failed: %w", err)
				}
				siteID = site.ID
			} else {
				return fmt.Errorf("failed to get site id by code: %w", err)
			}
		}

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

		// Try to find species by scientific name
		speciesList, err := q.SearchSpecies(ctx, scientific)
		if err != nil {
			return fmt.Errorf("failed to search species: %w", err)
		}

		var species db.Species
		if len(speciesList) > 0 {
			species = speciesList[0]
		} else {
			// Species does not exist, insert
			species, err = q.CreateSpecies(ctx, db.CreateSpeciesParams{
				ScientificName: scientific,
				CommonName:     common,
				Native:         native,
				Taxa:           taxaEnum,
			})
			if err != nil {
				return fmt.Errorf("insert species failed: %w", err)
			}
		}
		speciesID := species.ID

		// --- Parse observation ---
		ts, err := parseTimestamp(row[4], row[5])
		var tsPG pgtype.Timestamptz
		if err != nil {
			// fallback to now because DB requires NOT NULL
			tsPG = pgtype.Timestamptz{Time: time.Now().UTC(), Valid: true}
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
func parseCoords(latStr, lonStr string) (float64, float64, error) {
	lat, err := strconv.ParseFloat(latStr, 64)
	if err != nil {
		return 0, 0, err
	}
	lon, err := strconv.ParseFloat(lonStr, 64)
	if err != nil {
		return 0, 0, err
	}
	return lat, lon, nil
}

func parseTimestamp(dateStr, timeStr string) (time.Time, error) {
	if strings.TrimSpace(dateStr) == "" || strings.TrimSpace(timeStr) == "" {
		return time.Time{}, fmt.Errorf("missing date or time")
	}
	layout := "2-Jan-06 3:04 pm"
	t, err := time.Parse(layout, dateStr+" "+timeStr)
	if err != nil {
		return time.Time{}, err
	}
	return t, nil
}

func parseOptionalInt(s string) *int32 {
	s = strings.TrimSpace(s)
	if s == "" {
		return nil
	}
	v, err := strconv.Atoi(s)
	if err != nil {
		return nil
	}
	val := int32(v)
	return &val
}
