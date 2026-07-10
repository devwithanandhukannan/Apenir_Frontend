import React from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Grid from "@mui/material/Grid";
import TextField from "@mui/material/TextField";
import Chip from "@mui/material/Chip";
import CircularProgress from "@mui/material/CircularProgress";
import InputAdornment from "@mui/material/InputAdornment";
import SearchIcon from "@mui/icons-material/Search";
import Accordion from "@mui/material/Accordion";
import AccordionSummary from "@mui/material/AccordionSummary";
import AccordionDetails from "@mui/material/AccordionDetails";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import InventoryIcon from "@mui/icons-material/Inventory";
import MedicalServicesIcon from "@mui/icons-material/MedicalServices";
import { useServices } from "./useServices";

interface LabServicesTabProps {
  labId: string;
}

export const LabServicesTab: React.FC<LabServicesTabProps> = ({ labId }) => {
  const { services, packages, loading, search, setSearch } = useServices(labId);

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
      {/* Search Header */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 1,
        }}
      >
        <Typography variant="h6" sx={{ fontWeight: 800 }}>
          Offered Catalog
        </Typography>
        <TextField
          placeholder="Search catalog items..."
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
          sx={{ width: "260px" }}
        />
      </Box>

      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
          <CircularProgress size="32px" />
        </Box>
      ) : (
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
          {/* Accordion 1: Lab Packages */}
          <Accordion
            defaultExpanded
            sx={{
              border: "1px solid #e2e8f0",
              borderRadius: "12px !important",
              boxShadow: "none",
              "&:before": { display: "none" },
            }}
          >
            <AccordionSummary
              expandIcon={<ExpandMoreIcon />}
              sx={{ bgcolor: "rgba(0,0,0,0.01)", px: 3, py: 1 }}
            >
              <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                <InventoryIcon
                  sx={{ color: "primary.main", fontSize: "20px" }}
                />
                <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>
                  Lab Packages ({packages.length})
                </Typography>
              </Box>
            </AccordionSummary>
            <AccordionDetails sx={{ p: 3 }}>
              {packages.length === 0 ? (
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ textAlign: "center", py: 2 }}
                >
                  No packages match search.
                </Typography>
              ) : (
                <Grid container spacing={3}>
                  {packages.map((pkg) => (
                    <Grid key={pkg.id} size={{ xs: 12, sm: 6, md: 4 }}>
                      <Card
                        sx={{
                          border: "1px solid #e2e8f0",
                          borderRadius: "8px",
                          boxShadow: "none",
                          height: "100%",
                          display: "flex",
                          flexDirection: "column",
                          justifyContent: "space-between",
                        }}
                      >
                        <CardContent sx={{ p: 2.5 }}>
                          <Box
                            sx={{
                              display: "flex",
                              justifyContent: "space-between",
                              alignItems: "flex-start",
                              mb: 1.5,
                            }}
                          >
                            <Typography
                              variant="subtitle2"
                              sx={{
                                fontWeight: 800,
                                color: "#0f172a",
                                lineHeight: 1.3,
                              }}
                            >
                              {pkg.name}
                            </Typography>
                            <Chip
                              label={pkg.isAvailable ? "Available" : "Paused"}
                              size="small"
                              variant="outlined"
                              sx={{
                                fontWeight: 700,
                                fontSize: "10px",
                                borderRadius: "4px",
                                color: pkg.isAvailable ? "#10b981" : "#dc2626",
                                borderColor: pkg.isAvailable
                                  ? "rgba(16, 185, 129, 0.25)"
                                  : "rgba(220, 38, 38, 0.25)",
                                bgcolor: pkg.isAvailable
                                  ? "rgba(16, 185, 129, 0.04)"
                                  : "rgba(220, 38, 38, 0.04)",
                              }}
                            />
                          </Box>

                          <Typography
                            variant="caption"
                            color="text.secondary"
                            sx={{
                              mb: 2,
                              minHeight: "36px",
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              display: "-webkit-box",
                              WebkitLineClamp: 2,
                              WebkitBoxOrient: "vertical",
                            }}
                          >
                            {pkg.description}
                          </Typography>

                          <Box
                            sx={{
                              display: "flex",
                              justifyContent: "space-between",
                              alignItems: "center",
                              mt: "auto",
                            }}
                          >
                            <Box>
                              <Typography
                                variant="caption"
                                color="text.secondary"
                                sx={{ display: "block", fontWeight: 600 }}
                              >
                                {pkg.testCount} Tests Included
                              </Typography>
                              <Typography
                                variant="body2"
                                color="text.secondary"
                                sx={{ fontWeight: 500, fontSize: "12px" }}
                              >
                                TAT: {pkg.tatHours} hrs
                              </Typography>
                            </Box>
                            <Typography
                              variant="subtitle1"
                              sx={{ fontWeight: 800, color: "primary.main" }}
                            >
                              ₹{pkg.price.toLocaleString()}
                            </Typography>
                          </Box>
                        </CardContent>
                      </Card>
                    </Grid>
                  ))}
                </Grid>
              )}
            </AccordionDetails>
          </Accordion>

          {/* Accordion 2: Lab Services */}
          <Accordion
            defaultExpanded
            sx={{
              border: "1px solid #e2e8f0",
              borderRadius: "12px !important",
              boxShadow: "none",
              "&:before": { display: "none" },
            }}
          >
            <AccordionSummary
              expandIcon={<ExpandMoreIcon />}
              sx={{ bgcolor: "rgba(0,0,0,0.01)", px: 3, py: 1 }}
            >
              <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                <MedicalServicesIcon
                  sx={{ color: "primary.main", fontSize: "20px" }}
                />
                <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>
                  Lab Services / Single Tests ({services.length})
                </Typography>
              </Box>
            </AccordionSummary>
            <AccordionDetails sx={{ p: 3 }}>
              {services.length === 0 ? (
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ textAlign: "center", py: 2 }}
                >
                  No services match search.
                </Typography>
              ) : (
                <Grid container spacing={3}>
                  {services.map((srv) => (
                    <Grid key={srv.id} size={{ xs: 12, sm: 6, md: 4 }}>
                      <Card
                        sx={{
                          border: "1px solid #e2e8f0",
                          borderRadius: "8px",
                          boxShadow: "none",
                          height: "100%",
                        }}
                      >
                        <CardContent
                          sx={{
                            p: 2.5,
                            display: "flex",
                            flexDirection: "column",
                            height: "100%",
                            justifyContent: "space-between",
                          }}
                        >
                          <Box
                            sx={{
                              display: "flex",
                              justifyContent: "space-between",
                              alignItems: "flex-start",
                              mb: 1.5,
                            }}
                          >
                            <Box>
                              <Typography
                                variant="subtitle2"
                                sx={{
                                  fontWeight: 800,
                                  color: "#0f172a",
                                  lineHeight: 1.3,
                                }}
                              >
                                {srv.name}
                              </Typography>
                              <Chip
                                label={srv.category}
                                size="small"
                                sx={{
                                  mt: 0.8,
                                  fontWeight: 700,
                                  fontSize: "9px",
                                  height: "18px",
                                  color: "#475569",
                                  bgcolor: "#f1f5f9",
                                }}
                              />
                            </Box>
                            <Chip
                              label={srv.isAvailable ? "Available" : "Paused"}
                              size="small"
                              variant="outlined"
                              sx={{
                                fontWeight: 700,
                                fontSize: "10px",
                                borderRadius: "4px",
                                color: srv.isAvailable ? "#10b981" : "#dc2626",
                                borderColor: srv.isAvailable
                                  ? "rgba(16, 185, 129, 0.25)"
                                  : "rgba(220, 38, 38, 0.25)",
                                bgcolor: srv.isAvailable
                                  ? "rgba(16, 185, 129, 0.04)"
                                  : "rgba(220, 38, 38, 0.04)",
                              }}
                            />
                          </Box>

                          <Box
                            sx={{
                              display: "flex",
                              justifyContent: "space-between",
                              alignItems: "center",
                              mt: 2,
                            }}
                          >
                            <Typography
                              variant="body2"
                              color="text.secondary"
                              sx={{ fontWeight: 500, fontSize: "12px" }}
                            >
                              TAT: {srv.tatHours} hrs
                            </Typography>
                            <Typography
                              variant="subtitle1"
                              sx={{ fontWeight: 800, color: "primary.main" }}
                            >
                              ₹{srv.price.toLocaleString()}
                            </Typography>
                          </Box>
                        </CardContent>
                      </Card>
                    </Grid>
                  ))}
                </Grid>
              )}
            </AccordionDetails>
          </Accordion>
        </Box>
      )}
    </Box>
  );
};

export default LabServicesTab;
