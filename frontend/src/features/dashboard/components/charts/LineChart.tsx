import { useEffect, useState } from 'react'
import { ResponsiveLine } from '@nivo/line'
import { getObservationsTimeseries } from '../../../../apis/stats.api'

const chartTheme = {
  axis: {
    ticks: { text: { fill: '#ffffff', fontSize: 11 } },
    legend: { text: { fill: '#ffffff', fontSize: 12 } },
  },
  legends: { text: { fill: '#ffffff' } },
  grid: { line: { stroke: 'rgba(255,255,255,0.1)' } },
}

export const LineChart = () => {
  const [data, setData] = useState<{ id: string; data: { x: string; y: number }[] }[]>([])

  useEffect(() => {
    getObservationsTimeseries({}).then((res) => {
      if (res && res.series) {
        const formatted = Object.entries(res.series).map(([id, points]) => ({
          id: id,
          data: points.map((p) => ({
            x: new Date(p.timestamp).getFullYear().toString(),
            y: p.observationCount,
          })),
        }))
        setData(formatted)
      }
    })
  }, [])

  return (
    <div className="h-[300px]">
      {data.length > 0 ? (
        <ResponsiveLine
          data={data}
          margin={{ top: 20, right: 110, bottom: 50, left: 85 }} // Increased left margin for large numbers
          xScale={{ type: 'point' }}
          yScale={{ type: 'linear', min: 'auto', max: 'auto', stacked: false }}
          axisBottom={{
            legend: 'Year',
            legendOffset: 40,
            legendPosition: 'middle',
          }}
          axisLeft={{
            legend: 'Observations',
            legendOffset: -70, // Increased offset so it doesn't hit the numbers
            legendPosition: 'middle',
          }}
          pointSize={8}
          pointBorderWidth={2}
          pointBorderColor={{ from: 'serieColor' }}
          useMesh={true}
          theme={chartTheme}
          tooltip={({ point }) => (
            <div className="bg-[#1a1a1a] text-white px-3 py-2 rounded-lg text-xs border border-white/10 shadow-xl">
              <span className="text-gray-400">Year {point.data.x}:</span>
              <div className="flex items-center gap-2 mt-1">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ background: point.seriesColor }}
                />
                <strong>
                  {point.seriesId}: {point.data.yFormatted} Detections
                </strong>
              </div>
            </div>
          )}
          legends={[
            {
              anchor: 'bottom-right',
              direction: 'column',
              justify: false,
              translateX: 100,
              itemWidth: 80,
              itemHeight: 20,
              itemTextColor: '#ffffff',
              symbolSize: 12,
              symbolShape: 'circle',
            },
          ]}
        />
      ) : (
        <div className="flex items-center justify-center h-full text-white">
          Loading Trends...
        </div>
      )}
    </div>
  )
}
