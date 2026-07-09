import React from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import ScienceIcon from '@mui/icons-material/Science';
import { EmptyStateProps } from './type';

export const EmptyState: React.FC<EmptyStateProps> = ({
  title = 'No Records Found',
  subtitle = 'Try adjusting your search query or filters to find what you are looking for.',
}) => {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        py: 8,
        px: 3,
        textAlign: 'center',
        border: '1px dashed var(--color-border)',
        borderRadius: '12px',
        bgcolor: 'rgba(0, 0, 0, 0.005)',
      }}
    >
      <ScienceIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 2, opacity: 0.6 }} />
      <Typography variant="h6" sx={{ fontWeight: 'bold' }} gutterBottom>
        {title}
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 400 }}>
        {subtitle}
      </Typography>
    </Box>
  );
};

export default EmptyState;
