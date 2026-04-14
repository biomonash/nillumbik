import { MapContainer, TileLayer, GeoJSON } from "react-leaflet";
import { useEffect, useState } from "react";
import "leaflet/dist/leaflet.css";

export default function MapView() {
  const [geoData, setGeoData] = useState<any>(null);
  const [viewType, setViewType] = useState("zones"); // "zones" | "blocks"
  

  useEffect(() => {
    const file =
        viewType === "zones"
          ? "/nillumbik_30zones.geojson"
          : "/blocks.geojson";

          setGeoData(null);
    fetch(file)
      .then((res) => res.json())
      .then((data) => setGeoData(data));
  }, [viewType]);

  return (

    <><div
    style={{
      position: "absolute",
      top: 20,
      right: 20,
      zIndex: 2000,
      background: "white",
      padding: "8px",
      borderRadius: "10px",
      display: "flex",        
      gap: "10px",              
      boxShadow: "0 2px 6px rgba(0,0,0,0.2)"
    }}
    >
      <button
  onClick={() => setViewType("zones")}
  style={{
    padding: "6px 12px",
    borderRadius: "6px",
    border: "1px solid #ccc",
    background: viewType === "zones" ? "green" : "white",
    color: viewType === "zones" ? "white" : "black",
    cursor: "pointer"
  }}
>
  30 Zones
</button>

<button
  onClick={() => setViewType("blocks")}
  style={{
    padding: "6px 12px",
    borderRadius: "6px",
    border: "1px solid #ccc",
    background: viewType === "blocks" ? "green" : "white",
    color: viewType === "blocks" ? "white" : "black",
    cursor: "pointer"
  }}
>
  Blocks
</button>
    </div>
    <MapContainer
      key={viewType}
      center={[-37.6, 145.2]}
      zoom={10}
      style={{
        height: "100vh",
        width: "100%",
        position: "absolute",
        top: 0,
        left: 0,
        zIndex: 0
      }}
    >
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

        {geoData && (
          <GeoJSON
            key={viewType}
            data={geoData}

            // STYLE EACH ZONE
            style={() => ({
              color: "green",
              fillColor: "green",
              fillOpacity: 0.3
            })}

            // INTERACTION
            onEachFeature={(feature, layer) => {
              layer.on("click", () => {
                console.log("Clicked zone:", feature.properties);

              });
            } } />
        )}
      </MapContainer></>
  );
}