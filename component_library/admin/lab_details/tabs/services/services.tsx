import React, { useState } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import TextField from "@mui/material/TextField";
import Chip from "@mui/material/Chip";
import CircularProgress from "@mui/material/CircularProgress";
import InputAdornment from "@mui/material/InputAdornment";
import IconButton from "@mui/material/IconButton";
import Switch from "@mui/material/Switch";
import Tooltip from "@mui/material/Tooltip";
import Divider from "@mui/material/Divider";
import Alert from "@mui/material/Alert";
import Avatar from "@mui/material/Avatar";
import SearchIcon from "@mui/icons-material/Search";
import MedicalServicesIcon from "@mui/icons-material/MedicalServices";
import EditIcon from "@mui/icons-material/Edit";
import CheckIcon from "@mui/icons-material/Check";
import CloseIcon from "@mui/icons-material/Close";
import RefreshIcon from "@mui/icons-material/Refresh";
import PercentIcon from "@mui/icons-material/Percent";
import toast, { Toaster } from "react-hot-toast";
import { useServices, AdminBranchServiceItem } from "./useServices";

interface LabServicesTabProps {
  labId: string;
}

// ─────────────────────────────────────────────
// Inline commission editor row
// ─────────────────────────────────────────────
const CommissionCell: React.FC<{
  item: AdminBranchServiceItem;
  onSave: (serviceId: string, pct: number) => Promise<any>;
  saving: boolean;
}> = ({ item, onSave, saving }) => {
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState<string>(
    item.customCommissionPct !== null && item.customCommissionPct !== undefined
      ? String(item.customCommissionPct)
      : "",
  );

  const effective = item.customCommissionPct ?? item.defaultCommissionPct;

  const handleSave = async () => {
    const parsed = parseFloat(value);
    if (isNaN(parsed) || parsed < 0 || parsed > 100) {
      toast.error("Commission must be 0–100.");
      return;
    }
    const res = await onSave(item.serviceId, parsed);
    if (res?.data?.success || res?.success) {
      toast.success("Commission updated.");
      setEditing(false);
    } else {
      toast.error("Failed to update commission.");
    }
  };

  if (editing) {
    return (
      <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
        <TextField
          size="small"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          type="number"
          sx={{ width: 90 }}
          autoFocus
          slotProps={{
            input: {
              endAdornment: <InputAdornment position="end">%</InputAdornment>,
            },
          }}
        />
        <IconButton
          size="small"
          color="success"
          onClick={handleSave}
          disabled={saving}
        >
          <CheckIcon fontSize="small" />
        </IconButton>
        <IconButton size="small" onClick={() => setEditing(false)}>
          <CloseIcon fontSize="small" />
        </IconButton>
      </Box>
    );
  }

  const isCustom =
    item.customCommissionPct !== null && item.customCommissionPct !== undefined;
  return (
    <Box sx={{ display: "flex", alignItems: "center", gap: 0.8 }}>
      <PercentIcon
        sx={{
          fontSize: 14,
          color: isCustom ? "secondary.main" : "text.secondary",
        }}
      />
      <Typography
        variant="body2"
        sx={{
          fontWeight: 700,
          color: isCustom ? "secondary.main" : "text.primary",
        }}
      >
        {effective}%
      </Typography>
      {isCustom && (
        <Typography
          variant="caption"
          sx={{ color: "text.secondary", fontWeight: 500 }}
        >
          (custom)
        </Typography>
      )}
      <Tooltip title="Edit commission">
        <IconButton
          size="small"
          onClick={() => setEditing(true)}
          sx={{ opacity: 0.45, "&:hover": { opacity: 1 } }}
        >
          <EditIcon sx={{ fontSize: 13 }} />
        </IconButton>
      </Tooltip>
    </Box>
  );
};

// ─────────────────────────────────────────────
// Active toggle for admin view
// ─────────────────────────────────────────────
const ActiveToggleCell: React.FC<{
  item: AdminBranchServiceItem;
  onToggle: (
    serviceId: string,
    payload: {
      customPrice?: number | null;
      customCommissionPct?: number | null;
      isActive: boolean;
    },
  ) => Promise<any>;
}> = ({ item, onToggle }) => {
  const [loading, setLoading] = useState(false);

  const handleToggle = async () => {
    setLoading(true);
    const res = await onToggle(item.serviceId, {
      customPrice: item.customPrice ?? null,
      customCommissionPct: item.customCommissionPct ?? null,
      isActive: !item.isActive,
    });
    setLoading(false);
    if (res?.data?.success || res?.success) {
      toast.success(
        item.isActive
          ? "Service disabled for branch."
          : "Service enabled for branch.",
      );
    } else {
      toast.error("Failed to update status.");
    }
  };

  return (
    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
      {loading ? (
        <CircularProgress size={18} color="secondary" />
      ) : (
        <Switch
          size="small"
          checked={item.isActive}
          onChange={handleToggle}
          color="secondary"
        />
      )}
      <Chip
        label={item.isActive ? "Active" : "Inactive"}
        size="small"
        variant="outlined"
        sx={{
          fontWeight: 700,
          fontSize: "10px",
          borderRadius: "5px",
          color: item.isActive ? "#10b981" : "#64748b",
          borderColor: item.isActive
            ? "rgba(16,185,129,0.3)"
            : "rgba(100,116,139,0.3)",
          bgcolor: item.isActive
            ? "rgba(16,185,129,0.06)"
            : "rgba(100,116,139,0.06)",
        }}
      />
    </Box>
  );
};

