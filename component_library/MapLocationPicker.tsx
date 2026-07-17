import React, { useEffect, useRef, useState, useCallback } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import CircularProgress from "@mui/material/CircularProgress";
import InputAdornment from "@mui/material/InputAdornment";
import Paper from "@mui/material/Paper";
import List from "@mui/material/List";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemText from "@mui/material/ListItemText";
import MyLocationIcon from "@mui/icons-material/MyLocation";
import SearchIcon from "@mui/icons-material/Search";
import PlaceIcon from "@mui/icons-material/Place";

export interface MapLocation {
  lat: number;
  lng: number;
  address: string;
  city: string;
  district: string;
  pincode: string;
}

interface MapLocationPickerProps {
  value?: { lat: number; lng: number };
  onChange: (location: MapLocation) => void;
  height?: number | string;
  label?: string;
  labs?: Array<{ id: string; name: string; lat: number; lng: number }>;
}

interface NominatimResult {
  place_id: number;
  display_name: string;
  lat: string;
  lon: string;
  address?: {
    city?: string;
    town?: string;
    village?: string;
    suburb?: string;
    county?: string;
    state_district?: string;
    postcode?: string;
    state?: string;
    country?: string;
  };
}

const NOMINATIM_URL = "https://nominatim.openstreetmap.org";
const DEFAULT_LAT = 10.8505;
const DEFAULT_LNG = 76.2711;
const DEFAULT_ZOOM = 13;

function extractAddressParts(
  data: NominatimResult,
): Omit<MapLocation, "lat" | "lng"> {
  const addr = data.address || {};
  const city =
    addr.city || addr.town || addr.village || addr.suburb || addr.county || "";
  const district =
    addr.state_district || addr.county || addr.city || addr.town || "";
  const pincode = addr.postcode || "";
  const address = data.display_name || "";
  return { address, city, district, pincode };
}

