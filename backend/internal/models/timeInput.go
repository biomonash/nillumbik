package models

import (
	"fmt"
	"time"

	"github.com/jackc/pgx/v5/pgtype"
)

type DateInput string

func (d DateInput) ToTime() (*time.Time, error) {
	if d == "" {
		return nil, nil
	}
	t, err := time.Parse("2006-01-02", string(d)[:10])
	return &t, fmt.Errorf("failed to parse date input: %w", err)
}

func (d DateInput) ToPGTime() (ts pgtype.Timestamp) {
	t, err := d.ToTime()
	if t != nil && err == nil {
		ts.Time = *t
		ts.Valid = true
	} else {
		ts.Valid = false
	}
	return
}

type TimePeriodRequest struct {
	From DateInput `form:"from" time_format:"2006-01-02"`
	To   DateInput `form:"to" time_format:"2006-01-02"`
}
