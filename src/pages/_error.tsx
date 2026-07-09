import React from 'react';
import Head from 'next/head';
import { NextPageContext } from 'next';
import { useRouter } from 'next/router';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import RefreshIcon from '@mui/icons-material/Refresh';
import HomeIcon from '@mui/icons-material/Home';

interface ErrorProps {
  statusCode?: number;
}

function Error({ statusCode }: ErrorProps) {
  const router = useRouter();

  return (
    <>
      <Head>
        <title>Application Error - Appenir.WEB</title>
      </Head>
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100vh',
          bgcolor: 'background.default',
          color: 'text.primary',
          textAlign: 'center',
          p: 3,
        }}
        className="flex flex-col items-center justify-center min-h-screen bg-background text-text-primary text-center p-6"
      >
        <Typography
          variant="h1"
          sx={{
            fontSize: { xs: '80px', sm: '120px' },
            fontWeight: 900,
            lineHeight: 1,
            mb: 2,
            color: 'error.main',
          }}
          className="text-7xl sm:text-9xl font-black mb-4 text-error"
        >
          {statusCode ? statusCode : '500'}
        </Typography>
        <Typography variant="h5" sx={{ fontWeight: 700, mb: 1.5 }}>
          An Unexpected Error Occurred
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 450, mb: 4 }}>
          {statusCode
            ? `An error occurred on the server while resolving this request.`
            : 'An error occurred on the client application side.'}
        </Typography>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={() => router.reload()}
            sx={{ px: 3, py: 1.5 }}
          >
            Retry Page
          </Button>
          <Button
            variant="contained"
            color="primary"
            startIcon={<HomeIcon />}
            onClick={() => router.push('/')}
            sx={{ px: 3, py: 1.5 }}
          >
            Home Portal
          </Button>
        </Box>
      </Box>
    </>
  );
}

Error.getInitialProps = ({ res, err }: NextPageContext) => {
  const statusCode = res ? res.statusCode : err ? err.statusCode : 404;
  return { statusCode };
};

// Bypass dashboard layout
Error.getLayout = function getLayout(page: React.ReactNode) {
  return <>{page}</>;
};

export default Error;
