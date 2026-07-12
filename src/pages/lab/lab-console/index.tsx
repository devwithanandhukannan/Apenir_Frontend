import React from "react";
import Head from "next/head";
import LabConsole from "@/component_library/lab/lab_console";

export default function LabConsolePage() {
  return (
    <>
      <Head>
        <title>Appenir Lab - Dashboard</title>
        <meta
          name="description"
          content="Lab-level management dashboard for Appenir Lab. Monitor samples, track turnaround times, manage staff, and view equipment status."
        />
      </Head>
      <LabConsole />
    </>
  );
}
