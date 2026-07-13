import { styled } from "@mui/material/styles";
import TableContainer from "@mui/material/TableContainer";
import TableRow from "@mui/material/TableRow";
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import Button from "@mui/material/Button";

// Outer wrapper drawing a single border around the Table and Pagination
export const GridWrapper = styled(Box)(({ theme }) => ({
  border: "1px solid var(--color-border)",
  borderRadius: theme.shape.borderRadius || "8px",
  overflow: "hidden",
  backgroundColor: theme.palette.background.paper,
}));

// Styled layout wrapper for desktop/tablet tables
export const StyledTableContainer = styled(TableContainer)(({ theme }) => ({
  border: "none",
  backgroundColor: "transparent",
  boxShadow: "none",
  overflowX: "auto",
}));

// Table header row container styling matching standard admin tables
export const StyledHeaderRow = styled(TableRow)(({ theme }) => ({
  backgroundColor:
    theme.palette.mode === "light" ? "#f8fafc" : "rgba(255, 255, 255, 0.02)",
  borderBottom: "2px solid var(--color-border)",
}));

// Row hover and selection highlighting animations with a clinical green accent
export const StyledTableRow = styled(TableRow)(({ theme }) => ({
  transition: "background-color 0.2s ease",
  "&:hover": {
    backgroundColor:
      theme.palette.mode === "light"
        ? "rgba(16, 185, 129, 0.04)" // Light clinical green tint on hover
        : "rgba(16, 185, 129, 0.08)", // Dark clinical green tint on hover
  },
  "&.Mui-selected": {
    backgroundColor:
      theme.palette.mode === "light"
        ? "rgba(16, 185, 129, 0.08)"
        : "rgba(16, 185, 129, 0.15)",
  },
}));

// Mobile card component style
export const MobileCardContainer = styled(Card)(({ theme }) => ({
  marginBottom: theme.spacing(2),
  border: `1px solid ${theme.palette.divider}`,
  borderRadius: theme.shape.borderRadius,
  boxShadow: "none",
  padding: theme.spacing(2.5),
  display: "flex",
  flexDirection: "column",
  gap: theme.spacing(1.5),
  backgroundColor: theme.palette.background.paper,
}));

// Row inside mobile card mapping values side-by-side
export const MobileFieldRow = styled(Box)(({ theme }) => ({
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  paddingBottom: theme.spacing(1),
  borderBottom: `1px solid ${theme.palette.divider}`,
  "&:last-child": {
    borderBottom: "none",
    paddingBottom: 0,
  },
}));

// Action button visible by default for smooth and accessible action triggers
export const HoverActionButton = styled(Button)(({ theme }) => ({
  textTransform: "none",
  borderRadius: "6px",
  fontWeight: 700,
  fontSize: "11px",
  padding: "4px 12px",
  boxShadow: "none",
  minWidth: "70px",
  backgroundColor: "var(--color-secondary)",
  color: "#ffffff",
  "&:hover": {
    backgroundColor: "rgba(16, 185, 129, 0.85)",
    boxShadow: "none",
  },
}));
