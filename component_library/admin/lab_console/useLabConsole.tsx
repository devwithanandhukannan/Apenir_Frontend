import React, { useState, useEffect, useCallback, useMemo } from "react";
import axios from "axios";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import Avatar from "@mui/material/Avatar";
import Chip from "@mui/material/Chip";
import ScienceIcon from "@mui/icons-material/Science";
import {
  ColumnConfig,
  FilterMenuConfigItem,
  GridFilters,
  PaginationProps,
} from "@/shared_features/responsive_grid/type";
import {
  useLabService,
  LabItem,
} from "@/core_components/apis/admin/labService";
import { useRouter } from "next/router";
import { useApi } from "@/core_components/hooks/useApi/useApi";
import { useAbortController } from "@/core_components/hooks/useAbortController/useAbortController";

const LAB_CONSOLE_KEYS = ["FETCH_LABS_REQUEST", "CHECK_EMAIL_REQUEST"] as const;

export const useLabConsole = () => {
  const router = useRouter();
  const { getLabs, inviteLab } = useLabService();
  const { controllers } = useAbortController(LAB_CONSOLE_KEYS);

  // Lab invitation state controls
  const [isInviteDialogOpen, setIsInviteDialogOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteLabName, setInviteLabName] = useState("");
  const [isInviting, setIsInviting] = useState(false);

  const { get } = useApi();
  const [emailError, setEmailError] = useState("");
  const [checkingEmail, setCheckingEmail] = useState(false);

  useEffect(() => {
    if (!inviteEmail || !inviteEmail.includes("@")) {
      setEmailError("");
      return;
    }

    const controller = controllers.CHECK_EMAIL_REQUEST;
    controller.reset();
    const signal = controller.signal;

    const delayDebounceFn = setTimeout(async () => {
      setCheckingEmail(true);
      const res = await get<any>({
        endpoint: `/api/auth/check-email?email=${encodeURIComponent(inviteEmail.trim())}`,
        requireAuth: true,
        signal: signal,
      });

      if (
        signal.aborted ||
        (res.error &&
          (res.error.name === "CanceledError" ||
            res.error.message === "canceled" ||
            axios.isCancel(res.error)))
      ) {
        return;
      }

      setCheckingEmail(false);

      if (res.success && res.data?.success && res.data?.data) {
        if (res.data.data.exists) {
          setEmailError("This email address is already registered.");
        } else {
          setEmailError("");
        }
      }
    }, 500);

    return () => {
      clearTimeout(delayDebounceFn);
      controller.abort();
    };
  }, [inviteEmail, get, controllers]);

  // Maintain grid UI filter state
  const [filters, setFilters] = useState<GridFilters>({
    search: "",
    sortBy: "name",
    sortDirection: "ASC",
    pageNumber: 1,
    pageSize: 5,
    district: "",
    status: [],
  });

  const [loading, setLoading] = useState(true);
  const [labs, setLabs] = useState<LabItem[]>([]);

  // Fetch labs from live API
  const fetchLabs = useCallback(async () => {
    setLoading(true);
    controllers.FETCH_LABS_REQUEST.reset();
    const signal = controllers.FETCH_LABS_REQUEST.signal;
    try {
      const response = await getLabs({ signal });
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
        setLabs(response.data.data);
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
      setLoading(false);
    }
  }, [getLabs, controllers]);

  useEffect(() => {
    fetchLabs();
  }, [fetchLabs]);

  // Dynamic status mapping based on isActive boolean and status fields
  const getLabStatus = useCallback(
    (lab: LabItem): "Active" | "Inactive" | "Suspended" => {
      if (lab.status === "invited") return "Inactive";
      if (lab.status === "Suspended") return "Suspended";
      return lab.isActive ? "Active" : "Inactive";
    },
    [],
  );

  // Perform local filtering, search, and sorting on the API results
  const filteredData = useMemo(() => {
    return labs
      .filter((lab) => {
        // 1. Search filter
        if (filters.search) {
          const query = filters.search.toLowerCase();
          const matchesSearch =
            (lab.name && lab.name.toLowerCase().includes(query)) ||
            (lab.labId && lab.labId.toLowerCase().includes(query)) ||
            (lab.id && lab.id.toLowerCase().includes(query)) ||
            (lab.city && lab.city.toLowerCase().includes(query));
          if (!matchesSearch) return false;
        }

        // 2. District filter
        if (filters.district && lab.district !== filters.district) {
          return false;
        }

        // 3. Status filter
        if (filters.status && filters.status.length > 0) {
          const statusVal = getLabStatus(lab);
          if (!filters.status.includes(statusVal)) {
            return false;
          }
        }

        return true;
      })
      .sort((a, b) => {
        const field = (filters.sortBy || "name") as keyof LabItem;
        const dir = filters.sortDirection === "DESC" ? -1 : 1;

        let valA: any = a[field];
        let valB: any = b[field];

        // Custom lookup for mapped status if sorted by status
        if (filters.sortBy === "status") {
          valA = getLabStatus(a);
          valB = getLabStatus(b);
        }

        if (typeof valA === "string" && typeof valB === "string") {
          return valA.localeCompare(valB) * dir;
        }
        if (typeof valA === "number" && typeof valB === "number") {
          return (valA - valB) * dir;
        }
        return 0;
      });
  }, [labs, filters, getLabStatus]);

  // Extract unique districts from loaded labs list for dynamic dropdown options
  const uniqueDistricts = useMemo(() => {
    const districts = new Set<string>();
    labs.forEach((lab) => {
      if (lab.district) districts.add(lab.district);
    });
    return Array.from(districts).map((d) => ({ value: d, label: d }));
  }, [labs]);

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
    (row: LabItem) => {
      router.push(`/admin/lab-details?id=${row.id}`);
    },
    [router],
  );

  // Column layouts
  const columns: ColumnConfig<LabItem>[] = useMemo(
    () => [
      {
        accessor: "labId",
        header: "Lab ID",
        sortable: true,
        width: 120,
        Cell: ({ row }) => {
          const idLabel = row.labId || row.id.substring(0, 8).toUpperCase();
          return (
            <Typography
              variant="body2"
              sx={{ fontWeight: 800, color: "text.primary" }}
            >
              {idLabel}
            </Typography>
          );
        },
      },
      {
        accessor: "name",
        header: "Branch Name",
        sortable: true,
        width: 220,
        Cell: ({ value }) => (
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
            <Avatar sx={{ bgcolor: "secondary.main", width: 28, height: 28 }}>
              <ScienceIcon sx={{ fontSize: "16px", color: "#fff" }} />
            </Avatar>
            <Typography
              variant="body2"
              sx={{ fontWeight: 800, color: "text.primary" }}
            >
              {value}
            </Typography>
          </Box>
        ),
      },
      {
        accessor: "labUser",
        header: "Registered Email",
        width: 200,
        Cell: ({ row }) => (
          <Typography
            variant="body2"
            sx={{ fontWeight: 600, color: "text.primary" }}
          >
            {row.labUser?.email || "Pending Invite"}
          </Typography>
        ),
      },
      {
        accessor: "city",
        header: "Location",
        width: 180,
        Cell: ({ row }) => (
          <Box sx={{ display: "flex", flexDirection: "column" }}>
            <Typography
              variant="body2"
              sx={{ fontWeight: 800, color: "text.primary", lineHeight: 1.25 }}
            >
              {row.city || "Pending"}
            </Typography>
            <Typography
              variant="caption"
              sx={{ color: "text.secondary", fontWeight: 500, mt: 0.2 }}
            >
              {row.district
                ? `${row.district} - ${row.pincode || ""}`
                : "Pending"}
            </Typography>
          </Box>
        ),
      },
      {
        accessor: "latitude",
        header: "Coordinates (Lat/Lng)",
        width: 185,
        Cell: ({ row }) => (
          <Typography
            variant="body2"
            sx={{ fontWeight: 600, color: "text.secondary", fontSize: "12px" }}
          >
            {row.latitude && row.longitude
              ? `${Number(row.latitude).toFixed(4)}, ${Number(row.longitude).toFixed(4)}`
              : "Not Configured"}
          </Typography>
        ),
      },
      {
        accessor: "serviceRangeKm",
        header: "Service Range",
        sortable: true,
        width: 130,
        Cell: ({ row }) => (
          <Typography
            variant="body2"
            sx={{ fontWeight: 700, color: "text.primary" }}
          >
            {row.serviceRangeKm ? `${row.serviceRangeKm} km` : "10 km"}
          </Typography>
        ),
      },
      {
        accessor: "phone",
        header: "Phone Contact",
        sortable: true,
        width: 150,
        Cell: ({ value }) => (
          <Typography
            variant="body2"
            sx={{ fontWeight: 800, color: "text.primary" }}
          >
            {value || "Pending"}
          </Typography>
        ),
      },
      {
        accessor: "status",
        header: "Status",
        sortable: true,
        width: 130,
        Cell: ({ row }) => {
          const statusVal = getLabStatus(row);
          const isActive = statusVal === "Active";
          const isSuspended = statusVal === "Suspended";
          const color = isActive
            ? "#10b981"
            : isSuspended
              ? "#ef4444"
              : "#64748b";
          const bg = isActive
            ? "rgba(16, 185, 129, 0.04)"
            : isSuspended
              ? "rgba(239, 68, 68, 0.04)"
              : "rgba(100, 116, 139, 0.04)";
          const border = isActive
            ? "rgba(16, 185, 129, 0.25)"
            : isSuspended
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
    [getLabStatus],
  );

  // Dynamic filter dropdown configurations
  const filterMenuConfig: FilterMenuConfigItem[] = useMemo(
    () => [
      {
        key: "district",
        label: "District",
        type: "select",
        width: 150,
        options: uniqueDistricts,
      },
      {
        key: "status",
        label: "Status",
        type: "select",
        multiple: true,
        width: 160,
        options: [
          { value: "Active", label: "Active" },
          { value: "Inactive", label: "Inactive" },
          { value: "Suspended", label: "Suspended" },
        ],
      },
    ],
    [uniqueDistricts],
  );

  const handleInviteSubmit = useCallback(async () => {
    if (!inviteEmail || !inviteLabName) {
      return { success: false, message: "Please fill out all fields." };
    }
    setIsInviting(true);
    const response = await inviteLab({
      email: inviteEmail,
      labName: inviteLabName,
    });
    setIsInviting(false);

    if (response.success) {
      setIsInviteDialogOpen(false);
      setInviteEmail("");
      setInviteLabName("");
    }
    return {
      success: response.success,
      message:
        response.data?.message ||
        (response.success
          ? "Lab invitation sent successfully!"
          : "Failed to send lab invitation."),
    };
  }, [inviteEmail, inviteLabName, inviteLab]);

  return {
    filters,
    setFilters,
    loading,
    paginatedData,
    pagination,
    columns,
    filterMenuConfig,
    handleRowAction,
    isInviteDialogOpen,
    setIsInviteDialogOpen,
    inviteEmail,
    setInviteEmail,
    inviteLabName,
    setInviteLabName,
    isInviting,
    handleInviteSubmit,
    emailError,
    checkingEmail,
  };
};

export default useLabConsole;
