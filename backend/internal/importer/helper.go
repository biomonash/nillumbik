package importer

import (
	"fmt"
	"strconv"
	"strings"
	"time"

	"github.com/biomonash/nillumbik/internal/config"
)

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
		return time.Time{}, fmt.Errorf("missing year, date or time")
	}
	layout := "2-Jan-06 3:04 PM"
	t, err := time.ParseInLocation(layout, dateStr+" "+timeStr, config.TIMEZONE)
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
