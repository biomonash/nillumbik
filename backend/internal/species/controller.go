package species

import (
	"strconv"

	"github.com/gin-gonic/gin"
	"github.com/lancatlin/nillumbik/internal/db"
)

type Controller struct {
	q db.Querier
}

func NewController(queries db.Querier) *Controller {
	return &Controller{
		q: queries,
	}
}

// ListSpecies godoc
//
//	@Summary		List species
//	@Description	list all species
//	@Tags			species
//	@Accept			json
//	@Produce		json
//	@Success		200	{object}	[]db.Species
//	@Router			/species [get]
func (u *Controller) ListSpecies(c *gin.Context) {
	species, err := u.q.ListSpecies(c.Request.Context())
	if err != nil {
		c.AbortWithError(500, err)
		return
	}
	c.JSON(200, species)
}

// GetSpeciesByID godoc
//
//	@Summary		Get species detail
//	@Description	Get species detail
//	@Tags			species
//	@Param			id	path	int	true	"id of the species"
//	@Accept			json
//	@Produce		json
//	@Success		200	{object}	db.Species
//	@Router			/species/{id} [get]
func (u *Controller) GetSpeciesByID(c *gin.Context) {
	idStr := c.Param("id")
	id, err := strconv.Atoi(idStr)
	if err != nil {
		c.AbortWithStatusJSON(400, gin.H{"message": "invalid id"})
	}
	species, err := u.q.GetSpecies(c.Request.Context(), int64(id))
	if err != nil {
		c.JSON(400, gin.H{"message": "Species not found"})
		return
	}

	c.JSON(200, species)
}
