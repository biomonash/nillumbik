package statistics

import "github.com/gin-gonic/gin"

func Register(r gin.IRouter, ctl *Controller) {
	g := r.Group("/statistics")
	g.GET("/species", ctl.SpeciesOverview)
}