// ─────────────────────────────────────────────
// Service row card
// ─────────────────────────────────────────────
const ServiceRow: React.FC<{
  item: AdminBranchServiceItem;
  onSaveCommission: (serviceId: string, pct: number) => Promise<any>;
  onToggle: (
    serviceId: string,
    payload: {
      customPrice?: number | null;
      customCommissionPct?: number | null;
      isActive: boolean;
    },
  ) => Promise<any>;
  saving: boolean;
}> = ({ item, onSaveCommission, onToggle, saving }) => {
  const effectivePrice = item.customPrice ?? item.basePrice;
  const hasCustomPrice =
    item.customPrice !== null && item.customPrice !== undefined;

  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        gap: 2,
        px: 2.5,
        py: 1.8,
        borderBottom: "1px solid var(--color-border)",
        transition: "background 0.15s",
        "&:hover": { bgcolor: "rgba(16,185,129,0.03)" },
        "&:last-child": { borderBottom: "none" },
        flexWrap: "wrap",
      }}
    >
      {/* Icon + name + category */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 1.5,
          flex: "1 1 200px",
          minWidth: 0,
        }}
      >
        <Avatar
          sx={{
            bgcolor: "rgba(16,185,129,0.08)",
            width: 32,
            height: 32,
            flexShrink: 0,
          }}
        >
          <MedicalServicesIcon sx={{ fontSize: 16, color: "secondary.main" }} />
        </Avatar>
        <Box sx={{ minWidth: 0 }}>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1,
              flexWrap: "wrap",
            }}
          >
            <Typography
              variant="body2"
              sx={{ fontWeight: 800, color: "text.primary", lineHeight: 1.3 }}
            >
              {item.name}
            </Typography>
            <Chip
              label={item.isCustom ? "BRANCH" : "PLATFORM"}
              size="small"
              sx={{
                fontWeight: 800,
                fontSize: "9px",
                height: "18px",
                borderRadius: "4px",
                color: item.isCustom ? "#f59e0b" : "#6366f1",
                bgcolor: item.isCustom
                  ? "rgba(245,158,11,0.08)"
                  : "rgba(99,102,241,0.08)",
              }}
            />
          </Box>
          <Chip
            label={item.category}
            size="small"
            sx={{
              mt: 0.4,
              fontWeight: 600,
              fontSize: "10px",
              height: "18px",
              color: "#475569",
              bgcolor: "#f1f5f9",
            }}
          />
        </Box>
      </Box>

      {/* Price */}
      <Box sx={{ minWidth: 140 }}>
        <Typography
          variant="body2"
          sx={{ fontWeight: 800, color: "text.primary" }}
        >
          ₹{effectivePrice.toLocaleString()}
        </Typography>
        <Typography
          variant="caption"
          sx={{ color: "text.secondary", fontWeight: 500 }}
        >
          Base ₹{item.basePrice.toLocaleString()}
          {hasCustomPrice ? " · Overridden" : ""}
        </Typography>
      </Box>

      {/* Commission editor */}
      <Box sx={{ minWidth: 180 }}>
        <CommissionCell item={item} onSave={onSaveCommission} saving={saving} />
      </Box>

      {/* Active toggle */}
      <Box sx={{ minWidth: 140 }}>
        <ActiveToggleCell item={item} onToggle={onToggle} />
      </Box>
    </Box>
  );
};

