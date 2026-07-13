'use client';

import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from "react-leaflet";
import { useEffect } from "react";
import L from "leaflet";

const markerIcon = new L.Icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

interface Props {
  center: [number, number];
  marker: [number, number] | null;
  onSelect: (lat: number, lng: number) => void;
  interactive?: boolean;
}

function ClickHandler({ onSelect }: { onSelect: (lat: number, lng: number) => void }) {
  useMapEvents({
    click(e) {
      onSelect(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

function Recenter({ center }: { center: [number, number] }) {
  const map = useMap();
  useEffect(() => {
    // Reverted back to setView. It is instantaneous and cannot be interrupted by React.
    map.setView(center, map.getZoom());
  }, [center, map]);
  return null;
}

export default function MapCanvas({ center, marker, onSelect, interactive = true }: Props) {
  return (
    <>
    {/* 👇 This completely bypasses the "Module not found" error and loads instantly */}
      <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
    <MapContainer
      center={center}
      zoom={14}
      style={{ height: "100%", width: "100%" }}
      dragging={interactive}
      zoomControl={interactive}
      scrollWheelZoom={interactive}
      doubleClickZoom={interactive}
      touchZoom={interactive}
      attributionControl={interactive}
    >
      <TileLayer
        attribution="&copy; OpenStreetMap contributors"
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {interactive && <ClickHandler onSelect={onSelect} />}
      <Recenter center={center} />
      {marker && (
        <Marker
          position={marker}
          icon={markerIcon}
          draggable={interactive}
          eventHandlers={
            interactive
              ? {
                  dragend: (e) => {
                    const pos = e.target.getLatLng();
                    onSelect(pos.lat, pos.lng);
                  },
                }
              : undefined
          }
        />
      )}
    </MapContainer>
    </>
  );
}