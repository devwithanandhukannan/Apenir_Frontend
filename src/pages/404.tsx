import React from "react";
import Head from "next/head";
import { useRouter } from "next/router";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import HomeIcon from "@mui/icons-material/Home";

export default function Custom404() {
  const router = useRouter();

  return (
    <>
      <Head>
        <title>Page Not Found - Appenir.WEB</title>
      </Head>
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "100vh",
          bgcolor: "background.default",
          color: "text.primary",
          textAlign: "center",
          p: 3,
        }}
        className="flex flex-col items-center justify-center min-h-screen bg-background text-text-primary text-center p-6"
      >
        <Typography
          variant="h1"
          sx={{
            fontSize: { xs: "80px", sm: "120px" },
            fontWeight: 900,
            lineHeight: 1,
            mb: 2,
            background:
              "linear-gradient(135deg, var(--color-primary), var(--color-secondary))",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}
          className="text-7xl sm:text-9xl font-black mb-4 tracking-tighter"
        >
          404
        </Typography>
        <Typography variant="h5" sx={{ fontWeight: 700, mb: 1.5 }}>
          Oops! Page Not Found
        </Typography>
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{ maxWidth: 450, mb: 4 }}
        >
          The link you followed might be broken, or the page may have been
          removed. Let's get you back on track.
        </Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<HomeIcon />}
          onClick={() => router.push("/")}
          sx={{ px: 3, py: 1.5 }}
        >
          Return to Portal
        </Button>
      </Box>
    </>
  );
}

// Bypass dashboard layout
Custom404.getLayout = function getLayout(page: React.ReactNode) {
  return <>{page}</>;
};
