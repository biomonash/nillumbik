package server

import (
	"fmt"
	"net/http"

	"github.com/gin-gonic/gin"
)

func errorHandler() gin.HandlerFunc {
	return func(c *gin.Context) {
		c.Next()

		if len(c.Errors) > 0 {
			err := c.Errors.Last().Err
			c.JSON(http.StatusInternalServerError, gin.H{
					"code":    http.StatusInternalServerError,
					"message": "internal server error",
					"detail":  err.Error(),
				})
		}
	}
}

func panicRecovery() gin.HandlerFunc {
	return func(c *gin.Context) {
		defer func() {
			if err := recover(); err != nil {
				fmt.Printf("Panic occurred: %v\n", err)

				c.JSON(500, gin.H{
					"code":    500,
					"message": "Internal Server Error",
					"detail":  fmt.Sprintf("%v", err),
				})
				c.Abort()
			}
		}()
		c.Next()
	}
}
