import { MapContainer, TileLayer, GeoJSON, Marker, Popup } from 'react-leaflet'
import { divIcon, type LeafletMouseEvent } from 'leaflet'
import { useAppDispatch, useAppSelector } from '../../../hooks/redux'
import {
  selectQuery,
  updateSelectedBlock,
  updateSelectedSite,
} from '../../../store/mapSlice'
import FlyToUser from './FlyToUser'
import type { ZonesGeoJSON } from '../../../helpers/siteLocation'
import { useEffect, useMemo, useState } from 'react'
import {
  getObservationBlocks,
  getObservationSites,
} from '../../../apis/mapCharts.api'
import { scaleSequential } from 'd3-scale'
import { interpolateGreens, interpolateYlGn } from 'd3-scale-chromatic'
const MAP_CENTER: [number, number] = [-37.6, 145.2]

const locationPin = divIcon({
  html: "<span style='font-size: 32px; line-height: 1; display: block;'>📍</span>",
  className: '',
  iconSize: [32, 32],
  iconAnchor: [16, 32],
})

interface MapLayerProps {
  mode: 'site' | 'block'
  geoData: ZonesGeoJSON | null
  coords: { latitude: number; longitude: number } | null
  currentRegion: string[] | undefined
  hoveredZone: string | null
  isDesktop: boolean
  setHoveredZone: (id: string | null) => void
  setActiveTab: (tab: 'species' | 'filters') => void
  setDrawerOpen: (open: boolean) => void
}

export default function MapLayer({
  mode,
  geoData,
  coords,
  currentRegion,
  hoveredZone,
  isDesktop,
  setHoveredZone,
  setActiveTab,
  setDrawerOpen,
}: MapLayerProps) {
  const dispatch = useAppDispatch()
  const query = useAppSelector(selectQuery)
  const params = useMemo(
    () => ({
      taxa: query.taxa,
      commonName: query.species,
    }),
    [query],
  )
  const [statsLookup, setStatsLookup] = useState<
    Record<
      string,
      {
        observationCount: number
        speciesCount: number
      }
    >
  >({})

  const maxObservation = useMemo(
    () =>
      Math.max(...Object.values(statsLookup).map((s) => s.observationCount), 1),
    [statsLookup],
  )

  const speciesScale = useMemo(
    () => scaleSequential(interpolateYlGn).domain([0, maxObservation * 0.7]),
    [maxObservation],
  )

  const overallScale = useMemo(
    () =>
      scaleSequential(interpolateGreens)
        .domain([0, maxObservation * 0.7]),
    [maxObservation],
  )

  const hasSpeciesFilter =
    !!query.species || (query.taxa?.length ?? 0) > 0

  useEffect(() => {
    async function loadDistribution() {
      try {
        if (mode === 'site') {
          const { sites } = await getObservationSites(params)

          const lookup = Object.fromEntries(
            sites.map((site) => [
              site.siteCode,
              {
                observationCount: site.observationCount,
                speciesCount: site.speciesCount,
              },
            ]),
          )
          setStatsLookup(lookup)
        } else {
          const { blocks } = await getObservationBlocks(params)

          const lookup = Object.fromEntries(
            blocks.map((block) => [
              String(block.block),
              {
                observationCount: block.observationCount,
                speciesCount: block.speciesCount,
              },
            ]),
          )
          setStatsLookup(lookup)
        }
      } catch (error) {
        console.error('❌ loadDistribution failed:', error)
      }
    }

    loadDistribution()
  }, [mode, params])

  return (
    <MapContainer
      key={mode}
      center={MAP_CENTER}
      zoom={10}
      className="absolute inset-0 z-0 h-screen w-full"
    >
      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

      <FlyToUser coords={coords} />

      {geoData && (
        <GeoJSON
          key={`${mode}-${currentRegion}-${Object.keys(statsLookup).length}`}
          data={geoData}
          style={(feature) => {
            const id =
              mode === 'site'
                ? feature?.properties?.site
                : String(feature?.properties?.block)

            const isSelected = currentRegion?.includes(id)
            const isHovered = hoveredZone === id
            const observationCount = statsLookup[id]?.observationCount ?? 0
            const fillColor = hasSpeciesFilter
              ? speciesScale(observationCount)
              : overallScale(observationCount)
            return {
              color: isSelected ? '#b45309' : '#2d6a4f',
              fillColor: isSelected ? '#f59e0b' : fillColor,
              weight: isSelected ? 4 : isHovered ? 3 : 2,
              fillOpacity: isSelected ? 0.75 : 0.45,
            }
          }}
          onEachFeature={(feature, layer) => {
            const id =
              mode === 'site'
                ? feature.properties.site
                : String(feature.properties.block)
            const stats = statsLookup[id]
            layer.bindTooltip(
              `<strong>${mode === 'site' ? `Site ${id}` : `Block ${id}`}</strong><br/>
                            Observations: ${stats?.observationCount ?? 0}<br/>
                            Species: ${stats?.speciesCount ?? 0}`,
            )
            layer.on('mouseover', () => setHoveredZone(id))
            layer.on('mouseout', () => setHoveredZone(null))

            layer.on('click', (e: LeafletMouseEvent) => {
              const multiselect = e.originalEvent.shiftKey
              const isAlreadySelected = currentRegion?.includes(id)

              let newSelection: string[] = []

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
  )
}
