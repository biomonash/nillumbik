import { MapContainer, TileLayer, GeoJSON } from 'react-leaflet'
import { useEffect, useState } from 'react'
import type { FeatureCollection, Point } from 'geojson'
import 'leaflet/dist/leaflet.css'

interface ZoneProperties {
  site: string
  latitude: number
  longitude: number
  block: string
}

export default function MapView() {
  const [geoData, setGeoData] = useState<FeatureCollection<
    Point,
    ZoneProperties
  > | null>(null)

  useEffect(() => {
    fetch('/nillumbik_30zones.geojson')
      .then((res) => res.json())
      .then((data) => setGeoData(data))
  }, [])

  return (
    <MapContainer
      center={[-37.6, 145.2]}
      zoom={10}
      style={{
        height: '100vh',
        width: '100%',
        position: 'absolute',
        top: 0,
        left: 0,
        zIndex: 0,
      }}
    >
      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

      {geoData && (
        <GeoJSON
          data={geoData}
          // 🔥 STYLE EACH ZONE
          style={() => ({
            color: 'green',
            fillColor: 'green',
            fillOpacity: 0.3,
          })}
          // 🔥 INTERACTION
          onEachFeature={(feature, layer) => {
            layer.on('click', () => {
              console.log('Clicked zone:', feature.properties)
            })
          }}
        />
      )}
    </MapContainer>
  )
}
