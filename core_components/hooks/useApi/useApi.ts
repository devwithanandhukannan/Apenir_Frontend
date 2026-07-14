import { useState, useCallback, useRef, useEffect } from "react";
import axios, { AxiosError, AxiosRequestConfig, Method } from "axios";
import { useAppDispatch, useAppSelector } from "@/core_components/store/hooks";
import { loginSuccess, logoutSuccess } from "@/core_components/store/authSlice";

// Configurable constant for local storage authentication key
export const TOKEN_KEY = "auth_token";

// Fallback base URL for the api calls
const DEFAULT_BASE_URL =
  typeof process !== "undefined" ? process.env.NEXT_PUBLIC_API_URL || "" : "";

// Shared active promise and cache to coordinate concurrent token refresh requests across hook instances
let activeRefreshPromise: Promise<string | null> | null = null;
let lastRefreshedToken: string | null = null;
let lastRefreshTime = 0;

// Consistent response structure returned by request methods
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: AxiosError;
}

// Request options shared across all HTTP methods
export interface BaseRequestOptions<T> {
  endpoint: string;
  params?: Record<string, any>;
  headers?: Record<string, string>;
  signal?: AbortSignal;
  requireAuth?: boolean;
  onSuccess?: (data: T) => void;
  onError?: (error: AxiosError) => void;
}

// Request options containing a request body (for POST, PUT, PATCH)
export interface MutationRequestOptions<T, B> extends BaseRequestOptions<T> {
  body?: B;
}

