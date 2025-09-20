package stats

import (
	"net/http"

	"github.com/biomonash/nillumbik/internal/db"
	"github.com/gin-gonic/gin"
)

// --- Helpers ---

// --- Structs ---

type SpeciesOverviewRequest struct {
	TimePeriodRequest
}

type SpeciesOverviewResponse struct {
	TotalCount      int64             `json:"total_count"`
	NativeCount     int64             `json:"native_count"`
	CountByCategory map[db.Taxa]int64 `json:"count_by_category"`
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
}

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
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to count distinct species",
			"details": err.Error()})
		return
	}

	// Active monitoring sites
	activeSites, err := u.q.CountActiveMonitoringSites(ctx)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to count active sites", "details": err.Error()})
		return
	}

	// Detection events
	detectionEvents, err := u.q.CountDetectionEvents(ctx)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to count detection events", "details": err.Error()})
		return
	}

	// Native species percent
	nativeSpecies, err := u.q.CountDistinctNativeSpeciesObserved(ctx)
	if err != nil || totalSpecies == 0 {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to count native species", "details": err.Error()})
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
}
