package export

import (
	"encoding/csv"
	"fmt"
	"net/http"
	"strconv"
	"strings"
	"time"

	"github.com/biomonash/forestportal/internal/db"
	"github.com/biomonash/forestportal/internal/models"
	"github.com/biomonash/forestportal/internal/species"
	"github.com/biomonash/forestportal/internal/utils"
	"github.com/gin-gonic/gin"
)

type ExportRequest struct {
	models.TimePeriodRequest
	Blocks     []int32  `form:"block[]"`
	SiteCodes  []string `form:"sitecode[]"`
	Taxa       *db.Taxa `form:"taxa"`
	CommonName *string  `form:"commonName"`
	Native     *bool    `form:"native"`
}

// ExportCSV godoc
//
//	@Summary		Export observations as CSV
//	@Description	Export filtered observations as a downloadable CSV file
//	@Tags			export
//	@Produce		text/csv
//	@Param			from		query	string		false	"Search start from"		format(date-time)
//	@Param			to			query	string		false	"Search end to"			format(date-time)
//	@Param			block		query	[]integer	false	"Filter by site block"	collectionFormat(multi)
//	@Param			siteCode	query	[]string	false	"Filter by site code"	collectionFormat(multi)
//	@Param			taxa		query	string		false	"Filter by taxa"
//	@Param			commonName	query	string		false	"Filter by species common name"
//	@Param			native		query	boolean		false	"Filter by native status"
//	@Success		200
//	@Error			400			{object}	gin.H
//	@Router			/export [get]
func (u *Controller) ExportCSV(c *gin.Context) {
	var req ExportRequest
	if err := c.ShouldBindQuery(&req); err != nil {
		c.Error(utils.NewHttpError(http.StatusBadRequest, "failed to parse input", err))
		return
	}
	ctx := c.Request.Context()

	taxa := db.NullTaxa{Valid: false}
	if req.Taxa != nil {
		taxa.Taxa = *req.Taxa
		taxa.Valid = true
	}

	params := db.ExportObservationsParams{
		From:       req.From.ToPGTime(),
		To:         req.To.ToPGTime(),
		Blocks:     req.Blocks,
		SiteCodes:  req.SiteCodes,
		Taxa:       taxa,
		CommonName: species.CleanOptionalName(req.CommonName),
		Native:     req.Native,
	}

	filename := getFilename(req)
	c.Header("Content-Type", "text/csv")
	c.Header("Content-Disposition", fmt.Sprintf(`attachment; filename="%s"`, filename))

	const pageSize = 1000
	offset := 0

	writer := csv.NewWriter(c.Writer)

	writer.Write([]string{
		"Year", "Site", "Lat", "Lon", "Date", "Time", "Method", "File", "Start (s)", "End (s)", "Temp",
		"Narrative", "Image Path", "Confidence", "Scientific name", "Common name", "Forest type", "Indicator",
		"Native", "Tenure", "Reportable", "Block", "Taxa",
	})
	writer.Flush()

	for {
		params.Limit = int32(pageSize)
		params.Offset = int32(offset)

		rows, err := u.q.ExportObservations(ctx, params)
		if err != nil {
			return
		}

		for _, row := range rows {
			date := ""
			if row.Date.Valid {
				date = row.Date.Time.Format("2-Jan-06")
			}

			timeStr := ""
			if row.Time.Valid {
				totalSeconds := row.Time.Microseconds / 1_000_000
				h := totalSeconds / 3600
				m := (totalSeconds % 3600) / 60
				t := time.Date(0, 0, 0, int(h), int(m), 0, 0, time.UTC)
				timeStr = t.Format("3:04 PM")
			}

			writer.Write([]string{
				strconv.Itoa(int(row.Year)),
				row.Site,
				"",
				"",
				date,
				timeStr,
				capitalise(string(row.Method)),
				nullableString(row.File),
				nullableInt32(row.AppearanceStart),
				nullableInt32(row.AppearanceEnd),
				nullableInt32(row.Temperature),
				nullableString(row.Narrative),
				"",
				nullableFloat32(row.Confidence),
				row.ScientificName,
				row.CommonName,
				capitalise(string(row.Forest)),
				boolToYN(row.Indicator),
				nativeToString(row.Native),
				capitalise(string(row.Tenure)),
				boolToYN(row.Reportable),
				strconv.Itoa(int(row.Block)),
				capitalise(string(row.Taxa)),
			})

		}

		writer.Flush()

		if len(rows) < pageSize {
			break
		}

		offset += pageSize

	}
}

func getFilename(req ExportRequest) string {
	parts := []string{"nillumbik"}
	if len(req.Blocks) > 0 {
		for _, b := range req.Blocks {
			parts = append(parts, fmt.Sprintf("block%d", b))
		}
	}
	if len(req.SiteCodes) > 0 {
		parts = append(parts, strings.Join(req.SiteCodes, "-"))
	}
	if req.From != "" {
		parts = append(parts, string(req.From))
	}
	if req.To != "" {
		parts = append(parts, string(req.To))
	}
	return strings.Join(parts, "_") + ".csv"
}

func nullableString(s *string) string {
	if s == nil {
		return ""
	}
	return *s
}

func nullableInt32(i *int32) string {
	if i == nil {
		return ""
	}
	return strconv.Itoa(int(*i))
}

func nullableFloat32(f *float32) string {
	if f == nil {
		return ""
	}
	return strconv.FormatFloat(float64(*f), 'f', 4, 32)
}

func boolToYN(b bool) string {
	if b {
		return "Y"
	}
	return "N"
}

func nativeToString(native bool) string {
	if native {
		return "Native"
	}
	return "Non-native"
}

func capitalise(s string) string {
	if s == "" {
		return ""
	}
	return strings.ToUpper(s[:1]) + strings.ToLower(s[1:])
}
