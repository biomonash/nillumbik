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
