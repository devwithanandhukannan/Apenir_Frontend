import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/router";
import { useAppDispatch, useAppSelector } from "@/core_components/store/hooks";
import { loginSuccess } from "@/core_components/store/authSlice";
import { useAbortController } from "@/core_components/hooks/useAbortController/useAbortController";
import {
  useLabService,
  LabLoginRequest,
  LabLoginResponse,
} from "@/core_components/apis/admin/labService";

// ---------- Hook ----------
export function useLabLogin() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { isAuthenticated, user, isInitialized } = useAppSelector(
    (state) => state.auth,
  );

  const { labLogin } = useLabService();
  const { controllers } = useAbortController(["LAB_LOGIN_REQUEST"]);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Forget Password Dialog State
  const [openResetDialog, setOpenResetDialog] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [resetSent, setResetSent] = useState(false);

  // Snackbar notification
  const [openSnackbar, setOpenSnackbar] = useState(false);

  // Redirect if already authenticated as a lab or staff user
  useEffect(() => {
    if (isInitialized && isAuthenticated && user) {
      if (user.role === "lab") {
        router.replace("/lab/lab-console");
      } else if (user.role === "staff") {
        router.replace("/staff");
      } else {
        router.replace("/");
      }
    }
  }, [isAuthenticated, user, isInitialized, router]);

  // Handle successful login API response
  const handleSuccess = useCallback(
    (response: LabLoginResponse) => {
      if (response.success && response.data) {
        const { labId, email: userEmail, accessToken, role } = response.data;

        // Cache tokens in local storage
        if (typeof window !== "undefined") {
          localStorage.setItem("token", accessToken);
          localStorage.setItem("auth_token", accessToken);
        }

        const isStaff = role === "staff";
        const labUser = {
          id: labId,
          name: isStaff ? "Staff Member" : "Lab Staff",
          email: userEmail,
          role: (isStaff ? "staff" : "lab") as any,
        };

        // Store authenticated fields in Redux auth store
        dispatch(loginSuccess({ user: labUser, token: accessToken }));
        setOpenSnackbar(true);
      } else {
        setError(response.message || "Login failed.");
        setLoading(false);
      }
    },
    [dispatch],
  );

  // Handle API response errors
  const handleError = useCallback((err: any) => {
    setError(
      err.response?.data?.message || err.message || "An error occurred.",
    );
    setLoading(false);
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!email || !password) {
      setError("Please fill in all fields.");
      return;
    }

    setLoading(true);

    // Cancel any previous login requests before sending a new one
    controllers.LAB_LOGIN_REQUEST.reset();

    // Call the lab login service from useLabService
    labLogin(
      { email, password },
      {
        signal: controllers.LAB_LOGIN_REQUEST.signal,
        onSuccess: handleSuccess,
        onError: handleError,
      },
    );
  };

  const handleSendReset = (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetEmail) return;
    setResetSent(true);
    setTimeout(() => {
      setOpenResetDialog(false);
      setResetEmail("");
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

export default useLabLogin;
