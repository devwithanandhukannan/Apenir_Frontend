import React, { useMemo, useState } from "react";
import toast from "react-hot-toast";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Grid from "@mui/material/Grid";
import Chip from "@mui/material/Chip";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import Checkbox from "@mui/material/Checkbox";
import CircularProgress from "@mui/material/CircularProgress";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import TextField from "@mui/material/TextField";
import Stack from "@mui/material/Stack";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import PaymentsIcon from "@mui/icons-material/Payments";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import AddIcon from "@mui/icons-material/Add";
import ResponsiveGrid from "@/shared_features/responsive_grid";
import {
  ColumnConfig,
  FilterMenuConfigItem,
} from "@/shared_features/responsive_grid/type";
import { useBatchPayment, BatchPaymentItem } from "./useBatchPayment";

interface LabBatchPaymentTabProps {
  labId: string;
}

export const LabBatchPaymentTab: React.FC<LabBatchPaymentTabProps> = ({
  labId,
}) => {
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [isSuccessWarningOpen, setIsSuccessWarningOpen] = useState(false);

  // Date and quick filter states for unbatched compilation modal
  const [startDateFilter, setStartDateFilter] = useState("");
  const [endDateFilter, setEndDateFilter] = useState("");
  const [quickFilter, setQuickFilter] = useState("everything");

  const {
    paginatedData,
    loading,
    filters,
    setFilters,
    pagination,
    summary,
    isDialogOpen,
    setIsDialogOpen,
    unbatchedPayments,
    unbatchedLoading,
    selectedIds,
    setSelectedIds,
    toggleSelectPayment,
    submitBatch,
    isSubmitting,
    selectedTotal,
    selectedPayout,
    isDetailDialogOpen,
    setIsDetailDialogOpen,
    selectedBatchDetail,
    detailLoading,
    fetchBatchDetail,
    isDeleting,
    deleteBatch,
    selectAllPayments,
  } = useBatchPayment(labId);

  // Quick preset dates setter
  const setQuickFilterDates = (type: string) => {
    const today = new Date();
    const formatDate = (date: Date) => date.toISOString().split("T")[0];
    setQuickFilter(type);

    switch (type) {
      case "yesterday":
        const yesterday = new Date(today);
        yesterday.setDate(today.getDate() - 1);
        setStartDateFilter(formatDate(yesterday));
        setEndDateFilter(formatDate(yesterday));
        break;
      case "this_week": {
        const currentDay = today.getDay();
        const distanceToMonday = currentDay === 0 ? 6 : currentDay - 1;
        const monday = new Date(today);
        monday.setDate(today.getDate() - distanceToMonday);
        setStartDateFilter(formatDate(monday));
        setEndDateFilter(formatDate(today));
        break;
      }
      case "last_week": {
        const currentDay = today.getDay();
        const distanceToMonday = currentDay === 0 ? 6 : currentDay - 1;
        const lastMonday = new Date(today);
        lastMonday.setDate(today.getDate() - distanceToMonday - 7);
        const lastSunday = new Date(lastMonday);
        lastSunday.setDate(lastMonday.getDate() + 6);
        setStartDateFilter(formatDate(lastMonday));
        setEndDateFilter(formatDate(lastSunday));
        break;
      }
      case "this_month":
        const firstDayMonth = new Date(
          today.getFullYear(),
          today.getMonth(),
          1,
        );
        setStartDateFilter(formatDate(firstDayMonth));
        setEndDateFilter(formatDate(today));
        break;
      case "last_month":
        const startOfLastMonth = new Date(
          today.getFullYear(),
          today.getMonth() - 1,
          1,
        );
        const endOfLastMonth = new Date(
          today.getFullYear(),
          today.getMonth(),
          0,
        );
        setStartDateFilter(formatDate(startOfLastMonth));
        setEndDateFilter(formatDate(endOfLastMonth));
        break;
      case "everything":
      default:
        setStartDateFilter("");
        setEndDateFilter("");
        break;
    }
  };

  // Filtered unbatched payments matching criteria
  const filteredUnbatched = useMemo(() => {
    return unbatchedPayments.filter((p) => {
      if (!p.paidAt) return true;
      const paidDate = new Date(p.paidAt);

      if (startDateFilter) {
        const start = new Date(startDateFilter);
        start.setHours(0, 0, 0, 0);
        if (paidDate < start) return false;
      }
      if (endDateFilter) {
        const end = new Date(endDateFilter);
        end.setHours(23, 59, 59, 999);
        if (paidDate > end) return false;
      }
      return true;
    });
  }, [unbatchedPayments, startDateFilter, endDateFilter]);

  // Aggregate selected totals based on filtered items
  const filteredSelectedTotal = useMemo(() => {
    return unbatchedPayments
      .filter(
        (item) =>
          selectedIds.includes(item.paymentId) &&
          filteredUnbatched.some((f) => f.paymentId === item.paymentId),
      )
      .reduce((sum, item) => sum + (item.totalAmount || 0), 0);
  }, [unbatchedPayments, selectedIds, filteredUnbatched]);

  const filteredSelectedPayout = useMemo(() => {
    return unbatchedPayments
      .filter(
        (item) =>
          selectedIds.includes(item.paymentId) &&
          filteredUnbatched.some((f) => f.paymentId === item.paymentId),
      )
      .reduce((sum, item) => sum + (item.labPayout || 0), 0);
  }, [unbatchedPayments, selectedIds, filteredUnbatched]);

  const handleSelectAllFiltered = () => {
    const filteredIds = filteredUnbatched.map((p) => p.paymentId);
    const allFilteredSelected = filteredIds.every((id) =>
      selectedIds.includes(id),
    );
    if (allFilteredSelected) {
      setSelectedIds((prev) => prev.filter((id) => !filteredIds.includes(id)));
    } else {
      setSelectedIds((prev) => {
        const union = new Set([...prev, ...filteredIds]);
        return Array.from(union);
      });
    }
  };

  // Define Columns configuration matching grid schema
  const columns: ColumnConfig<BatchPaymentItem>[] = useMemo(
    () => [
      {
        accessor: "batchRef",
        header: "Batch Reference",
        sortable: true,
        width: 160,
        Cell: ({ value }) => (
          <Typography
            variant="body2"
            sx={{ fontWeight: 800, color: "text.primary" }}
          >
            {value}
          </Typography>
        ),
      },
      {
        accessor: "payoutDate",
        header: "Payout Date",
        sortable: true,
        width: 180,
        Cell: ({ value }) => {
          const dateFormatted = new Date(value).toLocaleDateString([], {
            dateStyle: "medium",
          });
          return (
            <Typography
              variant="body2"
              sx={{ fontWeight: 500, color: "#334155" }}
            >
              {dateFormatted}
            </Typography>
          );
        },
      },
      {
        accessor: "grossAmount",
        header: "Gross Total",
        sortable: true,
        width: 140,
        Cell: ({ value }) => (
          <Typography
            variant="body2"
            sx={{ fontWeight: 700, color: "#475569" }}
          >
            ₹{value.toLocaleString()}
          </Typography>
        ),
      },
      {
        accessor: "commission",
        header: "Platform Fee (15%)",
        sortable: true,
        width: 165,
        Cell: ({ value }) => (
          <Typography
            variant="body2"
            sx={{ fontWeight: 700, color: "#dc2626" }}
          >
            - ₹{value.toLocaleString()}
          </Typography>
        ),
      },
      {
        accessor: "netAmount",
        header: "Net Disbursed",
        sortable: true,
        width: 150,
        Cell: ({ value }) => (
          <Typography
            variant="body2"
            sx={{ fontWeight: 800, color: "text.primary" }}
          >
            ₹{value.toLocaleString()}
          </Typography>
        ),
      },
      {
        accessor: "status",
        header: "Status",
        sortable: true,
        width: 130,
        Cell: ({ value }) => {
          const isTransferred = value === "Transferred";
          const isProcessing = value === "Processing";
          return (
            <Chip
              label={value}
              size="small"
              variant="outlined"
              sx={{
                fontWeight: 700,
                fontSize: "11px",
                borderRadius: "6px",
                color: isTransferred
                  ? "#10b981"
                  : isProcessing
                    ? "#1d4ed8"
                    : "#ef4444",
                borderColor: isTransferred
                  ? "rgba(16, 185, 129, 0.25)"
                  : isProcessing
                    ? "rgba(29, 78, 216, 0.25)"
                    : "rgba(239, 68, 68, 0.25)",
                bgcolor: isTransferred
                  ? "rgba(16, 185, 129, 0.04)"
                  : isProcessing
                    ? "rgba(29, 78, 216, 0.04)"
                    : "rgba(239, 68, 68, 0.04)",
              }}
            />
          );
        },
      },
    ],
    [],
  );

  // Filter dropdown configurations
  const filterMenuConfig: FilterMenuConfigItem[] = useMemo(
    () => [
      {
        key: "status",
        label: "Status",
        type: "select",
        multiple: true,
        width: 140,
        options: [
          { value: "Transferred", label: "Transferred" },
          { value: "Processing", label: "Processing" },
          { value: "Failed", label: "Failed" },
        ],
      },
    ],
    [],
  );

  const handleSubmit = async () => {
    const activeSelectedIds = selectedIds.filter((id) =>
      filteredUnbatched.some((f) => f.paymentId === id),
    );
    if (activeSelectedIds.length === 0) {
      toast.error("Please select at least one visible payout.");
      return;
    }

    setSelectedIds(activeSelectedIds);
    setTimeout(async () => {
      const res = await submitBatch();
      if (res.success) {
        toast.success("Batch payout created successfully!");
        setIsSuccessWarningOpen(true);
      } else {
        toast.error(res.message || "Failed to submit batch payout.");
      }
    }, 0);
  };

  const handleDelete = async () => {
    if (!selectedBatchDetail) return;
    setIsConfirmOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!selectedBatchDetail) return;
    setIsConfirmOpen(false);
    const res = await deleteBatch(selectedBatchDetail.id);
    if (res.success) {
      toast.success("Batch abandoned successfully!");
    } else {
      toast.error(res.message || "Failed to delete batch.");
    }
  };

  const selectedFilteredCount = filteredUnbatched.filter((x) =>
    selectedIds.includes(x.paymentId),
  ).length;

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 4 }}>
      {/* Batch Summary Widgets */}
      <Grid container spacing={3}>
        {/* Total Settled Net */}
        <Grid size={{ xs: 12, sm: 4 }}>
          <Card
            sx={{
              border: "1px solid #e2e8f0",
              borderRadius: "12px",
              boxShadow: "none",
            }}
          >
            <CardContent
              sx={{ p: 3, display: "flex", alignItems: "center", gap: 2 }}
            >
              <Box
                sx={{
                  bgcolor: "#e0f2fe",
                  color: "#0284c7",
                  p: 1.5,
                  borderRadius: "8px",
                  display: "flex",
                }}
              >
                <PaymentsIcon sx={{ fontSize: "24px" }} />
              </Box>
              <Box>
                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{ fontWeight: 600 }}
                >
                  Total Payouts Settled
                </Typography>
                <Typography variant="h6" sx={{ fontWeight: 800 }}>
                  ₹{loading ? "..." : summary.totalPaidOut.toLocaleString()}
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Last Batch amount */}
        <Grid size={{ xs: 12, sm: 4 }}>
          <Card
            sx={{
              border: "1px solid #e2e8f0",
              borderRadius: "12px",
              boxShadow: "none",
            }}
          >
            <CardContent
              sx={{ p: 3, display: "flex", alignItems: "center", gap: 2 }}
            >
              <Box
                sx={{
                  bgcolor: "#f0fdf4",
                  color: "#16a34a",
                  p: 1.5,
                  borderRadius: "8px",
                  display: "flex",
                }}
              >
                <CheckCircleIcon sx={{ fontSize: "24px" }} />
              </Box>
              <Box>
                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{ fontWeight: 600 }}
                >
                  Last Transferred Batch
                </Typography>
                <Typography variant="h6" sx={{ fontWeight: 800 }}>
                  ₹{loading ? "..." : summary.lastPayout.toLocaleString()}
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Next payout schedule */}
        <Grid size={{ xs: 12, sm: 4 }}>
          <Card
            sx={{
              border: "1px solid #e2e8f0",
              borderRadius: "12px",
              boxShadow: "none",
            }}
          >
            <CardContent
              sx={{ p: 3, display: "flex", alignItems: "center", gap: 2 }}
            >
              <Box
                sx={{
                  bgcolor: "#fee2e2",
                  color: "#dc2626",
                  p: 1.5,
                  borderRadius: "8px",
                  display: "flex",
                }}
              >
                <CalendarMonthIcon sx={{ fontSize: "24px" }} />
              </Box>
              <Box>
                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{ fontWeight: 600 }}
                >
                  Next Payout Cycle
                </Typography>
                <Typography variant="h6" sx={{ fontWeight: 800 }}>
                  {loading
                    ? "..."
                    : new Date(summary.nextPayoutDate).toLocaleDateString([], {
                        dateStyle: "medium",
                      })}
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Batch Ledger Table */}
      <Card
        sx={{
          border: "1px solid #e2e8f0",
          borderRadius: "12px",
          boxShadow: "none",
        }}
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
            <Typography variant="h6" sx={{ fontWeight: 800 }}>
              Batch Settlement Ledger
            </Typography>
            <Button
              variant="contained"
              size="small"
              startIcon={<AddIcon />}
              onClick={() => setIsDialogOpen(true)}
              sx={{
                textTransform: "none",
                fontWeight: 700,
                borderRadius: "8px",
                px: 2,
              }}
            >
              Create Batch
            </Button>
          </Box>

          <ResponsiveGrid
            data={paginatedData}
            loading={loading}
            filters={filters}
            setFilters={setFilters}
            filterMenuConfig={filterMenuConfig}
            columns={columns}
            searchPlaceholder="Search Batch Ref..."
            pagination={pagination}
            onRowActionClick={(row) => fetchBatchDetail(row.id)}
            rowActionLabel="View"
          />
        </CardContent>
      </Card>

      {/* Dialog for selecting unbatched payments */}
      <Dialog
        open={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        maxWidth="sm"
        fullWidth
        slotProps={{
          paper: {
            sx: {
              borderRadius: "16px",
              p: 1.5,
            },
          },
        }}
      >
        <DialogTitle sx={{ fontWeight: 800, pb: 1 }}>
          Create Payout Batch (
          {unbatchedLoading ? "..." : filteredUnbatched.length})
        </DialogTitle>
        <DialogContent
          dividers
          sx={{
            minHeight: "200px",
            display: "flex",
            flexDirection: "column",
            gap: 2,
            py: 2,
          }}
        >
          {unbatchedLoading ? (
            <Box
              sx={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                flexGrow: 1,
                py: 4,
              }}
            >
              <CircularProgress size="32px" />
            </Box>
          ) : unbatchedPayments.length === 0 ? (
            <Box
              sx={{
                p: 4,
                textAlign: "center",
                flexGrow: 1,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Typography variant="body2" color="text.secondary">
                No unbatched payments available to compile.
              </Typography>
            </Box>
          ) : (
            <>
              {/* Date & Quick Filters */}
              <Stack spacing={1.5} sx={{ mb: 2 }}>
                <FormControl size="small" fullWidth>
                  <InputLabel id="quick-filter-select-label">
                    Quick Date Filter
                  </InputLabel>
                  <Select
                    labelId="quick-filter-select-label"
                    value={quickFilter}
                    label="Quick Date Filter"
                    onChange={(e) => setQuickFilterDates(e.target.value)}
                  >
                    <MenuItem value="everything">Everything</MenuItem>
                    <MenuItem value="yesterday">Yesterday</MenuItem>
                    <MenuItem value="this_week">This Week</MenuItem>
                    <MenuItem value="last_week">Last Week</MenuItem>
                    <MenuItem value="this_month">This Month</MenuItem>
                    <MenuItem value="last_month">Last Month</MenuItem>
                  </Select>
                </FormControl>

                <Stack direction="row" spacing={1.5}>
                  <TextField
                    label="Start Date"
                    type="date"
                    size="small"
                    slotProps={{ inputLabel: { shrink: true } }}
                    fullWidth
                    value={startDateFilter}
                    onChange={(e) => {
                      setStartDateFilter(e.target.value);
                      setQuickFilter("custom");
                    }}
                  />
                  <TextField
                    label="End Date"
                    type="date"
                    size="small"
                    slotProps={{ inputLabel: { shrink: true } }}
                    fullWidth
                    value={endDateFilter}
                    onChange={(e) => {
                      setEndDateFilter(e.target.value);
                      setQuickFilter("custom");
                    }}
                  />
                </Stack>
              </Stack>

              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  px: 2,
                  py: 1,
                  bgcolor: "#f8fafc",
                  borderRadius: "8px",
                  border: "1px solid #e2e8f0",
                  mb: 1,
                }}
              >
                <Checkbox
                  edge="start"
                  checked={
                    filteredUnbatched.length > 0 &&
                    filteredUnbatched.every((x) =>
                      selectedIds.includes(x.paymentId),
                    )
                  }
                  indeterminate={
                    filteredUnbatched.some((x) =>
                      selectedIds.includes(x.paymentId),
                    ) &&
                    !filteredUnbatched.every((x) =>
                      selectedIds.includes(x.paymentId),
                    )
                  }
                  onChange={handleSelectAllFiltered}
                  slotProps={{ input: { "aria-label": "select all payments" } }}
                />
                <Typography
                  variant="body2"
                  sx={{ fontWeight: 800, ml: 1, color: "#475569" }}
                >
                  Select All ({filteredUnbatched.length} items)
                </Typography>
              </Box>
              <List
                sx={{ width: "100%", maxHeight: "300px", overflowY: "auto" }}
              >
                {filteredUnbatched.map((item) => {
                  const labelId = `checkbox-list-label-${item.paymentId}`;
                  const isChecked = selectedIds.includes(item.paymentId);
                  return (
                    <ListItem
                      key={item.paymentId}
                      disablePadding
                      sx={{
                        borderRadius: "8px",
                        mb: 1,
                        border: "1px solid #f1f5f9",
                      }}
                    >
                      <ListItemButton
                        onClick={() => toggleSelectPayment(item.paymentId)}
                        dense
                        sx={{ borderRadius: "8px" }}
                      >
                        <ListItemIcon sx={{ minWidth: "40px" }}>
                          <Checkbox
                            edge="start"
                            checked={isChecked}
                            tabIndex={-1}
                            disableRipple
                            slotProps={{
                              input: { "aria-labelledby": labelId },
                            }}
                          />
                        </ListItemIcon>
                        <ListItemText
                          id={labelId}
                          primary={
                            <Box
                              sx={{
                                display: "flex",
                                justifyContent: "space-between",
                                alignItems: "center",
                              }}
                            >
                              <Typography
                                variant="subtitle2"
                                sx={{ fontWeight: 800, color: "text.primary" }}
                              >
                                {item.appointmentNumber} ({item.customerName})
                              </Typography>
                              <Typography
                                variant="subtitle2"
                                sx={{ fontWeight: 800, color: "primary.main" }}
                              >
                                ₹{item.totalAmount.toLocaleString()}
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
                                Paid:{" "}
                                {item.paidAt
                                  ? new Date(item.paidAt).toLocaleDateString()
                                  : "N/A"}{" "}
                                ({item.paymentMethod || "UPI"})
                              </Typography>
                              <Typography
                                variant="caption"
                                sx={{ color: "#10b981", fontWeight: 700 }}
                              >
                                Payout: ₹{item.labPayout.toLocaleString()} (Fee:
                                ₹{item.platformCommission.toLocaleString()})
                              </Typography>
                            </Box>
                          }
                        />
                      </ListItemButton>
                    </ListItem>
                  );
                })}
              </List>

              {selectedFilteredCount > 0 && (
                <Box
                  sx={{
                    p: 2,
                    bgcolor: "#f8fafc",
                    borderRadius: "8px",
                    border: "1px solid #e2e8f0",
                    mt: 2,
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ fontWeight: 600 }}
                  >
                    Selected ({selectedFilteredCount} items):
                  </Typography>
                  <Box sx={{ textAlign: "right" }}>
                    <Typography
                      variant="subtitle2"
                      sx={{ fontWeight: 800, color: "primary.main" }}
                    >
                      Total Amount: ₹{filteredSelectedTotal.toLocaleString()}
                    </Typography>
                    <Typography
                      variant="caption"
                      sx={{
                        color: "#10b981",
                        fontWeight: 700,
                        display: "block",
                      }}
                    >
                      Net Payout: ₹{filteredSelectedPayout.toLocaleString()}
                    </Typography>
                  </Box>
                </Box>
              )}
            </>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 1.5 }}>
          <Button
            onClick={() => setIsDialogOpen(false)}
            variant="outlined"
            color="inherit"
            disabled={isSubmitting}
            sx={{ fontWeight: 700, textTransform: "none", borderRadius: "8px" }}
          >
            Close
          </Button>
          <Button
            onClick={handleSubmit}
            variant="contained"
            disabled={isSubmitting || selectedFilteredCount === 0}
            sx={{ fontWeight: 700, textTransform: "none", borderRadius: "8px" }}
          >
            {isSubmitting
              ? "Submitting..."
              : `Submit Batch (${selectedFilteredCount})`}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog for displaying batch payment details */}
      <Dialog
        open={isDetailDialogOpen}
        onClose={() => setIsDetailDialogOpen(false)}
        maxWidth="md"
        fullWidth
        slotProps={{
          paper: {
            sx: {
              borderRadius: "16px",
              p: 1.5,
            },
          },
        }}
      >
        <DialogTitle
          sx={{
            fontWeight: 800,
            pb: 1,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Box>
            Payout Batch Details
            <Typography
              variant="caption"
              sx={{
                display: "block",
                color: "text.secondary",
                fontWeight: 600,
                mt: 0.5,
              }}
            >
              ID: {selectedBatchDetail?.id}
            </Typography>
          </Box>
          {selectedBatchDetail && (
            <Chip
              label={
                (selectedBatchDetail.status as any) === 1 ||
                (selectedBatchDetail.status as any) === "Initiated" ||
                (selectedBatchDetail.status as any) === "initiated"
                  ? "Initiated"
                  : (selectedBatchDetail.status as any) === 2 ||
                      (selectedBatchDetail.status as any) === "Settled" ||
                      (selectedBatchDetail.status as any) === "settled" ||
                      (selectedBatchDetail.status as any) === "Transferred" ||
                      (selectedBatchDetail.status as any) === "transferred"
                    ? "Transferred"
                    : (selectedBatchDetail.status as any) === 3 ||
                        (selectedBatchDetail.status as any) === "Abandoned" ||
                        (selectedBatchDetail.status as any) === "abandoned" ||
                        (selectedBatchDetail.status as any) === "Failed" ||
                        (selectedBatchDetail.status as any) === "failed"
                      ? "Failed"
                      : "Failed"
              }
              color={
                (selectedBatchDetail.status as any) === 2 ||
                (selectedBatchDetail.status as any) === "Settled" ||
                (selectedBatchDetail.status as any) === "settled" ||
                (selectedBatchDetail.status as any) === "Transferred" ||
                (selectedBatchDetail.status as any) === "transferred"
                  ? "success"
                  : (selectedBatchDetail.status as any) === 3 ||
                      (selectedBatchDetail.status as any) === "Abandoned" ||
                      (selectedBatchDetail.status as any) === "abandoned" ||
                      (selectedBatchDetail.status as any) === "Failed" ||
                      (selectedBatchDetail.status as any) === "failed"
                    ? "error"
                    : "primary"
              }
              size="small"
              sx={{ fontWeight: 700, borderRadius: "6px" }}
            />
          )}
        </DialogTitle>
        <DialogContent
          dividers
          sx={{
            minHeight: "200px",
            display: "flex",
            flexDirection: "column",
            gap: 3,
            py: 2,
          }}
        >
          {detailLoading ? (
            <Box
              sx={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                flexGrow: 1,
                py: 4,
              }}
            >
              <CircularProgress size="32px" />
            </Box>
          ) : !selectedBatchDetail ? (
            <Box
              sx={{
                p: 4,
                textAlign: "center",
                flexGrow: 1,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Typography variant="body2" color="text.secondary">
                Failed to load batch details.
              </Typography>
            </Box>
          ) : (
            <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
              {/* Batch Financial Info Cards */}
              <Grid container spacing={2}>
                <Grid size={{ xs: 12, sm: 4 }}>
                  <Box
                    sx={{
                      p: 2,
                      bgcolor: "#f8fafc",
                      borderRadius: "8px",
                      border: "1px solid #e2e8f0",
                    }}
                  >
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      sx={{ fontWeight: 600 }}
                    >
                      Total Gross Amount
                    </Typography>
                    <Typography
                      variant="subtitle1"
                      sx={{ fontWeight: 800, color: "text.primary" }}
                    >
                      ₹{selectedBatchDetail.totalGrossAmount.toLocaleString()}
                    </Typography>
                  </Box>
                </Grid>
                <Grid size={{ xs: 12, sm: 4 }}>
                  <Box
                    sx={{
                      p: 2,
                      bgcolor: "#fff5f5",
                      borderRadius: "8px",
                      border: "1px solid #fee2e2",
                    }}
                  >
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      sx={{ fontWeight: 600 }}
                    >
                      Platform Fee (15%)
                    </Typography>
                    <Typography
                      variant="subtitle1"
                      sx={{ fontWeight: 800, color: "#dc2626" }}
                    >
                      - ₹
                      {selectedBatchDetail.totalPlatformCommission.toLocaleString()}
                    </Typography>
                  </Box>
                </Grid>
                <Grid size={{ xs: 12, sm: 4 }}>
                  <Box
                    sx={{
                      p: 2,
                      bgcolor: "#f0fdf4",
                      borderRadius: "8px",
                      border: "1px solid #bbf7d0",
                    }}
                  >
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      sx={{ fontWeight: 600 }}
                    >
                      Net Disbursed
                    </Typography>
                    <Typography
                      variant="subtitle1"
                      sx={{ fontWeight: 800, color: "#16a34a" }}
                    >
                      ₹{selectedBatchDetail.totalNetPayout.toLocaleString()}
                    </Typography>
                  </Box>
                </Grid>
              </Grid>

              {/* General Details */}
              <Box sx={{ display: "flex", flexWrap: "wrap", gap: 4, px: 1 }}>
                <Box>
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{ display: "block", fontWeight: 600 }}
                  >
                    Created Date
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 700 }}>
                    {new Date(selectedBatchDetail.createdAt).toLocaleString()}
                  </Typography>
                </Box>
                <Box>
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{ display: "block", fontWeight: 600 }}
                  >
                    Created By ID
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 700 }}>
                    {selectedBatchDetail.createdBy || "System"}
                  </Typography>
                </Box>
                <Box>
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{ display: "block", fontWeight: 600 }}
                  >
                    Payments Count
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 700 }}>
                    {selectedBatchDetail.paymentCount} Items
                  </Typography>
                </Box>
              </Box>

              {/* Payments List Section */}
              <Box>
                <Typography
                  variant="subtitle2"
                  sx={{ fontWeight: 800, mb: 1.5 }}
                >
                  Included Payments Checklist (
                  {selectedBatchDetail.payments.length})
                </Typography>
                <List
                  sx={{ width: "100%", maxHeight: "240px", overflowY: "auto" }}
                >
                  {selectedBatchDetail.payments.map((p) => (
                    <ListItem
                      key={p.paymentId}
                      disablePadding
                      sx={{
                        borderRadius: "8px",
                        mb: 1,
                        border: "1px solid #f1f5f9",
                      }}
                    >
                      <Box
                        sx={{
                          width: "100%",
                          p: 1.5,
                          display: "flex",
                          flexDirection: "column",
                          gap: 0.5,
                        }}
                      >
                        <Box
                          sx={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                          }}
                        >
                          <Typography
                            variant="subtitle2"
                            sx={{ fontWeight: 800 }}
                          >
                            {p.appointmentNumber} ({p.customerName})
                          </Typography>
                          <Typography
                            variant="subtitle2"
                            sx={{ fontWeight: 800 }}
                          >
                            ₹{p.totalAmount.toLocaleString()}
                          </Typography>
                        </Box>
                        <Box
                          sx={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                          }}
                        >
                          <Typography variant="caption" color="text.secondary">
                            Paid:{" "}
                            {p.paidAt
                              ? new Date(p.paidAt).toLocaleDateString()
                              : "N/A"}{" "}
                            ({p.paymentMethod || "UPI"})
                          </Typography>
                          <Typography
                            variant="caption"
                            sx={{ color: "#10b981", fontWeight: 700 }}
                          >
                            Payout: ₹{p.labPayout.toLocaleString()} (Fee: ₹
                            {p.platformCommission.toLocaleString()})
                          </Typography>
                        </Box>
                      </Box>
                    </ListItem>
                  ))}
                </List>
              </Box>
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 1.5 }}>
          {selectedBatchDetail &&
            ((selectedBatchDetail.status as any) === 1 ||
              (selectedBatchDetail.status as any) === "Initiated" ||
              (selectedBatchDetail.status as any) === "initiated") && (
              <Button
                onClick={handleDelete}
                variant="outlined"
                color="error"
                disabled={isDeleting}
                sx={{
                  fontWeight: 700,
                  textTransform: "none",
                  borderRadius: "8px",
                  mr: "auto",
                }}
              >
                {isDeleting ? "Deleting..." : "Delete Batch"}
              </Button>
            )}
          <Button
            onClick={() => setIsDetailDialogOpen(false)}
            variant="contained"
            sx={{ fontWeight: 700, textTransform: "none", borderRadius: "8px" }}
          >
            Close
          </Button>
        </DialogActions>
      </Dialog>

      {/* Confirmation Dialog for Batch Deletion */}
      <Dialog
        open={isConfirmOpen}
        onClose={() => setIsConfirmOpen(false)}
        maxWidth="xs"
        fullWidth
        slotProps={{
          paper: {
            sx: {
              borderRadius: "12px",
              p: 1,
            },
          },
        }}
      >
        <DialogTitle sx={{ fontWeight: 800, pb: 1 }}>
          Confirm Batch Deletion
        </DialogTitle>
        <DialogContent sx={{ py: 1.5 }}>
          <Typography variant="body2" color="text.secondary">
            Are you sure you want to abandon and delete this payout batch? This
            action will release all included payments back to unbatched status.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 1.5 }}>
          <Button
            onClick={() => setIsConfirmOpen(false)}
            variant="outlined"
            color="inherit"
            disabled={isDeleting}
            sx={{ fontWeight: 700, textTransform: "none", borderRadius: "8px" }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleConfirmDelete}
            variant="contained"
            color="error"
            disabled={isDeleting}
            sx={{ fontWeight: 700, textTransform: "none", borderRadius: "8px" }}
          >
            {isDeleting ? "Deleting..." : "Confirm Delete"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Success Warning Dialog */}
      <Dialog
        open={isSuccessWarningOpen}
        onClose={() => setIsSuccessWarningOpen(false)}
        maxWidth="xs"
        fullWidth
        slotProps={{
          paper: {
            sx: {
              borderRadius: "12px",
              p: 1,
            },
          },
        }}
      >
        <DialogTitle
          sx={{
            fontWeight: 800,
            pb: 1,
            display: "flex",
            alignItems: "center",
            gap: 1,
          }}
        >
          ⚠️ Payout Batch Compiled
        </DialogTitle>
        <DialogContent sx={{ py: 1.5 }}>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            The payout batch has been successfully compiled and saved in the
            database.
          </Typography>
          <Typography
            variant="caption"
            sx={{
              display: "block",
              color: "#854d0e",
              bgcolor: "#fef3c7",
              p: 1.5,
              borderRadius: "8px",
              border: "1px solid #fde68a",
              fontWeight: 600,
            }}
          >
            IMPORTANT: The included payments are now locked inside this batch.
            They cannot be included in any other payout batch. You may view or
            delete this batch from the ledger as long as it remains in
            'Initiated' status.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 1.5 }}>
          <Button
            onClick={() => setIsSuccessWarningOpen(false)}
            variant="contained"
            sx={{
              fontWeight: 700,
              textTransform: "none",
              borderRadius: "8px",
              px: 3,
            }}
          >
            Acknowledge
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default LabBatchPaymentTab;
