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
}

const initialState: AuthState = {
  user: null,
  token: null,
  isAuthenticated: false,
  isInitialized: false,
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

      // Save session info to localStorage
      if (typeof window !== "undefined") {
        localStorage.setItem("auth_user", JSON.stringify(action.payload.user));
        localStorage.setItem("auth_token", action.payload.token);
        localStorage.setItem("token", action.payload.token);
      }
    },
    logoutSuccess: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      state.isInitialized = true;

      // Clear session info from localStorage
      if (typeof window !== "undefined") {
        localStorage.removeItem("auth_user");
        localStorage.removeItem("auth_token");
        localStorage.removeItem("token");
      }
    },
    initializeAuth: (state) => {
      if (typeof window !== "undefined") {
        const userJson = localStorage.getItem("auth_user");
        const token =
          localStorage.getItem("auth_token") || localStorage.getItem("token");

        if (userJson && token) {
          try {
            state.user = JSON.parse(userJson);
            state.token = token;
            state.isAuthenticated = true;
          } catch (e) {
            // Invalid data in localStorage, clean it up
            localStorage.removeItem("auth_user");
            localStorage.removeItem("auth_token");
          }
        }
      }
      state.isInitialized = true;
    },
  },
});

export const { loginSuccess, logoutSuccess, initializeAuth } =
  authSlice.actions;
export default authSlice.reducer;
