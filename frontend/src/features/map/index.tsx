import MapView from "./components/MapView";

export default function MapPage() {
  return (
    <div style={{ position: "relative" }}>
      
      {/* Background Map */}
      <MapView />

      {/* Overlay UI (later) */}
      <div style={{ position: "relative", zIndex: 10 }}>
        <h1>Map Page</h1>
      </div>

    </div>
  );
}