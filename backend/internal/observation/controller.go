package observation

import (
	"fmt"
	"strconv"

	"github.com/biomonash/nillumbik/internal/db"
	"github.com/biomonash/nillumbik/internal/utils"
	"github.com/gin-gonic/gin"
)

type Controller struct {
	q db.Querier
}

func NewController(queries db.Querier) *Controller {
	return &Controller{
		q: queries,
	}
}

type ListObservationsRequest struct {
	Limit  int32 `form:"limit" binding:"required,max=1000,min=1"`
	Offset int32 `form:"offset" binding:"min=0"`
}

type ListObservationsResponse struct {
	Count        int              `json:"count"`
	Observations []db.Observation `json:"observations"`
}

// ListObservations godoc
//
//	@Summary		List observations
//	@Description	List observations
//	@Tags			observation
//	@Accept			json
//	@Produce		json
//	@Param			limit	query		int	True	"Result limit"	default(100)
//	@Param			offset	query		int	True	"Result offset"	default(0)
//	@Success		200		{object}	ListObservationsResponse
//	@Error			400 	{object}	gin.H
//	@Router			/observations [get]
func (u *Controller) ListObservations(c *gin.Context) {
	var params ListObservationsRequest
	if err := c.ShouldBindQuery(&params); err != nil {
		utils.RespondError(c, 400, fmt.Errorf("Validation failed: %w", err))
		return
	}

	obs, err := u.q.ListObservations(c.Request.Context(), db.ListObservationsParams{
		Limit:  params.Limit,
		Offset: params.Offset,
	})
	if err != nil {
		c.AbortWithError(500, err)
		return
	}

	c.JSON(200, ListObservationsResponse{
		Count:        len(obs),
		Observations: obs,
	})
}

// GetObservationDetail godoc
//
//	@Summary		Get Observation Detail
//	@Description	Get the detail of an observation by ID
//	@Tags			observation
//	@Param			id	path	integer	True	"ID of the observation"
//	@Accept			json
//	@Produce		json
//	@Success		200	{object}	Observation
//	@Router			/observations/{id} [get]
func (u *Controller) GetObservationByID(c *gin.Context) {
	idStr := c.Param("id")
	id, err := strconv.Atoi(idStr)
	if err != nil {
		utils.RespondError(c, 400, fmt.Errorf("Invalid id: %w", err))
		return
	}
	ob, err := u.q.GetObservation(c.Request.Context(), int64(id))
	if err != nil {
		utils.RespondError(c, 404, fmt.Errorf("Observation not found"))
		return
	}

	c.JSON(200, ob)
}
