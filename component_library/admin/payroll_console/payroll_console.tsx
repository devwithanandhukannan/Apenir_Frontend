import React, { useState, useEffect, useCallback } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import TextField from "@mui/material/TextField";
import MenuItem from "@mui/material/MenuItem";
import Select from "@mui/material/Select";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Checkbox from "@mui/material/Checkbox";
import Paper from "@mui/material/Paper";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import Chip from "@mui/material/Chip";
import Alert from "@mui/material/Alert";
import CircularProgress from "@mui/material/CircularProgress";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import Stack from "@mui/material/Stack";
import Divider from "@mui/material/Divider";
import PaidIcon from "@mui/icons-material/Paid";
import HistoryIcon from "@mui/icons-material/History";
import DateRangeIcon from "@mui/icons-material/DateRange";
import toast, { Toaster } from "react-hot-toast";
import { useApi } from "@/core_components/hooks/useApi/useApi";

export const PayrollConsole: React.FC = () => {
  const { get, post, delete: del } = useApi();

  // Navigation Tabs
  const [activeTab, setActiveTab] = useState(0);

  // Labs list
  const [labs, setLabs] = useState<any[]>([]);
  const [selectedLabId, setSelectedLabId] = useState("");

  // Filters state
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  // Payouts state
  const [payouts, setPayouts] = useState<any[]>([]);
  const [selectedPayoutIds, setSelectedPayoutIds] = useState<string[]>([]);
  const [loadingPayouts, setLoadingPayouts] = useState(false);

  // Batches state
  const [batches, setBatches] = useState<any[]>([]);
  const [loadingBatches, setLoadingBatches] = useState(false);

  // Detail dialog
  const [selectedBatch, setSelectedBatch] = useState<any>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [loadingDetail, setLoadingDetail] = useState(false);

  // Load labs list on mount
  useEffect(() => {
    const fetchLabs = async () => {
      const response = await post<any, any>({
        endpoint: "/api/admin/labs",
        body: {},
        requireAuth: true,
      });
      if (response.success && response.data?.success && response.data?.data) {
        setLabs(response.data.data);
      }
    };
    fetchLabs();
  }, [post]);

  const fetchBatches = useCallback(async () => {
    setLoadingBatches(true);
    const response = await post<any, any>({
      endpoint: "/api/admin/batch-payments/list",
      body: {},
      requireAuth: true,
    });
    setLoadingBatches(false);
    if (response.success && response.data?.success && response.data?.data) {
      setBatches(response.data.data);
    }
  }, [post]);

  // Fetch batches when switching tabs
  useEffect(() => {
    if (activeTab === 1) {
      fetchBatches();
    }
  }, [activeTab, fetchBatches]);

  // Helper date setter functions
  const setQuickDates = (
    type: "today" | "yesterday" | "this-month" | "last-month",
  ) => {
    const today = new Date();
    const formatDate = (date: Date) => date.toISOString().split("T")[0];

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
      case "this-month":
        const firstDayMonth = new Date(
          today.getFullYear(),
          today.getMonth(),
          1,
        );
        setStartDate(formatDate(firstDayMonth));
        setEndDate(formatDate(today));
        break;
      case "last-month":
        const firstDayLast = new Date(
          today.getFullYear(),
          today.getMonth() - 1,
          1,
        );
        const lastDayLast = new Date(today.getFullYear(), today.getMonth(), 0);
        setStartDate(formatDate(firstDayLast));
        setEndDate(formatDate(lastDayLast));
        break;
    }
  };

  const handleRetrievePayouts = async () => {
    if (!selectedLabId) {
      toast.error("Please select a lab branch.");
      return;
    }
    setLoadingPayouts(true);
    setPayouts([]);
    setSelectedPayoutIds([]);

    const queryParams = new URLSearchParams();
    if (startDate) queryParams.append("startDate", startDate);
    if (endDate) queryParams.append("endDate", endDate);

    const response = await get<any>({
      endpoint: `/api/admin/batch-payments/labs/${selectedLabId}/unbatched-payments?${queryParams.toString()}`,
      requireAuth: true,
    });
    setLoadingPayouts(false);

    if (response.success && response.data?.success && response.data?.data) {
      setPayouts(response.data.data);
      if (response.data.data.length === 0) {
        toast.success("No unbatched payouts found for the selected criteria.");
      }
    } else {
      toast.error(response.data?.message || "Failed to retrieve payouts.");
    }
  };

  // Calculations for selected payouts
  const selectedPayoutsDetails = () => {
    const selected = payouts.filter((p) => selectedPayoutIds.includes(p.id));
    const gross = selected.reduce((acc, p) => acc + p.totalAmount, 0);
    const comm = selected.reduce((acc, p) => acc + p.platformCommission, 0);
    const net = selected.reduce((acc, p) => acc + p.labPayout, 0);
    return { gross, comm, net };
  };

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedPayoutIds(payouts.map((p) => p.id));
    } else {
      setSelectedPayoutIds([]);
    }
  };

  const handleToggleSelect = (id: string) => {
    setSelectedPayoutIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  };

  const handleCreateAndPay = async () => {
    if (selectedPayoutIds.length === 0) {
      toast.error("Please select at least one payout.");
      return;
    }

    // 1. Create the Batch
    const createRes = await post<any, any>({
      endpoint: "/api/admin/batch-payments",
      body: {
        branchId: selectedLabId,
        paymentIds: selectedPayoutIds,
      },
      requireAuth: true,
    });

    if (createRes.success && createRes.data?.success && createRes.data?.data) {
      const batchId = createRes.data.data.id;

      // 2. Mark Batch as Paid instantly
      const payRes = await post<any, any>({
        endpoint: `/api/admin/batch-payments/${batchId}/pay`,
        body: {},
        requireAuth: true,
      });

      if (payRes.success && payRes.data?.success) {
        toast.success(
          "Payment batch created and processed to Paid successfully!",
        );
        setPayouts([]);
        setSelectedPayoutIds([]);
      } else {
        toast.error(
          payRes.data?.message ||
            "Batch created, but failed to transition status to Paid.",
        );
      }
    } else {
      toast.error(createRes.data?.message || "Failed to create payment batch.");
    }
  };

  const handlePayBatchOnly = async (batchId: string) => {
    const payRes = await post<any, any>({
      endpoint: `/api/admin/batch-payments/${batchId}/pay`,
      body: {},
      requireAuth: true,
    });

    if (payRes.success && payRes.data?.success) {
      toast.success("Payment batch status updated to Paid successfully!");
      fetchBatches();
    } else {
      toast.error(payRes.data?.message || "Failed to mark batch as Paid.");
    }
  };

  const handleAbandonBatch = async (batchId: string) => {
    const abandonRes = await del<any>({
      endpoint: `/api/admin/batch-payments/${batchId}`,
      requireAuth: true,
    });

    if (abandonRes.success && abandonRes.data?.success) {
      toast.success("Payment batch abandoned and hard-deleted successfully.");
      fetchBatches();
    } else {
      toast.error(
        abandonRes.data?.message || "Failed to abandon payment batch.",
      );
    }
  };

  const handleViewDetails = async (batchId: string) => {
    setIsDetailOpen(true);
    setLoadingDetail(true);
    setSelectedBatch(null);

    const res = await get<any>({
      endpoint: `/api/admin/batch-payments/${batchId}`,
      requireAuth: true,
    });
    setLoadingDetail(false);

    if (res.success && res.data?.success && res.data?.data) {
      setSelectedBatch(res.data.data);
    } else {
      toast.error("Failed to retrieve batch details.");
      setIsDetailOpen(false);
    }
  };

  const getStatusChipColor = (status: number) => {
    switch (status) {
      case 0: // Initiated
        return "primary";
      case 2: // Paid
        return "warning";
      case 1: // Settled
        return "success";
      default:
        return "default";
    }
  };

  const getStatusText = (status: number) => {
    switch (status) {
      case 0:
        return "Initiated";
      case 2:
        return "Paid";
      case 1:
        return "Settled";
      default:
        return "Unknown";
    }
  };

  return (
    <Box sx={{ p: { xs: 2, md: 4 } }}>
      <Toaster />

      <Box sx={{ mb: 4 }}>
        <Typography
          variant="h4"
          sx={{ fontWeight: 900, mb: 1, letterSpacing: "-1.0px" }}
        >
          Payroll & Batch Settlement
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Initiate monthly laboratory payouts, process batch payments, and
          settle network accounts.
        </Typography>
      </Box>

      <Tabs
        value={activeTab}
        onChange={(_, val) => setActiveTab(val)}
        sx={{ mb: 4 }}
      >
        <Tab
          icon={<PaidIcon />}
          iconPosition="start"
          label="Generate Payroll"
          sx={{ textTransform: "none", fontWeight: 700 }}
        />
        <Tab
          icon={<HistoryIcon />}
          iconPosition="start"
          label="Batch History"
          sx={{ textTransform: "none", fontWeight: 700 }}
        />
      </Tabs>

      {activeTab === 0 && (
        <Grid container spacing={4}>
          <Grid size={{ xs: 12, lg: 4 }}>
            <Card
              sx={{
                border: "1px solid var(--color-border)",
                borderRadius: "16px",
                boxShadow: "0 4px 20px rgba(0,0,0,0.03)",
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
                  <DateRangeIcon color="secondary" />
                  Select Payroll Parameters
                </Typography>

                <FormControl fullWidth sx={{ mb: 3 }}>
                  <InputLabel id="lab-select-label">
                    Select Laboratory Branch
                  </InputLabel>
                  <Select
                    labelId="lab-select-label"
                    value={selectedLabId}
                    label="Select Laboratory Branch"
                    onChange={(e) => setSelectedLabId(e.target.value)}
                  >
                    {labs.map((lab) => (
                      <MenuItem key={lab.id} value={lab.id}>
                        {lab.name} ({lab.city})
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

                <Typography variant="body2" sx={{ fontWeight: 700, mb: 1.5 }}>
                  Date Filter Range
                </Typography>

                <Stack spacing={2} sx={{ mb: 3 }}>
                  <TextField
                    label="Start Date"
                    type="date"
                    slotProps={{ inputLabel: { shrink: true } }}
                    fullWidth
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                  />
                  <TextField
                    label="End Date"
                    type="date"
                    slotProps={{ inputLabel: { shrink: true } }}
                    fullWidth
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                  />
                </Stack>

                <Typography variant="body2" sx={{ fontWeight: 700, mb: 1 }}>
                  Quick Filter Presets
                </Typography>

                <Grid container spacing={1} sx={{ mb: 4 }}>
                  <Grid size={{ xs: 6 }}>
                    <Button
                      variant="outlined"
                      color="inherit"
                      fullWidth
                      size="small"
                      sx={{ textTransform: "none", fontWeight: 600 }}
                      onClick={() => setQuickDates("today")}
                    >
                      Today
                    </Button>
                  </Grid>
                  <Grid size={{ xs: 6 }}>
                    <Button
                      variant="outlined"
                      color="inherit"
                      fullWidth
                      size="small"
                      sx={{ textTransform: "none", fontWeight: 600 }}
                      onClick={() => setQuickDates("yesterday")}
                    >
                      Yesterday
                    </Button>
                  </Grid>
                  <Grid size={{ xs: 6 }}>
                    <Button
                      variant="outlined"
                      color="inherit"
                      fullWidth
                      size="small"
                      sx={{ textTransform: "none", fontWeight: 600 }}
                      onClick={() => setQuickDates("this-month")}
                    >
                      This Month
                    </Button>
                  </Grid>
                  <Grid size={{ xs: 6 }}>
                    <Button
                      variant="outlined"
                      color="inherit"
                      fullWidth
                      size="small"
                      sx={{ textTransform: "none", fontWeight: 600 }}
                      onClick={() => setQuickDates("last-month")}
                    >
                      Last Month
                    </Button>
                  </Grid>
                </Grid>

                <Button
                  variant="contained"
                  color="secondary"
                  fullWidth
                  onClick={handleRetrievePayouts}
                  disabled={loadingPayouts || !selectedLabId}
                  sx={{
                    py: 1.3,
                    textTransform: "none",
                    fontWeight: 700,
                    borderRadius: "8px",
                  }}
                >
                  {loadingPayouts ? (
                    <CircularProgress size={24} />
                  ) : (
                    "Retrieve Unpaid Bookings"
                  )}
                </Button>
              </CardContent>
            </Card>
          </Grid>

          <Grid size={{ xs: 12, lg: 8 }}>
            {loadingPayouts ? (
              <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
                <CircularProgress color="secondary" />
              </Box>
            ) : payouts.length > 0 ? (
              <Stack spacing={3}>
                <TableContainer
                  component={Paper}
                  sx={{
                    border: "1px solid var(--color-border)",
                    borderRadius: "16px",
                    boxShadow: "none",
                  }}
                >
                  <Table>
                    <TableHead sx={{ bgcolor: "rgba(0,0,0,0.02)" }}>
                      <TableRow>
                        <TableCell padding="checkbox">
                          <Checkbox
                            indeterminate={
                              selectedPayoutIds.length > 0 &&
                              selectedPayoutIds.length < payouts.length
                            }
                            checked={
                              payouts.length > 0 &&
                              selectedPayoutIds.length === payouts.length
                            }
                            onChange={handleSelectAll}
                          />
                        </TableCell>
                        <TableCell sx={{ fontWeight: 700 }}>
                          Booking Ref
                        </TableCell>
                        <TableCell sx={{ fontWeight: 700 }}>
                          Paid Date
                        </TableCell>
                        <TableCell sx={{ fontWeight: 700 }} align="right">
                          Gross
                        </TableCell>
                        <TableCell sx={{ fontWeight: 700 }} align="right">
                          Comm.
                        </TableCell>
                        <TableCell sx={{ fontWeight: 700 }} align="right">
                          Net Payout
                        </TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {payouts.map((p) => (
                        <TableRow key={p.id} hover>
                          <TableCell padding="checkbox">
                            <Checkbox
                              checked={selectedPayoutIds.includes(p.id)}
                              onChange={() => handleToggleSelect(p.id)}
                            />
                          </TableCell>
                          <TableCell sx={{ fontWeight: 600 }}>
                            {p.appointmentNumber || p.id.substring(0, 8)}
                          </TableCell>
                          <TableCell>
                            {p.paidAt
                              ? new Date(p.paidAt).toLocaleDateString("en-IN", {
                                  day: "2-digit",
                                  month: "short",
                                  year: "numeric",
                                })
                              : "N/A"}
                          </TableCell>
                          <TableCell align="right">₹{p.totalAmount}</TableCell>
                          <TableCell
                            align="right"
                            sx={{ color: "text.secondary" }}
                          >
                            ₹{p.platformCommission}
                          </TableCell>
                          <TableCell
                            align="right"
                            sx={{ fontWeight: 700, color: "secondary.main" }}
                          >
                            ₹{p.labPayout}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>

                {selectedPayoutIds.length > 0 && (
                  <Card
                    sx={{
                      border: "1px solid var(--color-border)",
                      borderRadius: "16px",
                      bgcolor: "rgba(124,58,237,0.02)",
                    }}
                  >
                    <CardContent
                      sx={{
                        p: 3,
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        flexWrap: "wrap",
                        gap: 3,
                      }}
                    >
                      <Box>
                        <Typography
                          variant="subtitle2"
                          color="text.secondary"
                          sx={{ fontWeight: 600 }}
                        >
                          SELECTED FOR BATCH ({selectedPayoutIds.length}{" "}
                          BOOKINGS)
                        </Typography>
                        <Stack direction="row" spacing={3} sx={{ mt: 1 }}>
                          <Box>
                            <Typography
                              variant="caption"
                              color="text.secondary"
                            >
                              Gross Amt
                            </Typography>
                            <Typography
                              variant="subtitle1"
                              sx={{ fontWeight: 700 }}
                            >
                              ₹{selectedPayoutsDetails().gross}
                            </Typography>
                          </Box>
                          <Box>
                            <Typography
                              variant="caption"
                              color="text.secondary"
                            >
                              Net Commission
                            </Typography>
                            <Typography
                              variant="subtitle1"
                              sx={{ fontWeight: 700, color: "text.secondary" }}
                            >
                              -₹{selectedPayoutsDetails().comm}
                            </Typography>
                          </Box>
                          <Box>
                            <Typography
                              variant="caption"
                              color="text.secondary"
                            >
                              Total Payout
                            </Typography>
                            <Typography
                              variant="h6"
                              sx={{ fontWeight: 800, color: "secondary.main" }}
                            >
                              ₹{selectedPayoutsDetails().net}
                            </Typography>
                          </Box>
                        </Stack>
                      </Box>
                      <Button
                        variant="contained"
                        color="secondary"
                        size="large"
                        onClick={handleCreateAndPay}
                        sx={{
                          textTransform: "none",
                          fontWeight: 800,
                          px: 4,
                          py: 1.5,
                          borderRadius: "8px",
                        }}
                      >
                        Settle & Mark Paid
                      </Button>
                    </CardContent>
                  </Card>
                )}
              </Stack>
            ) : (
              <Box
                sx={{
                  border: "1px dashed var(--color-border)",
                  borderRadius: "16px",
                  py: 8,
                  px: 2,
                  textAlign: "center",
                }}
              >
                <Typography
                  color="text.secondary"
                  variant="body1"
                  sx={{ fontWeight: 600 }}
                >
                  Select a branch and retrieve bookings to build a batch
                  settlement.
                </Typography>
              </Box>
            )}
          </Grid>
        </Grid>
      )}

      {activeTab === 1 && (
        <Box>
          {loadingBatches ? (
            <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
              <CircularProgress color="secondary" />
            </Box>
          ) : batches.length > 0 ? (
            <TableContainer
              component={Paper}
              sx={{
                border: "1px solid var(--color-border)",
                borderRadius: "16px",
                boxShadow: "none",
              }}
            >
              <Table>
                <TableHead sx={{ bgcolor: "rgba(0,0,0,0.02)" }}>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 700 }}>Batch ID</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Branch Name</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Created Date</TableCell>
                    <TableCell sx={{ fontWeight: 700 }} align="right">
                      Payments Count
                    </TableCell>
                    <TableCell sx={{ fontWeight: 700 }} align="right">
                      Total Net Payout
                    </TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
                    <TableCell sx={{ fontWeight: 700 }} align="center">
                      Actions
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {batches.map((b) => (
                    <TableRow key={b.id} hover>
                      <TableCell sx={{ fontWeight: 700 }}>
                        {b.id.substring(0, 8).toUpperCase()}
                      </TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>
                        {b.branchName || b.branchId}
                      </TableCell>
                      <TableCell>
                        {new Date(b.createdAt).toLocaleDateString("en-IN", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                        })}
                      </TableCell>
                      <TableCell align="right" sx={{ fontWeight: 600 }}>
                        {b.paymentCount}
                      </TableCell>
                      <TableCell
                        align="right"
                        sx={{ fontWeight: 700, color: "secondary.main" }}
                      >
                        ₹{b.totalNetPayout}
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={getStatusText(b.status)}
                          color={getStatusChipColor(b.status)}
                          size="small"
                          sx={{ fontWeight: 700 }}
                        />
                      </TableCell>
                      <TableCell align="center">
                        <Stack
                          direction="row"
                          spacing={1}
                          sx={{ justifyContent: "center" }}
                        >
                          <Button
                            variant="outlined"
                            color="inherit"
                            size="small"
                            onClick={() => handleViewDetails(b.id)}
                            sx={{ textTransform: "none", fontWeight: 700 }}
                          >
                            Details
                          </Button>
                          {b.status === 0 && (
                            <Button
                              variant="contained"
                              color="secondary"
                              size="small"
                              onClick={() => handlePayBatchOnly(b.id)}
                              sx={{ textTransform: "none", fontWeight: 700 }}
                            >
                              Pay Batch
                            </Button>
                          )}
                          {b.status !== 1 && (
                            <Button
                              variant="outlined"
                              color="error"
                              size="small"
                              onClick={() => handleAbandonBatch(b.id)}
                              sx={{ textTransform: "none", fontWeight: 700 }}
                            >
                              Abandon
                            </Button>
                          )}
                        </Stack>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          ) : (
            <Box
              sx={{
                border: "1px dashed var(--color-border)",
                borderRadius: "16px",
                py: 8,
                textAlign: "center",
              }}
            >
              <Typography color="text.secondary" variant="body1">
                No past payroll settlement batches discovered.
              </Typography>
            </Box>
          )}
        </Box>
      )}

      {/* Detail Dialog */}
      <Dialog
        open={isDetailOpen}
        onClose={() => setIsDetailOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle sx={{ fontWeight: 900 }}>
          Batch Details: {selectedBatch?.id?.substring(0, 8)?.toUpperCase()}
        </DialogTitle>
        <DialogContent dividers>
          {loadingDetail ? (
            <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
              <CircularProgress color="secondary" />
            </Box>
          ) : selectedBatch ? (
            <Box>
              <Grid container spacing={3} sx={{ mb: 4 }}>
                <Grid size={{ xs: 6, md: 3 }}>
                  <Typography variant="caption" color="text.secondary">
                    LAB BRANCH
                  </Typography>
                  <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                    {selectedBatch.branchName || selectedBatch.branchId}
                  </Typography>
                </Grid>
                <Grid size={{ xs: 6, md: 3 }}>
                  <Typography variant="caption" color="text.secondary">
                    TOTAL GROSS
                  </Typography>
                  <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                    ₹{selectedBatch.totalGrossAmount}
                  </Typography>
                </Grid>
                <Grid size={{ xs: 6, md: 3 }}>
                  <Typography variant="caption" color="text.secondary">
                    PLATFORM COMMISSION
                  </Typography>
                  <Typography
                    variant="subtitle1"
                    sx={{ fontWeight: 700, color: "text.secondary" }}
                  >
                    ₹{selectedBatch.totalPlatformCommission}
                  </Typography>
                </Grid>
                <Grid size={{ xs: 6, md: 3 }}>
                  <Typography variant="caption" color="text.secondary">
                    NET PAYOUT AMOUNT
                  </Typography>
                  <Typography
                    variant="h6"
                    sx={{ fontWeight: 800, color: "secondary.main" }}
                  >
                    ₹{selectedBatch.totalNetPayout}
                  </Typography>
                </Grid>
              </Grid>

              <Divider sx={{ mb: 3 }} />

              <Typography variant="h6" sx={{ fontWeight: 800, mb: 2 }}>
                Associated Bookings ({selectedBatch.paymentCount})
              </Typography>

              <TableContainer
                component={Paper}
                sx={{
                  boxShadow: "none",
                  border: "1px solid var(--color-border)",
                  borderRadius: "8px",
                }}
              >
                <Table size="small">
                  <TableHead sx={{ bgcolor: "rgba(0,0,0,0.01)" }}>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 700 }}>
                        Booking Number
                      </TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>Paid Date</TableCell>
                      <TableCell sx={{ fontWeight: 700 }} align="right">
                        Gross
                      </TableCell>
                      <TableCell sx={{ fontWeight: 700 }} align="right">
                        Net Payout
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {(selectedBatch.payments || []).map(
                      (pay: any, idx: number) => (
                        <TableRow key={pay.id || idx}>
                          <TableCell sx={{ fontWeight: 600 }}>
                            {pay.appointmentNumber || pay.id.substring(0, 8)}
                          </TableCell>
                          <TableCell>
                            {pay.paidAt
                              ? new Date(pay.paidAt).toLocaleDateString()
                              : "N/A"}
                          </TableCell>
                          <TableCell align="right">
                            ₹{pay.totalAmount}
                          </TableCell>
                          <TableCell
                            align="right"
                            sx={{ fontWeight: 700, color: "secondary.main" }}
                          >
                            ₹{pay.labPayout}
                          </TableCell>
                        </TableRow>
                      ),
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>
          ) : (
            <Alert severity="error">Failed to load batch records.</Alert>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button
            variant="outlined"
            color="inherit"
            onClick={() => setIsDetailOpen(false)}
            sx={{ textTransform: "none", fontWeight: 700 }}
          >
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};
