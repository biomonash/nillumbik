package site

import (
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

// ListSites godoc
//
//	@Summary		List sites
//	@Description	List sites
//	@Tags			site
//	@Accept			json
//	@Produce		json
//	@Success		200	{object}	[]db.Site
//	@Router			/sites [get]
func (u *Controller) ListSites(c *gin.Context) {
	sites, err := u.q.ListSites(c.Request.Context())
	if err != nil {
		c.AbortWithError(500, err)
		return
	}
	c.JSON(200, sites)
}

// GetSiteDetail godoc
//
//	@Summary		Get Site Detail
//	@Description	Get the detail of a site by ID
//	@Tags			site
//	@Param			code	path	string	True	"Code of the site"
//	@Accept			json
//	@Produce		json
//	@Success		200	{object}	db.Site
//	@Router			/sites/{code} [get]
func (u *Controller) GetSiteByCode(c *gin.Context) {
	code := c.Param("code")
	site, err := u.q.GetSiteByCode(c.Request.Context(), code)
	if err != nil {
		c.JSON(400, gin.H{"message": "Author not found"})
		return
	}

	c.JSON(200, site)
}
