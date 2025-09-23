package server

import (
	"fmt"
	"net/http"

	"github.com/biomonash/nillumbik/internal/utils"
	"github.com/gin-gonic/gin"
)

func errorHandler() gin.HandlerFunc {
	return func(c *gin.Context) {
		c.Next()

		if len(c.Errors) > 0 {
			err := c.Errors.Last().Err
			switch e := err.(type) {
			case utils.HttpError:
				c.AbortWithStatusJSON(e.Code, e)
			default:
				c.JSON(http.StatusInternalServerError, gin.H{
					"code":    http.StatusInternalServerError,
					"message": "internal server error",
					"detail":  err.Error(),
				})
			}
		}
	}
}

// Reference: https://leapcell.medium.com/robust-error-handling-in-go-web-projects-with-gin-58eba3b06e6e
func panicRecovery() gin.HandlerFunc {
	return func(c *gin.Context) {
		defer func() {
			if err := recover(); err != nil {
				// Log the error
				fmt.Printf("Panic occurred: %v\n", err)

				// Return a unified error response
				c.JSON(500, gin.H{
					"code":    500,
					"message": "Internal Server Error",
					"detail":  fmt.Sprintf("%v", err),
				})
				c.Abort() // Stop further execution
			}
		}()
		c.Next()
	}
}
