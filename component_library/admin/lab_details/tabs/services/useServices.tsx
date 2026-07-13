import { useState, useEffect, useMemo, useCallback } from "react";
import { useApi } from "@/core_components/hooks/useApi/useApi";

export interface AdminBranchServiceItem {
  branchServiceId?: string;
  serviceId: string;
  name: string;
  category: string;
  description?: string;
  basePrice: number;
  defaultCommissionPct: number;
  customPrice?: number | null;
  customCommissionPct?: number | null;
  isEnrolled: boolean;
  isActive: boolean;
  isCustom: boolean;
}

export const useServices = (branchId: string) => {
  const { get, put } = useApi();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [services, setServices] = useState<AdminBranchServiceItem[]>([]);
  const [search, setSearch] = useState("");

  const fetchServices = useCallback(async () => {
    if (!branchId) return;
    setLoading(true);
    try {
      const response = await get<any>({
        endpoint: `/api/admin/branches/${branchId}/services`,
        requireAuth: true,
      });
      if (response.success && response.data?.data) {
        setServices(response.data.data);
      } else {
        setServices([]);
      }
    } catch (e) {
      console.error("Failed to load branch services:", e);
      setServices([]);
    } finally {
      setLoading(false);
    }
  }, [branchId, get]);

  useEffect(() => {
    fetchServices();
  }, [fetchServices]);

  /** Update commission % for a specific service on this branch */
  const updateCommission = useCallback(
    async (serviceId: string, commissionPct: number) => {
      setSaving(true);
      const response = await put<any, any>({
        endpoint: `/api/admin/branches/${branchId}/services/${serviceId}/commission`,
        body: { commissionPct },
        requireAuth: true,
      });
      setSaving(false);
      if (response.success) {
        await fetchServices();
      }
      return response;
    },
    [branchId, put, fetchServices],
  );

  /** Full override: price, commission, active toggle for a service */
  const overrideService = useCallback(
    async (
      serviceId: string,
      payload: {
        customPrice?: number | null;
        customCommissionPct?: number | null;
        isActive: boolean;
      },
    ) => {
      setSaving(true);
      const response = await put<any, any>({
        endpoint: `/api/admin/branches/${branchId}/services/${serviceId}`,
        body: payload,
        requireAuth: true,
      });
      setSaving(false);
      if (response.success) {
        await fetchServices();
      }
      return response;
    },
    [branchId, put, fetchServices],
  );

  const filteredServices = useMemo(() => {
    const q = search.toLowerCase();
    return services.filter(
      (s) =>
        !q ||
        s.name.toLowerCase().includes(q) ||
        s.category.toLowerCase().includes(q),
    );
  }, [services, search]);

  return {
    services: filteredServices,
    allServices: services,
    loading,
    saving,
    search,
    setSearch,
    fetchServices,
    updateCommission,
    overrideService,
  };
};

export default useServices;
