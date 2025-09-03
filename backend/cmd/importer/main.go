package main

import (
	"context"
	"fmt"
	"log"

	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/lancatlin/nillumbik/internal/db"
	"github.com/lancatlin/nillumbik/internal/importer"
)

func main() {
	fmt.Println("Starting CSV import...")

	// Connect to PostgreSQL
	connStr := "postgres://postgres:963745@localhost:5432/nillumbik?sslmode=disable"
	pool, err := pgxpool.New(context.Background(), connStr)
	if err != nil {
		log.Fatal("failed to connect to DB:", err)
	}
	defer pool.Close()

	q := db.New(pool)

	// Call the importer
	err = importer.ImportCSV(context.Background(), q, `C:\Users\adamr\OneDrive\Documents\GitHub\nillumbik\NillumbikForestHealth_NOLATLONG.xlsx - MASTER.csv`)
	if err != nil {
		log.Fatal("Import failed:", err)
	}

	fmt.Println("Import completed successfully!")
}
