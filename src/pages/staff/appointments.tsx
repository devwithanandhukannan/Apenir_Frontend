import React, { useEffect, useState, useCallback } from "react";
import Head from "next/head";
import { useRouter } from "next/router";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Chip from "@mui/material/Chip";
import Button from "@mui/material/Button";
import Skeleton from "@mui/material/Skeleton";
import Alert from "@mui/material/Alert";
import Divider from "@mui/material/Divider";
import TextField from "@mui/material/TextField";
import IconButton from "@mui/material/IconButton";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import MenuItem from "@mui/material/MenuItem";
import CircularProgress from "@mui/material/CircularProgress";
import Stepper from "@mui/material/Stepper";
import Step from "@mui/material/Step";
import StepLabel from "@mui/material/StepLabel";
import Snackbar from "@mui/material/Snackbar";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import PeopleIcon from "@mui/icons-material/People";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import DirectionsBikeIcon from "@mui/icons-material/DirectionsBike";
import KeyIcon from "@mui/icons-material/Key";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import {
  useStaffService,
  StaffAppointmentItem,
  AppointmentMemberInput,
} from "@/core_components/apis/admin/staffService/useStaffService";

const STATUS_MAP: Record<
  number,
  {
    label: string;
    color:
      | "default"
      | "info"
      | "warning"
      | "success"
      | "error"
      | "primary"
      | "secondary";
  }
> = {
  1: { label: "Pending", color: "default" },
  2: { label: "Confirmed", color: "info" },
  3: { label: "Assigned", color: "warning" },
  4: { label: "Collected", color: "success" },
  5: { label: "Completed", color: "success" },
  6: { label: "Cancelled", color: "error" },
};

