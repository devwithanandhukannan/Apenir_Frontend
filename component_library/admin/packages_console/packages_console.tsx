import React, { useState, useEffect, useCallback, useMemo } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Grid from "@mui/material/Grid";
import TextField from "@mui/material/TextField";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import Chip from "@mui/material/Chip";
import InputAdornment from "@mui/material/InputAdornment";
import CircularProgress from "@mui/material/CircularProgress";
import Divider from "@mui/material/Divider";
import Switch from "@mui/material/Switch";
import Tooltip from "@mui/material/Tooltip";
import IconButton from "@mui/material/IconButton";
import Checkbox from "@mui/material/Checkbox";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import SearchIcon from "@mui/icons-material/Search";
import InventoryIcon from "@mui/icons-material/Inventory";
import PaidIcon from "@mui/icons-material/Paid";
import CommissionIcon from "@mui/icons-material/Percent";
import MedicalServicesIcon from "@mui/icons-material/MedicalServices";
import toast, { Toaster } from "react-hot-toast";
import { useApi } from "@/core_components/hooks/useApi/useApi";

interface ServicePublicDto {
  id: string;
  name: string;
  category: string;
  basePrice: number;
  isActive: boolean;
  createdByBranchId?: string | null;
}

interface PackageItem {
  id: string;
  name: string;
  description: string | null;
  basePrice: number;
  platformCommissionPct: number;
  isActive: boolean;
  createdByBranchId: string | null;
  serviceIds: string[];
  createdAt: string;
}

const EMPTY_FORM = {
  name: "",
  description: "",
  basePrice: "" as number | "",
  commission: 15,
  serviceIds: [] as string[],
};

