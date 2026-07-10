import React from "react";
import { LabBatchPaymentTab } from "./batch_payment";
import { AppThemeProvider } from "@/core_components/theme/themeProvider";

export const BasicLabBatchPaymentTab = () => {
  return (
    <AppThemeProvider>
      <LabBatchPaymentTab labId="dummy-lab-1" />
    </AppThemeProvider>
  );
};
