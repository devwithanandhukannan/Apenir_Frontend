import React from "react";
import TableCell from "@mui/material/TableCell";
import Tooltip from "@mui/material/Tooltip";
import Box from "@mui/material/Box";
import { GridCellProps } from "./type";

export const GridCell: React.FC<GridCellProps> = ({
  row,
  rowIndex,
  column,
}) => {
  const value = (row as any)[column.accessor];

  const renderedContent = column.Cell
    ? column.Cell({ value, row, rowIndex, column })
    : value !== undefined && value !== null
      ? String(value)
      : "";

  // Derive a plain-text tooltip title from the raw value
  const tooltipTitle =
    value !== undefined && value !== null ? String(value) : "";

  // Skip tooltip for the row action button column and empty values
  const isActionColumn = column.accessor === "_row_hover_action";
  const shouldShowTooltip = !isActionColumn && tooltipTitle.length > 0;

  return (
    <TableCell
      align={column.align || "left"}
      className={column.cellClassName}
      sx={{
        borderBottom: "1px solid #e2e8f0",
        py: 2.5,
        color: "text.primary",
        maxWidth: column.width || 200,
      }}
    >
      {shouldShowTooltip ? (
        <Tooltip title={tooltipTitle} arrow placement="top" enterDelay={400}>
          <Box
            sx={{
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {renderedContent}
          </Box>
        </Tooltip>
      ) : (
        renderedContent
      )}
    </TableCell>
  );
};

export default GridCell;
