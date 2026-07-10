import React from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Grid from "@mui/material/Grid";
import Avatar from "@mui/material/Avatar";
import Chip from "@mui/material/Chip";
import Button from "@mui/material/Button";
import CircularProgress from "@mui/material/CircularProgress";
import Skeleton from "@mui/material/Skeleton";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import PersonIcon from "@mui/icons-material/Person";
import ScienceIcon from "@mui/icons-material/Science";
import EmailIcon from "@mui/icons-material/Email";
import PhoneIcon from "@mui/icons-material/Phone";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import AddIcon from "@mui/icons-material/Add";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import LabAppointmentsTab from "./tabs/appointments";
import LabFinanceTab from "./tabs/finance";
import LabBatchPaymentTab from "./tabs/batch_payment";
import LabServicesTab from "./tabs/services";
import { useLabDetails } from "./useLabDetails";

export const LabDetails: React.FC = () => {
  const { lab, staff, loading, staffLoading, handleBack } = useLabDetails();
  const [isDialogOpen, setIsDialogOpen] = React.useState(false);
  const [activeTab, setActiveTab] = React.useState("appointments");

  if (loading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "60vh",
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  if (!lab) {
    return (
      <Box sx={{ p: 4, textAlign: "center" }}>
        <Typography variant="h6" color="error" gutterBottom>
          Lab details not found.
        </Typography>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={handleBack}
          variant="contained"
          sx={{ mt: 2 }}
        >
          Back to List
        </Button>
      </Box>
    );
  }

  const isActive = lab.isActive;
  const statusLabel = lab.status || (isActive ? "Active" : "Inactive");
  const labIdLabel = lab.labId || lab.id.substring(0, 8).toUpperCase();

  return (
    <Box sx={{ p: { xs: 2, md: 4 } }}>
      {/* Back Button */}
      <Button
        startIcon={<ArrowBackIcon />}
        onClick={handleBack}
        variant="outlined"
        color="inherit"
        sx={{
          mb: 3,
          textTransform: "none",
          borderRadius: "8px",
          borderColor: "var(--color-border)",
          fontWeight: 700,
        }}
      >
        Back to Labs
      </Button>

      {/* 1. Header Section */}
      <Box
        sx={{
          display: "flex",
          flexDirection: { xs: "column", sm: "row" },
          justifyContent: "space-between",
          alignItems: { xs: "flex-start", sm: "center" },
          gap: 2,
          mb: 4,
          p: 3,
          border: "1px solid #e2e8f0",
          borderRadius: "12px",
          bgcolor: "background.paper",
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <Avatar sx={{ bgcolor: "#1d4ed8", width: 56, height: 56 }}>
            <ScienceIcon sx={{ fontSize: "32px", color: "#fff" }} />
          </Avatar>
          <Box>
            <Typography variant="h5" sx={{ fontWeight: 800, mb: 0.5 }}>
              {lab.name}
            </Typography>
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ fontWeight: 600 }}
            >
              Lab ID: {labIdLabel}
            </Typography>
          </Box>
        </Box>

        <Chip
          label={statusLabel}
          variant="outlined"
          sx={{
            fontWeight: 800,
            fontSize: "13px",
            borderRadius: "8px",
            px: 1,
            color: isActive ? "#10b981" : "#64748b",
            borderColor: isActive
              ? "rgba(16, 185, 129, 0.3)"
              : "rgba(100, 116, 139, 0.3)",
            bgcolor: isActive
              ? "rgba(16, 185, 129, 0.05)"
              : "rgba(100, 116, 139, 0.05)",
          }}
        />
      </Box>

      {/* Grid container for sections */}
      <Grid container spacing={4}>
        {/* 2. Owner Details Section */}
        <Grid size={{ xs: 12, md: 5 }}>
          <Card
            sx={{
              border: "1px solid #e2e8f0",
              borderRadius: "12px",
              boxShadow: "none",
            }}
          >
            <CardContent sx={{ p: 4 }}>
              <Typography variant="h6" sx={{ fontWeight: 800, mb: 3 }}>
                Owner & Contact Details
              </Typography>

              <Box sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}>
                {/* Manager Name */}
                <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                  <Avatar
                    sx={{
                      bgcolor: "#e0f2fe",
                      color: "#0284c7",
                      width: 36,
                      height: 36,
                    }}
                  >
                    <PersonIcon />
                  </Avatar>
                  <Box>
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      sx={{ display: "block", fontWeight: 600 }}
                    >
                      Owner / Branch Manager
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{ fontWeight: 800, color: "#0f172a" }}
                    >
                      Branch Operator
                    </Typography>
                  </Box>
                </Box>

                {/* Email Contact */}
                <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                  <Avatar
                    sx={{
                      bgcolor: "#f0fdf4",
                      color: "#16a34a",
                      width: 36,
                      height: 36,
                    }}
                  >
                    <EmailIcon />
                  </Avatar>
                  <Box>
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      sx={{ display: "block", fontWeight: 600 }}
                    >
                      Email Address
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{ fontWeight: 800, color: "#0f172a" }}
                    >
                      {lab.name.toLowerCase().replace(/\s+/g, "")}
                      @appenir-lab.com
                    </Typography>
                  </Box>
                </Box>

                {/* Phone Contact */}
                <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                  <Avatar
                    sx={{
                      bgcolor: "#fee2e2",
                      color: "#dc2626",
                      width: 36,
                      height: 36,
                    }}
                  >
                    <PhoneIcon />
                  </Avatar>
                  <Box>
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      sx={{ display: "block", fontWeight: 600 }}
                    >
                      Phone Contact
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{ fontWeight: 800, color: "#0f172a" }}
                    >
                      {lab.phone || "N/A"}
                    </Typography>
                  </Box>
                </Box>

                {/* Location */}
                <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                  <Avatar
                    sx={{
                      bgcolor: "#fef3c7",
                      color: "#d97706",
                      width: 36,
                      height: 36,
                    }}
                  >
                    <LocationOnIcon />
                  </Avatar>
                  <Box>
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      sx={{ display: "block", fontWeight: 600 }}
                    >
                      Branch Location
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{ fontWeight: 800, color: "#0f172a" }}
                    >
                      {lab.city}, {lab.district}{" "}
                      {lab.pincode ? `- ${lab.pincode}` : ""}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      GPS: {lab.latitude}, {lab.longitude}
                    </Typography>
                  </Box>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* 3. Staff Details Card Section */}
        <Grid size={{ xs: 12, md: 7 }}>
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              mb: 3,
            }}
          >
            <Typography variant="h6" sx={{ fontWeight: 800 }}>
              Laboratory Staff ({staffLoading ? "Loading..." : staff.length})
            </Typography>
            <Button
              variant="contained"
              size="small"
              startIcon={<AddIcon />}
              onClick={() => alert("Add staff workflow triggered")}
              sx={{
                textTransform: "none",
                fontWeight: 700,
                borderRadius: "8px",
                px: 2,
              }}
            >
              Add Staff
            </Button>
          </Box>

          {staffLoading ? (
            <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
              {Array.from({ length: 3 }).map((_, i) => (
                <Card
                  key={i}
                  sx={{
                    border: "1px solid #e2e8f0",
                    borderRadius: "12px",
                    boxShadow: "none",
                  }}
                >
                  <CardContent
                    sx={{ display: "flex", alignItems: "center", gap: 2 }}
                  >
                    <Skeleton variant="circular" width={40} height={40} />
                    <Box sx={{ flexGrow: 1 }}>
                      <Skeleton variant="text" width="40%" height={24} />
                      <Skeleton variant="text" width="60%" height={16} />
                    </Box>
                  </CardContent>
                </Card>
              ))}
            </Box>
          ) : staff.length === 0 ? (
            <Box
              sx={{
                p: 4,
                textAlign: "center",
                border: "1px dashed #e2e8f0",
                borderRadius: "12px",
                bgcolor: "rgba(0,0,0,0.005)",
              }}
            >
              <Typography variant="body2" color="text.secondary">
                No staff members registered for this laboratory branch.
              </Typography>
            </Box>
          ) : (
            <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
              {staff.slice(0, 3).map((member) => (
                <Card
                  key={member.id}
                  sx={{
                    border: "1px solid #e2e8f0",
                    borderRadius: "12px",
                    boxShadow: "none",
                  }}
                >
                  <CardContent
                    sx={{
                      p: 2.5,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      gap: 2,
                    }}
                  >
                    <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                      <Avatar
                        sx={{ bgcolor: "secondary.main", fontWeight: 700 }}
                      >
                        {member.name.charAt(0).toUpperCase()}
                      </Avatar>
                      <Box>
                        <Typography
                          variant="subtitle2"
                          sx={{ fontWeight: 800, color: "#0f172a" }}
                        >
                          {member.name}
                        </Typography>
                        <Box
                          sx={{
                            display: "flex",
                            flexWrap: "wrap",
                            gap: 1.5,
                            mt: 0.2,
                          }}
                        >
                          <Typography
                            variant="caption"
                            color="text.secondary"
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              gap: 0.5,
                            }}
                          >
                            <EmailIcon sx={{ fontSize: "12px", mr: 0.5 }} />{" "}
                            {member.email}
                          </Typography>
                          {member.phone && (
                            <Typography
                              variant="caption"
                              color="text.secondary"
                              sx={{
                                display: "flex",
                                alignItems: "center",
                                gap: 0.5,
                              }}
                            >
                              <PhoneIcon sx={{ fontSize: "12px", mr: 0.5 }} />{" "}
                              {member.phone}
                            </Typography>
                          )}
                        </Box>
                      </Box>
                    </Box>

                    <Chip
                      label={member.status || "Active"}
                      size="small"
                      sx={{
                        fontWeight: 700,
                        fontSize: "10px",
                        borderRadius: "4px",
                        color:
                          member.status === "Active" ? "#10b981" : "#64748b",
                        borderColor:
                          member.status === "Active"
                            ? "rgba(16, 185, 129, 0.2)"
                            : "rgba(100, 116, 139, 0.2)",
                        bgcolor:
                          member.status === "Active"
                            ? "rgba(16, 185, 129, 0.04)"
                            : "rgba(100, 116, 139, 0.04)",
                      }}
                      variant="outlined"
                    />
                  </CardContent>
                </Card>
              ))}

              {staff.length > 3 && (
                <Button
                  variant="outlined"
                  onClick={() => setIsDialogOpen(true)}
                  sx={{
                    textTransform: "none",
                    fontWeight: 700,
                    alignSelf: "center",
                    mt: 1,
                    borderRadius: "8px",
                    borderColor: "var(--color-border)",
                    px: 3,
                  }}
                >
                  Show More ({staff.length - 3} more)
                </Button>
              )}
            </Box>
          )}
        </Grid>
      </Grid>

      {/* 4. Tabs Section */}
      <Box sx={{ mt: 5, borderTop: "1px solid #e2e8f0", pt: 4 }}>
        <Tabs
          value={activeTab}
          onChange={(e, val) => setActiveTab(val)}
          sx={{
            mb: 4,
            borderBottom: "1px solid #e2e8f0",
            "& .MuiTab-root": {
              textTransform: "none",
              fontWeight: 700,
              fontSize: "15px",
              minWidth: "auto",
              px: { xs: 2, sm: 3 },
            },
          }}
        >
          <Tab label="Appointments" value="appointments" />
          <Tab label="Finance & Bills" value="finance" />
          <Tab label="Batch Payments" value="batch_payment" />
          <Tab label="Offered Services" value="services" />
        </Tabs>

        {activeTab === "appointments" && <LabAppointmentsTab labId={lab.id} />}
        {activeTab === "finance" && <LabFinanceTab labId={lab.id} />}
        {activeTab === "batch_payment" && <LabBatchPaymentTab labId={lab.id} />}
        {activeTab === "services" && <LabServicesTab labId={lab.id} />}
      </Box>

      {/* Dialog for displaying all staff */}
      <Dialog
        open={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        maxWidth="sm"
        fullWidth
        slotProps={{
          paper: {
            sx: {
              borderRadius: "16px",
              p: 1.5,
            },
          },
        }}
      >
        <DialogTitle sx={{ fontWeight: 800, pb: 1 }}>
          All Laboratory Staff ({staff.length})
        </DialogTitle>
        <DialogContent
          dividers
          sx={{ display: "flex", flexDirection: "column", gap: 2, py: 2 }}
        >
          {staff.map((member) => (
            <Card
              key={member.id}
              sx={{
                border: "1px solid #e2e8f0",
                borderRadius: "12px",
                boxShadow: "none",
              }}
            >
              <CardContent
                sx={{
                  p: 2,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: 2,
                }}
              >
                <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                  <Avatar
                    sx={{
                      bgcolor: "secondary.main",
                      fontWeight: 700,
                      width: 36,
                      height: 36,
                      fontSize: "14px",
                    }}
                  >
                    {member.name.charAt(0).toUpperCase()}
                  </Avatar>
                  <Box>
                    <Typography
                      variant="subtitle2"
                      sx={{ fontWeight: 800, color: "#0f172a" }}
                    >
                      {member.name}
                    </Typography>
                    <Box
                      sx={{
                        display: "flex",
                        flexWrap: "wrap",
                        gap: 1.5,
                        mt: 0.2,
                      }}
                    >
                      <Typography
                        variant="caption"
                        color="text.secondary"
                        sx={{ display: "flex", alignItems: "center", gap: 0.5 }}
                      >
                        <EmailIcon sx={{ fontSize: "12px", mr: 0.5 }} />{" "}
                        {member.email}
                      </Typography>
                      {member.phone && (
                        <Typography
                          variant="caption"
                          color="text.secondary"
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            gap: 0.5,
                          }}
                        >
                          <PhoneIcon sx={{ fontSize: "12px", mr: 0.5 }} />{" "}
                          {member.phone}
                        </Typography>
                      )}
                    </Box>
                  </Box>
                </Box>
                <Chip
                  label={member.status || "Active"}
                  size="small"
                  sx={{
                    fontWeight: 700,
                    fontSize: "10px",
                    borderRadius: "4px",
                    color: member.status === "Active" ? "#10b981" : "#64748b",
                    borderColor:
                      member.status === "Active"
                        ? "rgba(16, 185, 129, 0.2)"
                        : "rgba(100, 116, 139, 0.2)",
                    bgcolor:
                      member.status === "Active"
                        ? "rgba(16, 185, 129, 0.04)"
                        : "rgba(100, 116, 139, 0.04)",
                  }}
                  variant="outlined"
                />
              </CardContent>
            </Card>
          ))}
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 1.5 }}>
          <Button
            onClick={() => setIsDialogOpen(false)}
            variant="contained"
            sx={{ fontWeight: 700, textTransform: "none", borderRadius: "8px" }}
          >
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default LabDetails;
