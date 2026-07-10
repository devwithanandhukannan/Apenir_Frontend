import React from "react";
import { LabAppointmentsTab } from "./appointments";
import { AppThemeProvider } from "@/core_components/theme/themeProvider";

export const BasicLabAppointmentsTab = () => {
  return (
    <AppThemeProvider>
      <LabAppointmentsTab labId="dummy-lab-1" />
    </AppThemeProvider>
  );
};