function formatDate(d: string | null) {
  if (!d) return "—";
  const date = new Date(d);
  return date.toLocaleDateString("en-IN", {
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

const COLLECTION_STEPS = [
  "Mark Departed",
  "Mark Arrived & Verify OTP",
  "Add Member Details",
  "Mark Reached Lab",
];

export default function StaffAppointmentsPage() {
  const router = useRouter();
  const { id: queryId } = router.query;
  const {
    getMyAppointments,
    updateAppointmentStatus,
    verifyOtp,
    addAppointmentMembers,
  } = useStaffService();

  const [appointments, setAppointments] = useState<StaffAppointmentItem[]>([]);
  const [selected, setSelected] = useState<StaffAppointmentItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // OTP dialog
  const [otpDialogOpen, setOtpDialogOpen] = useState(false);
  const [otpInput, setOtpInput] = useState("");
  const [otpVerifying, setOtpVerifying] = useState(false);
  const [otpError, setOtpError] = useState<string | null>(null);
  const [otpVerifiedMemberCount, setOtpVerifiedMemberCount] =
    useState<number>(1);

  // Member details dialog
  const [memberDialogOpen, setMemberDialogOpen] = useState(false);
  const [members, setMembers] = useState<AppointmentMemberInput[]>([]);
  const [memberSaving, setMemberSaving] = useState(false);
  const [existingProfiles, setExistingProfiles] = useState<any[]>([]);
  const [selectedProfiles, setSelectedProfiles] = useState<
    Record<number, string>
  >({});

  // Status action loading
  const [actionLoading, setActionLoading] = useState(false);
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: "success" | "error";
  }>({
    open: false,
    message: "",
    severity: "success",
  });

  const loadAppointments = useCallback(async () => {
    setLoading(true);
    setError(null);
    await getMyAppointments({
      onSuccess: (data) => {
        const appts = data.data ?? [];
        setAppointments(appts);
        if (queryId) {
          const found = appts.find((a) => a.id === queryId);
          setSelected(found ?? null);
        }
        setLoading(false);
      },
      onError: (err) => {
        setError(err?.message ?? "Failed to load appointments.");
        setLoading(false);
      },
    });
  }, [getMyAppointments, queryId]);

  useEffect(() => {
    loadAppointments();
  }, [loadAppointments]);

  // If a queryId is present from the router, auto-select that appointment
  useEffect(() => {
    if (queryId && appointments.length > 0) {
      const found = appointments.find((a) => a.id === queryId);
      setSelected(found ?? null);
    }
  }, [queryId, appointments]);

  const handleStatusUpdate = async (
    status: "coming" | "reached" | "reachedlab",
  ) => {
    if (!selected) return;
    setActionLoading(true);
    await updateAppointmentStatus(selected.id, status, {
      onSuccess: () => {
        setSnackbar({
          open: true,
          message: "Status updated & customer notified via WhatsApp.",
          severity: "success",
        });
        loadAppointments();
        setActionLoading(false);

        // After "reached" — open OTP dialog
        if (status === "reached") {
          setOtpDialogOpen(true);
        }
      },
      onError: (err) => {
        setSnackbar({
          open: true,
          message: err?.message ?? "Failed to update status.",
          severity: "error",
        });
        setActionLoading(false);
      },
    });
  };

  const handleVerifyOtp = async () => {
    if (!selected) return;
    setOtpVerifying(true);
    setOtpError(null);
    await verifyOtp(selected.id, otpInput, {
      onSuccess: (data) => {
        setOtpVerifying(false);
        setOtpDialogOpen(false);
        const count = data.data?.memberCount ?? selected.memberCount ?? 1;
        setOtpVerifiedMemberCount(count);

        const profiles = data.data?.existingProfiles ?? [];
        setExistingProfiles(profiles);
        setSelectedProfiles({});

        // Initialize member forms
        setMembers(
          Array.from({ length: count }, (_, i) => ({
            name: "",
            age: 0,
            gender: "Other",
            relationship: i === 0 ? "Self" : "Family Member",
            additionalNotes: "",
          })),
        );
        setMemberDialogOpen(true);
        loadAppointments();
      },
      onError: (err) => {
        setOtpVerifying(false);
        setOtpError(err?.message ?? "Invalid passcode. Please try again.");
      },
    });
  };

  const handleSaveMembers = async () => {
    if (!selected) return;
    // Validate
    for (const m of members) {
      if (!m.name.trim()) {
        setSnackbar({
          open: true,
          message: "All member names are required.",
          severity: "error",
        });
        return;
      }
    }
    setMemberSaving(true);
    await addAppointmentMembers(selected.id, members, {
      onSuccess: () => {
        setMemberSaving(false);
        setMemberDialogOpen(false);
        setSnackbar({
          open: true,
          message:
            "Member details saved. Mark 'Reached Lab' when samples are delivered.",
          severity: "success",
        });
        loadAppointments();
      },
      onError: (err) => {
        setMemberSaving(false);
        setSnackbar({
          open: true,
          message: err?.message ?? "Failed to save members.",
          severity: "error",
        });
      },
    });
  };

  const updateMember = (
    index: number,
    field: keyof AppointmentMemberInput,
    value: string | number,
  ) => {
    setMembers((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], [field]: value };
      return next;
    });
  };

  const handleProfileChange = (i: number, value: string) => {
    if (value === "new") {
      setSelectedProfiles((prev) => ({ ...prev, [i]: "new" }));
      setMembers((prev) => {
        const next = [...prev];
        next[i] = {
          ...next[i],
          name: "",
          age: 0,
          gender: "Other",
        };
        return next;
      });
      return;
    }

    const prof = existingProfiles.find((p) => p.id === value);
    if (prof) {
      let age = 0;
      if (prof.dob) {
        if (prof.dob.startsWith("Age: ")) {
          age = parseInt(prof.dob.replace("Age: ", "")) || 0;
        } else {
          const birthDate = new Date(prof.dob);
          const today = new Date();
          age = today.getFullYear() - birthDate.getFullYear();
          const m = today.getMonth() - birthDate.getMonth();
          if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
            age--;
          }
        }
      }

      let gender = "Other";
      if (prof.gender) {
        const lower = prof.gender.toLowerCase();
        if (lower.startsWith("m")) gender = "Male";
        else if (lower.startsWith("f")) gender = "Female";
      }

      setMembers((prev) => {
        const next = [...prev];
        next[i] = {
          ...next[i],
          name: prof.name || "",
          age: age,
          gender: gender,
        };
        return next;
      });
      setSelectedProfiles((prev) => ({ ...prev, [i]: value }));
    }
  };

  if (loading) {
    return (
      <Box sx={{ p: 3 }}>
        <Skeleton variant="rounded" height={130} sx={{ mb: 2 }} />
        <Skeleton variant="rounded" height={130} />
      </Box>
    );
  }

  // If an appointment is selected, show its detail view
  if (selected) {
    const statusInfo = STATUS_MAP[selected.status] ?? {
      label: "Unknown",
      color: "default",
    };
    const isCollected = selected.status >= 4;

    // Determine step based on status
    const activeStep =
      selected.status === 1 || selected.status === 2
        ? 0
        : selected.status === 3
          ? 1
          : selected.status === 4
            ? 2
            : 3;

    return (
      <>
        <Head>
          <title>{selected.appointmentNumber} – Staff Portal</title>
        </Head>

        <Box>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 3 }}>
            <IconButton
              onClick={() => {
                setSelected(null);
                router.replace("/staff/appointments", undefined, {
                  shallow: true,
                });
              }}
              size="small"
              sx={{ border: "1px solid", borderColor: "divider" }}
            >
              <ArrowBackIcon fontSize="small" />
            </IconButton>
            <Typography variant="h6" sx={{ fontWeight: 700 }}>
              Visit Details
            </Typography>
          </Box>

          {/* Collection Progress Stepper */}
          <Card
            elevation={0}
            sx={{ border: "1px solid", borderColor: "divider", mb: 3 }}
          >
            <CardContent sx={{ pb: "16px !important" }}>
              <Stepper activeStep={activeStep} alternativeLabel>
                {COLLECTION_STEPS.map((label) => (
                  <Step key={label}>
                    <StepLabel
                      sx={{
                        "& .MuiStepLabel-label": {
                          fontSize: 11,
                          fontWeight: 600,
                        },
                      }}
                    >
                      {label}
                    </StepLabel>
                  </Step>
                ))}
              </Stepper>
            </CardContent>
          </Card>

          <Grid container spacing={3}>
            {/* Patient Info */}
            <Grid size={{ xs: 12, md: 6 }}>
              <Card
                elevation={0}
                sx={{
                  border: "1px solid",
                  borderColor: "divider",
                  height: "100%",
                }}
              >
                <CardContent>
                  <Typography
                    variant="subtitle2"
                    sx={{ fontWeight: 700, mb: 1.5 }}
                  >
                    Patient Information
                  </Typography>
                  <Divider sx={{ mb: 1.5 }} />
                  <Box
                    sx={{ display: "flex", flexDirection: "column", gap: 1 }}
                  >
                    <Box>
                      <Typography variant="caption" color="text.secondary">
                        Appointment #
                      </Typography>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        {selected.appointmentNumber}
                      </Typography>
                    </Box>
                    <Box>
                      <Typography variant="caption" color="text.secondary">
                        Patient Name
                      </Typography>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        {selected.customerName}
                      </Typography>
                    </Box>
                    <Box>
                      <Typography variant="caption" color="text.secondary">
                        Phone
                      </Typography>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        {selected.customerPhone || "—"}
                      </Typography>
                    </Box>
                    <Box>
                      <Typography variant="caption" color="text.secondary">
                        Members
                      </Typography>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        {selected.memberCount}
                      </Typography>
                    </Box>
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 1,
                        mt: 0.5,
                      }}
                    >
                      <Typography variant="caption" color="text.secondary">
                        Status
                      </Typography>
                      <Chip
                        label={statusInfo.label}
                        color={statusInfo.color}
                        size="small"
                        sx={{ fontWeight: 600, fontSize: 11 }}
                      />
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            {/* Location & Slot */}
            <Grid size={{ xs: 12, md: 6 }}>
              <Card
                elevation={0}
                sx={{
                  border: "1px solid",
                  borderColor: "divider",
                  height: "100%",
                }}
              >
                <CardContent>
                  <Typography
                    variant="subtitle2"
                    sx={{ fontWeight: 700, mb: 1.5 }}
                  >
                    Collection Details
                  </Typography>
                  <Divider sx={{ mb: 1.5 }} />
                  <Box
                    sx={{ display: "flex", flexDirection: "column", gap: 1.2 }}
                  >
                    <Box sx={{ display: "flex", gap: 1 }}>
                      <LocationOnIcon
                        sx={{ fontSize: 16, color: "primary.main", mt: 0.2 }}
                      />
                      <Box>
                        <Typography
                          variant="caption"
                          color="text.secondary"
                          sx={{ display: "block" }}
                        >
                          Address
                        </Typography>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                          {selected.locationAddress}
                        </Typography>
                        {selected.landmark && (
                          <Typography variant="caption" color="text.secondary">
                            Landmark: {selected.landmark}
                          </Typography>
                        )}
                        {selected.buildingDetails && (
                          <Typography
                            variant="caption"
                            color="text.secondary"
                            sx={{ display: "block" }}
                          >
                            Building: {selected.buildingDetails}
                            {selected.floor ? `, Floor ${selected.floor}` : ""}
                          </Typography>
                        )}
                      </Box>
                    </Box>
                    <Box sx={{ display: "flex", gap: 1 }}>
                      <CalendarTodayIcon
                        sx={{ fontSize: 15, color: "text.disabled", mt: 0.3 }}
                      />
                      <Box>
                        <Typography
                          variant="caption"
                          color="text.secondary"
                          sx={{ display: "block" }}
                        >
                          Date
                        </Typography>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                          {formatDate(selected.slotDate)}
                        </Typography>
                      </Box>
                    </Box>
                    <Box sx={{ display: "flex", gap: 1 }}>
                      <AccessTimeIcon
                        sx={{ fontSize: 15, color: "text.disabled", mt: 0.3 }}
                      />
                      <Box>
                        <Typography
                          variant="caption"
                          color="text.secondary"
                          sx={{ display: "block" }}
                        >
                          Time Slot
                        </Typography>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                          {formatTime(selected.slotStartTime)}
                        </Typography>
                      </Box>
                    </Box>
                    <Box>
                      <Typography
                        variant="caption"
                        color="text.secondary"
                        sx={{ display: "block" }}
                      >
                        GPS Coordinates
                      </Typography>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        {selected.locationLatitude.toFixed(5)},{" "}
                        {selected.locationLongitude.toFixed(5)}
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            {/* Action Buttons */}
            {!isCollected && (
              <Grid size={{ xs: 12 }}>
                <Card
                  elevation={0}
                  sx={{ border: "1px solid", borderColor: "divider" }}
                >
                  <CardContent>
                    <Typography
                      variant="subtitle2"
                      sx={{ fontWeight: 700, mb: 2 }}
                    >
                      Update Collection Status
                    </Typography>
                    <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1.5 }}>
                      <Button
                        variant="contained"
                        startIcon={<DirectionsBikeIcon />}
                        onClick={() => handleStatusUpdate("coming")}
                        disabled={actionLoading || selected.status >= 3}
                        sx={{ fontWeight: 600 }}
                      >
                        {actionLoading ? (
                          <CircularProgress size={18} color="inherit" />
                        ) : (
                          "Mark Departed"
                        )}
                      </Button>
                      <Button
                        variant="contained"
                        color="secondary"
                        startIcon={<LocationOnIcon />}
                        onClick={() => handleStatusUpdate("reached")}
                        disabled={actionLoading}
                        sx={{ fontWeight: 600 }}
                      >
                        Mark Arrived
                      </Button>
                      <Button
                        variant="outlined"
                        startIcon={<KeyIcon />}
                        onClick={() => setOtpDialogOpen(true)}
                        disabled={actionLoading}
                        sx={{ fontWeight: 600 }}
                      >
                        Verify Patient OTP
                      </Button>
                      <Button
                        variant="outlined"
                        color="success"
                        startIcon={<CheckCircleIcon />}
                        onClick={() => handleStatusUpdate("reachedlab")}
                        disabled={actionLoading}
                        sx={{ fontWeight: 600 }}
                      >
                        Mark Reached Lab
                      </Button>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            )}

            {isCollected && (
              <Grid size={{ xs: 12 }}>
                <Alert severity="success" icon={<CheckCircleIcon />}>
                  This visit is completed. Samples have been collected and
                  delivered to the lab.
                </Alert>
              </Grid>
            )}
          </Grid>
        </Box>

        {/* OTP Verification Dialog */}
        <Dialog
          open={otpDialogOpen}
          onClose={() => {
            setOtpDialogOpen(false);
            setOtpInput("");
            setOtpError(null);
          }}
          maxWidth="xs"
          fullWidth
        >
          <DialogTitle sx={{ fontWeight: 700, pb: 0.5 }}>
            Verify Patient Passcode
          </DialogTitle>
          <DialogContent>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Ask the patient for their 4-digit collection passcode to confirm
              sample collection.
            </Typography>
            <TextField
              label="4-digit Passcode"
              fullWidth
              value={otpInput}
              onChange={(e) => setOtpInput(e.target.value.slice(0, 4))}
              slotProps={{ htmlInput: { maxLength: 4, inputMode: "numeric" } }}
              error={!!otpError}
              helperText={otpError}
              autoFocus
              size="small"
            />
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 2 }}>
            <Button
              onClick={() => {
                setOtpDialogOpen(false);
                setOtpInput("");
                setOtpError(null);
              }}
              size="small"
            >
              Cancel
            </Button>
            <Button
              variant="contained"
              onClick={handleVerifyOtp}
              disabled={otpInput.length !== 4 || otpVerifying}
              size="small"
              sx={{ fontWeight: 600 }}
            >
              {otpVerifying ? (
                <CircularProgress size={16} color="inherit" />
              ) : (
                "Verify"
              )}
            </Button>
          </DialogActions>
        </Dialog>

        {/* Member Details Dialog */}
        <Dialog
          open={memberDialogOpen}
          onClose={() => setMemberDialogOpen(false)}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle sx={{ fontWeight: 700, pb: 0.5 }}>
            Member Details ({otpVerifiedMemberCount} member
            {otpVerifiedMemberCount !== 1 ? "s" : ""})
          </DialogTitle>
          <DialogContent dividers>
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{ mb: 2, display: "block" }}
            >
              OTP verified. Please fill in details for each patient being
              collected.
            </Typography>
            {members.map((m, i) => (
              <Box key={i} sx={{ mb: 3 }}>
                <Typography
                  variant="subtitle2"
                  sx={{ fontWeight: 700, mb: 1.5, color: "primary.main" }}
                >
                  Member {i + 1}
                </Typography>
                <Grid container spacing={1.5}>
                  {existingProfiles.length > 0 && (
                    <Grid size={{ xs: 12 }}>
                      <TextField
                        label="Select Patient Profile (Optional)"
                        fullWidth
                        size="small"
                        select
                        value={selectedProfiles[i] || "new"}
                        onChange={(e) => handleProfileChange(i, e.target.value)}
                        sx={{ mb: 1 }}
                      >
                        <MenuItem value="new">
                          -- Create New Patient Profile --
                        </MenuItem>
                        {existingProfiles.map((p) => {
                          const details = [];
                          if (p.gender) details.push(p.gender);
                          if (p.dob) details.push(p.dob);
                          const desc =
                            details.length > 0
                              ? ` (${details.join(", ")})`
                              : "";
                          return (
                            <MenuItem key={p.id} value={p.id}>
                              {p.name}
                              {desc}
                            </MenuItem>
                          );
                        })}
                      </TextField>
                    </Grid>
                  )}
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField
                      label="Name"
                      fullWidth
                      size="small"
                      required
                      value={m.name}
                      onChange={(e) => updateMember(i, "name", e.target.value)}
                    />
                  </Grid>
                  <Grid size={{ xs: 6, sm: 3 }}>
                    <TextField
                      label="Age"
                      fullWidth
                      size="small"
                      type="number"
                      value={m.age || ""}
                      onChange={(e) =>
                        updateMember(i, "age", parseInt(e.target.value) || 0)
                      }
                    />
                  </Grid>
                  <Grid size={{ xs: 6, sm: 3 }}>
                    <TextField
                      label="Gender"
                      fullWidth
                      size="small"
                      select
                      value={m.gender}
                      onChange={(e) =>
                        updateMember(i, "gender", e.target.value)
                      }
                    >
                      <MenuItem value="Male">Male</MenuItem>
                      <MenuItem value="Female">Female</MenuItem>
                      <MenuItem value="Other">Other</MenuItem>
                    </TextField>
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField
                      label="Relationship"
                      fullWidth
                      size="small"
                      value={m.relationship ?? ""}
                      onChange={(e) =>
                        updateMember(i, "relationship", e.target.value)
                      }
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField
                      label="Notes (optional)"
                      fullWidth
                      size="small"
                      value={m.additionalNotes ?? ""}
                      onChange={(e) =>
                        updateMember(i, "additionalNotes", e.target.value)
                      }
                    />
                  </Grid>
                </Grid>
                {i < members.length - 1 && <Divider sx={{ mt: 2 }} />}
              </Box>
            ))}
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 2 }}>
            <Button onClick={() => setMemberDialogOpen(false)} size="small">
              Cancel
            </Button>
            <Button
              variant="contained"
              onClick={handleSaveMembers}
              disabled={memberSaving}
              size="small"
              sx={{ fontWeight: 600 }}
            >
              {memberSaving ? (
                <CircularProgress size={16} color="inherit" />
              ) : (
                "Save Members"
              )}
            </Button>
          </DialogActions>
        </Dialog>

        {/* Snackbar */}
        <Snackbar
          open={snackbar.open}
          autoHideDuration={4000}
          onClose={() => setSnackbar((s) => ({ ...s, open: false }))}
          anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
        >
          <Alert
            severity={snackbar.severity}
            onClose={() => setSnackbar((s) => ({ ...s, open: false }))}
            sx={{ minWidth: 280, fontWeight: 600 }}
          >
            {snackbar.message}
          </Alert>
        </Snackbar>
      </>
    );
  }

  // No selection: list view
  return (
    <>
      <Head>
        <title>Appointments – Staff Portal</title>
      </Head>

      <Box>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mb: 3,
          }}
        >
          <Typography variant="h6" sx={{ fontWeight: 700 }}>
            My Appointments
          </Typography>
          <Button
            variant="outlined"
            size="small"
            onClick={loadAppointments}
            sx={{ fontWeight: 600 }}
          >
            Refresh
          </Button>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {appointments.length === 0 ? (
          <Card
            elevation={0}
            sx={{ border: "1px solid", borderColor: "divider" }}
          >
            <CardContent sx={{ textAlign: "center", py: 8 }}>
              <DirectionsBikeIcon
                sx={{ fontSize: 48, color: "text.disabled", mb: 1.5 }}
              />
              <Typography variant="body2" color="text.secondary">
                No appointments assigned yet.
              </Typography>
            </CardContent>
          </Card>
        ) : (
          <Grid container spacing={2}>
            {appointments.map((appt) => {
              const statusInfo = STATUS_MAP[appt.status] ?? {
                label: "Unknown",
                color: "default",
              };
              return (
                <Grid size={{ xs: 12 }} key={appt.id}>
                  <Card
                    elevation={0}
                    onClick={() => setSelected(appt)}
                    sx={{
                      border: "1px solid",
                      borderColor: "divider",
                      cursor: "pointer",
                      transition: "box-shadow 0.2s, border-color 0.2s",
                      "&:hover": {
                        boxShadow: "0 4px 16px rgba(5,150,105,0.10)",
                        borderColor: "primary.main",
                      },
                    }}
                  >
                    <CardContent>
                      <Box
                        sx={{
                          display: "flex",
                          justifyContent: "space-between",
                          mb: 1,
                        }}
                      >
                        <Box>
                          <Typography
                            variant="subtitle2"
                            sx={{ fontWeight: 700, fontSize: 12 }}
                          >
                            {appt.appointmentNumber}
                          </Typography>
                          <Typography variant="body2" sx={{ fontWeight: 600 }}>
                            {appt.customerName}
                          </Typography>
                        </Box>
                        <Chip
                          label={statusInfo.label}
                          color={statusInfo.color}
                          size="small"
                          sx={{ fontWeight: 600, fontSize: 11 }}
                        />
                      </Box>
                      <Divider sx={{ mb: 1 }} />
                      <Box
                        sx={{
                          display: "flex",
                          gap: 0.8,
                          alignItems: "flex-start",
                        }}
                      >
                        <LocationOnIcon
                          sx={{ fontSize: 13, color: "primary.main", mt: 0.2 }}
                        />
                        <Typography variant="caption" color="text.secondary">
                          {appt.locationAddress}
                        </Typography>
                      </Box>
                      <Box sx={{ display: "flex", gap: 2, mt: 0.5 }}>
                        <Box
                          sx={{
                            display: "flex",
                            gap: 0.5,
                            alignItems: "center",
                          }}
                        >
                          <CalendarTodayIcon
                            sx={{ fontSize: 12, color: "text.disabled" }}
                          />
                          <Typography variant="caption" color="text.secondary">
                            {formatDate(appt.slotDate)}
                          </Typography>
                        </Box>
                        <Box
                          sx={{
                            display: "flex",
                            gap: 0.5,
                            alignItems: "center",
                          }}
                        >
                          <AccessTimeIcon
                            sx={{ fontSize: 12, color: "text.disabled" }}
                          />
                          <Typography variant="caption" color="text.secondary">
                            {formatTime(appt.slotStartTime)}
                          </Typography>
                        </Box>
                        <Box
                          sx={{
                            display: "flex",
                            gap: 0.5,
                            alignItems: "center",
                          }}
                        >
                          <PeopleIcon
                            sx={{ fontSize: 12, color: "text.disabled" }}
                          />
                          <Typography variant="caption" color="text.secondary">
                            {appt.memberCount}
                          </Typography>
                        </Box>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              );
            })}
          </Grid>
        )}

        <Snackbar
          open={snackbar.open}
          autoHideDuration={4000}
          onClose={() => setSnackbar((s) => ({ ...s, open: false }))}
          anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
        >
          <Alert
            severity={snackbar.severity}
            onClose={() => setSnackbar((s) => ({ ...s, open: false }))}
            sx={{ minWidth: 280, fontWeight: 600 }}
          >
            {snackbar.message}
          </Alert>
        </Snackbar>
      </Box>
    </>
  );
}
