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
import MenuBookIcon from "@mui/icons-material/MenuBook";
import LightbulbIcon from "@mui/icons-material/Lightbulb";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import SendIcon from "@mui/icons-material/Send";
import ScienceIcon from "@mui/icons-material/Science";

import { useSupport, CATEGORY_OPTIONS } from "./useSupport";

export const Support: React.FC = () => {
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
  } = useSupport();

  const isCurrentStepCompleted = completedSteps.includes(activeStep);

  return (
    <Box sx={{ p: { xs: 2, md: 4 }, maxWidth: 1400, margin: "0 auto" }}>
      {/* ──────────────────────────────────────────────────────────── */}
      {/* Top Banner Header */}
      {/* ──────────────────────────────────────────────────────────── */}
      <Box
        sx={{
          background: "linear-gradient(135deg, #0f172a 0%, #1e293b 100%)",
          color: "#ffffff",
          borderRadius: "16px",
          p: { xs: 3, md: 4 },
          mb: 4,
          boxShadow: "0 10px 30px rgba(15, 23, 42, 0.15)",
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
              "radial-gradient(circle, rgba(16,185,129,0.15) 0%, rgba(0,0,0,0) 70%)",
            pointerEvents: "none",
          }}
        />

        <Grid container spacing={3} sx={{ alignItems: "center" }}>
          <Grid size={{ xs: 12, md: 8 }}>
            <Box
              sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 1 }}
            >
              <MenuBookIcon sx={{ color: "#10b981", fontSize: 32 }} />
              <Typography
                variant="h4"
                sx={{ fontWeight: 800, letterSpacing: "-0.5px" }}
              >
                Lab Portal Support & Documentation
              </Typography>
            </Box>
            <Typography
              variant="body1"
              sx={{ color: "#94a3b8", mb: 2, maxWidth: 700 }}
            >
              Step-by-step operating guidelines, workflow tutorials, and
              reference guides for all Apenir Lab modules. Follow the
              interactive stepper below or search specific topics.
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
                  sx={{ color: "#cbd5e1", fontWeight: 600 }}
                >
                  Documentation Progress ({completedSteps.length}/
                  {filteredSteps.length} Steps)
                </Typography>
                <Typography
                  variant="caption"
                  sx={{ color: "#10b981", fontWeight: 700 }}
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
                  bgcolor: "rgba(255, 255, 255, 0.1)",
                  "& .MuiLinearProgress-bar": {
                    borderRadius: 4,
                    background:
                      "linear-gradient(90deg, #10b981 0%, #34d399 100%)",
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
                bgcolor: "#10b981",
                color: "#ffffff",
                fontWeight: 700,
                px: 3,
                py: 1.5,
                borderRadius: "10px",
                textTransform: "none",
                boxShadow: "0 4px 14px rgba(16, 185, 129, 0.4)",
                "&:hover": {
                  bgcolor: "#059669",
                },
              }}
            >
              Contact Lab Support
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
                placeholder="Search topics (e.g. appointments, PDF upload, staff, payout)..."
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
                {CATEGORY_OPTIONS.map((cat) => (
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
            PAGE-BY-PAGE DOCUMENTATION STEPPER
          </Typography>

          {filteredSteps.length === 0 ? (
            <Alert severity="info">
              No documentation topics found matching &quot;{searchQuery}&quot;.
              Try resetting search query or category filters.
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
                    <ScienceIcon color="primary" fontSize="small" /> Key
                    Capabilities on this Page:
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
                  Detailed Operating Instructions:
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
                        borderLeftColor: "primary.main",
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
                                <strong>Pro-Tip:</strong> {item.tip}
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
                                <strong>Important Notice:</strong>{" "}
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
                    Best Practice Guideline:
                  </Typography>
                  <Typography variant="body2">{currentStep.proTip}</Typography>
                </Alert>

                {/* Direct Action Link */}
                <Box
                  sx={{
                    p: 3,
                    borderRadius: "12px",
                    bgcolor: "rgba(16, 185, 129, 0.08)",
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
                      Ready to use this feature?
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Jump straight to the active {currentStep.shortTitle} page
                      in your portal console.
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
                    Previous Topic
                  </Button>

                  <Button
                    variant="contained"
                    endIcon={<ArrowForwardIcon />}
                    disabled={activeStep === filteredSteps.length - 1}
                    onClick={handleNextStep}
                    sx={{ textTransform: "none", fontWeight: 700 }}
                  >
                    Next Topic ({activeStep + 2}/{filteredSteps.length})
                  </Button>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          {/* Right Sidebar: FAQs & Quick Help Desk */}
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
                    Topic FAQs
                  </Typography>
                </Box>
                <Divider sx={{ mb: 2 }} />

                {currentStep.faqs.map((faq, i) => {
                  const panelId = `panel_${i}`;
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

            {/* Quick Contact & Escalation Box */}
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
                  <HeadsetMicIcon color="secondary" />
                  <Typography variant="h6" sx={{ fontWeight: 800 }}>
                    Lab Escalation Desk
                  </Typography>
                </Box>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ mb: 2.5 }}
                >
                  Need immediate technical or operational assistance with your
                  lab orders or integration?
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
                        Emergency Toll-Free Helpline
                      </Typography>
                      <Typography variant="body2" sx={{ fontWeight: 700 }}>
                        +91 1800-420-APENIR (1800-420-2736)
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
                        Lab Operations Email
                      </Typography>
                      <Typography variant="body2" sx={{ fontWeight: 700 }}>
                        lab-support@appenir.com
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
                        Support Operational Hours
                      </Typography>
                      <Typography variant="body2" sx={{ fontWeight: 700 }}>
                        24/7 Priority Support for Active Labs
                      </Typography>
                    </Box>
                  </Box>
                </Box>

                <Button
                  fullWidth
                  variant="outlined"
                  color="secondary"
                  startIcon={<SendIcon />}
                  onClick={() => setIsTicketOpen(true)}
                  sx={{
                    textTransform: "none",
                    fontWeight: 700,
                    borderRadius: "8px",
                  }}
                >
                  Raise Support Ticket
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
          Raise Lab Support Ticket
        </DialogTitle>
        <form onSubmit={handleTicketSubmit}>
          <DialogContent
            sx={{ display: "flex", flexDirection: "column", gap: 2 }}
          >
            <Typography variant="body2" color="text.secondary">
              Submit a direct request to the Apenir Technical Support team. We
              usually respond within 15-30 minutes for active diagnostic
              facilities.
            </Typography>

            <TextField
              label="Subject / Issue Title"
              required
              fullWidth
              size="small"
              placeholder="e.g. Appointment #1042 report upload failing"
              value={ticketForm.subject}
              onChange={(e) =>
                handleTicketInputChange("subject", e.target.value)
              }
            />

            <Grid container spacing={2}>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  select
                  label="Module Category"
                  fullWidth
                  size="small"
                  value={ticketForm.category}
                  onChange={(e) =>
                    handleTicketInputChange("category", e.target.value)
                  }
                >
                  <MenuItem value="General Inquiry">General Inquiry</MenuItem>
                  <MenuItem value="Appointments & Collection">
                    Appointments & Collection
                  </MenuItem>
                  <MenuItem value="PDF Report Upload">
                    PDF Report Upload
                  </MenuItem>
                  <MenuItem value="Staff Allocation">Staff Allocation</MenuItem>
                  <MenuItem value="Payment & Payout Batch">
                    Payment & Payout Batch
                  </MenuItem>
                  <MenuItem value="Technical Bug">Technical Bug</MenuItem>
                </TextField>
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  select
                  label="Priority Level"
                  fullWidth
                  size="small"
                  value={ticketForm.priority}
                  onChange={(e) =>
                    handleTicketInputChange("priority", e.target.value as any)
                  }
                >
                  <MenuItem value="Low">Low - Information Request</MenuItem>
                  <MenuItem value="Medium">Medium - Standard Issue</MenuItem>
                  <MenuItem value="High">High - Impairing Work</MenuItem>
                  <MenuItem value="Urgent">
                    Urgent - Operations Blocked
                  </MenuItem>
                </TextField>
              </Grid>
            </Grid>

            <TextField
              label="Detailed Description"
              required
              fullWidth
              multiline
              rows={4}
              placeholder="Describe what you were trying to do, expected result, and any error message displayed..."
              value={ticketForm.description}
              onChange={(e) =>
                handleTicketInputChange("description", e.target.value)
              }
            />

            <Grid container spacing={2}>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  label="Callback Phone (Optional)"
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
                  label="Contact Email (Optional)"
                  fullWidth
                  size="small"
                  placeholder="labadmin@example.com"
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
              {submittingTicket ? "Submitting Ticket..." : "Submit Ticket"}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Box>
  );
};

export default Support;
