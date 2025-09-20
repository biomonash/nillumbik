package stats

import (
	"fmt"
	"net/http"
	"time"

	"github.com/biomonash/nillumbik/internal/db"
	"github.com/gin-gonic/gin"
)

type TimeSeriesPoint struct {
	Timestamp string `json:"timestamp"`
	Value     int64  `json:"value"`
}

type ObservationOverviewRequest struct {
	From *string `form:"from"`
	To   *string `form:"to"`
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
//	@Success		200		{object}	ObservationOverviewResponse
//	@Error			400 	{object}	gin.H
//	@Router			/stats/observations [get]
func (u *Controller) ObservationOverview(c *gin.Context) {
	var req SpeciesOverviewRequest
	if err := c.ShouldBindQuery(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid query parameters"})
		return
	}
	ctx := c.Request.Context()

	// Use from/to for filtering
	from := req.From
	to := req.To

	// Example: filter observations by date range
	paramsDistinct := db.CountDistinctSpeciesObservedInPeriodParams{
		Column1: toPgTimestamptz(from),
		Column2: toPgTimestamptz(to),
	}
	totalCount, err := u.q.CountDistinctSpeciesObservedInPeriod(ctx, paramsDistinct)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to count distinct species",
			"details": err.Error()})
		return
	}

	paramsNative := db.CountDistinctNativeSpeciesObservedInPeriodParams{
		Column1: toPgTimestamptz(from),
		Column2: toPgTimestamptz(to),
	}
	nativeCount, err := u.q.CountDistinctNativeSpeciesObservedInPeriod(ctx, paramsNative)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to count native species",
			"details": err.Error()})
		return
	}

	params := db.ListSpeciesCountByTaxaInPeriodParams{
		Column1: toPgTimestamptz(from),
		Column2: toPgTimestamptz(to),
	}
	countByCategoryRows, err := u.q.ListSpeciesCountByTaxaInPeriod(ctx, params)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to count species by category",
			"details": err.Error()})
		return
	}
	countByCategory := map[string]int64{}
	for _, row := range countByCategoryRows {
		countByCategory[fmt.Sprintf("%v", row.Taxa)] = row.Count
	}

	resp := SpeciesOverviewResponse{
		TotalCount:      totalCount,
		NativeCount:     nativeCount,
		CountByCategory: countByCategory,
	}
	c.JSON(http.StatusOK, resp)
}

type ObservationTimeSeriesRequest struct {
	From *time.Time `form:"from" time_format:"2006-01-02T15:04:05Z07:00"`
	To   *time.Time `form:"to"   time_format:"2006-01-02T15:04:05Z07:00"`
}

type ObservationTimeSeriesResponse struct {
	Series []TimeSeriesPoint `json:"series"`
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
		Column1: toPgTimestamptz(req.From),
		Column2: toPgTimestamptz(req.To),
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
