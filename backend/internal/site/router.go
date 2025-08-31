package site

import "github.com/gin-gonic/gin"

func Register(r gin.IRouter, ctl *Controller) {
	g := r.Group("/sites")
	g.GET("", ctl.ListSites)
	g.GET("/:code", ctl.GetSiteByID)
}
