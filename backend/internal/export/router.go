package export

import "github.com/gin-gonic/gin"

func Register(r gin.IRouter, ctl *Controller) {
	r.GET("/export", ctl.ExportCSV)
}
