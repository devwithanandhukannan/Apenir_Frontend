import React, { useState, useMemo, useCallback } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Grid from "@mui/material/Grid";
import Chip from "@mui/material/Chip";
import Divider from "@mui/material/Divider";
import Switch from "@mui/material/Switch";
import TextField from "@mui/material/TextField";
import InputAdornment from "@mui/material/InputAdornment";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import IconButton from "@mui/material/IconButton";
import Tooltip from "@mui/material/Tooltip";
import CircularProgress from "@mui/material/CircularProgress";
import Checkbox from "@mui/material/Checkbox";
import Avatar from "@mui/material/Avatar";
import Alert from "@mui/material/Alert";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import SearchIcon from "@mui/icons-material/Search";
import InventoryIcon from "@mui/icons-material/Inventory";
import MedicalServicesIcon from "@mui/icons-material/MedicalServices";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import PaidIcon from "@mui/icons-material/Paid";
import RefreshIcon from "@mui/icons-material/Refresh";
import toast, { Toaster } from "react-hot-toast";
import { useApi } from "@/core_components/hooks/useApi/useApi";
import {
  usePackages,
  BranchPackageItem,
  CreateLabCustomPackageRequest,
} from "./usePackages";

// ── Inline price override editor ────────────────────────────────────────
const PriceOverrideCell: React.FC<{
  pkg: BranchPackageItem;
  onSave: (packageId: string, price: number) => Promise<any>;
  saving: boolean;
}> = ({ pkg, onSave, saving }) => {
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState(
    pkg.customPrice != null ? String(pkg.customPrice) : "",
  );

  const effectivePrice =
    pkg.customPrice != null ? pkg.customPrice : pkg.basePrice;
  const hasOverride = pkg.customPrice != null;

  const handleSave = async () => {
    const parsed = parseFloat(value);
    if (isNaN(parsed) || parsed < 0) {
      toast.error("Enter a valid price.");
      return;
    }
    const res = await onSave(pkg.packageId, parsed);
    if (res?.success || res?.data?.success) {
      toast.success("Price override saved.");
      setEditing(false);
    } else {
      toast.error(res?.data?.message || "Failed to save price override.");
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
          sx={{ width: 130 }}
          autoFocus
          placeholder={String(pkg.basePrice)}
        />
        <Button
          size="small"
          variant="contained"
          color="secondary"
          onClick={handleSave}
          disabled={saving}
          sx={{
            textTransform: "none",
            fontWeight: 700,
            color: "#fff",
            minWidth: 60,
            borderRadius: "6px",
          }}
        >
          Save
        </Button>
        <IconButton size="small" onClick={() => setEditing(false)}>
          ✕
        </IconButton>
      </Box>
    );
  }

  return (
    <Box>
      <Box sx={{ display: "flex", alignItems: "center", gap: 0.8 }}>
        <PaidIcon sx={{ fontSize: 15, color: "secondary.main" }} />
        <Typography variant="body2" sx={{ fontWeight: 800 }}>
          ₹{effectivePrice.toLocaleString()}
        </Typography>
        <Tooltip title="Override price">
          <IconButton
            size="small"
            onClick={() => setEditing(true)}
            sx={{ opacity: 0.5, "&:hover": { opacity: 1 } }}
          >
            <EditIcon sx={{ fontSize: 13 }} />
          </IconButton>
        </Tooltip>
      </Box>
      <Typography variant="caption" color="text.secondary">
        Base: ₹{pkg.basePrice.toLocaleString()}
        {hasOverride ? " · Overridden" : ""}
      </Typography>
    </Box>
  );
};

