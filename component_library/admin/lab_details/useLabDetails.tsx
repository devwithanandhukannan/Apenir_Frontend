import { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { useRouter } from "next/router";
import {
  useLabService,
  LabDetailsResponseData,
  StaffItem,
} from "@/core_components/apis/admin/labService";
import { useAbortController } from "@/core_components/hooks/useAbortController/useAbortController";

const LAB_DETAILS_KEYS = ["FETCH_LAB_DETAILS_REQUEST"] as const;

export const useLabDetails = () => {
  const router = useRouter();
  const { id } = router.query;
  const { getLabDetails, updateLabStatus } = useLabService();
  const { controllers } = useAbortController(LAB_DETAILS_KEYS);

  const [loading, setLoading] = useState(true);
  const [lab, setLab] = useState<LabDetailsResponseData | null>(null);
  const [staff, setStaff] = useState<StaffItem[]>([]);
  const [staffLoading, setStaffLoading] = useState(false);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

  const fetchDetails = useCallback(async () => {
    if (!id || typeof id !== "string") return;
    setLoading(true);

    controllers.FETCH_LAB_DETAILS_REQUEST.reset();
    const signal = controllers.FETCH_LAB_DETAILS_REQUEST.signal;

    try {
      const response = await getLabDetails(id, { signal });

      if (
        signal.aborted ||
        (response.error &&
          (response.error.name === "CanceledError" ||
            response.error.message === "canceled" ||
            axios.isCancel(response.error)))
      ) {
        return;
      }

      if (response.success && response.data?.data) {
        const data = response.data.data;
        setLab({ ...data, id });
        setStaff(data.staff || []);
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
      setLoading(false);
    }
  }, [id, getLabDetails, controllers]);

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
