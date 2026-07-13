import { useCallback } from "react";
import {
  useApi,
  BaseRequestOptions,
  MutationRequestOptions,
} from "@/core_components/hooks/useApi/useApi";

// Lab Auth interfaces
export interface LabLoginRequest {
  token: string;
}

export interface LabLoginResponse {
  success: boolean;
  message: string;
  data: {
    token: string;
    lab: {
      id: string;
      name: string;
      email: string;
    };
  };
  errors: string[];
}

// Lab Staff interfaces
export interface LabStaffMember {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role?: string;
  isActive?: boolean;
  status?: string;
}

export interface LabStaffListResponse {
  success: boolean;
  message: string;
  data:
    LabStaffMember[] | { items: LabStaffMember[]; totalRows?: number } | any;
  errors: string[];
}

// Lab Appointment interfaces
export interface LabAppointmentItem {
  id: string;
  appointmentNumber: string;
  customerUserId: string;
  branchId: string;
  appointmentSlotId: string;
  locationLatitude: number;
  locationLongitude: number;
  locationAddress: string;
  passcode: string;
  status: number;
  totalAmount: number;
  platformCommission: number;
  labPayout: number;
  assignedStaffId: string | null;
  createdAt: string;
  updatedAt: string | null;
  memberCount: number;
  landmark: string | null;
  buildingDetails: string | null;
  floor: string | null;
  reportPdfPath: string | null;
  customerUser: any | null;
  branch: any | null;
  appointmentSlot: any | null;
  assignedStaff: any | null;
}

export interface CurrentLabAppointmentsResponse {
  success: boolean;
  message: string;
  data: LabAppointmentItem[];
  errors: string[];
}

// Lab Service interfaces
export interface LabServiceItem {
  branchServiceId: string;
  serviceId: string;
  name: string;
  category: string;
  description: string;
  basePrice: number;
  customPrice: number | null;
  customCommissionPct: number | null;
  isActive: boolean;
}

export interface CurrentLabServicesResponse {
  success: boolean;
  message: string;
  data: LabServiceItem[];
  errors: string[];
}

export interface UpdateLabServiceRequest {
  customPrice?: number | null;
  isActive: boolean;
}

export interface CreateLabCustomServiceRequest {
  name: string;
  category: string;
  description?: string;
  basePrice: number;
  customPrice?: number | null;
}

// Lab Payment Batch interfaces
export interface LabPaymentBatchItem {
  id: string;
  batchNumber: string;
  totalGrossAmount: number;
  totalPlatformCommission: number;
  totalNetPayout: number;
  status: number;
  createdAt: string;
  updatedAt: string | null;
  paymentCount?: number;
}

export interface LabPaymentBatchListResponse {
  success: boolean;
  message: string;
  data: LabPaymentBatchItem[];
  errors: string[];
}

export interface GetLabPaymentBatchDetailsResponse {
  success: boolean;
  message: string;
  data: {
    id: string;
    batchNumber: string;
    status: number;
    totalNetPayout: number;
    totalGrossAmount: number;
    totalPlatformCommission: number;
    createdAt: string;
    updatedAt: string | null;
    appointments: any[];
  };
  errors: string[];
}

