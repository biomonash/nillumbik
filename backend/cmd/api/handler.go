package main

import (
	"encoding/json"
	"net/http"
	"strconv"

	"github.com/biomonash/nillumbik/internal/db"
)

type ListObservationsHandlerFunc func(w http.ResponseWriter, r *http.Request)

func ListObservationsHandler(q *db.Queries) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		page := 1
		perPage := 50
		if p := r.URL.Query().Get("page"); p != "" {
			if v, err := strconv.Atoi(p); err == nil && v > 0 {
				page = v
			}
		}
		if pp := r.URL.Query().Get("per_page"); pp != "" {
			if v, err := strconv.Atoi(pp); err == nil && v > 0 {
				perPage = v
			}
		}

		limit := int32(perPage)
		offset := int32((page - 1) * perPage)

		params := db.ListObservationsPagedParams{
			Limit:  limit,
			Offset: offset,
		}
		items, err := q.ListObservationsPaged(r.Context(), params)
		if err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}

		resp := map[string]interface{}{
			"data":     items,
			"page":     page,
			"per_page": perPage,
		}
		w.Header().Set("Content-Type", "application/json")
		_ = json.NewEncoder(w).Encode(resp)
	}
}
