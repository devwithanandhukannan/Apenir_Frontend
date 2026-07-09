import { useCallback } from 'react';
import { useApi, BaseRequestOptions } from '@/core_components/hooks/useApi/useApi';

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

export function useLabService() {
  const { post } = useApi();

  // API Caller to load labs
  const getLabs = useCallback(
    async (options?: Omit<BaseRequestOptions<LabsResponse>, 'endpoint' | 'requireAuth'>) => {
      const response = await post<LabsResponse, any>({
        endpoint: '/api/admin/labs',
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
    [post]
  );

  return { getLabs };
}

export default useLabService;
