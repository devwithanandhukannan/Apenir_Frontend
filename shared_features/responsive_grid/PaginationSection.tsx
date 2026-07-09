import React from "react";
import TablePagination from "@mui/material/TablePagination";
import Box from "@mui/material/Box";
import { PaginationSectionProps } from "./type";
import { DEFAULT_ROWS_PER_PAGE_OPTIONS } from "./constants";

export const PaginationSection: React.FC<PaginationSectionProps> = ({
  pagination,
  onPageChange,
  onRowsPerPageChange,
  disabled = false,
}) => {
  const {
    pageNumber,
    pageSize,
    rowsPerPageOptions = DEFAULT_ROWS_PER_PAGE_OPTIONS,
    totalRows,
  } = pagination;

  const handleChangePage = (
    _event: React.MouseEvent<HTMLButtonElement> | null,
    newPage: number,
  ) => {
    onPageChange(newPage + 1); // Convert 0-based MUI index back to 1-based page number
  };

  const handleChangeRowsPerPage = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    onRowsPerPageChange(parseInt(event.target.value, 10));
  };

  // Ensure page number doesn't fall below bounds
  const currentPage = Math.max(0, pageNumber - 1);

  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "flex-end",
        borderTop: "1px solid #e2e8f0",
        mt: 0,
        backgroundColor: "background.paper",
        borderBottomLeftRadius: "8px",
        borderBottomRightRadius: "8px",
      }}
    >
      <TablePagination
        component="div"
        count={totalRows}
        page={currentPage}
        onPageChange={handleChangePage}
        rowsPerPage={pageSize}
        onRowsPerPageChange={handleChangeRowsPerPage}
        rowsPerPageOptions={rowsPerPageOptions}
        disabled={disabled}
        sx={{
          borderBottom: "none",
          "& .MuiTablePagination-select": {
            borderRadius: "4px",
          },
        }}
      />
    </Box>
  );
};

export default PaginationSection;
