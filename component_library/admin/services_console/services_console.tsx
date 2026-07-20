import React, { useState, useEffect, useCallback, useMemo } from "react";
import axios from "axios";
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
import MenuItem from "@mui/material/MenuItem";
import Chip from "@mui/material/Chip";
import Tab from "@mui/material/Tab";
import Tabs from "@mui/material/Tabs";
import InputAdornment from "@mui/material/InputAdornment";
import CircularProgress from "@mui/material/CircularProgress";
import Divider from "@mui/material/Divider";
import Switch from "@mui/material/Switch";
import Tooltip from "@mui/material/Tooltip";
import IconButton from "@mui/material/IconButton";
import Avatar from "@mui/material/Avatar";
import AddIcon from "@mui/icons-material/Add";
import SearchIcon from "@mui/icons-material/Search";
import EditIcon from "@mui/icons-material/Edit";
import PaidIcon from "@mui/icons-material/Paid";
import CommissionIcon from "@mui/icons-material/Percent";
import ScienceIcon from "@mui/icons-material/Science";
import BusinessIcon from "@mui/icons-material/Business";
import toast, { Toaster } from "react-hot-toast";
import { useApi } from "@/core_components/hooks/useApi/useApi";
import { useAbortController } from "@/core_components/hooks/useAbortController/useAbortController";

interface ServiceAdminDto {
  id: string;
  name: string;
  description: string | null;
  category: string;
  basePrice: number;
  platformCommissionPct: number;
  isActive: boolean;
  createdByBranchId: string | null;
  createdByBranchName: string | null;
  createdAt: string;
}

const SERVICES_CONSOLE_KEYS = ["FETCH_SERVICES_REQUEST"] as const;

