import {
  MapContainer,
  TileLayer,
  GeoJSON,
  Marker,
  Popup,
  useMap,
} from 'react-leaflet'
import { useEffect, useState } from 'react'
import 'leaflet/dist/leaflet.css'
import { divIcon } from 'leaflet'
import { useUserLocation } from '../../../hooks/useUserLocation'
import { findSiteForLocation } from '../../../helpers/siteLocation'
import type {
  ZonesGeoJSON,
  SiteProperties,
} from '../../../helpers/siteLocation'
import SpeciesSidebar from './SpeciesSidebar'
import { SPECIES } from '../data/species'
import { useDispatch } from 'react-redux'
import { setSelectedSite, setSelectedZone as setReduxZone } from '../../../store/mapSlice'

const locationPin = divIcon({
  html: "<span style='font-size: 32px; line-height: 1; display: block;'>📍</span>",
  className: '',
  iconSize: [32, 32],
  iconAnchor: [16, 32],
})

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
  const [viewType, setViewType] = useState('zones')
  const [currentSite, setCurrentSite] = useState<SiteProperties | null>(null)
  const [selectedZone, setSelectedZone] = useState<string | null>(null)
  const [hoveredZone, setHoveredZone] = useState<string | null>(null)
  const { coords, loading, error, locate } = useUserLocation()
  const dispatch = useDispatch()

  useEffect(() => {
    const file =
      viewType === 'zones' ? '/nillumbik_30zones.geojson' : '/blocks.geojson'
    setGeoData(null)
    fetch(file)
      .then((res) => res.json())
      .then((data) => setGeoData(data))
  }, [viewType])

  useEffect(() => {
    if (coords && geoData) {
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
      <div
        style={{
          position: 'absolute',
          top: 20,
          right: 20,
          zIndex: 2000,
          background: 'white',
          padding: '8px',
          borderRadius: '10px',
          display: 'flex',
          gap: '10px',
          boxShadow: '0 2px 6px rgba(0,0,0,0.2)',
        }}
      >
        <button
          onClick={() => setViewType('zones')}
          style={{
            padding: '6px 12px',
            borderRadius: '6px',
            border: '1px solid #ccc',
            background: viewType === 'zones' ? 'green' : 'white',
            color: viewType === 'zones' ? 'white' : 'black',
            cursor: 'pointer',
          }}
        >
          30 Zones
        </button>
        <button
          onClick={() => setViewType('blocks')}
          style={{
            padding: '6px 12px',
            borderRadius: '6px',
            border: '1px solid #ccc',
            background: viewType === 'blocks' ? 'green' : 'white',
            color: viewType === 'blocks' ? 'white' : 'black',
            cursor: 'pointer',
          }}
        >
          Blocks
        </button>
      </div>
      <button
        onClick={locate}
        disabled={loading}
        style={{
          position: 'fixed',
          bottom: '30px',
          left: '90px',
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
        key={viewType}
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
            key={`${viewType}-${selectedZone}`}
            data={geoData}
            style={(feature) => {
              const id = viewType === 'zones' ? feature?.properties?.site
              : String(feature?.properties?.block)
              const isSelected = selectedZone === `Zone ${id}`
              const isHovered = hoveredZone === id
              return {
                color: isSelected ? '#b45309' : 'green',
                fillColor: isSelected
                  ? '#f59e0b'
                  : isHovered
                    ? '#86efac'
                    : 'green',
                fillOpacity: isSelected ? 0.6 : isHovered ? 0.5 : 0.3,
                weight: isSelected ? 3 : 2,
              }
            }}
            onEachFeature={(feature, layer) => {
              const id = viewType === 'zones' ? feature.properties.site
              : String(feature.properties.block)
              layer.on('mouseover', () => setHoveredZone(id))
              layer.on('mouseout', () => setHoveredZone(null))
              layer.on('click', () => {
                const zoneName = `Zone ${id}`
                const block = String(feature.properties.block)
                const isAlreadySelected = selectedZone === zoneName

                setSelectedZone(isAlreadySelected ? null : zoneName)

                if (viewType === 'blocks') {
                  dispatch(setSelectedSite(null))
                  dispatch(setReduxZone(isAlreadySelected ? 'all' : block))
                } else {
                  dispatch(setSelectedSite(isAlreadySelected ? null : id))
                  dispatch(setReduxZone(isAlreadySelected ? 'all' : block))
                }
              })
            }}
          />
        )}
        {coords && (
          <Marker
            position={[coords.latitude, coords.longitude]}
            icon={locationPin}
          >
            <Popup>You are here</Popup>
          </Marker>
        )}
      </MapContainer>
      {selectedZone && (
        <SpeciesSidebar
          zoneName={selectedZone}
          species={SPECIES}
          onClose={() => setSelectedZone(null)}
        />
      )}
    </div>
  )
}
