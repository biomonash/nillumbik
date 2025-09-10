package main

import (
	"context"
	"log"
	"os"

	"github.com/gin-gonic/gin"
	"github.com/jackc/pgx/v5"
	"github.com/joho/godotenv"
	swaggerFiles "github.com/swaggo/files"     // swagger embed files
	ginSwagger "github.com/swaggo/gin-swagger" // gin-swagger middleware

	_ "github.com/lancatlin/nillumbik/docs"
	"github.com/lancatlin/nillumbik/internal/db"
	"github.com/lancatlin/nillumbik/internal/observation"
	"github.com/lancatlin/nillumbik/internal/site"
	"github.com/lancatlin/nillumbik/internal/species"
)

func init() {
	err := godotenv.Load(".env.dev")
	if err != nil {
		log.Println(err.Error())
	}
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
func run() error {
	ctx := context.Background()

	dbUrl := os.Getenv("DB_URL")
	conn, err := pgx.Connect(ctx, dbUrl)
	if err != nil {
		return err
	}
	defer conn.Close(ctx)

	querier := db.New(conn)
	r := gin.Default()

	api := r.Group("/api")

	site.Register(api, site.NewController(querier))

	species.Register(api, species.NewController(querier))

	observation.Register(api, observation.NewController(querier))

	r.GET("/swagger/*any", ginSwagger.WrapHandler(swaggerFiles.Handler))

	r.Run(":8000")
	return nil
}

func main() {
	if err := run(); err != nil {
		log.Fatal(err)
	}
}
