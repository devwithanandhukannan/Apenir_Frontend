import React from "react";
import { LabFinanceTab } from "./finance";
import { AppThemeProvider } from "@/core_components/theme/themeProvider";

export const BasicLabFinanceTab = () => {
  return (
    <AppThemeProvider>
      <LabFinanceTab labId="dummy-lab-1" />
    </AppThemeProvider>
  );
};
