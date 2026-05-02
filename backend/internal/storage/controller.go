package storage

import (
	"fmt"
	"path/filepath"

	"github.com/aws/aws-sdk-go-v2/aws"
	"github.com/aws/aws-sdk-go-v2/service/s3"
	"github.com/biomonash/nillumbik/internal/utils"
	"github.com/gin-gonic/gin"
)

type Controller struct {
	s3     *s3.Client
	bucket string
}

func NewController(s3Client *s3.Client, bucket string) *Controller {
	return &Controller{
		s3:     s3Client,
		bucket: bucket,
	}
}

// UploadFile godoc
//
//	@Summary		Upload a file
//	@Description	Upload a file to object storage
//	@Tags			storage
//	@Accept			multipart/form-data
//	@Produce		json
//	@Param			file	formData	file	true	"File to upload"
//	@Success		200		{object}	map[string]string
//	@Failure		400		{object}	map[string]string
//	@Router			/storage/upload [post]
func (ctl *Controller) UploadFile(c *gin.Context) {
	file, err := c.FormFile("file")
	if err != nil {
		c.Error(utils.NewHttpError(400, "file is required", err))
		return
	}

	src, err := file.Open()
	if err != nil {
		c.Error(fmt.Errorf("failed to open file: %w", err))
		return
	}
	defer src.Close()

	key := filepath.Base(file.Filename)

	_, err = ctl.s3.PutObject(c.Request.Context(), &s3.PutObjectInput{
		Bucket:        aws.String(ctl.bucket),
		Key:           aws.String(key),
		Body:          src,
		ContentLength: aws.Int64(file.Size),
	})
	if err != nil {
		c.Error(fmt.Errorf("failed to upload file: %w", err))
		return
	}

	c.JSON(200, gin.H{
		"key":     key,
		"message": "file uploaded successfully",
	})
}

// GetFile godoc
//
//	@Summary		Get a file
//	@Description	Get a file from object storage by key
//	@Tags			storage
//	@Param			key	path	string	true	"File key"
//	@Produce		octet-stream
//	@Success		200
//	@Failure		404		{object}	map[string]string
//	@Router			/storage/{key} [get]
func (ctl *Controller) GetFile(c *gin.Context) {
	key := c.Param("key")

	result, err := ctl.s3.GetObject(c.Request.Context(), &s3.GetObjectInput{
		Bucket: aws.String(ctl.bucket),
		Key:    aws.String(key),
	})
	if err != nil {
		c.Error(fmt.Errorf("failed to get file: %w", err))
		return
	}
	defer result.Body.Close()

	c.DataFromReader(200, *result.ContentLength, "application/octet-stream", result.Body, nil)
}