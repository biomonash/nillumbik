import MapView from './components/MapView'
import MapCharts from './components/MapCharts'

export default function MapPage() {
  return (
    <div style={{ position: 'relative' }}>
      <MapCharts />
      {/* Background Map */}
      <MapView />

      {/* Overlay UI (later) */}
      <div style={{ position: 'relative', zIndex: 10 }}>
        <h1>Map Page</h1>
      </div>
    </div>
  )
}
