import { ResponsivePie } from '@nivo/pie'

const dummyData = [
  { id: 'Native',   value: 92 },
  { id: 'Invasive', value: 6  },
  { id: 'Rare',     value: 2  },
]

export const PieChart = () => (
  <div className="h-[300px]">
    <ResponsivePie
      data={dummyData}
      margin={{ top: 50, right: 50, bottom: 50, left: 50 }}
      innerRadius={0.5}
      padAngle={1}
      cornerRadius={5}
      activeOuterRadiusOffset={8}
      colors={{ scheme: 'category10' }}
      borderWidth={1}
      borderColor={{ from: 'color', modifiers: [['darker', 0.2]] }}
      arcLabelsSkipAngle={0}
      arcLinkLabelsSkipAngle={0}
      arcLinkLabelsTextColor="var(--muted-foreground)"
      arcLinkLabelsColor={{ from: 'color' }}
      arcLabel={d => `${d.value}%`}
      theme={{
        labels:    { text: { fill: 'var(--muted-foreground)', fontSize: 12 } },
        legends:      { text: { fill: '#ffffff' } },
      }}
      tooltip={({ datum }) => (
        <div className="bg-background text-white px-3 py-2 rounded-lg text-xs border border-white/15 shadow-lg">
          <div className="flex items-center gap-2">
            <div
              className="w-3 h-3 rounded-full"
              style={{ background: datum.color }}
            />
            <span className="text-[var(--muted-foreground)]">{datum.id}:</span>
            <strong>{datum.value}%</strong>
          </div>
        </div>
      )}
    />
  </div>
)