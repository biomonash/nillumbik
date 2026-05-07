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
  const [selectedBlockCode, setSelectedBlockCode] = useState<string | null>(null)
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
          30 Sites
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
            position: 'relative',
          }}
        >
          5 Zones
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
