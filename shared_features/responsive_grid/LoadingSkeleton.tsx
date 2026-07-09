import React from "react";
import TableRow from "@mui/material/TableRow";
import TableCell from "@mui/material/TableCell";
import Skeleton from "@mui/material/Skeleton";
import { LoadingSkeletonProps } from "./type";
import { getSkeletonRowArray } from "./utils";

export const LoadingSkeleton: React.FC<LoadingSkeletonProps> = ({
  columnsCount,
  rowsCount,
}) => {
  const rowArray = getSkeletonRowArray(rowsCount);
  const colArray = Array.from({ length: columnsCount }, (_, i) => i);

  return (
    <>
      {rowArray.map((rowIndex) => (
        <TableRow key={`skeleton-row-${rowIndex}`}>
          {colArray.map((colIndex) => (
            <TableCell
              key={`skeleton-cell-${rowIndex}-${colIndex}`}
              sx={{ py: 2.5 }}
            >
              <Skeleton
                variant="text"
                width="75%"
                height={20}
                animation="wave"
              />
            </TableCell>
          ))}
        </TableRow>
      ))}
    </>
  );
};

export default LoadingSkeleton;
