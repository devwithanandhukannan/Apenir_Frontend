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
import { useApi } from "@/core_components/hooks/useApi/useApi";
import {
  useCustomerService,
  BookAppointmentRequest,
} from "@/core_components/apis/admin/customerService/useCustomerService";
import ScienceIcon from "@mui/icons-material/Science";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import PeopleIcon from "@mui/icons-material/People";
import AddIcon from "@mui/icons-material/Add";
import RemoveIcon from "@mui/icons-material/Remove";

interface ServiceItem {
  id: string;
  name: string;
  category: string;
  description?: string;
  basePrice: number;
  isActive: boolean;
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
  "Select Service",
  "Your Location",
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

export default function CustomerBookPage() {
  const router = useRouter();
  const { get } = useApi();
  const { bookAppointment } = useCustomerService();

  const [step, setStep] = useState(0);
  const [error, setError] = useState<string | null>(null);

  // Step 1: Services
  const [services, setServices] = useState<ServiceItem[]>([]);
  const [servicesLoading, setServicesLoading] = useState(false);
  const [selectedService, setSelectedService] = useState<ServiceItem | null>(
    null,
  );

  // Step 2: Location
  const [latitude, setLatitude] = useState<number | null>(null);
  const [longitude, setLongitude] = useState<number | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [locationLoading, setLocationLoading] = useState(false);
  const [building, setBuilding] = useState("");
  const [landmark, setLandmark] = useState("");
  const [floor, setFloor] = useState("");
  const [memberCount, setMemberCount] = useState(1);

  // Step 3: Slots
  const [slots, setSlots] = useState<SlotItem[]>([]);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<SlotItem | null>(null);

  // Step 4: Confirmation
  const [booking, setBooking] = useState(false);
  const [booked, setBooked] = useState(false);
  const [bookedApptNumber, setBookedApptNumber] = useState("");
  const [bookedPasscode, setBookedPasscode] = useState("");
  const [bookedAddress, setBookedAddress] = useState("");

  // Load services on mount
  const loadServices = useCallback(async () => {
    setServicesLoading(true);
    await get<ApiResponse<ServiceItem[]>>({
      endpoint: "/api/services",
      requireAuth: true,
      onSuccess: (data) => {
        setServices(data.data?.filter((s) => s.isActive) ?? []);
        setServicesLoading(false);
      },
      onError: () => {
        setServicesLoading(false);
      },
    });
  }, [get]);

  useEffect(() => {
    loadServices();
  }, [loadServices]);

  // Auto-detect location
  const detectLocation = useCallback(() => {
    setLocationLoading(true);
    setLocationError(null);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLatitude(pos.coords.latitude);
        setLongitude(pos.coords.longitude);
        setLocationLoading(false);
      },
      (err) => {
        setLocationError(
          "Could not detect location. Please enable location access and retry.",
        );
        setLocationLoading(false);
      },
    );
  }, []);

  // Load available slots from the real nearby slots endpoint
  const loadSlots = useCallback(async () => {
    if (!latitude || !longitude || !selectedService) return;
    setSlotsLoading(true);
    setError(null);
    await get<ApiResponse<SlotItem[]>>({
      endpoint: `/api/appointments/slots?latitude=${latitude}&longitude=${longitude}&serviceId=${selectedService.id}`,
      requireAuth: true,
      onSuccess: (data) => {
        setSlots(data.data ?? []);
        setSlotsLoading(false);
      },
      onError: (err) => {
        setError(err?.message ?? "Failed to load available slots near you.");
        setSlotsLoading(false);
      },
    });
  }, [get, latitude, longitude, selectedService]);

  useEffect(() => {
    if (step === 2) {
      loadSlots();
    }
  }, [step, loadSlots]);

  const handleBook = async () => {
    if (!selectedService || !selectedSlot || !latitude || !longitude) return;
    setBooking(true);
    setError(null);
    const payload: BookAppointmentRequest = {
      latitude,
      longitude,
      serviceId: selectedService.id,
      slotId: selectedSlot.id,
      memberCount,
      buildingDetails: building,
      landmark,
      floor,
    };
    await bookAppointment(payload, {
      onSuccess: (data) => {
        setBooking(false);
        setBooked(true);
        setBookedApptNumber(data.data?.appointmentNumber ?? "");
        setBookedPasscode(data.data?.passcode ?? "");
        setBookedAddress(data.data?.locationAddress ?? "");
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
            Your home collection has been booked successfully.
          </Typography>
          <Card
            elevation={0}
            sx={{
              border: "2px solid",
              borderColor: "primary.main",
              maxWidth: 420,
              mx: "auto",
              mb: 3,
            }}
          >
            <CardContent sx={{ textAlign: "left" }}>
              <Typography variant="caption" color="text.secondary">
                Appointment Number
              </Typography>
              <Typography variant="h6" sx={{ fontWeight: 700, mb: 1.5 }}>
                {bookedApptNumber}
              </Typography>
              <Divider sx={{ mb: 1.5 }} />
              <Typography variant="caption" color="text.secondary">
                Registered Address & Total Cost
              </Typography>
              <Typography variant="body2" sx={{ fontWeight: 600, mb: 1.5 }}>
                {bookedAddress}
              </Typography>
              <Divider sx={{ mb: 1.5 }} />
              <Typography variant="caption" color="text.secondary">
                Collection Passcode (Share with phlebotomist upon arrival)
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
          <Button
            variant="contained"
            onClick={() => router.push("/customer")}
            sx={{ fontWeight: 700 }}
          >
            Go to My Appointments
          </Button>
        </Box>
      </>
    );
  }

  return (
    <>
      <Head>
        <title>Book Home Collection – Appenir</title>
        <meta
          name="description"
          content="Book a diagnostic home collection visit. Choose your test, share your location, and pick a convenient time slot."
        />
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
            Book Home Collection
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

        {/* Mobile step indicator */}
        <Box
          sx={{
            display: { xs: "flex", sm: "none" },
            mb: 3,
            gap: 1,
            alignItems: "center",
          }}
        >
          <Typography
            variant="caption"
            color="text.secondary"
            sx={{ fontWeight: 600 }}
          >
            Step {step + 1} of {STEPS.length}:
          </Typography>
          <Typography
            variant="caption"
            sx={{ fontWeight: 700, color: "primary.main" }}
          >
            {STEPS[step]}
          </Typography>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        {/* Step 1: Select Service */}
        {step === 0 && (
          <Box>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Choose the diagnostic test or health package you'd like to book.
            </Typography>
            {servicesLoading ? (
              <Grid container spacing={2}>
                {[1, 2, 3, 4].map((i) => (
                  <Grid size={{ xs: 12, sm: 6 }} key={i}>
                    <Skeleton variant="rounded" height={100} />
                  </Grid>
                ))}
              </Grid>
            ) : (
              <Grid container spacing={2}>
                {services.map((service) => (
                  <Grid size={{ xs: 12, sm: 6 }} key={service.id}>
                    <Card
                      elevation={0}
                      sx={{
                        border: "1.5px solid",
                        borderColor:
                          selectedService?.id === service.id
                            ? "primary.main"
                            : "divider",
                        transition: "border-color 0.2s, box-shadow 0.2s",
                        "&:hover": {
                          borderColor: "primary.main",
                          boxShadow: "0 4px 16px rgba(5,150,105,0.12)",
                        },
                      }}
                    >
                      <CardActionArea
                        onClick={() => setSelectedService(service)}
                        sx={{ p: 0 }}
                      >
                        <CardContent>
                          <Box
                            sx={{
                              display: "flex",
                              justifyContent: "space-between",
                              alignItems: "flex-start",
                            }}
                          >
                            <Box sx={{ display: "flex", gap: 1.5 }}>
                              <ScienceIcon
                                sx={{
                                  color:
                                    selectedService?.id === service.id
                                      ? "primary.main"
                                      : "text.disabled",
                                  fontSize: 22,
                                  mt: 0.2,
                                }}
                              />
                              <Box>
                                <Typography
                                  variant="body2"
                                  sx={{ fontWeight: 700 }}
                                >
                                  {service.name}
                                </Typography>
                                <Chip
                                  label={service.category}
                                  size="small"
                                  sx={{
                                    fontSize: 10,
                                    height: 18,
                                    mt: 0.4,
                                    fontWeight: 600,
                                  }}
                                />
                              </Box>
                            </Box>
                            <Box sx={{ textAlign: "right" }}>
                              <Typography
                                variant="body2"
                                sx={{
                                  fontWeight: 800,
                                  color: "primary.main",
                                }}
                              >
                                ₹{service.basePrice.toLocaleString("en-IN")}
                              </Typography>
                              <Typography
                                variant="caption"
                                color="text.secondary"
                              >
                                base price
                              </Typography>
                            </Box>
                          </Box>
                          {service.description && (
                            <Typography
                              variant="caption"
                              color="text.secondary"
                              sx={{ mt: 1, display: "block" }}
                            >
                              {service.description}
                            </Typography>
                          )}
                        </CardContent>
                      </CardActionArea>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            )}
            <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 3 }}>
              <Button
                variant="contained"
                disabled={!selectedService}
                onClick={() => setStep(1)}
                sx={{ fontWeight: 700 }}
              >
                Continue
              </Button>
            </Box>
          </Box>
        )}

        {/* Step 2: Location */}
        {step === 1 && (
          <Box>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Share your collection address. The phlebotomist will arrive at
              this location.
            </Typography>

            {/* GPS Detection */}
            <Card
              elevation={0}
              sx={{
                border: "1px solid",
                borderColor: latitude ? "success.main" : "divider",
                mb: 2,
              }}
            >
              <CardContent
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <Box sx={{ display: "flex", gap: 1.5, alignItems: "center" }}>
                  <LocationOnIcon
                    sx={{
                      color: latitude ? "success.main" : "text.disabled",
                      fontSize: 22,
                    }}
                  />
                  <Box>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      {latitude
                        ? `GPS: ${latitude.toFixed(5)}, ${longitude?.toFixed(5)}`
                        : "GPS Location Not Detected"}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {latitude
                        ? "Location detected successfully"
                        : "Click 'Detect' to use your current location"}
                    </Typography>
                  </Box>
                </Box>
                <Button
                  size="small"
                  variant={latitude ? "outlined" : "contained"}
                  onClick={detectLocation}
                  disabled={locationLoading}
                  sx={{ fontWeight: 600, flexShrink: 0 }}
                >
                  {locationLoading ? (
                    <CircularProgress size={16} color="inherit" />
                  ) : latitude ? (
                    "Re-detect"
                  ) : (
                    "Detect"
                  )}
                </Button>
              </CardContent>
            </Card>

            {locationError && (
              <Alert severity="warning" sx={{ mb: 2 }}>
                {locationError}
              </Alert>
            )}

            {/* Address Details */}
            <Grid container spacing={2}>
              <Grid size={{ xs: 12, sm: 8 }}>
                <TextField
                  label="Building / House Details"
                  placeholder="Flat 4B, Sunrise Apartments"
                  fullWidth
                  size="small"
                  value={building}
                  onChange={(e) => setBuilding(e.target.value)}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 4 }}>
                <TextField
                  label="Floor"
                  placeholder="3rd"
                  fullWidth
                  size="small"
                  value={floor}
                  onChange={(e) => setFloor(e.target.value)}
                />
              </Grid>
              <Grid size={{ xs: 12 }}>
                <TextField
                  label="Landmark (optional)"
                  placeholder="Near City Hospital gate"
                  fullWidth
                  size="small"
                  value={landmark}
                  onChange={(e) => setLandmark(e.target.value)}
                />
              </Grid>

              {/* Member Count */}
              <Grid size={{ xs: 12 }}>
                <Card
                  elevation={0}
                  sx={{ border: "1px solid", borderColor: "divider" }}
                >
                  <CardContent sx={{ py: 1.5 }}>
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                      }}
                    >
                      <Box
                        sx={{ display: "flex", gap: 1, alignItems: "center" }}
                      >
                        <PeopleIcon
                          sx={{ fontSize: 18, color: "primary.main" }}
                        />
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                          Number of Members
                        </Typography>
                      </Box>
                      <Box
                        sx={{ display: "flex", alignItems: "center", gap: 1.5 }}
                      >
                        <IconButton
                          size="small"
                          onClick={() =>
                            setMemberCount((c) => Math.max(1, c - 1))
                          }
                          disabled={memberCount <= 1}
                          sx={{ border: "1px solid", borderColor: "divider" }}
                        >
                          <RemoveIcon fontSize="small" />
                        </IconButton>
                        <Typography
                          variant="body1"
                          sx={{
                            fontWeight: 700,
                            minWidth: 24,
                            textAlign: "center",
                          }}
                        >
                          {memberCount}
                        </Typography>
                        <IconButton
                          size="small"
                          onClick={() =>
                            setMemberCount((c) => Math.min(10, c + 1))
                          }
                          sx={{ border: "1px solid", borderColor: "divider" }}
                        >
                          <AddIcon fontSize="small" />
                        </IconButton>
                      </Box>
                    </Box>
                    {memberCount > 1 && (
                      <Typography
                        variant="caption"
                        color="text.secondary"
                        sx={{ mt: 0.5, display: "block" }}
                      >
                        Additional members are charged at 80% of the base rate.
                      </Typography>
                    )}
                  </CardContent>
                </Card>
              </Grid>
            </Grid>

            <Box
              sx={{
                display: "flex",
                justifyContent: "flex-end",
                mt: 3,
                gap: 1.5,
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
                disabled={!latitude}
                onClick={() => setStep(2)}
                sx={{ fontWeight: 700 }}
              >
                Continue
              </Button>
            </Box>
          </Box>
        )}

        {/* Step 3: Date & Slot */}
        {step === 2 && (
          <Box>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Select an available date and time slot for your home collection.
              We fetch these slots dynamically from nearby branches.
            </Typography>

            {slotsLoading ? (
              <Grid container spacing={2}>
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <Grid size={{ xs: 6, sm: 4 }} key={i}>
                    <Skeleton variant="rounded" height={72} />
                  </Grid>
                ))}
              </Grid>
            ) : slots.length === 0 ? (
              <Alert severity="info">
                No laboratory branches offering this service exist within range
                of your current location.
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
                        transition: "border-color 0.2s",
                        "&:hover": slot.isAvailable
                          ? { borderColor: "primary.main" }
                          : {},
                      }}
                    >
                      <CardActionArea
                        disabled={!slot.isAvailable}
                        onClick={() => setSelectedSlot(slot)}
                        sx={{ p: 0 }}
                      >
                        <CardContent sx={{ py: 1.5 }}>
                          <Box
                            sx={{
                              display: "flex",
                              gap: 0.8,
                              alignItems: "center",
                              mb: 0.5,
                            }}
                          >
                            <CalendarTodayIcon
                              sx={{
                                fontSize: 13,
                                color:
                                  selectedSlot?.id === slot.id
                                    ? "primary.main"
                                    : "text.disabled",
                              }}
                            />
                            <Typography
                              variant="caption"
                              sx={{ fontWeight: 700 }}
                            >
                              {formatDate(slot.slotDate)}
                            </Typography>
                          </Box>
                          <Typography
                            variant="body2"
                            sx={{
                              fontWeight: 600,
                              color:
                                selectedSlot?.id === slot.id
                                  ? "primary.main"
                                  : "text.primary",
                            }}
                          >
                            {formatTime(slot.startTime)}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            until {formatTime(slot.endTime)}
                          </Typography>
                          <Box sx={{ mt: 0.5 }}>
                            <Chip
                              label={slot.isAvailable ? "Available" : "Full"}
                              size="small"
                              color={slot.isAvailable ? "success" : "default"}
                              sx={{ fontSize: 10, height: 16, fontWeight: 600 }}
                            />
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
                mt: 3,
                gap: 1.5,
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
                disabled={!selectedSlot}
                onClick={() => setStep(3)}
                sx={{ fontWeight: 700 }}
              >
                Review Booking
              </Button>
            </Box>
          </Box>
        )}

        {/* Step 4: Review & Confirm */}
        {step === 3 && (
          <Box>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Please review your booking details before confirming.
            </Typography>

            <Card
              elevation={0}
              sx={{ border: "1px solid", borderColor: "divider", mb: 3 }}
            >
              <CardContent>
                <Typography
                  variant="subtitle2"
                  sx={{ fontWeight: 700, mb: 1.5 }}
                >
                  Booking Summary
                </Typography>
                <Divider sx={{ mb: 1.5 }} />

                <Grid container spacing={1.5}>
                  {[
                    {
                      label: "Diagnostic Test",
                      value: selectedService?.name ?? "—",
                    },
                    {
                      label: "Category",
                      value: selectedService?.category ?? "—",
                    },
                    {
                      label: "Date",
                      value: formatDate(selectedSlot?.slotDate ?? null),
                    },
                    {
                      label: "Time",
                      value: formatTime(selectedSlot?.startTime ?? null),
                    },
                    {
                      label: "Members",
                      value: memberCount.toString(),
                    },
                    {
                      label: "Building",
                      value: building || "—",
                    },
                    {
                      label: "Floor",
                      value: floor || "—",
                    },
                    {
                      label: "Landmark",
                      value: landmark || "—",
                    },
                  ].map(({ label, value }) => (
                    <Grid size={{ xs: 6 }} key={label}>
                      <Typography variant="caption" color="text.secondary">
                        {label}
                      </Typography>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        {value}
                      </Typography>
                    </Grid>
                  ))}
                </Grid>

                <Divider sx={{ my: 1.5 }} />

                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <Typography variant="body2" color="text.secondary">
                    Estimated Base Total
                  </Typography>
                  <Box sx={{ textAlign: "right" }}>
                    <Typography
                      variant="h6"
                      sx={{ fontWeight: 800, color: "primary.main" }}
                    >
                      ₹
                      {selectedService
                        ? (
                            selectedService.basePrice +
                            (memberCount > 1
                              ? Math.round(
                                  (memberCount - 1) *
                                    selectedService.basePrice *
                                    0.8,
                                )
                              : 0)
                          ).toLocaleString("en-IN")
                        : "—"}
                    </Typography>
                    {memberCount > 1 && (
                      <Typography variant="caption" color="text.secondary">
                        {memberCount} members (20% discount on additional)
                      </Typography>
                    )}
                  </Box>
                </Box>
              </CardContent>
            </Card>

            <Alert severity="info" sx={{ mb: 3, fontSize: 12 }}>
              A 4-digit verification passcode will be generated for security.
              Also note that travel charges calculated dynamically by road
              distance (using OSRM routing) from the dispatch branch will be
              added to the final invoice total.
            </Alert>

            <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 1.5 }}>
              <Button
                variant="outlined"
                onClick={() => setStep(2)}
                disabled={booking}
                sx={{ fontWeight: 600 }}
              >
                Back
              </Button>
              <Button
                variant="contained"
                onClick={handleBook}
                disabled={booking}
                sx={{ fontWeight: 700, minWidth: 140 }}
              >
                {booking ? (
                  <CircularProgress size={18} color="inherit" />
                ) : (
                  "Confirm Booking"
                )}
              </Button>
            </Box>
          </Box>
        )}
      </Box>
    </>
  );
}
