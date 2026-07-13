import React from "react";
import Head from "next/head";
import { PackagesConsole } from "@/component_library/admin";

export default function PackagesConsolePage() {
  return (
    <>
      <Head>
        <title>Appenir MS - Packages Console</title>
        <meta
          name="description"
          content="Packages Catalog — bundle diagnostic tests for lab subscriptions"
        />
      </Head>
      <PackagesConsole />
    </>
  );
}
