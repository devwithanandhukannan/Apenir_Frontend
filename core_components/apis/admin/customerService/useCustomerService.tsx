import { useCallback } from "react";
import {
  useApi,
  BaseRequestOptions,
  MutationRequestOptions,
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

// Wrapper structure for the customer list API response (admin view)
export interface CustomerListResponse {
  success: boolean;
  message: string;
  data: CustomerMember[];
  errors: string[];
}

// Customer profile from GET /api/customer/profile
export interface CustomerProfile {
  id: string;
  name: string | null;
  phone: string;
  gender: string | null;
  dob: string | null;
  district: string | null;
  address: string | null;
}

export interface CustomerProfileResponse {
  success: boolean;
  message: string;
  data: CustomerProfile;
  errors: string[];
}

// Appointment item returned from GET /api/appointments
export interface CustomerAppointmentItem {
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
  branch: {
    id: string;
    name: string | null;
    address: string | null;
    district: string | null;
  } | null;
  appointmentSlot: {
    id: string;
    slotDate: string | null;
    startTime: string | null;
    endTime: string | null;
  } | null;
}

export interface CustomerAppointmentsResponse {
  success: boolean;
  message: string;
  data: CustomerAppointmentItem[];
  errors: string[];
}

// Book appointment request body
export interface BookAppointmentRequest {
  latitude: number;
  longitude: number;
  serviceId?: string;
  itemIds?: string[];
  slotId: string;
  memberCount: number;
  buildingDetails: string;
  landmark: string;
  floor: string;
}

export interface BookAppointmentResponse {
  success: boolean;
  message: string;
  data: CustomerAppointmentItem;
  errors: string[];
}

export function useCustomerService() {
  const { post, get, put } = useApi();

  // API Caller to load all customers (admin view)
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

  // Get current logged-in customer's profile
  const getMyProfile = useCallback(
    async (
      options?: Omit<
        BaseRequestOptions<CustomerProfileResponse>,
        "endpoint" | "requireAuth"
      >,
    ) => {
      const response = await get<CustomerProfileResponse>({
        endpoint: "/api/customer/profile",
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

  // Update current logged-in customer's profile
  const updateMyProfile = useCallback(
    async (
      payload: {
        name?: string;
        gender?: string;
        dob?: string;
        address?: string;
        district?: string;
      },
      options?: Omit<
        MutationRequestOptions<any, any>,
        "endpoint" | "body" | "requireAuth"
      >,
    ) => {
      const response = await put<any, any>({
        endpoint: "/api/customer/profile",
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

  // Get all appointments for the current logged-in customer
  const getMyAppointments = useCallback(
    async (
      options?: Omit<
        BaseRequestOptions<CustomerAppointmentsResponse>,
        "endpoint" | "requireAuth"
      >,
    ) => {
      const response = await get<CustomerAppointmentsResponse>({
        endpoint: "/api/appointments",
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

  // Book a new diagnostic appointment
  const bookAppointment = useCallback(
    async (
      payload: BookAppointmentRequest,
      options?: Omit<
        MutationRequestOptions<BookAppointmentResponse, BookAppointmentRequest>,
        "endpoint" | "body" | "requireAuth"
      >,
    ) => {
      const response = await post<
        BookAppointmentResponse,
        BookAppointmentRequest
      >({
        endpoint: "/api/appointments/book",
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

  // Send OTP passcode to a phone number
  const sendOtp = useCallback(
    async (
      phone: string,
      options?: Omit<
        MutationRequestOptions<any, any>,
        "endpoint" | "body" | "requireAuth"
      >,
    ) => {
      const response = await post<any, any>({
        endpoint: "/api/auth/otp/send",
        body: { phone },
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

  // Verify OTP passcode and login/register user
  const verifyOtp = useCallback(
    async (
      phone: string,
      otp: string,
      options?: Omit<
        MutationRequestOptions<any, any>,
        "endpoint" | "body" | "requireAuth"
      >,
    ) => {
      const response = await post<any, any>({
        endpoint: "/api/auth/otp/verify",
        body: { phone, otp },
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

  // Cancel an appointment
  const cancelAppointment = useCallback(
    async (
      id: string,
      options?: Omit<
        MutationRequestOptions<any, any>,
        "endpoint" | "body" | "requireAuth"
      >,
    ) => {
      const response = await post<any, any>({
        endpoint: `/api/appointments/${id}/cancel`,
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
    getMyProfile,
    updateMyProfile,
    getMyAppointments,
    bookAppointment,
    sendOtp,
    verifyOtp,
    cancelAppointment,
  };
}

export default useCustomerService;
