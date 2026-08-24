import { useEffect, useRef, useState } from 'react'
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
  selectQuery,
  updateMode,
  updateSelectedBlock,
  updateSelectedSite,
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

  const [drawerOpen, setDrawerOpen] = useState(false)
  const [activeTab, setActiveTab] = useState<'species' | 'filters'>('species')

  const isDesktop = windowWidth >= 1024
  const modes: { label: string; value: 'site' | 'block' }[] = [
    { label: '30 Sites', value: 'site' },
    { label: '5 Blocks', value: 'block' },
  ]

  const [multiSelectMode, setMultiSelectMode] = useState(false)
  const selectedCount = currentRegion?.length ?? 0
  const query = useAppSelector(selectQuery)

  const clearRegionSelection = () => {
    if (mode === 'block') dispatch(updateSelectedBlock([]))
    else dispatch(updateSelectedSite([]))
  }

  const handleDoneMultiSelect = () => {
    setMultiSelectMode(false)
    if (selectedCount > 0) {
      setActiveTab('species')
      setDrawerOpen(true)
    }
  }

  // Once the user has actually picked something, track it — so we only
  // auto-exit multiselect when a real selection gets cleared back to 0,
  // not the moment multiselect mode is first turned on (which also starts at 0).
  const hadSelectionRef = useRef(false)
  useEffect(() => {
    if (selectedCount > 0) {
      hadSelectionRef.current = true
    } else if (hadSelectionRef.current && multiSelectMode) {
      setMultiSelectMode(false)
      hadSelectionRef.current = false
    }
  }, [selectedCount, multiSelectMode])

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
      {query.tenure && mode === 'site' && (
        <div className="fixed top-36 left-1/2 z-50 -translate-x-1/2">
          <div className="flex items-center gap-1.5 whitespace-nowrap rounded-xl border border-purple-300 bg-purple-100 px-4 py-2 shadow-md">
            <span className="h-2.5 w-2.5 shrink-0 rounded-full bg-red-500" />
            <span className="text-xs font-semibold text-purple-900 sm:text-sm">
              Showing {query.tenure} sites only
            </span>
          </div>
        </div>
      )}
      <div
        className="fixed top-20 z-40 flex flex-col sm:flex-row items-stretch sm:items-center gap-1 sm:gap-2 rounded-lg sm:rounded-xl bg-white p-1 sm:p-2 shadow-md transition-all"
        style={{ right: isDesktop ? actualRightWidth + 20 : 12 }}
      >
        {modes.map(({ label, value }) => (
          <button
            key={value}
            onClick={() => dispatch(updateMode(value))}
            className={`whitespace-nowrap px-2 py-1 sm:px-3 sm:py-2 rounded-lg sm:rounded-xl text-[9px] sm:text-xs font-semibold shadow-sm transition-all duration-200 active:scale-95 ${
              mode === value
                ? 'bg-green-700 text-white border border-green-700 hover:bg-[var(--button-hover)]'
                : 'bg-green-10 text-green-700 border border-green-700/30 hover:bg-green-100'
            }`}
          >
            {label}
          </button>
        ))}

        {!multiSelectMode && (
          <div className="sm:pl-2 sm:border-l sm:border-gray-200">
            <button
              onClick={() => setMultiSelectMode(true)}
              className="w-full sm:w-auto px-2 py-1 sm:px-3 sm:py-2 rounded-lg sm:rounded-xl border border-green-700/30 bg-green-50 text-green-700 text-[9px] sm:text-xs font-semibold shadow-sm transition-all duration-200 hover:bg-green-100 active:scale-95"
              title="Select multiple"
              aria-label="Select multiple zones"
            >
              Multi Select
            </button>
          </div>
        )}

        {(multiSelectMode || (isDesktop && selectedCount > 0)) && (
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-1 sm:gap-2 sm:pl-2 sm:border-l sm:border-gray-200">
            <span className="flex items-center justify-center gap-1 sm:gap-2 rounded-lg sm:rounded-xl border border-green-700/20 bg-green-50 px-2 py-1 sm:px-3 sm:py-2 text-[9px] sm:text-xs font-semibold text-green-700 shadow-sm">
              {selectedCount} selected
              {selectedCount > 0 && (
                <button
                  onClick={clearRegionSelection}
                  aria-label="Clear selection"
                  className="flex h-4 w-4 sm:h-5 sm:w-5 items-center justify-center rounded-full bg-white text-green-700 transition hover:bg-green-100 active:scale-95"
                >
                  ×
                </button>
              )}
            </span>

            <button
              onClick={handleDoneMultiSelect}
              className="flex items-center justify-center gap-1 px-2 py-1 sm:px-3 sm:py-2 rounded-lg sm:rounded-xl bg-green-700 text-white text-[9px] sm:text-xs font-semibold shadow-sm transition-all duration-200 hover:bg-[var(--button-hover)] hover:shadow-md active:scale-95"
              title="Done"
              aria-label="Done selecting zones"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                className="h-3 w-3 sm:h-4 sm:w-4"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M5 12l4 4L19 7"
                />
              </svg>
              Done
            </button>
          </div>
        )}
      </div>

      {/* ── Find My Location button ── */}
      <button
        onClick={locate}
        disabled={loading}
        style={{ left: isDesktop ? NAV_WIDTH + actualLeftWidth + 20 : '90px' }}
        className="fixed z-40 bottom-20 lg:bottom-8 px-2 py-1 text-md text-green-900 bg-white border-2 border-green-900 rounded cursor-pointer transition-[left,bottom] duration-300"
      >
        {loading ? 'Locating...' : 'Find My Location'}
      </button>

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
          style={{ right: isDesktop ? actualRightWidth + 20 : 20 }}
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
        multiSelectMode={multiSelectMode}
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
