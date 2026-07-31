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
  console.log('SELECTOR OUTPUT:', query)
  const params = useMemo(
    () => ({
      block: query.blocks,
      siteCode: query.sites,
      taxa: query.taxa,
      commonName: query.species,
    }),
    [query],
  )
  console.log('API PARAMS SENT:', params)
  const [statsLookup, setStatsLookup] = useState<
    Record<
      string,
      {
        observationCount: number
        speciesCount: number
      }
    >
  >({})

  useEffect(() => {
    async function loadDistribution() {
      try {
        if (mode === 'site') {
          const { sites } = await getObservationSites(params)

          setStatsLookup(
            Object.fromEntries(
              sites.map((site) => [
                site.siteCode,
                {
                  observationCount: site.observationCount,
                  speciesCount: site.speciesCount,
                },
              ]),
            ),
          )
        } else {
          const { blocks } = await getObservationBlocks(params)

          setStatsLookup(
            Object.fromEntries(
              blocks.map((block) => [
                String(block.block),
                {
                  observationCount: block.observationCount,
                  speciesCount: block.speciesCount,
                },
              ]),
            ),
          )
        }
      } catch (error) {
        console.error(error)
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
          key={`${mode}-${currentRegion}`}
          data={geoData}
          style={(feature) => {
            const id =
              mode === 'site'
                ? feature?.properties?.site
                : String(feature?.properties?.block)

            const isSelected = currentRegion?.includes(id)
            const isHovered = hoveredZone === id
            const observationCount = statsLookup[id]?.observationCount ?? 0

            const maxObservation = Math.max(
              ...Object.values(statsLookup).map((s) => s.observationCount),
              1,
            )

            const intensity = observationCount / maxObservation
            console.log(id, intensity)

            const fillColor =
              intensity > 0.8
                ? '#14532d'
                : intensity > 0.6
                  ? '#15803d'
                  : intensity > 0.4
                    ? '#22c55e'
                    : intensity > 0.2
                      ? '#86efac'
                      : '#dcfce7'
            return {
              color: isSelected ? '#b45309' : 'green',
              fillColor: isSelected
                ? '#f59e0b'
                : isHovered
                  ? '#86efac'
                  : fillColor,
              fillOpacity: isSelected ? 0.6 : isHovered ? 0.5 : 0.3,
              weight: isSelected ? 3 : 2,
            }
          }}
          onEachFeature={(feature, layer) => {
            const id =
              mode === 'site'
                ? feature.properties.site
                : String(feature.properties.block)
            const observationCount = statsLookup[id]?.observationCount ?? 0
            const stats = statsLookup[id]
            console.log(stats)
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
