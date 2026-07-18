import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export type UserRole = "admin" | "lab" | "customer" | "staff";

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isInitialized: boolean; // Tells us if we have checked localStorage for existing session
  isRefreshing: boolean; // True when proactively fetching access token on boot
}

const initialState: AuthState = {
  user: null,
  token: null,
  isAuthenticated: false,
  isInitialized: false,
  isRefreshing: false,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    loginSuccess: (
      state,
      action: PayloadAction<{ user: User; token: string }>,
    ) => {
      state.user = action.payload.user;
      state.token = action.payload.token;
      state.isAuthenticated = true;
      state.isInitialized = true;
      state.isRefreshing = false;

      // Save session info to localStorage (only user metadata, no tokens)
      if (typeof window !== "undefined") {
        localStorage.setItem("auth_user", JSON.stringify(action.payload.user));
      }
    },
    logoutSuccess: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      state.isInitialized = true;
      state.isRefreshing = false;

      // Clear session info from localStorage
      if (typeof window !== "undefined") {
        localStorage.removeItem("auth_user");
      }
    },
    initializeAuth: (state) => {
      if (typeof window !== "undefined") {
        const userJson = localStorage.getItem("auth_user");

        if (userJson) {
          try {
            state.user = JSON.parse(userJson);
            state.token = null; // Access token is in-memory only and starts as null on refresh
            state.isAuthenticated = false; // Start as false, wait for AuthInitializer refresh
            state.isRefreshing = true;
          } catch (e) {
            // Invalid data in localStorage, clean it up
            localStorage.removeItem("auth_user");
            state.isRefreshing = false;
          }
        } else {
          state.isRefreshing = false;
        }
      }
      state.isInitialized = true;
    },
    setRefreshing: (state, action: PayloadAction<boolean>) => {
      state.isRefreshing = action.payload;
    },
  },
});

export const { loginSuccess, logoutSuccess, initializeAuth, setRefreshing } =
  authSlice.actions;
export default authSlice.reducer;
