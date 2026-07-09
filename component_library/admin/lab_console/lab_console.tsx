import React, { useState, useEffect, useCallback, useMemo } from 'react';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Avatar from '@mui/material/Avatar';
import Chip from '@mui/material/Chip';
import ScienceIcon from '@mui/icons-material/Science';
import ResponsiveGrid from '@/shared_features/responsive_grid';
import { ColumnConfig, FilterMenuConfigItem, GridFilters, PaginationProps } from '@/shared_features/responsive_grid/type';
import { useLabService, LabItem } from '@/core_components/apis/admin/labService';

export const LabConsole: React.FC = () => {
  const { getLabs } = useLabService();

  // Maintain grid UI filter state
  const [filters, setFilters] = useState<GridFilters>({
    search: '',
    sortBy: 'name',
    sortDirection: 'ASC',
    pageNumber: 1,
    pageSize: 5,
    district: '',
    status: [],
  });

  const [loading, setLoading] = useState(true);
  const [labs, setLabs] = useState<LabItem[]>([]);

  // Fetch labs from live API
  const fetchLabs = useCallback(async () => {
    setLoading(true);
    const response = await getLabs();
    if (response.success && response.data?.data) {
      setLabs(response.data.data);
    }
    setLoading(false);
  }, [getLabs]);

  useEffect(() => {
    fetchLabs();
  }, [fetchLabs]);

  // Dynamic status mapping based on isActive boolean and status fields
  const getLabStatus = (lab: LabItem): 'Active' | 'Inactive' | 'Suspended' => {
    if (lab.status === 'Suspended') return 'Suspended';
    return lab.isActive ? 'Active' : 'Inactive';
  };

  // Perform local filtering, search, and sorting on the API results
  const filteredData = useMemo(() => {
    return labs
      .filter((lab) => {
        // 1. Search filter
        if (filters.search) {
          const query = filters.search.toLowerCase();
          const matchesSearch =
            lab.name.toLowerCase().includes(query) ||
            (lab.labId && lab.labId.toLowerCase().includes(query)) ||
            lab.id.toLowerCase().includes(query) ||
            lab.city.toLowerCase().includes(query);
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
        const field = (filters.sortBy || 'name') as keyof LabItem;
        const dir = filters.sortDirection === 'DESC' ? -1 : 1;

        let valA: any = a[field];
        let valB: any = b[field];

        // Custom lookup for mapped status if sorted by status
        if (filters.sortBy === 'status') {
          valA = getLabStatus(a);
          valB = getLabStatus(b);
        }

        if (typeof valA === 'string' && typeof valB === 'string') {
          return valA.localeCompare(valB) * dir;
        }
        if (typeof valA === 'number' && typeof valB === 'number') {
          return (valA - valB) * dir;
        }
        return 0;
      });
  }, [labs, filters]);

  // Extract unique districts from loaded labs list for dynamic dropdown options
  const uniqueDistricts = useMemo(() => {
    const districts = new Set<string>();
    labs.forEach((lab) => {
      if (lab.district) districts.add(lab.district);
    });
    return Array.from(districts).map((d) => ({ value: d, label: d }));
  }, [labs]);

  // Pagination parameters
  const pagination: PaginationProps = {
    pageNumber: filters.pageNumber,
    pageSize: filters.pageSize,
    pageCount: Math.ceil(filteredData.length / filters.pageSize) || 1,
    totalRows: filteredData.length,
  };

  // Slice paginated data block
  const paginatedData = useMemo(() => {
    const start = (filters.pageNumber - 1) * filters.pageSize;
    return filteredData.slice(start, start + filters.pageSize);
  }, [filteredData, filters.pageNumber, filters.pageSize]);

  // Column layouts
  const columns: ColumnConfig<LabItem>[] = [
    {
      accessor: 'labId',
      header: 'Lab ID',
      sortable: true,
      width: 120,
      Cell: ({ row }) => {
        const idLabel = row.labId || row.id.substring(0, 8).toUpperCase();
        return (
          <Typography variant="body2" sx={{ fontWeight: 800, color: '#0f172a' }}>
            {idLabel}
          </Typography>
        );
      },
    },
    {
      accessor: 'name',
      header: 'Branch Name',
      sortable: true,
      width: 220,
      Cell: ({ value }) => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Avatar sx={{ bgcolor: '#1d4ed8', width: 28, height: 28 }}>
            <ScienceIcon sx={{ fontSize: '16px', color: '#fff' }} />
          </Avatar>
          <Typography variant="body2" sx={{ fontWeight: 800, color: '#0f172a' }}>
            {value}
          </Typography>
        </Box>
      ),
    },
    {
      accessor: 'city',
      header: 'Location',
      width: 180,
      Cell: ({ row }) => (
        <Box sx={{ display: 'flex', flexDirection: 'column' }}>
          <Typography variant="body2" sx={{ fontWeight: 800, color: '#0f172a', lineHeight: 1.25 }}>
            {row.city}
          </Typography>
          <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 500, mt: 0.2 }}>
            {row.district}
          </Typography>
        </Box>
      ),
    },
    {
      accessor: 'phone',
      header: 'Phone Contact',
      sortable: true,
      width: 150,
      Cell: ({ value }) => (
        <Typography variant="body2" sx={{ fontWeight: 800, color: '#0f172a' }}>
          {value || 'N/A'}
        </Typography>
      ),
    },
    {
      accessor: 'status',
      header: 'Status',
      sortable: true,
      width: 130,
      Cell: ({ row }) => {
        const statusVal = getLabStatus(row);
        const isActive = statusVal === 'Active';
        const isSuspended = statusVal === 'Suspended';
        const color = isActive ? '#10b981' : isSuspended ? '#ef4444' : '#64748b';
        const bg = isActive ? 'rgba(16, 185, 129, 0.04)' : isSuspended ? 'rgba(239, 68, 68, 0.04)' : 'rgba(100, 116, 139, 0.04)';
        const border = isActive ? 'rgba(16, 185, 129, 0.25)' : isSuspended ? 'rgba(239, 68, 68, 0.25)' : 'rgba(100, 116, 139, 0.25)';
        return (
          <Chip
            label={statusVal}
            size="small"
            variant="outlined"
            sx={{
              fontWeight: 700,
              fontSize: '11px',
              borderRadius: '6px',
              color: color,
              borderColor: border,
              backgroundColor: bg,
              px: 0.5,
            }}
          />
        );
      },
    },
  ];

  // Dynamic filter dropdown configurations
  const filterMenuConfig: FilterMenuConfigItem[] = [
    {
      key: 'district',
      label: 'District',
      type: 'select',
      width: 150,
      options: uniqueDistricts,
    },
    {
      key: 'status',
      label: 'Status',
      type: 'select',
      multiple: true,
      width: 160,
      options: [
        { value: 'Active', label: 'Active' },
        { value: 'Inactive', label: 'Inactive' },
        { value: 'Suspended', label: 'Suspended' },
      ],
    },
  ];

  const handleRowAction = (row: LabItem) => {
    alert(`Live action for lab: ${row.name}\nLocation: ${row.city}, Pin: ${row.pincode}`);
  };

  return (
    <Box sx={{ p: { xs: 2, md: 4 } }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h5" sx={{ fontWeight: 800, mb: 0.5, letterSpacing: '-0.5px' }}>
          Lab Console
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Monitor branches, locations, active staff members, and diagnostic operations.
        </Typography>
      </Box>

      <ResponsiveGrid
        data={paginatedData}
        loading={loading}
        filters={filters}
        setFilters={setFilters}
        filterMenuConfig={filterMenuConfig}
        columns={columns}
        searchPlaceholder="Search Lab ID, Name, or City..."
        pagination={pagination}
        onRowActionClick={handleRowAction}
        rowActionLabel="Manage"
      />
    </Box>
  );
};

export default LabConsole;
