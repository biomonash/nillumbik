package main

import (
	"fmt"

	"github.com/biomonash/nillumbik/internal/importer"
)

func main() {
	fmt.Println("Import csv/xlsx to database")
	importer.ImportCSV()
}
