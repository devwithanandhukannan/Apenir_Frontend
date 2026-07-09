import React, { useState, useEffect } from "react";
import Box from "@mui/material/Box";
import Toolbar from "@mui/material/Toolbar";
import Header from "@/component_library/Header";
import Sidebar from "@/component_library/Sidebar";

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);

  useEffect(() => {
    // Check screen width on first load/mount
    if (typeof window !== "undefined" && window.innerWidth < 900) {
      setIsCollapsed(true);
    }
  }, []);

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
        <Toolbar /> {/* Spacer to prevent overlap with fixed AppBar */}
        <Box sx={{ mt: 1 }}>{children}</Box>
      </Box>
    </Box>
  );
};
export default Layout;
