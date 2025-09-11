package species

import "github.com/gin-gonic/gin"

func Register(r gin.IRouter, ctl *Controller) {
	g := r.Group("/species")
	g.GET("", ctl.ListSpecies)
	g.GET("/by-common-name/:name", ctl.GetSpeciesByCommonName)
	g.GET("/:id", ctl.GetSpeciesByID)
}
