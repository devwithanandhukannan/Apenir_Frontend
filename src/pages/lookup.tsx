import React, { useState } from "react";
import Head from "next/head";
import { useRouter } from "next/router";
import Box from "@mui/material/Box";
import Container from "@mui/material/Container";
import Typography from "@mui/material/Typography";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Grid from "@mui/material/Grid";
import Chip from "@mui/material/Chip";
import Alert from "@mui/material/Alert";
import CircularProgress from "@mui/material/CircularProgress";
import Divider from "@mui/material/Divider";
import IconButton from "@mui/material/IconButton";
import SearchIcon from "@mui/icons-material/Search";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import GetAppIcon from "@mui/icons-material/GetApp";
import ScienceIcon from "@mui/icons-material/Science";
import HomeIcon from "@mui/icons-material/Home";
import PersonIcon from "@mui/icons-material/Person";
import PhoneIcon from "@mui/icons-material/Phone";
import BadgeIcon from "@mui/icons-material/Badge";
import AssignmentTurnedInIcon from "@mui/icons-material/AssignmentTurnedIn";
import { useApi } from "@/core_components/hooks/useApi/useApi";

interface LookupResult {
  uniqueNumber: string;
  memberName: string;
  age: number;
  gender: string;
  relationship: string;
  testName: string;
  additionalNotes?: string;
  appointmentNumber: string;
  appointmentStatus: string;
  customerName: string;
  customerPhone: string;
  address: string;
  labName: string;
  reportPdfPath?: string;
}

