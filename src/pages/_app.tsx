import React from "react";
import "@/core_components/styles/globals.css";
import type { AppProps } from "next/app";
import LayoutProviders from "./layout";
import Layout from "@/shared_features/Layout";

export default function App({ Component, pageProps }: AppProps) {
  // Support custom layout override per-page
  const getLayout =
    (Component as any).getLayout ||
    ((page: React.ReactNode) => <Layout>{page}</Layout>);

  return (
    <LayoutProviders>{getLayout(<Component {...pageProps} />)}</LayoutProviders>
  );
}