export const ServicesConsole: React.FC = () => {
  const { get, post, put } = useApi();
  const { controllers } = useAbortController(SERVICES_CONSOLE_KEYS);

  const [services, setServices] = useState<ServiceAdminDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState(0); // 0 = Platform, 1 = Lab Custom
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState("All");

  // ── Dialogs ──────────────────────────────────────────────────────
  const [addOpen, setAddOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<ServiceAdminDto | null>(null);

  // ── Add Form ─────────────────────────────────────────────────────
  const [formName, setFormName] = useState("");
  const [formDescription, setFormDescription] = useState("");
  const [formCategory, setFormCategory] = useState("");
  const [newCategoryInput, setNewCategoryInput] = useState("");
  const [isCreatingNewCategory, setIsCreatingNewCategory] = useState(false);
  const [formBasePrice, setFormBasePrice] = useState<number | "">("");
  const [formCommission, setFormCommission] = useState<number>(15);

  // ── Edit Form ─────────────────────────────────────────────────────
  const [editName, setEditName] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editCategory, setEditCategory] = useState("");
  const [editBasePrice, setEditBasePrice] = useState<number | "">("");
  const [editCommission, setEditCommission] = useState<number>(15);
  const [editIsActive, setEditIsActive] = useState(true);

  // ── Load ──────────────────────────────────────────────────────────
  const loadServices = useCallback(async () => {
    setLoading(true);
    controllers.FETCH_SERVICES_REQUEST.reset();
    const signal = controllers.FETCH_SERVICES_REQUEST.signal;

    try {
      const res = await get<any>({
        endpoint: "/api/services/all",
        requireAuth: true,
        signal,
      });

      if (
        signal.aborted ||
        (res.error &&
          (res.error.name === "CanceledError" ||
            res.error.message === "canceled" ||
            axios.isCancel(res.error)))
      ) {
        return;
      }

      if (res.success && res.data?.data) {
        setServices(res.data.data);
      }
      setLoading(false);
    } catch (error: any) {
      if (
        signal.aborted ||
        error?.name === "CanceledError" ||
        error?.message === "canceled" ||
        axios.isCancel(error)
      ) {
        return;
      }
      setLoading(false);
    }
  }, [get, controllers]);

  useEffect(() => {
    loadServices();
  }, [loadServices]);

  // ── Filtered / grouped ────────────────────────────────────────────
  const isLabTab = activeTab === 1;

  const categories = useMemo(() => {
    const set = new Set<string>();
    services
      .filter((s) =>
        isLabTab ? s.createdByBranchId !== null : s.createdByBranchId === null,
      )
      .forEach((s) => {
        if (s.category) set.add(s.category);
      });
    return Array.from(set).sort();
  }, [services, isLabTab]);

  const filteredServices = useMemo(() => {
    return services.filter((s) => {
      if (
        isLabTab ? s.createdByBranchId === null : s.createdByBranchId !== null
      )
        return false;
      const q = searchQuery.toLowerCase();
      if (
        q &&
        !s.name.toLowerCase().includes(q) &&
        !s.description?.toLowerCase().includes(q)
      )
        return false;
      if (
        selectedCategoryFilter !== "All" &&
        s.category !== selectedCategoryFilter
      )
        return false;
      return true;
    });
  }, [services, searchQuery, selectedCategoryFilter, isLabTab]);

  const groupedServices = useMemo(() => {
    const groups: Record<string, ServiceAdminDto[]> = {};
    filteredServices.forEach((s) => {
      if (!groups[s.category]) groups[s.category] = [];
      groups[s.category].push(s);
    });
    return groups;
  }, [filteredServices]);

  // ── Add Service ──────────────────────────────────────────────────
  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    const finalCategory = isCreatingNewCategory
      ? newCategoryInput.trim()
      : formCategory;
    if (
      !formName.trim() ||
      !finalCategory ||
      formBasePrice === "" ||
      formBasePrice < 0
    ) {
      toast.error("Name, category, and valid base price are required.");
      return;
    }
    setSaving(true);
    const res = await post<any, any>({
      endpoint: "/api/services",
      body: {
        name: formName.trim(),
        description: formDescription.trim() || null,
        category: finalCategory,
        basePrice: Number(formBasePrice),
        platformCommissionPct: formCommission,
      },
      requireAuth: true,
    });
    setSaving(false);
    if (res.success) {
      toast.success("Service added!");
      setAddOpen(false);
      resetAddForm();
      loadServices();
    } else {
      toast.error(res.data?.message || "Failed to add service.");
    }
  };

  const resetAddForm = () => {
    setFormName("");
    setFormDescription("");
    setFormCategory("");
    setNewCategoryInput("");
    setIsCreatingNewCategory(false);
    setFormBasePrice("");
    setFormCommission(15);
  };

  // ── Edit Service ─────────────────────────────────────────────────
  const openEdit = (svc: ServiceAdminDto) => {
    setEditTarget(svc);
    setEditName(svc.name);
    setEditDescription(svc.description || "");
    setEditCategory(svc.category);
    setEditBasePrice(svc.basePrice);
    setEditCommission(svc.platformCommissionPct);
    setEditIsActive(svc.isActive);
    setEditOpen(true);
  };

  const handleSaveEdit = async () => {
    if (!editTarget) return;
    setSaving(true);
    const res = await put<any, any>({
      endpoint: `/api/admin/services/${editTarget.id}`,
      body: {
        name: editName.trim() || null,
        description: editDescription.trim() || null,
        category: editCategory.trim() || null,
        basePrice: editBasePrice !== "" ? Number(editBasePrice) : null,
        platformCommissionPct: editCommission,
        isActive: editIsActive,
      },
      requireAuth: true,
    });
    setSaving(false);
    if (res.success) {
      toast.success("Service updated!");
      setEditOpen(false);
      loadServices();
    } else {
      toast.error(res.data?.message || "Failed to update service.");
    }
  };

  // ── Quick active toggle ──────────────────────────────────────────
  const handleToggleActive = async (svc: ServiceAdminDto) => {
    const res = await put<any, any>({
      endpoint: `/api/admin/services/${svc.id}`,
      body: { isActive: !svc.isActive },
      requireAuth: true,
    });
    if (res.success) {
      toast.success(
        svc.isActive ? "Service hidden from labs." : "Service visible to labs.",
      );
      loadServices();
    } else {
      toast.error("Failed to update.");
    }
  };

  const platformCount = services.filter(
    (s) => s.createdByBranchId === null,
  ).length;
  const labCustomCount = services.filter(
    (s) => s.createdByBranchId !== null,
  ).length;

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
            Services Catalog
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Manage platform diagnostic tests and view lab-created custom
            services.
          </Typography>
        </Box>
        <Button
          variant="contained"
          color="secondary"
          startIcon={<AddIcon />}
          onClick={() => setAddOpen(true)}
          sx={{
            textTransform: "none",
            fontWeight: 700,
            borderRadius: "8px",
            boxShadow: "none",
            color: "#fff",
            "&:hover": { boxShadow: "none" },
          }}
        >
          Add Platform Service
        </Button>
      </Box>

      {/* Tabs */}
      <Tabs
        value={activeTab}
        onChange={(_, v) => {
          setActiveTab(v);
          setSelectedCategoryFilter("All");
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
        <Tab label={`Platform Services (${platformCount})`} />
        <Tab label={`Lab Custom Services (${labCustomCount})`} />
      </Tabs>

      {/* Filters */}
      <Box
        sx={{
          display: "flex",
          gap: 2,
          mb: 4,
          flexDirection: { xs: "column", sm: "row" },
        }}
      >
        <TextField
          placeholder="Search name or description..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          size="small"
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
          sx={{ maxWidth: { sm: 400 } }}
        />
        <TextField
          select
          label="Category"
          value={selectedCategoryFilter}
          onChange={(e) => setSelectedCategoryFilter(e.target.value)}
          size="small"
          sx={{ minWidth: 200 }}
        >
          <MenuItem value="All">All Categories</MenuItem>
          {categories.map((cat) => (
            <MenuItem key={cat} value={cat}>
              {cat}
            </MenuItem>
          ))}
        </TextField>
      </Box>

      {/* Content */}
      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
          <CircularProgress color="secondary" />
        </Box>
      ) : Object.keys(groupedServices).length === 0 ? (
        <Box
          sx={{
            textAlign: "center",
            py: 8,
            border: "1px dashed var(--color-border)",
            borderRadius: "12px",
          }}
        >
          <ScienceIcon sx={{ fontSize: 48, color: "text.disabled", mb: 1 }} />
          <Typography color="text.secondary" variant="body1">
            {activeTab === 0
              ? 'No platform services yet. Click "Add Platform Service" to start.'
              : "No lab-created custom services found."}
          </Typography>
        </Box>
      ) : (
        <Box sx={{ display: "flex", flexDirection: "column", gap: 5 }}>
          {Object.entries(groupedServices).map(([category, items]) => (
            <Box key={category}>
              <Box
                sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 2 }}
              >
                <Typography variant="h6" sx={{ fontWeight: 800 }}>
                  {category}
                </Typography>
                <Chip
                  label={`${items.length} ${items.length === 1 ? "test" : "tests"}`}
                  size="small"
                  sx={{
                    fontWeight: 700,
                    fontSize: "11px",
                    bgcolor: "rgba(0,0,0,0.04)",
                    color: "text.secondary",
                  }}
                />
              </Box>
              <Grid container spacing={3}>
                {items.map((svc) => (
                  <Grid key={svc.id} size={{ xs: 12, sm: 6, md: 4 }}>
                    <Card
                      sx={{
                        border: "1px solid var(--color-divider)",
                        boxShadow: "none",
                        opacity: svc.isActive ? 1 : 0.55,
                        transition: "opacity 0.2s",
                        position: "relative",
                      }}
                    >
                      {/* Inactive overlay tag */}
                      {!svc.isActive && (
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
                        }}
                      >
                        {/* Name + category + lab badge */}
                        <Box
                          sx={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "flex-start",
                            gap: 1,
                          }}
                        >
                          <Box sx={{ minWidth: 0 }}>
                            <Typography
                              variant="subtitle1"
                              sx={{
                                fontWeight: 800,
                                lineHeight: 1.3,
                                color: "text.primary",
                              }}
                            >
                              {svc.name}
                            </Typography>
                            {svc.createdByBranchName && (
                              <Box
                                sx={{
                                  display: "flex",
                                  alignItems: "center",
                                  gap: 0.5,
                                  mt: 0.4,
                                }}
                              >
                                <BusinessIcon
                                  sx={{ fontSize: 12, color: "#f59e0b" }}
                                />
                                <Typography
                                  variant="caption"
                                  sx={{ color: "#f59e0b", fontWeight: 700 }}
                                >
                                  {svc.createdByBranchName}
                                </Typography>
                              </Box>
                            )}
                          </Box>
                          <Chip
                            label={svc.category}
                            size="small"
                            variant="outlined"
                            sx={{
                              fontWeight: 700,
                              fontSize: "10px",
                              borderRadius: "4px",
                              flexShrink: 0,
                              color: "#475569",
                              borderColor: "#cbd5e1",
                            }}
                          />
                        </Box>

                        <Typography
                          variant="body2"
                          color="text.secondary"
                          sx={{
                            flexGrow: 1,
                            minHeight: "36px",
                            display: "-webkit-box",
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: "vertical",
                            overflow: "hidden",
                          }}
                        >
                          {svc.description || "No description provided."}
                        </Typography>

                        <Divider />

                        {/* Price + Commission */}
                        <Box
                          sx={{
                            display: "flex",
                            justifyContent: "space-between",
                          }}
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
                                ₹{svc.basePrice}
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
                                {svc.platformCommissionPct}%
                              </Typography>
                            </Box>
                          </Box>
                        </Box>

                        {/* Actions row */}
                        <Box
                          sx={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            pt: 0.5,
                          }}
                        >
                          <Box
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              gap: 0.5,
                            }}
                          >
                            <Switch
                              size="small"
                              checked={svc.isActive}
                              onChange={() => handleToggleActive(svc)}
                              color="secondary"
                            />
                            <Typography
                              variant="caption"
                              sx={{
                                fontWeight: 600,
                                color: svc.isActive
                                  ? "secondary.main"
                                  : "text.disabled",
                              }}
                            >
                              {svc.isActive ? "Visible" : "Hidden"}
                            </Typography>
                          </Box>
                          <Tooltip title="Edit service">
                            <IconButton
                              size="small"
                              onClick={() => openEdit(svc)}
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
            </Box>
          ))}
        </Box>
      )}

      {/* ── Add Service Dialog ─────────────────────────────────── */}
      <Dialog
        open={addOpen}
        onClose={() => !saving && setAddOpen(false)}
        maxWidth="sm"
        fullWidth
        slotProps={{ paper: { sx: { borderRadius: "16px", p: 1 } } }}
      >
        <form onSubmit={handleAdd}>
          <DialogTitle sx={{ fontWeight: 800, pb: 1 }}>
            Add Platform Service
          </DialogTitle>
          <DialogContent
            sx={{ py: 1.5, display: "flex", flexDirection: "column", gap: 2.5 }}
          >
            <Typography variant="body2" color="text.secondary">
              Create a new diagnostic test globally available for all lab
              branches.
            </Typography>
            <TextField
              label="Service Name"
              placeholder="e.g. Complete Blood Count (CBC)"
              fullWidth
              required
              disabled={saving}
              value={formName}
              onChange={(e) => setFormName(e.target.value)}
              slotProps={{ inputLabel: { shrink: true } }}
            />
            <TextField
              label="Description"
              fullWidth
              multiline
              rows={3}
              disabled={saving}
              value={formDescription}
              onChange={(e) => setFormDescription(e.target.value)}
              slotProps={{ inputLabel: { shrink: true } }}
            />
            <Box
              sx={{
                border: "1px solid var(--color-border)",
                p: 2,
                borderRadius: "8px",
              }}
            >
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  mb: 2,
                }}
              >
                <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                  Category
                </Typography>
                <Button
                  size="small"
                  onClick={() =>
                    setIsCreatingNewCategory(!isCreatingNewCategory)
                  }
                  sx={{ textTransform: "none", fontWeight: 700 }}
                >
                  {isCreatingNewCategory ? "Select Existing" : "+ New Category"}
                </Button>
              </Box>
              {isCreatingNewCategory ? (
                <TextField
                  label="New Category"
                  fullWidth
                  required
                  disabled={saving}
                  value={newCategoryInput}
                  onChange={(e) => setNewCategoryInput(e.target.value)}
                  slotProps={{ inputLabel: { shrink: true } }}
                />
              ) : (
                <TextField
                  select
                  label="Choose Category"
                  fullWidth
                  required
                  disabled={saving || categories.length === 0}
                  value={formCategory}
                  onChange={(e) => setFormCategory(e.target.value)}
                  slotProps={{ inputLabel: { shrink: true } }}
                >
                  {categories.length === 0 ? (
                    <MenuItem disabled>No categories — create one</MenuItem>
                  ) : (
                    categories.map((cat) => (
                      <MenuItem key={cat} value={cat}>
                        {cat}
                      </MenuItem>
                    ))
                  )}
                </TextField>
              )}
            </Box>
            <Grid container spacing={2}>
              <Grid size={{ xs: 6 }}>
                <TextField
                  label="Base Price (₹)"
                  type="number"
                  fullWidth
                  required
                  disabled={saving}
                  value={formBasePrice}
                  onChange={(e) =>
                    setFormBasePrice(
                      e.target.value === "" ? "" : Number(e.target.value),
                    )
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
                  value={formCommission}
                  onChange={(e) => setFormCommission(Number(e.target.value))}
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
          </DialogContent>
          <DialogActions sx={{ px: 3, py: 2 }}>
            <Button
              onClick={() => {
                setAddOpen(false);
                resetAddForm();
              }}
              variant="outlined"
              color="inherit"
              disabled={saving}
              sx={{
                fontWeight: 700,
                textTransform: "none",
                borderRadius: "8px",
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
                saving ? <CircularProgress size={16} color="inherit" /> : null
              }
              sx={{
                fontWeight: 700,
                textTransform: "none",
                borderRadius: "8px",
                color: "#fff",
              }}
            >
              {saving ? "Adding..." : "Add Service"}
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* ── Edit Service Dialog ───────────────────────────────── */}
      <Dialog
        open={editOpen}
        onClose={() => !saving && setEditOpen(false)}
        maxWidth="sm"
        fullWidth
        slotProps={{ paper: { sx: { borderRadius: "16px", p: 1 } } }}
      >
        <DialogTitle sx={{ fontWeight: 800, pb: 0 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
            <Avatar
              sx={{ bgcolor: "rgba(16,185,129,0.1)", width: 34, height: 34 }}
            >
              <ScienceIcon sx={{ color: "secondary.main", fontSize: 18 }} />
            </Avatar>
            Edit Service
          </Box>
          {editTarget?.createdByBranchName && (
            <Typography
              variant="caption"
              sx={{
                color: "#f59e0b",
                fontWeight: 700,
                display: "flex",
                alignItems: "center",
                gap: 0.5,
                mt: 0.5,
              }}
            >
              <BusinessIcon sx={{ fontSize: 12 }} /> Lab:{" "}
              {editTarget.createdByBranchName}
            </Typography>
          )}
        </DialogTitle>
        <Divider sx={{ mt: 1.5 }} />
        <DialogContent
          sx={{ py: 2.5, display: "flex", flexDirection: "column", gap: 2.5 }}
        >
          <TextField
            label="Service Name"
            fullWidth
            required
            disabled={saving}
            value={editName}
            onChange={(e) => setEditName(e.target.value)}
            slotProps={{ inputLabel: { shrink: true } }}
          />
          <TextField
            label="Description"
            fullWidth
            multiline
            rows={3}
            disabled={saving}
            value={editDescription}
            onChange={(e) => setEditDescription(e.target.value)}
            slotProps={{ inputLabel: { shrink: true } }}
          />
          <TextField
            label="Category"
            fullWidth
            required
            disabled={saving}
            value={editCategory}
            onChange={(e) => setEditCategory(e.target.value)}
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
                value={editBasePrice}
                onChange={(e) =>
                  setEditBasePrice(
                    e.target.value === "" ? "" : Number(e.target.value),
                  )
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
                value={editCommission}
                onChange={(e) => setEditCommission(Number(e.target.value))}
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
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1.5,
              p: 1.5,
              borderRadius: "8px",
              border: "1px solid var(--color-border)",
              bgcolor: editIsActive
                ? "rgba(16,185,129,0.04)"
                : "rgba(100,116,139,0.04)",
            }}
          >
            <Switch
              size="small"
              checked={editIsActive}
              onChange={(e) => setEditIsActive(e.target.checked)}
              color="secondary"
            />
            <Box>
              <Typography variant="body2" sx={{ fontWeight: 700 }}>
                {editIsActive
                  ? "Active — Visible to labs"
                  : "Inactive — Hidden from all labs"}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Inactive services cannot be enrolled or ordered by any lab.
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

export default ServicesConsole;
