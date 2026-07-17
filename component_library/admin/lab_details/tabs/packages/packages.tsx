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
import Alert from "@mui/material/Alert";
import Avatar from "@mui/material/Avatar";
import SearchIcon from "@mui/icons-material/Search";
import InventoryIcon from "@mui/icons-material/Inventory";
import EditIcon from "@mui/icons-material/Edit";
import CheckIcon from "@mui/icons-material/Check";
import CloseIcon from "@mui/icons-material/Close";
import RefreshIcon from "@mui/icons-material/Refresh";
import PercentIcon from "@mui/icons-material/Percent";
import toast, { Toaster } from "react-hot-toast";
import { usePackages, AdminBranchPackageItem } from "./usePackages";

interface LabPackagesTabProps {
  labId: string;
}

// ─────────────────────────────────────────────
// Inline commission editor row
// ─────────────────────────────────────────────
const CommissionCell: React.FC<{
  item: AdminBranchPackageItem;
  onSave: (packageId: string, pct: number) => Promise<any>;
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
    const res = await onSave(item.packageId, parsed);
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
  item: AdminBranchPackageItem;
  onToggle: (
    packageId: string,
    payload: {
      customPrice: number | null;
      customOriginalPrice: number | null;
      customCommissionPct?: number | null;
      isActive: boolean;
    },
  ) => Promise<any>;
}> = ({ item, onToggle }) => {
  const [loading, setLoading] = useState(false);

  const handleToggle = async () => {
    setLoading(true);
    const res = await onToggle(item.packageId, {
      customPrice: item.customPrice ?? null,
      customOriginalPrice: item.customOriginalPrice ?? null,
      customCommissionPct: item.customCommissionPct ?? null,
      isActive: !item.isActive,
    });
    setLoading(false);
    if (res?.data?.success || res?.success) {
      toast.success(
        item.isActive
          ? "Package disabled for branch."
          : "Package enabled for branch.",
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
// Inline Price Editor Cell
// ─────────────────────────────────────────────
const PriceCell: React.FC<{
  item: AdminBranchPackageItem;
  onSave: (
    packageId: string,
    payload: {
      customPrice: number | null;
      customOriginalPrice: number | null;
      customCommissionPct?: number | null;
      isActive: boolean;
    },
  ) => Promise<any>;
  saving: boolean;
}> = ({ item, onSave, saving }) => {
  const [editing, setEditing] = useState(false);
  const [priceVal, setPriceVal] = useState<string>(
    item.customPrice !== null && item.customPrice !== undefined
      ? String(item.customPrice)
      : "",
  );
  const [origVal, setOrigVal] = useState<string>(
    item.customOriginalPrice !== null && item.customOriginalPrice !== undefined
      ? String(item.customOriginalPrice)
      : "",
  );

  const effectivePrice = item.customPrice ?? item.basePrice;
  const effectiveOriginalPrice = item.customOriginalPrice ?? item.originalPrice;

  const handleSave = async () => {
    const p = priceVal.trim() === "" ? null : parseFloat(priceVal);
    const o = origVal.trim() === "" ? null : parseFloat(origVal);

    if (p !== null && (isNaN(p) || p < 0)) {
      toast.error("Price must be positive.");
      return;
    }
    if (o !== null && (isNaN(o) || o < 0)) {
      toast.error("Original Price must be positive.");
      return;
    }

    const res = await onSave(item.packageId, {
      customPrice: p,
      customOriginalPrice: o,
      customCommissionPct: item.customCommissionPct ?? null,
      isActive: item.isActive,
    });

    if (res?.data?.success || res?.success) {
      toast.success("Prices updated.");
      setEditing(false);
    } else {
      toast.error("Failed to update prices.");
    }
  };

  if (editing) {
    return (
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          gap: 1,
          p: 1,
          border: "1px solid",
          borderColor: "divider",
          borderRadius: "8px",
          bgcolor: "#fafafa",
        }}
      >
        <TextField
          label="Custom Price"
          size="small"
          value={priceVal}
          onChange={(e) => setPriceVal(e.target.value)}
          type="number"
          placeholder="Base"
          slotProps={{ inputLabel: { shrink: true } }}
        />
        <TextField
          label="Original Price"
          size="small"
          value={origVal}
          onChange={(e) => setOrigVal(e.target.value)}
          type="number"
          placeholder="None"
          slotProps={{ inputLabel: { shrink: true } }}
        />
        <Box sx={{ display: "flex", gap: 1, justifyContent: "flex-end" }}>
          <IconButton size="small" onClick={() => setEditing(false)}>
            <CloseIcon fontSize="small" />
          </IconButton>
          <IconButton
            size="small"
            color="success"
            onClick={handleSave}
            disabled={saving}
          >
            <CheckIcon fontSize="small" />
          </IconButton>
        </Box>
      </Box>
    );
  }

  const isCustom = item.customPrice !== null && item.customPrice !== undefined;
  const isCustomOrig =
    item.customOriginalPrice !== null && item.customOriginalPrice !== undefined;

  return (
    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
      <Box>
        <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
          <Typography
            variant="body2"
            sx={{
              fontWeight: 800,
              color: isCustom ? "secondary.main" : "text.primary",
            }}
          >
            ₹{effectivePrice.toLocaleString()}
          </Typography>
          {effectiveOriginalPrice &&
            effectiveOriginalPrice > effectivePrice && (
              <Typography
                variant="caption"
                sx={{ textDecoration: "line-through", color: "text.secondary" }}
              >
                ₹{effectiveOriginalPrice.toLocaleString()}
              </Typography>
            )}
        </Box>
        <Typography
          variant="caption"
          color="text.secondary"
          sx={{ fontWeight: 500, display: "block" }}
        >
          Base: ₹{item.basePrice.toLocaleString()}
          {isCustom || isCustomOrig ? " · Customized" : ""}
        </Typography>
      </Box>
      <Tooltip title="Edit Prices">
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
// Package row card
// ─────────────────────────────────────────────
const PackageRow: React.FC<{
  item: AdminBranchPackageItem;
  onSaveCommission: (packageId: string, pct: number) => Promise<any>;
  onToggle: (
    packageId: string,
    payload: {
      customPrice: number | null;
      customOriginalPrice: number | null;
      customCommissionPct?: number | null;
      isActive: boolean;
    },
  ) => Promise<any>;
  saving: boolean;
}> = ({ item, onSaveCommission, onToggle, saving }) => {
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
      {/* Icon + name */}
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
          <InventoryIcon sx={{ fontSize: 16, color: "secondary.main" }} />
        </Avatar>
        <Box sx={{ minWidth: 0 }}>
          <Typography
            variant="body2"
            sx={{ fontWeight: 800, color: "text.primary", lineHeight: 1.3 }}
          >
            {item.name}
          </Typography>
          <Typography
            variant="caption"
            color="text.secondary"
            sx={{ display: "block", mt: 0.2 }}
          >
            {item.serviceIds?.length || 0} tests included
          </Typography>
        </Box>
      </Box>

      {/* Price */}
      <Box sx={{ minWidth: 160 }}>
        <PriceCell item={item} onSave={onToggle} saving={saving} />
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
export const LabPackagesTab: React.FC<LabPackagesTabProps> = ({ labId }) => {
  const {
    packages,
    loading,
    saving,
    search,
    setSearch,
    fetchPackages,
    updateCommission,
    overridePackage,
  } = usePackages(labId);

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
            Packages Catalog
          </Typography>
          <Typography variant="body2" color="text.secondary">
            View and manage all health packages this branch offers. Set custom
            prices & commissions.
          </Typography>
        </Box>
        <Box sx={{ display: "flex", gap: 1.5, alignItems: "center" }}>
          <TextField
            placeholder="Search packages..."
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
          <Tooltip title="Refresh packages list">
            <IconButton onClick={fetchPackages} size="small" disabled={loading}>
              <RefreshIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>
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
            { label: "Package", flex: "1 1 200px" },
            { label: "Price", minWidth: 160 },
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
        ) : packages.length === 0 ? (
          <Alert severity="info" sx={{ m: 2, borderRadius: "8px" }}>
            {search
              ? "No packages match your search."
              : "No health packages configured for this branch yet."}
          </Alert>
        ) : (
          packages.map((item) => (
            <PackageRow
              key={item.packageId}
              item={item}
              onSaveCommission={updateCommission}
              onToggle={overridePackage}
              saving={saving}
            />
          ))
        )}
      </Box>
    </Box>
  );
};

export default LabPackagesTab;
