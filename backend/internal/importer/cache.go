package importer

import (
	"context"
	"fmt"

	"github.com/biomonash/nillumbik/internal/db"
)

type ImporterCache struct {
	q       db.Querier
	sites   map[string]db.Site
	species map[string]db.Species
}

func NewCache(q db.Querier) *ImporterCache {
	return &ImporterCache{
		q:       q,
		sites:   make(map[string]db.Site),
		species: make(map[string]db.Species),
	}
}

func (c *ImporterCache) GetSite(ctx context.Context, code string) (db.Site, error) {
	site, ok := c.sites[code]
	if ok {
		return site, nil
	}

	site, err := c.q.GetSiteByCode(ctx, code)
	if err != nil {
		return db.Site{}, fmt.Errorf("failed to get site by code: %w", err)
	}
	c.sites[code] = site
	return site, nil
}

func (c *ImporterCache) AddSite(site db.Site) {
	c.sites[site.Code] = site
}

func (c *ImporterCache) GetSpecies(ctx context.Context, sciName string) (db.Species, error) {
	species, ok := c.species[sciName]
	if ok {
		return species, nil
	}

	species, err := c.q.GetSpeciesByScientificName(ctx, sciName)
	if err != nil {
		return db.Species{}, fmt.Errorf("failed to get species by scientific name: %w", err)
	}
	c.species[sciName] = species
	return species, nil
}
