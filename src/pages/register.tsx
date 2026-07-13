import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Container from "@mui/material/Container";
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import Grid from "@mui/material/Grid";
import MenuItem from "@mui/material/MenuItem";
import Select from "@mui/material/Select";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import Alert from "@mui/material/Alert";
import CircularProgress from "@mui/material/CircularProgress";
import IconButton from "@mui/material/IconButton";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemText from "@mui/material/ListItemText";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";
import Divider from "@mui/material/Divider";
import ScienceIcon from "@mui/icons-material/Science";
import RoomIcon from "@mui/icons-material/Room";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import toast, { Toaster } from "react-hot-toast";
import { useApi } from "@/core_components/hooks/useApi/useApi";

// Weekdays mapping to DayText enum values: Mon = 1, Tue = 2, Wed = 3, Thu = 4, Fri = 5, Sat = 6, Sun = 7
const DAYS = [
  { value: 1, label: "Monday" },
  { value: 2, label: "Tuesday" },
  { value: 3, label: "Wednesday" },
  { value: 4, label: "Thursday" },
  { value: 5, label: "Friday" },
  { value: 6, label: "Saturday" },
  { value: 7, label: "Sunday" },
];

interface SlotInput {
  dayText: number;
  startTime: string;
  endTime: string;
  maxCapacity: number;
}

