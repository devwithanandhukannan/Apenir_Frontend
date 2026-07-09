import React from 'react';
import { useAppSelector } from '@/core_components/store/hooks';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';

export const UserProfileCard: React.FC = () => {
  const { user, isAuthenticated } = useAppSelector((state) => state.auth);

  if (!isAuthenticated || !user) {
    return (
      <Card sx={{ bgcolor: 'var(--color-paper)', border: '1px solid var(--color-border)' }}>
        <CardContent>
          <Typography variant="body2" color="text.secondary">
            No active user session. Please log in to view profile details.
          </Typography>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card sx={{ bgcolor: 'var(--color-paper)', border: '1px solid var(--color-border)' }}>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Avatar 
            sx={{ bgcolor: 'primary.main', width: 44, height: 44 }}
            className="bg-primary"
          >
            {user.name.charAt(0).toUpperCase()}
          </Avatar>
          <Box sx={{ flexGrow: 1 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
              {user.name}
            </Typography>
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
              {user.email}
            </Typography>
          </Box>
          <Chip 
            label={user.role.toUpperCase()} 
            color={user.role === 'admin' ? 'error' : user.role === 'lab' ? 'secondary' : 'primary'}
            size="small"
            sx={{ fontWeight: 600 }}
          />
        </Box>
      </CardContent>
    </Card>
  );
};

export default UserProfileCard;
