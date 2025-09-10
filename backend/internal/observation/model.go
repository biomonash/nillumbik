package observation

import (
	"time"

	"github.com/lancatlin/nillumbik/internal/db"
)

type Observation struct {
	ID             int64                `json:"id"`
	SiteID         int64                `json:"site_id"`
	SpeciesID      int64                `json:"species_id"`
	Timestamp      time.Time            `json:"timestamp"`
	Method         db.ObservationMethod `json:"method"`
	AppearanceTime struct {
		Start int `json:"start"`
		End   int `json:"end"`
	} `json:"appearance_time"`
	Temperature *int32   `json:"temperature"`
	Narrative   *string  `json:"narrative"`
	Confidence  *float32 `json:"confidence"`
	Indicator   bool     `json:"indicator"`
	Reportable  bool     `json:"reportable"`
}
