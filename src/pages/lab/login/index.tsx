import React from "react";
import Head from "next/head";
import LabLogin from "@/component_library/lab/lab_login";

export default function LabLoginPage() {
  return (
    <>
      <Head>
        <title>Appenir Lab - Staff Login</title>
        <meta
          name="description"
          content="Secure lab staff login for Appenir Lab Diagnostics Portal. Access your lab dashboard, manage test samples, and track results."
        />
      </Head>
      <LabLogin />
    </>
  );
}

// Bypass global Layout shell
LabLoginPage.getLayout = (page: React.ReactNode) => page;
