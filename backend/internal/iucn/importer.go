package iucn

import (
	"context"
	"encoding/csv"
	"fmt"
	"io"
	"os"

	"github.com/biomonash/forestportal/internal/db"
)

func ImportFromCache(ctx context.Context, q db.Querier, cachePath string) error {
	file, err := os.Open(cachePath)
	if err != nil {
		return fmt.Errorf("failed to open cache file: %w", err)
	}
	defer file.Close()

	reader := csv.NewReader(file)
	
	if _, err := reader.Read(); err != nil {
		return fmt.Errorf("failed to read header: %w", err)
	}

	for {
		row, err := reader.Read()
		if err == io.EOF {
			break
		} else if err != nil {
			return fmt.Errorf("failed to read row: %w", err)
		}

		scientificName := row[0]
		iucnStatus := row[1]

		if iucnStatus == "" {
			fmt.Printf("skipping %s: no IUCN status\n", scientificName)
			continue
		}

		species, err := q.GetSpeciesByScientificName(ctx, scientificName)
		if err != nil {
			fmt.Printf("skipping %s: not found in database: %v\n", scientificName, err)
			continue
		}

		err = q.UpdateSpeciesIUCNStatus(ctx, db.UpdateSpeciesIUCNStatusParams{
			IucnStatus: &iucnStatus,
			ID: species.ID,
		})
		if err != nil {
			fmt.Printf("skipping %s: failed to update: %v\n", scientificName, err)
			continue
		}
		fmt.Printf("updated %s: %s\n", scientificName, iucnStatus)
	}
	return nil
}