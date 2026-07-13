import { useState, useEffect, useCallback } from "react";
import { useApi } from "@/core_components/hooks/useApi/useApi";

// ── DTOs ────────────────────────────────────────────────────────────────

export interface PackageServiceDetail {
  serviceId: string;
  name: string;
  category: string;
  description: string;
  basePrice: number;
  customPrice?: number | null;
}

export interface BranchPackageItem {
  packageId: string;
  name: string;
  description: string;
  basePrice: number;
  customPrice?: number | null;
  platformCommissionPct: number;
  customCommissionPct?: number | null;
  isActive: boolean;
  isAdminPackage: boolean;
  services: PackageServiceDetail[];
}

export interface CreateLabCustomPackageRequest {
  name: string;
  description: string;
  customPrice: number;
  serviceIds: string[];
}

// ── Hook ─────────────────────────────────────────────────────────────────

export const usePackages = () => {
  const { get, post, put, delete: apiDelete } = useApi();

  const [packages, setPackages] = useState<BranchPackageItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // ── Load ──────────────────────────────────────────────────────────────
  const loadPackages = useCallback(async () => {
    setLoading(true);
    const res = await get<any>({
      endpoint: "/api/packages/lab",
      requireAuth: true,
    });
    if (res.success && res.data?.data) {
      setPackages(res.data.data);
    } else {
      setPackages([]);
    }
    setLoading(false);
  }, [get]);

  useEffect(() => {
    loadPackages();
  }, [loadPackages]);

  // ── Admin package subscribe ────────────────────────────────────────────
  const subscribePackage = useCallback(
    async (packageId: string) => {
      setSaving(true);
      const res = await post<any, undefined>({
        endpoint: `/api/packages/lab/${packageId}/subscribe`,
        requireAuth: true,
      });
      setSaving(false);
      if (res.success) await loadPackages();
      return res;
    },
    [post, loadPackages],
  );

  // ── Admin package unsubscribe ──────────────────────────────────────────
  const unsubscribePackage = useCallback(
    async (packageId: string) => {
      setSaving(true);
      const res = await post<any, undefined>({
        endpoint: `/api/packages/lab/${packageId}/unsubscribe`,
        requireAuth: true,
      });
      setSaving(false);
      if (res.success) await loadPackages();
      return res;
    },
    [post, loadPackages],
  );

  // ── Override price for admin package ──────────────────────────────────
  const overridePackagePrice = useCallback(
    async (packageId: string, customPrice: number) => {
      setSaving(true);
      const res = await put<any, any>({
        endpoint: `/api/packages/lab/${packageId}/override`,
        body: { customPrice },
        requireAuth: true,
      });
      setSaving(false);
      if (res.success) await loadPackages();
      return res;
    },
    [put, loadPackages],
  );

  // ── Create lab custom package ──────────────────────────────────────────
  const createCustomPackage = useCallback(
    async (payload: CreateLabCustomPackageRequest) => {
      setSaving(true);
      const res = await post<any, any>({
        endpoint: "/api/packages/lab/custom",
        body: payload,
        requireAuth: true,
      });
      setSaving(false);
      if (res.success) await loadPackages();
      return res;
    },
    [post, loadPackages],
  );

  // ── Edit lab custom package ────────────────────────────────────────────
  const updateCustomPackage = useCallback(
    async (packageId: string, payload: CreateLabCustomPackageRequest) => {
      setSaving(true);
      const res = await put<any, any>({
        endpoint: `/api/packages/lab/custom/${packageId}`,
        body: payload,
        requireAuth: true,
      });
      setSaving(false);
      if (res.success) await loadPackages();
      return res;
    },
    [put, loadPackages],
  );

  // ── Delete lab custom package ──────────────────────────────────────────
  const deleteCustomPackage = useCallback(
    async (packageId: string) => {
      setSaving(true);
      const res = await apiDelete<any>({
        endpoint: `/api/packages/lab/custom/${packageId}`,
        requireAuth: true,
      });
      setSaving(false);
      if (res.success) await loadPackages();
      return res;
    },
    [apiDelete, loadPackages],
  );

  const adminPackages = packages.filter((p) => p.isAdminPackage);
  const customPackages = packages.filter((p) => !p.isAdminPackage);

  return {
    packages,
    adminPackages,
    customPackages,
    loading,
    saving,
    loadPackages,
    subscribePackage,
    unsubscribePackage,
    overridePackagePrice,
    createCustomPackage,
    updateCustomPackage,
    deleteCustomPackage,
  };
};

export default usePackages;