// ── Service selector (for custom package form) ───────────────────────────
const ServiceSelector: React.FC<{
  availableServices: Array<{
    id: string;
    name: string;
    category: string;
    basePrice: number;
  }>;
  selectedIds: string[];
  onToggle: (id: string) => void;
}> = ({ availableServices, selectedIds, onToggle }) => {
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return availableServices.filter(
      (s) =>
        !q ||
        s.name.toLowerCase().includes(q) ||
        s.category.toLowerCase().includes(q),
    );
  }, [availableServices, search]);

  return (
    <Box
      sx={{
        border: "1px solid var(--color-border)",
        borderRadius: "10px",
        overflow: "hidden",
      }}
    >
      <Box
        sx={{
          p: 1.5,
          borderBottom: "1px solid var(--color-border)",
          bgcolor: "rgba(0,0,0,0.015)",
        }}
      >
        <TextField
          size="small"
          fullWidth
          placeholder="Search services..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon sx={{ fontSize: 16 }} />
                </InputAdornment>
              ),
            },
          }}
        />
      </Box>
      <Box
        sx={{
          maxHeight: 240,
          overflowY: "auto",
          p: 1.5,
          display: "flex",
          flexDirection: "column",
          gap: 0.5,
        }}
      >
        {filtered.length === 0 ? (
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ textAlign: "center", py: 2 }}
          >
            No services found
          </Typography>
        ) : (
          filtered.map((svc) => (
            <Box
              key={svc.id}
              onClick={() => onToggle(svc.id)}
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 1.5,
                p: 1,
                borderRadius: "8px",
                cursor: "pointer",
                bgcolor: selectedIds.includes(svc.id)
                  ? "rgba(16,185,129,0.06)"
                  : "transparent",
                border: `1px solid ${selectedIds.includes(svc.id) ? "rgba(16,185,129,0.25)" : "transparent"}`,
                "&:hover": {
                  bgcolor: selectedIds.includes(svc.id)
                    ? "rgba(16,185,129,0.08)"
                    : "rgba(0,0,0,0.03)",
                },
                transition: "all 0.15s",
              }}
            >
              <Checkbox
                size="small"
                checked={selectedIds.includes(svc.id)}
                onChange={() => onToggle(svc.id)}
                onClick={(e) => e.stopPropagation()}
                color="secondary"
                sx={{ p: 0 }}
              />
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Typography
                  variant="body2"
                  sx={{ fontWeight: 700, lineHeight: 1.2 }}
                >
                  {svc.name}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {svc.category} · ₹{svc.basePrice}
                </Typography>
              </Box>
            </Box>
          ))
        )}
      </Box>
      {selectedIds.length > 0 && (
        <Box
          sx={{
            px: 1.5,
            py: 1,
            bgcolor: "rgba(16,185,129,0.04)",
            borderTop: "1px solid var(--color-border)",
          }}
        >
          <Typography
            variant="caption"
            sx={{ fontWeight: 700, color: "secondary.main" }}
          >
            {selectedIds.length} service{selectedIds.length > 1 ? "s" : ""}{" "}
            selected
          </Typography>
        </Box>
      )}
    </Box>
  );
};

