import React from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { MobileCardProps } from './type';
import { MobileCardContainer, MobileFieldRow } from './styles';

export const MobileCard = <T = any,>({
  row,
  rowIndex,
  columns,
}: MobileCardProps<T>) => {
  return (
    <MobileCardContainer>
      {columns.map((column) => {
        const value = (row as any)[column.accessor];

        return (
          <MobileFieldRow key={String(column.accessor)}>
            {/* Header / Column label */}
            <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700, mr: 2 }}>
              {column.header}
            </Typography>

            {/* Custom cell JSX or formatted string */}
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', flexGrow: 1 }}>
              {column.Cell ? (
                column.Cell({ value, row, rowIndex, column })
              ) : (
                <Typography variant="body2" color="text.primary" sx={{ fontWeight: 600 }}>
                  {value !== undefined && value !== null ? String(value) : ''}
                </Typography>
              )}
            </Box>
          </MobileFieldRow>
        );
      })}
    </MobileCardContainer>
  );
};

export default MobileCard;
