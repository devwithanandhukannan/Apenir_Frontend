import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/router";
import {
  useLabService,
  LabDetailsResponseData,
  StaffItem,
} from "@/core_components/apis/admin/labService";

export const useLabDetails = () => {
  const router = useRouter();
  const { id } = router.query;
  const { getLabDetails, updateLabStatus } = useLabService();

  const [loading, setLoading] = useState(true);
  const [lab, setLab] = useState<LabDetailsResponseData | null>(null);
  const [staff, setStaff] = useState<StaffItem[]>([]);
  const [staffLoading, setStaffLoading] = useState(false);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

  const fetchDetails = useCallback(async () => {
    if (!id || typeof id !== "string") return;
    setLoading(true);

    const response = await getLabDetails(id);
    if (response.success && response.data?.data) {
      const data = response.data.data;
      setLab({ ...data, id });
      setStaff(data.staff || []);
    }

    setLoading(false);
  }, [id, getLabDetails]);

  useEffect(() => {
    if (id) {
      fetchDetails();
    }
  }, [id, fetchDetails]);

  const toggleLabStatus = useCallback(async () => {
    if (!lab || !id || typeof id !== "string")
      return { success: false, message: "Invalid action." };
    setIsUpdatingStatus(true);
    const newActiveState = !lab.isActive;
    const response = await updateLabStatus(id, newActiveState);
    setIsUpdatingStatus(false);

    if (response.success) {
      // Optimistically update status in local state or refetch details
      setLab((prev) =>
        prev
          ? {
              ...prev,
              isActive: newActiveState,
              status: newActiveState ? "Active" : "Inactive",
            }
          : null,
      );
      return {
        success: true,
        message: `Lab branch account successfully ${newActiveState ? "activated" : "deactivated"}.`,
      };
    }
    return {
      success: false,
      message: response.data?.message || "Failed to update lab status.",
    };
  }, [lab, id, updateLabStatus]);

  return {
    lab,
    staff,
    loading,
    staffLoading,
    isUpdatingStatus,
    toggleLabStatus,
    handleBack: () => router.push("/admin/lab-console"),
    refetch: fetchDetails,
  };
};

export default useLabDetails;