// ── ServiceSelector — defined OUTSIDE component to satisfy react-hooks/static-components ──
const ServiceSelector: React.FC<{
  allServices: ServicePublicDto[];
  selectedIds: string[];
  onToggle: (id: string) => void;
}> = ({ allServices, selectedIds, onToggle }) => {
  const [serviceSearch, setServiceSearch] = useState("");

  const filteredOptions = useMemo(() => {
    const q = serviceSearch.toLowerCase();
    return allServices.filter(
      (s) =>
        !q ||
        s.name.toLowerCase().includes(q) ||
        s.category.toLowerCase().includes(q),
    );
  }, [allServices, serviceSearch]);

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
          value={serviceSearch}
          onChange={(e) => setServiceSearch(e.target.value)}
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
          maxHeight: 260,
          overflowY: "auto",
          p: 1.5,
          display: "flex",
          flexDirection: "column",
          gap: 0.5,
        }}
      >
        {filteredOptions.length === 0 ? (
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ textAlign: "center", py: 2 }}
          >
            No services found
          </Typography>
        ) : (
          filteredOptions.map((svc) => (
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

export const PackagesConsole: React.FC = () => {
  const { get, post, put } = useApi();

  const [packages, setPackages] = useState<PackageItem[]>([]);
  const [allServices, setAllServices] = useState<ServicePublicDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const [addOpen, setAddOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<PackageItem | null>(null);
  const [form, setForm] = useState({ ...EMPTY_FORM });
  const [editForm, setEditForm] = useState({ ...EMPTY_FORM, isActive: true });

  // ── Load ──────────────────────────────────────────────────────────
  const load = useCallback(async () => {
    setLoading(true);
    const [pkgRes, svcRes] = await Promise.all([
      get<any>({ endpoint: "/api/packages/admin", requireAuth: true }),
      get<any>({ endpoint: "/api/services/all", requireAuth: true }),
    ]);
    if (pkgRes.success && pkgRes.data?.data) setPackages(pkgRes.data.data);
    if (svcRes.success && svcRes.data?.data)
      setAllServices(
        // Only master services (createdByBranchId == null) can be added to admin packages
        svcRes.data.data.filter(
          (s: ServicePublicDto) => s.isActive && !s.createdByBranchId,
        ),
      );
    setLoading(false);
  }, [get]);

  useEffect(() => {
    load();
  }, [load]);

  // ── Service lookup ──────────────────────────────────────────────
  const serviceMap = useMemo(() => {
    const m: Record<string, ServicePublicDto> = {};
    allServices.forEach((s) => {
      m[s.id] = s;
    });
    return m;
  }, [allServices]);

  // ── Filtered packages ────────────────────────────────────────────
  const filteredPackages = useMemo(() => {
    const q = searchQuery.toLowerCase();
    return packages.filter(
      (p) =>
        !q ||
        p.name.toLowerCase().includes(q) ||
        p.description?.toLowerCase().includes(q),
    );
  }, [packages, searchQuery]);

  // ── Service toggle helper ────────────────────────────────────────
  const toggleService = (
    id: string,
    current: string[],
    setter: (ids: string[]) => void,
  ) => {
    if (current.includes(id)) setter(current.filter((x) => x !== id));
    else setter([...current, id]);
  };

  // ── Add Package ──────────────────────────────────────────────────
  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (
      !form.name.trim() ||
      form.basePrice === "" ||
      form.serviceIds.length === 0
    ) {
      toast.error("Name, base price, and at least one service are required.");
      return;
    }
    setSaving(true);
    const res = await post<any, any>({
      endpoint: "/api/packages",
      body: {
        name: form.name.trim(),
        description: form.description.trim() || null,
        basePrice: Number(form.basePrice),
        platformCommissionPct: form.commission,
        serviceIds: form.serviceIds,
      },
      requireAuth: true,
    });
    setSaving(false);
    if (res.success) {
      toast.success("Package created!");
      setAddOpen(false);
      setForm({ ...EMPTY_FORM });
      load();
    } else {
      toast.error(res.data?.message || "Failed to create package.");
    }
  };

  // ── Edit Package ─────────────────────────────────────────────────
  const openEdit = (pkg: PackageItem) => {
    setEditTarget(pkg);
    setEditForm({
      name: pkg.name,
      description: pkg.description || "",
      basePrice: pkg.basePrice,
      commission: pkg.platformCommissionPct,
      serviceIds: pkg.serviceIds || [],
      isActive: pkg.isActive,
    });
    setEditOpen(true);
  };

  const handleSaveEdit = async () => {
    if (!editTarget) return;
    if (editForm.serviceIds.length === 0) {
      toast.error("At least one service is required.");
      return;
    }
    setSaving(true);
    const res = await put<any, any>({
      endpoint: `/api/packages/admin/${editTarget.id}`,
      body: {
        name: editForm.name.trim() || null,
        description: editForm.description.trim() || null,
        basePrice:
          editForm.basePrice !== "" ? Number(editForm.basePrice) : null,
        platformCommissionPct: editForm.commission,
        isActive: editForm.isActive,
        serviceIds: editForm.serviceIds,
      },
      requireAuth: true,
    });
    setSaving(false);
    if (res.success) {
      toast.success("Package updated!");
      setEditOpen(false);
      load();
    } else {
      toast.error(res.data?.message || "Failed to update package.");
    }
  };

  // ── Quick toggle ─────────────────────────────────────────────────
  const handleToggleActive = async (pkg: PackageItem) => {
    const res = await put<any, any>({
      endpoint: `/api/packages/admin/${pkg.id}`,
      body: { isActive: !pkg.isActive },
      requireAuth: true,
    });
    if (res.success) {
      toast.success(
        pkg.isActive ? "Package hidden from labs." : "Package visible to labs.",
      );
      load();
    } else {
      toast.error("Failed to update.");
    }
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
            Packages Catalog
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Bundle diagnostic tests into packages labs can subscribe to and
            customize.
          </Typography>
        </Box>
        <Button
          variant="contained"
          color="secondary"
          startIcon={<AddIcon />}
          onClick={() => {
            setForm({ ...EMPTY_FORM });
            setAddOpen(true);
          }}
          sx={{
            textTransform: "none",
            fontWeight: 700,
            borderRadius: "8px",
            boxShadow: "none",
            color: "#fff",
            "&:hover": { boxShadow: "none" },
          }}
        >
          Create Package
        </Button>
      </Box>

      {/* Search */}
      <TextField
        placeholder="Search packages..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        size="small"
        sx={{ mb: 4, maxWidth: 400 }}
        fullWidth
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
      ) : filteredPackages.length === 0 ? (
        <Box
          sx={{
            textAlign: "center",
            py: 8,
            border: "1px dashed var(--color-border)",
            borderRadius: "12px",
          }}
        >
          <InventoryIcon sx={{ fontSize: 48, color: "text.disabled", mb: 1 }} />
          <Typography color="text.secondary">
            No packages yet. Click "Create Package" to bundle services.
          </Typography>
        </Box>
      ) : (
        <Grid container spacing={3}>
          {filteredPackages.map((pkg) => (
            <Grid key={pkg.id} size={{ xs: 12, sm: 6, md: 4 }}>
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
                      label="HIDDEN"
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
                  <Box>
                    <Typography
                      variant="subtitle1"
                      sx={{
                        fontWeight: 800,
                        color: "text.primary",
                        lineHeight: 1.3,
                        pr: 4,
                      }}
                    >
                      {pkg.name}
                    </Typography>
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
                      INCLUDES ({pkg.serviceIds?.length || 0} tests)
                    </Typography>
                    <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.6 }}>
                      {(pkg.serviceIds || []).slice(0, 4).map((sid) => (
                        <Chip
                          key={sid}
                          size="small"
                          label={serviceMap[sid]?.name || sid.slice(0, 8) + "…"}
                          icon={
                            <MedicalServicesIcon
                              sx={{ fontSize: "11px !important" }}
                            />
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
                      {(pkg.serviceIds?.length || 0) > 4 && (
                        <Chip
                          size="small"
                          label={`+${pkg.serviceIds.length - 4} more`}
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

                  {/* Price + Commission */}
                  <Box
                    sx={{ display: "flex", justifyContent: "space-between" }}
                  >
                    <Box>
                      <Typography
                        variant="caption"
                        color="text.secondary"
                        sx={{ display: "block", fontWeight: 600 }}
                      >
                        BASE PRICE
                      </Typography>
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          gap: 0.5,
                          color: "secondary.main",
                          mt: 0.2,
                        }}
                      >
                        <PaidIcon sx={{ fontSize: "16px" }} />
                        <Typography
                          variant="subtitle2"
                          sx={{ fontWeight: 800 }}
                        >
                          ₹{pkg.basePrice}
                        </Typography>
                      </Box>
                    </Box>
                    <Box>
                      <Typography
                        variant="caption"
                        color="text.secondary"
                        sx={{ display: "block", fontWeight: 600 }}
                      >
                        COMMISSION
                      </Typography>
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          gap: 0.5,
                          color: "#059669",
                          mt: 0.2,
                        }}
                      >
                        <CommissionIcon sx={{ fontSize: "16px" }} />
                        <Typography
                          variant="subtitle2"
                          sx={{ fontWeight: 800 }}
                        >
                          {pkg.platformCommissionPct}%
                        </Typography>
                      </Box>
                    </Box>
                  </Box>

                  {/* Actions */}
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <Box
                      sx={{ display: "flex", alignItems: "center", gap: 0.5 }}
                    >
                      <Switch
                        size="small"
                        checked={pkg.isActive}
                        onChange={() => handleToggleActive(pkg)}
                        color="secondary"
                      />
                      <Typography
                        variant="caption"
                        sx={{
                          fontWeight: 600,
                          color: pkg.isActive
                            ? "secondary.main"
                            : "text.disabled",
                        }}
                      >
                        {pkg.isActive ? "Visible" : "Hidden"}
                      </Typography>
                    </Box>
                    <Tooltip title="Edit package">
                      <IconButton
                        size="small"
                        onClick={() => openEdit(pkg)}
                        sx={{
                          border: "1px solid var(--color-border)",
                          borderRadius: "8px",
                        }}
                      >
                        <EditIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* ── Create Package Dialog ─────────────────────────────────── */}
      <Dialog
        open={addOpen}
        onClose={() => !saving && setAddOpen(false)}
        maxWidth="sm"
        fullWidth
        slotProps={{ paper: { sx: { borderRadius: "16px" } } }}
      >
        <form onSubmit={handleAdd}>
          <DialogTitle sx={{ fontWeight: 800 }}>Create Package</DialogTitle>
          <Divider />
          <DialogContent
            sx={{ py: 2.5, display: "flex", flexDirection: "column", gap: 2.5 }}
          >
            <TextField
              label="Package Name"
              fullWidth
              required
              disabled={saving}
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              placeholder="e.g. Home Health Essentials"
              slotProps={{ inputLabel: { shrink: true } }}
            />
            <TextField
              label="Description"
              fullWidth
              multiline
              rows={2}
              disabled={saving}
              value={form.description}
              onChange={(e) =>
                setForm((f) => ({ ...f, description: e.target.value }))
              }
              slotProps={{ inputLabel: { shrink: true } }}
            />
            <Grid container spacing={2}>
              <Grid size={{ xs: 6 }}>
                <TextField
                  label="Base Price (₹)"
                  type="number"
                  fullWidth
                  required
                  disabled={saving}
                  value={form.basePrice}
                  onChange={(e) =>
                    setForm((f) => ({
                      ...f,
                      basePrice:
                        e.target.value === "" ? "" : Number(e.target.value),
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
              </Grid>
              <Grid size={{ xs: 6 }}>
                <TextField
                  label="Commission (%)"
                  type="number"
                  fullWidth
                  required
                  disabled={saving}
                  value={form.commission}
                  onChange={(e) =>
                    setForm((f) => ({
                      ...f,
                      commission: Number(e.target.value),
                    }))
                  }
                  slotProps={{
                    inputLabel: { shrink: true },
                    input: {
                      endAdornment: (
                        <InputAdornment position="end">%</InputAdornment>
                      ),
                    },
                  }}
                />
              </Grid>
            </Grid>
            <Box>
              <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1 }}>
                Select Services
              </Typography>
              <ServiceSelector
                allServices={allServices}
                selectedIds={form.serviceIds}
                onToggle={(id) =>
                  toggleService(id, form.serviceIds, (ids) =>
                    setForm((f) => ({ ...f, serviceIds: ids })),
                  )
                }
              />
            </Box>
          </DialogContent>
          <Divider />
          <DialogActions sx={{ px: 3, py: 2, gap: 1 }}>
            <Button
              onClick={() => setAddOpen(false)}
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

      {/* ── Edit Package Dialog ───────────────────────────────────── */}
      <Dialog
        open={editOpen}
        onClose={() => !saving && setEditOpen(false)}
        maxWidth="sm"
        fullWidth
        slotProps={{ paper: { sx: { borderRadius: "16px" } } }}
      >
        <DialogTitle sx={{ fontWeight: 800 }}>Edit Package</DialogTitle>
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
          <Grid container spacing={2}>
            <Grid size={{ xs: 6 }}>
              <TextField
                label="Base Price (₹)"
                type="number"
                fullWidth
                required
                disabled={saving}
                value={editForm.basePrice}
                onChange={(e) =>
                  setEditForm((f) => ({
                    ...f,
                    basePrice:
                      e.target.value === "" ? "" : Number(e.target.value),
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
            </Grid>
            <Grid size={{ xs: 6 }}>
              <TextField
                label="Commission (%)"
                type="number"
                fullWidth
                required
                disabled={saving}
                value={editForm.commission}
                onChange={(e) =>
                  setEditForm((f) => ({
                    ...f,
                    commission: Number(e.target.value),
                  }))
                }
                slotProps={{
                  inputLabel: { shrink: true },
                  input: {
                    endAdornment: (
                      <InputAdornment position="end">%</InputAdornment>
                    ),
                  },
                }}
              />
            </Grid>
          </Grid>
          <Box>
            <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1 }}>
              Included Services
            </Typography>
            <ServiceSelector
              allServices={allServices}
              selectedIds={editForm.serviceIds}
              onToggle={(id) =>
                toggleService(id, editForm.serviceIds, (ids) =>
                  setEditForm((f) => ({ ...f, serviceIds: ids })),
                )
              }
            />
          </Box>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1.5,
              p: 1.5,
              borderRadius: "8px",
              border: "1px solid var(--color-border)",
              bgcolor: editForm.isActive
                ? "rgba(16,185,129,0.04)"
                : "rgba(100,116,139,0.04)",
            }}
          >
            <Switch
              size="small"
              checked={editForm.isActive}
              onChange={(e) =>
                setEditForm((f) => ({ ...f, isActive: e.target.checked }))
              }
              color="secondary"
            />
            <Box>
              <Typography variant="body2" sx={{ fontWeight: 700 }}>
                {editForm.isActive
                  ? "Active — Visible to labs"
                  : "Inactive — Hidden from all labs"}
              </Typography>
            </Box>
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
            onClick={handleSaveEdit}
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

export default PackagesConsole;
