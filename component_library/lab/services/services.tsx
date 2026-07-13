import React, { useMemo } from "react";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Chip from "@mui/material/Chip";
import Avatar from "@mui/material/Avatar";
import RefreshIcon from "@mui/icons-material/Refresh";
import ScienceIcon from "@mui/icons-material/Science";
import PaidIcon from "@mui/icons-material/Paid";
import ResponsiveGrid from "@/shared_features/responsive_grid";
import { useService, LabServiceItem } from "./useService";
import {
  ColumnConfig,
  FilterMenuConfigItem,
} from "@/shared_features/responsive_grid/type";

export const Services: React.FC = () => {
  const {
    loading,
    paginatedData,
    pagination,
    filters,
    setFilters,
    categoryOptions,
    fetchServices,
  } = useService();

  const columns: ColumnConfig<LabServiceItem>[] = useMemo(
    () => [
      {
        accessor: "name",
        header: "Service Name",
        sortable: true,
        width: 250,
        Cell: ({ row }) => (
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
            <Avatar
              sx={{ bgcolor: "rgba(0, 137, 123, 0.08)", width: 28, height: 28 }}
            >
              <ScienceIcon sx={{ fontSize: "15px", color: "#00897b" }} />
            </Avatar>
            <Box sx={{ display: "flex", flexDirection: "column" }}>
              <Typography
                variant="body2"
                sx={{
                  fontWeight: 800,
                  color: "text.primary",
                  lineHeight: 1.25,
                }}
              >
                {row.name}
              </Typography>
              {row.description && (
                <Typography
                  variant="caption"
                  sx={{
                    color: "#64748b",
                    fontWeight: 500,
                    mt: 0.3,
                    display: "-webkit-box",
                    WebkitLineClamp: 1,
                    WebkitBoxOrient: "vertical",
                    overflow: "hidden",
                  }}
                >
                  {row.description}
                </Typography>
              )}
            </Box>
          </Box>
        ),
      },
      {
        accessor: "category",
        header: "Category",
        sortable: true,
        width: 150,
        Cell: ({ value }) => (
          <Chip
            label={value || "General"}
            size="small"
            variant="outlined"
            sx={{
              fontWeight: 700,
              fontSize: "11px",
              borderRadius: "6px",
              color: "#475569",
              borderColor: "rgba(71, 85, 105, 0.25)",
              backgroundColor: "rgba(71, 85, 105, 0.04)",
              px: 0.5,
            }}
          />
        ),
      },
      {
        accessor: "basePrice",
        header: "Pricing Details",
        sortable: true,
        width: 200,
        Cell: ({ row }) => {
          const hasCustom = row.customPrice !== null;
          return (
            <Box sx={{ display: "flex", flexDirection: "column" }}>
              <Typography
                variant="body2"
                sx={{ fontWeight: 800, color: "text.primary" }}
              >
                Price: ₹{hasCustom ? row.customPrice : row.basePrice}
              </Typography>
              <Typography
                variant="caption"
                sx={{ color: "#64748b", fontWeight: 500 }}
              >
                Base Price: ₹{row.basePrice} {hasCustom && "(Overridden)"}
              </Typography>
            </Box>
          );
        },
      },
      {
        accessor: "customCommissionPct",
        header: "Commission Rate",
        sortable: true,
        width: 180,
        Cell: ({ row }) => {
          const hasCustomComm = row.customCommissionPct !== null;
          return (
            <Box sx={{ display: "flex", alignItems: "center", gap: 0.8 }}>
              <PaidIcon
                sx={{
                  fontSize: "16px",
                  color: hasCustomComm ? "#00897b" : "#64748b",
                }}
              />
              <Typography variant="body2" sx={{ fontWeight: 700 }}>
                {hasCustomComm ? `${row.customCommissionPct}%` : "Default"}
              </Typography>
            </Box>
          );
        },
      },
      {
        accessor: "isActive",
        header: "Status",
        sortable: true,
        width: 120,
        Cell: ({ value }) => {
          const color = value ? "#10b981" : "#64748b";
          const bg = value
            ? "rgba(16, 185, 129, 0.04)"
            : "rgba(100, 116, 139, 0.04)";
          const border = value
            ? "rgba(16, 185, 129, 0.25)"
            : "rgba(100, 116, 139, 0.25)";
          return (
            <Chip
              label={value ? "Active" : "Inactive"}
              size="small"
              variant="outlined"
              sx={{
                fontWeight: 700,
                fontSize: "11px",
                borderRadius: "6px",
                color: color,
                borderColor: border,
                backgroundColor: bg,
                px: 0.5,
              }}
            />
          );
        },
      },
    ],
    [],
  );

  // Dynamic filter configurations based on active categories fetched
  const filterMenuConfig: FilterMenuConfigItem[] = useMemo(
    () => [
      {
        key: "category",
        label: "Category",
        type: "select",
        multiple: true,
        width: 160,
        options: categoryOptions,
      },
    ],
    [categoryOptions],
  );

  return (
    <Box sx={{ p: { xs: 2, md: 4 } }}>
      {/* Header section with Refresh button */}
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
            Lab Services
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Manage your laboratory test catalog, customized branch overrides,
            pricing configurations, and diagnostic items.
          </Typography>
        </Box>
        <Button
          id="lab-services-refresh-btn"
          variant="outlined"
          color="inherit"
          startIcon={<RefreshIcon />}
          onClick={fetchServices}
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

      {/* Grid displaying services catalog */}
      <ResponsiveGrid
        data={paginatedData}
        loading={loading}
        filters={filters}
        setFilters={setFilters}
        filterMenuConfig={filterMenuConfig}
        columns={columns}
        searchPlaceholder="Search service name or category..."
        pagination={pagination}
      />
    </Box>
  );
};

export default Services;
