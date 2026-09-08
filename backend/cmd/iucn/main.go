package main

import (
	"context"
	"fmt"
	"log"
	"os"
	"os/signal"
	"syscall"

	"github.com/biomonash/forestportal/internal/db"
	"github.com/biomonash/forestportal/internal/iucn"
	"github.com/jackc/pgx/v5/pgxpool"
)

func main() {
	if len(os.Args) < 2 {
		log.Fatal("select mode (fetch|import)")
	}
	mode := os.Args[1]

	connStr := os.Getenv("DB_URL")
	if connStr == "" {
		log.Fatal("DB_URL environment variable not set")
	}

	token := os.Getenv("IUCN_TOKEN")
	if token == "" && mode == "fetch" {
		log.Fatal("IUCN_TOKEN environment variable not set")
	}

	cachePath := os.Getenv("IUCN_CACHE_PATH")
	if cachePath == "" {
		cachePath = "../static/iucn_cache.csv"
	}

	ctx, cancel := context.WithCancel(context.Background())
	defer cancel()

	sigCh := make(chan os.Signal, 1)
	signal.Notify(sigCh, os.Interrupt, syscall.SIGTERM)
	go func() {
		<-sigCh
		fmt.Println("\nInterrupt received, shutting down...")
		cancel()
	}()

	pool, err := pgxpool.New(ctx, connStr)
	if err != nil {
		log.Fatalf("failed to connect to DB: %v", err)
	}
	defer pool.Close()

	q := db.New(pool)

	switch mode {
	case "fetch":
		fmt.Println("Fetching IUCN status from API...")
		if err := iucn.FetchAndCache(ctx, q, token, cachePath); err != nil {
			log.Fatalf("fetch failed: %v", err)
		}
		fmt.Println("Fetch completed. Results saved to", cachePath)
	case "import":
		fmt.Println("Importing IUCN status from cache...")
		if err := iucn.ImportFromCache(ctx, q, cachePath); err != nil {
			log.Fatalf("import failed: %v", err)
		}
		fmt.Println("Import completed successfully")

	default:
		log.Fatalf("unknown mode: %s (use fetch or import)", mode)
	}
}
