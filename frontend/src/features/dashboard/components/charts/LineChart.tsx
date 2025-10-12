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
  <div style={{ height: 300 }}>
    <ResponsiveLine
      data={dummyData}
      margin={{ top: 20, right: 60, bottom: 50, left: 60 }}
      xScale={{ type: 'point' }}
      yScale={{ type: 'linear', min: 'auto', max: 'auto', stacked: false }}
      axisBottom={{ legend: 'Year', legendOffset: 36, legendPosition: 'middle' }}
      axisLeft={{ legend: 'Detections', legendOffset: -40, legendPosition: 'middle' }}
      pointSize={8}
      pointColor={{ theme: 'background' }}
      pointBorderWidth={2}
      pointBorderColor={{ from: 'serieColor' }}
      useMesh={true}
    />
  </div>
)
