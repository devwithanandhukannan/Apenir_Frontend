import React, { useState, useEffect, useCallback } from 'react';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import Chip from '@mui/material/Chip';
import Button from '@mui/material/Button';
import Avatar from '@mui/material/Avatar';
import ScienceIcon from '@mui/icons-material/Science';
import ResponsiveGrid from './responsive_grid';
import { ColumnConfig, FilterMenuConfigItem, GridFilters, PaginationProps } from './type';
import { useApi } from '@/core_components/hooks/useApi/useApi'; // Reusing our custom hook

// Sample data interface matching backend structures
interface SampleRecord {
  id: string;
  sampleId: string;
  patientName: string;
  type: string;
  branchName: string;
  stage: string;
  status: 'Overdue' | 'On Track' | 'At Risk' | 'Completed';
  createdAt: string;
}

// API Response model
interface SampleApiResponse {
  success: boolean;
  message: string;
  data: SampleRecord[];
  pageNumber: number;
  pageSize: number;
  pageCount: number;
  totalRows: number;
}

export const ExampleParent: React.FC = () => {
  const { post, loading } = useApi();

  // 1. Maintain Grid filter & pagination state
  const [filters, setFilters] = useState<GridFilters>({
    search: '',
    sortBy: 'createdAt',
    sortDirection: 'DESC',
    pageNumber: 1,
    pageSize: 10,
    branch: '', // dropdown filter
    status: [], // multi-select dropdown filter
  });

  // Data and pagination details returned by API
  const [data, setData] = useState<SampleRecord[]>([]);
  const [pagination, setPagination] = useState<PaginationProps>({
    pageNumber: 1,
    pageSize: 10,
    pageCount: 1,
    totalRows: 0,
  });

  // 2. Fetch data from backend whenever filters or pagination change
  const fetchGridData = useCallback(async () => {
    // Call the API (reusing useApi)
    const response = await post<SampleApiResponse>({
      endpoint: '/api/admin/labs', // Target endpoint mapping
      body: {
        search: filters.search,
        sortBy: filters.sortBy,
        sortDirection: filters.sortDirection,
        pageNumber: filters.pageNumber,
        pageSize: filters.pageSize,
        branch: filters.branch,
        status: filters.status,
      },
      requireAuth: true,
    });

    if (response.success && response.data) {
      setData(response.data.data || []);
      setPagination({
        pageNumber: response.data.pageNumber,
        pageSize: response.data.pageSize,
        pageCount: response.data.pageCount,
        totalRows: response.data.totalRows,
      });
    }
  }, [filters, post]);

  useEffect(() => {
    fetchGridData();
  }, [fetchGridData]);

  // 3. Define Columns Configuration
  const columns: ColumnConfig<SampleRecord>[] = [
    {
      accessor: 'sampleId',
      header: 'Sample ID',
      sortable: true,
      width: 140,
      Cell: ({ value }) => (
        <Typography variant="body2" sx={{ fontWeight: 700, fontFamily: 'monospace' }}>
          {value}
        </Typography>
      ),
    },
    {
      accessor: 'patientName',
      header: 'Patient',
      sortable: true,
      width: 180,
      Cell: ({ value }) => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Avatar sx={{ width: 26, height: 26, fontSize: '12px' }}>
            {value.charAt(0)}
          </Avatar>
          <Typography variant="body2" sx={{ fontWeight: 600 }}>
            {value}
          </Typography>
        </Box>
      ),
    },
    {
      accessor: 'type',
      header: 'Type & Branch',
      width: 180,
      Cell: ({ row }) => (
        <Box>
          <Typography variant="body2" sx={{ fontWeight: 600 }}>
            {row.type}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {row.branchName}
          </Typography>
        </Box>
      ),
    },
    {
      accessor: 'stage',
      header: 'Current Stage',
      width: 150,
      Cell: ({ value }) => (
        <Chip
          label={value}
          size="small"
          sx={{ borderRadius: '4px', fontWeight: 600, fontSize: '11px' }}
        />
      ),
    },
    {
      accessor: 'status',
      header: 'Status',
      sortable: true,
      width: 120,
      Cell: ({ value }) => {
        const color =
          value === 'Completed'
            ? 'success'
            : value === 'Overdue'
            ? 'error'
            : value === 'At Risk'
            ? 'warning'
            : 'default';
        return (
          <Chip
            label={value}
            color={color}
            size="small"
            variant="outlined"
            sx={{ fontWeight: 700, fontSize: '11px' }}
          />
        );
      },
    },
    {
      accessor: 'actions',
      header: 'Actions',
      sortable: false,
      align: 'right',
      width: 100,
      Cell: ({ row }) => (
        <Button
          size="small"
          variant="outlined"
          color="inherit"
          onClick={() => alert(`Reviewing Sample: ${row.sampleId}`)}
          sx={{ textTransform: 'none', borderRadius: '6px', fontWeight: 600 }}
        >
          Review
        </Button>
      ),
    },
  ];

  // 4. Define Filter Options Configuration
  const filterMenuConfig: FilterMenuConfigItem[] = [
    {
      key: 'branch',
      label: 'Branch',
      type: 'select',
      width: 160,
      options: [
        { value: 'Main Lab', label: 'Main Core Lab' },
        { value: 'North Clinic', label: 'North Clinic' },
        { value: 'South Annex', label: 'South Annex' },
      ],
    },
    {
      key: 'status',
      label: 'Status',
      type: 'select',
      multiple: true,
      width: 180,
      options: [
        { value: 'Completed', label: 'Completed' },
        { value: 'On Track', label: 'On Track' },
        { value: 'At Risk', label: 'At Risk' },
        { value: 'Overdue', label: 'Overdue' },
      ],
    },
  ];

  return (
    <Box sx={{ p: 4 }}>
      <Card sx={{ border: '1px solid var(--color-border)', boxShadow: 'none' }}>
        <CardContent sx={{ p: 4 }}>
          {/* Header Description */}
          <Box sx={{ mb: 4, display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Avatar sx={{ bgcolor: 'primary.main', width: 44, height: 44 }}>
              <ScienceIcon />
            </Avatar>
            <div>
              <Typography variant="h5" sx={{ fontWeight: 800 }}>
                Real-time Sample Tracking
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Monitor active diagnostics, processing stages, and turnaround times.
              </Typography>
            </div>
          </Box>

          {/* 5. Render Reusable Responsive Grid */}
          <ResponsiveGrid
            data={data}
            loading={loading}
            filters={filters}
            setFilters={setFilters}
            filterMenuConfig={filterMenuConfig}
            columns={columns}
            searchPlaceholder="Search Sample ID or Patient Name..."
            pagination={pagination}
            onRowActionClick={(row) => alert(`Action clicked for sample: ${row.sampleId}`)}
            rowActionLabel="Details"
          />
        </CardContent>
      </Card>
    </Box>
  );
};

export default ExampleParent;
