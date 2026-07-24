import React, { useState } from "react";
import Head from "next/head";
import { useRouter } from "next/router";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Grid from "@mui/material/Grid";
import Chip from "@mui/material/Chip";
import Container from "@mui/material/Container";
import TextField from "@mui/material/TextField";
import InputAdornment from "@mui/material/InputAdornment";
import Accordion from "@mui/material/Accordion";
import AccordionSummary from "@mui/material/AccordionSummary";
import AccordionDetails from "@mui/material/AccordionDetails";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import MenuItem from "@mui/material/MenuItem";
import Select from "@mui/material/Select";
import Divider from "@mui/material/Divider";
import SearchIcon from "@mui/icons-material/Search";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import WhatsAppIcon from "@mui/icons-material/WhatsApp";
import PersonIcon from "@mui/icons-material/Person";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ScienceIcon from "@mui/icons-material/Science";
import TimerIcon from "@mui/icons-material/Timer";
import StarIcon from "@mui/icons-material/Star";
import VerifiedUserIcon from "@mui/icons-material/VerifiedUser";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import LocalHospitalIcon from "@mui/icons-material/LocalHospital";
import ShieldIcon from "@mui/icons-material/Shield";
import AddShoppingCartIcon from "@mui/icons-material/AddShoppingCart";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";

