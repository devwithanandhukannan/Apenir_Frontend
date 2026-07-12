import { useState, useEffect, useCallback, useMemo } from "react";
import { useAppSelector } from "@/core_components/store/hooks";
import {
  GridFilters,
  PaginationProps,
} from "@/shared_features/responsive_grid/type";
import {
  useLab,
  LabStaffMember,
  LabStaffListResponse,
} from "@/core_components/apis/admin/lab";
import { useAbortController } from "@/core_components/hooks/useAbortController/useAbortController";

export type { LabStaffMember, LabStaffListResponse };

const FETCH_STAFF_KEYS = ["FETCH_STAFF_REQUEST"] as const;

export const useStaff = () => {
  const { user } = useAppSelector((state) => state.auth);
  const {
    getCurrentLabStaff,
    addCurrentLabStaff,
    updateCurrentLabStaff,
    deleteCurrentLabStaff,
  } = useLab();
  const { controllers } = useAbortController(FETCH_STAFF_KEYS);

  const [loading, setLoading] = useState(true);
  const [staff, setStaff] = useState<LabStaffMember[]>([]);
  const [labName, setLabName] = useState<string>("");

  // Dialog state for adding a staff member
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [addName, setAddName] = useState("");
  const [addEmail, setAddEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Dialog state for viewing a staff member
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [selectedStaff, setSelectedStaff] = useState<LabStaffMember | null>(
    null,
  );

  // Dialog state for editing a staff member
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editName, setEditName] = useState("");
  const [editEmail, setEditEmail] = useState("");
  const [editPhone, setEditPhone] = useState("");
  const [editIsActive, setEditIsActive] = useState(true);
  const [updating, setUpdating] = useState(false);

  // Dialog state for deleting a staff member
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // Grid Filters
  const [filters, setFilters] = useState<GridFilters>({
    search: "",
    sortBy: "name",
    sortDirection: "ASC",
    pageNumber: 1,
    pageSize: 5,
    status: [],
  });

  // Fetch staff list from api using getCurrentLabStaff
  const fetchStaff = useCallback(async () => {
    setLoading(true);
    try {
      controllers.FETCH_STAFF_REQUEST.reset();
      const response = await getCurrentLabStaff({
        signal: controllers.FETCH_STAFF_REQUEST.signal,
      });

      // Ignore aborted calls and keep loading state for the next request
      if (
        response.error &&
        (response.error.name === "CanceledError" ||
          response.error.message === "canceled")
      ) {
        return;
      }

      if (response.success && response.data) {
        let staffList: LabStaffMember[] = [];
        const resData = response.data as any;
        // Handle variations of API response envelope
        if (Array.isArray(resData)) {
          staffList = resData;
        } else if (resData.data && Array.isArray(resData.data)) {
          staffList = resData.data;
        } else if (resData.data && Array.isArray(resData.data.items)) {
          staffList = resData.data.items;
        } else if (resData.items && Array.isArray(resData.items)) {
          staffList = resData.items;
        } else if (typeof resData === "object") {
          // If the list is directly inside some other field or we need to find it
          const possibleArray = Object.values(resData).find((val) =>
            Array.isArray(val),
          );
          if (possibleArray) {
            staffList = possibleArray as LabStaffMember[];
          }
        }
        setStaff(staffList);
      } else {
        setStaff([]);
      }
    } catch (error: any) {
      if (error?.name === "CanceledError" || error?.message === "canceled") {
        return;
      }
      console.error("Failed to fetch staff:", error);
      setStaff([]);
    } finally {
      setLoading(false);
    }
  }, [getCurrentLabStaff, controllers]);

  useEffect(() => {
    if (user?.name) {
      setLabName(user.name);
    } else {
      setLabName("Appenir Lab");
    }
  }, [user]);

  useEffect(() => {
    fetchStaff();
  }, [fetchStaff]);

  // Handle staff addition (using addCurrentLabStaff to invite)
  const handleAddStaffSubmit = useCallback(async () => {
    if (!addName || !addEmail) {
      return { success: false, message: "Please fill in all required fields." };
    }
    setIsSubmitting(true);
    try {
      // Send invitation payload
      const payload = {
        name: addName,
        email: addEmail,
      };

      const response = await addCurrentLabStaff(payload);

      if (response.success) {
        setIsAddDialogOpen(false);
        setAddName("");
        setAddEmail("");
        fetchStaff();
        return {
          success: true,
          message:
            response.data?.message || "Staff member invited successfully!",
        };
      } else {
        return {
          success: false,
          message: response.data?.message || "Failed to invite staff member.",
        };
      }
    } catch (err: any) {
      console.error("Error inviting staff:", err);
      return {
        success: false,
        message: err.message || "Failed to invite staff member.",
      };
    } finally {
      setIsSubmitting(false);
    }
  }, [addName, addEmail, addCurrentLabStaff, fetchStaff]);

  // Handle staff details update (PUT /api/lab/staff/{id})
  const handleEditStaffSubmit = useCallback(async () => {
    if (!selectedStaff || !editName || !editEmail || !editPhone) {
      return { success: false, message: "Please fill in all required fields." };
    }
    setUpdating(true);
    try {
      const payload = {
        id: selectedStaff.id,
        name: editName,
        email: editEmail,
        phone: editPhone,
        isActive: editIsActive,
      };

      const response = await updateCurrentLabStaff(selectedStaff.id, payload);

      if (response.success) {
        setIsEditDialogOpen(false);
        fetchStaff();
        return {
          success: true,
          message:
            response.data?.message ||
            "Staff member details updated successfully!",
        };
      } else {
        return {
          success: false,
          message:
            response.data?.message ||
            response.error?.message ||
            "Failed to update staff member details.",
        };
      }
    } catch (err: any) {
      console.error("Error updating staff:", err);
      return {
        success: false,
        message: err.message || "Failed to update staff member details.",
      };
    } finally {
      setUpdating(false);
    }
  }, [
    selectedStaff,
    editName,
    editEmail,
    editPhone,
    editIsActive,
    updateCurrentLabStaff,
    fetchStaff,
  ]);

  // Handle staff deletion (DELETE /api/lab/staff/{id})
  const handleDeleteStaff = useCallback(async () => {
    if (!selectedStaff) {
      return { success: false, message: "No staff member selected." };
    }
    setDeleting(true);
    try {
      const response = await deleteCurrentLabStaff(selectedStaff.id);

      if (response.success) {
        setIsDeleteDialogOpen(false);
        fetchStaff();
        return {
          success: true,
          message:
            response.data?.message || "Staff member deleted successfully!",
        };
      } else {
        return {
          success: false,
          message:
            response.data?.message ||
            response.error?.message ||
            "Failed to delete staff member.",
        };
      }
    } catch (err: any) {
      console.error("Error deleting staff:", err);
      return {
        success: false,
        message: err.message || "Failed to delete staff member.",
      };
    } finally {
      setDeleting(false);
    }
  }, [selectedStaff, deleteCurrentLabStaff, fetchStaff]);

  // Derived display status
  const getMemberStatus = useCallback(
    (member: LabStaffMember): "Active" | "Inactive" => {
      if (member.isActive === false || member.status === "Inactive")
        return "Inactive";
      return "Active";
    },
    [],
  );

  // Filtering & Sorting
  const filteredData = useMemo(() => {
    return staff
      .filter((member) => {
        // 1. Search Query Match
        if (filters.search) {
          const query = filters.search.toLowerCase();
          const matches =
            (member.name && member.name.toLowerCase().includes(query)) ||
            (member.email && member.email.toLowerCase().includes(query)) ||
            (member.phone && member.phone.toLowerCase().includes(query)) ||
            String(member.role).toLowerCase().includes(query);
          if (!matches) return false;
        }

        // 2. Status Match
        if (filters.status && filters.status.length > 0) {
          const stat = getMemberStatus(member);
          if (!filters.status.includes(stat)) return false;
        }

        return true;
      })
      .sort((a, b) => {
        const field = (filters.sortBy || "name") as keyof LabStaffMember;
        const dir = filters.sortDirection === "DESC" ? -1 : 1;

        let valA: any = a[field];
        let valB: any = b[field];

        if (filters.sortBy === "status") {
          valA = getMemberStatus(a);
          valB = getMemberStatus(b);
        }

        if (typeof valA === "string" && typeof valB === "string") {
          return valA.localeCompare(valB) * dir;
        }
        return 0;
      });
  }, [staff, filters, getMemberStatus]);

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
    labName,
    loading,
    paginatedData,
    pagination,
    filters,
    setFilters,
    isAddDialogOpen,
    setIsAddDialogOpen,
    addName,
    setAddName,
    addEmail,
    setAddEmail,
    isSubmitting,
    handleAddStaffSubmit,
    getMemberStatus,
    isViewDialogOpen,
    setIsViewDialogOpen,
    selectedStaff,
    setSelectedStaff,
    isEditDialogOpen,
    setIsEditDialogOpen,
    editName,
    setEditName,
    editEmail,
    setEditEmail,
    editPhone,
    setEditPhone,
    editIsActive,
    setEditIsActive,
    updating,
    handleEditStaffSubmit,
    isDeleteDialogOpen,
    setIsDeleteDialogOpen,
    deleting,
    handleDeleteStaff,
  };
};

export default useStaff;
