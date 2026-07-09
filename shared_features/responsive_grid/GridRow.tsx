import React from 'react';
import GridCell from './GridCell';
import { GridRowProps } from './type';
import { StyledTableRow } from './styles';

const GridRowComponent = <T = any,>({
  row,
  rowIndex,
  columns,
}: GridRowProps<T>) => {
  return (
    <StyledTableRow>
      {columns.map((column) => (
        <GridCell
          key={String(column.accessor)}
          row={row}
          rowIndex={rowIndex}
          column={column}
        />
      ))}
    </StyledTableRow>
  );
};

export const GridRow = React.memo(GridRowComponent) as <T = any>(
  props: GridRowProps<T>
) => React.ReactElement;

export default GridRow;
