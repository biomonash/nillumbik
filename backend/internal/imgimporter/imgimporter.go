package imgimporter

import (
	"context"
	"fmt"
	"os"
	"regexp"
	"strings"

	"github.com/biomonash/nillumbik/internal/db"
)

type SpeciesEntry struct {
	ID         int64
	CommonName string
	Files      []string
}

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

	speciesMap := make(map[string]SpeciesEntry)
	for _, s := range species {
		speciesMap[toKey(s.CommonName)] = SpeciesEntry{
			ID:         s.ID,
			CommonName: s.CommonName,
			Files:      []string{},
		}
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
			s.Files = append(s.Files, filename)
			speciesMap[k] = s
		} else {
			fmt.Printf("Cannot find correspond species: %s\n", commonName)
		}
	}

	for _, s := range speciesMap {
		if len(s.Files) == 0 {
			fmt.Printf("No file given: %s\n", s.CommonName)
		}
	}
	return nil
}

func toKey(s string) string {
	normaliseRegex := regexp.MustCompile(` |-|male|female`)
	return normaliseRegex.ReplaceAllString(strings.ToLower(s), "")
}
