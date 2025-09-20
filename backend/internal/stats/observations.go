package stats

import (
	"fmt"
	"net/http"
	"time"

	"github.com/biomonash/nillumbik/internal/db"
	"github.com/biomonash/nillumbik/internal/utils"
	"github.com/gin-gonic/gin"
)

// --- Structs ---
type ObservationTimeSeriesRequest struct {
	TimePeriodRequest
}

type ObservationTimeSeriesResponse struct {
	Series []TimeSeriesPoint `json:"series"`
}
type TimeSeriesPoint struct {
	Timestamp string `json:"timestamp"`
	Value     int64  `json:"value"`
}

type ObservationOverviewRequest struct {
	TimePeriodRequest
}

type ObservationOverviewResponse struct {
	TotalSpeciesDetected  int64            `json:"total_species_detected"`
	ActiveMonitoringSites int64            `json:"active_monitoring_sites"`
	DetectionEvents       int64            `json:"detection_events"`
	NativeSpeciesPercent  float64          `json:"native_species_percent"`
	CountByCategory       map[string]int64 `json:"count_by_category"`
}

// ObservationOverview godoc
//
//	@Summary		Observation overview
//	@Description	Observation overview
//	@Tags			statistics
//	@Accept			json
//	@Produce		json
//	@Param			from	query		string	False	"Search start from"	format(date)
//	@Param			to		query		string	False	"Search start from"	format(date)
//	@Success		200		{object}	ObservationOverviewResponse
//	@Error			400 	{object}	gin.H
//	@Router			/stats/observations [get]
func (u *Controller) ObservationOverview(c *gin.Context) {
	var req ObservationOverviewRequest
	if err := c.ShouldBindQuery(&req); err != nil {
		utils.RespondError(c, http.StatusBadRequest, fmt.Errorf("failed to parse input: %w", err))
		return
	}
	ctx := c.Request.Context()

	// Use from/to for filtering
	from := utils.ToPgTimestamp(req.From)
	to := utils.ToPgTimestamp(req.To)

	// Example: filter observations by date range
	paramsDistinct := db.CountDistinctSpeciesObservedInPeriodParams{
		From: from,
		To:   to,
	}
	totalCount, err := u.q.CountDistinctSpeciesObservedInPeriod(ctx, paramsDistinct)
	if err != nil {
		c.AbortWithError(http.StatusInternalServerError, fmt.Errorf("Failed to count distinct species: %w", err))
		return
	}

	paramsNative := db.CountDistinctNativeSpeciesObservedInPeriodParams{
		From: from,
		To:   to,
	}
	nativeCount, err := u.q.CountDistinctNativeSpeciesObservedInPeriod(ctx, paramsNative)
	if err != nil {
		c.AbortWithError(http.StatusInternalServerError, fmt.Errorf("Failed to count native species: %w", err))
		return
	}

	params := db.ListSpeciesCountByTaxaInPeriodParams{
		From: from,
		To:   to,
	}
	countByCategoryRows, err := u.q.ListSpeciesCountByTaxaInPeriod(ctx, params)
	if err != nil {
		c.AbortWithError(http.StatusInternalServerError, fmt.Errorf("Failed to count species by category: %w", err))
		return
	}
	countByCategory := map[db.Taxa]int64{}
	for _, row := range countByCategoryRows {
		countByCategory[row.Taxa] = row.Count
	}

	resp := SpeciesOverviewResponse{
		TotalCount:      totalCount,
		NativeCount:     nativeCount,
		CountByCategory: countByCategory,
	}
	c.JSON(http.StatusOK, resp)
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
	var req ObservationTimeSeriesRequest
	if err := c.ShouldBindQuery(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid query parameters"})
		return
	}
	ctx := c.Request.Context()

	// Use req.From and req.To to filter your SQL query
	params := db.ObservationTimeSeriesParams{
		From: utils.ToPgTimestamp(req.From),
		To:   utils.ToPgTimestamp(req.To),
	}
	rows, err := u.q.ObservationTimeSeries(ctx, params)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch time series",
			"details": err.Error()})
		return
	}
	series := make([]TimeSeriesPoint, 0, len(rows))
	for _, row := range rows {
		series = append(series, TimeSeriesPoint{
			Timestamp: row.Month.Format(time.RFC3339),
			Value:     row.Count,
		})
	}
	resp := ObservationTimeSeriesResponse{Series: series}
	c.JSON(http.StatusOK, resp)
}
