import React from "react";
import Head from "next/head";
import { LabConsole } from "@/component_library/admin";

export default function LabConsolePage() {
  return (
    <>
      <Head>
        <title>OmniLab MS - Lab Console</title>
        <meta name="description" content="Lab Console Dashboard" />
      </Head>
      <LabConsole />
    </>
  );
}
