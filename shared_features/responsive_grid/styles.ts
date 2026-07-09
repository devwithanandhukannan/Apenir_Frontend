import { styled } from '@mui/material/styles';
import TableContainer from '@mui/material/TableContainer';
import TableRow from '@mui/material/TableRow';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Button from '@mui/material/Button';

// Outer wrapper drawing a single border around the Table and Pagination
export const GridWrapper = styled(Box)(({ theme }) => ({
  border: theme.palette.mode === 'light' ? '1px solid #e2e8f0' : `1px solid ${theme.palette.divider}`,
  borderRadius: theme.shape.borderRadius || '8px',
  overflow: 'hidden',
  backgroundColor: theme.palette.background.paper,
}));

// Styled layout wrapper for desktop/tablet tables
export const StyledTableContainer = styled(TableContainer)(({ theme }) => ({
  border: 'none',
  backgroundColor: 'transparent',
  boxShadow: 'none',
  overflowX: 'auto',
}));

// Table header row container styling matching standard admin tables
export const StyledHeaderRow = styled(TableRow)(({ theme }) => ({
  backgroundColor: theme.palette.background.paper,
}));

// Row hover and selection highlighting animations
export const StyledTableRow = styled(TableRow)(({ theme }) => ({
  '&:hover': {
    backgroundColor: theme.palette.mode === 'light' ? 'rgba(0, 0, 0, 0.015)' : 'rgba(255, 255, 255, 0.015)',
  },
  '&.Mui-selected': {
    backgroundColor: theme.palette.mode === 'light' ? 'rgba(25, 118, 210, 0.06)' : 'rgba(25, 118, 210, 0.12)',
  },
}));

// Mobile card component style
export const MobileCardContainer = styled(Card)(({ theme }) => ({
  marginBottom: theme.spacing(2),
  border: `1px solid ${theme.palette.divider}`,
  borderRadius: theme.shape.borderRadius,
  boxShadow: 'none',
  padding: theme.spacing(2.5),
  display: 'flex',
  flexDirection: 'column',
  gap: theme.spacing(1.5),
  backgroundColor: theme.palette.background.paper,
}));

// Row inside mobile card mapping values side-by-side
export const MobileFieldRow = styled(Box)(({ theme }) => ({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  paddingBottom: theme.spacing(1),
  borderBottom: `1px solid ${theme.palette.divider}`,
  '&:last-child': {
    borderBottom: 'none',
    paddingBottom: 0,
  },
}));

// Action button visible only when row is hovered
export const HoverActionButton = styled(Button)(({ theme }) => ({
  opacity: 0,
  visibility: 'hidden',
  transition: 'opacity 0.15s ease-in-out, visibility 0.15s ease-in-out',
  'tr:hover &': {
    opacity: 1,
    visibility: 'visible',
  },
  [theme.breakpoints.down('sm')]: {
    opacity: 1,
    visibility: 'visible',
  },
}));
