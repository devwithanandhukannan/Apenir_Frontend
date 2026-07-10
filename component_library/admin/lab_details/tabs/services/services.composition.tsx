import React from "react";
import { LabServicesTab } from "./services";
import { AppThemeProvider } from "@/core_components/theme/themeProvider";

export const BasicLabServicesTab = () => {
  return (
    <AppThemeProvider>
      <LabServicesTab labId="dummy-lab-1" />
    </AppThemeProvider>
  );
};
