import React, { useState, useEffect, useCallback } from "react";
import Box from "@mui/material/Box";
import Container from "@mui/material/Container";
import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import Divider from "@mui/material/Divider";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemText from "@mui/material/ListItemText";
import IconButton from "@mui/material/IconButton";
import CircularProgress from "@mui/material/CircularProgress";
import Alert from "@mui/material/Alert";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";
import SaveIcon from "@mui/icons-material/Save";
import RoomIcon from "@mui/icons-material/Room";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import KeyIcon from "@mui/icons-material/Key";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import Stack from "@mui/material/Stack";
import toast, { Toaster } from "react-hot-toast";
import { useApi } from "@/core_components/hooks/useApi/useApi";

// Days mapping: Mon = 1 to Sun = 7
const DAYS = [
  { value: 1, label: "Monday" },
  { value: 2, label: "Tuesday" },
  { value: 3, label: "Wednesday" },
  { value: 4, label: "Thursday" },
  { value: 5, label: "Friday" },
  { value: 6, label: "Saturday" },
  { value: 7, label: "Sunday" },
];

interface SlotConfig {
  id: string;
  dayText: number;
  startTime: string;
  endTime: string;
  maxCapacity: number;
  isLeave: boolean;
}

export default function LabSettings() {
  const { get, put, post, delete: apiDelete } = useApi();

  const [loading, setLoading] = useState(true);
  const [profileSaving, setProfileSaving] = useState(false);
  const [slotSaving, setSlotSaving] = useState(false);

  // Profile fields state (using strings for inputs to prevent TS type warnings)
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [city, setCity] = useState("");
  const [district, setDistrict] = useState("");
  const [pincode, setPincode] = useState("");
  const [latitude, setLatitude] = useState("0");
  const [longitude, setLongitude] = useState("0");
  const [serviceRangeKm, setServiceRangeKm] = useState("10");
  const [email, setEmail] = useState("");

  // Password change state
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordSaving, setPasswordSaving] = useState(false);

  // Email change state
  const [isEmailDialogOpen, setIsEmailDialogOpen] = useState(false);
  const [newEmail, setNewEmail] = useState("");
  const [emailToken, setEmailToken] = useState("");
  const [emailStep, setEmailStep] = useState(1); // 1 = input email, 2 = input code
  const [emailLoading, setEmailLoading] = useState(false);

  // Slots state
  const [slots, setSlots] = useState<SlotConfig[]>([]);
  const [newDay, setNewDay] = useState<number>(1);
  const [newStartTime, setNewStartTime] = useState("09:00");
  const [newEndTime, setNewEndTime] = useState("18:00");
  const [newCapacity, setNewCapacity] = useState(5);

  // Fetch branch details and slots configuration
  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      // 1. Fetch branch details
      const profileRes = await get<any>({
        endpoint: "/api/lab/details",
        requireAuth: true,
      });
      if (
        profileRes.success &&
        profileRes.data?.success &&
        profileRes.data?.data?.branch
      ) {
        const b = profileRes.data.data.branch;
        setName(b.name || "");
        setPhone(b.phone || "");
        setCity(b.city || "");
        setDistrict(b.district || "");
        setPincode(b.pincode || "");
        setLatitude(String(b.latitude || 0));
        setLongitude(String(b.longitude || 0));
        setServiceRangeKm(String(b.serviceRangeKm || 10));
        setEmail(profileRes.data.data.labUser?.email || "");
      } else {
        toast.error("Failed to load branch profile details.");
      }

      // 2. Fetch slots
      const slotsRes = await get<any>({
        endpoint: "/api/lab/slots/configurations",
        requireAuth: true,
      });
      if (slotsRes.success && slotsRes.data?.success && slotsRes.data?.data) {
        setSlots(slotsRes.data.data);
      } else {
        toast.error("Failed to load slot configurations.");
      }
    } catch {
      toast.error("An error occurred while fetching configuration data.");
    } finally {
      setLoading(false);
    }
  }, [get]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !phone || !city || !district || !pincode) {
      toast.error("Please fill out all required profile fields.");
      return;
    }

    setProfileSaving(true);
    const response = await put<any, any>({
      endpoint: "/api/lab/details",
      body: {
        name,
        phone,
        city,
        district,
        pincode,
        latitude: Number(latitude) || 0,
        longitude: Number(longitude) || 0,
        serviceRangeKm: Number(serviceRangeKm) || 10,
      },
      requireAuth: true,
    });

    setProfileSaving(false);
    if (response.success && response.data?.success) {
      toast.success("Profile details updated successfully.");
    } else {
      toast.error(
        response.data?.message || "Failed to update profile settings.",
      );
    }
  };

  const handleAddSlot = async () => {
    if (!newStartTime || !newEndTime) {
      toast.error("Please configure start and end times.");
      return;
    }

    setSlotSaving(true);
    const response = await post<any, any>({
      endpoint: "/api/lab/slots/configurations",
      body: {
        dayText: newDay,
        startTime: newStartTime,
        endTime: newEndTime,
        maxCapacity: Number(newCapacity) || 1,
        isLeave: false,
      },
      requireAuth: true,
    });

    setSlotSaving(false);
    if (response.success && response.data?.success && response.data?.data) {
      setSlots((prev) => [...prev, response.data.data]);
      toast.success("Slot configuration added successfully.");
    } else {
      toast.error(
        response.data?.message || "Failed to create slot configuration.",
      );
    }
  };

  const handleDeleteSlot = async (id: string) => {
    const response = await apiDelete<any>({
      endpoint: `/api/lab/slots/configurations/${id}`,
      requireAuth: true,
    });

    if (response.success && response.data?.success) {
      setSlots((prev) => prev.filter((s) => s.id !== id));
      toast.success("Slot configuration removed.");
    } else {
      toast.error(
        response.data?.message || "Failed to delete slot configuration.",
      );
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!oldPassword || !newPassword) {
      toast.error("Please fill in both old and new password fields.");
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error("New passwords do not match.");
      return;
    }

    setPasswordSaving(true);
    const response = await post<any, any>({
      endpoint: "/api/lab/change-password",
      body: {
        oldPassword,
        newPassword,
      },
      requireAuth: true,
    });
    setPasswordSaving(false);

    if (response.success && response.data?.success) {
      toast.success("Password changed successfully!");
      setOldPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } else {
      toast.error(response.data?.message || "Failed to change password.");
    }
  };

  const handleEmailRequest = async () => {
    if (!newEmail || !newEmail.includes("@")) {
      toast.error("Please enter a valid email address.");
      return;
    }

    setEmailLoading(true);
    const response = await post<any, any>({
      endpoint: "/api/lab/change-email/request",
      body: {
        newEmail: newEmail.trim(),
      },
      requireAuth: true,
    });
    setEmailLoading(false);

    if (response.success && response.data?.success) {
      toast.success("Pre-verification code sent to your new email!");
      setEmailStep(2);
    } else {
      toast.error(response.data?.message || "Failed to initiate email change.");
    }
  };

  const handleEmailConfirm = async () => {
    if (!emailToken) {
      toast.error("Please enter the verification token.");
      return;
    }

    setEmailLoading(true);
    const response = await post<any, any>({
      endpoint: "/api/lab/change-email/confirm",
      body: {
        token: emailToken.trim(),
      },
      requireAuth: true,
    });
    setEmailLoading(false);

    if (response.success && response.data?.success) {
      toast.success("Email address updated successfully!");
      setEmail(newEmail);
      setIsEmailDialogOpen(false);
      setNewEmail("");
      setEmailToken("");
      setEmailStep(1);
    } else {
      toast.error(response.data?.message || "Failed to verify token.");
    }
  };

  if (loading) {
    return (
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "80vh",
        }}
      >
        <CircularProgress color="secondary" />
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{ mt: 2, fontWeight: 600 }}
        >
          Loading profile settings and configurations...
        </Typography>
      </Box>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Toaster position="top-right" />
      <Box sx={{ mb: 4 }}>
        <Typography
          variant="h4"
          sx={{ fontWeight: 800, letterSpacing: "-1px" }}
        >
          Branch Settings
        </Typography>
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{ fontWeight: 500 }}
        >
          Manage your clinic's metadata, coordinates, service limits, and
          booking slots.
        </Typography>
      </Box>

      <Grid container spacing={4}>
        {/* Profile Settings card */}
        <Grid size={{ xs: 12, md: 7 }}>
          <form onSubmit={handleSaveProfile}>
            <Card
              sx={{
                border: "1px solid var(--color-border)",
                borderRadius: "12px",
                boxShadow: "none",
              }}
            >
              <CardContent sx={{ p: 4 }}>
                <Box
                  sx={{ display: "flex", alignItems: "center", gap: 1, mb: 3 }}
                >
                  <RoomIcon color="secondary" />
                  <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>
                    Branch Information & Location
                  </Typography>
                </Box>
                <Grid container spacing={2.5}>
                  <Grid size={{ xs: 12 }}>
                    <TextField
                      label="Laboratory Name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      fullWidth
                      required
                      size="small"
                    />
                  </Grid>
                  <Grid
                    size={{ xs: 12, sm: 6 }}
                    sx={{ display: "flex", gap: 1, alignItems: "flex-start" }}
                  >
                    <TextField
                      label="Registered Email"
                      value={email}
                      fullWidth
                      disabled
                      size="small"
                    />
                    <Button
                      variant="outlined"
                      color="secondary"
                      onClick={() => {
                        setIsEmailDialogOpen(true);
                        setEmailStep(1);
                        setNewEmail("");
                        setEmailToken("");
                      }}
                      sx={{
                        textTransform: "none",
                        py: 1.0,
                        px: 2,
                        height: "40px",
                        fontWeight: 700,
                        whiteSpace: "nowrap",
                      }}
                    >
                      Change
                    </Button>
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField
                      label="Phone Contact"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      fullWidth
                      required
                      size="small"
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 4 }}>
                    <TextField
                      label="City"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      fullWidth
                      required
                      size="small"
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 4 }}>
                    <TextField
                      label="District"
                      value={district}
                      onChange={(e) => setDistrict(e.target.value)}
                      fullWidth
                      required
                      size="small"
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 4 }}>
                    <TextField
                      label="Pin Code"
                      value={pincode}
                      onChange={(e) => setPincode(e.target.value)}
                      fullWidth
                      required
                      size="small"
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 4 }}>
                    <TextField
                      label="Latitude"
                      value={latitude}
                      onChange={(e) => setLatitude(e.target.value)}
                      fullWidth
                      required
                      size="small"
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 4 }}>
                    <TextField
                      label="Longitude"
                      value={longitude}
                      onChange={(e) => setLongitude(e.target.value)}
                      fullWidth
                      required
                      size="small"
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 4 }}>
                    <TextField
                      label="Service Range (Km)"
                      value={serviceRangeKm}
                      onChange={(e) => setServiceRangeKm(e.target.value)}
                      fullWidth
                      required
                      size="small"
                    />
                  </Grid>
                </Grid>
                <Divider sx={{ my: 3 }} />
                <Button
                  type="submit"
                  variant="contained"
                  color="secondary"
                  disabled={profileSaving}
                  startIcon={<SaveIcon />}
                  sx={{
                    textTransform: "none",
                    fontWeight: 700,
                    borderRadius: "6px",
                    py: 1.2,
                    px: 3,
                    color: "#fff",
                    "&:hover": { bgcolor: "rgba(16,185,129,0.85)" },
                  }}
                >
                  {profileSaving ? "Saving changes..." : "Save Profile Details"}
                </Button>
              </CardContent>
            </Card>
          </form>

          <form onSubmit={handlePasswordChange} style={{ marginTop: "24px" }}>
            <Card
              sx={{
                border: "1px solid var(--color-border)",
                borderRadius: "12px",
                boxShadow: "none",
              }}
            >
              <CardContent sx={{ p: 4 }}>
                <Box
                  sx={{ display: "flex", alignItems: "center", gap: 1, mb: 3 }}
                >
                  <KeyIcon color="secondary" />
                  <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>
                    Reset Account Password
                  </Typography>
                </Box>
                <Grid container spacing={2.5}>
                  <Grid size={{ xs: 12 }}>
                    <TextField
                      label="Current Password"
                      type="password"
                      value={oldPassword}
                      onChange={(e) => setOldPassword(e.target.value)}
                      fullWidth
                      required
                      size="small"
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField
                      label="New Password"
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      fullWidth
                      required
                      size="small"
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField
                      label="Confirm New Password"
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      fullWidth
                      required
                      size="small"
                    />
                  </Grid>
                </Grid>
                <Divider sx={{ my: 3 }} />
                <Button
                  type="submit"
                  variant="contained"
                  color="secondary"
                  disabled={passwordSaving}
                  startIcon={<SaveIcon />}
                  sx={{
                    textTransform: "none",
                    fontWeight: 700,
                    borderRadius: "6px",
                    py: 1.2,
                    px: 3,
                    color: "#fff",
                  }}
                >
                  {passwordSaving ? "Updating Password..." : "Update Password"}
                </Button>
              </CardContent>
            </Card>
          </form>
        </Grid>

        {/* Slot management card */}
        <Grid size={{ xs: 12, md: 5 }}>
          <Card
            sx={{
              border: "1px solid var(--color-border)",
              borderRadius: "12px",
              boxShadow: "none",
            }}
          >
            <CardContent sx={{ p: 4 }}>
              <Box
                sx={{ display: "flex", alignItems: "center", gap: 1, mb: 3 }}
              >
                <AccessTimeIcon color="secondary" />
                <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>
                  Weekly Slot Schedule
                </Typography>
              </Box>

              {/* Add slots form */}
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
                  sx={{ fontWeight: 700, mb: 1.5, color: "text.primary" }}
                >
                  Add Slots Time
                </Typography>
                <Grid container spacing={2}>
                  <Grid size={{ xs: 12 }}>
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
                  <Grid size={{ xs: 6 }}>
                    <TextField
                      label="Start Time"
                      type="time"
                      value={newStartTime}
                      onChange={(e) => setNewStartTime(e.target.value)}
                      fullWidth
                      size="small"
                    />
                  </Grid>
                  <Grid size={{ xs: 6 }}>
                    <TextField
                      label="End Time"
                      type="time"
                      value={newEndTime}
                      onChange={(e) => setNewEndTime(e.target.value)}
                      fullWidth
                      size="small"
                    />
                  </Grid>
                  <Grid size={{ xs: 6 }}>
                    <TextField
                      label="Capacity"
                      type="number"
                      value={newCapacity}
                      onChange={(e) =>
                        setNewCapacity(Math.max(1, Number(e.target.value)))
                      }
                      fullWidth
                      size="small"
                    />
                  </Grid>
                  <Grid size={{ xs: 6 }}>
                    <Button
                      variant="outlined"
                      color="secondary"
                      startIcon={<AddIcon />}
                      onClick={handleAddSlot}
                      disabled={slotSaving}
                      fullWidth
                      sx={{
                        textTransform: "none",
                        fontWeight: 700,
                        borderRadius: "6px",
                        py: 0.9,
                      }}
                    >
                      {slotSaving ? "Adding..." : "Add Slot"}
                    </Button>
                  </Grid>
                </Grid>
              </Box>

              {/* Current slot list */}
              <Typography
                variant="body2"
                sx={{ fontWeight: 700, mb: 1, color: "text.primary" }}
              >
                Configured Slots ({slots.length})
              </Typography>
              <Divider sx={{ mb: 1.5 }} />
              {slots.length === 0 ? (
                <Alert severity="warning" sx={{ borderRadius: "8px" }}>
                  No available slot configurations.
                </Alert>
              ) : (
                <List
                  sx={{
                    maxHeight: 300,
                    overflowY: "auto",
                    border: "1px solid var(--color-border)",
                    borderRadius: "8px",
                    bgcolor: "background.default",
                    p: 0,
                  }}
                >
                  {slots.map((s, index) => {
                    const dayLabel =
                      DAYS.find((d) => d.value === s.dayText)?.label ||
                      "Weekday";
                    // Format times: trim any seconds portion if present (e.g., 09:00:00 -> 09:00)
                    const formatTime = (t: string) => t?.substring(0, 5) || "";
                    return (
                      <React.Fragment key={s.id}>
                        <ListItem
                          secondaryAction={
                            <IconButton
                              edge="end"
                              aria-label="delete"
                              onClick={() => handleDeleteSlot(s.id)}
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
                            secondary={`Hours: ${formatTime(s.startTime)} - ${formatTime(s.endTime)} | Capacity: ${s.maxCapacity} bookings`}
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
      </Grid>
      {/* Change Email Dialog */}
      <Dialog
        open={isEmailDialogOpen}
        onClose={() => setIsEmailDialogOpen(false)}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle sx={{ fontWeight: 900 }}>Change Email Address</DialogTitle>
        <DialogContent dividers>
          {emailStep === 1 ? (
            <Stack spacing={2.5} sx={{ py: 1 }}>
              <Typography variant="body2" color="text.secondary">
                Enter your new email address. We will send a pre-verification
                token to it to confirm ownership.
              </Typography>
              <TextField
                label="New Email Address"
                placeholder="newemail@example.com"
                fullWidth
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
              />
            </Stack>
          ) : (
            <Stack spacing={2.5} sx={{ py: 1 }}>
              <Typography variant="body2" color="text.secondary">
                Enter the pre-verification token sent to{" "}
                <strong>{newEmail}</strong>.
              </Typography>
              <TextField
                label="Verification Token"
                placeholder="Enter Token"
                fullWidth
                value={emailToken}
                onChange={(e) => setEmailToken(e.target.value)}
              />
            </Stack>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button
            variant="outlined"
            color="inherit"
            onClick={() => setIsEmailDialogOpen(false)}
            sx={{ textTransform: "none", fontWeight: 700 }}
          >
            Cancel
          </Button>
          {emailStep === 1 ? (
            <Button
              variant="contained"
              color="secondary"
              disabled={emailLoading || !newEmail}
              onClick={handleEmailRequest}
              sx={{ textTransform: "none", fontWeight: 700 }}
            >
              {emailLoading ? (
                <CircularProgress size={20} />
              ) : (
                "Request Verification"
              )}
            </Button>
          ) : (
            <Button
              variant="contained"
              color="secondary"
              disabled={emailLoading || !emailToken}
              onClick={handleEmailConfirm}
              sx={{ textTransform: "none", fontWeight: 700 }}
            >
              {emailLoading ? (
                <CircularProgress size={20} />
              ) : (
                "Verify & Confirm"
              )}
            </Button>
          )}
        </DialogActions>
      </Dialog>
    </Container>
  );
}
