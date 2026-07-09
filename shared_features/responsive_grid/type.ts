import { ReactNode } from 'react';

// Column Configuration interface
export interface ColumnConfig<T = any> {
  accessor: keyof T | string;
  header: string;
  show?: boolean;
  sortable?: boolean;
  width?: number | string;
  align?: 'left' | 'center' | 'right' | 'justify';
  Cell?: (cellProps: CellProps<T>) => ReactNode;
  headerClassName?: string;
  cellClassName?: string;
}

// Props passed down to custom Cell renderers
export interface CellProps<T = any> {
  value: any;
  row: T;
  rowIndex: number;
  column: ColumnConfig<T>;
}

// Individual option interface for Select/Autocomplete dropdowns
export interface FilterOption {
  value: string | number;
  label: string;
}

// Configuration options for filters rendered dynamically
export interface FilterMenuConfigItem {
  key: string;
  label: string;
  type: 'select' | 'text';
  options: FilterOption[];
  loading?: boolean;
  disabled?: boolean;
  multiple?: boolean;
  placeholder?: string;
  width?: number | string;
  searchable?: boolean;
  getOptionLabel?: (option: any) => string;
}

// Pagination parameters
export interface PaginationProps {
  pageNumber: number;
  pageSize: number;
  rowsPerPageOptions?: number[];
  pageCount: number;
  totalRows: number;
}

// Structure for the filter state maintained in the parent
export interface GridFilters {
  search?: string;
  sortBy?: string;
  sortDirection?: 'ASC' | 'DESC';
  pageNumber: number;
  pageSize: number;
  [key: string]: any; // Custom dynamic filters
}

// Top level props accepted by the main Grid
export interface ResponsiveGridProps<T = any> {
  data: T[];
  loading: boolean;
  filters: GridFilters;
  setFilters: (newFilters: GridFilters | ((prev: GridFilters) => GridFilters)) => void;
  filterMenuConfig?: FilterMenuConfigItem[];
  columns: ColumnConfig<T>[];
  searchPlaceholder?: string;
  pagination: PaginationProps;
  skeletonRows?: number;
  onRowActionClick?: (row: T) => void;
  rowActionLabel?: string;
}

// Children sub-components prop types
export interface GridHeaderProps<T = any> {
  columns: ColumnConfig<T>[];
  sortBy?: string;
  sortDirection?: 'ASC' | 'DESC';
  onSort: (accessor: string) => void;
}

export interface GridBodyProps<T = any> {
  data: T[];
  columns: ColumnConfig<T>[];
  loading: boolean;
  skeletonRows: number;
}

export interface GridRowProps<T = any> {
  row: T;
  rowIndex: number;
  columns: ColumnConfig<T>[];
}

export interface GridCellProps<T = any> {
  row: T;
  rowIndex: number;
  column: ColumnConfig<T>;
}

export interface MobileCardProps<T = any> {
  row: T;
  rowIndex: number;
  columns: ColumnConfig<T>[];
}

export interface FilterSectionProps {
  filterMenuConfig?: FilterMenuConfigItem[];
  filters: GridFilters;
  onFilterChange: (key: string, value: any) => void;
  searchValue: string;
  onSearchChange: (value: string) => void;
  searchPlaceholder?: string;
  disabled?: boolean;
}

export interface SearchProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
}

export interface PaginationSectionProps {
  pagination: PaginationProps;
  onPageChange: (newPage: number) => void;
  onRowsPerPageChange: (newSize: number) => void;
  disabled?: boolean;
}

export interface EmptyStateProps {
  title?: string;
  subtitle?: string;
}

export interface LoadingSkeletonProps {
  columnsCount: number;
  rowsCount: number;
}
