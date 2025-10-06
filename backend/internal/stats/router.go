package stats

import "github.com/gin-gonic/gin"

func Register(r gin.IRouter, ctl *Controller) {
	g := r.Group("/stats")
	g.GET("/observations", ctl.ObservationOverview)
	g.GET("/observations/timeseries", ctl.ObservationTimeSeries)
	g.GET("/observations/sites", ctl.ObservationBySites)
	g.GET("/observations/blocks", ctl.ObservationByBlocks)
	g.GET("/dashboard", ctl.DashboardStats)
}
