import React, { useMemo, useCallback } from 'react';
import Box from '@mui/material/Box';
import Table from '@mui/material/Table';
import Skeleton from '@mui/material/Skeleton';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useTheme } from '@mui/material/styles';
import { ResponsiveGridProps } from './type';
import FilterSection from './FilterSection';
import GridHeader from './GridHeader';
import GridBody from './GridBody';
import MobileCard from './MobileCard';
import PaginationSection from './PaginationSection';
import EmptyState from './EmptyState';
import { StyledTableContainer, HoverActionButton, GridWrapper } from './styles';
import { getVisibleColumns, getNextSortDirection, isEmptyState } from './utils';
import { DEFAULT_SKELETON_ROWS } from './constants';

export const ResponsiveGrid = <T = any,>({
  data,
  loading,
  filters,
  setFilters,
  filterMenuConfig = [],
  columns,
  searchPlaceholder = 'Search...',
  pagination,
  skeletonRows = DEFAULT_SKELETON_ROWS,
  onRowActionClick,
  rowActionLabel,
}: ResponsiveGridProps<T>) => {
  const theme = useTheme();
  // Check if current display width is mobile size (under 600px)
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  // Memoize visible columns and conditionally append the hover action button at the end of each row
  const visibleColumns = useMemo(() => {
    const cols = getVisibleColumns(columns);
    if (onRowActionClick) {
      cols.push({
        accessor: '_row_hover_action',
        header: '',
        sortable: false,
        align: 'right',
        width: 80,
        Cell: ({ row }) => (
          <HoverActionButton
            size="small"
            variant="contained"
            color="primary"
            onClick={(e) => {
              e.stopPropagation();
              onRowActionClick(row);
            }}
            sx={{
              textTransform: 'none',
              borderRadius: '6px',
              fontWeight: 700,
              fontSize: '11px',
              py: 0.5,
              px: 1.5,
              boxShadow: 'none',
              '&:hover': {
                boxShadow: 'none',
              },
            }}
          >
            {rowActionLabel || 'Open'}
          </HoverActionButton>
        ),
      });
    }
    return cols;
  }, [columns, onRowActionClick, rowActionLabel]);

  const handleFilterChange = useCallback(
    (key: string, value: any) => {
      setFilters((prev) => ({
        ...prev,
        [key]: value,
        pageNumber: 1, // Reset page index back to 1 on filter changes
      }));
    },
    [setFilters]
  );

  const handleSearchChange = useCallback(
    (val: string) => {
      setFilters((prev) => ({
        ...prev,
        search: val,
        pageNumber: 1,
      }));
    },
    [setFilters]
  );

  const handleSort = useCallback(
    (accessor: string) => {
      setFilters((prev) => {
        const nextDirection = getNextSortDirection(
          prev.sortBy || '',
          accessor,
          prev.sortDirection
        );
        return {
          ...prev,
          sortBy: accessor,
          sortDirection: nextDirection,
          pageNumber: 1,
        };
      });
    },
    [setFilters]
  );

  const handlePageChange = useCallback(
    (newPage: number) => {
      setFilters((prev) => ({
        ...prev,
        pageNumber: newPage,
      }));
    },
    [setFilters]
  );

  const handleRowsPerPageChange = useCallback(
    (newSize: number) => {
      setFilters((prev) => ({
        ...prev,
        pageSize: newSize,
        pageNumber: 1,
      }));
    },
    [setFilters]
  );

  const isDataEmpty = useMemo(() => isEmptyState(data), [data]);

  return (
    <Box sx={{ width: '100%' }}>
      {/* 1. Filter Section (Search & Dropdowns) */}
      <FilterSection
        filterMenuConfig={filterMenuConfig}
        filters={filters}
        onFilterChange={handleFilterChange}
        searchValue={filters.search || ''}
        onSearchChange={handleSearchChange}
        searchPlaceholder={searchPlaceholder}
        disabled={loading}
      />

      {/* 2. Grid/Body Section */}
      {isDataEmpty && !loading ? (
        <EmptyState />
      ) : isMobile ? (
        /* Mobile Card View List Layout */
        <Box>
          {loading ? (
            Array.from({ length: skeletonRows }).map((_, i) => (
              <Box
                key={`mobile-skeleton-${i}`}
                sx={{
                  p: 2.5,
                  mb: 2,
                  border: '1px solid var(--color-border)',
                  borderRadius: '12px',
                  bgcolor: 'background.paper',
                }}
              >
                <Skeleton variant="text" width="40%" height={24} sx={{ mb: 1.5 }} />
                <Skeleton variant="text" width="85%" height={16} sx={{ mb: 1.5 }} />
                <Skeleton variant="text" width="65%" height={16} />
              </Box>
            ))
          ) : (
            data.map((row, index) => {
              const cardKey = (row as any).id || (row as any).key || (row as any).sampleId || index;
              return (
                <MobileCard
                  key={String(cardKey)}
                  row={row}
                  rowIndex={index}
                  columns={visibleColumns}
                />
              );
            })
          )}

          {/* Mobile Pagination Control */}
          {!isDataEmpty && (
            <PaginationSection
              pagination={pagination}
              onPageChange={handlePageChange}
              onRowsPerPageChange={handleRowsPerPageChange}
              disabled={loading}
            />
          )}
        </Box>
      ) : (
        /* Desktop/Tablet Horizontal-Scroll Table Layout wrapped in GridWrapper */
        <GridWrapper>
          <StyledTableContainer>
            <Table sx={{ minWidth: 650 }} aria-label="responsive data grid table">
              <GridHeader
                columns={visibleColumns}
                sortBy={filters.sortBy}
                sortDirection={filters.sortDirection}
                onSort={handleSort}
              />
              <GridBody
                data={data}
                columns={visibleColumns}
                loading={loading}
                skeletonRows={skeletonRows}
              />
            </Table>
          </StyledTableContainer>

          {/* Desktop Pagination Control inside wrapper */}
          {!isDataEmpty && (
            <PaginationSection
              pagination={pagination}
              onPageChange={handlePageChange}
              onRowsPerPageChange={handleRowsPerPageChange}
              disabled={loading}
            />
          )}
        </GridWrapper>
      )}
    </Box>
  );
};

export default ResponsiveGrid;
