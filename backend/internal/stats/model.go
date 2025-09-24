package stats

import (
	"time"

	"github.com/biomonash/nillumbik/internal/db"
)

type TimePeriodRequest struct {
	From *time.Time `form:"from" time_format:"2006-01-02"`
	To   *time.Time `form:"to"   time_format:"2006-01-02"`
}

type ObservationStatsInput struct {
	TimePeriodRequest
	Block      *int32   `form:"block"`
	SiteCode   *string  `form:"site_code"`
	Taxa       *db.Taxa `form:"taxa"`
	CommonName *string  `form:"common_name"`
}

type ObservationStats struct {
	ObservationCount int64 `json:"observation_count"`
	SpeciesCount     int64 `json:"species_count"`
}

type TimeSeriesPoint struct {
	Timestamp string `json:"timestamp"`
	ObservationStats
}
