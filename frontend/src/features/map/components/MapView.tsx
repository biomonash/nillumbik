import { useEffect, useState } from 'react'
import 'leaflet/dist/leaflet.css'
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
} from '../../../store/mapSlice'
import { useAppDispatch, useAppSelector } from '../../../hooks/redux'
import DesktopSidebar from './DesktopSidebar'
import MapLayer from './MapLayer'
import MobileDrawer from './MobileDrawer'

const NAV_WIDTH = 80

export default function MapView() {
  const [leftWidth, setLeftWidth] = useState(280)
  const [rightWidth, setRightWidth] = useState(280)

  const [leftCollapsed, setLeftCollapsed] = useState(false)
  const [rightCollapsed, setRightCollapsed] = useState(false)

  const actualLeftWidth = leftCollapsed ? 60 : leftWidth
  const actualRightWidth = rightCollapsed ? 60 : rightWidth
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
  const modes: { label: string; value: 'site' | 'block' }[] = [
    { label: '30 Sites', value: 'site' },
    { label: '5 Blocks', value: 'block' },
  ]

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
    <div className="relative h-screen overflow-hidden">
      <div
        className="fixed top-20 z-40 flex flex-wrap gap-2 rounded-xl bg-white p-2 shadow-md transition-all max-w-[calc(100vw-2rem)]"
        style={{
          right: isDesktop ? actualRightWidth + 20 : 20,
        }}
      >
        {modes.map(({ label, value }) => (
          <button
            key={value}
            onClick={() => dispatch(updateMode(value))}
            className={`flex-1 sm:flex-none rounded-md border px-3 py-2 text-sm sm:text-base transition ${
              mode === value
                ? 'border-green-700 bg-green-700 text-white'
                : 'border-gray-300 bg-white text-black hover:bg-gray-50'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* ── Find My Location button ── */}
      <button
        onClick={locate}
        disabled={loading}
        style={{
          left: isDesktop ? NAV_WIDTH + actualLeftWidth + 20 : '90px',
        }}
        className="fixed z-40 bottom-20 lg:bottom-8 px-2 py-1 text-md text-green-900 bg-white border-2 border-green-900 rounded cursor-pointer transition-[left,bottom] duration-300"
      >
        {loading ? 'Locating...' : 'Find My Location'}
      </button>

      {/* ── Location status banner ── */}
      {coords && (
        <div
          className={`fixed left-1/2 z-40 -translate-x-1/2 bg-white px-4 py-2.5 rounded-lg border-2 border-green-900 transition-[bottom] duration-300 whitespace-nowrap text-xs lg:text-sm bottom-[130px] lg:bottom-5 ${
            currentSite ? 'text-green-900' : 'text-red-600'
          }`}
        >
          {currentSite
            ? `You are in monitoring site: ${currentSite.site} (Block ${currentSite.block})`
            : 'You are outside Nillumbik monitoring zones'}
        </div>
      )}

      {error && (
        <div
          style={{
            right: isDesktop ? actualRightWidth + 20 : 20,
          }}
          className="fixed top-[140px] z-40 text-red-600 bg-white p-2 rounded shadow-[0_2px_6px_rgba(0,0,0,0.2)] transition-[right] duration-300"
        >
          {error}
        </div>
      )}

      <MapLayer
        mode={mode}
        geoData={geoData}
        coords={coords}
        currentRegion={currentRegion}
        hoveredZone={hoveredZone}
        isDesktop={isDesktop}
        setHoveredZone={setHoveredZone}
        setActiveTab={setActiveTab}
        setDrawerOpen={setDrawerOpen}
      />

      {isDesktop && (
        <DesktopSidebar
          side="left"
          width={leftWidth}
          collapsed={leftCollapsed}
          setWidth={setLeftWidth}
          setCollapsed={setLeftCollapsed}
          navWidth={NAV_WIDTH}
        >
          <SpeciesSidebar />
        </DesktopSidebar>
      )}

      {isDesktop && (
        <DesktopSidebar
          side="right"
          width={rightWidth}
          collapsed={rightCollapsed}
          setWidth={setRightWidth}
          setCollapsed={setRightCollapsed}
        >
          <MapCharts />
        </DesktopSidebar>
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
