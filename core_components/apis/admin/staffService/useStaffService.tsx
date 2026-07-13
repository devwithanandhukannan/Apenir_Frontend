import { useCallback } from "react";
import {
  useApi,
  BaseRequestOptions,
  MutationRequestOptions,
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

// Staff appointment DTO from StaffController
export interface StaffAppointmentItem {
  id: string;
  appointmentNumber: string;
  customerName: string;
  customerPhone: string;
  locationAddress: string;
  locationLatitude: number;
  locationLongitude: number;
  landmark: string | null;
  buildingDetails: string | null;
  floor: string | null;
  status: number;
  memberCount: number;
  slotDate: string | null;
  slotStartTime: string | null;
}

export interface StaffAppointmentsResponse {
  success: boolean;
  message: string;
  data: StaffAppointmentItem[];
  errors: string[];
}

export interface OtpVerificationResult {
  verified: boolean;
  memberCount: number;
  customerPhone: string;
  existingProfiles: {
    id: string;
    name: string | null;
    gender: string | null;
    dob: string | null;
    address: string | null;
  }[];
}

export interface OtpVerifyResponse {
  success: boolean;
  message: string;
  data: OtpVerificationResult;
  errors: string[];
}

export interface AppointmentMemberInput {
  name: string;
  age: number;
  gender: string;
  relationship?: string;
  additionalNotes?: string;
}

export function useStaffService() {
  const { post, get } = useApi();

  // API Caller to load all staff members (admin view)
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

  // Get appointments assigned to the logged-in phlebotomist/staff member
  const getMyAppointments = useCallback(
    async (
      options?: Omit<
        BaseRequestOptions<StaffAppointmentsResponse>,
        "endpoint" | "requireAuth"
      >,
    ) => {
      const response = await get<StaffAppointmentsResponse>({
        endpoint: "/api/staff/appointments",
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

  // Update appointment status (coming | reached | reachedlab)
  const updateAppointmentStatus = useCallback(
    async (
      appointmentId: string,
      status: "coming" | "reached" | "reachedlab",
      options?: Omit<
        MutationRequestOptions<any, any>,
        "endpoint" | "body" | "requireAuth"
      >,
    ) => {
      const response = await post<any, any>({
        endpoint: `/api/staff/appointments/${appointmentId}/status`,
        body: { status },
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

  // Verify customer OTP/passcode to confirm sample collection
  const verifyOtp = useCallback(
    async (
      appointmentId: string,
      otp: string,
      options?: Omit<
        MutationRequestOptions<OtpVerifyResponse, any>,
        "endpoint" | "body" | "requireAuth"
      >,
    ) => {
      const response = await post<OtpVerifyResponse, any>({
        endpoint: `/api/staff/appointments/${appointmentId}/verify-otp`,
        body: { otp },
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

  // Submit member details after OTP verification
  const addAppointmentMembers = useCallback(
    async (
      appointmentId: string,
      members: AppointmentMemberInput[],
      options?: Omit<
        MutationRequestOptions<any, any>,
        "endpoint" | "body" | "requireAuth"
      >,
    ) => {
      const response = await post<any, any>({
        endpoint: `/api/staff/appointments/${appointmentId}/members`,
        body: { members },
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
    getMyAppointments,
    updateAppointmentStatus,
    verifyOtp,
    addAppointmentMembers,
  };
}

export default useStaffService;
