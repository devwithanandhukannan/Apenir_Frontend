import React from "react";
import Head from "next/head";
import { StaffConsole } from "@/component_library/admin";

export default function StaffConsolePage() {
  return (
    <>
      <Head>
        <title>OmniLab MS - Staff Console</title>
        <meta name="description" content="Staff Console Dashboard" />
      </Head>
      <StaffConsole />
    </>
  );
}
