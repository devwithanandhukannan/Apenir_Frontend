import React, { useEffect } from "react";
import { Provider } from "react-redux";
import { store } from "@/core_components/store";
import { useAppDispatch } from "@/core_components/store/hooks";
import { initializeAuth } from "@/core_components/store/authSlice";
import { AppThemeProvider } from "@/core_components/theme/themeProvider";
import { AuthGuard } from "@/core_components/guards/AuthGuard";

interface LayoutProvidersProps {
  children: React.ReactNode;
}

// Internal wrapper to access the Redux dispatch after the Provider is initialized
const AuthInitializer: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const dispatch = useAppDispatch();

  useEffect(() => {
    dispatch(initializeAuth());
  }, [dispatch]);

  return <>{children}</>;
};

export const LayoutProviders: React.FC<LayoutProvidersProps> = ({
  children,
}) => {
  return (
    <Provider store={store}>
      <AppThemeProvider>
        <AuthInitializer>
          <AuthGuard>{children}</AuthGuard>
        </AuthInitializer>
      </AppThemeProvider>
    </Provider>
  );
};

export default LayoutProviders;
