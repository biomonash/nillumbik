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
import {
  selectCurrentRegion,
  selectMode,
  updateMode,
  updateSelectedBlock,
  updateSelectedSite,
} from '../../../store/mapSlice'
import { useAppDispatch, useAppSelector } from '../../../hooks/redux'

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
    if (coords) map.flyTo([coords.latitude, coords.longitude], 14)
  }, [coords, map])
  return null
}

export default function MapView() {
  const [geoData, setGeoData] = useState<ZonesGeoJSON | null>(null)
  const mode = useAppSelector(selectMode)
  const dispatch = useAppDispatch()
  const [currentSite, setCurrentSite] = useState<SiteProperties | null>(null)
  const currentRegion = useAppSelector(selectCurrentRegion)
  // const [selectedZone, setSelectedZone] = useState<string | null>(null)
  const [hoveredZone, setHoveredZone] = useState<string | null>(null)
  const { coords, loading, error, locate } = useUserLocation()

  const [windowWidth, setWindowWidth] = useState(window.innerWidth)

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth)
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  useEffect(() => {
    const file =
      mode === 'site' ? '/nillumbik_30zones.geojson' : '/blocks.geojson'
    setGeoData(null)
    fetch(file)
      .then((res) => res.json())
      .then((data) => setGeoData(data))
  }, [mode])

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

  const isDesktop = windowWidth >= 768
  const leftSidebarVisible = !!selectedZone
  const rightSidebarWidth = 350
  const leftSidebarWidth = 320
  const navWidth = 80

  return (
    <div style={{ position: 'relative' }}>
      <div
        style={{
          position: 'fixed',
          top: 80,
          right: isDesktop ? rightSidebarWidth + 20 : 20,
          zIndex: 40,
          background: 'white',
          padding: '8px',
          borderRadius: '10px',
          display: 'flex',
          gap: '10px',
          boxShadow: '0 2px 6px rgba(0,0,0,0.2)',
          transition: 'right 0.3s ease',
        }}
      >
        <button
          onClick={() => dispatch(updateMode('site'))}
          style={{
            padding: '6px 12px',
            borderRadius: '6px',
            border: '1px solid #ccc',
            background: mode === 'site' ? 'green' : 'white',
            color: mode === 'site' ? 'white' : 'black',
            cursor: 'pointer',
          }}
        >
          30 Sites
        </button>
        <button
          onClick={() => dispatch(updateMode('block'))}
          style={{
            padding: '6px 12px',
            borderRadius: '6px',
            border: '1px solid #ccc',
            background: mode === 'block' ? 'green' : 'white',
            color: mode === 'block' ? 'white' : 'black',
            cursor: 'pointer',
          }}
        >
          5 Blocks
        </button>
      </div>

      <button
        onClick={locate}
        disabled={loading}
        style={{
          position: 'fixed',
          bottom: isDesktop ? '30px' : '80px',
          left: (isDesktop && leftSidebarVisible) ? (navWidth + leftSidebarWidth + 20) : '90px',
          zIndex: 40,
          padding: '8px 16px',
          color: 'darkgreen',
          backgroundColor: 'white',
          border: '2px solid darkgreen',
          borderRadius: '4px',
          cursor: 'pointer',
          transition: 'left 0.3s ease, bottom 0.3s ease',
        }}
      >
        {loading ? 'Locating...' : 'Find My Location'}
      </button>

      {coords && (
        <div
          style={{
            position: 'fixed',
            bottom: isDesktop ? '20px' : '130px',
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 40,
            backgroundColor: 'white',
            color: 'darkgreen',
            padding: '10px 16px',
            borderRadius: '8px',
            border: '2px solid darkgreen',
            transition: 'bottom 0.3s ease',
            whiteSpace: 'nowrap',
            fontSize: isDesktop ? '14px' : '12px'
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
            position: 'fixed',
            top: '140px',
            right: isDesktop ? rightSidebarWidth + 20 : 20,
            zIndex: 40,
            color: 'red',
            backgroundColor: 'white',
            padding: '8px',
            borderRadius: '4px',
            transition: 'right 0.3s ease',
            boxShadow: '0 2px 6px rgba(0,0,0,0.2)'
          }}
        >
          {error}
        </div>
      )}

      <MapContainer
        key={mode}
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
            key={`${mode}-${currentRegion}`}
            data={geoData}
            style={(feature) => {
              const id =
                mode === 'site'
                  ? feature?.properties?.site
                  : String(feature?.properties?.block)
              const isSelected = currentRegion === id
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
              const id =
                mode === 'site'
                  ? feature.properties.site
                  : String(feature.properties.block)
              layer.on('mouseover', () => setHoveredZone(id))
              layer.on('mouseout', () => setHoveredZone(null))
              layer.on('click', () => {
                const block = String(feature.properties.block)
                const isAlreadySelected = currentRegion === id

                if (mode === 'block') {
                  dispatch(updateSelectedBlock(block))
                } else {
                  dispatch(updateSelectedSite(isAlreadySelected ? null : id))
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
      <SpeciesSidebar onClose={() => {}} />
    </div>
  )
}