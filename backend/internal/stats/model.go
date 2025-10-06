package stats

import (
	"time"

	"github.com/biomonash/nillumbik/internal/db"
)

type TimePeriodRequest struct {
	From *time.Time `form:"from"`
	To   *time.Time `form:"to"`
}

type ObservationStatsInput struct {
	TimePeriodRequest
	Block      *int32   `form:"block"`
	SiteCode   *string  `form:"siteCode"`
	Taxa       *db.Taxa `form:"taxa"`
	CommonName *string  `form:"commonName"`
}

type ObservationStats struct {
	ObservationCount int64 `json:"observationCount"`
	SpeciesCount     int64 `json:"speciesCount"`
}

type TimeSeriesPoint struct {
	Timestamp string `json:"timestamp"`
	ObservationStats
}
