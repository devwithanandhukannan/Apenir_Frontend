import React from "react";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import Chip from "@mui/material/Chip";
import Avatar from "@mui/material/Avatar";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import CircularProgress from "@mui/material/CircularProgress";
import Divider from "@mui/material/Divider";
import PersonIcon from "@mui/icons-material/Person";
import ScienceIcon from "@mui/icons-material/Science";
import EmailIcon from "@mui/icons-material/Email";
import PhoneIcon from "@mui/icons-material/Phone";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import BadgeIcon from "@mui/icons-material/Badge";
import ResponsiveGrid from "@/shared_features/responsive_grid";
import { useStaffConsole } from "./useStaffConsole";

// Map numeric role values to readable labels (keep in sync with hook)
const ROLE_LABELS: Record<number, string> = {
  0: "Admin",
  1: "Staff",
  2: "Lab User",
};

export const StaffConsole: React.FC = () => {
  const {
    filters,
    setFilters,
    loading,
    paginatedData,
    pagination,
    columns,
    filterMenuConfig,
    handleRowAction,
    isLabDialogOpen,
    selectedStaff,
    selectedLab,
    labLoading,
    handleCloseDialog,
  } = useStaffConsole();

  return (
    <Box sx={{ p: { xs: 2, md: 4 } }}>
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
            Staff Console
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Manage staff accounts, roles, permissions, and activity status.
          </Typography>
        </Box>
      </Box>

      {/* Reusable Grid component */}
      <ResponsiveGrid
        data={paginatedData}
        loading={loading}
        filters={filters}
        setFilters={setFilters}
        filterMenuConfig={filterMenuConfig}
        columns={columns}
        searchPlaceholder="Search by Name, Email, Phone, or ID..."
        pagination={pagination}
        onRowActionClick={handleRowAction}
        rowActionLabel="View"
      />

      {/* Staff + Lab Details Dialog */}
      <Dialog
        open={isLabDialogOpen}
        onClose={handleCloseDialog}
        maxWidth="sm"
        fullWidth
        slotProps={{
          paper: {
            sx: {
              borderRadius: "16px",
              p: 0.5,
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
            gap: 1.5,
          }}
        >
          <Avatar sx={{ bgcolor: "#7c3aed", width: 36, height: 36 }}>
            <PersonIcon sx={{ fontSize: "20px", color: "#fff" }} />
          </Avatar>
          Staff Details
        </DialogTitle>

        <DialogContent sx={{ py: 1.5 }}>
          {selectedStaff && (
            <>
              {/* Staff Info Section */}
              <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                <DetailRow
                  icon={<BadgeIcon sx={{ fontSize: 18, color: "#64748b" }} />}
                  label="Staff ID"
                  value={selectedStaff.id.substring(0, 8).toUpperCase()}
                />
                <DetailRow
                  icon={<PersonIcon sx={{ fontSize: 18, color: "#64748b" }} />}
                  label="Name"
                  value={selectedStaff.name || "—"}
                />
                <DetailRow
                  icon={<EmailIcon sx={{ fontSize: 18, color: "#64748b" }} />}
                  label="Email"
                  value={selectedStaff.email || "—"}
                />
                <DetailRow
                  icon={<PhoneIcon sx={{ fontSize: 18, color: "#64748b" }} />}
                  label="Phone"
                  value={selectedStaff.phone || "—"}
                />
                <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                  <BadgeIcon sx={{ fontSize: 18, color: "#64748b" }} />
                  <Typography
                    variant="caption"
                    sx={{ color: "#94a3b8", fontWeight: 600, minWidth: 80 }}
                  >
                    Role
                  </Typography>
                  <Chip
                    label={
                      ROLE_LABELS[selectedStaff.role] ||
                      `Role ${selectedStaff.role}`
                    }
                    size="small"
                    variant="outlined"
                    sx={{
                      fontWeight: 700,
                      fontSize: "11px",
                      borderRadius: "6px",
                      color: "#6366f1",
                      borderColor: "rgba(99, 102, 241, 0.25)",
                      backgroundColor: "rgba(99, 102, 241, 0.04)",
                    }}
                  />
                </Box>
                {selectedStaff.permissions &&
                  selectedStaff.permissions.length > 0 && (
                    <Box>
                      <Typography
                        variant="caption"
                        sx={{
                          color: "#94a3b8",
                          fontWeight: 600,
                          display: "block",
                          mb: 0.5,
                          ml: 4.25,
                        }}
                      >
                        Permissions
                      </Typography>
                      <Box
                        sx={{
                          display: "flex",
                          gap: 0.75,
                          flexWrap: "wrap",
                          ml: 4.25,
                        }}
                      >
                        {selectedStaff.permissions.map((perm, idx) => (
                          <Chip
                            key={idx}
                            label={perm}
                            size="small"
                            sx={{
                              fontWeight: 600,
                              fontSize: "10px",
                              borderRadius: "6px",
                              color: "#475569",
                              backgroundColor: "rgba(71, 85, 105, 0.08)",
                            }}
                          />
                        ))}
                      </Box>
                    </Box>
                  )}
              </Box>

              {/* Lab Info Section */}
              <Divider sx={{ my: 2.5 }} />
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 1,
                  mb: 2,
                }}
              >
                <Avatar sx={{ bgcolor: "#1d4ed8", width: 28, height: 28 }}>
                  <ScienceIcon sx={{ fontSize: "16px", color: "#fff" }} />
                </Avatar>
                <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>
                  Associated Lab
                </Typography>
              </Box>

              {!selectedStaff.labId ? (
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ ml: 4.75 }}
                >
                  No lab assigned to this staff member.
                </Typography>
              ) : labLoading ? (
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "center",
                    py: 3,
                  }}
                >
                  <CircularProgress size={28} />
                </Box>
              ) : selectedLab ? (
                <Box
                  sx={{
                    display: "flex",
                    flexDirection: "column",
                    gap: 2,
                  }}
                >
                  <DetailRow
                    icon={
                      <ScienceIcon sx={{ fontSize: 18, color: "#64748b" }} />
                    }
                    label="Lab Name"
                    value={selectedLab.name}
                  />
                  <DetailRow
                    icon={<BadgeIcon sx={{ fontSize: 18, color: "#64748b" }} />}
                    label="Lab ID"
                    value={
                      selectedLab.labId ||
                      selectedLab.id.substring(0, 8).toUpperCase()
                    }
                  />
                  <DetailRow
                    icon={
                      <LocationOnIcon sx={{ fontSize: 18, color: "#64748b" }} />
                    }
                    label="Location"
                    value={
                      [selectedLab.city, selectedLab.district]
                        .filter(Boolean)
                        .join(", ") || "—"
                    }
                  />
                  <DetailRow
                    icon={<PhoneIcon sx={{ fontSize: 18, color: "#64748b" }} />}
                    label="Phone"
                    value={selectedLab.phone || "—"}
                  />
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                    <BadgeIcon sx={{ fontSize: 18, color: "#64748b" }} />
                    <Typography
                      variant="caption"
                      sx={{
                        color: "#94a3b8",
                        fontWeight: 600,
                        minWidth: 80,
                      }}
                    >
                      Status
                    </Typography>
                    {(() => {
                      const isActive = selectedLab.isActive;
                      const label =
                        selectedLab.status ||
                        (isActive ? "Active" : "Inactive");
                      const color = isActive ? "#10b981" : "#64748b";
                      const bg = isActive
                        ? "rgba(16, 185, 129, 0.04)"
                        : "rgba(100, 116, 139, 0.04)";
                      const border = isActive
                        ? "rgba(16, 185, 129, 0.25)"
                        : "rgba(100, 116, 139, 0.25)";
                      return (
                        <Chip
                          label={label}
                          size="small"
                          variant="outlined"
                          sx={{
                            fontWeight: 700,
                            fontSize: "11px",
                            borderRadius: "6px",
                            color,
                            borderColor: border,
                            backgroundColor: bg,
                          }}
                        />
                      );
                    })()}
                  </Box>
                </Box>
              ) : (
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ ml: 4.75 }}
                >
                  Lab details not found for ID:{" "}
                  <strong>{selectedStaff.labId}</strong>
                </Typography>
              )}
            </>
          )}
        </DialogContent>

        <DialogActions sx={{ px: 3, py: 1.5 }}>
          <Button
            onClick={handleCloseDialog}
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

/** Small reusable row for label + value inside the dialog */
const DetailRow: React.FC<{
  icon: React.ReactNode;
  label: string;
  value: string;
}> = ({ icon, label, value }) => (
  <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
    {icon}
    <Typography
      variant="caption"
      sx={{ color: "#94a3b8", fontWeight: 600, minWidth: 80 }}
    >
      {label}
    </Typography>
    <Typography variant="body2" sx={{ fontWeight: 700, color: "text.primary" }}>
      {value}
    </Typography>
  </Box>
);

export default StaffConsole;
