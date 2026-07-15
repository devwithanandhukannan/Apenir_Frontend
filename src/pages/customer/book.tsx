import React, { useState, useEffect, useCallback } from "react";
import Head from "next/head";
import { useRouter } from "next/router";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import CardActionArea from "@mui/material/CardActionArea";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import Stepper from "@mui/material/Stepper";
import Step from "@mui/material/Step";
import StepLabel from "@mui/material/StepLabel";
import Chip from "@mui/material/Chip";
import Alert from "@mui/material/Alert";
import Skeleton from "@mui/material/Skeleton";
import CircularProgress from "@mui/material/CircularProgress";
import Divider from "@mui/material/Divider";
import IconButton from "@mui/material/IconButton";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import { useApi } from "@/core_components/hooks/useApi/useApi";
import { useCustomerService } from "@/core_components/apis/admin/customerService/useCustomerService";
import Checkbox from "@mui/material/Checkbox";
import FormControlLabel from "@mui/material/FormControlLabel";
import MapLocationPicker from "@/component_library/MapLocationPicker";

import ScienceIcon from "@mui/icons-material/Science";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import PeopleIcon from "@mui/icons-material/People";
import AddIcon from "@mui/icons-material/Add";
import RemoveIcon from "@mui/icons-material/Remove";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import LocalOfferIcon from "@mui/icons-material/LocalOffer";
import StorefrontIcon from "@mui/icons-material/Storefront";
import DeleteIcon from "@mui/icons-material/Delete";

interface ServiceItem {
  id: string;
  name: string;
  category: string;
  description?: string;
  basePrice: number;
  isActive: boolean;
}

interface PackageItem {
  id: string;
  name: string;
  description?: string;
  basePrice: number;
  isActive: boolean;
  serviceIds: string[];
}

type CartItem = ServiceItem | PackageItem;

interface EligibleLab {
  branchId: string;
  name: string;
  city: string;
  district: string;
  distance: number;
  roadDistance: number;
  baseTotal: number;
  travelFee: number;
  grandTotal: number;
  isMultiLab?: boolean;
}

interface LabSplitEntry {
  branchId: string;
  name: string;
  city: string;
  district?: string;
  roadDistance: number;
  travelFee: number;
  assignedItemIds: string[];
  assignedItemNames: string[];
  baseTotal: number;
  grandTotal: number;
}

interface SplitSuggestion {
  labs: LabSplitEntry[];
  totalBase: number;
  totalTravel: number;
  grandTotal: number;
  uncoveredItemIds?: string[];
  uncoveredItemNames?: string[];
}

interface EligibleLabsResponse {
  eligibleLabs: EligibleLab[];
  splitSuggestion: SplitSuggestion | null;
  hasSingleLabOption: boolean;
}

interface SlotItem {
  id: string;
  slotDate: string;
  startTime: string;
  endTime: string;
  isAvailable: boolean;
  bookedCount: number;
  maxCapacity: number;
  branchId: string;
}

interface RegionAvailabilityResult {
  branchId: string;
  name: string;
  city: string;
  district?: string;
  distance: number;
  servicesAvailableCount: number;
  servicesRequestedCount: number;
  servicesCoveredCount: number;
  isFullyEligible: boolean;
  hasAvailableSlotsToday: boolean;
  nextAvailableSlotDate?: string;
  nextAvailableSlotTime?: string;
}

type ApiResponse<T> = {
  success: boolean;
  message: string;
  data: T;
  errors: string[];
};

const STEPS = [
  "Your Location",
  "Add to Cart",
  "Choose Lab",
  "Choose Date & Slot",
  "Review & Confirm",
];

