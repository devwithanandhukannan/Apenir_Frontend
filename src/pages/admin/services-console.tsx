import React from "react";
import Head from "next/head";
import { ServicesConsole } from "@/component_library/admin";

export default function ServicesConsolePage() {
  return (
    <>
      <Head>
        <title>OmniLab MS - Services Console</title>
        <meta
          name="description"
          content="Services Catalog and Category Management"
        />
      </Head>
      <ServicesConsole />
    </>
  );
}
