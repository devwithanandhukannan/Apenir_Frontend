import React, { useEffect, useState, useCallback } from "react";
import Head from "next/head";
import { useRouter } from "next/router";
import { useAppSelector } from "@/core_components/store/hooks";
import Typography from "@mui/material/Typography";
import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Box from "@mui/material/Box";
import Chip from "@mui/material/Chip";
import Avatar from "@mui/material/Avatar";
import Skeleton from "@mui/material/Skeleton";
import Button from "@mui/material/Button";
import Divider from "@mui/material/Divider";
import Alert from "@mui/material/Alert";
import ScienceIcon from "@mui/icons-material/Science";
import PendingActionsIcon from "@mui/icons-material/PendingActions";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import AssignmentIcon from "@mui/icons-material/Assignment";
import PeopleIcon from "@mui/icons-material/People";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import { useApi } from "@/core_components/hooks/useApi/useApi";

// Status label mapping from the backend AppointmentStatus enum
const STATUS_LABELS: Record<
  number,
  { label: string; color: "default" | "info" | "warning" | "success" | "error" }
> = {
  1: { label: "Pending", color: "default" },
  2: { label: "Confirmed", color: "info" },
  3: { label: "Assigned", color: "warning" },
  4: { label: "Collected", color: "success" },
  5: { label: "Completed", color: "success" },
  6: { label: "Cancelled", color: "error" },
};

interface DashboardSummary {
  totalCount: number;
  completedCount: number;
  pendingCount: number;
  confirmedCount: number;
  cancelledCount: number;
  grossRevenue: number;
  netPayout: number;
}

interface Appointment {
  id: string;
  appointmentNumber?: string;
  status: number;
  slotDate?: string;
  memberCount?: number;
  customerName?: string;
  locationAddress?: string;
}

