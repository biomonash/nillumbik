package upload

import (
	"fmt"
	"net/http"
	"os"
	"path/filepath"

	"github.com/biomonash/forestportal/internal/db"
	"github.com/biomonash/forestportal/internal/importer"
	"github.com/gin-gonic/gin"
)

type Controller struct {
	q db.Querier
}

func NewController(q db.Querier) *Controller {
	return &Controller{q: q}
}

// UploadCSV godoc
//
//	@Summary		Upload CSV file
//	@Description	Upload a CSV file to import observations
//	@Tags			manager
//	@Param			file	formData	file	true	"CSV file to upload"
//	@Accept			multipart/form-data
//	@Success		200	{object}	gin.H
//	@Router			/manager/upload [post]
func (u *Controller) UploadCSV(c *gin.Context) {
	file, err := c.FormFile("file")
	if err != nil {
		c.Error(fmt.Errorf("failed to get file: %w", err))
		return
	}

	if filepath.Ext(file.Filename) != ".csv" {
		c.JSON(http.StatusBadRequest, gin.H{
			"message": "only CSV files are allowed",
		})
		return
	}

	tmpPath := filepath.Join(os.TempDir(), file.Filename)
	if err := c.SaveUploadedFile(file, tmpPath); err != nil {
		c.Error(fmt.Errorf("failed to save file: %w", err))
		return
	}
	defer os.Remove(tmpPath)

	if err := importer.ImportCSV(c.Request.Context(), u.q.(*db.Queries), tmpPath); err != nil {
		c.Error(fmt.Errorf("failed to import CSV: %w", err))
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "CSV imported successfully",
	})
}