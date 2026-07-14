import React from "react";
import Head from "next/head";
import LabLogin from "@/component_library/lab/lab_login";

export default function StaffLoginPage() {
  return (
    <>
      <Head>
        <title>Apenir — Staff Login</title>
        <meta
          name="description"
          content="Staff phlebotomist login for Apenir. Access your assigned appointments and manage sample collections."
        />
      </Head>
      <LabLogin />
    </>
  );
}

// Bypass global Layout shell (no sidebar for login page)
StaffLoginPage.getLayout = (page: React.ReactNode) => page;
