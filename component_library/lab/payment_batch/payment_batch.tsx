import React, { useMemo } from "react";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Chip from "@mui/material/Chip";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";
import CircularProgress from "@mui/material/CircularProgress";
import RefreshIcon from "@mui/icons-material/Refresh";
import VisibilityIcon from "@mui/icons-material/Visibility";
import WarningIcon from "@mui/icons-material/Warning";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CancelIcon from "@mui/icons-material/Cancel";
import toast from "react-hot-toast";
import ResponsiveGrid from "@/shared_features/responsive_grid";
import { usePaymentBatch, LabPaymentBatchItem } from "./usePaymentBatch";
import {
  ColumnConfig,
  FilterMenuConfigItem,
} from "@/shared_features/responsive_grid/type";

const STATUS_STYLE: Record<
  string,
  { color: string; bg: string; border: string }
> = {
  Initiated: {
    color: "#2563eb",
    bg: "#eff6ff",
    border: "rgba(37,99,235,0.25)",
  },
  Settled: { color: "#10b981", bg: "#ecfdf5", border: "rgba(16,185,129,0.25)" },
  Abandoned: {
    color: "#ef4444",
    bg: "#fef2f2",
    border: "rgba(239,68,68,0.25)",
  },
};

export const PaymentBatch: React.FC = () => {
  const {
    loading,
    paginatedData,
    pagination,
    filters,
    setFilters,
    isDetailsDialogOpen,
    setIsDetailsDialogOpen,
    selectedBatch,
    setSelectedBatch,
    batchDetails,
    detailsLoading,
    actionLoading,
    fetchBatches,
    fetchBatchDetails,
    handleApproveBatch,
    handleRejectBatch,
    setBatchDetails,
  } = usePaymentBatch();

  const getStatusLabel = (status: number) => {
    if (status === 1) return "Initiated";
    if (status === 2) return "Settled";
    if (status === 3) return "Abandoned";
    return `Status ${status}`;
  };

  const columns: ColumnConfig<LabPaymentBatchItem>[] = useMemo(
    () => [
      {
        accessor: "batchNumber",
        header: "Batch Reference",
        sortable: true,
        width: 180,
        Cell: ({ row }) => (
          <Typography
            variant="body2"
            sx={{ fontWeight: 800, color: "#0f172a" }}
          >
            {row.batchNumber || `BAT-${row.id.substring(0, 8).toUpperCase()}`}
          </Typography>
        ),
      },
      {
        accessor: "totalGrossAmount",
        header: "Gross Amount",
        sortable: true,
        width: 140,
        Cell: ({ value }) => (
          <Typography variant="body2" sx={{ fontWeight: 600 }}>
            ₹{value}
          </Typography>
        ),
      },
      {
        accessor: "totalPlatformCommission",
        header: "Commission",
        sortable: true,
        width: 130,
        Cell: ({ value }) => (
          <Typography variant="body2" color="text.secondary">
            ₹{value}
          </Typography>
        ),
      },
      {
        accessor: "totalNetPayout",
        header: "Net Payout",
        sortable: true,
        width: 140,
        Cell: ({ value }) => (
          <Typography
            variant="body2"
            sx={{ fontWeight: 800, color: "#00897b" }}
          >
            ₹{value}
          </Typography>
        ),
      },
      {
        accessor: "createdAt",
        header: "Created Date",
        sortable: true,
        width: 180,
        Cell: ({ value }) => {
          const date = new Date(value);
          return (
            <Typography variant="body2" sx={{ color: "#475569" }}>
              {date.toLocaleDateString()}{" "}
              {date.toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </Typography>
          );
        },
      },
      {
        accessor: "status",
        header: "Status",
        sortable: true,
        width: 130,
        Cell: ({ value }) => {
          const label = getStatusLabel(value);
          const style = STATUS_STYLE[label] || STATUS_STYLE.Initiated;
          return (
            <Chip
              label={label}
              size="small"
              variant="outlined"
              sx={{
                fontWeight: 700,
                fontSize: "11px",
                borderRadius: "6px",
                color: style.color,
                borderColor: style.border,
                backgroundColor: style.bg,
                px: 0.5,
              }}
            />
          );
        },
      },
      {
        accessor: "id" as any,
        header: "Actions",
        width: 120,
        Cell: ({ row }) => (
          <Button
            id={`view-batch-details-btn-${row.id}`}
            size="small"
            variant="outlined"
            startIcon={<VisibilityIcon fontSize="small" />}
            onClick={() => {
              setSelectedBatch(row);
              setIsDetailsDialogOpen(true);
              fetchBatchDetails(row.id);
            }}
            sx={{
              textTransform: "none",
              fontSize: "11px",
              fontWeight: 700,
              borderColor: "#00897b",
              color: "#00897b",
              borderRadius: "6px",
              py: 0.2,
              "&:hover": {
                borderColor: "#00695c",
                backgroundColor: "rgba(0,137,123,0.04)",
              },
            }}
          >
            View
          </Button>
        ),
      },
    ],
    [setSelectedBatch, setIsDetailsDialogOpen, fetchBatchDetails],
  );

  const filterMenuConfig: FilterMenuConfigItem[] = useMemo(
    () => [
      {
        key: "status",
        label: "Status",
        type: "select",
        multiple: true,
        width: 160,
        options: [
          { value: "Initiated", label: "Initiated" },
          { value: "Settled", label: "Settled" },
          { value: "Abandoned", label: "Abandoned" },
        ],
      },
    ],
    [],
  );

  const onApproveConfirm = async () => {
    const res = await handleApproveBatch();
    if (res.success) {
      toast.success(res.message);
    } else {
      toast.error(res.message);
    }
  };

  const onRejectConfirm = async () => {
    const res = await handleRejectBatch();
    if (res.success) {
      toast.success(res.message);
    } else {
      toast.error(res.message);
    }
  };

  return (
    <Box sx={{ p: { xs: 2, md: 4 } }}>
      {/* Page Header */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 4,
          flexWrap: "wrap",
          gap: 2,
        }}
      >
        <Box>
          <Typography
            variant="h5"
            sx={{ fontWeight: 800, mb: 0.5, letterSpacing: "-0.5px" }}
          >
            Payment Batches
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Manage received batch payouts, verify platform deductions, and
            verify individual appointment payouts at lab end.
          </Typography>
        </Box>
        <Button
          id="payment-batches-refresh-btn"
          variant="outlined"
          color="inherit"
          startIcon={<RefreshIcon />}
          onClick={fetchBatches}
          sx={{
            textTransform: "none",
            fontWeight: 600,
            borderRadius: "8px",
            borderColor: "var(--color-border)",
            color: "text.primary",
            px: 2,
            py: 1,
            "&:hover": {
              backgroundColor: "rgba(0,0,0,0.02)",
            },
          }}
        >
          Refresh
        </Button>
      </Box>

      {/* Grid displaying the list of payment batches */}
      <ResponsiveGrid
        data={paginatedData}
        loading={loading}
        filters={filters}
        setFilters={setFilters}
        filterMenuConfig={filterMenuConfig}
        columns={columns}
        searchPlaceholder="Search batch number..."
        pagination={pagination}
      />

      {/* Detailed Batch Information dialog */}
      <Dialog
        open={isDetailsDialogOpen}
        onClose={() => {
          setIsDetailsDialogOpen(false);
          setSelectedBatch(null);
          setBatchDetails(null);
        }}
        maxWidth="sm"
        fullWidth
        slotProps={{
          paper: {
            sx: { borderRadius: "16px", p: 1 },
          },
        }}
      >
        <DialogTitle sx={{ fontWeight: 800, pb: 1 }}>
          Payment Batch Details (
          {selectedBatch?.batchNumber ||
            `BAT-${selectedBatch?.id.substring(0, 8).toUpperCase()}`}
          )
        </DialogTitle>
        <DialogContent
          sx={{ py: 1.5, display: "flex", flexDirection: "column", gap: 2.5 }}
        >
          {detailsLoading ? (
            <Box sx={{ display: "flex", justifyContent: "center", py: 6 }}>
              <CircularProgress sx={{ color: "#00897b" }} size={32} />
            </Box>
          ) : batchDetails ? (
            <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
              {/* Batch Info Summary */}
              <Box
                sx={{
                  p: 2,
                  bgcolor: "#f8fafc",
                  borderRadius: "12px",
                  border: "1px solid #e2e8f0",
                }}
              >
                <Box
                  sx={{
                    display: "grid",
                    gridTemplateColumns: "repeat(3, 1fr)",
                    gap: 2,
                  }}
                >
                  <Box>
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      sx={{ fontWeight: 600 }}
                    >
                      Gross Amount
                    </Typography>
                    <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>
                      ₹{batchDetails.totalGrossAmount}
                    </Typography>
                  </Box>
                  <Box>
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      sx={{ fontWeight: 600 }}
                    >
                      Commission Deduct
                    </Typography>
                    <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>
                      ₹{batchDetails.totalPlatformCommission}
                    </Typography>
                  </Box>
                  <Box>
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      sx={{ fontWeight: 600 }}
                    >
                      Net Payout
                    </Typography>
                    <Typography
                      variant="subtitle1"
                      sx={{ fontWeight: 800, color: "#00897b" }}
                    >
                      ₹{batchDetails.totalNetPayout}
                    </Typography>
                  </Box>
                </Box>
              </Box>

              {/* Appointments List inside the batch */}
              <Box>
                <Typography
                  variant="subtitle2"
                  sx={{ fontWeight: 800, mb: 1, color: "#0f172a" }}
                >
                  Associated Appointments
                </Typography>
                <TableContainer
                  component={Paper}
                  elevation={0}
                  sx={{
                    border: "1px solid #e2e8f0",
                    borderRadius: "8px",
                    maxHeight: 200,
                    overflowY: "auto",
                  }}
                >
                  <Table size="small" stickyHeader>
                    <TableHead>
                      <TableRow>
                        <TableCell sx={{ fontWeight: 800, bgcolor: "#f8fafc" }}>
                          Apt Number
                        </TableCell>
                        <TableCell sx={{ fontWeight: 800, bgcolor: "#f8fafc" }}>
                          Client Name
                        </TableCell>
                        <TableCell
                          align="right"
                          sx={{ fontWeight: 800, bgcolor: "#f8fafc" }}
                        >
                          Gross (₹)
                        </TableCell>
                        <TableCell
                          align="right"
                          sx={{ fontWeight: 800, bgcolor: "#f8fafc" }}
                        >
                          Net Payout (₹)
                        </TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {(
                        batchDetails.payments ||
                        batchDetails.appointments ||
                        []
                      )?.map((apt: any) => (
                        <TableRow
                          key={
                            apt.paymentId ||
                            apt.id ||
                            apt.appointmentId ||
                            apt.appointmentNumber
                          }
                        >
                          <TableCell sx={{ fontWeight: 700 }}>
                            {apt.appointmentNumber}
                          </TableCell>
                          <TableCell sx={{ color: "text.secondary" }}>
                            {apt.customerName ||
                              apt.customerUser?.name ||
                              "Client"}
                          </TableCell>
                          <TableCell align="right">
                            ₹{apt.totalAmount || apt.grossAmount}
                          </TableCell>
                          <TableCell
                            align="right"
                            sx={{ fontWeight: 700, color: "#00897b" }}
                          >
                            ₹{apt.labPayout || apt.netPayout}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Box>

              {/* Status Action Warnings (Only show if status is Initiated: e.g. status === 1) */}
              {selectedBatch?.status === 1 && (
                <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                  {/* Approve Warning Card */}
                  <Box
                    sx={{
                      p: 1.8,
                      bgcolor: "#f0fdf4",
                      border: "1px solid rgba(16,185,129,0.2)",
                      borderRadius: "8px",
                    }}
                  >
                    <Typography
                      variant="body2"
                      sx={{
                        color: "#10b981",
                        fontWeight: 700,
                        display: "flex",
                        alignItems: "center",
                        gap: 0.5,
                        mb: 0.5,
                      }}
                    >
                      <CheckCircleIcon sx={{ fontSize: "16px" }} /> Approve
                      Receipt
                    </Typography>
                    <Typography
                      variant="caption"
                      sx={{
                        color: "#14532d",
                        fontWeight: 600,
                        display: "block",
                      }}
                    >
                      By approving, you confirm that the batch payout amount and
                      all associated individual appointment payments have been
                      received at the lab end.
                    </Typography>
                  </Box>

                  {/* Reject Warning Card */}
                  <Box
                    sx={{
                      p: 1.8,
                      bgcolor: "#fef2f2",
                      border: "1px solid rgba(239,68,68,0.2)",
                      borderRadius: "8px",
                    }}
                  >
                    <Typography
                      variant="body2"
                      sx={{
                        color: "#ef4444",
                        fontWeight: 700,
                        display: "flex",
                        alignItems: "center",
                        gap: 0.5,
                        mb: 0.5,
                      }}
                    >
                      <WarningIcon sx={{ fontSize: "16px" }} /> Reject Batch
                    </Typography>
                    <Typography
                      variant="caption"
                      sx={{
                        color: "#7f1d1d",
                        fontWeight: 600,
                        display: "block",
                      }}
                    >
                      Warning: Rejecting this batch will mark it as Rejected and
                      all associated appointment payments will be unbatched,
                      returning them to the payout queue.
                    </Typography>
                  </Box>
                </Box>
              )}
            </Box>
          ) : (
            <Typography variant="body2" color="text.secondary">
              No batch data available.
            </Typography>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2, justifyContent: "space-between" }}>
          <Box>
            {selectedBatch?.status === 1 && (
              <Box sx={{ display: "flex", gap: 1.5 }}>
                <Button
                  id="reject-batch-btn"
                  variant="outlined"
                  color="error"
                  disabled={actionLoading}
                  onClick={onRejectConfirm}
                  sx={{
                    textTransform: "none",
                    fontWeight: 700,
                    borderRadius: "8px",
                  }}
                >
                  Reject Payout
                </Button>
                <Button
                  id="approve-batch-btn"
                  variant="contained"
                  disabled={actionLoading}
                  onClick={onApproveConfirm}
                  sx={{
                    textTransform: "none",
                    fontWeight: 700,
                    borderRadius: "8px",
                    backgroundColor: "#10b981",
                    "&:hover": { backgroundColor: "#059669" },
                  }}
                >
                  Approve
                </Button>
              </Box>
            )}
          </Box>
          <Button
            id="batch-details-close-btn"
            onClick={() => {
              setIsDetailsDialogOpen(false);
              setSelectedBatch(null);
              setBatchDetails(null);
            }}
            variant="outlined"
            color="inherit"
            sx={{ fontWeight: 700, textTransform: "none", borderRadius: "8px" }}
          >
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default PaymentBatch;
