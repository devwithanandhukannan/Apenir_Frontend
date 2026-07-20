import { useState, useEffect, useCallback, useMemo } from "react";
import axios from "axios";
import {
  GridFilters,
  PaginationProps,
} from "@/shared_features/responsive_grid/type";
import {
  useLabService,
  UnbatchedPaymentItem,
} from "@/core_components/apis/admin/labService";
import { useAbortController } from "@/core_components/hooks/useAbortController/useAbortController";

export interface MappedInvoiceItem {
  id: string;
  invoiceNumber: string;
  customerName: string;
  date: string;
  amount: number;
  commission: number;
  labPayout: number;
  paymentMethod: string;
  status: "Paid" | "Pending";
}

const FINANCE_KEYS = ["FETCH_FINANCE_REQUEST"] as const;

export const useFinance = (labId: string) => {
  const { getUnbatchedPayments } = useLabService();
  const { controllers } = useAbortController(FINANCE_KEYS);
  const [loading, setLoading] = useState(true);
  const [invoices, setInvoices] = useState<MappedInvoiceItem[]>([]);

  // Maintain grid UI filter state
  const [filters, setFilters] = useState<GridFilters>({
    search: "",
    sortBy: "date",
    sortDirection: "DESC",
    pageNumber: 1,
    pageSize: 5,
    status: [],
  });

  const fetchFinance = useCallback(async () => {
    if (!labId) return;
    setLoading(true);
    controllers.FETCH_FINANCE_REQUEST.reset();
    const signal = controllers.FETCH_FINANCE_REQUEST.signal;

    try {
      const response = await getUnbatchedPayments(labId, { signal });

      if (
        signal.aborted ||
        (response.error &&
          (response.error.name === "CanceledError" ||
            response.error.message === "canceled" ||
            axios.isCancel(response.error)))
      ) {
        return;
      }

      if (response.success && response.data?.data) {
        const apiPayments = response.data.data;
        // Map raw API array items to the frontend invoices structure
        const mapped: MappedInvoiceItem[] = apiPayments.map((item) => ({
          id: item.paymentId,
          invoiceNumber: item.appointmentNumber,
          customerName: item.customerName || "Customer",
          date: item.paidAt || new Date().toISOString(),
          amount: Number(item.totalAmount || 0),
          commission: Number(item.platformCommission || 0),
          labPayout: Number(item.labPayout || 0),
          paymentMethod: item.paymentMethod || "UPI",
          status: "Paid", // unbatched payments are received/paid invoices
        }));

        setInvoices(mapped);
      } else {
        setInvoices([]);
      }
      setLoading(false);
    } catch (error: any) {
      if (
        signal.aborted ||
        error?.name === "CanceledError" ||
        error?.message === "canceled" ||
        axios.isCancel(error)
      ) {
        return;
      }
      setInvoices([]);
      setLoading(false);
    }
  }, [labId, getUnbatchedPayments, controllers]);

  useEffect(() => {
    fetchFinance();
  }, [fetchFinance]);

  // Aggregate stats on the fly
  const summary = useMemo(() => {
    let totalRevenue = 0;
    let totalPaid = 0;
    let totalCommission = 0;

    invoices.forEach((inv) => {
      totalRevenue += inv.amount;
      totalPaid += inv.labPayout;
      totalCommission += inv.commission;
    });

    return {
      totalRevenue,
      totalPaid,
      totalCommission,
    };
  }, [invoices]);

  const filteredInvoices = useMemo(() => {
    return invoices
      .filter((inv) => {
        if (filters.search) {
          const query = filters.search.toLowerCase();
          const matchesSearch =
            inv.invoiceNumber.toLowerCase().includes(query) ||
            inv.customerName.toLowerCase().includes(query) ||
            inv.paymentMethod.toLowerCase().includes(query);
          if (!matchesSearch) return false;
        }

        if (filters.status && filters.status.length > 0) {
          if (!filters.status.includes(inv.status)) return false;
        }

        return true;
      })
      .sort((a, b) => {
        const field = (filters.sortBy || "date") as keyof MappedInvoiceItem;
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
  }, [invoices, filters]);

  // Pagination parameters
  const pagination: PaginationProps = useMemo(
    () => ({
      pageNumber: filters.pageNumber,
      pageSize: filters.pageSize,
      pageCount: Math.ceil(filteredInvoices.length / filters.pageSize) || 1,
      totalRows: filteredInvoices.length,
    }),
    [filters.pageNumber, filters.pageSize, filteredInvoices.length],
  );

  // Slice paginated block
  const paginatedData = useMemo(() => {
    const start = (filters.pageNumber - 1) * filters.pageSize;
    return filteredInvoices.slice(start, start + filters.pageSize);
  }, [filteredInvoices, filters.pageNumber, filters.pageSize]);

  return {
    paginatedData,
    loading,
    filters,
    setFilters,
    pagination,
    summary,
  };
};

export default useFinance;
