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
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemText from "@mui/material/ListItemText";
import ListItemAvatar from "@mui/material/ListItemAvatar";
import { useAppSelector } from "@/core_components/store/hooks";
import {
  useStaffService,
  StaffAppointmentItem,
  StaffStats,
} from "@/core_components/apis/admin/staffService/useStaffService";
import AssignmentIcon from "@mui/icons-material/Assignment";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import PeopleIcon from "@mui/icons-material/People";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import PendingActionsIcon from "@mui/icons-material/PendingActions";
import DirectionsBikeIcon from "@mui/icons-material/DirectionsBike";
import HistoryIcon from "@mui/icons-material/History";
import ScienceIcon from "@mui/icons-material/Science";

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

export default function StaffDashboard() {
  const { user, isAuthenticated, isInitialized } = useAppSelector(
    (state) => state.auth,
  );
  const { getMyAppointments, getStaffStats } = useStaffService();
  const router = useRouter();

  // Auth Guard
  useEffect(() => {
    if (isInitialized && (!isAuthenticated || user?.role !== "staff")) {
      router.replace("/staff/login");
    }
  }, [isAuthenticated, user, isInitialized, router]);

  const [appointments, setAppointments] = useState<StaffAppointmentItem[]>([]);
  const [stats, setStats] = useState<StaffStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tabIndex, setTabIndex] = useState(0);

  const loadDashboardData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // 1. Fetch assigned appointments
      const apptRes = await getMyAppointments();
      if (apptRes.success && apptRes.data?.success) {
        setAppointments(apptRes.data.data ?? []);
      }

      // 2. Fetch phlebotomy statistics
      const statsRes = await getStaffStats();
      if (statsRes.success && statsRes.data?.success) {
        setStats(statsRes.data.data);
      }
    } catch (err: any) {
      setError(err?.message || "Failed to load dashboard statistics.");
    } finally {
      setLoading(false);
    }
  }, [getMyAppointments, getStaffStats]);

  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  const todayStr = new Date().toLocaleDateString("en-IN", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const pendingVisits = appointments.filter(
    (a) => a.status !== 5 && a.status !== 11 && a.status !== 6,
  );

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
        {/* Welcome Block */}
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
              Hello, {user?.name ?? "Phlebotomist"}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {todayStr} · Staff Mobile Portal
            </Typography>
          </Box>
        </Box>

        {/* Stats Cards Row */}
        <Grid container spacing={2} sx={{ mb: 4 }}>
          <Grid size={{ xs: 6, sm: 3 }}>
            <Card
              elevation={0}
              sx={{
                border: "1px solid",
                borderColor: "divider",
                height: "100%",
              }}
            >
              <CardContent
                sx={{ p: 2, display: "flex", alignItems: "center", gap: 1.5 }}
              >
                <Avatar
                  sx={{
                    bgcolor: "warning.light",
                    color: "warning.main",
                    width: 40,
                    height: 40,
                  }}
                >
                  <PendingActionsIcon fontSize="small" />
                </Avatar>
                <Box>
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{ fontWeight: 600, display: "block" }}
                  >
                    Pending
                  </Typography>
                  <Typography variant="h6" sx={{ fontWeight: 800 }}>
                    {loading
                      ? "—"
                      : (stats?.pendingCount ?? pendingVisits.length)}
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid size={{ xs: 6, sm: 3 }}>
            <Card
              elevation={0}
              sx={{
                border: "1px solid",
                borderColor: "divider",
                height: "100%",
              }}
            >
              <CardContent
                sx={{ p: 2, display: "flex", alignItems: "center", gap: 1.5 }}
              >
                <Avatar
                  sx={{
                    bgcolor: "success.light",
                    color: "success.main",
                    width: 40,
                    height: 40,
                  }}
                >
                  <CheckCircleIcon fontSize="small" />
                </Avatar>
                <Box>
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{ fontWeight: 600, display: "block" }}
                  >
                    Completed Today
                  </Typography>
                  <Typography variant="h6" sx={{ fontWeight: 800 }}>
                    {loading ? "—" : (stats?.todayCount ?? 0)}
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid size={{ xs: 6, sm: 3 }}>
            <Card
              elevation={0}
              sx={{
                border: "1px solid",
                borderColor: "divider",
                height: "100%",
              }}
            >
              <CardContent
                sx={{ p: 2, display: "flex", alignItems: "center", gap: 1.5 }}
              >
                <Avatar
                  sx={{
                    bgcolor: "primary.light",
                    color: "primary.main",
                    width: 40,
                    height: 40,
                  }}
                >
                  <CalendarTodayIcon fontSize="small" />
                </Avatar>
                <Box>
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{ fontWeight: 600, display: "block" }}
                  >
                    This Week
                  </Typography>
                  <Typography variant="h6" sx={{ fontWeight: 800 }}>
                    {loading ? "—" : (stats?.weeklyCount ?? 0)}
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid size={{ xs: 6, sm: 3 }}>
            <Card
              elevation={0}
              sx={{
                border: "1px solid",
                borderColor: "divider",
                height: "100%",
              }}
            >
              <CardContent
                sx={{ p: 2, display: "flex", alignItems: "center", gap: 1.5 }}
              >
                <Avatar
                  sx={{
                    bgcolor: "secondary.light",
                    color: "secondary.main",
                    width: 40,
                    height: 40,
                  }}
                >
                  <HistoryIcon fontSize="small" />
                </Avatar>
                <Box>
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{ fontWeight: 600, display: "block" }}
                  >
                    History
                  </Typography>
                  <Typography variant="h6" sx={{ fontWeight: 800 }}>
                    {loading ? "—" : (stats?.previousHistory?.length ?? 0)}
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Tabs Control */}
        <Box sx={{ borderBottom: 1, borderColor: "divider", mb: 3 }}>
          <Tabs
            value={tabIndex}
            onChange={(_, val) => setTabIndex(val)}
            variant="fullWidth"
            textColor="primary"
            indicatorColor="primary"
          >
            <Tab
              label="Active Tasks"
              sx={{ fontWeight: 700, textTransform: "none" }}
            />
            <Tab
              label="Collection History"
              sx={{ fontWeight: 700, textTransform: "none" }}
            />
          </Tabs>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 2, borderRadius: "8px" }}>
            {error}
          </Alert>
        )}

        {/* Tab 0: Active Tasks */}
        {tabIndex === 0 && (
          <Box>
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                mb: 2,
              }}
            >
              <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                My Assigned Visits ({pendingVisits.length})
              </Typography>
              <Button
                variant="outlined"
                size="small"
                onClick={loadDashboardData}
                sx={{ textTransform: "none", fontWeight: 600 }}
              >
                Refresh
              </Button>
            </Box>

            {loading ? (
              <StackLoader />
            ) : pendingVisits.length === 0 ? (
              <EmptyState message="No active collection visits assigned to you yet." />
            ) : (
              <Grid container spacing={2}>
                {pendingVisits.map((appt) => {
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
                          "&:hover": {
                            borderColor: "primary.main",
                            boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
                          },
                        }}
                      >
                        <CardActionArea
                          onClick={() =>
                            router.push(`/staff/appointments?id=${appt.id}`)
                          }
                        >
                          <CardContent sx={{ p: 2 }}>
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
                                  variant="caption"
                                  sx={{
                                    color: "primary.main",
                                    fontWeight: 700,
                                  }}
                                >
                                  #{appt.appointmentNumber}
                                </Typography>
                                <Typography
                                  variant="subtitle2"
                                  sx={{ fontWeight: 800 }}
                                >
                                  {appt.customerName}
                                </Typography>
                                <Typography
                                  variant="caption"
                                  color="text.secondary"
                                  sx={{ display: "block" }}
                                >
                                  {appt.customerPhone}
                                </Typography>
                              </Box>
                              <Chip
                                label={statusInfo.label}
                                color={statusInfo.color}
                                size="small"
                                sx={{ fontWeight: 700, fontSize: 10 }}
                              />
                            </Box>
                            <Divider sx={{ my: 1.5 }} />
                            <Grid container spacing={1}>
                              <Grid size={{ xs: 12 }}>
                                <Box sx={{ display: "flex", gap: 0.8 }}>
                                  <LocationOnIcon
                                    fontSize="small"
                                    color="action"
                                  />
                                  <Typography
                                    variant="caption"
                                    color="text.secondary"
                                  >
                                    {appt.locationAddress}
                                  </Typography>
                                </Box>
                              </Grid>
                              <Grid size={{ xs: 6 }}>
                                <Box
                                  sx={{
                                    display: "flex",
                                    gap: 0.8,
                                    alignItems: "center",
                                  }}
                                >
                                  <CalendarTodayIcon
                                    sx={{
                                      fontSize: 14,
                                      color: "text.secondary",
                                    }}
                                  />
                                  <Typography
                                    variant="caption"
                                    color="text.secondary"
                                  >
                                    {formatDate(appt.slotDate)}
                                  </Typography>
                                </Box>
                              </Grid>
                              <Grid size={{ xs: 6 }}>
                                <Box
                                  sx={{
                                    display: "flex",
                                    gap: 0.8,
                                    alignItems: "center",
                                  }}
                                >
                                  <AccessTimeIcon
                                    sx={{
                                      fontSize: 14,
                                      color: "text.secondary",
                                    }}
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
                          </CardContent>
                        </CardActionArea>
                      </Card>
                    </Grid>
                  );
                })}
              </Grid>
            )}
          </Box>
        )}

        {/* Tab 1: Collection History */}
        {tabIndex === 1 && (
          <Box>
            <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 2 }}>
              Previous Work Logs
            </Typography>

            {loading ? (
              <StackLoader />
            ) : !stats || stats.previousHistory.length === 0 ? (
              <EmptyState message="No previous visit logs found in your history." />
            ) : (
              <Card
                elevation={0}
                sx={{ border: "1px solid", borderColor: "divider" }}
              >
                <List disablePadding>
                  {stats.previousHistory.map((item, idx) => (
                    <React.Fragment key={item.id}>
                      {idx > 0 && <Divider />}
                      <ListItem sx={{ py: 1.8 }}>
                        <ListItemAvatar>
                          <Avatar
                            sx={{
                              bgcolor: "success.light",
                              color: "success.main",
                            }}
                          >
                            <CheckCircleIcon />
                          </Avatar>
                        </ListItemAvatar>
                        <ListItemText
                          primary={
                            <Box
                              sx={{
                                display: "flex",
                                justifyContent: "space-between",
                              }}
                            >
                              <Typography
                                variant="subtitle2"
                                sx={{ fontWeight: 700 }}
                              >
                                {item.customerName}
                              </Typography>
                              <Typography
                                variant="caption"
                                color="text.secondary"
                              >
                                #{item.appointmentNumber}
                              </Typography>
                            </Box>
                          }
                          secondary={
                            <Box
                              sx={{
                                display: "flex",
                                justifyContent: "space-between",
                                alignItems: "center",
                                mt: 0.5,
                              }}
                            >
                              <Typography
                                variant="caption"
                                color="text.secondary"
                              >
                                {item.slotDate
                                  ? formatDate(item.slotDate)
                                  : "—"}{" "}
                                · {item.memberCount} members
                              </Typography>
                              <Chip
                                label={item.status}
                                size="small"
                                color="success"
                                variant="outlined"
                                sx={{
                                  fontSize: 9,
                                  fontWeight: 700,
                                  height: 20,
                                }}
                              />
                            </Box>
                          }
                        />
                      </ListItem>
                    </React.Fragment>
                  ))}
                </List>
              </Card>
            )}
          </Box>
        )}
      </Box>
    </>
  );
}

function StackLoader() {
  return (
    <Grid container spacing={2}>
      {[1, 2, 3].map((i) => (
        <Grid size={{ xs: 12 }} key={i}>
          <Skeleton
            variant="rounded"
            height={100}
            sx={{ borderRadius: "10px" }}
          />
        </Grid>
      ))}
    </Grid>
  );
}

function EmptyState({ message }: { message: string }) {
  return (
    <Card elevation={0} sx={{ border: "1px solid", borderColor: "divider" }}>
      <CardContent sx={{ textAlign: "center", py: 5 }}>
        <DirectionsBikeIcon
          sx={{ fontSize: 44, color: "text.disabled", mb: 1 }}
        />
        <Typography variant="body2" color="text.secondary">
          {message}
        </Typography>
      </CardContent>
    </Card>
  );
}
