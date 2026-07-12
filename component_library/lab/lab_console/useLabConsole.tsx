import { useState, useMemo } from "react";
import { useAppSelector } from "@/core_components/store/hooks";

// ---------- Types ----------
export interface LabMetric {
  id: string;
  title: string;
  value: string;
  trend: string;
  trendType: "positive" | "negative" | "neutral" | "critical";
  trendLabel: string;
}

export interface RecentSample {
  id: string;
  sampleId: string;
  testName: string;
  patientName: string;
  collectedAt: string;
  status: "Completed" | "Processing" | "Pending" | "Rejected";
  priority: "Normal" | "Urgent" | "Critical";
}

export interface StaffMember {
  id: string;
  name: string;
  role: string;
  avatar: string;
  status: "Online" | "Busy" | "Offline";
}

export interface EquipmentItem {
  id: string;
  name: string;
  type: string;
  status: "Operational" | "Maintenance" | "Offline";
  lastCalibrated: string;
  utilization: number;
}

export interface TATDataPoint {
  label: string;
  avgHours: number;
  targetHours: number;
}

// ---------- Mock Data ----------
const getLabMetrics = (): LabMetric[] => [
  {
    id: "metric_samples_today",
    title: "SAMPLES TODAY",
    value: "247",
    trend: "+18.5%",
    trendType: "positive",
    trendLabel: "vs yesterday",
  },
  {
    id: "metric_tests_completed",
    title: "TESTS COMPLETED",
    value: "189",
    trend: "+8.3%",
    trendType: "positive",
    trendLabel: "vs yesterday",
  },
  {
    id: "metric_pending_results",
    title: "PENDING RESULTS",
    value: "58",
    trend: "Avg TAT: 3.4 hrs",
    trendType: "neutral",
    trendLabel: "",
  },
  {
    id: "metric_critical_values",
    title: "CRITICAL VALUES",
    value: "6",
    trend: "Immediate Action",
    trendType: "critical",
    trendLabel: "",
  },
];

const getRecentSamples = (): RecentSample[] => [
  {
    id: "smp_1",
    sampleId: "SMP-4821",
    testName: "Complete Blood Count (CBC)",
    patientName: "Arjun Nair",
    collectedAt: "09:15 AM",
    status: "Processing",
    priority: "Normal",
  },
  {
    id: "smp_2",
    sampleId: "SMP-4822",
    testName: "Liver Function Test (LFT)",
    patientName: "Priya Sharma",
    collectedAt: "09:30 AM",
    status: "Completed",
    priority: "Urgent",
  },
  {
    id: "smp_3",
    sampleId: "SMP-4823",
    testName: "Troponin-I",
    patientName: "Rahul Menon",
    collectedAt: "10:05 AM",
    status: "Pending",
    priority: "Critical",
  },
  {
    id: "smp_4",
    sampleId: "SMP-4824",
    testName: "HbA1c",
    patientName: "Deepa Thomas",
    collectedAt: "10:20 AM",
    status: "Completed",
    priority: "Normal",
  },
  {
    id: "smp_5",
    sampleId: "SMP-4825",
    testName: "Thyroid Profile (T3/T4/TSH)",
    patientName: "Vikram Patel",
    collectedAt: "10:45 AM",
    status: "Processing",
    priority: "Normal",
  },
  {
    id: "smp_6",
    sampleId: "SMP-4826",
    testName: "Lipid Panel",
    patientName: "Sneha Iyer",
    collectedAt: "11:00 AM",
    status: "Rejected",
    priority: "Normal",
  },
];

const getStaffOnDuty = (): StaffMember[] => [
  {
    id: "staff_1",
    name: "Dr. Ananya R.",
    role: "Pathologist",
    avatar: "A",
    status: "Online",
  },
  {
    id: "staff_2",
    name: "Meera K.",
    role: "Lab Technician",
    avatar: "M",
    status: "Online",
  },
  {
    id: "staff_3",
    name: "Suresh P.",
    role: "Phlebotomist",
    avatar: "S",
    status: "Busy",
  },
  {
    id: "staff_4",
    name: "Kavitha J.",
    role: "Lab Technician",
    avatar: "K",
    status: "Online",
  },
  {
    id: "staff_5",
    name: "Rajan M.",
    role: "Sample Collector",
    avatar: "R",
    status: "Offline",
  },
];

const getEquipmentStatus = (): EquipmentItem[] => [
  {
    id: "eq_1",
    name: "Hematology Analyzer",
    type: "Sysmex XN-1000",
    status: "Operational",
    lastCalibrated: "Jul 11, 2026",
    utilization: 87,
  },
  {
    id: "eq_2",
    name: "Chemistry Analyzer",
    type: "Vitros 5600",
    status: "Operational",
    lastCalibrated: "Jul 10, 2026",
    utilization: 72,
  },
  {
    id: "eq_3",
    name: "Centrifuge C-04",
    type: "Eppendorf 5810R",
    status: "Maintenance",
    lastCalibrated: "Jul 08, 2026",
    utilization: 0,
  },
  {
    id: "eq_4",
    name: "Immunoassay System",
    type: "Cobas e601",
    status: "Operational",
    lastCalibrated: "Jul 09, 2026",
    utilization: 64,
  },
];

const getTATTrends = (): TATDataPoint[] => [
  { label: "Mon", avgHours: 3.2, targetHours: 4 },
  { label: "Tue", avgHours: 3.8, targetHours: 4 },
  { label: "Wed", avgHours: 2.9, targetHours: 4 },
  { label: "Thu", avgHours: 4.5, targetHours: 4 },
  { label: "Fri", avgHours: 3.1, targetHours: 4 },
  { label: "Sat", avgHours: 3.6, targetHours: 4 },
  { label: "Sun", avgHours: 2.5, targetHours: 4 },
];

// ---------- Hook ----------
export function useLabConsole() {
  const { user } = useAppSelector((state) => state.auth);

  const [sampleFilter, setSampleFilter] = useState<
    "All" | "Pending" | "Processing" | "Completed" | "Rejected"
  >("All");

  const metrics = useMemo(() => getLabMetrics(), []);
  const allSamples = useMemo(() => getRecentSamples(), []);
  const staffOnDuty = useMemo(() => getStaffOnDuty(), []);
  const equipment = useMemo(() => getEquipmentStatus(), []);
  const tatTrends = useMemo(() => getTATTrends(), []);

  const filteredSamples = useMemo(() => {
    if (sampleFilter === "All") return allSamples;
    return allSamples.filter((s) => s.status === sampleFilter);
  }, [allSamples, sampleFilter]);

  // Computed stats
  const sampleStatusCounts = useMemo(() => {
    const counts = { Completed: 0, Processing: 0, Pending: 0, Rejected: 0 };
    allSamples.forEach((s) => {
      counts[s.status]++;
    });
    return counts;
  }, [allSamples]);

  const equipmentOperational = useMemo(
    () => equipment.filter((e) => e.status === "Operational").length,
    [equipment],
  );

  return {
    user,
    metrics,
    filteredSamples,
    sampleFilter,
    setSampleFilter,
    sampleStatusCounts,
    staffOnDuty,
    equipment,
    equipmentOperational,
    tatTrends,
  };
}

export default useLabConsole;
