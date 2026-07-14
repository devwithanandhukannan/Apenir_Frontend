import React from "react";
import { useRouter } from "next/router";
import { useAppSelector } from "@/core_components/store/hooks";
import { useTheme } from "@mui/material/styles";
import Drawer from "@mui/material/Drawer";
import List from "@mui/material/List";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import Box from "@mui/material/Box";
import Divider from "@mui/material/Divider";
import Typography from "@mui/material/Typography";
import Avatar from "@mui/material/Avatar";
import Tooltip from "@mui/material/Tooltip";

// Icon imports
import DashboardIcon from "@mui/icons-material/Dashboard";
import ScienceIcon from "@mui/icons-material/Science";
import PeopleIcon from "@mui/icons-material/People";
import PersonIcon from "@mui/icons-material/Person";
import LayersIcon from "@mui/icons-material/Layers";
import InventoryIcon from "@mui/icons-material/Inventory";
import PaidIcon from "@mui/icons-material/Paid";
import DescriptionIcon from "@mui/icons-material/Description";
import BarChartIcon from "@mui/icons-material/BarChart";
import SettingsIcon from "@mui/icons-material/Settings";
import HelpIcon from "@mui/icons-material/Help";
import KeyboardDoubleArrowRightIcon from "@mui/icons-material/KeyboardDoubleArrowRight";
import KeyboardDoubleArrowLeftIcon from "@mui/icons-material/KeyboardDoubleArrowLeft";
import EventNoteIcon from "@mui/icons-material/EventNote";
import BatchPredictionIcon from "@mui/icons-material/BatchPrediction";
import InsightsIcon from "@mui/icons-material/Insights";
import AssignmentIcon from "@mui/icons-material/Assignment";
import HomeIcon from "@mui/icons-material/Home";

const DRAWER_WIDTH = 250;

