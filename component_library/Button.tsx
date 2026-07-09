import React from 'react';
import MuiButton, { ButtonProps as MuiButtonProps } from '@mui/material/Button';

export interface CustomButtonProps extends MuiButtonProps {
  // Add custom library props if any
  variantType?: 'primary' | 'secondary' | 'accent';
}

export const Button: React.FC<CustomButtonProps> = ({ 
  children, 
  variantType = 'primary', 
  sx,
  ...props 
}) => {
  return (
    <MuiButton
      sx={{
        borderRadius: '8px',
        fontWeight: 600,
        px: 3,
        py: 1,
        transition: 'all 0.2s ease',
        boxShadow: '0 2px 4px 0 rgba(0,0,0,0.05)',
        '&:hover': {
          transform: 'translateY(-1px)',
          boxShadow: '0 4px 6px 0 rgba(0,0,0,0.1)',
        },
        ...sx
      }}
      {...props}
    >
      {children}
    </MuiButton>
  );
};

export default Button;
