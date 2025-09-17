package observation

import (
	"log"
	"strconv"

	"github.com/biomonash/nillumbik/internal/db"
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
	Limit  int32 `form:"limit,required"`
	Offset int32 `form:"offset,required"`
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
//	@Router			/observations [get]
func (u *Controller) ListObservations(c *gin.Context) {
	var params ListObservationsRequest
	err := c.BindQuery(&params)
	if err != nil {
		c.AbortWithError(400, err)
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
	log.Println(obs, err, params)
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
		c.AbortWithStatusJSON(400, gin.H{"message": "invalid id"})
	}
	ob, err := u.q.GetObservation(c.Request.Context(), int64(id))
	if err != nil {
		c.JSON(400, gin.H{"message": "Species not found"})
		return
	}

	c.JSON(200, ob)
}
