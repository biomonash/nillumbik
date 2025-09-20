package stats

import "github.com/gin-gonic/gin"

func Register(r gin.IRouter, ctl *Controller) {
	g := r.Group("/stats")
	g.GET("/species", ctl.SpeciesOverview)
	g.GET("/species/timeseries", ctl.SpeciesTimeSeries)
	g.GET("/species/stats", ctl.SpeciesStats)
	g.GET("/observations", ctl.ObservationOverview)
	g.GET("/observations/timeseries", ctl.ObservationTimeSeries)
}
