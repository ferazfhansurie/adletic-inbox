import React, { useState, useEffect } from "react";
import { getAuth } from "firebase/auth";
import { doc, getDoc, getFirestore, updateDoc } from "firebase/firestore";
import axios from "axios";
import { initializeApp } from "firebase/app";
import LoadingIcon from "@/components/Base/LoadingIcon";
import { Link } from "react-router-dom";
import Button from "@/components/Base/Button";
import ThemeSwitcher from "@/components/ThemeSwitcher";
import { useAppDispatch, useAppSelector } from "@/stores/hooks";
import { selectColorScheme, setColorScheme } from "@/stores/colorSchemeSlice";
import { selectDarkMode, setDarkMode } from "@/stores/darkModeSlice";
import { toast } from "react-toastify";
import { Dialog } from "@/components/Base/Headless";
import Lucide from "@/components/Base/Lucide";
import { BACKEND_URL } from "@/config/backend";
import WhatsAppEmbeddedSignup from "@/components/WhatsAppEmbeddedSignup";

function SettingsPage() {
  const dispatch = useAppDispatch();
  const activeColorScheme = useAppSelector(selectColorScheme);
  const activeDarkMode = useAppSelector(selectDarkMode);

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [enabled, setEnabled] = useState(false);
  const [time, setTime] = useState("09:00");
  const [groupId, setGroupId] = useState("");
  const [companyId, setCompanyId] = useState<string | null>(null);
  const [apiUrl, setApiUrl] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [lastRun, setLastRun] = useState<string | null>(null);
  const [showAddUserButton, setShowAddUserButton] = useState(false);
  const [phoneCount, setPhoneCount] = useState(0);
  const [role, setRole] = useState<string>("");
  const [aiDelay, setAiDelay] = useState<number>(0);
  const [aiAutoResponse, setAiAutoResponse] = useState(false);

  // Auto-reply settings state
  const [autoReplyEnabled, setAutoReplyEnabled] = useState(false);
  const [autoReplyHours, setAutoReplyHours] = useState("6");
  const [isSavingAutoReply, setIsSavingAutoReply] = useState(false);

  // Manual report trigger state
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [isTriggeringManualReport, setIsTriggeringManualReport] = useState(false);

  // Weekly report trigger state
  const [isTriggeringWeeklyReport, setIsTriggeringWeeklyReport] = useState(false);

  // New state for companyId change functionality
  const [userEmail, setUserEmail] = useState<string>("");
  const [showCompanyIdChange, setShowCompanyIdChange] = useState(false);
  const [newCompanyId, setNewCompanyId] = useState("");
  const [isChangingCompanyId, setIsChangingCompanyId] = useState(false);

  // Bot disconnect functionality state
  const [botStatuses, setBotStatuses] = useState<Map<string, string>>(
    new Map()
  );
  const [isDisconnecting, setIsDisconnecting] = useState(false);
  const [showDisconnectModal, setShowDisconnectModal] = useState(false);
  const [disconnectBotName, setDisconnectBotName] = useState<string>("");
  const [disconnectPhoneIndex, setDisconnectPhoneIndex] = useState<
    number | undefined
  >(undefined);

  interface Phone {
    phoneIndex: number;
    status: string;
    qrCode: string | null;
    phoneInfo: string;
  }

  interface QRCodeData {
    phoneIndex: number;
    status: string;
    qrCode: string | null;
    phoneInfo: string | null;
  }

  interface BotStatusResponse {
    qrCode: string | null;
    status: string;
    phoneInfo: boolean;
    phones: Phone[];
    companyId: string;
    v2: boolean;
    trialEndDate: string | null;
    apiUrl: string | null;
    phoneCount: number;
    // Cloud API specific fields
    wabaId?: string;
    phoneNumberId?: string;
    accessToken?: string;
  }

  // Phone status and QR code data
  const [qrCodes, setQrCodes] = useState<any[]>([]);
  const [isLoadingStatus, setIsLoadingStatus] = useState(false);
  const [phoneNames, setPhoneNames] = useState<{ [key: number]: string }>({});

  // Track if company is using Cloud API (v2)
  const [isCloudApiConnected, setIsCloudApiConnected] = useState(false);

  useEffect(() => {
    fetchSettings();

  }, []);

  // Fetch phone status and names when both companyId and apiUrl are available
  useEffect(() => {
    if (companyId && apiUrl && userEmail) {
      fetchPhoneStatus();
      fetchPhoneNames();

      // Set up interval to refresh phone status
      const interval = setInterval(fetchPhoneStatus, 10000); // Every 10 seconds
      return () => clearInterval(interval);
    }
  }, [companyId, apiUrl, userEmail]);

  const fetchSettings = async () => {
    try {
      const userEmail = localStorage.getItem("userEmail");
      setUserEmail(userEmail || "");

      if (!userEmail) {
        throw new Error("No user email found in localStorage");
      }
      console.log('fetching settings for user');
      console.log("userEmail:", userEmail);
      // Check if email includes juta.com
      if (userEmail.includes("juta.com") || userEmail.includes("desitecreation.com") || userEmail.includes("omniyal")) {
        setShowCompanyIdChange(true);
      }

      setIsLoading(true);

      // 1. Get user data (companyId and role) from user-data API
      const userResponse = await axios.get(
        `${BACKEND_URL.apiUrl}/user-data/${userEmail}`
      );
      const userData = userResponse.data;

      if (!userData) {
        throw new Error("User data not found");
      }
      console.log("userData in settings:", userData);

      const userCompanyId = userData.company_id;
      setCompanyId(userCompanyId);
      setShowAddUserButton(userData.role === "1" || userData.role === "admin");
      setRole(userData.role);

      // 2. Get comprehensive company data from company-config API
      const companyConfigResponse = await axios.get(
        `${BACKEND_URL.apiUrl}/company-config/${userCompanyId}`
      );
      const configData = companyConfigResponse.data;

      if (!configData || !configData.companyData) {
        throw new Error("Company configuration not found");
      }

      const { companyData } = configData;
      console.log("companyData:", companyData);

      // 3. Get API URL from user-company-data endpoint (for api_url field)
      const userCompanyResponse = await axios.get(
        `${BACKEND_URL.apiUrl}/user-company-data?email=${encodeURIComponent(
          userEmail
        )}`,
        {
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
        }
      );
      const userCompanyData = userCompanyResponse.data;
      console.log("userCompanyData:", userCompanyData);

      // Set API URL - use the one from company data or fall back to default
      const dynamicApiUrl =
        userCompanyData?.companyData?.api_url || companyData.apiUrl;

      setApiUrl(dynamicApiUrl || "https://bisnesgpt.jutateknologi.com");

      // Set phone and AI settings from company config
      setPhoneCount(companyData.phoneCount || 0);
      setAiDelay(companyData.aiDelay || 0);
      setAiAutoResponse(companyData.aiAutoResponse || false);

      // 4. Handle daily report settings from dailyReport JSONB
      if (
        companyData.dailyReport &&
        typeof companyData.dailyReport === "object"
      ) {
        const dailyReportData = companyData.dailyReport;
        setEnabled(dailyReportData.enabled || false);
        setTime(dailyReportData.time || "09:00");
        setGroupId(dailyReportData.groupId || "");
        setLastRun(
          dailyReportData.lastRun
            ? new Date(dailyReportData.lastRun).toLocaleString()
            : null
        );
      } else {
        // If dailyReport is null or not an object, set defaults
        setEnabled(false);
        setTime("09:00");
        setGroupId("");
        setLastRun(null);
      }

      // 5. Fetch phone status and names now that we have both companyId and apiUrl
      const finalApiUrl = dynamicApiUrl || "https://bisnesgpt.jutateknologi.com";
      if (userCompanyId && finalApiUrl) {
        try {
          // Fetch phone status immediately with the correct API URL
          const statusResponse = await axios.get(
            `${finalApiUrl}/api/bot-status/${userCompanyId}`
          );

          if (statusResponse.status === 200) {
            const data: BotStatusResponse = statusResponse.data;
            let qrCodesData: QRCodeData[] = [];

            if (data.phones && Array.isArray(data.phones)) {
              qrCodesData = data.phones.map((phone: Phone) => ({
                phoneIndex: phone.phoneIndex,
                status: phone.status,
                qrCode: phone.qrCode,
                phoneInfo:
                  typeof phone.phoneInfo === "string" ? phone.phoneInfo : null,
              }));
            } else if (
              (data.phoneCount === 1 || data.phoneCount === 0) &&
              data.phoneInfo
            ) {
              qrCodesData = [
                {
                  phoneIndex: 0,
                  status: data.status,
                  qrCode: data.qrCode,
                  phoneInfo:
                    typeof data.phoneInfo === "string" ? data.phoneInfo : null,
                },
              ];
            }
            setQrCodes(qrCodesData);

            // Track if company is using Cloud API (v2) - must have v2=true AND at least one phone connected
            const hasConnectedPhone = qrCodesData.some(
              (phone) => phone.status === 'ready' || phone.status === 'authenticated'
            );
            setIsCloudApiConnected(data.v2 === true && hasConnectedPhone);
          }

          // Fetch phone names from user-page-context API
          try {
            const phoneNamesResponse = await axios.get(
              `${finalApiUrl}/api/user-page-context?email=${encodeURIComponent(
                userEmail
              )}`
            );

            if (
              phoneNamesResponse.status === 200 &&
              phoneNamesResponse.data.phoneNames
            ) {
              console.log(
                "Setting phone names from user-page-context:",
                phoneNamesResponse.data.phoneNames
              );
              setPhoneNames(phoneNamesResponse.data.phoneNames);
            } else {
              // Fallback: create default phone names based on phone count
              const phoneCount = companyData.phoneCount || 0;
              console.log(
                "Creating default phone names for phone count:",
                phoneCount
              );
              const defaultPhoneNames: { [key: number]: string } = {};
              for (let i = 0; i < phoneCount; i++) {
                defaultPhoneNames[i] = `Phone ${i + 1}`;
              }
              setPhoneNames(defaultPhoneNames);
            }
          } catch (phoneNamesError) {
            console.warn(
              "Error fetching phone names from user-page-context:",
              phoneNamesError
            );
            // Fallback: create default phone names based on phone count
            const phoneCount = companyData.phoneCount || 0;
            const defaultPhoneNames: { [key: number]: string } = {};
            for (let i = 0; i < phoneCount; i++) {
              defaultPhoneNames[i] = `Phone ${i + 1}`;
            }
            setPhoneNames(defaultPhoneNames);
          }
        } catch (phoneError) {
          console.warn(
            "Error fetching phone data during initial load:",
            phoneError
          );
          // Don't throw here as this is not critical for the settings page to function
        }
      }

      // 6. Fetch auto-reply settings
      if (userCompanyId && finalApiUrl) {
        try {
          const autoReplyResponse = await axios.get(
            `${finalApiUrl}/api/auto-reply/settings/${userCompanyId}`
          );

          if (
            autoReplyResponse.status === 200 &&
            autoReplyResponse.data.success
          ) {
            const autoReplySettings = autoReplyResponse.data.settings;
            setAutoReplyEnabled(autoReplySettings.enabled || false);
            setAutoReplyHours(autoReplySettings.autoReplyHours || "6");
            console.log("Auto-reply settings loaded:", autoReplySettings);
          } else {
            // Set defaults if no settings found
            setAutoReplyEnabled(false);
            setAutoReplyHours("6");
          }
        } catch (autoReplyError) {
          console.warn("Error fetching auto-reply settings:", autoReplyError);
          // Set defaults on error
          setAutoReplyEnabled(false);
          setAutoReplyHours("6");
        }
      }

      setIsLoading(false);
      setError(null); // Clear any previous errors
    } catch (error) {
      console.error("Error fetching settings:", error);
      setError(
        error instanceof Error ? error.message : "Failed to load settings"
      );
      setIsLoading(false);
    }
  };

  // Helper functions for phone status and names
  const getStatusInfo = (status: string) => {
    switch (status?.toLowerCase()) {
      case "ready":
      case "authenticated":
        return {
          text: "Connected",
          color:
            "bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-200",
          icon: "CheckCircle",
        };
      case "qr":
        return {
          text: "Waiting for QR",
          color:
            "bg-yellow-100 text-yellow-800 dark:bg-yellow-800 dark:text-yellow-200",
          icon: "QrCode",
        };
      case "initializing":
        return {
          text: "Starting up",
          color:
            "bg-blue-100 text-blue-800 dark:bg-blue-800 dark:text-blue-200",
          icon: "RefreshCw",
        };
      default:
        return {
          text: "Not Connected",
          color: "bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-200",
          icon: "XCircle",
        };
    }
  };

  const getPhoneName = (phoneIndex: number) => {
    return phoneNames[phoneIndex] || `Phone ${phoneIndex + 1}`;
  };

  // Fetch phone status and QR codes
  const fetchPhoneStatus = async () => {
    if (!companyId || !apiUrl) return;

    try {
      setIsLoadingStatus(true);
      const response = await axios.get(`${apiUrl}/api/bot-status/${companyId}`);

      if (response.status === 200) {
        const data: BotStatusResponse = response.data;
        let qrCodesData: QRCodeData[] = [];

        // Check if phones array exists before mapping
        if (data.phones && Array.isArray(data.phones)) {
          // Multiple phones: transform array to QRCodeData[]
          qrCodesData = data.phones.map((phone: Phone) => ({
            phoneIndex: phone.phoneIndex,
            status: phone.status,
            qrCode: phone.qrCode,
            phoneInfo:
              typeof phone.phoneInfo === "string" ? phone.phoneInfo : null,
          }));
          setQrCodes(qrCodesData);
        } else if (
          (data.phoneCount === 1 || data.phoneCount === 0) &&
          data.phoneInfo
        ) {
          // Single phone: create QRCodeData from flat structure
          qrCodesData = [
            {
              phoneIndex: 0,
              status: data.status,
              qrCode: data.qrCode,
              phoneInfo:
                typeof data.phoneInfo === "string" ? data.phoneInfo : null,
            },
          ];
          setQrCodes(qrCodesData);
        } else {
          setQrCodes([]);
        }

        // Track if company is using Cloud API (v2) - must have v2=true AND at least one phone connected
        const hasConnectedPhone = qrCodesData.some(
          (phone) => phone.status === 'ready' || phone.status === 'authenticated'
        );
        setIsCloudApiConnected(data.v2 === true && hasConnectedPhone);
      }
    } catch (error) {
      console.error("Error fetching phone status:", error);
    } finally {
      setIsLoadingStatus(false);
    }
  };

  // Fetch phone names
  const fetchPhoneNames = async () => {
    if (!companyId || !apiUrl || !userEmail) return;

    try {
      const response = await axios.get(
        `${apiUrl}/api/user-page-context?email=${encodeURIComponent(userEmail)}`
      );

      if (response.status === 200 && response.data.phoneNames) {
        console.log(
          "Setting phone names from user-page-context:",
          response.data.phoneNames
        );
        setPhoneNames(response.data.phoneNames);
      } else {
        // Fallback: create default phone names based on phone count
        const defaultPhoneNames: { [key: number]: string } = {};
        for (let i = 0; i < phoneCount; i++) {
          defaultPhoneNames[i] = `Phone ${i + 1}`;
        }
        setPhoneNames(defaultPhoneNames);
      }
    } catch (error) {
      console.error("Error fetching phone names:", error);
      // Fallback: create default phone names based on phone count
      const defaultPhoneNames: { [key: number]: string } = {};
      for (let i = 0; i < phoneCount; i++) {
        defaultPhoneNames[i] = `Phone ${i + 1}`;
      }
      setPhoneNames(defaultPhoneNames);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    setError(null);

    try {
      const response = await axios.post(
        `${apiUrl}/api/daily-report/${companyId}`,
        {
          enabled,
          time,
          groupId,
        }
      );

      if (response.data.success) {
        alert("Settings saved successfully!");
      } else {
        throw new Error(response.data.error);
      }
    } catch (error) {
      console.error("Error saving settings:", error);
      setError("Failed to save settings");
    } finally {
      setIsSaving(false);
    }
  };

  const handleTriggerReport = async () => {
    try {
      const response = await axios.post(
        `${apiUrl}/api/daily-report/${companyId}/trigger`
      );
      if (response.data.success) {
        alert(
          `Report triggered successfully! Found ${response.data.count} leads today.`
        );
      } else {
        throw new Error(response.data.error);
      }
    } catch (error) {
      console.error("Error triggering report:", error);
      alert("Failed to trigger report");
    }
  };

  const handleTriggerManualReport = async () => {
    if (!selectedDate) {
      toast.error("Please select a date first");
      return;
    }

    setIsTriggeringManualReport(true);
    try {
      const response = await axios.post(
        `${apiUrl}/api/daily-report/${companyId}/trigger`,
        {
          date: selectedDate,
        }
      );
      if (response.data.success) {
        toast.success(
          `Report sent successfully for ${response.data.date}! Found ${response.data.count} contact(s).`
        );
        setSelectedDate(""); // Reset date after successful send
      } else {
        throw new Error(response.data.error);
      }
    } catch (error) {
      console.error("Error triggering manual report:", error);
      toast.error("Failed to send report. Please try again.");
    } finally {
      setIsTriggeringManualReport(false);
    }
  };

  const handleTriggerWeeklyReport = async () => {
    if (!companyId) {
      toast.error("Company ID not found");
      return;
    }

    setIsTriggeringWeeklyReport(true);
    try {
      const response = await axios.post(
        `${apiUrl}/api/weekly-report/${companyId}/trigger`,
        {}
      );
      if (response.data.success) {
        toast.success("Weekly report sent to WhatsApp group successfully!");
      } else {
        throw new Error(response.data.error || "Failed to send weekly report");
      }
    } catch (error: any) {
      console.error("Error triggering weekly report:", error);
      if (error.response?.status === 404) {
        toast.error("WhatsApp client not found for this company");
      } else if (error.response?.status === 500) {
        toast.error("Failed to send report. Please try again.");
      } else {
        toast.error(error.message || "Failed to send weekly report. Please try again.");
      }
    } finally {
      setIsTriggeringWeeklyReport(false);
    }
  };

  const handleSaveAutoReply = async () => {
    setIsSavingAutoReply(true);
    setError(null);

    try {
      const response = await axios.post(
        `${apiUrl}/api/auto-reply/settings/${companyId}`,
        {
          enabled: autoReplyEnabled,
          autoReplyHours: autoReplyHours,
        }
      );

      if (response.data.success) {
        alert("Auto-reply settings saved successfully!");
      } else {
        throw new Error(response.data.error);
      }
    } catch (error) {
      console.error("Error saving auto-reply settings:", error);
      setError("Failed to save auto-reply settings");
    } finally {
      setIsSavingAutoReply(false);
    }
  };

  const handleChangeCompanyId = async () => {
    if (!newCompanyId.trim()) {
      alert("Please enter a valid Company ID");
      return;
    }

    setIsChangingCompanyId(true);
    setError(null);

    try {
      // Update user's company_id in the database
      const response = await axios.put(
        `${BACKEND_URL.apiUrl}/user-data/${userEmail}`,
        {
          company_id: newCompanyId.trim(),
        }
      );

      if (response.data.success) {
        alert(
          "Company ID changed successfully! Please refresh the page to see the changes."
        );
        setCompanyId(newCompanyId.trim());
        setNewCompanyId("");
        // Optionally refresh the page or refetch settings
        window.location.reload();
      } else {
        throw new Error(response.data.error || "Failed to change Company ID");
      }
    } catch (error) {
      console.error("Error changing Company ID:", error);
      setError("Failed to change Company ID. Please try again.");
    } finally {
      setIsChangingCompanyId(false);
    }
  };

  // Bot disconnect functionality
  const showNotification = (message: string, isError: boolean = false) => {
    if (isError) {
      toast.error(message);
    } else {
      toast.success(message);
    }
  };

  const updateBotStatus = (
    botName: string,
    status: string,
    phoneIndex?: number
  ) => {
    const key = phoneIndex !== undefined ? `${botName}_${phoneIndex}` : botName;
    setBotStatuses((prev) => new Map(prev.set(key, status)));
  };

  const showDisconnectConfirmation = (botName: string, phoneIndex?: number) => {
    setDisconnectBotName(botName);
    setDisconnectPhoneIndex(phoneIndex);
    setShowDisconnectModal(true);
  };

  const confirmDisconnect = async () => {
    if (!disconnectBotName) return;

    try {
      setIsDisconnecting(true);
      setShowDisconnectModal(false);

      // If disconnectPhoneIndex is undefined, disconnect all phones
      if (disconnectPhoneIndex === undefined) {
        console.log(`Disconnecting all phones for bot: ${disconnectBotName}`);

        // Show processing notification
        showNotification(
          `Disconnecting all phones for ${disconnectBotName}...`
        );

        // Disconnect all phones sequentially
        for (let i = 0; i < phoneCount; i++) {
          try {
            console.log(`Disconnecting phone ${i + 1} of ${phoneCount}`);

            const response = await fetch(
              `${apiUrl}/api/bots/${disconnectBotName}/disconnect`,
              {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({ disconnectPhoneIndex: i }),
              }
            );

            if (!response.ok) {
              const errorData = await response.json();
              throw new Error(
                errorData.error || `Failed to disconnect phone ${i + 1}`
              );
            }

            const data = await response.json();

            // Update status for this phone
            updateBotStatus(disconnectBotName, "Disconnected", i);

            // Show progress notification
            showNotification(
              `Phone ${i + 1} of ${phoneCount} disconnected successfully`
            );

            // Add a small delay between disconnections to avoid overwhelming the server
            if (i < phoneCount - 1) {
              await new Promise((resolve) => setTimeout(resolve, 1000));
            }
          } catch (phoneError) {
            console.error(`Error disconnecting phone ${i + 1}:`, phoneError);
            showNotification(
              `Failed to disconnect phone ${i + 1
              }. Continuing with remaining phones.`,
              true
            );
          }
        }

        // Show final success notification
        showNotification(
          `All phones for ${disconnectBotName} have been processed`
        );
      } else {
        // Disconnect specific phone
        console.log(
          `Disconnecting bot: ${disconnectBotName}, Phone Index: ${disconnectPhoneIndex}`
        );

        // Show processing notification
        showNotification(
          `Disconnecting ${disconnectBotName} Phone ${disconnectPhoneIndex + 1
          }...`
        );

        const response = await fetch(
          `${apiUrl}/api/bots/${disconnectBotName}/disconnect`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ disconnectPhoneIndex }),
          }
        );

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "Failed to disconnect bot");
        }

        const data = await response.json();

        // Update status for specified phone
        updateBotStatus(
          disconnectBotName,
          "Disconnected",
          disconnectPhoneIndex
        );

        // Show success notification
        showNotification(
          data.message ||
          `${disconnectBotName} Phone ${disconnectPhoneIndex + 1
          } disconnected successfully`
        );
      }
    } catch (error) {
      console.error("Error disconnecting bot:", error);
      showNotification("Failed to disconnect bot. Please try again.", true);
    } finally {
      setIsDisconnecting(false);
      setDisconnectBotName("");
      setDisconnectPhoneIndex(undefined);
    }
  };

  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center">
        <LoadingIcon icon="three-dots" className="w-20 h-20" />
      </div>
    );
  }

  return (
    <div style={{ fontFamily: "'Inter',sans-serif", minHeight: '100vh', background: '#f5f5f5', overflowY: 'auto', height: '100%' }}>
      <style>{`
        .st-root{font-family:'Inter',sans-serif;min-height:100vh;background:#f5f5f5}
        .st-navbar{position:sticky;top:0;z-index:50;background:#4b4b4b;border-bottom:3px solid #f26522;padding:10px 20px;display:flex;align-items:center;justify-content:space-between}
        .st-nav-left{display:flex;align-items:center;gap:14px}
        .st-icon-sq{width:40px;height:40px;background:#f26522;border:2px solid #fff;display:flex;align-items:center;justify-content:center;flex-shrink:0}
        .st-inner{max-width:900px;margin:0 auto;padding:24px 20px 40px;display:flex;flex-direction:column;gap:16px}
        .st-card{background:#fff;border:2px solid #4b4b4b;box-shadow:4px 4px 0 #f26522}
        .st-card-header{background:#4b4b4b;padding:12px 20px;display:flex;align-items:center;gap:10px;border-bottom:2px solid #f26522}
        .st-card-body{padding:20px}
        .st-card-icon{width:36px;height:36px;background:#f26522;border:2px solid #fff;display:flex;align-items:center;justify-content:center;flex-shrink:0}
        .st-card-icon-sm{width:28px;height:28px;border:2px solid #4b4b4b;display:flex;align-items:center;justify-content:center;flex-shrink:0}
        .st-section-title{font-weight:800;font-size:.82rem;color:#fff;text-transform:uppercase;letter-spacing:.08em;margin:0}
        .st-label{font-size:.7rem;font-weight:700;text-transform:uppercase;letter-spacing:.08em;color:#4b4b4b;display:block;margin-bottom:6px}
        .st-input{font-family:'Inter',sans-serif;width:100%;padding:10px 14px;border:2px solid #e8e8e8;background:#fff;font-size:.85rem;color:#4b4b4b;outline:none;transition:border-color .15s;box-sizing:border-box}
        .st-input:focus{border-color:#f26522}
        .st-input:disabled{background:#f5f5f5;color:#8b8b8b;cursor:not-allowed}
        .st-select{font-family:'Inter',sans-serif;padding:10px 14px;border:2px solid #e8e8e8;background:#fff;font-size:.85rem;color:#4b4b4b;cursor:pointer;outline:none;width:100%}
        .st-select:focus{border-color:#f26522}
        .st-btn{font-family:'Inter',sans-serif;font-weight:700;font-size:.72rem;text-transform:uppercase;letter-spacing:.08em;padding:9px 20px;border:2px solid #4b4b4b;background:#fff;color:#4b4b4b;cursor:pointer;transition:all .15s;display:inline-flex;align-items:center;gap:6px}
        .st-btn:hover:not(:disabled){box-shadow:3px 3px 0 #f26522;transform:translate(-1px,-1px)}
        .st-btn:disabled{opacity:.5;cursor:not-allowed}
        .st-btn-primary{background:#f26522;border-color:#f26522;color:#fff}
        .st-btn-primary:hover:not(:disabled){box-shadow:3px 3px 0 #4b4b4b}
        .st-btn-danger{background:#8b0000;border-color:#8b0000;color:#fff}
        .st-btn-danger:hover:not(:disabled){box-shadow:3px 3px 0 #4b4b4b}
        .st-btn-warning{background:#8b5e00;border-color:#8b5e00;color:#fff}
        .st-btn-warning:hover:not(:disabled){box-shadow:3px 3px 0 #4b4b4b}
        .st-btn-nav{background:#fff;border:2px solid #4b4b4b;color:#4b4b4b;font-family:'Inter',sans-serif;font-weight:700;font-size:.72rem;text-transform:uppercase;letter-spacing:.06em;padding:8px 16px;cursor:pointer;transition:all .15s;display:inline-flex;align-items:center;gap:6px;text-decoration:none}
        .st-btn-nav:hover{background:#f26522;border-color:#f26522;color:#fff}
        .st-info-box{background:#f5f5f5;border:2px solid #e8e8e8;padding:14px;display:flex;gap:10px;align-items:flex-start}
        .st-info-box-warn{background:#fff8ec;border:2px solid #f26522;border-left:4px solid #f26522}
        .st-info-box-error{background:#fff0f0;border:2px solid #8b0000;border-left:4px solid #8b0000}
        .st-status-pill{font-size:.65rem;font-weight:800;text-transform:uppercase;letter-spacing:.08em;padding:3px 8px;border:1.5px solid}
        .st-status-connected{color:#2a7a2a;border-color:#2a7a2a;background:#f0fff0}
        .st-status-qr{color:#8b6000;border-color:#8b6000;background:#fffbf0}
        .st-status-init{color:#00468b;border-color:#00468b;background:#f0f6ff}
        .st-status-off{color:#8b0000;border-color:#8b0000;background:#fff0f0}
        .st-divider{display:flex;align-items:center;gap:12px;margin:12px 0}
        .st-divider-line{flex:1;height:2px;background:#e8e8e8}
        .st-divider-text{font-size:.65rem;font-weight:800;text-transform:uppercase;letter-spacing:.1em;color:#8b8b8b;padding:3px 10px;border:2px solid #e8e8e8;background:#f5f5f5}
        .st-modal-overlay{position:fixed;inset:0;background:rgba(0,0,0,.55);z-index:50}
        .st-modal-wrap{position:fixed;inset:0;z-index:50;display:flex;align-items:center;justify-content:center;padding:16px}
        .st-modal{background:#fff;border:3px solid #4b4b4b;box-shadow:6px 6px 0 #f26522;max-width:480px;width:100%;position:relative}
        .st-modal-header{background:#8b0000;padding:16px 20px;display:flex;align-items:center;gap:10px;border-bottom:2px solid #4b4b4b}
        .st-modal-body{padding:20px}
        .st-modal-footer{padding:14px 20px;border-top:2px solid #e8e8e8;display:flex;gap:10px;justify-content:flex-end}
        .st-theme-btn{padding:10px 24px;border:2px solid #4b4b4b;background:#fff;cursor:pointer;font-family:'Inter',sans-serif;font-weight:700;font-size:.78rem;text-transform:uppercase;letter-spacing:.08em;color:#4b4b4b;transition:all .15s;display:flex;align-items:center;gap:8px}
        .st-theme-btn:hover{box-shadow:3px 3px 0 #f26522;transform:translate(-1px,-1px)}
        .st-theme-btn-active{background:#4b4b4b;color:#fff;box-shadow:3px 3px 0 #f26522}
        .st-theme-btn-active:hover{transform:none}
      `}</style>

      {/* Top Nav */}
      <div className="st-navbar">
        <div className="st-nav-left">
          <Link to="/users-layout-2">
            <button className="st-btn" style={{ padding: '6px 14px', background: 'rgba(255,255,255,.12)', borderColor: 'rgba(255,255,255,.3)', color: '#fff' }}>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back
            </button>
          </Link>
          <div className="st-icon-sq">
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </div>
          <h1 style={{ fontWeight: 800, fontSize: '1rem', color: '#fff', textTransform: 'uppercase', letterSpacing: '.08em', margin: 0 }}>Settings</h1>
        </div>
        <ThemeSwitcher />
      </div>

      {/* Main Content */}
      <div className="st-inner">
        {/* Navigation Buttons */}
        <div className="st-card">
          <div className="st-card-header">
            <div className="st-card-icon">
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </div>
            <h2 className="st-section-title">Quick Navigation</h2>
          </div>
          <div className="st-card-body" style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
            {showAddUserButton && phoneCount >= 2 && (
              <Link to="/loading2">
                <button className="st-btn-nav">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  Add Number
                </button>
              </Link>
            )}
            <Link to="/quick-replies">
              <button className="st-btn-nav">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
                Quick Replies
              </button>
            </Link>
            {companyId === "0380" && (
              <Link to="/feedback-form-builder">
                <button className="st-btn-nav">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Feedback Form Builder
                </button>
              </Link>
            )}
            {companyId === "0123" && (
              <Link to="/storage-pricing">
                <button className="st-btn-nav">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 4V2a1 1 0 011-1h8a1 1 0 011 1v2m-9 0h10m-10 0a2 2 0 00-2 2v12a2 2 0 002 2h8a2 2 0 002-2V6a2 2 0 00-2-2" />
                  </svg>
                  Storage Pricing
                </button>
              </Link>
            )}
          </div>
        </div>

        {/* Theme Settings */}
        <div className="st-card">
          <div className="st-card-header">
            <div className="st-card-icon">
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
              </svg>
            </div>
            <h2 className="st-section-title">Theme Settings</h2>
          </div>
          <div className="st-card-body">
            <label className="st-label">Appearance Mode</label>
            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
              <button
                onClick={() => dispatch(setDarkMode(false))}
                className={`st-theme-btn${!activeDarkMode ? ' st-theme-btn-active' : ''}`}
              >
                <div style={{ width: '16px', height: '16px', background: '#f26522', border: '2px solid currentColor', borderRadius: '50%' }} />
                Light Mode
              </button>
              <button
                onClick={() => dispatch(setDarkMode(true))}
                className={`st-theme-btn${activeDarkMode ? ' st-theme-btn-active' : ''}`}
              >
                <div style={{ width: '16px', height: '16px', background: '#4b4b4b', border: '2px solid currentColor', borderRadius: '50%' }} />
                Dark Mode
              </button>
            </div>
          </div>
        </div>

        {/* WhatsApp Cloud API */}
        {companyId && (
          <div className="st-card">
            <div className="st-card-header">
              <div className="st-card-icon">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 text-white">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
                </svg>
              </div>
              <div>
                <h2 className="st-section-title">WhatsApp Cloud API</h2>
                <p style={{ fontSize: '.68rem', color: 'rgba(255,255,255,.6)', margin: '2px 0 0' }}>Connect using Meta's Official WhatsApp Business API</p>
              </div>
            </div>
            <div className="st-card-body" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div className="st-info-box">
                <Lucide icon="Info" className="w-4 h-4 flex-shrink-0" style={{ color: '#f26522', marginTop: '1px' }} />
                <div>
                  <p style={{ fontWeight: 700, fontSize: '.8rem', color: '#4b4b4b', margin: '0 0 4px' }}>Official WhatsApp Business API</p>
                  <p style={{ fontSize: '.75rem', color: '#8b8b8b', lineHeight: 1.6, margin: 0 }}>
                    Connect your WhatsApp Business account using Meta's official Embedded Signup flow.
                    This provides a more stable connection with official API access, message templates, and advanced business features.
                  </p>
                </div>
              </div>

              <div style={{ border: '2px solid #e8e8e8', padding: '14px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
                {isCloudApiConnected ? (
                  <>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <Lucide icon="CheckCircle" className="w-5 h-5" style={{ color: '#2a7a2a' }} />
                      <div>
                        <p style={{ fontWeight: 700, fontSize: '.82rem', color: '#2a7a2a', margin: 0 }}>Meta Cloud API Connected</p>
                        <p style={{ fontSize: '.72rem', color: '#8b8b8b', margin: 0 }}>Connected via official WhatsApp Business API</p>
                      </div>
                    </div>
                    <span className="st-status-pill st-status-connected">Active</span>
                  </>
                ) : (
                  <>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <Lucide icon="Link" className="w-4 h-4" style={{ color: '#8b8b8b' }} />
                      <div>
                        <p style={{ fontWeight: 700, fontSize: '.82rem', color: '#4b4b4b', margin: 0 }}>Connect WhatsApp Business</p>
                        <p style={{ fontSize: '.72rem', color: '#8b8b8b', margin: 0 }}>Click to start the official signup flow</p>
                      </div>
                    </div>
                    <WhatsAppEmbeddedSignup
                      companyId={companyId}
                      phoneIndex={0}
                      onSuccess={(data) => { toast.success(`Connected: ${data.displayPhoneNumber}`); setIsCloudApiConnected(true); fetchPhoneStatus(); }}
                      onError={(error) => { toast.error(error); }}
                      buttonText="Connect via Meta"
                      disabled={isCloudApiConnected}
                      className="st-btn st-btn-primary"
                    />
                  </>
                )}
              </div>

              <div className="st-info-box st-info-box-warn">
                <Lucide icon="AlertTriangle" className="w-4 h-4 flex-shrink-0" style={{ color: '#f26522', marginTop: '1px' }} />
                <p style={{ fontSize: '.75rem', color: '#4b4b4b', lineHeight: 1.6, margin: 0 }}>
                  <strong>Note:</strong> This will connect your phone using the official WhatsApp Cloud API,
                  which is separate from the QR code-based connection. You can use either method, but not both simultaneously for the same phone number.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Company ID Change */}
        {showCompanyIdChange && (
          <div className="st-card">
            <div className="st-card-header">
              <div className="st-card-icon">
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
              <h2 className="st-section-title">Change Company ID</h2>
            </div>
            <div className="st-card-body" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {error && (
                <div className="st-info-box st-info-box-error">
                  <Lucide icon="AlertCircle" className="w-4 h-4 flex-shrink-0" style={{ color: '#8b0000' }} />
                  <p style={{ fontSize: '.8rem', color: '#8b0000', margin: 0 }}>{error}</p>
                </div>
              )}
              <div>
                <label className="st-label">Current Company ID</label>
                <input type="text" value={companyId || ""} disabled className="st-input" />
              </div>
              <div>
                <label className="st-label">New Company ID</label>
                <input type="text" value={newCompanyId} onChange={(e) => setNewCompanyId(e.target.value)} placeholder="Enter new Company ID" className="st-input" />
              </div>
              <div>
                <button className="st-btn st-btn-warning" onClick={handleChangeCompanyId} disabled={isChangingCompanyId || !newCompanyId.trim()}>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  {isChangingCompanyId ? "Changing..." : "Change Company ID"}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Bot Management */}
        <div className="st-card">
          <div className="st-card-header">
            <div className="st-card-icon">
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728L5.636 5.636m12.728 12.728L18.364 5.636M5.636 18.364l12.728-12.728" />
              </svg>
            </div>
            <h2 className="st-section-title">Bot Management</h2>
          </div>
          <div className="st-card-body" style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            <div style={{ textAlign: "center", padding: "8px 0" }}>
              <h3 style={{ fontWeight: 800, fontSize: "1rem", color: "#4b4b4b", textTransform: "uppercase", letterSpacing: ".04em", marginBottom: "6px" }}>Disconnect Bot</h3>
              <p style={{ fontSize: ".82rem", color: "#8b8b8b", margin: 0 }}>Disconnect your WhatsApp bot connection{phoneCount > 1 ? "s" : ""}</p>
            </div>

            {phoneCount <= 1 ? (
              <div style={{ display: "flex", justifyContent: "center" }}>
                <button className="st-btn st-btn-danger" onClick={() => showDisconnectConfirmation(companyId || "", 0)} disabled={isDisconnecting || !companyId}>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728L5.636 5.636m12.728 12.728L18.364 5.636M5.636 18.364l12.728-12.728" />
                  </svg>
                  {isDisconnecting ? "Disconnecting..." : "Disconnect Bot"}
                </button>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                {/* Disconnect specific phone */}
                <div style={{ border: "2px solid #e8e8e8", padding: "14px", display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: "10px" }}>
                  <div>
                    <p style={{ fontWeight: 700, fontSize: ".8rem", color: "#4b4b4b", margin: "0 0 2px", textTransform: "uppercase", letterSpacing: ".06em" }}>Disconnect specific phone</p>
                    <p style={{ fontSize: ".72rem", color: "#8b8b8b", margin: 0 }}>Select a phone to disconnect individually</p>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
                    <select
                      value={disconnectPhoneIndex ?? 0}
                      onChange={(e) => setDisconnectPhoneIndex(Number(e.target.value))}
                      className="st-select"
                      style={{ minWidth: "220px", width: "auto" }}
                      disabled={isDisconnecting}
                    >
                      {Object.keys(phoneNames).length > 0
                        ? Object.keys(phoneNames).map((index) => {
                          const phoneIndexOption = parseInt(index);
                          const qrCode = qrCodes[phoneIndexOption];
                          const phoneInfo = qrCode?.phoneInfo || `Phone ${phoneIndexOption + 1}`;
                          const statusInfo = qrCode ? getStatusInfo(qrCode.status) : { text: "Not Connected" };
                          return (
                            <option key={phoneIndexOption} value={phoneIndexOption}>
                              {`${getPhoneName(phoneIndexOption)} - (${phoneInfo}) ${qrCode ? "✅" : isLoadingStatus ? "⏳" : "❌"} ${statusInfo.text}`}
                            </option>
                          );
                        })
                        : Array.from({ length: phoneCount }, (_, i) => <option key={i} value={i}>Phone {i + 1}</option>)
                      }
                    </select>
                    <button
                      className="st-btn st-btn-warning"
                      onClick={() => showDisconnectConfirmation(companyId || "", disconnectPhoneIndex ?? 0)}
                      disabled={isDisconnecting || !companyId}
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728L5.636 5.636m12.728 12.728L18.364 5.636M5.636 18.364l12.728-12.728" />
                      </svg>
                      {isDisconnecting ? "Disconnecting..." : "Disconnect Selected"}
                    </button>
                  </div>
                </div>

                <div className="st-divider">
                  <div className="st-divider-line" />
                  <span className="st-divider-text">OR</span>
                  <div className="st-divider-line" />
                </div>

                {/* Disconnect all */}
                <div style={{ border: "2px solid #8b0000", background: "#fff0f0", padding: "14px", display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: "10px" }}>
                  <div>
                    <p style={{ fontWeight: 700, fontSize: ".8rem", color: "#8b0000", margin: "0 0 2px", textTransform: "uppercase", letterSpacing: ".06em" }}>Disconnect all phones ({phoneCount} phones)</p>
                    <p style={{ fontSize: ".72rem", color: "#8b6060", margin: 0 }}>This will disconnect all {phoneCount} phone connections</p>
                  </div>
                  <button
                    className="st-btn st-btn-danger"
                    onClick={() => showDisconnectConfirmation(companyId || "", undefined)}
                    disabled={isDisconnecting || !companyId}
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                    {isDisconnecting ? "Disconnecting All..." : "Disconnect All"}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Daily Report Settings */}
        <div className="st-card">
          <div className="st-card-header">
            <div className="st-card-icon">
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <h2 className="st-section-title">Daily Report Settings</h2>
          </div>
          <div className="st-card-body" style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
            {error && (
              <div className="st-info-box st-info-box-error">
                <p style={{ fontSize: ".8rem", color: "#8b0000", margin: 0 }}>{error}</p>
              </div>
            )}
            <label style={{ display: "flex", alignItems: "center", gap: "10px", cursor: "pointer" }}>
              <input type="checkbox" checked={enabled} onChange={(e) => setEnabled(e.target.checked)} style={{ width: "18px", height: "18px", accentColor: "#f26522", cursor: "pointer" }} />
              <span style={{ fontWeight: 700, fontSize: ".82rem", color: "#4b4b4b", textTransform: "uppercase", letterSpacing: ".06em" }}>Enable Daily Reports</span>
            </label>

            {enabled && (
              <>
                <div>
                  <label className="st-label">Report Time</label>
                  <input type="time" value={time} onChange={(e) => setTime(e.target.value)} className="st-input" style={{ maxWidth: "200px" }} />
                </div>
                <div>
                  <label className="st-label">WhatsApp Group ID</label>
                  <input type="text" value={groupId} onChange={(e) => setGroupId(e.target.value)} placeholder="Enter group ID" className="st-input" />
                </div>
                {lastRun && (
                  <div style={{ background: "#f5f5f5", border: "2px solid #e8e8e8", padding: "10px 14px" }}>
                    <p style={{ fontSize: ".78rem", color: "#8b8b8b", margin: 0, fontWeight: 600 }}>Last report sent: {lastRun}</p>
                  </div>
                )}
              </>
            )}

            <div style={{ display: "flex", flexWrap: "wrap", gap: "10px" }}>
              <button className="st-btn st-btn-primary" onClick={handleSave} disabled={isSaving}>
                {isSaving ? "Saving..." : "Save Settings"}
              </button>
              {enabled && (
                <button className="st-btn" onClick={handleTriggerReport}>
                  Send Report Now
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Manual Report Trigger */}
        <div className="st-card">
          <div className="st-card-header">
            <div className="st-card-icon">
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <h2 className="st-section-title">Manual Report Trigger</h2>
          </div>
          <div className="st-card-body" style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
            <p style={{ fontSize: ".82rem", color: "#8b8b8b", margin: 0, lineHeight: 1.6 }}>
              Send a daily contact report for a specific date. Useful for generating historical reports or resending reports for specific dates.
            </p>
            <div>
              <label className="st-label">Select Date</label>
              <input type="date" value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)} max={new Date().toISOString().split("T")[0]} className="st-input" style={{ maxWidth: "240px" }} />
              <p style={{ fontSize: ".7rem", color: "#8b8b8b", marginTop: "6px" }}>Select a date to generate and send the contact report for that specific day.</p>
            </div>
            <div>
              <button className="st-btn st-btn-primary" onClick={handleTriggerManualReport} disabled={isTriggeringManualReport || !selectedDate || !companyId}>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
                {isTriggeringManualReport ? "Sending Report..." : "Send Report for Selected Date"}
              </button>
            </div>
          </div>
        </div>

        {/* Weekly Report Trigger */}
        <div className="st-card">
          <div className="st-card-header">
            <div className="st-card-icon">
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
              </svg>
            </div>
            <h2 className="st-section-title">Weekly Report Trigger</h2>
          </div>
          <div className="st-card-body" style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
            <p style={{ fontSize: ".82rem", color: "#8b8b8b", margin: 0, lineHeight: 1.6 }}>
              Send a 7-day performance summary report to your WhatsApp group. Includes total leads, daily average, engagement rate, qualified and hot leads, and AI-generated insights.
            </p>
            <div>
              <button className="st-btn st-btn-primary" onClick={handleTriggerWeeklyReport} disabled={isTriggeringWeeklyReport || !companyId}>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
                </svg>
                {isTriggeringWeeklyReport ? "Sending Weekly Report..." : "Send Weekly Summary Report"}
              </button>
            </div>
          </div>
        </div>

        {/* Auto-Reply Settings */}
        <div className="st-card">
          <div className="st-card-header">
            <div className="st-card-icon">
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </div>
            <h2 className="st-section-title">Auto-Reply Settings</h2>
          </div>
          <div className="st-card-body" style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
            {error && (
              <div className="st-info-box st-info-box-error">
                <p style={{ fontSize: ".8rem", color: "#8b0000", margin: 0 }}>{error}</p>
              </div>
            )}
            <div>
              <label style={{ display: "flex", alignItems: "flex-start", gap: "10px", cursor: "pointer" }}>
                <input type="checkbox" checked={autoReplyEnabled} onChange={(e) => setAutoReplyEnabled(e.target.checked)} style={{ width: "18px", height: "18px", accentColor: "#f26522", cursor: "pointer", marginTop: "2px", flexShrink: 0 }} />
                <div>
                  <span style={{ fontWeight: 700, fontSize: ".82rem", color: "#4b4b4b", textTransform: "uppercase", letterSpacing: ".06em", display: "block" }}>Enable Auto-Reply</span>
                  <span style={{ fontSize: ".72rem", color: "#8b8b8b", display: "block", marginTop: "3px" }}>Automatically reply to messages that haven't been responded to within the specified time frame</span>
                </div>
              </label>
            </div>

            {autoReplyEnabled && (
              <div>
                <label className="st-label">Auto-Reply Threshold (Hours)</label>
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <input type="number" min="1" max="168" value={autoReplyHours} onChange={(e) => setAutoReplyHours(e.target.value)} className="st-input" style={{ maxWidth: "100px" }} />
                  <span style={{ fontSize: ".82rem", color: "#8b8b8b", fontWeight: 600 }}>hours prior to reconnection</span>
                </div>
                <p style={{ fontSize: ".7rem", color: "#8b8b8b", marginTop: "6px" }}>Messages older than this threshold will NOT be auto-replied to.</p>
              </div>
            )}

            <div>
              <button className="st-btn st-btn-primary" onClick={handleSaveAutoReply} disabled={isSavingAutoReply}>
                {isSavingAutoReply ? "Saving..." : "Save Auto-Reply Settings"}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Disconnect Confirmation Modal */}
      <Dialog open={showDisconnectModal} onClose={() => setShowDisconnectModal(false)}>
        <div className="st-modal-overlay" />
        <div className="st-modal-wrap">
          <Dialog.Panel className="st-modal">
            <div className="st-modal-header">
              <div style={{ width: "32px", height: "32px", background: "rgba(255,255,255,.2)", border: "1px solid rgba(255,255,255,.4)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <h3 style={{ fontWeight: 800, fontSize: ".9rem", color: "#fff", textTransform: "uppercase", letterSpacing: ".06em", margin: 0 }}>Disconnect Bot</h3>
            </div>

            <div className="st-modal-body">
              <div style={{ textAlign: "center", padding: "8px 0" }}>
                <div style={{ width: "52px", height: "52px", background: "#fff0f0", border: "2px solid #8b0000", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
                  <svg className="w-6 h-6" style={{ color: "#8b0000" }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728L5.636 5.636m12.728 12.728L18.364 5.636M5.636 18.364l12.728-12.728" />
                  </svg>
                </div>
                <h4 style={{ fontWeight: 800, fontSize: "1rem", color: "#4b4b4b", margin: "0 0 10px" }}>Are you absolutely sure?</h4>
                <p style={{ fontSize: ".82rem", color: "#8b8b8b", lineHeight: 1.6, margin: "0 0 14px" }}>
                  {disconnectPhoneIndex !== undefined
                    ? `You're about to disconnect Phone ${disconnectPhoneIndex + 1} of ${disconnectBotName}.`
                    : `You're about to disconnect all phones of ${disconnectBotName}.`}
                </p>
                <div className="st-info-box st-info-box-warn" style={{ textAlign: "left" }}>
                  <svg className="w-4 h-4 flex-shrink-0" style={{ color: "#f26522", marginTop: "1px" }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <p style={{ fontSize: ".75rem", color: "#4b4b4b", lineHeight: 1.5, margin: 0 }}>
                    <strong>Warning:</strong> This action cannot be undone. You'll need to reconnect by scanning the QR code again.
                  </p>
                </div>
              </div>
            </div>

            <div className="st-modal-footer">
              <button className="st-btn" onClick={() => setShowDisconnectModal(false)} disabled={isDisconnecting}>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
                Cancel
              </button>
              <button className="st-btn st-btn-danger" onClick={confirmDisconnect} disabled={isDisconnecting}>
                {isDisconnecting ? (
                  <>{disconnectPhoneIndex !== undefined ? "Disconnecting..." : "Disconnecting All..."}</>
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728L5.636 5.636m12.728 12.728L18.364 5.636M5.636 18.364l12.728-12.728" />
                    </svg>
                    {disconnectPhoneIndex !== undefined ? "Yes, Disconnect" : "Yes, Disconnect All"}
                  </>
                )}
              </button>
            </div>
          </Dialog.Panel>
        </div>
      </Dialog>
    </div>
  );
}

export default SettingsPage;