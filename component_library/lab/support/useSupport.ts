import { useState, useMemo, useCallback } from "react";
import toast from "react-hot-toast";

export interface DocGuideItem {
  number: number;
  title: string;
  description: string;
  tip?: string;
  warning?: string;
}

export interface StepFAQ {
  question: string;
  answer: string;
}

export interface DocStep {
  id: string;
  stepNumber: number;
  title: string;
  shortTitle: string;
  route: string;
  category:
    "getting_started" | "operations" | "clinical" | "management" | "financial";
  categoryLabel: string;
  readTime: string;
  summary: string;
  keyFeatures: string[];
  detailedGuide: DocGuideItem[];
  proTip: string;
  warningNotice?: string;
  relatedPageUrl: string;
  relatedPageLabel: string;
  faqs: StepFAQ[];
}

export interface SupportTicketForm {
  subject: string;
  category: string;
  priority: "Low" | "Medium" | "High" | "Urgent";
  description: string;
  contactEmail: string;
  contactPhone: string;
}

export const CATEGORY_OPTIONS = [
  { id: "all", label: "All Topics" },
  { id: "getting_started", label: "Getting Started" },
  { id: "operations", label: "Daily Operations" },
  { id: "clinical", label: "Clinical & Reports" },
  { id: "management", label: "Catalog & Staff" },
  { id: "financial", label: "Finance & Payouts" },
];

