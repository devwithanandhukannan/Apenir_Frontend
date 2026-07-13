import React, { useMemo } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Chip from "@mui/material/Chip";
import ResponsiveGrid from "@/shared_features/responsive_grid";
import {
  ColumnConfig,
  FilterMenuConfigItem,
} from "@/shared_features/responsive_grid/type";
import { useAppointments } from "./useAppointments";
import { AppointmentItem } from "@/core_components/apis/admin/labService";

interface LabAppointmentsTabProps {
  labId: string;
}

export const LabAppointmentsTab: React.FC<LabAppointmentsTabProps> = ({
  labId,
}) => {
  const { paginatedData, loading, filters, setFilters, pagination } =
    useAppointments(labId);

  // Define Columns configuration matching grid schema
  const columns: ColumnConfig<AppointmentItem>[] = useMemo(
    () => [
      {
        accessor: "appointmentNumber",
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
        accessor: "scheduledTime",
        header: "Scheduled Date",
        sortable: true,
        width: 200,
        Cell: ({ value }) => {
          const dateFormatted = new Date(value).toLocaleString([], {
            dateStyle: "medium",
            timeStyle: "short",
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
        accessor: "tests",
        header: "Test Profile(s)",
        width: 280,
        Cell: ({ value }) => (
          <Typography
            variant="body2"
            sx={{
              color: "#475569",
              fontWeight: 500,
              maxWidth: "260px",
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            {value}
          </Typography>
        ),
      },
      {
        accessor: "amount",
        header: "Amount",
        sortable: true,
        width: 130,
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
        width: 130,
        Cell: ({ value }) => {
          const isCompleted = value === "Completed";
          const isScheduled = value === "Scheduled";
          return (
            <Chip
              label={value}
              size="small"
              variant="outlined"
              sx={{
                fontWeight: 700,
                fontSize: "11px",
                borderRadius: "6px",
                color: isCompleted
                  ? "#10b981"
                  : isScheduled
                    ? "#1d4ed8"
                    : "#ef4444",
                borderColor: isCompleted
                  ? "rgba(16, 185, 129, 0.25)"
                  : isScheduled
                    ? "rgba(29, 78, 216, 0.25)"
                    : "rgba(239, 68, 68, 0.25)",
                bgcolor: isCompleted
                  ? "rgba(16, 185, 129, 0.04)"
                  : isScheduled
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
          { value: "Scheduled", label: "Scheduled" },
          { value: "Completed", label: "Completed" },
          { value: "Cancelled", label: "Cancelled" },
        ],
      },
    ],
    [],
  );

  return (
    <Card
      sx={{
        border: "1px solid #e2e8f0",
        borderRadius: "12px",
        boxShadow: "none",
      }}
    >
      <CardContent sx={{ p: 3 }}>
        <Typography variant="h6" sx={{ fontWeight: 800, mb: 3 }}>
          Scheduled Appointments
        </Typography>
        <ResponsiveGrid
          data={paginatedData}
          loading={loading}
          filters={filters}
          setFilters={setFilters}
          filterMenuConfig={filterMenuConfig}
          columns={columns}
          searchPlaceholder="Search Customer or Test..."
          pagination={pagination}
        />
      </CardContent>
    </Card>
  );
};

export default LabAppointmentsTab;
