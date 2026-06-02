package imgimporter

import (
	"context"
	"fmt"
	"os"
	"regexp"
	"strings"

	"github.com/biomonash/nillumbik/internal/db"
)

func ImportSpeciesImages(ctx context.Context, q *db.Queries, dir string) error {
	entries, err := os.ReadDir(dir)
	if err != nil {
		return fmt.Errorf("Failed to read media dir: %w", err)
	}
	reg := regexp.MustCompile(`^([\w ]+) *- *([\w]+) *- *([\w]+)( *- *([\w ]+))?\.([a-zA-Z]+)$`)

	species, err := q.ListSpecies(ctx)
	if err != nil {
		return fmt.Errorf("Failed to load species list: %w", err)
	}

	speciesMap := make(map[string]db.Species)
	for _, s := range species {
		speciesMap[toKey(s.CommonName)] = s
	}

	for _, entry := range entries {
		filename := entry.Name()
		matches := reg.FindStringSubmatch(filename)
		// fmt.Println("filename:", filename, "\tmatches: ", matches)
		if len(matches) == 0 {
			fmt.Printf("Filename cannot parsed: %s\n", filename)
			continue
		}
		// see the matching
		// if matches[5] != "" {
		// 	fmt.Printf("Common name: %s, source: %s, license: %s, author: %s, extension: %s\n", matches[1], matches[2], matches[3], matches[5], matches[6])
		// } else {
		// 	fmt.Printf("Common name: %s, source: %s, license: %s, extension: %s\n", matches[1], matches[2], matches[3], matches[4])
		// }
		commonName := strings.Trim(matches[1], " ")
		k := toKey(commonName)
		if s, ok := speciesMap[k]; ok {
			s.Images = append(s.Images, filename)
			speciesMap[k] = s
		} else {
			fmt.Printf("Cannot find correspond species: %s\n", commonName)
		}
	}

	for _, s := range speciesMap {
		if len(s.Images) == 0 {
			fmt.Printf("No file given: %s\n", s.CommonName)
			continue
		}

		_, err := q.UpdateSpecies(ctx, db.UpdateSpeciesParams{
			ID:             s.ID,
			CommonName:     s.CommonName,
			ScientificName: s.ScientificName,
			Taxa:           s.Taxa,
			Native:         s.Native,
			Indicator:      s.Indicator,
			Reportable:     s.Reportable,
			Images:         s.Images,
		})
		if err != nil {
			return fmt.Errorf("Failed to update %s: %w", s.CommonName, err)
		}
	}
	return nil
}

func toKey(s string) string {
	normaliseRegex := regexp.MustCompile(` |-|male|female`)
	return normaliseRegex.ReplaceAllString(strings.ToLower(s), "")
}
