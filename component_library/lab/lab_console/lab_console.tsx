import React from "react";
import { useLabConsole } from "./useLabConsole";
import Typography from "@mui/material/Typography";
import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Chip from "@mui/material/Chip";
import Avatar from "@mui/material/Avatar";
import Divider from "@mui/material/Divider";
import LinearProgress from "@mui/material/LinearProgress";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";

// Icons
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import FileDownloadIcon from "@mui/icons-material/FileDownload";
import ScienceIcon from "@mui/icons-material/Science";
import BiotechIcon from "@mui/icons-material/Biotech";
import PendingActionsIcon from "@mui/icons-material/PendingActions";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import ErrorIcon from "@mui/icons-material/Error";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import FiberManualRecordIcon from "@mui/icons-material/FiberManualRecord";
import BuildIcon from "@mui/icons-material/Build";
import PrecisionManufacturingIcon from "@mui/icons-material/PrecisionManufacturing";

// ---------- Helpers ----------
const METRIC_CONFIG: Record<string, { icon: React.ReactNode; bg: string }> = {
  "SAMPLES TODAY": {
    icon: <ScienceIcon sx={{ color: "#1e40af" }} />,
    bg: "#dbeafe",
  },
  "TESTS COMPLETED": {
    icon: <BiotechIcon sx={{ color: "#0f766e" }} />,
    bg: "#ccfbf1",
  },
  "PENDING RESULTS": {
    icon: <PendingActionsIcon sx={{ color: "#475569" }} />,
    bg: "#f1f5f9",
  },
  "CRITICAL VALUES": {
    icon: <WarningAmberIcon sx={{ color: "#ef4444" }} />,
    bg: "#fee2e2",
  },
};

const STATUS_STYLE: Record<
  string,
  { color: string; bg: string; border: string }
> = {
  Completed: {
    color: "#10b981",
    bg: "#ecfdf5",
    border: "rgba(16,185,129,0.25)",
  },
  Processing: {
    color: "#3b82f6",
    bg: "#eff6ff",
    border: "rgba(59,130,246,0.25)",
  },
  Pending: { color: "#f59e0b", bg: "#fffbeb", border: "rgba(245,158,11,0.25)" },
  Rejected: { color: "#ef4444", bg: "#fef2f2", border: "rgba(239,68,68,0.25)" },
};

const PRIORITY_STYLE: Record<string, { color: string; bg: string }> = {
  Normal: { color: "#64748b", bg: "#f1f5f9" },
  Urgent: { color: "#d97706", bg: "#fef3c7" },
  Critical: { color: "#ef4444", bg: "#fee2e2" },
};

const STAFF_STATUS_COLOR: Record<string, string> = {
  Online: "#10b981",
  Busy: "#f59e0b",
  Offline: "#94a3b8",
};

const EQUIPMENT_STATUS: Record<string, { color: string; bg: string }> = {
  Operational: { color: "#10b981", bg: "#ecfdf5" },
  Maintenance: { color: "#f59e0b", bg: "#fffbeb" },
  Offline: { color: "#ef4444", bg: "#fef2f2" },
};

