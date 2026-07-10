import { useCallback } from "react";
import {
  useApi,
  BaseRequestOptions,
} from "@/core_components/hooks/useApi/useApi";

// Schema mapping the properties of a Staff member returned by the API
export interface StaffMember {
  id: string;
  name: string | null;
  email: string | null;
  phone: string | null;
  role: number;
  isActive: boolean | null;
  isDeleted: boolean;
  status: string | null;
  labId: string | null;
  permissions: string[];
  lastLoginAt: string | null;
  resetPasswordToken: string | null;
  resetPasswordTokenExpiry: string | null;
  createdAt: string | null;
  updatedAt: string | null;
}

// Wrapper structure for the staff list API response
export interface StaffListResponse {
  success: boolean;
  message: string;
  data: StaffMember[];
  errors: string[];
}

export function useStaffService() {
  const { post } = useApi();

  // API Caller to load all staff members
  const getStaff = useCallback(
    async (
      options?: Omit<
        BaseRequestOptions<StaffListResponse>,
        "endpoint" | "requireAuth"
      >,
    ) => {
      const response = await post<StaffListResponse, any>({
        endpoint: "/api/admin/users/staff",
        body: null,
        requireAuth: true,
        signal: options?.signal,
        onSuccess: (data) => {
          if (options?.onSuccess) {
            options.onSuccess(data);
          }
        },
        onError: (err) => {
          if (options?.onError) {
            options.onError(err);
          }
        },
        headers: options?.headers,
        params: options?.params,
      });

      return response;
    },
    [post],
  );

  return {
    getStaff,
  };
}

export default useStaffService;
