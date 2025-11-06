import React, { type JSX } from "react";
import { MapContainer, Marker, Popup, TileLayer } from "react-leaflet";
// import ApiDisplay from "./components/ApiDisplay";

const Map: React.FC = (): JSX.Element => {
  return (
    <section style={{ width: "100%", height: "100vh" }}>
      <MapContainer
        center={[51.505, -0.09] as const}
        zoom={13}
        scrollWheelZoom={false}
        style={{ width: "100%", height: "100%" }}
      >
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        <Marker position={[51.505, -0.09]}>
          <Popup>
            A pretty CSS3 popup. <br /> Easily customizable.
          </Popup>
        </Marker>
      </MapContainer>
    </section>
  );
};

export default Map;
