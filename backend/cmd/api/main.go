package main

import (
	"context"
	"log"
	"os"

	"github.com/gin-gonic/gin"
	"github.com/jackc/pgx/v5"
	"github.com/joho/godotenv"

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
	site.Register(r, site.NewController(querier))

	species.Register(r, species.NewController(querier))

	observation.Register(r, observation.NewController(querier))

	r.Run(":8000")
	return nil
}

func main() {
	if err := run(); err != nil {
		log.Fatal(err)
	}
}
