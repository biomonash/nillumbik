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

func (u *Controller) ListSpecies(c *gin.Context) {
	species, err := u.q.ListSpecies(c.Request.Context())
	if err != nil {
		c.AbortWithError(500, err)
		return
	}
	c.JSON(200, species)
}

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