// ---------- Component ----------
export const LabConsole: React.FC = () => {
  const {
    user,
    metrics,
    filteredSamples,
    sampleFilter,
    setSampleFilter,
    sampleStatusCounts,
    staffOnDuty,
    equipment,
    equipmentOperational,
    tatTrends,
  } = useLabConsole();

  const renderTrendBadge = (metric: {
    trend: string;
    trendType: string;
    trendLabel: string;
  }) => {
    if (metric.trendType === "positive") {
      return (
        <Box
          sx={{
            display: "inline-flex",
            alignItems: "center",
            gap: 0.5,
            px: 1,
            py: 0.5,
            borderRadius: "12px",
            bgcolor: "#e6fdf5",
            color: "#10b981",
            fontSize: "11px",
            fontWeight: 700,
          }}
        >
          <ArrowUpwardIcon sx={{ fontSize: "12px", fontWeight: 900 }} />
          <span>{metric.trend}</span>
          <span
            style={{ color: "#64748b", fontWeight: 500, marginLeft: "2px" }}
          >
            {metric.trendLabel}
          </span>
        </Box>
      );
    }
    if (metric.trendType === "neutral") {
      return (
        <Box
          sx={{
            display: "inline-flex",
            alignItems: "center",
            gap: 0.5,
            px: 1,
            py: 0.5,
            borderRadius: "12px",
            bgcolor: "#f1f5f9",
            color: "#475569",
            fontSize: "11px",
            fontWeight: 700,
          }}
        >
          <AccessTimeIcon sx={{ fontSize: "12px" }} />
          <span>{metric.trend}</span>
        </Box>
      );
    }
    if (metric.trendType === "critical") {
      return (
        <Box
          sx={{
            display: "inline-flex",
            alignItems: "center",
            gap: 0.5,
            px: 1,
            py: 0.5,
            borderRadius: "12px",
            bgcolor: "#fee2e2",
            color: "#ef4444",
            fontSize: "11px",
            fontWeight: 700,
          }}
        >
          <ErrorIcon sx={{ fontSize: "12px" }} />
          <span>{metric.trend}</span>
        </Box>
      );
    }
    return null;
  };

  const maxTAT = Math.max(
    ...tatTrends.map((t) => Math.max(t.avgHours, t.targetHours)),
  );

  return (
    <Box sx={{ p: { xs: 1, md: 2 } }}>
      {/* Title and Action Bar */}
      <Box
        sx={{
          display: "flex",
          flexDirection: { xs: "column", sm: "row" },
          justifyContent: "space-between",
          alignItems: { xs: "flex-start", sm: "center" },
          gap: 2,
          mb: 4,
        }}
      >
        <div>
          <Typography
            variant="h5"
            sx={{ fontWeight: 800, mb: 0.5, letterSpacing: "-0.5px" }}
          >
            Lab Dashboard
          </Typography>
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ fontWeight: 500 }}
          >
            Welcome back, <strong>{user?.name || "Lab Staff"}</strong>.
            Here&apos;s your lab operations overview.
          </Typography>
        </div>

        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
          <Button
            id="lab-console-date-btn"
            variant="outlined"
            color="inherit"
            size="small"
            startIcon={<CalendarTodayIcon sx={{ fontSize: "16px" }} />}
            sx={{
              borderRadius: "8px",
              textTransform: "none",
              fontWeight: 600,
              px: 2,
              py: 0.8,
              borderColor: "var(--color-border)",
              color: "text.primary",
            }}
          >
            Today
          </Button>
          <Button
            id="lab-console-export-btn"
            variant="contained"
            size="small"
            startIcon={<FileDownloadIcon />}
            sx={{
              borderRadius: "8px",
              textTransform: "none",
              fontWeight: 700,
              px: 2.5,
              py: 0.9,
              boxShadow: "none",
              backgroundColor: "#00897b",
              "&:hover": {
                boxShadow: "none",
                backgroundColor: "#00695c",
              },
            }}
          >
            Export Report
          </Button>
        </Box>
      </Box>

      {/* 4 Metric Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {metrics.map((metric) => {
          const cfg = METRIC_CONFIG[metric.title] || {
            icon: <ScienceIcon />,
            bg: "#f1f5f9",
          };
          return (
            <Grid key={metric.id} size={{ xs: 12, sm: 6, md: 3 }}>
              <Card
                sx={{
                  border: "1px solid var(--color-divider)",
                  boxShadow: "none",
                  transition: "box-shadow 0.2s ease, transform 0.2s ease",
                  "&:hover": {
                    boxShadow: "0 4px 20px rgba(0,0,0,0.06)",
                    transform: "translateY(-2px)",
                  },
                }}
              >
                <CardContent
                  sx={{
                    p: 3,
                    display: "flex",
                    flexDirection: "column",
                    gap: 1.5,
                  }}
                >
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "flex-start",
                    }}
                  >
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      sx={{ fontWeight: 700, letterSpacing: "0.5px" }}
                    >
                      {metric.title}
                    </Typography>
                    <Avatar
                      variant="rounded"
                      sx={{
                        bgcolor: cfg.bg,
                        width: 34,
                        height: 34,
                        borderRadius: "8px",
                      }}
                    >
                      {cfg.icon}
                    </Avatar>
                  </Box>
                  <Typography variant="h4" sx={{ fontWeight: 800, mt: -1 }}>
                    {metric.value}
                  </Typography>
                  <div>{renderTrendBadge(metric)}</div>
                </CardContent>
              </Card>
            </Grid>
          );
        })}
      </Grid>

      {/* TAT Chart + Staff Panel */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {/* Turnaround Time Chart */}
        <Grid size={{ xs: 12, md: 8 }}>
          <Card
            sx={{
              height: "100%",
              border: "1px solid var(--color-divider)",
              boxShadow: "none",
            }}
          >
            <CardContent
              sx={{
                p: 4,
                display: "flex",
                flexDirection: "column",
                height: "100%",
              }}
            >
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  mb: 4,
                }}
              >
                <Typography variant="h6" sx={{ fontWeight: 700 }}>
                  Turnaround Time Trends
                </Typography>
                <Box sx={{ display: "flex", gap: 3 }}>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <Box
                      sx={{
                        width: 8,
                        height: 8,
                        borderRadius: "50%",
                        bgcolor: "#00897b",
                      }}
                    />
                    <Typography
                      variant="caption"
                      sx={{ fontWeight: 600 }}
                      color="text.secondary"
                    >
                      Avg TAT
                    </Typography>
                  </Box>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <Box
                      sx={{
                        width: 8,
                        height: 8,
                        borderRadius: "50%",
                        bgcolor: "#e2e8f0",
                      }}
                    />
                    <Typography
                      variant="caption"
                      sx={{ fontWeight: 600 }}
                      color="text.secondary"
                    >
                      Target (4h)
                    </Typography>
                  </Box>
                </Box>
              </Box>

              {/* Bar Chart */}
              <Box
                sx={{
                  flexGrow: 1,
                  display: "flex",
                  alignItems: "flex-end",
                  justifyContent: "space-between",
                  height: 260,
                  pt: 2,
                  pb: 1,
                  px: { xs: 1, sm: 3 },
                  borderBottom: "1px solid var(--color-divider)",
                }}
              >
                {tatTrends.map((day) => (
                  <Box
                    key={day.label}
                    sx={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      gap: 1.5,
                      width: "12%",
                      height: "100%",
                      justifyContent: "flex-end",
                    }}
                  >
                    <Box
                      sx={{
                        display: "flex",
                        gap: 0.8,
                        alignItems: "flex-end",
                        height: "80%",
                        width: "100%",
                        justifyContent: "center",
                      }}
                    >
                      {/* Target Bar */}
                      <Box
                        sx={{
                          width: 14,
                          height: `${(day.targetHours / maxTAT) * 100}%`,
                          bgcolor: "#e2e8f0",
                          borderTopLeftRadius: "4px",
                          borderTopRightRadius: "4px",
                          transition: "height 1s cubic-bezier(0.4, 0, 0.2, 1)",
                        }}
                      />
                      {/* Avg TAT Bar */}
                      <Box
                        sx={{
                          width: 14,
                          height: `${(day.avgHours / maxTAT) * 100}%`,
                          bgcolor:
                            day.avgHours > day.targetHours
                              ? "#ef4444"
                              : "#00897b",
                          borderTopLeftRadius: "4px",
                          borderTopRightRadius: "4px",
                          transition: "height 1s cubic-bezier(0.4, 0, 0.2, 1)",
                          "&:hover": {
                            filter: "brightness(1.15)",
                            transform: "scaleY(1.03)",
                          },
                        }}
                      />
                    </Box>
                    <Typography
                      variant="caption"
                      sx={{ fontWeight: 600, color: "text.secondary" }}
                    >
                      {day.label}
                    </Typography>
                  </Box>
                ))}
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Staff On Duty */}
        <Grid size={{ xs: 12, md: 4 }}>
          <Card
            sx={{
              border: "1px solid var(--color-divider)",
              boxShadow: "none",
              height: "100%",
            }}
          >
            <CardContent sx={{ p: 3 }}>
              <Typography
                variant="h6"
                sx={{
                  fontWeight: 800,
                  mb: 3,
                  display: "flex",
                  alignItems: "center",
                  gap: 1,
                }}
              >
                <span style={{ fontSize: "18px" }}>👥</span> Staff On Duty
              </Typography>
              <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                {staffOnDuty.map((staff) => (
                  <Box
                    key={staff.id}
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 2,
                      p: 1.5,
                      borderRadius: "10px",
                      border: "1px solid var(--color-divider)",
                      transition: "background-color 0.15s ease",
                      "&:hover": { bgcolor: "rgba(0,0,0,0.015)" },
                    }}
                  >
                    <Box sx={{ position: "relative" }}>
                      <Avatar
                        sx={{
                          bgcolor: "#00897b",
                          width: 36,
                          height: 36,
                          fontSize: "14px",
                          fontWeight: 700,
                        }}
                      >
                        {staff.avatar}
                      </Avatar>
                      <FiberManualRecordIcon
                        sx={{
                          position: "absolute",
                          bottom: -2,
                          right: -2,
                          fontSize: "14px",
                          color: STAFF_STATUS_COLOR[staff.status],
                          bgcolor: "var(--color-paper)",
                          borderRadius: "50%",
                        }}
                      />
                    </Box>
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Typography
                        variant="body2"
                        sx={{ fontWeight: 700, lineHeight: 1.3 }}
                      >
                        {staff.name}
                      </Typography>
                      <Typography
                        variant="caption"
                        color="text.secondary"
                        sx={{ fontWeight: 500 }}
                      >
                        {staff.role}
                      </Typography>
                    </Box>
                    <Chip
                      label={staff.status}
                      size="small"
                      sx={{
                        fontSize: "10px",
                        fontWeight: 700,
                        borderRadius: "6px",
                        color: STAFF_STATUS_COLOR[staff.status],
                        bgcolor:
                          staff.status === "Online"
                            ? "#ecfdf5"
                            : staff.status === "Busy"
                              ? "#fffbeb"
                              : "#f1f5f9",
                      }}
                    />
                  </Box>
                ))}
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Recent Samples Table */}
      <Card
        sx={{
          border: "1px solid var(--color-divider)",
          boxShadow: "none",
          mb: 4,
        }}
      >
        <CardContent sx={{ p: 3 }}>
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: { xs: "flex-start", sm: "center" },
              flexDirection: { xs: "column", sm: "row" },
              gap: 2,
              mb: 3,
            }}
          >
            <Typography variant="h6" sx={{ fontWeight: 800 }}>
              Recent Samples
            </Typography>
            <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
              {(
                [
                  "All",
                  "Pending",
                  "Processing",
                  "Completed",
                  "Rejected",
                ] as const
              ).map((f) => (
                <Chip
                  key={f}
                  label={
                    f === "All"
                      ? `All (${Object.values(sampleStatusCounts).reduce((a, b) => a + b, 0)})`
                      : `${f} (${sampleStatusCounts[f]})`
                  }
                  size="small"
                  variant={sampleFilter === f ? "filled" : "outlined"}
                  onClick={() => setSampleFilter(f)}
                  sx={{
                    fontWeight: 600,
                    fontSize: "11px",
                    borderRadius: "8px",
                    cursor: "pointer",
                    ...(sampleFilter === f
                      ? {
                          bgcolor: "#00897b",
                          color: "#fff",
                          "&:hover": { bgcolor: "#00695c" },
                        }
                      : {
                          borderColor: "var(--color-border)",
                          "&:hover": { bgcolor: "rgba(0,0,0,0.04)" },
                        }),
                  }}
                />
              ))}
            </Box>
          </Box>

          <TableContainer
            component={Paper}
            elevation={0}
            sx={{
              border: "1px solid var(--color-divider)",
              borderRadius: "10px",
            }}
          >
            <Table aria-label="recent samples table">
              <TableHead sx={{ bgcolor: "var(--color-background)" }}>
                <TableRow>
                  <TableCell sx={{ fontWeight: 700 }}>Sample ID</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Test Name</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Patient</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Collected</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Priority</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredSamples.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} align="center" sx={{ py: 6 }}>
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{ fontWeight: 500 }}
                      >
                        No samples match the current filter.
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredSamples.map((sample) => {
                    const ss = STATUS_STYLE[sample.status];
                    const ps = PRIORITY_STYLE[sample.priority];
                    return (
                      <TableRow
                        key={sample.id}
                        hover
                        sx={{
                          cursor: "pointer",
                          "&:last-child td": { borderBottom: 0 },
                        }}
                      >
                        <TableCell>
                          <Typography
                            variant="body2"
                            sx={{ fontWeight: 800, color: "#0f172a" }}
                          >
                            {sample.sampleId}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" sx={{ fontWeight: 500 }}>
                            {sample.testName}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" sx={{ fontWeight: 600 }}>
                            {sample.patientName}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography
                            variant="body2"
                            color="text.secondary"
                            sx={{ fontWeight: 500 }}
                          >
                            {sample.collectedAt}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={sample.priority}
                            size="small"
                            sx={{
                              fontSize: "10px",
                              fontWeight: 700,
                              borderRadius: "6px",
                              color: ps.color,
                              bgcolor: ps.bg,
                            }}
                          />
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={sample.status}
                            size="small"
                            variant="outlined"
                            sx={{
                              fontWeight: 700,
                              fontSize: "11px",
                              borderRadius: "6px",
                              color: ss.color,
                              borderColor: ss.border,
                              backgroundColor: ss.bg,
                              px: 0.5,
                            }}
                          />
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

      {/* Equipment Status */}
      <Card
        sx={{ border: "1px solid var(--color-divider)", boxShadow: "none" }}
      >
        <CardContent sx={{ p: 3 }}>
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              mb: 3,
            }}
          >
            <Box>
              <Typography
                variant="h6"
                sx={{
                  fontWeight: 800,
                  display: "flex",
                  alignItems: "center",
                  gap: 1,
                }}
              >
                <PrecisionManufacturingIcon
                  sx={{ fontSize: "20px", color: "#475569" }}
                />{" "}
                Equipment Status
              </Typography>
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{ fontWeight: 500 }}
              >
                {equipmentOperational}/{equipment.length} devices operational
              </Typography>
            </Box>
            <Button
              id="lab-console-maintenance-btn"
              variant="outlined"
              color="inherit"
              size="small"
              startIcon={<BuildIcon sx={{ fontSize: "14px" }} />}
              sx={{
                borderRadius: "8px",
                textTransform: "none",
                fontWeight: 600,
                borderColor: "var(--color-border)",
                color: "text.primary",
              }}
            >
              Schedule Maintenance
            </Button>
          </Box>

          <Grid container spacing={2}>
            {equipment.map((eq) => {
              const es = EQUIPMENT_STATUS[eq.status];
              return (
                <Grid key={eq.id} size={{ xs: 12, sm: 6, md: 3 }}>
                  <Box
                    sx={{
                      p: 2.5,
                      border: "1px solid var(--color-divider)",
                      borderRadius: "12px",
                      transition: "box-shadow 0.2s ease",
                      "&:hover": { boxShadow: "0 2px 12px rgba(0,0,0,0.05)" },
                    }}
                  >
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "flex-start",
                        mb: 2,
                      }}
                    >
                      <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Typography
                          variant="subtitle2"
                          sx={{ fontWeight: 800, mb: 0.3 }}
                        >
                          {eq.name}
                        </Typography>
                        <Typography
                          variant="caption"
                          color="text.secondary"
                          sx={{ fontWeight: 500 }}
                        >
                          {eq.type}
                        </Typography>
                      </Box>
                      <Chip
                        label={eq.status}
                        size="small"
                        sx={{
                          fontSize: "10px",
                          fontWeight: 700,
                          borderRadius: "6px",
                          color: es.color,
                          bgcolor: es.bg,
                          flexShrink: 0,
                        }}
                      />
                    </Box>

                    {eq.status === "Operational" && (
                      <Box sx={{ mb: 1.5 }}>
                        <Box
                          sx={{
                            display: "flex",
                            justifyContent: "space-between",
                            mb: 0.5,
                          }}
                        >
                          <Typography
                            variant="caption"
                            color="text.secondary"
                            sx={{ fontWeight: 600 }}
                          >
                            Utilization
                          </Typography>
                          <Typography
                            variant="caption"
                            sx={{ fontWeight: 700, color: "#0f172a" }}
                          >
                            {eq.utilization}%
                          </Typography>
                        </Box>
                        <LinearProgress
                          variant="determinate"
                          value={eq.utilization}
                          sx={{
                            height: 6,
                            borderRadius: 3,
                            bgcolor: "#e2e8f0",
                            "& .MuiLinearProgress-bar": {
                              borderRadius: 3,
                              bgcolor:
                                eq.utilization > 80
                                  ? "#ef4444"
                                  : eq.utilization > 60
                                    ? "#f59e0b"
                                    : "#10b981",
                            },
                          }}
                        />
                      </Box>
                    )}

                    <Divider
                      sx={{ my: 1.5, borderColor: "var(--color-divider)" }}
                    />
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      sx={{ fontWeight: 500 }}
                    >
                      Last calibrated: {eq.lastCalibrated}
                    </Typography>
                  </Box>
                </Grid>
              );
            })}
          </Grid>
        </CardContent>
      </Card>
    </Box>
  );
};

export default LabConsole;
