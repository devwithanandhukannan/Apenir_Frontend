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
    if (!otpCode || otpCode.length !== 4) {
      toast.error("Please enter a 4-digit code.");
      return;
    }
    setIsVerifyingOtp(true);
    const response = await post<any, any>({
      endpoint: "/api/auth/otp/verify-only",
      body: { phone: phone.trim(), code: otpCode.trim() },
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
          bgcolor: "background.default",
        }}
      >
        <CircularProgress color="secondary" size={48} sx={{ mb: 2 }} />
        <Typography
          variant="body1"
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
      <Container
        maxWidth="sm"
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "100vh",
        }}
      >
        <Card
          sx={{
            border: "1px solid var(--color-border)",
            borderRadius: "16px",
            p: 2,
            boxShadow: "0 8px 32px rgba(0,0,0,0.05)",
          }}
        >
          <CardContent sx={{ textAlign: "center" }}>
            <PersonIcon sx={{ fontSize: 48, color: "error.main", mb: 2 }} />
            <Typography
              variant="h5"
              sx={{ fontWeight: 800, mb: 1, letterSpacing: "-0.5px" }}
            >
              Invitation Expired
            </Typography>
            <Alert
              severity="error"
              sx={{ mb: 3, borderRadius: "8px", fontWeight: 500 }}
            >
              {errorMsg}
            </Alert>
            <Button
              variant="contained"
              color="primary"
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
    );
  }

  if (success) {
    return (
      <Container
        maxWidth="sm"
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "100vh",
        }}
      >
        <Card
          sx={{
            border: "1px solid var(--color-border)",
            borderRadius: "16px",
            p: 3,
            boxShadow: "0 8px 32px rgba(0,0,0,0.05)",
          }}
        >
          <CardContent sx={{ textAlign: "center" }}>
            <Box
              sx={{
                display: "inline-flex",
                p: 2,
                borderRadius: "50%",
                bgcolor: "rgba(16,185,129,0.08)",
                color: "secondary.main",
                mb: 2,
              }}
            >
              <CheckCircleIcon sx={{ fontSize: 48 }} />
            </Box>
            <Typography
              variant="h5"
              sx={{ fontWeight: 800, mb: 1, letterSpacing: "-0.5px" }}
            >
              Activation Complete!
            </Typography>
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ mb: 4, px: 2 }}
            >
              Your phlebotomist profile has been activated successfully. You can
              now login to your portal to access scheduled bookings.
            </Typography>
            <Button
              variant="contained"
              color="secondary"
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
    );
  }

  return (
    <Container
      maxWidth="sm"
      sx={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        minHeight: "100vh",
        py: 4,
      }}
    >
      <Toaster />

      <Box sx={{ mb: 4, textAlign: "center" }}>
        <Typography
          variant="h4"
          sx={{ fontWeight: 900, mb: 1, letterSpacing: "-1.0px" }}
        >
          Onboard Phlebotomist
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Welcome to LabCare, <strong>{staffDetails?.name}</strong> (
          {staffDetails?.email})
        </Typography>
      </Box>

      {/* Progress indicators */}
      <Box
        sx={{ display: "flex", justifyContent: "space-between", mb: 4, px: 4 }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <Box
            sx={{
              width: 24,
              height: 24,
              borderRadius: "50%",
              bgcolor: step >= 1 ? "secondary.main" : "var(--color-border)",
              color: "white",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "12px",
              fontWeight: 700,
            }}
          >
            1
          </Box>
          <Typography
            variant="body2"
            sx={{ fontWeight: step === 1 ? 700 : 500 }}
          >
            Set Password
          </Typography>
        </Box>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <Box
            sx={{
              width: 24,
              height: 24,
              borderRadius: "50%",
              bgcolor: step >= 2 ? "secondary.main" : "var(--color-border)",
              color: "white",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "12px",
              fontWeight: 700,
            }}
          >
            2
          </Box>
          <Typography
            variant="body2"
            sx={{ fontWeight: step === 2 ? 700 : 500 }}
          >
            Phone Verify
          </Typography>
        </Box>
      </Box>

      <Card
        sx={{
          border: "1px solid var(--color-border)",
          borderRadius: "16px",
          boxShadow: "0 8px 32px rgba(0,0,0,0.05)",
          overflow: "visible",
        }}
      >
        <CardContent sx={{ p: 4 }}>
          {step === 1 && (
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 800, mb: 2 }}>
                🔒 Set Your Account Password
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                Provide a secure password to register your new phlebotomist
                dashboard login.
              </Typography>

              <TextField
                label="New Password"
                type="password"
                fullWidth
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                sx={{ mb: 4 }}
              />

              <Button
                variant="contained"
                color="secondary"
                fullWidth
                disabled={password.length < 6}
                onClick={() => setStep(2)}
                endIcon={<ArrowForwardIcon />}
                sx={{
                  textTransform: "none",
                  py: 1.5,
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
              <Typography variant="h6" sx={{ fontWeight: 800, mb: 2 }}>
                📱 Phone Verification
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                Register your WhatsApp phone number to receive real-time booking
                alerts and verification OTPs.
              </Typography>

              <Box sx={{ display: "flex", gap: 1, mb: 3 }}>
                <TextField
                  label="WhatsApp Phone Number"
                  placeholder="e.g. 919876543210"
                  fullWidth
                  value={phone}
                  disabled={otpSent}
                  onChange={(e) => setPhone(e.target.value)}
                />
                {!otpSent && (
                  <Button
                    variant="outlined"
                    color="secondary"
                    onClick={handleSendOtp}
                    disabled={isSendingOtp || phone.length < 10}
                    sx={{ textTransform: "none", px: 3, fontWeight: 700 }}
                  >
                    {isSendingOtp ? <CircularProgress size={20} /> : "Send OTP"}
                  </Button>
                )}
              </Box>

              {otpSent && (
                <Box sx={{ mb: 4 }}>
                  <Typography variant="body2" sx={{ fontWeight: 600, mb: 1 }}>
                    Enter 4-Digit Verification Code
                  </Typography>
                  <Box sx={{ display: "flex", gap: 1 }}>
                    <TextField
                      label="OTP Code"
                      placeholder="XXXX"
                      fullWidth
                      value={otpCode}
                      onChange={(e) => setOtpCode(e.target.value)}
                    />
                    <Button
                      variant="contained"
                      color="secondary"
                      onClick={handleVerifyOtp}
                      disabled={isVerifyingOtp || otpCode.length !== 4}
                      sx={{ textTransform: "none", px: 3, fontWeight: 700 }}
                    >
                      {isVerifyingOtp ? (
                        <CircularProgress size={20} />
                      ) : (
                        "Verify Code"
                      )}
                    </Button>
                  </Box>
                </Box>
              )}
            </Box>
          )}

          {step === 3 && (
            <Box sx={{ textAlign: "center" }}>
              <CheckCircleIcon
                sx={{ fontSize: 64, color: "success.main", mb: 2 }}
              />
              <Typography variant="h6" sx={{ fontWeight: 800, mb: 1 }}>
                All Set!
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
                Password configured and phone number verified successfully.
                Click below to activate your profile.
              </Typography>

              <Button
                variant="contained"
                color="secondary"
                fullWidth
                onClick={handleCompleteSetup}
                disabled={isSubmitting}
                sx={{
                  textTransform: "none",
                  py: 1.5,
                  fontWeight: 700,
                  borderRadius: "8px",
                }}
              >
                {isSubmitting ? (
                  <CircularProgress size={24} />
                ) : (
                  "Activate Profile"
                )}
              </Button>
            </Box>
          )}
        </CardContent>
      </Card>
    </Container>
  );
}