export function useApi() {
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<AxiosError | null>(null);

  const dispatch = useAppDispatch();
  const currentUser = useAppSelector((state) => state.auth.user);
  const token = useAppSelector((state) => state.auth.token);

  // Store refs to ensure request callback is stable and never uses stale closure tokens/user info
  const currentUserRef = useRef(currentUser);
  const tokenRef = useRef(token);

  useEffect(() => {
    currentUserRef.current = currentUser;
  }, [currentUser]);

  useEffect(() => {
    tokenRef.current = token;
  }, [token]);

  // Track pending active controllers to abort them on component unmount
  const activeControllers = useRef<Set<AbortController>>(new Set());

  useEffect(() => {
    const controllers = activeControllers.current;
    return () => {
      controllers.forEach((controller) => controller.abort());
    };
  }, []);

  const request = useCallback(
    async <T = any, B = any>(
      method: Method,
      options: MutationRequestOptions<T, B>,
    ): Promise<ApiResponse<T>> => {
      const {
        endpoint,
        body,
        params,
        headers: customHeaders = {},
        signal,
        requireAuth = true,
        onSuccess,
        onError,
      } = options;

      setLoading(true);
      setError(null);

      // Create a local controller if no external signal is provided
      const localController = new AbortController();
      const requestSignal = signal || localController.signal;

      if (!signal) {
        activeControllers.current.add(localController);
      }

      // Headers construction
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
        ...customHeaders,
      };

      // Retrieve auth token from ref (in-memory only, SSR Safe)
      const currentToken = tokenRef.current;
      if (requireAuth && currentToken) {
        headers["Authorization"] = `Bearer ${currentToken}`;
      }

      const isFullUrl =
        endpoint.startsWith("http://") || endpoint.startsWith("https://");
      const url = isFullUrl ? endpoint : `${DEFAULT_BASE_URL}${endpoint}`;

      try {
        const config: AxiosRequestConfig = {
          method,
          url,
          headers,
          params,
          data: body,
          signal: requestSignal,
          withCredentials: true,
        };

        const response = await axios<T>(config);
        const responseData = response.data;

        if (onSuccess) {
          onSuccess(responseData);
        }

        return {
          success: true,
          data: responseData,
        };
      } catch (err) {
        // Detect and ignore aborted requests
        if (axios.isCancel(err)) {
          return {
            success: false,
            error: err as AxiosError,
          };
        }

        const axiosError = err as AxiosError;

        // Verify if the endpoint is an auth action to prevent infinite refresh recursion loops
        const isAuthEndpoint =
          endpoint.includes("/Auth/refresh") ||
          endpoint.includes("/auth/refresh") ||
          endpoint.includes("/login") ||
          endpoint.includes("/logout");

        // Check if error is 401 Unauthorized, authentication is required, and it's not a recursive call
        if (
          axiosError.response?.status === 401 &&
          requireAuth &&
          !isAuthEndpoint
        ) {
          try {
            let newAccessToken: string | null = null;

            // Reuse recently refreshed token if it was refreshed within the last 10 seconds to resolve race conditions
            const now = Date.now();
            if (lastRefreshedToken && now - lastRefreshTime < 10000) {
              newAccessToken = lastRefreshedToken;
            } else {
              // Coordinate concurrent refresh token requests
              if (!activeRefreshPromise) {
                activeRefreshPromise = (async () => {
                  try {
                    const refreshResponse = await axios.post<any>(
                      `${DEFAULT_BASE_URL}/api/Auth/refresh`,
                      {},
                      { withCredentials: true },
                    );

                    if (
                      refreshResponse.data &&
                      refreshResponse.data.success &&
                      refreshResponse.data.data?.accessToken
                    ) {
                      const tokenVal = refreshResponse.data.data.accessToken;
                      lastRefreshedToken = tokenVal;
                      lastRefreshTime = Date.now();
                      return tokenVal;
                    }
                    return null;
                  } catch (e) {
                    return null;
                  } finally {
                    activeRefreshPromise = null;
                  }
                })();
              }

              newAccessToken = await activeRefreshPromise;
            }

            if (newAccessToken) {
              // Update Redux state
              let userToLogin = currentUserRef.current;
              if (!userToLogin && typeof window !== "undefined") {
                const userJson = localStorage.getItem("auth_user");
                if (userJson) {
                  try {
                    userToLogin = JSON.parse(userJson);
                  } catch (e) {}
                }
              }

              if (userToLogin) {
                dispatch(
                  loginSuccess({ user: userToLogin, token: newAccessToken }),
                );
              }

              // Retry the original failed request
              const retryHeaders = {
                ...headers,
                Authorization: `Bearer ${newAccessToken}`,
              };

              const retryConfig: AxiosRequestConfig = {
                method,
                url,
                headers: retryHeaders,
                params,
                data: body,
                signal: requestSignal,
                withCredentials: true,
              };

              const retryResponse = await axios<T>(retryConfig);
              const retryResponseData = retryResponse.data;

              if (onSuccess) {
                onSuccess(retryResponseData);
              }

              return {
                success: true,
                data: retryResponseData,
              };
            } else {
              // Clear local credentials and dispatch logout if refresh token expired/revoked
              if (typeof window !== "undefined") {
                localStorage.removeItem("auth_user");
              }
              dispatch(logoutSuccess());

              const customError = new Error(
                "Session expired. Please log in again.",
              ) as AxiosError;
              setError(customError);

              if (onError) {
                onError(customError);
              }

              return {
                success: false,
                error: customError,
              };
            }
          } catch (refreshErr) {
            // Clear local credentials and dispatch logout if refresh token expired/revoked
            if (typeof window !== "undefined") {
              localStorage.removeItem("auth_user");
            }
            dispatch(logoutSuccess());

            const refreshAxiosError = refreshErr as AxiosError;
            setError(refreshAxiosError);

            if (onError) {
              onError(refreshAxiosError);
            }

            return {
              success: false,
              error: refreshAxiosError,
            };
          }
        }

        setError(axiosError);

        if (onError) {
          onError(axiosError);
        }

        return {
          success: false,
          error: axiosError,
        };
      } finally {
        if (!signal) {
          activeControllers.current.delete(localController);
        }
        setLoading(false);
      }
    },
    [dispatch],
  );

  const get = useCallback(
    <T = any>(options: BaseRequestOptions<T>) => request<T>("GET", options),
    [request],
  );

  const post = useCallback(
    <T = any, B = any>(options: MutationRequestOptions<T, B>) =>
      request<T, B>("POST", options),
    [request],
  );

  const put = useCallback(
    <T = any, B = any>(options: MutationRequestOptions<T, B>) =>
      request<T, B>("PUT", options),
    [request],
  );

  const patch = useCallback(
    <T = any, B = any>(options: MutationRequestOptions<T, B>) =>
      request<T, B>("PATCH", options),
    [request],
  );

  const del = useCallback(
    <T = any>(options: BaseRequestOptions<T>) => request<T>("DELETE", options),
    [request],
  );

  return {
    loading,
    error,
    get,
    post,
    put,
    patch,
    delete: del,
  };
}
