import { ResponsiveLine } from '@nivo/line'

const dummyData = [
  {
    id: 'Native',
    color: 'hsl(145, 70%, 50%)',
    data: [
      { x: '2021', y: 120 },
      { x: '2022', y: 140 },
      { x: '2023', y: 160 },
    ],
  },
  {
    id: 'Invasive',
    color: 'hsl(10, 70%, 50%)',
    data: [
      { x: '2021', y: 30 },
      { x: '2022', y: 40 },
      { x: '2023', y: 45 },
    ],
  },
]

export const LineChart = () => (
  <div className="h-[300px]">
    <ResponsiveLine
      data={dummyData}
      margin={{ top: 20, right: 50, bottom: 50, left: 60 }}
      xScale={{ type: 'point' }}
      yScale={{ type: 'linear', min: 'auto', max: 'auto', stacked: false }}
      axisBottom={{ legend: 'Year', legendOffset: 36, legendPosition: 'middle' }}
      axisLeft={{ legend: 'Detections', legendOffset: -40, legendPosition: 'middle' }}
      pointSize={8}
      pointColor={{ theme: 'background' }}
      pointBorderWidth={2}
      pointBorderColor={{ from: 'serieColor' }}
      useMesh={true}
      theme={{
        axis: {
          ticks:  { text: { fill: '#ffffff', fontSize: 11 } },
          legend: { text: { fill: '#ffffff', fontSize: 12 } },
        },
        legends: { text: { fill: '#ffffff' } },
        grid:    { line: { stroke: 'rgba(255,255,255,0.1)' } },
      }}
      tooltip={({ point }) => (
        <div className="bg-background text-white px-3 py-2 rounded-lg text-xs border border-white/15 shadow-lg">
          <p className="mb-1 text-[var(--muted-foreground)]">
            Year: <strong className="text-white">{String(point.data.x)}</strong>
          </p>
          <div className="flex items-center gap-2">
            <div
              className="w-3 h-3 rounded-full"
              style={{ background: point.seriesColor }}
            />
            <span className="text-[var(--muted-foreground)]">
              {String(point.seriesId).charAt(0).toUpperCase() + String(point.seriesId).slice(1)}:
            </span>
            <strong>{String(point.data.y)} detections</strong>
          </div>
        </div>
      )}
    />
  </div>
)