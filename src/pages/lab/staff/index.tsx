import React from "react";
import Head from "next/head";
import Staff from "@/component_library/lab/staff";

export default function LabStaffPage() {
  return (
    <>
      <Head>
        <title>Appenir Lab - Staff Management</title>
        <meta
          name="description"
          content="Manage staff associated with the laboratory. View pathologists, technicians, phlebotomists, and other personnel details."
        />
      </Head>
      <Staff />
    </>
  );
}
