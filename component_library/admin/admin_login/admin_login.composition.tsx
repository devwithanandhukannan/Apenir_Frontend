import React from 'react';
import { AdminLogin } from './admin_login';
import { Provider } from 'react-redux';
import { store } from '@/core_components/store';
import { AppThemeProvider } from '@/core_components/theme/themeProvider';

export const BasicAdminLogin = () => {
  return (
    <Provider store={store}>
      <AppThemeProvider>
        <AdminLogin />
      </AppThemeProvider>
    </Provider>
  );
};
