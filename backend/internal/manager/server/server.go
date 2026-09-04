package server

import (
	"github.com/biomonash/forestportal/internal/db"
	"github.com/biomonash/forestportal/internal/manager/upload"
	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
)

type Server struct {
	router *gin.Engine
	q db.Querier
}

func New(q db.Querier) *Server {
	r := gin.New()

	r.Use(gin.Logger())
	r.Use(panicRecovery())
	r.Use(errorHandler())
	r.Use(cors.Default())

	api := r.Group("/api/manager")
	upload.Register(api, upload.NewController(q))

	return &Server{
		router: r,
		q: q,
	}
}

func (s *Server) Run(addr string) error {
	return s.router.Run(addr)
}