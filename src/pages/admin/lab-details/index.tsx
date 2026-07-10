import React from "react";
import Head from "next/head";
import { LabDetails } from "@/component_library/admin";

export default function LabDetailsPage() {
  return (
    <>
      <Head>
        <title>OmniLab MS - Lab Details</title>
        <meta
          name="description"
          content="Lab details and staff management console."
        />
      </Head>
      <LabDetails />
    </>
  );
}
