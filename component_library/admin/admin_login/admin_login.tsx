import React from 'react';
import { useAdminLogin } from './useAdminLogin';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Checkbox from '@mui/material/Checkbox';
import FormControlLabel from '@mui/material/FormControlLabel';
import Link from '@mui/material/Link';
import Alert from '@mui/material/Alert';
import IconButton from '@mui/material/IconButton';
import InputAdornment from '@mui/material/InputAdornment';
import Avatar from '@mui/material/Avatar';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import EmailIcon from '@mui/icons-material/Email';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogActions from '@mui/material/DialogActions';
import Snackbar from '@mui/material/Snackbar';

export const AdminLogin: React.FC = () => {
  const {
    email,
    setEmail,
    password,
    setPassword,
    showPassword,
    setShowPassword,
    rememberMe,
    setRememberMe,
    error,
    loading,
    openResetDialog,
    setOpenResetDialog,
    resetEmail,
    setResetEmail,
    resetSent,
    openSnackbar,
    setOpenSnackbar,
    handleLogin,
    handleSendReset,
    router,
  } = useAdminLogin();

  return (
    <Grid container sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
      {/* Left Column: Image Illustration (Hidden on mobile) */}
      <Grid 
        size={{ xs: 12, md: 6 }} 
        sx={{ 
          position: 'relative',
          display: { xs: 'none', md: 'flex' },
          flexDirection: 'column',
          justifyContent: 'space-between',
          p: 4,
          backgroundImage: 'linear-gradient(135deg, rgba(var(--color-primary), 0.95), rgba(var(--color-secondary), 0.95))',
          color: '#fff',
          overflow: 'hidden',
        }}
      >
        {/* Background Image with opacity overlay */}
        <Box 
          component="img"
          src="/illustrations/lab_illustration.png"
          alt="Laboratory Illustration"
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            opacity: 0.12,
            zIndex: 1,
          }}
        />

        {/* Actual Visible Illustration Centered */}
        <Box 
          sx={{ 
            zIndex: 2, 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center', 
            justifyContent: 'center', 
            height: '100%',
            width: '100%'
          }}
        >
          <Box 
            component="img"
            src="/illustrations/lab_illustration.png"
            alt="Laboratory Illustration Logo"
            sx={{
              width: '85%',
              maxWidth: 480,
              borderRadius: '16px',
              boxShadow: '0 20px 40px rgba(0, 0, 0, 0.25)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              mb: 4,
              transition: 'transform 0.5s ease',
              '&:hover': {
                transform: 'scale(1.02)'
              }
            }}
          />
          
          <Typography variant="h4" sx={{ fontWeight: 800, mb: 1, textAlign: 'center', letterSpacing: '-0.5px' }}>
            Empowering Lab Workflow
          </Typography>
          <Typography variant="body1" sx={{ color: 'rgba(255, 255, 255, 0.8)', textAlign: 'center', maxWidth: 400 }}>
            Unlock actionable analytics, track critical samples, and run your daily diagnostics operation in one smart dashboard.
          </Typography>
        </Box>

        {/* Bottom Footer Info on Image Section */}
        <Box sx={{ zIndex: 2, display: 'flex', justifyContent: 'space-between', width: '100%' }}>
          <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.6)' }}>
            © {new Date().getFullYear()} Appenir MS. All rights reserved.
          </Typography>
          <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.6)' }}>
            v1.0.0
          </Typography>
        </Box>
      </Grid>

      {/* Right Column: Form */}
      <Grid 
        size={{ xs: 12, md: 6 }} 
        sx={{ 
          display: 'flex', 
          flexDirection: 'column', 
          justifyContent: 'center',
          alignItems: 'center',
          p: { xs: 3, sm: 6, md: 8 },
          bgcolor: 'background.paper',
          borderLeft: '1px solid var(--color-border)',
        }}
      >
        {/* Back to Home Button */}
        <Box sx={{ alignSelf: 'flex-start', mb: 4 }}>
          <Button
            startIcon={<ArrowBackIcon />}
            onClick={() => router.push('/')}
            sx={{ 
              color: 'text.secondary', 
              textTransform: 'none', 
              fontWeight: 600,
              '&:hover': { color: 'primary.main' }
            }}
          >
            Main Portal
          </Button>
        </Box>

        <Box sx={{ width: '100%', maxWidth: 400 }}>
          {/* Header Brand */}
          <Box sx={{ mb: 4, display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Avatar sx={{ bgcolor: 'primary.main', width: 44, height: 44 }} className="bg-primary">
              <AdminPanelSettingsIcon />
            </Avatar>
            <Box>
              <Typography variant="h5" sx={{ fontWeight: 800, letterSpacing: '-0.5px', lineHeight: 1.1 }}>
                Appenir<span className="text-secondary"> MS</span>
              </Typography>
              <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                ADMIN CONSOLE
              </Typography>
            </Box>
          </Box>

          <Box sx={{ mb: 3 }}>
            <Typography variant="h5" sx={{ fontWeight: 800, mb: 1, letterSpacing: '-0.3px' }}>
              Welcome back!
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Please enter your credentials to log in to the administrator portal.
            </Typography>
          </Box>

          {/* Error Message */}
          {error && (
            <Alert severity="error" sx={{ mb: 3, borderRadius: '8px' }}>
              {error}
            </Alert>
          )}

          {/* Form */}
          <Box component="form" onSubmit={handleLogin} noValidate>
            <TextField
              margin="normal"
              required
              fullWidth
              id="email"
              label="Admin Email Address"
              name="email"
              autoComplete="email"
              autoFocus
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <EmailIcon color="action" fontSize="small" />
                    </InputAdornment>
                  ),
                }
              }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: '8px',
                }
              }}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              name="password"
              label="Password"
              type={showPassword ? 'text' : 'password'}
              id="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <LockOutlinedIcon color="action" fontSize="small" />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        aria-label="toggle password visibility"
                        onClick={() => setShowPassword(!showPassword)}
                        edge="end"
                      >
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }
              }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: '8px',
                }
              }}
            />

            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 2, mb: 3 }}>
              <FormControlLabel
                control={
                  <Checkbox 
                    value="remember" 
                    color="primary" 
                    checked={rememberMe} 
                    onChange={(e) => setRememberMe(e.target.checked)}
                    sx={{ borderRadius: '4px' }}
                  />
                }
                label={<Typography variant="body2" sx={{ fontWeight: 500 }}>Remember me</Typography>}
              />
              <Link
                component="button"
                type="button"
                variant="body2"
                onClick={() => setOpenResetDialog(true)}
                sx={{ 
                  fontWeight: 600, 
                  textDecoration: 'none',
                  color: 'primary.main',
                  '&:hover': { textDecoration: 'underline' }
                }}
              >
                Forgot password?
              </Link>
            </Box>

            <Button
              type="submit"
              fullWidth
              variant="contained"
              disabled={loading}
              sx={{
                py: 1.4,
                borderRadius: '8px',
                fontWeight: 700,
                textTransform: 'none',
                fontSize: '15px',
                backgroundColor: 'primary.main',
                boxShadow: 'none',
                '&:hover': {
                  backgroundColor: 'primary.dark',
                  boxShadow: 'none',
                }
              }}
            >
              {loading ? 'Authenticating...' : 'Sign In'}
            </Button>
          </Box>

          {/* Demo Credentials Alert Helper */}
          <Alert 
            severity="info" 
            sx={{ 
              mt: 4, 
              borderRadius: '8px', 
              '& .MuiAlert-message': { width: '100%' } 
            }}
          >
            <Typography variant="caption" sx={{ fontWeight: 700, display: 'block', mb: 0.5 }}>
              DEMO CREDENTIALS:
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.2 }}>
              <Typography variant="caption" sx={{ fontFamily: 'monospace' }}>
                Email: <strong>admin@appenir.com</strong>
              </Typography>
              <Typography variant="caption" sx={{ fontFamily: 'monospace' }}>
                Password: <strong>admin123</strong>
              </Typography>
            </Box>
          </Alert>
        </Box>
      </Grid>

      {/* Forgot Password Dialog */}
      <Dialog 
        open={openResetDialog} 
        onClose={() => setOpenResetDialog(false)}
        slotProps={{
          paper: {
            sx: { borderRadius: '12px', p: 1 }
          }
        }}
      >
        <DialogTitle sx={{ fontWeight: 800 }}>Reset Admin Password</DialogTitle>
        <Box component="form" onSubmit={handleSendReset}>
          <DialogContent>
            <DialogContentText sx={{ mb: 2 }}>
              To reset your password, please enter your registered administrator email address. We will send you instructions shortly.
            </DialogContentText>
            <TextField
              autoFocus
              margin="dense"
              id="reset-email"
              label="Email Address"
              type="email"
              fullWidth
              variant="outlined"
              required
              value={resetEmail}
              onChange={(e) => setResetEmail(e.target.value)}
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <EmailIcon color="action" fontSize="small" />
                    </InputAdornment>
                  ),
                }
              }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: '8px',
                }
              }}
            />
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 2 }}>
            <Button 
              onClick={() => setOpenResetDialog(false)} 
              sx={{ textTransform: 'none', fontWeight: 600, color: 'text.secondary' }}
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              variant="contained"
              disabled={resetSent}
              sx={{ 
                textTransform: 'none', 
                fontWeight: 700,
                borderRadius: '8px',
                backgroundColor: 'primary.main'
              }}
            >
              {resetSent ? 'Sending...' : 'Send Reset Link'}
            </Button>
          </DialogActions>
        </Box>
      </Dialog>

      {/* Success Snackbar */}
      <Snackbar
        open={openSnackbar}
        autoHideDuration={2000}
        onClose={() => setOpenSnackbar(false)}
        message="Login successful! Redirecting..."
      />
    </Grid>
  );
};

export default AdminLogin;
