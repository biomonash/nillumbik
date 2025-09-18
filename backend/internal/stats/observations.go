package stats

import "github.com/gin-gonic/gin"

type ObservationOverviewRequest struct {
}

type ObservationOverviewResponse struct {
}

// ObservationOverview godoc
//
//	@Summary		Observation overview
//	@Description	Observation overview
//	@Tags			statistics
//	@Accept			json
//	@Produce		json
//	@Success		200		{object}	ObservationOverviewResponse
//	@Error			400 	{object}	gin.H
//	@Router			/stats/observations [get]
func (u *Controller) ObservationOverview(c *gin.Context) {
	c.JSON(200, gin.H{"message": "TBD"})
}

type ObservationTimeSeriesRequest struct {
}

type ObservationTimeSeriesResponse struct {
}

// ObservationTimeSeries godoc
//
//	@Summary		Observation time series
//	@Description	Observation time series
//	@Tags			statistics
//	@Accept			json
//	@Produce		json
//	@Success		200		{object}	ObservationTimeSeriesResponse
//	@Error			400 	{object}	gin.H
//	@Router			/stats/observations/timeseries [get]
func (u *Controller) ObservationTimeSeries(c *gin.Context) {
	c.JSON(200, gin.H{"message": "TBD"})
}
