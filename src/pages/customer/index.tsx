import React, { useEffect, useState, useCallback } from "react";
import Head from "next/head";
import { useRouter } from "next/router";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Button from "@mui/material/Button";
import Avatar from "@mui/material/Avatar";
import Chip from "@mui/material/Chip";
import Divider from "@mui/material/Divider";
import Skeleton from "@mui/material/Skeleton";
import Alert from "@mui/material/Alert";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemText from "@mui/material/ListItemText";
import { useAppSelector } from "@/core_components/store/hooks";
import {
  useCustomerService,
  CustomerAppointmentItem,
} from "@/core_components/apis/admin/customerService/useCustomerService";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import AddIcon from "@mui/icons-material/Add";
import PersonIcon from "@mui/icons-material/Person";
import ScienceIcon from "@mui/icons-material/Science";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import LocationOnIcon from "@mui/icons-material/LocationOn";

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
  3: { label: "Phlebotomist Assigned", color: "warning" },
  4: { label: "Sample Collected", color: "success" },
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

export default function CustomerDashboard() {
  const { user } = useAppSelector((state) => state.auth);
  const { getMyAppointments } = useCustomerService();
  const router = useRouter();

  const [appointments, setAppointments] = useState<CustomerAppointmentItem[]>(
    [],
  );
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

  const upcomingAppts = appointments.filter((a) => a.status < 4);
  const pastAppts = appointments.filter((a) => a.status >= 4);

  return (
    <>
      <Head>
        <title>My Health – Appenir</title>
        <meta
          name="description"
          content="View your upcoming and past diagnostic appointments, lab reports, and health records."
        />
      </Head>

      <Box>
        {/* Welcome Header */}
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            mb: 4,
            flexWrap: "wrap",
            gap: 2,
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <Avatar
              sx={{
                bgcolor: "primary.main",
                width: 52,
                height: 52,
                fontWeight: 700,
                fontSize: 22,
              }}
            >
              {user?.name?.charAt(0).toUpperCase() ?? "C"}
            </Avatar>
            <Box>
              <Typography
                variant="h5"
                sx={{
                  fontWeight: 700,
                  letterSpacing: "-0.3px",
                  lineHeight: 1.2,
                }}
              >
                {user?.name ?? "My Account"}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {user?.email} · Patient Portal
              </Typography>
            </Box>
          </Box>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => router.push("/customer/book")}
            sx={{ fontWeight: 700, borderRadius: 2 }}
          >
            Book Home Collection
          </Button>
        </Box>

        {/* Summary Cards */}
        <Grid container spacing={2} sx={{ mb: 4 }}>
          {[
            {
              icon: <CalendarTodayIcon />,
              label: "Upcoming Appointments",
              value: loading ? "—" : upcomingAppts.length,
              color: "primary.main",
              bg: "primary.light",
            },
            {
              icon: <ScienceIcon />,
              label: "Completed Collections",
              value: loading ? "—" : pastAppts.length,
              color: "success.main",
              bg: "success.light",
            },
            {
              icon: <PersonIcon />,
              label: "Account",
              value: "Active",
              color: "secondary.main",
              bg: "secondary.light",
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

        {/* Upcoming Appointments */}
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mb: 1.5,
          }}
        >
          <Typography variant="h6" sx={{ fontWeight: 700 }}>
            Upcoming Appointments
          </Typography>
          <Button
            size="small"
            variant="outlined"
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
          <Grid container spacing={2} sx={{ mb: 4 }}>
            {[1, 2].map((i) => (
              <Grid size={{ xs: 12 }} key={i}>
                <Skeleton variant="rounded" height={100} />
              </Grid>
            ))}
          </Grid>
        ) : upcomingAppts.length === 0 ? (
          <Card
            elevation={0}
            sx={{ border: "1px solid", borderColor: "divider", mb: 4 }}
          >
            <CardContent sx={{ textAlign: "center", py: 5 }}>
              <CalendarTodayIcon
                sx={{ fontSize: 40, color: "text.disabled", mb: 1 }}
              />
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                No upcoming appointments. Book your first home collection!
              </Typography>
              <Button
                variant="contained"
                size="small"
                startIcon={<AddIcon />}
                onClick={() => router.push("/customer/book")}
                sx={{ fontWeight: 700 }}
              >
                Book Now
              </Button>
            </CardContent>
          </Card>
        ) : (
          <Grid container spacing={2} sx={{ mb: 4 }}>
            {upcomingAppts.map((appt) => {
              const s = STATUS_MAP[appt.status] ?? {
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
                      transition: "box-shadow 0.2s",
                      "&:hover": {
                        boxShadow: "0 4px 16px rgba(5,150,105,0.1)",
                      },
                    }}
                  >
                    <CardContent>
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
                            sx={{ fontWeight: 700, color: "primary.main" }}
                          >
                            {appt.appointmentNumber}
                          </Typography>
                          <Typography
                            variant="body2"
                            sx={{ fontWeight: 600, mt: 0.3 }}
                          >
                            {appt.branch?.name ?? "Lab Branch"}
                          </Typography>
                        </Box>
                        <Box
                          sx={{ display: "flex", alignItems: "center", gap: 1 }}
                        >
                          <Chip
                            label={s.label}
                            color={s.color}
                            size="small"
                            sx={{ fontWeight: 600, fontSize: 11 }}
                          />
                        </Box>
                      </Box>
                      <Divider sx={{ mb: 1 }} />
                      <Grid container spacing={1}>
                        <Grid size={{ xs: 12, sm: 5 }}>
                          <Box
                            sx={{
                              display: "flex",
                              alignItems: "flex-start",
                              gap: 0.8,
                            }}
                          >
                            <LocationOnIcon
                              sx={{
                                fontSize: 14,
                                color: "primary.main",
                                mt: 0.2,
                              }}
                            />
                            <Typography
                              variant="caption"
                              color="text.secondary"
                            >
                              {appt.locationAddress}
                            </Typography>
                          </Box>
                        </Grid>
                        <Grid size={{ xs: 6, sm: 3 }}>
                          <Box
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              gap: 0.6,
                            }}
                          >
                            <CalendarTodayIcon
                              sx={{ fontSize: 12, color: "text.disabled" }}
                            />
                            <Typography
                              variant="caption"
                              color="text.secondary"
                            >
                              {formatDate(
                                appt.appointmentSlot?.slotDate ?? null,
                              )}
                            </Typography>
                          </Box>
                        </Grid>
                        <Grid size={{ xs: 6, sm: 2 }}>
                          <Box
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              gap: 0.6,
                            }}
                          >
                            <AccessTimeIcon
                              sx={{ fontSize: 12, color: "text.disabled" }}
                            />
                            <Typography
                              variant="caption"
                              color="text.secondary"
                            >
                              {formatTime(
                                appt.appointmentSlot?.startTime ?? null,
                              )}
                            </Typography>
                          </Box>
                        </Grid>
                        <Grid size={{ xs: 12, sm: 2 }}>
                          <Typography
                            variant="caption"
                            color="text.secondary"
                            sx={{ fontWeight: 600 }}
                          >
                            ₹{appt.totalAmount.toLocaleString("en-IN")}
                          </Typography>
                        </Grid>
                      </Grid>
                      {appt.passcode && appt.status <= 3 && (
                        <Box
                          sx={{
                            mt: 1.5,
                            p: 1.2,
                            bgcolor: "primary.light",
                            borderRadius: 1.5,
                            display: "inline-flex",
                            alignItems: "center",
                            gap: 1,
                          }}
                        >
                          <Typography
                            variant="caption"
                            sx={{ fontWeight: 700, color: "primary.main" }}
                          >
                            Collection Passcode:
                          </Typography>
                          <Typography
                            variant="caption"
                            sx={{
                              fontWeight: 800,
                              color: "primary.main",
                              letterSpacing: 4,
                              fontSize: 14,
                            }}
                          >
                            {appt.passcode}
                          </Typography>
                        </Box>
                      )}
                    </CardContent>
                  </Card>
                </Grid>
              );
            })}
          </Grid>
        )}

        {/* Past Appointments */}
        {!loading && pastAppts.length > 0 && (
          <>
            <Typography variant="h6" sx={{ fontWeight: 700, mb: 1.5 }}>
              Past Collections
            </Typography>
            <Card
              elevation={0}
              sx={{ border: "1px solid", borderColor: "divider" }}
            >
              <List disablePadding>
                {pastAppts.map((appt, i) => (
                  <React.Fragment key={appt.id}>
                    <ListItem sx={{ px: 2.5, py: 1.5 }}>
                      <ListItemText
                        primary={
                          <Box
                            sx={{
                              display: "flex",
                              justifyContent: "space-between",
                              alignItems: "center",
                            }}
                          >
                            <Typography
                              variant="body2"
                              sx={{ fontWeight: 600 }}
                            >
                              {appt.branch?.name ?? appt.appointmentNumber}
                            </Typography>
                            <Chip
                              label={
                                STATUS_MAP[appt.status]?.label ?? "Completed"
                              }
                              color={
                                STATUS_MAP[appt.status]?.color ?? "success"
                              }
                              size="small"
                              sx={{ fontWeight: 600, fontSize: 11 }}
                            />
                          </Box>
                        }
                        secondary={
                          <Typography variant="caption" color="text.secondary">
                            {formatDate(
                              appt.appointmentSlot?.slotDate ?? appt.createdAt,
                            )}{" "}
                            · {appt.memberCount} member
                            {appt.memberCount !== 1 ? "s" : ""} · ₹
                            {appt.totalAmount.toLocaleString("en-IN")}
                          </Typography>
                        }
                      />
                    </ListItem>
                    {i < pastAppts.length - 1 && <Divider />}
                  </React.Fragment>
                ))}
              </List>
            </Card>
          </>
        )}
      </Box>
    </>
  );
}
