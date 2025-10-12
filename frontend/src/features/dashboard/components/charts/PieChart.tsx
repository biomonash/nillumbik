import { ResponsivePie } from '@nivo/pie'

const dummyData = [
  { id: 'Native', value: 92 },
  { id: 'Invasive', value: 6 },
  { id: 'Rare', value: 2 },
]

export const PieChart = () => (
  <div style={{ height: 300 }}>
    <ResponsivePie
      data={dummyData}
      margin={{ top: 20, right: 80, bottom: 80, left: 80 }}
      innerRadius={0.5}
      padAngle={1}
      cornerRadius={5}
      activeOuterRadiusOffset={8}
      colors={{ scheme: 'category10' }}
      borderWidth={1}
      borderColor={{ from: 'color', modifiers: [['darker', 0.2]] }}
      arcLabelsSkipAngle={10}
      arcLinkLabelsSkipAngle={10}
    />
  </div>
)
