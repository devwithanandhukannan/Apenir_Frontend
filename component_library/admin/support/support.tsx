import React from "react";
import { useRouter } from "next/router";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Grid from "@mui/material/Grid";
import Chip from "@mui/material/Chip";
import TextField from "@mui/material/TextField";
import InputAdornment from "@mui/material/InputAdornment";
import Stepper from "@mui/material/Stepper";
import Step from "@mui/material/Step";
import StepButton from "@mui/material/StepButton";
import StepLabel from "@mui/material/StepLabel";
import LinearProgress from "@mui/material/LinearProgress";
import Alert from "@mui/material/Alert";
import Divider from "@mui/material/Divider";
import Accordion from "@mui/material/Accordion";
import AccordionSummary from "@mui/material/AccordionSummary";
import AccordionDetails from "@mui/material/AccordionDetails";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import MenuItem from "@mui/material/MenuItem";

// Icons
import SearchIcon from "@mui/icons-material/Search";
import HelpIcon from "@mui/icons-material/Help";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import RadioButtonUncheckedIcon from "@mui/icons-material/RadioButtonUnchecked";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import HeadsetMicIcon from "@mui/icons-material/HeadsetMic";
import EmailIcon from "@mui/icons-material/Email";
import PhoneIcon from "@mui/icons-material/Phone";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import AdminPanelSettingsIcon from "@mui/icons-material/AdminPanelSettings";
import LightbulbIcon from "@mui/icons-material/Lightbulb";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import SendIcon from "@mui/icons-material/Send";
import SecurityIcon from "@mui/icons-material/Security";

import { useAdminSupport, ADMIN_CATEGORY_OPTIONS } from "./useAdminSupport";

