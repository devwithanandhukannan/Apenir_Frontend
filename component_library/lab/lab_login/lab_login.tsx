import React from "react";
import { useLabLogin } from "./useLabLogin";
import Box from "@mui/material/Box";
import Grid from "@mui/material/Grid";
import Typography from "@mui/material/Typography";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import Link from "@mui/material/Link";
import Alert from "@mui/material/Alert";
import IconButton from "@mui/material/IconButton";
import InputAdornment from "@mui/material/InputAdornment";
import Avatar from "@mui/material/Avatar";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import EmailIcon from "@mui/icons-material/Email";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import ScienceIcon from "@mui/icons-material/Science";
import DirectionsBikeIcon from "@mui/icons-material/DirectionsBike";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogActions from "@mui/material/DialogActions";
import Snackbar from "@mui/material/Snackbar";

export const LabLogin: React.FC = () => {
  const {
    email,
    setEmail,
    password,
    setPassword,
    showPassword,
    setShowPassword,
    error,
    loading,
    openResetDialog,
    setOpenResetDialog,
    resetEmail,
    setResetEmail,
    resetSent,
    openSnackbar,
    setOpenSnackbar,
    handleLogin,
    handleSendReset,
    router,
  } = useLabLogin();

  const isStaffLogin = router.pathname.includes("/staff/login");

  return (
    <Grid container sx={{ minHeight: "100vh", bgcolor: "background.default" }}>
      {/* Left Column: Lab Illustration Panel */}
      <Grid
        size={{ xs: 12, md: 6 }}
        sx={{
          position: "relative",
          display: { xs: "none", md: "flex" },
          flexDirection: "column",
          justifyContent: "space-between",
          p: 0,
          overflow: "hidden",
        }}
      >
        {/* Full-bleed illustration image */}
        <Box
          component="img"
          src="/illustrations/lab_illustration.png"
          alt="Lab staff examining a test tube in a laboratory environment"
          sx={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            objectFit: "cover",
            zIndex: 1,
          }}
        />

        {/* Gradient overlay for readability */}
        <Box
          sx={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            background:
              "linear-gradient(180deg, rgba(0,40,60,0.15) 0%, rgba(0,40,60,0.55) 60%, rgba(0,30,50,0.88) 100%)",
            zIndex: 2,
          }}
        />

        {/* Floating glass badge — top-left branding */}
        <Box
          sx={{
            zIndex: 3,
            m: 4,
            display: "flex",
            alignItems: "center",
            gap: 1.5,
            backdropFilter: "blur(14px)",
            backgroundColor: "rgba(255,255,255,0.12)",
            border: "1px solid rgba(255,255,255,0.18)",
            borderRadius: "14px",
            px: 2.5,
            py: 1.2,
            width: "fit-content",
            boxShadow: "0 8px 32px rgba(0,0,0,0.18)",
          }}
        >
          <ScienceIcon sx={{ color: "#4dd0e1", fontSize: 28 }} />
          <Box>
            <Typography
              variant="subtitle2"
              sx={{
                color: "#fff",
                fontWeight: 800,
                letterSpacing: "-0.3px",
                lineHeight: 1.2,
              }}
            >
              Appenir<span style={{ color: "#4dd0e1" }}> Lab</span>
            </Typography>
            <Typography
              variant="caption"
              sx={{ color: "rgba(255,255,255,0.65)", fontWeight: 500 }}
            >
              Diagnostics Portal
            </Typography>
          </Box>
        </Box>

        {/* Bottom text overlay */}
        <Box sx={{ zIndex: 3, p: 4, pt: 0 }}>
          <Typography
            variant="h4"
            sx={{
              color: "#fff",
              fontWeight: 800,
              letterSpacing: "-0.5px",
              mb: 1.5,
              textShadow: "0 2px 24px rgba(0,0,0,0.35)",
              lineHeight: 1.2,
            }}
          >
            Precision Diagnostics,
            <br />
            Streamlined Workflow
          </Typography>
          <Typography
            variant="body2"
            sx={{
              color: "rgba(255,255,255,0.78)",
              maxWidth: 420,
              lineHeight: 1.7,
              textShadow: "0 1px 8px rgba(0,0,0,0.25)",
            }}
          >
            Access your lab dashboard, manage test samples, track results, and
            run diagnostics — all from one secure portal.
          </Typography>

          {/* Bottom footer */}
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              mt: 4,
              pt: 2,
              borderTop: "1px solid rgba(255,255,255,0.12)",
            }}
          >
            <Typography
              variant="caption"
              sx={{ color: "rgba(255,255,255,0.45)" }}
            >
              © {new Date().getFullYear()} Appenir MS. All rights reserved.
            </Typography>
            <Typography
              variant="caption"
              sx={{ color: "rgba(255,255,255,0.45)" }}
            >
              v1.0.0
            </Typography>
          </Box>
        </Box>
      </Grid>

      {/* Right Column: Login Form */}
      <Grid
        size={{ xs: 12, md: 6 }}
        sx={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          p: { xs: 3, sm: 6, md: 8 },
          bgcolor: "background.paper",
          color: "text.primary",
          borderLeft: { md: "1px solid var(--color-border)" },
        }}
      >
        {/* Back to Home Button */}
        <Box sx={{ alignSelf: "flex-start", mb: 4 }}>
          <Button
            id="lab-login-back-btn"
            startIcon={<ArrowBackIcon />}
            onClick={() => router.push("/")}
            sx={{
              color: "text.secondary",
              textTransform: "none",
              fontWeight: 600,
              "&:hover": { color: "primary.main" },
            }}
          >
            Main Portal
          </Button>
        </Box>

        <Box sx={{ width: "100%", maxWidth: 400 }}>
          {/* Header Brand */}
          <Box sx={{ mb: 4, display: "flex", alignItems: "center", gap: 1.5 }}>
            <Avatar
              sx={{
                bgcolor: isStaffLogin ? "#0284c7" : "#00897b",
                width: 48,
                height: 48,
                boxShadow: isStaffLogin
                  ? "0 4px 14px rgba(2,132,199,0.35)"
                  : "0 4px 14px rgba(0,137,123,0.35)",
              }}
            >
              {isStaffLogin ? (
                <DirectionsBikeIcon sx={{ fontSize: 26 }} />
              ) : (
                <ScienceIcon sx={{ fontSize: 26 }} />
              )}
            </Avatar>
            <Box>
              <Typography
                variant="h5"
                sx={{
                  fontWeight: 800,
                  letterSpacing: "-0.5px",
                  lineHeight: 1.1,
                }}
              >
                Appenir
                <span style={{ color: isStaffLogin ? "#0284c7" : "#00897b" }}>
                  {" "}
                  {isStaffLogin ? "Staff" : "Lab"}
                </span>
              </Typography>
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{ fontWeight: 600, letterSpacing: "1.5px" }}
              >
                {isStaffLogin ? "STAFF PORTAL" : "LAB CONSOLE"}
              </Typography>
            </Box>
          </Box>

          {/* Welcome Text */}
          <Box sx={{ mb: 3 }}>
            <Typography
              variant="h5"
              sx={{ fontWeight: 800, mb: 1, letterSpacing: "-0.3px" }}
            >
              Welcome back!
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {isStaffLogin
                ? "Sign in to your staff account to view assignments, navigate routes, and collect samples."
                : "Sign in to your lab account to manage tests, samples, and diagnostics reports."}
            </Typography>
          </Box>

          {/* Error Message */}
          {error && (
            <Alert
              id="lab-login-error-alert"
              severity="error"
              sx={{ mb: 3, borderRadius: "10px" }}
            >
              {error}
            </Alert>
          )}

          {/* Login Form */}
          <Box component="form" onSubmit={handleLogin} noValidate>
            <TextField
              margin="normal"
              required
              fullWidth
              id="lab-login-email"
              label={isStaffLogin ? "Staff Email Address" : "Lab Email Address"}
              name="email"
              autoComplete="email"
              autoFocus
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <EmailIcon color="action" fontSize="small" />
                    </InputAdornment>
                  ),
                },
              }}
              sx={{
                "& .MuiOutlinedInput-root": {
                  borderRadius: "10px",
                },
                "& .MuiInputBase-input": {
                  color: "text.primary",
                },
                "& .MuiInputLabel-root": {
                  color: "text.secondary",
                },
              }}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              name="password"
              label="Password"
              type={showPassword ? "text" : "password"}
              id="lab-login-password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <LockOutlinedIcon color="action" fontSize="small" />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        id="lab-login-toggle-password"
                        aria-label="toggle password visibility"
                        onClick={() => setShowPassword(!showPassword)}
                        edge="end"
                      >
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                },
              }}
              sx={{
                "& .MuiOutlinedInput-root": {
                  borderRadius: "10px",
                },
                "& .MuiInputBase-input": {
                  color: "text.primary",
                },
                "& .MuiInputLabel-root": {
                  color: "text.secondary",
                },
              }}
            />

            {/* Forgot Password Link */}
            <Box
              sx={{
                display: "flex",
                justifyContent: "flex-end",
                mt: 1.5,
                mb: 3,
              }}
            >
              <Link
                id="lab-login-forgot-password"
                component="button"
                type="button"
                variant="body2"
                onClick={() => setOpenResetDialog(true)}
                sx={{
                  fontWeight: 600,
                  textDecoration: "none",
                  color: isStaffLogin ? "#0284c7" : "#00897b",
                  "&:hover": {
                    textDecoration: "underline",
                    color: isStaffLogin ? "#0369a1" : "#00695c",
                  },
                }}
              >
                Forgot password?
              </Link>
            </Box>

            {/* Sign In Button */}
            <Button
              id="lab-login-submit-btn"
              type="submit"
              fullWidth
              variant="contained"
              disabled={loading}
              sx={{
                py: 1.5,
                borderRadius: "10px",
                fontWeight: 700,
                textTransform: "none",
                fontSize: "15px",
                backgroundColor: isStaffLogin ? "#0284c7" : "#00897b",
                boxShadow: isStaffLogin
                  ? "0 4px 14px rgba(2,132,199,0.35)"
                  : "0 4px 14px rgba(0,137,123,0.35)",
                transition: "all 0.25s ease",
                "&:hover": {
                  backgroundColor: isStaffLogin ? "#0369a1" : "#00695c",
                  boxShadow: isStaffLogin
                    ? "0 6px 20px rgba(2,132,199,0.45)"
                    : "0 6px 20px rgba(0,137,123,0.45)",
                  transform: "translateY(-1px)",
                },
                "&:active": {
                  transform: "translateY(0)",
                },
              }}
            >
              {loading ? "Authenticating..." : "Sign In"}
            </Button>
          </Box>
        </Box>
      </Grid>

      {/* Forgot Password Dialog */}
      <Dialog
        open={openResetDialog}
        onClose={() => setOpenResetDialog(false)}
        slotProps={{
          paper: {
            sx: { borderRadius: "14px", p: 1 },
          },
        }}
      >
        <DialogTitle sx={{ fontWeight: 800 }}>Reset Lab Password</DialogTitle>
        <Box component="form" onSubmit={handleSendReset}>
          <DialogContent>
            <DialogContentText sx={{ mb: 2 }}>
              Enter your registered lab email address and we&apos;ll send you
              instructions to reset your password.
            </DialogContentText>
            <TextField
              autoFocus
              margin="dense"
              id="lab-reset-email"
              label="Email Address"
              type="email"
              fullWidth
              variant="outlined"
              required
              value={resetEmail}
              onChange={(e) => setResetEmail(e.target.value)}
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <EmailIcon color="action" fontSize="small" />
                    </InputAdornment>
                  ),
                },
              }}
              sx={{
                "& .MuiOutlinedInput-root": {
                  borderRadius: "10px",
                },
              }}
            />
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 2 }}>
            <Button
              id="lab-reset-cancel-btn"
              onClick={() => setOpenResetDialog(false)}
              sx={{
                textTransform: "none",
                fontWeight: 600,
                color: "text.secondary",
              }}
            >
              Cancel
            </Button>
            <Button
              id="lab-reset-submit-btn"
              type="submit"
              variant="contained"
              disabled={resetSent}
              sx={{
                textTransform: "none",
                fontWeight: 700,
                borderRadius: "10px",
                backgroundColor: isStaffLogin ? "#0284c7" : "#00897b",
                "&:hover": {
                  backgroundColor: isStaffLogin ? "#0369a1" : "#00695c",
                },
              }}
            >
              {resetSent ? "Sending..." : "Send Reset Link"}
            </Button>
          </DialogActions>
        </Box>
      </Dialog>

      {/* Success Snackbar */}
      <Snackbar
        open={openSnackbar}
        autoHideDuration={2000}
        onClose={() => setOpenSnackbar(false)}
        message="Login successful! Redirecting..."
      />
    </Grid>
  );
};

export default LabLogin;
