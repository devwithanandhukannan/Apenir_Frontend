import React from 'react';
import Head from 'next/head';
import { useAppSelector } from '@/core_components/store/hooks';
import Typography from '@mui/material/Typography';
import Grid from '@mui/material/Grid';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Avatar from '@mui/material/Avatar';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import Divider from '@mui/material/Divider';
import Chip from '@mui/material/Chip';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import PaymentIcon from '@mui/icons-material/Payment';

export default function CustomerDashboard() {
  const { user } = useAppSelector((state) => state.auth);

  const reports = [
    { id: 'REP-742', name: 'Annual Health Checkup', date: 'June 14, 2026', file: 'health_checkup_2026.pdf' },
    { id: 'REP-301', name: 'COVID-19 Diagnostic Test', date: 'March 10, 2026', file: 'covid_negative_rtpcr.pdf' },
  ];

  return (
    <>
      <Head>
        <title>Customer Portal - Appenir.WEB</title>
      </Head>

      <Box>
        {/* Welcome Section */}
        <Box sx={{ mb: 4, display: 'flex', alignItems: 'center', gap: 2 }}>
          <Avatar 
            sx={{ bgcolor: 'primary.main', width: 56, height: 56, fontSize: '24px', fontWeight: 800 }}
            className="bg-primary font-bold"
          >
            {user?.name?.charAt(0).toUpperCase() || 'C'}
          </Avatar>
          <div>
            <Typography variant="h4" sx={{ fontWeight: 800, mb: 0.5, letterSpacing: '-0.5px' }}>
              My Account
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Logged in as <strong>{user?.email}</strong>. View your medical files and upcoming appointments.
            </Typography>
          </div>
        </Box>

        {/* Action Widgets */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid size={{ xs: 12, md: 4 }}>
            <Card sx={{ height: '100%' }}>
              <CardContent sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 700, display: 'flex', alignItems: 'center', gap: 1 }}>
                  <CalendarTodayIcon color="primary" /> Next Appointment
                </Typography>
                <Divider />
                <Typography variant="body2" sx={{ fontWeight: 600 }}>General Health Consultation</Typography>
                <Typography variant="caption" color="text.secondary">Date: July 15, 2026 at 09:30 AM</Typography>
                <Typography variant="caption" color="text.secondary">Doctor: Dr. Sarah Connor</Typography>
                <Button variant="outlined" size="small" fullWidth sx={{ mt: 1 }}>
                  Reschedule
                </Button>
              </CardContent>
            </Card>
          </Grid>

          <Grid size={{ xs: 12, md: 4 }}>
            <Card sx={{ height: '100%' }}>
              <CardContent sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 700, display: 'flex', alignItems: 'center', gap: 1 }}>
                  <PaymentIcon color="secondary" /> Account Balance
                </Typography>
                <Divider />
                <Typography variant="h5" sx={{ fontWeight: 800, color: 'success.main' }}>
                  $0.00
                </Typography>
                <Typography variant="caption" color="text.secondary">All statements and invoices are fully paid.</Typography>
                <Button variant="outlined" color="secondary" size="small" fullWidth sx={{ mt: 1 }}>
                  View Statements
                </Button>
              </CardContent>
            </Card>
          </Grid>

          <Grid size={{ xs: 12, md: 4 }}>
            <Card sx={{ height: '100%' }}>
              <CardContent>
                <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1.5 }}>
                  Insurance Status
                </Typography>
                <Divider sx={{ mb: 2 }} />
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>Blue Cross Copay</Typography>
                  <Chip label="Active" color="success" size="small" sx={{ fontWeight: 600 }} />
                </Box>
                <Typography variant="caption" color="text.secondary">Provider ID: BC-83492-X90</Typography>
                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>Individual deductible fully met.</Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Reports Download List */}
        <Card>
          <CardContent>
            <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
              Download Lab Reports
            </Typography>
            <List>
              {reports.map((report, index) => (
                <React.Fragment key={report.id}>
                  <ListItem 
                    sx={{ px: 0, py: 2 }}
                    secondaryAction={
                      <Button 
                        variant="contained" 
                        size="small"
                        startIcon={<FileDownloadIcon />}
                        onClick={() => alert(`MOCK: Downloading ${report.file}`)}
                      >
                        Download PDF
                      </Button>
                    }
                  >
                    <ListItemText
                      primary={
                        <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                          {report.name}
                        </Typography>
                      }
                      secondary={
                        <Typography variant="caption" color="text.secondary">
                          Report ID: {report.id} • Verified on {report.date}
                        </Typography>
                      }
                    />
                  </ListItem>
                  {index < reports.length - 1 && <Divider />}
                </React.Fragment>
              ))}
            </List>
          </CardContent>
        </Card>
      </Box>
    </>
  );
}
