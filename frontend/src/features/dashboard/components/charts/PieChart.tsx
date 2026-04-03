import { useEffect, useState } from 'react'
import { ResponsivePie } from '@nivo/pie'
import { getObservationsOverview } from '../../../../apis/stats.api'

const chartTheme = {
  legends: { text: { fill: '#ffffff' } },
  labels: { text: { fill: '#ffffff', fontSize: 12 } },
}

export const PieChart = () => {
  const [data, setData] = useState<any[]>([])

  useEffect(() => {
    getObservationsOverview({}).then((res) => {
      if (res) {
        setData([
          { id: 'Native', value: res.nativeSpeciesCount },
          { id: 'Invasive', value: res.speciesCount - res.nativeSpeciesCount },
        ])
      }
    })
  }, [])

  return (
    <div className="h-[300px]">
      {data.length > 0 ? (
        <ResponsivePie
          data={data}
          margin={{ top: 40, right: 80, bottom: 40, left: 80 }}
          innerRadius={0.5}
          padAngle={1}
          cornerRadius={5}
          colors={{ scheme: 'category10' }}
          theme={chartTheme}
          arcLabel={(d) => `${d.value}`}
          arcLinkLabelsTextColor="#ffffff"
          arcLinkLabelsThickness={2}
          arcLinkLabelsColor={{ from: 'color' }}
          tooltip={({ datum }) => (
            <div className="bg-[#1a1a1a] text-white px-3 py-2 rounded-lg text-xs border border-white/10 shadow-xl">
              <div className="flex items-center gap-2">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ background: datum.color }}
                />
                <strong>
                  {datum.id}: {datum.value} Total Species
                </strong>
              </div>
            </div>
          )}
        />
      ) : (
        <div className="flex items-center justify-center h-full text-white">
          Loading Native Ratio...
        </div>
      )}
    </div>
  )
}
