package main

import (
	"context"
	"fmt"
	"log"
	"os"
	"os/signal"
	"syscall"

	"github.com/biomonash/nillumbik/internal/db"
	"github.com/biomonash/nillumbik/internal/imgimporter"
	"github.com/jackc/pgx/v5/pgxpool"
)

var MEDIA_DIR string

func main() {
	fmt.Println("Starting image import...")

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
	MEDIA_DIR = os.Getenv("MEDIA_DIR")
	if MEDIA_DIR == "" {
		log.Fatalln("Media dir is required.")
	}

	if err := imgimporter.ImportSpeciesImages(ctx, q, MEDIA_DIR); err != nil {
		log.Fatalln(err)
	}

	fmt.Println("Import completed successfully!")
}
