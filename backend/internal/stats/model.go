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
	Block     *int32   `form:"block"`
	Zone      *string  `form:"zone"`
	Taxa      *db.Taxa `form:"taxa"`
	SpeciesId *string  `form:"species_id"`
}
