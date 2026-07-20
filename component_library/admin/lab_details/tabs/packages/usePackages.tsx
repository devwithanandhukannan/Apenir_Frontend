import { useState, useEffect, useMemo, useCallback } from "react";
import axios from "axios";
import { useApi } from "@/core_components/hooks/useApi/useApi";
import { useAbortController } from "@/core_components/hooks/useAbortController/useAbortController";

export interface AdminBranchPackageItem {
  branchPackageId?: string;
  packageId: string;
  name: string;
  description?: string;
  basePrice: number;
  originalPrice?: number | null;
  defaultCommissionPct: number;
  customPrice?: number | null;
  customOriginalPrice?: number | null;
  customCommissionPct?: number | null;
  isEnrolled: boolean;
  isActive: boolean;
  serviceIds: string[];
}

const PACKAGES_KEYS = ["FETCH_PACKAGES_REQUEST"] as const;

export const usePackages = (branchId: string) => {
  const { get, put } = useApi();
  const { controllers } = useAbortController(PACKAGES_KEYS);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [packages, setPackages] = useState<AdminBranchPackageItem[]>([]);
  const [search, setSearch] = useState("");

  const fetchPackages = useCallback(async () => {
    if (!branchId) return;
    setLoading(true);
    controllers.FETCH_PACKAGES_REQUEST.reset();
    const signal = controllers.FETCH_PACKAGES_REQUEST.signal;
    try {
      const response = await get<any>({
        endpoint: `/api/admin/branches/${branchId}/packages`,
        requireAuth: true,
        signal,
      });

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
        setPackages(response.data.data);
      } else {
        setPackages([]);
      }
      setLoading(false);
    } catch (e: any) {
      if (
        signal.aborted ||
        e?.name === "CanceledError" ||
        e?.message === "canceled" ||
        axios.isCancel(e)
      ) {
        return;
      }
      console.error("Failed to load branch packages:", e);
      setPackages([]);
      setLoading(false);
    }
  }, [branchId, get, controllers]);

  useEffect(() => {
    fetchPackages();
  }, [fetchPackages]);

  /** Update commission % for a specific package on this branch */
  const updateCommission = useCallback(
    async (packageId: string, commissionPct: number) => {
      setSaving(true);
      const response = await put<any, any>({
        endpoint: `/api/admin/branches/${branchId}/packages/${packageId}/commission`,
        body: { commissionPct },
        requireAuth: true,
      });
      setSaving(false);
      if (response.success) {
        await fetchPackages();
      }
      return response;
    },
    [branchId, put, fetchPackages],
  );

  /** Full override: price, original price, commission, active toggle for a package */
  const overridePackage = useCallback(
    async (
      packageId: string,
      payload: {
        customPrice: number | null;
        customOriginalPrice: number | null;
        customCommissionPct?: number | null;
        isActive: boolean;
      },
    ) => {
      setSaving(true);
      const response = await put<any, any>({
        endpoint: `/api/admin/branches/${branchId}/packages/${packageId}`,
        body: payload,
        requireAuth: true,
      });
      setSaving(false);
      if (response.success) {
        await fetchPackages();
      }
      return response;
    },
    [branchId, put, fetchPackages],
  );

  const filteredPackages = useMemo(() => {
    const q = search.toLowerCase();
    return packages.filter(
      (p) =>
        !q ||
        p.name.toLowerCase().includes(q) ||
        (p.description && p.description.toLowerCase().includes(q)),
    );
  }, [packages, search]);

  return {
    packages: filteredPackages,
    allPackages: packages,
    loading,
    saving,
    search,
    setSearch,
    fetchPackages,
    updateCommission,
    overridePackage,
  };
};

export default usePackages;
