package site

import (
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

func (u *Controller) ListSites(c *gin.Context) {
	sites, err := u.q.ListSites(c.Request.Context())
	if err != nil {
		c.AbortWithError(500, err)
		return
	}
	c.JSON(200, sites)
}

func (u *Controller) GetSiteByID(c *gin.Context) {
	code := c.Param("code")
	site, err := u.q.GetSiteByCode(c.Request.Context(), code)
	if err != nil {
		c.JSON(400, gin.H{"message": "Author not found"})
		return
	}

	c.JSON(200, site)
}
