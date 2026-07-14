import React, { useState, useEffect } from "react";
import Box from "@mui/material/Box";
import Toolbar from "@mui/material/Toolbar";
import AppBar from "@mui/material/AppBar";
import Typography from "@mui/material/Typography";
import IconButton from "@mui/material/IconButton";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import MenuIcon from "@mui/icons-material/Menu";
import DashboardIcon from "@mui/icons-material/Dashboard";
import AssignmentIcon from "@mui/icons-material/Assignment";
import LogoutIcon from "@mui/icons-material/Logout";
import SearchIcon from "@mui/icons-material/Search";
import Header from "@/component_library/Header";
import Sidebar from "@/component_library/Sidebar";
import { useAppSelector } from "@/core_components/store/hooks";
import { useRouter } from "next/router";
import { useAuthenticationService } from "@/core_components/apis/admin/authService/useAuthenticationService";

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const { user, isAuthenticated } = useAppSelector((state) => state.auth);
  const router = useRouter();
  const { logout } = useAuthenticationService();

  const [menuAnchorEl, setMenuAnchorEl] = useState<null | HTMLElement>(null);

  useEffect(() => {
    // Check screen width on first load/mount
    if (typeof window !== "undefined" && window.innerWidth < 900) {
      setIsCollapsed(true);
    }
  }, []);

  const handleOpenMenu = (event: React.MouseEvent<HTMLElement>) => {
    setMenuAnchorEl(event.currentTarget);
  };

  const handleCloseMenu = () => {
    setMenuAnchorEl(null);
  };

  const navigateTo = (path: string) => {
    handleCloseMenu();
    router.push(path);
  };

  const handleLogout = async () => {
    handleCloseMenu();
    await logout();
    router.push("/");
  };

  const isStaff = isAuthenticated && user?.role === "staff";

  if (isStaff) {
    return (
      <Box sx={{ minHeight: "100vh", bgcolor: "background.default" }}>
        {/* Mobile Header with Top-Down Hamburger */}
        <AppBar
          position="fixed"
          color="default"
          elevation={1}
          sx={{
            zIndex: (theme) => theme.zIndex.drawer + 1,
            backdropFilter: "blur(8px)",
            borderBottom: "1px solid var(--color-border)",
            backgroundColor: "background.paper",
          }}
        >
          <Toolbar sx={{ display: "flex", justifyContent: "space-between" }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <Typography
                variant="h6"
                sx={{
                  fontWeight: 800,
                  letterSpacing: "-0.5px",
                  color: "primary.main",
                  fontSize: 18,
                }}
              >
                Apenir <span style={{ color: "text.secondary" }}>Staff</span>
              </Typography>
            </Box>

            <IconButton
              edge="end"
              color="inherit"
              aria-label="menu"
              onClick={handleOpenMenu}
              sx={{
                border: "1px solid rgba(0,0,0,0.06)",
                borderRadius: "8px",
                p: 0.8,
              }}
            >
              <MenuIcon />
            </IconButton>
          </Toolbar>
        </AppBar>

        {/* Top-Down Dropdown Menu */}
        <Menu
          anchorEl={menuAnchorEl}
          open={Boolean(menuAnchorEl)}
          onClose={handleCloseMenu}
          anchorOrigin={{
            vertical: "bottom",
            horizontal: "right",
          }}
          transformOrigin={{
            vertical: "top",
            horizontal: "right",
          }}
          slotProps={{
            paper: {
              sx: {
                width: 200,
                mt: 1.5,
                borderRadius: "12px",
                boxShadow: "0 10px 25px rgba(0,0,0,0.1)",
                border: "1px solid var(--color-border)",
              },
            },
          }}
        >
          <MenuItem
            onClick={() => navigateTo("/staff")}
            sx={{ py: 1.2, gap: 1.5 }}
          >
            <DashboardIcon fontSize="small" color="action" />
            <Typography variant="body2" sx={{ fontWeight: 600 }}>
              Dashboard
            </Typography>
          </MenuItem>
          <MenuItem
            onClick={() => navigateTo("/staff/appointments")}
            sx={{ py: 1.2, gap: 1.5 }}
          >
            <AssignmentIcon fontSize="small" color="action" />
            <Typography variant="body2" sx={{ fontWeight: 600 }}>
              Appointments
            </Typography>
          </MenuItem>
          <MenuItem
            onClick={() => navigateTo("/lookup")}
            sx={{ py: 1.2, gap: 1.5 }}
          >
            <SearchIcon fontSize="small" color="action" />
            <Typography variant="body2" sx={{ fontWeight: 600 }}>
              Track Token
            </Typography>
          </MenuItem>
          <MenuItem
            onClick={handleLogout}
            sx={{ py: 1.2, gap: 1.5, color: "error.main" }}
          >
            <LogoutIcon fontSize="small" color="error" />
            <Typography variant="body2" sx={{ fontWeight: 600 }}>
              Sign Out
            </Typography>
          </MenuItem>
        </Menu>

        {/* Main Content (Full-width for Mobile Staff App) */}
        <Box
          component="main"
          sx={{
            p: { xs: 2, sm: 3 },
            bgcolor: "background.default",
            color: "text.primary",
            minHeight: "100vh",
            width: "100%",
          }}
        >
          <Toolbar /> {/* Spacer */}
          <Box sx={{ mt: 1 }}>{children}</Box>
        </Box>
      </Box>
    );
  }

  // Non-staff Layout (Desktop with Sidebar)
  return (
    <Box sx={{ display: "flex", minHeight: "100vh" }}>
      {/* Top Navbar */}
      <Header isCollapsed={isCollapsed} />

      {/* Side Navigation */}
      <Sidebar
        isCollapsed={isCollapsed}
        onToggleCollapse={() => setIsCollapsed(!isCollapsed)}
      />

      {/* Main Content Area */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          width: { sm: `calc(100% - ${isCollapsed ? 70 : 250}px)` }, // Subtract drawer width
          bgcolor: "background.default",
          color: "text.primary",
          minHeight: "100vh",
          transition: (theme) =>
            theme.transitions.create("width", {
              easing: theme.transitions.easing.sharp,
              duration: theme.transitions.duration.enteringScreen,
            }),
        }}
        className="flex-grow p-6 bg-background text-text-primary min-h-screen"
      >
        <Toolbar /> {/* Spacer */}
        <Box sx={{ mt: 1 }}>{children}</Box>
      </Box>
    </Box>
  );
};
export default Layout;
