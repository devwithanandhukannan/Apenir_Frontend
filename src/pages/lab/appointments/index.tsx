import React from "react";
import Head from "next/head";
import Appointments from "@/component_library/lab/appointments";

export default function LabAppointmentsPage() {
  return (
    <>
      <Head>
        <title>Appenir Lab - Appointment Management</title>
        <meta
          name="description"
          content="Manage diagnostic appointments assigned to your laboratory branch. View scheduled slots, address coordinates, and collections details."
        />
      </Head>
      <Appointments />
    </>
  );
}
