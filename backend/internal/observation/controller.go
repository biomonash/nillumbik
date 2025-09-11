package observation

import (
	"strconv"

	"github.com/gin-gonic/gin"
	"github.com/biomonash/nillumbik/internal/db"
)

type Controller struct {
	q db.Querier
}

func NewController(queries db.Querier) *Controller {
	return &Controller{
		q: queries,
	}
}

// ListObservations godoc
//
//	@Summary		List observations
//	@Description	List observations
//	@Tags			observation
//	@Accept			json
//	@Produce		json
//	@Success		200	{object}	[]Observation
//	@Router			/observations [get]
func (u *Controller) ListObservations(c *gin.Context) {
	obs, err := u.q.ListObservations(c.Request.Context())
	if err != nil {
		c.AbortWithError(500, err)
		return
	}
	c.JSON(200, obs)
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
