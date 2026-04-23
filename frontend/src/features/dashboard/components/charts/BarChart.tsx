import { useEffect, useState } from 'react'
import { ResponsiveBar } from '@nivo/bar'
import { getObservationsTimeseries } from '../../../../apis/stats.api'

type YearEntry = { year: string; Native: number; Invasive: number }

const chartTheme = {
  axis: {
    ticks: { text: { fill: '#ffffff', fontSize: 11 } },
    legend: { text: { fill: '#ffffff', fontSize: 12 } },
  },
  legends: { text: { fill: '#ffffff' } },
  grid: { line: { stroke: 'rgba(255,255,255,0.1)' } },
  tooltip: { container: { background: '#1a1a1a', color: '#ffffff' } },
}

export const BarChart = () => {
  const [data, setData] = useState<YearEntry[]>([])

  useEffect(() => {
    getObservationsTimeseries({})
      .then((res) => {
        if (res && res.series) {
          const yearMap: Record<string, YearEntry> = {}

          Object.entries(res.series).forEach(([type, points]) => {
            // Normalizing keys to match 'Native' and 'Invasive'
            const normalizedType =
              type.toLowerCase().includes('native') || type === 'true'
                ? 'Native'
                : 'Invasive'

            points.forEach((p) => {
              // FIX: Use p.timestamp (matching your API definition)
              const rawDate = p.timestamp
              const yearDate = rawDate ? new Date(rawDate) : new Date()
              const yearStr = yearDate.getFullYear().toString()

              if (!yearMap[yearStr]) {
                yearMap[yearStr] = { year: yearStr, Native: 0, Invasive: 0 }
              }

              // Sum the counts (in case there are multiple entries per year)
              yearMap[yearStr][normalizedType] += p.speciesCount
            })
          })

          const finalData = Object.values(yearMap).sort((a, b) =>
            a.year.localeCompare(b.year),
          )

          console.log('BarChart: Verified Data Structure')
          console.table(finalData) // Check your F12 console to see the table!
          setData(finalData)
        }
      })
      .catch((err) => console.error('BarChart API Error:', err))
  }, [])

  return (
    <div className="h-[300px]">
      {data.length > 0 ? (
        <ResponsiveBar
          data={data}
          keys={['Native', 'Invasive']}
          indexBy="year"
          margin={{ top: 50, right: 50, bottom: 50, left: 100 }}
          padding={0.3}
          valueScale={{ type: 'linear' }}
          colors={{ scheme: 'nivo' }}
          theme={chartTheme}
          enableLabel={true}
          labelSkipHeight={12}
          labelTextColor="#000000"
          axisBottom={{
            legend: 'Year',
            legendPosition: 'middle',
            legendOffset: 40,
          }}
          axisLeft={{
            legend: 'Total Species',
            legendPosition: 'middle',
            legendOffset: -75,
          }}
          tooltip={({ id, value, indexValue, color }) => (
            <div className="bg-[#1a1a1a] text-white px-3 py-2 rounded-lg text-xs border border-white/20 shadow-2xl flex items-center gap-2">
              <div
                className="w-3 h-3 rounded-sm"
                style={{ background: color }}
              />
              <span>
                <strong>{id}</strong> ({indexValue}):{' '}
                <strong>{value} Species</strong>
              </span>
            </div>
          )}
        />
      ) : (
        <div className="flex items-center justify-center h-full text-white">
          Loading Year Data...
        </div>
      )}
    </div>
  )
}
