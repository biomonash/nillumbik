package assets

import (
	"embed"
	"net/http"

	"github.com/gin-gonic/gin"
)

//go:embed dist
var FS embed.FS

var basePath = "dist"
var defaultPath = "dist/" // cannot include index.html, enforced by http.FS

func Serve(c *gin.Context) {
	if c.Request.Method != http.MethodGet {
		return
	}

	requestedPath := basePath + c.Request.URL.Path
	if _, err := FS.Open(requestedPath); err == nil {
		c.FileFromFS(requestedPath, http.FS(FS))
	} else {
		// Serve index.html for SPA routing
		c.FileFromFS(defaultPath, http.FS(FS))
	}
}
