import React, { useMemo } from "react";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Chip from "@mui/material/Chip";
import Avatar from "@mui/material/Avatar";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import TextField from "@mui/material/TextField";
import MenuItem from "@mui/material/MenuItem";
import RefreshIcon from "@mui/icons-material/Refresh";
import EventNoteIcon from "@mui/icons-material/EventNote";
import LockOpenIcon from "@mui/icons-material/LockOpen";
import PeopleIcon from "@mui/icons-material/People";
import PersonIcon from "@mui/icons-material/Person";
import EmailIcon from "@mui/icons-material/Email";
import PhoneIcon from "@mui/icons-material/Phone";
import BadgeIcon from "@mui/icons-material/Badge";
import toast from "react-hot-toast";
import ResponsiveGrid from "@/shared_features/responsive_grid";
import { useAppointments, LabAppointmentItem } from "./useAppointments";
import {
  ColumnConfig,
  FilterMenuConfigItem,
} from "@/shared_features/responsive_grid/type";

const STATUS_STYLE: Record<
  string,
  { color: string; bg: string; border: string }
> = {
  Pending: { color: "#d97706", bg: "#fffbeb", border: "rgba(217,119,6,0.25)" },
  Confirmed: {
    color: "#2563eb",
    bg: "#eff6ff",
    border: "rgba(37,99,235,0.25)",
  },
  Assigned: {
    color: "#7c3aed",
    bg: "#f5f3ff",
    border: "rgba(124,58,237,0.25)",
  },
  Collected: {
    color: "#0d9488",
    bg: "#f0fdfa",
    border: "rgba(13,148,136,0.25)",
  },
  Completed: {
    color: "#10b981",
    bg: "#ecfdf5",
    border: "rgba(16,185,129,0.25)",
  },
  Cancelled: {
    color: "#ef4444",
    bg: "#fef2f2",
    border: "rgba(239,68,68,0.25)",
  },
};

