package stats

import (
	"fmt"
	"net/http"

	"github.com/biomonash/nillumbik/internal/db"
	"github.com/biomonash/nillumbik/internal/utils"
	"github.com/gin-gonic/gin"
)

type ObservationBySitesRequest struct {
	ObservationStatsInput
}

type ObservationBySitesResponse struct {
	Sites []SiteResponse `json:"sites"`
}

type SiteResponse struct {
	SiteCode string `json:"site_code"`
	ObservationStats
}

type ObservationByBlocksRequest struct {
	ObservationStatsInput
}

type ObservationByBlocksResponse struct {
	Blocks []BlockResponse `json:"blocks"`
}

type BlockResponse struct {
	Block int32 `json:"block"`
	ObservationStats
}

// ObservationBySites godoc
//
//	@Summary		Observation stats group by sites
//	@Description	Observation stats group by sites
//	@Tags			statistics
//	@Accept			json
//	@Produce		json
//	@Param			from		query		string	False	"Search start from"	format(date)
//	@Param			to			query		string	False	"Search start from"	format(date)
//	@Param			block		query		integer	False	"Filter by site block"
//	@Param			site_code	query		string	False	"Filter by site code"
//	@Param			taxa		query		string	False	"Filter by taxa"
//	@Param			common_name	query		string	False	"Filter by species common_name"
//	@Success		200			{object}	ObservationBySitesResponse
//	@Error			400 														{object}	gin.H
//	@Router			/stats/observations/sites [get]
func (u *Controller) ObservationBySites(c *gin.Context) {
	var req ObservationBySitesRequest
	if err := c.ShouldBindQuery(&req); err != nil {
		c.Error(utils.NewHttpError(http.StatusBadRequest, "Invalid query parameters", err))
		return
	}
	ctx := c.Request.Context()

	// Parse common input parameters
	from, to, taxa, commonName := parseObservationStatsInput(req.ObservationStatsInput)

	params := db.ObservationGroupBySitesParams{
		From:       from,
		To:         to,
		Block:      req.Block,
		SiteCode:   req.SiteCode,
		Taxa:       taxa,
		CommonName: commonName,
	}
	rows, err := u.q.ObservationGroupBySites(ctx, params)
	if err != nil {
		c.Error(fmt.Errorf("Failed to fetch observations by sites: %w", err))
		return
	}

	convertSite := func(row db.ObservationGroupBySitesRow) SiteResponse {
		return SiteResponse{
			SiteCode: row.SiteCode,
			ObservationStats: ObservationStats{
				ObservationCount: row.ObservationCount,
				SpeciesCount:     row.SpeciesCount,
			},
		}
	}

	resp := ObservationBySitesResponse{
		Sites: utils.MapSlice(convertSite, rows),
	}
	c.JSON(http.StatusOK, resp)
}

// ObservationByBlocks godoc
//
//	@Summary		Observation stats group by blocks
//	@Description	Observation stats group by blocks
//	@Tags			statistics
//	@Accept			json
//	@Produce		json
//	@Param			from		query		string	False	"Search start from"	format(date)
//	@Param			to			query		string	False	"Search start from"	format(date)
//	@Param			block		query		integer	False	"Filter by site block"
//	@Param			site_code	query		string	False	"Filter by site code"
//	@Param			taxa		query		string	False	"Filter by taxa"
//	@Param			common_name	query		string	False	"Filter by species common_name"
//	@Success		200			{object}	ObservationByBlocksResponse
//	@Error			400 														{object}	gin.H
//	@Router			/stats/observations/blocks [get]
func (u *Controller) ObservationByBlocks(c *gin.Context) {
	var req ObservationBySitesRequest
	if err := c.ShouldBindQuery(&req); err != nil {
		c.Error(utils.NewHttpError(http.StatusBadRequest, "Invalid query parameters", err))
		return
	}
	ctx := c.Request.Context()

	// Parse common input parameters
	from, to, taxa, commonName := parseObservationStatsInput(req.ObservationStatsInput)

	params := db.ObservationGroupByBlocksParams{
		From:       from,
		To:         to,
		Block:      req.Block,
		SiteCode:   req.SiteCode,
		Taxa:       taxa,
		CommonName: commonName,
	}
	rows, err := u.q.ObservationGroupByBlocks(ctx, params)
	if err != nil {
		c.Error(fmt.Errorf("Failed to fetch observations by blocks: %w", err))
		return
	}
	convertBlock := func(row db.ObservationGroupByBlocksRow) BlockResponse {
		return BlockResponse{
			Block: row.Block,
			ObservationStats: ObservationStats{
				ObservationCount: row.ObservationCount,
				SpeciesCount:     row.SpeciesCount,
			},
		}
	}

	resp := ObservationByBlocksResponse{
		Blocks: utils.MapSlice(convertBlock, rows),
	}
	c.JSON(http.StatusOK, resp)
}
