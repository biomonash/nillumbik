import { ResponsiveBar } from '@nivo/bar'

type Props = {
  nativeCount: number
  nonNativeCount: number
}

const chartTheme = {
  axis: {
    ticks: { text: { fill: '#000000', fontSize: 11 } },
    legend: { text: { fill: '#000000', fontSize: 12 } },
  },
  tooltip: { container: { background: '#1a1a1a', color: '#ffffff' } },
}

export const NativeBarChart = ({ nativeCount, nonNativeCount }: Props) => {
  const data = [
    { type: 'Native', count: nativeCount },
    { type: 'Non-Native', count: nonNativeCount },
  ]

  return (
    <div className="h-[200px]">
      <ResponsiveBar
        data={data}
        keys={['count']}
        indexBy="type"
        margin={{ top: 20, right: 20, bottom: 40, left: 60 }}
        padding={0.4}
        colors={({ data }) => (data.type === 'Native' ? '#9BD990' : '#f87171')}
        theme={chartTheme}
        axisLeft={{
          legend: 'Species Count',
          legendPosition: 'middle',
          legendOffset: -45,
        }}
        axisBottom={{
          legend: 'Type',
          legendPosition: 'middle',
          legendOffset: 32,
        }}
        tooltip={({ indexValue, value, color }) => (
          <div className="bg-[#1a1a1a] text-white px-3 py-2 rounded-lg text-xs">
            <div className="flex items-center gap-2">
              <div
                className="w-3 h-3 rounded-sm"
                style={{ background: color }}
              />
              <span>
                <strong>{indexValue}:</strong> {value} species
              </span>
            </div>
          </div>
        )}
      />
    </div>
  )
}
