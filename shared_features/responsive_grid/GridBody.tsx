import React from 'react';
import TableBody from '@mui/material/TableBody';
import GridRow from './GridRow';
import LoadingSkeleton from './LoadingSkeleton';
import { GridBodyProps } from './type';

export const GridBody = <T = any,>({
  data,
  columns,
  loading,
  skeletonRows,
}: GridBodyProps<T>) => {
  return (
    <TableBody>
      {loading ? (
        <LoadingSkeleton columnsCount={columns.length} rowsCount={skeletonRows} />
      ) : (
        data.map((row, index) => {
          // Fallback key resolving
          const rowKey = (row as any).id || (row as any).key || (row as any).sampleId || index;
          return (
            <GridRow
              key={String(rowKey)}
              row={row}
              rowIndex={index}
              columns={columns}
            />
          );
        })
      )}
    </TableBody>
  );
};

export default GridBody;
