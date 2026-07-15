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
  const { get } = useApi();
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
  const [labsLoading, setLabsLoading] = useState(false);
  const [selectedLab, setSelectedLab] = useState<EligibleLab | null>(null);

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
    setError(null);
    const itemIds = cart.map((item) => item.id).join(",");
    await get<ApiResponse<EligibleLab[]>>({
      endpoint: `/api/appointments/eligible-labs?latitude=${latitude}&longitude=${longitude}&itemIds=${itemIds}`,
      requireAuth: true,
      onSuccess: (res) => {
        setEligibleLabs(res.data ?? []);
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
    if (
      !selectedLab ||
      !selectedSlot ||
      !latitude ||
      !longitude ||
      cart.length === 0
    )
      return;
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
  const travelFee = selectedLab?.travelFee ?? 0;
  const grandTotal =
    memberTotals.reduce((sum, m) => sum + m.finalAmount, 0) + travelFee;

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
            ) : eligibleLabs.length === 0 ? (
              <Alert severity="warning">
                We are sorry, but no laboratory branches offering these services
                are available within range of your current location. Please
                update your cart items or choose a different location.
              </Alert>
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
                                {lab.distance.toFixed(1)} km (straight-line) ·{" "}
                                {lab.roadDistance.toFixed(1)} km (road)
                              </Typography>
                            </Box>
                          </Box>
                          <Box sx={{ textAlign: "right" }}>
                            <Typography
                              variant="body1"
                              sx={{ fontWeight: 800, color: "primary.main" }}
                            >
                              ₹{lab.grandTotal}
                            </Typography>
                            <Typography
                              variant="caption"
                              color="text.secondary"
                            >
                              Base ₹{lab.baseTotal} + Travel ₹{lab.travelFee}
                            </Typography>
                          </Box>
                        </CardContent>
                      </CardActionArea>
                    </Card>
                  </Grid>
                ))}
              </Grid>
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
              <Button
                variant="contained"
                disabled={!selectedLab}
                onClick={() => setStep(3)}
                sx={{ fontWeight: 700 }}
              >
                Choose Slot & Members
              </Button>
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

            {/* Granular member selection */}
            <Box sx={{ mt: 3 }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1 }}>
                Configure Test Selections per Person
              </Typography>
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{ display: "block", mb: 2 }}
              >
                Assign specific services/packages to each member. Each person
                must have at least one test selected.
              </Typography>
              <Grid container spacing={2}>
                {memberSelections.map((selection, idx) => (
                  <Grid size={{ xs: 12 }} key={idx}>
                    <Card variant="outlined" sx={{ p: 2, borderRadius: "8px" }}>
                      <Box
                        sx={{
                          display: "flex",
                          gap: 2,
                          alignItems: "center",
                          mb: 1.5,
                          flexWrap: "wrap",
                        }}
                      >
                        <TextField
                          size="small"
                          label={`Person ${idx + 1} Name`}
                          value={selection.name}
                          onChange={(e) => {
                            const newSels = [...memberSelections];
                            newSels[idx] = {
                              ...newSels[idx],
                              name: e.target.value,
                            };
                            setMemberSelections(newSels);
                          }}
                          sx={{ maxWidth: "200px" }}
                        />
                        {idx > 0 && (
                          <Typography
                            variant="caption"
                            color="success.main"
                            sx={{ fontWeight: 700 }}
                          >
                            ⭐ 20% member discount applies to all tests for this
                            person
                          </Typography>
                        )}
                      </Box>
                      <Box sx={{ display: "flex", flexWrap: "wrap", gap: 2 }}>
                        {cart.map((item) => {
                          const isChecked = selection.itemIds.includes(item.id);
                          return (
                            <FormControlLabel
                              key={item.id}
                              control={
                                <Checkbox
                                  size="small"
                                  checked={isChecked}
                                  onChange={(
                                    e: React.ChangeEvent<HTMLInputElement>,
                                  ) => {
                                    const newSels = [...memberSelections];
                                    const currentItems = [
                                      ...newSels[idx].itemIds,
                                    ];
                                    if (e.target.checked) {
                                      currentItems.push(item.id);
                                    } else {
                                      const index = currentItems.indexOf(
                                        item.id,
                                      );
                                      if (index > -1)
                                        currentItems.splice(index, 1);
                                    }
                                    newSels[idx] = {
                                      ...newSels[idx],
                                      itemIds: currentItems,
                                    };
                                    setMemberSelections(newSels);
                                  }}
                                />
                              }
                              label={`${item.name} (₹${item.basePrice})`}
                              sx={{
                                "& .MuiFormControlLabel-label": {
                                  fontSize: "0.875rem",
                                },
                              }}
                            />
                          );
                        })}
                      </Box>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            </Box>

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
                        <Typography variant="caption" sx={{ fontWeight: 600 }}>
                          + ₹{travelFee}
                        </Typography>
                      </Box>
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
                      sx={{ display: "flex", flexDirection: "column", gap: 1 }}
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
                onClick={() => setStep(3)}
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
