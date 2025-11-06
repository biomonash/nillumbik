import { ResponsiveBar } from '@nivo/bar'

const dummyData = [
  { year: '2021', birds: 120, mammals: 40, amphibians: 12 },
  { year: '2022', birds: 180, mammals: 60, amphibians: 25 },
  { year: '2023', birds: 200, mammals: 70, amphibians: 30 },
]

export const BarChart = () => (
  <div style={{ height: 300 }}>
    <ResponsiveBar
      data={dummyData}
      keys={['birds', 'mammals', 'amphibians']}
      indexBy="year"
      margin={{ top: 20, right: 100, bottom: 50, left: 60 }}
      padding={0.3}
      colors={{ scheme: 'nivo' }}
      axisBottom={{ legend: 'Year', legendPosition: 'middle', legendOffset: 32 }}
      axisLeft={{ legend: 'Count', legendPosition: 'middle', legendOffset: -40 }}
      labelSkipWidth={12}
      labelSkipHeight={12}
      labelTextColor="#fff"
    />
  </div>
)
