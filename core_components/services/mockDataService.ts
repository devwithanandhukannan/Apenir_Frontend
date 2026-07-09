export interface MetricCardData {
  title: string;
  value: string;
  trend: string;
  trendType: 'positive' | 'negative' | 'neutral' | 'critical';
  trendLabel: string;
}

export interface ChartBarData {
  label: string;
  pcr: number; // height in percentage
  serology: number; // height in percentage
}

export interface CriticalFeedItem {
  id: string;
  type: 'critical' | 'equipment' | 'qc';
  typeLabel: string;
  time: string;
  title: string;
  description: string;
}

export const getDashboardMetrics = (): MetricCardData[] => [
  {
    title: 'TOTAL SAMPLES',
    value: '14,285',
    trend: '+12.8%',
    trendType: 'positive',
    trendLabel: 'vs yesterday',
  },
  {
    title: 'DAILY REVENUE',
    value: '$248.5k',
    trend: '+5.2%',
    trendType: 'positive',
    trendLabel: 'vs yesterday',
  },
  {
    title: 'PENDING REPORTS',
    value: '1,842',
    trend: 'Avg TAT: 4.2 hrs',
    trendType: 'neutral',
    trendLabel: '',
  },
  {
    title: 'CRITICAL ALERTS',
    value: '24',
    trend: 'Action Required',
    trendType: 'critical',
    trendLabel: '',
  },
];

export const getVolumeTrends = (): ChartBarData[] => [
  { label: 'Mon', pcr: 35, serology: 60 },
  { label: 'Tue', pcr: 55, serology: 25 },
  { label: 'Wed', pcr: 75, serology: 45 },
  { label: 'Thu', pcr: 30, serology: 50 },
  { label: 'Fri', pcr: 65, serology: 35 },
  { label: 'Sat', pcr: 40, serology: 70 },
  { label: 'Sun', pcr: 85, serology: 90 },
];

export const getCriticalFeed = (): CriticalFeedItem[] => [
  {
    id: 'feed_1',
    type: 'critical',
    typeLabel: 'Critical Value',
    time: '2m ago',
    title: 'Patient: ID-89420',
    description: 'Potassium level 7.2 mmol/L (High). Immediate physician notification required.',
  },
  {
    id: 'feed_2',
    type: 'equipment',
    typeLabel: 'Equipment Alert',
    time: '15m ago',
    title: 'Centrifuge C-04 (North Branch)',
    description: 'Vibration anomaly detected. Maintenance scheduled for end of shift.',
  },
  {
    id: 'feed_3',
    type: 'qc',
    typeLabel: 'QC Failure',
    time: '1h ago',
    title: 'Assay: Troponin-I',
    description: 'Daily QC out of range. Recalibration required before continuing run.',
  },
];
