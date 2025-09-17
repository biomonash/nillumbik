package importer

import (
	"fmt"
	"strings"

	"github.com/biomonash/nillumbik/internal/db"
)

func parseSpecies(i int, row []string) (species db.CreateSpeciesParams, err error) {
	scientific := row[14]
	common := row[15]
	native := strings.ToLower(row[18]) == "native"
	taxa := strings.ToLower(row[22])

	taxaEnum := db.Taxa(taxa)
	if !taxaEnum.Valid() {
		err = fmt.Errorf("unknown taxa: %s", taxa)
		return
	}

	// parse indicator/reportable from CSV
	indicator := strings.ToLower(strings.TrimSpace(row[17])) == "y"
	reportable := strings.ToLower(strings.TrimSpace(row[20])) == "y"

	// Species does not exist, insert (include indicator/reportable)
	species = db.CreateSpeciesParams{
		ScientificName: scientific,
		CommonName:     common,
		Native:         native,
		Taxa:           taxaEnum,
		Indicator:      indicator,
		Reportable:     reportable,
	}
	return
}