export const MapLocationPicker: React.FC<MapLocationPickerProps> = ({
  value,
  onChange,
  height = 400,
  label = "Pick Location on Map",
  labs = [],
}) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const leafletMapRef = useRef<any>(null);
  const markerRef = useRef<any>(null);
  const labMarkersRef = useRef<any[]>([]);
  const [mapReady, setMapReady] = useState(false);
  const [locating, setLocating] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<NominatimResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [selectedAddress, setSelectedAddress] = useState("");
  const searchDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const initialLat = value?.lat && value.lat !== 0 ? value.lat : DEFAULT_LAT;
  const initialLng = value?.lng && value.lng !== 0 ? value.lng : DEFAULT_LNG;

  // Reverse geocode a lat/lng via Nominatim
  const reverseGeocode = useCallback(
    async (lat: number, lng: number): Promise<MapLocation> => {
      try {
        const res = await fetch(
          `${NOMINATIM_URL}/reverse?format=json&lat=${lat}&lon=${lng}&addressdetails=1`,
          { headers: { "Accept-Language": "en" } },
        );
        const data: NominatimResult = await res.json();
        const parts = extractAddressParts(data);
        return { lat, lng, ...parts };
      } catch {
        return {
          lat,
          lng,
          address: `${lat.toFixed(6)}, ${lng.toFixed(6)}`,
          city: "",
          district: "",
          pincode: "",
        };
      }
    },
    [],
  );

  const onMarkerMove = useCallback(
    async (lat: number, lng: number) => {
      const location = await reverseGeocode(lat, lng);
      setSelectedAddress(location.address);
      onChange(location);
    },
    [reverseGeocode, onChange],
  );

  // Initialise Leaflet map (client-side only)
  useEffect(() => {
    if (!mapRef.current || leafletMapRef.current) return;

    // Dynamic import to avoid SSR issues with Leaflet
    import("leaflet").then((L) => {
      // Fix default marker icon paths in Next.js
      delete (L.Icon.Default.prototype as any)._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl:
          "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
        iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
        shadowUrl:
          "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
      });

      if (!mapRef.current) return;

      const map = L.map(mapRef.current, {
        center: [initialLat, initialLng],
        zoom: DEFAULT_ZOOM,
        zoomControl: true,
      });

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 19,
      }).addTo(map);

      const marker = L.marker([initialLat, initialLng], {
        draggable: true,
      }).addTo(map);
      markerRef.current = marker;
      leafletMapRef.current = map;

      marker.on("dragend", () => {
        const pos = marker.getLatLng();
        onMarkerMove(pos.lat, pos.lng);
      });

      map.on("click", (e: any) => {
        marker.setLatLng(e.latlng);
        onMarkerMove(e.latlng.lat, e.latlng.lng);
      });

      setMapReady(true);

      // Trigger initial geocode if we have a real starting location
      if (value?.lat && value.lat !== 0) {
        reverseGeocode(initialLat, initialLng).then((loc) => {
          setSelectedAddress(loc.address);
        });
      }
    });

    return () => {
      if (leafletMapRef.current) {
        leafletMapRef.current.remove();
        leafletMapRef.current = null;
        markerRef.current = null;
        setMapReady(false);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Render nearby lab markers
  useEffect(() => {
    if (!leafletMapRef.current || !mapReady) return;
    const map = leafletMapRef.current;

    // Clear old lab markers
    labMarkersRef.current.forEach((m) => m.remove());
    labMarkersRef.current = [];

    if (!labs || labs.length === 0) return;

    import("leaflet").then((L) => {
      const redIconInstance = L.divIcon({
        className: "custom-lab-marker",
        html: `
          <div style="
            position: relative;
            width: 30px;
            height: 30px;
            display: flex;
            align-items: center;
            justify-content: center;
          ">
            <div style="
              position: absolute;
              width: 100%;
              height: 100%;
              background-color: #ef4444;
              border-radius: 50%;
              opacity: 0.25;
            "></div>
            <div style="
              position: relative;
              width: 18px;
              height: 18px;
              background-color: #dc2626;
              border: 2px solid #ffffff;
              border-radius: 50%;
              box-shadow: 0 2px 5px rgba(0,0,0,0.3);
              display: flex;
              align-items: center;
              justify-content: center;
            ">
              <div style="
                width: 6px;
                height: 6px;
                background-color: #ffffff;
                border-radius: 50%;
              "></div>
            </div>
          </div>
        `,
        iconSize: [30, 30],
        iconAnchor: [15, 15],
        popupAnchor: [0, -15],
      });

      labs.forEach((lab) => {
        if (!lab.lat || !lab.lng || lab.lat === 0 || lab.lng === 0) return;
        const marker = L.marker([lab.lat, lab.lng], {
          icon: redIconInstance,
          draggable: false,
        })
          .addTo(map)
          .bindPopup(`<b>${lab.name}</b>`);
        labMarkersRef.current.push(marker);
      });
    });
  }, [labs, mapReady]);

  // Use browser Geolocation
  const handleUseCurrentLocation = useCallback(() => {
    if (!navigator.geolocation) return;
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude: lat, longitude: lng } = pos.coords;
        if (leafletMapRef.current && markerRef.current) {
          leafletMapRef.current.setView([lat, lng], 16);
          markerRef.current.setLatLng([lat, lng]);
        }
        const location = await reverseGeocode(lat, lng);
        setSelectedAddress(location.address);
        onChange(location);
        setLocating(false);
      },
      () => setLocating(false),
      { enableHighAccuracy: true },
    );
  }, [reverseGeocode, onChange]);

  // Nominatim search (debounced)
  const handleSearchChange = useCallback((val: string) => {
    setSearchQuery(val);
    setSearchResults([]);
    if (searchDebounceRef.current) clearTimeout(searchDebounceRef.current);
    if (val.trim().length < 3) return;
    searchDebounceRef.current = setTimeout(async () => {
      setSearching(true);
      try {
        const res = await fetch(
          `${NOMINATIM_URL}/search?format=json&q=${encodeURIComponent(val)}&limit=5&addressdetails=1&countrycodes=in`,
          { headers: { "Accept-Language": "en" } },
        );
        const data: NominatimResult[] = await res.json();
        setSearchResults(data);
      } catch {
        setSearchResults([]);
      }
      setSearching(false);
    }, 500);
  }, []);

  const handleSelectResult = useCallback(
    (result: NominatimResult) => {
      const lat = parseFloat(result.lat);
      const lng = parseFloat(result.lon);
      if (leafletMapRef.current && markerRef.current) {
        leafletMapRef.current.setView([lat, lng], 16);
        markerRef.current.setLatLng([lat, lng]);
      }
      const parts = extractAddressParts(result);
      const location: MapLocation = { lat, lng, ...parts };
      setSelectedAddress(location.address);
      setSearchQuery(result.display_name.split(",")[0]);
      setSearchResults([]);
      onChange(location);
    },
    [onChange],
  );

  return (
    <Box>
      {label && (
        <Typography
          variant="body2"
          sx={{ fontWeight: 700, mb: 1, color: "text.secondary" }}
        >
          <PlaceIcon sx={{ fontSize: 16, verticalAlign: "middle", mr: 0.5 }} />
          {label}
        </Typography>
      )}

      {/* Search box */}
      <Box sx={{ position: "relative", mb: 1 }}>
        <TextField
          fullWidth
          size="small"
          placeholder="Search location… (e.g. Kochi Medical Centre)"
          value={searchQuery}
          onChange={(e) => handleSearchChange(e.target.value)}
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  {searching ? (
                    <CircularProgress size={16} />
                  ) : (
                    <SearchIcon fontSize="small" />
                  )}
                </InputAdornment>
              ),
            },
          }}
        />
        {searchResults.length > 0 && (
          <Paper
            elevation={4}
            sx={{
              position: "absolute",
              top: "100%",
              left: 0,
              right: 0,
              zIndex: 9999,
              maxHeight: 220,
              overflowY: "auto",
            }}
          >
            <List dense disablePadding>
              {searchResults.map((r) => (
                <ListItemButton
                  key={r.place_id}
                  onClick={() => handleSelectResult(r)}
                  sx={{ borderBottom: "1px solid", borderColor: "divider" }}
                >
                  <ListItemText
                    primary={
                      <Typography
                        variant="body2"
                        sx={{ fontSize: 13, fontWeight: 600 }}
                      >
                        {r.display_name.split(",")[0]}
                      </Typography>
                    }
                    secondary={
                      <Typography
                        variant="caption"
                        sx={{ fontSize: 11 }}
                        color="text.secondary"
                      >
                        {r.display_name.split(",").slice(1, 4).join(",")}
                      </Typography>
                    }
                  />
                </ListItemButton>
              ))}
            </List>
          </Paper>
        )}
      </Box>

      {/* Use Current Location button */}
      <Button
        size="small"
        variant="outlined"
        color="secondary"
        startIcon={
          locating ? <CircularProgress size={14} /> : <MyLocationIcon />
        }
        onClick={handleUseCurrentLocation}
        disabled={locating}
        sx={{ mb: 1, textTransform: "none", fontWeight: 600 }}
      >
        {locating ? "Detecting…" : "Use Current Location"}
      </Button>

      {/* Map container */}
      {/* Load leaflet CSS inline via a style tag dynamically */}
      <link
        rel="stylesheet"
        href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
      />
      <Box
        ref={mapRef}
        sx={{
          width: "100%",
          height,
          borderRadius: "10px",
          border: "1px solid",
          borderColor: "divider",
          overflow: "hidden",
          bgcolor: "#e8e8e8",
        }}
      />

      {/* Selected address preview */}
      {selectedAddress && (
        <Box
          sx={{
            mt: 1,
            px: 1.5,
            py: 0.75,
            borderRadius: "6px",
            bgcolor: "background.default",
            border: "1px solid",
            borderColor: "divider",
          }}
        >
          <Typography variant="caption" color="text.secondary">
            <PlaceIcon
              sx={{ fontSize: 13, verticalAlign: "middle", mr: 0.5 }}
            />
            {selectedAddress}
          </Typography>
        </Box>
      )}
      <Typography
        variant="caption"
        color="text.secondary"
        sx={{ mt: 0.5, display: "block" }}
      >
        Drag the marker or click on the map to pick your exact location.
      </Typography>
    </Box>
  );
};

export default MapLocationPicker;
