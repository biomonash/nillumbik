package species

import (
	"errors"
	"fmt"
	"strconv"

	"github.com/biomonash/nillumbik/internal/db"
	"github.com/biomonash/nillumbik/internal/utils"
	"github.com/gin-gonic/gin"
	"github.com/jackc/pgx/v5"
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
		c.Error(fmt.Errorf("failed to list species: %w", err))
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
		c.Error(utils.NewHttpError(400, "invalid id", err))
		return
	}
	species, err := u.q.GetSpecies(c.Request.Context(), int64(id))
	if errors.Is(pgx.ErrNoRows, err) {
		c.Error(utils.NewHttpError(404, "species not found", err))
		return
	}
	if err != nil {
		c.Error(fmt.Errorf("failed to get species by id: %w", err))
		return
	}

	c.JSON(200, species)
}

// GetSpeciesByCommonName godoc
//
//	@Summary		Get species detail by common name
//	@Description	Get species detail by common name. Case insensitive. Underscores will be replaced with spaces.
//	@Tags			species
//	@Param			name	path	string	true	"name of the species. Case insensitive."
//	@Accept			json
//	@Produce		json
//	@Success		200	{object}	db.Species
//	@Router			/species/by-common-name/{name} [get]
func (u *Controller) GetSpeciesByCommonName(c *gin.Context) {
	name := c.Param("name")
	cleanName := CleanName(name)
	species, err := u.q.GetSpeciesByCommonName(c.Request.Context(), cleanName)
	if errors.Is(pgx.ErrNoRows, err) {
		c.Error(utils.NewHttpError(404, "species not found", err))
		return
	}
	if err != nil {
		c.Error(fmt.Errorf("failed to get species by common name: %w", err))
		return
	}

	c.JSON(200, species)
}
