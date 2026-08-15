package iucn

import (
	"context"
	"encoding/csv"
	"encoding/json"
	"fmt"
	"net/http"
	"os"
	"strings"
	"time"

	"github.com/biomonash/forestportal/internal/db"
)

type IUCNAssessment struct {
	Latest              bool   `json:"latest"`
	RedListCategoryCode string `json:"red_list_category_code"`
}

type IUCNResponse struct {
	Assessments []IUCNAssessment `json:"assessments"`
}

func FetchAndCache(ctx context.Context, q db.Querier, token string, outputPath string) error {
	species, err := q.ListSpecies(ctx)
	if err != nil {
		return fmt.Errorf("failed to list species: %w", err)
	}

	file, err := os.Create(outputPath)
	if err != nil {
		return fmt.Errorf("failed to create cache file: %w", err)
	}
	defer file.Close()

	writer := csv.NewWriter(file)
	defer writer.Flush()

	writer.Write([]string{"scientific_name", "iucn_status"})

	client := &http.Client{}

	for _, sp := range species {
		parts := strings.SplitN(sp.ScientificName, " ", 2)
		if len(parts) != 2 {
			fmt.Printf("skipping %s: cannot split scientific name\n", sp.ScientificName)
			writer.Write([]string{sp.ScientificName, ""})
			continue
		}
		genus := parts[0]
		speciesName := parts[1]

		url := fmt.Sprintf("https://api.iucnredlist.org/api/v4/taxa/scientific_name?genus_name=%s&species_name=%s", genus, speciesName)

		req, err := http.NewRequestWithContext(ctx, "GET", url, nil)
		if err != nil {
			fmt.Printf("skipping %s: failed to create request: %v\n", sp.ScientificName, err)
			writer.Write([]string{sp.ScientificName, ""})
			continue
		}
		req.Header.Set("Authorization", token)

		resp, err := client.Do(req)
		if err != nil {
			fmt.Printf("skipping %s: request failed: %v\n", sp.ScientificName, err)
			writer.Write([]string{sp.ScientificName, ""})
			continue
		}
		defer resp.Body.Close()

		if resp.StatusCode == http.StatusNotFound {
			fmt.Printf("skipping %s: not found in IUCN\n", sp.ScientificName)
			writer.Write([]string{sp.ScientificName, ""})
			continue
		}

		if resp.StatusCode != http.StatusOK {
			fmt.Printf("skipping %s: unexpected status %d\n", sp.ScientificName, resp.StatusCode)
			writer.Write([]string{sp.ScientificName, ""})
			continue
		}

		var iucnResp IUCNResponse
		if err := json.NewDecoder(resp.Body).Decode(&iucnResp); err != nil {
			fmt.Printf("skipping %s: failed to decode response: %v\n", sp.ScientificName, err)
			writer.Write([]string{sp.ScientificName, ""})
			continue
		}

		status := ""
		for _, assessment := range iucnResp.Assessments {
			if assessment.Latest {
				status = assessment.RedListCategoryCode
				break
			}
		}

		fmt.Printf("fetched %s: %s\n", sp.ScientificName, status)
		writer.Write([]string{sp.ScientificName, status})
		time.Sleep(500*time.Millisecond)
	}
	return nil
}
