import React, { useMemo } from "react";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Avatar from "@mui/material/Avatar";
import Chip from "@mui/material/Chip";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import TextField from "@mui/material/TextField";
import MenuItem from "@mui/material/MenuItem";
import IconButton from "@mui/material/IconButton";
import Tooltip from "@mui/material/Tooltip";
import Switch from "@mui/material/Switch";
import FormControlLabel from "@mui/material/FormControlLabel";
import AddIcon from "@mui/icons-material/Add";
import PersonIcon from "@mui/icons-material/Person";
import EmailIcon from "@mui/icons-material/Email";
import PhoneIcon from "@mui/icons-material/Phone";
import BadgeIcon from "@mui/icons-material/Badge";
import VisibilityIcon from "@mui/icons-material/Visibility";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import toast from "react-hot-toast";
import ResponsiveGrid from "@/shared_features/responsive_grid";
import { useStaff, LabStaffMember } from "./useStaff";
import {
  ColumnConfig,
  FilterMenuConfigItem,
} from "@/shared_features/responsive_grid/type";

export const Staff: React.FC = () => {
  const {
    labName,
    loading,
    paginatedData,
    pagination,
    filters,
    setFilters,
    isAddDialogOpen,
    setIsAddDialogOpen,
    addName,
    setAddName,
    addEmail,
    setAddEmail,
    isSubmitting,
    handleAddStaffSubmit,
    getMemberStatus,
    isViewDialogOpen,
    setIsViewDialogOpen,
    selectedStaff,
    setSelectedStaff,
    isEditDialogOpen,
    setIsEditDialogOpen,
    editName,
    setEditName,
    editEmail,
    setEditEmail,
    editPhone,
    setEditPhone,
    editIsActive,
    setEditIsActive,
    updating,
    handleEditStaffSubmit,
    isDeleteDialogOpen,
    setIsDeleteDialogOpen,
    deleting,
    handleDeleteStaff,
  } = useStaff();

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = await handleAddStaffSubmit();
    if (result.success) {
      toast.success(result.message);
    } else {
      toast.error(result.message);
    }
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = await handleEditStaffSubmit();
    if (result.success) {
      toast.success(result.message);
    } else {
      toast.error(result.message);
    }
  };

  const handleDeleteSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = await handleDeleteStaff();
    if (result.success) {
      toast.success(result.message);
    } else {
      toast.error(result.message);
    }
  };

  // Columns Configuration for the ResponsiveGrid
  const columns: ColumnConfig<LabStaffMember>[] = useMemo(
    () => [
      {
        accessor: "id",
        header: "Staff ID",
        sortable: true,
        width: 140,
        Cell: ({ row }) => {
          const idLabel = row.id.substring(0, 8).toUpperCase();
          return (
            <Typography
              variant="body2"
              sx={{ fontWeight: 800, color: "#0f172a" }}
            >
              {idLabel}
            </Typography>
          );
        },
      },
      {
        accessor: "name",
        header: "Name",
        sortable: true,
        width: 220,
        Cell: ({ row }) => {
          const initials = row.name
            ? row.name
                .split(" ")
                .map((n: string) => n[0])
                .join("")
                .substring(0, 2)
                .toUpperCase()
            : "S";
          return (
            <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
              <Avatar
                sx={{
                  bgcolor: "#00897b",
                  width: 28,
                  height: 28,
                  fontSize: "12px",
                  fontWeight: 700,
                }}
              >
                {initials}
              </Avatar>
              <Typography
                variant="body2"
                sx={{ fontWeight: 800, color: "#0f172a" }}
              >
                {row.name || "—"}
              </Typography>
            </Box>
          );
        },
      },
      {
        accessor: "email",
        header: "Email Address",
        sortable: true,
        width: 240,
        Cell: ({ value }) => (
          <Typography
            variant="body2"
            sx={{ fontWeight: 600, color: "#0f172a" }}
          >
            {value || "—"}
          </Typography>
        ),
      },
      {
        accessor: "phone",
        header: "Phone Number",
        sortable: true,
        width: 160,
        Cell: ({ value }) => (
          <Typography
            variant="body2"
            sx={{ fontWeight: 800, color: "#0f172a" }}
          >
            {value || "—"}
          </Typography>
        ),
      },
      {
        accessor: "role",
        header: "Role",
        sortable: true,
        width: 150,
        Cell: ({ row }) => (
          <Chip
            label={row.role}
            size="small"
            variant="outlined"
            sx={{
              fontWeight: 700,
              fontSize: "11px",
              borderRadius: "6px",
              color: "#00897b",
              borderColor: "rgba(0, 137, 123, 0.25)",
              backgroundColor: "rgba(0, 137, 123, 0.04)",
              px: 0.5,
            }}
          />
        ),
      },
      {
        accessor: "status",
        header: "Status",
        sortable: true,
        width: 130,
        Cell: ({ row }) => {
          const statusVal = getMemberStatus(row);
          const isActive = statusVal === "Active";
          const color = isActive ? "#10b981" : "#64748b";
          const bg = isActive
            ? "rgba(16, 185, 129, 0.04)"
            : "rgba(100, 116, 139, 0.04)";
          const border = isActive
            ? "rgba(16, 185, 129, 0.25)"
            : "rgba(100, 116, 139, 0.25)";
          return (
            <Chip
              label={statusVal}
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
      {
        accessor: "id" as any,
        header: "Actions",
        width: 150,
        Cell: ({ row }) => (
          <Box sx={{ display: "flex", gap: 0.5 }}>
            <Tooltip title="View Details">
              <IconButton
                id={`view-staff-action-${row.id}`}
                size="small"
                onClick={() => {
                  setSelectedStaff(row);
                  setIsViewDialogOpen(true);
                }}
                sx={{ color: "#00897b" }}
              >
                <VisibilityIcon fontSize="small" />
              </IconButton>
            </Tooltip>
            <Tooltip title="Edit Details">
              <IconButton
                id={`edit-staff-action-${row.id}`}
                size="small"
                onClick={() => {
                  setSelectedStaff(row);
                  setEditName(row.name || "");
                  setEditEmail(row.email || "");
                  setEditPhone(row.phone || "");
                  setEditIsActive(row.isActive !== false);
                  setIsEditDialogOpen(true);
                }}
                sx={{ color: "#2563eb" }}
              >
                <EditIcon fontSize="small" />
              </IconButton>
            </Tooltip>
            <Tooltip title="Delete Member">
              <IconButton
                id={`delete-staff-action-${row.id}`}
                size="small"
                onClick={() => {
                  setSelectedStaff(row);
                  setIsDeleteDialogOpen(true);
                }}
                sx={{ color: "#ef4444" }}
              >
                <DeleteIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </Box>
        ),
      },
    ],
    [
      getMemberStatus,
      setSelectedStaff,
      setIsViewDialogOpen,
      setEditName,
      setEditEmail,
      setEditPhone,
      setEditIsActive,
      setIsEditDialogOpen,
      setIsDeleteDialogOpen,
    ],
  );

  // Dynamic filter dropdown configurations
  const filterMenuConfig: FilterMenuConfigItem[] = useMemo(
    () => [
      {
        key: "status",
        label: "Status",
        type: "select",
        multiple: true,
        width: 160,
        options: [
          { value: "Active", label: "Active" },
          { value: "Inactive", label: "Inactive" },
        ],
      },
    ],
    [],
  );

  return (
    <Box sx={{ p: { xs: 2, md: 4 } }}>
      {/* Header with Page Title and Inline Action Button */}
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
            Staff of {labName}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Manage your laboratory pathologists, technicians, phlebotomists, and
            other personnel.
          </Typography>
        </Box>
        <Button
          id="lab-staff-add-btn"
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setIsAddDialogOpen(true)}
          sx={{
            textTransform: "none",
            fontWeight: 700,
            borderRadius: "8px",
            px: 2.5,
            py: 1.1,
            backgroundColor: "#00897b",
            boxShadow: "0 4px 14px rgba(0,137,123,0.35)",
            transition: "all 0.2s ease",
            "&:hover": {
              backgroundColor: "#00695c",
              boxShadow: "0 6px 20px rgba(0,137,123,0.45)",
              transform: "translateY(-1px)",
            },
            "&:active": {
              transform: "translateY(0)",
            },
          }}
        >
          Add Staff
        </Button>
      </Box>

      {/* Grid displaying the list of staff members */}
      <ResponsiveGrid
        data={paginatedData}
        loading={loading}
        filters={filters}
        setFilters={setFilters}
        filterMenuConfig={filterMenuConfig}
        columns={columns}
        searchPlaceholder="Search by Name, Email, Phone, or Role..."
        pagination={pagination}
      />

      {/* Add Staff Dialog */}
      <Dialog
        open={isAddDialogOpen}
        onClose={() => setIsAddDialogOpen(false)}
        maxWidth="xs"
        fullWidth
        slotProps={{
          paper: {
            sx: { borderRadius: "16px", p: 1 },
          },
        }}
      >
        <DialogTitle sx={{ fontWeight: 800, pb: 1 }}>
          Invite Staff Member
        </DialogTitle>
        <Box component="form" onSubmit={handleAddSubmit}>
          <DialogContent
            sx={{ py: 1.5, display: "flex", flexDirection: "column", gap: 2.5 }}
          >
            <Typography variant="body2" color="text.secondary">
              Enter the name and email of the staff member to send them an
              invitation to the lab portal.
            </Typography>
            <TextField
              label="Full Name"
              placeholder="Enter name"
              fullWidth
              required
              value={addName}
              onChange={(e) => setAddName(e.target.value)}
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
            />
            <TextField
              label="Email Address"
              placeholder="name@example.com"
              type="email"
              fullWidth
              required
              value={addEmail}
              onChange={(e) => setAddEmail(e.target.value)}
              slotProps={{
                input: {
                  startAdornment: (
                    <EmailIcon color="action" fontSize="small" sx={{ mr: 1 }} />
                  ),
                },
              }}
              sx={{ "& .MuiOutlinedInput-root": { borderRadius: "10px" } }}
            />
          </DialogContent>
          <DialogActions sx={{ px: 3, py: 2 }}>
            <Button
              id="lab-staff-cancel-btn"
              onClick={() => setIsAddDialogOpen(false)}
              variant="outlined"
              color="inherit"
              disabled={isSubmitting}
              sx={{
                fontWeight: 700,
                textTransform: "none",
                borderRadius: "8px",
              }}
            >
              Cancel
            </Button>
            <Button
              id="lab-staff-submit-btn"
              type="submit"
              variant="contained"
              disabled={isSubmitting || !addName || !addEmail}
              sx={{
                fontWeight: 700,
                textTransform: "none",
                borderRadius: "8px",
                px: 3,
                backgroundColor: "#00897b",
                "&:hover": { backgroundColor: "#00695c" },
              }}
            >
              {isSubmitting ? "Inviting..." : "Invite"}
            </Button>
          </DialogActions>
        </Box>
      </Dialog>

      {/* View Staff Details Dialog */}
      <Dialog
        open={isViewDialogOpen}
        onClose={() => setIsViewDialogOpen(false)}
        maxWidth="xs"
        fullWidth
        slotProps={{
          paper: {
            sx: { borderRadius: "16px", p: 1 },
          },
        }}
      >
        <DialogTitle sx={{ fontWeight: 800, pb: 1 }}>
          Staff Member Details
        </DialogTitle>
        <DialogContent
          sx={{ py: 1.5, display: "flex", flexDirection: "column", gap: 2.5 }}
        >
          {selectedStaff && (
            <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                <Avatar
                  sx={{
                    bgcolor: "#00897b",
                    width: 44,
                    height: 44,
                    fontSize: "16px",
                    fontWeight: 700,
                  }}
                >
                  {selectedStaff.name
                    ? selectedStaff.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")
                        .substring(0, 2)
                        .toUpperCase()
                    : "S"}
                </Avatar>
                <Box>
                  <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>
                    {selectedStaff.name || "N/A"}
                  </Typography>
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{ fontWeight: 600 }}
                  >
                    ID: {selectedStaff.id.substring(0, 8).toUpperCase()}
                  </Typography>
                </Box>
              </Box>

              <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                <EmailIcon color="action" fontSize="small" />
                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                  {selectedStaff.email || "—"}
                </Typography>
              </Box>

              <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                <PhoneIcon color="action" fontSize="small" />
                <Typography variant="body2" sx={{ fontWeight: 800 }}>
                  {selectedStaff.phone || "—"}
                </Typography>
              </Box>

              <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                <BadgeIcon color="action" fontSize="small" />
                <Chip
                  label={selectedStaff.role || "Technician"}
                  size="small"
                  variant="outlined"
                  sx={{
                    fontWeight: 700,
                    fontSize: "11px",
                    color: "#00897b",
                    borderColor: "rgba(0, 137, 123, 0.25)",
                    backgroundColor: "rgba(0, 137, 123, 0.04)",
                  }}
                />
              </Box>

              <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                <Typography
                  variant="body2"
                  sx={{ fontWeight: 700, color: "text.secondary" }}
                >
                  Status:
                </Typography>
                <Chip
                  label={
                    selectedStaff.isActive !== false ? "Active" : "Inactive"
                  }
                  size="small"
                  variant="outlined"
                  sx={{
                    fontWeight: 700,
                    fontSize: "11px",
                    color:
                      selectedStaff.isActive !== false ? "#10b981" : "#64748b",
                    borderColor:
                      selectedStaff.isActive !== false
                        ? "rgba(16, 185, 129, 0.25)"
                        : "rgba(100, 116, 139, 0.25)",
                    backgroundColor:
                      selectedStaff.isActive !== false
                        ? "rgba(16, 185, 129, 0.04)"
                        : "rgba(100, 116, 139, 0.04)",
                  }}
                />
              </Box>
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button
            id="view-staff-details-close-btn"
            onClick={() => setIsViewDialogOpen(false)}
            variant="outlined"
            color="inherit"
            sx={{ fontWeight: 700, textTransform: "none", borderRadius: "8px" }}
          >
            Close
          </Button>
        </DialogActions>
      </Dialog>

      {/* Edit Staff Details Dialog */}
      <Dialog
        open={isEditDialogOpen}
        onClose={() => setIsEditDialogOpen(false)}
        maxWidth="xs"
        fullWidth
        slotProps={{
          paper: {
            sx: { borderRadius: "16px", p: 1 },
          },
        }}
      >
        <DialogTitle sx={{ fontWeight: 800, pb: 1 }}>
          Edit Staff Details
        </DialogTitle>
        <Box component="form" onSubmit={handleEditSubmit}>
          <DialogContent
            sx={{ py: 1.5, display: "flex", flexDirection: "column", gap: 2.5 }}
          >
            <TextField
              label="Full Name"
              placeholder="Enter name"
              fullWidth
              required
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
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
            />
            <TextField
              label="Email Address"
              placeholder="name@example.com"
              type="email"
              fullWidth
              required
              value={editEmail}
              onChange={(e) => setEditEmail(e.target.value)}
              slotProps={{
                input: {
                  startAdornment: (
                    <EmailIcon color="action" fontSize="small" sx={{ mr: 1 }} />
                  ),
                },
              }}
              sx={{ "& .MuiOutlinedInput-root": { borderRadius: "10px" } }}
            />
            <TextField
              label="Phone Number"
              placeholder="+91 XXXXX XXXXX"
              fullWidth
              required
              value={editPhone}
              onChange={(e) => setEditPhone(e.target.value)}
              slotProps={{
                input: {
                  startAdornment: (
                    <PhoneIcon color="action" fontSize="small" sx={{ mr: 1 }} />
                  ),
                },
              }}
              sx={{ "& .MuiOutlinedInput-root": { borderRadius: "10px" } }}
            />
            <FormControlLabel
              control={
                <Switch
                  id="edit-staff-active-switch"
                  checked={editIsActive}
                  onChange={(e) => setEditIsActive(e.target.checked)}
                  sx={{
                    "& .MuiSwitch-switchBase.Mui-checked": {
                      color: "#00897b",
                    },
                    "& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track": {
                      backgroundColor: "#00897b",
                    },
                  }}
                />
              }
              label={
                <Typography
                  variant="body2"
                  sx={{ fontWeight: 700, color: "#0f172a" }}
                >
                  Staff Account Active
                </Typography>
              }
            />
          </DialogContent>
          <DialogActions sx={{ px: 3, py: 2 }}>
            <Button
              id="edit-staff-cancel-btn"
              onClick={() => setIsEditDialogOpen(false)}
              variant="outlined"
              color="inherit"
              disabled={updating}
              sx={{
                fontWeight: 700,
                textTransform: "none",
                borderRadius: "8px",
              }}
            >
              Cancel
            </Button>
            <Button
              id="edit-staff-submit-btn"
              type="submit"
              variant="contained"
              disabled={updating || !editName || !editEmail || !editPhone}
              sx={{
                fontWeight: 700,
                textTransform: "none",
                borderRadius: "8px",
                px: 3,
                backgroundColor: "#00897b",
                "&:hover": { backgroundColor: "#00695c" },
              }}
            >
              {updating ? "Saving..." : "Save Changes"}
            </Button>
          </DialogActions>
        </Box>
      </Dialog>

      {/* Delete Staff Dialog */}
      <Dialog
        open={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        maxWidth="xs"
        fullWidth
        slotProps={{
          paper: {
            sx: { borderRadius: "16px", p: 1 },
          },
        }}
      >
        <DialogTitle sx={{ fontWeight: 800, pb: 1 }}>
          Delete Staff Member
        </DialogTitle>
        <Box component="form" onSubmit={handleDeleteSubmit}>
          <DialogContent sx={{ py: 1.5 }}>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>
              Are you sure you want to delete staff member{" "}
              <strong>{selectedStaff?.name}</strong>?
            </Typography>
            <Typography
              variant="caption"
              sx={{
                display: "block",
                color: "#ef4444",
                fontWeight: 700,
                bgcolor: "#fef2f2",
                p: 1.5,
                border: "1px solid rgba(239,68,68,0.2)",
                borderRadius: "8px",
              }}
            >
              ⚠️ Warning: This action cannot be undone. This staff member will
              be removed from all assigned active cases.
            </Typography>
          </DialogContent>
          <DialogActions sx={{ px: 3, py: 2 }}>
            <Button
              id="delete-staff-cancel-btn"
              onClick={() => setIsDeleteDialogOpen(false)}
              variant="outlined"
              color="inherit"
              disabled={deleting}
              sx={{
                fontWeight: 700,
                textTransform: "none",
                borderRadius: "8px",
              }}
            >
              Cancel
            </Button>
            <Button
              id="delete-staff-confirm-btn"
              type="submit"
              variant="contained"
              color="error"
              disabled={deleting}
              sx={{
                fontWeight: 700,
                textTransform: "none",
                borderRadius: "8px",
                px: 3,
              }}
            >
              {deleting ? "Deleting..." : "Yes, Delete"}
            </Button>
          </DialogActions>
        </Box>
      </Dialog>
    </Box>
  );
};

export default Staff;
