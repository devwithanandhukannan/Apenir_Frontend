import React from "react";
import TableCell from "@mui/material/TableCell";
import { GridCellProps } from "./type";

export const GridCell: React.FC<GridCellProps> = ({
  row,
  rowIndex,
  column,
}) => {
  const value = (row as any)[column.accessor];

  return (
    <TableCell
      align={column.align || "left"}
      className={column.cellClassName}
      sx={{
        borderBottom: "1px solid #e2e8f0",
        py: 2.5,
        color: "text.primary",
      }}
    >
      {column.Cell
        ? column.Cell({ value, row, rowIndex, column })
        : value !== undefined && value !== null
          ? String(value)
          : ""}
    </TableCell>
  );
};

export default GridCell;
