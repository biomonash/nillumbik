package stats

import (
	"github.com/biomonash/forestportal/internal/db"
	"github.com/biomonash/forestportal/internal/species"
	"github.com/jackc/pgx/v5/pgtype"
)

// parseObservationStatsInput converts ObservationStatsInput to SQLC parameters
// This function extracts the common parsing logic used across all observation endpoints
func parseObservationStatsInput(input ObservationStatsInput) (from, to pgtype.Timestamp, taxa db.NullTaxa, commonName *string) {
	taxa = db.NullTaxa{Valid: false}
	if input.Taxa != nil {
		taxa.Taxa = *input.Taxa
		taxa.Valid = true
	}

	commonName = species.CleanOptionalName(input.CommonName)

	return input.From.ToPGTime(), input.To.ToPGTime(), taxa, commonName
}
