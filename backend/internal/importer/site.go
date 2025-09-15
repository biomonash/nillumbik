package importer

import (
	"fmt"
	"strconv"
	"strings"

	"github.com/biomonash/nillumbik/internal/db"
)

func parseSite(i int, row []string) (site db.CreateSiteParams, err error) {
	siteCode := strings.TrimSpace(row[1])

	blockInt, err := strconv.Atoi(strings.TrimSpace(row[21]))
	if err != nil {
		err = fmt.Errorf("row %d: invalid block value %q: %w", i+1, row[21], err)
		return
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
			return site, fmt.Errorf("row %d: invalid coords %q,%q: %w", i+1, latStr, lonStr, err)
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
		err = fmt.Errorf("unknown tenure type: %s", tenure)
		return
	}

	var forestEnum db.ForestType
	switch forest {
	case "dry":
		forestEnum = db.ForestTypeDry
	case "wet":
		forestEnum = db.ForestTypeWet
	default:
		err = fmt.Errorf("unknown forest type: %s", forest)
		return
	}

	// Check if site exists
	return db.CreateSiteParams{
		Code:     siteCode,
		Block:    block,
		Name:     &siteCode,
		Tenure:   tenureEnum,
		Forest:   forestEnum,
		Location: location,
	}, nil
}
