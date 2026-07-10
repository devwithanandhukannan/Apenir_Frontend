import { useCallback } from "react";
import {
  useApi,
  BaseRequestOptions,
} from "@/core_components/hooks/useApi/useApi";

// Schema mapping the properties of a Lab returned by the API
export interface LabItem {
  id: string;
  labUserId: string;
  name: string;
  district: string;
  city: string;
  pincode: string;
  latitude: number;
  longitude: number;
  phone: string;
  isActive: boolean;
  status: string | null;
  labId: string | null;
  serviceRangeKm: number;
  notificationPhone: string | null;
  createdBy: string;
  createdAt: string;
  labUser: any | null;
  creator: any | null;
}

// Wrapper structure for standard API envelopes
export interface LabsResponse {
  success: boolean;
  message: string;
  data: LabItem[];
  errors: string[];
}

// Schema mapping individual staff members associated with a lab
export interface StaffItem {
  id: string;
  name: string;
  email: string;
  phone: string;
  status: string;
}

// Wrapper structure for paginated staff API payload response
export interface LabStaffResponseData {
  items: StaffItem[];
  pageNumber: number;
  pageSize: number;
  rowsPerPage: number;
  pageCount: number;
  totalRows: number;
}

export interface LabStaffResponse {
  success: boolean;
  message: string;
  data: LabStaffResponseData;
  errors: string[];
}

export interface AppointmentItem {
  id: string;
  appointmentNumber: string;
  customerName: string;
  scheduledTime: string;
  tests: string;
  amount: number;
  status: "Scheduled" | "Completed" | "Cancelled";
}

export interface LabAppointmentsResponseData {
  items: AppointmentItem[];
  pageNumber: number;
  pageSize: number;
  rowsPerPage: number;
  pageCount: number;
  totalRows: number;
}

export interface LabAppointmentsResponse {
  success: boolean;
  message: string;
  data: LabAppointmentsResponseData;
  errors: string[];
}

export interface UnbatchedPaymentItem {
  paymentId: string;
  appointmentId: string;
  appointmentNumber: string;
  customerName: string;
  totalAmount: number;
  platformCommission: number;
  labPayout: number;
  paidAt: string | null;
  paymentMethod: string | null;
}

export interface UnbatchedPaymentsResponse {
  success: boolean;
  message: string;
  data: UnbatchedPaymentItem[];
  errors: string[];
}

export interface CreateBatchRequest {
  branchId: string;
  paymentIds: string[];
  notes: string | null;
}

export interface CreateBatchResponse {
  success: boolean;
  message: string;
  data: any;
  errors: string[];
}

export interface SearchBatchesRequest {
  branchId?: string;
  status?: number;
  startDate?: string;
  endDate?: string;
  pageNumber?: number;
  rowsPerPage?: number;
}

export interface PaymentBatchItem {
  id: string;
  branchId: string;
  paymentIds: string[];
  appointmentIds: string[];
  paymentCount: number;
  totalGrossAmount: number;
  totalPlatformCommission: number;
  totalNetPayout: number;
  status: number; // 0 = Initiated, 1 = Verified, 2 = Disbursed, 3 = Cancelled
  createdBy: string;
  notes: string | null;
  createdAt: string;
  transferRef: string | null;
}

export interface PaymentBatchListResponseData {
  items: PaymentBatchItem[];
  pageNumber: number;
  pageSize: number;
  rowsPerPage: number;
  pageCount: number;
  totalRows: number;
}

export interface PaymentBatchListResponse {
  success: boolean;
  message: string;
  data: PaymentBatchListResponseData;
  errors: string[];
}

export interface BatchPaymentItemDto {
  paymentId: string;
  appointmentId: string;
  appointmentNumber: string;
  customerName: string;
  totalAmount: number;
  platformCommission: number;
  labPayout: number;
  paidAt: string | null;
  paymentMethod: string | null;
}

export interface PaymentBatchDetailResponse {
  id: string;
  branchId: string;
  branchName: string;
  paymentCount: number;
  totalGrossAmount: number;
  totalPlatformCommission: number;
  totalNetPayout: number;
  status: number;
  createdBy: string | null;
  confirmedByLabUser: string | null;
  confirmedAt: string | null;
  createdAt: string;
  notes: string | null;
  payments: BatchPaymentItemDto[];
}

export interface GetBatchDetailsResponse {
  success: boolean;
  message: string;
  data: PaymentBatchDetailResponse;
  errors: string[];
}

export interface InviteLabRequest {
  email: string;
  labName: string;
}

