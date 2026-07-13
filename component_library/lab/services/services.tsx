import React, { useState, useMemo, useCallback } from "react";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Chip from "@mui/material/Chip";
import Avatar from "@mui/material/Avatar";
import IconButton from "@mui/material/IconButton";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import TextField from "@mui/material/TextField";
import Switch from "@mui/material/Switch";
import Tooltip from "@mui/material/Tooltip";
import CircularProgress from "@mui/material/CircularProgress";
import Divider from "@mui/material/Divider";
import InputAdornment from "@mui/material/InputAdornment";
import RefreshIcon from "@mui/icons-material/Refresh";
import AddIcon from "@mui/icons-material/Add";
import ScienceIcon from "@mui/icons-material/Science";
import EditIcon from "@mui/icons-material/Edit";
import CheckIcon from "@mui/icons-material/Check";
import CloseIcon from "@mui/icons-material/Close";
import toast, { Toaster } from "react-hot-toast";
import ResponsiveGrid from "@/shared_features/responsive_grid";
import {
  useService,
  LabServiceItem,
  CreateLabCustomServiceRequest,
} from "./useService";
import {
  ColumnConfig,
  FilterMenuConfigItem,
} from "@/shared_features/responsive_grid/type";

// ──────────────────────────────────────────────
// Inline Price Editor cell component
// ──────────────────────────────────────────────
const PriceCell: React.FC<{
  row: LabServiceItem;
  onSave: (
    serviceId: string,
    price: number | null,
    isActive: boolean,
  ) => Promise<any>;
  saving: boolean;
}> = ({ row, onSave, saving }) => {
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState<string>(
    row.customPrice !== null && row.customPrice !== undefined
      ? String(row.customPrice)
      : "",
  );

  const effectivePrice =
    row.customPrice !== null && row.customPrice !== undefined
      ? row.customPrice
      : row.basePrice;
  const hasOverride = row.customPrice !== null && row.customPrice !== undefined;

  const handleSave = async () => {
    const parsed = value === "" ? null : parseFloat(value);
    if (parsed !== null && (isNaN(parsed) || parsed < 0)) {
      toast.error("Enter a valid price.");
      return;
    }
    const res = await onSave(row.serviceId, parsed, row.isActive);
    if (res?.data?.success || res?.success) {
      toast.success("Price updated.");
      setEditing(false);
    } else {
      toast.error("Failed to update price.");
    }
  };

  if (editing) {
    return (
      <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
        <TextField
          size="small"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position="start">₹</InputAdornment>
              ),
            },
          }}
          sx={{ width: 120 }}
          autoFocus
          placeholder={String(row.basePrice)}
        />
        <IconButton
          size="small"
          color="success"
          onClick={handleSave}
          disabled={saving}
        >
          <CheckIcon fontSize="small" />
        </IconButton>
        <IconButton
          size="small"
          onClick={() => {
            setValue(hasOverride ? String(row.customPrice) : "");
            setEditing(false);
          }}
        >
          <CloseIcon fontSize="small" />
        </IconButton>
      </Box>
    );
  }

  return (
    <Box sx={{ display: "flex", flexDirection: "column" }}>
      <Box sx={{ display: "flex", alignItems: "center", gap: 0.8 }}>
        <Typography
          variant="body2"
          sx={{ fontWeight: 800, color: "text.primary" }}
        >
          ₹{effectivePrice.toLocaleString()}
        </Typography>
        <Tooltip title="Edit price override">
          <IconButton
            size="small"
            onClick={() => setEditing(true)}
            sx={{ opacity: 0.5, "&:hover": { opacity: 1 } }}
          >
            <EditIcon sx={{ fontSize: 13 }} />
          </IconButton>
        </Tooltip>
      </Box>
      <Typography
        variant="caption"
        sx={{ color: "text.secondary", fontWeight: 500 }}
      >
        Base: ₹{row.basePrice.toLocaleString()}
        {hasOverride ? " · Overridden" : ""}
      </Typography>
    </Box>
  );
};

// ──────────────────────────────────────────────
// Active toggle cell
// ──────────────────────────────────────────────
const ActiveToggleCell: React.FC<{
  row: LabServiceItem;
  onToggle: (
    serviceId: string,
    price: number | null,
    isActive: boolean,
  ) => Promise<any>;
  saving: boolean;
}> = ({ row, onToggle, saving }) => {
  const [loading, setLoading] = useState(false);

  const handleToggle = async () => {
    setLoading(true);
    const res = await onToggle(
      row.serviceId,
      row.customPrice ?? null,
      !row.isActive,
    );
    setLoading(false);
    if (res?.data?.success || res?.success) {
      toast.success(
        row.isActive ? "Service deactivated." : "Service activated.",
      );
    } else {
      toast.error("Failed to update service status.");
    }
  };

  return (
    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
      {loading || saving ? (
        <CircularProgress size={18} color="secondary" />
      ) : (
        <Switch
          size="small"
          checked={row.isActive}
          onChange={handleToggle}
          color="secondary"
        />
      )}
      <Chip
        label={row.isActive ? "Active" : "Inactive"}
        size="small"
        variant="outlined"
        sx={{
          fontWeight: 700,
          fontSize: "11px",
          borderRadius: "6px",
          color: row.isActive ? "#10b981" : "#64748b",
          borderColor: row.isActive
            ? "rgba(16,185,129,0.3)"
            : "rgba(100,116,139,0.3)",
          bgcolor: row.isActive
            ? "rgba(16,185,129,0.06)"
            : "rgba(100,116,139,0.06)",
        }}
      />
    </Box>
  );
};

