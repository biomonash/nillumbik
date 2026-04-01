import MapView from "./components/MapView";
import MapStats from "../../components/ui/MapStats";
import InfoStats from "../../components/ui/InfoStats";

export default function MapPage() {
  return (
    <div style={{ position: "relative" }}>
      <InfoStats/>
      <MapStats/>
      {/* Background Map */}
      <MapView />

      {/* Overlay UI (later) */}
      <div style={{ position: "relative", zIndex: 10 }}>
        <h1>Map Page</h1>
      </div>
    </div>
  );
}