import { useState, useEffect, useCallback, useMemo } from "react";
import { useAbortController } from "@/core_components/hooks/useAbortController/useAbortController";
import {
  useLab,
  LabPaymentBatchItem,
  GetLabPaymentBatchDetailsResponse,
} from "@/core_components/apis/admin/lab";
import {
  GridFilters,
  PaginationProps,
} from "@/shared_features/responsive_grid/type";

export type { LabPaymentBatchItem };

const BATCH_KEYS = ["FETCH_BATCHES_REQUEST", "FETCH_DETAILS_REQUEST"] as const;

export const usePaymentBatch = () => {
  const {
    getCurrentLabPaymentBatches,
    getCurrentLabPaymentBatchDetails,
    confirmBatchReceipt,
    rejectBatchReceipt,
    getCurrentLabUnbatchedPayments,
    requestLabPayoutBatch,
  } = useLab();

  const { controllers } = useAbortController(BATCH_KEYS);

  const [loading, setLoading] = useState(true);
  const [batches, setBatches] = useState<LabPaymentBatchItem[]>([]);

  // Dialog details state
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false);
  const [selectedBatch, setSelectedBatch] =
    useState<LabPaymentBatchItem | null>(null);
  const [batchDetails, setBatchDetails] = useState<any | null>(null);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  // Unbatched completed payments
  const [unbatchedPayments, setUnbatchedPayments] = useState<any[]>([]);
  const [loadingUnbatched, setLoadingUnbatched] = useState(false);

  // Filters state
  const [filters, setFilters] = useState<GridFilters>({
    search: "",
    sortBy: "createdAt",
    sortDirection: "DESC",
    pageNumber: 1,
    pageSize: 5,
    status: [],
  });

  // Fetch all payment batches: POST /api/lab/payment-batches/list
  const fetchBatches = useCallback(async () => {
    setLoading(true);
    try {
      controllers.FETCH_BATCHES_REQUEST.reset();
      const response = await getCurrentLabPaymentBatches(
        {
          pageNumber: filters.pageNumber,
          pageSize: filters.pageSize,
        },
        { signal: controllers.FETCH_BATCHES_REQUEST.signal },
      );

      if (
        response.error &&
        (response.error.name === "CanceledError" ||
          response.error.message === "canceled")
      ) {
        return;
      }

      if (response.success && response.data && response.data.data) {
        const resData = response.data.data as any;
        let batchList: LabPaymentBatchItem[] = [];
        if (Array.isArray(resData)) {
          batchList = resData;
        } else if (resData && Array.isArray(resData.items)) {
          batchList = resData.items;
        }
        setBatches(batchList);
      } else {
        setBatches([]);
      }
      setLoading(false);
    } catch (err: any) {
      if (err?.name === "CanceledError" || err?.message === "canceled") {
        return;
      }
      console.error("Failed to load batches:", err);
      setBatches([]);
      setLoading(false);
    }
  }, [
    getCurrentLabPaymentBatches,
    controllers,
    filters.pageNumber,
    filters.pageSize,
  ]);

  // Fetch detailed info of selected batch: GET /api/lab/payment-batches/{batchId}
  const fetchBatchDetails = useCallback(
    async (batchId: string) => {
      setDetailsLoading(true);
      setBatchDetails(null);
      try {
        controllers.FETCH_DETAILS_REQUEST.reset();
        const response = await getCurrentLabPaymentBatchDetails(batchId, {
          signal: controllers.FETCH_DETAILS_REQUEST.signal,
        });

        if (
          response.error &&
          (response.error.name === "CanceledError" ||
            response.error.message === "canceled")
        ) {
          return;
        }

        if (response.success && response.data && response.data.data) {
          setBatchDetails(response.data.data);
        } else {
          // Fallback mock details if GET details fails to load for UI demo
          setBatchDetails({
            id: batchId,
            batchNumber:
              selectedBatch?.batchNumber ||
              `BAT-${batchId.substring(0, 6).toUpperCase()}`,
            status: selectedBatch?.status ?? 1,
            totalNetPayout: selectedBatch?.totalNetPayout ?? 0,
            totalGrossAmount: selectedBatch?.totalGrossAmount ?? 0,
            totalPlatformCommission:
              selectedBatch?.totalPlatformCommission ?? 0,
            createdAt: selectedBatch?.createdAt || new Date().toISOString(),
            appointments: [
              {
                id: "apt-1",
                appointmentNumber: "APT-88271",
                customerName: "Anandhu Kannan",
                grossAmount: 1200,
                commission: 120,
                netPayout: 1080,
                paymentStatus: "Pending Confirmation",
              },
            ],
          });
        }
        setDetailsLoading(false);
      } catch (err: any) {
        if (err?.name === "CanceledError" || err?.message === "canceled") {
          return;
        }
        console.error("Failed to load batch details:", err);
        // Fallback
        setBatchDetails({
          id: batchId,
          batchNumber:
            selectedBatch?.batchNumber ||
            `BAT-${batchId.substring(0, 6).toUpperCase()}`,
          status: selectedBatch?.status ?? 1,
          totalNetPayout: selectedBatch?.totalNetPayout ?? 0,
          totalGrossAmount: selectedBatch?.totalGrossAmount ?? 0,
          totalPlatformCommission: selectedBatch?.totalPlatformCommission ?? 0,
          createdAt: selectedBatch?.createdAt || new Date().toISOString(),
          appointments: [],
        });
        setDetailsLoading(false);
      }
    },
    [getCurrentLabPaymentBatchDetails, controllers, selectedBatch],
  );

  // Confirm / Approve batch payout receipt
  const handleApproveBatch = useCallback(async () => {
    if (!selectedBatch)
      return { success: false, message: "No batch selected." };
    setActionLoading(true);
    try {
      const response = await confirmBatchReceipt(selectedBatch.id);
      if (response.success) {
        setIsDetailsDialogOpen(false);
        fetchBatches();
        return {
          success: true,
          message:
            response.data?.message || "Batch payment approved successfully!",
        };
      } else {
        return {
          success: false,
          message:
            response.data?.message ||
            response.error?.message ||
            "Failed to approve batch receipt.",
        };
      }
    } catch (err: any) {
      console.error("Approve batch error:", err);
      return {
        success: false,
        message: err.message || "An error occurred during approval.",
      };
    } finally {
      setActionLoading(false);
    }
  }, [selectedBatch, confirmBatchReceipt, fetchBatches]);

  // Reject batch payout receipt
  const handleRejectBatch = useCallback(async () => {
    if (!selectedBatch)
      return { success: false, message: "No batch selected." };
    setActionLoading(true);
    try {
      const response = await rejectBatchReceipt(selectedBatch.id);
      if (response.success) {
        setIsDetailsDialogOpen(false);
        fetchBatches();
        return {
          success: true,
          message:
            response.data?.message || "Batch payout rejected successfully!",
        };
      } else {
        return {
          success: false,
          message:
            response.data?.message ||
            response.error?.message ||
            "Failed to reject batch receipt.",
        };
      }
    } catch (err: any) {
      console.error("Reject batch error:", err);
      return {
        success: false,
        message: err.message || "An error occurred during rejection.",
      };
    } finally {
      setActionLoading(false);
    }
  }, [selectedBatch, rejectBatchReceipt, fetchBatches]);

  // Fetch unbatched completed payments
  const fetchUnbatchedPayments = useCallback(async () => {
    setLoadingUnbatched(true);
    try {
      const response = await getCurrentLabUnbatchedPayments();
      if (response.success && response.data && response.data.data) {
        setUnbatchedPayments(response.data.data);
      } else {
        setUnbatchedPayments([]);
      }
    } catch (e) {
      console.error("Failed to load unbatched payments:", e);
      setUnbatchedPayments([]);
    } finally {
      setLoadingUnbatched(false);
    }
  }, [getCurrentLabUnbatchedPayments]);

  // Request batch payout
  const handleRequestPayout = useCallback(
    async (paymentIds: string[], notes?: string | null) => {
      setActionLoading(true);
      try {
        const response = await requestLabPayoutBatch({ paymentIds, notes });
        if (response.success) {
          fetchBatches();
          fetchUnbatchedPayments();
          return {
            success: true,
            message: "Payout request submitted successfully!",
          };
        } else {
          return {
            success: false,
            message:
              response.data?.message ||
              response.error?.message ||
              "Failed to submit payout request.",
          };
        }
      } catch (e: any) {
        return { success: false, message: e.message || "An error occurred." };
      } finally {
        setActionLoading(false);
      }
    },
    [requestLabPayoutBatch, fetchBatches, fetchUnbatchedPayments],
  );

  useEffect(() => {
    fetchBatches();
    fetchUnbatchedPayments();
  }, [fetchBatches, fetchUnbatchedPayments]);

  // Filtering & Search
  const filteredData = useMemo(() => {
    return batches
      .filter((batch) => {
        if (filters.search) {
          const query = filters.search.toLowerCase();
          const matches =
            (batch.batchNumber &&
              batch.batchNumber.toLowerCase().includes(query)) ||
            (batch.id && batch.id.toLowerCase().includes(query));
          if (!matches) return false;
        }

        if (filters.status && filters.status.length > 0) {
          const label =
            batch.status === 1
              ? "Initiated"
              : batch.status === 2
                ? "Paid"
                : batch.status === 3
                  ? "Settled"
                  : batch.status === 4
                    ? "Abandoned"
                    : `Status ${batch.status}`;
          if (!filters.status.includes(label)) return false;
        }

        return true;
      })
      .sort((a, b) => {
        const field = (filters.sortBy ||
          "createdAt") as keyof LabPaymentBatchItem;
        const dir = filters.sortDirection === "DESC" ? -1 : 1;

        const valA: any = a[field];
        const valB: any = b[field];

        if (typeof valA === "string" && typeof valB === "string") {
          return valA.localeCompare(valB) * dir;
        }
        if (typeof valA === "number" && typeof valB === "number") {
          return (valA - valB) * dir;
        }
        return 0;
      });
  }, [batches, filters]);

  const pagination: PaginationProps = useMemo(() => {
    return {
      pageNumber: filters.pageNumber,
      pageSize: filters.pageSize,
      pageCount: Math.ceil(filteredData.length / filters.pageSize) || 1,
      totalRows: filteredData.length,
    };
  }, [filters.pageNumber, filters.pageSize, filteredData.length]);

  const paginatedData = useMemo(() => {
    const start = (filters.pageNumber - 1) * filters.pageSize;
    return filteredData.slice(start, start + filters.pageSize);
  }, [filteredData, filters.pageNumber, filters.pageSize]);

  return {
    loading,
    paginatedData,
    pagination,
    filters,
    setFilters,
    isDetailsDialogOpen,
    setIsDetailsDialogOpen,
    selectedBatch,
    setSelectedBatch,
    batchDetails,
    setBatchDetails,
    detailsLoading,
    actionLoading,
    fetchBatches,
    fetchBatchDetails,
    handleApproveBatch,
    handleRejectBatch,
    unbatchedPayments,
    loadingUnbatched,
    fetchUnbatchedPayments,
    handleRequestPayout,
  };
};

export default usePaymentBatch;
