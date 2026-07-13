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
import MenuItem from "@mui/material/MenuItem";
import Chip from "@mui/material/Chip";
import InputAdornment from "@mui/material/InputAdornment";
import CircularProgress from "@mui/material/CircularProgress";
import Divider from "@mui/material/Divider";
import AddIcon from "@mui/icons-material/Add";
import SearchIcon from "@mui/icons-material/Search";
import LayersIcon from "@mui/icons-material/Layers";
import PaidIcon from "@mui/icons-material/Paid";
import CommissionIcon from "@mui/icons-material/Percent";
import toast from "react-hot-toast";
import { useLabService } from "@/core_components/apis/admin/labService";
import { useApi } from "@/core_components/hooks/useApi/useApi";

interface ServiceItem {
  id: string;
  name: string;
  description: string | null;
  category: string;
  basePrice: number;
  platformCommissionPct: number;
  isActive: boolean;
  createdAt: string;
}

export const ServicesConsole: React.FC = () => {
  const { addService } = useLabService();
  const { get } = useApi();

  const [services, setServices] = useState<ServiceItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState("All");

  // Add Service Form State
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [formName, setFormName] = useState("");
  const [formDescription, setFormDescription] = useState("");
  const [formCategory, setFormCategory] = useState("");
  const [newCategoryInput, setNewCategoryInput] = useState("");
  const [isCreatingNewCategory, setIsCreatingNewCategory] = useState(false);
  const [formBasePrice, setFormBasePrice] = useState<number | "">("");
  const [formCommission, setFormCommission] = useState<number>(15);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Load all master services
  const loadServices = useCallback(async () => {
    setLoading(true);
    const response = await get<any>({
      endpoint: "/api/services",
      requireAuth: true,
    });
    if (response.success && response.data?.data) {
      setServices(response.data.data);
    }
    setLoading(false);
  }, [get]);

  useEffect(() => {
    loadServices();
  }, [loadServices]);

  // Extract unique categories for filtering and select options
  const categories = useMemo(() => {
    const set = new Set<string>();
    services.forEach((s) => {
      if (s.category) set.add(s.category);
    });
    return Array.from(set);
  }, [services]);

  // Filtered services
  const filteredServices = useMemo(() => {
    return services.filter((s) => {
      const matchesSearch =
        s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (s.description &&
          s.description.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesCategory =
        selectedCategoryFilter === "All" ||
        s.category === selectedCategoryFilter;

      return matchesSearch && matchesCategory;
    });
  }, [services, searchQuery, selectedCategoryFilter]);

  // Group filtered services by category for structured layout
  const groupedServices = useMemo(() => {
    const groups: Record<string, ServiceItem[]> = {};
    filteredServices.forEach((s) => {
      if (!groups[s.category]) {
        groups[s.category] = [];
      }
      groups[s.category].push(s);
    });
    return groups;
  }, [filteredServices]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) {
      toast.error("Service name is required.");
      return;
    }

    const finalCategory = isCreatingNewCategory
      ? newCategoryInput.trim()
      : formCategory;
    if (!finalCategory) {
      toast.error("Category is required.");
      return;
    }

    if (formBasePrice === "" || formBasePrice < 0) {
      toast.error("Base price must be a non-negative number.");
      return;
    }

    if (formCommission < 0 || formCommission > 100) {
      toast.error("Platform commission must be between 0% and 100%.");
      return;
    }

    setIsSubmitting(true);
    const response = await addService({
      name: formName.trim(),
      description: formDescription.trim() || undefined,
      category: finalCategory,
      basePrice: Number(formBasePrice),
      platformCommissionPct: Number(formCommission),
    });
    setIsSubmitting(false);

    if (response.success) {
      toast.success("Service added successfully!");
      setIsAddDialogOpen(false);
      // Reset form
      setFormName("");
      setFormDescription("");
      setFormCategory("");
      setNewCategoryInput("");
      setIsCreatingNewCategory(false);
      setFormBasePrice("");
      setFormCommission(15);
      // Reload services
      loadServices();
    } else {
      toast.error(response.data?.message || "Failed to add service.");
    }
  };

  const getCategoryColor = (cat: string) => {
    const colors: Record<string, string> = {
      pcr: "#059669",
      serology: "#10b981",
      biochemistry: "#6b21a8",
      hematology: "#b91c1c",
      microbiology: "#0369a1",
      pathology: "#c2410c",
    };
    return colors[cat.toLowerCase()] || "#475569";
  };

  return (
    <Box sx={{ p: { xs: 2, md: 4 } }}>
      {/* Upper header section */}
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
            Services Catalog
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Manage global diagnostic tests, default pricing thresholds, and
            master categories.
          </Typography>
        </Box>

        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setIsAddDialogOpen(true)}
          sx={{
            textTransform: "none",
            fontWeight: 700,
            borderRadius: "8px",
            px: 2.5,
            py: 1.2,
            boxShadow: "none",
            "&:hover": { boxShadow: "none" },
          }}
        >
          Add Service
        </Button>
      </Box>

      {/* Filters Bar */}
      <Box
        sx={{
          display: "flex",
          gap: 2,
          mb: 4,
          flexDirection: { xs: "column", sm: "row" },
        }}
      >
        <TextField
          placeholder="Search test name or description..."
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
          label="Filter by Category"
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

      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
          <CircularProgress />
        </Box>
      ) : services.length === 0 ? (
        <Card
          sx={{
            p: 4,
            textAlign: "center",
            border: "1px dashed var(--color-border)",
            boxShadow: "none",
          }}
        >
          <Typography color="text.secondary" variant="body1">
            No diagnostic services registered. Click "Add Service" to start.
          </Typography>
        </Card>
      ) : Object.keys(groupedServices).length === 0 ? (
        <Card
          sx={{
            p: 4,
            textAlign: "center",
            border: "1px dashed var(--color-border)",
            boxShadow: "none",
          }}
        >
          <Typography color="text.secondary" variant="body1">
            No services match the search or category filters.
          </Typography>
        </Card>
      ) : (
        <Box sx={{ display: "flex", flexDirection: "column", gap: 5 }}>
          {Object.entries(groupedServices).map(([category, items]) => (
            <Box key={category}>
              <Box
                sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 2 }}
              >
                <Typography
                  variant="h6"
                  sx={{ fontWeight: 800, color: "#0f172a" }}
                >
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
                {items.map((item) => (
                  <Grid key={item.id} size={{ xs: 12, sm: 6, md: 4 }}>
                    <Card
                      sx={{
                        border: "1px solid var(--color-divider)",
                        boxShadow: "none",
                      }}
                    >
                      <CardContent
                        sx={{
                          p: 3,
                          display: "flex",
                          flexDirection: "column",
                          height: "100%",
                          gap: 2,
                        }}
                      >
                        <Box
                          sx={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "flex-start",
                            gap: 1,
                          }}
                        >
                          <Typography
                            variant="subtitle1"
                            sx={{
                              fontWeight: 800,
                              color: "#0f172a",
                              lineHeight: 1.3,
                            }}
                          >
                            {item.name}
                          </Typography>
                          <Chip
                            label={item.category}
                            size="small"
                            variant="outlined"
                            sx={{
                              fontWeight: 700,
                              fontSize: "10px",
                              borderColor: getCategoryColor(item.category),
                              color: getCategoryColor(item.category),
                              borderRadius: "4px",
                            }}
                          />
                        </Box>

                        <Typography
                          variant="body2"
                          color="text.secondary"
                          sx={{ flexGrow: 1, minHeight: "40px" }}
                        >
                          {item.description || "No description provided."}
                        </Typography>

                        <Divider />

                        <Box
                          sx={{
                            display: "flex",
                            justifyContent: "space-between",
                            mt: 1,
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
                                color: "#10b981",
                                mt: 0.2,
                              }}
                            >
                              <PaidIcon sx={{ fontSize: "16px" }} />
                              <Typography
                                variant="subtitle2"
                                sx={{ fontWeight: 800 }}
                              >
                                ₹{item.basePrice}
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
                                {item.platformCommissionPct}%
                              </Typography>
                            </Box>
                          </Box>
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

      {/* Add Service Dialog */}
      <Dialog
        open={isAddDialogOpen}
        onClose={() => !isSubmitting && setIsAddDialogOpen(false)}
        maxWidth="sm"
        fullWidth
        slotProps={{
          paper: {
            sx: { borderRadius: "16px", p: 1 },
          },
        }}
      >
        <form onSubmit={handleSubmit}>
          <DialogTitle sx={{ fontWeight: 800, pb: 1 }}>
            Add Master Diagnostic Service
          </DialogTitle>
          <DialogContent
            sx={{ py: 1.5, display: "flex", flexDirection: "column", gap: 2.5 }}
          >
            <Typography variant="body2" color="text.secondary">
              Create a new diagnostic test globally available for all lab branch
              custom override networks.
            </Typography>

            <TextField
              label="Service Name"
              placeholder="e.g. Complete Blood Count (CBC)"
              fullWidth
              required
              disabled={isSubmitting}
              value={formName}
              onChange={(e) => setFormName(e.target.value)}
              slotProps={{ inputLabel: { shrink: true } }}
            />

            <TextField
              label="Description"
              placeholder="Brief summary detailing the diagnostic test parameters and turnaround time guidelines."
              fullWidth
              multiline
              rows={3}
              disabled={isSubmitting}
              value={formDescription}
              onChange={(e) => setFormDescription(e.target.value)}
              slotProps={{ inputLabel: { shrink: true } }}
            />

            {/* Category Select Block */}
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
                  Service Category
                </Typography>
                <Button
                  size="small"
                  onClick={() =>
                    setIsCreatingNewCategory(!isCreatingNewCategory)
                  }
                  sx={{ textTransform: "none", fontWeight: 700 }}
                >
                  {isCreatingNewCategory
                    ? "Select Existing"
                    : "+ Create New Category"}
                </Button>
              </Box>

              {isCreatingNewCategory ? (
                <TextField
                  label="New Category Name"
                  placeholder="e.g. Biochemistry"
                  fullWidth
                  required
                  disabled={isSubmitting}
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
                  disabled={isSubmitting || categories.length === 0}
                  value={formCategory}
                  onChange={(e) => setFormCategory(e.target.value)}
                  slotProps={{ inputLabel: { shrink: true } }}
                >
                  {categories.length === 0 ? (
                    <MenuItem disabled>
                      No categories available. Create one.
                    </MenuItem>
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
                  placeholder="0"
                  type="number"
                  fullWidth
                  required
                  disabled={isSubmitting}
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
                  label="Platform Commission (%)"
                  placeholder="15"
                  type="number"
                  fullWidth
                  required
                  disabled={isSubmitting}
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
              type="submit"
              variant="contained"
              disabled={isSubmitting}
              sx={{
                fontWeight: 700,
                textTransform: "none",
                borderRadius: "8px",
                px: 3,
                boxShadow: "none",
                "&:hover": { boxShadow: "none" },
              }}
            >
              {isSubmitting ? "Adding..." : "Add Service"}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Box>
  );
};

export default ServicesConsole;
