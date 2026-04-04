import { MapContainer, TileLayer, GeoJSON } from 'react-leaflet'
import { useEffect, useState } from 'react'
import 'leaflet/dist/leaflet.css'
import { useUserLocation } from '../../../hooks/useUserLocation'
import { findSiteForLocation } from '../../../helpers/siteLocation'
import type {
  ZonesGeoJSON,
  SiteProperties,
} from '../../../helpers/siteLocation'
import { Marker, Popup, useMap } from 'react-leaflet'

function FlyToUser({
  coords,
}: {
  coords: { latitude: number; longitude: number } | null
}) {
  const map = useMap()
  useEffect(() => {
    if (coords) {
      map.flyTo([coords.latitude, coords.longitude], 14)
    }
  }, [coords, map])
  return null
}

export default function MapView() {
  const [geoData, setGeoData] = useState<ZonesGeoJSON | null>(null)
  const [currentSite, setCurrentSite] = useState<SiteProperties | null>(null)
  const { coords, loading, error, locate } = useUserLocation()

  useEffect(() => {
    fetch('/nillumbik_30zones.geojson')
      .then((res) => res.json())
      .then((data) => setGeoData(data))
  }, [])

  useEffect(() => {
    if (coords && geoData) {
      //const site = findSiteForLocation(-37.67773, 145.091362, geoData);
      const site = findSiteForLocation(
        coords.latitude,
        coords.longitude,
        geoData,
      )
      setCurrentSite(site)
    }
  }, [coords, geoData])

  return (
    <div style={{ position: 'relative' }}>
      <button
        onClick={locate}
        disabled={loading}
        style={{
          position: 'absolute',
          top: '10px',
          right: '10px',
          zIndex: 1000,
          padding: '8px 16px',
          color: 'darkgreen',
          backgroundColor: 'white',
          border: '2px solid darkgreen',
          borderRadius: '4px',
          cursor: 'pointer',
        }}
      >
        {loading ? 'Locating...' : 'Find My Location'}
      </button>
      //Site info
      {coords && (
        <div
          style={{
            position: 'fixed',
            bottom: '20px',
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 1000,
            backgroundColor: 'white',
            color: 'darkgreen',
            padding: '10px 16px',
            borderRadius: '8px',
            border: '2px solid darkgreen',
          }}
        >
          {currentSite
            ? `You are in monitoring site: ${currentSite.site} (Block ${currentSite.block})`
            : 'You are outside Nillumbik monitoring zones'}
        </div>
      )}
      {error && (
        <div
          style={{
            position: 'absolute',
            top: '50px',
            right: '10px',
            zIndex: 1000,
            color: 'red',
            backgroundColor: 'white',
            padding: '8px',
            borderRadius: '4px',
          }}
        >
          {error}
        </div>
      )}
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
        <FlyToUser coords={coords} />
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
        //pin
        {coords && (
          <Marker position={[coords.latitude, coords.longitude]}>
            <Popup>You are here</Popup>
          </Marker>
        )}
      </MapContainer>
    </div>
  )
}