// ─────────────────────────────────────────────
// Main Tab Component
// ─────────────────────────────────────────────
export const LabServicesTab: React.FC<LabServicesTabProps> = ({ labId }) => {
  const {
    services,
    loading,
    saving,
    search,
    setSearch,
    fetchServices,
    updateCommission,
    overrideService,
  } = useServices(labId);

  // Group by category
  const grouped = services.reduce<Record<string, AdminBranchServiceItem[]>>(
    (acc, s) => {
      const cat = s.category || "Uncategorized";
      if (!acc[cat]) acc[cat] = [];
      acc[cat].push(s);
      return acc;
    },
    {},
  );

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
      <Toaster position="top-right" />

      {/* Header row */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: 2,
        }}
      >
        <Box>
          <Typography variant="h6" sx={{ fontWeight: 800 }}>
            Services Catalog
          </Typography>
          <Typography variant="body2" color="text.secondary">
            View and manage all services this branch offers. Set custom
            commission % per service.
          </Typography>
        </Box>
        <Box sx={{ display: "flex", gap: 1.5, alignItems: "center" }}>
          <TextField
            placeholder="Search services..."
            size="small"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon sx={{ fontSize: "18px", color: "#64748b" }} />
                  </InputAdornment>
                ),
              },
            }}
            sx={{ width: "240px" }}
          />
          <Tooltip title="Refresh services list">
            <IconButton onClick={fetchServices} size="small" disabled={loading}>
              <RefreshIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>

      {/* Legend */}
      <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
        {[
          {
            label: "PLATFORM",
            desc: "Admin-created service",
            color: "#6366f1",
            bg: "rgba(99,102,241,0.08)",
          },
          {
            label: "BRANCH",
            desc: "Custom service by this lab",
            color: "#f59e0b",
            bg: "rgba(245,158,11,0.08)",
          },
        ].map((l) => (
          <Box
            key={l.label}
            sx={{ display: "flex", alignItems: "center", gap: 0.8 }}
          >
            <Chip
              label={l.label}
              size="small"
              sx={{
                fontWeight: 800,
                fontSize: "9px",
                height: "18px",
                borderRadius: "4px",
                color: l.color,
                bgcolor: l.bg,
              }}
            />
            <Typography variant="caption" color="text.secondary">
              {l.desc}
            </Typography>
          </Box>
        ))}
      </Box>

      {/* Table Header */}
      <Box
        sx={{
          border: "1px solid var(--color-border)",
          borderRadius: "12px",
          overflow: "hidden",
          boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
        }}
      >
        {/* Column header */}
        <Box
          sx={{
            display: "flex",
            gap: 2,
            px: 2.5,
            py: 1.2,
            bgcolor: "rgba(0,0,0,0.015)",
            borderBottom: "1px solid var(--color-border)",
            flexWrap: "wrap",
          }}
        >
          {[
            { label: "Service", flex: "1 1 200px" },
            { label: "Price", minWidth: 140 },
            { label: "Commission %", minWidth: 180 },
            { label: "Status", minWidth: 140 },
          ].map((col) => (
            <Typography
              key={col.label}
              variant="caption"
              sx={{
                fontWeight: 800,
                color: "text.secondary",
                letterSpacing: "0.06em",
                textTransform: "uppercase",
                fontSize: "10px",
                flex: col.flex,
                minWidth: col.minWidth,
              }}
            >
              {col.label}
            </Typography>
          ))}
        </Box>

        {/* Rows */}
        {loading ? (
          <Box sx={{ display: "flex", justifyContent: "center", py: 6 }}>
            <CircularProgress size={32} color="secondary" />
          </Box>
        ) : services.length === 0 ? (
          <Alert severity="info" sx={{ m: 2, borderRadius: "8px" }}>
            {search
              ? "No services match your search."
              : "No services configured for this branch yet."}
          </Alert>
        ) : (
          Object.keys(grouped)
            .sort()
            .map((category) => (
              <Box key={category}>
                <Box
                  sx={{
                    px: 2.5,
                    py: 1,
                    bgcolor: "rgba(0,0,0,0.02)",
                    borderBottom: "1px solid var(--color-border)",
                  }}
                >
                  <Typography
                    variant="caption"
                    sx={{
                      fontWeight: 800,
                      color: "text.secondary",
                      letterSpacing: "0.05em",
                      textTransform: "uppercase",
                      fontSize: "10px",
                    }}
                  >
                    {category} ({grouped[category].length})
                  </Typography>
                </Box>
                {grouped[category].map((item) => (
                  <ServiceRow
                    key={item.serviceId}
                    item={item}
                    onSaveCommission={updateCommission}
                    onToggle={overrideService}
                    saving={saving}
                  />
                ))}
              </Box>
            ))
        )}
      </Box>

      {/* Summary stats */}
      {!loading && services.length > 0 && (
        <Box sx={{ display: "flex", gap: 3, flexWrap: "wrap" }}>
          {[
            { label: "Total Services", value: services.length },
            {
              label: "Active",
              value: services.filter((s) => s.isActive).length,
              color: "#10b981",
            },
            {
              label: "Platform",
              value: services.filter((s) => !s.isCustom).length,
              color: "#6366f1",
            },
            {
              label: "Branch Custom",
              value: services.filter((s) => s.isCustom).length,
              color: "#f59e0b",
            },
          ].map((stat) => (
            <Box
              key={stat.label}
              sx={{ display: "flex", flexDirection: "column" }}
            >
              <Typography
                variant="h6"
                sx={{
                  fontWeight: 800,
                  color: stat.color || "text.primary",
                  lineHeight: 1,
                }}
              >
                {stat.value}
              </Typography>
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{ fontWeight: 600 }}
              >
                {stat.label}
              </Typography>
            </Box>
          ))}
        </Box>
      )}
    </Box>
  );
};

export default LabServicesTab;
