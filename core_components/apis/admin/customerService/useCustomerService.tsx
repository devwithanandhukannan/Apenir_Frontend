import { useCallback } from "react";
import {
  useApi,
  BaseRequestOptions,
} from "@/core_components/hooks/useApi/useApi";

// Schema mapping the properties of a Customer returned by the API
export interface CustomerMember {
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

// Wrapper structure for the customer list API response
export interface CustomerListResponse {
  success: boolean;
  message: string;
  data: CustomerMember[];
  errors: string[];
}

export function useCustomerService() {
  const { post } = useApi();

  // API Caller to load all customers
  const getCustomers = useCallback(
    async (
      options?: Omit<
        BaseRequestOptions<CustomerListResponse>,
        "endpoint" | "requireAuth"
      >,
    ) => {
      const response = await post<CustomerListResponse, any>({
        endpoint: "/api/admin/users/customers",
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
    getCustomers,
  };
}

export default useCustomerService;
