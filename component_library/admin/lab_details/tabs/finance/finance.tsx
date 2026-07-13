import React, { useMemo } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Grid from "@mui/material/Grid";
import Chip from "@mui/material/Chip";
import AccountBalanceWalletIcon from "@mui/icons-material/AccountBalanceWallet";
import ReceiptIcon from "@mui/icons-material/Receipt";
import PercentIcon from "@mui/icons-material/Percent";
import ResponsiveGrid from "@/shared_features/responsive_grid";
import {
  ColumnConfig,
  FilterMenuConfigItem,
} from "@/shared_features/responsive_grid/type";
import { useFinance, MappedInvoiceItem } from "./useFinance";

interface LabFinanceTabProps {
  labId: string;
}

export const LabFinanceTab: React.FC<LabFinanceTabProps> = ({ labId }) => {
  const { paginatedData, loading, filters, setFilters, pagination, summary } =
    useFinance(labId);

  // Define Columns configuration matching grid schema
  const columns: ColumnConfig<MappedInvoiceItem>[] = useMemo(
    () => [
      {
        accessor: "invoiceNumber",
        header: "App Ref",
        sortable: true,
        width: 140,
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
        accessor: "customerName",
        header: "Customer",
        sortable: true,
        width: 180,
        Cell: ({ value }) => (
          <Typography
            variant="body2"
            sx={{ fontWeight: 700, color: "text.primary" }}
          >
            {value}
          </Typography>
        ),
      },
      {
        accessor: "date",
        header: "Paid Date",
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
        accessor: "paymentMethod",
        header: "Payment Mode",
        sortable: true,
        width: 140,
        Cell: ({ value }) => (
          <Typography
            variant="body2"
            sx={{ fontWeight: 700, color: "text.primary" }}
          >
            {value || "UPI"}
          </Typography>
        ),
      },
      {
        accessor: "amount",
        header: "Total Amount",
        sortable: true,
        width: 140,
        Cell: ({ value }) => (
          <Typography
            variant="body2"
            sx={{ fontWeight: 700, color: "#475569" }}
          >
            ₹{(value || 0).toLocaleString()}
          </Typography>
        ),
      },
      {
        accessor: "commission",
        header: "Platform Fee",
        sortable: true,
        width: 130,
        Cell: ({ value }) => (
          <Typography
            variant="body2"
            sx={{ fontWeight: 700, color: "#dc2626" }}
          >
            - ₹{(value || 0).toLocaleString()}
          </Typography>
        ),
      },
      {
        accessor: "labPayout",
        header: "Net Lab Payout",
        sortable: true,
        width: 150,
        Cell: ({ value }) => (
          <Typography
            variant="body2"
            sx={{ fontWeight: 800, color: "text.primary" }}
          >
            ₹{(value || 0).toLocaleString()}
          </Typography>
        ),
      },
      {
        accessor: "status",
        header: "Status",
        sortable: true,
        width: 120,
        Cell: ({ value }) => (
          <Chip
            label={value}
            size="small"
            variant="outlined"
            sx={{
              fontWeight: 700,
              fontSize: "11px",
              borderRadius: "6px",
              color: "#10b981",
              borderColor: "rgba(16, 185, 129, 0.25)",
              bgcolor: "rgba(16, 185, 129, 0.04)",
            }}
          />
        ),
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
        options: [{ value: "Paid", label: "Paid" }],
      },
    ],
    [],
  );

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 4 }}>
      {/* Financial Summary Widgets */}
      <Grid container spacing={3}>
        {/* Total Revenue */}
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
                <AccountBalanceWalletIcon sx={{ fontSize: "24px" }} />
              </Box>
              <Box>
                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{ fontWeight: 600 }}
                >
                  Total Payments Value
                </Typography>
                <Typography variant="h6" sx={{ fontWeight: 800 }}>
                  ₹{loading ? "..." : summary.totalRevenue.toLocaleString()}
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Total Settled */}
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
                <ReceiptIcon sx={{ fontSize: "24px" }} />
              </Box>
              <Box>
                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{ fontWeight: 600 }}
                >
                  Net Lab Revenue Payout
                </Typography>
                <Typography variant="h6" sx={{ fontWeight: 800 }}>
                  ₹{loading ? "..." : summary.totalPaid.toLocaleString()}
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Total Outstanding */}
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
                <PercentIcon sx={{ fontSize: "24px" }} />
              </Box>
              <Box>
                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{ fontWeight: 600 }}
                >
                  Platform Commission (15%)
                </Typography>
                <Typography variant="h6" sx={{ fontWeight: 800 }}>
                  ₹{loading ? "..." : summary.totalCommission.toLocaleString()}
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Invoice Ledger Table */}
      <Card
        sx={{
          border: "1px solid #e2e8f0",
          borderRadius: "12px",
          boxShadow: "none",
        }}
      >
        <CardContent sx={{ p: 3 }}>
          <Typography variant="h6" sx={{ fontWeight: 800, mb: 3 }}>
            Received Payments Ledger
          </Typography>
          <ResponsiveGrid
            data={paginatedData}
            loading={loading}
            filters={filters}
            setFilters={setFilters}
            filterMenuConfig={filterMenuConfig}
            columns={columns}
            searchPlaceholder="Search Invoice or Method..."
            pagination={pagination}
          />
        </CardContent>
      </Card>
    </Box>
  );
};

export default LabFinanceTab;