// ── Package Card ─────────────────────────────────────────────────────────
const PackageCard: React.FC<{
  pkg: BranchPackageItem;
  isAdmin: boolean;
  onSubscribe?: (id: string) => void;
  onUnsubscribe?: (id: string) => void;
  onOverride?: (id: string, price: number) => Promise<any>;
  onEdit?: (pkg: BranchPackageItem) => void;
  onDelete?: (id: string) => void;
  saving: boolean;
}> = ({
  pkg,
  isAdmin,
  onSubscribe,
  onUnsubscribe,
  onOverride,
  onEdit,
  onDelete,
  saving,
}) => {
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async () => {
    if (!onDelete) return;
    setDeleting(true);
    onDelete(pkg.packageId);
  };

  return (
    <Card
      sx={{
        border: "1px solid var(--color-divider)",
        boxShadow: "none",
        height: "100%",
        opacity: pkg.isActive ? 1 : 0.55,
        transition: "opacity 0.2s",
        position: "relative",
      }}
    >
      {!pkg.isActive && (
        <Box sx={{ position: "absolute", top: 10, right: 10 }}>
          <Chip
            label="INACTIVE"
            size="small"
            sx={{
              fontWeight: 800,
              fontSize: "9px",
              color: "#dc2626",
              bgcolor: "rgba(220,38,38,0.08)",
              height: 18,
              borderRadius: "4px",
            }}
          />
        </Box>
      )}

      <CardContent
        sx={{
          p: 3,
          display: "flex",
          flexDirection: "column",
          gap: 2,
          height: "100%",
        }}
      >
        {/* Name + type badge */}
        <Box>
          <Box
            sx={{
              display: "flex",
              alignItems: "flex-start",
              justifyContent: "space-between",
              gap: 1,
            }}
          >
            <Typography
              variant="subtitle1"
              sx={{ fontWeight: 800, lineHeight: 1.3, pr: 4 }}
            >
              {pkg.name}
            </Typography>
            <Chip
              label={isAdmin ? "PLATFORM" : "CUSTOM"}
              size="small"
              sx={{
                fontWeight: 800,
                fontSize: "9px",
                height: 20,
                borderRadius: "4px",
                flexShrink: 0,
                color: isAdmin ? "#6366f1" : "secondary.main",
                bgcolor: isAdmin
                  ? "rgba(99,102,241,0.08)"
                  : "rgba(16,185,129,0.08)",
              }}
            />
          </Box>
          {pkg.description && (
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{
                mt: 0.5,
                display: "-webkit-box",
                WebkitLineClamp: 2,
                WebkitBoxOrient: "vertical",
                overflow: "hidden",
              }}
            >
              {pkg.description}
            </Typography>
          )}
        </Box>

        {/* Included services chips */}
        <Box>
          <Typography
            variant="caption"
            sx={{
              fontWeight: 700,
              color: "text.secondary",
              display: "block",
              mb: 0.8,
            }}
          >
            INCLUDES ({pkg.services.length} tests)
          </Typography>
          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
            {pkg.services.slice(0, 4).map((svc) => (
              <Chip
                key={svc.serviceId}
                size="small"
                label={svc.name}
                icon={
                  <MedicalServicesIcon sx={{ fontSize: "11px !important" }} />
                }
                sx={{
                  fontWeight: 600,
                  fontSize: "10px",
                  height: 22,
                  bgcolor: "rgba(16,185,129,0.06)",
                  color: "text.primary",
                  "& .MuiChip-icon": { color: "secondary.main" },
                }}
              />
            ))}
            {pkg.services.length > 4 && (
              <Chip
                size="small"
                label={`+${pkg.services.length - 4} more`}
                sx={{
                  fontWeight: 600,
                  fontSize: "10px",
                  height: 22,
                  bgcolor: "rgba(0,0,0,0.04)",
                  color: "text.secondary",
                }}
              />
            )}
          </Box>
        </Box>

        <Divider />

        {/* Price section */}
        <Box>
          {isAdmin ? (
            // Admin package: show override editor
            <Box>
              {onOverride && (
                <PriceOverrideCell
                  pkg={pkg}
                  onSave={onOverride}
                  saving={saving}
                />
              )}
            </Box>
          ) : (
            // Custom package: show price plainly
            <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
              <PaidIcon sx={{ fontSize: 15, color: "secondary.main" }} />
              <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>
                ₹{(pkg.customPrice ?? pkg.basePrice).toLocaleString()}
              </Typography>
            </Box>
          )}
        </Box>

        {/* Actions row */}
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            pt: 0.5,
            mt: "auto",
          }}
        >
          {isAdmin ? (
            // Subscribe / Unsubscribe toggle
            <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
              <Switch
                size="small"
                checked={pkg.isActive}
                onChange={() =>
                  pkg.isActive
                    ? onUnsubscribe?.(pkg.packageId)
                    : onSubscribe?.(pkg.packageId)
                }
                color="secondary"
                disabled={saving}
              />
              <Typography
                variant="caption"
                sx={{
                  fontWeight: 600,
                  color: pkg.isActive ? "secondary.main" : "text.disabled",
                }}
              >
                {pkg.isActive ? "Subscribed" : "Subscribe"}
              </Typography>
            </Box>
          ) : (
            // Custom package edit/delete
            <Box sx={{ display: "flex", gap: 1 }}>
              <Tooltip title="Edit">
                <IconButton
                  size="small"
                  onClick={() => onEdit?.(pkg)}
                  sx={{
                    border: "1px solid var(--color-border)",
                    borderRadius: "8px",
                  }}
                >
                  <EditIcon fontSize="small" />
                </IconButton>
              </Tooltip>
              <Tooltip title="Delete">
                <IconButton
                  size="small"
                  onClick={handleDelete}
                  disabled={deleting || saving}
                  sx={{
                    border: "1px solid rgba(220,38,38,0.3)",
                    borderRadius: "8px",
                    color: "#dc2626",
                  }}
                >
                  {deleting ? (
                    <CircularProgress size={14} color="inherit" />
                  ) : (
                    <DeleteIcon fontSize="small" />
                  )}
                </IconButton>
              </Tooltip>
            </Box>
          )}
          {isAdmin && pkg.isActive && (
            <Chip
              icon={<CheckCircleIcon sx={{ fontSize: "12px !important" }} />}
              label="Active"
              size="small"
              sx={{
                fontWeight: 700,
                fontSize: "10px",
                color: "secondary.main",
                bgcolor: "rgba(16,185,129,0.08)",
                height: 22,
              }}
            />
          )}
        </Box>
      </CardContent>
    </Card>
  );
};

