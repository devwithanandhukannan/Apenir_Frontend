import React, { useEffect, useState, useCallback } from "react";
import Head from "next/head";
import { useRouter } from "next/router";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import CardActionArea from "@mui/material/CardActionArea";
import Avatar from "@mui/material/Avatar";
import Chip from "@mui/material/Chip";
import Button from "@mui/material/Button";
import Skeleton from "@mui/material/Skeleton";
import Alert from "@mui/material/Alert";
import Divider from "@mui/material/Divider";
import { useAppSelector } from "@/core_components/store/hooks";
import {
  useStaffService,
  StaffAppointmentItem,
} from "@/core_components/apis/admin/staffService/useStaffService";
import AssignmentIcon from "@mui/icons-material/Assignment";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import PeopleIcon from "@mui/icons-material/People";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import PendingActionsIcon from "@mui/icons-material/PendingActions";
import DirectionsBikeIcon from "@mui/icons-material/DirectionsBike";

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

export default function StaffDashboard() {
  const { user, isAuthenticated, isInitialized } = useAppSelector(
    (state) => state.auth,
  );
  const { getMyAppointments } = useStaffService();
  const router = useRouter();

  // Auth Guard
  useEffect(() => {
    if (isInitialized && (!isAuthenticated || user?.role !== "staff")) {
      router.replace("/staff/login");
    }
  }, [isAuthenticated, user, isInitialized, router]);

  const [appointments, setAppointments] = useState<StaffAppointmentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadAppointments = useCallback(async () => {
    setLoading(true);
    setError(null);
    await getMyAppointments({
      onSuccess: (data) => {
        setAppointments(data.data ?? []);
        setLoading(false);
      },
      onError: (err) => {
        setError(err?.message ?? "Failed to load appointments.");
        setLoading(false);
      },
    });
  }, [getMyAppointments]);

  useEffect(() => {
    loadAppointments();
  }, [loadAppointments]);

  const todayStr = new Date().toLocaleDateString("en-IN", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const pending = appointments.filter((a) => a.status < 4).length;
  const completed = appointments.filter((a) => a.status >= 4).length;

  return (
    <>
      <Head>
        <title>Staff Portal – Appenir</title>
        <meta
          name="description"
          content="Phlebotomist dashboard — view assigned home collection visits and manage status updates."
        />
      </Head>

      <Box>
        {/* Welcome */}
        <Box sx={{ mb: 4, display: "flex", alignItems: "center", gap: 2 }}>
          <Avatar
            sx={{
              bgcolor: "primary.main",
              width: 52,
              height: 52,
              fontWeight: 700,
              fontSize: 22,
            }}
          >
            {user?.name?.charAt(0).toUpperCase() ?? "S"}
          </Avatar>
          <Box>
            <Typography
              variant="h5"
              sx={{ fontWeight: 700, letterSpacing: "-0.3px", lineHeight: 1.2 }}
            >
              Good morning, {user?.name ?? "Phlebotomist"}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {todayStr} · Home Collection Portal
            </Typography>
          </Box>
        </Box>

        {/* Quick Stats */}
        <Grid container spacing={2} sx={{ mb: 4 }}>
          {[
            {
              icon: <PendingActionsIcon />,
              label: "Pending Visits",
              value: loading ? "—" : pending,
              color: "warning.main",
              bg: "warning.light",
            },
            {
              icon: <CheckCircleIcon />,
              label: "Completed Today",
              value: loading ? "—" : completed,
              color: "success.main",
              bg: "success.light",
            },
            {
              icon: <AssignmentIcon />,
              label: "Total Assigned",
              value: loading ? "—" : appointments.length,
              color: "primary.main",
              bg: "primary.light",
            },
          ].map((stat) => (
            <Grid size={{ xs: 12, sm: 4 }} key={stat.label}>
              <Card
                elevation={0}
                sx={{ border: "1px solid", borderColor: "divider" }}
              >
                <CardContent
                  sx={{ display: "flex", alignItems: "center", gap: 2, py: 2 }}
                >
                  <Avatar
                    sx={{
                      bgcolor: stat.bg,
                      color: stat.color,
                      width: 44,
                      height: 44,
                    }}
                  >
                    {stat.icon}
                  </Avatar>
                  <Box>
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      sx={{ fontWeight: 600, display: "block" }}
                    >
                      {stat.label}
                    </Typography>
                    <Typography
                      variant="h5"
                      sx={{ fontWeight: 800, lineHeight: 1 }}
                    >
                      {stat.value}
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>

        {/* Appointments List */}
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mb: 2,
          }}
        >
          <Typography variant="h6" sx={{ fontWeight: 700 }}>
            Assigned Visits
          </Typography>
          <Button
            variant="outlined"
            size="small"
            onClick={loadAppointments}
            sx={{ fontWeight: 600, fontSize: 12 }}
          >
            Refresh
          </Button>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {loading ? (
          <Grid container spacing={2}>
            {[1, 2, 3].map((i) => (
              <Grid size={{ xs: 12 }} key={i}>
                <Skeleton variant="rounded" height={120} />
              </Grid>
            ))}
          </Grid>
        ) : appointments.length === 0 ? (
          <Card
            elevation={0}
            sx={{ border: "1px solid", borderColor: "divider" }}
          >
            <CardContent sx={{ textAlign: "center", py: 6 }}>
              <DirectionsBikeIcon
                sx={{ fontSize: 48, color: "text.disabled", mb: 1 }}
              />
              <Typography variant="body2" color="text.secondary">
                No visits assigned to you yet. Check back later.
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
                    sx={{
                      border: "1px solid",
                      borderColor: "divider",
                      transition: "box-shadow 0.2s, border-color 0.2s",
                      "&:hover": {
                        boxShadow: "0 4px 16px rgba(5,150,105,0.10)",
                        borderColor: "primary.main",
                      },
                    }}
                  >
                    <CardActionArea
                      onClick={() =>
                        router.push(`/staff/appointments?id=${appt.id}`)
                      }
                      sx={{ p: 0 }}
                    >
                      <CardContent>
                        <Box
                          sx={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "flex-start",
                            mb: 1.5,
                          }}
                        >
                          <Box>
                            <Typography
                              variant="subtitle2"
                              sx={{ fontWeight: 700, fontSize: 13 }}
                            >
                              {appt.appointmentNumber}
                            </Typography>
                            <Typography
                              variant="body2"
                              sx={{ fontWeight: 600 }}
                            >
                              {appt.customerName}
                            </Typography>
                            <Typography
                              variant="caption"
                              color="text.secondary"
                            >
                              {appt.customerPhone}
                            </Typography>
                          </Box>
                          <Chip
                            label={statusInfo.label}
                            color={statusInfo.color}
                            size="small"
                            sx={{ fontWeight: 600, fontSize: 11 }}
                          />
                        </Box>

                        <Divider sx={{ mb: 1.5 }} />

                        <Grid container spacing={1}>
                          <Grid size={{ xs: 12, sm: 6 }}>
                            <Box
                              sx={{
                                display: "flex",
                                alignItems: "flex-start",
                                gap: 0.8,
                              }}
                            >
                              <LocationOnIcon
                                sx={{
                                  fontSize: 15,
                                  color: "primary.main",
                                  mt: 0.2,
                                }}
                              />
                              <Typography
                                variant="caption"
                                color="text.secondary"
                              >
                                {appt.locationAddress}
                                {appt.landmark ? ` · ${appt.landmark}` : ""}
                              </Typography>
                            </Box>
                          </Grid>
                          <Grid size={{ xs: 6, sm: 3 }}>
                            <Box
                              sx={{
                                display: "flex",
                                alignItems: "center",
                                gap: 0.8,
                              }}
                            >
                              <CalendarTodayIcon
                                sx={{ fontSize: 13, color: "text.disabled" }}
                              />
                              <Typography
                                variant="caption"
                                color="text.secondary"
                              >
                                {formatDate(appt.slotDate)}
                              </Typography>
                            </Box>
                          </Grid>
                          <Grid size={{ xs: 6, sm: 3 }}>
                            <Box
                              sx={{
                                display: "flex",
                                alignItems: "center",
                                gap: 0.8,
                              }}
                            >
                              <AccessTimeIcon
                                sx={{ fontSize: 13, color: "text.disabled" }}
                              />
                              <Typography
                                variant="caption"
                                color="text.secondary"
                              >
                                {formatTime(appt.slotStartTime)}
                              </Typography>
                            </Box>
                          </Grid>
                        </Grid>

                        <Box
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            gap: 0.8,
                            mt: 1,
                          }}
                        >
                          <PeopleIcon
                            sx={{ fontSize: 13, color: "text.disabled" }}
                          />
                          <Typography variant="caption" color="text.secondary">
                            {appt.memberCount} member
                            {appt.memberCount !== 1 ? "s" : ""}
                          </Typography>
                        </Box>
                      </CardContent>
                    </CardActionArea>
                  </Card>
                </Grid>
              );
            })}
          </Grid>
        )}
      </Box>
    </>
  );
}
