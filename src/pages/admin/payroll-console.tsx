import React from "react";
import Head from "next/head";
import { PayrollConsole } from "@/component_library/admin";

export default function PayrollConsolePage() {
  return (
    <>
      <Head>
        <title>OmniLab MS - Admin Payroll Console</title>
        <meta
          name="description"
          content="Manage Monthly Lab Branch Settlements and Payouts"
        />
      </Head>
      <PayrollConsole />
    </>
  );
}
