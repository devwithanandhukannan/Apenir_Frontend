import React from "react";
import Head from "next/head";
import { useRouter } from "next/router";
import { useAppDispatch, useAppSelector } from "@/core_components/store/hooks";
import { loginSuccess, logoutSuccess } from "@/core_components/store/authSlice";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Button from "@mui/material/Button";
import Grid from "@mui/material/Grid";
import Avatar from "@mui/material/Avatar";
import Chip from "@mui/material/Chip";
import Divider from "@mui/material/Divider";
import Alert from "@mui/material/Alert";
import AdminPanelSettingsIcon from "@mui/icons-material/AdminPanelSettings";
import ScienceIcon from "@mui/icons-material/Science";
import PersonIcon from "@mui/icons-material/Person";
import SecurityIcon from "@mui/icons-material/Security";
import KeyboardArrowRightIcon from "@mui/icons-material/KeyboardArrowRight";
import LockOpenIcon from "@mui/icons-material/LockOpen";

export default function Home() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { user, isAuthenticated } = useAppSelector((state) => state.auth);

  const simulateLogin = (role: "admin" | "lab" | "customer") => {
    const mockUser = {
      id: `usr_${role}_001`,
      name: `${role.charAt(0).toUpperCase() + role.slice(1)} Tester`,
      email: `${role}@appenir.com`,
      role,
    };
    dispatch(loginSuccess({ user: mockUser, token: "mock_jwt_token_xyz" }));
  };

  const handleLogout = () => {
    dispatch(logoutSuccess());
  };

  return (
    <>
      <Head>
        <title>Appenir.WEB - Access Portal</title>
        <meta
          name="description"
          content="Welcome to Appenir.WEB, a role-based authenticated Next.js portal. Log in to access admin, lab, and customer portals."
        />
      </Head>

      <Box sx={{ maxWidth: 900, mx: "auto", py: 4 }}>
        {/* Hero Section */}
        <Box
          sx={{
            textAlign: "center",
            mb: 5,
            py: 6,
            px: 3,
            borderRadius: "24px",
            background:
              "linear-gradient(135deg, rgba(var(--color-primary), 0.08), rgba(var(--color-secondary), 0.08))",
            border: "1px solid rgba(var(--color-primary), 0.1)",
            position: "relative",
            overflow: "hidden",
          }}
          className="text-center mb-8 py-12 px-6 rounded-3xl bg-gradient-to-br from-primary/5 to-secondary/5 border border-primary/10"
        >
          <Typography
            variant="h3"
            component="h1"
            sx={{ fontWeight: 900, mb: 1, letterSpacing: "-1.5px" }}
            color="primary"
            className="text-4xl sm:text-5xl font-black text-primary tracking-tighter"
          >
            Appenir Access Portal
          </Typography>
          <Typography
            variant="h6"
            color="text.secondary"
            sx={{ maxWidth: 600, mx: "auto", mb: 3, fontWeight: 500 }}
            className="text-lg text-text-secondary max-w-xl mx-auto font-medium"
          >
            Next.js 16 + Redux State + Role-based Authorization Guard
          </Typography>
          <div className="flex justify-center gap-2">
            <Chip
              label="React 19"
              variant="outlined"
              color="primary"
              size="small"
            />
            <Chip
              label="Next.js 16"
              variant="outlined"
              color="secondary"
              size="small"
            />
            <Chip label="Tailwind CSS v4" variant="outlined" size="small" />
            <Chip label="Material UI (MUI)" variant="outlined" size="small" />
          </div>
        </Box>

        <Grid container spacing={4}>
          {/* Simulation & Logins */}
          <Grid size={{ xs: 12, md: 6 }}>
            <Card sx={{ height: "100%" }}>
              <CardContent sx={{ p: 4 }}>
                <Typography
                  variant="h5"
                  sx={{
                    fontWeight: 700,
                    mb: 3,
                    display: "flex",
                    alignItems: "center",
                    gap: 1,
                  }}
                >
                  <LockOpenIcon color="primary" /> Login Simulator
                </Typography>

                {isAuthenticated && user ? (
                  <Box
                    sx={{
                      p: 3,
                      border: "1px solid var(--color-border)",
                      borderRadius: "12px",
                      bgcolor: "background.paper",
                      mb: 3,
                    }}
                  >
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 2,
                        mb: 2,
                      }}
                    >
                      <Avatar
                        sx={{ bgcolor: "secondary.main" }}
                        className="bg-secondary"
                      >
                        {user.name.charAt(0)}
                      </Avatar>
                      <div>
                        <Typography
                          variant="subtitle1"
                          sx={{ fontWeight: 700 }}
                        >
                          {user.name}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {user.email}
                        </Typography>
                      </div>
                    </Box>
                    <div className="flex gap-2 mb-4">
                      <Chip
                        label={`Role: ${user.role.toUpperCase()}`}
                        color={
                          user.role === "admin"
                            ? "error"
                            : user.role === "lab"
                              ? "secondary"
                              : "primary"
                        }
                        size="small"
                        sx={{ fontWeight: 600 }}
                      />
                      <Chip
                        label="Authenticated"
                        color="success"
                        size="small"
                        sx={{ fontWeight: 600 }}
                      />
                    </div>
                    <Button
                      variant="contained"
                      color="error"
                      fullWidth
                      onClick={handleLogout}
                    >
                      Sign Out
                    </Button>
                  </Box>
                ) : (
                  <Box
                    sx={{
                      display: "flex",
                      flexDirection: "column",
                      gap: 2,
                      mb: 3,
                    }}
                  >
                    <Alert severity="info" sx={{ borderRadius: "8px" }}>
                      Click a button below to simulate logging in as that user
                      role.
                    </Alert>

                    <Button
                      variant="contained"
                      color="primary"
                      onClick={() => simulateLogin("customer")}
                      startIcon={<PersonIcon />}
                      sx={{ py: 1.5, background: "#1e40af" }}
                      className="bg-blue-800"
                    >
                      Login as Customer
                    </Button>

                    <Button
                      variant="contained"
                      color="secondary"
                      onClick={() => simulateLogin("lab")}
                      startIcon={<ScienceIcon />}
                      sx={{ py: 1.5 }}
                    >
                      Login as Lab Specialist
                    </Button>

                    <Button
                      variant="contained"
                      color="error"
                      onClick={() => simulateLogin("admin")}
                      startIcon={<AdminPanelSettingsIcon />}
                      sx={{ py: 1.5 }}
                    >
                      Login as Administrator
                    </Button>
                  </Box>
                )}
              </CardContent>
            </Card>
          </Grid>

          {/* Authorization Testing */}
          <Grid size={{ xs: 12, md: 6 }}>
            <Card sx={{ height: "100%" }}>
              <CardContent sx={{ p: 4 }}>
                <Typography
                  variant="h5"
                  sx={{
                    fontWeight: 700,
                    mb: 3,
                    display: "flex",
                    alignItems: "center",
                    gap: 1,
                  }}
                >
                  <SecurityIcon color="secondary" /> Route Permissions Guard
                </Typography>

                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ mb: 3 }}
                >
                  Clicking the buttons below attempts a redirect to that page.
                  The <strong>AuthGuard</strong> intercepts requests and forces
                  unauthorized navigations back to this Home page.
                </Typography>

                <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                  <Box
                    sx={{
                      p: 2,
                      border: "1px solid var(--color-divider)",
                      borderRadius: "10px",
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <div>
                      <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                        Customer Portal
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Path: <code>/customer</code>
                      </Typography>
                    </div>
                    <Button
                      variant="outlined"
                      size="small"
                      endIcon={<KeyboardArrowRightIcon />}
                      onClick={() => router.push("/customer")}
                    >
                      Go
                    </Button>
                  </Box>

                  <Box
                    sx={{
                      p: 2,
                      border: "1px solid var(--color-divider)",
                      borderRadius: "10px",
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <div>
                      <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                        Lab Portal
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Path: <code>/lab</code>
                      </Typography>
                    </div>
                    <Button
                      variant="outlined"
                      size="small"
                      color="secondary"
                      endIcon={<KeyboardArrowRightIcon />}
                      onClick={() => router.push("/lab")}
                    >
                      Go
                    </Button>
                  </Box>

                  <Box
                    sx={{
                      p: 2,
                      border: "1px solid var(--color-divider)",
                      borderRadius: "10px",
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <div>
                      <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                        Admin Portal
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Path: <code>/admin</code>
                      </Typography>
                    </div>
                    <Button
                      variant="outlined"
                      size="small"
                      color="error"
                      endIcon={<KeyboardArrowRightIcon />}
                      onClick={() => router.push("/admin")}
                    >
                      Go
                    </Button>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>
    </>
  );
}

// Home page should use custom empty layout since it acts as the primary login page
Home.getLayout = function getLayout(page: React.ReactNode) {
  return (
    <Box
      sx={{ minHeight: "100vh", py: 6, px: 2, bgcolor: "background.default" }}
      className="min-h-screen bg-background py-12 px-4"
    >
      {page}
    </Box>
  );
};
