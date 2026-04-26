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
import { divIcon } from 'leaflet'
import SpeciesSidebar from './SpeciesSidebar'
import { SPECIES } from '../data/species'

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
  const [currentSite, setCurrentSite] = useState<SiteProperties | null>(null)
  const { coords, loading, error, locate } = useUserLocation()
  const [selectedZone, setSelectedZone] = useState<string | null>(null)
  const [hoveredZone, setHoveredZone] = useState<string | null>(null);

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
      {/* Find My Location Button */}
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
      {/* Location Info */}
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
            key={selectedZone}
            data={geoData}
            
            // 🔥 STYLE EACH ZONE (selected/hovered/default)
            style={(feature) => {
              const site = feature?.properties?.site;
              const isSelected = selectedZone === `Zone ${site}`;
              const isHovered = hoveredZone === site;

              return {
                color: isSelected ? "#b45309" : "green",
                fillColor: isSelected ? "#f59e0b" : isHovered ? "#86efac" : "green",
                fillOpacity: isSelected ? 0.6 : isHovered ? 0.5 : 0.3,
                weight: isSelected ? 3 : 2,
              };
            }}

            // 🔥 INTERACTION (hover/select/deselect)
            onEachFeature={(feature, layer) => {
              const site = feature.properties.site;

              layer.on("mouseover", () => {
                setHoveredZone(site);
              });

              layer.on("mouseout", () => {
                setHoveredZone(null);
              });

              layer.on('click', () => {
                console.log('Clicked zone:', feature.properties)
                const zoneName = `Zone ${feature.properties.site}`;
                setSelectedZone(prev => prev === zoneName ? null : zoneName);
              })
            }}
          />
        )}
        {/* Location Pin */}
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
