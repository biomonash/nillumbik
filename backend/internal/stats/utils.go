package stats

import (
	"github.com/biomonash/nillumbik/internal/db"
	"github.com/biomonash/nillumbik/internal/species"
	"github.com/biomonash/nillumbik/internal/utils"
	"github.com/jackc/pgx/v5/pgtype"
)

// parseObservationStatsInput converts ObservationStatsInput to SQLC parameters
// This function extracts the common parsing logic used across all observation endpoints
func parseObservationStatsInput(input ObservationStatsInput) (from, to pgtype.Timestamp, taxa db.NullTaxa, commonName *string) {
	from = utils.ToPgTimestamp(input.From)
	to = utils.ToPgTimestamp(input.To)

	taxa = db.NullTaxa{Valid: false}
	if input.Taxa != nil {
		taxa.Taxa = *input.Taxa
		taxa.Valid = true
	}

	commonName = species.CleanOptionalName(input.CommonName)

	return from, to, taxa, commonName
}
