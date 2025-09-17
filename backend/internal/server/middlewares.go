package server

import "github.com/gin-gonic/gin"

func errorHandler() gin.HandlerFunc {
	return func(c *gin.Context) {
		c.Next()

		if len(c.Errors) > 0 {
			err := c.Errors.Last().Err
			c.JSON(c.Writer.Status(), gin.H{"message": err.Error()})
		}
	}
}
