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
import { divIcon, type LeafletMouseEvent } from 'leaflet'
import { useUserLocation } from '../../../hooks/useUserLocation'
import { findSiteForLocation } from '../../../helpers/siteLocation'
import type {
  ZonesGeoJSON,
  SiteProperties,
} from '../../../helpers/siteLocation'
import SpeciesSidebar from './SpeciesSidebar'
import MapCharts from './MapCharts'
import {
  selectCurrentRegion,
  selectMode,
  updateMode,
  updateSelectedBlock,
  updateSelectedSite,
} from '../../../store/mapSlice'
import { useAppDispatch, useAppSelector } from '../../../hooks/redux'

const NAV_WIDTH = 80
const LEFT_SIDEBAR_WIDTH = 320
const RIGHT_SIDEBAR_WIDTH = 350

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

interface MobileDrawerProps {
  drawerOpen: boolean
  setDrawerOpen: (open: boolean) => void
  activeTab: 'species' | 'filters'
  setActiveTab: (tab: 'species' | 'filters') => void
}

function MobileDrawer({
  drawerOpen,
  setDrawerOpen,
  activeTab,
  setActiveTab,
}: MobileDrawerProps) {
  const handleTabClick = (tab: 'species' | 'filters') => {
    if (!drawerOpen) setDrawerOpen(true)
    setActiveTab(tab)
  }

  return (
    <div
      className={`
        fixed bottom-0 left-0 right-0 z-50
        bg-[var(--muted-foreground2)] rounded-t-2xl shadow-xl
        transition-transform duration-300 ease-in-out
        ${drawerOpen ? 'translate-y-0' : 'translate-y-[calc(100%-56px)]'}
      `}
    >
      <div className="flex items-center my-1 p-5 h-14 gap-2 select-none">
        <button
          onClick={() => handleTabClick('filters')}
          className={`
            flex-1 py-1.5 rounded-full text-xs font-semibold border-2 transition-all duration-200
            ${
              activeTab === 'filters'
                ? 'bg-green-700 border-green-700 text-white'
                : 'bg-transparent border-green-700 text-[var(--button)]'
            }
          `}
        >
          Zone Filter
        </button>
        <button
          onClick={() => handleTabClick('species')}
          className={`
            flex-1 py-1.5 rounded-full text-xs font-semibold border-2 transition-all duration-200
            ${
              activeTab === 'species'
                ? 'bg-green-700  border-green-700 text-white'
                : 'bg-transparent border-green-700 text-[var(--button)]'
            }
          `}
        >
          Species
        </button>

        <i
          onClick={() => setDrawerOpen(!drawerOpen)}
          className={`text-gray-600 text-xs fa cursor-pointer px-1 ${
            drawerOpen ? 'fa-angle-down' : 'fa-angle-up'
          }`}
        />
      </div>

      {/* Content */}
      <div className="max-h-[65vh] overflow-y-auto px-4 pb-8">
        {activeTab === 'species' ? <SpeciesSidebar /> : <MapCharts />}
      </div>
    </div>
  )
}

export default function MapView() {
  const [geoData, setGeoData] = useState<ZonesGeoJSON | null>(null)
  const mode = useAppSelector(selectMode)
  const dispatch = useAppDispatch()
  const [currentSite, setCurrentSite] = useState<SiteProperties | null>(null)
  const currentRegion = useAppSelector(selectCurrentRegion)
  const [hoveredZone, setHoveredZone] = useState<string | null>(null)
  const { coords, loading, error, locate } = useUserLocation()
  const [windowWidth, setWindowWidth] = useState(window.innerWidth)

  // Lifted drawer state so map zone clicks can open/switch the drawer
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [activeTab, setActiveTab] = useState<'species' | 'filters'>('species')

  const isDesktop = windowWidth >= 1024

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth)
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  useEffect(() => {
    const file =
      mode === 'site' ? 'nillumbik_30zones.geojson' : 'blocks.geojson'
    setGeoData(null)
    fetch(`${import.meta.env['BASE_URL']}/${file}`)
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

  return (
    <div style={{ position: 'relative', height: '100vh', overflow: 'hidden' }}>
      <div
        style={{
          position: 'fixed',
          top: 80,
          right: isDesktop ? RIGHT_SIDEBAR_WIDTH + 20 : 20,
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

      {/* ── Find My Location button ── */}
      <button
        onClick={locate}
        disabled={loading}
        style={{
          position: 'fixed',
          bottom: isDesktop ? '30px' : '80px',
          left: isDesktop ? NAV_WIDTH + LEFT_SIDEBAR_WIDTH + 20 : '90px',
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

      {/* ── Location status banner ── */}
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
            fontSize: isDesktop ? '14px' : '12px',
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
            right: isDesktop ? RIGHT_SIDEBAR_WIDTH + 20 : 20,
            zIndex: 40,
            color: 'red',
            backgroundColor: 'white',
            padding: '8px',
            borderRadius: '4px',
            transition: 'right 0.3s ease',
            boxShadow: '0 2px 6px rgba(0,0,0,0.2)',
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
              const isSelected = currentRegion?.includes(id)
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
              layer.on('click', (e: LeafletMouseEvent) => {
                const multiselect = e.originalEvent.shiftKey
                const isAlreadySelected = currentRegion?.includes(id)
                let newSelection = []
                if (multiselect) {
                  newSelection = isAlreadySelected
                    ? (currentRegion?.filter((region) => region !== id) ?? [])
                    : [...(currentRegion ?? []), id]
                } else {
                  newSelection = isAlreadySelected ? [] : [id]
                }
                if (mode === 'block') {
                  dispatch(updateSelectedBlock(newSelection))
                } else {
                  dispatch(updateSelectedSite(newSelection))
                }
                // On mobile: open drawer and switch to species tab
                if (!isDesktop) {
                  setActiveTab('species')
                  setDrawerOpen(true)
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

      {isDesktop && (
        <div className="fixed left-[80px] top-14 h-screen w-[320px] bg-white z-50 flex flex-col shadow-xl">
          <div className="flex-1 overflow-y-auto">
            <SpeciesSidebar />
          </div>
        </div>
      )}

      {isDesktop && (
        <div className="fixed right-0 top-0 h-screen w-[350px] bg-[var(--muted-foreground2)] z-50 flex flex-col shadow-xl">
          <div className="flex-1 overflow-y-auto p-2 pt-14">
            <MapCharts />
          </div>
        </div>
      )}

      {!isDesktop && (
        <MobileDrawer
          drawerOpen={drawerOpen}
          setDrawerOpen={setDrawerOpen}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
        />
      )}
    </div>
  )
}