export const LAB_DOC_STEPS: DocStep[] = [
  {
    id: "step_onboarding",
    stepNumber: 1,
    title: "1. Portal Access & Onboarding",
    shortTitle: "Onboarding & Access",
    route: "/lab/login",
    category: "getting_started",
    categoryLabel: "Getting Started",
    readTime: "3 min",
    summary:
      "Learn how to access your Apenir Lab Portal, manage team logins, set up two-factor authentication, and verify branch profile credentials.",
    keyFeatures: [
      "Secure Login with Credentials",
      "Role-Based Access (Admin vs Staff)",
      "Invitation Links & Password Resets",
      "Branch Location Verification",
    ],
    detailedGuide: [
      {
        number: 1,
        title: "Accessing the Login Portal",
        description:
          "Navigate to /lab/login in your browser. Enter your registered email address and laboratory access password assigned by the Apenir platform administrator.",
        tip: "Bookmark /lab/login on all lab workstations for fast access during daily shifts.",
      },
      {
        number: 2,
        title: "First-Time Password & Invite Setup",
        description:
          "If you received an invitation link via email (/lab/invite), click the link to initialize your secret password and accept branch operational terms.",
        warning:
          "Invitation links expire within 48 hours for security reasons. Contact Apenir support if your link has expired.",
      },
      {
        number: 3,
        title: "Selecting Active Branch Context",
        description:
          "For multi-location lab organizations, select your active branch location from the header dropdown after logging in to view location-specific appointments.",
      },
    ],
    proTip:
      "Keep your login credentials confidential. Always grant individual staff accounts instead of sharing main lab admin accounts.",
    relatedPageUrl: "/lab/login",
    relatedPageLabel: "Go to Login Portal",
    faqs: [
      {
        question: "How do I reset a forgotten lab password?",
        answer:
          "Click on 'Forgot Password?' on the login screen or request your Lab Super Admin to trigger a password reset link.",
      },
      {
        question: "Can multiple staff members log in simultaneously?",
        answer:
          "Yes! Multiple staff members can log into their respective accounts at the same time without interfering with each other's sessions.",
      },
    ],
  },
  {
    id: "step_dashboard",
    stepNumber: 2,
    title: "2. Lab Dashboard & Console",
    shortTitle: "Dashboard Overview",
    route: "/lab/lab-console",
    category: "operations",
    categoryLabel: "Daily Operations",
    readTime: "4 min",
    summary:
      "Master the command center of your diagnostic facility. Monitor live sample metrics, urgent test turn-around times, and quick action shortcuts.",
    keyFeatures: [
      "Real-time Sample Counters (Samples Today, Completed, Pending)",
      "Critical Value Immediate Alerts",
      "Recent Sample Stream with Status Filters",
      "Turn-around Time (TAT) Analytics",
    ],
    detailedGuide: [
      {
        number: 1,
        title: "Understanding KPI Cards",
        description:
          "The top summary cards display key daily metrics: Samples Today, Tests Completed, Pending Results, and Critical Values requiring immediate doctor dispatch.",
        tip: "Click on any summary card to immediately filter the appointments table below.",
      },
      {
        number: 2,
        title: "Tracking TAT & Urgent Priorities",
        description:
          "Monitor tests marked as 'Urgent' or 'Critical'. The system highlights pending samples approaching target Turn-Around-Time limits in amber/red.",
        warning:
          "Critical values (e.g. panic lab values) must be acknowledged and reported to the patient/physician immediately.",
      },
      {
        number: 3,
        title: "Using Quick Action Cards",
        description:
          "Use the bottom shortcut cards to navigate directly to Staff Allocation, All Appointments, Test Services, and Financial Insights in one click.",
      },
    ],
    proTip:
      "Refresh the dashboard or enable live sync to ensure phlebotomists' field collection updates reflect instantly.",
    relatedPageUrl: "/lab/lab-console",
    relatedPageLabel: "Open Lab Dashboard",
    faqs: [
      {
        question: "How often is dashboard data updated?",
        answer:
          "Dashboard metrics update automatically every time you navigate or perform an action, and can be manually refreshed with the Refresh button.",
      },
    ],
  },
  {
    id: "step_appointments",
    stepNumber: 3,
    title: "3. Appointments & Sample Management",
    shortTitle: "Appointments Queue",
    route: "/lab/appointments",
    category: "operations",
    categoryLabel: "Daily Operations",
    readTime: "6 min",
    summary:
      "Manage the end-to-end lifecycle of diagnostic home sample collection and walk-in appointments from initial booking to sample pick-up.",
    keyFeatures: [
      "Comprehensive Status Pipeline (Pending -> Confirmed -> Assigned -> Collected -> Completed)",
      "Patient Location Coordinates & Home Address Map Link",
      "Phlebotomist Field Assignment & Re-assignment",
      "Sample Barcode Tracking & Collection Verification",
    ],
    detailedGuide: [
      {
        number: 1,
        title: "Filtering Appointments by Status",
        description:
          "Use the top status tabs or search bar to view Pending, Confirmed, Assigned, Collected, Completed, or Cancelled appointments.",
        tip: "Focus on 'Confirmed' bookings first thing in the morning to assign field collectors before scheduled slot windows.",
      },
      {
        number: 2,
        title: "Assigning Phlebotomists / Staff",
        description:
          "Click the 'Assign Staff' button on an appointment row. Select an available phlebotomist from the dropdown based on their geographical location.",
        warning:
          "Unassigning or reassigning staff after collection has started notifies both the patient and phlebotomist via SMS.",
      },
      {
        number: 3,
        title: "Updating Sample Collection Status",
        description:
          "Once the phlebotomist collects the sample, mark status as 'Collected' and input tube barcode numbers if applicable.",
      },
    ],
    proTip:
      "Double-check patient address notes and landmark details before dispatching field staff to minimize delays.",
    relatedPageUrl: "/lab/appointments",
    relatedPageLabel: "Manage Appointments",
    faqs: [
      {
        question:
          "What happens when an appointment is cancelled by a customer?",
        answer:
          "The appointment status updates to 'Cancelled' automatically and any assigned staff member is notified immediately.",
      },
      {
        question: "Can I export appointment records to Excel/CSV?",
        answer:
          "Yes, click the export icon on the top right of the appointments table to download full appointment logs.",
      },
    ],
  },
  {
    id: "step_upload_reports",
    stepNumber: 4,
    title: "4. Lab Report Upload & Result Dispatch",
    shortTitle: "Upload & Dispatch",
    route: "/lab/upload-report",
    category: "clinical",
    categoryLabel: "Clinical & Reports",
    readTime: "5 min",
    summary:
      "Upload verified PDF diagnostic test reports, link them to customer appointments, and trigger automated patient notification dispatches.",
    keyFeatures: [
      "Drag-and-Drop PDF Upload Interface",
      "Search & Link by Appointment Number or Patient Phone",
      "Report Preview & Pathologist Signature Verification",
      "Automated SMS/WhatsApp & Email Result Notifications",
    ],
    detailedGuide: [
      {
        number: 1,
        title: "Searching for Patient Appointment",
        description:
          "Enter the Appointment ID (e.g. APPT-10492) or Patient Mobile Number into the report search bar to locate the active booking record.",
        tip: "Verify patient full name and age matches the physical test report before uploading.",
      },
      {
        number: 2,
        title: "Selecting & Validating PDF Files",
        description:
          "Drag your generated diagnostic PDF into the upload zone. Ensure file size is under 15MB and formatted cleanly.",
        warning:
          "Ensure pathologist signatures and reference ranges are clearly visible on the PDF before uploading.",
      },
      {
        number: 3,
        title: "Finalizing & Dispatching Results",
        description:
          "Click 'Upload & Notify Patient'. The system marks the appointment as 'Completed' and dispatches a secure download link to the patient.",
        tip: "Patients receive instant notification and can view reports in their Apenir mobile app or web portal.",
      },
    ],
    proTip:
      "If a correction is needed, upload a revised PDF with the 'Revised Report' toggle enabled to preserve audit trail history.",
    relatedPageUrl: "/lab/upload-report",
    relatedPageLabel: "Upload Test Reports",
    faqs: [
      {
        question: "Which file formats are supported for lab reports?",
        answer:
          "PDF is the standard supported format. Ensure PDFs are unlocked and readable.",
      },
      {
        question: "Can patients view reports immediately upon upload?",
        answer:
          "Yes, as soon as 'Upload & Notify' is clicked, the report is securely accessible to the patient.",
      },
    ],
  },
  {
    id: "step_staff",
    stepNumber: 5,
    title: "5. Phlebotomist & Staff Management",
    shortTitle: "Staff Allocation",
    route: "/lab/staff",
    category: "management",
    categoryLabel: "Catalog & Staff",
    readTime: "4 min",
    summary:
      "Manage lab technicians, field phlebotomists, operational schedules, access permissions, and real-time activity statuses.",
    keyFeatures: [
      "Add / Edit Staff Member Profiles",
      "Assign Specialized Roles (Phlebotomist, Lab Tech, Front Desk, Admin)",
      "Real-time Active / Duty Status Toggles",
      "Active Workload & Assigned Collection Counters",
    ],
    detailedGuide: [
      {
        number: 1,
        title: "Adding New Staff Members",
        description:
          "Click '+ Add Staff Member'. Provide full name, mobile number, email, vehicle details (for field staff), and assigned shift hours.",
        tip: "Ensure phone numbers are accurate as OTP verification and job dispatches rely on mobile SMS.",
      },
      {
        number: 2,
        title: "Managing Duty Availability",
        description:
          "Toggle staff availability switches ('On Duty' / 'Off Duty') based on daily attendance to prevent assigning tasks to absent staff.",
      },
      {
        number: 3,
        title: "Monitoring Staff Workloads",
        description:
          "Check active assigned sample count per phlebotomist to ensure balanced task distribution across your team.",
      },
    ],
    proTip:
      "Deactivate former staff members immediately upon offboarding to revoke access to patient records and active bookings.",
    relatedPageUrl: "/lab/staff",
    relatedPageLabel: "Manage Staff Members",
    faqs: [
      {
        question:
          "How do phlebotomists view their assigned home collection slots?",
        answer:
          "Phlebotomists log into their Apenir Staff App on mobile to view customer locations and sample pickup instructions.",
      },
    ],
  },
  {
    id: "step_services",
    stepNumber: 6,
    title: "6. Diagnostic Services & Pricing Master",
    shortTitle: "Services & Pricing",
    route: "/lab/services",
    category: "management",
    categoryLabel: "Catalog & Staff",
    readTime: "5 min",
    summary:
      "Configure available lab tests, update branch-specific custom prices vs base rates, and manage active diagnostic test offerings.",
    keyFeatures: [
      "Browse Master Pathology & Diagnostic Catalog",
      "Custom Price Overrides (Base Price vs Lab Selling Price)",
      "Service Enable / Disable Availability Toggles",
      "Category Filters (Biochemistry, Pathology, Radiology, Microbiology, etc.)",
    ],
    detailedGuide: [
      {
        number: 1,
        title: "Searching the Diagnostic Catalog",
        description:
          "Filter tests by department or search by test name (e.g. Lipid Profile, HbA1c, Thyroid Panel, CBC).",
        tip: "Use column filters to quickly find all disabled tests or tests with custom pricing applied.",
      },
      {
        number: 2,
        title: "Setting Custom Branch Pricing",
        description:
          "Click the edit price button beside any test item. Enter your lab's preferred selling price or leave blank to use the master base price.",
        warning:
          "Price updates take effect immediately on new patient bookings. Existing booked appointments maintain their booked price.",
      },
      {
        number: 3,
        title: "Toggling Test Availability",
        description:
          "If an analyzer is down or reagents are temporarily out of stock, toggle the service switch off to hide the test from booking.",
      },
    ],
    proTip:
      "Regularly audit test pricing against local competitor rates to maximize appointment bookings.",
    relatedPageUrl: "/lab/services",
    relatedPageLabel: "Open Services Catalog",
    faqs: [
      {
        question: "What is the difference between Base Price and Custom Price?",
        answer:
          "Base Price is the default recommended rate. Custom Price allows your specific lab branch to offer competitive custom pricing.",
      },
    ],
  },
  {
    id: "step_packages",
    stepNumber: 7,
    title: "7. Custom Lab Packages & Bundles",
    shortTitle: "Health Packages",
    route: "/lab/packages",
    category: "management",
    categoryLabel: "Catalog & Staff",
    readTime: "5 min",
    summary:
      "Create, customize, and manage comprehensive diagnostic health packages, test bundles, promotional discounts, and inclusions.",
    keyFeatures: [
      "Create & Customize Health Packages (Full Body, Senior Citizen, Cardiac)",
      "Bundle Multiple Tests with Combined Discount Pricing",
      "Configure Package Inclusions & Preparation Guidelines (e.g. 12hr Fasting)",
      "Package Popularity Metrics & Revenue Tracking",
    ],
    detailedGuide: [
      {
        number: 1,
        title: "Creating a New Package",
        description:
          "Click '+ Create Package'. Input package title, detailed description, fasting guidelines, and target demographic.",
        tip: "Packages with clear preparation instructions (e.g., '10-12 Hours Fasting Required') reduce sample re-collection rates.",
      },
      {
        number: 2,
        title: "Selecting Included Tests",
        description:
          "Add individual test items to the package bundle. The system automatically calculates total individual value vs bundled package price.",
        warning:
          "Ensure all tests included in a package can be processed within your lab or affiliated partner networks.",
      },
      {
        number: 3,
        title: "Activating & Publishing Packages",
        description:
          "Set package status to 'Active' to publish it to the Apenir patient app and website for booking.",
      },
    ],
    proTip:
      "Seasonal health packages (e.g. Monsoon Health Checkup, Executive Annual Checkup) drive up to 40% higher booking volumes.",
    relatedPageUrl: "/lab/packages",
    relatedPageLabel: "Manage Packages",
    faqs: [
      {
        question: "Can we offer promotional discounts on packages?",
        answer:
          "Yes! Set special package pricing during create/edit to feature discounted rates on patient apps.",
      },
    ],
  },
  {
    id: "step_payments",
    stepNumber: 8,
    title: "8. Payment Batches & Revenue Settlement",
    shortTitle: "Payouts & Batches",
    route: "/lab/payment-batch",
    category: "financial",
    categoryLabel: "Finance & Payouts",
    readTime: "5 min",
    summary:
      "Track automated batch payout settlements, view gross earnings vs platform commissions, export statements, and manage bank account payouts.",
    keyFeatures: [
      "Weekly / Monthly Payout Settlement Cycles",
      "Gross Revenue vs Platform Commission Breakdown",
      "Batch Approval & Payment Voucher Downloads",
      "Transaction Detail Drilldowns & Bank Transfer Proofs",
    ],
    detailedGuide: [
      {
        number: 1,
        title: "Reviewing Settlement Batches",
        description:
          "Navigate to /lab/payment-batch to view historical and current payout settlement batches. Check batch status (Pending, Processing, Settled).",
        tip: "Filter batches by date range to reconcile weekly lab accounting records.",
      },
      {
        number: 2,
        title: "Understanding Revenue Breakdown",
        description:
          "Click on any batch to view itemized appointments, gross collected amount, phlebotomist home collection fees, and net lab payout.",
        warning:
          "If you notice any payout discrepancy, click 'Raise Payout Dispute' before batch approval.",
      },
      {
        number: 3,
        title: "Downloading Payment Statements",
        description:
          "Download GST-compliant tax invoices and settlement statements for your accounting team in Excel or PDF format.",
      },
    ],
    proTip:
      "Ensure your lab bank account details in Settings are updated to prevent settlement transfer delays.",
    relatedPageUrl: "/lab/payment-batch",
    relatedPageLabel: "View Payment Batches",
    faqs: [
      {
        question: "When are payout batches processed?",
        answer:
          "Settlements are processed weekly every Monday or as per your agreed contract terms with Apenir.",
      },
      {
        question: "Where can I download tax invoices for platform commission?",
        answer:
          "Within each settled batch row, click 'Download Invoice' to get your monthly tax invoice.",
      },
    ],
  },
  {
    id: "step_settings",
    stepNumber: 9,
    title: "9. Lab Settings & Help Desk Support",
    shortTitle: "Settings & Support",
    route: "/lab/settings",
    category: "financial",
    categoryLabel: "Finance & Payouts",
    readTime: "3 min",
    summary:
      "Maintain laboratory profile details, operational hours, bank settlement accounts, contact details, and raise support tickets.",
    keyFeatures: [
      "Lab Name, Address & Contact Details Management",
      "Operating Hours & Slot Capacity Configuration",
      "Bank Account Details & Tax Registration (GSTIN)",
      "Direct Priority Support Escalation & Ticketing",
    ],
    detailedGuide: [
      {
        number: 1,
        title: "Updating Lab Profile & Address",
        description:
          "Keep your official lab address, Google Maps location pin, and emergency phone numbers updated for accurate home-collection dispatching.",
        tip: "Accurate GPS coordinates help phlebotomists calculate route distances accurately.",
      },
      {
        number: 2,
        title: "Managing Operating Hours & Capacity",
        description:
          "Configure morning and evening sample pickup slots and daily appointment capacity caps.",
        warning:
          "Updating operating hours affects slot availability shown to patients immediately.",
      },
      {
        number: 3,
        title: "Contacting Apenir Lab Support Desk",
        description:
          "Use the 'Submit Support Ticket' button on this documentation page or contact support@appenir.com for 24/7 technical and operational assistance.",
      },
    ],
    proTip:
      "Keep your primary branch contact phone active during operational hours for urgent dispatch calls.",
    relatedPageUrl: "/lab/settings",
    relatedPageLabel: "Open Lab Settings",
    faqs: [
      {
        question: "What is the response time for priority support tickets?",
        answer:
          "Urgent operational tickets are answered within 15-30 minutes during lab operational hours.",
      },
    ],
  },
];

