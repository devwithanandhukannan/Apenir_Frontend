import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/router';
import { useAppDispatch, useAppSelector } from '@/core_components/store/hooks';
import { loginSuccess } from '@/core_components/store/authSlice';
import { useAuthenticationService } from '@/core_components/apis/admin/authService/useAuthenticationService';
import { useAbortController } from '@/core_components/hooks/useAbortController/useAbortController';

export function useAdminLogin() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { isAuthenticated, user, isInitialized } = useAppSelector((state) => state.auth);

  const { adminLogin } = useAuthenticationService();
  const { controllers } = useAbortController(['LOGIN_REQUEST']);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Forget Password Dialog State
  const [openResetDialog, setOpenResetDialog] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetSent, setResetSent] = useState(false);

  // Snackbar notification
  const [openSnackbar, setOpenSnackbar] = useState(false);

  useEffect(() => {
    if (isInitialized && isAuthenticated && user) {
      if (user.role === 'admin') {
        router.replace('/admin');
      } else {
        router.replace('/');
      }
    }
  }, [isAuthenticated, user, isInitialized, router]);

  // Handle successful login API response
  const handleSuccess = useCallback(
    (response: any) => {
      if (response.success && response.data) {
        const { adminId, email: userEmail, accessToken } = response.data;
        const mockUser = {
          id: adminId,
          name: 'Admin',
          email: userEmail,
          role: 'admin' as const,
        };
        // Store authenticated fields in Redux auth store
        dispatch(loginSuccess({ user: mockUser, token: accessToken }));
        setOpenSnackbar(true);
      } else {
        setError(response.message || 'Login failed.');
        setLoading(false);
      }
    },
    [dispatch]
  );

  // Handle API response errors
  const handleError = useCallback(
    (err: any) => {
      console.log("error");
      setError(err.response?.data?.message || err.message || 'An error occurred.');
      setLoading(false);
    },
    []
  );

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!email || !password) {
      setError('Please fill in all fields.');
      return;
    }

    setLoading(true);

    // Cancel any previous login requests before sending a new one
    controllers.LOGIN_REQUEST.reset();
    
    // Call the login service, passing the credentials, handleSuccess callback, error callback, and abort signal
    adminLogin(
      { email, password },
      {
        signal: controllers.LOGIN_REQUEST.signal,
        onSuccess: handleSuccess,
        onError: handleError,
      }
    );
  };

  const handleSendReset = (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetEmail) return;
    setResetSent(true);
    setTimeout(() => {
      setOpenResetDialog(false);
      setResetEmail('');
      setResetSent(false);
      alert(`Password reset instructions have been sent to ${resetEmail}`);
    }, 1000);
  };

  return {
    email,
    setEmail,
    password,
    setPassword,
    showPassword,
    setShowPassword,
    rememberMe,
    setRememberMe,
    error,
    setError,
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
  };
}
export default useAdminLogin;
