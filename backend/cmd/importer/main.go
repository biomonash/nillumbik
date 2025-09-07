package main

import (
	"context"
	"flag"
	"fmt"
	"log"
	"os"

	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/lancatlin/nillumbik/internal/db"
	"github.com/lancatlin/nillumbik/internal/importer"
)

func main() {
	fmt.Println("Starting CSV import...")

	// Flags for CSV path and DB connection string
	csvPath := flag.String("csv", "", "Path to the CSV file to import")
	dbURL := flag.String("db", "", "PostgreSQL connection string")
	flag.Parse()

	// Allow env vars as fallback
	if *dbURL == "" {
		*dbURL = os.Getenv("DATABASE_URL")
	}
	if *csvPath == "" {
		*csvPath = os.Getenv("CSV_PATH")
	}

	if *dbURL == "" || *csvPath == "" {
		log.Fatal("Database connection string and CSV path must be provided via flags or environment variables")
	}

	// Connect to PostgreSQL
	pool, err := pgxpool.New(context.Background(), *dbURL)
	if err != nil {
		log.Fatal("failed to connect to DB:", err)
	}
	defer pool.Close()

	q := db.New(pool)

	// Call the importer
	err = importer.ImportCSV(context.Background(), q, *csvPath)
	if err != nil {
		log.Fatal("Import failed:", err)
	}

	fmt.Println("Import completed successfully!")
}
