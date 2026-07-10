import React from "react";
import Head from "next/head";
import { CustomerConsole } from "@/component_library/admin";

export default function CustomerConsolePage() {
  return (
    <>
      <Head>
        <title>OmniLab MS - Customer Console</title>
        <meta name="description" content="Customer Console Dashboard" />
      </Head>
      <CustomerConsole />
    </>
  );
}