export default function Register() {
  const router = useRouter();
  const { get, post } = useApi();
  const { token } = router.query;

  const [verifying, setVerifying] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");
  const [labDetails, setLabDetails] = useState<{
    email: string;
    labName: string;
  } | null>(null);

  // Form Fields State
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [city, setCity] = useState("");
  const [district, setDistrict] = useState("");
  const [pincode, setPincode] = useState("");
  const [latitude, setLatitude] = useState("9.9312"); // default coordinates
  const [longitude, setLongitude] = useState("76.2673");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  // Slot Builder State
  const [slots, setSlots] = useState<SlotInput[]>([
    { dayText: 1, startTime: "09:00", endTime: "13:00", maxCapacity: 5 },
    { dayText: 1, startTime: "14:00", endTime: "18:00", maxCapacity: 5 },
    { dayText: 2, startTime: "09:00", endTime: "13:00", maxCapacity: 5 },
    { dayText: 2, startTime: "14:00", endTime: "18:00", maxCapacity: 5 },
    { dayText: 3, startTime: "09:00", endTime: "13:00", maxCapacity: 5 },
    { dayText: 3, startTime: "14:00", endTime: "18:00", maxCapacity: 5 },
    { dayText: 4, startTime: "09:00", endTime: "13:00", maxCapacity: 5 },
    { dayText: 4, startTime: "14:00", endTime: "18:00", maxCapacity: 5 },
    { dayText: 5, startTime: "09:00", endTime: "13:00", maxCapacity: 5 },
    { dayText: 5, startTime: "14:00", endTime: "18:00", maxCapacity: 5 },
  ]);

  const [newDay, setNewDay] = useState<number>(1);
  const [newStartTime, setNewStartTime] = useState("09:00");
  const [newEndTime, setNewEndTime] = useState("18:00");
  const [newCapacity, setNewCapacity] = useState(5);

  // Verify invitation token on mount/query load
  useEffect(() => {
    if (!router.isReady || !token) return;

    const verifyToken = async () => {
      setVerifying(true);
      setErrorMsg("");
      const response = await get<any>({
        endpoint: `/api/lab-invitation/verify?token=${token}`,
        requireAuth: false,
      });

      if (response.success && response.data?.success && response.data?.data) {
        setLabDetails(response.data.data);
      } else {
        setErrorMsg(
          response.data?.message ||
            "Invitation link is invalid, expired, or already used.",
        );
      }
      setVerifying(false);
    };

    verifyToken();
  }, [router.isReady, token, get]);

  const handleAddSlot = () => {
    if (!newStartTime || !newEndTime) {
      toast.error("Please provide start and end times for the slot.");
      return;
    }
    setSlots((prev) => [
      ...prev,
      {
        dayText: newDay,
        startTime: newStartTime,
        endTime: newEndTime,
        maxCapacity: Number(newCapacity) || 1,
      },
    ]);
    toast.success("Onboarding slot added to configuration.");
  };

  const handleRemoveSlot = (index: number) => {
    setSlots((prev) => prev.filter((_, idx) => idx !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password || password.length < 6) {
      toast.error("Password must be at least 6 characters long.");
      return;
    }

    setIsSubmitting(true);
    const payload = {
      token,
      password,
      phone,
      city,
      district,
      pincode,
      latitude: Number(latitude) || 0,
      longitude: Number(longitude) || 0,
      slots: slots.map((s) => ({
        dayText: s.dayText,
        startTime: s.startTime,
        endTime: s.endTime,
        maxCapacity: s.maxCapacity,
      })),
    };

    const response = await post<any, any>({
      endpoint: "/api/lab-invitation/verify",
      body: payload,
      requireAuth: false,
    });

    setIsSubmitting(false);
    if (response.success && response.data?.success) {
      setSuccess(true);
      toast.success("Registration completed successfully!");
    } else {
      toast.error(
        response.data?.message || "Failed to complete setup configuration.",
      );
    }
  };

  if (verifying) {
    return (
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "100vh",
          bgcolor: "background.default",
        }}
      >
        <CircularProgress color="secondary" size={48} sx={{ mb: 2 }} />
        <Typography
          variant="body1"
          color="text.secondary"
          sx={{ fontWeight: 600 }}
        >
          Verifying lab invitation token...
        </Typography>
      </Box>
    );
  }

  if (errorMsg) {
    return (
      <Container
        maxWidth="sm"
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "100vh",
        }}
      >
        <Card
          sx={{
            border: "1px solid var(--color-border)",
            borderRadius: "16px",
            p: 2,
            boxShadow: "0 8px 32px rgba(0,0,0,0.05)",
          }}
        >
          <CardContent sx={{ textAlign: "center" }}>
            <ScienceIcon sx={{ fontSize: 48, color: "error.main", mb: 2 }} />
            <Typography
              variant="h5"
              sx={{ fontWeight: 800, mb: 1, letterSpacing: "-0.5px" }}
            >
              Invitation Expired
            </Typography>
            <Alert
              severity="error"
              sx={{ mb: 3, borderRadius: "8px", fontWeight: 500 }}
            >
              {errorMsg}
            </Alert>
            <Button
              variant="contained"
              color="primary"
              fullWidth
              onClick={() => router.push("/lab/login")}
              sx={{
                textTransform: "none",
                py: 1.2,
                fontWeight: 700,
                borderRadius: "8px",
              }}
            >
              Back to Portal Login
            </Button>
          </CardContent>
        </Card>
      </Container>
    );
  }

  if (success) {
    return (
      <Container
        maxWidth="sm"
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "100vh",
        }}
      >
        <Card
          sx={{
            border: "1px solid var(--color-border)",
            borderRadius: "16px",
            p: 3,
            boxShadow: "0 8px 32px rgba(0,0,0,0.05)",
          }}
        >
          <CardContent sx={{ textAlign: "center" }}>
            <Box
              sx={{
                display: "inline-flex",
                p: 2,
                borderRadius: "50%",
                bgcolor: "rgba(16,185,129,0.08)",
                color: "secondary.main",
                mb: 2,
              }}
            >
              <ScienceIcon sx={{ fontSize: 48 }} />
            </Box>
            <Typography
              variant="h5"
              sx={{ fontWeight: 800, mb: 1, letterSpacing: "-0.5px" }}
            >
              Activation Complete!
            </Typography>
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ mb: 4, fontWeight: 500 }}
            >
              Your laboratory branch <strong>{labDetails?.labName}</strong> has
              been successfully configured and activated. You can now log into
              your console to manage diagnostics.
            </Typography>
            <Button
              variant="contained"
              color="secondary"
              fullWidth
              onClick={() => router.push("/lab/login")}
              sx={{
                textTransform: "none",
                py: 1.5,
                fontWeight: 700,
                borderRadius: "8px",
                color: "#fff",
                "&:hover": { bgcolor: "rgba(16,185,129,0.85)" },
              }}
            >
              Go to Lab Partner Login
            </Button>
          </CardContent>
        </Card>
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ py: 6 }}>
      <Toaster position="top-right" />
      <Box sx={{ textAlign: "center", mb: 5 }}>
        <Box
          sx={{
            display: "inline-flex",
            p: 1.5,
            borderRadius: "12px",
            bgcolor: "rgba(16,185,129,0.08)",
            color: "secondary.main",
            mb: 1.5,
          }}
        >
          <ScienceIcon sx={{ fontSize: 32 }} />
        </Box>
        <Typography
          variant="h4"
          sx={{ fontWeight: 800, letterSpacing: "-1px", color: "text.primary" }}
        >
          Welcome to Appenir
        </Typography>
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{ mt: 0.5, fontWeight: 500 }}
        >
          Onboarding and profile setup phase for partner branch{" "}
          <strong>{labDetails?.labName}</strong>
        </Typography>
      </Box>

      <form onSubmit={handleSubmit}>
        <Grid container spacing={4}>
          {/* Account Activation Section */}
          <Grid size={{ xs: 12, md: 6 }}>
            <Card
              sx={{
                border: "1px solid var(--color-border)",
                height: "100%",
                borderRadius: "12px",
              }}
            >
              <CardContent sx={{ p: 3 }}>
                <Box
                  sx={{ display: "flex", alignItems: "center", gap: 1, mb: 3 }}
                >
                  <ScienceIcon color="secondary" />
                  <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                    Account Activation
                  </Typography>
                </Box>
                <Grid container spacing={2}>
                  <Grid size={{ xs: 12 }}>
                    <TextField
                      label="Lab/Branch Name"
                      value={labDetails?.labName || ""}
                      fullWidth
                      disabled
                      size="small"
                    />
                  </Grid>
                  <Grid size={{ xs: 12 }}>
                    <TextField
                      label="Registered Email"
                      value={labDetails?.email || ""}
                      fullWidth
                      disabled
                      size="small"
                    />
                  </Grid>
                  <Grid size={{ xs: 12 }}>
                    <TextField
                      label="Password"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      fullWidth
                      required
                      size="small"
                      placeholder="Create portal password"
                      helperText="Must be at least 6 characters"
                    />
                  </Grid>
                  <Grid size={{ xs: 12 }}>
                    <TextField
                      label="Phone Contact"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      fullWidth
                      required
                      size="small"
                      placeholder="Primary contact number"
                    />
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>

          {/* Location Configuration Section */}
          <Grid size={{ xs: 12, md: 6 }}>
            <Card
              sx={{
                border: "1px solid var(--color-border)",
                height: "100%",
                borderRadius: "12px",
              }}
            >
              <CardContent sx={{ p: 3 }}>
                <Box
                  sx={{ display: "flex", alignItems: "center", gap: 1, mb: 3 }}
                >
                  <RoomIcon color="secondary" />
                  <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                    Branch Location
                  </Typography>
                </Box>
                <Grid container spacing={2}>
                  <Grid size={{ xs: 12 }}>
                    <TextField
                      label="City"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      fullWidth
                      required
                      size="small"
                      placeholder="e.g. Ernakulam"
                    />
                  </Grid>
                  <Grid size={{ xs: 6 }}>
                    <TextField
                      label="District"
                      value={district}
                      onChange={(e) => setDistrict(e.target.value)}
                      fullWidth
                      required
                      size="small"
                      placeholder="e.g. Kochi"
                    />
                  </Grid>
                  <Grid size={{ xs: 6 }}>
                    <TextField
                      label="Pin Code"
                      value={pincode}
                      onChange={(e) => setPincode(e.target.value)}
                      fullWidth
                      required
                      size="small"
                      placeholder="e.g. 682011"
                    />
                  </Grid>
                  <Grid size={{ xs: 6 }}>
                    <TextField
                      label="Latitude"
                      type="number"
                      value={latitude}
                      onChange={(e) => setLatitude(e.target.value)}
                      fullWidth
                      required
                      size="small"
                    />
                  </Grid>
                  <Grid size={{ xs: 6 }}>
                    <TextField
                      label="Longitude"
                      type="number"
                      value={longitude}
                      onChange={(e) => setLongitude(e.target.value)}
                      fullWidth
                      required
                      size="small"
                    />
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>

          {/* Booking Slots Configuration Section */}
          <Grid size={{ xs: 12 }}>
            <Card
              sx={{
                border: "1px solid var(--color-border)",
                borderRadius: "12px",
              }}
            >
              <CardContent sx={{ p: 4 }}>
                <Box
                  sx={{ display: "flex", alignItems: "center", gap: 1, mb: 3 }}
                >
                  <AccessTimeIcon color="secondary" />
                  <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                    Setup Slot Availability
                  </Typography>
                </Box>

                {/* Slot Adder Controls */}
                <Box
                  sx={{
                    p: 2,
                    mb: 3,
                    border: "1px dashed var(--color-border)",
                    borderRadius: "8px",
                    bgcolor: "background.default",
                  }}
                >
                  <Typography
                    variant="body2"
                    sx={{ fontWeight: 700, mb: 2, color: "text.primary" }}
                  >
                    Configure & Add Availability Slots
                  </Typography>
                  <Grid container spacing={2} sx={{ alignItems: "center" }}>
                    <Grid size={{ xs: 12, sm: 3 }}>
                      <FormControl fullWidth size="small">
                        <InputLabel>Day</InputLabel>
                        <Select
                          value={newDay}
                          onChange={(e) => setNewDay(Number(e.target.value))}
                          label="Day"
                        >
                          {DAYS.map((d) => (
                            <MenuItem key={d.value} value={d.value}>
                              {d.label}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </Grid>
                    <Grid size={{ xs: 6, sm: 2.5 }}>
                      <TextField
                        label="Start Time"
                        type="time"
                        value={newStartTime}
                        onChange={(e) => setNewStartTime(e.target.value)}
                        fullWidth
                        size="small"
                      />
                    </Grid>
                    <Grid size={{ xs: 6, sm: 2.5 }}>
                      <TextField
                        label="End Time"
                        type="time"
                        value={newEndTime}
                        onChange={(e) => setNewEndTime(e.target.value)}
                        fullWidth
                        size="small"
                      />
                    </Grid>
                    <Grid size={{ xs: 8, sm: 2 }}>
                      <TextField
                        label="Max Capacity"
                        type="number"
                        value={newCapacity}
                        onChange={(e) =>
                          setNewCapacity(Math.max(1, Number(e.target.value)))
                        }
                        fullWidth
                        size="small"
                      />
                    </Grid>
                    <Grid size={{ xs: 4, sm: 2 }}>
                      <Button
                        variant="outlined"
                        color="secondary"
                        startIcon={<AddIcon />}
                        onClick={handleAddSlot}
                        fullWidth
                        sx={{
                          textTransform: "none",
                          fontWeight: 700,
                          borderRadius: "6px",
                          py: 0.9,
                        }}
                      >
                        Add
                      </Button>
                    </Grid>
                  </Grid>
                </Box>

                {/* Slots List */}
                <Typography
                  variant="body2"
                  sx={{ fontWeight: 700, mb: 1, color: "text.primary" }}
                >
                  Configured Active Slots ({slots.length})
                </Typography>
                <Divider sx={{ mb: 1.5 }} />
                {slots.length === 0 ? (
                  <Alert severity="warning" sx={{ borderRadius: "8px" }}>
                    Please add at least one slot configuration to enable
                    diagnostics bookings.
                  </Alert>
                ) : (
                  <List
                    sx={{
                      maxHeight: 260,
                      overflowY: "auto",
                      border: "1px solid var(--color-border)",
                      borderRadius: "8px",
                      bgcolor: "background.default",
                      py: 0,
                    }}
                  >
                    {slots.map((s, index) => {
                      const dayLabel =
                        DAYS.find((d) => d.value === s.dayText)?.label ||
                        "Weekday";
                      return (
                        <React.Fragment key={index}>
                          <ListItem
                            secondaryAction={
                              <IconButton
                                edge="end"
                                aria-label="delete"
                                onClick={() => handleRemoveSlot(index)}
                                color="error"
                                size="small"
                              >
                                <DeleteIcon />
                              </IconButton>
                            }
                          >
                            <ListItemText
                              primary={
                                <Typography
                                  variant="body2"
                                  sx={{ fontWeight: 700 }}
                                >
                                  {dayLabel}
                                </Typography>
                              }
                              secondary={`Timings: ${s.startTime} - ${s.endTime} | Max Capacity: ${s.maxCapacity} bookings`}
                            />
                          </ListItem>
                          {index < slots.length - 1 && <Divider />}
                        </React.Fragment>
                      );
                    })}
                  </List>
                )}
              </CardContent>
            </Card>
          </Grid>

          {/* Submit Onboarding Info Button */}
          <Grid size={{ xs: 12 }} sx={{ mt: 1 }}>
            <Button
              type="submit"
              variant="contained"
              color="secondary"
              fullWidth
              disabled={isSubmitting}
              sx={{
                textTransform: "none",
                py: 1.5,
                fontWeight: 700,
                borderRadius: "8px",
                fontSize: "0.95rem",
                color: "#fff",
                "&:hover": { bgcolor: "rgba(16,185,129,0.85)" },
              }}
            >
              {isSubmitting ? (
                <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                  <CircularProgress size={20} color="inherit" />
                  Saving configuration details...
                </Box>
              ) : (
                "Activate Portal & Complete Registration"
              )}
            </Button>
          </Grid>
        </Grid>
      </form>
    </Container>
  );
}