function formatDate(d: string | null) {
  if (!d) return "—";
  const date = new Date(d);
  return date.toLocaleDateString("en-IN", {
    weekday: "short",
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function formatTime(t: string | null) {
  if (!t) return "—";
  const [h, m] = t.split(":");
  const hour = parseInt(h);
  const ampm = hour >= 12 ? "PM" : "AM";
  const hr12 = hour % 12 || 12;
  return `${hr12}:${m} ${ampm}`;
}

function getMemberSlotTimes(
  startTime: string | null,
  endTime: string | null,
  memberCount: number,
) {
  if (!startTime || !endTime) return [];
  const parseTime = (t: string) => {
    const [h, m] = t.split(":");
    const d = new Date();
    d.setHours(parseInt(h), parseInt(m), 0, 0);
    return d;
  };

  const start = parseTime(startTime);
  const end = parseTime(endTime);
  const totalMinutes = (end.getTime() - start.getTime()) / (1000 * 60);
  const memberMinutes = totalMinutes / memberCount;

  const times = [];
  const format24 = (d: Date) => {
    const h = d.getHours().toString().padStart(2, "0");
    const m = d.getMinutes().toString().padStart(2, "0");
    return `${h}:${m}`;
  };

  for (let i = 0; i < memberCount; i++) {
    const mStart = new Date(start.getTime() + i * memberMinutes * 60 * 1000);
    const mEnd = new Date(
      start.getTime() + (i + 1) * memberMinutes * 60 * 1000,
    );
    times.push({
      start: formatTime(format24(mStart)),
      end: formatTime(format24(mEnd)),
    });
  }
  return times;
}

export default function CustomerBookPage() {
  const router = useRouter();
  const { get, post } = useApi();
  const { bookAppointment } = useCustomerService();

  const [step, setStep] = useState(0);
  const [error, setError] = useState<string | null>(null);

  // Step 1: Location
  const [latitude, setLatitude] = useState<number | null>(null);
  const [longitude, setLongitude] = useState<number | null>(null);
  const [addressLine, setAddressLine] = useState("");
  const [building, setBuilding] = useState("");
  const [landmark, setLandmark] = useState("");
  const [floor, setFloor] = useState("");

  // Step 2: Services / Packages Cart
  const [services, setServices] = useState<ServiceItem[]>([]);
  const [packages, setPackages] = useState<PackageItem[]>([]);
  const [catalogLoading, setCatalogLoading] = useState(false);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [activeTab, setActiveTab] = useState(0); // 0 = Services, 1 = Packages

  // Step 3: Labs List
  const [eligibleLabs, setEligibleLabs] = useState<EligibleLab[]>([]);
  const [splitSuggestion, setSplitSuggestion] =
    useState<SplitSuggestion | null>(null);
  const [labsLoading, setLabsLoading] = useState(false);
  const [selectedLab, setSelectedLab] = useState<EligibleLab | null>(null);
  // Multi-lab: track which slot was chosen for each sub-lab
  const [splitSlots, setSplitSlots] = useState<Record<string, SlotItem | null>>(
    {},
  );
  const [splitSlotsData, setSplitSlotsData] = useState<
    Record<string, SlotItem[]>
  >({});
  const [splitSlotsLoading, setSplitSlotsLoading] = useState<
    Record<string, boolean>
  >({});
  const [usingSplitMode, setUsingSplitMode] = useState(false);

  // Step 4: Slots & Member Count
  const [slots, setSlots] = useState<SlotItem[]>([]);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<SlotItem | null>(null);
  const [memberCount, setMemberCount] = useState(1);
  const [memberSelections, setMemberSelections] = useState<
    { name: string; itemIds: string[] }[]
  >([]);

  useEffect(() => {
    setMemberSelections((prev) => {
      const next = [...prev];
      if (next.length > memberCount) {
        return next.slice(0, memberCount);
      }
      while (next.length < memberCount) {
        next.push({
          name: next.length === 0 ? "Self" : `Member ${next.length + 1}`,
          itemIds: cart.map((c) => c.id),
        });
      }
      return next;
    });
  }, [memberCount, cart]);

  // Step 5: Confirmation
  const [booking, setBooking] = useState(false);
  const [booked, setBooked] = useState(false);
  const [bookedApptNumber, setBookedApptNumber] = useState("");
  const [bookedPasscode, setBookedPasscode] = useState("");
  const [bookedAddress, setBookedAddress] = useState("");

  // Region availability (real-time indicator on Step 0)
  const [regionAvail, setRegionAvail] = useState<{
    loading: boolean;
    labs: RegionAvailabilityResult[];
    error: string | null;
  }>({ loading: false, labs: [], error: null });

  // Debounced region-availability check when user moves the map pin
  useEffect(() => {
    if (!latitude || !longitude) return;
    const timer = setTimeout(async () => {
      setRegionAvail((prev) => ({ ...prev, loading: true, error: null }));
      try {
        const itemIds = cart.map((c) => c.id).join(",");
        const params = `latitude=${latitude}&longitude=${longitude}${itemIds ? `&itemIds=${itemIds}` : ""}`;
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL ?? ""}/api/appointments/region-availability?${params}`,
        );
        const json: ApiResponse<RegionAvailabilityResult[]> = await res.json();
        if (json.success) {
          setRegionAvail({
            loading: false,
            labs: json.data ?? [],
            error: null,
          });
        } else {
          setRegionAvail({ loading: false, labs: [], error: null });
        }
      } catch {
        setRegionAvail({ loading: false, labs: [], error: null });
      }
    }, 800); // 800ms debounce
    return () => clearTimeout(timer);
  }, [latitude, longitude, cart]);

  // Load diagnostic items (Services & Packages)
  const loadCatalog = useCallback(async () => {
    setCatalogLoading(true);
    setError(null);
    try {
      await get<ApiResponse<ServiceItem[]>>({
        endpoint: "/api/services",
        requireAuth: true,
        onSuccess: (svcRes) => {
          setServices(svcRes.data?.filter((s) => s.isActive) ?? []);
        },
      });

      await get<ApiResponse<PackageItem[]>>({
        endpoint: "/api/packages",
        requireAuth: true,
        onSuccess: (pkgRes) => {
          setPackages(pkgRes.data?.filter((p) => p.isActive) ?? []);
        },
      });
    } catch (err: any) {
      setError("Failed to load medical services or package catalog.");
    } finally {
      setCatalogLoading(false);
    }
  }, [get]);

  useEffect(() => {
    loadCatalog();
  }, [loadCatalog]);

  // Load eligible lab branches for location & cart
  const loadEligibleLabs = useCallback(async () => {
    if (!latitude || !longitude || cart.length === 0) return;
    setLabsLoading(true);
    setSelectedLab(null);
    setSplitSuggestion(null);
    setUsingSplitMode(false);
    setError(null);
    const itemIds = cart.map((item) => item.id).join(",");
    await get<ApiResponse<EligibleLabsResponse>>({
      endpoint: `/api/appointments/eligible-labs?latitude=${latitude}&longitude=${longitude}&itemIds=${itemIds}`,
      requireAuth: true,
      onSuccess: (res) => {
        const data = res.data;
        setEligibleLabs(data?.eligibleLabs ?? []);
        setSplitSuggestion(data?.splitSuggestion ?? null);
        setLabsLoading(false);
      },
      onError: (err) => {
        setError(
          err?.message ??
            "Could not find lab branches offering these services near you.",
        );
        setLabsLoading(false);
      },
    });
  }, [get, latitude, longitude, cart]);

  // Load slots for a specific branch (used for both single-lab and each split sub-lab)
  const loadSplitSlots = useCallback(
    async (branchId: string) => {
      setSplitSlotsLoading((prev) => ({ ...prev, [branchId]: true }));
      await get<ApiResponse<SlotItem[]>>({
        endpoint: `/api/appointments/slots/branch/${branchId}`,
        requireAuth: true,
        onSuccess: (res) => {
          setSplitSlotsData((prev) => ({
            ...prev,
            [branchId]: res.data ?? [],
          }));
          setSplitSlotsLoading((prev) => ({ ...prev, [branchId]: false }));
        },
        onError: () => {
          setSplitSlotsLoading((prev) => ({ ...prev, [branchId]: false }));
        },
      });
    },
    [get],
  );

  // When entering split mode, preload slots for all split labs
  useEffect(() => {
    if (usingSplitMode && splitSuggestion) {
      splitSuggestion.labs.forEach((lab) => {
        if (!splitSlotsData[lab.branchId]) {
          loadSplitSlots(lab.branchId);
        }
      });
    }
  }, [usingSplitMode, splitSuggestion, splitSlotsData, loadSplitSlots]);

  useEffect(() => {
    if (step === 2) {
      loadEligibleLabs();
    }
  }, [step, loadEligibleLabs]);

  // Load slots for the selected lab branch
  const loadSlots = useCallback(async () => {
    if (!selectedLab) return;
    setSlotsLoading(true);
    setSelectedSlot(null);
    setError(null);
    await get<ApiResponse<SlotItem[]>>({
      endpoint: `/api/appointments/slots/branch/${selectedLab.branchId}`,
      requireAuth: true,
      onSuccess: (res) => {
        setSlots(res.data ?? []);
        setSlotsLoading(false);
      },
      onError: (err) => {
        setError(err?.message ?? "Failed to load slots for this branch.");
        setSlotsLoading(false);
      },
    });
  }, [get, selectedLab]);

  useEffect(() => {
    if (step === 3) {
      loadSlots();
    }
  }, [step, loadSlots]);

  const handleAddToCart = (item: CartItem) => {
    if (cart.find((c) => c.id === item.id)) return;
    setCart((prev) => [...prev, item]);
  };

  const handleRemoveFromCart = (itemId: string) => {
    setCart((prev) => prev.filter((item) => item.id !== itemId));
  };

  const handleBook = async () => {
    if (!latitude || !longitude || cart.length === 0) return;

    if (usingSplitMode) {
      if (!splitSuggestion) return;
      const allSelected = splitSuggestion.labs.every(
        (lab) => splitSlots[lab.branchId],
      );
      if (!allSelected) {
        setError(
          "Please choose slot timings for all laboratories in the split.",
        );
        return;
      }

      setBooking(true);
      setError(null);

      const splitPayload = {
        latitude,
        longitude,
        buildingDetails: building,
        landmark,
        floor,
        memberCount,
        labSplits: splitSuggestion.labs.map((lab) => ({
          branchId: lab.branchId,
          slotId: splitSlots[lab.branchId]!.id,
          itemIds: lab.assignedItemIds,
        })),
        memberSelections: memberSelections.map((ms) => ({
          name: ms.name,
          itemIds: ms.itemIds,
        })),
      };

      await post<ApiResponse<any>, any>({
        endpoint: "/api/appointments/book-multi-lab",
        body: splitPayload,
        requireAuth: true,
        onSuccess: (res) => {
          setBooking(false);
          if (res.data && res.data.paymentUrl) {
            window.location.href = res.data.paymentUrl;
          } else {
            setBooked(true);
            setBookedApptNumber(res.data?.bookingId ?? "");
            setBookedPasscode(res.data?.passcode ?? "");
            setBookedAddress(
              `${building}, Floor: ${floor}, Landmark: ${landmark}`,
            );
          }
        },
        onError: (err) => {
          setBooking(false);
          setError(
            err?.message ?? "Failed to book split multi-lab appointments.",
          );
        },
      });
    } else {
      if (!selectedLab || !selectedSlot) return;
      setBooking(true);
      setError(null);
      const payload = {
        latitude,
        longitude,
        itemIds: cart.map((c) => c.id),
        slotId: selectedSlot.id,
        memberCount,
        buildingDetails: building,
        landmark,
        floor,
        memberSelections: memberSelections.map((ms) => ({
          name: ms.name,
          itemIds: ms.itemIds,
        })),
      };
      await bookAppointment(payload, {
        onSuccess: (res) => {
          setBooking(false);
          if (res.data && (res.data as any).paymentUrl) {
            window.location.href = (res.data as any).paymentUrl;
          } else {
            setBooked(true);
            setBookedApptNumber(res.data?.appointmentNumber ?? "");
            setBookedPasscode(res.data?.passcode ?? "");
            setBookedAddress(res.data?.locationAddress ?? "");
          }
        },
        onError: (err) => {
          setBooking(false);
          setError(
            err?.message ??
              "Booking failed. You may be outside the service area for this lab.",
          );
        },
      });
    }
  };

  // Split prices calculation
  const subtotal = cart.reduce((sum, item) => sum + item.basePrice, 0);
  const memberTotals = memberSelections.map((selection, idx) => {
    const sum = selection.itemIds.reduce((s, id) => {
      const item = cart.find((c) => c.id === id);
      return s + (item?.basePrice ?? 0);
    }, 0);
    return {
      name: selection.name,
      sum,
      finalAmount: idx === 0 ? sum : Math.round(sum * 0.8),
      discount: idx === 0 ? 0 : Math.round(sum * 0.2),
    };
  });

  const baseSubtotalTotal = memberTotals.reduce((sum, m) => sum + m.sum, 0);
  const totalMemberDiscount = memberTotals.reduce(
    (sum, m) => sum + m.discount,
    0,
  );

  const splitTravelFee =
    usingSplitMode && splitSuggestion
      ? splitSuggestion.labs.reduce((sum, lab) => sum + lab.travelFee, 0)
      : 0;

  const travelFee = usingSplitMode
    ? splitTravelFee
    : (selectedLab?.travelFee ?? 0);

  const grandTotal =
    usingSplitMode && splitSuggestion
      ? Math.round(splitSuggestion.grandTotal)
      : memberTotals.reduce((sum, m) => sum + m.finalAmount, 0) + travelFee;

  if (booked) {
    return (
      <>
        <Head>
          <title>Booking Confirmed – Appenir</title>
        </Head>
        <Box sx={{ textAlign: "center", py: 6 }}>
          <CheckCircleIcon
            sx={{ fontSize: 64, color: "success.main", mb: 2 }}
          />
          <Typography variant="h5" sx={{ fontWeight: 700, mb: 1 }}>
            Appointment Confirmed!
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Your home collection booking is successful. An invoice has been
            generated.
          </Typography>
          <Card
            elevation={0}
            sx={{
              border: "2px solid",
              borderColor: "primary.main",
              maxWidth: 450,
              mx: "auto",
              mb: 4,
            }}
          >
            <CardContent sx={{ textAlign: "left" }}>
              <Typography variant="caption" color="text.secondary">
                Booking Reference Number
              </Typography>
              <Typography variant="h6" sx={{ fontWeight: 700, mb: 1.5 }}>
                {bookedApptNumber}
              </Typography>
              <Divider sx={{ mb: 1.5 }} />
              <Typography variant="caption" color="text.secondary">
                Registered Home Collection Address
              </Typography>
              <Typography variant="body2" sx={{ fontWeight: 600, mb: 1.5 }}>
                {bookedAddress}
              </Typography>
              <Divider sx={{ mb: 1.5 }} />
              <Typography variant="caption" color="text.secondary">
                Phlebotomist Verification Passcode (Share upon arrival)
              </Typography>
              <Typography
                variant="h4"
                sx={{
                  fontWeight: 800,
                  letterSpacing: 6,
                  color: "primary.main",
                  mt: 0.5,
                  textAlign: "center",
                }}
              >
                {bookedPasscode}
              </Typography>
            </CardContent>
          </Card>
          <Box sx={{ display: "flex", gap: 2, justifyContent: "center" }}>
            <Button
              variant="outlined"
              href={`/invoices/Invoice_${bookedApptNumber}.pdf`}
              target="_blank"
              sx={{ fontWeight: 700 }}
            >
              Download Invoice PDF
            </Button>
            <Button
              variant="contained"
              onClick={() => router.push("/customer")}
              sx={{ fontWeight: 700 }}
            >
              Go to Dashboard
            </Button>
          </Box>
        </Box>
      </>
    );
  }

  return (
    <>
      <Head>
        <title>Book Home Collection – Appenir</title>
      </Head>

      <Box>
        {/* Header */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 3 }}>
          <IconButton
            size="small"
            onClick={() =>
              step > 0 ? setStep((s) => s - 1) : router.push("/customer")
            }
            sx={{ border: "1px solid", borderColor: "divider" }}
          >
            <ArrowBackIcon fontSize="small" />
          </IconButton>
          <Typography variant="h6" sx={{ fontWeight: 700 }}>
            Book Diagnostics Flow
          </Typography>
        </Box>

        {/* Stepper */}
        <Stepper
          activeStep={step}
          alternativeLabel
          sx={{ mb: 4, display: { xs: "none", sm: "flex" } }}
        >
          {STEPS.map((label) => (
            <Step key={label}>
              <StepLabel
                sx={{
                  "& .MuiStepLabel-label": { fontSize: 11, fontWeight: 600 },
                }}
              >
                {label}
              </StepLabel>
            </Step>
          ))}
        </Stepper>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        {/* STEP 1: YOUR LOCATION */}
        {step === 0 && (
          <Box>
            <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 600 }}>
              Select your diagnostic collection location on the map:
            </Typography>

            <Grid container spacing={3}>
              <Grid size={{ xs: 12, md: 8 }}>
                <MapLocationPicker
                  value={
                    latitude && longitude
                      ? { lat: latitude, lng: longitude }
                      : undefined
                  }
                  onChange={(loc) => {
                    setLatitude(loc.lat);
                    setLongitude(loc.lng);
                    setAddressLine(loc.address);
                  }}
                  height={420}
                  label="Locate Branch or Pinpoint Collection Area"
                />
              </Grid>
              <Grid size={{ xs: 12, md: 4 }}>
                <Card
                  elevation={0}
                  sx={{ border: "1px solid", borderColor: "divider", p: 1.5 }}
                >
                  <CardContent sx={{ p: 1 }}>
                    <Typography
                      variant="subtitle2"
                      sx={{ fontWeight: 700, mb: 2 }}
                    >
                      Address Details
                    </Typography>
                    <Grid container spacing={2}>
                      <Grid size={{ xs: 12 }}>
                        <TextField
                          label="Building / House / Flat"
                          placeholder="e.g. Apartment 405, Tower B"
                          fullWidth
                          size="small"
                          value={building}
                          onChange={(e) => setBuilding(e.target.value)}
                        />
                      </Grid>
                      <Grid size={{ xs: 12 }}>
                        <TextField
                          label="Floor"
                          placeholder="e.g. 4th Floor"
                          fullWidth
                          size="small"
                          value={floor}
                          onChange={(e) => setFloor(e.target.value)}
                        />
                      </Grid>
                      <Grid size={{ xs: 12 }}>
                        <TextField
                          label="Landmark"
                          placeholder="e.g. Next to City Park Gate"
                          fullWidth
                          size="small"
                          value={landmark}
                          onChange={(e) => setLandmark(e.target.value)}
                        />
                      </Grid>
                    </Grid>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>

            <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 4 }}>
              {/* Region Availability Indicator */}
              {latitude && longitude && (
                <Box sx={{ flex: 1, mr: 2 }}>
                  {regionAvail.loading ? (
                    <Alert
                      icon={<CircularProgress size={16} />}
                      severity="info"
                      sx={{ py: 0.5, fontWeight: 600 }}
                    >
                      Checking labs in your area...
                    </Alert>
                  ) : regionAvail.labs.length === 0 ? (
                    <Alert severity="error" sx={{ py: 0.5, fontWeight: 600 }}>
                      🔴 No labs available in your area yet.
                    </Alert>
                  ) : (
                    (() => {
                      const eligible = regionAvail.labs.filter(
                        (l) => l.isFullyEligible,
                      );
                      const withToday = eligible.filter(
                        (l) => l.hasAvailableSlotsToday,
                      );
                      const nearby = regionAvail.labs.filter(
                        (l) => !l.isFullyEligible,
                      );
                      return (
                        <Alert
                          severity={
                            withToday.length > 0
                              ? "success"
                              : eligible.length > 0
                                ? "warning"
                                : "info"
                          }
                          sx={{ py: 0.5, fontWeight: 600 }}
                        >
                          {withToday.length > 0 && (
                            <>
                              🟢{" "}
                              <strong>
                                {withToday.length} lab
                                {withToday.length > 1 ? "s" : ""}
                              </strong>{" "}
                              available with slots today
                            </>
                          )}
                          {withToday.length === 0 && eligible.length > 0 && (
                            <>
                              🟡{" "}
                              <strong>
                                {eligible.length} lab
                                {eligible.length > 1 ? "s" : ""}
                              </strong>{" "}
                              found — next slot:{" "}
                              {eligible[0]?.nextAvailableSlotDate ?? "TBD"}
                            </>
                          )}
                          {eligible.length === 0 && nearby.length > 0 && (
                            <>
                              🟠 Nearby labs found but don&apos;t offer all
                              selected services
                            </>
                          )}
                        </Alert>
                      );
                    })()
                  )}
                </Box>
              )}
              <Button
                variant="contained"
                disabled={!latitude || !longitude || !building}
                onClick={() => setStep(1)}
                sx={{ fontWeight: 700 }}
              >
                Continue to Cart
              </Button>
            </Box>
          </Box>
        )}

        {/* STEP 2: ADD TO CART */}
        {step === 1 && (
          <Box>
            <Grid container spacing={3}>
              <Grid size={{ xs: 12, md: 8 }}>
                <Box sx={{ borderBottom: 1, borderColor: "divider", mb: 2 }}>
                  <Tabs
                    value={activeTab}
                    onChange={(e, val) => setActiveTab(val)}
                  >
                    <Tab
                      label="🧬 Services"
                      iconPosition="start"
                      icon={<ScienceIcon sx={{ fontSize: 18 }} />}
                      sx={{ fontWeight: 700 }}
                    />
                    <Tab
                      label="📦 Health Packages"
                      iconPosition="start"
                      icon={<LocalOfferIcon sx={{ fontSize: 18 }} />}
                      sx={{ fontWeight: 700 }}
                    />
                  </Tabs>
                </Box>

                {catalogLoading ? (
                  <Grid container spacing={2}>
                    {[1, 2, 3].map((i) => (
                      <Grid size={{ xs: 12 }} key={i}>
                        <Skeleton variant="rounded" height={80} />
                      </Grid>
                    ))}
                  </Grid>
                ) : activeTab === 0 ? (
                  <Grid container spacing={2}>
                    {services.map((item) => (
                      <Grid size={{ xs: 12 }} key={item.id}>
                        <Card
                          elevation={0}
                          sx={{ border: "1px solid", borderColor: "divider" }}
                        >
                          <CardContent
                            sx={{
                              display: "flex",
                              justifyContent: "space-between",
                              alignItems: "center",
                              py: 1.5,
                            }}
                          >
                            <Box>
                              <Typography
                                variant="body2"
                                sx={{ fontWeight: 700 }}
                              >
                                {item.name}
                              </Typography>
                              <Typography
                                variant="caption"
                                color="text.secondary"
                              >
                                {item.category} ·{" "}
                                {item.description ??
                                  "NABL Certified Diagnostic Test"}
                              </Typography>
                            </Box>
                            <Box
                              sx={{
                                display: "flex",
                                alignItems: "center",
                                gap: 2,
                              }}
                            >
                              <Typography
                                variant="body2"
                                sx={{ fontWeight: 800, color: "primary.main" }}
                              >
                                ₹{item.basePrice}
                              </Typography>
                              <Button
                                size="small"
                                variant={
                                  cart.find((c) => c.id === item.id)
                                    ? "outlined"
                                    : "contained"
                                }
                                color={
                                  cart.find((c) => c.id === item.id)
                                    ? "secondary"
                                    : "primary"
                                }
                                onClick={() => handleAddToCart(item)}
                                disabled={!!cart.find((c) => c.id === item.id)}
                              >
                                {cart.find((c) => c.id === item.id)
                                  ? "Added"
                                  : "Add to Cart"}
                              </Button>
                            </Box>
                          </CardContent>
                        </Card>
                      </Grid>
                    ))}
                  </Grid>
                ) : (
                  <Grid container spacing={2}>
                    {packages.map((item) => (
                      <Grid size={{ xs: 12 }} key={item.id}>
                        <Card
                          elevation={0}
                          sx={{ border: "1px solid", borderColor: "divider" }}
                        >
                          <CardContent
                            sx={{
                              display: "flex",
                              justifyContent: "space-between",
                              alignItems: "center",
                              py: 1.5,
                            }}
                          >
                            <Box>
                              <Typography
                                variant="body2"
                                sx={{ fontWeight: 700 }}
                              >
                                {item.name}
                              </Typography>
                              <Typography
                                variant="caption"
                                color="text.secondary"
                              >
                                Health Package Deal ·{" "}
                                {item.description ??
                                  "Comprehensive custom diagnostic profile"}
                              </Typography>
                            </Box>
                            <Box
                              sx={{
                                display: "flex",
                                alignItems: "center",
                                gap: 2,
                              }}
                            >
                              <Typography
                                variant="body2"
                                sx={{ fontWeight: 800, color: "primary.main" }}
                              >
                                ₹{item.basePrice}
                              </Typography>
                              <Button
                                size="small"
                                variant={
                                  cart.find((c) => c.id === item.id)
                                    ? "outlined"
                                    : "contained"
                                }
                                color={
                                  cart.find((c) => c.id === item.id)
                                    ? "secondary"
                                    : "primary"
                                }
                                onClick={() => handleAddToCart(item)}
                                disabled={!!cart.find((c) => c.id === item.id)}
                              >
                                {cart.find((c) => c.id === item.id)
                                  ? "Added"
                                  : "Add to Cart"}
                              </Button>
                            </Box>
                          </CardContent>
                        </Card>
                      </Grid>
                    ))}
                  </Grid>
                )}
              </Grid>

              {/* Shopping Cart sidebar */}
              <Grid size={{ xs: 12, md: 4 }}>
                <Card
                  elevation={0}
                  sx={{
                    border: "1.5px solid",
                    borderColor: "primary.main",
                    p: 1.5,
                  }}
                >
                  <CardContent sx={{ p: 1 }}>
                    <Box
                      sx={{
                        display: "flex",
                        gap: 1,
                        alignItems: "center",
                        mb: 2,
                      }}
                    >
                      <ShoppingCartIcon color="primary" />
                      <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>
                        Cart Items ({cart.length})
                      </Typography>
                    </Box>
                    <Divider sx={{ mb: 2 }} />

                    {cart.length === 0 ? (
                      <Typography
                        variant="caption"
                        color="text.secondary"
                        sx={{ display: "block", textAlign: "center", py: 4 }}
                      >
                        Your cart is empty. Add a service or health package to
                        continue.
                      </Typography>
                    ) : (
                      <Box>
                        {cart.map((item) => (
                          <Box
                            key={item.id}
                            sx={{
                              display: "flex",
                              justifyContent: "space-between",
                              alignItems: "center",
                              mb: 1.5,
                            }}
                          >
                            <Box sx={{ maxWidth: "70%" }}>
                              <Typography
                                variant="caption"
                                sx={{ fontWeight: 700, display: "block" }}
                              >
                                {item.name}
                              </Typography>
                              <Typography
                                variant="caption"
                                color="text.secondary"
                              >
                                ₹{item.basePrice}
                              </Typography>
                            </Box>
                            <IconButton
                              size="small"
                              color="error"
                              onClick={() => handleRemoveFromCart(item.id)}
                            >
                              <DeleteIcon sx={{ fontSize: 16 }} />
                            </IconButton>
                          </Box>
                        ))}
                        <Divider sx={{ my: 2 }} />
                        <Box
                          sx={{
                            display: "flex",
                            justifyContent: "space-between",
                            mb: 2,
                          }}
                        >
                          <Typography
                            variant="caption"
                            sx={{ fontWeight: 700 }}
                          >
                            Subtotal:
                          </Typography>
                          <Typography
                            variant="body2"
                            sx={{ fontWeight: 800, color: "primary.main" }}
                          >
                            ₹{subtotal}
                          </Typography>
                        </Box>
                      </Box>
                    )}
                  </CardContent>
                </Card>
              </Grid>
            </Grid>

            <Box
              sx={{
                display: "flex",
                justifyContent: "flex-end",
                gap: 2,
                mt: 4,
              }}
            >
              <Button
                variant="outlined"
                onClick={() => setStep(0)}
                sx={{ fontWeight: 600 }}
              >
                Back
              </Button>
              <Button
                variant="contained"
                disabled={cart.length === 0}
                onClick={() => setStep(2)}
                sx={{ fontWeight: 700 }}
              >
                Choose Laboratory
              </Button>
            </Box>
          </Box>
        )}

        {/* STEP 3: CHOOSE LAB */}
        {step === 2 && (
          <Box>
            {/* Single-lab section */}
            {!usingSplitMode && (
              <>
                <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 600 }}>
                  Available Laboratories offering all selected services nearby:
                </Typography>

                {labsLoading ? (
                  <Grid container spacing={2}>
                    {[1, 2].map((i) => (
                      <Grid size={{ xs: 12 }} key={i}>
                        <Skeleton variant="rounded" height={100} />
                      </Grid>
                    ))}
                  </Grid>
                ) : eligibleLabs.length === 0 && !splitSuggestion ? (
                  <Alert severity="warning">
                    We are sorry, but no laboratory branches offering these
                    services are available within range of your current
                    location. Please update your cart items or choose a
                    different location.
                  </Alert>
                ) : eligibleLabs.length === 0 && splitSuggestion ? (
                  /* No single lab covers everything — show split suggestion */
                  <Box>
                    <Alert
                      severity="info"
                      sx={{ mb: 2, borderRadius: 2, fontWeight: 500 }}
                      icon={<span>🔬</span>}
                    >
                      <strong>
                        No single lab offers all your selected services
                      </strong>{" "}
                      in your area. We found a{" "}
                      <strong>Multi-Lab solution</strong> — different labs will
                      each handle part of your tests, collected in one visit per
                      lab.
                    </Alert>

                    <Card
                      elevation={0}
                      sx={{
                        border: "2px solid",
                        borderColor: "primary.main",
                        borderRadius: 3,
                        mb: 2,
                        background:
                          "linear-gradient(135deg, rgba(25,118,210,0.04) 0%, rgba(255,255,255,1) 100%)",
                      }}
                    >
                      <CardContent>
                        <Box
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            gap: 1,
                            mb: 2,
                          }}
                        >
                          <span style={{ fontSize: 22 }}>🏥</span>
                          <Typography
                            variant="subtitle1"
                            sx={{ fontWeight: 700 }}
                          >
                            Split Booking — {splitSuggestion.labs.length} Labs
                          </Typography>
                          <Chip
                            label={`Total ₹${Math.round(splitSuggestion.grandTotal)}`}
                            color="primary"
                            size="small"
                            sx={{ ml: "auto", fontWeight: 700, fontSize: 13 }}
                          />
                        </Box>

                        {splitSuggestion.labs.map((lab, idx) => (
                          <Box
                            key={lab.branchId}
                            sx={{
                              p: 2,
                              mb: 1.5,
                              borderRadius: 2,
                              border: "1px solid",
                              borderColor: "divider",
                              background: "#fafafa",
                            }}
                          >
                            <Box
                              sx={{
                                display: "flex",
                                justifyContent: "space-between",
                                alignItems: "flex-start",
                                mb: 1,
                              }}
                            >
                              <Box>
                                <Typography
                                  variant="body2"
                                  sx={{ fontWeight: 700 }}
                                >
                                  🏨 Lab {idx + 1}: {lab.name}
                                </Typography>
                                <Typography
                                  variant="caption"
                                  color="text.secondary"
                                >
                                  {lab.city}
                                  {lab.district
                                    ? `, ${lab.district}`
                                    : ""} · {lab.roadDistance.toFixed(1)} km
                                  road
                                </Typography>
                              </Box>
                              <Box sx={{ textAlign: "right" }}>
                                <Typography
                                  variant="body2"
                                  sx={{
                                    fontWeight: 700,
                                    color: "primary.main",
                                  }}
                                >
                                  ₹{Math.round(lab.grandTotal)}
                                </Typography>
                                <Typography
                                  variant="caption"
                                  color="text.secondary"
                                >
                                  +₹{Math.round(lab.travelFee)} travel
                                </Typography>
                              </Box>
                            </Box>

                            <Box
                              sx={{
                                display: "flex",
                                flexWrap: "wrap",
                                gap: 0.5,
                                mb: 1.5,
                              }}
                            >
                              {lab.assignedItemNames.map((name) => (
                                <Chip
                                  key={name}
                                  label={name}
                                  size="small"
                                  sx={{ fontSize: 11, background: "#e3f2fd" }}
                                />
                              ))}
                            </Box>

                            {/* Slot picker for this sub-lab */}
                            <Typography
                              variant="caption"
                              sx={{
                                fontWeight: 600,
                                mb: 0.5,
                                display: "block",
                              }}
                            >
                              📅 Choose a slot for this lab:
                            </Typography>
                            {splitSlotsLoading[lab.branchId] ? (
                              <Skeleton variant="rounded" height={36} />
                            ) : (
                              <Box
                                sx={{
                                  display: "flex",
                                  flexWrap: "wrap",
                                  gap: 0.5,
                                }}
                              >
                                {(splitSlotsData[lab.branchId] ?? [])
                                  .slice(0, 6)
                                  .map((slot) => (
                                    <Chip
                                      key={slot.id}
                                      label={`${formatDate(slot.slotDate)} ${formatTime(slot.startTime)}`}
                                      size="small"
                                      color={
                                        splitSlots[lab.branchId]?.id === slot.id
                                          ? "primary"
                                          : "default"
                                      }
                                      variant={
                                        splitSlots[lab.branchId]?.id === slot.id
                                          ? "filled"
                                          : "outlined"
                                      }
                                      onClick={() =>
                                        setSplitSlots((prev) => ({
                                          ...prev,
                                          [lab.branchId]: slot,
                                        }))
                                      }
                                      sx={{ cursor: "pointer", fontSize: 11 }}
                                    />
                                  ))}
                                {(splitSlotsData[lab.branchId] ?? []).length ===
                                  0 && (
                                  <Typography variant="caption" color="error">
                                    No slots available
                                  </Typography>
                                )}
                              </Box>
                            )}
                          </Box>
                        ))}

                        {splitSuggestion.uncoveredItemNames &&
                          splitSuggestion.uncoveredItemNames.length > 0 && (
                            <Alert severity="warning" sx={{ mt: 1 }}>
                              ⚠️ These services are not available in any nearby
                              lab:{" "}
                              <strong>
                                {splitSuggestion.uncoveredItemNames.join(", ")}
                              </strong>
                            </Alert>
                          )}

                        <Box
                          sx={{
                            display: "flex",
                            justifyContent: "space-between",
                            mt: 2,
                            pt: 2,
                            borderTop: "1px solid",
                            borderColor: "divider",
                          }}
                        >
                          <Box>
                            <Typography
                              variant="caption"
                              color="text.secondary"
                            >
                              Base: ₹{Math.round(splitSuggestion.totalBase)}
                            </Typography>
                            <Typography
                              variant="caption"
                              color="text.secondary"
                              sx={{ ml: 1 }}
                            >
                              Travel: ₹{Math.round(splitSuggestion.totalTravel)}
                            </Typography>
                          </Box>
                          <Button
                            variant="contained"
                            size="small"
                            disabled={splitSuggestion.labs.some(
                              (lab) => !splitSlots[lab.branchId],
                            )}
                            onClick={() => setUsingSplitMode(true)}
                            sx={{ fontWeight: 700 }}
                          >
                            Confirm Split Booking →
                          </Button>
                        </Box>
                      </CardContent>
                    </Card>
                  </Box>
                ) : (
                  <Grid container spacing={2}>
                    {eligibleLabs.map((lab) => (
                      <Grid size={{ xs: 12 }} key={lab.branchId}>
                        <Card
                          elevation={0}
                          sx={{
                            border: "1.5px solid",
                            borderColor:
                              selectedLab?.branchId === lab.branchId
                                ? "primary.main"
                                : "divider",
                            transition: "border-color 0.2s, box-shadow 0.2s",
                            "&:hover": { borderColor: "primary.main" },
                          }}
                        >
                          <CardActionArea
                            onClick={() => setSelectedLab(lab)}
                            sx={{ p: 0 }}
                          >
                            <CardContent
                              sx={{
                                display: "flex",
                                justifyContent: "space-between",
                                alignItems: "center",
                                py: 2,
                              }}
                            >
                              <Box
                                sx={{
                                  display: "flex",
                                  gap: 1.5,
                                  alignItems: "center",
                                }}
                              >
                                <StorefrontIcon color="primary" />
                                <Box>
                                  <Typography
                                    variant="body2"
                                    sx={{ fontWeight: 700 }}
                                  >
                                    {lab.name}
                                  </Typography>
                                  <Typography
                                    variant="caption"
                                    color="text.secondary"
                                  >
                                    {lab.city}, {lab.district} ·{" "}
                                    {lab.distance.toFixed(1)} km (straight-line)
                                    · {lab.roadDistance.toFixed(1)} km (road)
                                  </Typography>
                                </Box>
                              </Box>
                              <Box sx={{ textAlign: "right" }}>
                                <Typography
                                  variant="body1"
                                  sx={{
                                    fontWeight: 800,
                                    color: "primary.main",
                                  }}
                                >
                                  ₹{lab.grandTotal}
                                </Typography>
                                <Typography
                                  variant="caption"
                                  color="text.secondary"
                                >
                                  Base ₹{lab.baseTotal} + Travel ₹
                                  {lab.travelFee}
                                </Typography>
                              </Box>
                            </CardContent>
                          </CardActionArea>
                        </Card>
                      </Grid>
                    ))}
                  </Grid>
                )}
              </>
            )}

            {/* Split mode confirmed — summary banner */}
            {usingSplitMode && splitSuggestion && (
              <Box>
                <Alert severity="success" sx={{ mb: 2 }} icon={<span>✅</span>}>
                  <strong>Multi-Lab booking ready!</strong> Your tests have been
                  distributed across {splitSuggestion.labs.length} labs. One
                  shared passcode will be used across all labs.
                </Alert>
                {splitSuggestion.labs.map((lab, idx) => (
                  <Card
                    key={lab.branchId}
                    elevation={0}
                    sx={{
                      border: "1px solid",
                      borderColor: "success.light",
                      mb: 1.5,
                      borderRadius: 2,
                    }}
                  >
                    <CardContent sx={{ py: 1.5 }}>
                      <Typography variant="body2" sx={{ fontWeight: 700 }}>
                        Lab {idx + 1}: {lab.name}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Slot:{" "}
                        {splitSlots[lab.branchId]
                          ? `${formatDate(splitSlots[lab.branchId]!.slotDate)} @ ${formatTime(splitSlots[lab.branchId]!.startTime)}`
                          : "—"}
                      </Typography>
                      <Box
                        sx={{
                          display: "flex",
                          flexWrap: "wrap",
                          gap: 0.5,
                          mt: 0.5,
                        }}
                      >
                        {lab.assignedItemNames.map((n) => (
                          <Chip
                            key={n}
                            label={n}
                            size="small"
                            sx={{ fontSize: 11 }}
                          />
                        ))}
                      </Box>
                    </CardContent>
                  </Card>
                ))}
                <Button
                  variant="outlined"
                  size="small"
                  onClick={() => setUsingSplitMode(false)}
                  sx={{ mt: 1 }}
                >
                  ← Change Lab Selection
                </Button>
              </Box>
            )}

            <Box
              sx={{
                display: "flex",
                justifyContent: "flex-end",
                gap: 2,
                mt: 4,
              }}
            >
              <Button
                variant="outlined"
                onClick={() => setStep(1)}
                sx={{ fontWeight: 600 }}
              >
                Back
              </Button>
              {!usingSplitMode && (
                <Button
                  variant="contained"
                  disabled={!selectedLab}
                  onClick={() => setStep(3)}
                  sx={{ fontWeight: 700 }}
                >
                  Choose Slot & Members
                </Button>
              )}
              {usingSplitMode && (
                <Button
                  variant="contained"
                  color="success"
                  onClick={() => setStep(4)}
                  sx={{ fontWeight: 700 }}
                >
                  Review & Pay →
                </Button>
              )}
            </Box>
          </Box>
        )}

        {/* STEP 4: CHOOSE DATE & SLOT */}
        {step === 3 && (
          <Box>
            <Grid container spacing={3}>
              <Grid size={{ xs: 12, md: 8 }}>
                <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 600 }}>
                  Select an available slot for {selectedLab?.name}:
                </Typography>

                {slotsLoading ? (
                  <Grid container spacing={2}>
                    {[1, 2, 3].map((i) => (
                      <Grid size={{ xs: 6, sm: 4 }} key={i}>
                        <Skeleton variant="rounded" height={70} />
                      </Grid>
                    ))}
                  </Grid>
                ) : slots.length === 0 ? (
                  <Alert severity="info">
                    No available time slots found for this laboratory branch in
                    the upcoming 7 days.
                  </Alert>
                ) : (
                  <Grid container spacing={2}>
                    {slots.map((slot) => (
                      <Grid size={{ xs: 6, sm: 4 }} key={slot.id}>
                        <Card
                          elevation={0}
                          sx={{
                            border: "1.5px solid",
                            borderColor:
                              selectedSlot?.id === slot.id
                                ? "primary.main"
                                : "divider",
                            opacity: slot.isAvailable ? 1 : 0.5,
                          }}
                        >
                          <CardActionArea
                            disabled={!slot.isAvailable}
                            onClick={() => setSelectedSlot(slot)}
                            sx={{ p: 0 }}
                          >
                            <CardContent sx={{ py: 1.5, textAlign: "center" }}>
                              <Typography
                                variant="caption"
                                sx={{ fontWeight: 700, display: "block" }}
                              >
                                {formatDate(slot.slotDate)}
                              </Typography>
                              <Typography
                                variant="body2"
                                sx={{
                                  fontWeight: 600,
                                  mt: 0.5,
                                  color: "primary.main",
                                }}
                              >
                                {formatTime(slot.startTime)}
                              </Typography>
                              <Typography
                                variant="caption"
                                color="text.secondary"
                              >
                                until {formatTime(slot.endTime)}
                              </Typography>
                            </CardContent>
                          </CardActionArea>
                        </Card>
                      </Grid>
                    ))}
                  </Grid>
                )}
              </Grid>

              {/* Members selector */}
              <Grid size={{ xs: 12, md: 4 }}>
                <Card
                  elevation={0}
                  sx={{ border: "1px solid", borderColor: "divider", p: 1.5 }}
                >
                  <CardContent sx={{ p: 1 }}>
                    <Box
                      sx={{
                        display: "flex",
                        gap: 1,
                        alignItems: "center",
                        mb: 2,
                      }}
                    >
                      <PeopleIcon color="primary" />
                      <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                        Number of Persons
                      </Typography>
                    </Box>
                    <Divider sx={{ mb: 2 }} />

                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        mb: 2,
                      }}
                    >
                      <IconButton
                        size="small"
                        disabled={memberCount <= 1}
                        onClick={() => setMemberCount((c) => c - 1)}
                        sx={{ border: "1px solid", borderColor: "divider" }}
                      >
                        <RemoveIcon />
                      </IconButton>
                      <Typography variant="body1" sx={{ fontWeight: 800 }}>
                        {memberCount}
                      </Typography>
                      <IconButton
                        size="small"
                        disabled={
                          selectedSlot
                            ? memberCount >=
                              selectedSlot.maxCapacity -
                                selectedSlot.bookedCount
                            : memberCount >= 6
                        }
                        onClick={() => setMemberCount((c) => c + 1)}
                        sx={{ border: "1px solid", borderColor: "divider" }}
                      >
                        <AddIcon />
                      </IconButton>
                    </Box>
                    {memberCount > 1 && (
                      <Typography
                        variant="caption"
                        color="text.secondary"
                        sx={{ display: "block", textAlign: "center" }}
                      >
                        Additional members are charged at 80% (20% discount on
                        base rates).
                      </Typography>
                    )}
                  </CardContent>
                </Card>
              </Grid>
            </Grid>

            {/* Member × Service matrix */}
            <Box
              sx={{
                mt: 3,
                border: "1px solid",
                borderColor: "divider",
                borderRadius: "10px",
                overflow: "hidden",
              }}
            >
              {/* Matrix header */}
              <Box
                sx={{
                  display: "grid",
                  gridTemplateColumns: `220px repeat(${cart.length}, 1fr)`,
                  backgroundColor: "primary.main",
                  color: "primary.contrastText",
                  overflowX: "auto",
                }}
              >
                <Box sx={{ p: 1.5 }}>
                  <Typography
                    variant="caption"
                    sx={{ fontWeight: 800, color: "inherit" }}
                  >
                    👤 Person
                  </Typography>
                </Box>
                {cart.map((item) => (
                  <Box
                    key={item.id}
                    sx={{
                      p: 1,
                      borderLeft: "1px solid rgba(255,255,255,0.2)",
                      minWidth: 120,
                    }}
                  >
                    <Typography
                      variant="caption"
                      sx={{
                        fontWeight: 700,
                        color: "inherit",
                        display: "block",
                        lineHeight: 1.3,
                      }}
                    >
                      {item.name}
                    </Typography>
                    <Typography
                      variant="caption"
                      sx={{ color: "rgba(255,255,255,0.75)" }}
                    >
                      ₹{item.basePrice}
                    </Typography>
                    <Box sx={{ mt: 0.5 }}>
                      <Button
                        size="small"
                        variant="text"
                        sx={{
                          color: "rgba(255,255,255,0.9)",
                          fontSize: "0.65rem",
                          p: 0,
                          minWidth: 0,
                          textTransform: "none",
                          lineHeight: 1.2,
                          textDecoration: "underline",
                        }}
                        onClick={() => {
                          const updated = memberSelections.map((sel) => ({
                            ...sel,
                            itemIds: sel.itemIds.includes(item.id)
                              ? sel.itemIds
                              : [...sel.itemIds, item.id],
                          }));
                          setMemberSelections(updated);
                        }}
                      >
                        Select all ↓
                      </Button>
                    </Box>
                  </Box>
                ))}
              </Box>

              {/* Matrix rows */}
              {memberSelections.map((selection, idx) => (
                <Box
                  key={idx}
                  sx={{
                    display: "grid",
                    gridTemplateColumns: `220px repeat(${cart.length}, 1fr)`,
                    borderTop: idx > 0 ? "1px solid" : "none",
                    borderColor: "divider",
                    backgroundColor:
                      idx % 2 === 0 ? "background.paper" : "action.hover",
                    overflowX: "auto",
                  }}
                >
                  {/* Person label + name field */}
                  <Box
                    sx={{
                      p: 1.5,
                      display: "flex",
                      flexDirection: "column",
                      gap: 0.5,
                    }}
                  >
                    <Typography
                      variant="caption"
                      sx={{ fontWeight: 800, color: "primary.main" }}
                    >
                      {idx === 0 ? "🙋 Self (Primary)" : `👥 Member ${idx + 1}`}
                    </Typography>
                    <TextField
                      size="small"
                      placeholder="Name"
                      value={selection.name}
                      onChange={(e) => {
                        const updated = [...memberSelections];
                        updated[idx] = {
                          ...updated[idx],
                          name: e.target.value,
                        };
                        setMemberSelections(updated);
                      }}
                      sx={{
                        "& .MuiInputBase-input": {
                          py: 0.5,
                          fontSize: "0.8rem",
                        },
                      }}
                    />
                    {idx > 0 && (
                      <Typography
                        variant="caption"
                        sx={{ color: "success.main", fontWeight: 600 }}
                      >
                        20% discount
                      </Typography>
                    )}
                  </Box>

                  {/* Checkbox cells per service */}
                  {cart.map((item) => {
                    const isChecked = selection.itemIds.includes(item.id);
                    return (
                      <Box
                        key={item.id}
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          borderLeft: "1px solid",
                          borderColor: "divider",
                          minWidth: 120,
                          cursor: "pointer",
                          backgroundColor: isChecked
                            ? "rgba(21,128,61,0.08)"
                            : "transparent",
                          transition: "background-color 0.15s",
                        }}
                        onClick={() => {
                          const updated = [...memberSelections];
                          updated[idx] = {
                            ...updated[idx],
                            itemIds: isChecked
                              ? updated[idx].itemIds.filter(
                                  (id) => id !== item.id,
                                )
                              : [...updated[idx].itemIds, item.id],
                          };
                          setMemberSelections(updated);
                        }}
                      >
                        <Checkbox
                          size="small"
                          checked={isChecked}
                          onChange={() => {}}
                          sx={{
                            color: isChecked ? "success.main" : "divider",
                            "&.Mui-checked": { color: "success.main" },
                          }}
                        />
                      </Box>
                    );
                  })}
                </Box>
              ))}

              {/* Matrix footer: per-person subtotals */}
              <Box
                sx={{
                  display: "grid",
                  gridTemplateColumns: `220px repeat(${cart.length}, 1fr)`,
                  backgroundColor: "action.selected",
                  borderTop: "2px solid",
                  borderColor: "divider",
                  overflowX: "auto",
                }}
              >
                <Box sx={{ p: 1.5 }}>
                  <Typography variant="caption" sx={{ fontWeight: 800 }}>
                    Coverage
                  </Typography>
                </Box>
                {cart.map((item) => {
                  const count = memberSelections.filter((sel) =>
                    sel.itemIds.includes(item.id),
                  ).length;
                  return (
                    <Box
                      key={item.id}
                      sx={{
                        p: 1,
                        borderLeft: "1px solid",
                        borderColor: "divider",
                        minWidth: 120,
                        textAlign: "center",
                      }}
                    >
                      <Chip
                        label={`${count} / ${memberSelections.length}`}
                        size="small"
                        color={
                          count === 0
                            ? "error"
                            : count === memberSelections.length
                              ? "success"
                              : "warning"
                        }
                        sx={{ fontSize: "0.7rem", height: 20 }}
                      />
                    </Box>
                  );
                })}
              </Box>
            </Box>

            {/* Quick-fill hint */}
            {memberSelections.some((m) => m.itemIds.length === 0) && (
              <Alert severity="warning" sx={{ mt: 2, fontWeight: 600 }}>
                ⚠️ Every person must have at least one service selected. Click{" "}
                <strong>"Select all ↓"</strong> on a service column to quickly
                assign it to everyone.
              </Alert>
            )}

            <Box
              sx={{
                display: "flex",
                justifyContent: "flex-end",
                gap: 2,
                mt: 4,
              }}
            >
              <Button
                variant="outlined"
                onClick={() => setStep(2)}
                sx={{ fontWeight: 600 }}
              >
                Back
              </Button>
              <Button
                variant="contained"
                disabled={
                  !selectedSlot ||
                  memberSelections.some((m) => m.itemIds.length === 0)
                }
                onClick={() => setStep(4)}
                sx={{ fontWeight: 700 }}
              >
                Review Booking
              </Button>
            </Box>
          </Box>
        )}

        {/* STEP 5: REVIEW & CONFIRM */}
        {step === 4 && (
          <Box>
            <Grid container spacing={3}>
              <Grid size={{ xs: 12, md: 8 }}>
                <Card
                  elevation={0}
                  sx={{ border: "1px solid", borderColor: "divider", p: 2 }}
                >
                  <CardContent sx={{ p: 0 }}>
                    <Typography
                      variant="subtitle2"
                      sx={{ fontWeight: 700, mb: 1.5 }}
                    >
                      Receipt & Detailed Booking Breakdown
                    </Typography>
                    <Divider sx={{ mb: 2 }} />

                    {/* Detailed Services list with pricing */}
                    <Box sx={{ mb: 2 }}>
                      <Typography
                        variant="caption"
                        color="text.secondary"
                        sx={{ fontWeight: 700, mb: 1, display: "block" }}
                      >
                        Selected Tests per Patient
                      </Typography>
                      {memberSelections.map((selection, idx) => (
                        <Box
                          key={idx}
                          sx={{
                            mb: 1.5,
                            p: 1.5,
                            borderRadius: "6px",
                            backgroundColor: "action.hover",
                            border: "1px solid",
                            borderColor: "divider",
                          }}
                        >
                          <Typography
                            variant="subtitle2"
                            sx={{
                              fontWeight: 700,
                              fontSize: "0.85rem",
                              color: "primary.main",
                            }}
                          >
                            👤 {selection.name}{" "}
                            {idx > 0 && "(20% Member Discount)"}
                          </Typography>
                          {selection.itemIds.map((id) => {
                            const item = cart.find((c) => c.id === id);
                            if (!item) return null;
                            const discountRate = idx === 0 ? 1 : 0.8;
                            return (
                              <Box
                                key={id}
                                sx={{
                                  display: "flex",
                                  justifyContent: "space-between",
                                  pl: 2,
                                  mt: 0.5,
                                }}
                              >
                                <Typography
                                  variant="caption"
                                  color="text.secondary"
                                >
                                  • {item.name}
                                </Typography>
                                <Typography
                                  variant="caption"
                                  sx={{ fontWeight: 600 }}
                                >
                                  ₹{Math.round(item.basePrice * discountRate)}{" "}
                                  {idx > 0 && (
                                    <span
                                      style={{
                                        textDecoration: "line-through",
                                        color: "gray",
                                        fontSize: "0.7rem",
                                        marginLeft: "4px",
                                      }}
                                    >
                                      ₹{item.basePrice}
                                    </span>
                                  )}
                                </Typography>
                              </Box>
                            );
                          })}
                        </Box>
                      ))}
                    </Box>

                    <Divider sx={{ my: 1.5, borderStyle: "dashed" }} />

                    {/* Pricing breakdown above the total */}
                    <Box
                      sx={{
                        display: "flex",
                        flexDirection: "column",
                        gap: 1,
                        mb: 2,
                      }}
                    >
                      <Box
                        sx={{
                          display: "flex",
                          justifyContent: "space-between",
                        }}
                      >
                        <Typography variant="caption" color="text.secondary">
                          Base Subtotal ({memberCount} person
                          {memberCount > 1 ? "s" : ""})
                        </Typography>
                        <Typography variant="caption" sx={{ fontWeight: 600 }}>
                          ₹{baseSubtotalTotal}
                        </Typography>
                      </Box>
                      {memberCount > 1 && (
                        <Box
                          sx={{
                            display: "flex",
                            justifyContent: "space-between",
                          }}
                        >
                          <Typography variant="caption" color="success.main">
                            Member discount (20% on additional members)
                          </Typography>
                          <Typography
                            variant="caption"
                            color="success.main"
                            sx={{ fontWeight: 600 }}
                          >
                            - ₹{totalMemberDiscount}
                          </Typography>
                        </Box>
                      )}
                      {usingSplitMode && splitSuggestion ? (
                        splitSuggestion.labs.map((lab, idx) => (
                          <Box
                            key={lab.branchId}
                            sx={{
                              display: "flex",
                              justifyContent: "space-between",
                            }}
                          >
                            <Typography
                              variant="caption"
                              color="text.secondary"
                            >
                              🚗 Travel Fee: {lab.name} (
                              {lab.roadDistance.toFixed(1)} km)
                            </Typography>
                            <Typography
                              variant="caption"
                              sx={{ fontWeight: 600 }}
                            >
                              + ₹{Math.round(lab.travelFee)}
                            </Typography>
                          </Box>
                        ))
                      ) : (
                        <Box
                          sx={{
                            display: "flex",
                            justifyContent: "space-between",
                          }}
                        >
                          <Typography variant="caption" color="text.secondary">
                            Travel Service Fee (Road distance:{" "}
                            {selectedLab?.roadDistance.toFixed(2)} km)
                          </Typography>
                          <Typography
                            variant="caption"
                            sx={{ fontWeight: 600 }}
                          >
                            + ₹{travelFee}
                          </Typography>
                        </Box>
                      )}
                    </Box>

                    <Divider sx={{ my: 2 }} />

                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                      }}
                    >
                      <Typography variant="body1" sx={{ fontWeight: 700 }}>
                        Grand Total Amount:
                      </Typography>
                      <Typography
                        variant="h5"
                        sx={{ fontWeight: 800, color: "primary.main" }}
                      >
                        ₹{grandTotal}
                      </Typography>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>

              {/* Time slot breakdown per user */}
              <Grid size={{ xs: 12, md: 4 }}>
                <Card
                  elevation={0}
                  sx={{ border: "1px solid", borderColor: "divider", p: 2 }}
                >
                  <CardContent sx={{ p: 0 }}>
                    <Typography
                      variant="subtitle2"
                      sx={{ fontWeight: 700, mb: 1.5 }}
                    >
                      Schedule & Slots Per User
                    </Typography>
                    <Divider sx={{ mb: 2 }} />

                    {usingSplitMode && splitSuggestion ? (
                      <Box
                        sx={{
                          display: "flex",
                          flexDirection: "column",
                          gap: 1.5,
                        }}
                      >
                        {splitSuggestion.labs.map((lab) => {
                          const slot = splitSlots[lab.branchId];
                          return (
                            <Box
                              key={lab.branchId}
                              sx={{
                                p: 1,
                                bgcolor: "action.hover",
                                border: "1px solid",
                                borderColor: "divider",
                                borderRadius: 1,
                              }}
                            >
                              <Typography
                                variant="caption"
                                sx={{ fontWeight: 700, display: "block" }}
                              >
                                🏨 {lab.name}
                              </Typography>
                              <Typography
                                variant="caption"
                                color="primary.main"
                                sx={{ fontWeight: 600 }}
                              >
                                Slot:{" "}
                                {slot
                                  ? `${formatDate(slot.slotDate)} @ ${formatTime(slot.startTime)}`
                                  : "—"}
                              </Typography>
                            </Box>
                          );
                        })}
                        <Alert
                          severity="info"
                          sx={{
                            mt: 1,
                            p: 0.5,
                            "& .MuiAlert-icon": { fontSize: 18 },
                          }}
                        >
                          <Typography
                            variant="caption"
                            sx={{ display: "block" }}
                          >
                            Timings for each member will be allocated within the
                            respective slot ranges by each lab.
                          </Typography>
                        </Alert>
                      </Box>
                    ) : (
                      <>
                        <Box sx={{ mb: 2 }}>
                          <Typography variant="caption" color="text.secondary">
                            Overall Appointment Slot
                          </Typography>
                          <Typography variant="body2" sx={{ fontWeight: 700 }}>
                            {formatDate(selectedSlot?.slotDate ?? null)} @{" "}
                            {formatTime(selectedSlot?.startTime ?? null)} -{" "}
                            {formatTime(selectedSlot?.endTime ?? null)}
                          </Typography>
                        </Box>

                        <Typography
                          variant="caption"
                          color="text.secondary"
                          sx={{ fontWeight: 700, display: "block", mb: 1 }}
                        >
                          Allocated Timing Per Member
                        </Typography>
                        <Box
                          sx={{
                            display: "flex",
                            flexDirection: "column",
                            gap: 1,
                          }}
                        >
                          {getMemberSlotTimes(
                            selectedSlot?.startTime ?? null,
                            selectedSlot?.endTime ?? null,
                            memberCount,
                          ).map((slotTime, idx) => (
                            <Box
                              key={idx}
                              sx={{
                                p: 1,
                                bgcolor: "background.default",
                                border: "1px solid",
                                borderColor: "divider",
                                borderRadius: 1,
                              }}
                            >
                              <Typography
                                variant="caption"
                                sx={{ fontWeight: 700, display: "block" }}
                              >
                                {idx === 0
                                  ? "Member 1 (Primary Patient)"
                                  : `Member ${idx + 1}`}
                              </Typography>
                              <Typography
                                variant="caption"
                                color="primary.main"
                                sx={{ fontWeight: 600 }}
                              >
                                Timing: {slotTime.start} to {slotTime.end}
                              </Typography>
                            </Box>
                          ))}
                        </Box>
                      </>
                    )}
                  </CardContent>
                </Card>
              </Grid>
            </Grid>

            <Box
              sx={{
                display: "flex",
                justifyContent: "flex-end",
                gap: 2,
                mt: 4,
              }}
            >
              <Button
                variant="outlined"
                disabled={booking}
                onClick={() => setStep(usingSplitMode ? 2 : 3)}
                sx={{ fontWeight: 600 }}
              >
                Back
              </Button>
              <Button
                variant="contained"
                disabled={booking}
                onClick={handleBook}
                sx={{ fontWeight: 700, minWidth: 150 }}
              >
                {booking ? (
                  <CircularProgress size={18} color="inherit" />
                ) : (
                  "Confirm & Pay"
                )}
              </Button>
            </Box>
          </Box>
        )}
      </Box>
    </>
  );
}
