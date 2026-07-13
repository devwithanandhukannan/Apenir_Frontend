import React from "react";
import Head from "next/head";
import { useAppSelector } from "@/core_components/store/hooks";
import {
  getDashboardMetrics,
  getVolumeTrends,
  getCriticalFeed,
} from "@/core_components/services/mockDataService";
import Typography from "@mui/material/Typography";
import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Chip from "@mui/material/Chip";
import Avatar from "@mui/material/Avatar";
import Divider from "@mui/material/Divider";

// Icon imports
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import FileDownloadIcon from "@mui/icons-material/FileDownload";
import ScienceIcon from "@mui/icons-material/Science";
import PaidIcon from "@mui/icons-material/Paid";
import DescriptionIcon from "@mui/icons-material/Description";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import ErrorIcon from "@mui/icons-material/Error";

export default function AdminDashboard() {
  const { user } = useAppSelector((state) => state.auth);

  // Consuming data from core/services/mockDataService
  const metrics = getDashboardMetrics();
  const trends = getVolumeTrends();
  const feedItems = getCriticalFeed();

  // Helper to resolve metric icons
  const getMetricIcon = (title: string) => {
    switch (title) {
      case "TOTAL SAMPLES":
        return <ScienceIcon sx={{ color: "#059669" }} />;
      case "DAILY REVENUE":
        return <PaidIcon sx={{ color: "#10b981" }} />;
      case "PENDING REPORTS":
        return <DescriptionIcon sx={{ color: "#475569" }} />;
      case "CRITICAL ALERTS":
        return <WarningAmberIcon sx={{ color: "#ef4444" }} />;
      default:
        return <ScienceIcon />;
    }
  };

  // Helper to resolve metric icon backgrounds
  const getMetricIconBg = (title: string) => {
    switch (title) {
      case "TOTAL SAMPLES":
        return "rgba(5, 150, 105, 0.08)"; // light blue
      case "DAILY REVENUE":
        return "rgba(16, 185, 129, 0.08)"; // light teal
      case "PENDING REPORTS":
        return "#f1f5f9"; // light slate
      case "CRITICAL ALERTS":
        return "#fee2e2"; // light red
      default:
        return "#f1f5f9";
    }
  };

  // Helper to resolve trend badges
  const renderTrendBadge = (metric: any) => {
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

  return (
    <>
      <Head>
        <title>OmniLab MS - Executive Overview</title>
        <meta
          name="description"
          content="Network-wide laboratory performance metrics."
        />
      </Head>

      <Box sx={{ p: { xs: 1, md: 2 } }}>
        {/* Title and Top Action Bar */}
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
              Executive Overview
            </Typography>
            <Typography
              variant="body2"
              color="text.secondary"
              className="text-text-secondary font-medium"
            >
              Network-wide laboratory performance metrics.
            </Typography>
          </div>

          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
            <Button
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
              variant="contained"
              color="primary"
              size="small"
              startIcon={<FileDownloadIcon />}
              sx={{
                borderRadius: "8px",
                textTransform: "none",
                fontWeight: 700,
                px: 2.5,
                py: 0.9,
                boxShadow: "none",
                backgroundColor: "var(--color-primary)",
                "&:hover": {
                  boxShadow: "none",
                  backgroundColor: "primary.dark",
                },
              }}
            >
              Export Report
            </Button>
          </Box>
        </Box>

        {/* 4 Metric Cards Row */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          {metrics.map((metric) => (
            <Grid key={metric.title} size={{ xs: 12, sm: 6, md: 3 }}>
              <Card
                sx={{
                  border: "1px solid var(--color-divider)",
                  boxShadow: "none",
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
                        bgcolor: getMetricIconBg(metric.title),
                        width: 34,
                        height: 34,
                        borderRadius: "8px",
                      }}
                    >
                      {getMetricIcon(metric.title)}
                    </Avatar>
                  </Box>

                  <Typography variant="h4" sx={{ fontWeight: 800, mt: -1 }}>
                    {metric.value}
                  </Typography>

                  <div>{renderTrendBadge(metric)}</div>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>

        {/* Test Volume Trends & Critical Feed Split */}
        <Grid container spacing={3}>
          {/* Left Column: Chart */}
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
                    Test Volume Trends
                  </Typography>
                  <Box sx={{ display: "flex", gap: 3 }}>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <Box
                        sx={{
                          width: 8,
                          height: 8,
                          borderRadius: "50%",
                          bgcolor: "var(--color-primary)",
                        }}
                      />
                      <Typography
                        variant="caption"
                        sx={{ fontWeight: 600 }}
                        color="text.secondary"
                      >
                        PCR
                      </Typography>
                    </Box>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <Box
                        sx={{
                          width: 8,
                          height: 8,
                          borderRadius: "50%",
                          bgcolor: "var(--color-secondary)",
                        }}
                      />
                      <Typography
                        variant="caption"
                        sx={{ fontWeight: 600 }}
                        color="text.secondary"
                      >
                        Serology
                      </Typography>
                    </Box>
                  </Box>
                </Box>

                {/* Animated Bar Chart Container */}
                <Box
                  sx={{
                    flexGrow: 1,
                    display: "flex",
                    alignItems: "flex-end",
                    justifyContent: "space-between",
                    height: 290,
                    pt: 2,
                    pb: 1,
                    px: { xs: 1, sm: 3 },
                    borderBottom: "1px solid var(--color-divider)",
                  }}
                >
                  {trends.map((day) => (
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
                      {/* Side by side bars */}
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
                        {/* PCR Bar */}
                        <Box
                          sx={{
                            width: 14,
                            height: `${day.pcr}%`,
                            bgcolor: "var(--color-primary)",
                            borderTopLeftRadius: "4px",
                            borderTopRightRadius: "4px",
                            transition:
                              "height 1s cubic-bezier(0.4, 0, 0.2, 1)",
                            "&:hover": {
                              filter: "brightness(1.15)",
                              transform: "scaleY(1.03)",
                            },
                          }}
                        />
                        {/* Serology Bar */}
                        <Box
                          sx={{
                            width: 14,
                            height: `${day.serology}%`,
                            bgcolor: "var(--color-secondary)",
                            borderTopLeftRadius: "4px",
                            borderTopRightRadius: "4px",
                            transition:
                              "height 1s cubic-bezier(0.4, 0, 0.2, 1)",
                            "&:hover": {
                              filter: "brightness(1.15)",
                              transform: "scaleY(1.03)",
                            },
                          }}
                        />
                      </Box>
                      {/* Day Label */}
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

          {/* Right Column: Critical Feed */}
          <Grid size={{ xs: 12, md: 4 }}>
            <Card
              sx={{
                border: "1px solid var(--color-divider)",
                boxShadow: "none",
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
                    gap: 0.8,
                  }}
                >
                  <span
                    style={{
                      color: "#ef4444",
                      fontSize: "20px",
                      lineHeight: 1,
                    }}
                  >
                    ★
                  </span>{" "}
                  Critical Feed
                </Typography>

                {/* Feed Lists */}
                <Box
                  sx={{
                    display: "flex",
                    flexDirection: "column",
                    gap: 2,
                    mb: 3,
                  }}
                >
                  {feedItems.map((item) => (
                    <Box
                      key={item.id}
                      sx={{
                        p: 2,
                        border: "1px solid var(--color-divider)",
                        borderRadius: "12px",
                        backgroundColor:
                          item.type === "critical"
                            ? "rgba(239, 68, 68, 0.02)"
                            : "transparent",
                        borderColor:
                          item.type === "critical"
                            ? "rgba(239, 68, 68, 0.15)"
                            : "var(--color-divider)",
                      }}
                    >
                      <Box
                        sx={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          mb: 1.5,
                        }}
                      >
                        <Chip
                          label={item.typeLabel}
                          size="small"
                          sx={{
                            fontSize: "11px",
                            fontWeight: 700,
                            borderRadius: "6px",
                            bgcolor:
                              item.type === "critical"
                                ? "#fee2e2"
                                : item.type === "equipment"
                                  ? "#e0f2fe"
                                  : "#fef3c7",
                            color:
                              item.type === "critical"
                                ? "#ef4444"
                                : item.type === "equipment"
                                  ? "#0284c7"
                                  : "#d97706",
                          }}
                        />
                        <Typography
                          variant="caption"
                          color="text.secondary"
                          sx={{ fontWeight: 500 }}
                        >
                          {item.time}
                        </Typography>
                      </Box>

                      <Typography
                        variant="subtitle2"
                        sx={{ fontWeight: 800, mb: 0.5 }}
                      >
                        {item.title}
                      </Typography>
                      <Typography
                        variant="caption"
                        color="text.secondary"
                        sx={{ display: "block", lineHeight: 1.4 }}
                      >
                        {item.description}
                      </Typography>
                    </Box>
                  ))}
                </Box>

                {/* View All Button */}
                <Button
                  variant="outlined"
                  color="inherit"
                  fullWidth
                  onClick={() => alert("MOCK: View All Alerts Panel")}
                  sx={{
                    py: 1,
                    borderRadius: "8px",
                    textTransform: "none",
                    fontWeight: 700,
                    borderColor: "var(--color-border)",
                    color: "text.primary",
                  }}
                >
                  View All Alerts
                </Button>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>
    </>
  );
}
