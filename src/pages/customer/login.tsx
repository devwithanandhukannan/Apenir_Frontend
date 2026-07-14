import React, { useState, useEffect } from "react";
import Head from "next/head";
import { useRouter } from "next/router";
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import Grid from "@mui/material/Grid";
import Avatar from "@mui/material/Avatar";
import Alert from "@mui/material/Alert";
import InputAdornment from "@mui/material/InputAdornment";
import CircularProgress from "@mui/material/CircularProgress";
import PhoneIcon from "@mui/icons-material/Phone";
import SendIcon from "@mui/icons-material/Send";
import KeyIcon from "@mui/icons-material/Key";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import FavoriteIcon from "@mui/icons-material/Favorite";
import toast, { Toaster } from "react-hot-toast";
import { useAppDispatch, useAppSelector } from "@/core_components/store/hooks";
import { loginSuccess } from "@/core_components/store/authSlice";
import { useCustomerService } from "@/core_components/apis/admin/customerService/useCustomerService";

export default function CustomerLoginPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { sendOtp, verifyOtp } = useCustomerService();
  const { isAuthenticated, user, isInitialized } = useAppSelector(
    (state) => state.auth,
  );

  const [phone, setPhone] = useState("");
  const [otpCode, setOtpCode] = useState("");
  const [step, setStep] = useState(1); // 1 = Enter Phone, 2 = Verify OTP

  const [isSending, setIsSending] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [countdown, setCountdown] = useState(0);

  // Redirect if already logged in as customer
  useEffect(() => {
    if (isInitialized && isAuthenticated && user) {
      if (user.role === "customer") {
        router.replace("/customer");
      } else {
        router.replace("/");
      }
    }
  }, [isAuthenticated, user, isInitialized, router]);

  // Countdown timer for OTP resend
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone || phone.trim().length < 10) {
      toast.error("Please enter a valid phone number.");
      return;
    }

    setIsSending(true);
    // Standardize phone format if needed
    let formattedPhone = phone.trim();
    if (!formattedPhone.startsWith("+")) {
      // Assuming Indian local numbers by default if length is 10, prepending +91
      if (formattedPhone.length === 10) {
        formattedPhone = "+91" + formattedPhone;
      }
    }

    await sendOtp(formattedPhone, {
      onSuccess: () => {
        setIsSending(false);
        setStep(2);
        setCountdown(60);
        toast.success("Login PIN sent to your WhatsApp successfully!");
      },
      onError: (err: any) => {
        setIsSending(false);
        toast.error(
          err.response?.data?.message ||
            err.message ||
            "Failed to dispatch OTP. Please check the number format.",
        );
      },
    });
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otpCode || otpCode.trim().length !== 6) {
      toast.error("Please enter the 6-digit OTP code.");
      return;
    }

    setIsVerifying(true);
    let formattedPhone = phone.trim();
    if (!formattedPhone.startsWith("+") && formattedPhone.length === 10) {
      formattedPhone = "+91" + formattedPhone;
    }

    await verifyOtp(formattedPhone, otpCode.trim(), {
      onSuccess: (res: any) => {
        setIsVerifying(false);
        if (res.success && res.data) {
          const { accessToken, phone: userPhone } = res.data;

          if (typeof window !== "undefined") {
            localStorage.setItem("token", accessToken);
            localStorage.setItem("auth_token", accessToken);
          }

          const customerUser = {
            id: `cust_${userPhone}`,
            name: "Patient",
            email: "",
            role: "customer" as const,
          };

          dispatch(loginSuccess({ user: customerUser, token: accessToken }));
          toast.success("Welcome back! Access granted.");
        } else {
          toast.error(res.message || "Verification failed.");
        }
      },
      onError: (err: any) => {
        setIsVerifying(false);
        toast.error(
          err.response?.data?.message ||
            err.message ||
            "Invalid or expired OTP pin.",
        );
      },
    });
  };

  const handleBackToPhone = () => {
    setStep(1);
    setOtpCode("");
  };

  return (
    <>
      <Head>
        <title>Patient Portal Login – Appenir</title>
        <meta
          name="description"
          content="Access your patient account, book new slots, and download medical reports securely using WhatsApp OTP."
        />
      </Head>

      <Box
        sx={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          bgcolor: "background.default",
          py: 4,
          px: 2,
        }}
      >
        <Card
          sx={{
            maxWidth: 440,
            width: "100%",
            borderRadius: "20px",
            boxShadow: "0 12px 40px rgba(0,0,0,0.06)",
            border: "1px solid",
            borderColor: "divider",
            overflow: "hidden",
          }}
        >
          {/* Accent Header */}
          <Box
            sx={{
              background: "linear-gradient(135deg, #0f172a 0%, #1e293b 100%)",
              color: "#fff",
              py: 3,
              px: 3,
              display: "flex",
              alignItems: "center",
              gap: 2,
            }}
          >
            <Avatar sx={{ bgcolor: "#059669" }}>
              <FavoriteIcon sx={{ color: "#fff" }} />
            </Avatar>
            <Box>
              <Typography
                variant="h6"
                sx={{
                  fontWeight: 800,
                  letterSpacing: "-0.5px",
                  lineHeight: 1.2,
                }}
              >
                Appenir Health
              </Typography>
              <Typography
                variant="caption"
                sx={{ color: "rgba(255,255,255,0.7)" }}
              >
                Patient Portal Access
              </Typography>
            </Box>
          </Box>

          <CardContent sx={{ p: 4 }}>
            {step === 1 ? (
              <form onSubmit={handleSendOtp}>
                <Typography
                  variant="h5"
                  sx={{ fontWeight: 800, mb: 1, letterSpacing: "-0.5px" }}
                >
                  Welcome Patient
                </Typography>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ mb: 4 }}
                >
                  Enter your phone number to receive a secure login PIN directly
                  on your WhatsApp.
                </Typography>

                <TextField
                  label="Phone Number"
                  placeholder="e.g. 9876543210"
                  variant="outlined"
                  fullWidth
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  disabled={isSending}
                  slotProps={{
                    input: {
                      startAdornment: (
                        <InputAdornment position="start">
                          <PhoneIcon fontSize="small" color="action" />
                        </InputAdornment>
                      ),
                    },
                  }}
                  sx={{ mb: 3 }}
                />

                <Button
                  type="submit"
                  variant="contained"
                  fullWidth
                  disabled={isSending}
                  sx={{
                    py: 1.5,
                    fontWeight: 700,
                    bgcolor: "#059669",
                    "&:hover": { bgcolor: "#047857" },
                  }}
                  endIcon={
                    isSending ? (
                      <CircularProgress size={16} color="inherit" />
                    ) : (
                      <SendIcon />
                    )
                  }
                >
                  Send OTP to WhatsApp
                </Button>

                <Button
                  variant="text"
                  fullWidth
                  onClick={() => router.push("/")}
                  startIcon={<ArrowBackIcon />}
                  sx={{ mt: 2, color: "text.secondary", fontWeight: 600 }}
                >
                  Back to Gateway
                </Button>
              </form>
            ) : (
              <form onSubmit={handleVerifyOtp}>
                <Typography
                  variant="h5"
                  sx={{ fontWeight: 800, mb: 1, letterSpacing: "-0.5px" }}
                >
                  Verification Code
                </Typography>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ mb: 4 }}
                >
                  A 6-digit OTP code has been dispatched to{" "}
                  <strong>{phone}</strong> via WhatsApp.
                </Typography>

                <TextField
                  label="Enter 6-Digit PIN"
                  placeholder="123456"
                  variant="outlined"
                  fullWidth
                  required
                  autoFocus
                  value={otpCode}
                  onChange={(e) => setOtpCode(e.target.value)}
                  disabled={isVerifying}
                  slotProps={{
                    input: {
                      startAdornment: (
                        <InputAdornment position="start">
                          <KeyIcon fontSize="small" color="action" />
                        </InputAdornment>
                      ),
                    },
                  }}
                  sx={{
                    mb: 3,
                    "& input": {
                      letterSpacing: otpCode.length > 0 ? "8px" : "normal",
                      fontSize: "18px",
                      fontWeight: 700,
                    },
                  }}
                />

                <Button
                  type="submit"
                  variant="contained"
                  fullWidth
                  disabled={isVerifying}
                  sx={{
                    py: 1.5,
                    fontWeight: 700,
                    bgcolor: "#059669",
                    "&:hover": { bgcolor: "#047857" },
                  }}
                  endIcon={
                    isVerifying ? (
                      <CircularProgress size={16} color="inherit" />
                    ) : null
                  }
                >
                  Verify & Access Portal
                </Button>

                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    mt: 3,
                  }}
                >
                  <Button
                    variant="text"
                    size="small"
                    onClick={handleBackToPhone}
                    startIcon={<ArrowBackIcon />}
                    sx={{ color: "text.secondary", fontWeight: 600 }}
                  >
                    Change Number
                  </Button>

                  <Button
                    variant="text"
                    size="small"
                    disabled={countdown > 0 || isSending}
                    onClick={handleSendOtp}
                    sx={{ fontWeight: 600 }}
                  >
                    {countdown > 0 ? `Resend in ${countdown}s` : "Resend OTP"}
                  </Button>
                </Box>
              </form>
            )}
          </CardContent>
        </Card>
      </Box>
    </>
  );
}

// Override default app layout to hide sidebar and main headers
CustomerLoginPage.getLayout = (page: React.ReactNode) => page;
