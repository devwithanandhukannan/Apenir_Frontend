import React from "react";
import Head from "next/head";
import AdminLogin from "@/component_library/admin/admin_login";

export default function AdminLoginPage() {
  return (
    <>
      <Head>
        <title>Appenir MS - Admin Login</title>
        <meta
          name="description"
          content="Secure administrative login for Appenir Management System."
        />
      </Head>
      <AdminLogin />
    </>
  );
}

// Bypass global Layout shell
AdminLoginPage.getLayout = (page: React.ReactNode) => page;
