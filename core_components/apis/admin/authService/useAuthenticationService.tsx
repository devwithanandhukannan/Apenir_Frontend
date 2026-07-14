import { useCallback } from "react";
import {
  useApi,
  MutationRequestOptions,
  BaseRequestOptions,
} from "@/core_components/hooks/useApi/useApi";
import { useAppDispatch } from "@/core_components/store/hooks";
import { logoutSuccess } from "@/core_components/store/authSlice";

export interface LoginRequest {
  email?: string;
  password?: string;
}

export interface LoginResponseData {
  accessToken: string;
  expiresIn: number;
  adminId: string;
  email: string;
  branchId: string | null;
  labId: string | null;
}

export interface LoginResponse {
  success: boolean;
  message: string;
  data: LoginResponseData;
  errors: any[];
}

export function useAuthenticationService() {
  const { post } = useApi();
  const dispatch = useAppDispatch();

  // Admin login API caller
  const adminLogin = useCallback(
    async (
      payload: LoginRequest,
      options?: Omit<
        MutationRequestOptions<LoginResponse, LoginRequest>,
        "endpoint" | "body" | "requireAuth"
      >,
    ) => {
      const response = await post<LoginResponse, LoginRequest>({
        endpoint: "/api/AdminAuth/login", // Target login endpoint
        body: payload,
        requireAuth: false, // Login call is public
        signal: options?.signal,
        onSuccess: (resData) => {
          if (options?.onSuccess) {
            options.onSuccess(resData);
          }
        },
        onError: (err) => {
          if (options?.onError) {
            options.onError(err);
          }
        },
        headers: options?.headers,
        params: options?.params,
      });

      return response;
    },
    [post],
  );

  // Authentication logout API caller
  const logout = useCallback(
    async (
      options?: Omit<BaseRequestOptions<any>, "endpoint" | "requireAuth">,
    ) => {
      const response = await post<any>({
        endpoint: "/api/Auth/logout", // Target logout endpoint
        requireAuth: true, // Requires bearer token authorization
        signal: options?.signal,
        onSuccess: (data) => {
          // Clear all session details from local storage
          if (typeof window !== "undefined") {
            localStorage.removeItem("auth_user");
          }

          // Reset auth state in redux
          dispatch(logoutSuccess());

          if (options?.onSuccess) {
            options.onSuccess(data);
          }
        },
        onError: (err) => {
          // Fallback cleanup in case of request errors
          if (typeof window !== "undefined") {
            localStorage.removeItem("auth_user");
          }

          dispatch(logoutSuccess());

          if (options?.onError) {
            options.onError(err);
          }
        },
        headers: options?.headers,
        params: options?.params,
      });

      return response;
    },
    [post, dispatch],
  );

  return {
    adminLogin,
    logout,
  };
}

export default useAuthenticationService;
