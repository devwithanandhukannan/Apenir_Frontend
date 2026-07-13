import React from "react";
import Head from "next/head";
import { LabPackages } from "@/component_library/lab/packages";

export default function LabPackagesPage() {
  return (
    <>
      <Head>
        <title>Appenir Lab - Packages</title>
        <meta
          name="description"
          content="Subscribe to platform diagnostic packages or create your own custom bundles."
        />
      </Head>
      <LabPackages />
    </>
  );
}
