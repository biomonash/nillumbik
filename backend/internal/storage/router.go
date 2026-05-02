package storage

import "github.com/gin-gonic/gin"

func Register(r gin.IRouter, ctl *Controller) {
	g := r.Group("/storage")
	g.POST("/upload", ctl.UploadFile)
	g.GET("/:key", ctl.GetFile)
}