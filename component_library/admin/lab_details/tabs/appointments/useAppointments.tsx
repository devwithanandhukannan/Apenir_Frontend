import { useState, useEffect, useCallback, useMemo } from "react";
import axios from "axios";
import {
  GridFilters,
  PaginationProps,
} from "@/shared_features/responsive_grid/type";
import {
  useLabService,
  AppointmentItem,
} from "@/core_components/apis/admin/labService";
import { useAbortController } from "@/core_components/hooks/useAbortController/useAbortController";

const APPOINTMENTS_KEYS = ["FETCH_APPOINTMENTS_REQUEST"] as const;

export const useAppointments = (labId: string) => {
  const { getLabAppointments } = useLabService();
  const { controllers } = useAbortController(APPOINTMENTS_KEYS);
  const [loading, setLoading] = useState(true);
  const [appointments, setAppointments] = useState<AppointmentItem[]>([]);

  // Maintain grid UI filter state
  const [filters, setFilters] = useState<GridFilters>({
    search: "",
    sortBy: "scheduledTime",
    sortDirection: "ASC",
    pageNumber: 1,
    pageSize: 5,
    status: [],
  });

  const fetchAppointments = useCallback(async () => {
    if (!labId) return;
    setLoading(true);
    controllers.FETCH_APPOINTMENTS_REQUEST.reset();
    const signal = controllers.FETCH_APPOINTMENTS_REQUEST.signal;

    try {
      const response = await getLabAppointments(
        labId,
        {
          pageNumber: 1,
          rowsPerPage: 100,
        },
        { signal },
      );

      if (
        signal.aborted ||
        (response.error &&
          (response.error.name === "CanceledError" ||
            response.error.message === "canceled" ||
            axios.isCancel(response.error)))
      ) {
        return;
      }

      if (response.success && response.data?.data?.items) {
        const apiAppointments = response.data.data.items;

        // Map C# entity structures to standard frontend interfaces
        const mappedAppointments: AppointmentItem[] = apiAppointments.map(
          (app: any) => {
            let mappedStatus: "Scheduled" | "Completed" | "Cancelled" =
              "Scheduled";
            // Map C# AppointmentStatus enums (4 = Completed, 5 = Cancelled)
            if (app.status === 4 || app.status === "Completed") {
              mappedStatus = "Completed";
            } else if (app.status === 5 || app.status === "Cancelled") {
              mappedStatus = "Cancelled";
            }

            return {
              id: app.id,
              appointmentNumber: app.appointmentNumber,
              customerName: app.customerUser?.name || "Customer",
              scheduledTime: app.appointmentSlot?.slotDate || app.createdAt,
              tests: "Comprehensive Diagnostics Profile",
              amount: Number(app.totalAmount || 0),
              status: mappedStatus,
            };
          },
        );

        setAppointments(mappedAppointments);
      } else {
        setAppointments([]);
      }
      setLoading(false);
    } catch (error: any) {
      if (
        signal.aborted ||
        error?.name === "CanceledError" ||
        error?.message === "canceled" ||
        axios.isCancel(error)
      ) {
        return;
      }
      setAppointments([]);
      setLoading(false);
    }
  }, [labId, getLabAppointments, controllers]);

  useEffect(() => {
    fetchAppointments();
  }, [fetchAppointments]);

  const filteredAppointments = useMemo(() => {
    return appointments
      .filter((app) => {
        // Search matching
        if (filters.search) {
          const query = filters.search.toLowerCase();
          const matchesSearch =
            app.appointmentNumber.toLowerCase().includes(query) ||
            app.customerName.toLowerCase().includes(query) ||
            app.tests.toLowerCase().includes(query);
          if (!matchesSearch) return false;
        }

        // Status matching
        if (filters.status && filters.status.length > 0) {
          if (!filters.status.includes(app.status)) return false;
        }

        return true;
      })
      .sort((a, b) => {
        const field = (filters.sortBy ||
          "scheduledTime") as keyof AppointmentItem;
        const dir = filters.sortDirection === "DESC" ? -1 : 1;

        const valA = a[field];
        const valB = b[field];

        if (typeof valA === "string" && typeof valB === "string") {
          return valA.localeCompare(valB) * dir;
        }
        if (typeof valA === "number" && typeof valB === "number") {
          return (valA - valB) * dir;
        }
        return 0;
      });
  }, [appointments, filters]);

  // Pagination parameters
  const pagination: PaginationProps = useMemo(
    () => ({
      pageNumber: filters.pageNumber,
      pageSize: filters.pageSize,
      pageCount: Math.ceil(filteredAppointments.length / filters.pageSize) || 1,
      totalRows: filteredAppointments.length,
    }),
    [filters.pageNumber, filters.pageSize, filteredAppointments.length],
  );

  // Slice paginated block
  const paginatedData = useMemo(() => {
    const start = (filters.pageNumber - 1) * filters.pageSize;
    return filteredAppointments.slice(start, start + filters.pageSize);
  }, [filteredAppointments, filters.pageNumber, filters.pageSize]);

  return {
    paginatedData,
    loading,
    filters,
    setFilters,
    pagination,
  };
};

export default useAppointments;
