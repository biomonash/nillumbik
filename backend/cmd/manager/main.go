package main

import (
	"context"
	"log"
	"os"

	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/joho/godotenv"
	"github.com/biomonash/forestportal/internal/manager/server"
)

func init() {
	err := godotenv.Load("../.env.dev")
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

	s := server.New(conn)

	return s.Run(":8001")
}

func main() {
	if err := run(); err != nil {
		log.Fatal(err)
	}
}
