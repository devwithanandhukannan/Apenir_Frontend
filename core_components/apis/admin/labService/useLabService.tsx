import { useCallback } from "react";
import {
  useApi,
  BaseRequestOptions,
  MutationRequestOptions,
} from "@/core_components/hooks/useApi/useApi";

// ---------- Lab User API Types ----------
export interface LabLoginRequest {
  email: string;
  password: string;
}

export interface LabLoginResponseData {
  accessToken: string;
  expiresIn: number;
  labId: string;
  email: string;
}

export interface LabLoginResponse {
  success: boolean;
  message: string;
  data: LabLoginResponseData;
  errors: any[];
}

export interface LabStaffMember {
  id: string;
  name: string | null;
  email: string | null;
  phone: string | null;
  role: string | number;
  isActive: boolean | null;
  status: string | null;
  createdAt: string | null;
}

export interface LabStaffListResponse {
  success: boolean;
  message: string;
  data:
    LabStaffMember[] | { items: LabStaffMember[]; totalRows?: number } | any;
  errors: string[];
}

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

export interface LabDetailsResponseData {
  id: string;
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
  createdAt: string;
  contactPerson: {
    id: string;
    name: string;
    email: string;
    phone: string;
    status: string;
  } | null;
  staff: StaffItem[];
  stats: {
    totalAppointments: number;
    completedAppointments: number;
    pendingAppointments: number;
    totalRevenue: number;
    totalLabPayout: number;
    totalStaffCount: number;
    totalServicesCount: number;
    activeSlotsCount: number;
  };
}

export interface LabDetailsResponse {
  success: boolean;
  message: string;
  data: LabDetailsResponseData;
  errors: string[];
}

export interface ServiceCreateRequest {
  name: string;
  description?: string;
  category: string;
  basePrice: number;
  platformCommissionPct: number;
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
  const { get, post, put, delete: del } = useApi();

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

  // API Caller to login as lab user
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

  // API Caller to get staff of currently logged in lab
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

  // API Caller to add staff member to currently logged in lab
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

  // API Caller to get appointments of currently logged in lab
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

  // API Caller to assign staff to an appointment
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

  // API Caller to get services of currently logged in lab
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

  // API Caller to update staff member details of currently logged in lab
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
    [put],
  );

  // API Caller to delete staff member of currently logged in lab
  const deleteCurrentLabStaff = useCallback(
    async (
      staffId: string,
      options?: Omit<BaseRequestOptions<any>, "endpoint" | "requireAuth">,
    ) => {
      const response = await del<any>({
        endpoint: `/api/lab/staff/${staffId}`,
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
    [del],
  );

  // API Caller to list all payment batches of currently logged in lab
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

  // API Caller to get details of a specific payment batch
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

  // API Caller to confirm receipt of batch payout payments at lab end
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

  // API Caller to reject batch receipt at lab end
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

  // Get lab details including manager and stats
  const getLabDetails = useCallback(
    async (
      labId: string,
      options?: Omit<
        BaseRequestOptions<LabDetailsResponse>,
        "endpoint" | "requireAuth"
      >,
    ) => {
      const response = await get<LabDetailsResponse>({
        endpoint: `/api/admin/labs/${labId}/details`,
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

  // Update lab status (activate/deactivate)
  const updateLabStatus = useCallback(
    async (
      labId: string,
      isActive: boolean,
      options?: Omit<
        MutationRequestOptions<any, any>,
        "endpoint" | "body" | "requireAuth"
      >,
    ) => {
      const response = await put<any, any>({
        endpoint: `/api/admin/labs/${labId}/status`,
        body: { isActive },
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
    [put],
  );

  // Add new service
  const addService = useCallback(
    async (
      payload: ServiceCreateRequest,
      options?: Omit<
        MutationRequestOptions<any, any>,
        "endpoint" | "body" | "requireAuth"
      >,
    ) => {
      const response = await post<any, any>({
        endpoint: "/api/services",
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
    labLogin,
    getCurrentLabStaff,
    addCurrentLabStaff,
    getCurrentLabAppointments,
    assignStaffToAppointment,
    getCurrentLabServices,
    updateCurrentLabStaff,
    deleteCurrentLabStaff,
    getCurrentLabPaymentBatches,
    getCurrentLabPaymentBatchDetails,
    confirmBatchReceipt,
    rejectBatchReceipt,
    getLabDetails,
    updateLabStatus,
    addService,
  };
}

export default useLabService;
