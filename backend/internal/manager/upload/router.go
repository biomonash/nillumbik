package upload

import "github.com/gin-gonic/gin"

func Register(r *gin.RouterGroup, ctl *Controller) {
	r.POST("/upload", ctl.UploadCSV)
}