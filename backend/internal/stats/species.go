package stats

import (
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
)

// --- Structs ---

type TimeSeriesPoint struct {
	Timestamp int64 `json:"timestamp"`
	Value     int   `json:"value"`
}

type SpeciesOverviewRequest struct {
	From *time.Time `form:"from" time_format:"2006-01-02T15:04:05Z07:00"`
	To   *time.Time `form:"to"   time_format:"2006-01-02T15:04:05Z07:00"`
}

type SpeciesOverviewResponse struct {
	TotalCount      int64            `json:"total_count"`
	NativeCount     int64            `json:"native_count"`
	CountByCategory map[string]int64 `json:"count_by_category"`
}

type SpeciesTimeSeriesResponse struct {
	Series []TimeSeriesPoint `json:"series"`
}

type SpeciesStatsResponse struct {
	TotalSpeciesDetected  int64   `json:"total_species_detected"`
	ActiveMonitoringSites int64   `json:"active_monitoring_sites"`
	DetectionEvents       int64   `json:"detection_events"`
	NativeSpeciesPercent  float64 `json:"native_species_percent"`
}

// --- Handlers ---

// SpeciesOverview godoc
// SpeciesStats godoc
//
//	@Summary		Species statistics
//	@Description	Species statistics
//	@Tags			statistics
//	@Accept			json
//	@Produce		json
//	@Success		200		{object}	SpeciesStatsResponse
//	@Error			400 	{object}	gin.H
//	@Router			/stats/species/stats [get]
func (u *Controller) SpeciesStats(c *gin.Context) {
	ctx := c.Request.Context()

	// Total distinct species observed
	totalSpecies, err := u.q.CountDistinctSpeciesObserved(ctx)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to count distinct species"})
		return
	}

	// Active monitoring sites
	activeSites, err := u.q.CountActiveMonitoringSites(ctx)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to count active sites"})
		return
	}

	// Detection events
	detectionEvents, err := u.q.CountDetectionEvents(ctx)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to count detection events"})
		return
	}

	// Native species percent
	nativeSpecies, err := u.q.CountDistinctNativeSpeciesObserved(ctx)
	if err != nil || totalSpecies == 0 {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to count native species"})
		return
	}
	nativePercent := float64(nativeSpecies) / float64(totalSpecies) * 100

	resp := SpeciesStatsResponse{
		TotalSpeciesDetected:  totalSpecies,
		ActiveMonitoringSites: activeSites,
		DetectionEvents:       detectionEvents,
		NativeSpeciesPercent:  nativePercent,
	}
	c.JSON(http.StatusOK, resp)
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
//	@Router			/stats/species/overview [get]
func (u *Controller) SpeciesOverview(c *gin.Context) {
	// Example response
	c.JSON(200, gin.H{"message": "Species overview endpoint"})
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
	// Example response
	c.JSON(200, gin.H{"message": "Species time series endpoint"})
}
