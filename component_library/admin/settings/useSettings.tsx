import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/router";
import axios from "axios";
import { useAppSelector } from "@/core_components/store/hooks";
import { useApi } from "@/core_components/hooks/useApi/useApi";
import { useAbortController } from "@/core_components/hooks/useAbortController/useAbortController";
import toast from "react-hot-toast";

const SETTINGS_KEYS = ["FETCH_SETTINGS_REQUEST"] as const;

export const useSettings = () => {
  const { user, isAuthenticated, isInitialized } = useAppSelector(
    (state) => state.auth,
  );
  const router = useRouter();
  const { get, put, post } = useApi();
  const { controllers } = useAbortController(SETTINGS_KEYS);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [currentTab, setCurrentTab] = useState(0);

  // Form Fields State
  const [waPhoneNumberId, setWaPhoneNumberId] = useState("");
  const [waApiVersion, setWaApiVersion] = useState("v25.0");
  const [waAccessToken, setWaAccessToken] = useState("");

  const [rzpKeyId, setRzpKeyId] = useState("");
  const [rzpKeySecret, setRzpKeySecret] = useState("");
  const [rzpWebhookSecret, setRzpWebhookSecret] = useState("");

  const [smtpHost, setSmtpHost] = useState("");
  const [smtpPort, setSmtpPort] = useState(587);
  const [smtpUsername, setSmtpUsername] = useState("");
  const [smtpPassword, setSmtpPassword] = useState("");
  const [smtpEnableSsl, setSmtpEnableSsl] = useState(true);
  const [smtpFromEmail, setSmtpFromEmail] = useState("");

  // Testing States & Dialogs
  const [testing, setTesting] = useState(false);
  const [isWaTestOpen, setIsWaTestOpen] = useState(false);
  const [waTestPhone, setWaTestPhone] = useState("");

  const [isEmailTestOpen, setIsEmailTestOpen] = useState(false);
  const [emailTestAddress, setEmailTestAddress] = useState("");

  const [isPurgeConfirmOpen, setIsPurgeConfirmOpen] = useState(false);
  const [purgeConfirmText, setPurgeConfirmText] = useState("");
  const [purging, setPurging] = useState(false);

  // Auth Guard
  useEffect(() => {
    if (isInitialized && (!isAuthenticated || user?.role !== "admin")) {
      router.replace("/admin/login");
    }
  }, [isAuthenticated, user, isInitialized, router]);

  // Fetch Current Settings
  const fetchSettings = useCallback(async () => {
    setLoading(true);
    controllers.FETCH_SETTINGS_REQUEST.reset();
    const signal = controllers.FETCH_SETTINGS_REQUEST.signal;

    try {
      const response = await get<any>({
        endpoint: "/api/admin/settings",
        requireAuth: true,
        signal,
      });

      if (
        signal.aborted ||
        (response.error &&
          (response.error.name === "CanceledError" ||
            response.error.message === "canceled" ||
            axios.isCancel(response.error)))
      ) {
        return;
      }

      if (response.success && response.data?.success && response.data?.data) {
        const s = response.data.data;
        setWaPhoneNumberId(s.whatsAppPhoneNumberId || "");
        setWaApiVersion(s.whatsAppApiVersion || "v25.0");
        setWaAccessToken(s.whatsAppAccessToken || "");

        setRzpKeyId(s.razorpayKeyId || "");
        setRzpKeySecret(s.razorpayKeySecret || "");
        setRzpWebhookSecret(s.razorpayWebhookSecret || "");

        setSmtpHost(s.smtpHost || "");
        setSmtpPort(s.smtpPort || 587);
        setSmtpUsername(s.smtpUsername || "");
        setSmtpPassword(s.smtpPassword || "");
        setSmtpEnableSsl(s.smtpEnableSsl !== false);
        setSmtpFromEmail(s.smtpFromEmail || "");
      } else {
        toast.error("Failed to load organization configurations.");
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
  }, [get, controllers]);

  useEffect(() => {
    if (isAuthenticated && user?.role === "admin") {
      fetchSettings();
    }
  }, [isAuthenticated, user, fetchSettings]);

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setCurrentTab(newValue);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    const response = await put<any, any>({
      endpoint: "/api/admin/settings",
      body: {
        whatsAppAccessToken: waAccessToken,
        whatsAppPhoneNumberId: waPhoneNumberId,
        whatsAppApiVersion: waApiVersion,
        razorpayKeyId: rzpKeyId,
        razorpayKeySecret: rzpKeySecret,
        razorpayWebhookSecret: rzpWebhookSecret,
        smtpHost,
        smtpPort: Number(smtpPort) || 587,
        smtpUsername,
        smtpPassword,
        smtpEnableSsl,
        smtpFromEmail,
      },
      requireAuth: true,
    });

    setSaving(false);
    if (response.success && response.data?.success) {
      toast.success("All configurations saved successfully.");
      fetchSettings(); // reload to get latest masks
    } else {
      toast.error(response.data?.message || "Failed to update configurations.");
    }
  };

  // Run Connection Tests
  const handleTestWhatsApp = async () => {
    if (!waTestPhone) {
      toast.error("Please enter a valid phone number.");
      return;
    }
    setTesting(true);
    const response = await post<any, any>({
      endpoint: "/api/admin/settings/test-whatsapp",
      body: { phoneNumber: waTestPhone.trim() },
      requireAuth: true,
    });
    setTesting(false);
    if (response.success && response.data?.success) {
      toast.success(
        response.data.data || "WhatsApp test message sent successfully!",
      );
      setIsWaTestOpen(false);
      setWaTestPhone("");
    } else {
      toast.error(response.data?.message || "WhatsApp test failed.");
    }
  };

  const handleTestEmail = async () => {
    if (!emailTestAddress) {
      toast.error("Please enter a valid email address.");
      return;
    }
    setTesting(true);
    const response = await post<any, any>({
      endpoint: "/api/admin/settings/test-email",
      body: { email: emailTestAddress.trim() },
      requireAuth: true,
    });
    setTesting(false);
    if (response.success && response.data?.success) {
      toast.success(response.data.data || "SMTP test email sent successfully!");
      setIsEmailTestOpen(false);
      setEmailTestAddress("");
    } else {
      toast.error(response.data?.message || "SMTP verification failed.");
    }
  };

  const handleTestRazorpay = async () => {
    setTesting(true);
    const response = await post<any, any>({
      endpoint: "/api/admin/settings/test-razorpay",
      body: {},
      requireAuth: true,
    });
    setTesting(false);
    if (response.success && response.data?.success) {
      toast.success(response.data.data || "Razorpay API test successful!");
    } else {
      toast.error(response.data?.message || "Razorpay validation failed.");
    }
  };

  const handlePurgeDatabase = async () => {
    if (purgeConfirmText !== "RESET") {
      toast.error("Please type RESET to confirm.");
      return;
    }
    setPurging(true);
    const response = await post<any, any>({
      endpoint: "/api/admin/clear-database",
      body: {},
      requireAuth: true,
    });
    setPurging(false);
    if (response.success) {
      toast.success("Database reset successfully!");
      setIsPurgeConfirmOpen(false);
      setPurgeConfirmText("");
      window.location.reload();
    } else {
      toast.error(response.data?.message || "Reset failed.");
    }
  };

  return {
    loading,
    saving,
    currentTab,
    setCurrentTab,
    handleTabChange,
    waPhoneNumberId,
    setWaPhoneNumberId,
    waApiVersion,
    setWaApiVersion,
    waAccessToken,
    setWaAccessToken,
    rzpKeyId,
    setRzpKeyId,
    rzpKeySecret,
    setRzpKeySecret,
    rzpWebhookSecret,
    setRzpWebhookSecret,
    smtpHost,
    setSmtpHost,
    smtpPort,
    setSmtpPort,
    smtpUsername,
    setSmtpUsername,
    smtpPassword,
    setSmtpPassword,
    smtpEnableSsl,
    setSmtpEnableSsl,
    smtpFromEmail,
    setSmtpFromEmail,
    testing,
    isWaTestOpen,
    setIsWaTestOpen,
    waTestPhone,
    setWaTestPhone,
    isEmailTestOpen,
    setIsEmailTestOpen,
    emailTestAddress,
    setEmailTestAddress,
    isPurgeConfirmOpen,
    setIsPurgeConfirmOpen,
    purgeConfirmText,
    setPurgeConfirmText,
    purging,
    handleSave,
    handleTestWhatsApp,
    handleTestEmail,
    handleTestRazorpay,
    handlePurgeDatabase,
  };
};

export default useSettings;
