import React, { useEffect, useState, useCallback, useMemo } from "react";
import Head from "next/head";
import { useRouter } from "next/router";
import { useAppSelector } from "@/core_components/store/hooks";
import { useApi } from "@/core_components/hooks/useApi/useApi";
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
import Stack from "@mui/material/Stack";
import Button from "@mui/material/Button";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";
import CircularProgress from "@mui/material/CircularProgress";
import Chip from "@mui/material/Chip";
import ListAltIcon from "@mui/icons-material/ListAlt";
import FileDownloadIcon from "@mui/icons-material/FileDownload";
import toast, { Toaster } from "react-hot-toast";

export default function ReportsConsolePage() {
  const { user, isAuthenticated, isInitialized } = useAppSelector(
    (state) => state.auth,
  );
  const router = useRouter();
  const { get, post } = useApi();

  // Labs list
  const [labs, setLabs] = useState<any[]>([]);

  // Payouts state
  const [allPayouts, setAllPayouts] = useState<any[]>([]);
  const [loadingAllPayouts, setLoadingAllPayouts] = useState(false);

  // Filters state
  const [payoutListSearch, setPayoutListSearch] = useState("");
  const [payoutListBranch, setPayoutListBranch] = useState("all");
  const [payoutListStatus, setPayoutListStatus] = useState("all");
  const [payoutListStart, setPayoutListStart] = useState("");
  const [payoutListEnd, setPayoutListEnd] = useState("");
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
      const response = await post<any, any>({
        endpoint: "/api/admin/labs",
        body: {},
        requireAuth: true,
      });
      if (response.success && response.data?.success && response.data?.data) {
        setLabs(response.data.data);
      }
    };
    if (isAuthenticated && user?.role === "admin") {
      fetchLabs();
    }
  }, [post, isAuthenticated, user]);

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

  useEffect(() => {
    if (isAuthenticated && user?.role === "admin") {
      fetchAllPayouts();
    }
  }, [isAuthenticated, user, fetchAllPayouts]);

  // Quick preset dates setter
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
    setQuickFilter(type);

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
      default:
        setPayoutListStart("");
        setPayoutListEnd("");
        break;
    }
  };

  // Filtered dataset
  const filteredPayouts = useMemo(() => {
    return allPayouts.filter((p) => {
      const searchLower = payoutListSearch.toLowerCase();
      const matchesSearch =
        p.appointmentNumber.toLowerCase().includes(searchLower) ||
        (p.customerName || "").toLowerCase().includes(searchLower);
      const matchesStatus =
        payoutListStatus === "all" || p.batchStatus === payoutListStatus;
      return matchesSearch && matchesStatus;
    });
  }, [allPayouts, payoutListSearch, payoutListStatus]);

  // Calculations for KPI Cards
  const stats = useMemo(() => {
    const total = filteredPayouts.length;
    const gross = filteredPayouts.reduce((acc, p) => acc + p.totalAmount, 0);
    const comm = filteredPayouts.reduce(
      (acc, p) => acc + p.platformCommission,
      0,
    );
    const net = filteredPayouts.reduce((acc, p) => acc + p.labPayout, 0);
    return { total, gross, comm, net };
  }, [filteredPayouts]);

  // CSV/Excel Exports
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
    const rows = filteredPayouts.map((p) => [
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
    const rowsHtml = filteredPayouts
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
              <div class="card-val">₹${stats.gross.toFixed(2)}</div>
            </div>
            <div class="card">
              <div class="card-label">Platform Profit (Commission)</div>
              <div class="card-val">₹${stats.comm.toFixed(2)}</div>
            </div>
            <div class="card">
              <div class="card-label">Net Owed to Labs</div>
              <div class="card-val">₹${stats.net.toFixed(2)}</div>
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
                <td>₹${stats.gross.toFixed(2)}</td>
                <td>₹${stats.comm.toFixed(2)}</td>
                <td>₹${stats.net.toFixed(2)}</td>
                <td colspan="2"></td>
              </tr>
            </tbody>
          </table>

          <div class="signatures">
            <div>
              <div style="height: 50px;"></div>
              <div class="sig-line">Prepared By (Platform Admin)</div>
            </div>
            <div>
              <div style="height: 50px;"></div>
              <div class="sig-line">Verified Auditor</div>
            </div>
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
        <title>OmniLab MS - Admin Reports Console</title>
        <meta
          name="description"
          content="Settle network accounts, filter, and export customized reports."
        />
      </Head>

      <Box sx={{ p: { xs: 2, md: 4 } }}>
        <Toaster />

        <Box sx={{ mb: 4 }}>
          <Typography
            variant="h4"
            sx={{ fontWeight: 900, mb: 1, letterSpacing: "-1.0px" }}
          >
            Reports Console
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Filter finished payouts, generate custom payroll sheets, and
            download reports.
          </Typography>
        </Box>

        <Grid container spacing={4} sx={{ mb: 4 }}>
          {/* KPI Dashboard Metrics Cards */}
          {[
            { title: "Total Bookings", val: stats.total, color: "#6366f1" },
            {
              title: "Total Revenue (Gross)",
              val: `₹${stats.gross.toFixed(2)}`,
              color: "#0ea5e9",
            },
            {
              title: "Platform Profit",
              val: `₹${stats.comm.toFixed(2)}`,
              color: "#10b981",
            },
            {
              title: "Lab Payouts",
              val: `₹${stats.net.toFixed(2)}`,
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
                  Filter Payroll Records
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
                    onChange={(e: any) =>
                      setPayoutListBranch(e.target.value as string)
                    }
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
                    onChange={(e: any) =>
                      setPayoutListStatus(e.target.value as string)
                    }
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
                    onChange={(e) => {
                      setPayoutListStart(e.target.value);
                      setQuickFilter("custom");
                    }}
                  />
                  <TextField
                    label="End Date"
                    type="date"
                    slotProps={{ inputLabel: { shrink: true } }}
                    fullWidth
                    value={payoutListEnd}
                    onChange={(e) => {
                      setPayoutListEnd(e.target.value);
                      setQuickFilter("custom");
                    }}
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
            <Card
              sx={{
                border: "1px solid var(--color-border)",
                borderRadius: "16px",
                mb: 3,
              }}
            >
              <CardContent sx={{ p: 3 }}>
                <Typography variant="h6" sx={{ fontWeight: 800, mb: 2 }}>
                  Download & Export Options
                </Typography>
                <Grid container spacing={2}>
                  <Grid size={{ xs: 12, sm: 4 }}>
                    <Button
                      variant="outlined"
                      color="primary"
                      fullWidth
                      startIcon={<FileDownloadIcon />}
                      onClick={() => handleExportCSV(false)}
                      sx={{
                        textTransform: "none",
                        fontWeight: 700,
                        py: 1.2,
                        borderRadius: "8px",
                      }}
                    >
                      Download CSV
                    </Button>
                  </Grid>
                  <Grid size={{ xs: 12, sm: 4 }}>
                    <Button
                      variant="outlined"
                      color="success"
                      fullWidth
                      startIcon={<FileDownloadIcon />}
                      onClick={() => handleExportCSV(true)}
                      sx={{
                        textTransform: "none",
                        fontWeight: 700,
                        py: 1.2,
                        borderRadius: "8px",
                      }}
                    >
                      Download Excel (XLSX)
                    </Button>
                  </Grid>
                  <Grid size={{ xs: 12, sm: 4 }}>
                    <Button
                      variant="contained"
                      color="secondary"
                      fullWidth
                      startIcon={<FileDownloadIcon />}
                      onClick={handlePrintPDF}
                      sx={{
                        textTransform: "none",
                        fontWeight: 700,
                        py: 1.2,
                        borderRadius: "8px",
                      }}
                    >
                      Print PDF
                    </Button>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>

            {loadingAllPayouts ? (
              <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
                <CircularProgress color="secondary" />
              </Box>
            ) : filteredPayouts.length > 0 ? (
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
                    {filteredPayouts.map((p) => (
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
                        <TableCell align="right" sx={{ color: "success.main" }}>
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
                  No payroll records found for the selected criteria.
                </Typography>
              </Box>
            )}
          </Grid>
        </Grid>
      </Box>
    </>
  );
}
