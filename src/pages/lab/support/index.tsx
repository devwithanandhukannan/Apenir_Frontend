import React from "react";
import Head from "next/head";
import Support from "@/component_library/lab/support";

export default function LabSupportPage() {
  return (
    <>
      <Head>
        <title>Appenir Lab - Support & Documentation</title>
        <meta
          name="description"
          content="Comprehensive step-by-step documentation, user guides, operating instructions, and support desk for Apenir Laboratory portal users."
        />
      </Head>
      <Support />
    </>
  );
}
