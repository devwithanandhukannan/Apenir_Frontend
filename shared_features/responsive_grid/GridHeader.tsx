import React from "react";
import TableHead from "@mui/material/TableHead";
import TableCell from "@mui/material/TableCell";
import TableSortLabel from "@mui/material/TableSortLabel";
import Box from "@mui/material/Box";
import { visuallyHidden } from "@mui/utils";
import { GridHeaderProps } from "./type";
import { StyledHeaderRow } from "./styles";

export const GridHeader: React.FC<GridHeaderProps> = ({
  columns,
  sortBy,
  sortDirection,
  onSort,
}) => {
  return (
    <TableHead>
      <StyledHeaderRow>
        {columns.map((column) => {
          const isSorted = sortBy === column.accessor;
          const direction = isSorted
            ? (sortDirection?.toLowerCase() as "asc" | "desc")
            : "asc";

          return (
            <TableCell
              key={String(column.accessor)}
              align={column.align || "left"}
              className={column.headerClassName}
              sx={{
                width: column.width,
                fontWeight: 700,
                color: "text.secondary",
                borderBottom: "1px solid var(--color-border)",
                py: 2.2,
              }}
            >
              {column.sortable !== false ? (
                <TableSortLabel
                  active={isSorted}
                  direction={direction}
                  onClick={() => onSort(String(column.accessor))}
                >
                  {column.header}
                  {isSorted ? (
                    <Box component="span" sx={visuallyHidden}>
                      {direction === "desc"
                        ? "sorted descending"
                        : "sorted ascending"}
                    </Box>
                  ) : null}
                </TableSortLabel>
              ) : (
                column.header
              )}
            </TableCell>
          );
        })}
      </StyledHeaderRow>
    </TableHead>
  );
};

export default GridHeader;
