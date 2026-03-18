package species

import (
	"errors"
	"fmt"
	"strconv"

	"time"

	"github.com/biomonash/nillumbik/internal/db"
	"github.com/biomonash/nillumbik/internal/utils"
	"github.com/gin-gonic/gin"
	"github.com/jackc/pgx/v5"
)

// ObservedSpecies represents species with observation count
type ObservedSpecies struct {
	ID               int64  `json:"id"`
	ScientificName   string `json:"scientific_name"`
	CommonName       string `json:"common_name"`
	ObservationCount int64  `json:"observation_count"`
}

// ObservedSpeciesResponse wraps the result with total count
type ObservedSpeciesResponse struct {
	Total   int               `json:"total"`
	Species []ObservedSpecies `json:"species"`
}

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

// GetObservedSpecies godoc
//
//	@Summary		List observed species
//	@Description	List species observed within a date range, optionally filtered by site
//	@Tags			species
//	@Param			siteCode	query	string	false	"Site code"
//	@Param			from		query	string	true	"Start timestamp (RFC3339 format)"
//	@Param			to			query	string	true	"End timestamp (RFC3339 format)"
//	@Accept			json
//	@Produce		json
//	@Success		200	{object}	ObservedSpeciesResponse
//	@Router			/species/observed [get]
func (u *Controller) GetObservedSpecies(c *gin.Context) {

	//Get query parameters
	siteCode := c.Query("siteCode")
	fromStr := c.Query("from")
	toStr := c.Query("to")

	//Validate required parameters
	if fromStr == "" || toStr == "" {
		c.Error(utils.NewHttpError(400, "from and to are required query parameters", nil))
		return
	}

	//Parse timestamps (RFC3339 format expected)
	fromTime, err := time.Parse("2006-01-02", fromStr)
	if err != nil {
		c.Error(utils.NewHttpError(400, "invalid from timestamp format", err))
		return
	}

	toTime, err := time.Parse("2006-01-02", toStr)
	if err != nil {
		c.Error(utils.NewHttpError(400, "invalid to timestamp format", err))
		return
	}

	//Call DB query
	rows, err := u.q.ListObservedSpecies(c.Request.Context(), db.ListObservedSpeciesParams{
		FromTime: fromTime,
		ToTime:   toTime,
		SiteCode: siteCode, // empty string means no filtering
	})
	if err != nil {
		c.Error(fmt.Errorf("failed to list observed species: %w", err))
		return
	}

	//Transform result
	result := make([]ObservedSpecies, 0, len(rows))
	for _, r := range rows {
		result = append(result, ObservedSpecies{
			ID:               r.ID,
			ScientificName:   r.ScientificName,
			CommonName:       r.CommonName,
			ObservationCount: r.ObservationCount,
		})
	}

	// Return response
	c.JSON(200, ObservedSpeciesResponse{
		Total:   len(result),
		Species: result,
	})
}
