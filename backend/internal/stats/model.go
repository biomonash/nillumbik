package stats

import "time"

type TimePeriodRequest struct {
	From *time.Time `form:"from" time_format:"2006-01-02"`
	To   *time.Time `form:"to"   time_format:"2006-01-02"`
}
