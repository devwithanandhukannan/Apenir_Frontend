import React, { useState } from "react";
import { useAppTheme } from "@/core_components/theme/themeProvider";
import { useAppDispatch, useAppSelector } from "@/core_components/store/hooks";
import { useRouter } from "next/router";
import { useAuthenticationService } from "@/core_components/apis/admin/authService/useAuthenticationService";
import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import IconButton from "@mui/material/IconButton";
import Button from "@mui/material/Button";
import Box from "@mui/material/Box";
import Avatar from "@mui/material/Avatar";
import Tooltip from "@mui/material/Tooltip";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import Divider from "@mui/material/Divider";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import Brightness4Icon from "@mui/icons-material/Brightness4";
import Brightness7Icon from "@mui/icons-material/Brightness7";
import LogoutIcon from "@mui/icons-material/Logout";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";

interface HeaderProps {
  isCollapsed?: boolean;
}

export const Header: React.FC<HeaderProps> = ({ isCollapsed = false }) => {
  const { mode, toggleTheme } = useAppTheme();
  const { user, isAuthenticated } = useAppSelector((state) => state.auth);
  const dispatch = useAppDispatch();
  const router = useRouter();

  const { logout } = useAuthenticationService();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const handleOpenMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleCloseMenu = () => {
    setAnchorEl(null);
  };

  const handleLogout = async () => {
    await logout();
    router.push("/");
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case "admin":
        return "Administrator";
      case "lab":
        return "Lab Technician";
      case "customer":
        return "Customer";
      default:
        return "User";
    }
  };

  return (
    <AppBar
      position="fixed"
      color="default"
      elevation={0}
      sx={{
        width: { sm: `calc(100% - ${isCollapsed ? 70 : 250}px)` },
        ml: { sm: `${isCollapsed ? 70 : 250}px` },
        zIndex: (theme) => theme.zIndex.drawer - 1,
        backdropFilter: "blur(8px)",
        borderBottom: "1px solid var(--color-border)",
        backgroundColor: "background.paper",
        transition: (theme) =>
          theme.transitions.create(["width", "margin"], {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.enteringScreen,
          }),
      }}
      className="backdrop-blur-md bg-paper/85 border-b border-border"
    >
      <Toolbar sx={{ justifyContent: "flex-end" }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          {/* User Details & Dropdown option */}
          {isAuthenticated && user ? (
            <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
              <Box
                sx={{
                  display: { xs: "none", sm: "block" },
                  textAlign: "right",
                }}
              >
                <Typography
                  variant="subtitle2"
                  sx={{
                    fontWeight: 700,
                    lineHeight: 1.2,
                    color: "text.primary",
                  }}
                >
                  {user.name}
                </Typography>
                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{ display: "block", fontSize: "11px", fontWeight: 500 }}
                >
                  {user.email}
                </Typography>
                <Typography
                  variant="caption"
                  sx={{
                    color: "secondary.main",
                    fontWeight: 700,
                    fontSize: "10px",
                  }}
                >
                  {getRoleLabel(user.role).toUpperCase()}
                </Typography>
              </Box>

              <Box
                onClick={handleOpenMenu}
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 0.5,
                  cursor: "pointer",
                  p: 0.5,
                  borderRadius: "8px",
                  transition: "background-color 0.2s",
                  "&:hover": {
                    bgcolor:
                      mode === "light"
                        ? "rgba(0, 0, 0, 0.04)"
                        : "rgba(255, 255, 255, 0.04)",
                  },
                }}
              >
                <Avatar
                  sx={{
                    bgcolor: "secondary.main",
                    width: 32,
                    height: 32,
                    fontSize: "14px",
                    fontWeight: 700,
                  }}
                  className="bg-secondary"
                >
                  {user.name.charAt(0).toUpperCase()}
                </Avatar>
                <KeyboardArrowDownIcon
                  sx={{ fontSize: "18px", color: "text.secondary" }}
                />
              </Box>

              {/* User Dropdown Options Menu */}
              <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleCloseMenu}
                slotProps={{
                  paper: {
                    elevation: 0,
                    sx: {
                      overflow: "visible",
                      filter: "drop-shadow(0px 4px 12px rgba(0,0,0,0.08))",
                      mt: 1,
                      borderRadius: "12px",
                      border: "1px solid var(--color-border)",
                      minWidth: 220,
                      bgcolor: "background.paper",
                    },
                  },
                }}
                transformOrigin={{ horizontal: "right", vertical: "top" }}
                anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
              >
                <Box sx={{ px: 2, py: 1.5 }}>
                  <Typography
                    variant="subtitle2"
                    sx={{ fontWeight: 700, color: "text.primary" }}
                  >
                    {user.name}
                  </Typography>
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{ display: "block" }}
                  >
                    {user.email}
                  </Typography>
                  <Typography
                    variant="caption"
                    sx={{
                      color: "secondary.main",
                      fontWeight: 700,
                      fontSize: "9px",
                    }}
                  >
                    {getRoleLabel(user.role).toUpperCase()}
                  </Typography>
                </Box>

                <Divider sx={{ my: 0.5 }} />

                <MenuItem
                  onClick={() => {
                    toggleTheme();
                    handleCloseMenu();
                  }}
                >
                  <ListItemIcon sx={{ color: "text.secondary" }}>
                    {mode === "dark" ? (
                      <Brightness7Icon fontSize="small" />
                    ) : (
                      <Brightness4Icon fontSize="small" />
                    )}
                  </ListItemIcon>
                  <ListItemText
                    primary={
                      <Typography
                        variant="body2"
                        sx={{ fontWeight: 600, color: "text.primary" }}
                      >
                        {mode === "dark" ? "Light Mode" : "Dark Mode"}
                      </Typography>
                    }
                  />
                </MenuItem>

                <Divider sx={{ my: 0.5 }} />

                <MenuItem
                  onClick={() => {
                    handleLogout();
                    handleCloseMenu();
                  }}
                  sx={{ color: "error.main" }}
                >
                  <ListItemIcon>
                    <LogoutIcon fontSize="small" sx={{ color: "error.main" }} />
                  </ListItemIcon>
                  <ListItemText
                    primary={
                      <Typography
                        variant="body2"
                        sx={{ fontWeight: 600, color: "error.main" }}
                      >
                        Logout
                      </Typography>
                    }
                  />
                </MenuItem>
              </Menu>
            </Box>
          ) : (
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <AccountCircleIcon color="action" />
              <Typography
                variant="body2"
                color="text.secondary"
                className="font-semibold text-textSecondary"
              >
                Guest Mode
              </Typography>
            </Box>
          )}
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Header;
