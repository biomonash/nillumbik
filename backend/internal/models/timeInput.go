package models

import (
	"fmt"
	"time"

	"github.com/jackc/pgx/v5/pgtype"
)

type DateInput string

func (d *DateInput) UnmarshalParam(param string) error {
	if param == "" {
		return nil
	}
	// ignore the timestring. Simplify frontend serialisation
	s := param[:min(10, len(param))]
	_, err := time.Parse("2006-01-02", s)
	if err != nil {
		return fmt.Errorf("failed to parse date input: %w", err)
	}
	*d = DateInput(s)
	return nil
}

func (d DateInput) ToTime() (t time.Time, err error) {
	t, err = time.Parse("2006-01-02", string(d))
	if err != nil {
		return t, fmt.Errorf("failed to parse date input: %w", err)
	}
	return
}

func (d DateInput) ToPGTime() (ts pgtype.Timestamp) {
	if d == "" {
		return
	}
	t, err := d.ToTime()
	if err == nil {
		ts.Time = t
		ts.Valid = true
	} else {
		ts.Valid = false
	}
	return
}

type TimePeriodRequest struct {
	From DateInput `form:"from"`
	To   DateInput `form:"to"`
}
