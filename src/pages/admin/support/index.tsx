import React from "react";
import Head from "next/head";
import AdminSupport from "@/component_library/admin/support";

export default function AdminSupportPage() {
  return (
    <>
      <Head>
        <title>Apenir Admin - Support & Master Documentation</title>
        <meta
          name="description"
          content="Comprehensive operating documentation, administrative tutorials, system guides, and engineering helpdesk for Apenir Platform Administrators."
        />
      </Head>
      <AdminSupport />
    </>
  );
}
