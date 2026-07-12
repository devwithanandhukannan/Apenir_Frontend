import { useState, useEffect, useCallback, useMemo } from "react";
import { useAbortController } from "@/core_components/hooks/useAbortController/useAbortController";
import {
  useLab,
  LabAppointmentItem,
  CurrentLabAppointmentsResponse,
  LabStaffMember,
} from "@/core_components/apis/admin/lab";
import {
  GridFilters,
  PaginationProps,
} from "@/shared_features/responsive_grid/type";

export type { LabAppointmentItem, CurrentLabAppointmentsResponse };

const APPOINTMENTS_KEYS = ["FETCH_APPOINTMENTS_REQUEST"] as const;

export const useAppointments = () => {
  const {
    getCurrentLabAppointments,
    getCurrentLabStaff,
    assignStaffToAppointment,
  } = useLab();
  const { controllers } = useAbortController(APPOINTMENTS_KEYS);

  const [loading, setLoading] = useState(true);
  const [appointments, setAppointments] = useState<LabAppointmentItem[]>([]);

  // Modal Dialog states
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false);
  const [isAssignDialogOpen, setIsAssignDialogOpen] = useState(false);
  const [selectedAppointment, setSelectedAppointment] =
    useState<LabAppointmentItem | null>(null);
  const [selectedStaffId, setSelectedStaffId] = useState("");
  const [staffList, setStaffList] = useState<LabStaffMember[]>([]);
  const [assigning, setAssigning] = useState(false);

  // Grid Filters
  const [filters, setFilters] = useState<GridFilters>({
    search: "",
    sortBy: "createdAt",
    sortDirection: "DESC",
    pageNumber: 1,
    pageSize: 5,
    status: [],
  });

  // Fetch staff list associated with lab
  const fetchStaffList = useCallback(async () => {
    try {
      const response = await getCurrentLabStaff();
      if (response.success && response.data) {
        let list: LabStaffMember[] = [];
        const resData = response.data as any;
        if (Array.isArray(resData)) {
          list = resData;
        } else if (resData.data && Array.isArray(resData.data)) {
          list = resData.data;
        } else if (resData.data && Array.isArray(resData.data.items)) {
          list = resData.data.items;
        } else if (resData.items && Array.isArray(resData.items)) {
          list = resData.items;
        }
        setStaffList(list);
      }
    } catch (error) {
      console.error("Failed to fetch staff list:", error);
    }
  }, [getCurrentLabStaff]);

  useEffect(() => {
    fetchStaffList();
  }, [fetchStaffList]);

  // Fetch appointments from api: GET /api/lab/appointments
  const fetchAppointments = useCallback(async () => {
    setLoading(true);
    try {
      controllers.FETCH_APPOINTMENTS_REQUEST.reset();
      const response = await getCurrentLabAppointments({
        signal: controllers.FETCH_APPOINTMENTS_REQUEST.signal,
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
        setAppointments(response.data.data);
      } else {
        setAppointments([]);
      }
      setLoading(false);
    } catch (error: any) {
      if (error?.name === "CanceledError" || error?.message === "canceled") {
        return;
      }
      console.error("Failed to fetch appointments:", error);
      setAppointments([]);
      setLoading(false);
    }
  }, [getCurrentLabAppointments, controllers]);

  useEffect(() => {
    fetchAppointments();
  }, [fetchAppointments]);

  // Handle staff assignment to appointment
  const handleAssignStaff = useCallback(async () => {
    if (!selectedAppointment || !selectedStaffId) {
      return { success: false, message: "Please select a staff member." };
    }
    setAssigning(true);
    try {
      const response = await assignStaffToAppointment(selectedAppointment.id, {
        staffId: selectedStaffId,
      });

      if (response.success) {
        setIsAssignDialogOpen(false);
        fetchAppointments();
        return {
          success: true,
          message: response.data?.message || "Staff assigned successfully!",
        };
      } else {
        return {
          success: false,
          message:
            response.data?.message ||
            response.error?.message ||
            "Failed to assign staff.",
        };
      }
    } catch (err: any) {
      console.error("Error assigning staff:", err);
      return {
        success: false,
        message: err.message || "An error occurred while assigning staff.",
      };
    } finally {
      setAssigning(false);
      setSelectedStaffId("");
    }
  }, [
    selectedAppointment,
    selectedStaffId,
    assignStaffToAppointment,
    fetchAppointments,
  ]);

  // Handle staff removal from appointment
  const handleRemoveStaff = useCallback(async () => {
    if (!selectedAppointment) {
      return { success: false, message: "No appointment selected." };
    }
    setAssigning(true);
    try {
      const response = await assignStaffToAppointment(selectedAppointment.id, {
        staffId: null,
      });

      if (response.success) {
        setIsAssignDialogOpen(false);
        fetchAppointments();
        return {
          success: true,
          message: response.data?.message || "Staff removed successfully!",
        };
      } else {
        return {
          success: false,
          message:
            response.data?.message ||
            response.error?.message ||
            "Failed to remove staff.",
        };
      }
    } catch (err: any) {
      console.error("Error removing staff:", err);
      return {
        success: false,
        message: err.message || "An error occurred while removing staff.",
      };
    } finally {
      setAssigning(false);
    }
  }, [selectedAppointment, assignStaffToAppointment, fetchAppointments]);

  // Derived display status helper
  const getAppointmentStatusLabel = useCallback((status: number): string => {
    switch (status) {
      case 1:
        return "Pending";
      case 2:
        return "Confirmed";
      case 3:
        return "Assigned";
      case 4:
        return "Collected";
      case 5:
        return "Completed";
      case 6:
        return "Cancelled";
      default:
        return `Status ${status}`;
    }
  }, []);

  // Filtering & Sorting
  const filteredData = useMemo(() => {
    return appointments
      .filter((app) => {
        // 1. Search Query Match
        if (filters.search) {
          const query = filters.search.toLowerCase();
          const matches =
            (app.appointmentNumber &&
              app.appointmentNumber.toLowerCase().includes(query)) ||
            (app.locationAddress &&
              app.locationAddress.toLowerCase().includes(query)) ||
            (app.passcode && app.passcode.toLowerCase().includes(query)) ||
            (app.id && app.id.toLowerCase().includes(query));
          if (!matches) return false;
        }

        // 2. Status Match
        if (filters.status && filters.status.length > 0) {
          const label = getAppointmentStatusLabel(app.status);
          if (!filters.status.includes(label)) return false;
        }

        return true;
      })
      .sort((a, b) => {
        const field = (filters.sortBy ||
          "createdAt") as keyof LabAppointmentItem;
        const dir = filters.sortDirection === "DESC" ? -1 : 1;

        let valA: any = a[field];
        let valB: any = b[field];

        if (filters.sortBy === "status") {
          valA = getAppointmentStatusLabel(a.status);
          valB = getAppointmentStatusLabel(b.status);
        }

        if (typeof valA === "string" && typeof valB === "string") {
          return valA.localeCompare(valB) * dir;
        }
        if (typeof valA === "number" && typeof valB === "number") {
          return (valA - valB) * dir;
        }
        return 0;
      });
  }, [appointments, filters, getAppointmentStatusLabel]);

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
    getAppointmentStatusLabel,
    fetchAppointments,
    isDetailsDialogOpen,
    setIsDetailsDialogOpen,
    isAssignDialogOpen,
    setIsAssignDialogOpen,
    selectedAppointment,
    setSelectedAppointment,
    selectedStaffId,
    setSelectedStaffId,
    staffList,
    assigning,
    handleAssignStaff,
    handleRemoveStaff,
  };
};

export default useAppointments;
