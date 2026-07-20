import { useState, useMemo, useCallback } from "react";
import toast from "react-hot-toast";

export interface AdminDocGuideItem {
  number: number;
  title: string;
  description: string;
  tip?: string;
  warning?: string;
}

export interface AdminStepFAQ {
  question: string;
  answer: string;
}

export interface AdminDocStep {
  id: string;
  stepNumber: number;
  title: string;
  shortTitle: string;
  route: string;
  category: "governance" | "platform" | "catalog" | "finance" | "analytics";
  categoryLabel: string;
  readTime: string;
  summary: string;
  keyFeatures: string[];
  detailedGuide: AdminDocGuideItem[];
  proTip: string;
  warningNotice?: string;
  relatedPageUrl: string;
  relatedPageLabel: string;
  faqs: AdminStepFAQ[];
}

export interface AdminSupportTicketForm {
  subject: string;
  category: string;
  priority: "Low" | "Medium" | "High" | "Urgent";
  description: string;
  contactEmail: string;
  contactPhone: string;
}

export const ADMIN_CATEGORY_OPTIONS = [
  { id: "all", label: "All Admin Topics" },
  { id: "governance", label: "Governance & Access" },
  { id: "platform", label: "Labs & Operations" },
  { id: "catalog", label: "Master Services & Packages" },
  { id: "finance", label: "Finance & Payroll" },
  { id: "analytics", label: "BI & Reports" },
];