export const AdminSupport: React.FC = () => {
  const router = useRouter();
  const {
    filteredSteps,
    activeStep,
    currentStep,
    completedSteps,
    progressPercentage,
    searchQuery,
    setSearchQuery,
    selectedCategory,
    setSelectedCategory,
    expandedFaq,
    handleFaqAccordionChange,
    isTicketOpen,
    setIsTicketOpen,
    submittingTicket,
    ticketForm,
    handleTicketInputChange,
    handleTicketSubmit,
    handleStepClick,
    handleNextStep,
    handlePrevStep,
    toggleStepCompleted,
  } = useAdminSupport();

  const isCurrentStepCompleted = completedSteps.includes(activeStep);

  return (
    <Box sx={{ p: { xs: 2, md: 4 }, maxWidth: 1400, margin: "0 auto" }}>
      {/* ──────────────────────────────────────────────────────────── */}
      {/* Top Banner Header */}
      {/* ──────────────────────────────────────────────────────────── */}
      <Box
        sx={{
          background: "linear-gradient(135deg, #1e1b4b 0%, #312e81 100%)",
          color: "#ffffff",
          borderRadius: "16px",
          p: { xs: 3, md: 4 },
          mb: 4,
          boxShadow: "0 10px 30px rgba(30, 27, 75, 0.2)",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <Box
          sx={{
            position: "absolute",
            top: -40,
            right: -40,
            width: 240,
            height: 240,
            borderRadius: "50%",
            background:
              "radial-gradient(circle, rgba(99,102,241,0.2) 0%, rgba(0,0,0,0) 70%)",
            pointerEvents: "none",
          }}
        />

        <Grid container spacing={3} sx={{ alignItems: "center" }}>
          <Grid size={{ xs: 12, md: 8 }}>
            <Box
              sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 1 }}
            >
              <AdminPanelSettingsIcon sx={{ color: "#818cf8", fontSize: 36 }} />
              <Typography
                variant="h4"
                sx={{ fontWeight: 800, letterSpacing: "-0.5px" }}
              >
                Admin Portal Master Documentation
              </Typography>
            </Box>
            <Typography
              variant="body1"
              sx={{ color: "#c7d2fe", mb: 2, maxWidth: 720 }}
            >
              Comprehensive operating manual and reference guide for Apenir
              Platform Administrators. Learn how to manage partner labs,
              phlebotomist networks, master catalogs, financial payouts, and
              business intelligence.
            </Typography>

            {/* Progress Bar */}
            <Box sx={{ maxWidth: 500, mt: 2 }}>
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  mb: 0.5,
                }}
              >
                <Typography
                  variant="caption"
                  sx={{ color: "#e0e7ff", fontWeight: 600 }}
                >
                  Admin Guide Completion ({completedSteps.length}/
                  {filteredSteps.length} Steps)
                </Typography>
                <Typography
                  variant="caption"
                  sx={{ color: "#818cf8", fontWeight: 700 }}
                >
                  {progressPercentage}% Completed
                </Typography>
              </Box>
              <LinearProgress
                variant="determinate"
                value={progressPercentage}
                sx={{
                  height: 8,
                  borderRadius: 4,
                  bgcolor: "rgba(255, 255, 255, 0.15)",
                  "& .MuiLinearProgress-bar": {
                    borderRadius: 4,
                    background:
                      "linear-gradient(90deg, #6366f1 0%, #818cf8 100%)",
                  },
                }}
              />
            </Box>
          </Grid>

          <Grid
            size={{ xs: 12, md: 4 }}
            sx={{ textAlign: { xs: "left", md: "right" } }}
          >
            <Button
              variant="contained"
              size="large"
              startIcon={<HeadsetMicIcon />}
              onClick={() => setIsTicketOpen(true)}
              sx={{
                bgcolor: "#6366f1",
                color: "#ffffff",
                fontWeight: 700,
                px: 3,
                py: 1.5,
                borderRadius: "10px",
                textTransform: "none",
                boxShadow: "0 4px 14px rgba(99, 102, 241, 0.4)",
                "&:hover": {
                  bgcolor: "#4f46e5",
                },
              }}
            >
              Log Admin Technical Ticket
            </Button>
          </Grid>
        </Grid>
      </Box>

      {/* ──────────────────────────────────────────────────────────── */}
      {/* Search & Category Filter Controls */}
      {/* ──────────────────────────────────────────────────────────── */}
      <Card
        sx={{
          mb: 4,
          borderRadius: "12px",
          border: "1px solid",
          borderColor: "divider",
          boxShadow: "0 2px 10px rgba(0,0,0,0.03)",
        }}
      >
        <CardContent sx={{ p: 2.5 }}>
          <Grid container spacing={2} sx={{ alignItems: "center" }}>
            <Grid size={{ xs: 12, md: 5 }}>
              <TextField
                fullWidth
                size="small"
                placeholder="Search admin topics (e.g. lab onboarding, payroll, master tests, analytics)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                slotProps={{
                  input: {
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon sx={{ color: "text.secondary" }} />
                      </InputAdornment>
                    ),
                  },
                }}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 7 }}>
              <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
                {ADMIN_CATEGORY_OPTIONS.map((cat) => (
                  <Chip
                    key={cat.id}
                    label={cat.label}
                    clickable
                    color={selectedCategory === cat.id ? "primary" : "default"}
                    variant={
                      selectedCategory === cat.id ? "filled" : "outlined"
                    }
                    onClick={() => setSelectedCategory(cat.id)}
                    sx={{ fontWeight: 600, borderRadius: "8px" }}
                  />
                ))}
              </Box>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* ──────────────────────────────────────────────────────────── */}
      {/* Interactive Stepper Navigation Bar */}
      {/* ──────────────────────────────────────────────────────────── */}
      <Card
        sx={{
          mb: 4,
          borderRadius: "12px",
          border: "1px solid",
          borderColor: "divider",
          boxShadow: "none",
          overflowX: "auto",
        }}
      >
        <CardContent sx={{ p: 3 }}>
          <Typography
            variant="subtitle2"
            color="text.secondary"
            sx={{ fontWeight: 700, mb: 2 }}
          >
            ADMINISTRATIVE MODULE DOCUMENTATION STEPPER
          </Typography>

          {filteredSteps.length === 0 ? (
            <Alert severity="info">
              No admin documentation topics found matching &quot;{searchQuery}
              &quot;. Try resetting search query or category filters.
            </Alert>
          ) : (
            <Stepper activeStep={activeStep} alternativeLabel nonLinear>
              {filteredSteps.map((step, index) => {
                const isCompleted = completedSteps.includes(index);
                return (
                  <Step key={step.id} completed={isCompleted}>
                    <StepButton onClick={() => handleStepClick(index)}>
                      <StepLabel
                        icon={
                          isCompleted ? (
                            <CheckCircleIcon color="success" />
                          ) : (
                            index + 1
                          )
                        }
                      >
                        <Typography
                          variant="body2"
                          sx={{
                            fontWeight: activeStep === index ? 800 : 500,
                            color:
                              activeStep === index
                                ? "primary.main"
                                : "text.primary",
                          }}
                        >
                          {step.shortTitle}
                        </Typography>
                        <Typography
                          variant="caption"
                          color="text.secondary"
                          sx={{ display: "block" }}
                        >
                          {step.readTime}
                        </Typography>
                      </StepLabel>
                    </StepButton>
                  </Step>
                );
              })}
            </Stepper>
          )}
        </CardContent>
      </Card>

      {/* ──────────────────────────────────────────────────────────── */}
      {/* Active Step Documentation Detail & Main Content */}
      {/* ──────────────────────────────────────────────────────────── */}
      {currentStep && (
        <Grid container spacing={4}>
          {/* Main Step Detail Column */}
          <Grid size={{ xs: 12, lg: 8 }}>
            <Card
              sx={{
                borderRadius: "16px",
                border: "1px solid",
                borderColor: "divider",
                boxShadow: "0 4px 20px rgba(0,0,0,0.05)",
                mb: 4,
              }}
            >
              <CardContent sx={{ p: { xs: 3, md: 4 } }}>
                {/* Meta Header */}
                <Box
                  sx={{
                    display: "flex",
                    flexWrap: "wrap",
                    justifyContent: "space-between",
                    alignItems: "center",
                    gap: 1.5,
                    mb: 2,
                  }}
                >
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <Chip
                      label={currentStep.categoryLabel}
                      size="small"
                      color="primary"
                      sx={{ fontWeight: 700 }}
                    />
                    <Chip
                      label={`Route: ${currentStep.route}`}
                      size="small"
                      variant="outlined"
                      sx={{ fontFamily: "monospace", fontWeight: 600 }}
                    />
                    <Chip
                      icon={<AccessTimeIcon fontSize="small" />}
                      label={currentStep.readTime}
                      size="small"
                      variant="outlined"
                    />
                  </Box>

                  <Button
                    size="small"
                    variant={isCurrentStepCompleted ? "outlined" : "contained"}
                    color={isCurrentStepCompleted ? "success" : "primary"}
                    startIcon={
                      isCurrentStepCompleted ? (
                        <CheckCircleIcon />
                      ) : (
                        <RadioButtonUncheckedIcon />
                      )
                    }
                    onClick={() => toggleStepCompleted(activeStep)}
                    sx={{ textTransform: "none", fontWeight: 700 }}
                  >
                    {isCurrentStepCompleted
                      ? "Completed / Read"
                      : "Mark as Completed"}
                  </Button>
                </Box>

                <Typography
                  variant="h5"
                  sx={{ fontWeight: 800, mb: 1, color: "text.primary" }}
                >
                  {currentStep.title}
                </Typography>
                <Typography
                  variant="body1"
                  color="text.secondary"
                  sx={{ mb: 3, lineHeight: 1.6 }}
                >
                  {currentStep.summary}
                </Typography>

                {/* Key Feature Chips */}
                <Box
                  sx={{
                    mb: 4,
                    p: 2.5,
                    bgcolor: "action.hover",
                    borderRadius: "10px",
                  }}
                >
                  <Typography
                    variant="subtitle2"
                    sx={{
                      fontWeight: 700,
                      mb: 1.5,
                      display: "flex",
                      alignItems: "center",
                      gap: 1,
                    }}
                  >
                    <SecurityIcon color="primary" fontSize="small" /> Executive
                    Capabilities & Features:
                  </Typography>
                  <Grid container spacing={1}>
                    {currentStep.keyFeatures.map((feature, idx) => (
                      <Grid key={idx} size={{ xs: 12, sm: 6 }}>
                        <Box
                          sx={{ display: "flex", alignItems: "center", gap: 1 }}
                        >
                          <CheckCircleIcon
                            sx={{ fontSize: 16, color: "success.main" }}
                          />
                          <Typography variant="body2" sx={{ fontWeight: 600 }}>
                            {feature}
                          </Typography>
                        </Box>
                      </Grid>
                    ))}
                  </Grid>
                </Box>

                <Divider sx={{ mb: 4 }} />

                {/* Detailed Workflow Guide */}
                <Typography variant="h6" sx={{ fontWeight: 800, mb: 3 }}>
                  Administrative Procedures & Execution Guide:
                </Typography>

                <Box
                  sx={{
                    display: "flex",
                    flexDirection: "column",
                    gap: 3,
                    mb: 4,
                  }}
                >
                  {currentStep.detailedGuide.map((item) => (
                    <Card
                      key={item.number}
                      variant="outlined"
                      sx={{
                        borderRadius: "12px",
                        borderColor: "divider",
                        borderLeft: "4px solid",
                        borderLeftColor: "indigo.500",
                        boxShadow: "none",
                      }}
                    >
                      <CardContent sx={{ p: 2.5 }}>
                        <Box
                          sx={{
                            display: "flex",
                            alignItems: "flex-start",
                            gap: 1.5,
                          }}
                        >
                          <Box
                            sx={{
                              bgcolor: "primary.main",
                              color: "#fff",
                              width: 28,
                              height: 28,
                              borderRadius: "50%",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              fontWeight: 800,
                              fontSize: 14,
                              flexShrink: 0,
                            }}
                          >
                            {item.number}
                          </Box>
                          <Box sx={{ flexGrow: 1 }}>
                            <Typography
                              variant="subtitle1"
                              sx={{ fontWeight: 700, mb: 0.5 }}
                            >
                              {item.title}
                            </Typography>
                            <Typography
                              variant="body2"
                              color="text.secondary"
                              sx={{ lineHeight: 1.6, mb: 1.5 }}
                            >
                              {item.description}
                            </Typography>

                            {item.tip && (
                              <Alert
                                severity="info"
                                icon={<LightbulbIcon fontSize="small" />}
                                sx={{
                                  py: 0.5,
                                  px: 1.5,
                                  borderRadius: "8px",
                                  fontSize: "0.85rem",
                                }}
                              >
                                <strong>Admin Pro-Tip:</strong> {item.tip}
                              </Alert>
                            )}

                            {item.warning && (
                              <Alert
                                severity="warning"
                                icon={<WarningAmberIcon fontSize="small" />}
                                sx={{
                                  py: 0.5,
                                  px: 1.5,
                                  borderRadius: "8px",
                                  fontSize: "0.85rem",
                                  mt: 1,
                                }}
                              >
                                <strong>Compliance Warning:</strong>{" "}
                                {item.warning}
                              </Alert>
                            )}
                          </Box>
                        </Box>
                      </CardContent>
                    </Card>
                  ))}
                </Box>

                {/* Pro-Tip Highlight Alert */}
                <Alert
                  severity="success"
                  icon={<LightbulbIcon />}
                  sx={{
                    borderRadius: "10px",
                    mb: 4,
                    "& .MuiAlert-message": { width: "100%" },
                  }}
                >
                  <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                    Super Admin Operating Standard:
                  </Typography>
                  <Typography variant="body2">{currentStep.proTip}</Typography>
                </Alert>

                {/* Direct Action Link */}
                <Box
                  sx={{
                    p: 3,
                    borderRadius: "12px",
                    bgcolor: "rgba(99, 102, 241, 0.08)",
                    border: "1px dashed",
                    borderColor: "primary.main",
                    display: "flex",
                    flexWrap: "wrap",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: 2,
                    mb: 4,
                  }}
                >
                  <Box>
                    <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                      Open Admin Console
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Access the active {currentStep.shortTitle} console in your
                      platform administration view.
                    </Typography>
                  </Box>
                  <Button
                    variant="contained"
                    color="primary"
                    endIcon={<OpenInNewIcon />}
                    onClick={() => router.push(currentStep.relatedPageUrl)}
                    sx={{
                      textTransform: "none",
                      fontWeight: 700,
                      borderRadius: "8px",
                    }}
                  >
                    {currentStep.relatedPageLabel}
                  </Button>
                </Box>

                {/* Stepper Navigation Buttons */}
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    pt: 2,
                    borderTop: "1px solid",
                    borderColor: "divider",
                  }}
                >
                  <Button
                    variant="outlined"
                    startIcon={<ArrowBackIcon />}
                    disabled={activeStep === 0}
                    onClick={handlePrevStep}
                    sx={{ textTransform: "none", fontWeight: 600 }}
                  >
                    Previous Step
                  </Button>

                  <Button
                    variant="contained"
                    endIcon={<ArrowForwardIcon />}
                    disabled={activeStep === filteredSteps.length - 1}
                    onClick={handleNextStep}
                    sx={{ textTransform: "none", fontWeight: 700 }}
                  >
                    Next Step ({activeStep + 2}/{filteredSteps.length})
                  </Button>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          {/* Right Sidebar: FAQs & Engineering Escalation Desk */}
          <Grid size={{ xs: 12, lg: 4 }}>
            {/* Step-Specific FAQs */}
            <Card
              sx={{
                borderRadius: "16px",
                border: "1px solid",
                borderColor: "divider",
                boxShadow: "none",
                mb: 4,
              }}
            >
              <CardContent sx={{ p: 3 }}>
                <Box
                  sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}
                >
                  <HelpIcon color="primary" />
                  <Typography variant="h6" sx={{ fontWeight: 800 }}>
                    Admin FAQs
                  </Typography>
                </Box>
                <Divider sx={{ mb: 2 }} />

                {currentStep.faqs.map((faq, i) => {
                  const panelId = `panel_admin_${i}`;
                  return (
                    <Accordion
                      key={i}
                      expanded={expandedFaq === panelId}
                      onChange={handleFaqAccordionChange(panelId)}
                      elevation={0}
                      sx={{
                        border: "1px solid",
                        borderColor: "divider",
                        borderRadius: "8px !important",
                        mb: 1,
                        "&:before": { display: "none" },
                      }}
                    >
                      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                        <Typography variant="body2" sx={{ fontWeight: 700 }}>
                          {faq.question}
                        </Typography>
                      </AccordionSummary>
                      <AccordionDetails>
                        <Typography
                          variant="body2"
                          color="text.secondary"
                          sx={{ lineHeight: 1.5 }}
                        >
                          {faq.answer}
                        </Typography>
                      </AccordionDetails>
                    </Accordion>
                  );
                })}
              </CardContent>
            </Card>

            {/* Engineering Escalation Box */}
            <Card
              sx={{
                borderRadius: "16px",
                border: "1px solid",
                borderColor: "divider",
                boxShadow: "none",
                bgcolor: "background.paper",
              }}
            >
              <CardContent sx={{ p: 3 }}>
                <Box
                  sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}
                >
                  <HeadsetMicIcon color="primary" />
                  <Typography variant="h6" sx={{ fontWeight: 800 }}>
                    Platform Engineering Desk
                  </Typography>
                </Box>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ mb: 2.5 }}
                >
                  Encountered a platform system bug, database discrepancy, or
                  payment gateway anomaly?
                </Typography>

                <Box
                  sx={{
                    display: "flex",
                    flexDirection: "column",
                    gap: 2,
                    mb: 3,
                  }}
                >
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                    <PhoneIcon color="action" fontSize="small" />
                    <Box>
                      <Typography
                        variant="caption"
                        color="text.secondary"
                        sx={{ display: "block" }}
                      >
                        Internal Engineering Hotline
                      </Typography>
                      <Typography variant="body2" sx={{ fontWeight: 700 }}>
                        +91 1800-APENIR-ENG (Priority Ext 99)
                      </Typography>
                    </Box>
                  </Box>

                  <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                    <EmailIcon color="action" fontSize="small" />
                    <Box>
                      <Typography
                        variant="caption"
                        color="text.secondary"
                        sx={{ display: "block" }}
                      >
                        DevOps & Platform Engineering
                      </Typography>
                      <Typography variant="body2" sx={{ fontWeight: 700 }}>
                        admin-tech@appenir.com
                      </Typography>
                    </Box>
                  </Box>

                  <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                    <AccessTimeIcon color="action" fontSize="small" />
                    <Box>
                      <Typography
                        variant="caption"
                        color="text.secondary"
                        sx={{ display: "block" }}
                      >
                        DevOps On-Call Hours
                      </Typography>
                      <Typography variant="body2" sx={{ fontWeight: 700 }}>
                        24/7 SLA Priority Response
                      </Typography>
                    </Box>
                  </Box>
                </Box>

                <Button
                  fullWidth
                  variant="outlined"
                  color="primary"
                  startIcon={<SendIcon />}
                  onClick={() => setIsTicketOpen(true)}
                  sx={{
                    textTransform: "none",
                    fontWeight: 700,
                    borderRadius: "8px",
                  }}
                >
                  Log Technical Ticket
                </Button>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {/* ──────────────────────────────────────────────────────────── */}
      {/* Support Ticket Modal / Dialog */}
      {/* ──────────────────────────────────────────────────────────── */}
      <Dialog
        open={isTicketOpen}
        onClose={() => setIsTicketOpen(false)}
        maxWidth="sm"
        fullWidth
        slotProps={{
          paper: {
            sx: { borderRadius: "16px", p: 1 },
          },
        }}
      >
        <DialogTitle sx={{ fontWeight: 800, pb: 1 }}>
          Log Admin Technical Ticket
        </DialogTitle>
        <form onSubmit={handleTicketSubmit}>
          <DialogContent
            sx={{ display: "flex", flexDirection: "column", gap: 2 }}
          >
            <Typography variant="body2" color="text.secondary">
              Direct escalation to Apenir Engineering & DevOps. For critical
              system outages or security alerts, choose &apos;Urgent&apos;
              priority.
            </Typography>

            <TextField
              label="Incident Subject / Issue Title"
              required
              fullWidth
              size="small"
              placeholder="e.g. Batch payout NEFT export error or SMS Gateway outage"
              value={ticketForm.subject}
              onChange={(e) =>
                handleTicketInputChange("subject", e.target.value)
              }
            />

            <Grid container spacing={2}>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  select
                  label="System Module"
                  fullWidth
                  size="small"
                  value={ticketForm.category}
                  onChange={(e) =>
                    handleTicketInputChange("category", e.target.value)
                  }
                >
                  <MenuItem value="Platform Administration">
                    Platform Administration
                  </MenuItem>
                  <MenuItem value="Lab Onboarding & Verification">
                    Lab Onboarding & Verification
                  </MenuItem>
                  <MenuItem value="Payroll & Settlements">
                    Payroll & Settlements
                  </MenuItem>
                  <MenuItem value="Master Catalog & Services">
                    Master Catalog & Services
                  </MenuItem>
                  <MenuItem value="SMS/Payment Webhook Failure">
                    SMS/Payment Webhook Failure
                  </MenuItem>
                  <MenuItem value="Security / Access Anomaly">
                    Security / Access Anomaly
                  </MenuItem>
                </TextField>
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  select
                  label="Severity / Priority"
                  fullWidth
                  size="small"
                  value={ticketForm.priority}
                  onChange={(e) =>
                    handleTicketInputChange("priority", e.target.value as any)
                  }
                >
                  <MenuItem value="Low">Low - Inquiry / Request</MenuItem>
                  <MenuItem value="Medium">Medium - Standard Issue</MenuItem>
                  <MenuItem value="High">High - Major Feature Down</MenuItem>
                  <MenuItem value="Urgent">Urgent - Platform Outage</MenuItem>
                </TextField>
              </Grid>
            </Grid>

            <TextField
              label="Detailed Technical Description"
              required
              fullWidth
              multiline
              rows={4}
              placeholder="Provide exact steps to reproduce, affected lab IDs or transaction IDs, and error log snippets..."
              value={ticketForm.description}
              onChange={(e) =>
                handleTicketInputChange("description", e.target.value)
              }
            />

            <Grid container spacing={2}>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  label="Admin Callback Mobile"
                  fullWidth
                  size="small"
                  placeholder="+91 9876543210"
                  value={ticketForm.contactPhone}
                  onChange={(e) =>
                    handleTicketInputChange("contactPhone", e.target.value)
                  }
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  label="Admin Work Email"
                  fullWidth
                  size="small"
                  placeholder="admin@appenir.com"
                  value={ticketForm.contactEmail}
                  onChange={(e) =>
                    handleTicketInputChange("contactEmail", e.target.value)
                  }
                />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 2 }}>
            <Button
              onClick={() => setIsTicketOpen(false)}
              color="inherit"
              disabled={submittingTicket}
              sx={{ textTransform: "none" }}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="contained"
              color="primary"
              disabled={submittingTicket}
              sx={{
                textTransform: "none",
                fontWeight: 700,
                borderRadius: "8px",
              }}
            >
              {submittingTicket ? "Submitting..." : "Log Ticket"}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Box>
  );
};

export default AdminSupport;
