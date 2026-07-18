import { useState, useEffect, useMemo, useCallback } from "react";
import {
  GridFilters,
  PaginationProps,
} from "@/shared_features/responsive_grid/type";
import {
  useLabService,
  UnbatchedPaymentItem,
  PaymentBatchDetailResponse,
} from "@/core_components/apis/admin/labService";

export interface BatchPaymentItem {
  id: string;
  batchRef: string;
  payoutDate: string;
  grossAmount: number;
  commission: number;
  netAmount: number;
  status: "Transferred" | "Processing" | "Failed";
}

export const useBatchPayment = (labId: string) => {
  const {
    getUnbatchedPayments,
    createBatchPayment,
    listBatchPayments,
    getBatchDetails,
    deleteBatchPayment,
  } = useLabService();
  const [loading, setLoading] = useState(true);
  const [batches, setBatches] = useState<BatchPaymentItem[]>([]);

  // Dialog & selection state parameters
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [unbatchedPayments, setUnbatchedPayments] = useState<
    UnbatchedPaymentItem[]
  >([]);
  const [unbatchedLoading, setUnbatchedLoading] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Batch details dialog state parameters
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);
  const [selectedBatchDetail, setSelectedBatchDetail] =
    useState<PaymentBatchDetailResponse | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Maintain grid UI filter state
  const [filters, setFilters] = useState<GridFilters>({
    search: "",
    sortBy: "payoutDate",
    sortDirection: "DESC",
    pageNumber: 1,
    pageSize: 5,
    status: [],
  });

  // Fetch payout batches list from API
  const fetchBatches = useCallback(async () => {
    if (!labId) return;
    setLoading(true);
    const response = await listBatchPayments({
      branchId: labId,
      pageNumber: 1,
      rowsPerPage: 100,
    });

    if (response.success && response.data?.data?.items) {
      const apiBatches = response.data.data.items;

      const mapped: BatchPaymentItem[] = apiBatches.map((pb: any) => {
        // Map C# PaymentBatchStatus (1 = Initiated, 2 = Paid, 3 = Settled, 4 = Abandoned)
        let statusString: "Transferred" | "Processing" | "Failed" =
          "Processing";
        const statusVal = pb.status;
        if (
          statusVal === 3 ||
          statusVal === "Settled" ||
          statusVal === "settled" ||
          statusVal === "Transferred"
        ) {
          statusString = "Transferred";
        } else if (
          statusVal === 4 ||
          statusVal === "Abandoned" ||
          statusVal === "abandoned" ||
          statusVal === "Failed"
        ) {
          statusString = "Failed";
        } else {
          statusString = "Processing";
        }

        return {
          id: pb.id,
          batchRef: pb.notes || `BAT-${pb.id.slice(0, 6).toUpperCase()}`,
          payoutDate: pb.createdAt,
          grossAmount: Number(pb.totalGrossAmount || 0),
          commission: Number(pb.totalPlatformCommission || 0),
          netAmount: Number(pb.totalNetPayout || 0),
          status: statusString,
        };
      });

      setBatches(mapped);
    } else {
      setBatches([]);
    }
    setLoading(false);
  }, [labId, listBatchPayments]);

  useEffect(() => {
    fetchBatches();
  }, [fetchBatches]);

  // Fetch unbatched items from live API
  const fetchUnbatched = useCallback(async () => {
    if (!labId) return;
    setUnbatchedLoading(true);
    const response = await getUnbatchedPayments(labId);
    if (response.success && response.data?.data) {
      setUnbatchedPayments(response.data.data);
    } else {
      setUnbatchedPayments([]);
    }
    setUnbatchedLoading(false);
  }, [labId, getUnbatchedPayments]);

  // Fetch specific batch detail
  const fetchBatchDetail = useCallback(
    async (batchId: string) => {
      setIsDetailDialogOpen(true);
      setDetailLoading(true);
      const response = await getBatchDetails(batchId);
      if (response.success && response.data?.data) {
        setSelectedBatchDetail(response.data.data);
      } else {
        setSelectedBatchDetail(null);
      }
      setDetailLoading(false);
    },
    [getBatchDetails],
  );

  // Trigger loading when modal dialog is opened
  useEffect(() => {
    if (isDialogOpen) {
      fetchUnbatched();
      setSelectedIds([]);
    }
  }, [isDialogOpen, fetchUnbatched]);

  // Toggle selection inside unbatched checklist
  const toggleSelectPayment = useCallback((paymentId: string) => {
    setSelectedIds((prev) =>
      prev.includes(paymentId)
        ? prev.filter((id) => id !== paymentId)
        : [...prev, paymentId],
    );
  }, []);

  // Submit batch request
  const submitBatch = useCallback(async () => {
    if (selectedIds.length === 0)
      return { success: false, message: "Select at least one payment." };
    setIsSubmitting(true);
    const response = await createBatchPayment({
      branchId: labId,
      paymentIds: selectedIds,
      notes: null,
    });

    if (response.success) {
      setIsDialogOpen(false);
      fetchBatches(); // Refresh table batches list
    }
    setIsSubmitting(false);
    return {
      success: response.success,
      message:
        response.data?.message ||
        (response.success
          ? "Batch payout created successfully!"
          : "Failed to submit batch payout."),
    };
  }, [labId, selectedIds, createBatchPayment, fetchBatches]);

  // Delete batch request
  const deleteBatch = useCallback(
    async (batchId: string) => {
      setIsDeleting(true);
      const response = await deleteBatchPayment(batchId);
      if (response.success) {
        setIsDetailDialogOpen(false);
        fetchBatches(); // Refresh table list
      }
      setIsDeleting(false);
      return {
        success: response.success,
        message:
          response.data?.message ||
          (response.success
            ? "Batch payout deleted successfully!"
            : "Failed to delete batch payout."),
      };
    },
    [deleteBatchPayment, fetchBatches],
  );

  const summary = useMemo(() => {
    let totalPaid = 0;
    batches.forEach((b) => {
      if (b.status === "Transferred") {
        totalPaid += b.netAmount;
      }
    });

    return {
      totalPaidOut: totalPaid,
      lastPayout: batches.length > 0 ? batches[0].netAmount : 0,
      nextPayoutDate: "2026-07-15",
    };
  }, [batches]);

  const filteredBatches = useMemo(() => {
    return batches
      .filter((bt) => {
        if (filters.search) {
          const query = filters.search.toLowerCase();
          const matchesSearch = bt.batchRef.toLowerCase().includes(query);
          if (!matchesSearch) return false;
        }

        if (filters.status && filters.status.length > 0) {
          if (!filters.status.includes(bt.status)) return false;
        }

        return true;
      })
      .sort((a, b) => {
        const field = (filters.sortBy ||
          "payoutDate") as keyof BatchPaymentItem;
        const dir = filters.sortDirection === "DESC" ? -1 : 1;

        const valA = a[field];
        const valB = b[field];

        if (typeof valA === "string" && typeof valB === "string") {
          return valA.localeCompare(valB) * dir;
        }
        if (typeof valA === "number" && typeof valB === "number") {
          return (valA - valB) * dir;
        }
        return 0;
      });
  }, [batches, filters]);

  // Pagination parameters
  const pagination: PaginationProps = useMemo(
    () => ({
      pageNumber: filters.pageNumber,
      pageSize: filters.pageSize,
      pageCount: Math.ceil(filteredBatches.length / filters.pageSize) || 1,
      totalRows: filteredBatches.length,
    }),
    [filters.pageNumber, filters.pageSize, filteredBatches.length],
  );

  // Slice paginated block
  const paginatedData = useMemo(() => {
    const start = (filters.pageNumber - 1) * filters.pageSize;
    return filteredBatches.slice(start, start + filters.pageSize);
  }, [filteredBatches, filters.pageNumber, filters.pageSize]);

  // Aggregate selected checklist amounts
  const selectedTotal = useMemo(() => {
    return unbatchedPayments
      .filter((item) => selectedIds.includes(item.paymentId))
      .reduce((sum, item) => sum + (item.totalAmount || 0), 0);
  }, [unbatchedPayments, selectedIds]);

  const selectedPayout = useMemo(() => {
    return unbatchedPayments
      .filter((item) => selectedIds.includes(item.paymentId))
      .reduce((sum, item) => sum + (item.labPayout || 0), 0);
  }, [unbatchedPayments, selectedIds]);

  const selectAllPayments = useCallback(() => {
    if (selectedIds.length === unbatchedPayments.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(unbatchedPayments.map((p) => p.paymentId));
    }
  }, [selectedIds, unbatchedPayments]);

  return {
    paginatedData,
    loading,
    filters,
    setFilters,
    pagination,
    summary,
    isDialogOpen,
    setIsDialogOpen,
    unbatchedPayments,
    unbatchedLoading,
    selectedIds,
    setSelectedIds,
    toggleSelectPayment,
    submitBatch,
    isSubmitting,
    selectedTotal,
    selectedPayout,
    isDetailDialogOpen,
    setIsDetailDialogOpen,
    selectedBatchDetail,
    detailLoading,
    fetchBatchDetail,
    isDeleting,
    deleteBatch,
    selectAllPayments,
  };
};

export default useBatchPayment;
