package main

import (
	"context"
	"fmt"
	"log"
	"os"
	"os/signal"
	"syscall"

	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/lancatlin/nillumbik/internal/db"
	"github.com/lancatlin/nillumbik/internal/importer"
)

func main() {
	fmt.Println("Starting CSV import...")

	// Load DB connection string from environment
	connStr := os.Getenv("DB_URL")
	if connStr == "" {
		log.Fatal("DB_URL environment variable not set")
	}

	// Setup context with cancellation for graceful shutdown
	ctx, cancel := context.WithCancel(context.Background())
	defer cancel()

	// Handle OS signals for graceful shutdown
	sigCh := make(chan os.Signal, 1)
	signal.Notify(sigCh, os.Interrupt, syscall.SIGTERM)
	go func() {
		<-sigCh
		fmt.Println("\nInterrupt received, shutting down...")
		cancel()
	}()

	// Connect to PostgreSQL
	pool, err := pgxpool.New(ctx, connStr)
	if err != nil {
		log.Fatalf("Failed to connect to DB: %v", err)
	}
	defer pool.Close()

	q := db.New(pool)

	// Determine CSV path (environment variable fallback or default relative path)
	csvPath := os.Getenv("CSV_PATH")
	if csvPath == "" {
		csvPath = "./data/nillumbik.csv"
	}

	// Check that CSV file exists
	if _, err := os.Stat(csvPath); err != nil {
		log.Fatalf("CSV file not found at %s: %v", csvPath, err)
	}

	// Run importer
	if err := importer.ImportCSV(ctx, q, csvPath); err != nil {
		log.Fatalf("Import failed: %v", err)
	}

	fmt.Println("Import completed successfully!")
}
