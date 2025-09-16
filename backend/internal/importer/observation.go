package importer

import (
	"fmt"
	"strconv"
	"strings"

	"github.com/biomonash/nillumbik/internal/db"
	"github.com/jackc/pgx/v5/pgtype"
)

func parseObservation(i int, row []string, siteID, speciesID int64) (param db.CreateObservationsParams, err error) {
	ts, err := parseTimestamp(row[4], row[5])
	var tsPG pgtype.Timestamptz
	if err != nil {
		// leave timestamp NULL if you prefer; or set fallback if schema requires NOT NULL
		err = fmt.Errorf("failed to parse timestamp: %w", err)
		return
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
		err = fmt.Errorf("unknown observation method: %s", row[6])
		return
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

	return db.CreateObservationsParams{
		SiteID:         siteID,
		SpeciesID:      speciesID,
		Timestamp:      tsPG,
		Method:         method,
		AppearanceTime: appearance,
		Temperature:    temp,
		Narrative:      narrativePtr,
		Confidence:     confidencePtr,
	}, nil
}
