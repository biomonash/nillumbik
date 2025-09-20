package stats

import (
	"net/http"
	"time"

	"github.com/biomonash/nillumbik/internal/db"
	"github.com/gin-gonic/gin"
	"github.com/jackc/pgx/v5/pgtype"
)

// --- Helpers ---
func toPgTimestamptz(t *time.Time) pgtype.Timestamptz {
	var ts pgtype.Timestamptz
	if t != nil {
		ts.Time = *t
		ts.Valid = true
	} else {
		ts.Valid = false
	}
	return ts
}

// --- Structs ---

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

// SpeciesOverview godoc
//
// @Summary		Species overview
// @Description	Species overview
// @Tags			statistics
// @Accept			json
// @Produce		json
// @Success		200		{object}	SpeciesOverviewResponse
// @Error			400 	{object}	gin.H
// @Router			/stats/species/overview [get]
func (u *Controller) SpeciesOverview(c *gin.Context) {
	var req SpeciesOverviewRequest
	if err := c.ShouldBindQuery(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid query parameters"})
		return
	}
	ctx := c.Request.Context()

	// Total distinct species observed in period
	totalCount, err := u.q.CountDistinctSpeciesObservedInPeriod(ctx, db.CountDistinctSpeciesObservedInPeriodParams{
		Column1: toPgTimestamptz(req.From),
		Column2: toPgTimestamptz(req.To),
	})
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to count distinct species",
			"details": err.Error()})
		return
	}

	// Native species count in period
	nativeCount, err := u.q.CountDistinctNativeSpeciesObservedInPeriod(ctx, db.CountDistinctNativeSpeciesObservedInPeriodParams{
		Column1: toPgTimestamptz(req.From),
		Column2: toPgTimestamptz(req.To),
	})
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to count native species",
			"details": err.Error()})
		return
	}

	// Species count by category in period
	rows, err := u.q.ListSpeciesCountByTaxaInPeriod(ctx, db.ListSpeciesCountByTaxaInPeriodParams{
		Column1: toPgTimestamptz(req.From),
		Column2: toPgTimestamptz(req.To),
	})
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to count species by category", "details": err.Error()})
		return
	}
	countByCategory := map[string]int64{}
	for _, row := range rows {
		countByCategory[string(row.Taxa)] = row.Count
	}

	resp := SpeciesOverviewResponse{
		TotalCount:      totalCount,
		NativeCount:     nativeCount,
		CountByCategory: countByCategory,
	}
	c.JSON(http.StatusOK, resp)
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
	var req SpeciesOverviewRequest
	if err := c.ShouldBindQuery(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid query parameters", "details": err.Error()})
		return
	}
	ctx := c.Request.Context()

	rows, err := u.q.SpeciesObservationTimeSeries(ctx, db.SpeciesObservationTimeSeriesParams{
		Column1: toPgTimestamptz(req.From),
		Column2: toPgTimestamptz(req.To),
	})
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch time series", "details": err.Error()})
		return
	}
	series := make([]TimeSeriesPoint, 0, len(rows))
	for _, row := range rows {
		series = append(series, TimeSeriesPoint{
			Timestamp: row.Month.Format(time.RFC3339),
			Value:     row.Count,
		})
	}
	resp := SpeciesTimeSeriesResponse{Series: series}
	c.JSON(http.StatusOK, resp)
}
