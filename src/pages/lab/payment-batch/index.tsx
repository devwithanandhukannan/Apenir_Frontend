// Lab Payment Batch Management Page
import React from "react";
import Head from "next/head";
import PaymentBatch from "@/component_library/lab/payment_batch";

export default function LabPaymentBatchPage() {
  return (
    <>
      <Head>
        <title>Appenir Lab - Payment Batches</title>
        <meta
          name="description"
          content="Manage batch payments, verify platform commissions, and approve or reject payouts received at Appenir Lab branch."
        />
      </Head>
      <PaymentBatch />
    </>
  );
}
