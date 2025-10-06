package observation

import (
	"time"

	"github.com/biomonash/nillumbik/internal/db"
)

type Observation struct {
	ID             int64                `json:"id"`
	SiteID         int64                `json:"siteId"`
	SpeciesID      int64                `json:"speciesId"`
	Timestamp      time.Time            `json:"timestamp"`
	Method         db.ObservationMethod `json:"method"`
	AppearanceTime struct {
		Start int `json:"start"`
		End   int `json:"end"`
	} `json:"appearanceIime"`
	Temperature *int32   `json:"temperature"`
	Narrative   *string  `json:"narrative"`
	Confidence  *float32 `json:"confidence"`
	Indicator   bool     `json:"indicator"`
	Reportable  bool     `json:"reportable"`
}
