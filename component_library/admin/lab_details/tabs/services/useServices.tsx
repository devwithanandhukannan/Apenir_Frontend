import { useState, useEffect, useMemo, useCallback } from "react";
import axios from "axios";
import { useApi } from "@/core_components/hooks/useApi/useApi";
import { useAbortController } from "@/core_components/hooks/useAbortController/useAbortController";

export interface AdminBranchServiceItem {
  branchServiceId?: string;
  serviceId: string;
  name: string;
  category: string;
  description?: string;
  basePrice: number;
  originalPrice?: number | null;
  defaultCommissionPct: number;
  customPrice?: number | null;
  customOriginalPrice?: number | null;
  customCommissionPct?: number | null;
  isEnrolled: boolean;
  isActive: boolean;
  isCustom: boolean;
}

const SERVICES_KEYS = ["FETCH_SERVICES_REQUEST"] as const;

export const useServices = (branchId: string) => {
  const { get, put } = useApi();
  const { controllers } = useAbortController(SERVICES_KEYS);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [services, setServices] = useState<AdminBranchServiceItem[]>([]);
  const [search, setSearch] = useState("");

  const fetchServices = useCallback(async () => {
    if (!branchId) return;
    setLoading(true);
    controllers.FETCH_SERVICES_REQUEST.reset();
    const signal = controllers.FETCH_SERVICES_REQUEST.signal;
    try {
      const response = await get<any>({
        endpoint: `/api/admin/branches/${branchId}/services`,
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
        setServices(response.data.data);
      } else {
        setServices([]);
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
      console.error("Failed to load branch services:", e);
      setServices([]);
      setLoading(false);
    }
  }, [branchId, get, controllers]);

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

  /** Full override: price, original price, commission, active toggle for a service */
  const overrideService = useCallback(
    async (
      serviceId: string,
      payload: {
        customPrice?: number | null;
        customOriginalPrice?: number | null;
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
