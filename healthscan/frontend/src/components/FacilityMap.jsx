import { useEffect, useRef } from "react";
import L from "leaflet";

// Perbaikan default marker icon Leaflet agar tidak pecah saat dibundle Vite
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

const defaultIcon = L.icon({
  iconUrl: markerIcon,
  iconRetinaUrl: markerIcon2x,
  shadowUrl: markerShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

const userIcon = L.icon({
  iconUrl: markerIcon,
  iconRetinaUrl: markerIcon2x,
  shadowUrl: markerShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  className: "user-location-marker",
});

export default function FacilityMap({ facilities, userPosition }) {
  const containerRef = useRef(null);
  const mapRef = useRef(null);
  const layerRef = useRef(null);

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;
    mapRef.current = L.map(containerRef.current, { scrollWheelZoom: false });
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "&copy; OpenStreetMap contributors",
      maxZoom: 19,
    }).addTo(mapRef.current);
    layerRef.current = L.layerGroup().addTo(mapRef.current);

    return () => {
      mapRef.current?.remove();
      mapRef.current = null;
    };
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    const layer = layerRef.current;
    if (!map || !layer) return;

    layer.clearLayers();
    const points = [];

    if (userPosition) {
      L.marker([userPosition.lat, userPosition.lng], { icon: userIcon })
        .bindPopup("Lokasi Anda")
        .addTo(layer);
      points.push([userPosition.lat, userPosition.lng]);
    }

    for (const f of facilities) {
      L.marker([f.lat, f.lng], { icon: defaultIcon })
        .bindPopup(
          `<strong>${f.name}</strong><br/>${f.type}${
            f.distanceKm !== undefined ? `<br/>${f.distanceKm.toFixed(1)} km dari Anda` : ""
          }`
        )
        .addTo(layer);
      points.push([f.lat, f.lng]);
    }

    if (points.length > 0) {
      map.fitBounds(points, { padding: [30, 30], maxZoom: 15 });
    }
    // Leaflet perlu invalidateSize setelah container mungkin berubah ukuran (mis. tab/step berganti)
    setTimeout(() => map.invalidateSize(), 100);
  }, [facilities, userPosition]);

  return <div className="facility-map" ref={containerRef} />;
}