export const ADMIN_DOC_STEPS: AdminDocStep[] = [
  {
    id: "step_admin_auth",
    stepNumber: 1,
    title: "1. Admin Portal Authentication & Governance",
    shortTitle: "Admin Access",
    route: "/admin/login",
    category: "governance",
    categoryLabel: "Governance & Access",
    readTime: "3 min",
    summary:
      "Secure access control, multi-factor authentication, administrative role management, and system lockout recovery for platform super admins.",
    keyFeatures: [
      "Super Admin & Operations Manager Authentication",
      "Role-Based Access Control (RBAC)",
      "Audit Logging of Administrative Actions",
      "Session Security & IP Whitelisting Options",
    ],
    detailedGuide: [
      {
        number: 1,
        title: "Logging into Admin Console",
        description:
          "Navigate to /admin/login. Enter your verified Apenir Administrator email and master password.",
        tip: "Enforce Multi-Factor Authentication (MFA) across all administrative accounts to protect platform operations.",
      },
      {
        number: 2,
        title: "Managing Staff Access Levels",
        description:
          "From Settings, assign specific operational permissions (e.g. Finance Admin, Support Specialist, Lab Verifier) to internal staff.",
        warning:
          "Never share super-admin root credentials. Create dedicated sub-admin accounts for team members.",
      },
    ],
    proTip:
      "Review active admin sessions regularly under Platform Settings to revoke unauthorized or stale devices.",
    relatedPageUrl: "/admin/login",
    relatedPageLabel: "Open Admin Login",
    faqs: [
      {
        question: "How do I add a new internal platform administrator?",
        answer:
          "Go to Admin Settings > User Management and click '+ Add Administrator' to send an invitation email.",
      },
    ],
  },
  {
    id: "step_admin_dashboard",
    stepNumber: 2,
    title: "2. Master Platform Executive Dashboard",
    shortTitle: "Master Dashboard",
    route: "/admin",
    category: "governance",
    categoryLabel: "Governance & Access",
    readTime: "4 min",
    summary:
      "Executive overview of platform performance: partner laboratories count, registered customers, active phlebotomists, and gross transaction revenue.",
    keyFeatures: [
      "Real-time Platform KPIs (Labs, Customers, Orders, Revenue)",
      "Platform Health Indicators & Error Alerts",
      "Recent Diagnostic Booking Stream",
      "Quick Navigation Shortcuts to All Admin Consoles",
    ],
    detailedGuide: [
      {
        number: 1,
        title: "Analyzing High-Level Platform KPIs",
        description:
          "Monitor Total Registered Labs, Active Phlebotomists, Gross Patient Volume, and Net Platform Commission on the main dashboard cards.",
        tip: "Click on any KPI card to open the filtered management console for deeper analysis.",
      },
      {
        number: 2,
        title: "Monitoring Order Fulfillment Velocity",
        description:
          "Track live appointment pipeline across all laboratory branches to spot regional fulfillment bottlenecks.",
      },
    ],
    proTip:
      "Use the top date range filter on the dashboard to compare week-over-week growth metrics.",
    relatedPageUrl: "/admin",
    relatedPageLabel: "Open Master Dashboard",
    faqs: [
      {
        question: "How frequently is the executive dashboard refreshed?",
        answer:
          "KPIs update in real-time as lab orders, sample collections, and batch payouts are processed.",
      },
    ],
  },
  {
    id: "step_admin_lab_console",
    stepNumber: 3,
    title: "3. Laboratory Management & Onboarding Console",
    shortTitle: "Lab Console",
    route: "/admin/lab-console",
    category: "platform",
    categoryLabel: "Labs & Operations",
    readTime: "5 min",
    summary:
      "Onboard diagnostic laboratories, verify NABL certifications, configure branch commission rates, and manage lab account statuses.",
    keyFeatures: [
      "Invite & Onboard New Laboratory Branches",
      "NABL / ICMR License Verification",
      "Custom Commission Rate Configuration per Lab",
      "Lab Branch Activation & Deactivation Controls",
    ],
    detailedGuide: [
      {
        number: 1,
        title: "Inviting a New Laboratory Partner",
        description:
          "Click '+ Invite Lab'. Enter official lab name, administrator email, GSTIN, and branch location. An activation email will be sent.",
        tip: "Ensure lab credentials and compliance documents are verified prior to activating booking visibility.",
      },
      {
        number: 2,
        title: "Configuring Platform Commission Rate",
        description:
          "Set default or custom platform commission percentages (e.g. 15%) per laboratory branch under the lab action menu.",
        warning:
          "Changing commission rates applies to new appointments booked post-modification.",
      },
    ],
    proTip:
      "Filter labs by 'Pending Verification' to expedite new partner onboarding SLAs.",
    relatedPageUrl: "/admin/lab-console",
    relatedPageLabel: "Manage Lab Console",
    faqs: [
      {
        question: "What happens when a lab branch is deactivated?",
        answer:
          "Deactivating a lab immediately hides its services/packages from the patient app and prevents new appointment bookings.",
      },
    ],
  },
  {
    id: "step_admin_lab_details",
    stepNumber: 4,
    title: "4. Laboratory Branch Deep Dive & Inspection",
    shortTitle: "Lab Details Audit",
    route: "/admin/lab-details",
    category: "platform",
    categoryLabel: "Labs & Operations",
    readTime: "4 min",
    summary:
      "Audit individual lab branch performance, review staff rosters, inspect sample turn-around-times (TAT), and view historical payout logs.",
    keyFeatures: [
      "Comprehensive Branch Profile & Operating Hours Audit",
      "Staff Roster & Field Phlebotomist Verification",
      "Branch-Specific Services & Package Overrides",
      "Historical Payout Batch Statements",
    ],
    detailedGuide: [
      {
        number: 1,
        title: "Inspecting Branch Operational Metrics",
        description:
          "Click 'View Details' on any lab row in Lab Console. Inspect test volume, average TAT, customer ratings, and cancellation rates.",
        tip: "Labs with high cancellation rates should be reviewed by field operational managers.",
      },
      {
        number: 2,
        title: "Auditing Branch Services & Pricing",
        description:
          "Review custom pricing set by the lab branch to ensure compliance with platform pricing caps.",
      },
    ],
    proTip:
      "Use the direct contact details in Lab Details to reach branch managers for urgent operational escalations.",
    relatedPageUrl: "/admin/lab-details",
    relatedPageLabel: "Open Lab Details Console",
    faqs: [
      {
        question: "Can admins override lab branch operating hours?",
        answer:
          "Yes, super admins can edit lab operating hours and slot capacities directly from the Lab Details management view.",
      },
    ],
  },
  {
    id: "step_admin_staff_console",
    stepNumber: 5,
    title: "5. Phlebotomist & Field Staff Console",
    shortTitle: "Staff Console",
    route: "/admin/staff-console",
    category: "platform",
    categoryLabel: "Labs & Operations",
    readTime: "5 min",
    summary:
      "Manage platform phlebotomists, verify background checks, assign technicians across branches, and track field duty availability.",
    keyFeatures: [
      "Master Phlebotomist & Technician Registry",
      "Background Check & Credential Verification",
      "Branch Allocation & Area Mapping",
      "Field Duty Status & Active Assignment Counter",
    ],
    detailedGuide: [
      {
        number: 1,
        title: "Registering Phlebotomists",
        description:
          "Add new phlebotomist details, mobile numbers, medical credentials, and assigned primary lab branch.",
        tip: "Verify phone numbers carefully as job assignments and customer communication depend on mobile authentication.",
      },
      {
        number: 2,
        title: "Tracking Field Activity",
        description:
          "Monitor online/offline duty status and active collection tasks to ensure optimal workload distribution.",
      },
    ],
    proTip:
      "Reassign phlebotomists during peak demand hours to branches experiencing high collection volumes.",
    relatedPageUrl: "/admin/staff-console",
    relatedPageLabel: "Manage Staff Console",
    faqs: [
      {
        question:
          "How are field phlebotomists notified of home collection bookings?",
        answer:
          "Phlebotomists receive push notifications and SMS dispatches on their Apenir Staff mobile app.",
      },
    ],
  },
  {
    id: "step_admin_customer_console",
    stepNumber: 6,
    title: "6. Customer & Patient Management Console",
    shortTitle: "Customer Console",
    route: "/admin/customer-console",
    category: "platform",
    categoryLabel: "Labs & Operations",
    readTime: "4 min",
    summary:
      "Lookup customer profiles, order histories, family member health profiles, address books, and resolve customer support queries.",
    keyFeatures: [
      "Global Patient Registry & Search (Name, Mobile, Email)",
      "Complete Order & Test Result History Drilldown",
      "Family Member Profile Management",
      "Customer Support Notes & Refund Dispatch",
    ],
    detailedGuide: [
      {
        number: 1,
        title: "Searching Patient Records",
        description:
          "Enter customer mobile number or appointment ID to pull up active booking details, diagnostic reports, and payment logs.",
        tip: "Use the order timeline to check exact sample collection and report dispatch timestamps during customer support calls.",
      },
      {
        number: 2,
        title: "Handling Escalations & Refunds",
        description:
          "Initiate full or partial refunds for cancelled bookings or sample re-collection failures directly from the order action drawer.",
      },
    ],
    proTip:
      "Always append internal support notes when issuing refunds for accounting audit purposes.",
    relatedPageUrl: "/admin/customer-console",
    relatedPageLabel: "Open Customer Console",
    faqs: [
      {
        question: "How long do customer refund processing transfers take?",
        answer:
          "Refunds are processed within 24 hours to the original payment method.",
      },
    ],
  },
  {
    id: "step_admin_services_console",
    stepNumber: 7,
    title: "7. Master Diagnostic Services Catalog",
    shortTitle: "Services Catalog",
    route: "/admin/services-console",
    category: "catalog",
    categoryLabel: "Master Services & Packages",
    readTime: "5 min",
    summary:
      "Manage the global master pathology & radiology test repository, set recommended base rates, sample types, and department categories.",
    keyFeatures: [
      "Global Master Test Directory (Pathology, Biochemistry, Radiology, etc.)",
      "Recommended Base Price Configuration",
      "Sample Container Requirements (EDTA, Serum, Fluoride)",
      "Global Enable / Disable Toggles",
    ],
    detailedGuide: [
      {
        number: 1,
        title: "Adding Master Diagnostic Tests",
        description:
          "Click '+ Add Master Service'. Input test name, code (e.g. LFT-01), department, fasting requirements, and standard base price.",
        tip: "Assign standardized CPT/LOINC codes to maintain interoperability across laboratory networks.",
      },
      {
        number: 2,
        title: "Managing Global Availability",
        description:
          "Disabling a master test removes it from all lab partner catalogs simultaneously.",
      },
    ],
    proTip:
      "Keep test names standardized to avoid confusing patients when comparing partner labs.",
    relatedPageUrl: "/admin/services-console",
    relatedPageLabel: "Manage Services Catalog",
    faqs: [
      {
        question: "Can lab branches override master base prices?",
        answer:
          "Yes, labs can set custom branch selling prices while master base price serves as the platform benchmark.",
      },
    ],
  },
  {
    id: "step_admin_packages_console",
    stepNumber: 8,
    title: "8. Global Diagnostic Packages & Bundles",
    shortTitle: "Packages Catalog",
    route: "/admin/packages-console",
    category: "catalog",
    categoryLabel: "Master Services & Packages",
    readTime: "5 min",
    summary:
      "Curate platform-wide preventive health packages, bundle diagnostic tests, configure promotional discounts, and feature top health checkups.",
    keyFeatures: [
      "Curate Standard Health Packages (Full Body, Cardiac, Diabetes, Senior Citizen)",
      "Test Bundle Selector & Individual vs Package Savings Calculator",
      "Patient Preparation Guidelines & Fasting Notices",
      "Featured Home Banner Publishing Toggles",
    ],
    detailedGuide: [
      {
        number: 1,
        title: "Designing Master Health Packages",
        description:
          "Click '+ Create Master Package'. Select bundled test items, set overall package pricing, and add pre-test fasting instructions.",
        tip: "High-value packages with 10+ included tests drive higher average order value (AOV).",
      },
      {
        number: 2,
        title: "Publishing Featured Promotions",
        description:
          "Toggle 'Feature on App Homepage' to highlight specific health checkup bundles to app users.",
      },
    ],
    proTip:
      "Organize packages by target demographic (e.g., Men's Health, Women's Wellness) for easier customer navigation.",
    relatedPageUrl: "/admin/packages-console",
    relatedPageLabel: "Manage Packages Catalog",
    faqs: [
      {
        question: "Can individual labs opt-out of offering a global package?",
        answer:
          "Yes, lab branches can disable specific packages in their branch settings if they lack necessary test equipment.",
      },
    ],
  },
  {
    id: "step_admin_payroll_console",
    stepNumber: 9,
    title: "9. Finance, Payroll & Settlement Console",
    shortTitle: "Finance & Payroll",
    route: "/admin/payroll-console",
    category: "finance",
    categoryLabel: "Finance & Payouts",
    readTime: "6 min",
    summary:
      "Manage laboratory payout batches, platform commission collections, TDS/GST tax deductions, payout approvals, and bank transfer dispatches.",
    keyFeatures: [
      "Weekly Batch Payout Settlement Approval Workflow",
      "Gross Revenue vs Net Lab Payout Ledger",
      "TDS (Tax Deducted at Source) & GST Commission Reports",
      "Bank Transfer CSV Export & Payout Voucher Downloads",
    ],
    detailedGuide: [
      {
        number: 1,
        title: "Reviewing Weekly Payout Batches",
        description:
          "Navigate to Payroll Console. Filter batches by status ('Pending Approval', 'Processing', 'Settled').",
        tip: "Audit itemized appointment transactions before clicking 'Approve Batch Payout'.",
      },
      {
        number: 2,
        title: "Generating Tax Invoices & Bank Files",
        description:
          "Export bank payout batch files (NEFT/RTGS CSV) to execute transfers through host-to-host banking portals.",
        warning:
          "Ensure lab bank account verification is complete before releasing automated payouts.",
      },
    ],
    proTip:
      "Reconcile platform commission accounts weekly to maintain accurate financial accounting ledgers.",
    relatedPageUrl: "/admin/payroll-console",
    relatedPageLabel: "Open Finance & Payroll",
    faqs: [
      {
        question: "What happens if a lab disputes a batch payout amount?",
        answer:
          "Place the batch on 'Under Dispute' hold status until financial auditors review transaction discrepancies.",
      },
    ],
  },
  {
    id: "step_admin_reports_console",
    stepNumber: 10,
    title: "10. Comprehensive Reports & Audit Logs",
    shortTitle: "Reports Console",
    route: "/reports-console",
    category: "analytics",
    categoryLabel: "BI & Reports",
    readTime: "4 min",
    summary:
      "Generate detailed operational reports, order volume summaries, lab compliance logs, and export datasets for executive auditing.",
    keyFeatures: [
      "Custom Date Range Operational Reports",
      "Lab Sample Turn-Around-Time (TAT) Compliance Reports",
      "Phlebotomist Collection Performance Log",
      "Export Data to Excel, CSV, and Formatted PDF",
    ],
    detailedGuide: [
      {
        number: 1,
        title: "Generating Custom Operational Reports",
        description:
          "Select report type (e.g. Appointment Volume, Test Popularity, Revenue Breakdown), choose date range, and click 'Generate Report'.",
        tip: "Schedule recurring weekly report emails to executive stakeholders.",
      },
      {
        number: 2,
        title: "Auditing TAT SLA Violations",
        description:
          "Analyze delay logs to identify lab branches failing to meet report turnaround SLAs.",
      },
    ],
    proTip:
      "Export raw CSV files for deep data modeling in Business Intelligence tools.",
    relatedPageUrl: "/reports-console",
    relatedPageLabel: "Open Reports Console",
    faqs: [
      {
        question: "Can report generation be scheduled automatically?",
        answer:
          "Yes, set up scheduled automated reports under Report Settings.",
      },
    ],
  },
  {
    id: "step_admin_analytics_console",
    stepNumber: 11,
    title: "11. Business Intelligence & Platform Analytics",
    shortTitle: "Analytics & BI",
    route: "/analytics-console",
    category: "analytics",
    categoryLabel: "BI & Reports",
    readTime: "5 min",
    summary:
      "Interactive BI analytics dashboards: growth trends, customer retention cohorts, demand heatmaps, and predictive volume modeling.",
    keyFeatures: [
      "Revenue & Booking Growth Charts",
      "Geographical Sample Collection Demand Heatmap",
      "Customer Acquisition & Repeat Booking Cohorts",
      "Top Diagnostic Tests & Package Trend Charts",
    ],
    detailedGuide: [
      {
        number: 1,
        title: "Analyzing Regional Demand Heatmaps",
        description:
          "Review geographical heatmaps to identify high-density booking zones for opening new laboratory partnerships.",
        tip: "Focus marketing campaigns on postal codes showing high search volume but lower phlebotomist coverage.",
      },
      {
        number: 2,
        title: "Tracking Customer Repeat Rate",
        description:
          "Monitor monthly cohort retention graphs to evaluate customer loyalty programs.",
      },
    ],
    proTip:
      "Use analytics insights to negotiate volume discounts with major diagnostic reagent suppliers.",
    relatedPageUrl: "/analytics-console",
    relatedPageLabel: "Open Analytics Console",
    faqs: [
      {
        question: "Are analytics charts downloadable for board presentations?",
        answer:
          "Yes, click the export icon on any chart card to download high-resolution PNG or PDF visuals.",
      },
    ],
  },
  {
    id: "step_admin_settings",
    stepNumber: 12,
    title: "12. Platform Settings & Integration Gateway",
    shortTitle: "Platform Settings",
    route: "/admin/settings",
    category: "governance",
    categoryLabel: "Governance & Access",
    readTime: "4 min",
    summary:
      "Configure global system parameters, SMS/WhatsApp gateways, payment gateway credentials, default commission rates, and backup policies.",
    keyFeatures: [
      "Global Platform Parameters & Default Commission Settings",
      "SMS, WhatsApp & Email Notification Gateway Config",
      "Payment Gateway Credentials & Webhooks",
      "System Audit Logs & Automated Database Backups",
    ],
    detailedGuide: [
      {
        number: 1,
        title: "Configuring Communication Gateways",
        description:
          "Input API keys for SMS (DLT templates), WhatsApp Business API, and SendGrid/SES email services.",
        tip: "Test notification webhooks after updating API keys to ensure seamless SMS delivery.",
      },
      {
        number: 2,
        title: "Managing Security & Backup Policies",
        description:
          "Configure automated daily database snapshot backups and retention windows.",
      },
    ],
    proTip:
      "Perform routine security reviews of payment gateway webhook signatures to prevent fraud.",
    relatedPageUrl: "/admin/settings",
    relatedPageLabel: "Open Platform Settings",
    faqs: [
      {
        question: "Who can edit platform integration keys?",
        answer:
          "Only users with Super Admin privileges can view or modify API secret keys.",
      },
    ],
  },
];

