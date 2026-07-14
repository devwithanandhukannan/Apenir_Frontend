import React, { useEffect } from "react";
import { useRouter } from "next/router";
import { useAppSelector } from "@/core_components/store/hooks";
import CircularProgress from "@mui/material/CircularProgress";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";

const ROLE_ROUTES = [
  { prefix: "/admin", allowedRole: "admin" },
  { prefix: "/lab", allowedRole: "lab" },
  { prefix: "/customer", allowedRole: "customer" },
  { prefix: "/staff", allowedRole: "staff" },
];

export const AuthGuard: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const router = useRouter();
  const { isAuthenticated, user, isInitialized } = useAppSelector(
    (state) => state.auth,
  );

  useEffect(() => {
    // Wait until the auth state is hydrated/initialized from localStorage
    if (!isInitialized) return;

    const path = router.pathname;
    const isLoginPage = path.endsWith("/login");

    // Find if the current path requires specific role permissions
    const routeRule = isLoginPage
      ? undefined
      : ROLE_ROUTES.find((route) => path.startsWith(route.prefix));

    if (routeRule) {
      if (!isAuthenticated) {
        // User not logged in, redirect to home page
        router.replace("/");
      } else if (user && user.role !== routeRule.allowedRole) {
        // User logged in but with wrong role, redirect to home page
        router.replace("/");
      }
    }
  }, [router, isAuthenticated, user, isInitialized]);

  // Determine if we should block rendering of children and show loading
  const path = router.pathname;
  const isLoginPage = path.endsWith("/login");
  const routeRule = isLoginPage
    ? undefined
    : ROLE_ROUTES.find((route) => path.startsWith(route.prefix));

  const isCheckingAuth = !isInitialized;
  const isUnauthorized =
    routeRule &&
    (!isAuthenticated || (user && user.role !== routeRule.allowedRole));

  if (isCheckingAuth || isUnauthorized) {
    return (
      <Box
        className="flex flex-col items-center justify-center min-h-screen bg-background"
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "100vh",
          bgcolor: "background.default",
        }}
      >
        <CircularProgress color="primary" size={50} thickness={4} />
        <Typography
          variant="body1"
          color="text.secondary"
          sx={{ mt: 2, fontWeight: 500 }}
          className="text-text-secondary mt-4 font-medium"
        >
          {isCheckingAuth ? "Verifying session..." : "Redirecting to home..."}
        </Typography>
      </Box>
    );
  }

  return <>{children}</>;
};
