import React, { useEffect, useState } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import CircularProgress from "@mui/material/CircularProgress";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Polyline,
  useMap,
} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Resolve default leaflet icons for Next.js bundler
const staffIcon = L.icon({
  iconUrl:
    "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

const patientIcon = L.icon({
  iconUrl:
    "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

interface LeafletMapProps {
  startLat: number;
  startLng: number;
  destLat: number;
  destLng: number;
  destAddress?: string;
}

// Sub-component to fit map view to show both coordinates
const FitBounds: React.FC<{ points: [number, number][] }> = ({ points }) => {
  const map = useMap();
  useEffect(() => {
    if (points && points.length > 0) {
      const bounds = L.latLngBounds(points);
      map.fitBounds(bounds, { padding: [40, 40] });
    }
  }, [map, points]);
  return null;
};

export const LeafletMap: React.FC<LeafletMapProps> = ({
  startLat,
  startLng,
  destLat,
  destLng,
  destAddress = "Patient Destination",
}) => {
  const [routePath, setRoutePath] = useState<[number, number][]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [distance, setDistance] = useState<string>("");
  const [duration, setDuration] = useState<string>("");

  useEffect(() => {
    async function fetchRoute() {
      setLoading(true);
      try {
        const response = await fetch(
          `https://router.project-osrm.org/route/v1/driving/${startLng},${startLat};${destLng},${destLat}?overview=full&geometries=geojson`,
        );
        const data = await response.json();
        if (data.code === "Ok" && data.routes && data.routes.length > 0) {
          const coords = data.routes[0].geometry.coordinates;
          const path = coords.map((c: [number, number]) => [c[1], c[0]]) as [
            number,
            number,
          ][];
          setRoutePath(path);

          // Format metadata
          const distKm = (data.routes[0].distance / 1000).toFixed(1);
          const durMin = Math.round(data.routes[0].duration / 60);
          setDistance(`${distKm} km`);
          setDuration(`${durMin} mins`);
        } else {
          // Fallback to straight line if OSRM fails
          setRoutePath([
            [startLat, startLng],
            [destLat, destLng],
          ]);
        }
      } catch (err) {
        console.error("OSRM Route Fetch Failed:", err);
        setRoutePath([
          [startLat, startLng],
          [destLat, destLng],
        ]);
      } finally {
        setLoading(false);
      }
    }

    fetchRoute();
  }, [startLat, startLng, destLat, destLng]);

  const mapPoints: [number, number][] = [
    [startLat, startLng],
    [destLat, destLng],
  ];

  return (
    <Box sx={{ position: "relative", width: "100%", height: "100%" }}>
      {/* Route Info Overlay */}
      {!loading && distance && (
        <Box
          sx={{
            position: "absolute",
            top: 10,
            left: 10,
            zIndex: 1000,
            bgcolor: "rgba(255,255,255,0.92)",
            p: 1.5,
            borderRadius: "10px",
            boxShadow: "0 4px 18px rgba(0,0,0,0.12)",
            backdropFilter: "blur(4px)",
            border: "1px solid rgba(0,0,0,0.06)",
          }}
        >
          <Typography
            variant="caption"
            sx={{ fontWeight: 700, color: "text.secondary" }}
          >
            OSRM Shortest Route
          </Typography>
          <Typography
            variant="subtitle2"
            sx={{ fontWeight: 800, color: "primary.main" }}
          >
            Distance: {distance}
          </Typography>
          <Typography
            variant="caption"
            sx={{ fontWeight: 600, display: "block" }}
          >
            ETA: {duration}
          </Typography>
        </Box>
      )}

      {loading ? (
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: "100%",
            height: "100%",
            bgcolor: "rgba(0,0,0,0.02)",
          }}
        >
          <CircularProgress size={32} />
        </Box>
      ) : (
        <MapContainer
          center={[startLat, startLng]}
          zoom={13}
          style={{ width: "100%", height: "100%", borderRadius: "12px" }}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          {/* Start Marker */}
          <Marker position={[startLat, startLng]} icon={staffIcon}>
            <Popup>My Current Location</Popup>
          </Marker>

          {/* Destination Marker */}
          <Marker position={[destLat, destLng]} icon={patientIcon}>
            <Popup>
              <strong>Collection Site:</strong>
              <br />
              {destAddress}
            </Popup>
          </Marker>

          {/* Polyline Route */}
          {routePath.length > 0 && (
            <Polyline
              positions={routePath}
              color="#2563eb"
              weight={4}
              opacity={0.8}
            />
          )}

          {/* Fit Viewport Bounds */}
          <FitBounds points={mapPoints} />
        </MapContainer>
      )}
    </Box>
  );
};

export default LeafletMap;
