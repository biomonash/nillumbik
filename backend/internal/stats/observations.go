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

type ObservationOverviewRequest struct {
	ObservationStatsInput
}

type ObservationOverviewResponse struct {
	ObservationStats
	NativeCount int64             `json:"nativeSpeciesCount"`
	CountByTaxa map[db.Taxa]int64 `json:"countByTaxa"`
}

type ObservationTimeSeriesRequest struct {
	ObservationStatsInput
}

type ObservationTimeSeriesResponse struct {
	Series map[string][]TimeSeriesPoint `json:"series"`
}

// ObservationOverview godoc
//
//	@Summary		Observation overview
//	@Description	Observation overview
//	@Tags			statistics
//	@Accept			json
//	@Produce		json
//	@Param			from		query		string	False	"Search start from"	format(date)
//	@Param			to			query		string	False	"Search start from"	format(date)
//	@Param			block		query		integer	False	"Filter by site block"
//	@Param			siteCode	query		string	False	"Filter by site code"
//	@Param			taxa		query		string	False	"Filter by taxa"
//	@Param			commonName	query		string	False	"Filter by species common_name"
//	@Success		200			{object}	ObservationOverviewResponse
//	@Error			400 																																{object}	gin.H
//	@Router			/stats/observations [get]
func (u *Controller) ObservationOverview(c *gin.Context) {
	var req ObservationOverviewRequest
	if err := c.ShouldBindQuery(&req); err != nil {
		c.Error(utils.NewHttpError(http.StatusBadRequest, "failed to parse input", err))
		return
	}
	ctx := c.Request.Context()

	var resp ObservationOverviewResponse

	// Use from/to for filtering

	from, to, taxa, commonName := parseObservationStatsInput(req.ObservationStatsInput)

	paramsNative := db.CountSpeciesByNativeParams{
		From:       from,
		To:         to,
		Block:      req.Block,
		SiteCode:   req.SiteCode,
		Taxa:       taxa,
		CommonName: commonName,
	}

	speciesGroups, err := u.q.CountSpeciesByNative(ctx, paramsNative)
	if err != nil {
		c.Error(fmt.Errorf("Failed to count native species: %w", err))
		return
	}
	for _, group := range speciesGroups {
		resp.ObservationCount += group.ObservationCount
		resp.SpeciesCount += group.SpeciesCount
		if group.IsNative {
			resp.NativeCount = group.SpeciesCount
		}
	}

	params := db.ListSpeciesCountByTaxaParams{
		From:       from,
		To:         to,
		Block:      req.Block,
		SiteCode:   req.SiteCode,
		Taxa:       taxa,
		CommonName: commonName,
	}
	countByCategoryRows, err := u.q.ListSpeciesCountByTaxa(ctx, params)
	if err != nil {
		c.Error(fmt.Errorf("Failed to count species by category: %w", err))
		return
	}
	resp.CountByTaxa = make(map[db.Taxa]int64)
	for _, row := range countByCategoryRows {
		resp.CountByTaxa[row.Taxa] = row.Count
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
//	@Param			from		query		string	False	"Search start from"	format(date)
//	@Param			to			query		string	False	"Search start from"	format(date)
//	@Param			block		query		integer	False	"Filter by site block"
//	@Param			siteCode	query		string	False	"Filter by site code"
//	@Param			taxa		query		string	False	"Filter by taxa"
//	@Param			commonName	query		string	False	"Filter by species common name"
//	@Success		200			{object}	ObservationTimeSeriesResponse
//	@Error			400 																							{object}	gin.H
//	@Router			/stats/observations/timeseries [get]
func (u *Controller) ObservationTimeSeries(c *gin.Context) {
	var req ObservationTimeSeriesRequest
	if err := c.ShouldBindQuery(&req); err != nil {
		c.Error(utils.NewHttpError(http.StatusBadRequest, "Invalid query parameters", err))
		return
	}
	ctx := c.Request.Context()

	// Parse common input parameters
	from, to, taxa, commonName := parseObservationStatsInput(req.ObservationStatsInput)

	params := db.ObservationTimeSeriesGroupByNativeParams{
		From:       from,
		To:         to,
		Block:      req.Block,
		SiteCode:   req.SiteCode,
		Taxa:       taxa,
		CommonName: commonName,
	}

	rows, err := u.q.ObservationTimeSeriesGroupByNative(ctx, params)
	if err != nil {
		c.Error(fmt.Errorf("Failed to fetch time series: %w", err))
		return
	}
	series := map[string][]TimeSeriesPoint{
		"native":     make([]TimeSeriesPoint, 0, len(rows)),
		"non-native": make([]TimeSeriesPoint, 0, len(rows)),
	}
	for _, row := range rows {
		key := "native"
		if !row.IsNative {
			key = "non-native"
		}
		series[key] = append(series[key], TimeSeriesPoint{
			Timestamp: row.Year.Format(time.RFC3339),
			ObservationStats: ObservationStats{
				SpeciesCount:     row.SpeciesCount,
				ObservationCount: row.ObservationCount,
			},
		})
	}
	resp := ObservationTimeSeriesResponse{Series: series}
	c.JSON(http.StatusOK, resp)
}
