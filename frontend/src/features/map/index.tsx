import MapView from './components/MapView'
import MapCharts from './components/MapCharts'
import { useState } from 'react'

export default function MapPage() {
  const [selectedBlock, setSelectedBlock] = useState<string>('all')
  
  return (
    <div style={{ position: 'relative' }}>
      <MapCharts selectedBlock={selectedBlock} />
      {/* Background Map */}
      <MapView onZoneSelect={(block) => setSelectedBlock(block)} />

      {/* Overlay UI (later) */}
      <div style={{ position: 'relative', zIndex: 10 }}>
        <h1>Map Page</h1>
      </div>
    </div>
  )
}
