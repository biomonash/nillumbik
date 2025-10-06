package stats

import (
	"fmt"
	"net/http"

	"github.com/biomonash/nillumbik/internal/db"
	"github.com/biomonash/nillumbik/internal/utils"
	"github.com/gin-gonic/gin"
)

type DashboardStatsRequest struct {
	TimePeriodRequest
}

type DashboardStatsResponse struct {
	ObservationStats
	NativeCount int64 `json:"nativeSpeciesCount"`
	SitesCount  int64 `json:"sitesCount"`
}

// DashboardStats godoc
//
//	@Summary		Dashboard stats
//	@Description	Dashboard stats
//	@Tags			statistics
//	@Accept			json
//	@Produce		json
//	@Param			from	query		string	False	"Search start from"	format(date)
//	@Param			to		query		string	False	"Search start from"	format(date)
//	@Success		200		{object}	DashboardStatsResponse
//	@Error			400 																															{object}	gin.H
//	@Router			/stats/dashboard [get]
func (u *Controller) DashboardStats(c *gin.Context) {
	var req DashboardStatsRequest
	if err := c.ShouldBindQuery(&req); err != nil {
		c.Error(utils.NewHttpError(http.StatusBadRequest, "failed to parse input", err))
		return
	}
	ctx := c.Request.Context()

	var resp DashboardStatsResponse

	// Use from/to for filtering

	from := utils.ToPgTimestamp(req.From)
	to := utils.ToPgTimestamp(req.To)

	paramsNative := db.CountSpeciesByNativeParams{
		From: from,
		To:   to,
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

	resp.SitesCount, err = u.q.CountActiveSites(ctx, db.CountActiveSitesParams{From: from, To: to})
	if err != nil {
		c.Error(fmt.Errorf("Failed to count active sites: %w", err))
		return
	}

	c.JSON(http.StatusOK, resp)
}
