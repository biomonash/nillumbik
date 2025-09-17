package server

import (
	"github.com/biomonash/nillumbik/internal/db"
	"github.com/biomonash/nillumbik/internal/observation"
	"github.com/biomonash/nillumbik/internal/site"
	"github.com/biomonash/nillumbik/internal/species"
	"github.com/gin-gonic/gin"
	swaggerFiles "github.com/swaggo/files"
	ginSwagger "github.com/swaggo/gin-swagger"
)

type Server struct {
	router *gin.Engine
	q      db.Querier
}

//	@title			Nillubim Shire API
//	@version		1.0
//	@description	This is the backend API for Nillumbik Shire project.
//	@termsOfService	http://swagger.io/terms/

//	@contact.name	API Support
//	@contact.url	http://www.swagger.io/support
//	@contact.email	support@swagger.io

//	@license.name	Apache 2.0
//	@license.url	http://www.apache.org/licenses/LICENSE-2.0.html

//	@host		localhost:8000
//	@BasePath	/api/

//	@securityDefinitions.basic	BasicAuth

// @externalDocs.description	OpenAPI
// @externalDocs.url			https://swagger.io/resources/open-api/
func New(querier db.Querier) *Server {
	r := gin.Default()

	r.Use(errorHandler())

	api := r.Group("/api")

	site.Register(api, site.NewController(querier))

	species.Register(api, species.NewController(querier))

	observation.Register(api, observation.NewController(querier))

	r.GET("/swagger/*any", ginSwagger.WrapHandler(swaggerFiles.Handler))

	return &Server{
		router: r,
		q:      querier,
	}
}

func (s *Server) Run(addr string) error {
	return s.router.Run(addr)
}