export function useAdminSupport() {
  const [activeStep, setActiveStep] = useState<number>(0);
  const [completedSteps, setCompletedSteps] = useState<number[]>([0]);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [expandedFaq, setExpandedFaq] = useState<string | false>(false);
  const [isTicketOpen, setIsTicketOpen] = useState<boolean>(false);
  const [submittingTicket, setSubmittingTicket] = useState<boolean>(false);

  const [ticketForm, setTicketForm] = useState<AdminSupportTicketForm>({
    subject: "",
    category: "Platform Administration",
    priority: "Medium",
    description: "",
    contactEmail: "",
    contactPhone: "",
  });

  const filteredSteps = useMemo(() => {
    return ADMIN_DOC_STEPS.filter((step) => {
      const matchesCategory =
        selectedCategory === "all" || step.category === selectedCategory;
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        step.title.toLowerCase().includes(q) ||
        step.shortTitle.toLowerCase().includes(q) ||
        step.summary.toLowerCase().includes(q) ||
        step.route.toLowerCase().includes(q) ||
        step.keyFeatures.some((kf) => kf.toLowerCase().includes(q)) ||
        step.detailedGuide.some(
          (g) =>
            g.title.toLowerCase().includes(q) ||
            g.description.toLowerCase().includes(q),
        );
      return matchesCategory && matchesSearch;
    });
  }, [searchQuery, selectedCategory]);

  const currentStep = useMemo(() => {
    if (filteredSteps.length === 0) return ADMIN_DOC_STEPS[0];
    return filteredSteps[activeStep] || filteredSteps[0];
  }, [filteredSteps, activeStep]);

  const progressPercentage = useMemo(() => {
    const total = ADMIN_DOC_STEPS.length;
    if (total === 0) return 0;
    return Math.round((completedSteps.length / total) * 100);
  }, [completedSteps]);

  const handleStepClick = useCallback((index: number) => {
    setActiveStep(index);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  const handleNextStep = useCallback(() => {
    if (activeStep < filteredSteps.length - 1) {
      const nextIdx = activeStep + 1;
      setActiveStep(nextIdx);
      setCompletedSteps((prev) =>
        prev.includes(activeStep) ? prev : [...prev, activeStep],
      );
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, [activeStep, filteredSteps.length]);

  const handlePrevStep = useCallback(() => {
    if (activeStep > 0) {
      setActiveStep(activeStep - 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, [activeStep]);

  const toggleStepCompleted = useCallback((stepIndex: number) => {
    setCompletedSteps((prev) =>
      prev.includes(stepIndex)
        ? prev.filter((i) => i !== stepIndex)
        : [...prev, stepIndex],
    );
  }, []);

  const handleFaqAccordionChange = useCallback(
    (panelId: string) =>
      (_event: React.SyntheticEvent, isExpanded: boolean) => {
        setExpandedFaq(isExpanded ? panelId : false);
      },
    [],
  );

  const handleTicketInputChange = useCallback(
    (field: keyof AdminSupportTicketForm, value: string) => {
      setTicketForm((prev) => ({ ...prev, [field]: value }));
    },
    [],
  );

  const handleTicketSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (!ticketForm.subject.trim() || !ticketForm.description.trim()) {
        toast.error("Please fill in both subject and detailed description.");
        return;
      }
      setSubmittingTicket(true);
      try {
        await new Promise((resolve) => setTimeout(resolve, 800));
        toast.success(
          "Admin Technical Ticket Logged Successfully! Engineering Desk will review shortly.",
          { duration: 5000 },
        );
        setTicketForm({
          subject: "",
          category: "Platform Administration",
          priority: "Medium",
          description: "",
          contactEmail: "",
          contactPhone: "",
        });
        setIsTicketOpen(false);
      } catch {
        toast.error("Failed to submit support ticket. Please try again.");
      } finally {
        setSubmittingTicket(false);
      }
    },
    [ticketForm],
  );

  return {
    allSteps: ADMIN_DOC_STEPS,
    filteredSteps,
    activeStep,
    currentStep,
    completedSteps,
    progressPercentage,
    searchQuery,
    setSearchQuery,
    selectedCategory,
    setSelectedCategory,
    expandedFaq,
    handleFaqAccordionChange,
    isTicketOpen,
    setIsTicketOpen,
    submittingTicket,
    ticketForm,
    handleTicketInputChange,
    handleTicketSubmit,
    handleStepClick,
    handleNextStep,
    handlePrevStep,
    toggleStepCompleted,
  };
}