interface SidebarProps {
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  isCollapsed: controlledIsCollapsed,
  onToggleCollapse,
}) => {
  const router = useRouter();
  const { user, isAuthenticated } = useAppSelector((state) => state.auth);
  const theme = useTheme();

  const [localIsCollapsed, setLocalIsCollapsed] = React.useState(false);
  const isCollapsed =
    controlledIsCollapsed !== undefined
      ? controlledIsCollapsed
      : localIsCollapsed;

  const handleToggle = () => {
    if (onToggleCollapse) {
      onToggleCollapse();
    } else {
      setLocalIsCollapsed(!localIsCollapsed);
    }
  };

  const handleNavigate = (path: string) => {
    router.push(path);
  };

  const handleSettingsClick = () => {
    if (isAuthenticated && user) {
      if (user.role === "lab") {
        router.push("/lab/settings");
      } else {
        router.push("/admin/settings");
      }
    }
  };

  const isActive = (path: string) => {
    if (path === "/admin") {
      return router.pathname === "/admin";
    }
    if (path === "/lab/lab-console") {
      return router.pathname === "/lab/lab-console";
    }
    if (path === "/") {
      return router.pathname === "/";
    }
    return router.pathname.startsWith(path);
  };

  // Define admin navigation list according to the screenshot
  const adminMenuItems = [
    {
      text: "Dashboard",
      path: "/admin",
      icon: <DashboardIcon fontSize="small" />,
    },
    {
      text: "Lab",
      path: "/admin/lab-console",
      icon: <ScienceIcon fontSize="small" />,
    }, // Mocks
    {
      text: "Staff",
      path: "/admin/staff-console",
      icon: <PeopleIcon fontSize="small" />,
    },
    {
      text: "Customer",
      path: "/admin/customer-console",
      icon: <PersonIcon fontSize="small" />,
    },
    {
      text: "Services",
      path: "/admin/services-console",
      icon: <LayersIcon fontSize="small" />,
    },
    {
      text: "Packages",
      path: "/admin/packages-console",
      icon: <InventoryIcon fontSize="small" />,
    },
    {
      text: "Finance",
      path: "/admin/payroll-console",
      icon: <PaidIcon fontSize="small" />,
    },
    {
      text: "Reports",
      path: "/reports-console",
      icon: <DescriptionIcon fontSize="small" />,
    },
    {
      text: "Analytics",
      path: "/analytics-console",
      icon: <BarChartIcon fontSize="small" />,
    },
  ];

  // Define lab navigation list
  const labMenuItems = [
    {
      text: "Home",
      path: "/lab/lab-console",
      icon: <HomeIcon fontSize="small" />,
    },
    {
      text: "Appointments",
      path: "/lab/appointments",
      icon: <EventNoteIcon fontSize="small" />,
    },
    {
      text: "Staff",
      path: "/lab/staff",
      icon: <PeopleIcon fontSize="small" />,
    },
    {
      text: "Packages",
      path: "/lab/packages",
      icon: <InventoryIcon fontSize="small" />,
    },
    {
      text: "Services",
      path: "/lab/services",
      icon: <LayersIcon fontSize="small" />,
    },
    {
      text: "Payment & Batch",
      path: "/lab/payment-batch",
      icon: <BatchPredictionIcon fontSize="small" />,
    },
    {
      text: "Insights",
      path: "/lab/insights",
      icon: <InsightsIcon fontSize="small" />,
    },
  ];

  // Define staff navigation list
  const staffMenuItems = [
    {
      text: "Dashboard",
      path: "/staff",
      icon: <DashboardIcon fontSize="small" />,
    },
    {
      text: "My Appointments",
      path: "/staff/appointments",
      icon: <AssignmentIcon fontSize="small" />,
    },
  ];

  return (
    <Drawer
      variant="permanent"
      sx={{
        width: isCollapsed ? 70 : DRAWER_WIDTH,
        flexShrink: 0,
        transition: (theme) =>
          theme.transitions.create("width", {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.enteringScreen,
          }),
        [`& .MuiDrawer-paper`]: {
          width: isCollapsed ? 70 : DRAWER_WIDTH,
          boxSizing: "border-box",
          borderRight: "1px solid var(--color-border)",
          backgroundColor: "var(--color-paper)",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          transition: (theme) =>
            theme.transitions.create("width", {
              easing: theme.transitions.easing.sharp,
              duration: theme.transitions.duration.enteringScreen,
            }),
          overflowX: "hidden",
        },
      }}
    >
      <div>
        {/* Brand Console Header */}
        <Box
          sx={{
            p: isCollapsed ? "20px 0 10px 0" : "20px 24px 10px 24px",
            display: "flex",
            flexDirection: "column",
            alignItems: isCollapsed ? "center" : "stretch",
            gap: 0.5,
          }}
        >
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: isCollapsed ? "center" : "flex-start",
              gap: 1,
            }}
          >
            <Avatar
              sx={{
                bgcolor: "secondary.main",
                width: 28,
                height: 28,
                fontSize: "14px",
                fontWeight: 800,
              }}
              className="bg-secondary"
            >
              A
            </Avatar>
            {!isCollapsed && (
              <Typography
                variant="subtitle1"
                sx={{
                  fontWeight: 800,
                  letterSpacing: "-0.3px",
                  lineHeight: 1.2,
                }}
                color="text.primary"
                className="font-extrabold tracking-tight"
              >
                Appenir
                <Box component="span" sx={{ color: "secondary.main", ml: 0.5 }}>
                  {isAuthenticated && user?.role === "lab" ? "Lab" : "MS"}
                </Box>
              </Typography>
            )}
          </Box>
          {!isCollapsed && (
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{ fontWeight: 600, pl: 4, letterSpacing: "0.2px" }}
            >
              {isAuthenticated && user?.role === "lab"
                ? "Lab Console"
                : isAuthenticated && user?.role === "admin"
                  ? "Admin Console"
                  : "Portal"}
            </Typography>
          )}
        </Box>

        <Divider sx={{ my: 1, borderColor: "var(--color-divider)" }} />

        {/* Sidebar Middle Content */}
        <Box sx={{ px: isCollapsed ? 1 : 2, py: 1.5 }}>
          {/* Dynamic Menu items based on active role */}
          {isAuthenticated && user && user.role === "admin" ? (
            <List component="nav" sx={{ p: 0 }}>
              {adminMenuItems.map((item) => {
                const active = isActive(item.path);
                const buttonContent = (
                  <ListItemButton
                    selected={active}
                    onClick={() => handleNavigate(item.path)}
                    sx={{
                      borderRadius: "8px",
                      mb: 0.5,
                      py: 1,
                      px: isCollapsed ? 0 : 2,
                      justifyContent: isCollapsed ? "center" : "flex-start",
                      color: active ? "secondary.main" : "text.secondary",
                      bgcolor: active
                        ? theme.palette.mode === "light"
                          ? "rgba(16, 185, 129, 0.08)"
                          : "rgba(16, 185, 129, 0.15)"
                        : "transparent",
                      "&.Mui-selected": {
                        bgcolor:
                          theme.palette.mode === "light"
                            ? "rgba(16, 185, 129, 0.08)"
                            : "rgba(16, 185, 129, 0.15)",
                        color: "secondary.main",
                        "& .MuiListItemIcon-root": { color: "secondary.main" },
                      },
                      "&:hover": {
                        bgcolor: active
                          ? theme.palette.mode === "light"
                            ? "rgba(16, 185, 129, 0.12)"
                            : "rgba(16, 185, 129, 0.22)"
                          : theme.palette.mode === "light"
                            ? "rgba(0, 0, 0, 0.04)"
                            : "rgba(255, 255, 255, 0.04)",
                      },
                    }}
                  >
                    <ListItemIcon
                      sx={{
                        minWidth: isCollapsed ? 0 : 32,
                        justifyContent: "center",
                        color: active ? "secondary.main" : "text.secondary",
                      }}
                    >
                      {item.icon}
                    </ListItemIcon>
                    {!isCollapsed && (
                      <ListItemText
                        primary={
                          <Typography
                            variant="body2"
                            sx={{ fontWeight: active ? 700 : 500 }}
                          >
                            {item.text}
                          </Typography>
                        }
                      />
                    )}
                  </ListItemButton>
                );

                return isCollapsed ? (
                  <Tooltip key={item.text} title={item.text} placement="right">
                    <Box>{buttonContent}</Box>
                  </Tooltip>
                ) : (
                  <React.Fragment key={item.text}>
                    {buttonContent}
                  </React.Fragment>
                );
              })}
            </List>
          ) : isAuthenticated && user && user.role === "lab" ? (
            <List component="nav" sx={{ p: 0 }}>
              {labMenuItems.map((item) => {
                const active = isActive(item.path);
                const buttonContent = (
                  <ListItemButton
                    selected={active}
                    onClick={() => handleNavigate(item.path)}
                    sx={{
                      borderRadius: "8px",
                      mb: 0.5,
                      py: 1,
                      px: isCollapsed ? 0 : 2,
                      justifyContent: isCollapsed ? "center" : "flex-start",
                      color: active ? "secondary.main" : "text.secondary",
                      bgcolor: active
                        ? theme.palette.mode === "light"
                          ? "rgba(16, 185, 129, 0.08)"
                          : "rgba(16, 185, 129, 0.15)"
                        : "transparent",
                      "&.Mui-selected": {
                        bgcolor:
                          theme.palette.mode === "light"
                            ? "rgba(16, 185, 129, 0.08)"
                            : "rgba(16, 185, 129, 0.15)",
                        color: "secondary.main",
                        "& .MuiListItemIcon-root": { color: "secondary.main" },
                      },
                      "&:hover": {
                        bgcolor: active
                          ? theme.palette.mode === "light"
                            ? "rgba(16, 185, 129, 0.12)"
                            : "rgba(16, 185, 129, 0.22)"
                          : theme.palette.mode === "light"
                            ? "rgba(0, 0, 0, 0.04)"
                            : "rgba(255, 255, 255, 0.04)",
                      },
                    }}
                  >
                    <ListItemIcon
                      sx={{
                        minWidth: isCollapsed ? 0 : 32,
                        justifyContent: "center",
                        color: active ? "secondary.main" : "text.secondary",
                      }}
                    >
                      {item.icon}
                    </ListItemIcon>
                    {!isCollapsed && (
                      <ListItemText
                        primary={
                          <Typography
                            variant="body2"
                            sx={{ fontWeight: active ? 700 : 500 }}
                          >
                            {item.text}
                          </Typography>
                        }
                      />
                    )}
                  </ListItemButton>
                );

                return isCollapsed ? (
                  <Tooltip key={item.text} title={item.text} placement="right">
                    <Box>{buttonContent}</Box>
                  </Tooltip>
                ) : (
                  <React.Fragment key={item.text}>
                    {buttonContent}
                  </React.Fragment>
                );
              })}
            </List>
          ) : isAuthenticated && user && user.role === "staff" ? (
            <List component="nav" sx={{ p: 0 }}>
              {staffMenuItems.map((item) => {
                const active = isActive(item.path);
                const buttonContent = (
                  <ListItemButton
                    selected={active}
                    onClick={() => handleNavigate(item.path)}
                    sx={{
                      borderRadius: "8px",
                      mb: 0.5,
                      py: 1,
                      px: isCollapsed ? 0 : 2,
                      justifyContent: isCollapsed ? "center" : "flex-start",
                      color: active ? "secondary.main" : "text.secondary",
                      bgcolor: active
                        ? theme.palette.mode === "light"
                          ? "rgba(16, 185, 129, 0.08)"
                          : "rgba(16, 185, 129, 0.15)"
                        : "transparent",
                      "&.Mui-selected": {
                        bgcolor:
                          theme.palette.mode === "light"
                            ? "rgba(16, 185, 129, 0.08)"
                            : "rgba(16, 185, 129, 0.15)",
                        color: "secondary.main",
                        "& .MuiListItemIcon-root": { color: "secondary.main" },
                      },
                      "&:hover": {
                        bgcolor: active
                          ? theme.palette.mode === "light"
                            ? "rgba(16, 185, 129, 0.12)"
                            : "rgba(16, 185, 129, 0.22)"
                          : theme.palette.mode === "light"
                            ? "rgba(0, 0, 0, 0.04)"
                            : "rgba(255, 255, 255, 0.04)",
                      },
                    }}
                  >
                    <ListItemIcon
                      sx={{
                        minWidth: isCollapsed ? 0 : 32,
                        justifyContent: "center",
                        color: active ? "secondary.main" : "text.secondary",
                      }}
                    >
                      {item.icon}
                    </ListItemIcon>
                    {!isCollapsed && (
                      <ListItemText
                        primary={
                          <Typography
                            variant="body2"
                            sx={{ fontWeight: active ? 700 : 500 }}
                          >
                            {item.text}
                          </Typography>
                        }
                      />
                    )}
                  </ListItemButton>
                );

                return isCollapsed ? (
                  <Tooltip key={item.text} title={item.text} placement="right">
                    <Box>{buttonContent}</Box>
                  </Tooltip>
                ) : (
                  <React.Fragment key={item.text}>
                    {buttonContent}
                  </React.Fragment>
                );
              })}
            </List>
          ) : (
            // Fallback for customer or other roles
            <List component="nav" sx={{ p: 0 }}>
              {isCollapsed ? (
                <Tooltip title="Home Portal" placement="right">
                  <Box>
                    <ListItemButton
                      selected={isActive("/")}
                      onClick={() => handleNavigate("/")}
                      sx={{
                        borderRadius: "8px",
                        mb: 0.5,
                        py: 1,
                        px: 0,
                        justifyContent: "center",
                      }}
                    >
                      <ListItemIcon
                        sx={{ minWidth: 0, justifyContent: "center" }}
                      >
                        <DashboardIcon fontSize="small" />
                      </ListItemIcon>
                    </ListItemButton>
                  </Box>
                </Tooltip>
              ) : (
                <ListItemButton
                  selected={isActive("/")}
                  onClick={() => handleNavigate("/")}
                  sx={{ borderRadius: "8px", mb: 0.5 }}
                >
                  <ListItemIcon sx={{ minWidth: 32 }}>
                    <DashboardIcon fontSize="small" />
                  </ListItemIcon>
                  <ListItemText
                    primary={
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        Home Portal
                      </Typography>
                    }
                  />
                </ListItemButton>
              )}
              {isAuthenticated &&
                user &&
                (isCollapsed ? (
                  <Tooltip title="My Account" placement="right">
                    <Box>
                      <ListItemButton
                        selected={isActive(`/${user.role}`)}
                        onClick={() => handleNavigate(`/${user.role}`)}
                        sx={{
                          borderRadius: "8px",
                          mb: 0.5,
                          py: 1,
                          px: 0,
                          justifyContent: "center",
                        }}
                      >
                        <ListItemIcon
                          sx={{ minWidth: 0, justifyContent: "center" }}
                        >
                          <PersonIcon fontSize="small" />
                        </ListItemIcon>
                      </ListItemButton>
                    </Box>
                  </Tooltip>
                ) : (
                  <ListItemButton
                    selected={isActive(`/${user.role}`)}
                    onClick={() => handleNavigate(`/${user.role}`)}
                    sx={{ borderRadius: "8px", mb: 0.5 }}
                  >
                    <ListItemIcon sx={{ minWidth: 32 }}>
                      <PersonIcon fontSize="small" />
                    </ListItemIcon>
                    <ListItemText
                      primary={
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                          My Account
                        </Typography>
                      }
                    />
                  </ListItemButton>
                ))}
            </List>
          )}
        </Box>
      </div>

      {/* Sticky Bottom Segment (Settings, Support, and Collapse Toggle) */}
      <Box
        sx={{
          p: isCollapsed ? 1 : 2,
          borderTop: "1px solid var(--color-divider)",
          display: "flex",
          flexDirection: "column",
          gap: 0.5,
        }}
      >
        <List component="nav" sx={{ p: 0, m: 0 }}>
          {isCollapsed ? (
            <Tooltip title="Settings" placement="right">
              <Box>
                <ListItemButton
                  onClick={handleSettingsClick}
                  sx={{
                    borderRadius: "8px",
                    py: 0.8,
                    px: 0,
                    justifyContent: "center",
                    color: "text.secondary",
                  }}
                >
                  <ListItemIcon
                    sx={{
                      minWidth: 0,
                      justifyContent: "center",
                      color: "text.secondary",
                    }}
                  >
                    <SettingsIcon fontSize="small" />
                  </ListItemIcon>
                </ListItemButton>
              </Box>
            </Tooltip>
          ) : (
            <ListItemButton
              onClick={handleSettingsClick}
              sx={{
                borderRadius: "8px",
                py: 0.8,
                px: 2,
                color: "text.secondary",
              }}
            >
              <ListItemIcon sx={{ minWidth: 32, color: "text.secondary" }}>
                <SettingsIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText
                primary={
                  <Typography variant="body2" sx={{ fontWeight: 500 }}>
                    Settings
                  </Typography>
                }
              />
            </ListItemButton>
          )}

          {isCollapsed ? (
            <Tooltip title="Support" placement="right">
              <Box>
                <ListItemButton
                  onClick={() => alert("MOCK: Support Panel")}
                  sx={{
                    borderRadius: "8px",
                    py: 0.8,
                    px: 0,
                    justifyContent: "center",
                    color: "text.secondary",
                  }}
                >
                  <ListItemIcon
                    sx={{
                      minWidth: 0,
                      justifyContent: "center",
                      color: "text.secondary",
                    }}
                  >
                    <HelpIcon fontSize="small" />
                  </ListItemIcon>
                </ListItemButton>
              </Box>
            </Tooltip>
          ) : (
            <ListItemButton
              onClick={() => alert("MOCK: Support Panel")}
              sx={{
                borderRadius: "8px",
                py: 0.8,
                px: 2,
                color: "text.secondary",
              }}
            >
              <ListItemIcon sx={{ minWidth: 32, color: "text.secondary" }}>
                <HelpIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText
                primary={
                  <Typography variant="body2" sx={{ fontWeight: 500 }}>
                    Support
                  </Typography>
                }
              />
            </ListItemButton>
          )}
        </List>

        <Divider sx={{ my: 0.5, borderColor: "var(--color-divider)" }} />

        {isCollapsed ? (
          <Tooltip title="Expand Sidebar" placement="right">
            <Box>
              <ListItemButton
                onClick={handleToggle}
                sx={{
                  borderRadius: "8px",
                  py: 0.8,
                  px: 0,
                  justifyContent: "center",
                  color: "text.secondary",
                }}
              >
                <ListItemIcon
                  sx={{
                    minWidth: 0,
                    justifyContent: "end",
                    color: "text.secondary",
                  }}
                >
                  <KeyboardDoubleArrowRightIcon fontSize="small" />
                </ListItemIcon>
              </ListItemButton>
            </Box>
          </Tooltip>
        ) : (
          <ListItemButton
            onClick={handleToggle}
            sx={{
              borderRadius: "8px",
              py: 0.8,
              px: 2,
              color: "text.secondary",
            }}
          >
            <ListItemIcon sx={{ minWidth: 32, color: "text.secondary" }}>
              <KeyboardDoubleArrowLeftIcon fontSize="small" />
            </ListItemIcon>
          </ListItemButton>
        )}
      </Box>
    </Drawer>
  );
};

export default Sidebar;
