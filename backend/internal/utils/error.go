package utils

import "github.com/gin-gonic/gin"

// Should only be used for client errors (4xx)
// Use c.AbortWithError for server side errors
func RespondError(c *gin.Context, code int, err error) {
	c.AbortWithStatusJSON(code, gin.H{
		"message": err.Error(),
	})
}
