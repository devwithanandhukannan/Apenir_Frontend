import { useState, useEffect, useCallback, useMemo } from "react";
import { useAbortController } from "@/core_components/hooks/useAbortController/useAbortController";
import {
  useLab,
  LabServiceItem,
  CurrentLabServicesResponse,
} from "@/core_components/apis/admin/lab";
import {
  GridFilters,
  PaginationProps,
} from "@/shared_features/responsive_grid/type";

export type { LabServiceItem, CurrentLabServicesResponse };

const SERVICES_KEYS = ["FETCH_SERVICES_REQUEST"] as const;

export const useService = () => {
  const { getCurrentLabServices } = useLab();
  const { controllers } = useAbortController(SERVICES_KEYS);

  const [loading, setLoading] = useState(true);
  const [services, setServices] = useState<LabServiceItem[]>([]);

  // Grid Filters
  const [filters, setFilters] = useState<GridFilters>({
    search: "",
    sortBy: "name",
    sortDirection: "ASC",
    pageNumber: 1,
    pageSize: 5,
    category: [],
  });

  // Fetch services from API: GET /api/lab/services
  const fetchServices = useCallback(async () => {
    setLoading(true);
    try {
      controllers.FETCH_SERVICES_REQUEST.reset();
      const response = await getCurrentLabServices({
        signal: controllers.FETCH_SERVICES_REQUEST.signal,
      });

      // Ignore aborted calls and keep loading state for the next request
      if (
        response.error &&
        (response.error.name === "CanceledError" ||
          response.error.message === "canceled")
      ) {
        return;
      }

      if (response.success && response.data && response.data.data) {
        setServices(response.data.data);
      } else {
        setServices([]);
      }
      setLoading(false);
    } catch (error: any) {
      if (error?.name === "CanceledError" || error?.message === "canceled") {
        return;
      }
      console.error("Failed to fetch services:", error);
      setServices([]);
      setLoading(false);
    }
  }, [getCurrentLabServices, controllers]);

  useEffect(() => {
    fetchServices();
  }, [fetchServices]);

  // Extract unique categories for filter options
  const categoryOptions = useMemo(() => {
    const categories = Array.from(
      new Set(services.map((s) => s.category).filter(Boolean)),
    );
    return categories.map((cat) => ({ value: cat, label: cat }));
  }, [services]);

  // Filtering & Sorting
  const filteredData = useMemo(() => {
    return services
      .filter((srv) => {
        // 1. Search Query Match
        if (filters.search) {
          const query = filters.search.toLowerCase();
          const matches =
            (srv.name && srv.name.toLowerCase().includes(query)) ||
            (srv.category && srv.category.toLowerCase().includes(query)) ||
            (srv.description && srv.description.toLowerCase().includes(query));
          if (!matches) return false;
        }

        // 2. Category Match (array filter)
        if (filters.category && filters.category.length > 0) {
          if (!filters.category.includes(srv.category)) return false;
        }

        return true;
      })
      .sort((a, b) => {
        const field = (filters.sortBy || "name") as keyof LabServiceItem;
        const dir = filters.sortDirection === "DESC" ? -1 : 1;

        const valA: any = a[field];
        const valB: any = b[field];

        if (typeof valA === "string" && typeof valB === "string") {
          return valA.localeCompare(valB) * dir;
        }
        if (typeof valA === "number" && typeof valB === "number") {
          return (valA - valB) * dir;
        }
        return 0;
      });
  }, [services, filters]);

  // Pagination Configuration
  const pagination: PaginationProps = useMemo(() => {
    return {
      pageNumber: filters.pageNumber,
      pageSize: filters.pageSize,
      pageCount: Math.ceil(filteredData.length / filters.pageSize) || 1,
      totalRows: filteredData.length,
    };
  }, [filters.pageNumber, filters.pageSize, filteredData.length]);

  const paginatedData = useMemo(() => {
    const start = (filters.pageNumber - 1) * filters.pageSize;
    return filteredData.slice(start, start + filters.pageSize);
  }, [filteredData, filters.pageNumber, filters.pageSize]);

  return {
    loading,
    paginatedData,
    pagination,
    filters,
    setFilters,
    categoryOptions,
    fetchServices,
  };
};

export default useService;
