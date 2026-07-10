import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/router";
import {
  useLabService,
  LabItem,
  StaffItem,
} from "@/core_components/apis/admin/labService";

export const useLabDetails = () => {
  const router = useRouter();
  const { id } = router.query;
  const { getLabs, getLabStaff } = useLabService();

  const [loading, setLoading] = useState(true);
  const [lab, setLab] = useState<LabItem | null>(null);
  const [staff, setStaff] = useState<StaffItem[]>([]);
  const [staffLoading, setStaffLoading] = useState(false);

  const fetchDetails = useCallback(async () => {
    if (!id) return;
    setLoading(true);

    // 1. Fetch lab details by matching from list
    const labsResponse = await getLabs();
    if (labsResponse.success && labsResponse.data?.data) {
      const foundLab = labsResponse.data.data.find((l) => l.id === id);
      if (foundLab) {
        setLab(foundLab);

        // 2. Fetch staff associated with the lab
        setStaffLoading(true);
        const staffResponse = await getLabStaff(foundLab.id, {
          pageNumber: 1,
          rowsPerPage: 50,
        });
        if (staffResponse.success && staffResponse.data?.data?.items) {
          setStaff(staffResponse.data.data.items);
        }
        setStaffLoading(false);
      }
    }

    setLoading(false);
  }, [id, getLabs, getLabStaff]);

  useEffect(() => {
    if (id) {
      fetchDetails();
    }
  }, [id, fetchDetails]);

  return {
    lab,
    staff,
    loading,
    staffLoading,
    handleBack: () => router.push("/admin/lab-console"),
  };
};

export default useLabDetails;
