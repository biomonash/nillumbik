package stats

import (
	"github.com/biomonash/nillumbik/internal/db"
)

type Controller struct {
	q db.Querier
}

func NewController(queries db.Querier) *Controller {
	return &Controller{
		q: queries,
	}
}
