import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Container from "@mui/material/Container";
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import Alert from "@mui/material/Alert";
import CircularProgress from "@mui/material/CircularProgress";
import PersonIcon from "@mui/icons-material/Person";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import PhoneAndroidIcon from "@mui/icons-material/PhoneAndroid";
import LockIcon from "@mui/icons-material/Lock";
import LinearProgress from "@mui/material/LinearProgress";
import toast, { Toaster } from "react-hot-toast";
import { useApi } from "@/core_components/hooks/useApi/useApi";

export default function RegisterStaff() {
  const router = useRouter();
  const { get, post } = useApi();
  const { token } = router.query;

  const [verifying, setVerifying] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");
  const [staffDetails, setStaffDetails] = useState<{
    email: string;
    name: string;
  } | null>(null);

  // Wizard state
  const [step, setStep] = useState(1); // 1 = Set Password, 2 = Phone Verification, 3 = Complete
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");

  // OTP state
  const [otpSent, setOtpSent] = useState(false);
  const [otpCode, setOtpCode] = useState("");
  const [otpVerified, setOtpVerified] = useState(false);
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  // Verify staff invitation token
  useEffect(() => {
    if (!router.isReady || !token) return;

    const verifyToken = async () => {
      setVerifying(true);
      setErrorMsg("");
      const response = await get<any>({
        endpoint: `/api/lab/staff/verify?token=${token}`,
        requireAuth: false,
      });

      if (response.success && response.data?.success && response.data?.data) {
        setStaffDetails(response.data.data);
      } else {
        setErrorMsg(
          response.data?.message ||
            "Invitation link is invalid, expired, or already used.",
        );
      }
      setVerifying(false);
    };

    verifyToken();
  }, [router.isReady, token, get]);

  const handleSendOtp = async () => {
    if (!phone || phone.length < 10) {
      toast.error("Please enter a valid phone number.");
      return;
    }
    setIsSendingOtp(true);
    const response = await post<any, any>({
      endpoint: "/api/auth/otp/send",
      body: { phone: phone.trim() },
      requireAuth: false,
    });
    setIsSendingOtp(false);

    if (response.success && response.data?.success) {
      setOtpSent(true);
      toast.success("Verification OTP sent via WhatsApp successfully!");
    } else {
      toast.error(
        response.data?.message || "Failed to dispatch verification OTP.",
      );
    }
  };

  const handleVerifyOtp = async () => {
    if (!otpCode || otpCode.length !== 6) {
      toast.error("Please enter a 6-digit code.");
      return;
    }
    setIsVerifyingOtp(true);
    const response = await post<any, any>({
      endpoint: "/api/auth/otp/verify-only",
      body: { phone: phone.trim(), otp: otpCode.trim() },
      requireAuth: false,
    });
    setIsVerifyingOtp(false);

    if (response.success && response.data?.success) {
      setOtpVerified(true);
      toast.success("Phone number verified successfully!");
      setStep(3);
    } else {
      toast.error(response.data?.message || "Invalid or expired OTP code.");
    }
  };

  const handleCompleteSetup = async () => {
    if (!otpVerified) {
      toast.error("Please verify your phone number via OTP first.");
      return;
    }
    setIsSubmitting(true);
    const response = await post<any, any>({
      endpoint: "/api/lab/staff/verify",
      body: {
        token,
        password,
        phone: phone.trim(),
      },
      requireAuth: false,
    });
    setIsSubmitting(false);

    if (response.success && response.data?.success) {
      setSuccess(true);
      toast.success("Account activation complete!");
    } else {
      toast.error(
        response.data?.message || "Failed to complete account activation.",
      );
    }
  };

  if (verifying) {
    return (
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "100vh",
          bgcolor: "#f8fafc",
          p: 3,
        }}
      >
        <CircularProgress color="primary" size={40} sx={{ mb: 2 }} />
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{ fontWeight: 600 }}
        >
          Verifying phlebotomist invitation token...
        </Typography>
      </Box>
    );
  }

  if (errorMsg) {
    return (
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "100vh",
          bgcolor: "#f8fafc",
          p: 2,
        }}
      >
        <Container maxWidth="xs" disableGutters>
          <Card
            elevation={0}
            sx={{
              border: "1px solid #e2e8f0",
              borderRadius: "16px",
              boxShadow: "0 4px 20px rgba(0,0,0,0.03)",
            }}
          >
            <CardContent sx={{ textAlign: "center", p: 4 }}>
              <PersonIcon sx={{ fontSize: 48, color: "error.main", mb: 2 }} />
              <Typography
                variant="h6"
                sx={{ fontWeight: 800, mb: 1, letterSpacing: "-0.5px" }}
              >
                Invitation Expired
              </Typography>
              <Alert
                severity="error"
                sx={{
                  mb: 3,
                  borderRadius: "8px",
                  fontWeight: 500,
                  fontSize: 13,
                }}
              >
                {errorMsg}
              </Alert>
              <Button
                variant="contained"
                fullWidth
                onClick={() => router.push("/lab/login")}
                sx={{
                  textTransform: "none",
                  py: 1.2,
                  fontWeight: 700,
                  borderRadius: "8px",
                }}
              >
                Back to Portal Login
              </Button>
            </CardContent>
          </Card>
        </Container>
      </Box>
    );
  }

  if (success) {
    return (
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "100vh",
          bgcolor: "#f8fafc",
          p: 2,
        }}
      >
        <Container maxWidth="xs" disableGutters>
          <Card
            elevation={0}
            sx={{
              border: "1px solid #e2e8f0",
              borderRadius: "16px",
              boxShadow: "0 4px 20px rgba(0,0,0,0.03)",
            }}
          >
            <CardContent sx={{ textAlign: "center", p: 4 }}>
              <Box
                sx={{
                  display: "inline-flex",
                  p: 2,
                  borderRadius: "50%",
                  bgcolor: "rgba(16,185,129,0.08)",
                  color: "success.main",
                  mb: 2,
                }}
              >
                <CheckCircleIcon sx={{ fontSize: 40 }} />
              </Box>
              <Typography
                variant="h6"
                sx={{ fontWeight: 800, mb: 1, letterSpacing: "-0.5px" }}
              >
                Activation Complete!
              </Typography>
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ mb: 4, px: 1, lineHeight: 1.5 }}
              >
                Your phlebotomist profile has been activated successfully. You
                can now login to your portal to access scheduled bookings.
              </Typography>
              <Button
                variant="contained"
                fullWidth
                onClick={() => router.push("/lab/login")}
                sx={{
                  textTransform: "none",
                  py: 1.2,
                  fontWeight: 700,
                  borderRadius: "8px",
                }}
              >
                Proceed to Login
              </Button>
            </CardContent>
          </Card>
        </Container>
      </Box>
    );
  }

  const progressPercent = step === 1 ? 33 : step === 2 ? 66 : 100;

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        minHeight: "100vh",
        bgcolor: "#f8fafc",
        p: 2,
      }}
    >
      <Toaster />

      <Container maxWidth="xs" disableGutters sx={{ width: "100%" }}>
        {/* Onboarding Header */}
        <Box sx={{ mb: 3, textAlign: "center" }}>
          <Typography
            variant="h5"
            sx={{ fontWeight: 900, mb: 0.5, letterSpacing: "-0.5px" }}
          >
            Onboard Phlebotomist
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Welcome, <strong>{staffDetails?.name}</strong> (
            {staffDetails?.email})
          </Typography>
        </Box>

        {/* Dynamic Mobile Stepper Progress Bar */}
        <Box sx={{ mb: 3, px: 1 }}>
          <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
            <Typography variant="caption" sx={{ fontWeight: 700 }}>
              Step {step} of 3
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {step === 1
                ? "Set Account Password"
                : step === 2
                  ? "Verify Phone Number"
                  : "Finish Setup"}
            </Typography>
          </Box>
          <LinearProgress
            variant="determinate"
            value={progressPercent}
            color="primary"
            sx={{ height: 6, borderRadius: 3, bgcolor: "#e2e8f0" }}
          />
        </Box>

        <Card
          elevation={0}
          sx={{
            border: "1px solid #e2e8f0",
            borderRadius: "16px",
            boxShadow: "0 4px 20px rgba(0,0,0,0.03)",
          }}
        >
          <CardContent sx={{ p: 3 }}>
            {step === 1 && (
              <Box>
                <Box
                  sx={{
                    display: "flex",
                    gap: 1,
                    alignItems: "center",
                    mb: 1.5,
                  }}
                >
                  <LockIcon color="primary" sx={{ fontSize: 20 }} />
                  <Typography variant="body1" sx={{ fontWeight: 800 }}>
                    Set Account Password
                  </Typography>
                </Box>
                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{ display: "block", mb: 3, lineHeight: 1.4 }}
                >
                  Provide a secure password to register your new phlebotomist
                  dashboard login.
                </Typography>

                <TextField
                  label="Password"
                  type="password"
                  fullWidth
                  size="small"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  sx={{ mb: 3 }}
                />

                <Button
                  variant="contained"
                  fullWidth
                  disabled={password.length < 6}
                  onClick={() => setStep(2)}
                  endIcon={<ArrowForwardIcon />}
                  sx={{
                    textTransform: "none",
                    py: 1.2,
                    fontWeight: 700,
                    borderRadius: "8px",
                  }}
                >
                  Continue Setup
                </Button>
              </Box>
            )}

            {step === 2 && (
              <Box>
                <Box
                  sx={{
                    display: "flex",
                    gap: 1,
                    alignItems: "center",
                    mb: 1.5,
                  }}
                >
                  <PhoneAndroidIcon color="primary" sx={{ fontSize: 20 }} />
                  <Typography variant="body1" sx={{ fontWeight: 800 }}>
                    Phone Verification
                  </Typography>
                </Box>
                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{ display: "block", mb: 3, lineHeight: 1.4 }}
                >
                  Register your WhatsApp phone number to receive real-time
                  booking alerts and verification OTPs.
                </Typography>

                <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                  <TextField
                    label="WhatsApp Phone Number"
                    placeholder="e.g. 919876543210"
                    fullWidth
                    size="small"
                    value={phone}
                    disabled={otpSent}
                    onChange={(e) => setPhone(e.target.value)}
                  />
                  {!otpSent ? (
                    <Button
                      variant="contained"
                      onClick={handleSendOtp}
                      disabled={isSendingOtp || phone.length < 10}
                      sx={{
                        textTransform: "none",
                        py: 1.2,
                        fontWeight: 700,
                        borderRadius: "8px",
                      }}
                    >
                      {isSendingOtp ? (
                        <CircularProgress size={18} color="inherit" />
                      ) : (
                        "Send OTP"
                      )}
                    </Button>
                  ) : (
                    <Box
                      sx={{
                        display: "flex",
                        flexDirection: "column",
                        gap: 2,
                        mt: 1,
                      }}
                    >
                      <TextField
                        label="6-Digit OTP Code"
                        placeholder="XXXXXX"
                        fullWidth
                        size="small"
                        value={otpCode}
                        onChange={(e) => setOtpCode(e.target.value)}
                      />
                      <Button
                        variant="contained"
                        onClick={handleVerifyOtp}
                        disabled={isVerifyingOtp || otpCode.length !== 6}
                        sx={{
                          textTransform: "none",
                          py: 1.2,
                          fontWeight: 700,
                          borderRadius: "8px",
                        }}
                      >
                        {isVerifyingOtp ? (
                          <CircularProgress size={18} color="inherit" />
                        ) : (
                          "Verify Code"
                        )}
                      </Button>
                    </Box>
                  )}
                </Box>
              </Box>
            )}

            {step === 3 && (
              <Box sx={{ textAlign: "center", py: 1 }}>
                <CheckCircleIcon
                  sx={{ fontSize: 56, color: "success.main", mb: 1.5 }}
                />
                <Typography variant="body1" sx={{ fontWeight: 800, mb: 1 }}>
                  Verification Complete!
                </Typography>
                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{ display: "block", mb: 4, px: 2, lineHeight: 1.4 }}
                >
                  Password configured and phone number verified successfully.
                  Click below to activate your profile.
                </Typography>

                <Button
                  variant="contained"
                  fullWidth
                  onClick={handleCompleteSetup}
                  disabled={isSubmitting}
                  sx={{
                    textTransform: "none",
                    py: 1.2,
                    fontWeight: 700,
                    borderRadius: "8px",
                  }}
                >
                  {isSubmitting ? (
                    <CircularProgress size={20} color="inherit" />
                  ) : (
                    "Activate Profile"
                  )}
                </Button>
              </Box>
            )}
          </CardContent>
        </Card>
      </Container>
    </Box>
  );
}

RegisterStaff.getLayout = (page: React.ReactNode) => page;
