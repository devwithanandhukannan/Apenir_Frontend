import React, { useEffect, useState } from "react";
import { Provider } from "react-redux";
import { store } from "@/core_components/store";
import { useAppDispatch } from "@/core_components/store/hooks";
import { initializeAuth } from "@/core_components/store/authSlice";
import { AppThemeProvider } from "@/core_components/theme/themeProvider";
import { AuthGuard } from "@/core_components/guards/AuthGuard";
import { Toaster } from "react-hot-toast";
import { useRouter } from "next/router";
import Backdrop from "@mui/material/Backdrop";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";

interface LayoutProvidersProps {
  children: React.ReactNode;
}

// Internal wrapper to access the Redux dispatch after the Provider is initialized
const AuthInitializer: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const dispatch = useAppDispatch();

  useEffect(() => {
    dispatch(initializeAuth());
  }, [dispatch]);

  return <>{children}</>;
};

export const LayoutProviders: React.FC<LayoutProvidersProps> = ({
  children,
}) => {
  const router = useRouter();
  const [isPageLoading, setIsPageLoading] = useState(false);

  useEffect(() => {
    const handleStart = (url: string) => {
      if (url !== router.asPath) {
        setIsPageLoading(false);
      }
    };
    const handleComplete = () => setIsPageLoading(false);

    router.events.on("routeChangeStart", handleStart);
    router.events.on("routeChangeComplete", handleComplete);
    router.events.on("routeChangeError", handleComplete);

    return () => {
      router.events.off("routeChangeStart", handleStart);
      router.events.off("routeChangeComplete", handleComplete);
      router.events.off("routeChangeError", handleComplete);
    };
  }, [router]);

  return (
    <Provider store={store}>
      <AppThemeProvider>
        <AuthInitializer>
          <AuthGuard>{children}</AuthGuard>
          <Toaster position="top-right" reverseOrder={false} />
        </AuthInitializer>

        {/* Global route transition backdrop animation */}
        <Backdrop
          sx={{
            zIndex: (theme) => theme.zIndex.drawer + 9999,
            backgroundColor: (theme) =>
              theme.palette.mode === "light"
                ? "rgba(255, 255, 255, 0.95)"
                : "rgba(15, 23, 42, 0.95)",
            display: "flex",
            flexDirection: "column",
            gap: 2.5,
          }}
          open={isPageLoading}
        >
          <Box
            component="img"
            src="/illustrations/Doctor doing Lab Inspection.gif"
            alt="Loading..."
            sx={{
              width: { xs: 220, sm: 300, md: 360 },
              height: "auto",
              borderRadius: "16px",
              boxShadow: "0 8px 32px rgba(0,0,0,0.08)",
            }}
          />
          <Typography
            variant="h6"
            sx={{
              fontWeight: 800,
              color: (theme) =>
                theme.palette.mode === "light" ? "#1d4ed8" : "#60a5fa",
            }}
          >
            Analyzing diagnostics...
          </Typography>
        </Backdrop>
      </AppThemeProvider>
    </Provider>
  );
};

export default LayoutProviders;
