import { useEffect, useState } from 'react'
import { ResponsiveLine } from '@nivo/line'
import { getObservationsTimeseries } from '../../../../apis/stats.api'
import type { ObservationStatsRequest } from '../../../../apis/stats.api'

type Props = {
  filters: Partial<ObservationStatsRequest>
  selectedSpecies?: string
}

type LinePoint = {
  x: string
  y: number
}

type LineSeries = {
  id: string
  data: LinePoint[]
}

const chartTheme = {
  axis: {
    ticks: { text: { fill: '#000000', fontSize: 11 } },
    legend: { text: { fill: '#000000', fontSize: 12 } },
  },
  legends: { text: { fill: '#000000' } },
  grid: { line: { stroke: 'rgba(0,0,0,0.1)' } },
}

export const SpeciesLineChart = ({ filters, selectedSpecies }: Props) => {
  const [data, setData] = useState<LineSeries[]>([])

  useEffect(() => {
    getObservationsTimeseries(filters).then((res) => {
      if (res && res.series) {
        const formatted = Object.entries(res.series).map(([id, points]) => {
          const typedPoints = points as {
            timestamp: string
            observationCount: number
            speciesCount: number
          }[]

          return {
            id,
            data: typedPoints.map((p) => ({
              x: new Date(p.timestamp).getFullYear().toString(),
              y:
                selectedSpecies && selectedSpecies !== ''
                  ? p.observationCount
                  : p.speciesCount,
            })),
          }
        })
        setData(formatted)
      }
    })
  }, [filters, selectedSpecies])

  return (
    <div className="h-[300px]">
      {data.length > 0 ? (
        <ResponsiveLine
          data={data}
          margin={{ top: 20, right: 40, bottom: 50, left: 85 }}
          xScale={{ type: 'point' }}
          yScale={{ type: 'linear', min: 'auto', max: 'auto', stacked: false }}
          axisBottom={{
            legend: 'Year',
            legendOffset: 40,
            legendPosition: 'middle',
          }}
          axisLeft={{
            legend:
              selectedSpecies && selectedSpecies !== ''
                ? 'Observations'
                : 'Species Richness',
            legendOffset: -50,
            legendPosition: 'middle',
          }}
          pointSize={8}
          pointBorderWidth={2}
          pointBorderColor={{ from: 'serieColor' }}
          useMesh={true}
          theme={chartTheme}
          // The box that appears when you hover over
          tooltip={({ point }) => (
            <div className="bg-[var(--background)] text-white px-3 py-2 rounded-lg text-xs border border-white/10 shadow-xl">
              <span className="text-gray-400">Year {point.data.x}:</span>
              <div className="flex items-center gap-2 mt-1">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ background: point.seriesColor }}
                />
                <strong className="text-[10px]">
                  {String(point.seriesId)
                    .toString()
                    .replace(/\b\w/g, (c) => c.toUpperCase())}
                  : {point.data.yFormatted}{' '}
                  {selectedSpecies && selectedSpecies !== ''
                    ? 'Observations'
                    : 'Species'}{' '}
                </strong>
              </div>
            </div>
          )}
          legends={[
            {
              anchor: 'bottom',
              direction: 'row',
              justify: false,
              translateX: 100,
              translateY: 70,
              itemWidth: 80,
              itemHeight: 20,
              itemTextColor: '#000000',
              symbolSize: 12,
              symbolShape: 'circle',
            },
          ]}
        />
      ) : (
        <div className="flex items-center justify-center h-full text-gray-500">
          Loading Data...
        </div>
      )}
    </div>
  )
}
