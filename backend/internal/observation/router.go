package observation

import "github.com/gin-gonic/gin"

func Register(r gin.IRouter, ctl *Controller) {
	g := r.Group("/observations")
	g.GET("", ctl.ListObservations)
	g.GET("/:id", ctl.GetObservationByID)
}