export interface InviteLabResponse {
  success: boolean;
  message: string;
  data: any;
  errors: string[];
}

export function useLabService() {
  const { get, post, delete: del } = useApi();

  // API Caller to load labs list
  const getLabs = useCallback(
    async (
      options?: Omit<
        BaseRequestOptions<LabsResponse>,
        "endpoint" | "requireAuth"
      >,
    ) => {
      const response = await post<LabsResponse, any>({
        endpoint: "/api/admin/labs",
        body: null, // As specified in curl --data 'null'
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

  // API Caller to load staff associated with a lab
  const getLabStaff = useCallback(
    async (
      labId: string,
      payload?: { pageNumber?: number; rowsPerPage?: number },
      options?: Omit<
        BaseRequestOptions<LabStaffResponse>,
        "endpoint" | "requireAuth"
      >,
    ) => {
      const response = await post<LabStaffResponse, any>({
        endpoint: `/api/admin/labs/${labId}/staff`,
        body: payload || { pageNumber: 1, rowsPerPage: 10 },
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

  // API Caller to load appointments associated with a lab
  const getLabAppointments = useCallback(
    async (
      labId: string,
      payload?: {
        appointmentNumber?: string;
        status?: string;
        pageNumber?: number;
        rowsPerPage?: number;
      },
      options?: Omit<
        BaseRequestOptions<LabAppointmentsResponse>,
        "endpoint" | "requireAuth"
      >,
    ) => {
      const response = await post<LabAppointmentsResponse, any>({
        endpoint: `/api/admin/labs/${labId}/appointments`,
        body: payload || { pageNumber: 1, rowsPerPage: 50 },
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

  // API Caller to load unbatched payments for a lab
  const getUnbatchedPayments = useCallback(
    async (
      labId: string,
      options?: Omit<
        BaseRequestOptions<UnbatchedPaymentsResponse>,
        "endpoint" | "requireAuth"
      >,
    ) => {
      const response = await get<UnbatchedPaymentsResponse>({
        endpoint: `/api/admin/batch-payments/labs/${labId}/unbatched-payments`,
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
    [get],
  );

  // API Caller to create a batch payout
  const createBatchPayment = useCallback(
    async (
      payload: CreateBatchRequest,
      options?: Omit<
        BaseRequestOptions<CreateBatchResponse>,
        "endpoint" | "requireAuth"
      >,
    ) => {
      const response = await post<CreateBatchResponse, CreateBatchRequest>({
        endpoint: "/api/admin/batch-payments",
        body: payload,
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

  // API Caller to list payout batches for a lab
  const listBatchPayments = useCallback(
    async (
      payload?: SearchBatchesRequest,
      options?: Omit<
        BaseRequestOptions<PaymentBatchListResponse>,
        "endpoint" | "requireAuth"
      >,
    ) => {
      const response = await post<
        PaymentBatchListResponse,
        SearchBatchesRequest
      >({
        endpoint: "/api/admin/batch-payments/list",
        body: payload || {},
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

  // API Caller to get details of a specific batch payment
  const getBatchDetails = useCallback(
    async (
      batchId: string,
      options?: Omit<
        BaseRequestOptions<GetBatchDetailsResponse>,
        "endpoint" | "requireAuth"
      >,
    ) => {
      const response = await get<GetBatchDetailsResponse>({
        endpoint: `/api/admin/batch-payments/${batchId}`,
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
    [get],
  );

  // API Caller to delete/abandon a specific batch payment
  const deleteBatchPayment = useCallback(
    async (
      batchId: string,
      options?: Omit<BaseRequestOptions<any>, "endpoint" | "requireAuth">,
    ) => {
      const response = await del<any>({
        endpoint: `/api/admin/batch-payments/${batchId}`,
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
        headers: {
          "Content-Type": "text/plain;charset=UTF-8",
          ...(options?.headers || {}),
        },
        params: options?.params,
      });

      return response;
    },
    [del],
  );

  // API Caller to invite a new lab
  const inviteLab = useCallback(
    async (
      payload: InviteLabRequest,
      options?: Omit<
        BaseRequestOptions<InviteLabResponse>,
        "endpoint" | "requireAuth"
      >,
    ) => {
      const response = await post<InviteLabResponse, InviteLabRequest>({
        endpoint: "/api/lab-invitation/invite",
        body: payload,
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
    getLabs,
    getLabStaff,
    getLabAppointments,
    getUnbatchedPayments,
    createBatchPayment,
    listBatchPayments,
    getBatchDetails,
    deleteBatchPayment,
    inviteLab,
  };
}

export default useLabService;