export const Appointments: React.FC = () => {
  const {
    loading,
    paginatedData,
    pagination,
    filters,
    setFilters,
    getAppointmentStatusLabel,
    fetchAppointments,
    isDetailsDialogOpen,
    setIsDetailsDialogOpen,
    isAssignDialogOpen,
    setIsAssignDialogOpen,
    selectedAppointment,
    setSelectedAppointment,
    selectedStaffId,
    setSelectedStaffId,
    staffList,
    assigning,
    handleAssignStaff,
    handleRemoveStaff,
  } = useAppointments();

  const [showUnassignWarning, setShowUnassignWarning] = React.useState(false);

  const handleAssignSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = await handleAssignStaff();
    if (result.success) {
      toast.success(result.message);
    } else {
      toast.error(result.message);
    }
  };

  const columns: ColumnConfig<LabAppointmentItem>[] = useMemo(
    () => [
      {
        accessor: "appointmentNumber",
        header: "Appt Number",
        sortable: true,
        width: 150,
        Cell: ({ row }) => (
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.2 }}>
            <Avatar
              sx={{ bgcolor: "rgba(0, 137, 123, 0.08)", width: 28, height: 28 }}
            >
              <EventNoteIcon sx={{ fontSize: "15px", color: "#00897b" }} />
            </Avatar>
            <Typography
              variant="body2"
              sx={{ fontWeight: 800, color: "#00897b" }}
            >
              {row.appointmentNumber || "—"}
            </Typography>
          </Box>
        ),
      },
      {
        accessor: "locationAddress",
        header: "Location & Address",
        sortable: true,
        width: 250,
        Cell: ({ row }) => (
          <Box sx={{ display: "flex", flexDirection: "column" }}>
            <Typography
              variant="body2"
              sx={{ fontWeight: 800, color: "text.primary", lineHeight: 1.25 }}
            >
              {row.locationAddress || "Address N/A"}
            </Typography>
            {(row.buildingDetails || row.floor || row.landmark) && (
              <Typography
                variant="caption"
                sx={{ color: "#64748b", fontWeight: 500, mt: 0.3 }}
              >
                {[
                  row.buildingDetails,
                  row.floor ? `Floor ${row.floor}` : null,
                  row.landmark ? `Near ${row.landmark}` : null,
                ]
                  .filter(Boolean)
                  .join(", ")}
              </Typography>
            )}
          </Box>
        ),
      },
      {
        accessor: "memberCount",
        header: "Members",
        sortable: true,
        width: 110,
        Cell: ({ value }) => (
          <Box sx={{ display: "flex", alignItems: "center", gap: 0.8 }}>
            <PeopleIcon sx={{ fontSize: "16px", color: "#64748b" }} />
            <Typography variant="body2" sx={{ fontWeight: 700 }}>
              {value} {value === 1 ? "member" : "members"}
            </Typography>
          </Box>
        ),
      },
      {
        accessor: "labPayout",
        header: "Payout Info",
        sortable: true,
        width: 180,
        Cell: ({ row }) => (
          <Box sx={{ display: "flex", flexDirection: "column" }}>
            <Typography
              variant="body2"
              sx={{ fontWeight: 800, color: "text.primary" }}
            >
              Payout: ₹{row.labPayout}
            </Typography>
            <Typography
              variant="caption"
              sx={{ color: "#64748b", fontWeight: 500 }}
            >
              Gross: ₹{row.totalAmount} | Comm: ₹{row.platformCommission}
            </Typography>
          </Box>
        ),
      },
      {
        accessor: "passcode",
        header: "Passcode",
        sortable: true,
        width: 120,
        Cell: ({ value }) => (
          <Chip
            label={value || "—"}
            size="small"
            icon={
              <LockOpenIcon style={{ fontSize: "11px", color: "#10b981" }} />
            }
            sx={{
              fontWeight: 700,
              fontSize: "11px",
              borderRadius: "6px",
              color: "#10b981",
              borderColor: "rgba(15, 118, 110, 0.25)",
              backgroundColor: "rgba(15, 118, 110, 0.04)",
              px: 0.5,
            }}
            variant="outlined"
          />
        ),
      },
      {
        accessor: "assignedStaff",
        header: "Assigned Staff",
        width: 200,
        Cell: ({ row }) => {
          const hasStaff = !!row.assignedStaff;
          const staffName = row.assignedStaff?.name || "Unassigned";
          return (
            <Box sx={{ display: "flex", flexDirection: "column", gap: 0.8 }}>
              {(row.status === 4 || row.status === 5 || row.status === 6) && (
                <Typography
                  variant="body2"
                  sx={{
                    fontWeight: 700,
                    color: hasStaff ? "#0f172a" : "#64748b",
                  }}
                >
                  {staffName}
                </Typography>
              )}
              {(row.status === 1 || row.status === 2 || row.status === 3) && (
                <Box sx={{ display: "flex", gap: 1 }}>
                  {hasStaff && (
                    <Button
                      id={`view-staff-btn-${row.id}`}
                      size="small"
                      variant="outlined"
                      onClick={() => {
                        setSelectedAppointment(row);
                        setIsDetailsDialogOpen(true);
                      }}
                      sx={{
                        fontSize: "10px",
                        py: 0.2,
                        px: 1,
                        textTransform: "none",
                        fontWeight: 600,
                        borderColor: "#00897b",
                        color: "#00897b",
                        "&:hover": {
                          borderColor: "#00695c",
                          bgcolor: "rgba(0, 137, 123, 0.04)",
                        },
                      }}
                    >
                      View Staff
                    </Button>
                  )}
                  <Button
                    id={`assign-staff-btn-${row.id}`}
                    size="small"
                    variant="contained"
                    onClick={() => {
                      setSelectedAppointment(row);
                      if (hasStaff) {
                        setSelectedStaffId(row.assignedStaffId || "");
                      }
                      setIsAssignDialogOpen(true);
                    }}
                    sx={{
                      fontSize: "10px",
                      py: 0.2,
                      px: 1,
                      textTransform: "none",
                      fontWeight: 700,
                      bgcolor: "#00897b",
                      color: "#fff",
                      boxShadow: "none",
                      "&:hover": {
                        bgcolor: "#00695c",
                        boxShadow: "none",
                      },
                    }}
                  >
                    {hasStaff ? "Reassign" : "Assign Staff"}
                  </Button>
                </Box>
              )}
            </Box>
          );
        },
      },
      {
        accessor: "status",
        header: "Status",
        sortable: true,
        width: 130,
        Cell: ({ row }) => {
          const label = getAppointmentStatusLabel(row.status);
          const style = STATUS_STYLE[label] || {
            color: "#64748b",
            bg: "rgba(100, 116, 139, 0.04)",
            border: "rgba(100, 116, 139, 0.25)",
          };
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
    ],
    [
      getAppointmentStatusLabel,
      setSelectedAppointment,
      setIsDetailsDialogOpen,
      setSelectedStaffId,
      setIsAssignDialogOpen,
    ],
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
          { value: "Pending", label: "Pending" },
          { value: "Confirmed", label: "Confirmed" },
          { value: "Assigned", label: "Assigned" },
          { value: "Collected", label: "Collected" },
          { value: "Completed", label: "Completed" },
          { value: "Cancelled", label: "Cancelled" },
        ],
      },
    ],
    [],
  );

  return (
    <Box sx={{ p: { xs: 2, md: 4 } }}>
      {/* Header section with inline action button */}
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
            Lab Appointments
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Monitor diagnostics bookings, home collections address requests, and
            details of scheduled appointments.
          </Typography>
        </Box>
        <Button
          id="lab-appt-refresh-btn"
          variant="outlined"
          color="inherit"
          startIcon={<RefreshIcon />}
          onClick={fetchAppointments}
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

      {/* Grid displaying appointments */}
      <ResponsiveGrid
        data={paginatedData}
        loading={loading}
        filters={filters}
        setFilters={setFilters}
        filterMenuConfig={filterMenuConfig}
        columns={columns}
        searchPlaceholder="Search Appt Number, Address, or Passcode..."
        pagination={pagination}
      />

      {/* Assigned Staff Details Dialog */}
      <Dialog
        open={isDetailsDialogOpen}
        onClose={() => setIsDetailsDialogOpen(false)}
        maxWidth="xs"
        fullWidth
        slotProps={{
          paper: {
            sx: { borderRadius: "16px", p: 1 },
          },
        }}
      >
        <DialogTitle sx={{ fontWeight: 800, pb: 1 }}>
          Assigned Staff Details
        </DialogTitle>
        <DialogContent
          sx={{ py: 1.5, display: "flex", flexDirection: "column", gap: 2.5 }}
        >
          {selectedAppointment?.assignedStaff ? (
            <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                <Avatar sx={{ bgcolor: "#00897b", width: 44, height: 44 }}>
                  <PersonIcon />
                </Avatar>
                <Box>
                  <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>
                    {selectedAppointment.assignedStaff.name || "N/A"}
                  </Typography>
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{ fontWeight: 600 }}
                  >
                    ID:{" "}
                    {selectedAppointment.assignedStaffId
                      ?.substring(0, 8)
                      .toUpperCase() || "N/A"}
                  </Typography>
                </Box>
              </Box>

              <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                <EmailIcon color="action" fontSize="small" />
                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                  {selectedAppointment.assignedStaff.email || "N/A"}
                </Typography>
              </Box>

              <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                <PhoneIcon color="action" fontSize="small" />
                <Typography variant="body2" sx={{ fontWeight: 800 }}>
                  {selectedAppointment.assignedStaff.phone || "N/A"}
                </Typography>
              </Box>

              <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                <BadgeIcon color="action" fontSize="small" />
                <Chip
                  label={selectedAppointment.assignedStaff.role || "Technician"}
                  size="small"
                  sx={{
                    fontWeight: 700,
                    fontSize: "11px",
                    color: "#00897b",
                    bgcolor: "rgba(0,137,123,0.05)",
                  }}
                />
              </Box>
            </Box>
          ) : (
            <Typography variant="body2" color="text.secondary">
              No staff has been assigned to this appointment.
            </Typography>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button
            id="view-staff-close-btn"
            onClick={() => setIsDetailsDialogOpen(false)}
            variant="outlined"
            color="inherit"
            sx={{ fontWeight: 700, textTransform: "none", borderRadius: "8px" }}
          >
            Close
          </Button>
        </DialogActions>
      </Dialog>

      {/* Assign Staff Dialog */}
      <Dialog
        open={isAssignDialogOpen}
        onClose={() => {
          setIsAssignDialogOpen(false);
          setShowUnassignWarning(false);
        }}
        maxWidth="xs"
        fullWidth
        slotProps={{
          paper: {
            sx: { borderRadius: "16px", p: 1 },
          },
        }}
      >
        <DialogTitle sx={{ fontWeight: 800, pb: 1 }}>
          Assign Staff Member
        </DialogTitle>
        <Box component="form" onSubmit={handleAssignSubmit}>
          <DialogContent
            sx={{ py: 1.5, display: "flex", flexDirection: "column", gap: 2.5 }}
          >
            {showUnassignWarning ? (
              <Box
                sx={{
                  p: 2,
                  bgcolor: "#fee2e2",
                  border: "1px solid rgba(239, 68, 68, 0.2)",
                  borderRadius: "8px",
                }}
              >
                <Typography
                  variant="body2"
                  sx={{
                    color: "#ef4444",
                    fontWeight: 700,
                    mb: 0.5,
                    display: "flex",
                    alignItems: "center",
                    gap: 0.5,
                  }}
                >
                  ⚠️ Warning
                </Typography>
                <Typography
                  variant="caption"
                  sx={{
                    color: "#7f1d1d",
                    fontWeight: 600,
                    display: "block",
                    mb: 2,
                  }}
                >
                  Are you sure you want to remove the assigned staff? This will
                  set the appointment back to an unassigned state.
                </Typography>
                <Box sx={{ display: "flex", gap: 1 }}>
                  <Button
                    id="unassign-confirm-btn"
                    size="small"
                    variant="contained"
                    color="error"
                    disabled={assigning}
                    onClick={async () => {
                      const res = await handleRemoveStaff();
                      if (res.success) {
                        toast.success(res.message);
                      } else {
                        toast.error(res.message);
                      }
                      setShowUnassignWarning(false);
                    }}
                    sx={{
                      textTransform: "none",
                      fontWeight: 700,
                      fontSize: "11px",
                      py: 0.5,
                    }}
                  >
                    Yes, Remove
                  </Button>
                  <Button
                    id="unassign-cancel-btn"
                    size="small"
                    variant="outlined"
                    onClick={() => setShowUnassignWarning(false)}
                    sx={{
                      textTransform: "none",
                      fontWeight: 600,
                      fontSize: "11px",
                      py: 0.5,
                    }}
                  >
                    Cancel
                  </Button>
                </Box>
              </Box>
            ) : (
              <>
                <Typography variant="body2" color="text.secondary">
                  Select one available staff member to assign to appointment{" "}
                  <strong>#{selectedAppointment?.appointmentNumber}</strong>.
                </Typography>

                <TextField
                  select
                  label="Select Staff"
                  fullWidth
                  required
                  value={selectedStaffId}
                  onChange={(e) => setSelectedStaffId(e.target.value)}
                  slotProps={{
                    input: {
                      startAdornment: (
                        <PersonIcon
                          color="action"
                          fontSize="small"
                          sx={{ mr: 1 }}
                        />
                      ),
                    },
                  }}
                  sx={{ "& .MuiOutlinedInput-root": { borderRadius: "10px" } }}
                >
                  {staffList.length === 0 ? (
                    <MenuItem value="" disabled>
                      No staff members found
                    </MenuItem>
                  ) : (
                    staffList.map((s) => (
                      <MenuItem key={s.id} value={s.id}>
                        {s.name} ({s.role || "Technician"})
                      </MenuItem>
                    ))
                  )}
                </TextField>

                {selectedAppointment?.assignedStaff && (
                  <Button
                    id="trigger-unassign-btn"
                    variant="text"
                    color="error"
                    onClick={() => setShowUnassignWarning(true)}
                    sx={{
                      textTransform: "none",
                      fontWeight: 700,
                      alignSelf: "flex-start",
                      fontSize: "12px",
                      mt: -1,
                      "&:hover": {
                        backgroundColor: "rgba(239, 68, 68, 0.04)",
                      },
                    }}
                  >
                    Remove Assigned Staff
                  </Button>
                )}
              </>
            )}
          </DialogContent>
          <DialogActions sx={{ px: 3, py: 2 }}>
            <Button
              id="assign-staff-cancel-btn"
              onClick={() => {
                setIsAssignDialogOpen(false);
                setShowUnassignWarning(false);
              }}
              variant="outlined"
              color="inherit"
              disabled={assigning}
              sx={{
                fontWeight: 700,
                textTransform: "none",
                borderRadius: "8px",
              }}
            >
              Cancel
            </Button>
            <Button
              id="assign-staff-submit-btn"
              type="submit"
              variant="contained"
              disabled={assigning || !selectedStaffId || showUnassignWarning}
              sx={{
                fontWeight: 700,
                textTransform: "none",
                borderRadius: "8px",
                px: 3,
                backgroundColor: "#00897b",
                "&:hover": { backgroundColor: "#00695c" },
              }}
            >
              {assigning ? "Assigning..." : "Assign"}
            </Button>
          </DialogActions>
        </Box>
      </Dialog>
    </Box>
  );
};

export default Appointments;
