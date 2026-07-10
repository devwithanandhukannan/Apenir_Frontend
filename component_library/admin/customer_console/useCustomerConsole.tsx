import React, { useState, useEffect, useCallback, useMemo } from "react";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import Avatar from "@mui/material/Avatar";
import Chip from "@mui/material/Chip";
import PersonIcon from "@mui/icons-material/Person";
import {
  ColumnConfig,
  FilterMenuConfigItem,
  GridFilters,
  PaginationProps,
} from "@/shared_features/responsive_grid/type";
import {
  useCustomerService,
  CustomerMember,
} from "@/core_components/apis/admin/customerService";
import {
  useLabService,
  LabItem,
} from "@/core_components/apis/admin/labService";

// Map numeric role values to readable labels
const ROLE_LABELS: Record<number, string> = {
  0: "Admin",
  1: "Staff",
  2: "Customer",
};

export const useCustomerConsole = () => {
  // Maintain grid UI filter state
  const [filters, setFilters] = useState<GridFilters>({
    search: "",
    sortBy: "name",
    sortDirection: "ASC",
    pageNumber: 1,
    pageSize: 5,
    status: [],
  });

  const [loading, setLoading] = useState(true);
  const [customers, setCustomers] = useState<CustomerMember[]>([]);
  const { getCustomers } = useCustomerService();
  const { getLabs } = useLabService();

  // Lab details dialog state
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] =
    useState<CustomerMember | null>(null);
  const [selectedLab, setSelectedLab] = useState<LabItem | null>(null);
  const [labLoading, setLabLoading] = useState(false);

  // Fetch customers from live API
  const fetchCustomers = useCallback(async () => {
    setLoading(true);
    const response = await getCustomers();
    if (response.success && response.data?.data) {
      setCustomers(response.data.data);
    }
    setLoading(false);
  }, [getCustomers]);

  useEffect(() => {
    fetchCustomers();
  }, [fetchCustomers]);

  // Derive display status from isActive, isDeleted, and status fields
  const getCustomerStatus = useCallback(
    (member: CustomerMember): "Active" | "Inactive" | "Deleted" => {
      if (member.isDeleted) return "Deleted";
      if (member.isActive === false) return "Inactive";
      if (member.isActive === true) return "Active";
      // When isActive is null, fall back to status field
      if (member.status) return member.status as any;
      return "Inactive";
    },
    [],
  );

  // Perform local filtering, search, and sorting on the API results
  const filteredData = useMemo(() => {
    return customers
      .filter((member) => {
        // 1. Search filter
        if (filters.search) {
          const query = filters.search.toLowerCase();
          const matchesSearch =
            (member.name && member.name.toLowerCase().includes(query)) ||
            (member.email && member.email.toLowerCase().includes(query)) ||
            (member.phone && member.phone.toLowerCase().includes(query)) ||
            (member.id && member.id.toLowerCase().includes(query));
          if (!matchesSearch) return false;
        }

        // 2. Status filter
        if (filters.status && filters.status.length > 0) {
          const statusVal = getCustomerStatus(member);
          if (!filters.status.includes(statusVal)) {
            return false;
          }
        }

        return true;
      })
      .sort((a, b) => {
        const field = (filters.sortBy || "name") as keyof CustomerMember;
        const dir = filters.sortDirection === "DESC" ? -1 : 1;

        let valA: any = a[field];
        let valB: any = b[field];

        // Custom lookup for mapped status if sorted by status
        if (filters.sortBy === "status") {
          valA = getCustomerStatus(a);
          valB = getCustomerStatus(b);
        }

        // Handle null values — push nulls to bottom
        if (valA == null && valB == null) return 0;
        if (valA == null) return 1;
        if (valB == null) return -1;

        if (typeof valA === "string" && typeof valB === "string") {
          return valA.localeCompare(valB) * dir;
        }
        if (typeof valA === "number" && typeof valB === "number") {
          return (valA - valB) * dir;
        }
        return 0;
      });
  }, [customers, filters, getCustomerStatus]);

  // Pagination parameters
  const pagination: PaginationProps = useMemo(
    () => ({
      pageNumber: filters.pageNumber,
      pageSize: filters.pageSize,
      pageCount: Math.ceil(filteredData.length / filters.pageSize) || 1,
      totalRows: filteredData.length,
    }),
    [filters.pageNumber, filters.pageSize, filteredData.length],
  );

  // Slice paginated data block
  const paginatedData = useMemo(() => {
    const start = (filters.pageNumber - 1) * filters.pageSize;
    return filteredData.slice(start, start + filters.pageSize);
  }, [filteredData, filters.pageNumber, filters.pageSize]);

  const handleRowAction = useCallback(
    async (row: CustomerMember) => {
      setSelectedCustomer(row);
      setSelectedLab(null);
      setIsDetailDialogOpen(true);

      if (row.labId) {
        setLabLoading(true);
        const response = await getLabs();
        if (response.success && response.data?.data) {
          const foundLab = response.data.data.find(
            (l) => l.id === row.labId || l.labUserId === row.labId,
          );
          setSelectedLab(foundLab || null);
        }
        setLabLoading(false);
      }
    },
    [getLabs],
  );

  const handleCloseDialog = useCallback(() => {
    setIsDetailDialogOpen(false);
    setSelectedCustomer(null);
    setSelectedLab(null);
  }, []);

  // Column layouts
  const columns: ColumnConfig<CustomerMember>[] = useMemo(
    () => [
      {
        accessor: "id",
        header: "Customer ID",
        sortable: true,
        width: 140,
        Cell: ({ row }) => {
          const idLabel = row.id.substring(0, 8).toUpperCase();
          return (
            <Typography
              variant="body2"
              sx={{ fontWeight: 800, color: "#0f172a" }}
            >
              {idLabel}
            </Typography>
          );
        },
      },
      {
        accessor: "name",
        header: "Name",
        sortable: true,
        width: 220,
        Cell: ({ row }) => (
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
            <Avatar sx={{ bgcolor: "#0891b2", width: 28, height: 28 }}>
              <PersonIcon sx={{ fontSize: "16px", color: "#fff" }} />
            </Avatar>
            <Typography
              variant="body2"
              sx={{ fontWeight: 800, color: "#0f172a" }}
            >
              {row.name || "—"}
            </Typography>
          </Box>
        ),
      },
      {
        accessor: "email",
        header: "Email",
        sortable: true,
        width: 240,
        Cell: ({ value }) => (
          <Typography
            variant="body2"
            sx={{ fontWeight: 600, color: "#0f172a" }}
          >
            {value || "—"}
          </Typography>
        ),
      },
      {
        accessor: "phone",
        header: "Phone",
        sortable: true,
        width: 150,
        Cell: ({ value }) => (
          <Typography
            variant="body2"
            sx={{ fontWeight: 800, color: "#0f172a" }}
          >
            {value || "—"}
          </Typography>
        ),
      },
      {
        accessor: "status",
        header: "Status",
        sortable: true,
        width: 130,
        Cell: ({ row }) => {
          const statusVal = getCustomerStatus(row);
          const isActive = statusVal === "Active";
          const isDeleted = statusVal === "Deleted";
          const color = isActive
            ? "#10b981"
            : isDeleted
              ? "#ef4444"
              : "#64748b";
          const bg = isActive
            ? "rgba(16, 185, 129, 0.04)"
            : isDeleted
              ? "rgba(239, 68, 68, 0.04)"
              : "rgba(100, 116, 139, 0.04)";
          const border = isActive
            ? "rgba(16, 185, 129, 0.25)"
            : isDeleted
              ? "rgba(239, 68, 68, 0.25)"
              : "rgba(100, 116, 139, 0.25)";
          return (
            <Chip
              label={statusVal}
              size="small"
              variant="outlined"
              sx={{
                fontWeight: 700,
                fontSize: "11px",
                borderRadius: "6px",
                color: color,
                borderColor: border,
                backgroundColor: bg,
                px: 0.5,
              }}
            />
          );
        },
      },
    ],
    [getCustomerStatus],
  );

  // Dynamic filter dropdown configurations
  const filterMenuConfig: FilterMenuConfigItem[] = useMemo(
    () => [
      {
        key: "status",
        label: "Status",
        type: "select",
        multiple: true,
        width: 160,
        options: [
          { value: "Active", label: "Active" },
          { value: "Inactive", label: "Inactive" },
          { value: "Deleted", label: "Deleted" },
        ],
      },
    ],
    [],
  );

  return {
    filters,
    setFilters,
    loading,
    paginatedData,
    pagination,
    columns,
    filterMenuConfig,
    handleRowAction,
    isDetailDialogOpen,
    selectedCustomer,
    selectedLab,
    labLoading,
    handleCloseDialog,
  };
};

export default useCustomerConsole;
