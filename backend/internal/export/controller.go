package export

import (
	"github.com/biomonash/forestportal/internal/db"
)

type Controller struct {
	q db.Querier
}

func NewController(queries db.Querier) *Controller {
	return &Controller{
		q: queries,
	}
}
