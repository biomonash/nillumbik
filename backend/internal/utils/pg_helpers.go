package utils

import (
	"time"

	"github.com/jackc/pgx/v5/pgtype"
)

func ToPgTimestamp(t *time.Time) pgtype.Timestamp {
	var ts pgtype.Timestamp
	if t != nil {
		ts.Time = *t
		ts.Valid = true
	} else {
		ts.Valid = false
	}
	return ts
}
