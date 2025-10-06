package main

import (
	"context"
	"log"
	"os"

	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/joho/godotenv"

	// swagger embed files
	// gin-swagger middleware
	_ "github.com/biomonash/nillumbik/docs"
	"github.com/biomonash/nillumbik/internal/db"
	"github.com/biomonash/nillumbik/internal/server"
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
	conn, err := pgxpool.New(ctx, dbUrl)
	if err != nil {
		return err
	}
	defer conn.Close()

	querier := db.New(conn)

	s := server.New(querier)

	return s.Run(":8000")
}

func main() {
	if err := run(); err != nil {
		log.Fatal(err)
	}
}