// ── Main Lab Packages Component ──────────────────────────────────────────
const EMPTY_CUSTOM_FORM: CreateLabCustomPackageRequest = {
  name: "",
  description: "",
  customPrice: 0,
  serviceIds: [],
};

export const LabPackages: React.FC = () => {
  const {
    adminPackages,
    customPackages,
    loading,
    saving,
    loadPackages,
    subscribePackage,
    unsubscribePackage,
    overridePackagePrice,
    createCustomPackage,
    updateCustomPackage,
    deleteCustomPackage,
  } = usePackages();

  const { get } = useApi();

  const [activeTab, setActiveTab] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");

  // Available services for custom package creation
  const [availableServices, setAvailableServices] = useState<
    Array<{ id: string; name: string; category: string; basePrice: number }>
  >([]);

  // Dialogs
  const [createOpen, setCreateOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<BranchPackageItem | null>(null);

  // Form state
  const [createForm, setCreateForm] = useState<CreateLabCustomPackageRequest>({
    ...EMPTY_CUSTOM_FORM,
  });
  const [editForm, setEditForm] = useState<CreateLabCustomPackageRequest>({
    ...EMPTY_CUSTOM_FORM,
  });

  // Load available services once for the service selector
  const loadServices = useCallback(async () => {
    const res = await get<any>({
      endpoint: "/api/services",
      requireAuth: true,
    });
    if (res.success && res.data?.data) {
      setAvailableServices(
        res.data.data
          .filter((s: any) => s.isActive)
          .map((s: any) => ({
            id: s.id,
            name: s.name,
            category: s.category,
            basePrice: s.basePrice,
          })),
      );
    }
  }, [get]);

  React.useEffect(() => {
    loadServices();
  }, [loadServices]);

  // ── Subscribe / Unsubscribe ────────────────────────────────────────
  const handleSubscribe = async (packageId: string) => {
    const res = await subscribePackage(packageId);
    if (res.success) toast.success("Subscribed to package!");
    else toast.error(res.data?.message || "Failed to subscribe.");
  };

  const handleUnsubscribe = async (packageId: string) => {
    const res = await unsubscribePackage(packageId);
    if (res.success) toast.success("Unsubscribed from package.");
    else toast.error(res.data?.message || "Failed to unsubscribe.");
  };

  // ── Override price ─────────────────────────────────────────────────
  const handleOverride = async (packageId: string, price: number) => {
    return await overridePackagePrice(packageId, price);
  };

  // ── Create custom package ──────────────────────────────────────────
  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (
      !createForm.name.trim() ||
      createForm.customPrice <= 0 ||
      createForm.serviceIds.length === 0
    ) {
      toast.error(
        "Name, a valid price, and at least one service are required.",
      );
      return;
    }
    const res = await createCustomPackage({
      ...createForm,
      name: createForm.name.trim(),
      description: createForm.description.trim(),
    });
    if (res.success) {
      toast.success("Custom package created!");
      setCreateOpen(false);
      setCreateForm({ ...EMPTY_CUSTOM_FORM });
    } else {
      toast.error(res.data?.message || "Failed to create package.");
    }
  };

  // ── Edit custom package ────────────────────────────────────────────
  const openEdit = (pkg: BranchPackageItem) => {
    setEditTarget(pkg);
    setEditForm({
      name: pkg.name,
      description: pkg.description || "",
      customPrice: pkg.customPrice ?? pkg.basePrice,
      serviceIds: pkg.services.map((s) => s.serviceId),
    });
    setEditOpen(true);
  };

  const handleEditSubmit = async () => {
    if (!editTarget) return;
    if (
      !editForm.name.trim() ||
      editForm.customPrice <= 0 ||
      editForm.serviceIds.length === 0
    ) {
      toast.error(
        "Name, a valid price, and at least one service are required.",
      );
      return;
    }
    const res = await updateCustomPackage(editTarget.packageId, {
      ...editForm,
      name: editForm.name.trim(),
      description: editForm.description.trim(),
    });
    if (res.success) {
      toast.success("Package updated!");
      setEditOpen(false);
    } else {
      toast.error(res.data?.message || "Failed to update package.");
    }
  };

  // ── Delete custom package ──────────────────────────────────────────
  const handleDelete = async (packageId: string) => {
    const res = await deleteCustomPackage(packageId);
    if (res.success) toast.success("Package deleted.");
    else toast.error(res.data?.message || "Failed to delete package.");
  };

  const toggleService = (
    id: string,
    current: string[],
    setter: (ids: string[]) => void,
  ) => {
    if (current.includes(id)) setter(current.filter((x) => x !== id));
    else setter([...current, id]);
  };

  const filterPackages = (pkgs: BranchPackageItem[]) => {
    const q = searchQuery.toLowerCase();
    return pkgs.filter(
      (p) =>
        !q ||
        p.name.toLowerCase().includes(q) ||
        p.description?.toLowerCase().includes(q),
    );
  };

  return (
    <Box sx={{ p: { xs: 2, md: 4 } }}>
      <Toaster position="top-right" />

      {/* Header */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          mb: 3,
          flexWrap: "wrap",
          gap: 2,
        }}
      >
        <Box>
          <Typography
            variant="h5"
            sx={{ fontWeight: 800, mb: 0.5, letterSpacing: "-0.5px" }}
          >
            Lab Packages
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Subscribe to platform bundles or create your own custom diagnostic
            packages.
          </Typography>
        </Box>
        <Box sx={{ display: "flex", gap: 1.5 }}>
          <Button
            variant="outlined"
            color="inherit"
            startIcon={<RefreshIcon />}
            onClick={loadPackages}
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
            variant="contained"
            color="secondary"
            startIcon={<AddIcon />}
            onClick={() => {
              setCreateForm({ ...EMPTY_CUSTOM_FORM });
              setCreateOpen(true);
            }}
            sx={{
              textTransform: "none",
              fontWeight: 700,
              borderRadius: "8px",
              color: "#fff",
              boxShadow: "none",
              "&:hover": { boxShadow: "none" },
            }}
          >
            Create Custom Package
          </Button>
        </Box>
      </Box>

      {/* Tabs */}
      <Tabs
        value={activeTab}
        onChange={(_, v) => {
          setActiveTab(v);
          setSearchQuery("");
        }}
        sx={{
          mb: 3,
          borderBottom: "1px solid var(--color-border)",
          ".MuiTab-root": {
            fontWeight: 700,
            textTransform: "none",
            fontSize: "14px",
          },
        }}
      >
        <Tab label={`Platform Packages (${adminPackages.length})`} />
        <Tab label={`My Custom Packages (${customPackages.length})`} />
      </Tabs>

      {/* Search */}
      <TextField
        placeholder="Search packages..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        size="small"
        fullWidth
        sx={{ mb: 4, maxWidth: 400 }}
        slotProps={{
          input: {
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon
                  sx={{ color: "text.secondary", fontSize: "20px" }}
                />
              </InputAdornment>
            ),
          },
        }}
      />

      {/* Content */}
      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
          <CircularProgress color="secondary" />
        </Box>
      ) : (
        <>
          {activeTab === 0 && (
            <>
              {adminPackages.length === 0 ? (
                <Box
                  sx={{
                    textAlign: "center",
                    py: 8,
                    border: "1px dashed var(--color-border)",
                    borderRadius: "12px",
                  }}
                >
                  <InventoryIcon
                    sx={{ fontSize: 48, color: "text.disabled", mb: 1 }}
                  />
                  <Typography color="text.secondary">
                    No platform packages available yet.
                  </Typography>
                </Box>
              ) : filterPackages(adminPackages).length === 0 ? (
                <Typography
                  color="text.secondary"
                  sx={{ py: 4, textAlign: "center" }}
                >
                  No packages match your search.
                </Typography>
              ) : (
                <>
                  <Alert
                    severity="info"
                    sx={{ mb: 3, borderRadius: "8px", fontSize: "13px" }}
                  >
                    Toggle the subscribe switch to activate a platform package
                    in your lab. You can also set a custom price override per
                    package.
                  </Alert>
                  <Grid container spacing={3}>
                    {filterPackages(adminPackages).map((pkg) => (
                      <Grid key={pkg.packageId} size={{ xs: 12, sm: 6, md: 4 }}>
                        <PackageCard
                          pkg={pkg}
                          isAdmin
                          onSubscribe={handleSubscribe}
                          onUnsubscribe={handleUnsubscribe}
                          onOverride={handleOverride}
                          saving={saving}
                        />
                      </Grid>
                    ))}
                  </Grid>
                </>
              )}
            </>
          )}

          {activeTab === 1 && (
            <>
              {customPackages.length === 0 ? (
                <Box
                  sx={{
                    textAlign: "center",
                    py: 8,
                    border: "1px dashed var(--color-border)",
                    borderRadius: "12px",
                  }}
                >
                  <InventoryIcon
                    sx={{ fontSize: 48, color: "text.disabled", mb: 1 }}
                  />
                  <Typography color="text.secondary" sx={{ mb: 2 }}>
                    No custom packages yet.
                  </Typography>
                  <Button
                    variant="contained"
                    color="secondary"
                    startIcon={<AddIcon />}
                    onClick={() => {
                      setCreateForm({ ...EMPTY_CUSTOM_FORM });
                      setCreateOpen(true);
                    }}
                    sx={{
                      textTransform: "none",
                      fontWeight: 700,
                      color: "#fff",
                      borderRadius: "8px",
                    }}
                  >
                    Create Your First Package
                  </Button>
                </Box>
              ) : filterPackages(customPackages).length === 0 ? (
                <Typography
                  color="text.secondary"
                  sx={{ py: 4, textAlign: "center" }}
                >
                  No packages match your search.
                </Typography>
              ) : (
                <Grid container spacing={3}>
                  {filterPackages(customPackages).map((pkg) => (
                    <Grid key={pkg.packageId} size={{ xs: 12, sm: 6, md: 4 }}>
                      <PackageCard
                        pkg={pkg}
                        isAdmin={false}
                        onEdit={openEdit}
                        onDelete={handleDelete}
                        saving={saving}
                      />
                    </Grid>
                  ))}
                </Grid>
              )}
            </>
          )}
        </>
      )}

      {/* ── Create Custom Package Dialog ────────────────────────────────── */}
      <Dialog
        open={createOpen}
        onClose={() => !saving && setCreateOpen(false)}
        maxWidth="sm"
        fullWidth
        slotProps={{ paper: { sx: { borderRadius: "16px" } } }}
      >
        <form onSubmit={handleCreateSubmit}>
          <DialogTitle sx={{ fontWeight: 800 }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
              <Avatar
                sx={{ bgcolor: "rgba(16,185,129,0.1)", width: 34, height: 34 }}
              >
                <InventoryIcon sx={{ color: "secondary.main", fontSize: 18 }} />
              </Avatar>
              Create Custom Package
            </Box>
          </DialogTitle>
          <Divider />
          <DialogContent
            sx={{ py: 2.5, display: "flex", flexDirection: "column", gap: 2.5 }}
          >
            <TextField
              label="Package Name"
              fullWidth
              required
              disabled={saving}
              value={createForm.name}
              onChange={(e) =>
                setCreateForm((f) => ({ ...f, name: e.target.value }))
              }
              placeholder="e.g. Comprehensive Health Check"
              slotProps={{ inputLabel: { shrink: true } }}
            />
            <TextField
              label="Description"
              fullWidth
              multiline
              rows={2}
              disabled={saving}
              value={createForm.description}
              onChange={(e) =>
                setCreateForm((f) => ({ ...f, description: e.target.value }))
              }
              slotProps={{ inputLabel: { shrink: true } }}
            />
            <TextField
              label="Package Price (₹)"
              type="number"
              fullWidth
              required
              disabled={saving}
              value={createForm.customPrice || ""}
              onChange={(e) =>
                setCreateForm((f) => ({
                  ...f,
                  customPrice: parseFloat(e.target.value) || 0,
                }))
              }
              slotProps={{
                inputLabel: { shrink: true },
                input: {
                  startAdornment: (
                    <InputAdornment position="start">₹</InputAdornment>
                  ),
                },
              }}
            />
            <Box>
              <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1 }}>
                Select Services
              </Typography>
              <ServiceSelector
                availableServices={availableServices}
                selectedIds={createForm.serviceIds}
                onToggle={(id) =>
                  toggleService(id, createForm.serviceIds, (ids) =>
                    setCreateForm((f) => ({ ...f, serviceIds: ids })),
                  )
                }
              />
            </Box>
          </DialogContent>
          <Divider />
          <DialogActions sx={{ px: 3, py: 2, gap: 1 }}>
            <Button
              onClick={() => setCreateOpen(false)}
              variant="outlined"
              color="inherit"
              disabled={saving}
              sx={{
                fontWeight: 700,
                textTransform: "none",
                borderRadius: "8px",
                borderColor: "var(--color-border)",
              }}
            >
              Cancel
            </Button>
            <Button
              type="submit"
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
                fontWeight: 700,
                textTransform: "none",
                borderRadius: "8px",
                color: "#fff",
              }}
            >
              {saving ? "Creating..." : "Create Package"}
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* ── Edit Custom Package Dialog ───────────────────────────────────── */}
      <Dialog
        open={editOpen}
        onClose={() => !saving && setEditOpen(false)}
        maxWidth="sm"
        fullWidth
        slotProps={{ paper: { sx: { borderRadius: "16px" } } }}
      >
        <DialogTitle sx={{ fontWeight: 800 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
            <Avatar
              sx={{ bgcolor: "rgba(16,185,129,0.1)", width: 34, height: 34 }}
            >
              <EditIcon sx={{ color: "secondary.main", fontSize: 18 }} />
            </Avatar>
            Edit Custom Package
          </Box>
        </DialogTitle>
        <Divider />
        <DialogContent
          sx={{ py: 2.5, display: "flex", flexDirection: "column", gap: 2.5 }}
        >
          <TextField
            label="Package Name"
            fullWidth
            required
            disabled={saving}
            value={editForm.name}
            onChange={(e) =>
              setEditForm((f) => ({ ...f, name: e.target.value }))
            }
            slotProps={{ inputLabel: { shrink: true } }}
          />
          <TextField
            label="Description"
            fullWidth
            multiline
            rows={2}
            disabled={saving}
            value={editForm.description}
            onChange={(e) =>
              setEditForm((f) => ({ ...f, description: e.target.value }))
            }
            slotProps={{ inputLabel: { shrink: true } }}
          />
          <TextField
            label="Package Price (₹)"
            type="number"
            fullWidth
            required
            disabled={saving}
            value={editForm.customPrice || ""}
            onChange={(e) =>
              setEditForm((f) => ({
                ...f,
                customPrice: parseFloat(e.target.value) || 0,
              }))
            }
            slotProps={{
              inputLabel: { shrink: true },
              input: {
                startAdornment: (
                  <InputAdornment position="start">₹</InputAdornment>
                ),
              },
            }}
          />
          <Box>
            <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1 }}>
              Included Services
            </Typography>
            <ServiceSelector
              availableServices={availableServices}
              selectedIds={editForm.serviceIds}
              onToggle={(id) =>
                toggleService(id, editForm.serviceIds, (ids) =>
                  setEditForm((f) => ({ ...f, serviceIds: ids })),
                )
              }
            />
          </Box>
        </DialogContent>
        <Divider />
        <DialogActions sx={{ px: 3, py: 2, gap: 1 }}>
          <Button
            onClick={() => setEditOpen(false)}
            variant="outlined"
            color="inherit"
            disabled={saving}
            sx={{
              fontWeight: 700,
              textTransform: "none",
              borderRadius: "8px",
              borderColor: "var(--color-border)",
            }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleEditSubmit}
            variant="contained"
            color="secondary"
            disabled={saving}
            startIcon={
              saving ? (
                <CircularProgress size={16} color="inherit" />
              ) : (
                <EditIcon />
              )
            }
            sx={{
              fontWeight: 700,
              textTransform: "none",
              borderRadius: "8px",
              color: "#fff",
            }}
          >
            {saving ? "Saving..." : "Save Changes"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default LabPackages;
