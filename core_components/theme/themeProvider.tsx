import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useMemo,
} from "react";
import {
  ThemeProvider as MuiThemeProvider,
  createTheme,
  StyledEngineProvider,
} from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import { lightThemeColors } from "./lightThemeOptions";
import { darkThemeColors } from "./darkThemeOptions";

type ThemeMode = "light" | "dark";

interface ThemeContextType {
  mode: ThemeMode;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const useAppTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useAppTheme must be used within an AppThemeProvider");
  }
  return context;
};

export const AppThemeProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [mode, setMode] = useState<ThemeMode>("light");
  const [mounted, setMounted] = useState(false);

  // Load theme from localStorage on initial client-side mount
  useEffect(() => {
    const savedTheme = localStorage.getItem("theme") as ThemeMode | null;
    if (savedTheme === "light" || savedTheme === "dark") {
      setMode(savedTheme);
    } else {
      // Fallback to system preference
      const prefersDark = window.matchMedia(
        "(prefers-color-scheme: dark)",
      ).matches;
      setMode(prefersDark ? "dark" : "light");
    }
    setMounted(true);
  }, []);

  // Synchronize CSS variables and dark class with DOM whenever theme mode changes
  useEffect(() => {
    if (!mounted) return;

    const root = document.documentElement;
    const colors = mode === "light" ? lightThemeColors : darkThemeColors;

    // Set CSS custom properties on :root for Tailwind utility integration
    root.style.setProperty("--color-primary", colors.primary);
    root.style.setProperty("--color-secondary", colors.secondary);
    root.style.setProperty("--color-background", colors.background);
    root.style.setProperty("--color-paper", colors.paper);
    root.style.setProperty("--color-text-primary", colors.textPrimary);
    root.style.setProperty("--color-text-secondary", colors.textSecondary);
    root.style.setProperty("--color-border", colors.border);
    root.style.setProperty("--color-divider", colors.divider);
    root.style.setProperty("--color-error", colors.error);
    root.style.setProperty("--color-warning", colors.warning);
    root.style.setProperty("--color-success", colors.success);
    root.style.setProperty("--color-info", colors.info);

    if (mode === "dark") {
      root.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      root.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  }, [mode, mounted]);

  const toggleTheme = () => {
    setMode((prevMode) => (prevMode === "light" ? "dark" : "light"));
  };

  const muiTheme = useMemo(() => {
    const colors = mode === "light" ? lightThemeColors : darkThemeColors;
    return createTheme({
      palette: {
        mode,
        primary: {
          main: colors.primary,
        },
        secondary: {
          main: colors.secondary,
        },
        background: {
          default: colors.background,
          paper: colors.paper,
        },
        text: {
          primary: colors.textPrimary,
          secondary: colors.textSecondary,
        },
        error: {
          main: colors.error,
        },
        warning: {
          main: colors.warning,
        },
        success: {
          main: colors.success,
        },
        info: {
          main: colors.info,
        },
        divider: colors.divider,
      },
      typography: {
        fontFamily: "Inter, system-ui, -apple-system, sans-serif",
      },
      components: {
        MuiButton: {
          styleOverrides: {
            root: {
              textTransform: "none",
              borderRadius: "8px",
              fontWeight: 600,
            },
          },
        },
        MuiCard: {
          styleOverrides: {
            root: {
              borderRadius: "12px",
              boxShadow:
                mode === "light"
                  ? "0 4px 6px -1px rgb(0 0 0 / 0.05), 0 2px 4px -2px rgb(0 0 0 / 0.05)"
                  : "0 4px 6px -1px rgb(0 0 0 / 0.2), 0 2px 4px -2px rgb(0 0 0 / 0.2)",
            },
          },
        },
      },
    });
  }, [mode]);

  // Prevent server-side rendering mismatch flash
  if (!mounted) {
    return <div style={{ visibility: "hidden" }}>{children}</div>;
  }

  return (
    <ThemeContext.Provider value={{ mode, toggleTheme }}>
      <StyledEngineProvider injectFirst>
        <MuiThemeProvider theme={muiTheme}>
          <CssBaseline />
          {children}
        </MuiThemeProvider>
      </StyledEngineProvider>
    </ThemeContext.Provider>
  );
};