export default function LookupPage() {
  const router = useRouter();
  const { get } = useApi();
  const [tokenId, setTokenId] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<LookupResult | null>(null);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tokenId.trim()) return;

    setLoading(true);
    setError(null);
    setResult(null);

    const response = await get<any>({
      endpoint: `/api/appointments/lookup/${tokenId.trim().toUpperCase()}`,
      requireAuth: false, // Public lookup
    });

    setLoading(false);
    if (response.success && response.data?.success && response.data?.data) {
      setResult(response.data.data);
    } else {
      setError(
        response.data?.message ||
          response.error?.message ||
          "Invalid token ID. Please check and try again.",
      );
    }
  };

  const getStatusColor = (status: string) => {
    const s = status.toLowerCase();
    if (s.includes("completed") || s.includes("handover")) return "success";
    if (s.includes("collected") || s.includes("otpverified")) return "info";
    if (s.includes("assigned") || s.includes("coming") || s.includes("reached"))
      return "warning";
    if (s.includes("cancelled")) return "error";
    return "default";
  };

  return (
    <>
      <Head>
        <title>Collection Lookup – Appenir</title>
        <meta
          name="description"
          content="Enter your unique token ID to look up your collection status and download test reports."
        />
      </Head>

      <Box
        sx={{
          minHeight: "100vh",
          background:
            "linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #311042 100%)",
          display: "flex",
          alignItems: "center",
          py: 8,
          px: 2,
        }}
      >
        <Container maxWidth="md">
          {/* Header */}
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              mb: 4,
            }}
          >
            <Button
              startIcon={<ArrowBackIcon />}
              onClick={() => router.push("/")}
              sx={{ color: "rgba(255,255,255,0.7)", textTransform: "none" }}
            >
              Back to Home
            </Button>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <ScienceIcon sx={{ color: "#38bdf8", fontSize: 28 }} />
              <Typography
                variant="h6"
                sx={{ color: "#fff", fontWeight: 800, letterSpacing: "-0.5px" }}
              >
                Appenir<span style={{ color: "#38bdf8" }}> Diagnostics</span>
              </Typography>
            </Box>
          </Box>

          {/* Search Card */}
          <Card
            sx={{
              background: "rgba(255, 255, 255, 0.03)",
              backdropFilter: "blur(16px)",
              border: "1px solid rgba(255, 255, 255, 0.08)",
              borderRadius: "20px",
              boxShadow: "0 24px 64px rgba(0,0,0,0.3)",
              mb: 4,
              overflow: "hidden",
            }}
          >
            <CardContent sx={{ p: { xs: 3, md: 5 } }}>
              <Typography
                variant="h4"
                sx={{
                  color: "#fff",
                  fontWeight: 900,
                  textAlign: "center",
                  mb: 1.5,
                  letterSpacing: "-0.8px",
                }}
              >
                Track Your Collection
              </Typography>
              <Typography
                variant="body2"
                sx={{
                  color: "rgba(255,255,255,0.6)",
                  textAlign: "center",
                  mb: 4,
                  maxWidth: 460,
                  mx: "auto",
                }}
              >
                Enter the unique token ID generated during sample collection to
                check status, view booking details, and access reports.
              </Typography>

              <Box component="form" onSubmit={handleSearch}>
                <Grid container spacing={2}>
                  <Grid size={{ xs: 12, sm: 9 }}>
                    <TextField
                      fullWidth
                      placeholder="e.g., MEM-A1B2C3D4"
                      value={tokenId}
                      onChange={(e) => setTokenId(e.target.value)}
                      sx={{
                        "& .MuiOutlinedInput-root": {
                          color: "#fff",
                          backgroundColor: "rgba(255,255,255,0.05)",
                          borderRadius: "12px",
                          "& fieldset": {
                            borderColor: "rgba(255,255,255,0.15)",
                          },
                          "&:hover fieldset": {
                            borderColor: "#38bdf8",
                          },
                          "&.Mui-focused fieldset": {
                            borderColor: "#38bdf8",
                          },
                        },
                        "& input::placeholder": {
                          color: "rgba(255,255,255,0.4)",
                          opacity: 1,
                        },
                      }}
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 3 }}>
                    <Button
                      fullWidth
                      type="submit"
                      variant="contained"
                      disabled={loading || !tokenId.trim()}
                      startIcon={
                        loading ? (
                          <CircularProgress size={20} color="inherit" />
                        ) : (
                          <SearchIcon />
                        )
                      }
                      sx={{
                        height: "100%",
                        minHeight: 56,
                        borderRadius: "12px",
                        fontWeight: 700,
                        textTransform: "none",
                        backgroundColor: "#38bdf8",
                        color: "#0f172a",
                        "&:hover": {
                          backgroundColor: "#0ea5e9",
                        },
                      }}
                    >
                      Search
                    </Button>
                  </Grid>
                </Grid>
              </Box>

              {error && (
                <Alert
                  severity="error"
                  sx={{
                    mt: 3,
                    borderRadius: "10px",
                    bgcolor: "#2c1515",
                    color: "#f87171",
                    border: "1px solid rgba(248,113,113,0.2)",
                  }}
                >
                  {error}
                </Alert>
              )}
            </CardContent>
          </Card>

          {/* Results Area */}
          {result && (
            <Card
              sx={{
                background: "rgba(255, 255, 255, 0.04)",
                backdropFilter: "blur(20px)",
                border: "1px solid rgba(255, 255, 255, 0.12)",
                borderRadius: "20px",
                boxShadow: "0 24px 64px rgba(0,0,0,0.35)",
              }}
            >
              <CardContent sx={{ p: { xs: 3, md: 5 }, color: "#fff" }}>
                {/* Result Top Section */}
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                    flexWrap: "wrap",
                    gap: 2,
                    mb: 3,
                  }}
                >
                  <Box>
                    <Typography
                      variant="caption"
                      sx={{
                        color: "#38bdf8",
                        fontWeight: 700,
                        letterSpacing: "1.5px",
                      }}
                    >
                      TOKEN DETAILS
                    </Typography>
                    <Typography variant="h5" sx={{ fontWeight: 855, mt: 0.5 }}>
                      {result.memberName}
                    </Typography>
                    <Typography
                      variant="caption"
                      sx={{ color: "rgba(255,255,255,0.5)" }}
                    >
                      {result.age} yrs · {result.gender} · {result.relationship}
                    </Typography>
                  </Box>
                  <Box sx={{ textAlign: { sm: "right" } }}>
                    <Chip
                      label={result.appointmentStatus}
                      color={getStatusColor(result.appointmentStatus)}
                      sx={{ fontWeight: 700, px: 1 }}
                    />
                    <Typography
                      variant="caption"
                      sx={{
                        display: "block",
                        mt: 1,
                        color: "rgba(255,255,255,0.4)",
                      }}
                    >
                      ID: {result.uniqueNumber}
                    </Typography>
                  </Box>
                </Box>

                <Divider sx={{ borderColor: "rgba(255,255,255,0.1)", mb: 3 }} />

                {/* Grid Details */}
                <Grid container spacing={3}>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <Box sx={{ display: "flex", gap: 1.5 }}>
                      <ScienceIcon sx={{ color: "#38bdf8", mt: 0.2 }} />
                      <Box>
                        <Typography
                          variant="caption"
                          sx={{ color: "rgba(255,255,255,0.5)" }}
                        >
                          Test Package
                        </Typography>
                        <Typography variant="body2" sx={{ fontWeight: 700 }}>
                          {result.testName || "Routine Health Package"}
                        </Typography>
                      </Box>
                    </Box>
                  </Grid>

                  <Grid size={{ xs: 12, sm: 6 }}>
                    <Box sx={{ display: "flex", gap: 1.5 }}>
                      <AssignmentTurnedInIcon
                        sx={{ color: "#38bdf8", mt: 0.2 }}
                      />
                      <Box>
                        <Typography
                          variant="caption"
                          sx={{ color: "rgba(255,255,255,0.5)" }}
                        >
                          Booking Reference
                        </Typography>
                        <Typography variant="body2" sx={{ fontWeight: 700 }}>
                          #{result.appointmentNumber}
                        </Typography>
                      </Box>
                    </Box>
                  </Grid>

                  <Grid size={{ xs: 12, sm: 6 }}>
                    <Box sx={{ display: "flex", gap: 1.5 }}>
                      <HomeIcon sx={{ color: "#38bdf8", mt: 0.2 }} />
                      <Box>
                        <Typography
                          variant="caption"
                          sx={{ color: "rgba(255,255,255,0.5)" }}
                        >
                          Collection Address
                        </Typography>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                          {result.address}
                        </Typography>
                      </Box>
                    </Box>
                  </Grid>

                  <Grid size={{ xs: 12, sm: 6 }}>
                    <Box sx={{ display: "flex", gap: 1.5 }}>
                      <BadgeIcon sx={{ color: "#38bdf8", mt: 0.2 }} />
                      <Box>
                        <Typography
                          variant="caption"
                          sx={{ color: "rgba(255,255,255,0.5)" }}
                        >
                          Registered Lab
                        </Typography>
                        <Typography variant="body2" sx={{ fontWeight: 700 }}>
                          {result.labName}
                        </Typography>
                      </Box>
                    </Box>
                  </Grid>

                  <Grid size={{ xs: 12, sm: 6 }}>
                    <Box sx={{ display: "flex", gap: 1.5 }}>
                      <PersonIcon sx={{ color: "#38bdf8", mt: 0.2 }} />
                      <Box>
                        <Typography
                          variant="caption"
                          sx={{ color: "rgba(255,255,255,0.5)" }}
                        >
                          Primary Patient
                        </Typography>
                        <Typography variant="body2" sx={{ fontWeight: 700 }}>
                          {result.customerName}
                        </Typography>
                      </Box>
                    </Box>
                  </Grid>

                  <Grid size={{ xs: 12, sm: 6 }}>
                    <Box sx={{ display: "flex", gap: 1.5 }}>
                      <PhoneIcon sx={{ color: "#38bdf8", mt: 0.2 }} />
                      <Box>
                        <Typography
                          variant="caption"
                          sx={{ color: "rgba(255,255,255,0.5)" }}
                        >
                          Contact Phone
                        </Typography>
                        <Typography variant="body2" sx={{ fontWeight: 700 }}>
                          {result.customerPhone}
                        </Typography>
                      </Box>
                    </Box>
                  </Grid>
                </Grid>

                {result.additionalNotes && (
                  <>
                    <Divider
                      sx={{ borderColor: "rgba(255,255,255,0.1)", my: 3 }}
                    />
                    <Box>
                      <Typography
                        variant="caption"
                        sx={{ color: "rgba(255,255,255,0.5)" }}
                      >
                        Special Instructions
                      </Typography>
                      <Typography
                        variant="body2"
                        sx={{ mt: 0.5, fontStyle: "italic" }}
                      >
                        "{result.additionalNotes}"
                      </Typography>
                    </Box>
                  </>
                )}

                {/* Report Section */}
                <Divider sx={{ borderColor: "rgba(255,255,255,0.1)", my: 3 }} />
                <Box
                  sx={{
                    p: 2.5,
                    borderRadius: "14px",
                    background: result.reportPdfPath
                      ? "rgba(16,185,129,0.08)"
                      : "rgba(255,255,255,0.02)",
                    border: result.reportPdfPath
                      ? "1px solid rgba(16,185,129,0.2)"
                      : "1px solid rgba(255,255,255,0.06)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    flexWrap: "wrap",
                    gap: 2,
                  }}
                >
                  <Box>
                    <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>
                      {result.reportPdfPath
                        ? "Diagnostic Report Ready"
                        : "Report Status"}
                    </Typography>
                    <Typography
                      variant="caption"
                      sx={{ color: "rgba(255,255,255,0.5)" }}
                    >
                      {result.reportPdfPath
                        ? "Your official PDF laboratory test results are ready to download."
                        : "Your diagnostic samples are under processing. Once completed, your report will be available here."}
                    </Typography>
                  </Box>

                  {result.reportPdfPath && (
                    <Button
                      variant="contained"
                      color="success"
                      startIcon={<GetAppIcon />}
                      onClick={() =>
                        window.open(result.reportPdfPath, "_blank")
                      }
                      sx={{
                        fontWeight: 700,
                        textTransform: "none",
                        borderRadius: "10px",
                      }}
                    >
                      Download Report PDF
                    </Button>
                  )}
                </Box>
              </CardContent>
            </Card>
          )}
        </Container>
      </Box>
    </>
  );
}

// Bypass layout
LookupPage.getLayout = (page: React.ReactNode) => page;