export default function Home() {
  const router = useRouter();
  const [selectedCity, setSelectedCity] = useState("Bangalore");
  const [searchQuery, setSearchQuery] = useState("");

  const packages = [
    {
      id: "pkg-1",
      title: "Full Body Checkup - Essential",
      tag: "Best Seller",
      badge: "Tax Saver Essential",
      originalPrice: 5243,
      price: 1599,
      discount: "70% OFF",
      testsCount: 91,
      reportTime: "6 hours",
      fasting: "No Fasting Required",
      sample: "Blood & Urine Sample",
      popularFor: "Overall health & disease screening",
    },
    {
      id: "pkg-2",
      title: "Full Body Checkup - Comprehensive",
      tag: "Recommended",
      badge: "Full Body + Vitamin D/B12",
      originalPrice: 7999,
      price: 3499,
      discount: "56% OFF",
      testsCount: 104,
      reportTime: "6 hours",
      fasting: "10-12 Hrs Fasting",
      sample: "Blood & Urine Sample",
      popularFor: "Complete organ & metabolic assessment",
    },
    {
      id: "pkg-3",
      title: "Diabetes Care Checkup - Advanced",
      tag: "Specialized",
      badge: "HbA1c + Lipid + Kidney",
      originalPrice: 3200,
      price: 1599,
      discount: "50% OFF",
      testsCount: 45,
      reportTime: "6 hours",
      fasting: "8-10 Hrs Fasting",
      sample: "Blood & Urine Sample",
      popularFor: "Diabetic monitoring & organ safety",
    },
    {
      id: "pkg-4",
      title: "Senior Citizen Health Checkup",
      tag: "Comprehensive",
      badge: "Cardiac + Bone + Liver",
      originalPrice: 8500,
      price: 4299,
      discount: "49% OFF",
      testsCount: 98,
      reportTime: "6 hours",
      fasting: "10-12 Hrs Fasting",
      sample: "Blood & Urine Sample",
      popularFor: "Elderly health screening & vital tracking",
    },
  ];

  const popularTests = [
    { name: "Complete Blood Count (CBC)", price: 480, category: "Blood Test" },
    { name: "Liver Function Test (LFT)", price: 950, category: "Organ Check" },
    {
      name: "Glycosylated Hemoglobin (HbA1c)",
      price: 490,
      category: "Diabetes",
    },
    { name: "Lipid Profile Test", price: 550, category: "Heart Care" },
    {
      name: "Thyroid Function Test (T3, T4, TSH)",
      price: 500,
      category: "Hormone",
    },
    { name: "Vitamin D3 (25-Hydroxy)", price: 1200, category: "Vitamins" },
    { name: "Vitamin B12 Cyanocobalamin", price: 990, category: "Vitamins" },
    { name: "Kidney Function Test (KFT)", price: 890, category: "Organ Check" },
  ];

  const faqs = [
    {
      q: "Why should you choose Apenir Health over other pathology labs?",
      a: "Apenir Health offers 60-minute doorstep sample collection by certified eMedics, 100% automated processing in NABL-certified laboratories, and digital reports delivered directly via WhatsApp within 6 hours.",
    },
    {
      q: "How does home collection within 60 minutes work?",
      a: "Once you book a test or package, our nearest trained phlebotomist (eMedic) is dispatched to your doorstep within 60 minutes or at your preferred slot. Your samples are securely sealed in temperature-monitored smart kits.",
    },
    {
      q: "How are reports delivered?",
      a: "Your pathology reports are reviewed by senior pathologists and sent directly as interactive PDF documents via WhatsApp and SMS within 6 hours. You can also download reports anytime from your Apenir account.",
    },
    {
      q: "What payment modes are supported?",
      a: "We accept all major payment options including UPI (Google Pay, PhonePe, Paytm), Credit/Debit Cards via Razorpay, Net Banking, and Cash on Collection.",
    },
    {
      q: "Can I cancel or reschedule my booking?",
      a: "Yes, you can easily reschedule or cancel your home sample collection slot through the WhatsApp booking link or by contacting customer support.",
    },
  ];

  return (
    <>
      <Head>
        <title>
          Apenir Health | Book Lab Tests & Full Body Checkups at Home
        </title>
        <meta
          name="description"
          content="Book 100% accurate lab tests and full body checkups at home. Sample collection in 60 minutes, reports delivered in 6 hours via WhatsApp."
        />
      </Head>

      <Box sx={{ bgcolor: "#0f172a", color: "#f8fafc", minHeight: "100vh" }}>
        {/* Top Offer Bar */}
        <Box
          sx={{
            bgcolor: "#065f46",
            color: "#ecfdf5",
            py: 0.75,
            px: 2,
            textAlign: "center",
            fontSize: "0.875rem",
            fontWeight: 600,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 1,
          }}
        >
          <Chip
            label="OFFER"
            size="small"
            sx={{
              bgcolor: "#047857",
              color: "#fff",
              fontWeight: 700,
              height: 20,
            }}
          />
          Save Tax with full body checkups starting at <strong>₹1,099</strong>.
          Free Home Collection in 60 Mins!
        </Box>

        {/* Main Header / Navigation */}
        <Box
          sx={{
            bgcolor: "#1e293b",
            borderBottom: "1px solid #334155",
            position: "sticky",
            top: 0,
            zIndex: 1100,
          }}
        >
          <Container maxWidth="lg">
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                py: 2,
                gap: 2,
              }}
            >
              {/* Logo */}
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 1.5,
                  cursor: "pointer",
                }}
                onClick={() => router.push("/")}
              >
                <Box
                  sx={{
                    width: 42,
                    height: 42,
                    borderRadius: "12px",
                    background:
                      "linear-gradient(135deg, #10b981 0%, #059669 100%)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    boxShadow: "0 4px 12px rgba(16, 185, 129, 0.3)",
                  }}
                >
                  <ScienceIcon sx={{ color: "#ffffff", fontSize: 26 }} />
                </Box>
                <div>
                  <Typography
                    variant="h6"
                    sx={{
                      fontWeight: 900,
                      letterSpacing: "-0.5px",
                      color: "#ffffff",
                      lineHeight: 1,
                    }}
                  >
                    Apenir<span style={{ color: "#10b981" }}>Health</span>
                  </Typography>
                  <Typography
                    variant="caption"
                    sx={{
                      color: "#94a3b8",
                      fontSize: "0.7rem",
                      fontWeight: 600,
                    }}
                  >
                    DIAGNOSTICS & LABS
                  </Typography>
                </div>
              </Box>

              {/* Location Picker & Search Bar */}
              <Box
                sx={{
                  display: { xs: "none", md: "flex" },
                  alignItems: "center",
                  gap: 1.5,
                  flexGrow: 1,
                  maxWidth: 550,
                  mx: 2,
                }}
              >
                {/* Location Select */}
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    bgcolor: "#0f172a",
                    border: "1px solid #334155",
                    borderRadius: "8px",
                    px: 1.5,
                    py: 0.5,
                    minWidth: 150,
                  }}
                >
                  <LocationOnIcon
                    sx={{ color: "#10b981", fontSize: 20, mr: 0.5 }}
                  />
                  <Select
                    value={selectedCity}
                    onChange={(e) => setSelectedCity(e.target.value)}
                    variant="standard"
                    disableUnderline
                    sx={{
                      color: "#f8fafc",
                      fontSize: "0.875rem",
                      fontWeight: 600,
                      "& .MuiSelect-icon": { color: "#94a3b8" },
                    }}
                  >
                    <MenuItem value="Bangalore">Bangalore</MenuItem>
                    <MenuItem value="Mumbai">Mumbai</MenuItem>
                    <MenuItem value="Delhi">Delhi NCR</MenuItem>
                    <MenuItem value="Hyderabad">Hyderabad</MenuItem>
                  </Select>
                </Box>

                {/* Search Field */}
                <TextField
                  fullWidth
                  placeholder="Search for blood tests, checkups (e.g. HbA1c, LFT, CBC)..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  size="small"
                  sx={{
                    bgcolor: "#0f172a",
                    borderRadius: "8px",
                    "& .MuiOutlinedInput-root": {
                      color: "#f8fafc",
                      fontSize: "0.875rem",
                      "& fieldset": { borderColor: "#334155" },
                      "&:hover fieldset": { borderColor: "#10b981" },
                      "&.Mui-focused fieldset": { borderColor: "#10b981" },
                    },
                  }}
                  slotProps={{
                    input: {
                      startAdornment: (
                        <InputAdornment position="start">
                          <SearchIcon sx={{ color: "#94a3b8" }} />
                        </InputAdornment>
                      ),
                    },
                  }}
                />
              </Box>

              {/* Action Buttons */}
              <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                <Button
                  variant="outlined"
                  startIcon={<WhatsAppIcon sx={{ color: "#25D366" }} />}
                  onClick={() => router.push("/customer/book")}
                  sx={{
                    borderColor: "#334155",
                    color: "#f8fafc",
                    textTransform: "none",
                    fontWeight: 600,
                    fontSize: "0.875rem",
                    borderRadius: "8px",
                    display: { xs: "none", sm: "flex" },
                    "&:hover": {
                      borderColor: "#10b981",
                      bgcolor: "rgba(16, 185, 129, 0.08)",
                    },
                  }}
                >
                  Book via WhatsApp
                </Button>

                <Button
                  variant="contained"
                  startIcon={<PersonIcon />}
                  onClick={() => router.push("/customer/login")}
                  sx={{
                    bgcolor: "#10b981",
                    color: "#0f172a",
                    fontWeight: 700,
                    textTransform: "none",
                    fontSize: "0.875rem",
                    borderRadius: "8px",
                    px: 2.5,
                    py: 0.9,
                    boxShadow: "0 4px 12px rgba(16, 185, 129, 0.25)",
                    "&:hover": { bgcolor: "#059669" },
                  }}
                >
                  Patient Login
                </Button>
              </Box>
            </Box>
          </Container>
        </Box>

        {/* Hero Banner Section */}
        <Container maxWidth="lg" sx={{ py: 5 }}>
          <Box
            sx={{
              borderRadius: "24px",
              background: "linear-gradient(135deg, #064e3b 0%, #022c22 100%)",
              border: "1px solid #047857",
              p: { xs: 3, md: 5 },
              position: "relative",
              overflow: "hidden",
              boxShadow: "0 20px 40px rgba(0,0,0,0.4)",
            }}
          >
            <Grid container spacing={4} sx={{ alignItems: "center" }}>
              <Grid size={{ xs: 12, md: 7 }}>
                <Chip
                  label="Tax Saver Checkup - Essential"
                  sx={{
                    bgcolor: "rgba(16, 185, 129, 0.2)",
                    color: "#34d399",
                    fontWeight: 700,
                    mb: 2,
                  }}
                />

                <Typography
                  variant="h3"
                  sx={{
                    fontWeight: 900,
                    color: "#ffffff",
                    letterSpacing: "-1px",
                    fontSize: { xs: "2rem", md: "2.75rem" },
                    mb: 1.5,
                    lineHeight: 1.2,
                  }}
                >
                  Full Body Checkup - Essential in {selectedCity}
                </Typography>

                <Typography
                  variant="body1"
                  sx={{ color: "#a7f3d0", mb: 3, fontSize: "1.1rem" }}
                >
                  Includes <strong>91 vital health parameters</strong> • Blood &
                  Urine testing • 6-Hour digital report
                </Typography>

                {/* Price Display */}
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "baseline",
                    gap: 2,
                    mb: 3,
                  }}
                >
                  <Typography
                    variant="h3"
                    sx={{
                      fontWeight: 900,
                      color: "#34d399",
                      fontSize: "2.5rem",
                    }}
                  >
                    ₹1,599
                  </Typography>
                  <Typography
                    variant="h6"
                    sx={{
                      color: "#6ee7b7",
                      textDecoration: "line-through",
                      opacity: 0.7,
                    }}
                  >
                    ₹5,243
                  </Typography>
                  <Chip
                    label="70% OFF"
                    sx={{
                      bgcolor: "#ef4444",
                      color: "#ffffff",
                      fontWeight: 800,
                      borderRadius: "6px",
                    }}
                  />
                </Box>

                {/* Offer Highlights */}
                <Box
                  sx={{ display: "flex", flexWrap: "wrap", gap: 1.5, mb: 4 }}
                >
                  <Box
                    sx={{
                      bgcolor: "rgba(255,255,255,0.08)",
                      border: "1px solid rgba(255,255,255,0.15)",
                      borderRadius: "8px",
                      px: 2,
                      py: 1,
                      display: "flex",
                      alignItems: "center",
                      gap: 1,
                    }}
                  >
                    <CheckCircleIcon sx={{ color: "#34d399", fontSize: 18 }} />
                    <Typography
                      variant="body2"
                      sx={{ color: "#ffffff", fontWeight: 600 }}
                    >
                      10% OFF on 1st Order
                    </Typography>
                  </Box>
                  <Box
                    sx={{
                      bgcolor: "rgba(255,255,255,0.08)",
                      border: "1px solid rgba(255,255,255,0.15)",
                      borderRadius: "8px",
                      px: 2,
                      py: 1,
                      display: "flex",
                      alignItems: "center",
                      gap: 1,
                    }}
                  >
                    <CheckCircleIcon sx={{ color: "#34d399", fontSize: 18 }} />
                    <Typography
                      variant="body2"
                      sx={{ color: "#ffffff", fontWeight: 600 }}
                    >
                      Add Family Member & Get Extra Discount
                    </Typography>
                  </Box>
                </Box>

                {/* Call to Action */}
                <Box sx={{ display: "flex", flexWrap: "wrap", gap: 2 }}>
                  <Button
                    variant="contained"
                    size="large"
                    startIcon={<AddShoppingCartIcon />}
                    onClick={() => router.push("/customer/book")}
                    sx={{
                      bgcolor: "#10b981",
                      color: "#0f172a",
                      fontWeight: 800,
                      px: 4,
                      py: 1.5,
                      borderRadius: "10px",
                      fontSize: "1rem",
                      textTransform: "none",
                      boxShadow: "0 6px 20px rgba(16, 185, 129, 0.4)",
                      "&:hover": { bgcolor: "#059669" },
                    }}
                  >
                    Book Checkup Now
                  </Button>
                  <Button
                    variant="outlined"
                    size="large"
                    startIcon={<WhatsAppIcon sx={{ color: "#25D366" }} />}
                    onClick={() => router.push("/customer/book")}
                    sx={{
                      borderColor: "#34d399",
                      color: "#ffffff",
                      fontWeight: 700,
                      px: 3,
                      py: 1.5,
                      borderRadius: "10px",
                      fontSize: "1rem",
                      textTransform: "none",
                      "&:hover": {
                        borderColor: "#10b981",
                        bgcolor: "rgba(16, 185, 129, 0.1)",
                      },
                    }}
                  >
                    Book via WhatsApp
                  </Button>
                </Box>
              </Grid>

              {/* Right Side Visual Highlight */}
              <Grid size={{ xs: 12, md: 5 }}>
                <Box
                  sx={{
                    bgcolor: "rgba(15, 23, 42, 0.6)",
                    backdropFilter: "blur(12px)",
                    border: "1px solid rgba(255, 255, 255, 0.12)",
                    borderRadius: "20px",
                    p: 3,
                  }}
                >
                  <Typography
                    variant="h6"
                    sx={{ fontWeight: 800, color: "#ffffff", mb: 2 }}
                  >
                    Checkup Summary
                  </Typography>

                  <Box
                    sx={{ display: "flex", flexDirection: "column", gap: 2 }}
                  >
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        pb: 1,
                        borderBottom: "1px solid #334155",
                      }}
                    >
                      <Typography variant="body2" sx={{ color: "#94a3b8" }}>
                        Reports Delivered Within
                      </Typography>
                      <Typography
                        variant="subtitle2"
                        sx={{ fontWeight: 700, color: "#34d399" }}
                      >
                        6 Hours
                      </Typography>
                    </Box>
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        pb: 1,
                        borderBottom: "1px solid #334155",
                      }}
                    >
                      <Typography variant="body2" sx={{ color: "#94a3b8" }}>
                        Tests Included
                      </Typography>
                      <Typography
                        variant="subtitle2"
                        sx={{ fontWeight: 700, color: "#ffffff" }}
                      >
                        91 Parameters
                      </Typography>
                    </Box>
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        pb: 1,
                        borderBottom: "1px solid #334155",
                      }}
                    >
                      <Typography variant="body2" sx={{ color: "#94a3b8" }}>
                        Sample Collection
                      </Typography>
                      <Typography
                        variant="subtitle2"
                        sx={{ fontWeight: 700, color: "#ffffff" }}
                      >
                        Blood & Urine Sample
                      </Typography>
                    </Box>
                    <Box
                      sx={{ display: "flex", justifyContent: "space-between" }}
                    >
                      <Typography variant="body2" sx={{ color: "#94a3b8" }}>
                        Fasting Requirement
                      </Typography>
                      <Typography
                        variant="subtitle2"
                        sx={{ fontWeight: 700, color: "#fbbf24" }}
                      >
                        No Fasting Required
                      </Typography>
                    </Box>
                  </Box>

                  <Divider sx={{ my: 2.5, borderColor: "#334155" }} />

                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <StarIcon sx={{ color: "#f59e0b" }} />
                    <Typography
                      variant="subtitle2"
                      sx={{ fontWeight: 700, color: "#ffffff" }}
                    >
                      4.9 / 5.0 (50,000+ Verified Patient Reviews)
                    </Typography>
                  </Box>
                </Box>
              </Grid>
            </Grid>
          </Box>
        </Container>

        {/* Key Trust Metrics Strip */}
        <Container maxWidth="lg" sx={{ mb: 6 }}>
          <Grid container spacing={2}>
            <Grid size={{ xs: 6, md: 3 }}>
              <Box
                sx={{
                  bgcolor: "#1e293b",
                  border: "1px solid #334155",
                  borderRadius: "16px",
                  p: 2.5,
                  textAlign: "center",
                }}
              >
                <TimerIcon sx={{ color: "#10b981", fontSize: 36, mb: 1 }} />
                <Typography
                  variant="h5"
                  sx={{ fontWeight: 900, color: "#ffffff" }}
                >
                  60 Mins
                </Typography>
                <Typography
                  variant="caption"
                  sx={{ color: "#94a3b8", fontWeight: 600 }}
                >
                  Home Sample Collection
                </Typography>
              </Box>
            </Grid>
            <Grid size={{ xs: 6, md: 3 }}>
              <Box
                sx={{
                  bgcolor: "#1e293b",
                  border: "1px solid #334155",
                  borderRadius: "16px",
                  p: 2.5,
                  textAlign: "center",
                }}
              >
                <VerifiedUserIcon
                  sx={{ color: "#10b981", fontSize: 36, mb: 1 }}
                />
                <Typography
                  variant="h5"
                  sx={{ fontWeight: 900, color: "#ffffff" }}
                >
                  1M+
                </Typography>
                <Typography
                  variant="caption"
                  sx={{ color: "#94a3b8", fontWeight: 600 }}
                >
                  Happy Customers Tested
                </Typography>
              </Box>
            </Grid>
            <Grid size={{ xs: 6, md: 3 }}>
              <Box
                sx={{
                  bgcolor: "#1e293b",
                  border: "1px solid #334155",
                  borderRadius: "16px",
                  p: 2.5,
                  textAlign: "center",
                }}
              >
                <StarIcon sx={{ color: "#f59e0b", fontSize: 36, mb: 1 }} />
                <Typography
                  variant="h5"
                  sx={{ fontWeight: 900, color: "#ffffff" }}
                >
                  4.9 ★
                </Typography>
                <Typography
                  variant="caption"
                  sx={{ color: "#94a3b8", fontWeight: 600 }}
                >
                  Google Rating
                </Typography>
              </Box>
            </Grid>
            <Grid size={{ xs: 6, md: 3 }}>
              <Box
                sx={{
                  bgcolor: "#1e293b",
                  border: "1px solid #334155",
                  borderRadius: "16px",
                  p: 2.5,
                  textAlign: "center",
                }}
              >
                <ShieldIcon sx={{ color: "#10b981", fontSize: 36, mb: 1 }} />
                <Typography
                  variant="h5"
                  sx={{ fontWeight: 900, color: "#ffffff" }}
                >
                  100% NABL
                </Typography>
                <Typography
                  variant="caption"
                  sx={{ color: "#94a3b8", fontWeight: 600 }}
                >
                  Certified Partner Labs
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </Container>

        {/* Featured Diagnostic Packages Section */}
        <Container maxWidth="lg" sx={{ mb: 8 }}>
          <Box
            sx={{
              mb: 4,
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-end",
            }}
          >
            <div>
              <Typography
                variant="h4"
                sx={{
                  fontWeight: 900,
                  color: "#ffffff",
                  letterSpacing: "-0.5px",
                }}
              >
                Popular Health Checkup Packages
              </Typography>
              <Typography variant="body2" sx={{ color: "#94a3b8", mt: 0.5 }}>
                Curated preventive health checkups processed in certified
                pathology laboratories.
              </Typography>
            </div>
            <Button
              variant="text"
              endIcon={<ArrowForwardIcon />}
              onClick={() => router.push("/customer/book")}
              sx={{ color: "#10b981", fontWeight: 700, textTransform: "none" }}
            >
              View All Packages
            </Button>
          </Box>

          <Grid container spacing={3}>
            {packages.map((pkg) => (
              <Grid size={{ xs: 12, sm: 6, md: 3 }} key={pkg.id}>
                <Card
                  sx={{
                    bgcolor: "#1e293b",
                    border: "1px solid #334155",
                    borderRadius: "16px",
                    height: "100%",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-between",
                    transition: "transform 0.2s, border-color 0.2s",
                    "&:hover": {
                      transform: "translateY(-4px)",
                      borderColor: "#10b981",
                    },
                  }}
                >
                  <CardContent sx={{ p: 3 }}>
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        mb: 1.5,
                      }}
                    >
                      <Chip
                        label={pkg.tag}
                        size="small"
                        sx={{
                          bgcolor: "#065f46",
                          color: "#a7f3d0",
                          fontWeight: 700,
                        }}
                      />
                      <Chip
                        label={pkg.discount}
                        size="small"
                        sx={{
                          bgcolor: "#ef4444",
                          color: "#fff",
                          fontWeight: 800,
                        }}
                      />
                    </Box>

                    <Typography
                      variant="h6"
                      sx={{
                        fontWeight: 800,
                        color: "#ffffff",
                        mb: 1,
                        lineHeight: 1.3,
                      }}
                    >
                      {pkg.title}
                    </Typography>

                    <Typography
                      variant="caption"
                      sx={{ color: "#94a3b8", display: "block", mb: 2 }}
                    >
                      {pkg.badge}
                    </Typography>

                    <Box
                      sx={{
                        bgcolor: "#0f172a",
                        p: 1.5,
                        borderRadius: "10px",
                        mb: 2,
                      }}
                    >
                      <Typography
                        variant="body2"
                        sx={{ color: "#10b981", fontWeight: 700 }}
                      >
                        {pkg.testsCount} Parameters Included
                      </Typography>
                      <Typography variant="caption" sx={{ color: "#94a3b8" }}>
                        • {pkg.fasting} • {pkg.reportTime} report
                      </Typography>
                    </Box>

                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "baseline",
                        gap: 1,
                        mb: 2,
                      }}
                    >
                      <Typography
                        variant="h5"
                        sx={{ fontWeight: 900, color: "#ffffff" }}
                      >
                        ₹{pkg.price}
                      </Typography>
                      <Typography
                        variant="body2"
                        sx={{
                          color: "#64748b",
                          textDecoration: "line-through",
                        }}
                      >
                        ₹{pkg.originalPrice}
                      </Typography>
                    </Box>
                  </CardContent>

                  <Box sx={{ p: 2, pt: 0 }}>
                    <Button
                      fullWidth
                      variant="contained"
                      onClick={() => router.push("/customer/book")}
                      sx={{
                        bgcolor: "#10b981",
                        color: "#0f172a",
                        fontWeight: 800,
                        borderRadius: "8px",
                        textTransform: "none",
                        "&:hover": { bgcolor: "#059669" },
                      }}
                    >
                      Book Checkup
                    </Button>
                  </Box>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Container>

        {/* Popular Individual Blood Tests */}
        <Container maxWidth="lg" sx={{ mb: 8 }}>
          <Box
            sx={{
              bgcolor: "#1e293b",
              border: "1px solid #334155",
              borderRadius: "24px",
              p: 4,
            }}
          >
            <Typography
              variant="h5"
              sx={{ fontWeight: 900, color: "#ffffff", mb: 1 }}
            >
              Popular Blood Tests & Diagnostics
            </Typography>
            <Typography variant="body2" sx={{ color: "#94a3b8", mb: 3 }}>
              Select individual blood tests for quick doorstep sample
              collection.
            </Typography>

            <Grid container spacing={2}>
              {popularTests.map((test, idx) => (
                <Grid size={{ xs: 12, sm: 6, md: 3 }} key={idx}>
                  <Box
                    sx={{
                      bgcolor: "#0f172a",
                      border: "1px solid #334155",
                      borderRadius: "12px",
                      p: 2,
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <div>
                      <Typography
                        variant="subtitle2"
                        sx={{ fontWeight: 700, color: "#ffffff" }}
                      >
                        {test.name}
                      </Typography>
                      <Typography
                        variant="caption"
                        sx={{ color: "#10b981", fontWeight: 600 }}
                      >
                        ₹{test.price}
                      </Typography>
                    </div>
                    <Button
                      size="small"
                      variant="outlined"
                      onClick={() => router.push("/customer/book")}
                      sx={{
                        borderColor: "#10b981",
                        color: "#10b981",
                        textTransform: "none",
                        fontWeight: 700,
                      }}
                    >
                      Add
                    </Button>
                  </Box>
                </Grid>
              ))}
            </Grid>
          </Box>
        </Container>

        {/* The Apenir Experience / Value Props */}
        <Container maxWidth="lg" sx={{ mb: 8 }}>
          <Box sx={{ textAlign: "center", mb: 5 }}>
            <Typography variant="h4" sx={{ fontWeight: 900, color: "#ffffff" }}>
              The Apenir Health Experience
            </Typography>
            <Typography
              variant="body1"
              sx={{ color: "#94a3b8", maxWidth: 600, mx: "auto", mt: 1 }}
            >
              Designed for maximum convenience, safety, and rapid pathology
              reporting.
            </Typography>
          </Box>

          <Grid container spacing={4}>
            <Grid size={{ xs: 12, md: 4 }}>
              <Box
                sx={{
                  bgcolor: "#1e293b",
                  border: "1px solid #334155",
                  borderRadius: "20px",
                  p: 4,
                  height: "100%",
                }}
              >
                <TimerIcon sx={{ color: "#10b981", fontSize: 44, mb: 2 }} />
                <Typography
                  variant="h6"
                  sx={{ fontWeight: 800, color: "#ffffff", mb: 1 }}
                >
                  60-Minute Home Collection
                </Typography>
                <Typography
                  variant="body2"
                  sx={{ color: "#94a3b8", lineHeight: 1.6 }}
                >
                  Our vaccinated, background-verified phlebotomists reach your
                  doorstep within 60 minutes of booking confirmation.
                </Typography>
              </Box>
            </Grid>
            <Grid size={{ xs: 12, md: 4 }}>
              <Box
                sx={{
                  bgcolor: "#1e293b",
                  border: "1px solid #334155",
                  borderRadius: "20px",
                  p: 4,
                  height: "100%",
                }}
              >
                <LocalHospitalIcon
                  sx={{ color: "#10b981", fontSize: 44, mb: 2 }}
                />
                <Typography
                  variant="h6"
                  sx={{ fontWeight: 800, color: "#ffffff", mb: 1 }}
                >
                  Painless Sample Collection
                </Typography>
                <Typography
                  variant="body2"
                  sx={{ color: "#94a3b8", lineHeight: 1.6 }}
                >
                  Using smart vacutainer needle tech, 98% of our customers
                  report zero pain during blood sample collection.
                </Typography>
              </Box>
            </Grid>
            <Grid size={{ xs: 12, md: 4 }}>
              <Box
                sx={{
                  bgcolor: "#1e293b",
                  border: "1px solid #334155",
                  borderRadius: "20px",
                  p: 4,
                  height: "100%",
                }}
              >
                <WhatsAppIcon sx={{ color: "#25D366", fontSize: 44, mb: 2 }} />
                <Typography
                  variant="h6"
                  sx={{ fontWeight: 800, color: "#ffffff", mb: 1 }}
                >
                  6-Hour WhatsApp Reports
                </Typography>
                <Typography
                  variant="body2"
                  sx={{ color: "#94a3b8", lineHeight: 1.6 }}
                >
                  Certified pathology PDF reports are delivered straight to your
                  WhatsApp and registered email within 6 hours.
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </Container>

        {/* Frequently Asked Questions (FAQs) */}
        <Container maxWidth="lg" sx={{ mb: 8 }}>
          <Box sx={{ maxWidth: 800, mx: "auto" }}>
            <Typography
              variant="h4"
              sx={{
                fontWeight: 900,
                color: "#ffffff",
                mb: 4,
                textAlign: "center",
              }}
            >
              Frequently Asked Questions
            </Typography>

            {faqs.map((faq, idx) => (
              <Accordion
                key={idx}
                sx={{
                  bgcolor: "#1e293b",
                  color: "#ffffff",
                  border: "1px solid #334155",
                  borderRadius: "12px !important",
                  mb: 2,
                  "&:before": { display: "none" },
                }}
              >
                <AccordionSummary
                  expandIcon={<ExpandMoreIcon sx={{ color: "#10b981" }} />}
                >
                  <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                    {faq.q}
                  </Typography>
                </AccordionSummary>
                <AccordionDetails
                  sx={{ borderTop: "1px solid #334155", color: "#94a3b8" }}
                >
                  <Typography variant="body2" sx={{ lineHeight: 1.7 }}>
                    {faq.a}
                  </Typography>
                </AccordionDetails>
              </Accordion>
            ))}
          </Box>
        </Container>

        {/* Diagnostic Footer */}
        <Box
          sx={{
            bgcolor: "#0f172a",
            borderTop: "1px solid #334155",
            pt: 6,
            pb: 4,
          }}
        >
          <Container maxWidth="lg">
            <Grid container spacing={4} sx={{ mb: 4 }}>
              <Grid size={{ xs: 12, md: 4 }}>
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 1.5,
                    mb: 2,
                  }}
                >
                  <Box
                    sx={{
                      width: 36,
                      height: 36,
                      borderRadius: "10px",
                      bgcolor: "#10b981",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <ScienceIcon sx={{ color: "#0f172a", fontSize: 22 }} />
                  </Box>
                  <Typography
                    variant="h6"
                    sx={{ fontWeight: 900, color: "#ffffff" }}
                  >
                    Apenir Health
                  </Typography>
                </Box>
                <Typography
                  variant="body2"
                  sx={{ color: "#94a3b8", lineHeight: 1.7, pr: 2 }}
                >
                  Apenir Health is a leading pathology & home diagnostic service
                  provider. Delivering 100% NABL-compliant test results with
                  60-minute doorstep sample collection.
                </Typography>
              </Grid>

              <Grid size={{ xs: 6, md: 2 }}>
                <Typography
                  variant="subtitle2"
                  sx={{ fontWeight: 800, color: "#ffffff", mb: 2 }}
                >
                  Popular Tests
                </Typography>
                <Typography variant="body2" sx={{ color: "#94a3b8", mb: 1 }}>
                  HbA1c Diabetes
                </Typography>
                <Typography variant="body2" sx={{ color: "#94a3b8", mb: 1 }}>
                  Lipid Profile
                </Typography>
                <Typography variant="body2" sx={{ color: "#94a3b8", mb: 1 }}>
                  Liver Test (LFT)
                </Typography>
                <Typography variant="body2" sx={{ color: "#94a3b8", mb: 1 }}>
                  Thyroid Profile
                </Typography>
              </Grid>

              <Grid size={{ xs: 6, md: 2 }}>
                <Typography
                  variant="subtitle2"
                  sx={{ fontWeight: 800, color: "#ffffff", mb: 2 }}
                >
                  Health Checkups
                </Typography>
                <Typography variant="body2" sx={{ color: "#94a3b8", mb: 1 }}>
                  Full Body Essential
                </Typography>
                <Typography variant="body2" sx={{ color: "#94a3b8", mb: 1 }}>
                  Comprehensive Checkup
                </Typography>
                <Typography variant="body2" sx={{ color: "#94a3b8", mb: 1 }}>
                  Senior Citizen Checkup
                </Typography>
                <Typography variant="body2" sx={{ color: "#94a3b8", mb: 1 }}>
                  Diabetes Care
                </Typography>
              </Grid>

              <Grid size={{ xs: 12, md: 4 }}>
                <Typography
                  variant="subtitle2"
                  sx={{ fontWeight: 800, color: "#ffffff", mb: 2 }}
                >
                  Need Assistance?
                </Typography>
                <Typography variant="body2" sx={{ color: "#94a3b8", mb: 2 }}>
                  Contact our medical support team for package recommendations
                  or booking queries.
                </Typography>
                <Button
                  variant="outlined"
                  startIcon={<WhatsAppIcon sx={{ color: "#25D366" }} />}
                  onClick={() => router.push("/customer/book")}
                  sx={{
                    borderColor: "#334155",
                    color: "#ffffff",
                    textTransform: "none",
                    fontWeight: 700,
                    borderRadius: "8px",
                  }}
                >
                  Chat on WhatsApp
                </Button>
              </Grid>
            </Grid>

            <Divider sx={{ borderColor: "#334155", mb: 3 }} />

            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                flexWrap: "wrap",
                gap: 2,
              }}
            >
              <Typography variant="caption" sx={{ color: "#64748b" }}>
                © {new Date().getFullYear()} Apenir Health & Diagnostics Pvt.
                Ltd. All rights reserved.
              </Typography>
              <Typography variant="caption" sx={{ color: "#64748b" }}>
                NABL Accredited & ICMR Approved Laboratories
              </Typography>
            </Box>
          </Container>
        </Box>
      </Box>
    </>
  );
}

Home.getLayout = function getLayout(page: React.ReactNode) {
  return <>{page}</>;
};
