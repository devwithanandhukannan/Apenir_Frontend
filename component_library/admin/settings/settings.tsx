import React from "react";
import Head from "next/head";
import { Toaster } from "react-hot-toast";

// Material UI Imports
import Box from "@mui/material/Box";
import Container from "@mui/material/Container";
import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import Divider from "@mui/material/Divider";
import CircularProgress from "@mui/material/CircularProgress";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import Checkbox from "@mui/material/Checkbox";
import FormControlLabel from "@mui/material/FormControlLabel";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import Stack from "@mui/material/Stack";

// Icon Imports
import SaveIcon from "@mui/icons-material/Save";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import MessageIcon from "@mui/icons-material/Message";
import PaymentIcon from "@mui/icons-material/Payment";
import EmailIcon from "@mui/icons-material/Email";
import LockIcon from "@mui/icons-material/Lock";
import InfoIcon from "@mui/icons-material/Info";
import DeleteForeverIcon from "@mui/icons-material/DeleteForever";

import { useSettings } from "./useSettings";

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function CustomTabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`settings-tabpanel-${index}`}
      aria-labelledby={`settings-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  );
}

export const Settings: React.FC = () => {
  const {
    loading,
    saving,
    currentTab,
    handleTabChange,
    waPhoneNumberId,
    setWaPhoneNumberId,
    waApiVersion,
    setWaApiVersion,
    waAccessToken,
    setWaAccessToken,
    rzpKeyId,
    setRzpKeyId,
    rzpKeySecret,
    setRzpKeySecret,
    rzpWebhookSecret,
    setRzpWebhookSecret,
    smtpHost,
    setSmtpHost,
    smtpPort,
    setSmtpPort,
    smtpUsername,
    setSmtpUsername,
    smtpPassword,
    setSmtpPassword,
    smtpEnableSsl,
    setSmtpEnableSsl,
    smtpFromEmail,
    setSmtpFromEmail,
    testing,
    isWaTestOpen,
    setIsWaTestOpen,
    waTestPhone,
    setWaTestPhone,
    isEmailTestOpen,
    setIsEmailTestOpen,
    emailTestAddress,
    setEmailTestAddress,
    isPurgeConfirmOpen,
    setIsPurgeConfirmOpen,
    purgeConfirmText,
    setPurgeConfirmText,
    purging,
    handleSave,
    handleTestWhatsApp,
    handleTestEmail,
    handleTestRazorpay,
    handlePurgeDatabase,
  } = useSettings();

  if (loading) {
    return (
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "85vh",
        }}
      >
        <CircularProgress color="secondary" />
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{ mt: 2, fontWeight: 600 }}
        >
          Loading organization secure configuration settings...
        </Typography>
      </Box>
    );
  }

  return (
    <>
      <Head>
        <title>OmniLab MS - Organization Settings</title>
        <meta
          name="description"
          content="Secure Organization Gateways and SMTP configurations."
        />
      </Head>

      <Container maxWidth="md" sx={{ py: 4 }}>
        <Toaster position="top-right" />

        {/* Header section */}
        <Box sx={{ mb: 4 }}>
          <Typography
            variant="h4"
            sx={{ fontWeight: 900, letterSpacing: "-1px", mb: 0.5 }}
          >
            Organization Settings
          </Typography>
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ fontWeight: 500 }}
          >
            Manage secure API credentials, messaging servers, and payment
            setups.
          </Typography>
        </Box>

        <form onSubmit={handleSave}>
          <Card
            sx={{
              border: "1px solid var(--color-border)",
              borderRadius: "16px",
              boxShadow: "none",
              overflow: "hidden",
            }}
          >
            {/* Tabs Selector */}
            <Box
              sx={{
                borderBottom: 1,
                borderColor: "var(--color-divider)",
                bgcolor: "rgba(0,0,0,0.02)",
              }}
            >
              <Tabs
                value={currentTab}
                onChange={handleTabChange}
                textColor="secondary"
                indicatorColor="secondary"
                variant="fullWidth"
              >
                <Tab
                  icon={<MessageIcon fontSize="small" />}
                  iconPosition="start"
                  label="WhatsApp"
                  sx={{ textTransform: "none", fontWeight: 700, py: 2 }}
                />
                <Tab
                  icon={<PaymentIcon fontSize="small" />}
                  iconPosition="start"
                  label="Razorpay"
                  sx={{ textTransform: "none", fontWeight: 700, py: 2 }}
                />
                <Tab
                  icon={<EmailIcon fontSize="small" />}
                  iconPosition="start"
                  label="SMTP Email"
                  sx={{ textTransform: "none", fontWeight: 700, py: 2 }}
                />
                <Tab
                  icon={<DeleteForeverIcon fontSize="small" />}
                  iconPosition="start"
                  label="Database Control"
                  sx={{ textTransform: "none", fontWeight: 700, py: 2 }}
                />
              </Tabs>
            </Box>

            <CardContent sx={{ p: 4 }}>
              {/* TAB 1: WhatsApp Configuration */}
              <CustomTabPanel value={currentTab} index={0}>
                <Box sx={{ mb: 3 }}>
                  <Typography
                    variant="subtitle1"
                    sx={{
                      fontWeight: 800,
                      mb: 1,
                      display: "flex",
                      alignItems: "center",
                      gap: 1,
                    }}
                  >
                    <MessageIcon color="secondary" />
                    Meta Cloud API WhatsApp Settings
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Configure the Meta Cloud API parameters to send
                    notifications and reports to customers.
                  </Typography>
                </Box>

                <Grid container spacing={3}>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField
                      label="Phone Number ID"
                      value={waPhoneNumberId}
                      onChange={(e) => setWaPhoneNumberId(e.target.value)}
                      fullWidth
                      size="small"
                      helperText="Unique identifier for your WhatsApp verified phone number"
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField
                      label="API Version"
                      value={waApiVersion}
                      onChange={(e) => setWaApiVersion(e.target.value)}
                      fullWidth
                      size="small"
                      helperText="Meta Graph API version (e.g. v25.0)"
                    />
                  </Grid>
                  <Grid size={{ xs: 12 }}>
                    <TextField
                      label="Permanent Access Token"
                      type="password"
                      value={waAccessToken}
                      onChange={(e) => setWaAccessToken(e.target.value)}
                      fullWidth
                      size="small"
                      placeholder="Enter Access Token"
                      helperText="System User Access Token with whatsapp_business_messaging permissions"
                      slotProps={{
                        input: {
                          startAdornment:
                            waAccessToken === "********" ? (
                              <LockIcon
                                fontSize="small"
                                sx={{ mr: 1, color: "text.disabled" }}
                              />
                            ) : null,
                        },
                      }}
                    />
                  </Grid>
                </Grid>

                <Divider sx={{ my: 4 }} />

                <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
                  <Button
                    variant="outlined"
                    color="secondary"
                    startIcon={<PlayArrowIcon />}
                    onClick={() => setIsWaTestOpen(true)}
                    sx={{
                      textTransform: "none",
                      fontWeight: 700,
                      borderRadius: "8px",
                      px: 3,
                    }}
                  >
                    Test WhatsApp Gateway
                  </Button>
                </Box>
              </CustomTabPanel>

              {/* TAB 2: Razorpay Configuration */}
              <CustomTabPanel value={currentTab} index={1}>
                <Box sx={{ mb: 3 }}>
                  <Typography
                    variant="subtitle1"
                    sx={{
                      fontWeight: 800,
                      mb: 1,
                      display: "flex",
                      alignItems: "center",
                      gap: 1,
                    }}
                  >
                    <PaymentIcon color="secondary" />
                    Razorpay Gateway Credentials
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Configure your payment credentials to accept payments online
                    from the booking portal.
                  </Typography>
                </Box>

                <Grid container spacing={3}>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField
                      label="Key ID"
                      value={rzpKeyId}
                      onChange={(e) => setRzpKeyId(e.target.value)}
                      fullWidth
                      size="small"
                      helperText="Razorpay API Key ID (e.g., rzp_test_...)"
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField
                      label="Webhook Secret"
                      value={rzpWebhookSecret}
                      onChange={(e) => setRzpWebhookSecret(e.target.value)}
                      fullWidth
                      size="small"
                      helperText="Used to verify webhook payloads from Razorpay securely"
                    />
                  </Grid>
                  <Grid size={{ xs: 12 }}>
                    <TextField
                      label="Key Secret"
                      type="password"
                      value={rzpKeySecret}
                      onChange={(e) => setRzpKeySecret(e.target.value)}
                      fullWidth
                      size="small"
                      placeholder="Enter Key Secret"
                      helperText="Razorpay secret key associated with the Key ID"
                      slotProps={{
                        input: {
                          startAdornment:
                            rzpKeySecret === "********" ? (
                              <LockIcon
                                fontSize="small"
                                sx={{ mr: 1, color: "text.disabled" }}
                              />
                            ) : null,
                        },
                      }}
                    />
                  </Grid>
                </Grid>

                <Divider sx={{ my: 4 }} />

                <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
                  <Button
                    variant="outlined"
                    color="secondary"
                    startIcon={<PlayArrowIcon />}
                    onClick={handleTestRazorpay}
                    disabled={testing}
                    sx={{
                      textTransform: "none",
                      fontWeight: 700,
                      borderRadius: "8px",
                      px: 3,
                    }}
                  >
                    {testing ? "Testing..." : "Test Razorpay Integration"}
                  </Button>
                </Box>
              </CustomTabPanel>

              {/* TAB 3: SMTP Email Service Configuration */}
              <CustomTabPanel value={currentTab} index={2}>
                <Box sx={{ mb: 3 }}>
                  <Typography
                    variant="subtitle1"
                    sx={{
                      fontWeight: 800,
                      mb: 1,
                      display: "flex",
                      alignItems: "center",
                      gap: 1,
                    }}
                  >
                    <EmailIcon color="secondary" />
                    SMTP Server Settings
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Configure your corporate SMTP credentials for verification,
                    invitation, and report delivery emails.
                  </Typography>
                </Box>

                <Grid container spacing={3}>
                  <Grid size={{ xs: 12, sm: 8 }}>
                    <TextField
                      label="SMTP Server Host"
                      value={smtpHost}
                      onChange={(e) => setSmtpHost(e.target.value)}
                      fullWidth
                      size="small"
                      helperText="Server address (e.g. smtp.gmail.com)"
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 4 }}>
                    <TextField
                      label="Port"
                      type="number"
                      value={smtpPort}
                      onChange={(e) => setSmtpPort(Number(e.target.value))}
                      fullWidth
                      size="small"
                      helperText="TLS usually uses 587, SSL uses 465"
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField
                      label="Username / Authenticated Email"
                      value={smtpUsername}
                      onChange={(e) => setSmtpUsername(e.target.value)}
                      fullWidth
                      size="small"
                      helperText="SMTP Account Username or Email address"
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField
                      label="Sender From Email Address"
                      value={smtpFromEmail}
                      onChange={(e) => setSmtpFromEmail(e.target.value)}
                      fullWidth
                      size="small"
                      helperText="Email address displayed to recipients as the sender"
                    />
                  </Grid>
                  <Grid size={{ xs: 12 }}>
                    <TextField
                      label="SMTP Password / App Password"
                      type="password"
                      value={smtpPassword}
                      onChange={(e) => setSmtpPassword(e.target.value)}
                      fullWidth
                      size="small"
                      placeholder="Enter SMTP Password"
                      helperText="Authentication password or specific App Password"
                      slotProps={{
                        input: {
                          startAdornment:
                            smtpPassword === "********" ? (
                              <LockIcon
                                fontSize="small"
                                sx={{ mr: 1, color: "text.disabled" }}
                              />
                            ) : null,
                        },
                      }}
                    />
                  </Grid>
                  <Grid size={{ xs: 12 }}>
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={smtpEnableSsl}
                          onChange={(e) => setSmtpEnableSsl(e.target.checked)}
                          color="secondary"
                        />
                      }
                      label="Enable SSL/TLS security verification"
                    />
                  </Grid>
                </Grid>

                <Divider sx={{ my: 4 }} />

                <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
                  <Button
                    variant="outlined"
                    color="secondary"
                    startIcon={<PlayArrowIcon />}
                    onClick={() => setIsEmailTestOpen(true)}
                    sx={{
                      textTransform: "none",
                      fontWeight: 700,
                      borderRadius: "8px",
                      px: 3,
                    }}
                  >
                    Test SMTP Service
                  </Button>
                </Box>
              </CustomTabPanel>

              {/* TAB 4: Database Control */}
              <CustomTabPanel value={currentTab} index={3}>
                <Box sx={{ mb: 3 }}>
                  <Typography
                    variant="subtitle1"
                    sx={{
                      fontWeight: 800,
                      mb: 1,
                      display: "flex",
                      alignItems: "center",
                      gap: 1,
                      color: "#dc2626",
                    }}
                  >
                    <DeleteForeverIcon />
                    Danger Zone: Reset Database
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Clear all diagnostic packages, lab profiles, patient
                    details, bookings, and financial histories from the
                    database. Default SuperAdmin credentials will be preserved.
                  </Typography>
                </Box>

                <Box
                  sx={{
                    p: 3,
                    border: "1px solid rgba(220,38,38,0.2)",
                    borderRadius: "12px",
                    bgcolor: "rgba(220,38,38,0.03)",
                    display: "flex",
                    flexDirection: "column",
                    gap: 2,
                    alignItems: "flex-start",
                  }}
                >
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    This action is permanent and cannot be undone. All branches,
                    services, booking logs, and payrolls will be purged
                    instantly.
                  </Typography>
                  <Button
                    variant="contained"
                    onClick={() => setIsPurgeConfirmOpen(true)}
                    sx={{
                      textTransform: "none",
                      fontWeight: 700,
                      borderRadius: "8px",
                      bgcolor: "#dc2626",
                      color: "#fff",
                      "&:hover": { bgcolor: "#b91c1c" },
                    }}
                  >
                    Purge Database Records
                  </Button>
                </Box>
              </CustomTabPanel>

              {/* Bottom Card Action Footer */}
              <Box
                sx={{
                  mt: 3,
                  pt: 3,
                  borderTop: "1px solid var(--color-divider)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 1,
                    color: "text.secondary",
                  }}
                >
                  <InfoIcon fontSize="small" />
                  <Typography variant="caption" sx={{ fontWeight: 600 }}>
                    Secrets will be encrypted securely using AES in the
                    database.
                  </Typography>
                </Box>

                {currentTab !== 3 && (
                  <Button
                    type="submit"
                    variant="contained"
                    color="secondary"
                    disabled={saving}
                    startIcon={
                      saving ? (
                        <CircularProgress size={20} color="inherit" />
                      ) : (
                        <SaveIcon />
                      )
                    }
                    sx={{
                      textTransform: "none",
                      fontWeight: 700,
                      borderRadius: "8px",
                      px: 4,
                      py: 1.2,
                      color: "#fff",
                      boxShadow: "none",
                      "&:hover": { boxShadow: "none" },
                    }}
                  >
                    {saving ? "Saving configurations..." : "Save Settings"}
                  </Button>
                )}
              </Box>
            </CardContent>
          </Card>
        </form>

        {/* DIALOGS FOR CONNECTION TESTING */}

        {/* WhatsApp Test Dialog */}
        <Dialog
          open={isWaTestOpen}
          onClose={() => setIsWaTestOpen(false)}
          maxWidth="xs"
          fullWidth
        >
          <DialogTitle sx={{ fontWeight: 900 }}>
            WhatsApp Gateway Test
          </DialogTitle>
          <DialogContent dividers>
            <Stack spacing={2} sx={{ py: 1 }}>
              <Typography variant="body2" color="text.secondary">
                Enter your WhatsApp phone number with country code (e.g.
                919876543210) to verify outbound messages.
              </Typography>
              <TextField
                label="Recipient Phone Number"
                value={waTestPhone}
                onChange={(e) => setWaTestPhone(e.target.value)}
                placeholder="e.g. 919876543210"
                fullWidth
                size="small"
                required
              />
            </Stack>
          </DialogContent>
          <DialogActions sx={{ p: 2 }}>
            <Button
              onClick={() => setIsWaTestOpen(false)}
              color="inherit"
              sx={{ textTransform: "none", fontWeight: 700 }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleTestWhatsApp}
              variant="contained"
              color="secondary"
              disabled={testing || !waTestPhone}
              sx={{ textTransform: "none", fontWeight: 700, color: "#fff" }}
            >
              {testing ? "Sending..." : "Send Test Message"}
            </Button>
          </DialogActions>
        </Dialog>

        {/* SMTP Test Dialog */}
        <Dialog
          open={isEmailTestOpen}
          onClose={() => setIsEmailTestOpen(false)}
          maxWidth="xs"
          fullWidth
        >
          <DialogTitle sx={{ fontWeight: 900 }}>SMTP Server Test</DialogTitle>
          <DialogContent dividers>
            <Stack spacing={2} sx={{ py: 1 }}>
              <Typography variant="body2" color="text.secondary">
                Enter a recipient email address to send a test message verify
                SMTP host credentials.
              </Typography>
              <TextField
                label="Recipient Email Address"
                value={emailTestAddress}
                onChange={(e) => setEmailTestAddress(e.target.value)}
                placeholder="e.g. test@example.com"
                type="email"
                fullWidth
                size="small"
                required
              />
            </Stack>
          </DialogContent>
          <DialogActions sx={{ p: 2 }}>
            <Button
              onClick={() => setIsEmailTestOpen(false)}
              color="inherit"
              sx={{ textTransform: "none", fontWeight: 700 }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleTestEmail}
              variant="contained"
              color="secondary"
              disabled={testing || !emailTestAddress}
              sx={{ textTransform: "none", fontWeight: 700, color: "#fff" }}
            >
              {testing ? "Sending..." : "Send Test Email"}
            </Button>
          </DialogActions>
        </Dialog>

        {/* Purge Database Dialog */}
        <Dialog
          open={isPurgeConfirmOpen}
          onClose={() => !purging && setIsPurgeConfirmOpen(false)}
          maxWidth="xs"
          fullWidth
        >
          <DialogTitle sx={{ fontWeight: 900, color: "#dc2626" }}>
            Confirm Database Reset
          </DialogTitle>
          <DialogContent dividers>
            <Stack spacing={2} sx={{ py: 1 }}>
              <Typography
                variant="body2"
                color="error"
                sx={{ fontWeight: 700 }}
              >
                WARNING: This will delete ALL customer accounts, laboratory
                branches, packages, appointments, and transaction logs.
              </Typography>
              <Typography variant="body2" color="text.secondary">
                To proceed, type <strong>RESET</strong> in the field below to
                confirm the action.
              </Typography>
              <TextField
                label="Type RESET to confirm"
                value={purgeConfirmText}
                onChange={(e) => setPurgeConfirmText(e.target.value)}
                placeholder="RESET"
                fullWidth
                size="small"
                required
                disabled={purging}
              />
            </Stack>
          </DialogContent>
          <DialogActions sx={{ p: 2 }}>
            <Button
              onClick={() => {
                setIsPurgeConfirmOpen(false);
                setPurgeConfirmText("");
              }}
              color="inherit"
              disabled={purging}
              sx={{ textTransform: "none", fontWeight: 700 }}
            >
              Cancel
            </Button>
            <Button
              onClick={handlePurgeDatabase}
              variant="contained"
              disabled={purging || purgeConfirmText !== "RESET"}
              sx={{
                textTransform: "none",
                fontWeight: 700,
                bgcolor: "#dc2626",
                color: "#fff",
                "&:hover": { bgcolor: "#b91c1c" },
              }}
            >
              {purging ? "Purging..." : "Purge All Data"}
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    </>
  );
};

export default Settings;
