package stats

import "github.com/gin-gonic/gin"

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
//	@Router			/stats/species [get]
func (u *Controller) SpeciesOverview(c *gin.Context) {
	c.JSON(200, gin.H{"message": "TBD"})
}

type SpeciesTimeSeriesRequest struct {
}

type SpeciesTimeSeriesResponse struct {
}

// SpeciesTimeSeries godoc
//
//	@Summary		Species time series
//	@Description	Species time series
//	@Tags			statistics
//	@Accept			json
//	@Produce		json
//	@Success		200		{object}	SpeciesTimeSeriesResponse
//	@Error			400 	{object}	gin.H
//	@Router			/stats/species/timeseries [get]
func (u *Controller) SpeciesTimeSeries(c *gin.Context) {
	c.JSON(200, gin.H{"message": "TBD"})
}
