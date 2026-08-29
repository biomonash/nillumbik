package server

import (
	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"github.com/jackc/pgx/v5/pgxpool"
)

type Server struct {
	router *gin.Engine
	db *pgxpool.Pool
}

func New(db *pgxpool.Pool) *Server {
	r := gin.New()

	r.Use(gin.Logger())
	r.Use(panicRecovery())
	r.Use(errorHandler())
	r.Use(cors.Default())

	api := r.Group("/api")
	_ = api

	return &Server{
		router: r,
		db: db,
	}
}

func (s *Server) Run(addr string) error {
	return s.router.Run(addr)
}