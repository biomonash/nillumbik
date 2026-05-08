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
  getSpeciesDetailBySite,
  getSpeciesDetailByBlock,
  type Species,
} from '../../../apis/speciesList.api'
//import { LocateFixed } from 'lucide-react'

interface MapViewProps {
  onZoneSelect: (block: string) => void
}

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

export default function MapView({ onZoneSelect }: MapViewProps) {
  const [geoData, setGeoData] = useState<ZonesGeoJSON | null>(null)
  const [viewType, setViewType] = useState('zones')
  const [currentSite, setCurrentSite] = useState<SiteProperties | null>(null)
  const [selectedZone, setSelectedZone] = useState<string | null>(null)
  const [hoveredZone, setHoveredZone] = useState<string | null>(null)
  const [selectedSiteCode, setSelectedSiteCode] = useState<string | null>(null)
  const [selectedBlockCode, setSelectedBlockCode] = useState<string | null>(
    null,
  )
  const [species, setSpecies] = useState<Species[]>([])
  const [speciesLoading, setSpeciesLoading] = useState(false)
  const [speciesError, setSpeciesError] = useState<string | null>(null)
  const { coords, loading, error, locate } = useUserLocation()

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

  useEffect(() => {
    if (!selectedSiteCode && !selectedBlockCode) return

    let cancelled = false

    setSpeciesLoading(true)
    setSpeciesError(null)
    setSpecies([])

    const request =
      selectedSiteCode !== null
        ? getSpeciesDetailBySite(selectedSiteCode)
        : getSpeciesDetailByBlock(Number(selectedBlockCode))

    request
      .then((data) => {
        if (!cancelled) {
          setSpecies(data)
          setSpeciesLoading(false)
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setSpeciesError(err.message)
          setSpeciesLoading(false)
        }
      })

    return () => {
      cancelled = true
    }
  }, [selectedSiteCode, selectedBlockCode])

  return (
    <div>
      <div className="absolute top-3 right-3 sm:top-4 sm:right-4 lg:top-5 lg:right-[370px] z-[2000] bg-white p-1.5 sm:p-2 rounded-lg sm:rounded-xl shadow-md">
        <div className="flex flex-row lg:flex-col gap-1.5 sm:gap-2">
          <button
            onClick={() => setViewType('zones')}
            className={`px-2.5 py-1.5 sm:px-3 sm:py-2 rounded-md border cursor-pointer text-xs sm:text-sm whitespace-nowrap transition-all ${
              viewType === 'zones'
                ? 'bg-green-700 text-white border-green-700 shadow-sm'
                : 'bg-white text-black border-gray-300 hover:border-green-500 hover:bg-green-50'
            }`}
          >
            <span className="hidden sm:inline">30 Sites</span>
          </button>
          <button
            onClick={() => setViewType('blocks')}
            className={`px-2.5 py-1.5 sm:px-3 sm:py-2 rounded-md border cursor-pointer text-xs sm:text-sm whitespace-nowrap transition-all ${
              viewType === 'blocks'
                ? 'bg-green-700 text-white border-green-700 shadow-sm'
                : 'bg-white text-black border-gray-300 hover:border-green-500 hover:bg-green-50'
            }`}
          >
            <span className="hidden sm:inline">5 Zones</span>
          </button>
        </div>
      </div>

      <button
        onClick={locate}
        disabled={loading}
        className="fixed bottom-20 left-4 sm:left-6lg:bottom-6 lg:left-24 z-[10] px-3 py-2 text-sm font-medium text-green-900 bg-white border border-green-900 rounded-full shadow-lg cursor-pointer transition-all hover:bg-green-50 disabled:opacity-50"
      >
        {loading ? 'Locating...' : 'Find My Location'}
      </button>
      {/**<LocateFixed
          size={22}
          className={loading ? 'animate-pulse text-green-900' : 'text-green-900'}
        /> */}

      {coords && (
        <div className="fixed bottom-16 left-1/2 -translate-x-1/2 lg:bottom-6 z-[1000] max-w-[85vw] px-3 py-2 bg-white text-green-900 text-xs sm:text-sm font-medium rounded-full shadow-lg border border-green-200 text-center">
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
              const siteCode = feature?.properties?.site
              const block = String(
                feature?.properties.block ??
                  feature?.properties.BLOCK ??
                  feature?.properties.zone ??
                  feature?.properties.id,
              )

              const selectedName =
                viewType === 'zones' ? `Site ${siteCode}` : `Zone ${block}`

              const hoverId = viewType === 'zones' ? siteCode : block

              const isSelected = selectedZone === selectedName
              const isHovered = hoveredZone === hoverId
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
              const hoverId =
                viewType === 'zones'
                  ? String(feature.properties.site)
                  : String(
                      feature.properties.block ??
                        feature.properties.BLOCK ??
                        feature.properties.zone ??
                        feature.properties.id,
                    )

              layer.on('mouseover', () => setHoveredZone(hoverId))
              layer.on('mouseout', () => setHoveredZone(null))
              layer.on('click', () => {
                console.log('Clicked:', feature.properties)

                const rawSiteCode = String(
                  feature.properties.site ??
                    feature.properties.code ??
                    feature.properties.siteCode ??
                    '',
                )

                const siteCode = rawSiteCode.replaceAll('-', '')
                const block = String(
                  feature.properties.block ??
                    feature.properties.BLOCK ??
                    feature.properties.zone ??
                    feature.properties.id,
                )

                const name =
                  viewType === 'zones' ? `Site ${siteCode}` : `Zone ${block}`

                const isDeselecting = selectedZone === name

                setSelectedZone(isDeselecting ? null : name)

                if (isDeselecting) {
                  setSelectedSiteCode(null)
                  setSelectedBlockCode(null)
                  onZoneSelect('')
                  return
                }

                if (viewType === 'zones') {
                  setSelectedSiteCode(siteCode)
                  setSelectedBlockCode(null)
                  onZoneSelect(block)
                } else {
                  setSelectedSiteCode(null)
                  setSelectedBlockCode(block)
                  onZoneSelect(block)
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
          species={species}
          loading={speciesLoading}
          error={speciesError}
          onClose={() => {
            setSelectedZone(null)
            setSelectedSiteCode(null)
            setSelectedBlockCode(null)
            onZoneSelect('')
          }}
        />
      )}
    </div>
  )
}
