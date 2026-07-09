import React from 'react';
import { useAppTheme } from '@/core_components/theme/themeProvider';
import { useAppDispatch, useAppSelector } from '@/core_components/store/hooks';
import { useRouter } from 'next/router';
import { useAuthenticationService } from '@/core_components/apis/admin/authService/useAuthenticationService';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import Avatar from '@mui/material/Avatar';
import Tooltip from '@mui/material/Tooltip';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';
import LogoutIcon from '@mui/icons-material/Logout';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';

interface HeaderProps {
  isCollapsed?: boolean;
}

export const Header: React.FC<HeaderProps> = ({ isCollapsed = false }) => {
  const { mode, toggleTheme } = useAppTheme();
  const { user, isAuthenticated } = useAppSelector((state) => state.auth);
  const dispatch = useAppDispatch();
  const router = useRouter();

  const { logout } = useAuthenticationService();

  const handleLogout = async () => {
    await logout();
    router.push('/');
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'admin': return 'Administrator';
      case 'lab': return 'Lab Technician';
      case 'customer': return 'Customer';
      default: return 'User';
    }
  };

  return (
    <AppBar 
      position="fixed" 
      color="default" 
      elevation={1}
      sx={{ 
        width: { sm: `calc(100% - ${isCollapsed ? 70 : 250}px)` },
        ml: { sm: `${isCollapsed ? 70 : 250}px` },
        zIndex: (theme) => theme.zIndex.drawer - 1,
        backdropFilter: 'blur(8px)',
        borderBottom: '1px solid var(--color-divider)',
        backgroundColor: 'background.paper',
        transition: (theme) => theme.transitions.create(['width', 'margin'], {
          easing: theme.transitions.easing.sharp,
          duration: theme.transitions.duration.enteringScreen,
        }),
      }}
      className="backdrop-blur-md bg-paper/85 border-b border-divider"
    >
      <Toolbar sx={{ justifyContent: 'space-between' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Avatar 
            sx={{ bgcolor: 'primary.main', width: 36, height: 36 }}
            className="bg-primary"
          >
            A
          </Avatar>
          <Typography 
            variant="h6" 
            noWrap 
            component="div" 
            sx={{ fontWeight: 800, letterSpacing: '-0.5px' }}
            color="primary"
            className="font-extrabold text-primary tracking-tight cursor-pointer"
            onClick={() => router.push('/')}
          >
            Appenir<span className="text-secondary">.WEB</span>
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          {/* Theme Toggle */}
          <Tooltip title={`Switch to ${mode === 'light' ? 'dark' : 'light'} mode`}>
            <IconButton onClick={toggleTheme} color="inherit">
              {mode === 'dark' ? <Brightness7Icon /> : <Brightness4Icon />}
            </IconButton>
          </Tooltip>

          {/* User Details */}
          {isAuthenticated && user ? (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <Box sx={{ display: { xs: 'none', sm: 'block' }, textAlign: 'right' }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 600, lineHeight: 1.2 }}>
                  {user.name}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {getRoleLabel(user.role)}
                </Typography>
              </Box>
              <Tooltip title={user.email}>
                <Avatar sx={{ bgcolor: 'secondary.main', width: 36, height: 36 }} className="bg-secondary">
                  {user.name.charAt(0).toUpperCase()}
                </Avatar>
              </Tooltip>
              <Tooltip title="Log Out">
                <Button 
                  variant="outlined" 
                  color="error" 
                  size="small"
                  onClick={handleLogout}
                  startIcon={<LogoutIcon />}
                  sx={{ ml: 1 }}
                >
                  Logout
                </Button>
              </Tooltip>
            </Box>
          ) : (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <AccountCircleIcon color="action" />
              <Typography variant="body2" color="text.secondary" className="font-semibold text-textSecondary">
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
