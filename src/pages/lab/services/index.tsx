import React from "react";
import Head from "next/head";
import Services from "@/component_library/lab/services";

export default function LabServicesPage() {
  return (
    <>
      <Head>
        <title>Appenir Lab - Service Catalog</title>
        <meta
          name="description"
          content="Manage diagnostic test items, custom branch overrides, and commission structures for Appenir Lab branch services."
        />
      </Head>
      <Services />
    </>
  );
}
