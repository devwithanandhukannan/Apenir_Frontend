import React from 'react';
import Head from 'next/head';
import { useAppSelector } from '@/core_components/store/hooks';
import Typography from '@mui/material/Typography';
import Grid from '@mui/material/Grid';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Box from '@mui/material/Box';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import Chip from '@mui/material/Chip';
import Avatar from '@mui/material/Avatar';
import ScienceIcon from '@mui/icons-material/Science';
import PendingActionsIcon from '@mui/icons-material/PendingActions';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

export default function LabDashboard() {
  const { user } = useAppSelector((state) => state.auth);

  const samples = [
    { id: 'SMP-001', test: 'Complete Blood Count (CBC)', patient: 'Alice Smith', status: 'Completed', date: 'Jul 09, 2026' },
    { id: 'SMP-002', test: 'Comprehensive Metabolic Panel', patient: 'Bob Jones', status: 'Processing', date: 'Jul 09, 2026' },
    { id: 'SMP-003', test: 'Lipid Panel', patient: 'Charlie Brown', status: 'Pending', date: 'Jul 09, 2026' },
    { id: 'SMP-004', test: 'Thyroid Panel', patient: 'David Miller', status: 'Processing', date: 'Jul 08, 2026' },
  ];

  return (
    <>
      <Head>
        <title>Lab Dashboard - Appenir.WEB</title>
      </Head>

      <Box>
        {/* Welcome Section */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" sx={{ fontWeight: 800, mb: 1, letterSpacing: '-0.5px' }}>
            Lab Dashboard
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Welcome back, <strong>{user?.name || 'Lab Specialist'}</strong>. Here is your sample processing pipeline.
          </Typography>
        </Box>

        {/* Stats Grid */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid size={{ xs: 12, sm: 4 }}>
            <Card>
              <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Avatar sx={{ bgcolor: 'secondary.light', color: 'secondary.main', width: 48, height: 48 }}>
                  <ScienceIcon />
                </Avatar>
                <div>
                  <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>Active Tests</Typography>
                  <Typography variant="h5" sx={{ fontWeight: 800 }}>8 Active</Typography>
                </div>
              </CardContent>
            </Card>
          </Grid>

          <Grid size={{ xs: 12, sm: 4 }}>
            <Card>
              <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Avatar sx={{ bgcolor: 'warning.light', color: 'warning.main', width: 48, height: 48 }}>
                  <PendingActionsIcon />
                </Avatar>
                <div>
                  <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>Awaiting Verification</Typography>
                  <Typography variant="h5" sx={{ fontWeight: 800 }}>3 Pending</Typography>
                </div>
              </CardContent>
            </Card>
          </Grid>

          <Grid size={{ xs: 12, sm: 4 }}>
            <Card>
              <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Avatar sx={{ bgcolor: 'success.light', color: 'success.main', width: 48, height: 48 }}>
                  <CheckCircleIcon />
                </Avatar>
                <div>
                  <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>Completed Today</Typography>
                  <Typography variant="h5" sx={{ fontWeight: 800 }}>14 Solved</Typography>
                </div>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Sample Status Table */}
        <Card>
          <CardContent>
            <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
              Sample Analysis Pipeline
            </Typography>
            <TableContainer component={Paper} elevation={0} sx={{ border: '1px solid var(--color-divider)' }}>
              <Table aria-label="samples pipeline table">
                <TableHead sx={{ bgcolor: 'var(--color-background)' }}>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 700 }}>Sample ID</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Requested Analysis</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Patient Name</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Request Date</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {samples.map((sample) => (
                    <TableRow key={sample.id} hover>
                      <TableCell sx={{ fontWeight: 600 }}>{sample.id}</TableCell>
                      <TableCell>{sample.test}</TableCell>
                      <TableCell>{sample.patient}</TableCell>
                      <TableCell>{sample.date}</TableCell>
                      <TableCell>
                        <Chip 
                          label={sample.status} 
                          size="small"
                          color={sample.status === 'Completed' ? 'success' : sample.status === 'Processing' ? 'secondary' : 'default'}
                          sx={{ fontWeight: 600 }}
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>
      </Box>
    </>
  );
}