// ──────────────────────────────────────────────
// Create Custom Service Dialog
// ──────────────────────────────────────────────
const INITIAL_FORM: CreateLabCustomServiceRequest = {
  name: "",
  category: "",
  description: "",
  basePrice: 0,
  customPrice: null,
};

const CreateServiceDialog: React.FC<{
  open: boolean;
  onClose: () => void;
  onSave: (payload: CreateLabCustomServiceRequest) => Promise<any>;
  saving: boolean;
}> = ({ open, onClose, onSave, saving }) => {
  const [form, setForm] = useState<CreateLabCustomServiceRequest>(INITIAL_FORM);

  const handleChange = (
    field: keyof CreateLabCustomServiceRequest,
    value: any,
  ) => setForm((prev) => ({ ...prev, [field]: value }));

  const handleSubmit = async () => {
    if (!form.name.trim() || !form.category.trim() || form.basePrice <= 0) {
      toast.error("Name, Category, and a valid Base Price are required.");
      return;
    }
    const res = await onSave({
      ...form,
      customPrice: form.customPrice || null,
    });
    if (res?.data?.success || res?.success) {
      toast.success("Custom service created.");
      setForm(INITIAL_FORM);
      onClose();
    } else {
      toast.error(res?.data?.message || "Failed to create service.");
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      slotProps={{
        paper: {
          sx: { borderRadius: "14px", border: "1px solid var(--color-border)" },
        },
      }}
    >
      <DialogTitle sx={{ fontWeight: 800, fontSize: "1rem", pb: 0 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
          <Avatar
            sx={{ bgcolor: "rgba(16,185,129,0.1)", width: 36, height: 36 }}
          >
            <ScienceIcon sx={{ color: "secondary.main", fontSize: 20 }} />
          </Avatar>
          Create Custom Service
        </Box>
      </DialogTitle>
      <Divider sx={{ mt: 2 }} />
      <DialogContent
        sx={{ pt: 2.5, display: "flex", flexDirection: "column", gap: 2.5 }}
      >
        <TextField
          label="Service Name"
          value={form.name}
          onChange={(e) => handleChange("name", e.target.value)}
          fullWidth
          required
          size="small"
          placeholder="e.g. Complete Blood Count (CBC)"
        />
        <TextField
          label="Category"
          value={form.category}
          onChange={(e) => handleChange("category", e.target.value)}
          fullWidth
          required
          size="small"
          placeholder="e.g. Blood Test, Imaging, Cardiology..."
        />
        <TextField
          label="Description"
          value={form.description}
          onChange={(e) => handleChange("description", e.target.value)}
          fullWidth
          multiline
          minRows={2}
          size="small"
          placeholder="Optional description of the diagnostic test..."
        />
        <Box sx={{ display: "flex", gap: 2 }}>
          <TextField
            label="Base Price (₹)"
            type="number"
            value={form.basePrice || ""}
            onChange={(e) =>
              handleChange("basePrice", parseFloat(e.target.value) || 0)
            }
            fullWidth
            required
            size="small"
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">₹</InputAdornment>
                ),
              },
            }}
          />
          <TextField
            label="Custom Price (optional)"
            type="number"
            value={form.customPrice ?? ""}
            onChange={(e) =>
              handleChange(
                "customPrice",
                e.target.value === "" ? null : parseFloat(e.target.value),
              )
            }
            fullWidth
            size="small"
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">₹</InputAdornment>
                ),
              },
            }}
            helperText="Leave blank to use base price"
          />
        </Box>
      </DialogContent>
      <Divider />
      <DialogActions sx={{ px: 3, py: 2, gap: 1 }}>
        <Button
          onClick={onClose}
          variant="outlined"
          color="inherit"
          sx={{
            textTransform: "none",
            borderRadius: "8px",
            borderColor: "var(--color-border)",
          }}
        >
          Cancel
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          color="secondary"
          disabled={saving}
          startIcon={
            saving ? (
              <CircularProgress size={16} color="inherit" />
            ) : (
              <AddIcon />
            )
          }
          sx={{
            textTransform: "none",
            fontWeight: 700,
            borderRadius: "8px",
            color: "#fff",
          }}
        >
          {saving ? "Saving..." : "Create Service"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

// ──────────────────────────────────────────────
// Main Services Component
// ──────────────────────────────────────────────
export const Services: React.FC = () => {
  const {
    loading,
    saving,
    paginatedData,
    pagination,
    filters,
    setFilters,
    categoryOptions,
    fetchServices,
    handleUpdateService,
    handleCreateCustomService,
  } = useService();

  const [createOpen, setCreateOpen] = useState(false);

  const handleSaveServiceUpdate = useCallback(
    (serviceId: string, price: number | null, isActive: boolean) =>
      handleUpdateService(serviceId, { customPrice: price, isActive }),
    [handleUpdateService],
  );

  const columns: ColumnConfig<LabServiceItem>[] = useMemo(
    () => [
      {
        accessor: "name",
        header: "Service",
        sortable: true,
        width: 260,
        Cell: ({ row }) => (
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
            <Avatar
              sx={{ bgcolor: "rgba(16,185,129,0.08)", width: 30, height: 30 }}
            >
              <ScienceIcon sx={{ fontSize: "16px", color: "secondary.main" }} />
            </Avatar>
            <Box>
              <Typography
                variant="body2"
                sx={{
                  fontWeight: 800,
                  lineHeight: 1.25,
                  color: "text.primary",
                }}
              >
                {row.name}
              </Typography>
              {row.description && (
                <Typography
                  variant="caption"
                  sx={{
                    color: "text.secondary",
                    fontWeight: 500,
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
        width: 140,
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
              borderColor: "rgba(71,85,105,0.25)",
              bgcolor: "rgba(71,85,105,0.04)",
            }}
          />
        ),
      },
      {
        // Source badge: ADMIN or CUSTOM
        accessor: "serviceId",
        header: "Source",
        sortable: false,
        width: 100,
        Cell: ({ row }) => {
          // isActive comes from branchServiceId existing — we detect custom by checking if row has a branchServiceId with a custom category
          const isCustom =
            !row.branchServiceId || row.customCommissionPct !== null;
          // Actually detect custom: if category is set but no branchServiceId — we just use a flag
          // The LabServiceItem from API sets branchServiceId = "" for unenrolled admin services
          const isEnrolled = !!row.branchServiceId;
          return (
            <Chip
              label={
                isEnrolled && row.customCommissionPct !== null
                  ? "CUSTOM"
                  : "PLATFORM"
              }
              size="small"
              sx={{
                fontWeight: 800,
                fontSize: "9px",
                height: "20px",
                borderRadius: "4px",
                color:
                  isEnrolled && row.customCommissionPct !== null
                    ? "secondary.main"
                    : "#6366f1",
                bgcolor:
                  isEnrolled && row.customCommissionPct !== null
                    ? "rgba(16,185,129,0.08)"
                    : "rgba(99,102,241,0.08)",
              }}
            />
          );
        },
      },
      {
        accessor: "basePrice",
        header: "Price",
        sortable: true,
        width: 210,
        Cell: ({ row }) => (
          <PriceCell
            row={row}
            onSave={handleSaveServiceUpdate}
            saving={saving}
          />
        ),
      },
      {
        accessor: "customCommissionPct",
        header: "Commission",
        sortable: true,
        width: 150,
        Cell: ({ row }) => {
          const hasCustomComm =
            row.customCommissionPct !== null &&
            row.customCommissionPct !== undefined;
          return (
            <Typography
              variant="body2"
              sx={{
                fontWeight: 700,
                color: hasCustomComm ? "secondary.main" : "text.secondary",
              }}
            >
              {hasCustomComm ? `${row.customCommissionPct}%` : "Default"}
            </Typography>
          );
        },
      },
      {
        accessor: "isActive",
        header: "Status",
        sortable: true,
        width: 170,
        Cell: ({ row }) => (
          <ActiveToggleCell
            row={row}
            onToggle={handleSaveServiceUpdate}
            saving={saving}
          />
        ),
      },
    ],
    [handleSaveServiceUpdate, saving],
  );

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
      <Toaster position="top-right" />

      {/* Header */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
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
            Manage diagnostic tests — activate platform services, set custom
            prices, or create private tests.
          </Typography>
        </Box>
        <Box sx={{ display: "flex", gap: 1.5 }}>
          <Button
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
            }}
          >
            Refresh
          </Button>
          <Button
            id="create-custom-service-btn"
            variant="contained"
            color="secondary"
            startIcon={<AddIcon />}
            onClick={() => setCreateOpen(true)}
            sx={{
              textTransform: "none",
              fontWeight: 700,
              borderRadius: "8px",
              color: "#fff",
            }}
          >
            Add Custom Service
          </Button>
        </Box>
      </Box>

      {/* Grid */}
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

      {/* Create Custom Service Dialog */}
      <CreateServiceDialog
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        onSave={handleCreateCustomService}
        saving={saving}
      />
    </Box>
  );
};

export default Services;