export function useSupport() {
  const [activeStep, setActiveStep] = useState<number>(0);
  const [completedSteps, setCompletedSteps] = useState<number[]>([0]);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [expandedFaq, setExpandedFaq] = useState<string | false>(false);
  const [isTicketOpen, setIsTicketOpen] = useState<boolean>(false);
  const [submittingTicket, setSubmittingTicket] = useState<boolean>(false);

  const [ticketForm, setTicketForm] = useState<SupportTicketForm>({
    subject: "",
    category: "General Inquiry",
    priority: "Medium",
    description: "",
    contactEmail: "",
    contactPhone: "",
  });

  // Filter steps based on search query and category
  const filteredSteps = useMemo(() => {
    return LAB_DOC_STEPS.filter((step) => {
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
    if (filteredSteps.length === 0) return LAB_DOC_STEPS[0];
    return filteredSteps[activeStep] || filteredSteps[0];
  }, [filteredSteps, activeStep]);

  const progressPercentage = useMemo(() => {
    const total = LAB_DOC_STEPS.length;
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
    (field: keyof SupportTicketForm, value: string) => {
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
        // Simulate API ticket submission delay
        await new Promise((resolve) => setTimeout(resolve, 800));
        toast.success(
          "Support Ticket Submitted Successfully! Our Lab Help Desk will reach out to you shortly.",
          { duration: 5000 },
        );
        setTicketForm({
          subject: "",
          category: "General Inquiry",
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
    allSteps: LAB_DOC_STEPS,
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
