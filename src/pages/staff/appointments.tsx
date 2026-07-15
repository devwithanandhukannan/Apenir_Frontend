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
import Checkbox from "@mui/material/Checkbox";
import FormControlLabel from "@mui/material/FormControlLabel";
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
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import dynamic from "next/dynamic";
import { useAppSelector } from "@/core_components/store/hooks";
import {
  useStaffService,
  StaffAppointmentItem,
  AppointmentMemberInput,
} from "@/core_components/apis/admin/staffService/useStaffService";

// Dynamic loading for react-leaflet to prevent SSR errors
const LeafletMap = dynamic(() => import("@/component_library/LeafletMap"), {
  ssr: false,
});

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
  7: { label: "Coming", color: "info" },
  8: { label: "Reached", color: "info" },
  9: { label: "OTP Verified", color: "success" },
  10: { label: "Taking Test", color: "secondary" },
  11: { label: "Handover to Lab", color: "success" },
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
  "Mark Arrived",
  "Verify OTP",
  "Add Members & Take Test",
  "Handover to Lab",
];

export default function StaffAppointmentsPage() {
  const router = useRouter();
  const { id: queryId } = router.query;
  const { user, isAuthenticated, isInitialized } = useAppSelector(
    (state) => state.auth,
  );

  // Auth Guard
  useEffect(() => {
    if (isInitialized && (!isAuthenticated || user?.role !== "staff")) {
      router.replace("/staff/login");
    }
  }, [isAuthenticated, user, isInitialized, router]);

  const {
    getMyAppointments,
    updateAppointmentStatus,
    verifyOtp,
    addAppointmentMembers,
    registerMemberProfile,
    getAppointmentMembers,
    getAppointmentBranchServices,
    searchMembersByPhone,
  } = useStaffService();

  const [appointments, setAppointments] = useState<StaffAppointmentItem[]>([]);
  const [selected, setSelected] = useState<StaffAppointmentItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Phlebotomist current GPS location
  const [myLocation, setMyLocation] = useState<{
    lat: number;
    lng: number;
  } | null>(null);

  // OTP dialog
  const [otpDialogOpen, setOtpDialogOpen] = useState(false);
  const [otpInput, setOtpInput] = useState("");
  const [otpVerifying, setOtpVerifying] = useState(false);
  const [otpError, setOtpError] = useState<string | null>(null);

  // Member details dialog
  const [memberDialogOpen, setMemberDialogOpen] = useState(false);
  const [members, setMembers] = useState<AppointmentMemberInput[]>([]);
  const [memberSaving, setMemberSaving] = useState(false);
  const [loadingMembers, setLoadingMembers] = useState(false);
  const [existingProfiles, setExistingProfiles] = useState<any[]>([]);
  const [selectedProfiles, setSelectedProfiles] = useState<
    Record<number, string>
  >({});

  // Additional states for lookup & branch catalog
  const [branchServices, setBranchServices] = useState<any[]>([]);
  const [branchServicesLoading, setBranchServicesLoading] = useState(false);
  const [lookupPhone, setLookupPhone] = useState("");
  const [searchingProfiles, setSearchingProfiles] = useState(false);

  // On-the-spot registration dialog
  const [registerDialogOpen, setRegisterDialogOpen] = useState(false);
  const [registerForm, setRegisterForm] = useState({
    name: "",
    phone: "",
    email: "",
    age: 0,
    gender: "Male",
    address: "",
    district: "",
  });
  const [registerLoading, setRegisterLoading] = useState(false);
  const [registerError, setRegisterError] = useState<string | null>(null);
  const [activeMemberIndexForRegister, setActiveMemberIndexForRegister] =
    useState<number | null>(null);

  // Status action loading
  const [actionLoading, setActionLoading] = useState(false);
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: "success" | "error" | "info" | "warning";
  }>({
    open: false,
    message: "",
    severity: "success",
  });

  // Track phlebotomist position
  useEffect(() => {
    if (typeof window !== "undefined" && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setMyLocation({
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
          });
        },
        (err) => {
          console.warn(
            "Geolocation denied or unavailable, utilizing default center.",
            err,
          );
          // Default center (Bangalore center)
          setMyLocation({ lat: 12.9715987, lng: 77.5945627 });
        },
      );
    }
  }, []);

  // Load branch services and packages for test catalog
  useEffect(() => {
    if (memberDialogOpen && selected) {
      setBranchServicesLoading(true);
      getAppointmentBranchServices(selected.id, {
        onSuccess: (res) => {
          if (res.success && res.data) {
            setBranchServices(res.data);
          }
          setBranchServicesLoading(false);
        },
        onError: () => {
          setBranchServicesLoading(false);
        },
      });
    }
  }, [memberDialogOpen, selected, getAppointmentBranchServices]);

  const handleLookupSearch = async () => {
    if (!lookupPhone || !lookupPhone.trim()) {
      setSnackbar({
        open: true,
        message: "Please enter a valid phone number to search.",
        severity: "error",
      });
      return;
    }
    setSearchingProfiles(true);
    await searchMembersByPhone(lookupPhone.trim(), {
      onSuccess: (res) => {
        setSearchingProfiles(false);
        if (res.success && res.data) {
          const matched = res.data;
          if (matched.length === 0) {
            setSnackbar({
              open: true,
              message: "No profiles found for this phone number.",
              severity: "info",
            });
          } else {
            setExistingProfiles((prev) => {
              const currentIds = new Set(prev.map((p) => p.id));
              const merged = [...prev];
              for (const p of matched) {
                if (!currentIds.has(p.id)) {
                  merged.push(p);
                }
              }
              return merged;
            });
            setSnackbar({
              open: true,
              message: `Found ${matched.length} matching profile(s).`,
              severity: "success",
            });
          }
        }
      },
      onError: (err) => {
        setSearchingProfiles(false);
        setSnackbar({
          open: true,
          message: err?.message ?? "Profile search failed.",
          severity: "error",
        });
      },
    });
  };

  const loadAppointments = useCallback(
    async (silent = false) => {
      if (!silent) setLoading(true);
      setError(null);
      await getMyAppointments({
        onSuccess: (data) => {
          const appts = data.data ?? [];
          setAppointments(appts);
          setLoading(false);
        },
        onError: (err) => {
          setError(err?.message ?? "Failed to load appointments.");
          setLoading(false);
        },
      });
    },
    [getMyAppointments],
  );

  useEffect(() => {
    loadAppointments();
  }, [loadAppointments]);

  // Handle selected appointment changes and keep selected reactive
  useEffect(() => {
    if (appointments.length > 0) {
      if (queryId) {
        const found = appointments.find((a) => a.id === queryId);
        setSelected(found ?? null);
      } else if (selected) {
        const found = appointments.find((a) => a.id === selected.id);
        if (found) {
          setSelected(found);
        }
      }
    }
  }, [queryId, appointments]);

  const handleStatusUpdate = async (
    status:
      "coming" | "reached" | "taketest" | "collect" | "handover" | "reachedlab",
  ) => {
    if (!selected) return;
    setActionLoading(true);
    await updateAppointmentStatus(selected.id, status, {
      onSuccess: () => {
        setSnackbar({
          open: true,
          message: `Status transitioned to ${status.toUpperCase()} and patient notified.`,
          severity: "success",
        });
        loadAppointments(true);
        setActionLoading(false);

        // Auto-triggers
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

  const getBookedItemOptions = (locationAddress?: string): string[] => {
    if (!locationAddress) return [];
    const parts = locationAddress.split(" | Tests: ");
    if (parts.length > 1) {
      return parts[1]
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);
    }
    return [];
  };

  const handleVerifyOtp = async () => {
    if (!selected) return;
    setOtpVerifying(true);
    setOtpError(null);
    await verifyOtp(selected.id, otpInput, {
      onSuccess: (data) => {
        setOtpVerifying(false);
        setOtpDialogOpen(false);
        setSnackbar({
          open: true,
          message: "OTP Verified successfully.",
          severity: "success",
        });

        const count = data.data?.memberCount ?? selected.memberCount ?? 1;
        const profiles = data.data?.existingProfiles ?? [];
        setExistingProfiles(profiles);
        setSelectedProfiles({});

        // Fetch existing members from the database if they exist
        getAppointmentMembers(selected.id, {
          onSuccess: (res) => {
            if (res.data && res.data.length > 0) {
              setMembers(res.data);
            } else {
              setMembers(
                Array.from({ length: count }, (_, i) => ({
                  name: i === 0 ? selected.customerName || "" : "",
                  age: 0,
                  gender: "Male",
                  relationship: i === 0 ? "Self" : "Family Member",
                  additionalNotes: "",
                  uniqueNumber: `MEM-${Math.random().toString(36).substring(2, 10).toUpperCase()}`,
                  testName: "",
                })),
              );
            }
            setMemberDialogOpen(true);
            loadAppointments(true);
          },
          onError: () => {
            setMembers(
              Array.from({ length: count }, (_, i) => ({
                name: i === 0 ? selected.customerName || "" : "",
                age: 0,
                gender: "Male",
                relationship: i === 0 ? "Self" : "Family Member",
                additionalNotes: "",
                uniqueNumber: `MEM-${Math.random().toString(36).substring(2, 10).toUpperCase()}`,
                testName: "",
              })),
            );
            setMemberDialogOpen(true);
            loadAppointments(true);
          },
        });
      },
      onError: (err) => {
        setOtpVerifying(false);
        setOtpError(err?.message ?? "Invalid OTP code. Please try again.");
      },
    });
  };

  const handleSaveMembers = async () => {
    if (!selected) return;

    // Check total count constraint
    if (members.length > selected.memberCount) {
      setSnackbar({
        open: true,
        message: `You can only add up to ${selected.memberCount} members for this appointment.`,
        severity: "error",
      });
      return;
    }

    // Validate rows
    for (let i = 0; i < members.length; i++) {
      const member = members[i];
      if (!member) continue;
      if (!member.name.trim()) {
        setSnackbar({
          open: true,
          message: `Member ${i + 1} requires a valid name.`,
          severity: "error",
        });
        return;
      }
      if (!member.testName || !member.testName.trim()) {
        setSnackbar({
          open: true,
          message: `Please select at least one booked test/package for Member ${i + 1}.`,
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
          message: "Members details logged. Let's start the diagnostic tests.",
          severity: "success",
        });

        // Auto-transition to TakingTest status
        handleStatusUpdate("taketest");
      },
      onError: (err) => {
        setMemberSaving(false);
        setSnackbar({
          open: true,
          message: err?.message ?? "Failed to save member details.",
          severity: "error",
        });
      },
    });
  };

  const handleOpenMembersDialog = async () => {
    if (!selected) return;
    setLoadingMembers(true);
    await getAppointmentMembers(selected.id, {
      onSuccess: (res) => {
        setLoadingMembers(false);
        if (res.data && res.data.length > 0) {
          setMembers(res.data);
        } else {
          setMembers(
            Array.from({ length: selected.memberCount || 1 }, (_, i) => ({
              name: i === 0 ? selected.customerName || "" : "",
              age: 0,
              gender: "Male",
              relationship: i === 0 ? "Self" : "Family Member",
              additionalNotes: "",
              uniqueNumber: `MEM-${Math.random()
                .toString(36)
                .substring(2, 10)
                .toUpperCase()}`,
              testName: "",
            })),
          );
        }
        setMemberDialogOpen(true);
      },
      onError: () => {
        setLoadingMembers(false);
        setMembers(
          Array.from({ length: selected.memberCount || 1 }, (_, i) => ({
            name: i === 0 ? selected.customerName || "" : "",
            age: 0,
            gender: "Male",
            relationship: i === 0 ? "Self" : "Family Member",
            additionalNotes: "",
            uniqueNumber: `MEM-${Math.random()
              .toString(36)
              .substring(2, 10)
              .toUpperCase()}`,
            testName: "",
          })),
        );
        setMemberDialogOpen(true);
      },
    });
  };

  // On-site customer registration
  const handleRegisterOnSite = async () => {
    if (!selected || activeMemberIndexForRegister === null) return;
    if (!registerForm.name.trim()) {
      setRegisterError("Customer name is required.");
      return;
    }
    setRegisterLoading(true);
    setRegisterError(null);

    await registerMemberProfile(
      selected.id,
      {
        name: registerForm.name.trim(),
        phone: registerForm.phone.trim() || undefined,
        email: registerForm.email.trim() || undefined,
        gender: registerForm.gender,
        age: registerForm.age,
        address: registerForm.address.trim() || undefined,
        district: registerForm.district.trim() || undefined,
      },
      {
        onSuccess: (data) => {
          setRegisterLoading(false);
          setRegisterDialogOpen(false);
          setSnackbar({
            open: true,
            message: `Customer ${registerForm.name} registered on-the-spot.`,
            severity: "success",
          });

          // Append profile to dropdown values
          const newProfile = data.data?.data;
          if (newProfile) {
            setExistingProfiles((prev) => [...prev, newProfile]);

            // Select it for the active test-taker row
            const idx = activeMemberIndexForRegister;
            setSelectedProfiles((prev) => ({ ...prev, [idx]: newProfile.id }));
            setMembers((prev) => {
              const next = [...prev];
              next[idx] = {
                ...next[idx],
                name: newProfile.name || "",
                gender: newProfile.gender || "Other",
                age: registerForm.age,
              };
              return next;
            });
          }

          // Reset form
          setRegisterForm({
            name: "",
            phone: "",
            email: "",
            age: 0,
            gender: "Male",
            address: "",
            district: "",
          });
        },
        onError: (err) => {
          setRegisterLoading(false);
          setRegisterError(err?.message ?? "Registration failed. Try again.");
        },
      },
    );
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

  const addEmptyMember = () => {
    setMembers((prev) => [
      ...prev,
      {
        name: "",
        age: 0,
        gender: "Other",
        relationship: "Family Member",
        additionalNotes: "",
        uniqueNumber: `MEM-${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
        testName: "Routine Blood Test",
      },
    ]);
  };

  const removeMemberRow = (idx: number) => {
    if (members.length <= 1) return;
    setMembers((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleProfileChange = (i: number, value: string) => {
    if (value === "new") {
      setActiveMemberIndexForRegister(i);
      setRegisterForm((prev) => ({
        ...prev,
        phone: selected?.customerPhone || "",
        address: selected?.locationAddress || "",
      }));
      setRegisterDialogOpen(true);
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

  const renderMobileShell = (content: React.ReactNode, pageTitle: string) => {
    return (
      <>
        <Head>
          <title>{pageTitle} – Staff Portal</title>
        </Head>
        <Box
          sx={{
            minHeight: "100vh",
            bgcolor: { xs: "background.paper", sm: "#f4f6f8" },
            display: "flex",
            justifyContent: "center",
          }}
        >
          <Box
            sx={{
              width: "100%",
              maxWidth: "480px",
              bgcolor: "background.paper",
              minHeight: "100vh",
              boxShadow: { sm: "0 4px 20px rgba(0,0,0,0.08)" },
              display: "flex",
              flexDirection: "column",
              borderLeft: { sm: "1px solid", borderColor: "divider" },
              borderRight: { sm: "1px solid", borderColor: "divider" },
            }}
          >
            {/* Native-like Mobile Header */}
            <Box
              sx={{
                p: 2,
                background: "linear-gradient(135deg, #059669 0%, #10b981 100%)",
                color: "#fff",
                display: "flex",
                alignItems: "center",
                gap: 1.5,
                position: "sticky",
                top: 0,
                zIndex: 100,
                boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
              }}
            >
              {selected && (
                <IconButton
                  onClick={() => {
                    setSelected(null);
                    router.replace("/staff/appointments", undefined, {
                      shallow: true,
                    });
                  }}
                  size="small"
                  sx={{
                    color: "#fff",
                    border: "1px solid rgba(255,255,255,0.3)",
                  }}
                >
                  <ArrowBackIcon fontSize="small" />
                </IconButton>
              )}
              <Box sx={{ flexGrow: 1 }}>
                <Typography
                  variant="subtitle1"
                  sx={{ fontWeight: 800, lineHeight: 1.2 }}
                >
                  {selected ? "Visit Details" : "Phlebotomist Portal"}
                </Typography>
                <Typography
                  variant="caption"
                  sx={{ opacity: 0.8, display: "block" }}
                >
                  {selected
                    ? selected.appointmentNumber
                    : `${user?.name || "Staff Member"}`}
                </Typography>
              </Box>
              {!selected && (
                <Button
                  variant="outlined"
                  size="small"
                  onClick={() => loadAppointments(true)}
                  sx={{
                    color: "#fff",
                    borderColor: "rgba(255,255,255,0.4)",
                    textTransform: "none",
                    fontWeight: 700,
                    "&:hover": { borderColor: "#fff" },
                  }}
                >
                  Refresh
                </Button>
              )}
            </Box>

            {/* Scrollable Content Container */}
            <Box sx={{ p: 2, flexGrow: 1, pb: 6 }}>{content}</Box>
          </Box>
        </Box>
      </>
    );
  };

  if (loading) {
    return renderMobileShell(
      <Box sx={{ py: 4, display: "flex", flexDirection: "column", gap: 2 }}>
        <Skeleton variant="rounded" height={130} />
        <Skeleton variant="rounded" height={130} />
        <Skeleton variant="rounded" height={130} />
      </Box>,
      "Loading Appointments",
    );
  }

  // Selected visit details view
  if (selected) {
    const statusInfo = STATUS_MAP[selected.status] ?? {
      label: "Unknown",
      color: "default",
    };

    // Sequential Active step tracker for Stepper UI
    let activeStep = 0;
    if (selected.status === 7) activeStep = 1; // Departed
    if (selected.status === 8) activeStep = 2; // Reached
    if (selected.status === 9) activeStep = 3; // OTP Verified
    if (selected.status === 10) activeStep = 3; // Taking Test
    if (
      selected.status === 4 ||
      selected.status === 11 ||
      selected.status === 5
    )
      activeStep = 5; // Collected / Handover

    return renderMobileShell(
      <Box sx={{ pb: 6 }}>
        {/* Map Section */}
        {myLocation && (
          <Card
            elevation={0}
            sx={{
              border: "1px solid",
              borderColor: "divider",
              mb: 3,
              overflow: "hidden",
            }}
          >
            <Box sx={{ height: 260, width: "100%", position: "relative" }}>
              <LeafletMap
                startLat={myLocation.lat}
                startLng={myLocation.lng}
                destLat={selected.locationLatitude}
                destLng={selected.locationLongitude}
                destAddress={selected.locationAddress}
              />
            </Box>
          </Card>
        )}

        {/* Stepper progress */}
        <Card
          elevation={0}
          sx={{ border: "1px solid", borderColor: "divider", mb: 3 }}
        >
          <CardContent sx={{ pb: "16px !important", px: 1 }}>
            <Stepper activeStep={activeStep} alternativeLabel>
              {COLLECTION_STEPS.map((label) => (
                <Step key={label}>
                  <StepLabel
                    sx={{
                      "& .MuiStepLabel-label": {
                        fontSize: 9,
                        fontWeight: 700,
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

        <Grid container spacing={2}>
          {/* Details details */}
          <Grid size={{ xs: 12 }}>
            <Card
              elevation={0}
              sx={{
                border: "1px solid",
                borderColor: "divider",
              }}
            >
              <CardContent>
                <Typography
                  variant="subtitle2"
                  sx={{ fontWeight: 750, mb: 1.5 }}
                >
                  Primary Booking Info
                </Typography>
                <Divider sx={{ mb: 1.5 }} />
                <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                  <Box>
                    <Typography variant="caption" color="text.secondary">
                      Reference Number
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 700 }}>
                      {selected.appointmentNumber}
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant="caption" color="text.secondary">
                      Patient / Customer
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 700 }}>
                      {selected.customerName}
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant="caption" color="text.secondary">
                      Contact phone
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 700 }}>
                      {selected.customerPhone || "—"}
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant="caption" color="text.secondary">
                      Current Visit Status
                    </Typography>
                    <Box sx={{ mt: 0.5 }}>
                      <Chip
                        label={statusInfo.label}
                        color={statusInfo.color}
                        size="small"
                        sx={{ fontWeight: 700 }}
                      />
                    </Box>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          {/* Address Details */}
          <Grid size={{ xs: 12 }}>
            <Card
              elevation={0}
              sx={{
                border: "1px solid",
                borderColor: "divider",
              }}
            >
              <CardContent>
                <Typography
                  variant="subtitle2"
                  sx={{ fontWeight: 750, mb: 1.5 }}
                >
                  Schedule & Address
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
                        Collection Address
                      </Typography>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        {selected.locationAddress}
                      </Typography>
                      {selected.landmark && (
                        <Typography
                          variant="caption"
                          color="text.secondary"
                          sx={{ display: "block" }}
                        >
                          Landmark: {selected.landmark}
                        </Typography>
                      )}
                      {selected.buildingDetails && (
                        <Typography
                          variant="caption"
                          color="text.secondary"
                          sx={{ display: "block" }}
                        >
                          Building: {selected.buildingDetails}{" "}
                          {selected.floor ? `· Floor ${selected.floor}` : ""}
                        </Typography>
                      )}
                    </Box>
                  </Box>
                  <Box sx={{ display: "flex", gap: 1 }}>
                    <CalendarTodayIcon
                      sx={{ fontSize: 15, color: "text.disabled", mt: 0.2 }}
                    />
                    <Box>
                      <Typography
                        variant="caption"
                        color="text.secondary"
                        sx={{ display: "block" }}
                      >
                        Slot Date
                      </Typography>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        {formatDate(selected.slotDate)}
                      </Typography>
                    </Box>
                  </Box>
                  <Box sx={{ display: "flex", gap: 1 }}>
                    <AccessTimeIcon
                      sx={{ fontSize: 15, color: "text.disabled", mt: 0.2 }}
                    />
                    <Box>
                      <Typography
                        variant="caption"
                        color="text.secondary"
                        sx={{ display: "block" }}
                      >
                        Slot Time
                      </Typography>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        {formatTime(selected.slotStartTime)}
                      </Typography>
                    </Box>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          {/* Sequential Action Controls */}
          <Grid size={{ xs: 12 }}>
            <Card
              elevation={0}
              sx={{ border: "1px solid", borderColor: "divider" }}
            >
              <CardContent>
                <Typography variant="subtitle2" sx={{ fontWeight: 750, mb: 2 }}>
                  Sequential Action Pipeline
                </Typography>

                <Box sx={{ display: "flex", flexWrap: "wrap", gap: 2 }}>
                  {/* Step 1: Mark Departed */}
                  {selected.status <= 3 && (
                    <Button
                      variant="contained"
                      startIcon={<DirectionsBikeIcon />}
                      onClick={() => handleStatusUpdate("coming")}
                      disabled={actionLoading}
                      fullWidth
                      sx={{
                        fontWeight: 700,
                        py: 1.2,
                        textTransform: "none",
                        borderRadius: "8px",
                      }}
                    >
                      {actionLoading ? (
                        <CircularProgress size={16} color="inherit" />
                      ) : (
                        "Mark Departed"
                      )}
                    </Button>
                  )}

                  {/* Step 2: Mark Arrived */}
                  {selected.status === 7 && (
                    <Button
                      variant="contained"
                      color="secondary"
                      startIcon={<LocationOnIcon />}
                      onClick={() => handleStatusUpdate("reached")}
                      disabled={actionLoading}
                      fullWidth
                      sx={{
                        fontWeight: 700,
                        py: 1.2,
                        textTransform: "none",
                        borderRadius: "8px",
                      }}
                    >
                      {actionLoading ? (
                        <CircularProgress size={16} color="inherit" />
                      ) : (
                        "Mark Arrived"
                      )}
                    </Button>
                  )}

                  {/* Step 3: Verify OTP */}
                  {selected.status === 8 && (
                    <Button
                      variant="contained"
                      color="warning"
                      startIcon={<KeyIcon />}
                      onClick={() => setOtpDialogOpen(true)}
                      disabled={actionLoading}
                      fullWidth
                      sx={{
                        fontWeight: 700,
                        py: 1.2,
                        textTransform: "none",
                        borderRadius: "8px",
                      }}
                    >
                      Verify Patient OTP
                    </Button>
                  )}

                  {/* Step 4: Add details / Edit member details */}
                  {selected.status === 9 && (
                    <Button
                      variant="contained"
                      color="primary"
                      startIcon={
                        loadingMembers ? (
                          <CircularProgress size={16} color="inherit" />
                        ) : (
                          <AddIcon />
                        )
                      }
                      onClick={handleOpenMembersDialog}
                      disabled={actionLoading || loadingMembers}
                      fullWidth
                      sx={{
                        fontWeight: 700,
                        py: 1.2,
                        textTransform: "none",
                        borderRadius: "8px",
                      }}
                    >
                      {loadingMembers
                        ? "Loading Members..."
                        : "Add Test & Member Details"}
                    </Button>
                  )}

                  {/* Step 5: Test in progress */}
                  {selected.status === 10 && (
                    <Button
                      variant="contained"
                      color="success"
                      startIcon={<CheckCircleIcon />}
                      onClick={() => handleStatusUpdate("collect")}
                      disabled={actionLoading}
                      fullWidth
                      sx={{
                        fontWeight: 700,
                        py: 1.2,
                        textTransform: "none",
                        borderRadius: "8px",
                      }}
                    >
                      Complete Test & Collect Samples
                    </Button>
                  )}

                  {/* Step 6: Handover to lab */}
                  {selected.status === 4 && (
                    <Button
                      variant="contained"
                      color="success"
                      startIcon={<CheckCircleIcon />}
                      onClick={() => handleStatusUpdate("handover")}
                      disabled={actionLoading}
                      fullWidth
                      sx={{
                        fontWeight: 700,
                        py: 1.2,
                        textTransform: "none",
                        borderRadius: "8px",
                      }}
                    >
                      {actionLoading ? (
                        <CircularProgress size={16} color="inherit" />
                      ) : (
                        "Handover Samples to Lab"
                      )}
                    </Button>
                  )}

                  {/* Step 7: Completed State */}
                  {(selected.status === 11 || selected.status === 5) && (
                    <Alert
                      severity="success"
                      sx={{ width: "100%", borderRadius: "8px" }}
                    >
                      Samples collected and handed over successfully. Awaiting
                      test report upload by the Lab Owner.
                    </Alert>
                  )}
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* OTP Dialog */}
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
          <DialogTitle sx={{ fontWeight: 800 }}>Verify Patient OTP</DialogTitle>
          <DialogContent>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Please request the 4-digit collection verification OTP passcode
              from the patient.
            </Typography>
            <TextField
              label="4-Digit Passcode"
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
            <Button onClick={() => setOtpDialogOpen(false)}>Cancel</Button>
            <Button
              variant="contained"
              onClick={handleVerifyOtp}
              disabled={otpInput.length !== 4 || otpVerifying}
              sx={{ fontWeight: 700 }}
            >
              {otpVerifying ? (
                <CircularProgress size={16} color="inherit" />
              ) : (
                "Verify OTP"
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
          <DialogTitle
            sx={{
              fontWeight: 800,
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <Typography variant="h6" sx={{ fontWeight: 800 }}>
              Test & Member Details
            </Typography>
            {members.length < (selected?.memberCount || 1) && (
              <Button
                variant="outlined"
                size="small"
                startIcon={<AddIcon />}
                onClick={addEmptyMember}
                sx={{ textTransform: "none", fontWeight: 700 }}
              >
                Add Test Taker
              </Button>
            )}
          </DialogTitle>
          <DialogContent dividers sx={{ bgcolor: "rgba(0,0,0,0.01)", px: 2 }}>
            {/* Quick Search Pre-Existing Members */}
            <Card
              variant="outlined"
              sx={{
                mb: 3,
                p: 2,
                borderColor: "primary.light",
                boxShadow: "none",
              }}
            >
              <Typography
                variant="subtitle2"
                sx={{ fontWeight: 700, mb: 1, color: "primary.main" }}
              >
                🔍 Search Pre-Existing Patient Profiles
              </Typography>
              <Box sx={{ display: "flex", gap: 1 }}>
                <TextField
                  size="small"
                  label="Search by Phone Number"
                  placeholder="e.g. 9876543210"
                  value={lookupPhone}
                  onChange={(e) => setLookupPhone(e.target.value)}
                  fullWidth
                />
                <Button
                  variant="contained"
                  onClick={handleLookupSearch}
                  disabled={searchingProfiles}
                  sx={{
                    textTransform: "none",
                    minWidth: "120px",
                    fontWeight: 700,
                  }}
                >
                  {searchingProfiles ? (
                    <CircularProgress size={20} color="inherit" />
                  ) : (
                    "Search"
                  )}
                </Button>
              </Box>
            </Card>

            {members.map((m, idx) => (
              <Card
                key={idx}
                sx={{
                  mb: 3,
                  border: "1px solid",
                  borderColor: "divider",
                  boxShadow: "none",
                }}
              >
                <CardContent sx={{ p: 2 }}>
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      mb: 2,
                    }}
                  >
                    <Typography
                      variant="subtitle2"
                      sx={{ fontWeight: 800, color: "primary.main" }}
                    >
                      Patient Row #{idx + 1}
                    </Typography>
                    {members.length > 1 && (
                      <IconButton
                        size="small"
                        color="error"
                        onClick={() => removeMemberRow(idx)}
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    )}
                  </Box>

                  <Grid container spacing={2}>
                    {existingProfiles.length > 0 && (
                      <Grid size={{ xs: 12 }}>
                        <TextField
                          label="Link Registered Account Profile"
                          fullWidth
                          size="small"
                          select
                          value={selectedProfiles[idx] || "new"}
                          onChange={(e) =>
                            handleProfileChange(idx, e.target.value)
                          }
                        >
                          <MenuItem value="new">
                            -- Create / Register On-Site Profile --
                          </MenuItem>
                          {existingProfiles.map((p) => (
                            <MenuItem key={p.id} value={p.id}>
                              {p.name} ({p.gender}, {p.dob || "Age unknown"})
                            </MenuItem>
                          ))}
                        </TextField>
                      </Grid>
                    )}

                    <Grid size={{ xs: 12, sm: 6 }}>
                      <TextField
                        label="Patient Name"
                        fullWidth
                        size="small"
                        required
                        value={m.name}
                        onChange={(e) =>
                          updateMember(idx, "name", e.target.value)
                        }
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
                          updateMember(
                            idx,
                            "age",
                            parseInt(e.target.value) || 0,
                          )
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
                          updateMember(idx, "gender", e.target.value)
                        }
                      >
                        <MenuItem value="Male">Male</MenuItem>
                        <MenuItem value="Female">Female</MenuItem>
                        <MenuItem value="Other">Other</MenuItem>
                      </TextField>
                    </Grid>

                    <Grid size={{ xs: 12 }}>
                      {selected ? (
                        <Box
                          sx={{
                            p: 1.5,
                            border: "1px solid",
                            borderColor: "divider",
                            borderRadius: "6px",
                            bgcolor: "background.paper",
                          }}
                        >
                          <Typography
                            variant="caption"
                            color="text.secondary"
                            sx={{ fontWeight: 700, mb: 1, display: "block" }}
                          >
                            Select Tests / Packages *
                          </Typography>
                          {branchServicesLoading ? (
                            <Box
                              sx={{
                                py: 2,
                                display: "flex",
                                justifyContent: "center",
                              }}
                            >
                              <CircularProgress size={20} />
                            </Box>
                          ) : (
                            <Box
                              sx={{
                                display: "flex",
                                flexDirection: "column",
                                gap: 1.5,
                              }}
                            >
                              {/* Booked / Prepaid tests */}
                              {getBookedItemOptions(selected.locationAddress)
                                .length > 0 && (
                                <Box>
                                  <Typography
                                    variant="caption"
                                    sx={{
                                      fontWeight: 800,
                                      color: "primary.main",
                                      display: "block",
                                      mb: 0.5,
                                    }}
                                  >
                                    Pre-Paid (Booked Tests)
                                  </Typography>
                                  {getBookedItemOptions(
                                    selected.locationAddress,
                                  ).map((opt) => {
                                    const selectedTests = (m.testName || "")
                                      .split(",")
                                      .map((x) => x.trim())
                                      .filter(Boolean);
                                    const isChecked =
                                      selectedTests.includes(opt);
                                    return (
                                      <FormControlLabel
                                        key={opt}
                                        sx={{ margin: 0, display: "block" }}
                                        control={
                                          <Checkbox
                                            size="small"
                                            checked={isChecked}
                                            onChange={(e) => {
                                              let newTests;
                                              if (e.target.checked) {
                                                newTests = [
                                                  ...selectedTests,
                                                  opt,
                                                ];
                                              } else {
                                                newTests = selectedTests.filter(
                                                  (t) => t !== opt,
                                                );
                                              }
                                              updateMember(
                                                idx,
                                                "testName",
                                                newTests.join(", "),
                                              );
                                            }}
                                          />
                                        }
                                        label={
                                          <Typography
                                            variant="body2"
                                            sx={{
                                              fontSize: "0.85rem",
                                              fontWeight: 500,
                                            }}
                                          >
                                            {opt}
                                          </Typography>
                                        }
                                      />
                                    );
                                  })}
                                </Box>
                              )}

                              {/* Additional Catalog services */}
                              {branchServices.length > 0 && (
                                <Box>
                                  <Typography
                                    variant="caption"
                                    sx={{
                                      fontWeight: 800,
                                      color: "text.secondary",
                                      display: "block",
                                      mb: 0.5,
                                    }}
                                  >
                                    Additional Catalog Services (Pay On-Site)
                                  </Typography>
                                  <Box
                                    sx={{
                                      maxHeight: "150px",
                                      overflowY: "auto",
                                      pl: 1,
                                      borderLeft: "2px solid #ccc",
                                    }}
                                  >
                                    {branchServices
                                      .filter(
                                        (s: any) =>
                                          !getBookedItemOptions(
                                            selected.locationAddress,
                                          ).includes(s.name),
                                      )
                                      .map((s: any) => {
                                        const selectedTests = (m.testName || "")
                                          .split(",")
                                          .map((x) => x.trim())
                                          .filter(Boolean);
                                        const isChecked =
                                          selectedTests.includes(s.name);
                                        return (
                                          <FormControlLabel
                                            key={s.id}
                                            sx={{ margin: 0, display: "block" }}
                                            control={
                                              <Checkbox
                                                size="small"
                                                checked={isChecked}
                                                onChange={(e) => {
                                                  let newTests;
                                                  if (e.target.checked) {
                                                    newTests = [
                                                      ...selectedTests,
                                                      s.name,
                                                    ];
                                                  } else {
                                                    newTests =
                                                      selectedTests.filter(
                                                        (t) => t !== s.name,
                                                      );
                                                  }
                                                  updateMember(
                                                    idx,
                                                    "testName",
                                                    newTests.join(", "),
                                                  );
                                                }}
                                              />
                                            }
                                            label={
                                              <Typography
                                                variant="body2"
                                                sx={{ fontSize: "0.85rem" }}
                                              >
                                                {s.name} (₹{s.price})
                                              </Typography>
                                            }
                                          />
                                        );
                                      })}
                                  </Box>
                                </Box>
                              )}
                            </Box>
                          )}
                        </Box>
                      ) : (
                        <TextField
                          label="Test / Package Name"
                          fullWidth
                          size="small"
                          value={m.testName || ""}
                          onChange={(e) =>
                            updateMember(idx, "testName", e.target.value)
                          }
                          placeholder="e.g. Routine Blood Test"
                        />
                      )}
                    </Grid>

                    <Grid size={{ xs: 12 }}>
                      <TextField
                        label="Relationship to Booker"
                        fullWidth
                        size="small"
                        value={m.relationship || ""}
                        onChange={(e) =>
                          updateMember(idx, "relationship", e.target.value)
                        }
                      />
                    </Grid>

                    <Grid size={{ xs: 12 }}>
                      <TextField
                        label="Additional Notes (Optional)"
                        fullWidth
                        size="small"
                        multiline
                        rows={2}
                        value={m.additionalNotes || ""}
                        onChange={(e) =>
                          updateMember(idx, "additionalNotes", e.target.value)
                        }
                      />
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            ))}
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 2 }}>
            <Button onClick={() => setMemberDialogOpen(false)}>Cancel</Button>
            <Button
              variant="contained"
              onClick={handleSaveMembers}
              disabled={memberSaving}
              sx={{ fontWeight: 700 }}
            >
              {memberSaving ? (
                <CircularProgress size={16} color="inherit" />
              ) : (
                "Save & Start Test"
              )}
            </Button>
          </DialogActions>
        </Dialog>

        {/* On-the-spot profile registration Dialog */}
        <Dialog
          open={registerDialogOpen}
          onClose={() => setRegisterDialogOpen(false)}
          maxWidth="xs"
          fullWidth
        >
          <DialogTitle sx={{ fontWeight: 800 }}>
            On-Site Profile Registration
          </DialogTitle>
          <DialogContent dividers>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Add a new customer profile into the database on the spot. This
              will generate their patient records.
            </Typography>

            {registerError && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {registerError}
              </Alert>
            )}

            <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
              <TextField
                label="Full Name"
                fullWidth
                size="small"
                required
                value={registerForm.name}
                onChange={(e) =>
                  setRegisterForm((prev) => ({ ...prev, name: e.target.value }))
                }
              />

              <TextField
                label="Mobile Phone"
                fullWidth
                size="small"
                value={registerForm.phone}
                onChange={(e) =>
                  setRegisterForm((prev) => ({
                    ...prev,
                    phone: e.target.value,
                  }))
                }
              />

              <TextField
                label="Email Address"
                fullWidth
                size="small"
                value={registerForm.email}
                onChange={(e) =>
                  setRegisterForm((prev) => ({
                    ...prev,
                    email: e.target.value,
                  }))
                }
              />

              <Grid container spacing={2}>
                <Grid size={{ xs: 6 }}>
                  <TextField
                    label="Age"
                    fullWidth
                    size="small"
                    type="number"
                    value={registerForm.age || ""}
                    onChange={(e) =>
                      setRegisterForm((prev) => ({
                        ...prev,
                        age: parseInt(e.target.value) || 0,
                      }))
                    }
                  />
                </Grid>
                <Grid size={{ xs: 6 }}>
                  <TextField
                    label="Gender"
                    fullWidth
                    size="small"
                    select
                    value={registerForm.gender}
                    onChange={(e) =>
                      setRegisterForm((prev) => ({
                        ...prev,
                        gender: e.target.value,
                      }))
                    }
                  >
                    <MenuItem value="Male">Male</MenuItem>
                    <MenuItem value="Female">Female</MenuItem>
                    <MenuItem value="Other">Other</MenuItem>
                  </TextField>
                </Grid>
              </Grid>

              <TextField
                label="Full Address"
                fullWidth
                size="small"
                multiline
                rows={2}
                value={registerForm.address}
                onChange={(e) =>
                  setRegisterForm((prev) => ({
                    ...prev,
                    address: e.target.value,
                  }))
                }
              />

              <TextField
                label="District"
                fullWidth
                size="small"
                value={registerForm.district}
                onChange={(e) =>
                  setRegisterForm((prev) => ({
                    ...prev,
                    district: e.target.value,
                  }))
                }
              />
            </Box>
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 2 }}>
            <Button onClick={() => setRegisterDialogOpen(false)}>Cancel</Button>
            <Button
              variant="contained"
              onClick={handleRegisterOnSite}
              disabled={registerLoading}
              sx={{ fontWeight: 700 }}
            >
              {registerLoading ? (
                <CircularProgress size={16} color="inherit" />
              ) : (
                "Register Profile"
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
            sx={{ minWidth: 280, fontWeight: 700 }}
          >
            {snackbar.message}
          </Alert>
        </Snackbar>
      </Box>,
      selected.appointmentNumber,
    );
  }

  // List view
  return renderMobileShell(
    <Box>
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
    </Box>,
    "My Appointments",
  );
}