function StatCard({
  icon,
  label,
  value,
  color,
  loading,
}: {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  color: string;
  loading: boolean;
}) {
  return (
    <Card
      sx={{
        border: "1px solid",
        borderColor: "divider",
        boxShadow: "none",
        borderRadius: "12px",
      }}
    >
      <CardContent
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 2,
          p: "20px !important",
        }}
      >
        <Avatar sx={{ bgcolor: color, width: 48, height: 48 }}>{icon}</Avatar>
        <div>
          <Typography
            variant="caption"
            color="text.secondary"
            sx={{ fontWeight: 600 }}
          >
            {label}
          </Typography>
          {loading ? (
            <Skeleton width={60} height={32} />
          ) : (
            <Typography variant="h5" sx={{ fontWeight: 800 }}>
              {value}
            </Typography>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

export default function LabDashboard() {
  const { user, isAuthenticated, isInitialized } = useAppSelector(
    (state) => state.auth,
  );
  const router = useRouter();
  const { get } = useApi();

  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Auth guard
  useEffect(() => {
    if (!isInitialized) return;
    if (!isAuthenticated || (user?.role !== "lab" && user?.role !== "staff")) {
      router.replace("/lab/login");
    }
  }, [isAuthenticated, user, isInitialized, router]);

  const loadDashboard = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // Load dashboard summary
      const summaryRes = await get<any>({
        endpoint: "/api/lab/dashboard/summary",
        requireAuth: true,
      });
      if (
        summaryRes.success &&
        summaryRes.data?.success &&
        summaryRes.data?.data
      ) {
        setSummary(summaryRes.data.data);
      }

      // Load recent appointments
      const apptRes = await get<any>({
        endpoint: "/api/lab/appointments",
        requireAuth: true,
      });
      if (apptRes.success && apptRes.data?.success && apptRes.data?.data) {
        setAppointments((apptRes.data.data as Appointment[]).slice(0, 8));
      }
    } catch {
      setError("Failed to load dashboard data.");
    } finally {
      setLoading(false);
    }
  }, [get]);

  useEffect(() => {
    if (isAuthenticated) {
      loadDashboard();
    }
  }, [isAuthenticated, loadDashboard]);

  const todayLabel = new Date().toLocaleDateString("en-IN", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <>
      <Head>
        <title>Lab Dashboard — Apenir</title>
        <meta
          name="description"
          content="Lab portal dashboard showing appointments, staff activity, and revenue metrics."
        />
      </Head>

      <Box>
        {/* Welcome */}
        <Box sx={{ mb: 4 }}>
          <Typography
            variant="h4"
            sx={{ fontWeight: 800, mb: 0.5, letterSpacing: "-0.5px" }}
          >
            {user?.role === "staff" ? "Staff Dashboard" : "Lab Dashboard"}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Welcome back, <strong>{user?.name || "Lab Specialist"}</strong>.
            &nbsp;
            <CalendarTodayIcon
              sx={{ fontSize: 14, verticalAlign: "middle" }}
            />{" "}
            {todayLabel}
          </Typography>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 3, borderRadius: "8px" }}>
            {error}
          </Alert>
        )}

        {/* KPI Cards */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <StatCard
              icon={<ScienceIcon />}
              label="Total Appointments"
              value={summary?.totalCount ?? "—"}
              color="rgba(16,185,129,0.15)"
              loading={loading}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <StatCard
              icon={<PendingActionsIcon />}
              label="Pending"
              value={summary?.pendingCount ?? "—"}
              color="rgba(245,158,11,0.15)"
              loading={loading}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <StatCard
              icon={<CheckCircleIcon />}
              label="Completed"
              value={summary?.completedCount ?? "—"}
              color="rgba(16,185,129,0.15)"
              loading={loading}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <StatCard
              icon={<TrendingUpIcon />}
              label="Gross Revenue"
              value={
                summary
                  ? `₹${summary.grossRevenue.toLocaleString("en-IN")}`
                  : "—"
              }
              color="rgba(99,102,241,0.15)"
              loading={loading}
            />
          </Grid>
        </Grid>

        {/* Recent Appointments */}
        <Card
          sx={{
            border: "1px solid",
            borderColor: "divider",
            boxShadow: "none",
            borderRadius: "12px",
          }}
        >
          <CardContent sx={{ p: "24px !important" }}>
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                mb: 2,
              }}
            >
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <AssignmentIcon color="secondary" fontSize="small" />
                <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>
                  Recent Appointments
                </Typography>
              </Box>
              <Button
                size="small"
                color="secondary"
                endIcon={<ArrowForwardIcon />}
                onClick={() => router.push("/lab/appointments")}
                sx={{ textTransform: "none", fontWeight: 600 }}
              >
                View All
              </Button>
            </Box>
            <Divider sx={{ mb: 2 }} />

            {loading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <Skeleton
                  key={i}
                  height={52}
                  sx={{ mb: 1, borderRadius: "6px" }}
                />
              ))
            ) : appointments.length === 0 ? (
              <Alert severity="info" sx={{ borderRadius: "8px" }}>
                No appointments yet. Share your booking link to get started!
              </Alert>
            ) : (
              <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                {appointments.map((appt) => {
                  const statusInfo = STATUS_LABELS[appt.status] ?? {
                    label: "Unknown",
                    color: "default",
                  };
                  return (
                    <Box
                      key={appt.id}
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        px: 2,
                        py: 1.5,
                        borderRadius: "8px",
                        border: "1px solid",
                        borderColor: "divider",
                        bgcolor: "background.default",
                        cursor: "pointer",
                        "&:hover": {
                          borderColor: "secondary.main",
                          bgcolor: "rgba(16,185,129,0.04)",
                        },
                      }}
                      onClick={() => router.push("/lab/appointments")}
                    >
                      <Box>
                        <Typography variant="body2" sx={{ fontWeight: 700 }}>
                          #
                          {appt.appointmentNumber ||
                            appt.id.slice(-6).toUpperCase()}
                          {appt.customerName ? ` — ${appt.customerName}` : ""}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {appt.slotDate
                            ? new Date(appt.slotDate).toLocaleDateString(
                                "en-IN",
                                {
                                  day: "2-digit",
                                  month: "short",
                                  year: "numeric",
                                },
                              )
                            : "Date TBD"}
                          {appt.memberCount
                            ? ` · ${appt.memberCount} member${appt.memberCount > 1 ? "s" : ""}`
                            : ""}
                        </Typography>
                      </Box>
                      <Chip
                        label={statusInfo.label}
                        size="small"
                        color={statusInfo.color}
                        sx={{ fontWeight: 700, minWidth: 80 }}
                      />
                    </Box>
                  );
                })}
              </Box>
            )}
          </CardContent>
        </Card>

        {/* Quick Links */}
        <Grid container spacing={2} sx={{ mt: 3 }}>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Button
              fullWidth
              variant="outlined"
              color="secondary"
              startIcon={<PeopleIcon />}
              onClick={() => router.push("/lab/staff")}
              sx={{
                py: 1.5,
                textTransform: "none",
                fontWeight: 700,
                borderRadius: "10px",
              }}
            >
              Manage Staff
            </Button>
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Button
              fullWidth
              variant="outlined"
              color="secondary"
              startIcon={<AssignmentIcon />}
              onClick={() => router.push("/lab/appointments")}
              sx={{
                py: 1.5,
                textTransform: "none",
                fontWeight: 700,
                borderRadius: "10px",
              }}
            >
              All Appointments
            </Button>
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Button
              fullWidth
              variant="outlined"
              color="secondary"
              startIcon={<ScienceIcon />}
              onClick={() => router.push("/lab/services")}
              sx={{
                py: 1.5,
                textTransform: "none",
                fontWeight: 700,
                borderRadius: "10px",
              }}
            >
              Services
            </Button>
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Button
              fullWidth
              variant="outlined"
              color="secondary"
              startIcon={<TrendingUpIcon />}
              onClick={() => router.push("/lab/insights")}
              sx={{
                py: 1.5,
                textTransform: "none",
                fontWeight: 700,
                borderRadius: "10px",
              }}
            >
              Insights
            </Button>
          </Grid>
        </Grid>
      </Box>
    </>
  );
}
