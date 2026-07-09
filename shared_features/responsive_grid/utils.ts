import { ColumnConfig } from "./type";

// Standard debounce utility for input changes
export function debounce<T extends (...args: any[]) => void>(
  func: T,
  wait: number,
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null;
  return (...args: Parameters<T>) => {
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(() => {
      func(...args);
    }, wait);
  };
}

// Determines if dataset is empty
export const isEmptyState = (data: any[]): boolean => {
  return !data || data.length === 0;
};

// Filter out columns designated as hidden
export const getVisibleColumns = <T>(
  columns: ColumnConfig<T>[],
): ColumnConfig<T>[] => {
  return columns.filter((col) => col.show !== false);
};

// Generates numeric array for skeleton rows
export const getSkeletonRowArray = (count: number): number[] => {
  return Array.from({ length: count }, (_, i) => i);
};

// Determines next sorting state (ASC -> DESC -> ASC)
export const getNextSortDirection = (
  currentField: string,
  newField: string,
  currentDir?: "ASC" | "DESC",
): "ASC" | "DESC" => {
  if (currentField !== newField) {
    return "ASC";
  }
  return currentDir === "ASC" ? "DESC" : "ASC";
};
