package statistics

import (
	"github.com/biomonash/nillumbik/internal/db"
	"github.com/gin-gonic/gin"
)

type Controller struct {
	q db.Querier
}

func NewController(queries db.Querier) *Controller {
	return &Controller{
		q: queries,
	}
}

type SpeciesOverviewRequest struct {
}

type SpeciesOverviewResponse struct {
}

// SpeciesOverview godoc
//
//	@Summary		Species overview
//	@Description	Species overview
//	@Tags			statistics
//	@Accept			json
//	@Produce		json
//	@Success		200		{object}	SpeciesOverviewResponse
//	@Error			400 	{object}	gin.H
//	@Router			/statistics/species [get]
func (u *Controller) SpeciesOverview(c *gin.Context) {
	c.JSON(200, gin.H{"message": "TBD"})
}
