import { ResponsiveBar } from '@nivo/bar'

const dummyData = [
  { year: '2021', birds: 120, mammals: 40, amphibians: 12 },
  { year: '2022', birds: 180, mammals: 60, amphibians: 25 },
  { year: '2023', birds: 200, mammals: 70, amphibians: 30 },
]

export const BarChart = () => (
  <div className="h-[300px]">
    <ResponsiveBar
      data={dummyData}
      keys={['birds', 'mammals', 'amphibians']}
      indexBy="year"
      margin={{ top: 50, right: 50, bottom: 50, left: 60 }}
      padding={0.3}
      colors={{ scheme: 'nivo' }}
      axisBottom={{ legend: 'Year', legendPosition: 'middle', legendOffset: 32 }}
      axisLeft={{ legend: 'Count', legendPosition: 'middle', legendOffset: -40 }}
      labelSkipWidth={12}
      labelSkipHeight={12}
      labelTextColor="var(--background)"
      theme={{
        axis: {
          ticks:  { text: { fill: '#ffffff', fontSize: 11 } },
          legend: { text: { fill: '#ffffff', fontSize: 12 } },
        },
        legends: { text: { fill: '#ffffff' } },
        grid:    { line: { stroke: 'rgba(255,255,255,0.1)' } },
      }}
      tooltip={({ id, value, indexValue, color }) => (
        <div className="bg-background text-white px-3 py-2 rounded-lg text-xs border border-white/15 shadow-lg">
          <p className="mb-1 text-[var(--muted-foreground)]">
            Year: <strong className="text-white">{indexValue}</strong>
          </p>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-sm" style={{ background: color }} />
            <span className="text-[var(--muted-foreground)]">
              {String(id).charAt(0).toUpperCase() + String(id).slice(1)}:
            </span>
            <strong>{value} species</strong>
          </div>
        </div>
      )}
    />
  </div>
)