export const useLab = () => {
  const { get, post, put, delete: del } = useApi();

  // Lab Login using token
  const labLogin = useCallback(
    async (
      payload: LabLoginRequest,
      options?: Omit<
        MutationRequestOptions<LabLoginResponse, LabLoginRequest>,
        "endpoint" | "body" | "requireAuth"
      >,
    ) => {
      const response = await post<LabLoginResponse, LabLoginRequest>({
        endpoint: "/api/lab/login",
        body: payload,
        requireAuth: false,
        signal: options?.signal,
        onSuccess: (data: any) => {
          if (options?.onSuccess) {
            options.onSuccess(data);
          }
        },
        onError: (err: any) => {
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

  // Get staff of currently logged in lab
  const getCurrentLabStaff = useCallback(
    async (
      options?: Omit<
        BaseRequestOptions<LabStaffListResponse>,
        "endpoint" | "requireAuth"
      >,
    ) => {
      const response = await get<LabStaffListResponse>({
        endpoint: "/api/lab/staff",
        requireAuth: true,
        signal: options?.signal,
        onSuccess: (data: any) => {
          if (options?.onSuccess) {
            options.onSuccess(data);
          }
        },
        onError: (err: any) => {
          if (options?.onError) {
            options.onError(err);
          }
        },
        headers: options?.headers,
        params: options?.params,
      });

      return response;
    },
    [get],
  );

  // Invite/add staff member to currently logged in lab
  const addCurrentLabStaff = useCallback(
    async (
      payload: { name: string; email: string },
      options?: Omit<
        MutationRequestOptions<any, any>,
        "endpoint" | "body" | "requireAuth"
      >,
    ) => {
      const response = await post<any, any>({
        endpoint: "/api/lab/staff/invite",
        body: payload,
        requireAuth: true,
        signal: options?.signal,
        onSuccess: (data: any) => {
          if (options?.onSuccess) {
            options.onSuccess(data);
          }
        },
        onError: (err: any) => {
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

  // Update staff details
  const updateCurrentLabStaff = useCallback(
    async (
      staffId: string,
      payload: {
        id?: string;
        name: string;
        email: string;
        phone: string;
        isActive: boolean;
      },
      options?: Omit<
        MutationRequestOptions<any, any>,
        "endpoint" | "body" | "requireAuth"
      >,
    ) => {
      const response = await put<any, any>({
        endpoint: `/api/lab/staff/${staffId}`,
        body: payload,
        requireAuth: true,
        signal: options?.signal,
        onSuccess: (data: any) => {
          if (options?.onSuccess) {
            options.onSuccess(data);
          }
        },
        onError: (err: any) => {
          if (options?.onError) {
            options.onError(err);
          }
        },
        headers: options?.headers,
        params: options?.params,
      });

      return response;
    },
    [put],
  );

  // Delete staff member
  const deleteCurrentLabStaff = useCallback(
    async (
      staffId: string,
      options?: Omit<BaseRequestOptions<any>, "endpoint" | "requireAuth">,
    ) => {
      const response = await del<any>({
        endpoint: `/api/lab/staff/${staffId}`,
        requireAuth: true,
        signal: options?.signal,
        onSuccess: (data: any) => {
          if (options?.onSuccess) {
            options.onSuccess(data);
          }
        },
        onError: (err: any) => {
          if (options?.onError) {
            options.onError(err);
          }
        },
        headers: options?.headers,
        params: options?.params,
      });

      return response;
    },
    [del],
  );

  // Get appointments of currently logged in lab
  const getCurrentLabAppointments = useCallback(
    async (
      options?: Omit<
        BaseRequestOptions<CurrentLabAppointmentsResponse>,
        "endpoint" | "requireAuth"
      >,
    ) => {
      const response = await get<CurrentLabAppointmentsResponse>({
        endpoint: "/api/lab/appointments",
        requireAuth: true,
        signal: options?.signal,
        onSuccess: (data: any) => {
          if (options?.onSuccess) {
            options.onSuccess(data);
          }
        },
        onError: (err: any) => {
          if (options?.onError) {
            options.onError(err);
          }
        },
        headers: options?.headers,
        params: options?.params,
      });

      return response;
    },
    [get],
  );

  // Assign staff to appointment
  const assignStaffToAppointment = useCallback(
    async (
      appointmentId: string,
      payload: { staffId: string | null },
      options?: Omit<
        MutationRequestOptions<any, any>,
        "endpoint" | "body" | "requireAuth"
      >,
    ) => {
      const response = await post<any, any>({
        endpoint: `/api/lab/appointments/${appointmentId}/assign-staff`,
        body: payload,
        requireAuth: true,
        signal: options?.signal,
        onSuccess: (data: any) => {
          if (options?.onSuccess) {
            options.onSuccess(data);
          }
        },
        onError: (err: any) => {
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

  // Get services of currently logged in lab
  const getCurrentLabServices = useCallback(
    async (
      options?: Omit<
        BaseRequestOptions<CurrentLabServicesResponse>,
        "endpoint" | "requireAuth"
      >,
    ) => {
      const response = await get<CurrentLabServicesResponse>({
        endpoint: "/api/lab/services",
        requireAuth: true,
        signal: options?.signal,
        onSuccess: (data: any) => {
          if (options?.onSuccess) {
            options.onSuccess(data);
          }
        },
        onError: (err: any) => {
          if (options?.onError) {
            options.onError(err);
          }
        },
        headers: options?.headers,
        params: options?.params,
      });

      return response;
    },
    [get],
  );

  // List all payment batches of currently logged in lab
  const getCurrentLabPaymentBatches = useCallback(
    async (
      payload?: any,
      options?: Omit<
        MutationRequestOptions<LabPaymentBatchListResponse, any>,
        "endpoint" | "body" | "requireAuth"
      >,
    ) => {
      const response = await post<LabPaymentBatchListResponse, any>({
        endpoint: "/api/lab/payment-batches/list",
        body: payload || {},
        requireAuth: true,
        signal: options?.signal,
        onSuccess: (data: any) => {
          if (options?.onSuccess) {
            options.onSuccess(data);
          }
        },
        onError: (err: any) => {
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

  // Get details of a specific payment batch
  const getCurrentLabPaymentBatchDetails = useCallback(
    async (
      batchId: string,
      options?: Omit<
        BaseRequestOptions<GetLabPaymentBatchDetailsResponse>,
        "endpoint" | "requireAuth"
      >,
    ) => {
      const response = await get<GetLabPaymentBatchDetailsResponse>({
        endpoint: `/api/lab/payment-batches/${batchId}`,
        requireAuth: true,
        signal: options?.signal,
        onSuccess: (data: any) => {
          if (options?.onSuccess) {
            options.onSuccess(data);
          }
        },
        onError: (err: any) => {
          if (options?.onError) {
            options.onError(err);
          }
        },
        headers: options?.headers,
        params: options?.params,
      });

      return response;
    },
    [get],
  );

  // Confirm receipt of batch payout payments at lab end
  const confirmBatchReceipt = useCallback(
    async (
      batchId: string,
      options?: Omit<
        MutationRequestOptions<any, any>,
        "endpoint" | "body" | "requireAuth"
      >,
    ) => {
      const response = await post<any, any>({
        endpoint: `/api/lab/payment-batches/${batchId}/confirm-receipt`,
        body: {},
        requireAuth: true,
        signal: options?.signal,
        onSuccess: (data: any) => {
          if (options?.onSuccess) {
            options.onSuccess(data);
          }
        },
        onError: (err: any) => {
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

  // Reject batch receipt at lab end
  const rejectBatchReceipt = useCallback(
    async (
      batchId: string,
      options?: Omit<
        MutationRequestOptions<any, any>,
        "endpoint" | "body" | "requireAuth"
      >,
    ) => {
      const response = await post<any, any>({
        endpoint: `/api/lab/payment-batches/${batchId}/reject`,
        body: {},
        requireAuth: true,
        signal: options?.signal,
        onSuccess: (data: any) => {
          if (options?.onSuccess) {
            options.onSuccess(data);
          }
        },
        onError: (err: any) => {
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

  // Update a branch service override (toggle active, set custom price)
  const updateLabService = useCallback(
    async (
      serviceId: string,
      payload: UpdateLabServiceRequest,
      options?: Omit<
        MutationRequestOptions<any, UpdateLabServiceRequest>,
        "endpoint" | "body" | "requireAuth"
      >,
    ) => {
      const response = await put<any, UpdateLabServiceRequest>({
        endpoint: `/api/lab/services/${serviceId}`,
        body: payload,
        requireAuth: true,
        signal: options?.signal,
        onSuccess: (data: any) => {
          if (options?.onSuccess) options.onSuccess(data);
        },
        onError: (err: any) => {
          if (options?.onError) options.onError(err);
        },
        headers: options?.headers,
        params: options?.params,
      });
      return response;
    },
    [put],
  );

  // Create a new private custom service for this branch
  const createLabCustomService = useCallback(
    async (
      payload: CreateLabCustomServiceRequest,
      options?: Omit<
        MutationRequestOptions<any, CreateLabCustomServiceRequest>,
        "endpoint" | "body" | "requireAuth"
      >,
    ) => {
      const response = await post<any, CreateLabCustomServiceRequest>({
        endpoint: "/api/lab/services",
        body: payload,
        requireAuth: true,
        signal: options?.signal,
        onSuccess: (data: any) => {
          if (options?.onSuccess) options.onSuccess(data);
        },
        onError: (err: any) => {
          if (options?.onError) options.onError(err);
        },
        headers: options?.headers,
        params: options?.params,
      });
      return response;
    },
    [post],
  );

  return {
    labLogin,
    getCurrentLabStaff,
    addCurrentLabStaff,
    updateCurrentLabStaff,
    deleteCurrentLabStaff,
    getCurrentLabAppointments,
    assignStaffToAppointment,
    getCurrentLabServices,
    updateLabService,
    createLabCustomService,
    getCurrentLabPaymentBatches,
    getCurrentLabPaymentBatchDetails,
    confirmBatchReceipt,
    rejectBatchReceipt,
  };
};

export default useLab;
