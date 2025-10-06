package importer

import (
	"fmt"
	"strconv"
	"strings"

	"github.com/biomonash/nillumbik/internal/db"
)

func parseObservation(i int, row []string, siteID, speciesID int64) (param db.CreateObservationsParams, err error) {
	timestamp, err := parseTimestamp(row[4], row[5])
	if err != nil {
		// leave timestamp NULL if you prefer; or set fallback if schema requires NOT NULL
		err = fmt.Errorf("failed to parse timestamp: %w", err)
		return
	}

	method := db.ObservationMethod(strings.ToLower(row[6]))
	if !method.Valid() {
		err = fmt.Errorf("unknown observation method: %s", row[6])
		return
	}

	start := parseOptionalInt(row[8])
	end := parseOptionalInt(row[9])

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
		SiteID:          siteID,
		SpeciesID:       speciesID,
		Timestamp:       timestamp,
		Method:          method,
		AppearanceStart: start,
		AppearanceEnd:   end,
		Temperature:     temp,
		Narrative:       narrativePtr,
		Confidence:      confidencePtr,
	}, nil
}
