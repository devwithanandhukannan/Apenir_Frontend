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
import ListAltIcon from "@mui/icons-material/ListAlt";
import AssessmentIcon from "@mui/icons-material/Assessment";
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

  // All historical payouts state
  const [allPayouts, setAllPayouts] = useState<any[]>([]);
  const [loadingAllPayouts, setLoadingAllPayouts] = useState(false);
  const [payoutListSearch, setPayoutListSearch] = useState("");
  const [payoutListBranch, setPayoutListBranch] = useState("all");
  const [payoutListStatus, setPayoutListStatus] = useState("all");
  const [payoutListStart, setPayoutListStart] = useState("");
  const [payoutListEnd, setPayoutListEnd] = useState("");

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

  const fetchAllPayouts = useCallback(async () => {
    setLoadingAllPayouts(true);
    const queryParams = new URLSearchParams();
    if (payoutListStart) queryParams.append("startDate", payoutListStart);
    if (payoutListEnd) queryParams.append("endDate", payoutListEnd);
    if (payoutListBranch && payoutListBranch !== "all")
      queryParams.append("branchId", payoutListBranch);

    const response = await get<any>({
      endpoint: `/api/admin/batch-payments/all-payouts?${queryParams.toString()}`,
      requireAuth: true,
    });
    setLoadingAllPayouts(false);
    if (response.success && response.data?.success && response.data?.data) {
      setAllPayouts(response.data.data);
    } else {
      setAllPayouts([]);
    }
  }, [get, payoutListStart, payoutListEnd, payoutListBranch]);

  // Fetch batches or all payouts when switching tabs
  useEffect(() => {
    if (activeTab === 1) {
      fetchBatches();
    } else if (activeTab === 2 || activeTab === 3) {
      fetchAllPayouts();
    }
  }, [activeTab, fetchBatches, fetchAllPayouts]);

  // Helper date setter functions
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
        setStartDate("");
        setEndDate("");
        break;
    }
  };

  const setPayoutListQuickDates = (
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

    switch (type) {
      case "today":
        setPayoutListStart(formatDate(today));
        setPayoutListEnd(formatDate(today));
        break;
      case "yesterday":
        const yesterday = new Date(today);
        yesterday.setDate(today.getDate() - 1);
        setPayoutListStart(formatDate(yesterday));
        setPayoutListEnd(formatDate(yesterday));
        break;
      case "this-week": {
        const currentDay = today.getDay();
        const distanceToMonday = currentDay === 0 ? 6 : currentDay - 1;
        const monday = new Date(today);
        monday.setDate(today.getDate() - distanceToMonday);
        setPayoutListStart(formatDate(monday));
        setPayoutListEnd(formatDate(today));
        break;
      }
      case "last-week": {
        const currentDay = today.getDay();
        const distanceToMonday = currentDay === 0 ? 6 : currentDay - 1;
        const lastMonday = new Date(today);
        lastMonday.setDate(today.getDate() - distanceToMonday - 7);
        const lastSunday = new Date(lastMonday);
        lastSunday.setDate(lastMonday.getDate() + 6);
        setPayoutListStart(formatDate(lastMonday));
        setPayoutListEnd(formatDate(lastSunday));
        break;
      }
      case "this-month":
        const firstDayMonth = new Date(
          today.getFullYear(),
          today.getMonth(),
          1,
        );
        setPayoutListStart(formatDate(firstDayMonth));
        setPayoutListEnd(formatDate(today));
        break;
      case "everything":
        setPayoutListStart("");
        setPayoutListEnd("");
        break;
    }
  };

  const handleExportCSV = (isXlsx = false) => {
    const headers = [
      "Booking Ref",
      "Customer Name",
      "Lab Branch",
      "Gross (INR)",
      "Commission (INR)",
      "Net Payout (INR)",
      "Paid Date",
      "Batch Ref",
      "Status",
    ];
    const rows = allPayouts.map((p) => [
      p.appointmentNumber,
      p.customerName || "WhatsApp User",
      p.branchName,
      p.totalAmount,
      p.platformCommission,
      p.labPayout,
      p.paidAt ? new Date(p.paidAt).toLocaleDateString("en-IN") : "N/A",
      p.batchNumber || "Unbatched",
      p.batchStatus,
    ]);

    const content = [
      headers.join(","),
      ...rows.map((e) =>
        e.map((x) => `"${String(x).replace(/"/g, '""')}"`).join(","),
      ),
    ].join("\n");
    const blob = new Blob(["\ufeff" + content], {
      type: "text/csv;charset=utf-8;",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    const fileName = `payout_report_${payoutListStart || "all"}_to_${payoutListEnd || "all"}.${isXlsx ? "xlsx" : "csv"}`;
    link.setAttribute("download", fileName);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success(
      `Report downloaded as ${isXlsx ? "Excel (XLSX)" : "CSV"} successfully!`,
    );
  };

  const handlePrintPDF = () => {
    const printWindow = window.open("", "_blank");
    if (!printWindow) {
      toast.error("Popup blocked! Please allow popups to print reports.");
      return;
    }

    const title = `Payout Report: ${payoutListStart || "All Time"} to ${payoutListEnd || "All Time"}`;
    const totalGross = allPayouts.reduce((acc, p) => acc + p.totalAmount, 0);
    const totalComm = allPayouts.reduce(
      (acc, p) => acc + p.platformCommission,
      0,
    );
    const totalNet = allPayouts.reduce((acc, p) => acc + p.labPayout, 0);

    const rowsHtml = allPayouts
      .map(
        (p) => `
      <tr>
        <td>${p.appointmentNumber}</td>
        <td>${p.customerName || "WhatsApp User"}</td>
        <td>${p.branchName}</td>
        <td>₹${p.totalAmount.toFixed(2)}</td>
        <td>₹${p.platformCommission.toFixed(2)}</td>
        <td>₹${p.labPayout.toFixed(2)}</td>
        <td>${p.paidAt ? new Date(p.paidAt).toLocaleDateString("en-IN") : "N/A"}</td>
        <td>${p.batchStatus}</td>
      </tr>
    `,
      )
      .join("");

    printWindow.document.write(`
      <html>
        <head>
          <title>${title}</title>
          <style>
            body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; padding: 40px; color: #1e293b; }
            h1 { font-size: 24px; font-weight: 800; margin-bottom: 5px; }
            .subtitle { font-size: 14px; color: #64748b; margin-bottom: 30px; }
            .metrics { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; margin-bottom: 40px; }
            .card { border: 1px solid #e2e8f0; border-radius: 8px; padding: 20px; background-color: #f8fafc; }
            .card-label { font-size: 12px; color: #64748b; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; }
            .card-val { font-size: 20px; font-weight: 800; color: #0f172a; margin-top: 5px; }
            table { width: 100%; border-collapse: collapse; margin-bottom: 40px; }
            th { text-align: left; background-color: #f1f5f9; padding: 12px; font-size: 12px; font-weight: 700; color: #475569; border-bottom: 2px solid #cbd5e1; }
            td { padding: 12px; font-size: 13px; border-bottom: 1px solid #e2e8f0; }
            .total-row { font-weight: 800; background-color: #f8fafc; }
            .signatures { display: grid; grid-template-columns: 1fr 1fr; gap: 100px; margin-top: 80px; }
            .sig-line { border-top: 1px solid #cbd5e1; text-align: center; padding-top: 10px; font-size: 12px; color: #64748b; font-weight: 600; }
            @media print {
              body { padding: 20px; }
            }
          </style>
        </head>
        <body>
          <h1>Apenir Payouts Report</h1>
          <div class="subtitle">${title}</div>
          
          <div class="metrics">
            <div class="card">
              <div class="card-label">Total Revenue (Gross)</div>
              <div class="card-val">₹${totalGross.toFixed(2)}</div>
            </div>
            <div class="card">
              <div class="card-label">Platform Profit (Commission)</div>
              <div class="card-val">₹${totalComm.toFixed(2)}</div>
            </div>
            <div class="card">
              <div class="card-label">Net Owed to Labs</div>
              <div class="card-val">₹${totalNet.toFixed(2)}</div>
            </div>
          </div>

          <table>
            <thead>
              <tr>
                <th>Booking Ref</th>
                <th>Client Name</th>
                <th>Lab Branch</th>
                <th>Gross</th>
                <th>Commission</th>
                <th>Net Payout</th>
                <th>Paid Date</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              ${rowsHtml}
              <tr class="total-row">
                <td colspan="3">Grand Total</td>
                <td>₹${totalGross.toFixed(2)}</td>
                <td>₹${totalComm.toFixed(2)}</td>
                <td>₹${totalNet.toFixed(2)}</td>
                <td colspan="2"></td>
              </tr>
            </tbody>
          </table>

          <div class="signatures">
            <div class="sig-line">Prepared By (Admin)</div>
            <div class="sig-line">Authorized Signatory</div>
          </div>
          
          <script>
            window.onload = function() {
              window.print();
            }
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
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

  const getLabSummaryList = () => {
    const summaryMap: Record<
      string,
      {
        labName: string;
        gross: number;
        comm: number;
        net: number;
        count: number;
      }
    > = {};

    payouts.forEach((p) => {
      const key = p.branchId || "unknown";
      if (!summaryMap[key]) {
        summaryMap[key] = {
          labName: p.branchName || "Unknown Branch",
          gross: 0,
          comm: 0,
          net: 0,
          count: 0,
        };
      }
      summaryMap[key].gross += p.totalAmount;
      summaryMap[key].comm += p.platformCommission;
      summaryMap[key].net += p.labPayout;
      summaryMap[key].count += 1;
    });

    return Object.values(summaryMap);
  };

  // Calculations for selected payouts
  const selectedPayoutsDetails = () => {
    const selected = payouts.filter((p) =>
      selectedPayoutIds.includes(p.paymentId),
    );
    const gross = selected.reduce((acc, p) => acc + p.totalAmount, 0);
    const comm = selected.reduce((acc, p) => acc + p.platformCommission, 0);
    const net = selected.reduce((acc, p) => acc + p.labPayout, 0);
    return { gross, comm, net };
  };

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedPayoutIds(payouts.map((p) => p.paymentId));
    } else {
      setSelectedPayoutIds([]);
    }
  };

  const handleToggleSelect = (paymentId: string) => {
    setSelectedPayoutIds((prev) =>
      prev.includes(paymentId)
        ? prev.filter((x) => x !== paymentId)
        : [...prev, paymentId],
    );
  };

  const handleCreateAndPay = async () => {
    if (selectedPayoutIds.length === 0) {
      toast.error("Please select at least one payout.");
      return;
    }

    const selectedPayouts = payouts.filter((p) =>
      selectedPayoutIds.includes(p.paymentId),
    );
    const uniqueBranches = Array.from(
      new Set(selectedPayouts.map((p) => p.branchId)),
    );

    if (uniqueBranches.length === 0) {
      toast.error("Invalid payout selection.");
      return;
    }

    let successCount = 0;
    let failCount = 0;

    for (const branchId of uniqueBranches) {
      const branchPayoutIds = selectedPayouts
        .filter((p) => p.branchId === branchId)
        .map((p) => p.paymentId);

      const createRes = await post<any, any>({
        endpoint: "/api/admin/batch-payments",
        body: {
          branchId: branchId,
          paymentIds: branchPayoutIds,
        },
        requireAuth: true,
      });

      if (
        createRes.success &&
        createRes.data?.success &&
        createRes.data?.data
      ) {
        const batchId = createRes.data.data.id;

        const payRes = await post<any, any>({
          endpoint: `/api/admin/batch-payments/${batchId}/pay`,
          body: {},
          requireAuth: true,
        });

        if (payRes.success && payRes.data?.success) {
          successCount++;
        } else {
          failCount++;
        }
      } else {
        failCount++;
      }
    }

    if (failCount === 0) {
      toast.success(
        `Successfully processed ${successCount} laboratory batch payout(s)!`,
      );
      setPayouts([]);
      setSelectedPayoutIds([]);
    } else if (successCount > 0) {
      toast.success(
        `Processed ${successCount} batch payout(s) successfully, but ${failCount} failed.`,
      );
      handleRetrievePayouts();
    } else {
      toast.error("Failed to process batch payouts.");
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
      case 1: // Initiated
        return "primary";
      case 2: // Paid
        return "warning";
      case 3: // Settled
        return "success";
      case 4: // Abandoned
        return "error";
      default:
        return "default";
    }
  };

  const getStatusText = (status: number) => {
    switch (status) {
      case 1:
        return "Initiated";
      case 2:
        return "Paid";
      case 3:
        return "Settled";
      case 4:
        return "Abandoned";
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
        <Tab
          icon={<ListAltIcon />}
          iconPosition="start"
          label="Bookings Payout List"
          sx={{ textTransform: "none", fontWeight: 700 }}
        />
        <Tab
          icon={<AssessmentIcon />}
          iconPosition="start"
          label="Analytics & Reports"
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
                    <MenuItem value="all">All Laboratories</MenuItem>
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
                      onClick={() => setQuickDates("this-week")}
                    >
                      This Week
                    </Button>
                  </Grid>
                  <Grid size={{ xs: 6 }}>
                    <Button
                      variant="outlined"
                      color="inherit"
                      fullWidth
                      size="small"
                      sx={{ textTransform: "none", fontWeight: 600 }}
                      onClick={() => setQuickDates("last-week")}
                    >
                      Last Week
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
                      onClick={() => setQuickDates("everything")}
                    >
                      Everything
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
                {selectedLabId === "all" && (
                  <Card
                    sx={{
                      border: "1px solid var(--color-border)",
                      borderRadius: "16px",
                      boxShadow: "0 4px 20px rgba(0,0,0,0.03)",
                      mb: 2,
                    }}
                  >
                    <CardContent sx={{ p: 3 }}>
                      <Typography variant="h6" sx={{ fontWeight: 800, mb: 2 }}>
                        Laboratory-Wise Summary (Platform Profit & Net Owed)
                      </Typography>
                      <TableContainer component={Box}>
                        <Table size="small">
                          <TableHead sx={{ bgcolor: "rgba(0,0,0,0.02)" }}>
                            <TableRow>
                              <TableCell sx={{ fontWeight: 700 }}>
                                Laboratory Branch
                              </TableCell>
                              <TableCell sx={{ fontWeight: 700 }} align="right">
                                Bookings
                              </TableCell>
                              <TableCell sx={{ fontWeight: 700 }} align="right">
                                Gross
                              </TableCell>
                              <TableCell sx={{ fontWeight: 700 }} align="right">
                                Platform Profit
                              </TableCell>
                              <TableCell sx={{ fontWeight: 700 }} align="right">
                                Net Owed
                              </TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {getLabSummaryList().map((item, idx) => (
                              <TableRow key={idx}>
                                <TableCell sx={{ fontWeight: 600 }}>
                                  {item.labName}
                                </TableCell>
                                <TableCell align="right">
                                  {item.count}
                                </TableCell>
                                <TableCell align="right">
                                  ₹{item.gross.toFixed(2)}
                                </TableCell>
                                <TableCell
                                  align="right"
                                  sx={{
                                    color: "success.main",
                                    fontWeight: 600,
                                  }}
                                >
                                  ₹{item.comm.toFixed(2)}
                                </TableCell>
                                <TableCell
                                  align="right"
                                  sx={{
                                    fontWeight: 700,
                                    color: "secondary.main",
                                  }}
                                >
                                  ₹{item.net.toFixed(2)}
                                </TableCell>
                              </TableRow>
                            ))}
                            {/* Grand Total Row */}
                            <TableRow sx={{ bgcolor: "rgba(0,0,0,0.01)" }}>
                              <TableCell sx={{ fontWeight: 800 }}>
                                Grand Total
                              </TableCell>
                              <TableCell align="right" sx={{ fontWeight: 800 }}>
                                {getLabSummaryList().reduce(
                                  (acc, item) => acc + item.count,
                                  0,
                                )}
                              </TableCell>
                              <TableCell align="right" sx={{ fontWeight: 800 }}>
                                ₹
                                {getLabSummaryList()
                                  .reduce((acc, item) => acc + item.gross, 0)
                                  .toFixed(2)}
                              </TableCell>
                              <TableCell
                                align="right"
                                sx={{ fontWeight: 800, color: "success.main" }}
                              >
                                ₹
                                {getLabSummaryList()
                                  .reduce((acc, item) => acc + item.comm, 0)
                                  .toFixed(2)}
                              </TableCell>
                              <TableCell
                                align="right"
                                sx={{
                                  fontWeight: 800,
                                  color: "secondary.main",
                                }}
                              >
                                ₹
                                {getLabSummaryList()
                                  .reduce((acc, item) => acc + item.net, 0)
                                  .toFixed(2)}
                              </TableCell>
                            </TableRow>
                          </TableBody>
                        </Table>
                      </TableContainer>
                    </CardContent>
                  </Card>
                )}

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
                        {selectedLabId === "all" && (
                          <TableCell sx={{ fontWeight: 700 }}>
                            Laboratory
                          </TableCell>
                        )}
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
                        <TableRow key={p.paymentId} hover>
                          <TableCell padding="checkbox">
                            <Checkbox
                              checked={selectedPayoutIds.includes(p.paymentId)}
                              onChange={() => handleToggleSelect(p.paymentId)}
                            />
                          </TableCell>
                          <TableCell sx={{ fontWeight: 600 }}>
                            {p.appointmentNumber || p.paymentId.substring(0, 8)}
                          </TableCell>
                          {selectedLabId === "all" && (
                            <TableCell
                              sx={{ fontWeight: 600, color: "text.secondary" }}
                            >
                              {p.branchName || "Unknown Branch"}
                            </TableCell>
                          )}
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
                          {b.status === 1 && (
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
                          {b.status !== 3 && b.status !== 4 && (
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

      {activeTab === 2 && (
        <Grid container spacing={4}>
          {/* Filters Column */}
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
                  <ListAltIcon color="secondary" />
                  Filter Bookings Payout
                </Typography>

                <TextField
                  label="Search Booking Ref / Client"
                  variant="outlined"
                  fullWidth
                  sx={{ mb: 3 }}
                  value={payoutListSearch}
                  onChange={(e) => setPayoutListSearch(e.target.value)}
                />

                <FormControl fullWidth sx={{ mb: 3 }}>
                  <InputLabel id="payout-lab-label">
                    Laboratory Branch
                  </InputLabel>
                  <Select
                    labelId="payout-lab-label"
                    value={payoutListBranch}
                    label="Laboratory Branch"
                    onChange={(e) => setPayoutListBranch(e.target.value)}
                  >
                    <MenuItem value="all">All Laboratories</MenuItem>
                    {labs.map((lab) => (
                      <MenuItem key={lab.id} value={lab.id}>
                        {lab.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

                <FormControl fullWidth sx={{ mb: 3 }}>
                  <InputLabel id="payout-status-label">
                    Payout Status
                  </InputLabel>
                  <Select
                    labelId="payout-status-label"
                    value={payoutListStatus}
                    label="Payout Status"
                    onChange={(e) => setPayoutListStatus(e.target.value)}
                  >
                    <MenuItem value="all">All Statuses</MenuItem>
                    <MenuItem value="Unbatched">Unbatched</MenuItem>
                    <MenuItem value="Initiated">Initiated</MenuItem>
                    <MenuItem value="Paid">Paid</MenuItem>
                    <MenuItem value="Settled">Settled</MenuItem>
                    <MenuItem value="Abandoned">Abandoned</MenuItem>
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
                    value={payoutListStart}
                    onChange={(e) => setPayoutListStart(e.target.value)}
                  />
                  <TextField
                    label="End Date"
                    type="date"
                    slotProps={{ inputLabel: { shrink: true } }}
                    fullWidth
                    value={payoutListEnd}
                    onChange={(e) => setPayoutListEnd(e.target.value)}
                  />
                </Stack>

                <Typography variant="body2" sx={{ fontWeight: 700, mb: 1 }}>
                  Quick Filter Presets
                </Typography>

                <Grid container spacing={1} sx={{ mb: 4 }}>
                  {[
                    { label: "Today", value: "today" },
                    { label: "Yesterday", value: "yesterday" },
                    { label: "This Week", value: "this-week" },
                    { label: "Last Week", value: "last-week" },
                    { label: "This Month", value: "this-month" },
                    { label: "Everything", value: "everything" },
                  ].map((preset) => (
                    <Grid size={{ xs: 6 }} key={preset.value}>
                      <Button
                        variant="outlined"
                        color="inherit"
                        fullWidth
                        size="small"
                        sx={{ textTransform: "none", fontWeight: 600 }}
                        onClick={() =>
                          setPayoutListQuickDates(preset.value as any)
                        }
                      >
                        {preset.label}
                      </Button>
                    </Grid>
                  ))}
                </Grid>

                <Button
                  variant="contained"
                  color="secondary"
                  fullWidth
                  onClick={fetchAllPayouts}
                  disabled={loadingAllPayouts}
                  sx={{
                    py: 1.3,
                    textTransform: "none",
                    fontWeight: 700,
                    borderRadius: "8px",
                  }}
                >
                  {loadingAllPayouts ? (
                    <CircularProgress size={24} />
                  ) : (
                    "Retrieve Bookings"
                  )}
                </Button>
              </CardContent>
            </Card>
          </Grid>

          {/* Results Table Column */}
          <Grid size={{ xs: 12, lg: 8 }}>
            {loadingAllPayouts ? (
              <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
                <CircularProgress color="secondary" />
              </Box>
            ) : allPayouts.length > 0 ? (
              <TableContainer
                component={Paper}
                sx={{
                  border: "1px solid var(--color-border)",
                  borderRadius: "16px",
                  boxShadow: "none",
                }}
              >
                <Table size="small">
                  <TableHead sx={{ bgcolor: "rgba(0,0,0,0.02)" }}>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 700 }}>
                        Booking Ref
                      </TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>
                        Customer Name
                      </TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>Lab Branch</TableCell>
                      <TableCell sx={{ fontWeight: 700 }} align="right">
                        Gross
                      </TableCell>
                      <TableCell sx={{ fontWeight: 700 }} align="right">
                        Platform Profit
                      </TableCell>
                      <TableCell sx={{ fontWeight: 700 }} align="right">
                        Net Payout
                      </TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {allPayouts
                      .filter((p) => {
                        const searchLower = payoutListSearch.toLowerCase();
                        const matchesSearch =
                          p.appointmentNumber
                            .toLowerCase()
                            .includes(searchLower) ||
                          (p.customerName || "")
                            .toLowerCase()
                            .includes(searchLower);
                        const matchesStatus =
                          payoutListStatus === "all" ||
                          p.batchStatus === payoutListStatus;
                        return matchesSearch && matchesStatus;
                      })
                      .map((p) => (
                        <TableRow key={p.paymentId} hover>
                          <TableCell sx={{ fontWeight: 700 }}>
                            {p.appointmentNumber}
                          </TableCell>
                          <TableCell sx={{ fontWeight: 600 }}>
                            {p.customerName || "WhatsApp User"}
                          </TableCell>
                          <TableCell>{p.branchName}</TableCell>
                          <TableCell align="right">
                            ₹{p.totalAmount.toFixed(2)}
                          </TableCell>
                          <TableCell
                            align="right"
                            sx={{ color: "success.main" }}
                          >
                            ₹{p.platformCommission.toFixed(2)}
                          </TableCell>
                          <TableCell
                            align="right"
                            sx={{ fontWeight: 700, color: "secondary.main" }}
                          >
                            ₹{p.labPayout.toFixed(2)}
                          </TableCell>
                          <TableCell>
                            <Chip
                              label={p.batchStatus}
                              color={
                                p.batchStatus === "Settled"
                                  ? "success"
                                  : p.batchStatus === "Paid"
                                    ? "warning"
                                    : p.batchStatus === "Initiated"
                                      ? "primary"
                                      : p.batchStatus === "Abandoned"
                                        ? "error"
                                        : "default"
                              }
                              size="small"
                              sx={{ fontWeight: 700 }}
                            />
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
                  No bookings found for the selected criteria.
                </Typography>
              </Box>
            )}
          </Grid>
        </Grid>
      )}

      {activeTab === 3 && (
        <Box>
          {/* KPI Metrics */}
          <Grid container spacing={3} sx={{ mb: 4 }}>
            {[
              {
                title: "Total Bookings",
                val: allPayouts.length,
                color: "#6366f1",
              },
              {
                title: "Total Revenue (Gross)",
                val: `₹${allPayouts.reduce((acc, p) => acc + p.totalAmount, 0).toFixed(2)}`,
                color: "#0ea5e9",
              },
              {
                title: "Platform Profit",
                val: `₹${allPayouts.reduce((acc, p) => acc + p.platformCommission, 0).toFixed(2)}`,
                color: "#10b981",
              },
              {
                title: "Lab Payouts",
                val: `₹${allPayouts.reduce((acc, p) => acc + p.labPayout, 0).toFixed(2)}`,
                color: "#f59e0b",
              },
            ].map((kpi, idx) => (
              <Grid size={{ xs: 12, sm: 6, md: 3 }} key={idx}>
                <Card
                  sx={{
                    border: "1px solid var(--color-border)",
                    borderRadius: "16px",
                  }}
                >
                  <CardContent sx={{ p: 3 }}>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{
                        fontWeight: 700,
                        textTransform: "uppercase",
                        letterSpacing: "0.5px",
                      }}
                    >
                      {kpi.title}
                    </Typography>
                    <Typography
                      variant="h4"
                      sx={{ fontWeight: 900, mt: 1, color: kpi.color }}
                    >
                      {kpi.val}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>

          {/* Visual Analytics */}
          <Grid container spacing={4} sx={{ mb: 4 }}>
            {/* Lab-Wise Profit Comparison */}
            <Grid size={{ xs: 12, md: 6 }}>
              <Card
                sx={{
                  border: "1px solid var(--color-border)",
                  borderRadius: "16px",
                }}
              >
                <CardContent sx={{ p: 3 }}>
                  <Typography variant="h6" sx={{ fontWeight: 800, mb: 3 }}>
                    Platform Profit vs Net Owed (By Lab Branch)
                  </Typography>
                  <Stack spacing={2.5}>
                    {getLabSummaryList().map((lab, index) => {
                      const maxVal =
                        Math.max(
                          ...getLabSummaryList().map((l) =>
                            Math.max(l.comm, l.net),
                          ),
                        ) || 1;
                      const commPct = (lab.comm / maxVal) * 100;
                      const netPct = (lab.net / maxVal) * 100;

                      return (
                        <Box key={index}>
                          <Typography
                            variant="subtitle2"
                            sx={{ fontWeight: 700, mb: 1 }}
                          >
                            {lab.labName}
                          </Typography>
                          <Stack spacing={0.8}>
                            {/* Platform Commission Bar */}
                            <Box
                              sx={{
                                display: "flex",
                                alignItems: "center",
                                gap: 1.5,
                              }}
                            >
                              <Typography
                                variant="caption"
                                sx={{
                                  width: 80,
                                  fontWeight: 600,
                                  color: "success.main",
                                }}
                              >
                                Profit: ₹{lab.comm.toFixed(0)}
                              </Typography>
                              <Box
                                sx={{
                                  flexGrow: 1,
                                  height: 8,
                                  bgcolor: "#f1f5f9",
                                  borderRadius: 4,
                                  overflow: "hidden",
                                }}
                              >
                                <Box
                                  sx={{
                                    width: `${commPct}%`,
                                    height: "100%",
                                    bgcolor: "#10b981",
                                    borderRadius: 4,
                                  }}
                                />
                              </Box>
                            </Box>
                            {/* Net Payout Bar */}
                            <Box
                              sx={{
                                display: "flex",
                                alignItems: "center",
                                gap: 1.5,
                              }}
                            >
                              <Typography
                                variant="caption"
                                sx={{
                                  width: 80,
                                  fontWeight: 600,
                                  color: "secondary.main",
                                }}
                              >
                                Owed: ₹{lab.net.toFixed(0)}
                              </Typography>
                              <Box
                                sx={{
                                  flexGrow: 1,
                                  height: 8,
                                  bgcolor: "#f1f5f9",
                                  borderRadius: 4,
                                  overflow: "hidden",
                                }}
                              >
                                <Box
                                  sx={{
                                    width: `${netPct}%`,
                                    height: "100%",
                                    bgcolor: "#6366f1",
                                    borderRadius: 4,
                                  }}
                                />
                              </Box>
                            </Box>
                          </Stack>
                        </Box>
                      );
                    })}
                  </Stack>
                </CardContent>
              </Card>
            </Grid>

            {/* Settlement Status Distribution */}
            <Grid size={{ xs: 12, md: 6 }}>
              <Card
                sx={{
                  border: "1px solid var(--color-border)",
                  borderRadius: "16px",
                }}
              >
                <CardContent sx={{ p: 3 }}>
                  <Typography variant="h6" sx={{ fontWeight: 800, mb: 3 }}>
                    Settlement Status Distribution
                  </Typography>
                  <Stack spacing={3}>
                    {[
                      "Unbatched",
                      "Initiated",
                      "Paid",
                      "Settled",
                      "Abandoned",
                    ].map((status) => {
                      const count = allPayouts.filter(
                        (p) => p.batchStatus === status,
                      ).length;
                      const pct =
                        allPayouts.length > 0
                          ? (count / allPayouts.length) * 100
                          : 0;
                      let barColor = "#64748b";
                      if (status === "Settled") barColor = "#10b981";
                      else if (status === "Paid") barColor = "#f59e0b";
                      else if (status === "Initiated") barColor = "#3b82f6";
                      else if (status === "Abandoned") barColor = "#ef4444";

                      return (
                        <Box key={status}>
                          <Stack
                            direction="row"
                            sx={{ justifyContent: "space-between", mb: 0.5 }}
                          >
                            <Typography
                              variant="subtitle2"
                              sx={{ fontWeight: 700 }}
                            >
                              {status}
                            </Typography>
                            <Typography
                              variant="caption"
                              sx={{ fontWeight: 700, color: "text.secondary" }}
                            >
                              {count} bookings ({pct.toFixed(0)}%)
                            </Typography>
                          </Stack>
                          <Box
                            sx={{
                              height: 10,
                              bgcolor: "#f1f5f9",
                              borderRadius: 5,
                              overflow: "hidden",
                            }}
                          >
                            <Box
                              sx={{
                                width: `${pct}%`,
                                height: "100%",
                                bgcolor: barColor,
                                borderRadius: 5,
                              }}
                            />
                          </Box>
                        </Box>
                      );
                    })}
                  </Stack>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          {/* Export & Print Center */}
          <Card
            sx={{
              border: "1px solid var(--color-border)",
              borderRadius: "16px",
              boxShadow: "0 4px 20px rgba(0,0,0,0.03)",
              p: 1,
            }}
          >
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" sx={{ fontWeight: 800, mb: 1 }}>
                Export & Download Report
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
                Select reporting date constraints in the Payout List filters to
                compile a customized laboratory summary report.
              </Typography>

              <Grid container spacing={3}>
                <Grid size={{ xs: 12, md: 4 }}>
                  <Button
                    variant="outlined"
                    color="primary"
                    fullWidth
                    size="large"
                    onClick={() => handleExportCSV(false)}
                    sx={{
                      textTransform: "none",
                      fontWeight: 700,
                      py: 1.5,
                      borderRadius: "8px",
                    }}
                  >
                    Download CSV Report
                  </Button>
                </Grid>
                <Grid size={{ xs: 12, md: 4 }}>
                  <Button
                    variant="outlined"
                    color="success"
                    fullWidth
                    size="large"
                    onClick={() => handleExportCSV(true)}
                    sx={{
                      textTransform: "none",
                      fontWeight: 700,
                      py: 1.5,
                      borderRadius: "8px",
                    }}
                  >
                    Download Excel (XLSX)
                  </Button>
                </Grid>
                <Grid size={{ xs: 12, md: 4 }}>
                  <Button
                    variant="contained"
                    color="secondary"
                    fullWidth
                    size="large"
                    onClick={handlePrintPDF}
                    sx={{
                      textTransform: "none",
                      fontWeight: 700,
                      py: 1.5,
                      borderRadius: "8px",
                    }}
                  >
                    Generate & Print PDF
                  </Button>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
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
