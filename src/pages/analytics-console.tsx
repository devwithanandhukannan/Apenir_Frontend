import React, { useEffect, useState, useCallback, useMemo } from "react";
import Head from "next/head";
import { useRouter } from "next/router";
import axios from "axios";
import { useAppSelector } from "@/core_components/store/hooks";
import { useApi } from "@/core_components/hooks/useApi/useApi";
import { useAbortController } from "@/core_components/hooks/useAbortController/useAbortController";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import TextField from "@mui/material/TextField";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import Button from "@mui/material/Button";
import CircularProgress from "@mui/material/CircularProgress";
import Stack from "@mui/material/Stack";
import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import PieChartIcon from "@mui/icons-material/PieChart";

const ANALYTICS_KEYS = [
  "FETCH_ALL_PAYOUTS_REQUEST",
  "FETCH_LABS_REQUEST",
] as const;

export default function AnalyticsConsolePage() {
  const { user, isAuthenticated, isInitialized } = useAppSelector(
    (state) => state.auth,
  );
  const router = useRouter();
  const { get, post } = useApi();
  const { controllers } = useAbortController(ANALYTICS_KEYS);

  // Labs list
  const [labs, setLabs] = useState<any[]>([]);

  // Payouts state
  const [allPayouts, setAllPayouts] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  // Filters
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [branchId, setBranchId] = useState("all");
  const [quickFilter, setQuickFilter] = useState("everything");

  // Auth Guard
  useEffect(() => {
    if (isInitialized && (!isAuthenticated || user?.role !== "admin")) {
      router.replace("/admin/login");
    }
  }, [isAuthenticated, user, isInitialized, router]);

  // Load labs list on mount
  useEffect(() => {
    const fetchLabs = async () => {
      controllers.FETCH_LABS_REQUEST.reset();
      const signal = controllers.FETCH_LABS_REQUEST.signal;

      try {
        const response = await post<any, any>({
          endpoint: "/api/admin/labs",
          body: {},
          requireAuth: true,
          signal,
        });

        if (
          signal.aborted ||
          (response.error &&
            (response.error.name === "CanceledError" ||
              response.error.message === "canceled" ||
              axios.isCancel(response.error)))
        ) {
          return;
        }

        if (response.success && response.data?.success && response.data?.data) {
          setLabs(response.data.data);
        }
      } catch (error: any) {
        if (
          signal.aborted ||
          error?.name === "CanceledError" ||
          error?.message === "canceled" ||
          axios.isCancel(error)
        ) {
          return;
        }
      }
    };
    if (isAuthenticated && user?.role === "admin") {
      fetchLabs();
    }
  }, [post, isAuthenticated, user, controllers]);

  const fetchAllPayouts = useCallback(async () => {
    setLoading(true);
    controllers.FETCH_ALL_PAYOUTS_REQUEST.reset();
    const signal = controllers.FETCH_ALL_PAYOUTS_REQUEST.signal;

    const queryParams = new URLSearchParams();
    if (startDate) queryParams.append("startDate", startDate);
    if (endDate) queryParams.append("endDate", endDate);
    if (branchId && branchId !== "all")
      queryParams.append("branchId", branchId);

    try {
      const response = await get<any>({
        endpoint: `/api/admin/batch-payments/all-payouts?${queryParams.toString()}`,
        requireAuth: true,
        signal,
      });

      if (
        signal.aborted ||
        (response.error &&
          (response.error.name === "CanceledError" ||
            response.error.message === "canceled" ||
            axios.isCancel(response.error)))
      ) {
        return;
      }

      if (response.success && response.data?.success && response.data?.data) {
        setAllPayouts(response.data.data);
      } else {
        setAllPayouts([]);
      }
      setLoading(false);
    } catch (error: any) {
      if (
        signal.aborted ||
        error?.name === "CanceledError" ||
        error?.message === "canceled" ||
        axios.isCancel(error)
      ) {
        return;
      }
      setAllPayouts([]);
      setLoading(false);
    }
  }, [get, startDate, endDate, branchId, controllers]);

  useEffect(() => {
    if (isAuthenticated && user?.role === "admin") {
      fetchAllPayouts();
    }
  }, [isAuthenticated, user, fetchAllPayouts]);

  // Quick preset dates setter
  const setQuickDates = (
    type:
      | "today"
      | "yesterday"
      | "this-week"
      | "last-week"
      | "this-month"
      | "everything",
  ) => {
    const today = new Date();
    const formatDate = (date: Date) => date.toISOString().split("T")[0];
    setQuickFilter(type);

    switch (type) {
      case "today":
        setStartDate(formatDate(today));
        setEndDate(formatDate(today));
        break;
      case "yesterday":
        const yesterday = new Date(today);
        yesterday.setDate(today.getDate() - 1);
        setStartDate(formatDate(yesterday));
        setEndDate(formatDate(yesterday));
        break;
      case "this-week": {
        const currentDay = today.getDay();
        const distanceToMonday = currentDay === 0 ? 6 : currentDay - 1;
        const monday = new Date(today);
        monday.setDate(today.getDate() - distanceToMonday);
        setStartDate(formatDate(monday));
        setEndDate(formatDate(today));
        break;
      }
      case "last-week": {
        const currentDay = today.getDay();
        const distanceToMonday = currentDay === 0 ? 6 : currentDay - 1;
        const lastMonday = new Date(today);
        lastMonday.setDate(today.getDate() - distanceToMonday - 7);
        const lastSunday = new Date(lastMonday);
        lastSunday.setDate(lastMonday.getDate() + 6);
        setStartDate(formatDate(lastMonday));
        setEndDate(formatDate(lastSunday));
        break;
      }
      case "this-month":
        const firstDayMonth = new Date(
          today.getFullYear(),
          today.getMonth(),
          1,
        );
        setStartDate(formatDate(firstDayMonth));
        setEndDate(formatDate(today));
        break;
      case "everything":
      default:
        setStartDate("");
        setEndDate("");
        break;
    }
  };

  // Aggregated Stats
  const stats = useMemo(() => {
    const totalBookings = allPayouts.length;
    const grossRevenue = allPayouts.reduce((acc, p) => acc + p.totalAmount, 0);
    const platformProfit = allPayouts.reduce(
      (acc, p) => acc + p.platformCommission,
      0,
    );
    const netOwed = allPayouts.reduce((acc, p) => acc + p.labPayout, 0);
    const averageCommissionRate =
      grossRevenue > 0 ? (platformProfit / grossRevenue) * 100 : 15.0;

    return {
      totalBookings,
      grossRevenue,
      platformProfit,
      netOwed,
      averageCommissionRate,
    };
  }, [allPayouts]);

  // Branch summaries mapping
  const branchSummaries = useMemo(() => {
    const summaryMap: Record<
      string,
      {
        name: string;
        gross: number;
        profit: number;
        net: number;
        count: number;
      }
    > = {};

    allPayouts.forEach((p) => {
      const key = p.branchId || "unknown";
      if (!summaryMap[key]) {
        summaryMap[key] = {
          name: p.branchName || "Unknown Lab",
          gross: 0,
          profit: 0,
          net: 0,
          count: 0,
        };
      }
      summaryMap[key].gross += p.totalAmount;
      summaryMap[key].profit += p.platformCommission;
      summaryMap[key].net += p.labPayout;
      summaryMap[key].count += 1;
    });

    return Object.values(summaryMap).sort((a, b) => b.gross - a.gross);
  }, [allPayouts]);

  // Status distributions mapping
  const statusStats = useMemo(() => {
    const statusCounts: Record<string, number> = {
      Unbatched: 0,
      Initiated: 0,
      Paid: 0,
      Settled: 0,
      Abandoned: 0,
    };
    allPayouts.forEach((p) => {
      const status = p.batchStatus || "Unbatched";
      if (statusCounts[status] !== undefined) {
        statusCounts[status]++;
      } else {
        statusCounts["Unbatched"]++;
      }
    });
    return Object.entries(statusCounts).map(([label, count]) => ({
      label,
      count,
    }));
  }, [allPayouts]);

  if (!isInitialized || !isAuthenticated || user?.role !== "admin") {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
        <CircularProgress color="secondary" />
      </Box>
    );
  }

  return (
    <>
      <Head>
        <title>OmniLab MS - Admin Analytics</title>
        <meta
          name="description"
          content="Interact with network margins, margins distributions, and volume trends."
        />
      </Head>

      <Box sx={{ p: { xs: 2, md: 4 } }}>
        {/* Page Title */}
        <Box sx={{ mb: 4 }}>
          <Typography
            variant="h4"
            sx={{ fontWeight: 900, mb: 1, letterSpacing: "-1.0px" }}
          >
            Analytics Console
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Visual metrics mapping financial margins, branch comparative trends,
            and volume levels.
          </Typography>
        </Box>

        {/* Filters Panel */}
        <Card
          sx={{
            mb: 4,
            border: "1px solid var(--color-border)",
            borderRadius: "16px",
          }}
        >
          <CardContent sx={{ p: 3 }}>
            <Grid container spacing={3} sx={{ alignItems: "center" }}>
              <Grid size={{ xs: 12, md: 3 }}>
                <FormControl size="small" fullWidth>
                  <InputLabel id="analytics-lab-label">
                    Branch Select
                  </InputLabel>
                  <Select
                    labelId="analytics-lab-label"
                    value={branchId}
                    label="Branch Select"
                    onChange={(e: any) => setBranchId(e.target.value as string)}
                  >
                    <MenuItem value="all">All Laboratory Branches</MenuItem>
                    {labs.map((lab) => (
                      <MenuItem key={lab.id} value={lab.id}>
                        {lab.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              <Grid size={{ xs: 12, md: 2.5 }}>
                <TextField
                  label="Start Date"
                  type="date"
                  size="small"
                  slotProps={{ inputLabel: { shrink: true } }}
                  fullWidth
                  value={startDate}
                  onChange={(e) => {
                    setStartDate(e.target.value);
                    setQuickFilter("custom");
                  }}
                />
              </Grid>

              <Grid size={{ xs: 12, md: 2.5 }}>
                <TextField
                  label="End Date"
                  type="date"
                  size="small"
                  slotProps={{ inputLabel: { shrink: true } }}
                  fullWidth
                  value={endDate}
                  onChange={(e) => {
                    setEndDate(e.target.value);
                    setQuickFilter("custom");
                  }}
                />
              </Grid>

              <Grid size={{ xs: 12, md: 4 }}>
                <Stack
                  direction="row"
                  spacing={1}
                  useFlexGap
                  sx={{ flexWrap: "wrap" }}
                >
                  {[
                    { label: "Today", value: "today" },
                    { label: "Yesterday", value: "yesterday" },
                    { label: "This Week", value: "this-week" },
                    { label: "This Month", value: "this-month" },
                    { label: "Everything", value: "everything" },
                  ].map((preset) => (
                    <Button
                      key={preset.value}
                      variant={
                        quickFilter === preset.value ? "contained" : "outlined"
                      }
                      color="inherit"
                      size="small"
                      sx={{
                        textTransform: "none",
                        fontWeight: 600,
                        fontSize: "11px",
                      }}
                      onClick={() => setQuickDates(preset.value as any)}
                    >
                      {preset.label}
                    </Button>
                  ))}
                </Stack>
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        {loading ? (
          <Box sx={{ display: "flex", justifyContent: "center", py: 10 }}>
            <CircularProgress color="secondary" />
          </Box>
        ) : (
          <>
            {/* KPI Metrics Cards */}
            <Grid container spacing={3} sx={{ mb: 4 }}>
              {[
                {
                  title: "Gross Network Revenue",
                  value: `₹${stats.grossRevenue.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
                  trend: "+12.4% vs last period",
                  color: "#0284c7",
                },
                {
                  title: "Platform Commissions Profit",
                  value: `₹${stats.platformProfit.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
                  trend: `${stats.averageCommissionRate.toFixed(1)}% average rate`,
                  color: "#10b981",
                },
                {
                  title: "Net Labs Payouts",
                  value: `₹${stats.netOwed.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
                  trend: "Awaiting settlement batch",
                  color: "#f59e0b",
                },
                {
                  title: "Total Bookings Processed",
                  value: stats.totalBookings,
                  trend: "Completed checkouts count",
                  color: "#6366f1",
                },
              ].map((card, index) => (
                <Grid size={{ xs: 12, sm: 6, md: 3 }} key={index}>
                  <Card
                    sx={{
                      border: "1px solid var(--color-border)",
                      borderRadius: "16px",
                    }}
                  >
                    <CardContent sx={{ p: 3 }}>
                      <Typography
                        variant="caption"
                        color="text.secondary"
                        sx={{
                          fontWeight: 700,
                          textTransform: "uppercase",
                          letterSpacing: "0.5px",
                        }}
                      >
                        {card.title}
                      </Typography>
                      <Typography
                        variant="h4"
                        sx={{
                          fontWeight: 900,
                          mt: 1,
                          mb: 1,
                          color: card.color,
                        }}
                      >
                        {card.value}
                      </Typography>
                      <Box
                        sx={{ display: "flex", alignItems: "center", gap: 0.5 }}
                      >
                        <ArrowUpwardIcon
                          sx={{ fontSize: "14px", color: "success.main" }}
                        />
                        <Typography
                          variant="caption"
                          color="text.secondary"
                          sx={{ fontWeight: 600 }}
                        >
                          {card.trend}
                        </Typography>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>

            {/* Split Visual Section */}
            <Grid container spacing={4}>
              {/* Left Column: Branch Margin Contribution Chart */}
              <Grid size={{ xs: 12, md: 7 }}>
                <Card
                  sx={{
                    border: "1px solid var(--color-border)",
                    borderRadius: "16px",
                    height: "100%",
                  }}
                >
                  <CardContent sx={{ p: 4 }}>
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
                      <TrendingUpIcon color="secondary" />
                      Branch Margin Contributions
                    </Typography>

                    {branchSummaries.length > 0 ? (
                      <Stack spacing={3.5}>
                        {branchSummaries.map((branch, index) => {
                          const maxGross = Math.max(
                            ...branchSummaries.map((b) => b.gross),
                            1,
                          );
                          const pct = (branch.gross / maxGross) * 100;
                          return (
                            <Box key={index}>
                              <Box
                                sx={{
                                  display: "flex",
                                  justifyContent: "space-between",
                                  mb: 0.8,
                                }}
                              >
                                <Typography
                                  variant="body2"
                                  sx={{ fontWeight: 700 }}
                                >
                                  {branch.name} ({branch.count} bookings)
                                </Typography>
                                <Typography
                                  variant="body2"
                                  sx={{ fontWeight: 800 }}
                                >
                                  ₹{branch.gross.toLocaleString("en-IN")}
                                </Typography>
                              </Box>
                              <Box
                                sx={{
                                  width: "100%",
                                  height: "8px",
                                  bgcolor: "rgba(0,0,0,0.04)",
                                  borderRadius: "4px",
                                  overflow: "hidden",
                                  mb: 0.8,
                                }}
                              >
                                <Box
                                  sx={{
                                    width: `${pct}%`,
                                    height: "100%",
                                    bgcolor: "secondary.main",
                                    borderRadius: "4px",
                                  }}
                                />
                              </Box>
                              <Box
                                sx={{
                                  display: "flex",
                                  justifyContent: "space-between",
                                }}
                              >
                                <Typography
                                  variant="caption"
                                  color="text.secondary"
                                  sx={{ fontWeight: 600 }}
                                >
                                  Owed Lab Payout: ₹
                                  {branch.net.toLocaleString("en-IN")}
                                </Typography>
                                <Typography
                                  variant="caption"
                                  color="success.main"
                                  sx={{ fontWeight: 700 }}
                                >
                                  Platform Commission: ₹
                                  {branch.profit.toLocaleString("en-IN")}
                                </Typography>
                              </Box>
                            </Box>
                          );
                        })}
                      </Stack>
                    ) : (
                      <Box
                        sx={{
                          py: 6,
                          textAlign: "center",
                          border: "1px dashed var(--color-border)",
                          borderRadius: "12px",
                        }}
                      >
                        <Typography color="text.secondary">
                          No branch performance metrics found.
                        </Typography>
                      </Box>
                    )}
                  </CardContent>
                </Card>
              </Grid>

              {/* Right Column: Payout Status Split */}
              <Grid size={{ xs: 12, md: 5 }}>
                <Card
                  sx={{
                    border: "1px solid var(--color-border)",
                    borderRadius: "16px",
                    height: "100%",
                  }}
                >
                  <CardContent sx={{ p: 4 }}>
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
                      <PieChartIcon color="primary" />
                      Payout Status Distribution
                    </Typography>

                    {allPayouts.length > 0 ? (
                      <Stack spacing={2.5}>
                        {statusStats.map((item, index) => {
                          const total = allPayouts.length;
                          const pct =
                            total > 0 ? (item.count / total) * 100 : 0;
                          return (
                            <Box key={index}>
                              <Box
                                sx={{
                                  display: "flex",
                                  justifyContent: "space-between",
                                  mb: 0.5,
                                }}
                              >
                                <Typography
                                  variant="body2"
                                  sx={{ fontWeight: 700 }}
                                >
                                  {item.label}
                                </Typography>
                                <Typography
                                  variant="body2"
                                  sx={{ fontWeight: 800 }}
                                >
                                  {item.count} items ({pct.toFixed(1)}%)
                                </Typography>
                              </Box>
                              <Box
                                sx={{
                                  width: "100%",
                                  height: "6px",
                                  bgcolor: "rgba(0,0,0,0.04)",
                                  borderRadius: "3px",
                                  overflow: "hidden",
                                }}
                              >
                                <Box
                                  sx={{
                                    width: `${pct}%`,
                                    height: "100%",
                                    bgcolor:
                                      item.label === "Settled"
                                        ? "success.main"
                                        : item.label === "Paid"
                                          ? "warning.main"
                                          : item.label === "Initiated"
                                            ? "primary.main"
                                            : item.label === "Abandoned"
                                              ? "error.main"
                                              : "#cbd5e1",
                                    borderRadius: "3px",
                                  }}
                                />
                              </Box>
                            </Box>
                          );
                        })}
                      </Stack>
                    ) : (
                      <Box
                        sx={{
                          py: 6,
                          textAlign: "center",
                          border: "1px dashed var(--color-border)",
                          borderRadius: "12px",
                        }}
                      >
                        <Typography color="text.secondary">
                          No status metrics mapping found.
                        </Typography>
                      </Box>
                    )}
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </>
        )}
      </Box>
    </>
  );
}
