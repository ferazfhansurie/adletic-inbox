import _ from "lodash";
import clsx from "clsx";
import React, {
  useState,
  useEffect,
  useRef,
  useCallback,
  useMemo,
} from "react";
import fakerData from "@/utils/faker";
import Button from "@/components/Base/Button";
import Pagination from "@/components/Base/Pagination";
import { FormInput, FormSelect } from "@/components/Base/Form";
import Lucide from "@/components/Base/Lucide";
import Tippy from "@/components/Base/Tippy";
import { Dialog, Menu } from "@/components/Base/Headless";
import Table from "@/components/Base/Table";
import { getAuth } from "firebase/auth";
import {
  getFirestore,
  collection,
  doc,
  getDoc,
  setDoc,
  getDocs,
  deleteDoc,
  updateDoc,
  addDoc,
  arrayUnion,
  arrayRemove,
  Timestamp,
  query,
  where,
  onSnapshot,
  orderBy,
  limit,
  serverTimestamp,
  writeBatch,
  increment,
  deleteField,
} from "firebase/firestore";
import { initializeApp } from "firebase/app";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { rateLimiter } from "../../utils/rate";
import { useNavigate } from "react-router-dom";
import LoadingIcon from "@/components/Base/LoadingIcon";

import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import LZString from "lz-string";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { format, compareAsc, parseISO } from "date-fns";
import { saveAs } from "file-saver";
import Papa from "papaparse";
import ReactPaginate from "react-paginate";
import { Tab } from "@headlessui/react";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import TemplateSelectorModal from "@/components/TemplateSelectorModal";

import type { DropResult } from "@hello-pangea/dnd";

const firebaseConfig = {
  apiKey: "AIzaSyCc0oSHlqlX7fLeqqonODsOIC3XA8NI7hc",
  authDomain: "onboarding-a5fcb.firebaseapp.com",
  databaseURL:
    "https://onboarding-a5fcb-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "onboarding-a5fcb",
  storageBucket: "onboarding-a5fcb.appspot.com",
  messagingSenderId: "334607574757",
  appId: "1:334607574757:web:2603a69bf85f4a1e87960c",
  measurementId: "G-2C9J1RY67L",
};
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const firestore = getFirestore(app);

function Main() {
  interface Contact {
    company: string;
    name: any;
    contact_id: any;
    threadid?: string | null;
    assistantId?: string | null;
    additionalEmails?: string[] | null;
    address1?: string | null;
    assignedTo?: string | null;
    businessId?: string | null;
    city?: string | null;
    companyName?: string | null;
    contactName?: string | null;
    firstName?: string | null;
    country?: string | null;
    dateAdded?: string | null;
    dateOfBirth?: string | null;
    dateUpdated?: string | null;
    dnd?: boolean | null;
    dndSettings?: any | null;
    email?: string | null;
    followers?: string[] | null;
    id?: string | null;
    lastName?: string | null;
    locationId?: string | null;
    phone?: string | null;
    postalCode?: string | null;
    source?: string | null;
    state?: string | null;
    tags?: string[] | null;
    type?: string | null;
    website?: string | null;
    chat_pic_full?: string | null;
    profileUrl?: string | null;
    chat_id?: string | null;
    points?: number | null;
    phoneIndex?: number | null;
    branch?: string | null;
    expiryDate?: string | null;
    vehicleNumber?: string | null;
    ic?: string | null;
    createdAt?: string | null;
    nationality?: string | null;
    highestEducation?: string | null;
    programOfStudy?: string | null;
    intakePreference?: string | null;
    englishProficiency?: string | null;
    passport?: string | null;
    importedTags?: string[] | null;
    customFields?: { [key: string]: string };
    notes?: string | null;
    leadNumber?: string | null;
    company_id?: string | null;
    profile?: any | null;
    reaction?: string | null;
    reaction_timestamp?: string | null;
    last_updated?: string | null;
    edited?: boolean | null;
    edited_at?: string | null;
    whapi_token?: string | null;
    additional_emails?: string[] | null;
    assigned_to?: string | null;
    business_id?: string | null;
    chat_data?: any | null;
    is_group?: boolean | null;
    unread_count?: number | null;
    last_message?: any | null;
    multi_assign?: boolean | null;
    not_spam?: boolean | null;
    profile_pic_url?: string | null;
    pinned?: boolean | null;
    customer_message?: any | null;
    storage_requirements?: string | null;
    form_submission?: string | null;
    phone_indexes?: string[] | null;
    personal_id?: string | null;
    last_name?: string | null;
    updated_at?: string | null;
    location_id?: string | null;
    vehicle_number?: string | null;
  }

  interface Employee {
    id: string;
    name: string;
    role: string;
    phoneNumber: string;
    phoneIndex: number;
    employeeId: string;
    assignedContacts: number;
    quotaLeads: number;
  }
  interface Tag {
    id: string;
    name: string;
  }
  interface TagsState {
    [key: string]: string[];
  }

  interface ScheduledMessage {
    scheduleId?: string;
    contactIds?: string[];
    multiple?: boolean;
    id?: string;
    chatIds: string[];
    message: string;
    contactId: string;
    messageContent: string;
    messages?: Array<{
      [x: string]: string | boolean; // Changed to allow boolean values for isMain
      text: string;
    }>;
    messageDelays?: number[];
    mediaUrl?: string;
    documentUrl?: string;
    mimeType?: string;
    fileName?: string;
    scheduledTime: string;

    batchQuantity: number;
    repeatInterval: number;
    repeatUnit: "minutes" | "hours" | "days";
    additionalInfo: {
      contactName?: string;
      phone?: string;
      email?: string;
      // ... any other contact fields you want to include
    };
    status: "scheduled" | "sent" | "failed";
    createdAt: Timestamp;
    sentAt?: Timestamp;
    error?: string;
    count?: number;
    v2?: boolean;
    whapiToken?: string;
    minDelay: number;
    maxDelay: number;
    activateSleep: boolean;
    sleepAfterMessages: number | null;
    sleepDuration: number | null;
    activeHours: {
      start: string;
      end: string;
    };
    infiniteLoop: boolean;
    numberOfBatches: number;
    processedMessages?: {
      chatId: string;
      message: string;
      contactData?: {
        contactName: string;
        firstName: string;
        lastName: string;
        email: string;
        phone: string;
        vehicleNumber: string;
        branch: string;
        expiryDate: string;
        ic: string;
        customFields?: { [key: string]: string };
      };
    }[];
    templateData?: {
      hasPlaceholders: boolean;
      placeholdersUsed: string[];
    };
    isConsolidated?: boolean; // Added to indicate the new message structure
  }
  interface Message {
    text: string;
    delayAfter: number;
  }

  type ColumnConfig = {
    id: string;
    label: string;
    sortKey?: string;
  };

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
  }

  const DatePickerComponent = DatePicker as any;

  const [deleteConfirmationModal, setDeleteConfirmationModal] = useState(false);
  const [editContactModal, setEditContactModal] = useState(false);
  const [viewContactModal, setViewContactModal] = useState(false);
  const deleteButtonRef = useRef(null);
  const [isLoading, setLoading] = useState<boolean>(false);
  const [isFetching, setFetching] = useState<boolean>(false);
  const [employeeList, setEmployeeList] = useState<Employee[]>([]);
  const [selectAll, setSelectAll] = useState(false);
  const [selectedContacts, setSelectedContacts] = useState<Contact[]>([]);
  const [showAddUserButton, setShowAddUserButton] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const [currentContact, setCurrentContact] = useState<Contact | null>(null);
  const [isTabOpen, setIsTabOpen] = useState(false);
  const [addContactModal, setAddContactModal] = useState(false);
  const [tagList, setTagList] = useState<Tag[]>([]);
  const [newTag, setNewTag] = useState("");
  const [showAddTagModal, setShowAddTagModal] = useState(false);
  const [showDeleteTagModal, setShowDeleteTagModal] = useState(false);
  const [selectedImportTags, setSelectedImportTags] = useState<string[]>([]);
  const [tagToDelete, setTagToDelete] = useState<Tag | null>(null);
  const [tags, setTags] = useState<TagsState>({});
  const [blastMessageModal, setBlastMessageModal] = useState(false);
  const [blastMessage, setBlastMessage] = useState("");
  const [progress, setProgress] = useState<number>(0);
  const [hoveredContactTags, setHoveredContactTags] = useState<string | null>(
    null
  );
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [currentPage, setCurrentPage] = useState(0);
  const contactsPerPage = 200;
  const contactListRef = useRef<HTMLDivElement>(null);
  const [isLoadingContacts, setIsLoadingContacts] = useState(false);
  const [totalContacts, setTotalContacts] = useState(contacts.length);
  const [selectedTagFilter, setSelectedTagFilter] = useState<string | null>(
    null
  );
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [exportModalOpen, setExportModalOpen] = useState(false);
  const [showColumnsModal, setShowColumnsModal] = useState(false);
  const [showDateFilterModal, setShowDateFilterModal] = useState(false);
  const [dateFilterField, setDateFilterField] = useState<string>("createdAt"); // Changed default to createdAt
  const [dateFilterStart, setDateFilterStart] = useState<string>("");
  const [dateFilterEnd, setDateFilterEnd] = useState<string>("");
  const [activeDateFilter, setActiveDateFilter] = useState<{
    field: string;
    start: string;
    end: string;
  } | null>(null);
  const [exportModalContent, setExportModalContent] =
    useState<React.ReactNode | null>(null);
  const [exportSelectedTags, setExportSelectedTags] = useState<string[]>([]);
  const [focusedMessageIndex, setFocusedMessageIndex] = useState<number>(0);
  const [cursorPosition, setCursorPosition] = useState<number>(0);
  const [selectedScheduledMessages, setSelectedScheduledMessages] = useState<
    string[]
  >([]);

  const [newContact, setNewContact] = useState({
    contactName: "",
    lastName: "",
    email: "",
    phone: "",
    address1: "",
    companyName: "",
    locationId: "",
    branch: "",
    expiryDate: "",
    vehicleNumber: "",
    ic: "",
    notes: "", // Add this line
  });
  const [total, setTotal] = useState(0);
  const [fetched, setFetched] = useState(0);
  const [allContactsLoaded, setAllContactsLoaded] = useState(false);
  const [selectedMedia, setSelectedMedia] = useState<File | null>(null);
  const [selectedDocument, setSelectedDocument] = useState<File | null>(null);
  const [blastStartTime, setBlastStartTime] = useState<Date | null>(null);
  const [blastStartDate, setBlastStartDate] = useState<Date>(new Date());
  const [batchQuantity, setBatchQuantity] = useState<number>(10);
  const [batchDelay, setBatchDelay] = useState<number>(0);
  const [repeatInterval, setRepeatInterval] = useState<number>(0);
  const [repeatUnit, setRepeatUnit] = useState<"minutes" | "hours" | "days">(
    "days"
  );
  const [showCsvImportModal, setShowCsvImportModal] = useState(false);
  const [selectedCsvFile, setSelectedCsvFile] = useState<File | null>(null);
  const [showSyncConfirmationModal, setShowSyncConfirmationModal] =
    useState(false);
  const [showSyncNamesConfirmationModal, setShowSyncNamesConfirmationModal] =
    useState(false);
  const [isScheduling, setIsScheduling] = useState(false);
  const [scheduledMessages, setScheduledMessages] = useState<
    ScheduledMessage[]
  >([]);
  const [editScheduledMessageModal, setEditScheduledMessageModal] =
    useState(false);
  const [currentScheduledMessage, setCurrentScheduledMessage] =
    useState<ScheduledMessage | null>(null);
  const [editMediaFile, setEditMediaFile] = useState<File | null>(null);
  const [editDocumentFile, setEditDocumentFile] = useState<File | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);
  const [stopbot, setStopbot] = useState(false);
  const [userRole, setUserRole] = useState<string>("");
  const [itemOffset, setItemOffset] = useState(0);
  const itemsPerPage = 50;
  const [employeeNames, setEmployeeNames] = useState<string[]>([]);
  const [showMassDeleteModal, setShowMassDeleteModal] = useState(false);
  const [showAssignUserModal, setShowAssignUserModal] = useState(false);
  const [showManageTagsModal, setShowManageTagsModal] = useState(false);
  const [showFiltersModal, setShowFiltersModal] = useState(false);
  const [showSyncOptionsModal, setShowSyncOptionsModal] = useState(false);

  // Accordion menu states
  const [showAssignUserMenu, setShowAssignUserMenu] = useState(false);
  const [showAddTagMenu, setShowAddTagMenu] = useState(false);
  const [showRemoveTagMenu, setShowRemoveTagMenu] = useState(false);
  const [showSyncMenu, setShowSyncMenu] = useState(false);
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [showTagSelection, setShowTagSelection] = useState(false);
  const [showManageTagsMenu, setShowManageTagsMenu] = useState(false);

  const [isMassDeleting, setIsMassDeleting] = useState(false);
  const [userFilter, setUserFilter] = useState<string>("");
  const [activeTab, setActiveTab] = useState<"tags" | "users">("tags");
  const [selectedTagFilters, setSelectedTagFilters] = useState<string[]>([]);
  const [selectedUserFilters, setSelectedUserFilters] = useState<string[]>([]);
  const [excludedTagFilters, setExcludedTagFilters] = useState<string[]>([]);
  const [excludedUserFilters, setExcludedUserFilters] = useState<string[]>([]);
  const [activeFilterTab, setActiveFilterTab] = useState("tags");

  // Helper function to get user filter state: 'none' | 'include' | 'exclude'
  const getUserFilterState = (
    userName: string
  ): "none" | "include" | "exclude" => {
    if (selectedUserFilters.includes(userName)) return "include";
    if (excludedUserFilters.includes(userName)) return "exclude";
    return "none";
  };

  // Helper function to set user filter state
  const setUserFilterState = (
    userName: string,
    state: "none" | "include" | "exclude"
  ) => {
    // Remove from both arrays first
    setSelectedUserFilters((prev) => prev.filter((u) => u !== userName));
    setExcludedUserFilters((prev) => prev.filter((u) => u !== userName));

    // Add to appropriate array based on state
    if (state === "include") {
      setSelectedUserFilters((prev) => [...prev, userName]);
    } else if (state === "exclude") {
      setExcludedUserFilters((prev) => [...prev, userName]);
    }
  };

  // Three-state filter component for users
  const ThreeStateUserFilter = ({
    userName,
    className,
  }: {
    userName: string;
    className?: string;
  }) => {
    const currentState = getUserFilterState(userName);

    const handleClick = () => {
      let nextState: "none" | "include" | "exclude";
      switch (currentState) {
        case "none":
          nextState = "include";
          break;
        case "include":
          nextState = "exclude";
          break;
        case "exclude":
          nextState = "none";
          break;
      }
      setUserFilterState(userName, nextState);
    };

    return (
      <button
        onClick={handleClick}
        className={`w-5 h-5 rounded-lg border-2 transition-all duration-200 flex items-center justify-center ${className || ""
          }`}
        style={{
          borderColor:
            currentState === "none"
              ? "rgba(255, 255, 255, 0.3)"
              : currentState === "include"
                ? "#14b8a6"
                : "#ef4444",
          backgroundColor:
            currentState === "none"
              ? "rgba(255, 255, 255, 0.05)"
              : currentState === "include"
                ? "#14b8a6"
                : "#ef4444",
        }}
      >
        {currentState === "include" && (
          <Lucide icon="Check" className="w-3 h-3 text-white" />
        )}
        {currentState === "exclude" && (
          <Lucide icon="X" className="w-3 h-3 text-white" />
        )}
      </button>
    );
  };
  const getTagFilterState = (
    tagName: string
  ): "none" | "include" | "exclude" => {
    if (selectedTagFilters.includes(tagName)) return "include";
    if (excludedTagFilters.includes(tagName)) return "exclude";
    return "none";
  };

  // Helper function to set tag filter state
  const setTagFilterState = (
    tagName: string,
    state: "none" | "include" | "exclude"
  ) => {
    // Remove from both arrays first
    setSelectedTagFilters((prev) => prev.filter((t) => t !== tagName));
    setExcludedTagFilters((prev) => prev.filter((t) => t !== tagName));

    // Add to appropriate array based on state
    if (state === "include") {
      setSelectedTagFilters((prev) => [...prev, tagName]);
    } else if (state === "exclude") {
      setExcludedTagFilters((prev) => [...prev, tagName]);
    }
  };

  // Three-state filter component
  const ThreeStateTagFilter = ({
    tagName,
    className,
  }: {
    tagName: string;
    className?: string;
  }) => {
    const currentState = getTagFilterState(tagName);

    const handleClick = () => {
      let nextState: "none" | "include" | "exclude";
      switch (currentState) {
        case "none":
          nextState = "include";
          break;
        case "include":
          nextState = "exclude";
          break;
        case "exclude":
          nextState = "none";
          break;
      }
      setTagFilterState(tagName, nextState);
    };

    return (
      <button
        onClick={handleClick}
        className={`w-5 h-5 rounded-lg border-2 transition-all duration-200 flex items-center justify-center ${className || ""
          }`}
        style={{
          borderColor:
            currentState === "none"
              ? "rgba(255, 255, 255, 0.3)"
              : currentState === "include"
                ? "#10b981"
                : "#ef4444",
          backgroundColor:
            currentState === "none"
              ? "rgba(255, 255, 255, 0.05)"
              : currentState === "include"
                ? "#10b981"
                : "#ef4444",
        }}
      >
        {currentState === "include" && (
          <Lucide icon="Check" className="w-3 h-3 text-white" />
        )}
        {currentState === "exclude" && (
          <Lucide icon="X" className="w-3 h-3 text-white" />
        )}
      </button>
    );
  };
  const [selectedContact, setSelectedContact] = useState<any>(null);
  const [filteredContacts, setFilteredContacts] = useState<Contact[]>([]);
  const [showPlaceholders, setShowPlaceholders] = useState(false);
  const [companyId, setCompanyId] = useState<string>("");
  const [currentUserRole, setCurrentUserRole] = useState<any>(null);
  const [showAllMessages, setShowAllMessages] = useState(false);
  const [phoneIndex, setPhoneIndex] = useState<number | null>(null);
  const [phoneOptions, setPhoneOptions] = useState<number[]>([]);
  const [phoneNames, setPhoneNames] = useState<{ [key: number]: string }>({});
  const [employeeSearch, setEmployeeSearch] = useState("");
  const [tagSearchQuery, setTagSearchQuery] = useState("");

  const [sortField, setSortField] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");

  const [selectedPhoneIndex, setSelectedPhoneIndex] = useState<number | null>(
    null
  );
  const [showRecipients, setShowRecipients] = useState<string | null>(null);
  const [recipientSearch, setRecipientSearch] = useState("");
  const [minDelay, setMinDelay] = useState(1);
  const [maxDelay, setMaxDelay] = useState(2);
  const [activateSleep, setActivateSleep] = useState(false);
  const [sleepAfterMessages, setSleepAfterMessages] = useState(20);
  const [sleepDuration, setSleepDuration] = useState(5);
  const [enableActiveHours, setEnableActiveHours] = useState(false);
  const [activeTimeStart, setActiveTimeStart] = useState("09:00");
  const [activeTimeEnd, setActiveTimeEnd] = useState("17:00");
  const [messages, setMessages] = useState<Message[]>([
    { text: "", delayAfter: 0 },
  ]);
  const employeeListRef = useRef<Employee[]>([]);
  const [messageStatusFilter, setMessageStatusFilter] = useState("");
  const [messageDateFilter, setMessageDateFilter] = useState("");
  const [messageTypeFilter, setMessageTypeFilter] = useState("");
  const [messageRecipientFilter, setMessageRecipientFilter] = useState("");
  const [infiniteLoop, setInfiniteLoop] = useState(false);
  const [showScheduledMessages, setShowScheduledMessages] =
    useState<boolean>(false);
  const [scheduledMessagesModal, setScheduledMessagesModal] = useState(false);
  const [selectedMessageForView, setSelectedMessageForView] =
    useState<any>(null);
  const [viewMessageDetailsModal, setViewMessageDetailsModal] = useState(false);

  // Template and 24-hour window states
  const [isOfficialApi, setIsOfficialApi] = useState(false);
  const [connectionType, setConnectionType] = useState<string>('wwebjs');
  const [isTemplateSelectorOpen, setIsTemplateSelectorOpen] = useState(false);
  const [templateContactsToSend, setTemplateContactsToSend] = useState<string[]>([]);
  const [pendingMessageToSend, setPendingMessageToSend] = useState<any>(null);

  // Blast template states
  const [blastTemplates, setBlastTemplates] = useState<any[]>([]);
  const [selectedBlastTemplate, setSelectedBlastTemplate] = useState<any>(null);
  const [blastTemplateVariables, setBlastTemplateVariables] = useState<string[]>([]);
  const [isLoadingBlastTemplates, setIsLoadingBlastTemplates] = useState(false);
  const [isSendingBlastTemplate, setIsSendingBlastTemplate] = useState(false);

  const defaultVisibleColumns = {
    checkbox: true,
    contact: true,
    phone: true,
    tags: true,
    ic: false,
    expiryDate: false,
    vehicleNumber: false,
    branch: false,
    notes: true,
    createdAt: true,
    actions: true,
  };

  const defaultColumnOrder = [
    "checkbox",
    "contact",
    "phone",
    "tags",
    // These will be conditionally added based on companyId
    ...(companyId === "079"
      ? ["ic", "expiryDate", "vehicleNumber", "branch"]
      : []),
    "notes",
    "createdAt",
    "actions",
  ];

  const [visibleColumns, setVisibleColumns] = useState<{
    [key: string]: boolean;
  }>(() => {
    const saved = localStorage.getItem("contactsVisibleColumns");
    if (saved) {
      const parsedColumns = JSON.parse(saved);
      // Ensure essential columns are always visible
      return {
        ...parsedColumns,
        checkbox: true,
        contact: true,
        phone: true,
        actions: true,
        // These will be updated based on companyId in useEffect
        vehicleNumber: false,
        branch: false,
        ic: false,
        expiryDate: false,
      };
    }
    return {
      ...defaultVisibleColumns,
      // These will be updated based on companyId in useEffect
      vehicleNumber: false,
      branch: false,
      ic: false,
      expiryDate: false,
      ...(contacts[0]?.customFields
        ? Object.keys(contacts[0].customFields).reduce(
          (acc, field) => ({
            ...acc,
            [`customField_${field}`]: true,
          }),
          {}
        )
        : {}),
    };
  });

  const baseUrl = "https://bisnesgpt.jutateknologi.com";

  // Add this useEffect to save visible columns when they change
  useEffect(() => {
    localStorage.setItem(
      "contactsVisibleColumns",
      JSON.stringify(visibleColumns)
    );
  }, [visibleColumns]);

  const [columnOrder, setColumnOrder] = useState<string[]>(() => {
    const saved = localStorage.getItem("contactsColumnOrder");
    if (saved) {
      const parsedOrder = JSON.parse(saved);
      // Ensure all default columns are included
      const missingColumns = defaultColumnOrder.filter(
        (col) => !parsedOrder.includes(col)
      );
      return [...parsedOrder, ...missingColumns];
    }
    return [
      ...defaultColumnOrder,
      ...Object.keys(contacts[0]?.customFields || {}).map(
        (field) => `customField_${field}`
      ),
    ];
  });

  // Add a useEffect to ensure columns stay visible after data updates
  useEffect(() => {
    setVisibleColumns((prev) => ({
      ...defaultVisibleColumns,
      ...prev,
      vehicleNumber: companyId === "079",
      branch: companyId === "079",
      ic: companyId === "079",
      expiryDate: companyId === "079",
    }));
  }, [companyId]);

  // Close tooltip when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (hoveredContactTags) {
        setHoveredContactTags(null);
      }
    };

    if (hoveredContactTags) {
      document.addEventListener("click", handleClickOutside);
    }

    return () => {
      document.removeEventListener("click", handleClickOutside);
    };
  }, [hoveredContactTags]);

  // Add this handler function
  const handleColumnReorder = (result: DropResult) => {
    if (!result.destination) return;

    const newColumnOrder = Array.from(columnOrder);
    const [reorderedItem] = newColumnOrder.splice(result.source.index, 1);
    newColumnOrder.splice(result.destination.index, 0, reorderedItem);

    setColumnOrder(newColumnOrder);
    localStorage.setItem("contactsColumnOrder", JSON.stringify(newColumnOrder));
  };

  useEffect(() => {
    const fetchUserData = async () => {
      const user = auth.currentUser;
      if (user) {
        const docUserRef = doc(firestore, "user", user.email!);
        const docUserSnapshot = await getDoc(docUserRef);
        if (docUserSnapshot.exists()) {
          const userData = docUserSnapshot.data();
          setCompanyId(userData.companyId);

          fetchPhoneIndex(userData.companyId);
        }
      }
    };

    fetchUserData();
  }, []);

  // Additional useEffect to fetch phone names as early as possible
  useEffect(() => {
    const fetchPhoneNamesEarly = async () => {
      const userEmail = localStorage.getItem("userEmail");
      if (userEmail && Object.keys(phoneNames).length === 0) {
        try {
          const response = await fetch(
            `${baseUrl}/api/user-page-context?email=${encodeURIComponent(
              userEmail
            )}`
          );

          if (response.ok) {
            const data = await response.json();

            if (data.phoneNames && typeof data.phoneNames === "object") {
              console.log(
                "Setting phone names early from user-page-context:",
                data.phoneNames
              );
              setPhoneNames(data.phoneNames);
              setPhoneOptions(Object.keys(data.phoneNames).map(Number));
            }
          }
        } catch (error) {
          console.error("Error fetching phone names early:", error);
        }
      }
    };

    fetchPhoneNamesEarly();
  }, [phoneNames]);

  const fetchPhoneIndex = async (companyId: string) => {
    try {
      // Get current user email for API call
      const userEmail = localStorage.getItem("userEmail");
      if (!userEmail) {
        console.error("No user email found");
        return;
      }

      // Use the same API endpoint as Chat component to get phone names
      const response = await fetch(
        `${baseUrl}/api/user-page-context?email=${encodeURIComponent(
          userEmail
        )}`
      );

      if (!response.ok) {
        throw new Error("Failed to fetch user context");
      }

      const data = await response.json();

      // Set phone names from the API response
      if (data.phoneNames && typeof data.phoneNames === "object") {
        console.log(
          "Setting phone names from user-page-context:",
          data.phoneNames
        );
        setPhoneNames(data.phoneNames);
        setPhoneOptions(Object.keys(data.phoneNames).map(Number));
      } else {
        // Fallback: create default phone names based on phone count
        const phoneCount = data.companyData?.phoneCount || 0;
        console.log(
          "Creating default phone names for phone count:",
          phoneCount
        );
        const defaultPhoneNames: { [key: number]: string } = {};
        for (let i = 0; i < phoneCount; i++) {
          defaultPhoneNames[i] = `Phone ${i + 1}`;
        }
        setPhoneNames(defaultPhoneNames);
        setPhoneOptions(Object.keys(defaultPhoneNames).map(Number));
      }
    } catch (error) {
      console.error(
        "Error fetching phone names from user-page-context:",
        error
      );

      // Fallback: try to get phone count from bot status API
      try {
        const botStatusResponse = await axios.get(
          `${baseUrl}/api/bot-status/${companyId}`
        );

        if (botStatusResponse.status === 200) {
          const botData = botStatusResponse.data;
          const phoneCount = botData.phoneCount || 0;

          // Create default phone names based on phone count
          const defaultPhoneNames: { [key: number]: string } = {};
          for (let i = 0; i < phoneCount; i++) {
            defaultPhoneNames[i] = `Phone ${i + 1}`;
          }
          setPhoneNames(defaultPhoneNames);
          setPhoneOptions(Object.keys(defaultPhoneNames).map(Number));
        } else {
          // Final fallback: set empty phone names
          setPhoneOptions([]);
          setPhoneNames({});
        }
      } catch (fallbackError) {
        console.error(
          "Error fetching phone names from bot status API:",
          fallbackError
        );
        setPhoneOptions([]);
        setPhoneNames({});
      }
    }
  };

  // Add this sorting function
  const handleSort = (field: string) => {
    if (sortField === field) {
      // If clicking the same field, toggle direction
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      // If clicking a new field, set it with ascending direction
      setSortField(field);
      setSortDirection("asc");
    }
  };
  const toggleScheduledMessageSelection = (messageId: string) => {
    setSelectedScheduledMessages((prev) =>
      prev.includes(messageId)
        ? prev.filter((id) => id !== messageId)
        : [...prev, messageId]
    );
  };
  useEffect(() => {
    if (showAssignUserModal) {
      console.log("Modal opened - employeeList:", employeeList);
      console.log("Modal opened - employeeList length:", employeeList.length);
    }
  }, [showAssignUserModal, employeeList]);
  useEffect(() => {
    if (showAssignUserModal) {
      console.log("Modal opened - employeeList:", employeeList);
      console.log("Modal opened - employeeList length:", employeeList.length);
    }
  }, [showAssignUserModal, employeeList]);
  // Add this near your other useEffect hooks

  useEffect(() => {
    // Ensure employee names are properly stored when fetched
    const normalizedEmployeeNames = employeeList.map((employee) =>
      employee.name.toLowerCase()
    );
    setEmployeeNames(normalizedEmployeeNames);
  }, [employeeList]);

  useEffect(() => {
    if (employeeList.length > 0) {
      employeeListRef.current = [...employeeList];
      console.log(
        "Updated employeeListRef with:",
        employeeListRef.current.length,
        "employees"
      );
    }
  }, [employeeList]);
  const handleDeleteSelected = async () => {
    if (selectedScheduledMessages.length === 0) {
      toast.error("Please select messages to delete");
      return;
    }

    try {
      // Delete all selected messages
      await Promise.all(
        selectedScheduledMessages.map((messageId) =>
          handleDeleteScheduledMessage(messageId)
        )
      );

      setSelectedScheduledMessages([]); // Clear selection after deletion
      toast.success(
        `Successfully deleted ${selectedScheduledMessages.length} messages`
      );
    } catch (error) {
      console.error("Error deleting selected messages:", error);
      toast.error("Failed to delete some messages");
    }
  };
  const handleSendSelectedNow = async () => {
    if (selectedScheduledMessages.length === 0) {
      toast.error("Please select messages to send");
      return;
    }

    try {
      const selectedMessages = scheduledMessages.filter((msg) =>
        selectedScheduledMessages.includes(msg.id!)
      );

      for (const message of selectedMessages) {
        await handleSendNow(message);
      }

      setSelectedScheduledMessages([]); // Clear selection after sending
      toast.success(`Successfully sent ${selectedMessages.length} messages`);
    } catch (error) {
      console.error("Error sending selected messages:", error);
      toast.error("Failed to send some messages");
    }
  };
  const getDisplayedContacts = () => {
    if (!sortField) return currentContacts;

    return [...currentContacts].sort((a, b) => {
      let aValue: any = a[sortField as keyof typeof a];
      let bValue: any = b[sortField as keyof typeof b];

      // Handle special cases
      if (sortField === "tags") {
        // Sort by first tag, or empty string if no tags
        aValue = a.tags?.[0] || "";
        bValue = b.tags?.[0] || "";
      } else if (
        sortField === "createdAt" ||
        sortField === "dateAdded" ||
        sortField === "dateUpdated" ||
        sortField === "expiryDate"
      ) {
        // Sort chronologically for date fields
        aValue = aValue ? new Date(aValue).getTime() : 0;
        bValue = bValue ? new Date(bValue).getTime() : 0;
        return sortDirection === "asc" ? aValue - bValue : bValue - aValue;
      } else if (sortField.startsWith("customField_")) {
        const fieldName = sortField.replace("customField_", "");
        aValue = a.customFields?.[fieldName] || "";
        bValue = b.customFields?.[fieldName] || "";
      }

      // Convert to strings for comparison (except for points and dates which are handled above)
      if (
        sortField !== "createdAt" &&
        sortField !== "dateAdded" &&
        sortField !== "dateUpdated" &&
        sortField !== "expiryDate"
      ) {
        aValue = String(aValue || "").toLowerCase();
        bValue = String(bValue || "").toLowerCase();
        return sortDirection === "asc"
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
      }

      return 0; // Fallback return for points and date sorting
    });
  };

  const resetSort = () => {
    setSortField(null);
    setSortDirection("asc");
  };

  const filterContactsByUserRole = (
    contacts: Contact[],
    userRole: string,
    userName: string
  ) => {
    switch (userRole) {
      case "1":
        return contacts; // Admin sees all contacts
      case "admin": // Admin
        return contacts; // Admin sees all contacts
      case "user": // Admin
        return contacts.filter((contact) =>
          contact.tags?.some(
            (tag) => tag.toLowerCase() === userName.toLowerCase()
          )
        );
      case "2":
        // Sales sees only contacts assigned to them
        return contacts.filter((contact) =>
          contact.tags?.some(
            (tag) => tag.toLowerCase() === userName.toLowerCase()
          )
        );
      case "3":
        // Observer sees only contacts assigned to them
        return contacts.filter((contact) =>
          contact.tags?.some(
            (tag) => tag.toLowerCase() === userName.toLowerCase()
          )
        );
      case "4":
        // Manager sees only contacts assigned to them
        return contacts.filter((contact) =>
          contact.tags?.some(
            (tag) => tag.toLowerCase() === userName.toLowerCase()
          )
        );
      case "5":
        return contacts;
      default:
        return [];
    }
  };

  const handleRemoveTagsFromContact = async (
    contact: Contact,
    tagsToRemove: string[]
  ) => {
    if (userRole === "3") {
      toast.error("You don't have permission to remove tags.");
      return;
    }

    try {
      const userEmail = localStorage.getItem("userEmail");
      if (!userEmail) {
        toast.error("No user email found");
        return;
      }

      // Fetch user config to get companyId
      const userResponse = await fetch(
        `${baseUrl}/api/user/config?email=${encodeURIComponent(userEmail)}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          credentials: "include",
        }
      );

      if (!userResponse.ok) {
        toast.error("Failed to fetch user config");
        return;
      }

      const userData = await userResponse.json();
      const companyId = userData?.company_id;
      if (!companyId) {
        toast.error("Company ID not found!");
        return;
      }

      // Remove tags from contact via API
      const contactId = contact.contact_id || contact.id;
      if (!contactId) {
        toast.error("Contact ID not found");
        return;
      }

      const response = await fetch(
        `${baseUrl}/api/contacts/${companyId}/${contactId}/tags`,
        {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ tags: tagsToRemove }),
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Failed to remove tags from contact:", errorText);
        toast.error("Failed to remove tags from contact");
        return;
      }

      const data = await response.json();

      // Calculate the updated tags by removing the specified tags from existing tags
      const currentContact = contacts.find(
        (c) => c.id === contactId || c.contact_id === contactId
      );
      const currentTags = currentContact?.tags || [];
      const updatedTags = currentTags.filter(
        (tag) => !tagsToRemove.includes(tag)
      );

      // Update both contacts and filteredContacts states immediately
      const updateContactsList = (prevContacts: Contact[]) =>
        prevContacts.map((contact) =>
          contact.id === contactId || contact.contact_id === contactId
            ? { ...contact, tags: updatedTags }
            : contact
        );

      setContacts(updateContactsList);
      setFilteredContacts((prevFilteredContacts) =>
        updateContactsList(prevFilteredContacts)
      );

      // Update selectedContact if it's the same contact
      if (
        selectedContact &&
        (selectedContact.id === contactId ||
          selectedContact.contact_id === contactId)
      ) {
        setSelectedContact((prevContact: Contact) => ({
          ...prevContact,
          tags: updatedTags,
        }));
      }

      // Update currentContact if it's the same contact
      if (
        currentContact &&
        (currentContact.id === contactId ||
          currentContact.contact_id === contactId)
      ) {
        setCurrentContact((prevContact) =>
          prevContact ? { ...prevContact, tags: updatedTags } : prevContact
        );
      }

      toast.success("Tags removed successfully!");
    } catch (error) {
      console.error("Error removing tags:", error);
      toast.error("Failed to remove tags.");
    }
  };

  const fetchContacts = useCallback(async () => {
    setLoading(true);
    try {
      const userEmail = localStorage.getItem("userEmail");
      if (!userEmail) {
        toast.error("No user email found");
        return;
      }

      // Get user config to get companyId
      const userResponse = await fetch(
        `${baseUrl}/api/user/config?email=${encodeURIComponent(userEmail)}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          credentials: "include",
        }
      );

      if (!userResponse.ok) {
        toast.error("Failed to fetch user config");
        return;
      }

      const userData = await userResponse.json();
      const companyId = userData.company_id;
      const userRole = userData.role;
      const userName = userData.name;

      // Fetch contacts from SQL database
      const contactsResponse = await fetch(
        `${baseUrl}/api/companies/${companyId}/contacts?email=${userEmail}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          credentials: "include",
        }
      );

      if (!contactsResponse.ok) {
        toast.error("Failed to fetch contacts");
        return;
      }

      const data = await contactsResponse.json();

      // Debug: Log multiple contacts to see what fields are available
      if (data.contacts && data.contacts.length > 0) {
        console.log("Total contacts fetched:", data.contacts.length);

        // Search for specific contact with phone 60103089696
        const targetContact = data.contacts.find(
          (contact: any) =>
            contact.phone === "+60103089696" ||
            contact.phone === "60103089696" ||
            contact.phone === "+60 10-308 9696" ||
            contact.phone?.includes("60103089696")
        );

        if (targetContact) {
          console.log("=== FOUND TARGET CONTACT ===");
          console.log("Target contact:", targetContact);
          console.log("Target contact fields:", Object.keys(targetContact));
          console.log(
            "Target contact custom fields:",
            targetContact.customFields
          );
          console.log("Target contact branch:", targetContact.branch);
          console.log(
            "Target contact vehicleNumber:",
            targetContact.vehicleNumber
          );
          console.log("Target contact ic:", targetContact.ic);
          console.log("Target contact expiryDate:", targetContact.expiryDate);
          console.log("Target contact leadNumber:", targetContact.leadNumber);
          console.log("Target contact phoneIndex:", targetContact.phoneIndex);
          console.log("=== END TARGET CONTACT ===");
        } else {
          console.log(
            "Contact with phone 60103089696 not found in current batch"
          );
          // Log all phone numbers to see what we have
          console.log(
            "Available phone numbers:",
            data.contacts.map((c: any) => c.phone).slice(0, 10)
          );
        }
      }

      const fetchedContacts = data.contacts.map((contact: any) => {
        // Filter out empty tags
        if (contact.tags) {
          contact.tags = contact.tags.filter(
            (tag: any) =>
              typeof tag === "string" &&
              tag.trim() !== "" &&
              tag !== null &&
              tag !== undefined
          );
        }

        // Map SQL fields to match your Contact interface
        return {
          ...contact,
          id: contact.id,
          chat_id: contact.chat_id,
          contactName: contact.name,
          phone: contact.phone,
          email: contact.email,
          profile: contact.profile,
          tags: contact.tags,
          createdAt: contact.createdAt,
          lastUpdated: contact.lastUpdated,
          last_message: contact.last_message,
          isIndividual: contact.isIndividual,
          // Try to extract data from profile JSON if it exists
          ...(contact.profile && typeof contact.profile === "string"
            ? (() => {
              try {
                const profileData = JSON.parse(contact.profile);
                return {
                  branch: contact.branch || profileData.branch,
                  vehicleNumber:
                    contact.vehicleNumber ||
                    contact.vehicle_number ||
                    profileData.vehicleNumber,
                  ic: contact.ic || profileData.ic,
                  expiryDate:
                    contact.expiryDate ||
                    contact.expiry_date ||
                    profileData.expiryDate,
                };
              } catch (e) {
                return {};
              }
            })()
            : {}),
          // Map fields with multiple possible names and custom fields
          branch:
            contact.branch ||
            contact.customFields?.branch ||
            contact.customFields?.["BRANCH"],
          vehicleNumber:
            contact.vehicleNumber ||
            contact.vehicle_number ||
            contact.customFields?.["VEH. NO."] ||
            contact.customFields?.vehicleNumber ||
            contact.customFields?.["VEHICLE NUMBER"],
          ic:
            contact.ic ||
            contact.customFields?.ic ||
            contact.customFields?.["IC"],
          expiryDate:
            contact.expiryDate ||
            contact.expiry_date ||
            contact.customFields?.expiryDate ||
            contact.customFields?.["EXPIRY DATE"],

          phoneIndex: contact.phoneIndex || contact.phone_index,
          leadNumber:
            contact.leadNumber ||
            contact.lead_number ||
            contact.customFields?.["LEAD NUMBER"],
          notes: contact.notes,
          customFields: contact.customFields || {},
        } as Contact;
      });
      console.log(fetchedContacts);

      // Function to check if a chat_id is for an individual contact
      const isIndividual = (chat_id: string | undefined) => {
        return chat_id?.endsWith("@c.us") || false;
      };

      // Separate contacts into categories
      const individuals = fetchedContacts.filter((contact: { chat_id: any }) =>
        isIndividual(contact.chat_id || "")
      );
      const groups = fetchedContacts.filter(
        (contact: { chat_id: any }) => !isIndividual(contact.chat_id || "")
      );

      // Combine all contacts in the desired order
      const allSortedContacts = [...individuals, ...groups];

      // Helper function to get timestamp value
      const getTimestamp = (createdAt: any): number => {
        if (!createdAt) return 0;
        if (typeof createdAt === "string") {
          return new Date(createdAt).getTime();
        }
        if (createdAt.seconds) {
          return (
            createdAt.seconds * 1000 + (createdAt.nanoseconds || 0) / 1000000
          );
        }
        return 0;
      };

      // Sort contacts based on createdAt
      allSortedContacts.sort((a, b) => {
        const dateA = getTimestamp(a.createdAt);
        const dateB = getTimestamp(b.createdAt);
        return dateB - dateA; // For descending order
      });

      const filteredContacts = filterContactsByUserRole(
        allSortedContacts,
        userRole,
        userName
      );

      setContacts(filteredContacts);
      setFilteredContacts(filteredContacts);
    } catch (error) {
      console.error("Error fetching contacts:", error);
      toast.error("Failed to fetch contacts");
    } finally {
      setIsLoadingContacts(false);
    }
  }, []);

  useEffect(() => {
    fetchContacts();
  }, [fetchContacts]);

  useEffect(() => {
    const handleScroll = () => {
      if (
        contactListRef.current &&
        contactListRef.current.scrollTop +
        contactListRef.current.clientHeight >=
        contactListRef.current.scrollHeight
      ) {
      }
    };

    if (contactListRef.current) {
      contactListRef.current.addEventListener("scroll", handleScroll);
    }

    return () => {
      if (contactListRef.current) {
        contactListRef.current.removeEventListener("scroll", handleScroll);
      }
    };
  }, [filteredContacts]);
  useEffect(() => { }, [selectedTags]);

  const handleExportContacts = () => {
    if (userRole === "2" || userRole === "3") {
      toast.error("You don't have permission to export contacts.");
      return;
    }

    const exportOptions = [
      { id: "selected", label: "Export Selected Contacts" },
      { id: "tagged", label: "Export Contacts by Tag" },
    ];

    // Open export modal; rendering centralized in MODALS SECTION
    if (userRole === "1") {
      setExportModalOpen(true);
      setExportModalContent("options");
    }
  };

  const handleExportOption = (option: string) => {
    setExportModalOpen(false);

    if (option === "selected") {
      if (selectedContacts.length === 0) {
        toast.error("No contacts selected. Please select contacts to export.");
        return;
      }
      exportContactsToCSV(selectedContacts);
    } else if (option === "tagged") {
      showTagSelectionModal();
    }
  };

  const showTagSelectionModal = () => {
    setExportSelectedTags(selectedTags);
    setExportModalContent("tag-select");
    setExportModalOpen(true);
  };

  const exportContactsByTags = (currentSelectedTags: string[]) => {
    if (currentSelectedTags.length === 0) {
      toast.error("No tags selected. Please select at least one tag.");
      return;
    }

    const contactsToExport = contacts.filter(
      (contact) =>
        contact.tags &&
        contact.tags.some((tag) => currentSelectedTags.includes(tag))
    );

    if (contactsToExport.length === 0) {
      toast.error("No contacts found with the selected tags.");
      return;
    }

    exportContactsToCSV(contactsToExport);
    setExportModalOpen(false);
    setSelectedTags(currentSelectedTags);
  };

  const exportContactsToCSV = (contactsToExport: Contact[]) => {
    const csvData = contactsToExport.map((contact) => ({
      contactName: contact.contactName || "",
      email: contact.email || "",
      phone: contact.phone || "",
      address: contact.address1 || "",
      company: contact.companyName || "",
      tags: (contact.tags || []).join(", "),
    }));

    const csv = Papa.unparse(csvData);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const fileName = `contacts_export_${new Date().toISOString()}.csv`;
    saveAs(blob, fileName);

    toast.success(`${contactsToExport.length} contacts exported successfully!`);
  };

  const handleTagSelection = (
    e: React.ChangeEvent<HTMLInputElement>,
    tagName: string
  ) => {
    try {
      const isChecked = e.target.checked;
      setSelectedTags((prevTags) => {
        if (isChecked) {
          return [...prevTags, tagName];
        } else {
          return prevTags.filter((tag) => tag !== tagName);
        }
      });
    } catch (error) {
      console.error("Error handling tag selection:", error);
      toast.error("An error occurred while selecting tags. Please try again.");
    }
  };

  const handleMediaUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const maxSizeInMB = 20;
      const maxSizeInBytes = maxSizeInMB * 1024 * 1024;

      if (file.type.startsWith("video/") && file.size > maxSizeInBytes) {
        toast.error(
          "The video file is too big. Please select a file smaller than 20MB."
        );
        return;
      }

      try {
        setSelectedMedia(file);
      } catch (error) {
        console.error("Error uploading file:", error);
        toast.error("Upload unsuccessful. Please try again.");
      }
    }
  };

  const handleDocumentUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedDocument(file);
    }
  };

  const uploadFile = async (file: File): Promise<string> => {
    try {
      const { companyId: cId, baseUrl: apiUrl } = await getCompanyData();

      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch(`${apiUrl}/api/upload-media`, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("File upload failed");
      }

      const data = await response.json();
      return data.url;
    } catch (error) {
      console.error("Error uploading file:", error);
      throw error;
    }
  };

  let role = 1;
  let userName = "";

  useEffect(() => {
    setTotalContacts(contacts.length);
  }, [contacts]);

  const handleTagFilterChange = (tagName: string) => {
    setSelectedTagFilters((prev) =>
      prev.includes(tagName)
        ? prev.filter((tag) => tag !== tagName)
        : [...prev, tagName]
    );
  };

  const formatPhoneNumber = (phone: string): string => {
    if (!phone || phone.trim() === "") return "";

    let cleanPhone = phone.replace(/[^\d+]/g, "");

    if (cleanPhone.startsWith("+")) {
      return cleanPhone;
    }

    cleanPhone = cleanPhone.replace(/\+/g, "");

    if (cleanPhone.startsWith("0")) {
      return `+60${cleanPhone.slice(1)}`;
    }

    const commonCountryCodes = [
      "60",
      "65",
      "66",
      "84",
      "86",
      "82",
      "81",
      "91",
      "61",
      "1",
      "44",
      "49",
      "33",
      "39",
      "34",
      "31",
      "46",
      "47",
      "45",
      "41",
      "43",
      "32",
      "30",
      "351",
      "353",
      "358",
      "372",
      "371",
      "370",
      "386",
      "385",
      "381",
      "385",
      "380",
      "375",
      "373",
    ];

    for (const countryCode of commonCountryCodes.sort(
      (a, b) => b.length - a.length
    )) {
      if (cleanPhone.startsWith(countryCode)) {
        return `+${cleanPhone}`;
      }
    }

    if (cleanPhone.length >= 8) {
      return `+60${cleanPhone}`;
    }

    return `+${cleanPhone}`;
  };

  const handleSaveNewContact = async () => {
    if (userRole === "3") {
      toast.error("You don't have permission to add contacts.");
      return;
    }
    console.log(newContact);
    try {
      if (!newContact.phone) {
        toast.error("Phone number is required.");
        return;
      }

      // Format the phone number
      const formattedPhone = formatPhoneNumber(newContact.phone);

      // Get user/company info from localStorage or your app state
      const userEmail = localStorage.getItem("userEmail");
      if (!userEmail) {
        toast.error("No user email found");
        return;
      }

      // Fetch user config to get companyId
      const userResponse = await fetch(
        `${baseUrl}/api/user/config?email=${encodeURIComponent(userEmail)}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          credentials: "include",
        }
      );

      if (!userResponse.ok) {
        toast.error("Failed to fetch user config");
        return;
      }

      const userData = await userResponse.json();
      const companyId = userData?.company_id;
      if (!companyId) {
        toast.error("Company ID not found!");
        return;
      }

      // Prepare the contact data
      // Generate contact_id as companyId + phone
      const contact_id = companyId + "-" + formattedPhone.split("+")[1];

      // Prepare the contact data
      const chat_id = formattedPhone.split("+")[1] + "@c.us";
      const contactData: { [key: string]: any } = {
        contact_id, // <-- include the generated contact_id
        companyId,
        contactName: newContact.contactName,
        name: newContact.contactName,
        last_name: newContact.lastName,
        email: newContact.email,
        phone: formattedPhone,
        address1: newContact.address1,
        companyName: newContact.companyName,
        locationId: newContact.locationId,
        dateAdded: new Date().toISOString(),
        unreadCount: 0,

        branch: newContact.branch,
        expiryDate: newContact.expiryDate,
        vehicleNumber: newContact.vehicleNumber,
        ic: newContact.ic,
        chat_id: chat_id,
        notes: newContact.notes,
      };
      // Send POST request to your SQL backend
      const response = await axios.post(`${baseUrl}/api/contacts`, contactData);

      if (response.data.success) {
        toast.success("Contact added successfully!");
        setAddContactModal(false);
        setContacts((prevContacts) => [
          ...prevContacts,
          contactData as Contact,
        ]);
        setNewContact({
          contactName: "",
          lastName: "",
          email: "",
          phone: "",
          address1: "",
          companyName: "",
          locationId: "",

          branch: "",
          expiryDate: "",
          vehicleNumber: "",
          ic: "",
          notes: "",
        });

        await fetchContacts();
      } else {
        toast.error(response.data.message || "Failed to add contact");
      }
    } catch (error: any) {
      console.error("Error adding contact:", error);
      toast.error(
        "An error occurred while adding the contact: " +
        (error.response?.data?.message || error.message)
      );
    } finally {
      setLoading(false);
    }
  };
  const handleSaveNewTag = async () => {
    console.log("adding tag");
    try {
      // Get user email from localStorage or context
      const userEmail = localStorage.getItem("userEmail");
      if (!userEmail) {
        toast.error("User not authenticated");
        return;
      }

      // Fetch user/company info from your backend
      const userResponse = await fetch(
        `${baseUrl}/api/user-company-data?email=${encodeURIComponent(
          userEmail
        )}`,
        {
          method: "GET",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
        }
      );
      if (!userResponse.ok) {
        toast.error("Failed to fetch user/company info");
        return;
      }
      const userJson = await userResponse.json();
      console.log(userJson);
      const companyData = userJson.companyData;
      const companyId = userJson.userData.companyId;
      if (!companyId) {
        toast.error("Company ID not found");
        return;
      }

      // Add tag via your SQL backend
      const response = await fetch(
        `${baseUrl}/api/companies/${companyId}/tags`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ name: newTag }),
        }
      );

      if (!response.ok) {
        toast.error("Failed to add tag");
        return;
      }

      const data = await response.json();
      // Assume the backend returns the new tag as { id, name }
      setTagList([...tagList, { id: data.id, name: data.name }]);

      setShowAddTagModal(false);
      setNewTag("");
      toast.success("Tag added successfully!");
    } catch (error) {
      console.error("Error adding tag:", error);
      toast.error("An error occurred while adding the tag.");
    }
  };

  const handleConfirmDeleteTag = async (tag?: { id: string; name: string }) => {
    const tagToProcess = tag || tagToDelete;
    if (!tagToProcess) return;

    try {
      // Get user email from localStorage
      const userEmail = localStorage.getItem("userEmail");
      if (!userEmail) {
        toast.error("User not authenticated");
        return;
      }

      // Fetch user/company info from your backend
      const userResponse = await fetch(
        `${baseUrl}/api/user-company-data?email=${encodeURIComponent(
          userEmail
        )}`,
        {
          method: "GET",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
        }
      );
      if (!userResponse.ok) {
        toast.error("Failed to fetch user/company info");
        return;
      }
      const userJson = await userResponse.json();
      const companyId = userJson.userData.companyId;
      if (!companyId) {
        toast.error("Company ID not found");
        return;
      }

      // Delete the tag via SQL backend
      const response = await fetch(
        `${baseUrl}/api/companies/${companyId}/tags/${tagToProcess.id}`,
        {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
        }
      );

      if (!response.ok) {
        toast.error("Failed to delete tag");
        return;
      }

      // Update local state
      setTagList(tagList.filter((t) => t.id !== tagToProcess.id));
      setContacts(
        contacts.map((contact) => ({
          ...contact,
          tags: contact.tags
            ? contact.tags.filter((t) => t !== tagToProcess.name)
            : [],
        }))
      );

      setShowDeleteTagModal(false);
      setTagToDelete(null);
      toast.success("Tag deleted successfully!");
    } catch (error) {
      console.error("Error deleting tag:", error);
      toast.error("Failed to delete tag.");
    }
  };

  const handleBulkDeleteTags = async () => {
    try {
      const user = auth.currentUser;
      if (!user) {
        console.error("No authenticated user");
        return;
      }

      const docUserRef = doc(firestore, "user", user.email!);
      const docUserSnapshot = await getDoc(docUserRef);
      if (!docUserSnapshot.exists()) {
        console.error("No such document for user!");
        return;
      }
      const userData = docUserSnapshot.data();
      const companyId = userData.companyId;

      const batch = writeBatch(firestore);

      // Delete all tags from the tags collection
      for (const tag of tagList) {
        const tagRef = doc(firestore, `companies/${companyId}/tags`, tag.id);
        batch.delete(tagRef);
      }

      // Remove all tags from all contacts
      const contactsRef = collection(
        firestore,
        `companies/${companyId}/contacts`
      );
      const contactsSnapshot = await getDocs(contactsRef);

      contactsSnapshot.forEach((doc) => {
        const contactData = doc.data();
        if (contactData.tags && contactData.tags.length > 0) {
          batch.update(doc.ref, { tags: [] });
        }
      });

      await batch.commit();

      // Update local state
      setTagList([]);
      setContacts(
        contacts.map((contact) => ({
          ...contact,
          tags: [],
        }))
      );

      setShowDeleteTagModal(false);
      toast.success(`All ${tagList.length} tags deleted successfully!`);
    } catch (error) {
      console.error("Error deleting all tags:", error);
      toast.error("Failed to delete all tags.");
    }
  };

  const handleEyeClick = () => {
    setIsTabOpen(!isTabOpen);
  };

  const toggleContactSelection = (contact: Contact) => {
    const isSelected = selectedContacts.some((c) => c.id === contact.id);
    if (isSelected) {
      setSelectedContacts(selectedContacts.filter((c) => c.id !== contact.id));
    } else {
      setSelectedContacts([...selectedContacts, contact]);
    }
  };

  const isContactSelected = (contact: Contact) => {
    return selectedContacts.some((c) => c.id === contact.id);
  };

  const toggleSelectAll = () => {
    setSelectAll(!selectAll);
    if (!selectAll) {
      setSelectedContacts([...contacts]);
    } else {
      setSelectedContacts([]);
    }
  };
  const fetchTags = async (employeeList: string[]) => {
    setLoading(true);
    console.log("fetching tags");
    try {
      // Get user email from localStorage or context
      const userEmail = localStorage.getItem("userEmail");
      if (!userEmail) {
        setLoading(false);
        return;
      }

      // Fetch user/company info from your backend
      const userResponse = await fetch(
        `${baseUrl}/api/user-company-data?email=${encodeURIComponent(
          userEmail
        )}`,
        {
          method: "GET",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
        }
      );
      if (!userResponse.ok) {
        setLoading(false);
        return;
      }
      const userJson = await userResponse.json();
      console.log(userJson);
      const companyData = userJson.userData;
      const companyId = companyData.companyId;
      if (!companyId) {
        setLoading(false);
        return;
      }

      // Fetch tags from your SQL backend
      const tagsResponse = await fetch(
        `${baseUrl}/api/companies/${companyId}/tags`,
        {
          method: "GET",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
        }
      );
      if (!tagsResponse.ok) {
        setLoading(false);
        return;
      }
      const tags: Tag[] = await tagsResponse.json();

      // Filter out tags that match employee names (case-insensitive)
      const normalizedEmployeeNames = employeeList.map((name) =>
        name.toLowerCase()
      );
      const filteredTags = tags.filter(
        (tag: Tag) => !normalizedEmployeeNames.includes(tag.name.toLowerCase())
      );

      setTagList(filteredTags);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching tags:", error);
      setLoading(false);
    }
  };
  useEffect(() => {
    // Ensure employee names are properly stored when fetched
    const normalizedEmployeeNames = employeeList.map((employee) =>
      employee.name.toLowerCase()
    );
    setEmployeeNames(normalizedEmployeeNames);
  }, [employeeList]);
  const getCompanyData = async () => {
    const userDataStr = localStorage.getItem("userData");
    if (!userDataStr) {
      throw new Error("User not authenticated");
    }
    let parsedUserData: any;
    try {
      parsedUserData = JSON.parse(userDataStr);
    } catch {
      throw new Error("Invalid userData in localStorage");
    }
    const email = parsedUserData.email;
    if (!email) {
      throw new Error("User email not found");
    }

    const response = await fetch(`${baseUrl}/api/user-context?email=${email}`);
    if (!response.ok) throw new Error("Failed to fetch user context");
    const data = await response.json();

    setCompanyId(data.companyId);
    setCurrentUserRole(data.role);
    setEmployeeList(
      (data.employees || []).map((employee: any) => ({
        id: employee.id,
        name: employee.name,
        email: employee.email || employee.id,
        role: employee.role,
        employeeId: employee.employeeId,
        phoneNumber: employee.phoneNumber,
      }))
    );
    setPhoneNames(data.phoneNames);
    setPhoneOptions(Object.keys(data.phoneNames).map(Number));

    return {
      companyId: data.companyId,
      baseUrl: data.apiUrl || baseUrl,
      userData: parsedUserData,
      email,
      stopbot: data.stopBot || false,
      stopbots: data.stopBots || {},
    };
  };
  async function fetchCompanyData() {
    try {
      const { companyId, userData, email, stopbot, stopbots } =
        await getCompanyData();

      setShowAddUserButton(userData.role === "1");
      setUserRole(userData.role);
      setCompanyId(companyId);

      // Set stopbot state if available
      setStopbot(stopbot || false);

      // Fetch phone names data
      await fetchPhoneIndex(companyId);

      // Set employee data
      const employeeListData = (userData.employees || []).map(
        (employee: any) => ({
          id: employee.id,
          name: employee.name,
          email: employee.email || employee.id,
          role: employee.role,
          employeeId: employee.employeeId,
          phoneNumber: employee.phoneNumber,
        })
      );
      setEmployeeList(employeeListData);
      const employeeNames = employeeListData.map((employee: Employee) =>
        employee.name.trim().toLowerCase()
      );
      setEmployeeNames(employeeNames);

      await fetchTags(employeeListData.map((e: Employee) => e.name));

      setLoading(false);
    } catch (error) {
      console.error("Error fetching company data:", error);
      toast.error("Failed to fetch company data");
    }
  }

  const toggleBot = async () => {
    try {
      const user = auth.currentUser;
      if (!user) return;

      const docUserRef = doc(firestore, "user", user.email!);
      const docUserSnapshot = await getDoc(docUserRef);
      if (!docUserSnapshot.exists()) return;

      const userData = docUserSnapshot.data();
      const companyId = userData.companyId;

      const companyRef = doc(firestore, "companies", companyId);
      await updateDoc(companyRef, {
        stopbot: !stopbot,
      });
      setStopbot(!stopbot);
      toast.success(
        `Bot ${stopbot ? "activated" : "deactivated"} successfully!`
      );
    } catch (error) {
      console.error("Error toggling bot:", error);
      toast.error("Failed to toggle bot status.");
    }
  };
  const verifyContactIdExists = async (
    contactId: string,
    accessToken: string
  ) => {
    try {
      const user = auth.currentUser;
      const docUserRef = doc(firestore, "user", user?.email!);
      const docUserSnapshot = await getDoc(docUserRef);
      if (!docUserSnapshot.exists()) {
        return false;
      }
      const userData = docUserSnapshot.data();
      const companyId = userData.companyId;
      const docRef = doc(
        firestore,
        `companies/${companyId}/contacts`,
        contactId
      );
      const docSnapshot = await getDoc(docRef);
      if (!docSnapshot.exists()) {
        return false;
      }

      // If the contact exists, return true
      return true;
    } catch (error) {
      console.error("Error verifying contact ID:", error);
      return false;
    }
  };

  const handleAddTagToSelectedContacts = async (
    tagName: string,
    contact: Contact
  ) => {
    console.log("🏷️ [TAG ASSIGNMENT] Starting tag assignment:");
    console.log("🏷️ [TAG ASSIGNMENT] Tag name:", tagName);
    console.log("🏷️ [TAG ASSIGNMENT] Contact:", contact);
    console.log(
      "🏷️ [TAG ASSIGNMENT] Contact ID:",
      contact?.contact_id || contact?.id
    );
    console.log(
      "🏷️ [TAG ASSIGNMENT] Contact Name:",
      contact?.contactName || contact?.firstName
    );

    if (userRole === "3") {
      toast.error("You don't have permission to assign users to contacts.");
      return;
    }

    if (!contact || (!contact.contact_id && !contact.id)) {
      toast.error("No contact selected or contact ID missing");
      console.error("🏷️ [TAG ASSIGNMENT] Missing contact or contact ID");
      return;
    }

    try {
      // Get company and user data from your backend
      const userEmail = localStorage.getItem("userEmail");

      // Get user data from SQL
      const userResponse = await fetch(
        `${baseUrl}/api/user-data?email=${encodeURIComponent(userEmail || "")}`,
        {
          credentials: "include",
        }
      );

      if (!userResponse.ok) throw new Error("Failed to fetch user data");
      const userData = await userResponse.json();
      const companyId = userData.company_id;

      if (!companyId || (!contact.contact_id && !contact.id)) {
        toast.error("Missing company or contact ID");
        return;
      }

      const contactId = contact.contact_id || contact.id;

      // Check if this is the 'Stop Blast' tag
      if (tagName.toLowerCase() === "stop blast") {
        const contactChatId =
          contact.phone?.replace(/\D/g, "") + "@s.whatsapp.net";

        try {
          // Handle stop blast via API
          const response = await fetch(
            `${baseUrl}/api/contacts/${companyId}/${contactId}/stop-blast`,
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                contactChatId: contactChatId,
                userEmail: userEmail,
                reason: "Stop Blast tag added",
              }),
            }
          );

          if (response.ok) {
            const result = await response.json();
            if (result.deletedCount > 0) {
              toast.success(
                `Cancelled ${result.deletedCount} scheduled messages for this contact`
              );
            } else {
              toast.info("No scheduled messages found for this contact");
            }
          }
        } catch (error) {
          console.error("Error handling stop blast:", error);
          toast.error("Failed to cancel scheduled messages");
        }
      }

      // Check if the tag is an employee name using stable reference
      const stableEmployeeList = employeeListRef.current;
      const employee = stableEmployeeList.find((emp) => emp.name === tagName);
      console.log("🔍 Employee search for tag:", tagName, "found:", employee);
      console.log(
        "🔍 Available employees (stable):",
        stableEmployeeList.map((emp) => emp.name)
      );
      console.log("🔍 Stable employee list length:", stableEmployeeList.length);
      console.log("🔍 State employee list length:", employeeList.length);

      if (stableEmployeeList.length === 0) {
        console.warn(
          "🔍 Stable employee list is empty, may need to fetch employees"
        );
        toast.warning(
          "Employee list not loaded yet. Please try again in a moment."
        );
        return;
      }

      if (employee) {
        // Assign employee to contact (requires backend endpoint for assignment logic)
        const response = await fetch(
          `${baseUrl}/api/contacts/${companyId}/${contactId}/assign-employee`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              employeeId: employee.id,
              employeeName: employee.name,
            }),
          }
        );
        if (!response.ok) {
          const errorText = await response.text();
          console.error("Failed to assign employee:", errorText);
          toast.error(`Failed to assign ${tagName} to contact: ${errorText}`);
          return;
        }

        const assignmentResult = await response.json();
        console.log("✅ Employee assignment successful:", assignmentResult);

        // Update contact immediately with the new assignment
        // Remove any existing employee tags first, then add the new one
        const currentTags = contact.tags || [];
        const nonEmployeeTags = currentTags.filter(
          (tag) => !stableEmployeeList.some((emp) => emp.name === tag)
        );
        const updatedTags = [...nonEmployeeTags, tagName];
        console.log("🏷️ [EMPLOYEE ASSIGNMENT] Updated tags:", updatedTags);
        console.log("🏷️ [EMPLOYEE ASSIGNMENT] Previous tags:", currentTags);

        const updateContactsList: (prevContacts: Contact[]) => Contact[] = (
          prevContacts
        ) =>
          prevContacts.map((c) =>
            c.id === contact.id || c.contact_id === contact.contact_id
              ? { ...c, tags: updatedTags, assignedTo: tagName }
              : c
          );

        setContacts(updateContactsList);
        setFilteredContacts((prevFilteredContacts) =>
          updateContactsList(prevFilteredContacts)
        );

        // Update selectedContact if it's the same contact
        if (
          selectedContact &&
          (selectedContact.id === contact.id ||
            selectedContact.contact_id === contact.contact_id)
        ) {
          setSelectedContact((prevContact: Contact) => ({
            ...prevContact,
            tags: updatedTags,
            assignedTo: tagName,
          }));
        }

        // Update localStorage immediately
        const updatedContacts = updateContactsList(contacts);
        localStorage.setItem(
          "contacts",
          LZString.compress(JSON.stringify(updatedContacts))
        );

        toast.success(`Contact assigned to ${tagName}`);
        return;
      }

      console.log(
        "Adding tag",
        tagName,
        "to contact",
        contactId,
        "in company",
        companyId
      );

      // Handle non-employee tags (add tag to contact)
      const hasTag = contact.tags?.includes(tagName) || false;
      if (!hasTag) {
        console.log(
          "Adding tag",
          tagName,
          "to contact",
          contactId,
          "in company",
          companyId
        );
        const response = await fetch(
          `${baseUrl}/api/contacts/${companyId}/${contactId}/tags`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ tags: [tagName] }),
          }
        );
        if (!response.ok) {
          const errorText = await response.text();
          console.error("Failed to add tag to contact:", errorText);
          toast.error("Failed to add tag to contact");
          return;
        }
        const data = await response.json();

        // Calculate the updated tags by adding the new tag to existing tags
        const currentTags = contact.tags || [];
        const newTags = currentTags.includes(tagName)
          ? currentTags
          : [...currentTags, tagName];

        // Update both contacts and filteredContacts states immediately
        const updateContactsList = (prevContacts: Contact[]) =>
          prevContacts.map((c) =>
            c.id === contact.id || c.contact_id === contact.contact_id
              ? { ...c, tags: newTags }
              : c
          );

        setContacts(updateContactsList);
        setFilteredContacts((prevFilteredContacts) =>
          updateContactsList(prevFilteredContacts)
        );

        // Update selectedContact if it's the same contact
        if (
          selectedContact &&
          (selectedContact.id === contact.id ||
            selectedContact.contact_id === contact.contact_id)
        ) {
          setSelectedContact((prevContact: Contact) => ({
            ...prevContact,
            tags: newTags,
          }));
        }

        console.log(
          "�� [TAG] Added tag to contact:",
          contact.contactName,
          "tag:",
          tagName,
          "new tags:",
          newTags
        );
        toast.success(`Tag "${tagName}" added to contact`);
      } else {
        toast.info(`Tag "${tagName}" already exists for this contact`);
      }
    } catch (error) {
      console.error("Error adding tag to contact:", error);
      toast.error("Failed to add tag to contact");
    }
  };
  const handleRemoveTagsFromSelectedContacts = async (tagName: string) => {
    if (selectedContacts.length === 0) {
      toast.info("Please select contacts first");
      return;
    }

    try {
      const userEmail = localStorage.getItem("userEmail");
      const userResponse = await fetch(
        `${baseUrl}/api/user-data?email=${encodeURIComponent(userEmail || "")}`,
        { credentials: "include" }
      );

      if (!userResponse.ok) throw new Error("Failed to fetch user data");
      const userData = await userResponse.json();
      const companyId = userData.company_id;

      // Remove tag from all selected contacts
      for (const contact of selectedContacts) {
        const contactId = contact.contact_id || contact.id;
        if (!contactId) continue;

        const response = await fetch(
          `${baseUrl}/api/contacts/${companyId}/${contactId}/tags`,
          {
            method: "DELETE",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ tags: [tagName] }),
          }
        );

        if (response.ok) {
          // Update local state
          const updatedTags = (contact.tags || []).filter(
            (tag) => tag !== tagName
          );

          setContacts((prev) =>
            prev.map((c) =>
              c.id === contact.id || c.contact_id === contact.contact_id
                ? { ...c, tags: updatedTags }
                : c
            )
          );

          setFilteredContacts((prev) =>
            prev.map((c) =>
              c.id === contact.id || c.contact_id === contact.contact_id
                ? { ...c, tags: updatedTags }
                : c
            )
          );
        }
      }

      toast.success(
        `Removed tag "${tagName}" from ${selectedContacts.length} contact(s)`
      );
      setSelectedContacts([]); // Clear selection
    } catch (error) {
      console.error("Error removing tags:", error);
      toast.error("Failed to remove tags from contacts");
    }
  };
  const sendAssignmentNotification = async (
    assignedEmployeeName: string,
    contact: Contact
  ) => {
    try {
      const user = auth.currentUser;
      if (!user) {
        console.error("No authenticated user");
        return;
      }

      const docUserRef = doc(firestore, "user", user.email!);
      const docUserSnapshot = await getDoc(docUserRef);
      if (!docUserSnapshot.exists()) {
        console.error("No user document found");
        return;
      }

      const userData = docUserSnapshot.data();
      const companyId = userData.companyId;

      if (!companyId || typeof companyId !== "string") {
        console.error("Invalid companyId:", companyId);
        throw new Error("Invalid companyId");
      }

      // Check if notification has already been sent
      const notificationRef = doc(
        firestore,
        "companies",
        companyId,
        "assignmentNotifications",
        `${contact.id}_${assignedEmployeeName}`
      );
      const notificationSnapshot = await getDoc(notificationRef);

      if (notificationSnapshot.exists()) {
        return;
      }

      // Find the employee in the employee list
      const assignedEmployee = employeeList.find(
        (emp) => emp.name.toLowerCase() === assignedEmployeeName.toLowerCase()
      );
      if (!assignedEmployee) {
        console.error(`Employee not found: ${assignedEmployeeName}`);
        toast.error(
          `Failed to send assignment notification: Employee ${assignedEmployeeName} not found`
        );
        return;
      }

      if (!assignedEmployee.phoneNumber) {
        console.error(
          `Phone number missing for employee: ${assignedEmployeeName}`
        );
        toast.error(
          `Failed to send assignment notification: Phone number missing for ${assignedEmployeeName}`
        );
        return;
      }

      // Format the phone number for WhatsApp chat_id
      const employeePhone = `${assignedEmployee.phoneNumber.replace(
        /[^\d]/g,
        ""
      )}@c.us`;

      if (!employeePhone || !/^\d+@c\.us$/.test(employeePhone)) {
        console.error("Invalid employeePhone:", employeePhone);
        throw new Error("Invalid employeePhone");
      }

      const docRef = doc(firestore, "companies", companyId);
      const docSnapshot = await getDoc(docRef);
      if (!docSnapshot.exists()) {
        console.error("No company document found");
        return;
      }
      const companyData = docSnapshot.data();
      const baseUrl = companyData.apiUrl || "https://bisnesgpt.jutateknologi.com";
      let message = `Hello ${assignedEmployee.name
        }, a new contact has been assigned to you:\n\nName: ${contact.contactName || contact.firstName || "N/A"
        }\nPhone: ${contact.phone
        }\n\nPlease follow up with them as soon as possible.`;
      if (companyId == "042") {
        message = `Hi ${assignedEmployee.employeeId || assignedEmployee.phoneNumber
          } ${assignedEmployee.name
          }.\n\nAnda telah diberi satu prospek baharu\n\nSila masuk ke https://web.jutasoftware.co/login untuk melihat perbualan di antara Zahin Travel dan prospek.\n\nTerima kasih.\n\nIkhlas,\nZahin Travel Sdn. Bhd. (1276808-W)\nNo. Lesen Pelancongan: KPK/LN 9159\nNo. MATTA: MA6018\n\n#zahintravel - Nikmati setiap detik..\n#diyakini\n#responsif\n#budibahasa`;
      }
      let phoneIndex;
      if (userData?.phone !== undefined) {
        if (userData.phone === 0) {
          // Handle case for phone index 0
          phoneIndex = 0;
        } else if (userData.phone === -1) {
          // Handle case for phone index -1
          phoneIndex = 0;
        } else {
          // Handle other cases

          phoneIndex = userData.phone;
        }
      } else {
        console.error("User phone is not defined");
        phoneIndex = 0; // Default value if phone is not defined
      }
      let url;
      let requestBody;
      if (companyData.v2 === true) {
        url = `${baseUrl}/api/v2/messages/text/${companyId}/${employeePhone}`;
        requestBody = { message, phoneIndex };
      } else {
        url = `${baseUrl}/api/messages/text/${employeePhone}/${companyData.whapiToken}`;
        requestBody = { message, phoneIndex };
      }

      // Send WhatsApp message to the employee
      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Error response:", response.status, errorText);
        throw new Error(
          `HTTP error! status: ${response.status}, message: ${errorText}`
        );
      }

      const responseData = await response.json();

      // Mark notification as sent
      await setDoc(notificationRef, {
        sentAt: serverTimestamp(),
        employeeName: assignedEmployeeName,
        contactId: contact.id,
      });

      toast.success("Assignment notification sent successfully!");
    } catch (error) {
      console.error("Error sending assignment notification:", error);

      // Instead of throwing the error, we'll handle it here
      if (error instanceof TypeError && error.message === "Failed to fetch") {
        toast.error(
          "Network error. Please check your connection and try again."
        );
      } else {
        toast.error(
          "Failed to send assignment notification. Please try again."
        );
      }

      // Log additional information that might be helpful
    }
  };

  const handleSyncConfirmation = () => {
    if (!isSyncing) {
      setShowSyncConfirmationModal(true);
    }
  };

  const handleSyncNamesConfirmation = () => {
    if (!isSyncing) {
      setShowSyncNamesConfirmationModal(true);
    }
  };

  const handleConfirmSync = async () => {
    setShowSyncConfirmationModal(false);
    await handleSyncContact();
  };

  const handleConfirmSyncNames = async () => {
    setShowSyncNamesConfirmationModal(false);
    await handleSyncContactNames();
  };

  const handleSyncContactNames = async () => {
    try {
      setFetching(true);

      const userEmail = localStorage.getItem("userEmail");
      if (!userEmail) {
        setFetching(false);
        toast.error("No user email found");
        return;
      }

      // Get user config to get companyId
      const userResponse = await fetch(
        `${baseUrl}/api/user/config?email=${encodeURIComponent(userEmail)}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          credentials: "include",
        }
      );

      if (!userResponse.ok) {
        setFetching(false);
        toast.error("Failed to fetch user config");
        return;
      }

      const userData = await userResponse.json();
      const companyId = userData.company_id;
      setCompanyId(companyId);

      // Get company data
      const companyResponse = await fetch(
        `${baseUrl}/api/companies/${companyId}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          credentials: "include",
        }
      );

      if (!companyResponse.ok) {
        setFetching(false);
        toast.error("Failed to fetch company data");
        return;
      }

      const companyData = await companyResponse.json();

      // Call the sync contact names endpoint
      const syncResponse = await fetch(
        `${baseUrl}/api/sync-contact-names/${companyId}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          credentials: "include",
        }
      );

      if (!syncResponse.ok) {
        const errorData = await syncResponse.json();
        throw new Error(
          errorData.error || "Failed to start contact names synchronization"
        );
      }

      const responseData = await syncResponse.json();
      if (responseData.success) {
        toast.success("Contact names synchronization started successfully");
      } else {
        throw new Error(
          responseData.error || "Failed to start contact names synchronization"
        );
      }
    } catch (error) {
      console.error("Error syncing contact names:", error);
      toast.error(
        "An error occurred while syncing contact names: " +
        (error instanceof Error ? error.message : String(error))
      );
    } finally {
      setFetching(false);
    }
  };

  const handleSyncContact = async () => {
    try {
      console.log("test");
      setFetching(true);

      const userEmail = localStorage.getItem("userEmail");
      if (!userEmail) {
        setFetching(false);
        toast.error("No user email found");
        return;
      }

      // Get user config to get companyId
      const userResponse = await fetch(
        `${baseUrl}/api/user/config?email=${encodeURIComponent(userEmail)}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          credentials: "include",
        }
      );

      if (!userResponse.ok) {
        setFetching(false);
        toast.error("Failed to fetch user config");
        return;
      }

      const userData = await userResponse.json();
      const companyId = userData.company_id;
      setCompanyId(companyId);

      // Get company data
      const companyResponse = await fetch(
        `${baseUrl}/api/companies/${companyId}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          credentials: "include",
        }
      );

      if (!companyResponse.ok) {
        setFetching(false);
        toast.error("Failed to fetch company data");
        return;
      }

      const companyData = await companyResponse.json();

      // Call the sync contacts endpoint
      const syncResponse = await fetch(
        `${baseUrl}/api/sync-contacts/${companyId}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          credentials: "include",
        }
      );

      if (!syncResponse.ok) {
        const errorData = await syncResponse.json();
        throw new Error(
          errorData.error || "Failed to start contact synchronization"
        );
      }

      const responseData = await syncResponse.json();
      if (responseData.success) {
        toast.success("Contact synchronization started successfully");
      } else {
        throw new Error(
          responseData.error || "Failed to start contact synchronization"
        );
      }
    } catch (error) {
      console.error("Error syncing contacts:", error);
      toast.error(
        "An error occurred while syncing contacts: " +
        (error instanceof Error ? error.message : String(error))
      );
    } finally {
      setFetching(false);
    }
  };

  const handleRemoveTag = async (contactId: string, tagName: string) => {
    console.log("🗑️ [TAG REMOVAL] Starting tag removal:");
    console.log("🗑️ [TAG REMOVAL] Tag name:", tagName);
    console.log("🗑️ [TAG REMOVAL] Contact ID:", contactId);

    if (userRole === "3") {
      toast.error("You don't have permission to perform this action.");
      return;
    }

    try {
      // Get company and user data from your backend
      const userEmail = localStorage.getItem("userEmail");

      // Get user data from SQL
      const userResponse = await fetch(
        `${baseUrl}/api/user-data?email=${encodeURIComponent(userEmail || "")}`,
        {
          credentials: "include",
        }
      );

      if (!userResponse.ok) throw new Error("Failed to fetch user data");
      const userData = await userResponse.json();
      const companyId = userData.company_id;

      if (!companyId || !contactId) {
        toast.error("Missing company or contact ID");
        return;
      }

      console.log(
        "🗑️ [TAG REMOVAL] Removing tag",
        tagName,
        "from contact",
        contactId,
        "in company",
        companyId
      );

      // Remove tag from contact via API
      const response = await fetch(
        `${baseUrl}/api/contacts/${companyId}/${contactId}/tags`,
        {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ tags: [tagName] }),
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Failed to remove tag from contact:", errorText);
        toast.error("Failed to remove tag from contact");
        return;
      }

      const data = await response.json();

      // Calculate the updated tags by removing the specified tag from existing tags
      const currentContact = contacts.find(
        (c) => c.id === contactId || c.contact_id === contactId
      );
      const currentTags = currentContact?.tags || [];
      const updatedTags = currentTags.filter((tag) => tag !== tagName);

      // Update both contacts and filteredContacts states immediately
      const updateContactsList = (prevContacts: Contact[]) =>
        prevContacts.map((contact) =>
          contact.id === contactId || contact.contact_id === contactId
            ? { ...contact, tags: updatedTags }
            : contact
        );

      setContacts(updateContactsList);
      setFilteredContacts((prevFilteredContacts) =>
        updateContactsList(prevFilteredContacts)
      );

      // Update selectedContact if it's the same contact
      if (
        selectedContact &&
        (selectedContact.id === contactId ||
          selectedContact.contact_id === contactId)
      ) {
        setSelectedContact((prevContact: Contact) => ({
          ...prevContact,
          tags: updatedTags,
        }));
      }

      // Update currentContact if it's the same contact
      if (
        currentContact &&
        (currentContact.id === contactId ||
          currentContact.contact_id === contactId)
      ) {
        setCurrentContact((prevContact) =>
          prevContact ? { ...prevContact, tags: updatedTags } : prevContact
        );
      }

      console.log(
        "🗑️ [TAG REMOVAL] Tag removed from contact:",
        contactId,
        "tag:",
        tagName,
        "remaining tags:",
        updatedTags
      );
      toast.success(`Tag "${tagName}" removed successfully!`);
    } catch (error) {
      console.error("Error removing tag:", error);
      toast.error("Failed to remove tag.");
    }
  };

  async function updateContactTags(
    contactId: string,
    accessToken: string,
    tags: string[],
    tagName: string
  ) {
    try {
      const user = auth.currentUser;
      const docUserRef = doc(firestore, "user", user?.email!);
      const docUserSnapshot = await getDoc(docUserRef);
      if (!docUserSnapshot.exists()) {
        return;
      }
      const userData = docUserSnapshot.data();
      const companyId = userData.companyId;
      const docRef = doc(firestore, "companies", companyId);
      const docSnapshot = await getDoc(docRef);
      if (!docSnapshot.exists()) {
        return;
      }
      const companyData = docSnapshot.data();

      await updateDoc(
        doc(firestore, "companies", companyId, "contacts", contactId),
        {
          tags: arrayRemove(tagName),
        }
      );

      // Update state
      setContacts((prevContacts) =>
        prevContacts.map((contact) =>
          contact.id === contactId
            ? {
              ...contact,
              tags: contact.tags!.filter((tag) => tag !== tagName),
            }
            : contact
        )
      );

      const updatedContacts = contacts.map((contact: Contact) =>
        contact.id === contactId
          ? {
            ...contact,
            tags: contact.tags!.filter((tag: string) => tag !== tagName),
          }
          : contact
      );

      const updatedSelectedContact = updatedContacts.find(
        (contact) => contact.id === contactId
      );
      if (updatedSelectedContact) {
        setSelectedContacts((prevSelectedContacts) =>
          prevSelectedContacts.map((contact) =>
            contact.id === contactId
              ? {
                ...contact,
                tags: contact.tags!.filter((tag) => tag !== tagName),
              }
              : contact
          )
        );
      }

      localStorage.setItem(
        "contacts",
        LZString.compress(JSON.stringify(updatedContacts))
      );
      sessionStorage.setItem("contactsFetched", "true");

      toast.success("Tag removed successfully!");
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error(
          "Error updating contact tags:",
          error.response?.data || error.message
        );
      } else {
        console.error("Unexpected error updating contact tags:", error);
      }
      return false;
    }
  }

  const navigate = useNavigate(); // Initialize useNavigate
  const handleClick = (phone: any) => {
    const tempphone = phone.split("+")[1];
    const chatId = tempphone + "@c.us";
    navigate(`/chat/?chatId=${chatId}`);
  };
  async function searchContacts(accessToken: string, locationId: string) {
    setLoading(true);
    setFetching(true);
    setProgress(0);
    try {
      let allContacts: any[] = [];
      let fetchMore = true;
      let nextPageUrl = `https://services.leadconnectorhq.com/contacts/?locationId=${locationId}&limit=100`;

      const maxRetries = 5;
      const baseDelay = 5000;

      const fetchData = async (
        url: string,
        retries: number = 0
      ): Promise<any> => {
        const options = {
          method: "GET",
          url: url,
          headers: {
            Authorization: `Bearer ${accessToken}`,
            Version: "2021-07-28",
          },
        };
        try {
          const response = await axios.request(options);

          return response;
        } catch (error: any) {
          if (
            error.response &&
            error.response.status === 429 &&
            retries < maxRetries
          ) {
            const delay = baseDelay * Math.pow(2, retries);
            console.warn(`Rate limit hit, retrying in ${delay}ms...`);
            await new Promise((resolve) => setTimeout(resolve, delay));
            return fetchData(url, retries + 1);
          } else {
            throw error;
          }
        }
      };

      let fetchedContacts = 0;
      let totalContacts = 0;
      while (fetchMore) {
        const response = await fetchData(nextPageUrl);
        const contacts = response.data.contacts;
        totalContacts = response.data.meta.total;

        if (contacts.length > 0) {
          allContacts = [...allContacts, ...contacts];
          if (role === 2) {
            const filteredContacts = allContacts.filter((contact) =>
              contact.tags.some(
                (tag: string) =>
                  typeof tag === "string" &&
                  tag.toLowerCase().includes(userName.toLowerCase())
              )
            );
            setContacts([...filteredContacts]);
          } else {
            setContacts([...allContacts]);
          }

          fetchedContacts = allContacts.length;
          setTotal(totalContacts);
          setFetched(fetchedContacts);
          setProgress((fetchedContacts / totalContacts) * 100);
          setLoading(false);
        }

        if (response.data.meta.nextPageUrl) {
          nextPageUrl = response.data.meta.nextPageUrl;
        } else {
          fetchMore = false;
        }
      }
    } catch (error) {
      console.error("Error searching contacts:", error);
    } finally {
      setFetching(false);
    }
  }
  const handleEditContact = (contact: Contact) => {
    setCurrentContact(contact);
    setEditContactModal(true);
  };

  const handleViewContact = (contact: Contact) => {
    setCurrentContact(contact);
    setViewContactModal(true);
  };

  const handleDeleteContact = async () => {
    if (userRole === "3") {
      toast.error("You don't have permission to perform this action.");
      return;
    }
    if (!currentContact) {
      toast.error("No contact selected for deletion.");
      return;
    }

    // Set loading state and show initial notification
    setLoading(true);
    toast.info("Starting to delete contact. This may take some time...");

    // Optimistic UI update - remove contact immediately for better UX
    setContacts((prevContacts) =>
      prevContacts.filter(
        (contact) => contact.contact_id !== currentContact.contact_id
      )
    );

    try {
      // Get user data and company info from your NeonDB backend
      const userEmail = localStorage.getItem("userEmail");
      if (!userEmail) {
        console.error("No user email found");
        setLoading(false);
        return;
      }

      // Get user and company data from NeonDB backend
      const userCompanyResponse = await fetch(
        `${baseUrl}/api/user-company-data?email=${encodeURIComponent(
          userEmail
        )}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
        }
      );

      if (!userCompanyResponse.ok) {
        console.error("Failed to get user company data");
        setLoading(false);
        return;
      }

      const { userData, companyData } = await userCompanyResponse.json();
      const companyId = userData.companyId;

      // Prepare contact ID for deletion
      const contact_id = currentContact.contact_id;

      if (!contact_id) {
        toast.error("No valid contact ID found for deletion.");
        setLoading(false);
        return;
      }

      const response = await fetch(
        `${baseUrl}/api/contacts/${contact_id}?companyId=${companyId}`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
        }
      );

      if (response.ok) {
        // Update local state
        setContacts((prevContacts) =>
          prevContacts.filter((contact) => contact.contact_id !== contact_id)
        );
        setDeleteConfirmationModal(false);
        setCurrentContact(null);

        // Refresh lists
        await fetchScheduledMessages();

        toast.success("Contact deleted successfully from the database!");

        await fetchContacts();
      } else {
        const errorData = await response.json().catch(() => ({}));
        console.error("Delete failed:", errorData);

        // Check if this is a constraint error that can be resolved with force delete
        const canForceDelete =
          errorData.message &&
          (errorData.message.includes("active assignments") ||
            errorData.message.includes("associated messages") ||
            errorData.message.includes("Use /api/contacts/{contactId}/force"));

        if (canForceDelete) {
          // Offer to force delete with cascade
          if (
            window.confirm(
              "This contact has database dependencies. Would you like to force delete it and remove all related data? This is irreversible."
            )
          ) {
            try {
              const forceDeleteResponse = await fetch(
                `${baseUrl}/api/contacts/${contact_id}/force?companyId=${companyId}`,
                {
                  method: "DELETE",
                  headers: {
                    "Content-Type": "application/json",
                  },
                  credentials: "include",
                }
              );

              if (forceDeleteResponse.ok) {
                toast.success("Contact force deleted successfully!");

                // Update local state
                setContacts((prevContacts) =>
                  prevContacts.filter(
                    (contact) => contact.contact_id !== contact_id
                  )
                );
                setScheduledMessages((prev) =>
                  prev.filter((msg) => !msg.chatIds.includes(contact_id))
                );
                setDeleteConfirmationModal(false);
                setCurrentContact(null);

                await fetchContacts();
                await fetchScheduledMessages();
                return;
              } else {
                const forceErrorData = await forceDeleteResponse.json();
                toast.error(
                  `Force delete failed: ${forceErrorData.message || "Unknown error"
                  }`
                );
              }
            } catch (forceError) {
              console.error("Force delete error:", forceError);
              toast.error("Force delete failed");
            }
          }
        } else if (response.status === 409) {
          // Handle conflict status - contact has dependencies
          toast.error(
            "Cannot delete contact: Contact has associated data. Please remove dependencies first."
          );
        } else {
          toast.error("Failed to delete contact from database.");
        }
        console.error("Delete failed:", errorData);
        // Refresh to get accurate data
        fetchContacts();
      }
    } catch (error) {
      console.error("Error deleting contact:", error);
      toast.error(
        "An error occurred while deleting the contact and associated data."
      );
      // Refresh to get accurate data
      fetchContacts();
    } finally {
      // Always reset loading state
      setLoading(false);
    }
  };

  const handleMassDelete = async () => {
    if (userRole === "3") {
      toast.error("You don't have permission to perform this action.");
      return;
    }
    if (selectedContacts.length === 0) {
      toast.error("No contacts selected for deletion.");
      return;
    }

    // Set loading state and show initial notification
    setIsMassDeleting(true);
    toast.info(
      `Starting to delete ${selectedContacts.length} contacts. This may take some time...`
    );

    // Optimistic UI update - remove contacts immediately for better UX
    setContacts((prevContacts) =>
      prevContacts.filter(
        (contact) =>
          !selectedContacts.some((selected) => selected.id === contact.id)
      )
    );

    try {
      // Get user data and company info from your NeonDB backend
      const userEmail = localStorage.getItem("userEmail"); // Assuming you store user email in localStorage
      if (!userEmail) {
        console.error("No user email found");
        setIsMassDeleting(false);
        return;
      }

      // Get user and company data from NeonDB backend
      const userCompanyResponse = await fetch(
        `${baseUrl}/api/user-company-data?email=${encodeURIComponent(
          userEmail
        )}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
        }
      );

      if (!userCompanyResponse.ok) {
        console.error("Failed to get user company data");
        setIsMassDeleting(false);
        return;
      }

      const { userData, companyData } = await userCompanyResponse.json();
      const companyId = userData.companyId;

      // Prepare contact IDs for mass deletion
      const contactIds = selectedContacts
        .map((contact) => contact.contact_id)
        .filter(Boolean);

      if (contactIds.length === 0) {
        toast.error("No valid contact IDs found for deletion.");
        setIsMassDeleting(false);
        return;
      }

      // Perform mass deletion using the new backend endpoint
      const massDeleteResponse = await fetch(
        `${baseUrl}/api/contacts/mass-delete`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({
            contactIds: contactIds,
            companyId: companyId,
          }),
        }
      );

      const deleteResult = await massDeleteResponse.json();

      if (massDeleteResponse.ok) {
        // Update local state
        setContacts((prevContacts) =>
          prevContacts.filter(
            (contact) =>
              !selectedContacts.some((selected) => selected.id === contact.id)
          )
        );
        setSelectedContacts([]);
        setShowMassDeleteModal(false);

        // Refresh lists
        await fetchScheduledMessages();

        toast.success(
          `${deleteResult.deletedCount} contacts deleted successfully from the database!`
        );

        if (deleteResult.failures && deleteResult.failures.length > 0) {
          toast.warn(
            `${deleteResult.failures.length} contacts could not be deleted. Check console for details.`
          );
          console.warn("Failed deletions:", deleteResult.failures);
        }

        await fetchContacts();
      } else {
        toast.error(
          deleteResult.message || "Failed to delete contacts from database."
        );
        console.error("Mass delete failed:", deleteResult);
        // Refresh to get accurate data
        fetchContacts();
      }
    } catch (error) {
      console.error("Error deleting contacts:", error);
      toast.error(
        "An error occurred while deleting the contacts and associated data."
      );
      // Refresh to get accurate data
      fetchContacts();
    } finally {
      // Always reset loading state
      setIsMassDeleting(false);
      setLoading(false);
    }
  };

  const handleSaveContact = async () => {
    if (currentContact) {
      try {
        // Get user/company info from localStorage or your app state
        const userEmail = localStorage.getItem("userEmail");
        if (!userEmail) {
          toast.error("No user email found");
          return;
        }

        // Fetch user config to get companyId
        const userResponse = await fetch(
          `${baseUrl}/api/user/config?email=${encodeURIComponent(userEmail)}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Accept: "application/json",
            },
            credentials: "include",
          }
        );

        if (!userResponse.ok) {
          toast.error("Failed to fetch user config");
          return;
        }

        const userData = await userResponse.json();
        const companyId = userData?.company_id;
        if (!companyId) {
          toast.error("Company ID not found!");
          return;
        }

        // Generate contact_id as companyId + phone
        const formattedPhone = formatPhoneNumber(currentContact.phone || "");
        const contact_id = currentContact.contact_id;

        // Create an object with all fields, including custom fields
        const updateData: { [key: string]: any } = {
          contact_id,
          companyId,
        };

        const fieldsToUpdate = [
          "name",
          "email",
          "last_name",
          "phone",
          "address1",
          "city",
          "state",
          "postalCode",
          "website",
          "dnd",
          "dndSettings",
          "tags",
          "source",
          "country",
          "companyName",
          "branch",
          "expiryDate",
          "vehicleNumber",

          "IC",
          "assistantId",
          "threadid",
          "notes", // Add this line
        ];

        fieldsToUpdate.forEach((field) => {
          if (
            currentContact[field as keyof Contact] !== undefined &&
            currentContact[field as keyof Contact] !== null
          ) {
            updateData[field] = currentContact[field as keyof Contact];
          }
        });

        // Ensure customFields are included in the update if they exist
        if (
          currentContact.customFields &&
          Object.keys(currentContact.customFields).length > 0
        ) {
          updateData.customFields = currentContact.customFields;
        }
        console.log(updateData);
        // Send PUT request to your SQL backend
        // (Assume your backend expects /api/contacts/:contact_id for update)
        const response = await axios.put(
          `${baseUrl}/api/contacts/${contact_id}`,
          updateData
        );

        if (response.data.success) {
          // Update local state immediately after saving
          setContacts((prevContacts) =>
            prevContacts.map((contact) =>
              contact.contact_id === contact_id
                ? { ...contact, ...updateData }
                : contact
            )
          );

          setEditContactModal(false);
          setCurrentContact(null);
          setLoading(false);
          await fetchContacts();
          toast.success("Contact updated successfully!");
        } else {
          toast.error(response.data.message || "Failed to update contact.");
        }
      } catch (error) {
        console.error("Error saving contact:", error);
        toast.error("Failed to update contact.");
      }
    }
  };
  // Function to add a new custom field to all contacts
  const addCustomFieldToAllContacts = async (fieldName: string) => {
    try {
      const user = auth.currentUser;
      if (!user) return;

      const docUserRef = doc(firestore, "user", user.email!);
      const docUserSnapshot = await getDoc(docUserRef);
      if (!docUserSnapshot.exists()) {
        return;
      }
      const userData = docUserSnapshot.data();
      const companyId = userData.companyId;

      const contactsCollectionRef = collection(
        firestore,
        `companies/${companyId}/contacts`
      );
      const contactsSnapshot = await getDocs(contactsCollectionRef);

      const batch = writeBatch(firestore);

      contactsSnapshot.forEach((doc) => {
        const contactRef = doc.ref;
        batch.update(contactRef, {
          [`customFields.${fieldName}`]: "",
        });
      });

      await batch.commit();

      // Update local state
      setContacts((prevContacts) =>
        prevContacts.map((contact) => ({
          ...contact,
          customFields: {
            ...contact.customFields,
            [fieldName]: "",
          },
        }))
      );

      toast.success(`New custom field "${fieldName}" added to all contacts.`);
    } catch (error) {
      console.error("Error adding custom field to all contacts:", error);
      toast.error("Failed to add custom field to all contacts.");
    }
  };
  // Add this function to combine similar scheduled messages
  // Add this function to combine similar scheduled messages
  const combineScheduledMessages = (
    messages: ScheduledMessage[]
  ): ScheduledMessage[] => {
    const combinedMessages: { [key: string]: ScheduledMessage } = {};

    messages.forEach((message) => {
      // Since scheduledTime is now always a string
      const scheduledTime = new Date(message.scheduledTime).getTime();

      const key = `${message.messageContent}-${scheduledTime}`;
      if (combinedMessages[key]) {
        combinedMessages[key].count = (combinedMessages[key].count || 1) + 1;
      } else {
        combinedMessages[key] = { ...message, count: 1 };
      }
    });

    console.log("combinedMessages", combinedMessages);

    // Convert the object to an array and sort it
    return Object.values(combinedMessages).sort((a, b) => {
      const timeA = new Date(a.scheduledTime).getTime();
      const timeB = new Date(b.scheduledTime).getTime();
      return timeA - timeB;
    });
  };

  useEffect(() => {
    fetchCompanyData();
  }, []);

  // Add a user filter change handler
  const handleUserFilterChange = (userName: string) => {
    setSelectedUserFilters((prev) =>
      prev.includes(userName)
        ? prev.filter((user) => user !== userName)
        : [...prev, userName]
    );
  };

  const clearAllFilters = () => {
    setSelectedTagFilters([]);
    setSelectedUserFilters([]);
    setExcludedTagFilters([]);
    setExcludedUserFilters([]);
    setActiveDateFilter(null);
  };

  const applyDateFilter = () => {
    if (dateFilterStart || dateFilterEnd) {
      // Validate dates
      let isValid = true;
      let errorMessage = "";

      if (dateFilterStart && dateFilterEnd) {
        const startDate = new Date(dateFilterStart);
        startDate.setHours(0, 0, 0, 0);

        const endDate = new Date(dateFilterEnd);
        endDate.setHours(23, 59, 59, 999);

        if (startDate > endDate) {
          isValid = false;
          errorMessage = "Start date cannot be after end date";
        }
      }

      if (isValid) {
        const filterData = {
          field: "createdAt", // Always use createdAt field
          start: dateFilterStart,
          end: dateFilterEnd,
        };

        // Log the filter being applied for debugging
        console.log("Applying date filter:", filterData);

        // Set the filter and also sort by date
        setActiveDateFilter(filterData);
        setSortField("createdAt");
        setSortDirection("desc"); // Most recent first
        setShowDateFilterModal(false);

        // Format message for user feedback
        let message = `Filtering and sorting contacts by creation date`;
        if (dateFilterStart) {
          message += ` from ${new Date(dateFilterStart).toLocaleDateString()}`;
        }
        if (dateFilterEnd) {
          message += ` to ${new Date(dateFilterEnd).toLocaleDateString()}`;
        }

        toast.success(message);
      } else {
        toast.error(errorMessage);
      }
    } else {
      toast.error("Please select at least one date for filtering");
    }
  };

  const clearDateFilter = () => {
    setActiveDateFilter(null);
    setDateFilterStart("");
    setDateFilterEnd("");
    // Also clear the sorting if it was set by the date filter
    if (sortField === "createdAt") {
      setSortField(null);
      setSortDirection("asc");
    }
  };

  const filteredContactsSearch = useMemo(() => {
    // Log the active date filter for debugging
    if (activeDateFilter) {
      console.log("Active date filter:", activeDateFilter);
    }

    const searchTerm = searchQuery.toLowerCase();
    const selTags = selectedTagFilters.map(t => t.toLowerCase());
    const selUsers = selectedUserFilters.map(t => t.toLowerCase());
    const excTags = excludedTagFilters.map(t => t.toLowerCase());
    const excUsers = excludedUserFilters.map(t => t.toLowerCase());

    // pre-evaluate date filter components outside loop
    let hasDateFilter = false;
    let startDateStr = "";
    let endDateStr = "";
    let dateField = "";
    if (activeDateFilter) {
      hasDateFilter = true;
      dateField = activeDateFilter.field;
      if (activeDateFilter.start) {
        startDateStr = new Date(activeDateFilter.start).toISOString().split("T")[0];
      }
      if (activeDateFilter.end) {
        endDateStr = new Date(activeDateFilter.end).toISOString().split("T")[0];
      }
    }

    return contacts.filter((contact) => {
      const name = contact.contactName ? contact.contactName.toLowerCase() : "";
      const phone = contact.phone ? contact.phone.toLowerCase() : "";
      const tags = contact.tags || [];
      const tagsLower = tags.length > 0 ? tags.map((t) => t.toLowerCase()) : [];

      // Check basic search matching with early escape
      let matchesSearch = true;
      if (searchTerm) {
        matchesSearch =
          name.includes(searchTerm) ||
          phone.includes(searchTerm) ||
          tagsLower.some((tag) => tag.includes(searchTerm));

        if (!matchesSearch && contact.customFields) {
          matchesSearch = Object.values(contact.customFields).some((val) =>
            String(val || "").toLowerCase().includes(searchTerm)
          );
        }
      }

      if (!matchesSearch) return false; // Early Return

      const matchesTagFilters =
        selTags.length === 0 ||
        selTags.every((filter) => tagsLower.includes(filter));

      if (!matchesTagFilters) return false; // Early Return

      const matchesUserFilters =
        selUsers.length === 0 ||
        selUsers.some((filter) => tagsLower.includes(filter));

      if (!matchesUserFilters) return false; // Early Return

      const notExcluded = excTags.length === 0 || !excTags.some((tag) => tagsLower.includes(tag));
      if (!notExcluded) return false; // Early Return

      const notExcludedUser = excUsers.length === 0 || !excUsers.some((user) => tagsLower.includes(user));
      if (!notExcludedUser) return false; // Early Return

      // Date filter logic
      if (hasDateFilter) {
        const contactDate = contact[dateField as keyof Contact];
        if (!contactDate) return false;

        let date: Date;
        if (typeof contactDate === "string") {
          date = new Date(contactDate);
        } else if (typeof contactDate === "object" && "seconds" in contactDate) {
          const timestamp = contactDate as { seconds: number; nanoseconds: number };
          date = new Date(timestamp.seconds * 1000);
        } else {
          return false;
        }

        if (isNaN(date.getTime())) return false;

        const contactDateStr = date.toISOString().split("T")[0];

        if (startDateStr && endDateStr) {
          if (contactDateStr < startDateStr || contactDateStr > endDateStr) return false;
        } else if (startDateStr) {
          if (contactDateStr < startDateStr) return false;
        } else if (endDateStr) {
          if (contactDateStr > endDateStr) return false;
        }
      }

      return true;
    });
  }, [
    contacts,
    searchQuery,

    selectedTagFilters,
    selectedUserFilters,
    excludedTagFilters,
    excludedUserFilters,
    activeDateFilter,
  ]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const endOffset = itemOffset + itemsPerPage;
  const currentContacts = filteredContactsSearch.slice(itemOffset, endOffset);
  const pageCount = Math.ceil(filteredContactsSearch.length / itemsPerPage);

  const handlePageClick = (event: { selected: number }) => {
    const newOffset =
      (event.selected * itemsPerPage) % filteredContactsSearch.length;
    setItemOffset(newOffset);
  };

  // ... existing code ...
  const sendBlastMessage = async () => {
    // Validation checks
    if (selectedContacts.length === 0) {
      toast.error("No contacts selected!");
      return;
    }

    if (!blastStartTime || !blastStartDate) {
      toast.error("Please select both a date and time for the blast message.");
      return;
    }

    if (!blastMessage.trim()) {
      toast.error("Please enter a message");
      return;
    }

    // Set phoneIndex to 0 if it's null or undefined
    if (phoneIndex === undefined || phoneIndex === null) {
      setPhoneIndex(0);
    }
    const effectivePhoneIndex = phoneIndex ?? 0;

    // Check if the selected phone exists in phoneNames
    if (!phoneNames[effectivePhoneIndex]) {
      toast.error(
        "Selected phone is not available. Please select a valid phone."
      );
      return;
    }

    // Check if the selected phone is connected (only if qrCodes data is available)
    if (qrCodes[effectivePhoneIndex]) {
      const status = qrCodes[effectivePhoneIndex].status?.toLowerCase();
      if (!["ready", "authenticated"].includes(status)) {
        toast.error(
          "Selected phone is not connected. Please select a connected phone."
        );
        return;
      }
    }

    setIsScheduling(true);

    try {
      let mediaUrl = "";
      let documentUrl = "";
      let fileName = "";
      let mimeType = "";

      if (selectedMedia) {
        mediaUrl = await uploadFile(selectedMedia);
        mimeType = selectedMedia.type;
      }

      if (selectedDocument) {
        documentUrl = await uploadFile(selectedDocument);
        fileName = selectedDocument.name;
        mimeType = selectedDocument.type;
      }

      const userEmail = localStorage.getItem("userEmail");
      if (!userEmail) {
        toast.error("No user email found");
        return;
      }

      // Get user config to get companyId
      const userResponse = await fetch(
        `${baseUrl}/api/user/config?email=${encodeURIComponent(userEmail)}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          credentials: "include",
        }
      );

      if (!userResponse.ok) {
        toast.error("Failed to fetch user config");
        return;
      }

      const userData = await userResponse.json();
      // Get companyId and phoneIndex from your local state/props
      // (Assume you have userData or similar in your component)
      const companyId = userData?.company_id;
      console.log(userData);
      if (!companyId) {
        toast.error("Company ID not found!");
        return;
      }

      // Prepare chatIds
      const chatIds = selectedContacts
        .map((contact) => {
          const phoneNumber = contact.contact_id?.split("-")[1];
          return phoneNumber ? `${phoneNumber}@c.us` : null;
        })
        .filter((chatId) => chatId !== null);

      const contactIds = selectedContacts
        .map((contact) => contact.contact_id)
        .filter((contactId) => contactId !== null);

      // Add 'multiple' parameter based on number of contactIds
      const multiple = contactIds.length > 1;

      // Prepare processedMessages (replace placeholders)
      const processedMessages = selectedContacts.map((contact) => {
        let processedMessage = blastMessage;
        processedMessage = processedMessage
          .replace(/@{contactName}/g, contact.contactName || "")
          .replace(/@{firstName}/g, contact.firstName || "")
          .replace(/@{lastName}/g, contact.lastName || "")
          .replace(/@{email}/g, contact.email || "")
          .replace(/@{phone}/g, contact.phone || "")
          .replace(/@{vehicleNumber}/g, contact.vehicleNumber || "")
          .replace(/@{branch}/g, contact.branch || "")
          .replace(/@{expiryDate}/g, contact.expiryDate || "")
          .replace(/@{company}/g, contact.company || "")
          .replace(/@{ic}/g, contact.ic || "");
        // Add more placeholders as needed
        return {
          chatId: contact.phone?.replace(/\D/g, "") + "@c.us",
          message: processedMessage,
          contactData: contact,
        };
      });

      // Prepare scheduledMessageData
      let scheduledTime: Date;
      if (blastStartTime && blastStartDate) {
        const timeHours = blastStartTime.getHours();
        const timeMinutes = blastStartTime.getMinutes();
        const timeSeconds = blastStartTime.getSeconds();
        const timeMilliseconds = blastStartTime.getMilliseconds();

        scheduledTime = new Date(blastStartDate);
        scheduledTime.setHours(
          timeHours,
          timeMinutes,
          timeSeconds,
          timeMilliseconds
        );
      } else if (blastStartTime) {
        scheduledTime = new Date();
        scheduledTime.setHours(
          blastStartTime.getHours(),
          blastStartTime.getMinutes(),
          blastStartTime.getSeconds(),
          blastStartTime.getMilliseconds()
        );
      } else {
        scheduledTime = new Date();
      }

      const scheduledMessageData = {
        chatIds,
        message: blastMessage,
        messages: processedMessages,
        batchQuantity,
        companyId,
        contact_id: contactIds,
        createdAt: new Date().toISOString(),
        documentUrl: documentUrl || "",
        fileName: fileName || null,
        mediaUrl: mediaUrl || "",
        mimeType: mimeType || null,
        repeatInterval,
        repeatUnit,
        scheduledTime: scheduledTime.toISOString(),
        status: "scheduled",
        v2: true,
        whapiToken: null,
        phoneIndex: effectivePhoneIndex,
        minDelay,
        maxDelay,
        activateSleep,
        sleepAfterMessages: activateSleep ? sleepAfterMessages : null,
        sleepDuration: activateSleep ? sleepDuration : null,
        multiple: multiple,
        ...(enableActiveHours && activeTimeStart && activeTimeEnd && {
          activeHours: {
            start: activeTimeStart,
            end: activeTimeEnd,
          },
        }),
      };

      // Make API call to bisnesgpt.jutateknologi.com
      const response = await axios.post(
        `${baseUrl}/api/schedule-message/${companyId}`,
        scheduledMessageData
      );

      if (response.data.success) {
        toast.success(
          `Blast messages scheduled successfully for ${selectedContacts.length} contacts.`
        );
        toast.info(
          `Messages will be sent at: ${scheduledTime.toLocaleString()} (local time)`
        );
        await fetchScheduledMessages();
        setBlastMessageModal(false);
        resetForm();
      } else {
        toast.error(response.data.message || "Failed to schedule messages");
      }
    } catch (error) {
      console.error("Error scheduling blast messages:", error);
      toast.error(
        "An error occurred while scheduling the blast message. Please try again."
      );
    } finally {
      setIsScheduling(false);
    }
  };

  // Helper function to reset the form
  const resetForm = () => {
    setMessages([{ text: "", delayAfter: 0 }]);
    setBlastMessage("");
    setPhoneIndex(null);
    setInfiniteLoop(false);
    setBatchQuantity(10);
    setRepeatInterval(0);
    setRepeatUnit("days");
    setSelectedMedia(null);
    setSelectedDocument(null);
    setBlastStartTime(null);
    setBlastStartDate(new Date());
    setEnableActiveHours(false);
    setActiveTimeStart("09:00");
    setActiveTimeEnd("17:00");
    setMinDelay(1);
    setMaxDelay(3);
    setActivateSleep(false);
    setSleepAfterMessages(10);
    setSleepDuration(30);
    setShowPlaceholders(false);
  };

  const handleCsvFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedCsvFile(file);
    }
  };

  const [importTags, setImportTags] = useState<string[]>([]);

  const getAllCustomFields = (contacts: Contact[]): string[] => {
    const customFieldsSet = new Set<string>();
    contacts.forEach((contact) => {
      if (contact?.customFields) {
        Object.keys(contact.customFields).forEach((field) => {
          if (field) customFieldsSet.add(field);
        });
      }
    });
    return Array.from(customFieldsSet);
  };

  const ensureAllCustomFields = (
    contactData: any,
    allCustomFields: string[]
  ): any => {
    const customFields: { [key: string]: string } = {
      ...(contactData.customFields || {}),
    };

    // Add any missing custom fields with empty string values
    allCustomFields.forEach((field) => {
      if (!(field in customFields)) {
        customFields[field] = "";
      }
    });

    return {
      ...contactData,
      customFields,
    };
  };

  async function sendTextMessage(
    id: string,
    blastMessage: string,
    contact: Contact
  ): Promise<void> {
    if (!blastMessage.trim()) {
      console.error("Blast message is empty");
      return;
    }

    try {
      const user = auth.currentUser;
      const docUserRef = doc(firestore, "user", user?.email!);
      const docUserSnapshot = await getDoc(docUserRef);
      if (!docUserSnapshot.exists()) {
        console.error("User document not found!");
        return;
      }

      const userData = docUserSnapshot.data();
      const companyId = userData.companyId;
      const docRef = doc(firestore, "companies", companyId);
      const docSnapshot = await getDoc(docRef);
      if (!docSnapshot.exists()) {
        console.error("Company document not found!");
        return;
      }

      const companyData = docSnapshot.data();
      const baseUrl = companyData.apiUrl || "https://bisnesgpt.jutateknologi.com";
      const accessToken = companyData.ghl_accessToken;
      const whapiToken = companyData.whapiToken;
      const phoneNumber = id.split("+")[1];
      const chat_id = phoneNumber + "@s.whatsapp.net";

      // Process message with contact data to replace placeholders
      let processedMessage = blastMessage
        .replace(/@{contactName}/g, contact.contactName || "")
        .replace(/@{firstName}/g, contact.contactName?.split(" ")[0] || "")
        .replace(/@{lastName}/g, contact.lastName || "")
        .replace(/@{email}/g, contact.email || "")
        .replace(/@{phone}/g, contact.phone || "")
        .replace(/@{vehicleNumber}/g, contact.vehicleNumber || "")
        .replace(/@{branch}/g, contact.branch || "")
        .replace(/@{expiryDate}/g, contact.expiryDate || "")
        .replace(/@{ic}/g, contact.ic || "");

      // Process custom fields placeholders
      if (contact.customFields) {
        Object.entries(contact.customFields).forEach(([fieldName, value]) => {
          const placeholder = new RegExp(`@{${fieldName}}`, "g");
          processedMessage = processedMessage.replace(placeholder, value || "");
        });
      }

      if (companyData.v2) {
        // Handle v2 users
        const messagesRef = collection(
          firestore,
          `companies/${companyId}/contacts/${contact.phone}/messages`
        );
        await addDoc(messagesRef, {
          message: processedMessage,
          timestamp: new Date(),
          from_me: true,
          chat_id: chat_id,
          type: "chat",
          // Add any other necessary fields
        });
      } else {
        // Handle non-v2 users
        const response = await axios.post(
          `${baseUrl}/api/messages/text/${chat_id}/${whapiToken}`,
          {
            contactId: id,
            message: processedMessage,
            additionalInfo: { ...contact },
            method: "POST",
            body: JSON.stringify({
              message: processedMessage,
            }),
            headers: { "Content-Type": "application/json" },
          },
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
              "Content-Type": "application/json",
            },
          }
        );

        if (response.data && response.data.message) {
          // Store the message in Firebase for non-v2 users
          const messagesCollectionRef = collection(
            firestore,
            "companies",
            companyId,
            "messages"
          );
          await setDoc(doc(messagesCollectionRef, response.data.message.id), {
            message: response.data.message,
            from: userData.name,
            timestamp: new Date(),
            whapiToken: whapiToken,
            chat_id: chat_id,
            type: "chat",
            from_me: true,
            text: { body: processedMessage },
          });
        }
      }
    } catch (error) {
      console.error("Error sending message:", error);
      throw error;
    }
  }

  useEffect(() => {
    fetchScheduledMessages();
  }, []);
  const deleteCustomFieldFromAllContacts = async (fieldName: string) => {
    try {
      const user = auth.currentUser;
      if (!user) return;

      const docUserRef = doc(firestore, "user", user.email!);
      const docUserSnapshot = await getDoc(docUserRef);
      if (!docUserSnapshot.exists()) {
        return;
      }
      const userData = docUserSnapshot.data();
      const companyId = userData.companyId;

      const contactsCollectionRef = collection(
        firestore,
        `companies/${companyId}/contacts`
      );
      const contactsSnapshot = await getDocs(contactsCollectionRef);

      const batch = writeBatch(firestore);

      contactsSnapshot.forEach((doc) => {
        const contactRef = doc.ref;
        batch.update(contactRef, {
          [`customFields.${fieldName}`]: deleteField(),
        });
      });

      await batch.commit();

      // Update local state
      setContacts((prevContacts) =>
        prevContacts.map((contact) => {
          const { [fieldName]: _, ...restCustomFields } =
            contact.customFields || {};
          return {
            ...contact,
            customFields: restCustomFields,
          };
        })
      );

      toast.success(`Custom field "${fieldName}" removed from all contacts.`);
    } catch (error) {
      console.error("Error removing custom field from all contacts:", error);
      toast.error("Failed to remove custom field from all contacts.");
    }
  };
  const fetchScheduledMessages = async () => {
    try {
      const userEmail = localStorage.getItem("userEmail");
      if (!userEmail) return;

      // Get user/company data from your backend
      const userResponse = await fetch(
        `${baseUrl}/api/user-company-data?email=${encodeURIComponent(
          userEmail
        )}`,
        {
          method: "GET",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
        }
      );

      if (!userResponse.ok) {
        console.error("Failed to fetch user/company data");
        return;
      }

      const userData = await userResponse.json();
      const companyId = userData.userData.companyId;

      if (!companyId) {
        console.error("No company ID found");
        return;
      }

      // Fetch scheduled messages from your localhost API
      const scheduledMessagesResponse = await fetch(
        `${baseUrl}/api/scheduled-messages?companyId=${encodeURIComponent(
          companyId
        )}&status=scheduled`,
        {
          method: "GET",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
        }
      );

      if (!scheduledMessagesResponse.ok) {
        console.error("Failed to fetch scheduled messages");
        return;
      }

      const scheduledMessagesData = await scheduledMessagesResponse.json();
      console.log("Scheduled messages fetched:", scheduledMessagesData);
      const messages: ScheduledMessage[] =
        scheduledMessagesData.messages || scheduledMessagesData || [];

      // Sort messages by scheduledTime - handle string dates properly
      messages.sort((a, b) => {
        const timeA = new Date(a.scheduledTime).getTime();
        const timeB = new Date(b.scheduledTime).getTime();
        return timeA - timeB;
      });
      setScheduledMessages(messages);
      console.log("Scheduled messages fetched:", messages);
    } catch (error) {
      console.error("Error fetching scheduled messages:", error);
    }
  };

  // Helper to get current user email from localStorage or auth
  const getCurrentUserEmail = () => {
    const userDataStr = localStorage.getItem("userData");
    if (userDataStr) {
      try {
        const userData = JSON.parse(userDataStr);
        return userData.email || null;
      } catch {
        return null;
      }
    } else {
      return localStorage.getItem("userEmail");
    }
  };

  // Check connection type for official API
  const checkConnectionType = async () => {
    if (!companyId) return;

    try {
      const response = await fetch(
        `${baseUrl}/api/templates/connection-type/${companyId}?phoneIndex=${phoneIndex || 0}`,
        { credentials: "include" }
      );

      if (response.ok) {
        const data = await response.json();
        setConnectionType(data.connectionType || 'wwebjs');
        setIsOfficialApi(data.requiresTemplates || false);
      }
    } catch (error) {
      console.error("Error checking connection type:", error);
    }
  };

  // Check 24-hour session window for a contact
  const checkSessionWindow = async (contactPhone: string): Promise<{ isOpen: boolean; requiresTemplate: boolean }> => {
    if (!companyId || !isOfficialApi) {
      return { isOpen: true, requiresTemplate: false };
    }

    try {
      const cleanPhone = contactPhone.replace(/[^\d]/g, '');
      const response = await fetch(
        `${baseUrl}/api/templates/session/${companyId}/${cleanPhone}?phoneIndex=${phoneIndex || 0}`,
        { credentials: "include" }
      );

      if (response.ok) {
        const data = await response.json();
        return {
          isOpen: data.sessionWindow?.isOpen ?? true,
          requiresTemplate: data.sessionWindow?.requiresTemplate ?? false
        };
      }
    } catch (error) {
      console.error("Error checking session window:", error);
    }

    return { isOpen: true, requiresTemplate: false };
  };

  // Check connection type when companyId or phoneIndex changes
  useEffect(() => {
    if (companyId) {
      checkConnectionType();
    }
  }, [companyId, phoneIndex]);

  // Fetch templates for blast when using official API
  const fetchBlastTemplates = async () => {
    if (!companyId || !isOfficialApi) return;

    setIsLoadingBlastTemplates(true);
    try {
      const response = await fetch(
        `${baseUrl}/api/templates/${companyId}?phoneIndex=${phoneIndex || 0}&status=APPROVED`,
        { credentials: "include" }
      );

      if (response.ok) {
        const data = await response.json();
        setBlastTemplates(data.templates || []);
      }
    } catch (error) {
      console.error("Error fetching templates:", error);
      toast.error("Failed to fetch templates");
    } finally {
      setIsLoadingBlastTemplates(false);
    }
  };

  // Fetch templates when blast modal opens and using official API
  useEffect(() => {
    if (blastMessageModal && isOfficialApi && companyId) {
      fetchBlastTemplates();
    }
  }, [blastMessageModal, isOfficialApi, companyId]);

  // Get template variable count
  const getTemplateVariableCount = (template: any): number => {
    if (!template?.components) return 0;
    let count = 0;
    for (const comp of template.components) {
      if (comp.text) {
        const matches = comp.text.match(/\{\{(\d+)\}\}/g);
        if (matches) count = Math.max(count, ...matches.map((m: string) => parseInt(m.replace(/[{}]/g, ''))));
      }
    }
    return count;
  };

  // Get template preview text
  const getTemplatePreviewText = (template: any): string => {
    if (!template?.components) return '';
    const parts: string[] = [];
    for (const comp of template.components) {
      if (comp.type === 'BODY' && comp.text) {
        parts.push(comp.text);
      }
    }
    return parts.join('\n');
  };

  // Handle selecting a blast template
  const handleSelectBlastTemplate = (template: any) => {
    setSelectedBlastTemplate(template);
    const varCount = getTemplateVariableCount(template);
    setBlastTemplateVariables(Array(varCount).fill(''));
  };

  // Send blast template messages
  const sendBlastTemplateMessage = async () => {
    if (!selectedBlastTemplate || selectedContacts.length === 0) {
      toast.error("Please select a template and contacts");
      return;
    }

    const varCount = getTemplateVariableCount(selectedBlastTemplate);
    if (varCount > 0 && blastTemplateVariables.some(v => !v.trim())) {
      toast.error("Please fill in all template variables");
      return;
    }

    setIsSendingBlastTemplate(true);
    setProgress(0);

    try {
      let successCount = 0;
      let failCount = 0;
      const totalContacts = selectedContacts.length;

      for (let i = 0; i < selectedContacts.length; i++) {
        const contact = selectedContacts[i];
        const cleanPhone = contact.phone?.replace(/[^\d]/g, '');
        if (!cleanPhone) continue;

        // meta_direct (Meta Cloud API) uses plain phone numbers; wwebjs uses @c.us suffix
        const chatId = connectionType === 'meta_direct' ? cleanPhone : `${cleanPhone}@c.us`;

        try {
          // Calculate scheduled time for this contact based on batch settings
          let scheduledTime = null;
          if (blastStartDate && blastStartTime) {
            const batchIndex = Math.floor(i / batchQuantity);
            const baseTime = new Date(
              blastStartDate.getFullYear(),
              blastStartDate.getMonth(),
              blastStartDate.getDate(),
              blastStartTime.getHours(),
              blastStartTime.getMinutes()
            );
            scheduledTime = new Date(baseTime.getTime() + (batchIndex * batchDelay * 60 * 1000));
          }

          const response = await fetch(
            `${baseUrl}/api/v2/messages/template/${companyId}/${chatId}`,
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                templateName: selectedBlastTemplate.name,
                language: selectedBlastTemplate.language,
                variables: blastTemplateVariables,
                phoneIndex: phoneIndex || 0,
                scheduledTime: scheduledTime?.toISOString(),
                batchDelay: batchDelay,
                enableActiveHours: enableActiveHours,
                activeTimeStart: activeTimeStart,
                activeTimeEnd: activeTimeEnd,
              }),
            }
          );

          if (response.ok) {
            successCount++;
          } else {
            failCount++;
          }
        } catch (err) {
          failCount++;
        }

        setProgress(((i + 1) / totalContacts) * 100);

        // Small delay between messages
        if (i < selectedContacts.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 500));
        }
      }

      if (successCount > 0) {
        toast.success(`Successfully sent template to ${successCount} contacts`);
      }
      if (failCount > 0) {
        toast.warning(`Failed to send to ${failCount} contacts`);
      }

      setBlastMessageModal(false);
      setSelectedBlastTemplate(null);
      setBlastTemplateVariables([]);
      setSelectedContacts([]);
    } catch (error: any) {
      console.error("Error sending blast template:", error);
      toast.error(error.message || "Failed to send blast template");
    } finally {
      setIsSendingBlastTemplate(false);
      setProgress(0);
    }
  };

  // Handle sending template message
  const handleSendTemplate = async (templateName: string, language: string, variables: string[]) => {
    if (!templateContactsToSend.length) {
      toast.error("No contacts selected for template");
      return;
    }

    try {
      for (const contactId of templateContactsToSend) {
        const phone = contactId.split("-")[1];
        // meta_direct (Meta Cloud API) uses plain phone numbers; wwebjs uses @c.us suffix
        const chatId = connectionType === 'meta_direct' ? phone : `${phone}@c.us`;

        const response = await fetch(
          `${baseUrl}/api/v2/messages/template/${companyId}/${chatId}`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              templateName,
              language,
              variables,
              phoneIndex: phoneIndex || 0,
            }),
          }
        );

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "Failed to send template");
        }
      }

      toast.success("Template message sent successfully!");
      setIsTemplateSelectorOpen(false);
      setTemplateContactsToSend([]);

      // If there was a pending message (scheduled), delete it
      if (pendingMessageToSend?.scheduleId) {
        try {
          await fetch(
            `${baseUrl}/api/schedule-message/${companyId}/${pendingMessageToSend.scheduleId}`,
            { method: "DELETE" }
          );
          await fetchScheduledMessages();
        } catch (e) {
          console.warn("Failed to delete scheduled message after template send");
        }
      }
      setPendingMessageToSend(null);
    } catch (error: any) {
      console.error("Error sending template:", error);
      toast.error(error.message || "Failed to send template message");
    }
  };

  const handleSendNow = async (message: any) => {
    try {
      console.log("Sending message now:", message);
      // Get user and company data
      const email = getCurrentUserEmail();
      if (!email) throw new Error("User not authenticated");

      if (!companyId) throw new Error("Company ID not available");

      // Use the baseUrl from state or default
      const apiUrl = baseUrl;

      // Helper to determine API endpoint based on mediaUrl
      const getApiEndpoint = (mediaUrl: string | undefined, chatId: string) => {
        if (!mediaUrl)
          return `${apiUrl}/api/v2/messages/text/${companyId}/${chatId}`;
        const ext = mediaUrl.split(".").pop()?.toLowerCase();
        if (!ext)
          return `${apiUrl}/api/v2/messages/text/${companyId}/${chatId}`;
        if (["mp4", "mov", "avi", "webm"].includes(ext)) {
          return `${apiUrl}/api/v2/messages/video/${companyId}/${chatId}`;
        }
        if (["jpg", "jpeg", "png", "gif", "bmp", "webp"].includes(ext)) {
          return `${apiUrl}/api/v2/messages/image/${companyId}/${chatId}`;
        }
        if (
          ["pdf", "doc", "docx", "xls", "xlsx", "ppt", "pptx"].includes(ext)
        ) {
          return `${apiUrl}/api/v2/messages/document/${companyId}/${chatId}`;
        }
        return `${apiUrl}/api/v2/messages/text/${companyId}/${chatId}`;
      };

      // Try to get userData from employeeList or localStorage for phoneIndex/userName fallback
      let userData: any = null;
      const userDataStr = localStorage.getItem("userData");
      if (userDataStr) {
        try {
          userData = JSON.parse(userDataStr);
        } catch { }
      }

      // Derive chatIds from contactIds/contactId
      let chatIds: string[] = [];
      if (message.multiple && Array.isArray(message.contactIds)) {
        chatIds = message.contactIds
          .map((cid: string) => {
            const phone = cid.split("-")[1];
            return phone ? `${phone}@c.us` : null;
          })
          .filter(Boolean);
      } else if (!message.multiple && message.contactId) {
        const phone = message.contactId.split("-")[1];
        if (phone) chatIds = [`${phone}@c.us`];
      }

      const isConsolidated = message.isConsolidated === true;

      let contactList: Contact[] = [];
      if (isConsolidated && Array.isArray(message.contactIds)) {
        contactList = message.contactIds
          .map((cid: string) => {
            const phone = cid.split("-")[1];
            return contacts.find((c) => c.phone?.replace(/\D/g, "") === phone);
          })
          .filter(Boolean) as Contact[];
      } else if (!isConsolidated && message.contactId) {
        const phone = message.contactId.split("-")[1];
        const found = contacts.find(
          (c) => c.phone?.replace(/\D/g, "") === phone
        );
        if (found) contactList = [found];
      }

      // For each chatId, process placeholders before sending
      const sendPromises = chatIds.map(async (chatId: string, idx: number) => {
        let mainMessage =
          (isConsolidated &&
            Array.isArray(message.messages) &&
            message.messages.find((msg: any) => msg.isMain === true)) ||
          (Array.isArray(message.messages) && message.messages[0]) ||
          message;

        // Find the corresponding contact for this chatId
        let contact: Contact | undefined;
        if (contactList.length === chatIds.length) {
          contact = contactList[idx];
        } else {
          // fallback: match by phone number
          const phoneNumber = chatId.split("@")[0];
          contact = contacts.find(
            (c) => c.phone?.replace(/\D/g, "") === phoneNumber
          );
        }

        // Process message with contact data and custom fields
        let processedMessage =
          mainMessage.messageContent || mainMessage.text || "";

        if (contact) {
          processedMessage = processedMessage
            .replace(/@{contactName}/g, contact.contactName || "")
            .replace(/@{firstName}/g, contact.contactName?.split(" ")[0] || "")
            .replace(/@{lastName}/g, contact.lastName || "")
            .replace(/@{email}/g, contact.email || "")
            .replace(/@{phone}/g, contact.phone || "")
            .replace(/@{vehicleNumber}/g, contact.vehicleNumber || "")
            .replace(/@{branch}/g, contact.branch || "")
            .replace(/@{expiryDate}/g, contact.expiryDate || "")
            .replace(/@{ic}/g, contact.ic || "");

          if (contact.customFields) {
            Object.entries(contact.customFields).forEach(
              ([fieldName, value]) => {
                const placeholder = new RegExp(`@{${fieldName}}`, "g");
                processedMessage = processedMessage.replace(
                  placeholder,
                  value || ""
                );
              }
            );
          }
        }

        // If mediaUrl exists, send as media
        if (mainMessage.mediaUrl) {
          const endpoint = getApiEndpoint(mainMessage.mediaUrl, chatId);
          const body: any = {
            phoneIndex: message.phoneIndex || userData?.phone || 0,
            userName: userData?.name || email || "",
          };
          if (endpoint.includes("/video/")) {
            body.videoUrl = mainMessage.mediaUrl;
            body.caption = processedMessage;
          } else if (endpoint.includes("/image/")) {
            body.imageUrl = mainMessage.mediaUrl;
            body.caption = processedMessage;
          } else if (endpoint.includes("/document/")) {
            body.documentUrl = mainMessage.mediaUrl;
            body.filename = mainMessage.fileName || "";
            body.caption = processedMessage;
          }
          const response = await fetch(endpoint, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body),
          });
          if (!response.ok) {
            throw new Error(`Failed to send media message to ${chatId}`);
          }
        } else {
          // No media, send as text
          const response = await fetch(
            `${apiUrl}/api/v2/messages/text/${companyId}/${chatId}`,
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                message: processedMessage,
                phoneIndex: message.phoneIndex || userData?.phone || 0,
                userName: userData?.name || email || "",
              }),
            }
          );
          if (!response.ok) {
            throw new Error(`Failed to send message to ${chatId}`);
          }
        }
      });
      // Delete the scheduled message
      if (message.scheduleId) {
        // Call NeonDB API to delete scheduled message using the correct endpoint
        const deleteResponse = await fetch(
          `${apiUrl}/api/schedule-message/${companyId}/${message.scheduleId}`,
          {
            method: "DELETE",
          }
        );
        if (!deleteResponse.ok) {
          console.warn("Failed to delete scheduled message from database");
        }
      }
      await Promise.all(sendPromises);
      toast.success("Messages sent successfully!");
      await fetchScheduledMessages();
      return;
    } catch (error) {
      console.error("Error sending messages:", error);
      toast.error("Failed to send messages. Please try again.");
    }
  };

  const handleEditScheduledMessage = (message: ScheduledMessage) => {
    console.log("Editing scheduled message:", message);
    setCurrentScheduledMessage(message);
    setBlastMessage(message.messageContent || "");
    setEditScheduledMessageModal(true);
  };

  const insertPlaceholder = (field: string) => {
    const placeholder = `@{${field}}`;
    // Get the current cursor position from the textarea
    const textarea = document.querySelector(
      'textarea[placeholder="Enter your message here..."]'
    ) as HTMLTextAreaElement;
    if (textarea) {
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const currentValue = blastMessage;

      // Insert placeholder at cursor position
      const newValue =
        currentValue.substring(0, start) +
        placeholder +
        currentValue.substring(end);
      setBlastMessage(newValue);

      // Set cursor position after the inserted placeholder
      setTimeout(() => {
        textarea.selectionStart = textarea.selectionEnd =
          start + placeholder.length;
        textarea.focus();
      }, 0);
    } else {
      // Fallback: append to end
      setBlastMessage((prevMessage) => prevMessage + placeholder);
    }
  };

  const handleDeleteScheduledMessage = async (messageId: string) => {
    try {
      // Get user and company info from localStorage or your app state
      const userEmail = localStorage.getItem("userEmail");
      if (!userEmail) {
        toast.error("No user email found");
        return;
      }
      // Fetch user config to get companyId
      const userResponse = await fetch(
        `${baseUrl}/api/user/config?email=${encodeURIComponent(userEmail)}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          credentials: "include",
        }
      );
      if (!userResponse.ok) {
        toast.error("Failed to fetch user config");
        return;
      }
      const userData = await userResponse.json();
      const companyId = userData?.company_id;
      if (!companyId) {
        toast.error("Company ID not found!");
        return;
      }

      // Call the backend API to delete the scheduled message
      const response = await axios.delete(
        `${baseUrl}/api/schedule-message/${companyId}/${messageId}`
      );
      if (response.status === 200 && response.data.success) {
        setScheduledMessages((prev) =>
          prev.filter((msg) => msg.id !== messageId)
        );
        toast.success("Scheduled message deleted successfully!");
        await fetchScheduledMessages();
      } else {
        throw new Error(
          response.data.message || "Failed to delete scheduled message."
        );
      }
    } catch (error) {
      console.error("Error deleting scheduled message:", error);
      toast.error("Failed to delete scheduled message.");
    }
  };

  const handleEditMediaUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const maxSizeInMB = 20;
      const maxSizeInBytes = maxSizeInMB * 1024 * 1024;

      if (file.type.startsWith("video/") && file.size > maxSizeInBytes) {
        toast.error(
          "The video file is too big. Please select a file smaller than 20MB."
        );
        return;
      }

      setEditMediaFile(file);
    }
  };

  const handleEditDocumentUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setEditDocumentFile(e.target.files[0]);
    }
  };

  interface BaseMessageContent {
    text: string;
    type: string;
    url: string;
    mimeType: string;
    fileName: string;
    caption: string;
  }

  interface MessageContent extends BaseMessageContent {
    isMain?: boolean;
    [key: string]: string | boolean | undefined;
  }

  const handleSaveScheduledMessage = async () => {
    try {
      console.log("Saving scheduled message:", currentScheduledMessage);
      if (!blastMessage.trim()) {
        toast.error("Message text cannot be empty");
        return;
      }
      if (!currentScheduledMessage) {
        toast.error("No message selected for editing");
        return;
      }
      // Determine recipients based on 'multiple'
      let recipientIds: string[] = [];
      if (currentScheduledMessage.multiple) {
        // If multiple, use contactIds (array)
        if (
          !currentScheduledMessage.contactIds ||
          currentScheduledMessage.contactIds.length === 0
        ) {
          toast.error("No recipients for this message");
          return;
        }
        recipientIds = currentScheduledMessage.contactIds;
      } else {
        // If not multiple, use contactId (single)
        if (!currentScheduledMessage.contactId) {
          toast.error("No recipient for this message");
          return;
        }
        recipientIds = [currentScheduledMessage.contactId];
      }

      // Upload new media or document if provided
      let newMediaUrl = currentScheduledMessage.mediaUrl || "";
      let newDocumentUrl = currentScheduledMessage.documentUrl || "";
      let newFileName = currentScheduledMessage.fileName || "";
      let newMimeType = currentScheduledMessage.mimeType || "";

      if (editMediaFile) {
        newMediaUrl = await uploadFile(editMediaFile);
        newMimeType = editMediaFile.type;
      }
      if (editDocumentFile) {
        newDocumentUrl = await uploadFile(editDocumentFile);
        newFileName = editDocumentFile.name;
        newMimeType = editDocumentFile.type;
      }

      // Get user/company info from localStorage or your app state
      const userEmail = localStorage.getItem("userEmail");
      if (!userEmail) {
        toast.error("No user email found");
        return;
      }
      // Fetch user config to get companyId
      const userResponse = await fetch(
        `${baseUrl}/api/user/config?email=${encodeURIComponent(userEmail)}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          credentials: "include",
        }
      );
      if (!userResponse.ok) {
        toast.error("Failed to fetch user config");
        return;
      }
      const userData = await userResponse.json();
      const companyId = userData?.company_id;
      if (!companyId) {
        toast.error("Company ID not found!");
        return;
      }

      // Prepare processedMessages (replace placeholders)
      const processedMessages = (recipientIds || [])
        .map((chatId) => {
          let phoneNumber = "";
          if (typeof chatId === "string") {
            const parts = chatId.split("-");
            phoneNumber = parts.length > 1 ? parts.slice(1).join("-") : chatId;
          }
          phoneNumber = phoneNumber.split("@")[0];
          let contact =
            contacts.find((c) => c.chat_id === chatId) ||
            contacts.find((c) => c.phone?.replace(/\D/g, "") === phoneNumber);
          if (!contact) return null;
          let processedMessage = blastMessage
            .replace(/@{contactName}/g, contact.contactName || "")
            .replace(/@{firstName}/g, contact.firstName || "")
            .replace(/@{lastName}/g, contact.lastName || "")
            .replace(/@{email}/g, contact.email || "")
            .replace(/@{phone}/g, contact.phone || "")
            .replace(/@{vehicleNumber}/g, contact.vehicleNumber || "")
            .replace(/@{branch}/g, contact.branch || "")
            .replace(/@{expiryDate}/g, contact.expiryDate || "")
            .replace(/@{ic}/g, contact.ic || "");
          // Custom fields
          if (contact.customFields) {
            Object.entries(contact.customFields).forEach(
              ([fieldName, value]) => {
                const placeholder = new RegExp(`@{${fieldName}}`, "g");
                processedMessage = processedMessage.replace(
                  placeholder,
                  value || ""
                );
              }
            );
          }
          return {
            chatId,
            message: processedMessage,
            contactData: contact,
          };
        })
        .filter(Boolean);

      // Prepare consolidated messages array (media, document, text)
      // Ensure all fields are defined and match the ScheduledMessage.messages type
      const consolidatedMessages: {
        [x: string]: string | boolean;
        text: string;
      }[] = [];
      if (newMediaUrl) {
        consolidatedMessages.push({
          type: "media",
          text: "",
          url: newMediaUrl,
          mimeType: newMimeType || "",
          caption: "",
          fileName: "",
          isMain: false,
        });
      }
      if (newDocumentUrl) {
        consolidatedMessages.push({
          type: "document",
          text: "",
          url: newDocumentUrl,
          fileName: newFileName || "",
          mimeType: newMimeType || "",
          caption: "",
          isMain: false,
        });
      }
      consolidatedMessages.push({
        type: "text",
        text: blastMessage,
        url: "",
        mimeType: "",
        fileName: "",
        caption: "",
        isMain: true,
      });

      // Prepare scheduledTime as ISO string
      let scheduledTime = currentScheduledMessage.scheduledTime;
      if (
        scheduledTime &&
        typeof scheduledTime === "object" &&
        scheduledTime !== null &&
        (scheduledTime as any) instanceof Date
      ) {
        scheduledTime = (scheduledTime as Date).toISOString();
      } else if (
        scheduledTime &&
        typeof scheduledTime === "object" &&
        scheduledTime !== null &&
        "seconds" in scheduledTime
      ) {
        scheduledTime = new Date(
          (scheduledTime as any).seconds * 1000
        ).toISOString();
      }

      // Prepare updated message data for SQL backend
      const updatedMessageData: ScheduledMessage = {
        ...currentScheduledMessage,
        message: blastMessage,
        messages: consolidatedMessages,
        processedMessages: processedMessages.filter(
          Boolean
        ) as ScheduledMessage["processedMessages"],
        documentUrl: newDocumentUrl,
        fileName: newFileName,
        mediaUrl: newMediaUrl,
        mimeType: newMimeType,
        scheduledTime,
        status: "scheduled",
        isConsolidated: true,
      };

      // Use scheduleId if present, otherwise fallback to id
      const sId =
        currentScheduledMessage.scheduleId || currentScheduledMessage.id;

      // Send PUT request to update the scheduled message
      const response = await axios.put(
        `${baseUrl}/api/schedule-message/${companyId}/${sId}`,
        updatedMessageData
      );

      if (response.status === 200 && response.data.success) {
        setScheduledMessages((prev) =>
          prev.map((msg) =>
            msg.id === currentScheduledMessage.id ? updatedMessageData : msg
          )
        );
        setEditScheduledMessageModal(false);
        setEditMediaFile(null);
        setEditDocumentFile(null);
        toast.success("Scheduled message updated successfully!");
        await fetchScheduledMessages();
      } else {
        throw new Error(
          response.data.message || "Failed to update scheduled message"
        );
      }
    } catch (error) {
      console.error("Error updating scheduled message:", error);
      toast.error("Failed to update scheduled message.");
    }
  };

  // Add this function to process messages when they're displayed
  const processScheduledMessage = (message: ScheduledMessage) => {
    if (!message.templateData?.hasPlaceholders) {
      return message.message;
    }

    // If the message has processed messages, use those
    if (message.processedMessages && message.processedMessages.length > 0) {
      // Return a summary or the first processed message
      return `Template: ${message.message}\nExample: ${message.processedMessages[0].message}`;
    }

    return message.message;
  };

  // Update the display of scheduled messages to use the processed version
  const renderScheduledMessage = (message: ScheduledMessage) => {
    return (
      <p className="text-gray-800 dark:text-gray-200 mb-2 font-medium text-md line-clamp-2">
        {processScheduledMessage(message)}
        {message.templateData?.hasPlaceholders && (
          <span className="text-xs text-gray-500 dark:text-gray-400 ml-2">
            (Uses placeholders)
          </span>
        )}
      </p>
    );
  };

  // Add this function to format the date
  const formatDate = (date: Date) => {
    return format(date, "MMM d, yyyy 'at' h:mm a");
  };

  const handleSelectAll = () => {
    if (selectedContacts.length === filteredContactsSearch.length) {
      setSelectedContacts([]);
    } else {
      // Create a reversed copy of the filtered contacts array
      const reversedContacts = [...filteredContactsSearch].reverse();

      setSelectedContacts(reversedContacts);
    }
  };

  const handleDeselectPage = () => {
    // Deselect all contacts from current page
    const currentContactIds = new Set(
      currentContacts.map((contact) => contact.id)
    );
    setSelectedContacts((prevSelected) =>
      prevSelected.filter((contact) => !currentContactIds.has(contact.id))
    );
  };

  const handleSelectCurrentPage = () => {
    const areAllCurrentSelected = currentContacts.every((contact) =>
      selectedContacts.some((sc) => sc.id === contact.id)
    );

    if (areAllCurrentSelected) {
      // If all current page contacts are selected, deselect them
      setSelectedContacts((prevSelected) =>
        prevSelected.filter(
          (contact) => !currentContacts.some((cc) => cc.id === contact.id)
        )
      );
    } else {
      // If not all current page contacts are selected, select them all
      const currentPageContacts = currentContacts.filter(
        (contact) => !selectedContacts.some((sc) => sc.id === contact.id)
      );
      setSelectedContacts((prevSelected) => [
        ...prevSelected,
        ...currentPageContacts,
      ]);
    }
  };

  useEffect(() => {
    if (contacts.length > 0) {
      const firstContact = contacts[0];

      // Only add new custom fields to visible columns
      if (firstContact.customFields) {
        setVisibleColumns((prev) => {
          const newColumns = { ...prev };
          Object.keys(firstContact.customFields || {}).forEach((field) => {
            if (!(field in prev)) {
              newColumns[field] = true;
            }
          });
          // Save to localStorage after updating
          localStorage.setItem(
            "contactsVisibleColumns",
            JSON.stringify(newColumns)
          );
          return newColumns;
        });
      }

      // Update column order if new fields are found
      setColumnOrder((prev) => {
        const customFields = firstContact.customFields
          ? Object.keys(firstContact.customFields).map(
            (field) => `customField_${field}`
          )
          : [];

        const existingCustomFields = prev.filter((col) =>
          col.startsWith("customField_")
        );
        const newCustomFields = customFields.filter(
          (field) => !prev.includes(field)
        );

        if (newCustomFields.length === 0) return prev;

        // Remove existing custom fields and add all custom fields before 'actions'
        const baseColumns = prev.filter(
          (col) => !col.startsWith("customField_") && col !== "actions"
        );
        const newOrder = [...baseColumns, ...customFields, "actions"];
        localStorage.setItem("contactsColumnOrder", JSON.stringify(newOrder));
        return newOrder;
      });
    }
  }, [contacts]);

  const renderTags = (tags: string[] | undefined, contact: Contact) => {
    if (!tags || tags.length === 0) return null;

    // Filter out empty tags
    const filteredTags = tags.filter((tag) => tag && tag.trim() !== "");

    if (filteredTags.length === 0) return null;

    return (
      <div className="flex flex-wrap gap-1 mt-1">
        {filteredTags.map((tag, index) => (
          <span
            key={index}
            className={`px-2 py-1 text-xs font-semibold rounded-full ${
              // Make case-insensitive comparison
              employeeNames.some(
                (name) => name.toLowerCase() === tag.toLowerCase()
              )
                ? "bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-200"
                : "bg-blue-100 text-blue-800 dark:bg-blue-800 dark:text-blue-200"
              }`}
          >
            {tag}
            <button
              className="absolute top-0 right-0 hidden group-hover:block bg-red-500 text-white rounded-full w-4 h-4 flex items-center justify-center text-xs leading-none"
              onClick={(e) => {
                e.stopPropagation();
                handleRemoveTag(contact.contact_id!, tag);
              }}
            >
              ×
            </button>
          </span>
        ))}
      </div>
    );
  };

  // Update handleDownloadSampleCsv to use visible columns
  const handleDownloadSampleCsv = () => {
    // Define all possible contact fields
    const allFields = [
      "contactName",
      "lastName",
      "phone",
      "email",
      "companyName",
      "address1",
      "city",
      "state",
      "postalCode",
      "country",
      "branch",
      "expiryDate",
      "vehicleNumber",

      "IC",
      "notes",
      ...Object.keys(contacts[0]?.customFields || {}), // Include any custom fields
    ];

    // Create sample data with all fields
    const sampleData = [
      allFields.join(","),
      allFields
        .map((field) => {
          switch (field) {
            case "phone":
              return "60123456789";

            case "email":
              return "john@example.com";
            case "IC":
              return "123456-78-9012";
            case "expiryDate":
              return "2024-12-31";
            default:
              return `Sample ${field}`;
          }
        })
        .join(","),
    ].join("\n");

    const blob = new Blob([sampleData], { type: "text/csv;charset=utf-8" });
    saveAs(blob, "sample_contacts.csv");
  };

  const cleanPhoneNumber = (phone: string): string | null => {
    if (!phone || phone === "#ERROR!") return null;

    // Remove all non-numeric characters except '+'
    let cleaned = phone.replace(/[^0-9+]/g, "");

    // If already starts with +
    if (cleaned.startsWith("+")) {
      // Check if it's a valid international number
      if (/^\+[1-9]/.test(cleaned)) {
        // Already has a valid country code, return as is
        return cleaned.length >= 10 ? cleaned : null;
      } else {
        // If there's no digit after + or starts with +0, add Malaysia country code (60)
        cleaned = `+60${cleaned.substring(1)}`;
      }
      return cleaned.length >= 10 ? cleaned : null;
    }

    // Check if the number starts with a valid country code (like 60, 65, 62, etc.)
    if (
      /^(60|65|62|61|63|66|84|95|855|856|91|92|93|94|977|880|881|882|883|886|888|960|961|962|963|964|965|966|967|968|970|971|972|973|974|975|976|992|993|994|995|996|998)/.test(
        cleaned
      )
    ) {
      return cleaned.length >= 10 ? `+${cleaned}` : null;
    }

    // For numbers without + prefix
    if (cleaned.startsWith("0")) {
      // If it starts with 0, add +6 before the number
      return cleaned.length >= 9 ? `+6${cleaned}` : null;
    }

    // Add +6 prefix for Malaysian numbers if missing + prefix
    return cleaned.length >= 9 ? `+6${cleaned}` : null;
  };

  const parseCSV = async (): Promise<Array<any>> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const text = event.target?.result as string;
          if (!text) {
            throw new Error("Failed to read CSV file content");
          }

          // Use Papa Parse for better CSV handling
          Papa.parse(text, {
            header: true,
            skipEmptyLines: true,
            complete: (results) => {
              if (results.errors.length > 0) {
                console.error("CSV parsing errors:", results.errors);
                throw new Error("Error parsing CSV file");
              }

              if (results.data.length === 0) {
                throw new Error("No valid data rows found in CSV file");
              }

              // Log for debugging
              console.log("Parsed CSV data:", {
                headers: results.meta.fields,
                rowCount: results.data.length,
                firstRow: results.data[0],
              });

              resolve(results.data);
            },
            error: (error: any) => {
              console.error("Papa Parse error:", error);
              reject(new Error("Failed to parse CSV file"));
            },
          });
        } catch (error) {
          console.error("CSV parsing error details:", error);
          reject(error);
        }
      };

      reader.onerror = (error) => {
        console.error("FileReader error:", error);
        reject(new Error("Failed to read CSV file"));
      };

      if (selectedCsvFile) {
        reader.readAsText(selectedCsvFile);
      } else {
        reject(new Error("No file selected"));
      }
    });
  };

  const handleCsvImport = async () => {
    if (!selectedCsvFile) {
      toast.error("Please select a CSV file to import.");
      return;
    }

    try {
      setLoading(true);

      // Get user and company data
      const userEmail = localStorage.getItem("userEmail");
      if (!userEmail) throw new Error("User not authenticated");

      const userResponse = await fetch(
        `${baseUrl}/api/user/config?email=${encodeURIComponent(userEmail)}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          credentials: "include",
        }
      );

      if (!userResponse.ok) throw new Error("Failed to fetch user config");
      const userData = await userResponse.json();
      const companyId = userData?.company_id;
      if (!companyId) throw new Error("Company ID not found!");

      // Parse CSV data
      const csvContacts = await parseCSV();

      // Define standard field mappings (case-insensitive)
      const standardFields = {
        phone: [
          "phone",
          "mobile",
          "tel",
          "telephone",
          "contact number",
          "phone number",
        ],
        contactName: [
          "contactname",
          "contact name",
          "name",
          "full name",
          "customer name",
        ],
        email: ["email", "e-mail", "mail"],
        lastName: ["lastname", "last name", "surname", "family name"],
        companyName: ["companyname", "company name", "company", "organization"],
        address1: ["address1", "address", "street address", "location"],
        city: ["city", "town"],
        state: ["state", "province", "region"],
        postalCode: [
          "postalcode",
          "postal code",
          "zip",
          "zip code",
          "postcode",
        ],
        country: ["country", "nation"],
        branch: ["branch", "department", "location"],
        expiryDate: [
          "expirydate",
          "expiry date",
          "expiration",
          "expire date",
          "expiry",
          "expiryDate",
        ],
        vehicleNumber: [
          "vehiclenumber",
          "vehicle number",
          "vehicle no",
          "car number",
          "vehiclenumber",
          "vehicle_number",
        ],
        ic: ["ic", "identification", "id number", "IC"],
        notes: ["notes", "note", "comments", "remarks"],
        leadNumber: ["lead_number", "leadnumber", "lead number"],
        phoneIndex: ["phone_index", "phoneindex", "phone index"],
      };

      // Validate and prepare contacts for import
      const validContacts = csvContacts.map((contact) => {
        const baseContact: any = {
          customFields: {},
          tags: [...selectedImportTags],
          ic: null,
          expiryDate: null,
          vehicleNumber: null,
          branch: null,
          contactName: null,
          email: null,
          phone: null,
          address1: null,
        };

        Object.entries(contact).forEach(([header, value]) => {
          const headerLower = header.toLowerCase().trim();

          // Check if the header is a tag column (tag 1 through tag 10)
          const tagMatch = headerLower.match(/^tag\s*(\d+)$/);
          if (tagMatch && Number(tagMatch[1]) <= 10) {
            if (value && typeof value === "string" && value.trim()) {
              baseContact.tags.push(value.trim());
            }
            return;
          }

          // Try to match with standard fields
          let matched = false;
          for (const [fieldName, aliases] of Object.entries(standardFields)) {
            const fieldNameLower = fieldName.toLowerCase();
            if (
              aliases.map((a) => a.toLowerCase()).includes(headerLower) ||
              headerLower === fieldNameLower
            ) {
              if (fieldName === "phone") {
                const cleanedPhone = cleanPhoneNumber(value as string);
                if (cleanedPhone) {
                  baseContact[fieldName] = cleanedPhone;
                }
              } else if (fieldName === "notes") {
                baseContact["notes"] = value || "";
              } else if (
                fieldName === "expiryDate" ||
                fieldName === "ic" ||
                fieldName === "phoneIndex" ||
                fieldName === "leadNumber"
              ) {
                baseContact[fieldName] = value || null;
              } else {
                baseContact[fieldName] = value || "";
              }
              matched = true;
              break;
            }
          }

          // If no match found and value exists, add as custom field
          if (!matched && value && !header.match(/^\d+$/)) {
            baseContact.customFields[header] = value;
          }
        });

        baseContact.tags = [...new Set(baseContact.tags)];
        return baseContact;
      });

      // Filter out contacts without valid phone numbers
      const contactsWithValidPhones = validContacts.filter(
        (contact) => contact.phone
      );

      if (contactsWithValidPhones.length === 0) {
        throw new Error(
          "No valid contacts found in CSV. Please ensure phone numbers are present."
        );
      }

      if (contactsWithValidPhones.length < validContacts.length) {
        toast.warning(
          `Skipped ${validContacts.length - contactsWithValidPhones.length
          } contacts due to invalid phone numbers.`
        );
      }

      // Prepare contacts for SQL backend
      const contactsToImport = contactsWithValidPhones.map((contact) => {
        const formattedPhone = formatPhoneNumber(contact.phone);
        const contact_id = companyId + "-" + formattedPhone.split("+")[1];
        const chat_id = formattedPhone.split("+")[1] + "@c.us";
        return {
          contact_id,
          companyId,
          contactName: contact.contactName,
          name: contact.contactName,
          last_name: contact.lastName,
          email: contact.email,
          phone: formattedPhone,
          address1: contact.address1,
          companyName: contact.companyName,
          locationId: contact.locationId,
          dateAdded: new Date().toISOString(),
          unreadCount: 0,

          branch: contact.branch,
          expiryDate: contact.expiryDate,
          vehicleNumber: contact.vehicleNumber,
          ic: contact.ic,
          chat_id: chat_id,
          notes: contact.notes,
          customFields: contact.customFields,
          tags: contact.tags,
          phoneIndex: contact.phoneIndex,
          leadNumber: contact.leadNumber,
        };
      });

      // Send contacts in bulk to your SQL backend
      const response = await axios.post(`${baseUrl}/api/contacts/bulk`, {
        contacts: contactsToImport,
      });

      if (response.data.success) {
        toast.success(
          `Successfully imported ${contactsToImport.length} contacts!`
        );
        setShowCsvImportModal(false);
        setSelectedCsvFile(null);
        setSelectedImportTags([]);
        setImportTags([]);
        await fetchContacts();
      } else {
        toast.error(response.data.message || "Failed to import contacts");
      }
    } catch (error) {
      console.error("CSV Import Error:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to import contacts"
      );
    } finally {
      setLoading(false);
    }
  };

  // Add these to your existing state declarations
  const [qrCodes, setQrCodes] = useState<QRCodeData[]>([]);
  const [isLoadingStatus, setIsLoadingStatus] = useState(false);
  const [selectedPhone, setSelectedPhone] = useState<number | null>(null);

  // Add this helper function to get status color and text
  const getStatusInfo = (status: string) => {
    const statusLower = status?.toLowerCase() || "";

    // Check if the phone is connected (consistent with Chat component)
    const isConnected =
      statusLower === "ready" || statusLower === "authenticated";

    if (isConnected) {
      return {
        color:
          "bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-200",
        text: "Connected",
        icon: "CheckCircle" as const,
      };
    }

    // For other statuses, provide more detailed information
    switch (statusLower) {
      case "qr":
        return {
          color:
            "bg-yellow-100 text-yellow-800 dark:bg-yellow-800 dark:text-yellow-200",
          text: "Needs QR Scan",
          icon: "QrCode" as const,
        };
      case "connecting":
        return {
          color:
            "bg-blue-100 text-blue-800 dark:bg-blue-800 dark:text-blue-200",
          text: "Connecting",
          icon: "Loader" as const,
        };
      case "disconnected":
        return {
          color: "bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-200",
          text: "Disconnected",
          icon: "XCircle" as const,
        };
      default:
        return {
          color:
            "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200",
          text: "Not Connected", // Changed from 'Unknown' to 'Not Connected' to match Chat component
          icon: "HelpCircle" as const,
        };
    }
  };

  // Add this helper function to get phone name
  const getPhoneName = (phoneIndex: number) => {
    // First check if we have a name in the phoneNames object
    if (phoneNames[phoneIndex]) {
      return phoneNames[phoneIndex];
    }

    // If not found in phoneNames but we have a special company ID, use predefined names
    if (companyId === "0123") {
      if (phoneIndex === 0) return "Revotrend";
      if (phoneIndex === 1) return "Storeguru";
      if (phoneIndex === 2) return "ShipGuru";
      return `Phone ${phoneIndex + 1}`;
    }

    // Default fallback - consistent with Chat component
    return `Phone ${phoneIndex + 1}`;
  };

  // Add this effect to fetch phone statuses periodically
  useEffect(() => {
    const fetchPhoneStatuses = async () => {
      try {
        console.log("fetching status");
        setIsLoadingStatus(true);

        const botStatusResponse = await axios.get(
          `${baseUrl}/api/bot-status/${companyId}`
        );

        if (botStatusResponse.status === 200) {
          const data: BotStatusResponse = botStatusResponse.data;
          let qrCodesData: QRCodeData[] = [];

          // Check if phones array exists before mapping
          if (data.phones && Array.isArray(data.phones)) {
            // Multiple phones: transform array to QRCodeData[]
            qrCodesData = data.phones.map((phone: any) => ({
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

          // If no phone is selected and we have connected phones, select the first connected one
          if (selectedPhone === null && qrCodesData.length > 0) {
            const connectedPhoneIndex = qrCodesData.findIndex(
              (phone: { status: string }) =>
                phone.status === "ready" || phone.status === "authenticated"
            );
            if (connectedPhoneIndex !== -1) {
              setSelectedPhone(connectedPhoneIndex);
            }
          }
        }
      } catch (error) {
        console.error("Error fetching phone statuses:", error);
      } finally {
        setIsLoadingStatus(false);
      }
    };

    if (companyId) {
      fetchPhoneStatuses();
      // Refresh status every 30 seconds
      const intervalId = setInterval(fetchPhoneStatuses, 30000);
      return () => clearInterval(intervalId);
    }
  }, [companyId, selectedPhone]);

  // Helper functions for the modern layout
  const removeTagFilter = (tag: string) => {
    setSelectedTagFilters((prev) => prev.filter((t) => t !== tag));
  };

  const clearAllSelections = () => {
    setSelectedContacts([]);
  };

  const handleContactCheckboxChange = (contact: Contact) => {
    const isSelected = selectedContacts.some(
      (selectedContact) =>
        selectedContact.id === contact.id ||
        selectedContact.phone === contact.phone
    );

    if (isSelected) {
      setSelectedContacts((prev) =>
        prev.filter((c) => c.id !== contact.id && c.phone !== contact.phone)
      );
    } else {
      setSelectedContacts((prev) => [...prev, contact]);
    }
  };

  const filterRecipients = (chatIds: string[] | undefined, search: string) => {
    if (!chatIds || !Array.isArray(chatIds)) {
      return [];
    }
    return chatIds.filter((chatId) => {
      // Extract phone number from different chatId formats
      let phoneNumber = "";

      if (chatId.includes("@")) {
        // Format: "60123456789@c.us" or "60123456789@s.whatsapp.net"
        phoneNumber = chatId.split("@")[0];
      } else if (chatId.includes("-")) {
        // Format: "companyId-60123456789"
        phoneNumber = chatId.split("-")[1];
      } else {
        // Just the phone number
        phoneNumber = chatId;
      }

      // Clean the phone number and add + if not present
      if (phoneNumber && !phoneNumber.startsWith("+")) {
        phoneNumber = "+" + phoneNumber;
      }

      // Find the contact by matching phone numbers
      const contact = contacts.find((c) => {
        if (!c.phone) return false;
        const cleanContactPhone = c.phone.replace(/\D/g, "");
        const cleanSearchPhone = phoneNumber.replace(/\D/g, "");
        return cleanContactPhone === cleanSearchPhone;
      });

      const contactName = contact?.contactName || phoneNumber;

      return (
        contactName.toLowerCase().includes(search.toLowerCase()) ||
        phoneNumber.includes(search) ||
        (contact?.phone && contact.phone.includes(search))
      );
    });
  };
  // Add this function to filter scheduled messages
  const getFilteredScheduledMessages = () => {
    if (!searchQuery) return scheduledMessages;

    return scheduledMessages.filter((message) => {
      // Check if message content matches search
      if (message.message?.toLowerCase().includes(searchQuery.toLowerCase())) {
        return true;
      }

      // Check if messageContent matches search
      if (
        message.messageContent
          ?.toLowerCase()
          .includes(searchQuery.toLowerCase())
      ) {
        return true;
      }

      // Check if any recipient matches search (search through contact names)
      if (message.chatIds && Array.isArray(message.chatIds)) {
        const matchingRecipients = filterRecipients(
          message.chatIds,
          searchQuery
        );
        return matchingRecipients.length > 0;
      }

      // Also check contactIds format if chatIds is not available
      if (message.contactIds && Array.isArray(message.contactIds)) {
        const matchingRecipients = filterRecipients(
          message.contactIds,
          searchQuery
        );
        return matchingRecipients.length > 0;
      }

      // Check single contactId
      if (message.contactId) {
        const matchingRecipients = filterRecipients(
          [message.contactId],
          searchQuery
        );
        return matchingRecipients.length > 0;
      }

      return false;
    });
  };

  // Helper function to apply advanced filters to scheduled messages
  const applyAdvancedFilters = (messages: ScheduledMessage[]) => {
    let filteredMessages = messages;

    // First apply search filter if there's a search query
    if (searchQuery) {
      filteredMessages = filteredMessages.filter((message) => {
        // Check if message content matches search
        if (
          message.message?.toLowerCase().includes(searchQuery.toLowerCase())
        ) {
          return true;
        }

        // Check if messageContent matches search
        if (
          message.messageContent
            ?.toLowerCase()
            .includes(searchQuery.toLowerCase())
        ) {
          return true;
        }

        // Check if any recipient matches search (search through contact names)
        if (message.chatIds && Array.isArray(message.chatIds)) {
          const matchingRecipients = filterRecipients(
            message.chatIds,
            searchQuery
          );
          if (matchingRecipients.length > 0) return true;
        }

        // Also check contactIds format if chatIds is not available
        if (message.contactIds && Array.isArray(message.contactIds)) {
          const matchingRecipients = filterRecipients(
            message.contactIds,
            searchQuery
          );
          if (matchingRecipients.length > 0) return true;
        }

        // Check single contactId
        if (message.contactId) {
          const matchingRecipients = filterRecipients(
            [message.contactId],
            searchQuery
          );
          if (matchingRecipients.length > 0) return true;
        }

        return false;
      });
    }

    return filteredMessages.filter((message) => {
      // Status filter
      if (messageStatusFilter && message.status !== messageStatusFilter) {
        return false;
      }

      // Date filter
      if (messageDateFilter && message.scheduledTime) {
        const messageDate = new Date(message.scheduledTime);
        const now = new Date();
        const today = new Date(
          now.getFullYear(),
          now.getMonth(),
          now.getDate()
        );
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        switch (messageDateFilter) {
          case "today":
            if (messageDate < today || messageDate >= tomorrow) return false;
            break;
          case "tomorrow":
            if (
              messageDate < tomorrow ||
              messageDate >= new Date(tomorrow.getTime() + 24 * 60 * 60 * 1000)
            )
              return false;
            break;
          case "this-week":
            const weekStart = new Date(today);
            weekStart.setDate(weekStart.getDate() - weekStart.getDay());
            const weekEnd = new Date(weekStart);
            weekEnd.setDate(weekEnd.getDate() + 7);
            if (messageDate < weekStart || messageDate >= weekEnd) return false;
            break;
          case "next-week":
            const nextWeekStart = new Date(today);
            nextWeekStart.setDate(
              nextWeekStart.getDate() - nextWeekStart.getDay() + 7
            );
            const nextWeekEnd = new Date(nextWeekStart);
            nextWeekEnd.setDate(nextWeekEnd.getDate() + 7);
            if (messageDate < nextWeekStart || messageDate >= nextWeekEnd)
              return false;
            break;
          case "this-month":
            if (
              messageDate.getMonth() !== now.getMonth() ||
              messageDate.getFullYear() !== now.getFullYear()
            )
              return false;
            break;
          case "next-month":
            const nextMonth = new Date(
              now.getFullYear(),
              now.getMonth() + 1,
              1
            );
            if (
              messageDate < nextMonth ||
              messageDate.getMonth() !== nextMonth.getMonth()
            )
              return false;
            break;
        }
      }

      // Message type filter
      if (messageTypeFilter) {
        switch (messageTypeFilter) {
          case "text":
            if (
              message.mediaUrl ||
              message.documentUrl ||
              (message.messages && message.messages.length > 1)
            )
              return false;
            break;
          case "media":
            if (!message.mediaUrl) return false;
            break;
          case "document":
            if (!message.documentUrl) return false;
            break;
          case "multiple":
            if (!message.messages || message.messages.length <= 1) return false;
            break;
        }
      }

      // Recipient filter
      if (messageRecipientFilter) {
        const hasMultipleRecipients =
          Array.isArray(message.contactIds) && message.contactIds.length > 1;
        if (messageRecipientFilter === "single" && hasMultipleRecipients)
          return false;
        if (messageRecipientFilter === "multiple" && !hasMultipleRecipients)
          return false;
      }

      return true;
    });
  };
  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');
        .neo-brutalist {
          font-family: 'Inter', sans-serif;
        }
        .neo-border {
          border: 2px solid #4b4b4b;
        }
        .neo-shadow {
          box-shadow: 4px 4px 0 #4b4b4b;
        }
        .neo-shadow-orange {
          box-shadow: 4px 4px 0 #f26522;
        }
        .neo-shadow-green {
          box-shadow: 4px 4px 0 #10b981;
        }
        .neo-shadow-blue {
          box-shadow: 4px 4px 0 #3b82f6;
        }
        .neo-shadow-hover:hover {
          transform: translate(-4px, -4px);
          box-shadow: 8px 8px 0 #4b4b4b;
        }
        .neo-btn-primary {
          background: #f26522;
          color: white;
          border: 2px solid #f26522;
          border-radius: 0;
          font-weight: 700;
          text-transform: uppercase;
          transition: all 0.2s ease;
        }
        .neo-btn-primary:active {
          transform: translate(2px, 2px);
          box-shadow: none;
        }
        .neo-btn-primary:hover:not(:disabled) {
          transform: translate(-2px, -2px);
          box-shadow: 4px 4px 0 #4b4b4b;
        }
        .neo-btn-secondary {
          background: white;
          color: #4b4b4b;
          border: 2px solid #4b4b4b;
          border-radius: 0;
          font-weight: 700;
          text-transform: uppercase;
          transition: all 0.2s ease;
        }
        .neo-btn-secondary:active {
          transform: translate(2px, 2px);
          box-shadow: none;
        }
        .neo-btn-secondary:hover:not(:disabled) {
          transform: translate(-2px, -2px);
          box-shadow: 4px 4px 0 #f26522;
        }
        .neo-input {
          border: 2px solid #e8e8e8;
          border-radius: 0;
          transition: all 0.2s ease;
          outline: none;
        }
        .neo-input:focus {
          border-color: #f26522;
          box-shadow: 4px 4px 0 rgba(242,101,34,0.15);
        }
        .neo-glass {
          background: white;
          border: 2px solid #4b4b4b;
        }
      `}</style>
      {/* Modern Neo-Brutalist Layout */}
      <div className="neo-brutalist h-screen bg-[#ffffff] overflow-auto relative">
        {/* Subtle Background Pattern */}
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMSIgY3k9IjEiIHI9IjEiIGZpbGw9IiNlOGU4ZTgiLz48L3N2Zz4=')] opacity-50 pointer-events-none" />

        {/* Top Navigation Bar with Neo-Brutalist Effect */}
        <div className="sticky top-0 z-50 bg-[#ffffff] border-b-2 border-[#4b4b4b]">
          <div className="max-w-[96rem] mx-auto px-6 py-6 font-bold">
            <div className="flex items-center justify-between">
              {/* Page Title & Stats */}
              <div className="flex items-center space-x-8">
                <div>
                  <div className="flex items-center space-x-3 mb-2">
                    <div className="p-2.5 bg-[#4b4b4b] text-white neo-shadow-orange">
                      <Lucide
                        icon="Users"
                        className="w-6 h-6"
                      />
                    </div>
                    <h1 className="text-3xl font-black text-[#4b4b4b] uppercase tracking-tight">
                      Contacts
                    </h1>
                  </div>
                  <p className="text-sm text-slate-500 dark:text-slate-400 font-medium ml-14">
                    {filteredContactsSearch.length} of {contacts.length}{" "}
                    contacts
                  </p>
                </div>

                {/* Enhanced Quick Stats Cards */}
                <div className="hidden lg:flex items-center space-x-6">
                  <div className="group relative bg-[#ffffff] border-2 border-[#10b981] neo-shadow-green px-5 py-3 transition-transform duration-300 transform-gpu hover:-translate-y-1 hover:-translate-x-1 hover:shadow-[6px_6px_0px_#10b981]">
                    <div className="relative flex items-center space-x-2">
                      <div className="p-1.5 bg-[#10b981] text-white">
                        <Lucide
                          icon="CheckSquare"
                          className="w-3.5 h-3.5"
                        />
                      </div>
                      <span className="text-sm font-black text-[#4b4b4b] uppercase tracking-widest">
                        {selectedContacts.length} Selected
                      </span>
                    </div>
                  </div>
                  <div className="group relative bg-[#ffffff] border-2 border-[#3b82f6] neo-shadow-blue px-5 py-3 transition-transform duration-300 transform-gpu hover:-translate-y-1 hover:-translate-x-1 hover:shadow-[6px_6px_0px_#3b82f6]">
                    <div className="relative flex items-center space-x-2">
                      <div className="p-1.5 bg-[#3b82f6] text-white">
                        <Lucide
                          icon="Calendar"
                          className="w-3.5 h-3.5"
                        />
                      </div>
                      <span className="text-sm font-black text-[#4b4b4b] uppercase tracking-widest">
                        {scheduledMessages.length} Scheduled
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Enhanced Primary Actions */}
              <div className="flex items-center space-x-3">
                <button
                  className="hidden sm:flex items-center space-x-2 neo-btn-secondary px-4 py-2.5 disabled:opacity-50"
                  onClick={() => {
                    if (userRole !== "3") {
                      setShowCsvImportModal(true);
                    } else {
                      toast.error(
                        "You don't have permission to import CSV files."
                      );
                    }
                  }}
                  disabled={userRole === "3"}
                >
                  <Lucide icon="Upload" className="w-4 h-4" />
                  <span>Import</span>
                </button>

                <button
                  className="flex items-center space-x-2 neo-btn-primary px-4 py-2.5 disabled:opacity-50"
                  onClick={() => {
                    if (userRole !== "3") {
                      setAddContactModal(true);
                    } else {
                      toast.error("You don't have permission to add contacts.");
                    }
                  }}
                  disabled={userRole === "3"}
                >
                  <Lucide icon="Plus" className="w-4 h-4" />
                  <span>Add Contact</span>
                </button>

                <button
                  className="flex items-center space-x-2 neo-btn-secondary px-4 py-2.5 disabled:opacity-50"
                  onClick={() => {
                    if (userRole !== "3") {
                      setBlastMessageModal(true);
                    } else {
                      toast.error(
                        "You don't have permission to send blast messages."
                      );
                    }
                  }}
                  disabled={userRole === "3"}
                >
                  <Lucide icon="Send" className="w-4 h-4" />
                  <span>Blast Message</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Area with Neo-Brutalist Effect */}
        <div className="max-w-[96rem] mx-auto px-6 py-8">
          {/* Search & Filter Bar with Modern Neo-Brutalist Effect */}
          <div className="relative bg-[#ffffff] border-2 border-[#4b4b4b] neo-shadow p-8 mb-8">
            <div className="relative flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-6 lg:space-y-0 lg:space-x-8">
              {/* Enhanced Search Input */}
              <div className="flex-1 max-w-md">
                <div className="relative group">
                  <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-[#4b4b4b]">
                    <Lucide icon="Search" className="w-5 h-5" />
                  </div>
                  <FormInput
                    type="text"
                    placeholder="Search contacts..."
                    className="neo-input pl-12 pr-4 py-3 w-full text-[#4b4b4b] font-bold placeholder:text-gray-400"
                    value={searchQuery}
                    onChange={handleSearchChange}
                  />
                </div>
              </div>

              {/* Enhanced Filter Controls */}
              <div className="flex flex-wrap items-center gap-4">
                {/* Modern Bulk Selection */}
                <div className="flex items-center space-x-2 bg-[#ffffff] border-2 border-[#4b4b4b] p-1 neo-shadow">
                  <button
                    className="flex items-center space-x-2 neo-btn-secondary px-3 py-2 text-xs"
                    onClick={handleSelectAll}
                  >
                    <Lucide icon="CheckSquare" className="w-3.5 h-3.5" />
                    <span>All</span>
                  </button>
                  <button
                    className="flex items-center space-x-2 neo-btn-secondary px-3 py-2 text-xs border-[#10b981]"
                    onClick={handleSelectCurrentPage}
                  >
                    <Lucide icon="Square" className="w-3.5 h-3.5 text-[#10b981]" />
                    <span className="text-[#10b981]">Page</span>
                  </button>
                </div>

                {/* Modern Quick Filters */}
                <button
                  className="flex items-center space-x-2 neo-btn-secondary px-4 py-2"
                  onClick={() => setShowFiltersModal(true)}
                >
                  <Lucide icon="Tag" className="w-4 h-4" />
                  <span>Tags</span>
                </button>

                <button
                  className="flex items-center space-x-2 neo-btn-secondary px-4 py-2"
                  onClick={() => setShowDateFilterModal(true)}
                >
                  <Lucide icon="Calendar" className="w-4 h-4" />
                  <span>Date</span>
                </button>

                <button
                  className="flex items-center space-x-2 neo-btn-secondary px-4 py-2"
                  onClick={() => setShowColumnsModal(true)}
                >
                  <Lucide icon="Grid2x2" className="w-4 h-4" />
                  <span>Columns</span>
                </button>
              </div>
            </div>

            {/* Enhanced Active Filters */}
            {(selectedTagFilters.length > 0 ||
              excludedTagFilters.length > 0 ||
              selectedUserFilters.length > 0 ||
              excludedUserFilters.length > 0 ||
              selectedContacts.length > 0) && (
                <div className="relative flex flex-wrap items-center gap-4 mt-8 pt-6 border-t border-white/30 dark:border-slate-600/40">
                  {/* Included Tag Filters */}
                  {selectedTagFilters.map((tag, index) => (
                    <div
                      key={`include-${index}`}
                      className="group flex items-center bg-gradient-to-r from-emerald-500/15 to-green-500/10 dark:from-emerald-400/15 dark:to-green-400/10 backdrop-blur-xl border border-emerald-200/50 dark:border-emerald-700/50 text-emerald-700 dark:text-emerald-300 px-4 py-2.5 rounded-full text-sm font-semibold transition-all duration-300 hover:bg-emerald-500/25 dark:hover:bg-emerald-400/25 hover:scale-105 transform-gpu hover:shadow-lg"
                    >
                      <div className="flex items-center space-x-2">
                        <div className="p-1 rounded-full bg-gradient-to-br from-emerald-500/30 to-green-500/30 dark:from-emerald-400/30 dark:to-green-400/30">
                          <Lucide
                            icon="Check"
                            className="w-3 h-3 text-emerald-600 dark:text-emerald-400"
                          />
                        </div>
                        <span>Include: {tag}</span>
                      </div>
                      <button
                        className="ml-3 p-1 rounded-full hover:bg-red-500/20 dark:hover:bg-red-400/20 transition-all duration-200 group-hover:scale-110"
                        onClick={() => setTagFilterState(tag, "none")}
                      >
                        <Lucide
                          icon="X"
                          className="w-3.5 h-3.5 text-red-500 hover:text-red-600"
                        />
                      </button>
                    </div>
                  ))}

                  {/* Excluded Tag Filters */}
                  {excludedTagFilters.map((tag, index) => (
                    <div
                      key={`exclude-${index}`}
                      className="group flex items-center bg-gradient-to-r from-red-500/15 to-pink-500/10 dark:from-red-400/15 dark:to-pink-400/10 backdrop-blur-xl border border-red-200/50 dark:border-red-700/50 text-red-700 dark:text-red-300 px-4 py-2.5 rounded-full text-sm font-semibold transition-all duration-300 hover:bg-red-500/25 dark:hover:bg-red-400/25 hover:scale-105 transform-gpu hover:shadow-lg"
                    >
                      <div className="flex items-center space-x-2">
                        <div className="p-1 rounded-full bg-gradient-to-br from-red-500/30 to-pink-500/30 dark:from-red-400/30 dark:to-pink-400/30">
                          <Lucide
                            icon="X"
                            className="w-3 h-3 text-red-600 dark:text-red-400"
                          />
                        </div>
                        <span>Exclude: {tag}</span>
                      </div>
                      <button
                        className="ml-3 p-1 rounded-full hover:bg-red-500/20 dark:hover:bg-red-400/20 transition-all duration-200 group-hover:scale-110"
                        onClick={() => setTagFilterState(tag, "none")}
                      >
                        <Lucide
                          icon="X"
                          className="w-3.5 h-3.5 text-red-500 hover:text-red-600"
                        />
                      </button>
                    </div>
                  ))}

                  {/* Included User Filters */}
                  {selectedUserFilters.map((user, index) => (
                    <div
                      key={`include-user-${index}`}
                      className="group flex items-center bg-gradient-to-r from-teal-500/15 to-cyan-500/10 dark:from-teal-400/15 dark:to-cyan-400/10 backdrop-blur-xl border border-teal-200/50 dark:border-teal-700/50 text-teal-700 dark:text-teal-300 px-4 py-2.5 rounded-full text-sm font-semibold transition-all duration-300 hover:bg-teal-500/25 dark:hover:bg-teal-400/25 hover:scale-105 transform-gpu hover:shadow-lg"
                    >
                      <div className="flex items-center space-x-2">
                        <div className="p-1 rounded-full bg-gradient-to-br from-teal-500/30 to-cyan-500/30 dark:from-teal-400/30 dark:to-cyan-400/30">
                          <Lucide
                            icon="User"
                            className="w-3 h-3 text-teal-600 dark:text-teal-400"
                          />
                        </div>
                        <span>User: {user}</span>
                      </div>
                      <button
                        className="ml-3 p-1 rounded-full hover:bg-red-500/20 dark:hover:bg-red-400/20 transition-all duration-200 group-hover:scale-110"
                        onClick={() => setUserFilterState(user, "none")}
                      >
                        <Lucide
                          icon="X"
                          className="w-3.5 h-3.5 text-red-500 hover:text-red-600"
                        />
                      </button>
                    </div>
                  ))}

                  {/* Excluded User Filters */}
                  {excludedUserFilters.map((user, index) => (
                    <div
                      key={`exclude-user-${index}`}
                      className="group flex items-center bg-gradient-to-r from-red-500/15 to-pink-500/10 dark:from-red-400/15 dark:to-pink-400/10 backdrop-blur-xl border border-red-200/50 dark:border-red-700/50 text-red-700 dark:text-red-300 px-4 py-2.5 rounded-full text-sm font-semibold transition-all duration-300 hover:bg-red-500/25 dark:hover:bg-red-400/25 hover:scale-105 transform-gpu hover:shadow-lg"
                    >
                      <div className="flex items-center space-x-2">
                        <div className="p-1 rounded-full bg-gradient-to-br from-red-500/30 to-pink-500/30 dark:from-red-400/30 dark:to-pink-400/30">
                          <Lucide
                            icon="UserX"
                            className="w-3 h-3 text-red-600 dark:text-red-400"
                          />
                        </div>
                        <span>Exclude User: {user}</span>
                      </div>
                      <button
                        className="ml-3 p-1 rounded-full hover:bg-red-500/20 dark:hover:bg-red-400/20 transition-all duration-200 group-hover:scale-110"
                        onClick={() => setUserFilterState(user, "none")}
                      >
                        <Lucide
                          icon="X"
                          className="w-3.5 h-3.5 text-red-500 hover:text-red-600"
                        />
                      </button>
                    </div>
                  ))}

                  {/* Selected Contacts Filter */}
                  {selectedContacts.length > 0 && (
                    <div className="group flex items-center bg-gradient-to-r from-emerald-500/15 to-green-500/10 dark:from-emerald-400/15 dark:to-green-400/10 backdrop-blur-xl border border-emerald-200/50 dark:border-emerald-700/50 text-emerald-700 dark:text-emerald-300 px-4 py-2.5 rounded-full text-sm font-semibold transition-all duration-300 hover:bg-emerald-500/25 dark:hover:bg-emerald-400/25 hover:scale-105 transform-gpu hover:shadow-lg">
                      <div className="flex items-center space-x-2">
                        <div className="p-1 rounded-full bg-gradient-to-br from-emerald-500/30 to-green-500/30 dark:from-emerald-400/30 dark:to-green-400/30">
                          <Lucide
                            icon="Users"
                            className="w-3 h-3 text-emerald-600 dark:text-emerald-400"
                          />
                        </div>
                        <span>{selectedContacts.length} Selected</span>
                      </div>
                      <button
                        className="ml-3 p-1 rounded-full hover:bg-red-500/20 dark:hover:bg-red-400/20 transition-all duration-200 group-hover:scale-110"
                        onClick={clearAllSelections}
                      >
                        <Lucide
                          icon="X"
                          className="w-3.5 h-3.5 text-red-500 hover:text-red-600"
                        />
                      </button>
                    </div>
                  )}
                </div>
              )}
          </div>

          {/* Two-Column Layout */}
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Main Content with Neo-Brutalist Effect */}
            <div className="lg:flex-1 min-w-0">
              <div className="relative bg-[#ffffff] border-2 border-[#4b4b4b] neo-shadow overflow-hidden">
                {/* Enhanced Table Header */}
                <div className="relative px-8 py-6 border-b-2 border-[#4b4b4b] bg-[#f8f9fa]">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="p-2.5 bg-[#4b4b4b] text-white neo-shadow-orange">
                        <Lucide
                          icon="Database"
                          className="w-5 h-5"
                        />
                      </div>
                      <div>
                        <h3 className="text-2xl font-black text-[#4b4b4b] uppercase tracking-tight">
                          Contacts
                        </h3>
                        <p className="text-xs text-[#f26522] font-bold mt-0.5">
                          Manage your contact database
                        </p>
                      </div>
                    </div>

                    {/* Enhanced Table Actions */}
                    <div className="flex items-center space-x-3">
                      <button
                        className="flex items-center space-x-2 px-4 py-2 bg-white text-red-600 border-2 border-red-600 font-bold uppercase disabled:opacity-50 transition-all duration-300 hover:not(:disabled):-translate-y-1 hover:not(:disabled):-translate-x-1 hover:not(:disabled):shadow-[4px_4px_0_#ef4444]"
                        onClick={() => setShowMassDeleteModal(true)}
                        disabled={selectedContacts.length === 0}
                      >
                        <Lucide icon="Trash2" className="w-4 h-4" />
                        <span>Delete</span>
                      </button>
                    </div>
                  </div>
                </div>

                {/* Enhanced Contacts Table */}
                <div className="overflow-x-auto">
                  {isFetching ? (
                    <div className="flex justify-center items-center h-96">
                      <div className="text-center">
                        <LoadingIcon
                          icon="spinning-circles"
                          className="w-8 h-8 mx-auto text-[#f26522]"
                        />
                        <div className="mt-3 text-sm font-bold text-[#4b4b4b] uppercase tracking-widest">
                          Fetching Data...
                        </div>
                      </div>
                    </div>
                  ) : (
                    <table className="w-full text-left border-collapse">
                      <thead className="bg-[#4b4b4b] text-white border-b-4 border-[#f26522] font-black uppercase text-sm tracking-widest">
                        <tr>
                          <th className="px-6 py-4 text-left w-16">
                            <input
                              type="checkbox"
                              className="w-5 h-5 border-2 border-white bg-transparent appearance-none checked:bg-[#f26522] checked:border-[#f26522] cursor-pointer transition-colors relative
                                         before:content-[''] before:absolute before:top-[1px] before:left-[5px] before:w-[6px] before:h-[10px] before:border-r-2 before:border-b-2 before:border-white before:rotate-45 before:opacity-0 checked:before:opacity-100"
                              checked={selectAll}
                              onChange={handleSelectAll}
                            />
                          </th>
                          <th
                            className="px-6 py-4 text-left cursor-pointer hover:bg-[#f26522] transition-colors group"
                            onClick={() => handleSort("contactName")}
                          >
                            <div className="flex items-center space-x-2">
                              <span>Contact</span>
                              {sortField === "contactName" && (
                                <Lucide
                                  icon={sortDirection === "asc" ? "ChevronUp" : "ChevronDown"}
                                  className="w-4 h-4 text-[#f26522] group-hover:text-white"
                                />
                              )}
                            </div>
                          </th>
                          <th
                            className="px-6 py-4 text-left cursor-pointer hover:bg-[#f26522] transition-colors group"
                            onClick={() => handleSort("phone")}
                          >
                            <div className="flex items-center space-x-2">
                              <span>Phone Number</span>
                              {sortField === "phone" && (
                                <Lucide
                                  icon={sortDirection === "asc" ? "ChevronUp" : "ChevronDown"}
                                  className="w-4 h-4 text-[#f26522] group-hover:text-white"
                                />
                              )}
                            </div>
                          </th>
                          <th className="px-6 py-4 text-left">Tags</th>
                          {visibleColumns.ic && (
                            <th
                              className="px-6 py-4 text-left cursor-pointer hover:bg-[#f26522] transition-colors group"
                              onClick={() => handleSort("ic")}
                            >
                              <div className="flex items-center space-x-2">
                                <span>IC Number</span>
                                {sortField === "ic" && (
                                  <Lucide
                                    icon={sortDirection === "asc" ? "ChevronUp" : "ChevronDown"}
                                    className="w-4 h-4 text-[#f26522] group-hover:text-white"
                                  />
                                )}
                              </div>
                            </th>
                          )}
                          {visibleColumns.vehicleNumber && (
                            <th
                              className="px-6 py-4 text-left cursor-pointer hover:bg-[#f26522] transition-colors group"
                              onClick={() => handleSort("vehicleNumber")}
                            >
                              <div className="flex items-center space-x-2">
                                <span>Vehicle Number</span>
                                {sortField === "vehicleNumber" && (
                                  <Lucide
                                    icon={sortDirection === "asc" ? "ChevronUp" : "ChevronDown"}
                                    className="w-4 h-4 text-[#f26522] group-hover:text-white"
                                  />
                                )}
                              </div>
                            </th>
                          )}
                          {visibleColumns.branch && (
                            <th
                              className="px-6 py-4 text-left cursor-pointer hover:bg-[#f26522] transition-colors group"
                              onClick={() => handleSort("branch")}
                            >
                              <div className="flex items-center space-x-2">
                                <span>Branch</span>
                                {sortField === "branch" && (
                                  <Lucide
                                    icon={sortDirection === "asc" ? "ChevronUp" : "ChevronDown"}
                                    className="w-4 h-4 text-[#f26522] group-hover:text-white"
                                  />
                                )}
                              </div>
                            </th>
                          )}
                          {visibleColumns.expiryDate && (
                            <th
                              className="px-6 py-4 text-left cursor-pointer hover:bg-[#f26522] transition-colors group"
                              onClick={() => handleSort("expiryDate")}
                            >
                              <div className="flex items-center space-x-2">
                                <span>Expiry Date</span>
                                {sortField === "expiryDate" && (
                                  <Lucide
                                    icon={sortDirection === "asc" ? "ChevronUp" : "ChevronDown"}
                                    className="w-4 h-4 text-[#f26522] group-hover:text-white"
                                  />
                                )}
                              </div>
                            </th>
                          )}
                          {visibleColumns.notes && (
                            <th className="px-6 py-4 text-left">Notes</th>
                          )}
                          <th
                            className="px-6 py-4 text-left cursor-pointer hover:bg-[#f26522] transition-colors group"
                            onClick={() => handleSort("createdAt")}
                          >
                            <div className="flex items-center space-x-2">
                              <span>Date Added</span>
                              {sortField === "createdAt" && (
                                <Lucide
                                  icon={sortDirection === "asc" ? "ChevronUp" : "ChevronDown"}
                                  className="w-4 h-4 text-[#f26522] group-hover:text-white"
                                />
                              )}
                            </div>
                          </th>
                          <th className="px-6 py-4 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y-2 divide-[#e8e8e8]">
                        {/* Map through actual contact data */}
                        {currentContacts.map((contact, index) => {
                          const isSelected = selectedContacts.some(
                            (selectedContact) =>
                              selectedContact.id === contact.id
                          );

                          return (
                            <tr
                              key={contact.id || index}
                              className="group relative hover:bg-[#f8f9fa] transition-colors duration-150 border-b-2 border-[#e8e8e8] last:border-b-0 font-medium text-[#4b4b4b]"
                            >
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="relative">
                                  <input
                                    type="checkbox"
                                    className="w-5 h-5 border-2 border-[#4b4b4b] bg-white appearance-none checked:bg-[#f26522] checked:border-[#f26522] cursor-pointer transition-colors relative
                                               before:content-[''] before:absolute before:top-[1px] before:left-[5px] before:w-[6px] before:h-[10px] before:border-r-2 before:border-b-2 before:border-white before:rotate-45 before:opacity-0 checked:before:opacity-100"
                                    checked={isSelected}
                                    onChange={() =>
                                      handleContactCheckboxChange(contact)
                                    }
                                  />
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="flex items-center group/contact">
                                  <div className="flex-shrink-0 h-10 w-10 relative">
                                    {contact.profileUrl ? (
                                      <div className="h-10 w-10 overflow-hidden border-2 border-[#4b4b4b] neo-shadow group-hover/contact:shadow-[4px_4px_0_#f26522] transition-shadow duration-300">
                                        <img
                                          src={contact.profileUrl}
                                          alt={
                                            contact.contactName ||
                                            contact.firstName ||
                                            "Contact"
                                          }
                                          className="w-full h-full object-cover grayscale group-hover/contact:grayscale-0 transition-all"
                                          onError={(e) => {
                                            const target = e.currentTarget as HTMLImageElement;
                                            const fallback = target.nextElementSibling as HTMLDivElement;
                                            if (fallback) {
                                              target.style.display = "none";
                                              fallback.style.display = "flex";
                                            }
                                          }}
                                        />
                                        <div className="hidden h-10 w-10 bg-[#e8e8e8] items-center justify-center text-[#4b4b4b] font-black text-sm uppercase">
                                          {contact.contactName
                                            ? contact.contactName.charAt(0)
                                            : contact.firstName?.charAt(0) || "U"}
                                        </div>
                                      </div>
                                    ) : (
                                      <div className="h-10 w-10 border-2 border-[#4b4b4b] bg-white neo-shadow group-hover/contact:shadow-[4px_4px_0_#f26522] transition-shadow flex items-center justify-center text-[#4b4b4b] font-black text-sm uppercase">
                                        {contact.contactName
                                          ? contact.contactName.charAt(0)
                                          : contact.firstName?.charAt(0) || "U"}
                                      </div>
                                    )}
                                  </div>
                                  <div className="ml-4">
                                    <div className="text-sm font-black text-[#4b4b4b] group-hover/contact:text-[#f26522] transition-colors duration-200">
                                      {contact.contactName ||
                                        `${contact.firstName || ""} ${contact.lastName || ""}`.trim() ||
                                        "Unknown"}
                                    </div>
                                  </div>
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="space-y-2">
                                  <div className="text-sm font-semibold text-slate-800 dark:text-slate-100">
                                    {contact.phone || "No phone"}
                                  </div>
                                  {contact.phone && (
                                    <button
                                      onClick={() => handleClick(contact.phone)}
                                      className="inline-flex items-center space-x-1.5 px-3 py-1.5 text-xs font-semibold text-blue-600 dark:text-blue-400 bg-gradient-to-r from-blue-50/80 to-blue-100/60 dark:from-blue-900/40 dark:to-blue-800/40 backdrop-blur-sm border border-blue-200/50 dark:border-blue-700/50 rounded-xl hover:from-blue-100/90 hover:to-blue-200/80 dark:hover:from-blue-800/60 dark:hover:to-blue-700/60 transition-all duration-200 hover:shadow-lg hover:shadow-blue-500/20 dark:hover:shadow-blue-500/30 hover:scale-105 transform-gpu"
                                    >
                                      <Lucide
                                        icon="MessageCircle"
                                        className="w-3 h-3"
                                      />
                                      <span>Open Chat</span>
                                    </button>
                                  )}
                                </div>
                              </td>
                              <td className="px-6 py-5 whitespace-nowrap">
                                <div className="flex flex-wrap gap-2">
                                  {contact.tags && contact.tags.length > 0 ? (
                                    contact.tags
                                      .slice(0, 2)
                                      .map((tag, tagIndex) => (
                                        <span
                                          key={tagIndex}
                                          className={`group/tag relative inline-flex items-center px-2 py-1 border-2 text-[10px] font-black uppercase transition-all shadow-[2px_2px_0_#4b4b4b] hover:-translate-y-0.5 hover:shadow-[3px_3px_0_#4b4b4b] ${employeeNames.some(
                                            (name) => name.toLowerCase() === tag.toLowerCase()
                                          )
                                            ? "bg-[#10b981] text-white border-[#4b4b4b]"
                                            : "bg-white text-[#4b4b4b] border-[#4b4b4b]"
                                            }`}
                                        >
                                          <span className="relative z-10">{tag}</span>
                                          {userRole !== "3" && (
                                            <button
                                              className="ml-1 text-red-600 hover:text-red-800 opacity-0 group-hover/tag:opacity-100 transition-all relative z-20"
                                              onClick={(e) => {
                                                e.stopPropagation();
                                                handleRemoveTag(contact.contact_id!, tag);
                                              }}
                                            >
                                              <Lucide icon="X" className="w-3 h-3" />
                                            </button>
                                          )}
                                        </span>
                                      ))
                                  ) : (
                                    <span className="inline-flex items-center px-2 py-1 text-[10px] font-bold text-gray-400 border-2 border-dashed border-gray-300">
                                      No tags
                                    </span>
                                  )}
                                  {contact.tags && contact.tags.length > 2 && (
                                    <div className="relative">
                                      <span
                                        className="inline-flex items-center px-2 py-1 border-2 border-[#4b4b4b] bg-[#e8e8e8] text-[10px] font-black uppercase text-[#4b4b4b] shadow-[2px_2px_0_#4b4b4b] hover:-translate-y-0.5 cursor-pointer"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          setHoveredContactTags(
                                            hoveredContactTags === contact.contact_id
                                              ? null
                                              : contact.contact_id
                                          );
                                        }}
                                      >
                                        +{contact.tags.length - 2}
                                      </span>
                                    </div>
                                  )}
                                </div>
                              </td>
                              {visibleColumns.ic && (
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <div className="font-bold text-[#4b4b4b]">
                                    {contact.ic || "-"}
                                  </div>
                                </td>
                              )}
                              {visibleColumns.vehicleNumber && (
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <div className="font-bold text-[#4b4b4b]">
                                    {contact.vehicleNumber || "-"}
                                  </div>
                                </td>
                              )}
                              {visibleColumns.branch && (
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <div className="font-bold text-[#4b4b4b]">
                                    {contact.branch || "-"}
                                  </div>
                                </td>
                              )}
                              {visibleColumns.expiryDate && (
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <div className="font-bold text-[#4b4b4b]">
                                    {contact.expiryDate
                                      ? new Date(contact.expiryDate).toLocaleDateString()
                                      : "-"}
                                  </div>
                                </td>
                              )}
                              {visibleColumns.notes && (
                                <td className="px-6 py-4 max-w-xs">
                                  <div className="truncate font-medium text-sm text-gray-500" title={contact.notes || ""}>
                                    {contact.notes || "-"}
                                  </div>
                                </td>
                              )}
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="font-bold text-[#4b4b4b]">
                                  {contact.createdAt
                                    ? new Date(contact.createdAt).toLocaleDateString()
                                    : contact.dateAdded
                                      ? new Date(contact.dateAdded).toLocaleDateString()
                                      : "Unknown"}
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-right">
                                <div className="flex items-center justify-end space-x-2">
                                  <button
                                    className="p-2 border-2 border-[#4b4b4b] bg-white text-[#4b4b4b] hover:bg-[#e8e8e8] hover:-translate-y-0.5 hover:shadow-[2px_2px_0_#4b4b4b] transition-all"
                                    onClick={() => {
                                      setCurrentContact(contact);
                                      setViewContactModal(true);
                                    }}
                                  >
                                    <Lucide icon="Eye" className="w-4 h-4" />
                                  </button>
                                  <button
                                    className="p-2 border-2 border-[#10b981] bg-white text-[#10b981] hover:bg-[#10b981] hover:text-white hover:-translate-y-0.5 hover:shadow-[2px_2px_0_#10b981] transition-all disabled:opacity-50"
                                    onClick={() => {
                                      setCurrentContact(contact);
                                      setEditContactModal(true);
                                    }}
                                    disabled={userRole === "3"}
                                  >
                                    <Lucide icon="Pencil" className="w-4 h-4" />
                                  </button>
                                  <button
                                    className="p-2 border-2 border-red-600 bg-white text-red-600 hover:bg-red-600 hover:text-white hover:-translate-y-0.5 hover:shadow-[2px_2px_0_#ef4444] transition-all disabled:opacity-50"
                                    onClick={() => {
                                      setCurrentContact(contact);
                                      setDeleteConfirmationModal(true);
                                    }}
                                    disabled={userRole === "3"}
                                  >
                                    <Lucide icon="Trash2" className="w-4 h-4" />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  )}
                </div>

                {/* Enhanced Table Footer with Pagination */}
                <div className="relative px-8 py-6 border-t-2 border-[#4b4b4b] bg-white">
                  <div className="relative flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="p-3 bg-[#4b4b4b] text-white neo-shadow-orange">
                        <Lucide icon="Database" className="w-5 h-5" />
                      </div>
                      <div className="bg-white border-2 border-[#4b4b4b] px-6 py-3 shadow-[4px_4px_0_#4b4b4b]">
                        <span className="text-sm font-black text-[#4b4b4b] uppercase tracking-wide">
                          Showing{" "}
                          <span className="text-[#f26522] font-black">
                            {itemOffset + 1}
                          </span>{" "}
                          to{" "}
                          <span className="text-[#f26522] font-black">
                            {Math.min(
                              itemOffset + itemsPerPage,
                              filteredContactsSearch.length
                            )}
                          </span>{" "}
                          of{" "}
                          <span className="text-[#10b981] font-black">
                            {filteredContactsSearch.length}
                          </span>{" "}
                          results
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center space-x-3">
                      <ReactPaginate
                        breakLabel={
                          <div className="px-4 py-3 text-sm font-black text-[#4b4b4b] uppercase border-2 border-[#4b4b4b] bg-white shadow-[2px_2px_0_#4b4b4b]">
                            ...
                          </div>
                        }
                        nextLabel={
                          <div className="group flex items-center space-x-2 px-5 py-3 text-sm font-black text-[#4b4b4b] uppercase bg-white border-2 border-[#4b4b4b] hover:-translate-y-1 hover:shadow-[4px_4px_0_#4b4b4b] transition-all duration-300 cursor-pointer">
                            <span>Next</span>
                            <Lucide icon="ChevronRight" className="w-4 h-4" />
                          </div>
                        }
                        onPageChange={handlePageClick}
                        pageRangeDisplayed={5}
                        pageCount={pageCount}
                        previousLabel={
                          <div className="group flex items-center space-x-2 px-5 py-3 text-sm font-black text-[#4b4b4b] uppercase bg-white border-2 border-[#4b4b4b] hover:-translate-y-1 hover:shadow-[4px_4px_0_#4b4b4b] transition-all duration-300 cursor-pointer">
                            <Lucide icon="ChevronLeft" className="w-4 h-4" />
                            <span>Prev</span>
                          </div>
                        }
                        renderOnZeroPageCount={null}
                        className="flex items-center space-x-2"
                        pageClassName=""
                        pageLinkClassName="relative group inline-flex items-center justify-center min-w-[44px] h-11 px-4 py-3 text-sm font-black text-[#4b4b4b] bg-white border-2 border-[#4b4b4b] transition-all duration-300 hover:-translate-y-1 hover:shadow-[4px_4px_0_#4b4b4b]"
                        activeClassName=""
                        activeLinkClassName="!bg-[#f26522] !text-white !shadow-[4px_4px_0_#4b4b4b]"
                        previousClassName="inline-flex"
                        nextClassName="inline-flex"
                        previousLinkClassName=""
                        nextLinkClassName=""
                        disabledClassName="opacity-40 cursor-not-allowed hover:shadow-none hover:translate-y-0"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Sidebar - Scheduled Messages, Quick Actions & Statistics (30% width) */}
            <div className="lg:w-80 lg:flex-shrink-0 space-y-8">
              {/* Scheduled Messages Panel */}
              <div className="bg-white border-2 border-[#4b4b4b] neo-shadow overflow-hidden">
                <div className="relative px-6 py-4 border-b-2 border-[#4b4b4b] bg-[#f8f9fa]">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="p-2.5 bg-[#4b4b4b] text-white neo-shadow-orange">
                        <Lucide icon="Calendar" className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="text-xl font-black text-[#4b4b4b] uppercase tracking-tight leading-tight">
                          Scheduled
                        </h3>
                        <p className="text-xs font-bold text-[#f26522] mt-0.5">
                          Manage automation
                        </p>
                      </div>
                      {/* Active Filters Indicator */}
                      {(messageStatusFilter ||
                        messageDateFilter ||
                        messageTypeFilter ||
                        messageRecipientFilter) && (
                          <div className="relative ml-2">
                            <span className="inline-flex items-center px-2 py-1 border-2 border-blue-500 bg-blue-100 text-blue-700 text-[10px] font-black uppercase shadow-[2px_2px_0_#3b82f6]">
                              Filtered
                            </span>
                          </div>
                        )}
                    </div>
                    <div className="flex items-center">
                      <button
                        className="p-2 border-2 border-[#4b4b4b] bg-white text-[#4b4b4b] hover:-translate-y-0.5 hover:shadow-[2px_2px_0_#4b4b4b] transition-all"
                        onClick={() => setScheduledMessagesModal(true)}
                      >
                        <Lucide icon="ExternalLink" className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>

                <div className="relative p-6 space-y-4 bg-white">
                  {/* Simplified View - Show max 3 most recent */}
                  {scheduledMessages && scheduledMessages.length > 0 ? (
                    <>
                      {applyAdvancedFilters(
                        combineScheduledMessages(getFilteredScheduledMessages())
                      )
                        .sort(
                          (a, b) =>
                            new Date(b.scheduledTime).getTime() -
                            new Date(a.scheduledTime).getTime()
                        )
                        .slice(0, 3)
                        .map((message, index) => (
                          <div
                            key={message.id || index}
                            className="group relative p-4 border-2 border-[#4b4b4b] bg-white transition-all duration-300 cursor-pointer hover:-translate-y-1 hover:-translate-x-1 hover:shadow-[4px_4px_0_#4b4b4b]"
                          >
                            <div className="relative flex items-start justify-between">
                              <div className="flex-1 min-w-0">
                                <div className="flex items-start space-x-3 mb-3">
                                  <div className="p-2 border-2 border-[#4b4b4b] bg-[#e8e8e8] text-[#4b4b4b]">
                                    <Lucide icon="MessageSquare" className="w-4 h-4" />
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <p className="text-sm font-black text-[#4b4b4b] leading-tight line-clamp-2">
                                      {message.messageContent ||
                                        message.message ||
                                        "Untitled Campaign"}
                                    </p>
                                    <p className="text-xs text-gray-500 mt-1 font-bold uppercase">
                                      To{" "}
                                      <span className="text-[#f26522] border-b-2 border-[#f26522]">
                                        {Array.isArray(message.contactIds) &&
                                          message.contactIds.length > 0
                                          ? message.contactIds.length > 1
                                            ? `${message.contactIds.length} contacts`
                                            : (() => {
                                              const phoneNumber =
                                                message.contactIds[0]
                                                  ?.split("-")[1]
                                                  ?.replace(/\D/g, "") || "";
                                              const contact = contacts.find(
                                                (c) =>
                                                  c.phone?.replace(
                                                    /\D/g,
                                                    ""
                                                  ) === phoneNumber
                                              );
                                              return (
                                                contact?.contactName ||
                                                phoneNumber ||
                                                "Unknown"
                                              );
                                            })()
                                          : message.contactId
                                            ? (() => {
                                              const phoneNumber =
                                                message.contactId
                                                  ?.split("-")[1]
                                                  ?.replace(/\D/g, "") || "";
                                              const contact = contacts.find(
                                                (c) =>
                                                  c.phone?.replace(
                                                    /\D/g,
                                                    ""
                                                  ) === phoneNumber
                                              );
                                              return (
                                                contact?.contactName ||
                                                phoneNumber ||
                                                "Unknown"
                                              );
                                            })()
                                            : "0 contacts"}
                                      </span>
                                    </p>
                                  </div>
                                </div>
                                <div className="flex items-center justify-between gap-4">
                                  <span
                                    className={`inline-flex items-center px-3 py-1.5 rounded-xl text-xs font-semibold backdrop-blur-sm border transition-all duration-200 ${message.status === "sent"
                                      ? "bg-gradient-to-r from-emerald-500/20 to-green-500/20 dark:from-emerald-400/20 dark:to-green-400/20 text-emerald-700 dark:text-emerald-300 border-emerald-200/40 dark:border-emerald-700/40"
                                      : message.status === "failed"
                                        ? "bg-gradient-to-r from-red-500/20 to-pink-500/20 dark:from-red-400/20 dark:to-pink-400/20 text-red-700 dark:text-red-300 border-red-200/40 dark:border-red-700/40"
                                        : "bg-gradient-to-r from-orange-500/20 to-amber-500/20 dark:from-orange-400/20 dark:to-amber-400/20 text-orange-700 dark:text-orange-300 border-orange-200/40 dark:border-orange-700/40"
                                      }`}
                                  >
                                    <div
                                      className={`w-1.5 h-1.5 rounded-full mr-2 ${message.status === "sent"
                                        ? "bg-emerald-500"
                                        : message.status === "failed"
                                          ? "bg-red-500"
                                          : "bg-orange-500 animate-pulse"
                                        }`}
                                    />
                                    {message.status === "sent"
                                      ? "Sent"
                                      : message.status === "failed"
                                        ? "Failed"
                                        : "Scheduled"}
                                  </span>
                                  <span className="text-xs text-slate-400 dark:text-slate-500 font-medium ml-auto">
                                    {message.scheduledTime
                                      ? new Date(
                                        message.scheduledTime
                                      ).toLocaleString("en-US", {
                                        month: "short",
                                        day: "numeric",
                                        hour: "2-digit",
                                        minute: "2-digit",
                                      })
                                      : "No date"}
                                  </span>
                                </div>
                              </div>
                              <Button
                                variant="outline-secondary"
                                size="sm"
                                className="ml-4 bg-white/60 dark:bg-slate-600/60 backdrop-blur-sm border-white/40 dark:border-slate-500/40 hover:bg-white/80 dark:hover:bg-slate-500/80 transition-all duration-300 shadow-lg hover:shadow-xl rounded-xl opacity-0 group-hover:opacity-100 hover:scale-110 transform-gpu"
                                onClick={() => {
                                  setSelectedMessageForView(message);
                                  setViewMessageDetailsModal(true);
                                }}
                              >
                                <Lucide icon="Eye" className="w-3.5 h-3.5" />
                              </Button>
                            </div>
                          </div>
                        ))}
                      {(() => {
                        const filteredCount = applyAdvancedFilters(
                          combineScheduledMessages(
                            getFilteredScheduledMessages()
                          )
                        ).length;
                        return (
                          filteredCount > 3 && (
                            <div className="text-center py-4">
                              <button
                                onClick={() => setScheduledMessagesModal(true)}
                                className="group inline-flex items-center px-4 py-2.5 text-sm font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 bg-gradient-to-r from-blue-50/50 to-violet-50/50 dark:from-blue-900/20 dark:to-violet-900/20 backdrop-blur-sm border border-blue-200/40 dark:border-blue-700/40 rounded-xl hover:shadow-lg transition-all duration-300 hover:scale-105 transform-gpu"
                              >
                                <span>View all {filteredCount} messages</span>
                                <Lucide
                                  icon="ArrowRight"
                                  className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform duration-200"
                                />
                              </button>
                            </div>
                          )
                        );
                      })()}
                    </>
                  ) : (
                    /* Enhanced Empty State */
                    <div className="text-center py-12">
                      <div className="relative mx-auto w-20 h-20 mb-6">
                        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 to-violet-500/20 dark:from-blue-400/20 dark:to-violet-400/20 rounded-3xl backdrop-blur-sm border border-blue-200/40 dark:border-blue-700/40" />
                        <div className="absolute inset-2 bg-gradient-to-br from-white/60 to-white/30 dark:from-slate-700/60 dark:to-slate-800/30 rounded-2xl backdrop-blur-sm flex items-center justify-center">
                          <Lucide
                            icon="Calendar"
                            className="w-8 h-8 text-blue-500/70 dark:text-blue-400/70"
                          />
                        </div>
                      </div>
                      <h4 className="text-lg font-semibold text-slate-700 dark:text-slate-300 mb-2">
                        No Scheduled Messages
                      </h4>
                      <p className="text-sm text-slate-500 dark:text-slate-400 max-w-48 mx-auto leading-relaxed">
                        Schedule your first message to automate your
                        communication
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Quick Actions Panel */}
              <div className="bg-white border-2 border-[#4b4b4b] neo-shadow overflow-hidden">
                <div className="relative px-6 py-4 border-b-2 border-[#4b4b4b] bg-[#f8f9fa]">
                  <div className="flex items-center space-x-3">
                    <div className="p-2.5 bg-[#4b4b4b] text-white neo-shadow-orange">
                      <Lucide icon="Zap" className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-xl font-black text-[#4b4b4b] uppercase tracking-tight leading-tight">
                        Quick Actions
                      </h3>
                      <p className="text-xs font-bold text-[#f26522] mt-0.5">
                        Bulk operations & tools
                      </p>
                    </div>
                  </div>
                </div>

                <div className="relative p-6 space-y-4 bg-white">
                  {/* Assign User to Selected Contacts */}
                  <div className="w-full">
                    <button
                      className="w-full flex items-center justify-between p-4 bg-white border-2 border-[#4b4b4b] text-[#4b4b4b] hover:-translate-y-1 hover:-translate-x-1 hover:shadow-[4px_4px_0_#4b4b4b] transition-all duration-300 disabled:opacity-50 disabled:hover:translate-y-0 disabled:hover:translate-x-0 disabled:hover:shadow-none"
                      disabled={
                        selectedContacts.length === 0 || userRole === "3"
                      }
                      onClick={() => setShowAssignUserMenu(!showAssignUserMenu)}
                    >
                      <div className="flex items-center space-x-3">
                        <div className="p-2 border-2 border-[#4b4b4b] bg-white text-[#4b4b4b]">
                          <Lucide icon="User" className="w-4 h-4" />
                        </div>
                        <div className="text-left">
                          <div className="text-sm font-black uppercase">
                            Assign User
                          </div>
                          <div className="text-xs font-bold text-[#f26522]">
                            {selectedContacts.length} selected
                          </div>
                        </div>
                      </div>
                      <Lucide
                        icon={showAssignUserMenu ? "ChevronUp" : "ChevronDown"}
                        className="w-5 h-5"
                      />
                    </button>

                    {showAssignUserMenu && (
                      <div className="mt-4 bg-white border-2 border-[#4b4b4b] neo-shadow p-4 space-y-3 overflow-y-auto max-h-96">
                        <div className="mb-3">
                          <div className="relative">
                            <Lucide
                              icon="Search"
                              className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-[#4b4b4b]"
                            />
                            <input
                              type="text"
                              placeholder="Search employees..."
                              value={employeeSearch}
                              onChange={(e) =>
                                setEmployeeSearch(e.target.value)
                              }
                              className="neo-input pl-10 pr-4 py-3 w-full text-[#4b4b4b] font-bold placeholder:text-gray-400"
                            />
                          </div>
                        </div>
                        {(() => {
                          const stableEmployeeList = employeeListRef.current;

                          if (stableEmployeeList.length === 0) {
                            return (
                              <div className="p-6 text-center">
                                <div className="w-16 h-16 mx-auto mb-4 bg-white border-2 border-[#4b4b4b] flex items-center justify-center neo-shadow">
                                  <Lucide icon="Users" className="w-8 h-8 text-[#4b4b4b]" />
                                </div>
                                <p className="text-sm font-black text-[#4b4b4b] uppercase">
                                  No employees found
                                </p>
                              </div>
                            );
                          }

                          const filteredEmployees = stableEmployeeList.filter(
                            (employee) => {
                              if (userRole === "4" || userRole === "2") {
                                return (
                                  employee.role === "2" &&
                                  employee.name
                                    .toLowerCase()
                                    .includes(employeeSearch.toLowerCase())
                                );
                              }
                              return employee.name
                                .toLowerCase()
                                .includes(employeeSearch.toLowerCase());
                            }
                          );

                          return filteredEmployees.map((employee) => (
                            <button
                              key={employee.id}
                              className="flex w-full items-center px-4 py-3 text-sm font-black text-[#4b4b4b] uppercase bg-white border-2 border-transparent hover:border-[#4b4b4b] hover:-translate-y-0.5 hover:shadow-[2px_2px_0_#4b4b4b] transition-all"
                              onClick={() => {
                                if (userRole !== "3") {
                                  selectedContacts.forEach((contact) => {
                                    handleAddTagToSelectedContacts(
                                      employee.name,
                                      contact
                                    );
                                  });
                                  setShowAssignUserMenu(false);
                                  toast.success(
                                    `Assigned ${employee.name} to ${selectedContacts.length
                                    } contact${selectedContacts.length !== 1 ? "s" : ""
                                    }`
                                  );
                                } else {
                                  toast.error(
                                    "You don't have permission to assign users to contacts."
                                  );
                                }
                              }}
                            >
                              <div className="p-2 bg-white border-2 border-[#4b4b4b] mr-3">
                                <Lucide icon="User" className="h-4 w-4 text-[#4b4b4b]" />
                              </div>
                              <span className="truncate">{employee.name}</span>
                            </button>
                          ));
                        })()}
                      </div>
                    )}
                  </div>

                  {/* Add Tags to Selected Contacts */}
                  <div className="w-full">
                    <button
                      className="w-full flex items-center justify-between p-4 bg-white border-2 border-[#4b4b4b] text-[#4b4b4b] hover:-translate-y-1 hover:-translate-x-1 hover:shadow-[4px_4px_0_#4b4b4b] transition-all duration-300 disabled:opacity-50 disabled:hover:translate-y-0 disabled:hover:translate-x-0 disabled:hover:shadow-none"
                      disabled={
                        selectedContacts.length === 0 || userRole === "3"
                      }
                      onClick={() => setShowAddTagMenu(!showAddTagMenu)}
                    >
                      <div className="flex items-center space-x-3">
                        <div className="p-2 border-2 border-[#4b4b4b] bg-white text-[#4b4b4b]">
                          <Lucide icon="Tag" className="w-4 h-4" />
                        </div>
                        <div className="text-left">
                          <div className="text-sm font-black uppercase">
                            Add Tags
                          </div>
                          <div className="text-xs font-bold text-[#10b981]">
                            {selectedContacts.length} selected
                          </div>
                        </div>
                      </div>
                      <Lucide
                        icon={showAddTagMenu ? "ChevronUp" : "ChevronDown"}
                        className="w-5 h-5"
                      />
                    </button>

                    {showAddTagMenu && (
                      <div className="mt-4 bg-white/90 dark:bg-slate-800/90 backdrop-blur-2xl border border-white/40 dark:border-slate-700/50 shadow-2xl shadow-slate-200/50 dark:shadow-slate-800/50 rounded-2xl p-4 space-y-3 overflow-y-auto max-h-96 transition-all duration-300 animate-in slide-in-from-top-2">
                        <button
                          className="flex items-center p-3 font-semibold hover:bg-gradient-to-r hover:from-emerald-50/60 hover:to-green-50/40 dark:hover:from-emerald-900/20 dark:hover:to-green-900/20 w-full rounded-xl transition-all duration-200 backdrop-blur-sm border border-transparent hover:border-emerald-200/40 dark:hover:border-emerald-700/40 hover:shadow-lg group"
                          onClick={() => {
                            setShowAddTagModal(true);
                            setShowAddTagMenu(false);
                          }}
                        >
                          <div className="p-2 rounded-lg bg-gradient-to-br from-emerald-500/20 to-green-500/20 dark:from-emerald-400/20 dark:to-green-400/20 backdrop-blur-sm border border-emerald-200/40 dark:border-emerald-700/40 mr-3 group-hover:scale-110 transition-transform duration-300">
                            <Lucide
                              icon="Plus"
                              className="w-4 h-4 text-emerald-600 dark:text-emerald-400"
                            />
                          </div>
                          <span className="text-sm text-slate-700 dark:text-slate-300">
                            Create New Tag
                          </span>
                        </button>
                        {(() => {
                          const defaultTags = [
                            {
                              id: "built-in-cancelled-appointment",
                              name: "Cancelled Appointment",
                            },
                            {
                              id: "built-in-booked-appointment",
                              name: "Booked Appointment",
                            },
                            {
                              id: "built-in-rescheduled-appointment",
                              name: "Rescheduled Appointment",
                            },
                            { id: "built-in-stop-bot", name: "stop bot" },
                            { id: "built-in-feedback", name: "feedback" },
                            { id: "built-in-inquiry", name: "inquiry" },
                            { id: "built-in-ordered", name: "ordered" },
                            { id: "built-in-CN", name: "CN" },
                            { id: "built-in-EN", name: "EN" },
                          ];
                          const allTags = [...defaultTags, ...tagList];
                          return allTags.map((tag) => (
                            <button
                              key={tag.id}
                              className="flex items-center justify-between w-full hover:bg-gradient-to-r hover:from-blue-50/60 hover:to-violet-50/40 dark:hover:from-blue-900/20 dark:hover:to-violet-900/20 p-3 rounded-xl text-left text-sm font-medium transition-all duration-200 backdrop-blur-sm border border-transparent hover:border-blue-200/40 dark:hover:border-blue-700/40 hover:shadow-lg group"
                              onClick={() => {
                                selectedContacts.forEach((contact) => {
                                  handleAddTagToSelectedContacts(
                                    tag.name,
                                    contact
                                  );
                                });
                                setShowAddTagMenu(false);
                              }}
                            >
                              <div className="flex items-center space-x-3">
                                <div className="p-1.5 rounded-lg bg-gradient-to-br from-blue-500/20 to-violet-500/20 dark:from-blue-400/20 dark:to-violet-400/20 backdrop-blur-sm border border-blue-200/40 dark:border-blue-700/40 group-hover:scale-110 transition-transform duration-300">
                                  <Lucide
                                    icon="Tag"
                                    className="w-3 h-3 text-blue-600 dark:text-blue-400"
                                  />
                                </div>
                                <span className="text-slate-700 dark:text-slate-300">
                                  {tag.name}
                                </span>
                              </div>
                            </button>
                          ));
                        })()}
                      </div>
                    )}
                  </div>

                  {/* Remove Tags from Selected Contacts */}
                  <div className="w-full">
                    <Button
                      variant="outline-secondary"
                      className="w-full justify-between group bg-gradient-to-r from-white/60 to-white/40 dark:from-slate-700/60 dark:to-slate-800/40 backdrop-blur-xl border border-white/40 dark:border-slate-600/40 hover:border-red-300/60 dark:hover:border-red-500/60 transition-all duration-300 hover:shadow-xl hover:shadow-red-500/10 dark:hover:shadow-red-500/20 rounded-2xl p-4 hover:scale-[1.02] transform-gpu"
                      disabled={
                        selectedContacts.length === 0 || userRole === "3"
                      }
                      onClick={() => setShowRemoveTagMenu(!showRemoveTagMenu)}
                    >
                      <div className="flex items-center space-x-3">
                        <div className="p-2 rounded-xl bg-gradient-to-br from-red-500/20 to-pink-500/20 dark:from-red-400/20 dark:to-pink-400/20 backdrop-blur-sm border border-red-200/40 dark:border-red-700/40 group-hover:scale-110 transition-transform duration-300">
                          <Lucide
                            icon="Tags"
                            className="w-4 h-4 text-red-600 dark:text-red-400"
                          />
                        </div>
                        <div className="text-left">
                          <div className="text-sm font-semibold text-slate-800 dark:text-slate-100">
                            Remove Tags
                          </div>
                          <div className="text-xs text-slate-500 dark:text-slate-400">
                            {selectedContacts.length} selected
                          </div>
                        </div>
                      </div>
                      <Lucide
                        icon={showRemoveTagMenu ? "ChevronUp" : "ChevronDown"}
                        className="w-5 h-5 text-slate-600 dark:text-slate-400 group-hover:text-red-600 dark:group-hover:text-red-400 transition-colors duration-300"
                      />
                    </Button>

                    {showRemoveTagMenu && (
                      <div className="mt-4 bg-white/90 dark:bg-slate-800/90 backdrop-blur-2xl border border-white/40 dark:border-slate-700/50 shadow-2xl shadow-slate-200/50 dark:shadow-slate-800/50 rounded-2xl p-4 space-y-3 overflow-y-auto max-h-96 transition-all duration-300 animate-in slide-in-from-top-2">
                        <button
                          className="flex items-center p-3 font-semibold hover:bg-gradient-to-r hover:from-red-50/60 hover:to-pink-50/40 dark:hover:from-red-900/20 dark:hover:to-pink-900/20 w-full rounded-xl transition-all duration-200 backdrop-blur-sm border border-transparent hover:border-red-200/40 dark:hover:border-red-700/40 hover:shadow-lg group text-red-600 dark:text-red-400"
                          onClick={() => {
                            selectedContacts.forEach((contact) => {
                              handleRemoveTagsFromContact(
                                contact,
                                contact.tags || []
                              );
                            });
                            setShowRemoveTagMenu(false);
                          }}
                        >
                          <div className="p-2 rounded-lg bg-gradient-to-br from-red-500/20 to-pink-500/20 dark:from-red-400/20 dark:to-pink-400/20 backdrop-blur-sm border border-red-200/40 dark:border-red-700/40 mr-3 group-hover:scale-110 transition-transform duration-300">
                            <Lucide
                              icon="XCircle"
                              className="w-4 h-4 text-red-600 dark:text-red-400"
                            />
                          </div>
                          <span className="text-sm">Remove All Tags</span>
                        </button>
                        {(() => {
                          const defaultTags = [
                            {
                              id: "built-in-cancelled-appointment",
                              name: "Cancelled Appointment",
                            },
                            {
                              id: "built-in-booked-appointment",
                              name: "Booked Appointment",
                            },
                            {
                              id: "built-in-rescheduled-appointment",
                              name: "Rescheduled Appointment",
                            },
                            { id: "built-in-stop-bot", name: "stop bot" },
                            { id: "built-in-feedback", name: "feedback" },
                            { id: "built-in-inquiry", name: "inquiry" },
                            { id: "built-in-ordered", name: "ordered" },
                            { id: "built-in-CN", name: "CN" },
                            { id: "built-in-EN", name: "EN" },
                          ];
                          const allTags = [...defaultTags, ...tagList];
                          return allTags.map((tag) => (
                            <button
                              key={tag.id}
                              className="flex items-center justify-between w-full hover:bg-gradient-to-r hover:from-slate-50/60 hover:to-gray-50/40 dark:hover:from-slate-900/20 dark:hover:to-gray-900/20 p-3 rounded-xl text-left text-sm font-medium transition-all duration-200 backdrop-blur-sm border border-transparent hover:border-slate-200/40 dark:hover:border-slate-700/40 hover:shadow-lg group"
                              onClick={() => {
                                selectedContacts.forEach((contact) => {
                                  handleRemoveTagsFromContact(contact, [
                                    tag.name,
                                  ]);
                                });
                                setShowRemoveTagMenu(false);
                              }}
                            >
                              <div className="flex items-center space-x-3">
                                <div className="p-1.5 rounded-lg bg-gradient-to-br from-slate-500/20 to-gray-500/20 dark:from-slate-400/20 dark:to-gray-400/20 backdrop-blur-sm border border-slate-200/40 dark:border-slate-700/40 group-hover:scale-110 transition-transform duration-300">
                                  <Lucide
                                    icon="Tag"
                                    className="w-3 h-3 text-slate-600 dark:text-slate-400"
                                  />
                                </div>
                                <span className="text-slate-700 dark:text-slate-300">
                                  {tag.name}
                                </span>
                              </div>
                            </button>
                          ));
                        })()}
                      </div>
                    )}
                  </div>

                  {/* Database Operations */}
                  <div className="w-full">
                    <button
                      className="w-full flex items-center justify-between p-4 bg-white border-2 border-[#4b4b4b] text-[#4b4b4b] hover:-translate-y-1 hover:-translate-x-1 hover:shadow-[4px_4px_0_#4b4b4b] transition-all duration-300 disabled:opacity-50 disabled:hover:translate-y-0 disabled:hover:translate-x-0 disabled:hover:shadow-none"
                      disabled={isSyncing || userRole === "3"}
                      onClick={() => setShowSyncMenu(!showSyncMenu)}
                    >
                      <div className="flex items-center space-x-3">
                        <div className="p-2 border-2 border-[#4b4b4b] bg-[#e8e8e8] text-[#4b4b4b]">
                          <Lucide
                            icon={isSyncing ? "Loader2" : "RefreshCw"}
                            className={`w-4 h-4 ${isSyncing ? "animate-spin" : ""
                              }`}
                          />
                        </div>
                        <div className="text-left">
                          <div className="text-sm font-black uppercase text-[#4b4b4b]">
                            {isSyncing ? "Syncing..." : "Sync Database"}
                          </div>
                          <div className="text-xs font-bold text-[#f26522]">
                            {isSyncing ? "In progress..." : "Update data"}
                          </div>
                        </div>
                      </div>
                      <Lucide
                        icon={showSyncMenu ? "ChevronUp" : "ChevronDown"}
                        className="w-5 h-5"
                      />
                    </button>

                    {showSyncMenu && (
                      <div className="mt-4 bg-white border-2 border-[#4b4b4b] neo-shadow p-4 space-y-3">
                        <button
                          className="flex w-full items-center px-4 py-3 text-sm font-black text-[#4b4b4b] uppercase bg-white border-2 border-transparent hover:border-[#4b4b4b] hover:-translate-y-0.5 hover:shadow-[2px_2px_0_#4b4b4b] transition-all disabled:opacity-50"
                          onClick={() => {
                            setShowSyncConfirmationModal(true);
                            setShowSyncMenu(false);
                          }}
                          disabled={isSyncing}
                        >
                          <div className="p-2 bg-[#e8e8e8] border-2 border-[#4b4b4b] mr-3">
                            <Lucide icon="MessageSquare" className="w-4 h-4 text-[#4b4b4b]" />
                          </div>
                          <span>{isSyncing ? "Syncing..." : "Sync Chats"}</span>
                        </button>

                        <button
                          className="flex w-full items-center px-4 py-3 text-sm font-black text-[#4b4b4b] uppercase bg-white border-2 border-transparent hover:border-[#4b4b4b] hover:-translate-y-0.5 hover:shadow-[2px_2px_0_#4b4b4b] transition-all disabled:opacity-50"
                          onClick={() => {
                            setShowSyncNamesConfirmationModal(true);
                            setShowSyncMenu(false);
                          }}
                          disabled={isSyncing}
                        >
                          <div className="p-2 bg-[#e8e8e8] border-2 border-[#4b4b4b] mr-3">
                            <Lucide icon="FolderSync" className="w-4 h-4 text-[#4b4b4b]" />
                          </div>
                          <span>{isSyncing ? "Syncing..." : "Sync Contact Names"}</span>
                        </button>
                      </div>
                    )}
                  </div>

                  {/* File Operations */}
                  {userRole !== "2" && userRole !== "3" && userRole !== "5" && (
                    <div className="w-full">
                      <button
                        className="w-full flex items-center justify-between p-4 bg-white border-2 border-[#4b4b4b] text-[#4b4b4b] hover:-translate-y-1 hover:-translate-x-1 hover:shadow-[4px_4px_0_#4b4b4b] transition-all duration-300"
                        onClick={() => setShowExportMenu(!showExportMenu)}
                      >
                        <div className="flex items-center space-x-3">
                          <div className="p-2 border-2 border-[#4b4b4b] bg-white text-[#4b4b4b]">
                            <Lucide icon="Download" className="w-4 h-4" />
                          </div>
                          <div className="text-left">
                            <div className="text-sm font-black uppercase text-[#4b4b4b]">
                              Export Contacts
                            </div>
                            <div className="text-xs font-bold text-[#10b981]">
                              Download data
                            </div>
                          </div>
                        </div>
                        <Lucide
                          icon={showExportMenu ? "ChevronUp" : "ChevronDown"}
                          className="w-5 h-5"
                        />
                      </button>

                      {showExportMenu && (
                        <div className="mt-4 bg-white border-2 border-[#4b4b4b] neo-shadow p-4 space-y-3">
                          <button
                            className="flex w-full items-center px-4 py-3 text-sm font-black text-[#4b4b4b] uppercase bg-white border-2 border-transparent hover:border-[#4b4b4b] hover:-translate-y-0.5 hover:shadow-[2px_2px_0_#4b4b4b] transition-all disabled:opacity-50"
                            onClick={() => {
                              if (selectedContacts.length > 0) {
                                exportContactsToCSV(selectedContacts);
                              }
                              setShowExportMenu(false);
                            }}
                            disabled={selectedContacts.length === 0}
                          >
                            <div className="p-2 bg-[#e8e8e8] border-2 border-[#4b4b4b] mr-3">
                              <Lucide icon="Users" className="w-4 h-4 text-[#4b4b4b]" />
                            </div>
                            <div className="text-left flex-1 flex justify-between items-center">
                              <span>Export Selected</span>
                              <span className="text-xs text-[#f26522]">{selectedContacts.length}</span>
                            </div>
                          </button>

                          <button
                            className="flex w-full items-center justify-between px-4 py-3 text-sm font-black text-[#4b4b4b] uppercase bg-white border-2 border-transparent hover:border-[#4b4b4b] hover:-translate-y-0.5 hover:shadow-[2px_2px_0_#4b4b4b] transition-all"
                            onClick={() => {
                              setShowTagSelection(!showTagSelection);
                            }}
                          >
                            <div className="flex items-center">
                              <div className="p-2 bg-[#e8e8e8] border-2 border-[#4b4b4b] mr-3">
                                <Lucide icon="Tag" className="w-4 h-4 text-[#4b4b4b]" />
                              </div>
                              <span>Export by Tags</span>
                            </div>
                            <Lucide
                              icon={showTagSelection ? "ChevronUp" : "ChevronDown"}
                              className="w-4 h-4 text-[#4b4b4b]"
                            />
                          </button>

                          {showTagSelection && (
                            <div className="ml-6 p-4 border-l-2 border-b-2 border-r-2 border-[#e8e8e8] bg-[#f8f9fa] space-y-3 max-h-48 overflow-y-auto">
                              <div className="text-sm font-black text-[#4b4b4b] mb-3 uppercase">
                                Select tags:
                              </div>
                              {tagList.length === 0 ? (
                                <div className="text-center py-4">
                                  <div className="w-12 h-12 mx-auto mb-3 bg-white border-2 border-[#4b4b4b] flex items-center justify-center neo-shadow">
                                    <Lucide icon="Tag" className="w-6 h-6 text-[#4b4b4b]" />
                                  </div>
                                  <p className="text-sm font-black text-[#4b4b4b] uppercase">
                                    No tags available
                                  </p>
                                </div>
                              ) : (
                                <div className="space-y-2">
                                  {tagList.map((tag) => (
                                    <label
                                      key={tag.id}
                                      className="flex items-center space-x-3 p-2 bg-white border-2 border-[#e8e8e8] hover:border-[#f26522] cursor-pointer transition-colors"
                                    >
                                      <input
                                        type="checkbox"
                                        value={tag.name}
                                        checked={exportSelectedTags.includes(tag.name)}
                                        onChange={(e) => {
                                          const isChecked = e.target.checked;
                                          setExportSelectedTags((prev) =>
                                            isChecked
                                              ? [...prev, tag.name]
                                              : prev.filter((t) => t !== tag.name)
                                          );
                                        }}
                                        className="w-4 h-4 border-2 border-[#4b4b4b] text-[#f26522] focus:ring-[#f26522]"
                                      />
                                      <span className="text-sm font-bold text-[#4b4b4b]">
                                        {tag.name}
                                      </span>
                                    </label>
                                  ))}
                                </div>
                              )}
                              {exportSelectedTags.length > 0 && (
                                <div className="pt-3 border-t-2 border-[#e8e8e8]">
                                  <button
                                    onClick={() => {
                                      const tagsToExport = exportSelectedTags.map((name) => {
                                        const tagObj = tagList.find((t) => t.name === name);
                                        return tagObj ? tagObj.id : name;
                                      });
                                      //    handleExportByTags(tagsToExport);
                                      setShowExportMenu(false);
                                      setExportSelectedTags([]);
                                    }}
                                    className="w-full py-2 bg-[#f26522] text-white font-black uppercase border-2 border-[#4b4b4b] shadow-[2px_2px_0_#4b4b4b] hover:-translate-y-0.5 hover:shadow-[3px_3px_0_#4b4b4b] transition-all"
                                  >
                                    Export Selected Tags
                                  </button>
                                </div>
                              )}
                            </div>
                          )}

                          <button
                            className="flex w-full items-center px-4 py-3 text-sm font-black text-[#4b4b4b] uppercase bg-white border-2 border-transparent hover:border-[#4b4b4b] hover:-translate-y-0.5 hover:shadow-[2px_2px_0_#4b4b4b] transition-all"
                            onClick={() => {
                              exportContactsToCSV(filteredContactsSearch);
                              setShowExportMenu(false);
                            }}
                          >
                            <div className="p-2 bg-[#e8e8e8] border-2 border-[#4b4b4b] mr-3">
                              <Lucide icon="Filter" className="w-4 h-4 text-[#4b4b4b]" />
                            </div>
                            <div className="text-left flex-1 flex justify-between items-center">
                              <span>Export Filtered</span>
                              <span className="text-xs text-[#10b981]">{filteredContactsSearch.length}</span>
                            </div>
                          </button>

                          <button
                            className="flex w-full items-center px-4 py-3 text-sm font-black text-[#4b4b4b] uppercase bg-white border-2 border-transparent hover:border-[#4b4b4b] hover:-translate-y-0.5 hover:shadow-[2px_2px_0_#4b4b4b] transition-all"
                            onClick={() => {
                              exportContactsToCSV(contacts);
                              setShowExportMenu(false);
                            }}
                          >
                            <div className="p-2 bg-[#e8e8e8] border-2 border-[#4b4b4b] mr-3">
                              <Lucide icon="Database" className="w-4 h-4 text-[#4b4b4b]" />
                            </div>
                            <div className="text-left flex-1 flex justify-between items-center">
                              <span>Export All Data</span>
                              <span className="text-xs text-[#10b981]">{contacts.length}</span>
                            </div>
                          </button>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Manage Tags */}
                  <div className="w-full">
                    <button
                      className="w-full flex items-center justify-between p-4 bg-white border-2 border-[#4b4b4b] text-[#4b4b4b] hover:-translate-y-1 hover:-translate-x-1 hover:shadow-[4px_4px_0_#4b4b4b] transition-all duration-300 disabled:opacity-50 disabled:hover:translate-y-0 disabled:hover:translate-x-0 disabled:hover:shadow-none"
                      onClick={() => setShowManageTagsMenu(!showManageTagsMenu)}
                      disabled={userRole === "3"}
                    >
                      <div className="flex items-center space-x-3">
                        <div className="p-2 border-2 border-[#4b4b4b] bg-white text-[#4b4b4b]">
                          <Lucide icon="Settings" className="w-4 h-4" />
                        </div>
                        <div className="text-left">
                          <div className="text-sm font-black uppercase text-[#4b4b4b]">
                            Manage Tags
                          </div>
                          <div className="text-xs font-bold text-[#f26522]">
                            Create & organize
                          </div>
                        </div>
                      </div>
                      <Lucide
                        icon={showManageTagsMenu ? "ChevronUp" : "ChevronDown"}
                        className="w-5 h-5"
                      />
                    </button>

                    {showManageTagsMenu && (
                      <div className="mt-4 bg-white border-2 border-[#4b4b4b] neo-shadow p-4 space-y-3">
                        <button
                          className="flex w-full items-center px-4 py-3 text-sm font-black text-[#4b4b4b] uppercase bg-white border-2 border-transparent hover:border-[#4b4b4b] hover:-translate-y-0.5 hover:shadow-[2px_2px_0_#4b4b4b] transition-all"
                          onClick={() => {
                            setShowAddTagModal(true);
                            setShowManageTagsMenu(false);
                          }}
                        >
                          <div className="p-2 bg-[#e8e8e8] border-2 border-[#4b4b4b] mr-3">
                            <Lucide icon="Plus" className="w-4 h-4 text-[#4b4b4b]" />
                          </div>
                          <span>Add New Tag</span>
                        </button>

                        <button
                          className="flex w-full items-center px-4 py-3 text-sm font-black text-[#f26522] uppercase bg-white border-2 border-transparent hover:border-[#f26522] hover:-translate-y-0.5 hover:shadow-[2px_2px_0_#f26522] transition-all"
                          onClick={() => {
                            setShowDeleteTagModal(true);
                            setShowManageTagsMenu(false);
                          }}
                        >
                          <div className="p-2 bg-white border-2 border-[#f26522] mr-3">
                            <Lucide icon="Trash2" className="w-4 h-4 text-[#f26522]" />
                          </div>
                          <span>Delete Tags</span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Statistics Panel */}
              <div className="bg-white border-2 border-[#4b4b4b] neo-shadow overflow-hidden">
                <div className="relative px-6 py-4 border-b-2 border-[#4b4b4b] bg-[#f8f9fa]">
                  <div className="flex items-center space-x-3">
                    <div className="p-2.5 bg-[#4b4b4b] text-white neo-shadow-orange">
                      <Lucide icon="BarChart3" className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-xl font-black text-[#4b4b4b] uppercase tracking-tight leading-tight">
                        Statistics
                      </h3>
                      <p className="text-xs font-bold text-[#f26522] mt-0.5">
                        Overview & insights
                      </p>
                    </div>
                  </div>
                </div>

                <div className="relative p-6 space-y-4 bg-white">
                  <div className="flex items-center justify-between p-4 bg-white border-2 border-[#4b4b4b] hover:shadow-[4px_4px_0_#4b4b4b] hover:-translate-y-1 hover:-translate-x-1 transition-all">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 border-2 border-[#4b4b4b] bg-[#4b4b4b] text-white">
                        <Lucide icon="Users" className="w-4 h-4" />
                      </div>
                      <span className="text-sm font-black uppercase text-[#4b4b4b]">
                        Total Contacts
                      </span>
                    </div>
                    <span className="text-xl font-black text-[#f26522]">
                      {contacts.length.toLocaleString()}
                    </span>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-white border-2 border-[#4b4b4b] hover:shadow-[4px_4px_0_#4b4b4b] hover:-translate-y-1 hover:-translate-x-1 transition-all">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 border-2 border-[#4b4b4b] bg-white text-[#4b4b4b]">
                        <Lucide icon="Filter" className="w-4 h-4" />
                      </div>
                      <span className="text-sm font-black uppercase text-[#4b4b4b]">
                        Filtered Results
                      </span>
                    </div>
                    <span className="text-xl font-black text-[#f26522]">
                      {filteredContactsSearch.length.toLocaleString()}
                    </span>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-white border-2 border-[#4b4b4b] hover:shadow-[4px_4px_0_#4b4b4b] hover:-translate-y-1 hover:-translate-x-1 transition-all">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 border-2 border-[#4b4b4b] bg-[#4b4b4b] text-white">
                        <Lucide icon="CheckSquare" className="w-4 h-4" />
                      </div>
                      <span className="text-sm font-black uppercase text-[#4b4b4b]">
                        Selected
                      </span>
                    </div>
                    <span className="text-xl font-black text-[#10b981]">
                      {selectedContacts.length.toLocaleString()}
                    </span>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-white border-2 border-[#4b4b4b] hover:shadow-[4px_4px_0_#4b4b4b] hover:-translate-y-1 hover:-translate-x-1 transition-all">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 border-2 border-[#4b4b4b] bg-white text-[#4b4b4b]">
                        <Lucide icon="Calendar" className="w-4 h-4" />
                      </div>
                      <span className="text-sm font-black uppercase text-[#4b4b4b]">
                        Scheduled Msgs
                      </span>
                    </div>
                    <span className="text-xl font-black text-[#f26522]">
                      {scheduledMessages.length.toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Add Contact Modal */}
        <Dialog
          open={addContactModal}
          onClose={() => setAddContactModal(false)}
        >
          <div className="fixed inset-0 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm z-50">
            <Dialog.Panel className="w-full max-w-2xl bg-white border-2 border-[#4b4b4b] neo-shadow shrink-0 overflow-y-auto max-h-[90vh]">
              <div className="relative p-6 px-8 border-b-2 border-[#4b4b4b] bg-[#f8f9fa]">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 border-2 border-[#4b4b4b] bg-white text-[#4b4b4b] neo-shadow-orange">
                      <Lucide icon="UserPlus" className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-black text-[#4b4b4b] uppercase tracking-tight">
                        Add New Contact
                      </h3>
                      <p className="text-sm font-bold text-[#f26522] mt-1">
                        Create a new contact record
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setAddContactModal(false)}
                    className="p-2 border-2 border-transparent hover:border-[#4b4b4b] hover:-translate-y-0.5 hover:shadow-[2px_2px_0_#4b4b4b] text-[#4b4b4b] transition-all bg-white"
                  >
                    <Lucide icon="X" className="w-5 h-5" />
                  </button>
                </div>
              </div>

              <div className="p-8 space-y-8 bg-white">
                {/* Personal Information Section */}
                <div className="space-y-6">
                  <div className="flex items-center space-x-3 pb-2 border-b-2 border-[#4b4b4b]">
                    <div className="p-1.5 border-2 border-[#4b4b4b] bg-[#4b4b4b] text-white">
                      <Lucide icon="User" className="w-4 h-4" />
                    </div>
                    <h4 className="text-lg font-black text-[#4b4b4b] uppercase">
                      Personal Information
                    </h4>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="block text-sm font-black text-[#4b4b4b] uppercase">
                        Contact Name *
                      </label>
                      <FormInput
                        type="text"
                        value={newContact.contactName}
                        onChange={(e) =>
                          setNewContact({
                            ...newContact,
                            contactName: e.target.value,
                          })
                        }
                        placeholder="Enter contact name"
                        className="w-full bg-white border-2 border-[#4b4b4b] p-3 text-[#4b4b4b] placeholder-[#4b4b4b]/40 focus:outline-none focus:ring-0 focus:border-[#4b4b4b] focus:-translate-y-0.5 focus:-translate-x-0.5 focus:shadow-[4px_4px_0_#f26522] transition-all rounded-none"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="block text-sm font-black text-[#4b4b4b] uppercase">
                        Last Name
                      </label>
                      <FormInput
                        type="text"
                        value={newContact.lastName}
                        onChange={(e) =>
                          setNewContact({
                            ...newContact,
                            lastName: e.target.value,
                          })
                        }
                        placeholder="Enter last name"
                        className="w-full bg-white border-2 border-[#4b4b4b] p-3 text-[#4b4b4b] placeholder-[#4b4b4b]/40 focus:outline-none focus:ring-0 focus:border-[#4b4b4b] focus:-translate-y-0.5 focus:-translate-x-0.5 focus:shadow-[4px_4px_0_#f26522] transition-all rounded-none"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="block text-sm font-black text-[#4b4b4b] uppercase">
                        Phone Number *
                      </label>
                      <FormInput
                        type="tel"
                        value={newContact.phone}
                        onChange={(e) =>
                          setNewContact({
                            ...newContact,
                            phone: e.target.value,
                          })
                        }
                        placeholder="e.g., +60123456789"
                        className="w-full bg-white border-2 border-[#4b4b4b] p-3 text-[#4b4b4b] placeholder-[#4b4b4b]/40 focus:outline-none focus:ring-0 focus:border-[#4b4b4b] focus:-translate-y-0.5 focus:-translate-x-0.5 focus:shadow-[4px_4px_0_#f26522] transition-all rounded-none"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="block text-sm font-black text-[#4b4b4b] uppercase">
                        Email
                      </label>
                      <FormInput
                        type="email"
                        value={newContact.email}
                        onChange={(e) =>
                          setNewContact({
                            ...newContact,
                            email: e.target.value,
                          })
                        }
                        placeholder="Enter email address"
                        className="w-full bg-white border-2 border-[#4b4b4b] p-3 text-[#4b4b4b] placeholder-[#4b4b4b]/40 focus:outline-none focus:ring-0 focus:border-[#4b4b4b] focus:-translate-y-0.5 focus:-translate-x-0.5 focus:shadow-[4px_4px_0_#f26522] transition-all rounded-none"
                      />
                    </div>
                  </div>
                </div>

                {/* Company Information Section */}
                <div className="space-y-6">
                  <div className="flex items-center space-x-3 pb-2 border-b-2 border-[#4b4b4b]">
                    <div className="p-1.5 border-2 border-[#4b4b4b] bg-white text-[#4b4b4b]">
                      <Lucide icon="Building2" className="w-4 h-4" />
                    </div>
                    <h4 className="text-lg font-black text-[#4b4b4b] uppercase">
                      Company Information
                    </h4>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="block text-sm font-black text-[#4b4b4b] uppercase">
                        Company Name
                      </label>
                      <FormInput
                        type="text"
                        value={newContact.companyName}
                        onChange={(e) =>
                          setNewContact({
                            ...newContact,
                            companyName: e.target.value,
                          })
                        }
                        placeholder="Enter company name"
                        className="w-full bg-white border-2 border-[#4b4b4b] p-3 text-[#4b4b4b] placeholder-[#4b4b4b]/40 focus:outline-none focus:ring-0 focus:border-[#4b4b4b] focus:-translate-y-0.5 focus:-translate-x-0.5 focus:shadow-[4px_4px_0_#10b981] transition-all rounded-none"
                      />
                    </div>

                    {companyId === "079" && (
                      <div className="space-y-2">
                        <label className="block text-sm font-black text-[#4b4b4b] uppercase">
                          Branch
                        </label>
                        <FormInput
                          type="text"
                          value={newContact.branch}
                          onChange={(e) =>
                            setNewContact({
                              ...newContact,
                              branch: e.target.value,
                            })
                          }
                          placeholder="Enter branch"
                          className="w-full bg-white border-2 border-[#4b4b4b] p-3 text-[#4b4b4b] placeholder-[#4b4b4b]/40 focus:outline-none focus:ring-0 focus:border-[#4b4b4b] focus:-translate-y-0.5 focus:-translate-x-0.5 focus:shadow-[4px_4px_0_#10b981] transition-all rounded-none"
                        />
                      </div>
                    )}

                    <div className="space-y-2 md:col-span-2">
                      <label className="block text-sm font-black text-[#4b4b4b] uppercase">
                        Address
                      </label>
                      <FormInput
                        type="text"
                        value={newContact.address1}
                        onChange={(e) =>
                          setNewContact({
                            ...newContact,
                            address1: e.target.value,
                          })
                        }
                        placeholder="Enter address"
                        className="w-full bg-white border-2 border-[#4b4b4b] p-3 text-[#4b4b4b] placeholder-[#4b4b4b]/40 focus:outline-none focus:ring-0 focus:border-[#4b4b4b] focus:-translate-y-0.5 focus:-translate-x-0.5 focus:shadow-[4px_4px_0_#10b981] transition-all rounded-none"
                      />
                    </div>
                  </div>
                </div>

                {/* Additional Details Section */}
                {companyId === "079" && (
                  <div className="space-y-6">
                    <div className="flex items-center space-x-3 pb-2 border-b-2 border-[#4b4b4b]">
                      <div className="p-1.5 border-2 border-[#4b4b4b] bg-white text-[#4b4b4b]">
                        <Lucide icon="FileText" className="w-4 h-4" />
                      </div>
                      <h4 className="text-lg font-black text-[#4b4b4b] uppercase">
                        Additional Details
                      </h4>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="block text-sm font-black text-[#4b4b4b] uppercase">
                          Vehicle Number
                        </label>
                        <FormInput
                          type="text"
                          value={newContact.vehicleNumber}
                          onChange={(e) =>
                            setNewContact({
                              ...newContact,
                              vehicleNumber: e.target.value,
                            })
                          }
                          placeholder="Enter vehicle number"
                          className="w-full bg-white border-2 border-[#4b4b4b] p-3 text-[#4b4b4b] placeholder-[#4b4b4b]/40 focus:outline-none focus:ring-0 focus:border-[#4b4b4b] focus:-translate-y-0.5 focus:-translate-x-0.5 focus:shadow-[4px_4px_0_#a855f7] transition-all rounded-none"
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="block text-sm font-black text-[#4b4b4b] uppercase">
                          IC Number
                        </label>
                        <FormInput
                          type="text"
                          value={newContact.ic}
                          onChange={(e) =>
                            setNewContact({
                              ...newContact,
                              ic: e.target.value,
                            })
                          }
                          placeholder="Enter IC number"
                          className="w-full bg-white border-2 border-[#4b4b4b] p-3 text-[#4b4b4b] placeholder-[#4b4b4b]/40 focus:outline-none focus:ring-0 focus:border-[#4b4b4b] focus:-translate-y-0.5 focus:-translate-x-0.5 focus:shadow-[4px_4px_0_#a855f7] transition-all rounded-none"
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="block text-sm font-black text-[#4b4b4b] uppercase">
                          Expiry Date
                        </label>
                        <FormInput
                          type="date"
                          value={newContact.expiryDate}
                          onChange={(e) =>
                            setNewContact({
                              ...newContact,
                              expiryDate: e.target.value,
                            })
                          }
                          className="w-full bg-white border-2 border-[#4b4b4b] p-3 text-[#4b4b4b] focus:outline-none focus:ring-0 focus:border-[#4b4b4b] focus:-translate-y-0.5 focus:-translate-x-0.5 focus:shadow-[4px_4px_0_#a855f7] transition-all rounded-none"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Notes Section */}
                <div className="space-y-6">
                  <div className="flex items-center space-x-3 pb-2 border-b-2 border-[#4b4b4b]">
                    <div className="p-1.5 border-2 border-[#4b4b4b] bg-white text-[#4b4b4b]">
                      <Lucide icon="MessageSquare" className="w-4 h-4" />
                    </div>
                    <h4 className="text-lg font-black text-[#4b4b4b] uppercase">
                      Notes
                    </h4>
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-black text-[#4b4b4b] uppercase">
                      Additional Notes
                    </label>
                    <textarea
                      value={newContact.notes}
                      onChange={(e) =>
                        setNewContact({
                          ...newContact,
                          notes: e.target.value,
                        })
                      }
                      placeholder="Enter any additional notes"
                      rows={4}
                      className="w-full bg-white border-2 border-[#4b4b4b] p-3 text-[#4b4b4b] placeholder-[#4b4b4b]/40 focus:outline-none focus:ring-0 focus:border-[#4b4b4b] focus:-translate-y-0.5 focus:-translate-x-0.5 focus:shadow-[4px_4px_0_#4b4b4b] transition-all resize-none rounded-none"
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end space-x-3 p-6 border-t-2 border-[#4b4b4b] bg-[#f8f9fa]">
                <button
                  onClick={() => setAddContactModal(false)}
                  className="px-6 py-3 bg-white border-2 border-[#4b4b4b] text-[#4b4b4b] font-black uppercase hover:-translate-y-0.5 hover:shadow-[4px_4px_0_#4b4b4b] transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveNewContact}
                  disabled={!newContact.contactName || !newContact.phone || isLoading}
                  className="px-8 py-3 bg-[#f26522] border-2 border-[#4b4b4b] text-white font-black uppercase hover:-translate-y-0.5 hover:shadow-[4px_4px_0_#4b4b4b] disabled:opacity-50 disabled:hover:translate-y-0 disabled:hover:shadow-none transition-all"
                >
                  {isLoading ? "Adding..." : "Add Contact"}
                </button>
              </div>
            </Dialog.Panel>
          </div>
        </Dialog>

        {/* View Contact Modal */}
        <Dialog
          open={viewContactModal}
          onClose={() => setViewContactModal(false)}
        >
          <div className="fixed inset-0 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm z-50">
            <Dialog.Panel className="w-full max-w-3xl bg-white border-2 border-[#4b4b4b] neo-shadow shrink-0 overflow-y-auto max-h-[90vh]">
              <div className="relative p-6 px-8 border-b-2 border-[#4b4b4b] bg-[#f8f9fa]">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 border-2 border-[#4b4b4b] bg-white text-[#4b4b4b] neo-shadow-orange">
                      <Lucide icon="Eye" className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-black text-[#4b4b4b] uppercase tracking-tight">
                        Contact Details
                      </h3>
                      <p className="text-sm font-bold text-[#f26522] mt-1">
                        View contact information
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setViewContactModal(false)}
                    className="p-2 border-2 border-transparent hover:border-[#4b4b4b] hover:-translate-y-0.5 hover:shadow-[2px_2px_0_#4b4b4b] text-[#4b4b4b] transition-all bg-white"
                  >
                    <Lucide icon="X" className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {currentContact && (
                <div className="p-8 space-y-8 bg-white">
                  {/* Contact Header */}
                  <div className="text-center pb-8 border-b-2 border-[#4b4b4b]">
                    <div className="relative mx-auto mb-6 w-32 h-32">
                      <div className="w-full h-full bg-white border-2 border-[#4b4b4b] flex items-center justify-center text-[#4b4b4b] font-black text-4xl shadow-[8px_8px_0_#f26522]">
                        {currentContact.profileUrl ? (
                          <div className="w-full h-full relative group/contact">
                            <img
                              src={currentContact.profileUrl}
                              alt={
                                currentContact.contactName ||
                                currentContact.firstName ||
                                "Contact"
                              }
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                const target =
                                  e.currentTarget as HTMLImageElement;
                                const fallback =
                                  target.nextElementSibling as HTMLDivElement;
                                if (fallback) {
                                  target.style.display = "none";
                                  fallback.style.display = "flex";
                                }
                              }}
                            />
                            <div className="hidden w-full h-full absolute inset-0 bg-white items-center justify-center text-[#4b4b4b] font-black text-4xl">
                              {currentContact.contactName
                                ? currentContact.contactName
                                  .charAt(0)
                                  .toUpperCase()
                                : currentContact.firstName
                                  ?.charAt(0)
                                  ?.toUpperCase() || "U"}
                            </div>
                          </div>
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            {currentContact.contactName
                              ? currentContact.contactName
                                .charAt(0)
                                .toUpperCase()
                              : currentContact.firstName
                                ?.charAt(0)
                                ?.toUpperCase() || "U"}
                          </div>
                        )}
                      </div>
                    </div>
                    <h4 className="text-3xl font-black text-[#4b4b4b] uppercase mb-3">
                      {currentContact.contactName || "Unknown Contact"}
                    </h4>
                    <p className="text-[#4b4b4b] bg-white border-2 border-[#4b4b4b] shadow-[4px_4px_0_#4b4b4b] px-6 py-3 inline-block font-bold">
                      {currentContact.email || "No email"}
                    </p>
                  </div>

                  {/* Contact Information Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-6">
                      <div className="p-6 bg-white border-2 border-[#4b4b4b] hover:-translate-y-1 hover:-translate-x-1 hover:shadow-[4px_4px_0_#4b4b4b] transition-all">
                        <div className="flex items-center space-x-3 mb-3">
                          <label className="text-sm font-black text-[#f26522] uppercase tracking-wider">
                            Phone
                          </label>
                        </div>
                        <p className="text-xl font-black text-[#4b4b4b]">
                          {currentContact.phone || "No phone"}
                        </p>
                      </div>

                      <div className="p-6 bg-white border-2 border-[#4b4b4b] hover:-translate-y-1 hover:-translate-x-1 hover:shadow-[4px_4px_0_#4b4b4b] transition-all">
                        <div className="flex items-center space-x-3 mb-3">
                          <label className="text-sm font-black text-[#f26522] uppercase tracking-wider">
                            Company
                          </label>
                        </div>
                        <p className="text-xl font-black text-[#4b4b4b]">
                          {currentContact.companyName || "No company"}
                        </p>
                      </div>

                      {companyId === "079" && (
                        <div className="p-6 bg-white border-2 border-[#4b4b4b] hover:-translate-y-1 hover:-translate-x-1 hover:shadow-[4px_4px_0_#4b4b4b] transition-all">
                          <div className="flex items-center space-x-3 mb-3">
                            <label className="text-sm font-black text-[#f26522] uppercase tracking-wider">
                              Branch
                            </label>
                          </div>
                          <p className="text-xl font-black text-[#4b4b4b]">
                            {currentContact.branch || "No branch"}
                          </p>
                        </div>
                      )}

                      {companyId === "079" && (
                        <div className="p-6 bg-white border-2 border-[#4b4b4b] hover:-translate-y-1 hover:-translate-x-1 hover:shadow-[4px_4px_0_#4b4b4b] transition-all">
                          <div className="flex items-center space-x-3 mb-3">
                            <label className="text-sm font-black text-[#f26522] uppercase tracking-wider">
                              Vehicle Number
                            </label>
                          </div>
                          <p className="text-xl font-black text-[#4b4b4b]">
                            {currentContact.vehicleNumber ||
                              "No vehicle number"}
                          </p>
                        </div>
                      )}
                    </div>

                    <div className="space-y-6">
                      <div className="p-6 bg-white border-2 border-[#4b4b4b] hover:-translate-y-1 hover:-translate-x-1 hover:shadow-[4px_4px_0_#4b4b4b] transition-all">
                        <div className="flex items-center space-x-3 mb-3">
                          <label className="text-sm font-black text-[#10b981] uppercase tracking-wider">
                            Address
                          </label>
                        </div>
                        <p className="text-xl font-black text-[#4b4b4b]">
                          {currentContact.address1 || "No address"}
                        </p>
                      </div>

                      <div className="p-6 bg-white border-2 border-[#4b4b4b] hover:-translate-y-1 hover:-translate-x-1 hover:shadow-[4px_4px_0_#4b4b4b] transition-all">
                        <div className="flex items-center space-x-3 mb-3">
                          <label className="text-sm font-black text-[#10b981] uppercase tracking-wider">
                            Date Added
                          </label>
                        </div>
                        <p className="text-xl font-black text-[#4b4b4b]">
                          {currentContact.createdAt
                            ? new Date(
                              currentContact.createdAt
                            ).toLocaleDateString()
                            : currentContact.dateAdded
                              ? new Date(
                                currentContact.dateAdded
                              ).toLocaleDateString()
                              : "Unknown"}
                        </p>
                      </div>

                      {companyId === "079" && (
                        <div className="p-6 bg-white border-2 border-[#4b4b4b] hover:-translate-y-1 hover:-translate-x-1 hover:shadow-[4px_4px_0_#4b4b4b] transition-all">
                          <div className="flex items-center space-x-3 mb-3">
                            <label className="text-sm font-black text-[#10b981] uppercase tracking-wider">
                              IC Number
                            </label>
                          </div>
                          <p className="text-xl font-black text-[#4b4b4b]">
                            {currentContact.ic || "No IC number"}
                          </p>
                        </div>
                      )}

                      {companyId === "079" && (
                        <div className="p-6 bg-white border-2 border-[#4b4b4b] hover:-translate-y-1 hover:-translate-x-1 hover:shadow-[4px_4px_0_#4b4b4b] transition-all">
                          <div className="flex items-center space-x-3 mb-3">
                            <label className="text-sm font-black text-[#10b981] uppercase tracking-wider">
                              Expiry Date
                            </label>
                          </div>
                          <p className="text-xl font-black text-[#4b4b4b]">
                            {currentContact.expiryDate
                              ? new Date(
                                currentContact.expiryDate
                              ).toLocaleDateString()
                              : "No expiry date"}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Custom Fields Section */}
                  {currentContact.customFields &&
                    Object.keys(currentContact.customFields).length > 0 && (
                      <div className="p-6 bg-white border-2 border-[#4b4b4b]">
                        <div className="flex items-center space-x-3 mb-4">
                          <div className="p-1.5 border-2 border-[#4b4b4b] bg-[#e8e8e8]">
                            <Lucide
                              icon="Settings"
                              className="w-4 h-4 text-[#4b4b4b]"
                            />
                          </div>
                          <label className="text-lg font-black text-[#4b4b4b] uppercase">
                            Custom Fields
                          </label>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                          {Object.entries(currentContact.customFields).map(
                            ([key, value]) => (
                              <div
                                key={key}
                                className="p-4 bg-white border-2 border-[#4b4b4b] hover:-translate-y-0.5 hover:shadow-[2px_2px_0_#4b4b4b] transition-all"
                              >
                                <div className="space-y-2">
                                  <label className="text-xs font-black text-[#f26522] uppercase tracking-wider">
                                    {key.replace(/_/g, " ")}
                                  </label>
                                  <p className="text-sm font-bold text-[#4b4b4b] break-words">
                                    {value || "Not specified"}
                                  </p>
                                </div>
                              </div>
                            )
                          )}
                        </div>
                      </div>
                    )}

                  {/* Notes Section */}
                  {currentContact.notes && (
                    <div className="p-6 bg-white border-2 border-[#4b4b4b]">
                      <div className="flex items-center space-x-3 mb-4">
                        <div className="p-1.5 border-2 border-[#4b4b4b] bg-[#e8e8e8]">
                          <Lucide
                            icon="FileText"
                            className="w-4 h-4 text-[#4b4b4b]"
                          />
                        </div>
                        <label className="text-lg font-black text-[#4b4b4b] uppercase">
                          Notes
                        </label>
                      </div>
                      <p className="text-[#4b4b4b] font-bold leading-relaxed text-base">
                        {currentContact.notes}
                      </p>
                    </div>
                  )}

                  {/* Tags Section */}
                  {currentContact.tags && currentContact.tags.length > 0 && (
                    <div className="p-6 bg-white border-2 border-[#4b4b4b]">
                      <div className="flex items-center space-x-3 mb-4">
                        <div className="p-1.5 border-2 border-[#4b4b4b] bg-rose-100">
                          <Lucide
                            icon="Tags"
                            className="w-4 h-4 text-[#4b4b4b]"
                          />
                        </div>
                        <label className="text-lg font-black text-[#4b4b4b] uppercase">
                          Tags
                        </label>
                      </div>
                      <div className="flex flex-wrap gap-3">
                        {currentContact.tags.map((tag, index) => (
                          <span
                            key={index}
                            className="inline-flex items-center px-4 py-2 text-sm font-black bg-white border-2 border-[#4b4b4b] text-[#4b4b4b] shadow-[2px_2px_0_#4b4b4b] uppercase"
                          >
                            <Lucide icon="Tag" className="w-3 h-3 mr-2" />
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              <div className="flex justify-end space-x-3 p-6 border-t-2 border-[#4b4b4b] bg-[#f8f9fa]">
                <button
                  onClick={() => setViewContactModal(false)}
                  className="px-6 py-3 bg-white border-2 border-[#4b4b4b] text-[#4b4b4b] font-black uppercase hover:-translate-y-0.5 hover:shadow-[4px_4px_0_#4b4b4b] transition-all"
                >
                  Close
                </button>
                <button
                  onClick={() => {
                    setViewContactModal(false);
                    setEditContactModal(true);
                  }}
                  disabled={userRole === "3"}
                  className="px-8 py-3 bg-[#4b4b4b] border-2 border-[#4b4b4b] text-white font-black uppercase hover:-translate-y-0.5 hover:shadow-[4px_4px_0_#4b4b4b] disabled:opacity-50 disabled:hover:translate-y-0 disabled:hover:shadow-none transition-all flex items-center space-x-2"
                >
                  <Lucide icon="UserCog" className="w-4 h-4" />
                  <span>Edit Contact</span>
                </button>
              </div>
            </Dialog.Panel>
          </div>
        </Dialog>

        {/* Delete Confirmation Modal */}
        <Dialog
          open={deleteConfirmationModal}
          onClose={() => setDeleteConfirmationModal(false)}
        >
          <div className="fixed inset-0 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm z-50">
            <Dialog.Panel className="w-full max-w-md bg-white border-2 border-[#4b4b4b] neo-shadow shrink-0">
              <div className="relative p-8">
                <div className="text-center">
                  <div className="mx-auto flex items-center justify-center h-16 w-16 mb-6 border-2 border-[#4b4b4b] bg-white text-[#4b4b4b] neo-shadow-orange">
                    <Lucide icon="AlertTriangle" className="h-8 w-8 text-[#dc2626]" />
                  </div>
                  <h3 className="text-xl font-black text-[#4b4b4b] uppercase mb-3">
                    Delete Contact
                  </h3>
                  <p className="text-[#4b4b4b] font-bold mb-8 bg-[#f8f9fa] border-2 border-[#4b4b4b] p-4 text-left">
                    Are you sure you want to delete this contact? This action cannot be undone.
                  </p>
                </div>

                <div className="flex justify-end space-x-4">
                  <button
                    onClick={() => setDeleteConfirmationModal(false)}
                    className="px-6 py-3 bg-white border-2 border-[#4b4b4b] text-[#4b4b4b] font-black uppercase hover:-translate-y-0.5 hover:shadow-[4px_4px_0_#4b4b4b] transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleDeleteContact}
                    disabled={isLoading}
                    className="px-6 py-3 bg-[#dc2626] border-2 border-[#4b4b4b] text-white font-black uppercase hover:-translate-y-0.5 hover:shadow-[4px_4px_0_#4b4b4b] transition-all disabled:opacity-50 disabled:hover:translate-y-0 disabled:hover:shadow-none"
                  >
                    {isLoading ? "Deleting..." : "Delete"}
                  </button>
                </div>
              </div>
            </Dialog.Panel>
          </div>
        </Dialog>

        {/* Mass Delete Modal */}
        <Dialog
          open={showMassDeleteModal}
          onClose={() => setShowMassDeleteModal(false)}
        >
          <div className="fixed inset-0 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm z-50">
            <Dialog.Panel className="w-full max-w-md bg-white border-2 border-[#4b4b4b] neo-shadow shrink-0">
              <div className="relative p-8">
                <div className="text-center">
                  <div className="mx-auto flex items-center justify-center h-16 w-16 mb-6 border-2 border-[#4b4b4b] bg-white text-[#4b4b4b] shadow-[4px_4px_0_#f26522]">
                    <Lucide icon="AlertTriangle" className="h-8 w-8 text-[#f26522]" />
                  </div>
                  <h3 className="text-xl font-black text-[#4b4b4b] uppercase mb-3">
                    Delete Selected Contacts
                  </h3>
                  <div className="bg-[#f8f9fa] border-2 border-[#4b4b4b] p-4 mb-8 text-left">
                    <p className="text-[#4b4b4b] font-bold">
                      Are you sure you want to delete{" "}
                      <span className="text-[#f26522] font-black underline underline-offset-4 decoration-2 decoration-[#f26522]">
                        {selectedContacts.length}
                      </span>{" "}
                      selected contacts? This action cannot be undone.
                    </p>
                  </div>
                </div>

                <div className="flex justify-end space-x-4">
                  <button
                    onClick={() => setShowMassDeleteModal(false)}
                    className="px-6 py-3 bg-white border-2 border-[#4b4b4b] text-[#4b4b4b] font-black uppercase hover:-translate-y-0.5 hover:shadow-[4px_4px_0_#4b4b4b] transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleMassDelete}
                    disabled={isMassDeleting}
                    className="px-6 py-3 bg-[#f26522] border-2 border-[#4b4b4b] text-white font-black uppercase hover:-translate-y-0.5 hover:shadow-[4px_4px_0_#4b4b4b] transition-all disabled:opacity-50 disabled:hover:translate-y-0 disabled:hover:shadow-none"
                  >
                    {isMassDeleting ? "Deleting..." : "Delete All"}
                  </button>
                </div>
              </div>
            </Dialog.Panel>
          </div>
        </Dialog>

        {/* Add Tag Modal */}
        <Dialog
          open={showAddTagModal}
          onClose={() => setShowAddTagModal(false)}
        >
          <div className="fixed inset-0 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm z-50">
            <Dialog.Panel className="w-full max-w-md bg-white border-2 border-[#4b4b4b] neo-shadow shrink-0">
              <div className="relative p-6 px-8 border-b-2 border-[#4b4b4b] bg-[#f8f9fa]">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 border-2 border-[#4b4b4b] bg-white text-[#4b4b4b] shadow-[4px_4px_0_#f26522]">
                      <Lucide icon="Tag" className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-xl font-black text-[#4b4b4b] uppercase">
                        Add New Tag
                      </h3>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowAddTagModal(false)}
                    className="p-2 border-2 border-transparent hover:border-[#4b4b4b] hover:-translate-y-0.5 hover:shadow-[2px_2px_0_#4b4b4b] text-[#4b4b4b] transition-all bg-white"
                  >
                    <Lucide icon="X" className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="p-8 space-y-6 bg-white">
                <div className="space-y-3">
                  <label className="block text-sm font-black text-[#4b4b4b] uppercase">
                    Tag Name
                  </label>
                  <FormInput
                    type="text"
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    placeholder="Enter a descriptive tag name..."
                    className="w-full bg-white border-2 border-[#4b4b4b] p-4 text-[#4b4b4b] placeholder-[#4b4b4b]/40 focus:outline-none focus:ring-0 focus:border-[#4b4b4b] focus:-translate-y-0.5 focus:-translate-x-0.5 focus:shadow-[4px_4px_0_#f26522] transition-all rounded-none"
                  />
                </div>

                <div className="flex justify-end space-x-3 pt-6 bg-white mt-8 border-t-2 border-[#4b4b4b]">
                  <button
                    onClick={() => setShowAddTagModal(false)}
                    className="px-6 py-3 bg-white border-2 border-[#4b4b4b] text-[#4b4b4b] font-black uppercase hover:-translate-y-0.5 hover:shadow-[4px_4px_0_#4b4b4b] transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSaveNewTag}
                    disabled={!newTag.trim() || isLoading}
                    className="px-8 py-3 bg-[#4b4b4b] border-2 border-[#4b4b4b] text-white font-black uppercase hover:-translate-y-0.5 hover:shadow-[4px_4px_0_#f26522] transition-all disabled:opacity-50 disabled:hover:translate-y-0 disabled:hover:shadow-none flex items-center space-x-2"
                  >
                    {isLoading ? (
                      <div className="flex items-center space-x-2">
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        <span>Adding...</span>
                      </div>
                    ) : (
                      <>
                        <Lucide icon="Plus" className="w-4 h-4" />
                        <span>Add Tag</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </Dialog.Panel>
          </div>
        </Dialog>

        {/* Filters Modal */}
        <Dialog
          open={showFiltersModal}
          onClose={() => setShowFiltersModal(false)}
        >
          <div className="fixed inset-0 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm z-50">
            <Dialog.Panel className="w-full max-w-lg bg-white border-2 border-[#4b4b4b] neo-shadow shrink-0 overflow-hidden flex flex-col max-h-[90vh]">
              <div className="relative p-6 px-8 border-b-2 border-[#4b4b4b] bg-[#f8f9fa] shrink-0">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 border-2 border-[#4b4b4b] bg-white text-[#4b4b4b] shadow-[4px_4px_0_#f26522]">
                      <Lucide icon="Filter" className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-xl font-black text-[#4b4b4b] uppercase">
                        Filter Contacts
                      </h3>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowFiltersModal(false)}
                    className="p-2 border-2 border-transparent hover:border-[#4b4b4b] hover:-translate-y-0.5 hover:shadow-[2px_2px_0_#4b4b4b] text-[#4b4b4b] transition-all bg-white"
                  >
                    <Lucide icon="X" className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="p-8 space-y-8 overflow-y-auto bg-white">
                {/* Tag Filters */}
                <div className="space-y-4">
                  <div className="flex items-center space-x-2 border-b-2 border-[#4b4b4b] pb-2">
                    <Lucide icon="Tags" className="w-5 h-5 text-[#f26522]" />
                    <h4 className="text-lg font-black text-[#4b4b4b] uppercase">
                      Filter by Tags
                    </h4>
                  </div>
                  {/* Search Input for Tags */}
                  <div className="relative">
                    <div className="absolute left-4 top-1/2 transform -translate-y-1/2">
                      <Lucide icon="Search" className="w-4 h-4 text-[#4b4b4b]" />
                    </div>
                    <input
                      type="text"
                      placeholder="Search tags..."
                      value={tagSearchQuery}
                      onChange={(e) => setTagSearchQuery(e.target.value)}
                      className="w-full pl-12 pr-4 py-3 bg-white border-2 border-[#4b4b4b] focus:outline-none focus:ring-0 focus:border-[#4b4b4b] focus:-translate-y-0.5 focus:-translate-x-0.5 focus:shadow-[4px_4px_0_#f26522] transition-all text-[#4b4b4b] font-bold placeholder-[#4b4b4b]/50 rounded-none"
                    />
                  </div>
                  <div className="space-y-2 max-h-60 overflow-y-auto bg-[#f8f9fa] border-2 border-[#4b4b4b] p-4">
                    {(() => {
                      const defaultTags = [
                        { id: "built-in-cancelled-appointment", name: "Cancelled Appointment" },
                        { id: "built-in-booked-appointment", name: "Booked Appointment" },
                        { id: "built-in-rescheduled-appointment", name: "Rescheduled Appointment" },
                        { id: "built-in-stop-bot", name: "stop bot" },
                        { id: "built-in-feedback", name: "feedback" },
                        { id: "built-in-inquiry", name: "inquiry" },
                        { id: "built-in-ordered", name: "ordered" },
                        { id: "built-in-CN", name: "CN" },
                        { id: "built-in-EN", name: "EN" },
                      ];
                      const allTags = [...defaultTags, ...tagList];
                      return allTags
                        .filter((tag) =>
                          tag.name.toLowerCase().includes(tagSearchQuery.toLowerCase())
                        )
                        .map((tag) => (
                          <label
                            key={tag.id}
                            className="flex items-center p-2 hover:bg-white border-2 border-transparent hover:border-[#4b4b4b] transition-all cursor-pointer"
                          >
                            <ThreeStateTagFilter tagName={tag.name} />
                            <span className="ml-3 text-sm font-bold text-[#4b4b4b] truncate flex-1">
                              {tag.name}
                            </span>
                            <div className="ml-2 text-xs font-black uppercase text-[#4b4b4b]/60">
                              {getTagFilterState(tag.name) === "include" && (
                                <span className="text-emerald-600 bg-emerald-100 border border-emerald-600 px-1">Include</span>
                              )}
                              {getTagFilterState(tag.name) === "exclude" && (
                                <span className="text-rose-600 bg-rose-100 border border-rose-600 px-1">Exclude</span>
                              )}
                              {getTagFilterState(tag.name) === "none" && (
                                <span>Click to filter</span>
                              )}
                            </div>
                          </label>
                        ));
                    })()}
                    {tagList.filter((tag) =>
                      tag.name.toLowerCase().includes(tagSearchQuery.toLowerCase())
                    ).length === 0 &&
                      tagSearchQuery && (
                        <div className="text-center py-6">
                          <p className="text-sm font-bold text-[#4b4b4b]">
                            No tags found matching "{tagSearchQuery}"
                          </p>
                        </div>
                      )}
                  </div>
                </div>

                {/* User Filters */}
                <div className="space-y-4">
                  <div className="flex items-center space-x-2 border-b-2 border-[#4b4b4b] pb-2">
                    <Lucide icon="Users" className="w-5 h-5 text-[#f26522]" />
                    <h4 className="text-lg font-black text-[#4b4b4b] uppercase">
                      Filter by Assigned User
                    </h4>
                  </div>
                  <div className="space-y-2 max-h-60 overflow-y-auto bg-[#f8f9fa] border-2 border-[#4b4b4b] p-4">
                    {(() => {
                      const stableEmployeeList = employeeListRef.current;
                      if (stableEmployeeList.length === 0) {
                        return (
                          <div className="text-center py-4 text-[#4b4b4b]">
                            <p className="font-bold">No employees found</p>
                          </div>
                        );
                      }

                      return stableEmployeeList.map((employee) => (
                        <label
                          key={employee.id}
                          className="flex items-center p-2 hover:bg-white border-2 border-transparent hover:border-[#4b4b4b] transition-all cursor-pointer"
                        >
                          <ThreeStateUserFilter userName={employee.name} />
                          <span className="ml-3 text-sm font-bold text-[#4b4b4b] truncate flex-1">
                            {employee.name}
                          </span>
                          <div className="ml-2 text-xs font-black uppercase text-[#4b4b4b]/60">
                            {getUserFilterState(employee.name) === "include" && (
                              <span className="text-emerald-600 bg-emerald-100 border border-emerald-600 px-1">Include</span>
                            )}
                            {getUserFilterState(employee.name) === "exclude" && (
                              <span className="text-rose-600 bg-rose-100 border border-rose-600 px-1">Exclude</span>
                            )}
                            {getUserFilterState(employee.name) === "none" && (
                              <span>Click to filter</span>
                            )}
                          </div>
                        </label>
                      ));
                    })()}
                  </div>
                </div>

                {/* Filter Legend */}
                <div className="mt-6 p-4 bg-[#f8f9fa] border-2 border-[#4b4b4b]">
                  <div className="text-xs text-[#4b4b4b] space-y-2 font-bold">
                    <div className="font-black uppercase mb-2 text-[#f26522]">
                      Filter Guide:
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-4 h-4 bg-white border-2 border-[#4b4b4b]" />
                      <span>Unfiltered - Shows all contacts</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-4 h-4 bg-emerald-500 border-2 border-[#4b4b4b] flex items-center justify-center text-white">
                        <Lucide icon="Check" className="w-3 h-3" />
                      </div>
                      <span>Include - Shows only contacts with this tag/user</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-4 h-4 bg-rose-500 border-2 border-[#4b4b4b] flex items-center justify-center text-white">
                        <Lucide icon="X" className="w-3 h-3" />
                      </div>
                      <span>Exclude - Hides contacts with this tag/user</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-between p-6 border-t-2 border-[#4b4b4b] bg-[#f8f9fa] shrink-0">
                <button
                  onClick={() => {
                    setSelectedTagFilters([]);
                    setSelectedUserFilters([]);
                    setExcludedTagFilters([]);
                    setExcludedUserFilters([]);
                  }}
                  className="px-6 py-3 bg-white border-2 border-[#4b4b4b] text-[#4b4b4b] font-black uppercase hover:-translate-y-0.5 hover:shadow-[4px_4px_0_#4b4b4b] transition-all flex items-center space-x-2"
                >
                  <Lucide icon="RotateCcw" className="w-4 h-4" />
                  <span>Clear All</span>
                </button>
                <button
                  onClick={() => setShowFiltersModal(false)}
                  className="px-8 py-3 bg-[#f26522] border-2 border-[#4b4b4b] text-white font-black uppercase hover:-translate-y-0.5 hover:shadow-[4px_4px_0_#4b4b4b] transition-all flex items-center space-x-2"
                >
                  <Lucide icon="Check" className="w-4 h-4" />
                  <span>Apply Filters</span>
                </button>
              </div>
            </Dialog.Panel>
          </div>
        </Dialog>

        {/* Date Filter Modal */}
        <Dialog
          open={showDateFilterModal}
          onClose={() => setShowDateFilterModal(false)}
        >
          <div className="fixed inset-0 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm z-50">
            <Dialog.Panel className="w-full max-w-md bg-white border-2 border-[#4b4b4b] neo-shadow shrink-0">
              <div className="relative p-6 px-8 border-b-2 border-[#4b4b4b] bg-[#f8f9fa]">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 border-2 border-[#4b4b4b] bg-white text-[#4b4b4b] shadow-[4px_4px_0_#f26522]">
                      <Lucide icon="Calendar" className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-xl font-black text-[#4b4b4b] uppercase">
                        Filter by Date
                      </h3>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowDateFilterModal(false)}
                    className="p-2 border-2 border-transparent hover:border-[#4b4b4b] hover:-translate-y-0.5 hover:shadow-[2px_2px_0_#4b4b4b] text-[#4b4b4b] transition-all bg-white"
                  >
                    <Lucide icon="X" className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="p-8 space-y-6 bg-white">
                <div className="space-y-3">
                  <label className="block text-sm font-black text-[#4b4b4b] uppercase">
                    Start Date
                  </label>
                  <FormInput
                    type="date"
                    value={dateFilterStart}
                    onChange={(e) => setDateFilterStart(e.target.value)}
                    className="w-full bg-white border-2 border-[#4b4b4b] p-4 text-[#4b4b4b] focus:outline-none focus:ring-0 focus:border-[#4b4b4b] focus:-translate-y-0.5 focus:-translate-x-0.5 focus:shadow-[4px_4px_0_#f26522] transition-all rounded-none"
                  />
                </div>

                <div className="space-y-3">
                  <label className="block text-sm font-black text-[#4b4b4b] uppercase">
                    End Date
                  </label>
                  <FormInput
                    type="date"
                    value={dateFilterEnd}
                    onChange={(e) => setDateFilterEnd(e.target.value)}
                    className="w-full bg-white border-2 border-[#4b4b4b] p-4 text-[#4b4b4b] focus:outline-none focus:ring-0 focus:border-[#4b4b4b] focus:-translate-y-0.5 focus:-translate-x-0.5 focus:shadow-[4px_4px_0_#f26522] transition-all rounded-none"
                  />
                </div>
              </div>

              <div className="flex justify-between items-center p-6 border-t-2 border-[#4b4b4b] bg-[#f8f9fa]">
                <button
                  onClick={clearDateFilter}
                  className="px-6 py-3 bg-white border-2 border-[#4b4b4b] text-[#4b4b4b] font-black uppercase hover:-translate-y-0.5 hover:shadow-[4px_4px_0_#4b4b4b] transition-all flex items-center space-x-2"
                >
                  <Lucide icon="RotateCcw" className="w-4 h-4" />
                  <span>Clear Filter</span>
                </button>
                <div className="flex space-x-3">
                  <button
                    onClick={() => setShowDateFilterModal(false)}
                    className="px-6 py-3 bg-white border-2 border-[#4b4b4b] text-[#4b4b4b] font-black uppercase hover:-translate-y-0.5 hover:shadow-[4px_4px_0_#4b4b4b] transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={applyDateFilter}
                    className="px-8 py-3 bg-[#4b4b4b] border-2 border-[#4b4b4b] text-white font-black uppercase hover:-translate-y-0.5 hover:shadow-[4px_4px_0_#f26522] transition-all flex items-center space-x-2"
                  >
                    <Lucide icon="Check" className="w-4 h-4" />
                    <span>Apply Settings</span>
                  </button>
                </div>
              </div>
            </Dialog.Panel>
          </div>
        </Dialog>

        {/* Columns Modal */}
        <Dialog
          open={showColumnsModal}
          onClose={() => setShowColumnsModal(false)}
        >
          <div className="fixed inset-0 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm z-50">
            <Dialog.Panel className="w-full max-w-sm bg-white border-2 border-[#4b4b4b] neo-shadow shrink-0">
              <div className="relative p-6 px-8 border-b-2 border-[#4b4b4b] bg-[#f8f9fa]">
                <div className="flex items-center space-x-3">
                  <div className="p-2 border-2 border-[#4b4b4b] bg-white text-[#4b4b4b] shadow-[4px_4px_0_#f26522]">
                    <Lucide icon="Grid2x2" className="w-5 h-5" />
                  </div>
                  <Dialog.Title className="text-xl font-black text-[#4b4b4b] uppercase">
                    Manage Columns
                  </Dialog.Title>
                </div>
              </div>

              <div className="p-8 space-y-3 max-h-60 overflow-y-auto bg-white border-b-2 border-[#4b4b4b]">
                {Object.entries(visibleColumns)
                  .filter(([column]) => {
                    // Filter out company-specific fields if not companyId 079
                    if (
                      companyId !== "079" &&
                      ["branch", "vehicleNumber", "ic", "expiryDate"].includes(column)
                    ) {
                      return false;
                    }
                    return true;
                  })
                  .map(([column, isVisible]) => {
                    // Check if this is a custom field
                    const isCustomField = column.startsWith("customField_");
                    const displayName = isCustomField
                      ? column.replace("customField_", "")
                      : column;

                    // Don't allow deletion of essential columns
                    const isEssentialColumn = [
                      "checkbox",
                      "contact",
                      "phone",
                      "actions",
                    ].includes(column);

                    return (
                      <div
                        key={column}
                        className="flex items-center p-2 hover:bg-[#f8f9fa] border-2 border-transparent hover:border-[#4b4b4b] transition-all cursor-pointer group"
                      >
                        <label className="flex items-center text-left w-full cursor-pointer">
                          <input
                            type="checkbox"
                            checked={isVisible}
                            onChange={() => {
                              setVisibleColumns((prev) => ({
                                ...prev,
                                [column]: !isVisible,
                              }));
                            }}
                            className="w-5 h-5 border-2 border-[#4b4b4b] text-[#f26522] focus:ring-0 focus:ring-offset-0 rounded-none cursor-pointer"
                          />
                          <span className="ml-3 text-sm font-bold text-[#4b4b4b] capitalize truncate">
                            {isCustomField ? `${displayName} (Custom)` : displayName}
                          </span>
                        </label>
                        <div className="flex items-center ml-auto">
                          {!isEssentialColumn && (
                            <button
                              onClick={() => {
                                setVisibleColumns((prev) => {
                                  const newColumns = { ...prev };
                                  delete newColumns[column];
                                  return newColumns;
                                });
                              }}
                              className="ml-3 p-1.5 text-rose-500 hover:text-white hover:bg-rose-500 border-2 border-transparent hover:border-[#4b4b4b] hover:-translate-y-0.5 hover:shadow-[2px_2px_0_#4b4b4b] transition-all"
                              title="Delete column"
                            >
                              <Lucide icon="Trash2" className="w-4 h-4" />
                            </button>
                          )}
                          {isEssentialColumn && (
                            <span className="text-xs font-black uppercase text-emerald-600 bg-emerald-100 border border-emerald-600 px-2 py-0.5">
                              Required
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
              </div>

              <div className="flex justify-between items-center p-6 bg-[#f8f9fa]">
                <button
                  onClick={() => setShowColumnsModal(false)}
                  className="px-6 py-3 bg-white border-2 border-[#4b4b4b] text-[#4b4b4b] font-black uppercase hover:-translate-y-0.5 hover:shadow-[4px_4px_0_#4b4b4b] transition-all"
                >
                  Close
                </button>
                <button
                  onClick={() => {
                    if (window.confirm("This will restore all default columns. Are you sure?")) {
                      setVisibleColumns({
                        checkbox: true, contact: true, phone: true, tags: true, ic: true, expiryDate: true, vehicleNumber: true, branch: true, notes: true
                      });
                    }
                  }}
                  className="px-6 py-3 bg-[#4b4b4b] border-2 border-[#4b4b4b] text-white font-black uppercase hover:-translate-y-0.5 hover:shadow-[4px_4px_0_#f26522] transition-all flex items-center space-x-2"
                >
                  <Lucide icon="RotateCcw" className="w-4 h-4" />
                  <span>Reset</span>
                </button>
              </div>
            </Dialog.Panel>
          </div>
        </Dialog>

        {/* Delete Tag Modal - Tag List for Deletion */}
        {showDeleteTagModal && (
          <Dialog
            open={showDeleteTagModal}
            onClose={() => setShowDeleteTagModal(false)}
          >
            <div className="fixed inset-0 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm z-50">
              <Dialog.Panel className="w-full max-w-2xl bg-white border-2 border-[#4b4b4b] neo-shadow shrink-0 flex flex-col max-h-[90vh]">
                <div className="relative p-6 px-8 border-b-2 border-[#4b4b4b] bg-rose-100/50 shrink-0">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 border-2 border-rose-500 bg-white text-rose-500 shadow-[4px_4px_0_#f43f5e]">
                        <Lucide icon="Trash2" className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="text-xl font-black text-[#4b4b4b] uppercase">
                          Delete Tags
                        </h3>
                        <p className="text-[#4b4b4b]/70 font-bold text-sm mt-1">
                          Select tags to delete from your system
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => setShowDeleteTagModal(false)}
                      className="p-2 border-2 border-transparent hover:border-[#4b4b4b] hover:-translate-y-0.5 hover:shadow-[2px_2px_0_#4b4b4b] text-[#4b4b4b] transition-all bg-white"
                    >
                      <Lucide icon="X" className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="p-8 overflow-y-auto bg-white flex-1">
                  {tagList.length === 0 ? (
                    <div className="text-center py-12 border-2 border-dashed border-[#4b4b4b]/30">
                      <div className="p-4 bg-gray-100 border-2 border-[#4b4b4b] inline-block mb-4 shadow-[4px_4px_0_#4b4b4b]">
                        <Lucide icon="Tag" className="w-8 h-8 text-[#4b4b4b]" />
                      </div>
                      <h4 className="text-lg font-black text-[#4b4b4b] uppercase mb-2">
                        No Tags Found
                      </h4>
                      <p className="text-[#4b4b4b]/60 font-bold text-sm">
                        There are no tags available to delete.
                      </p>
                    </div>
                  ) : (
                    <>
                      <div className="mb-6">
                        <p className="text-[#4b4b4b] text-sm font-bold bg-amber-100 border-2 border-amber-500 p-4 shadow-[4px_4px_0_#f59e0b]">
                          <span className="text-amber-600 font-black uppercase tracking-wide mr-2">
                            ⚠️ Warning:
                          </span>
                          Deleting tags will remove them from all contacts. This action cannot be undone.
                        </p>
                      </div>

                      <div className="space-y-3 overflow-y-auto border-2 border-[#4b4b4b] p-4 bg-[#f8f9fa]">
                        {tagList.map((tag) => (
                          <div
                            key={tag.id}
                            className="flex items-center justify-between p-3 bg-white border-2 border-[#4b4b4b] hover:-translate-y-0.5 hover:shadow-[4px_4px_0_#f43f5e] hover:border-rose-500 transition-all group"
                          >
                            <div className="flex items-center space-x-4">
                              <div className="p-2 border-2 border-[#4b4b4b] bg-blue-100 text-[#4b4b4b]">
                                <Lucide icon="Tag" className="w-4 h-4" />
                              </div>
                              <h4 className="text-[#4b4b4b] font-black group-hover:text-rose-600 transition-colors">
                                {tag.name}
                              </h4>
                            </div>
                            <button
                              onClick={() => {
                                if (window.confirm(`Are you sure you want to delete the tag "${tag.name}"? This action cannot be undone.`)) {
                                  handleConfirmDeleteTag(tag);
                                }
                              }}
                              className="px-4 py-2 bg-rose-50 border-2 border-rose-500 text-rose-600 font-black uppercase hover:-translate-y-0.5 hover:shadow-[4px_4px_0_#f43f5e] hover:bg-rose-500 hover:text-white transition-all flex items-center space-x-2"
                            >
                              <Lucide icon="Trash2" className="w-4 h-4" />
                              <span>Delete</span>
                            </button>
                          </div>
                        ))}
                      </div>

                      {tagList.length > 0 && (
                        <div className="mt-8 pt-6 border-t-2 border-[#4b4b4b]">
                          <div className="flex items-center justify-between bg-rose-50 border-2 border-rose-500 p-4 shadow-[4px_4px_0_#f43f5e]">
                            <div className="text-[#4b4b4b] font-bold text-sm">
                              <span className="font-black text-rose-600">
                                {tagList.length}
                              </span>{" "}
                              tag{tagList.length !== 1 ? "s" : ""} available
                            </div>
                            <button
                              onClick={() => {
                                if (window.confirm(`Are you sure you want to delete ALL ${tagList.length} tags? This action cannot be undone.`)) {
                                  // handleBulkDeleteTags();
                                }
                              }}
                              className="px-6 py-3 bg-rose-600 border-2 border-[#4b4b4b] text-white font-black uppercase hover:-translate-y-0.5 hover:shadow-[4px_4px_0_#4b4b4b] transition-all flex items-center space-x-2"
                            >
                              <Lucide icon="AlertTriangle" className="w-4 h-4" />
                              <span>Delete All Tags</span>
                            </button>
                          </div>
                        </div>
                      )}
                    </>
                  )}
                </div>

                <div className="flex justify-end p-6 border-t-2 border-[#4b4b4b] bg-[#f8f9fa] shrink-0">
                  <button
                    onClick={() => setShowDeleteTagModal(false)}
                    className="px-8 py-3 bg-white border-2 border-[#4b4b4b] text-[#4b4b4b] font-black uppercase hover:-translate-y-0.5 hover:shadow-[4px_4px_0_#4b4b4b] transition-all flex items-center space-x-2"
                  >
                    <Lucide icon="X" className="w-4 h-4" />
                    <span>Close</span>
                  </button>
                </div>
              </Dialog.Panel>
            </div>
          </Dialog>
        )}

        {/* CSV Import Modal */}
        <Dialog
          open={showCsvImportModal}
          onClose={() => setShowCsvImportModal(false)}
        >
          <div className="fixed inset-0 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm z-50">
            <Dialog.Panel className="w-full max-w-md bg-white border-2 border-[#4b4b4b] neo-shadow shrink-0 flex flex-col max-h-[90vh]">
              <div className="relative p-6 px-8 border-b-2 border-[#4b4b4b] bg-[#f8f9fa] shrink-0">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 border-2 border-[#4b4b4b] bg-white text-[#4b4b4b] shadow-[4px_4px_0_#f26522]">
                      <Lucide icon="Upload" className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-xl font-black text-[#4b4b4b] uppercase">
                        Import CSV
                      </h3>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowCsvImportModal(false)}
                    className="p-2 border-2 border-transparent hover:border-[#4b4b4b] hover:-translate-y-0.5 hover:shadow-[2px_2px_0_#4b4b4b] text-[#4b4b4b] transition-all bg-white"
                  >
                    <Lucide icon="X" className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="p-8 space-y-6 overflow-y-auto bg-white flex-1">
                <div className="space-y-3">
                  <label className="block text-sm font-black text-[#4b4b4b] uppercase">
                    Select CSV File
                  </label>
                  <input
                    type="file"
                    accept=".csv"
                    onChange={handleCsvFileSelect}
                    className="w-full bg-white border-2 border-[#4b4b4b] p-[0.65rem] text-[#4b4b4b] transition-all rounded-none file:mr-4 file:py-2 file:px-4 file:border-2 file:border-[#4b4b4b] file:bg-[#4b4b4b] file:text-white file:font-black file:uppercase file:cursor-pointer hover:file:-translate-y-0.5 hover:file:shadow-[2px_2px_0_#f26522] file:transition-all"
                  />
                  <div className="pt-2">
                    <button
                      onClick={handleDownloadSampleCsv}
                      className="text-sm border-b-2 border-[#f26522] text-[#f26522] font-bold pb-0.5 hover:text-[#4b4b4b] hover:border-[#4b4b4b] transition-colors"
                    >
                      ↓ Download Sample CSV
                    </button>
                  </div>
                </div>

                <div className="space-y-3 pt-4 border-t-2 border-[#4b4b4b]/20">
                  <label className="block text-sm font-black text-[#4b4b4b] uppercase">
                    Select Tags to Apply
                  </label>
                  <div className="max-h-40 overflow-y-auto border-2 border-[#4b4b4b] bg-[#f8f9fa] p-4 space-y-2">
                    {tagList.map((tag) => (
                      <label
                        key={tag.id}
                        className="flex items-center p-2 hover:bg-white border-2 border-transparent hover:border-[#4b4b4b] transition-all cursor-pointer group"
                      >
                        <input
                          type="checkbox"
                          value={tag.name}
                          checked={selectedImportTags.includes(tag.name)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedImportTags([...selectedImportTags, tag.name]);
                            } else {
                              setSelectedImportTags(selectedImportTags.filter((t) => t !== tag.name));
                            }
                          }}
                          className="w-5 h-5 border-2 border-[#4b4b4b] text-[#f26522] focus:ring-0 focus:ring-offset-0 rounded-none cursor-pointer"
                        />
                        <span className="ml-3 text-sm font-bold text-[#4b4b4b] truncate">
                          {tag.name}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="block text-sm font-black text-[#4b4b4b] uppercase">
                    Add New Tags (comma-separated)
                  </label>
                  <input
                    type="text"
                    value={importTags.join(", ")}
                    onChange={(e) =>
                      setImportTags(
                        e.target.value.split(",").map((tag) => tag.trim())
                      )
                    }
                    className="w-full bg-white border-2 border-[#4b4b4b] p-4 text-[#4b4b4b] focus:outline-none focus:ring-0 focus:border-[#4b4b4b] focus:-translate-y-0.5 focus:-translate-x-0.5 focus:shadow-[4px_4px_0_#f26522] transition-all rounded-none placeholder-[#4b4b4b]/40 font-bold"
                    placeholder="Enter new tags separated by commas..."
                  />
                </div>
              </div>

              <div className="flex justify-end p-6 border-t-2 border-[#4b4b4b] bg-[#f8f9fa] shrink-0 space-x-3">
                <button
                  onClick={() => setShowCsvImportModal(false)}
                  className="px-6 py-3 bg-white border-2 border-[#4b4b4b] text-[#4b4b4b] font-black uppercase hover:-translate-y-0.5 hover:shadow-[4px_4px_0_#4b4b4b] transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCsvImport}
                  disabled={!selectedCsvFile || isLoading}
                  className="px-8 py-3 bg-[#f26522] border-2 border-[#4b4b4b] text-white font-black uppercase hover:-translate-y-0.5 hover:shadow-[4px_4px_0_#4b4b4b] transition-all flex items-center space-x-2 disabled:opacity-50 disabled:hover:translate-y-0 disabled:hover:shadow-none cursor-pointer disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    <div className="flex items-center space-x-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Importing...</span>
                    </div>
                  ) : (
                    <div className="flex items-center space-x-2">
                      <Lucide icon="Upload" className="w-4 h-4" />
                      <span>Import Data</span>
                    </div>
                  )}
                </button>
              </div>
            </Dialog.Panel>
          </div>
        </Dialog>

        {/* Sync Confirmation Modal */}
        <Dialog
          open={showSyncConfirmationModal}
          onClose={() => setShowSyncConfirmationModal(false)}
        >
          <div className="fixed inset-0 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm z-50">
            <Dialog.Panel className="w-full max-w-sm bg-white border-2 border-[#4b4b4b] neo-shadow shrink-0 text-center">
              <div className="p-8 pb-0">
                <div className="w-20 h-20 mx-auto bg-amber-100 border-2 border-[#4b4b4b] shadow-[4px_4px_0_#f59e0b] flex items-center justify-center mb-6">
                  <Lucide icon="AlertTriangle" className="w-10 h-10 text-amber-500" />
                </div>
                <h3 className="text-2xl font-black text-[#4b4b4b] uppercase mb-4">
                  Sync Database?
                </h3>
                <div className="text-[#4b4b4b]/80 text-sm font-bold space-y-3">
                  <p className="text-amber-600">
                    This action will sync the database<br />and may take some time.
                  </p>
                  <p className="p-3 bg-gray-100 border-2 border-[#4b4b4b] mt-4">
                    It may affect your current data.
                  </p>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row p-6 gap-3 bg-white mt-6">
                <button
                  onClick={() => setShowSyncConfirmationModal(false)}
                  className="w-full px-6 py-3 bg-white border-2 border-[#4b4b4b] text-[#4b4b4b] font-black uppercase hover:-translate-y-0.5 hover:shadow-[4px_4px_0_#4b4b4b] transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmSync}
                  disabled={isSyncing}
                  className="w-full px-6 py-3 bg-amber-500 border-2 border-[#4b4b4b] text-white font-black uppercase hover:-translate-y-0.5 hover:shadow-[4px_4px_0_#4b4b4b] transition-all disabled:opacity-50 disabled:hover:translate-y-0 disabled:hover:shadow-none cursor-pointer disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                >
                  {isSyncing ? (
                    <div className="flex items-center space-x-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Syncing...</span>
                    </div>
                  ) : (
                    <div className="flex items-center space-x-2">
                      <Lucide icon="RefreshCw" className="w-4 h-4" />
                      <span>Sync Now</span>
                    </div>
                  )}
                </button>
              </div>
            </Dialog.Panel>
          </div>
        </Dialog>

        {/* Sync Names Confirmation Modal */}
        <Dialog
          open={showSyncNamesConfirmationModal}
          onClose={() => setShowSyncNamesConfirmationModal(false)}
        >
          <div className="fixed inset-0 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm z-50">
            <Dialog.Panel className="w-full max-w-sm bg-white border-2 border-[#4b4b4b] neo-shadow shrink-0 text-center">
              <div className="p-8 pb-0">
                <div className="w-20 h-20 mx-auto bg-violet-100 border-2 border-[#4b4b4b] shadow-[4px_4px_0_#8b5cf6] flex items-center justify-center mb-6">
                  <Lucide icon="Users" className="w-10 h-10 text-violet-500" />
                </div>
                <h3 className="text-2xl font-black text-[#4b4b4b] uppercase mb-4">
                  Sync Contact Names?
                </h3>
                <div className="text-[#4b4b4b]/80 text-sm font-bold space-y-3">
                  <p>
                    This action will sync all contact names<br />and may take some time.
                  </p>
                  <p className="text-violet-600 bg-violet-50 border-2 border-[#4b4b4b] p-3 mt-4">
                    It may affect your current contact data.
                  </p>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row p-6 gap-3 bg-white mt-6">
                <button
                  onClick={() => setShowSyncNamesConfirmationModal(false)}
                  className="w-full px-6 py-3 bg-white border-2 border-[#4b4b4b] text-[#4b4b4b] font-black uppercase hover:-translate-y-0.5 hover:shadow-[4px_4px_0_#4b4b4b] transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmSyncNames}
                  className="w-full px-6 py-3 bg-violet-500 border-2 border-[#4b4b4b] text-white font-black uppercase hover:-translate-y-0.5 hover:shadow-[4px_4px_0_#4b4b4b] transition-all flex items-center justify-center space-x-2"
                >
                  <Lucide icon="RefreshCw" className="w-4 h-4" />
                  <span>Sync Names</span>
                </button>
              </div>
            </Dialog.Panel>
          </div>
        </Dialog>

        {/* Blast Message Modal */}
        <Dialog
          open={blastMessageModal}
          onClose={() => setBlastMessageModal(false)}
        >
          <div className="fixed inset-0 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm z-50">
            <Dialog.Panel className="w-full max-w-4xl bg-white border-2 border-[#4b4b4b] neo-shadow shrink-0 overflow-y-auto max-h-[90vh] flex flex-col">

              <div className="p-6 border-b-2 border-[#4b4b4b] bg-[#FFE0B2] flex items-center justify-between shrink-0">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 flex items-center justify-center bg-white border-2 border-[#4b4b4b] shadow-[2px_2px_0_#4b4b4b]">
                    <Lucide icon="Send" className="w-6 h-6 text-[#4b4b4b]" />
                  </div>
                  <Dialog.Title className="text-2xl font-black text-[#4b4b4b] uppercase tracking-wider">
                    Blast Message
                  </Dialog.Title>
                </div>
                <button
                  onClick={() => setBlastMessageModal(false)}
                  className="w-8 h-8 flex items-center justify-center bg-white border-2 border-[#4b4b4b] shadow-[2px_2px_0_#4b4b4b] hover:shadow-[4px_4px_0_#f26522] hover:-translate-y-0.5 hover:-translate-x-0.5 transition-all outline-none"
                >
                  <Lucide icon="X" className="w-4 h-4 text-[#4b4b4b]" />
                </button>
              </div>

              <div className="p-8 space-y-8 flex-1 overflow-y-auto">

                <div className="mt-8 space-y-8">
                  {/* Recipients Selection */}
                  <div className="space-y-4">
                    <div className="flex items-center space-x-3">
                      <Lucide icon="Users" className="w-5 h-5 text-[#f26522]" />
                      <label className="text-lg font-black text-[#4b4b4b] uppercase tracking-wider">
                        Recipients ({selectedContacts.length} selected)
                      </label>
                    </div>
                    <div className="bg-white border-2 border-[#4b4b4b] shadow-[4px_4px_0_#f26522] p-6 max-h-48 overflow-y-auto">
                      {selectedContacts.length > 0 ? (
                        <div className="space-y-3">
                          {selectedContacts
                            .slice(0, 10)
                            .map((contact, index) => (
                              <div
                                key={index}
                                className="flex items-center justify-between p-3 bg-white border-2 border-[#4b4b4b] shadow-[2px_2px_0_#4b4b4b]"
                              >
                                <div className="flex items-center">
                                  <div className="w-10 h-10 bg-[#f26522] border-2 border-[#4b4b4b] flex items-center justify-center text-white text-sm font-bold mr-3 shadow-[2px_2px_0_#4b4b4b]">
                                    {contact.contactName
                                      ?.charAt(0)
                                      ?.toUpperCase() || "U"}
                                  </div>
                                  <span className="text-[#4b4b4b] font-bold">
                                    {contact.contactName || contact.phone}
                                  </span>
                                </div>
                                <button
                                  onClick={() =>
                                    handleContactCheckboxChange(contact)
                                  }
                                  className="w-8 h-8 bg-red-100 hover:bg-red-200 text-red-600 border-2 border-[#4b4b4b] shadow-[2px_2px_0_#4b4b4b] transition-all duration-200 flex items-center justify-center"
                                  title="Remove contact"
                                >
                                  <Lucide icon="X" className="w-5 h-5" />
                                </button>
                              </div>
                            ))}
                          {selectedContacts.length > 10 && (
                            <div className="text-sm text-[#4b4b4b] font-bold border-2 border-[#4b4b4b] bg-gray-50 p-3 text-center shadow-[2px_2px_0_#4b4b4b]">
                              ... and {selectedContacts.length - 10} more
                              contacts
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="text-center text-[#4b4b4b] py-8">
                          <div className="w-16 h-16 bg-white border-2 border-[#4b4b4b] flex items-center justify-center mx-auto mb-4 shadow-[4px_4px_0_rgba(0,0,0,0.1)]">
                            <Lucide
                              icon="Users"
                              className="w-8 h-8 opacity-50 text-[#4b4b4b]"
                            />
                          </div>
                          <p className="font-bold">
                            No contacts selected
                          </p>
                          <p className="text-xs mt-1 opacity-70">
                            Please select contacts first to send messages
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Official API Notice */}
                  {isOfficialApi && (
                    <div className="bg-[#fef3c7] border-2 border-[#4b4b4b] shadow-[4px_4px_0_#d97706] p-6">
                      <div className="flex items-start gap-4">
                        <div className="w-10 h-10 bg-[#f59e0b] border-2 border-[#4b4b4b] flex items-center justify-center flex-shrink-0 shadow-[2px_2px_0_#4b4b4b]">
                          <Lucide icon="AlertTriangle" className="w-5 h-5 text-[#4b4b4b]" />
                        </div>
                        <div>
                          <h4 className="text-lg font-black text-[#4b4b4b] uppercase">Official WhatsApp API</h4>
                          <p className="text-sm text-[#4b4b4b] font-medium mt-1">
                            You're using the Official WhatsApp Business API. Due to Meta's policies,
                            you can only send <strong className="font-black text-black">approved message templates</strong> for bulk messaging.
                            Please select a template below.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Phone Selection */}
                  <div className="space-y-4">
                    <div className="flex items-center space-x-3">
                      <Lucide
                        icon="Smartphone"
                        className="w-5 h-5 text-[#8b5cf6]"
                      />
                      <label className="text-lg font-black text-[#4b4b4b] uppercase tracking-wider">
                        Select Phone
                      </label>
                    </div>
                    <div className="relative group">
                      <select
                        id="phone"
                        name="phone"
                        value={phoneIndex === null ? "" : phoneIndex}
                        onChange={(e) =>
                          setPhoneIndex(
                            e.target.value === ""
                              ? null
                              : Number(e.target.value)
                          )
                        }
                        className="w-full px-4 py-4 bg-white border-2 border-[#4b4b4b] shadow-[4px_4px_0_#8b5cf6] text-[#4b4b4b] font-bold focus:outline-none focus:shadow-[4px_4px_0_#4b4b4b] transition-all appearance-none"
                      >
                        <option value="" className="bg-white text-[#4b4b4b]">
                          Select a phone
                        </option>
                        {Object.keys(phoneNames).length > 0 ? (
                          Object.keys(phoneNames).map((index) => {
                            const phoneIndexOption = parseInt(index);
                            const qrCode = qrCodes[phoneIndexOption];
                            const phoneInfo =
                              qrCode?.phoneInfo ||
                              `Phone ${phoneIndexOption + 1}`;
                            const statusInfo = qrCode
                              ? getStatusInfo(qrCode.status)
                              : isLoadingStatus
                                ? {
                                  text: "Checking...",
                                  color: "text-yellow-600",
                                  icon: "RefreshCw",
                                }
                                : {
                                  text: "Not Connected",
                                  color: "text-red-600",
                                  icon: "XCircle",
                                };
                            return (
                              <option
                                key={phoneIndexOption}
                                value={phoneIndexOption}
                                className="bg-white text-[#4b4b4b] font-bold"
                              >
                                {`${getPhoneName(
                                  phoneIndexOption
                                )} - (${phoneInfo}) ${qrCode ? "✅" : isLoadingStatus ? "⏳" : "❌"
                                  } ${statusInfo.text}`}
                              </option>
                            );
                          })
                        ) : (
                          <option
                            value=""
                            disabled
                            className="bg-white text-[#4b4b4b]"
                          >
                            No phones available - Please check your
                            configuration
                          </option>
                        )}
                      </select>
                      {isLoadingStatus && (
                        <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
                          <LoadingIcon icon="three-dots" className="w-5 h-5 text-[#4b4b4b]" />
                        </div>
                      )}
                    </div>
                    {phoneIndex !== null && phoneNames[phoneIndex] && (
                      <div
                        className={`inline-flex items-center px-4 py-2 text-xs font-bold border-2 border-[#4b4b4b] shadow-[2px_2px_0_#4b4b4b] ${qrCodes[phoneIndex]
                          ? "bg-[#dcfce7] text-[#166534]"
                          : "bg-[#fee2e2] text-[#991b1b]"
                          }`}
                      >
                        <Lucide
                          icon={
                            qrCodes[phoneIndex]
                              ? getStatusInfo(qrCodes[phoneIndex].status).icon
                              : "XCircle"
                          }
                          className="w-4 h-4 mr-2"
                        />
                        {qrCodes[phoneIndex]
                          ? getStatusInfo(qrCodes[phoneIndex].status).text
                          : isLoadingStatus
                            ? "Checking..."
                            : "Not Connected"}
                      </div>
                    )}

                    {/* Help message when phones are not connected */}
                    {Object.keys(phoneNames).length > 0 &&
                      !Object.values(qrCodes).some(
                        (qr) =>
                          qr &&
                          ["ready", "authenticated"].includes(
                            qr.status?.toLowerCase()
                          )
                      ) && (
                        <div className="text-xs text-[#b45309] bg-[#fef3c7] font-bold p-4 border-2 border-[#4b4b4b] shadow-[4px_4px_0_#b45309]">
                          <div className="flex items-center gap-2 mb-2">
                            <Lucide icon="AlertTriangle" className="w-4 h-4" />
                            <span className="font-black uppercase">
                              Connection Required
                            </span>
                          </div>
                          <p>
                            No phones are currently connected. Please ensure
                            your WhatsApp bot is running and connected before
                            sending messages.
                          </p>
                        </div>
                      )}
                  </div>

                  {/* Template Selection for Official API */}
                  {isOfficialApi ? (
                    <div className="space-y-4">
                      <div className="flex items-center space-x-3">
                        <Lucide icon="FileText" className="w-5 h-5 text-[#3b82f6]" />
                        <label className="text-lg font-black text-[#4b4b4b] uppercase tracking-wider">
                          Select Message Template
                        </label>
                      </div>

                      {isLoadingBlastTemplates ? (
                        <div className="flex items-center justify-center py-8">
                          <LoadingIcon icon="oval" className="w-8 h-8 text-[#4b4b4b]" />
                          <span className="ml-2 font-bold text-[#4b4b4b]">Loading templates...</span>
                        </div>
                      ) : blastTemplates.length === 0 ? (
                        <div className="text-center py-8 bg-white border-2 border-[#4b4b4b] shadow-[4px_4px_0_#3b82f6]">
                          <Lucide icon="FileX" className="w-12 h-12 text-[#4b4b4b] opacity-50 mx-auto mb-3" />
                          <p className="font-bold text-[#4b4b4b]">No approved templates found</p>
                          <p className="text-xs font-medium text-[#4b4b4b] opacity-70 mt-1">
                            Create templates in the Message Templates page first
                          </p>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-64 overflow-y-auto p-2">
                            {blastTemplates.filter(t => t.status === 'APPROVED').map((template) => (
                              <div
                                key={template.id}
                                onClick={() => handleSelectBlastTemplate(template)}
                                className={`p-4 border-2 border-[#4b4b4b] cursor-pointer transition-all duration-200 ${selectedBlastTemplate?.id === template.id
                                  ? 'bg-[#dbeafe] shadow-[4px_4px_0_#3b82f6] -translate-y-0.5 -translate-x-0.5'
                                  : 'bg-white shadow-[2px_2px_0_#4b4b4b] hover:shadow-[4px_4px_0_#3b82f6] hover:-translate-y-0.5 hover:-translate-x-0.5'
                                  }`}
                              >
                                <div className="flex items-center justify-between mb-2">
                                  <span className="font-black text-[#4b4b4b] uppercase">{template.name}</span>
                                  <span className="text-xs px-2 py-1 font-bold bg-[#dcfce7] text-[#166534] border-2 border-[#4b4b4b]">
                                    Approved
                                  </span>
                                </div>
                                <p className="text-xs font-bold text-[#4b4b4b] mb-2">Language: {template.language}</p>
                                <p className="text-sm font-medium text-[#4b4b4b] line-clamp-2">
                                  {getTemplatePreviewText(template)}
                                </p>
                                {getTemplateVariableCount(template) > 0 && (
                                  <p className="text-xs font-bold text-[#d97706] mt-2">
                                    <Lucide icon="AlertCircle" className="w-3 h-3 inline mr-1" />
                                    {getTemplateVariableCount(template)} variable(s) required
                                  </p>
                                )}
                              </div>
                            ))}
                          </div>

                          {/* Template Variables Input */}
                          {selectedBlastTemplate && getTemplateVariableCount(selectedBlastTemplate) > 0 && (
                            <div className="bg-[#f3f4f6] p-6 border-2 border-[#4b4b4b] shadow-[4px_4px_0_#8b5cf6]">
                              <h4 className="text-md font-black text-[#4b4b4b] uppercase mb-4 flex items-center gap-2">
                                <Lucide icon="Pencil" className="w-5 h-5 text-[#8b5cf6]" />
                                Fill Template Variables
                              </h4>
                              <div className="space-y-3">
                                {blastTemplateVariables.map((value, idx) => (
                                  <div key={idx} className="flex items-center gap-3">
                                    <span className="text-sm font-bold text-[#4b4b4b] w-16">{`{{${idx + 1}}}`}:</span>
                                    <input
                                      type="text"
                                      value={value}
                                      onChange={(e) => {
                                        const newVars = [...blastTemplateVariables];
                                        newVars[idx] = e.target.value;
                                        setBlastTemplateVariables(newVars);
                                      }}
                                      placeholder={`Value for variable ${idx + 1}`}
                                      className="flex-1 px-4 py-2 bg-white border-2 border-[#4b4b4b] text-[#4b4b4b] font-medium focus:outline-none focus:shadow-[2px_2px_0_#8b5cf6] transition-all"
                                    />
                                  </div>
                                ))}
                              </div>
                              <p className="text-xs font-bold text-[#4b4b4b] opacity-70 mt-3">
                                These values will be the same for all recipients
                              </p>
                            </div>
                          )}

                          {/* Template Preview */}
                          {selectedBlastTemplate && (
                            <div className="bg-[#e5ddd5] p-4 border-2 border-[#4b4b4b] shadow-[4px_4px_0_#4b4b4b]">
                              <p className="text-xs text-[#4b4b4b] mb-2 font-black uppercase">Preview:</p>
                              <div className="bg-white border-2 border-[#4b4b4b] max-w-sm mx-auto p-4 shadow-[2px_2px_0_#4b4b4b]">
                                {selectedBlastTemplate.components?.map((comp: any, idx: number) => (
                                  <div key={idx}>
                                    {comp.type === 'HEADER' && comp.text && (
                                      <p className="font-bold text-[#4b4b4b] mb-2">{comp.text}</p>
                                    )}
                                    {comp.type === 'BODY' && comp.text && (
                                      <p className="text-[#4b4b4b] whitespace-pre-wrap text-sm font-medium">
                                        {blastTemplateVariables.reduce(
                                          (text, val, i) => text.replace(`{{${i + 1}}}`, val || `{{${i + 1}}}`),
                                          comp.text
                                        )}
                                      </p>
                                    )}
                                    {comp.type === 'FOOTER' && comp.text && (
                                      <p className="text-xs font-bold text-[#4b4b4b] opacity-70 mt-2">{comp.text}</p>
                                    )}
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  ) : (
                    /* Message Content - Only shown for non-official API */
                    <div className="space-y-4">
                      <div className="flex items-center space-x-3">
                        <Lucide
                          icon="MessageSquare"
                          className="w-5 h-5 text-[#f26522]"
                        />
                        <label className="text-lg font-black text-[#4b4b4b] uppercase tracking-wider">
                          Message Content
                        </label>
                      </div>
                      <div className="relative group">
                        <textarea
                          value={blastMessage}
                          onChange={(e) => setBlastMessage(e.target.value)}
                          placeholder="Enter your message here..."
                          rows={6}
                          className="w-full px-4 py-4 bg-white border-2 border-[#4b4b4b] text-[#4b4b4b] font-medium focus:outline-none focus:shadow-[4px_4px_0_#f26522] transition-all shadow-[2px_2px_0_#4b4b4b] resize-none"
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-[#4b4b4b] bg-gray-100 px-4 py-2 border-2 border-[#4b4b4b] shadow-[2px_2px_0_#4b4b4b]">
                          Character count: {blastMessage.length}
                        </span>
                        <Button
                          variant="outline-secondary"
                          size="sm"
                          onClick={() => setShowPlaceholders(!showPlaceholders)}
                          className="bg-white hover:bg-gray-50 text-[#4b4b4b] border-2 border-[#4b4b4b] shadow-[2px_2px_0_#4b4b4b] hover:shadow-[4px_4px_0_#f26522] hover:-translate-y-0.5 hover:-translate-x-0.5 font-black uppercase tracking-wider rounded-none"
                        >
                          <Lucide icon="Code" className="w-4 h-4 mr-2" />
                          Placeholders
                        </Button>
                      </div>

                      {showPlaceholders && (
                        <div className="p-6 bg-gray-50 border-2 border-[#4b4b4b] shadow-[4px_4px_0_#4b4b4b]">
                          <p className="text-sm font-black text-[#4b4b4b] mb-4 flex items-center gap-2 uppercase">
                            <Lucide icon="Code" className="w-4 h-4" />
                            Available Placeholders:
                          </p>

                          {/* Standard Placeholders */}
                          <div className="mb-6">
                            <h4 className="text-xs font-black text-[#f26522] mb-3 uppercase tracking-wider">
                              Standard Fields
                            </h4>
                            <div className="grid grid-cols-2 gap-3 text-xs">
                              {[
                                "contactName",
                                "firstName",
                                "lastName",
                                "phone",
                                "email",
                                "company",
                                "branch",
                                "vehicleNumber",
                                "ic",
                                "expiryDate",
                              ].map((placeholder) => (
                                <button
                                  key={placeholder}
                                  onClick={() => insertPlaceholder(placeholder)}
                                  className="text-left p-3 bg-white border-2 border-[#4b4b4b] shadow-[2px_2px_0_#4b4b4b] text-[#4b4b4b] font-bold hover:shadow-[4px_4px_0_#f26522] hover:-translate-y-0.5 hover:-translate-x-0.5 transition-all font-mono"
                                >
                                  @{"{"}${placeholder}
                                  {"}"}
                                </button>
                              ))}
                            </div>
                          </div>

                          {/* Custom Fields Placeholders */}
                          {(() => {
                            // Get all unique custom field keys from selected contacts
                            const allCustomFields = new Set<string>();
                            const customFieldAvailability = new Map<
                              string,
                              number
                            >();

                            selectedContacts.forEach((contact) => {
                              if (contact.customFields) {
                                Object.keys(contact.customFields).forEach(
                                  (key) => {
                                    allCustomFields.add(key);
                                    customFieldAvailability.set(
                                      key,
                                      (customFieldAvailability.get(key) || 0) + 1
                                    );
                                  }
                                );
                              }
                            });

                            const customFieldsArray = Array.from(allCustomFields);
                            const totalSelectedContacts = selectedContacts.length;

                            if (customFieldsArray.length > 0) {
                              return (
                                <div>
                                  <h4 className="text-xs font-black text-[#8b5cf6] mb-3 uppercase tracking-wider">
                                    Custom Fields
                                  </h4>
                                  <div className="grid grid-cols-2 gap-3 text-xs">
                                    {customFieldsArray.map((fieldKey) => {
                                      const availableCount =
                                        customFieldAvailability.get(fieldKey) ||
                                        0;
                                      const isAvailableForAll =
                                        availableCount === totalSelectedContacts;
                                      const availabilityPercentage = Math.round(
                                        (availableCount / totalSelectedContacts) *
                                        100
                                      );

                                      return (
                                        <div
                                          key={fieldKey}
                                          className="relative group"
                                        >
                                          <button
                                            onClick={() =>
                                              isAvailableForAll
                                                ? insertPlaceholder(fieldKey)
                                                : null
                                            }
                                            disabled={!isAvailableForAll}
                                            className={`text-left p-3 font-bold transition-all border-2 border-[#4b4b4b] font-mono w-full ${isAvailableForAll
                                              ? "bg-white text-[#4b4b4b] shadow-[2px_2px_0_#4b4b4b] hover:shadow-[4px_4px_0_#8b5cf6] hover:-translate-y-0.5 hover:-translate-x-0.5 cursor-pointer"
                                              : "bg-gray-200 text-[#4b4b4b] cursor-not-allowed opacity-60"
                                              }`}
                                          >
                                            @{"{"}
                                            {fieldKey
                                              .toLowerCase()
                                              .replace(/\s+/g, "_")}
                                            {"}"}
                                            {!isAvailableForAll && (
                                              <div className="flex items-center mt-1">
                                                <Lucide
                                                  icon="AlertTriangle"
                                                  className="w-3 h-3 mr-1"
                                                />
                                                <span className="text-xs">
                                                  {availabilityPercentage}%
                                                </span>
                                              </div>
                                            )}
                                          </button>

                                          {/* Tooltip */}
                                          <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-10 pointer-events-none">
                                            <div className="bg-white text-[#4b4b4b] font-bold text-xs p-3 shadow-[4px_4px_0_#4b4b4b] border-2 border-[#4b4b4b] max-w-48">
                                              <div className="font-black uppercase">
                                                {fieldKey}
                                              </div>
                                              <div className="mt-1">
                                                {isAvailableForAll
                                                  ? "Available in all selected contacts"
                                                  : `Available in ${availableCount} of ${totalSelectedContacts} contacts (${availabilityPercentage}%)`}
                                              </div>
                                              {!isAvailableForAll && (
                                                <div className="mt-1 text-[#d97706] text-xs">
                                                  ⚠️ Not available for all
                                                  contacts
                                                </div>
                                              )}
                                              <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-[#4b4b4b]"></div>
                                            </div>
                                          </div>
                                        </div>
                                      );
                                    })}
                                  </div>

                                  {/* Legend */}
                                  <div className="mt-4 p-3 bg-white border-2 border-[#4b4b4b] shadow-[2px_2px_0_#4b4b4b]">
                                    <div className="flex items-center justify-between text-xs font-bold">
                                      <div className="flex items-center gap-2">
                                        <div className="w-3 h-3 bg-[#8b5cf6] border border-[#4b4b4b]"></div>
                                        <span className="text-[#4b4b4b]">
                                          Available for all
                                        </span>
                                      </div>
                                      <div className="flex items-center gap-2">
                                        <div className="w-3 h-3 bg-gray-400 border border-[#4b4b4b]"></div>
                                        <span className="text-[#4b4b4b]">
                                          Partially available
                                        </span>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              );
                            }
                            return null;
                          })()}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Media Upload - Only for non-official API */}
                  {!isOfficialApi && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-3">
                        <div className="flex items-center space-x-3">
                          <Lucide
                            icon="Image"
                            className="w-5 h-5 text-[#f26522]"
                          />
                          <label className="text-lg font-black text-[#4b4b4b] uppercase tracking-wider">
                            Media File (Optional)
                          </label>
                        </div>
                        <div className="relative group">
                          <input
                            type="file"
                            accept="image/*,video/*"
                            onChange={handleMediaUpload}
                            className="w-full text-sm text-[#4b4b4b] bg-white border-2 border-[#4b4b4b] shadow-[4px_4px_0_#f26522] p-4 transition-all focus:outline-none file:mr-4 file:py-2 file:px-4 file:border-2 file:border-[#4b4b4b] file:text-sm file:font-black file:uppercase file:bg-[#f26522] file:text-white hover:file:bg-white hover:file:text-[#4b4b4b] file:shadow-[2px_2px_0_#4b4b4b] hover:file:translate-x-0.5 hover:file:translate-y-0.5"
                          />
                          {selectedMedia && (
                            <div className="mt-3 flex items-center justify-between bg-white px-4 py-3 border-2 border-[#4b4b4b] shadow-[2px_2px_0_#4b4b4b]">
                              <div className="flex items-center space-x-3 min-w-0 flex-1">
                                <Lucide
                                  icon="Image"
                                  className="w-4 h-4 text-[#4b4b4b] flex-shrink-0"
                                />
                                <span className="text-xs text-[#4b4b4b] truncate font-bold">
                                  {selectedMedia.name.length > 30
                                    ? `${selectedMedia.name.substring(0, 30)}...`
                                    : selectedMedia.name}
                                </span>
                              </div>
                              <button
                                onClick={() => setSelectedMedia(null)}
                                className="ml-2 w-6 h-6 bg-[#fecaca] hover:bg-[#f87171] border-2 border-[#4b4b4b] text-[#4b4b4b] transition-all flex items-center justify-center flex-shrink-0 shadow-[2px_2px_0_#4b4b4b] hover:shadow-[4px_4px_0_#4b4b4b] hover:-translate-y-0.5 hover:-translate-x-0.5"
                              >
                                <Lucide icon="X" className="w-3 h-3 font-bold" />
                              </button>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="space-y-3">
                        <div className="flex items-center space-x-3">
                          <Lucide
                            icon="FileText"
                            className="w-5 h-5 text-[#8b5cf6]"
                          />
                          <label className="text-lg font-black text-[#4b4b4b] uppercase tracking-wider">
                            Document File (Optional)
                          </label>
                        </div>
                        <div className="relative group">
                          <input
                            type="file"
                            accept=".pdf,.doc,.docx,.txt"
                            onChange={handleDocumentUpload}
                            className="w-full text-sm text-[#4b4b4b] bg-white border-2 border-[#4b4b4b] shadow-[4px_4px_0_#8b5cf6] p-4 transition-all focus:outline-none file:mr-4 file:py-2 file:px-4 file:border-2 file:border-[#4b4b4b] file:text-sm file:font-black file:uppercase file:bg-[#8b5cf6] file:text-white hover:file:bg-white hover:file:text-[#4b4b4b] file:shadow-[2px_2px_0_#4b4b4b] hover:file:translate-x-0.5 hover:file:translate-y-0.5"
                          />
                          {selectedDocument && (
                            <div className="mt-3 flex items-center justify-between bg-white px-4 py-3 border-2 border-[#4b4b4b] shadow-[2px_2px_0_#4b4b4b]">
                              <div className="flex items-center space-x-3 min-w-0 flex-1">
                                <Lucide
                                  icon="FileText"
                                  className="w-4 h-4 text-[#4b4b4b] flex-shrink-0"
                                />
                                <span className="text-xs text-[#4b4b4b] truncate font-bold">
                                  {selectedDocument.name.length > 30
                                    ? `${selectedDocument.name.substring(
                                      0,
                                      30
                                    )}...`
                                    : selectedDocument.name}
                                </span>
                              </div>
                              <button
                                onClick={() => setSelectedDocument(null)}
                                className="ml-2 w-6 h-6 bg-[#fecaca] hover:bg-[#f87171] border-2 border-[#4b4b4b] text-[#4b4b4b] transition-all flex items-center justify-center flex-shrink-0 shadow-[2px_2px_0_#4b4b4b] hover:shadow-[4px_4px_0_#4b4b4b] hover:-translate-y-0.5 hover:-translate-x-0.5"
                              >
                                <Lucide icon="X" className="w-3 h-3 font-bold" />
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Scheduling Options */}
                  <div className="bg-[#f0f9ff] p-8 border-2 border-[#4b4b4b] shadow-[4px_4px_0_#0284c7] space-y-6">
                    <div className="flex items-center space-x-4">
                      <div className="w-10 h-10 bg-[#0ea5e9] flex items-center justify-center border-2 border-[#4b4b4b] shadow-[2px_2px_0_#4b4b4b]">
                        <Lucide
                          icon="Calendar"
                          className="w-5 h-5 text-white"
                        />
                      </div>
                      <h4 className="text-xl font-black text-[#4b4b4b] uppercase tracking-wider">
                        Scheduling Options
                      </h4>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-3">
                        <label className="block text-sm font-black text-[#4b4b4b] uppercase tracking-wider">
                          Schedule Date
                        </label>
                        <DatePickerComponent
                          selected={blastStartDate}
                          onChange={(date: Date) => setBlastStartDate(date)}
                          dateFormat="MMMM d, yyyy"
                          className="w-full px-4 py-3 bg-white border-2 border-[#4b4b4b] text-sm text-[#4b4b4b] font-bold focus:shadow-[4px_4px_0_#0ea5e9] focus:outline-none transition-all"
                        />
                      </div>

                      <div className="space-y-3">
                        <label className="block text-sm font-black text-[#4b4b4b] uppercase tracking-wider">
                          Schedule Time
                        </label>
                        <DatePickerComponent
                          selected={blastStartTime}
                          onChange={(time: Date) => setBlastStartTime(time)}
                          showTimeSelect
                          showTimeSelectOnly
                          timeIntervals={15}
                          timeCaption="Time"
                          dateFormat="h:mm aa"
                          className="w-full px-4 py-3 bg-white border-2 border-[#4b4b4b] text-sm text-[#4b4b4b] font-bold focus:shadow-[4px_4px_0_#0ea5e9] focus:outline-none transition-all"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="space-y-3">
                        <label className="block text-sm font-black text-[#4b4b4b] uppercase tracking-wider">
                          Batch Size
                        </label>
                        <FormInput
                          type="number"
                          value={batchQuantity}
                          onChange={(e) =>
                            setBatchQuantity(Number(e.target.value))
                          }
                          min="1"
                          max="100"
                          className="w-full px-4 py-3 bg-white border-2 border-[#4b4b4b] text-[#4b4b4b] font-bold focus:outline-none focus:shadow-[4px_4px_0_#0ea5e9] transition-all"
                        />
                      </div>

                      <div className="space-y-3">
                        <label className="block text-sm font-black text-[#4b4b4b] uppercase tracking-wider">
                          Delay (Minutes)
                        </label>
                        <FormInput
                          type="number"
                          value={repeatInterval}
                          onChange={(e) =>
                            setRepeatInterval(Number(e.target.value))
                          }
                          min="0"
                          className="w-full px-4 py-3 bg-white border-2 border-[#4b4b4b] text-[#4b4b4b] font-bold focus:outline-none focus:shadow-[4px_4px_0_#0ea5e9] transition-all"
                        />
                      </div>

                      <div className="space-y-3">
                        <label className="block text-sm font-black text-[#4b4b4b] uppercase tracking-wider">
                          Delay Unit
                        </label>
                        <FormSelect
                          value={repeatUnit}
                          onChange={(e) =>
                            setRepeatUnit(
                              e.target.value as "minutes" | "hours" | "days"
                            )
                          }
                          className="w-full px-4 py-3 bg-white border-2 border-[#4b4b4b] text-[#4b4b4b] font-bold focus:outline-none focus:shadow-[4px_4px_0_#0ea5e9] transition-all"
                        >
                          <option
                            value="minutes"
                            className="bg-white text-[#4b4b4b]"
                          >
                            Minutes
                          </option>
                          <option
                            value="hours"
                            className="bg-white text-[#4b4b4b]"
                          >
                            Hours
                          </option>
                          <option
                            value="days"
                            className="bg-white text-[#4b4b4b]"
                          >
                            Days
                          </option>
                        </FormSelect>
                      </div>
                    </div>

                    {/* Active Time Range */}
                    <div className="mt-6 p-6 bg-[#f3f4f6] border-2 border-[#4b4b4b] shadow-[4px_4px_0_#4b4b4b]">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center space-x-3">
                          <Lucide
                            icon="Clock"
                            className="w-5 h-5 text-[#8b5cf6]"
                          />
                          <h5 className="text-lg font-black text-[#4b4b4b] uppercase tracking-wider">
                            Active Time Range
                          </h5>
                        </div>
                        <label className="flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={enableActiveHours}
                            onChange={(e) => setEnableActiveHours(e.target.checked)}
                            className="mr-2 w-5 h-5 border-2 border-[#4b4b4b] checked:bg-[#8b5cf6] appearance-none"
                          />
                          <span className="text-sm font-bold text-[#4b4b4b] uppercase tracking-wider">Enable</span>
                        </label>
                      </div>
                      <p className="text-sm font-bold text-[#4b4b4b] opacity-70 mb-4">
                        {enableActiveHours
                          ? "Messages will only be sent during this time window each day"
                          : "Messages will be sent at any time (no time restrictions)"}
                      </p>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-3">
                          <label className="block text-sm font-black text-[#4b4b4b] uppercase tracking-wider">
                            Start Time
                          </label>
                          <FormInput
                            type="time"
                            value={activeTimeStart}
                            onChange={(e) => setActiveTimeStart(e.target.value)}
                            disabled={!enableActiveHours}
                            className="w-full px-4 py-3 bg-white border-2 border-[#4b4b4b] text-[#4b4b4b] font-bold focus:outline-none focus:shadow-[4px_4px_0_#8b5cf6] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                          />
                        </div>
                        <div className="space-y-3">
                          <label className="block text-sm font-black text-[#4b4b4b] uppercase tracking-wider">
                            End Time
                          </label>
                          <FormInput
                            type="time"
                            value={activeTimeEnd}
                            onChange={(e) => setActiveTimeEnd(e.target.value)}
                            disabled={!enableActiveHours}
                            className="w-full px-4 py-3 bg-white border-2 border-[#4b4b4b] text-[#4b4b4b] font-bold focus:outline-none focus:shadow-[4px_4px_0_#8b5cf6] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                          />
                        </div>
                      </div>
                      <div className="mt-4 flex items-center space-x-2 text-xs font-bold text-[#4b4b4b] bg-white px-3 py-2 border-2 border-[#4b4b4b] shadow-[2px_2px_0_#4b4b4b]">
                        <Lucide icon="Info" className="w-4 h-4 text-[#8b5cf6]" />
                        <span>
                          Current range: {activeTimeStart} - {activeTimeEnd}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Progress Bar (shown during sending) */}
                  {(isScheduling || isSendingBlastTemplate) && (
                    <div className="bg-[#fef3c7] p-6 border-2 border-[#4b4b4b] shadow-[4px_4px_0_#d97706]">
                      <div className="flex items-center justify-between mb-4">
                        <span className="text-sm font-black text-[#4b4b4b] uppercase flex items-center gap-3">
                          <div className="w-8 h-8 bg-white border-2 border-[#4b4b4b] shadow-[2px_2px_0_#4b4b4b] flex items-center justify-center">
                            <Lucide
                              icon="Clock"
                              className="w-4 h-4 text-[#4b4b4b]"
                            />
                          </div>
                          {isSendingBlastTemplate ? "Sending templates..." : "Scheduling messages..."}
                        </span>
                        <span className="text-sm text-[#4b4b4b] font-black uppercase bg-white px-4 py-2 border-2 border-[#4b4b4b] shadow-[2px_2px_0_#4b4b4b]">
                          {Math.round(progress)}%
                        </span>
                      </div>
                      <div className="w-full bg-white border-2 border-[#4b4b4b] h-6 shadow-[2px_2px_0_#4b4b4b]">
                        <div
                          className="bg-[#f59e0b] h-full"
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex justify-between items-center mt-10 p-6 bg-[#f3f4f6] border-t-2 border-[#4b4b4b]">
                  <div className="text-sm font-black text-[#4b4b4b] bg-white px-4 py-3 border-2 border-[#4b4b4b] shadow-[2px_2px_0_#4b4b4b] uppercase tracking-wider">
                    <div className="flex items-center space-x-2">
                      <Lucide icon="Users" className="w-4 h-4 text-[#f26522]" />
                      <span>{selectedContacts.length} recipients selected</span>
                    </div>
                  </div>
                  <div className="flex space-x-3">
                    <Button
                      variant="outline-secondary"
                      onClick={() => {
                        setBlastMessageModal(false);
                        setSelectedBlastTemplate(null);
                        setBlastTemplateVariables([]);
                      }}
                      disabled={isScheduling || isSendingBlastTemplate}
                      className="px-6 py-3 bg-white text-[#4b4b4b] border-2 border-[#4b4b4b] font-black uppercase tracking-wider hover:shadow-[4px_4px_0_#4b4b4b] hover:-translate-y-0.5 hover:-translate-x-0.5 transition-all outline-none rounded-none"
                    >
                      Cancel
                    </Button>

                    {/* Different button for Official API vs non-official */}
                    {isOfficialApi ? (
                      <Button
                        variant="primary"
                        onClick={sendBlastTemplateMessage}
                        disabled={
                          selectedContacts.length === 0 ||
                          !selectedBlastTemplate ||
                          phoneIndex === null ||
                          phoneIndex === undefined ||
                          isSendingBlastTemplate ||
                          (getTemplateVariableCount(selectedBlastTemplate) > 0 &&
                            blastTemplateVariables.some(v => !v.trim()))
                        }
                        className="px-8 py-3 bg-[#3b82f6] text-white border-2 border-[#4b4b4b] font-black uppercase tracking-wider shadow-[4px_4px_0_#4b4b4b] hover:shadow-[6px_6px_0_#4b4b4b] hover:-translate-y-0.5 hover:-translate-x-0.5 transition-all outline-none disabled:opacity-50 disabled:cursor-not-allowed rounded-none"
                      >
                        {isSendingBlastTemplate ? (
                          <div className="flex items-center space-x-2">
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            <span>Sending...</span>
                          </div>
                        ) : (
                          <div className="flex items-center space-x-2">
                            <Lucide icon="Send" className="w-4 h-4" />
                            <span>Send Template</span>
                          </div>
                        )}
                      </Button>
                    ) : (
                      <Button
                        variant="primary"
                        onClick={sendBlastMessage}
                        disabled={
                          selectedContacts.length === 0 ||
                          !blastMessage.trim() ||
                          phoneIndex === null ||
                          phoneIndex === undefined ||
                          !phoneNames[phoneIndex] ||
                          isScheduling
                        }
                        className="px-8 py-3 bg-[#f26522] text-white border-2 border-[#4b4b4b] font-black uppercase tracking-wider shadow-[4px_4px_0_#4b4b4b] hover:shadow-[6px_6px_0_#4b4b4b] hover:-translate-y-0.5 hover:-translate-x-0.5 transition-all outline-none disabled:opacity-50 disabled:cursor-not-allowed rounded-none"
                      >
                        {isScheduling ? (
                          <div className="flex items-center space-x-2">
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            <span>Scheduling...</span>
                          </div>
                        ) : (
                          <div className="flex items-center space-x-2">
                            <Lucide icon="Send" className="w-4 h-4" />
                            <span>Schedule Message</span>
                          </div>
                        )}
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </Dialog.Panel>
          </div>
        </Dialog>

        {/* Edit Scheduled Message Modal */}
        <Dialog
          open={editScheduledMessageModal}
          onClose={() => setEditScheduledMessageModal(false)}
        >
          <div className="fixed inset-0 flex items-center justify-center p-4 bg-black/50 z-[60]">
            <Dialog.Panel className="w-full max-w-lg relative bg-white border-2 border-[#4b4b4b] shadow-[8px_8px_0_#4b4b4b] overflow-hidden overflow-y-auto transform transition-all flex flex-col max-h-[90vh]">
              <div className="relative p-8">
                <div className="flex items-center justify-between pb-6 border-b-2 border-[#4b4b4b]">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-[#8b5cf6] flex items-center justify-center border-2 border-[#4b4b4b] shadow-[2px_2px_0_#4b4b4b]">
                      <Lucide
                        icon="PenTool"
                        className="w-6 h-6 text-white"
                      />
                    </div>
                    <h3 className="text-2xl font-black text-[#4b4b4b] uppercase tracking-wider">
                      Edit Scheduled Message
                    </h3>
                  </div>
                  <button
                    onClick={() => setEditScheduledMessageModal(false)}
                    className="w-8 h-8 flex flex-shrink-0 items-center justify-center bg-white border-2 border-[#4b4b4b] shadow-[2px_2px_0_#4b4b4b] hover:shadow-[4px_4px_0_#f26522] hover:-translate-y-0.5 hover:-translate-x-0.5 transition-all outline-none"
                  >
                    <Lucide icon="X" className="w-4 h-4 text-[#4b4b4b]" />
                  </button>
                </div>

                <div className="mt-8 space-y-6">
                  {/* Message Content */}
                  <div className="space-y-3">
                    <div className="flex items-center space-x-3">
                      <Lucide
                        icon="MessageSquare"
                        className="w-5 h-5 text-[#8b5cf6]"
                      />
                      <label className="text-lg font-black text-[#4b4b4b] uppercase tracking-wider">
                        Message Content
                      </label>
                    </div>
                    <textarea
                      value={blastMessage}
                      onChange={(e) => setBlastMessage(e.target.value)}
                      rows={4}
                      className="w-full px-4 py-4 bg-white border-2 border-[#4b4b4b] text-[#4b4b4b] font-bold placeholder-[#4b4b4b]/50 focus:shadow-[4px_4px_0_#8b5cf6] hover:shadow-[4px_4px_0_#4b4b4b] transition-all outline-none resize-none"
                    />
                  </div>

                  {/* Placeholders */}
                  <div className="space-y-3">
                    <button
                      type="button"
                      onClick={() => setShowPlaceholders(!showPlaceholders)}
                      className="flex items-center space-x-2 text-[#4b4b4b] font-black uppercase hover:text-[#8b5cf6] transition-colors"
                    >
                      <Lucide icon="Code" className="w-4 h-4" />
                      <span className="text-sm">
                        {showPlaceholders
                          ? "Hide Placeholders"
                          : "Show Placeholders"}
                      </span>
                    </button>
                    {showPlaceholders && (
                      <div className="p-6 bg-[#f3f4f6] border-2 border-[#4b4b4b] space-y-4">
                        <p className="text-sm font-black text-[#4b4b4b] uppercase flex items-center gap-2">
                          <Lucide icon="Info" className="w-4 h-4 text-[#8b5cf6]" />
                          Click to insert:
                        </p>
                        <div className="grid grid-cols-2 gap-2 text-xs">
                          {[
                            "contactName",
                            "firstName",
                            "lastName",
                            "email",
                            "phone",
                            "vehicleNumber",
                            "branch",
                            "expiryDate",
                            "ic",
                            "name",
                          ].map((field) => (
                            <button
                              key={field}
                              type="button"
                              onClick={() => insertPlaceholder(field)}
                              className="text-left p-2 bg-white text-[#4b4b4b] font-bold border-2 border-[#4b4b4b] hover:shadow-[2px_2px_0_#4b4b4b] hover:-translate-y-0.5 hover:-translate-x-0.5 transition-all outline-none"
                            >
                              @{"{"}${field}
                              {"}"}
                            </button>
                          ))}
                        </div>

                        {/* Custom Fields Placeholders */}
                        {(() => {
                          const allCustomFields = new Set<string>();

                          if (selectedContacts && selectedContacts.length > 0) {
                            selectedContacts.forEach((contact) => {
                              if (contact.customFields) {
                                Object.keys(contact.customFields).forEach(
                                  (key) => allCustomFields.add(key)
                                );
                              }
                            });
                          }

                          if (
                            allCustomFields.size === 0 &&
                            contacts &&
                            contacts.length > 0
                          ) {
                            contacts.forEach((contact) => {
                              if (contact.customFields) {
                                Object.keys(contact.customFields).forEach(
                                  (key) => allCustomFields.add(key)
                                );
                              }
                            });
                          }

                          if (allCustomFields.size > 0) {
                            return (
                              <div className="space-y-3 pt-3 border-t-2 border-[#4b4b4b]">
                                <p className="text-sm font-black text-[#4b4b4b] uppercase flex items-center gap-2">
                                  <Lucide icon="Settings" className="w-4 h-4 text-[#10b981]" />
                                  Custom Fields:
                                </p>
                                <div className="grid grid-cols-2 gap-2 text-xs">
                                  {Array.from(allCustomFields).map((field) => (
                                    <button
                                      key={field}
                                      type="button"
                                      onClick={() => {
                                        const placeholder = `@{${field}}`;
                                        const newMessages = [...messages];
                                        if (newMessages.length > 0) {
                                          const currentText =
                                            newMessages[focusedMessageIndex]
                                              .text;
                                          const newText =
                                            currentText.slice(
                                              0,
                                              cursorPosition
                                            ) +
                                            placeholder +
                                            currentText.slice(cursorPosition);

                                          newMessages[focusedMessageIndex] = {
                                            ...newMessages[focusedMessageIndex],
                                            text: newText,
                                          };
                                          setMessages(newMessages);

                                          setCursorPosition(
                                            cursorPosition + placeholder.length
                                          );
                                        }
                                      }}
                                      className="text-left p-2 bg-[#d1fae5] text-[#065f46] font-bold border-2 border-[#065f46] hover:shadow-[2px_2px_0_#065f46] hover:-translate-y-0.5 hover:-translate-x-0.5 transition-all outline-none"
                                    >
                                      @{"{"}${field}
                                      {"}"}
                                    </button>
                                  ))}
                                </div>
                              </div>
                            );
                          }
                          return null;
                        })()}
                      </div>
                    )}
                  </div>

                  {/* Scheduled Time */}
                  <div className="space-y-3">
                    <div className="flex items-center space-x-3">
                      <Lucide
                        icon="Clock"
                        className="w-5 h-5 text-[#8b5cf6]"
                      />
                      <label className="text-lg font-black text-[#4b4b4b] uppercase tracking-wider">
                        Scheduled Time
                      </label>
                    </div>
                    <DatePickerComponent
                      selected={
                        currentScheduledMessage?.scheduledTime
                          ? new Date(currentScheduledMessage.scheduledTime)
                          : new Date()
                      }
                      onChange={(date: Date | null) => {
                        setCurrentScheduledMessage((prev) => ({
                          ...prev!,
                          scheduledTime: date ? date.toISOString() : "",
                        }));
                      }}
                      showTimeSelect
                      timeFormat="HH:mm"
                      timeIntervals={15}
                      dateFormat="MMMM d, yyyy h:mm aa"
                      className="w-full px-4 py-3 bg-white border-2 border-[#4b4b4b] text-sm text-[#4b4b4b] font-bold focus:shadow-[4px_4px_0_#8b5cf6] transition-all outline-none"
                    />
                  </div>

                  {/* Media Upload */}
                  <div className="space-y-3">
                    <div className="flex items-center space-x-3">
                      <Lucide
                        icon="Image"
                        className="w-5 h-5 text-[#f26522]"
                      />
                      <label className="text-lg font-black text-[#4b4b4b] uppercase tracking-wider">
                        Attach Media (Image/Video)
                      </label>
                    </div>
                    <input
                      type="file"
                      accept="image/*,video/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          const maxSize = file.type.startsWith("video/")
                            ? 20971520
                            : 5242880;
                          if (file.size > maxSize) {
                            toast.error(
                              "The video file is too big. Please select a file smaller than 20MB."
                            );
                            return;
                          }
                          try {
                            handleEditMediaUpload(e);
                          } catch (error) {
                            toast.error(
                              "Upload unsuccessful. Please try again."
                            );
                          }
                        }
                      }}
                      className="w-full text-sm text-[#4b4b4b] bg-white border-2 border-[#4b4b4b] shadow-[4px_4px_0_#f26522] p-4 transition-all focus:outline-none file:mr-4 file:py-2 file:px-4 file:border-2 file:border-[#4b4b4b] file:text-sm file:font-black file:uppercase file:bg-[#f26522] file:text-white hover:file:bg-white hover:file:text-[#4b4b4b] file:shadow-[2px_2px_0_#4b4b4b] hover:file:translate-x-0.5 hover:file:translate-y-0.5"
                    />
                  </div>

                  {/* Document Upload */}
                  <div className="space-y-3">
                    <div className="flex items-center space-x-3">
                      <Lucide
                        icon="FileText"
                        className="w-5 h-5 text-[#8b5cf6]"
                      />
                      <label className="text-lg font-black text-[#4b4b4b] uppercase tracking-wider">
                        Attach Document
                      </label>
                    </div>
                    <input
                      type="file"
                      accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx"
                      onChange={(e) => handleEditDocumentUpload(e)}
                      className="w-full text-sm text-[#4b4b4b] bg-white border-2 border-[#4b4b4b] shadow-[4px_4px_0_#8b5cf6] p-4 transition-all focus:outline-none file:mr-4 file:py-2 file:px-4 file:border-2 file:border-[#4b4b4b] file:text-sm file:font-black file:uppercase file:bg-[#8b5cf6] file:text-white hover:file:bg-white hover:file:text-[#4b4b4b] file:shadow-[2px_2px_0_#4b4b4b] hover:file:translate-x-0.5 hover:file:translate-y-0.5"
                    />
                  </div>
                </div>

                <div className="flex justify-end space-x-3 mt-10 pt-6 border-t-2 border-[#4b4b4b]">
                  <button
                    onClick={() => setEditScheduledMessageModal(false)}
                    className="px-6 py-3 bg-white text-[#4b4b4b] border-2 border-[#4b4b4b] font-black uppercase tracking-wider hover:shadow-[4px_4px_0_#4b4b4b] hover:-translate-y-0.5 hover:-translate-x-0.5 transition-all outline-none"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSaveScheduledMessage}
                    className="px-8 py-3 bg-[#3b82f6] text-white border-2 border-[#4b4b4b] font-black uppercase tracking-wider shadow-[4px_4px_0_#4b4b4b] hover:shadow-[6px_6px_0_#4b4b4b] hover:-translate-y-0.5 hover:-translate-x-0.5 transition-all outline-none"
                  >
                    <div className="flex items-center space-x-2">
                      <Lucide icon="Save" className="w-4 h-4" />
                      <span>Save</span>
                    </div>
                  </button>
                </div>
              </div>
            </Dialog.Panel>
          </div>
        </Dialog>

        {/* Edit Contact Modal */}
        <Dialog
          open={editContactModal}
          onClose={() => setEditContactModal(false)}
        >
          <div className="fixed inset-0 flex items-center justify-center p-4 bg-black/50 z-[60]">
            <Dialog.Panel className="w-full max-w-4xl relative bg-white border-2 border-[#4b4b4b] shadow-[8px_8px_0_#4b4b4b] overflow-hidden overflow-y-auto transform transition-all flex flex-col max-h-[90vh]">
              <div className="relative p-8">
                <div className="flex items-center justify-between pb-6 border-b-2 border-[#4b4b4b]">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-[#10b981] flex items-center justify-center border-2 border-[#4b4b4b] shadow-[2px_2px_0_#4b4b4b]">
                      <Lucide
                        icon="UserCog"
                        className="w-6 h-6 text-white"
                      />
                    </div>
                    <h3 className="text-2xl font-black text-[#4b4b4b] uppercase tracking-wider">
                      Edit Contact
                    </h3>
                  </div>
                  <button
                    onClick={() => setEditContactModal(false)}
                    className="w-8 h-8 flex flex-shrink-0 items-center justify-center bg-white border-2 border-[#4b4b4b] shadow-[2px_2px_0_#4b4b4b] hover:shadow-[4px_4px_0_#f26522] hover:-translate-y-0.5 hover:-translate-x-0.5 transition-all outline-none"
                  >
                    <Lucide icon="X" className="w-4 h-4 text-[#4b4b4b]" />
                  </button>
                </div>

                {currentContact && (
                  <div className="mt-8 space-y-8">
                    {/* Basic Contact Information */}
                    <div className="bg-[#f0fdf4] p-8 border-2 border-[#4b4b4b] shadow-[4px_4px_0_#10b981] space-y-6">
                      <div className="flex items-center space-x-3 mb-6">
                        <div className="w-10 h-10 bg-[#34d399] flex items-center justify-center border-2 border-[#4b4b4b] shadow-[2px_2px_0_#4b4b4b]">
                          <Lucide
                            icon="User"
                            className="w-5 h-5 text-white"
                          />
                        </div>
                        <h4 className="text-xl font-black text-[#4b4b4b] uppercase tracking-wider">
                          Basic Information
                        </h4>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-3">
                          <label className="flex items-center space-x-2 text-sm font-black text-[#4b4b4b] uppercase tracking-wider">
                            <span>Contact Name</span>
                          </label>
                          <FormInput
                            type="text"
                            value={
                              currentContact.contactName ||
                              currentContact.name ||
                              ""
                            }
                            onChange={(e) =>
                              setCurrentContact({
                                ...currentContact,
                                contactName: e.target.value,
                                name: e.target.value,
                              })
                            }
                            placeholder="Enter contact name"
                            className="w-full bg-white border-2 border-[#4b4b4b] text-[#4b4b4b] font-bold placeholder-[#4b4b4b]/50 focus:shadow-[4px_4px_0_#10b981] transition-all outline-none"
                          />
                        </div>

                        <div className="space-y-3">
                          <label className="flex items-center space-x-2 text-sm font-black text-[#4b4b4b] uppercase tracking-wider">
                            <span>Last Name</span>
                          </label>
                          <FormInput
                            type="text"
                            value={currentContact.lastName || ""}
                            onChange={(e) =>
                              setCurrentContact({
                                ...currentContact,
                                lastName: e.target.value,
                              })
                            }
                            placeholder="Enter last name"
                            className="w-full bg-white border-2 border-[#4b4b4b] text-[#4b4b4b] font-bold placeholder-[#4b4b4b]/50 focus:shadow-[4px_4px_0_#3b82f6] transition-all outline-none"
                          />
                        </div>

                        <div className="space-y-3">
                          <label className="flex items-center space-x-2 text-sm font-black text-[#4b4b4b] uppercase tracking-wider">
                            <span>Phone Number</span>
                          </label>
                          <FormInput
                            type="tel"
                            value={currentContact.phone || ""}
                            onChange={(e) =>
                              setCurrentContact({
                                ...currentContact,
                                phone: e.target.value,
                              })
                            }
                            placeholder="e.g., +60123456789"
                            className="w-full bg-white border-2 border-[#4b4b4b] text-[#4b4b4b] font-bold placeholder-[#4b4b4b]/50 focus:shadow-[4px_4px_0_#8b5cf6] transition-all outline-none"
                          />
                        </div>

                        <div className="space-y-3">
                          <label className="flex items-center space-x-2 text-sm font-black text-[#4b4b4b] uppercase tracking-wider">
                            <span>Email</span>
                          </label>
                          <FormInput
                            type="email"
                            value={currentContact.email || ""}
                            onChange={(e) =>
                              setCurrentContact({
                                ...currentContact,
                                email: e.target.value,
                              })
                            }
                            placeholder="Enter email address"
                            className="w-full bg-white border-2 border-[#4b4b4b] text-[#4b4b4b] font-bold placeholder-[#4b4b4b]/50 focus:shadow-[4px_4px_0_#f97316] transition-all outline-none"
                          />
                        </div>

                        <div className="space-y-3">
                          <label className="flex items-center space-x-2 text-sm font-black text-[#4b4b4b] uppercase tracking-wider">
                            <span>Company Name</span>
                          </label>
                          <FormInput
                            type="text"
                            value={currentContact.companyName || ""}
                            onChange={(e) =>
                              setCurrentContact({
                                ...currentContact,
                                companyName: e.target.value,
                              })
                            }
                            placeholder="Enter company name"
                            className="w-full bg-white border-2 border-[#4b4b4b] text-[#4b4b4b] font-bold placeholder-[#4b4b4b]/50 focus:shadow-[4px_4px_0_#06b6d4] transition-all outline-none"
                          />
                        </div>

                        <div className="space-y-3">
                          <label className="flex items-center space-x-2 text-sm font-black text-[#4b4b4b] uppercase tracking-wider">
                            <span>Address</span>
                          </label>
                          <FormInput
                            type="text"
                            value={currentContact.address1 || ""}
                            onChange={(e) =>
                              setCurrentContact({
                                ...currentContact,
                                address1: e.target.value,
                              })
                            }
                            placeholder="Enter address"
                            className="w-full bg-white border-2 border-[#4b4b4b] text-[#4b4b4b] font-bold placeholder-[#4b4b4b]/50 focus:shadow-[4px_4px_0_#ec4899] transition-all outline-none"
                          />
                        </div>

                        {companyId === "079" && (
                          <div className="space-y-3">
                            <label className="flex items-center space-x-2 text-sm font-black text-[#4b4b4b] uppercase tracking-wider">
                              <span>Branch</span>
                            </label>
                            <FormInput
                              type="text"
                              value={currentContact.branch || ""}
                              onChange={(e) =>
                                setCurrentContact({
                                  ...currentContact,
                                  branch: e.target.value,
                                })
                              }
                              placeholder="Enter branch"
                              className="w-full bg-white border-2 border-[#4b4b4b] text-[#4b4b4b] font-bold placeholder-[#4b4b4b]/50 focus:shadow-[4px_4px_0_#14b8a6] transition-all outline-none"
                            />
                          </div>
                        )}

                        {companyId === "079" && (
                          <div className="space-y-3">
                            <label className="flex items-center space-x-2 text-sm font-black text-[#4b4b4b] uppercase tracking-wider">
                              <span>Vehicle Number</span>
                            </label>
                            <FormInput
                              type="text"
                              value={currentContact.vehicleNumber || ""}
                              onChange={(e) =>
                                setCurrentContact({
                                  ...currentContact,
                                  vehicleNumber: e.target.value,
                                })
                              }
                              placeholder="Enter vehicle number"
                              className="w-full bg-white border-2 border-[#4b4b4b] text-[#4b4b4b] font-bold placeholder-[#4b4b4b]/50 focus:shadow-[4px_4px_0_#8b5cf6] transition-all outline-none"
                            />
                          </div>
                        )}

                        {companyId === "079" && (
                          <div className="space-y-3">
                            <label className="flex items-center space-x-2 text-sm font-black text-[#4b4b4b] uppercase tracking-wider">
                              <span>IC Number</span>
                            </label>
                            <FormInput
                              type="text"
                              value={currentContact.ic || ""}
                              onChange={(e) =>
                                setCurrentContact({
                                  ...currentContact,
                                  ic: e.target.value,
                                })
                              }
                              placeholder="Enter IC number"
                              className="w-full bg-white border-2 border-[#4b4b4b] text-[#4b4b4b] font-bold placeholder-[#4b4b4b]/50 focus:shadow-[4px_4px_0_#f59e0b] transition-all outline-none"
                            />
                          </div>
                        )}

                        {companyId === "079" && (
                          <div className="space-y-3">
                            <label className="flex items-center space-x-2 text-sm font-black text-[#4b4b4b] uppercase tracking-wider">
                              <span>Expiry Date</span>
                            </label>
                            <FormInput
                              type="date"
                              value={currentContact.expiryDate || ""}
                              onChange={(e) =>
                                setCurrentContact({
                                  ...currentContact,
                                  expiryDate: e.target.value,
                                })
                              }
                              className="w-full bg-white border-2 border-[#4b4b4b] text-[#4b4b4b] font-bold placeholder-[#4b4b4b]/50 focus:shadow-[4px_4px_0_#f43f5e] transition-all outline-none"
                            />
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Company-specific fields */}
                    {companyId === "095" && (
                      <div className="bg-[#f5f3ff] p-8 border-2 border-[#4b4b4b] shadow-[4px_4px_0_#8b5cf6] space-y-6">
                        <div className="flex items-center space-x-3 mb-6">
                          <div className="w-10 h-10 bg-[#8b5cf6] flex items-center justify-center border-2 border-[#4b4b4b] shadow-[2px_2px_0_#4b4b4b]">
                            <Lucide
                              icon="GraduationCap"
                              className="w-5 h-5 text-white"
                            />
                          </div>
                          <h4 className="text-xl font-black text-[#4b4b4b] uppercase tracking-wider">
                            Education Information
                          </h4>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div className="space-y-3">
                            <label className="flex items-center space-x-2 text-sm font-black text-[#4b4b4b] uppercase tracking-wider">
                              <span>Country</span>
                            </label>
                            <FormInput
                              type="text"
                              value={currentContact.country || ""}
                              onChange={(e) =>
                                setCurrentContact({
                                  ...currentContact,
                                  country: e.target.value,
                                })
                              }
                              placeholder="Enter country"
                              className="w-full bg-white border-2 border-[#4b4b4b] text-[#4b4b4b] font-bold placeholder-[#4b4b4b]/50 focus:shadow-[4px_4px_0_#10b981] transition-all outline-none"
                            />
                          </div>

                          <div className="space-y-3">
                            <label className="flex items-center space-x-2 text-sm font-black text-[#4b4b4b] uppercase tracking-wider">
                              <span>Nationality</span>
                            </label>
                            <FormInput
                              type="text"
                              value={currentContact.nationality || ""}
                              onChange={(e) =>
                                setCurrentContact({
                                  ...currentContact,
                                  nationality: e.target.value,
                                })
                              }
                              placeholder="Enter nationality"
                              className="w-full bg-white border-2 border-[#4b4b4b] text-[#4b4b4b] font-bold placeholder-[#4b4b4b]/50 focus:shadow-[4px_4px_0_#ef4444] transition-all outline-none"
                            />
                          </div>

                          <div className="space-y-3">
                            <label className="flex items-center space-x-2 text-sm font-black text-[#4b4b4b] uppercase tracking-wider">
                              <span>Highest Educational Qualification</span>
                            </label>
                            <FormInput
                              type="text"
                              value={currentContact.highestEducation || ""}
                              onChange={(e) =>
                                setCurrentContact({
                                  ...currentContact,
                                  highestEducation: e.target.value,
                                })
                              }
                              placeholder="Enter highest education"
                              className="w-full bg-white border-2 border-[#4b4b4b] text-[#4b4b4b] font-bold placeholder-[#4b4b4b]/50 focus:shadow-[4px_4px_0_#3b82f6] transition-all outline-none"
                            />
                          </div>

                          <div className="space-y-3">
                            <label className="flex items-center space-x-2 text-sm font-black text-[#4b4b4b] uppercase tracking-wider">
                              <span>Program Of Study</span>
                            </label>
                            <FormInput
                              type="text"
                              value={currentContact.programOfStudy || ""}
                              onChange={(e) =>
                                setCurrentContact({
                                  ...currentContact,
                                  programOfStudy: e.target.value,
                                })
                              }
                              placeholder="Enter program of study"
                              className="w-full bg-white border-2 border-[#4b4b4b] text-[#4b4b4b] font-bold placeholder-[#4b4b4b]/50 focus:shadow-[4px_4px_0_#a855f7] transition-all outline-none"
                            />
                          </div>

                          <div className="space-y-3">
                            <label className="flex items-center space-x-2 text-sm font-black text-[#4b4b4b] uppercase tracking-wider">
                              <span>Intake Preference</span>
                            </label>
                            <FormInput
                              type="text"
                              value={currentContact.intakePreference || ""}
                              onChange={(e) =>
                                setCurrentContact({
                                  ...currentContact,
                                  intakePreference: e.target.value,
                                })
                              }
                              placeholder="Enter intake preference"
                              className="w-full bg-white border-2 border-[#4b4b4b] text-[#4b4b4b] font-bold placeholder-[#4b4b4b]/50 focus:shadow-[4px_4px_0_#f97316] transition-all outline-none"
                            />
                          </div>

                          <div className="space-y-3">
                            <label className="flex items-center space-x-2 text-sm font-black text-[#4b4b4b] uppercase tracking-wider">
                              <span>English Proficiency</span>
                            </label>
                            <FormInput
                              type="text"
                              value={currentContact.englishProficiency || ""}
                              onChange={(e) =>
                                setCurrentContact({
                                  ...currentContact,
                                  englishProficiency: e.target.value,
                                })
                              }
                              placeholder="Enter English proficiency"
                              className="w-full bg-white border-2 border-[#4b4b4b] text-[#4b4b4b] font-bold placeholder-[#4b4b4b]/50 focus:shadow-[4px_4px_0_#06b6d4] transition-all outline-none"
                            />
                          </div>

                          <div className="space-y-3">
                            <label className="flex items-center space-x-2 text-sm font-black text-[#4b4b4b] uppercase tracking-wider">
                              <span>Validity of Passport</span>
                            </label>
                            <FormInput
                              type="text"
                              value={currentContact.passport || ""}
                              onChange={(e) =>
                                setCurrentContact({
                                  ...currentContact,
                                  passport: e.target.value,
                                })
                              }
                              placeholder="Enter passport validity"
                              className="w-full bg-white border-2 border-[#4b4b4b] text-[#4b4b4b] font-bold placeholder-[#4b4b4b]/50 focus:shadow-[4px_4px_0_#6366f1] transition-all outline-none"
                            />
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Points System */}
                    {(companyId === "079" || companyId === "001") && (
                      <div className="bg-[#fefce8] p-8 border-2 border-[#4b4b4b] shadow-[4px_4px_0_#eab308] space-y-6">
                        <div className="flex items-center space-x-3 mb-6">
                          <div className="w-10 h-10 bg-[#eab308] flex items-center justify-center border-2 border-[#4b4b4b] shadow-[2px_2px_0_#4b4b4b]">
                            <Lucide
                              icon="Star"
                              className="w-5 h-5 text-white"
                            />
                          </div>
                          <h4 className="text-xl font-black text-[#4b4b4b] uppercase tracking-wider">
                            Points System
                          </h4>
                        </div>

                        <div className="space-y-3">
                          <label className="flex items-center space-x-2 text-sm font-black text-[#4b4b4b] uppercase tracking-wider">
                            <Lucide
                              icon="Award"
                              className="w-4 h-4 text-[#eab308]"
                            />
                            <span>Points</span>
                          </label>
                          <FormInput
                            type="number"
                            value={currentContact.points || 0}
                            onChange={(e) =>
                              setCurrentContact({
                                ...currentContact,
                                points: parseInt(e.target.value) || 0,
                              })
                            }
                            placeholder="Enter points"
                            className="w-full bg-white border-2 border-[#4b4b4b] text-[#4b4b4b] font-bold placeholder-[#4b4b4b]/50 focus:shadow-[4px_4px_0_#eab308] transition-all outline-none"
                          />
                        </div>
                      </div>
                    )}

                    {/* AI Assistant Integration */}
                    {companyId === "001" && (
                      <div className="bg-white/5 dark:bg-slate-700/10 backdrop-blur-xl rounded-3xl p-8 border border-white/20 dark:border-slate-600/20 shadow-inner space-y-6">
                        <div className="flex items-center space-x-3 mb-6">
                          <Lucide
                            icon="Bot"
                            className="w-6 h-6 text-emerald-400"
                          />
                          <h4 className="text-xl font-semibold text-white/90 dark:text-slate-200">
                            AI Assistant Integration
                          </h4>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div className="space-y-3">
                            <label className="flex items-center space-x-2 text-sm font-medium text-white/80 dark:text-slate-300">
                              <Lucide
                                icon="UserCheck"
                                className="w-4 h-4 text-emerald-400"
                              />
                              <span>Assistant ID</span>
                            </label>
                            <FormInput
                              type="text"
                              value={currentContact.assistantId || ""}
                              onChange={(e) =>
                                setCurrentContact({
                                  ...currentContact,
                                  assistantId: e.target.value,
                                })
                              }
                              placeholder="Enter assistant ID"
                              className="w-full bg-white/5 dark:bg-slate-700/20 backdrop-blur-xl border border-white/20 dark:border-slate-600/20 rounded-2xl text-white dark:text-slate-200 placeholder-white/50 dark:placeholder-slate-400 focus:border-emerald-400/50 focus:ring-2 focus:ring-emerald-400/20 transition-all duration-200"
                            />
                          </div>

                          <div className="space-y-3">
                            <label className="flex items-center space-x-2 text-sm font-medium text-white/80 dark:text-slate-300">
                              <Lucide
                                icon="MessageSquare"
                                className="w-4 h-4 text-blue-400"
                              />
                              <span>Thread ID</span>
                            </label>
                            <FormInput
                              type="text"
                              value={currentContact.threadid || ""}
                              onChange={(e) =>
                                setCurrentContact({
                                  ...currentContact,
                                  threadid: e.target.value,
                                })
                              }
                              placeholder="Enter thread ID"
                              className="w-full bg-white/5 dark:bg-slate-700/20 backdrop-blur-xl border border-white/20 dark:border-slate-600/20 rounded-2xl text-white dark:text-slate-200 placeholder-white/50 dark:placeholder-slate-400 focus:border-blue-400/50 focus:ring-2 focus:ring-blue-400/20 transition-all duration-200"
                            />
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Custom Fields */}
                    {currentContact.customFields &&
                      Object.entries(currentContact.customFields).length >
                      0 && (
                        <div className="bg-white/5 dark:bg-slate-700/10 backdrop-blur-xl rounded-3xl p-8 border border-white/20 dark:border-slate-600/20 shadow-inner space-y-6">
                          <div className="flex items-center space-x-3 mb-6">
                            <Lucide
                              icon="Settings"
                              className="w-6 h-6 text-purple-400"
                            />
                            <h4 className="text-xl font-semibold text-white/90 dark:text-slate-200">
                              Custom Fields
                            </h4>
                          </div>

                          <div className="space-y-6">
                            {Object.entries(currentContact.customFields).map(
                              ([key, value]) => (
                                <div key={key} className="space-y-3">
                                  <label className="flex items-center space-x-2 text-sm font-medium text-white/80 dark:text-slate-300">
                                    <Lucide
                                      icon="Tag"
                                      className="w-4 h-4 text-purple-400"
                                    />
                                    <span>{key}</span>
                                  </label>
                                  <div className="flex gap-3">
                                    <FormInput
                                      type="text"
                                      value={value}
                                      onChange={(e) =>
                                        setCurrentContact({
                                          ...currentContact,
                                          customFields: {
                                            ...currentContact.customFields,
                                            [key]: e.target.value,
                                          },
                                        })
                                      }
                                      placeholder={`Enter ${key}`}
                                      className="flex-1 bg-white/5 dark:bg-slate-700/20 backdrop-blur-xl border border-white/20 dark:border-slate-600/20 rounded-2xl text-white dark:text-slate-200 placeholder-white/50 dark:placeholder-slate-400 focus:border-purple-400/50 focus:ring-2 focus:ring-purple-400/20 transition-all duration-200"
                                    />
                                    <button
                                      onClick={() => {
                                        if (
                                          window.confirm(
                                            `Are you sure you want to delete the custom field "${key}" from all contacts?`
                                          )
                                        ) {
                                          deleteCustomFieldFromAllContacts(key);
                                          const newCustomFields = {
                                            ...currentContact.customFields,
                                          };
                                          delete newCustomFields[key];
                                          setCurrentContact({
                                            ...currentContact,
                                            customFields: newCustomFields,
                                          });
                                        }
                                      }}
                                      className="px-4 py-2 bg-red-500/20 hover:bg-red-500/30 border border-red-400/30 text-red-300 hover:text-red-200 rounded-xl transition-all duration-200 backdrop-blur-sm"
                                    >
                                      <Lucide
                                        icon="Trash2"
                                        className="w-4 h-4"
                                      />
                                    </button>
                                  </div>
                                </div>
                              )
                            )}
                          </div>
                        </div>
                      )}

                    {/* Add New Field */}
                    <div className="bg-white/5 dark:bg-slate-700/10 backdrop-blur-xl rounded-3xl p-8 border border-white/20 dark:border-slate-600/20 shadow-inner">
                      <button
                        onClick={() => {
                          const fieldName = prompt(
                            "Enter the name of the new field:"
                          );
                          if (fieldName) {
                            addCustomFieldToAllContacts(fieldName);
                            setCurrentContact({
                              ...currentContact,
                              customFields: {
                                ...currentContact.customFields,
                                [fieldName]: "",
                              },
                            });
                          }
                        }}
                        className="w-full flex items-center justify-center space-x-3 px-6 py-4 bg-gradient-to-r from-emerald-500/20 to-blue-500/20 hover:from-emerald-500/30 hover:to-blue-500/30 border border-emerald-400/30 hover:border-emerald-400/50 text-emerald-300 hover:text-emerald-200 rounded-2xl transition-all duration-200 backdrop-blur-sm"
                      >
                        <Lucide icon="Plus" className="w-5 h-5" />
                        <span className="font-medium">Add New Field</span>
                      </button>
                    </div>

                    {/* Notes */}
                    <div className="bg-white/5 dark:bg-slate-700/10 backdrop-blur-xl rounded-3xl p-8 border border-white/20 dark:border-slate-600/20 shadow-inner space-y-6">
                      <div className="flex items-center space-x-3 mb-6">
                        <Lucide
                          icon="FileText"
                          className="w-6 h-6 text-amber-400"
                        />
                        <h4 className="text-xl font-semibold text-white/90 dark:text-slate-200">
                          Notes
                        </h4>
                      </div>

                      <textarea
                        value={currentContact.notes || ""}
                        onChange={(e) =>
                          setCurrentContact({
                            ...currentContact,
                            notes: e.target.value,
                          })
                        }
                        placeholder="Enter any additional notes"
                        rows={4}
                        className="w-full px-4 py-4 bg-white/5 dark:bg-slate-700/20 backdrop-blur-xl border border-white/20 dark:border-slate-600/20 rounded-2xl text-white dark:text-slate-200 placeholder-white/50 dark:placeholder-slate-400 focus:border-amber-400/50 focus:ring-2 focus:ring-amber-400/20 transition-all duration-200 resize-none shadow-inner"
                      />
                    </div>

                    {/* Tags */}
                    <div className="bg-white/5 dark:bg-slate-700/10 backdrop-blur-xl rounded-3xl p-8 border border-white/20 dark:border-slate-600/20 shadow-inner space-y-6">
                      <div className="flex items-center space-x-3 mb-6">
                        <Lucide icon="Tags" className="w-6 h-6 text-pink-400" />
                        <h4 className="text-xl font-semibold text-white/90 dark:text-slate-200">
                          Tags
                        </h4>
                      </div>

                      <div className="flex flex-wrap gap-3">
                        {currentContact.tags?.map((tag, index) => (
                          <span
                            key={index}
                            className="inline-flex items-center px-4 py-2 rounded-2xl text-sm bg-gradient-to-r from-pink-500/20 to-purple-500/20 border border-pink-400/30 text-pink-200 backdrop-blur-sm"
                          >
                            {tag}
                            <button
                              onClick={() =>
                                handleRemoveTag(currentContact.contact_id!, tag)
                              }
                              className="ml-2 text-pink-300 hover:text-pink-100 transition-colors duration-200"
                            >
                              <Lucide icon="X" className="w-3 h-3" />
                            </button>
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                <div className="flex justify-end space-x-3 mt-10 pt-6 border-t border-white/10 dark:border-slate-700/20">
                  <button
                    onClick={() => setEditContactModal(false)}
                    className="px-6 py-3 bg-white/5 hover:bg-white/10 dark:bg-slate-700/20 dark:hover:bg-slate-600/30 backdrop-blur-sm border border-white/20 dark:border-slate-600/20 text-white/90 hover:text-white rounded-2xl transition-all duration-200 font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSaveContact}
                    disabled={isLoading}
                    className="px-8 py-3 bg-gradient-to-r from-emerald-500 via-blue-500 to-purple-500 hover:from-emerald-600 hover:via-blue-600 hover:to-purple-600 border-0 text-white rounded-2xl transition-all duration-200 font-semibold shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                  >
                    <div className="flex items-center space-x-2">
                      <Lucide
                        icon={isLoading ? "Loader2" : "Save"}
                        className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`}
                      />
                      <span>{isLoading ? "Saving..." : "Save Changes"}</span>
                    </div>
                  </button>
                </div>
              </div>
            </Dialog.Panel>
          </div>
        </Dialog>

        {/* Scheduled Messages Modal */}
        <Dialog
          open={scheduledMessagesModal}
          onClose={() => setScheduledMessagesModal(false)}
          className="relative z-50"
        >
          <div className="fixed inset-0 flex items-center justify-center p-4 bg-gradient-to-br from-slate-900/80 via-slate-800/70 to-slate-900/80 backdrop-blur-xl">
            <Dialog.Panel className="w-[90vw] md:w-[85vw] lg:w-[80vw] max-w-[1600px] relative bg-white/10 dark:bg-slate-800/10 backdrop-blur-3xl rounded-3xl shadow-[0_25px_50px_-12px_rgba(0,0,0,0.5)] dark:shadow-[0_25px_50px_-12px_rgba(0,0,0,0.8)] border border-white/20 dark:border-slate-700/20 transform hover:scale-[1.001] transition-all duration-300 flex flex-col max-h-[90vh]">
              {/* Enhanced Gradient Overlay */}
              <div className="absolute inset-0 bg-gradient-to-br from-blue-400/10 via-purple-500/5 to-indigo-500/10 dark:from-blue-600/10 dark:via-purple-700/5 dark:to-indigo-600/10 pointer-events-none" />

              {/* Top Shine Effect */}
              <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/40 to-transparent" />

              <div className="relative flex-1 flex flex-col overflow-hidden">
                {/* Sticky Header Section */}
                <div className="sticky top-0 z-10 bg-white/10 dark:bg-slate-800/10 backdrop-blur-3xl rounded-t-3xl border-b border-white/10 dark:border-slate-700/20">
                  {/* Main Header */}
                  <div className="flex items-center justify-between p-8 pb-6">
                    <div className="flex items-center space-x-4">
                      <div className="relative p-4 rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10">
                        <Lucide
                          icon="Calendar"
                          className="w-7 h-7 text-blue-400"
                        />
                        <div className="absolute inset-0 bg-gradient-to-br from-blue-400/20 to-purple-400/20 rounded-2xl blur-sm" />
                      </div>
                      <div>
                        <h3 className="text-2xl font-bold bg-gradient-to-r from-white via-blue-100 to-purple-100 bg-clip-text text-transparent">
                          Scheduled Messages
                        </h3>
                        <p className="text-white/60 mt-1">
                          Manage your scheduled message campaigns
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      {/* Active Filters Indicator */}
                      {(messageStatusFilter ||
                        messageDateFilter ||
                        messageTypeFilter ||
                        messageRecipientFilter) && (
                          <span className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-medium bg-blue-500/20 text-blue-300 border border-blue-400/20 backdrop-blur-sm">
                            Filtered
                          </span>
                        )}
                      <button
                        onClick={() => setScheduledMessagesModal(false)}
                        className="w-8 h-8 rounded-xl bg-white/5 hover:bg-white/10 dark:bg-slate-700/20 dark:hover:bg-slate-600/30 text-slate-400 hover:text-white dark:hover:text-slate-200 transition-all duration-200 flex items-center justify-center backdrop-blur-sm border border-white/10"
                      >
                        <Lucide icon="X" className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Filter Controls */}
                  <div className="flex flex-wrap items-center gap-4 px-8 py-6">
                    {/* Status Filter */}
                    <div className="space-y-2">
                      <label className="block text-xs font-medium text-white/60 uppercase tracking-wide">
                        Status
                      </label>
                      <select
                        value={messageStatusFilter}
                        onChange={(e) => setMessageStatusFilter(e.target.value)}
                        className="px-4 py-2.5 bg-white/5 border border-white/10 rounded-2xl text-white text-sm focus:border-blue-400/50 focus:ring-2 focus:ring-blue-400/20 transition-all duration-200 backdrop-blur-sm min-w-[140px] appearance-none bg-[url('data:image/svg+xml;charset=UTF-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22%2523ffffff%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpolyline%20points%3D%226%2C9%2012%2C15%2018%2C9%22%3E%3C%2Fpolyline%3E%3C%2Fsvg%3E')] bg-no-repeat bg-[length:16px_16px] bg-[right_12px_center] pr-10"
                        style={{
                          color: "white",
                          backgroundColor: "rgba(255, 255, 255, 0.05)",
                        }}
                      >
                        <option
                          value=""
                          style={{ backgroundColor: "#1e293b", color: "white" }}
                        >
                          All Status
                        </option>
                        <option
                          value="scheduled"
                          style={{ backgroundColor: "#1e293b", color: "white" }}
                        >
                          Scheduled
                        </option>
                        <option
                          value="sent"
                          style={{ backgroundColor: "#1e293b", color: "white" }}
                        >
                          Sent
                        </option>
                        <option
                          value="failed"
                          style={{ backgroundColor: "#1e293b", color: "white" }}
                        >
                          Failed
                        </option>
                      </select>
                    </div>

                    {/* Date Filter */}
                    <div className="space-y-2">
                      <label className="block text-xs font-medium text-white/60 uppercase tracking-wide">
                        Date
                      </label>
                      <select
                        value={messageDateFilter}
                        onChange={(e) => setMessageDateFilter(e.target.value)}
                        className="px-4 py-2.5 bg-white/5 border border-white/10 rounded-2xl text-white text-sm focus:border-blue-400/50 focus:ring-2 focus:ring-blue-400/20 transition-all duration-200 backdrop-blur-sm min-w-[140px] appearance-none bg-[url('data:image/svg+xml;charset=UTF-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22%2523ffffff%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpolyline%20points%3D%226%2C9%2012%2C15%2018%2C9%22%3E%3C%2Fpolyline%3E%3C%2Fsvg%3E')] bg-no-repeat bg-[length:16px_16px] bg-[right_12px_center] pr-10"
                        style={{
                          color: "white",
                          backgroundColor: "rgba(255, 255, 255, 0.05)",
                        }}
                      >
                        <option
                          value=""
                          style={{ backgroundColor: "#1e293b", color: "white" }}
                        >
                          All Dates
                        </option>
                        <option
                          value="today"
                          style={{ backgroundColor: "#1e293b", color: "white" }}
                        >
                          Today
                        </option>
                        <option
                          value="tomorrow"
                          style={{ backgroundColor: "#1e293b", color: "white" }}
                        >
                          Tomorrow
                        </option>
                        <option
                          value="this-week"
                          style={{ backgroundColor: "#1e293b", color: "white" }}
                        >
                          This Week
                        </option>
                        <option
                          value="next-week"
                          style={{ backgroundColor: "#1e293b", color: "white" }}
                        >
                          Next Week
                        </option>
                        <option
                          value="this-month"
                          style={{ backgroundColor: "#1e293b", color: "white" }}
                        >
                          This Month
                        </option>
                        <option
                          value="next-month"
                          style={{ backgroundColor: "#1e293b", color: "white" }}
                        >
                          Next Month
                        </option>
                      </select>
                    </div>

                    {/* Type Filter */}
                    <div className="space-y-2">
                      <label className="block text-xs font-medium text-white/60 uppercase tracking-wide">
                        Type
                      </label>
                      <select
                        value={messageTypeFilter}
                        onChange={(e) => setMessageTypeFilter(e.target.value)}
                        className="px-4 py-2.5 bg-white/5 border border-white/10 rounded-2xl text-white text-sm focus:border-blue-400/50 focus:ring-2 focus:ring-blue-400/20 transition-all duration-200 backdrop-blur-sm min-w-[140px] appearance-none bg-[url('data:image/svg+xml;charset=UTF-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22%2523ffffff%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpolyline%20points%3D%226%2C9%2012%2C15%2018%2C9%22%3E%3C%2Fpolyline%3E%3C%2Fsvg%3E')] bg-no-repeat bg-[length:16px_16px] bg-[right_12px_center] pr-10"
                        style={{
                          color: "white",
                          backgroundColor: "rgba(255, 255, 255, 0.05)",
                        }}
                      >
                        <option
                          value=""
                          style={{ backgroundColor: "#1e293b", color: "white" }}
                        >
                          All Types
                        </option>
                        <option
                          value="text"
                          style={{ backgroundColor: "#1e293b", color: "white" }}
                        >
                          Text Only
                        </option>
                        <option
                          value="media"
                          style={{ backgroundColor: "#1e293b", color: "white" }}
                        >
                          With Media
                        </option>
                        <option
                          value="document"
                          style={{ backgroundColor: "#1e293b", color: "white" }}
                        >
                          With Document
                        </option>
                        <option
                          value="multiple"
                          style={{ backgroundColor: "#1e293b", color: "white" }}
                        >
                          Multiple Messages
                        </option>
                      </select>
                    </div>

                    {/* Recipient Filter */}
                    <div className="space-y-2">
                      <label className="block text-xs font-medium text-white/60 uppercase tracking-wide">
                        Recipients
                      </label>
                      <select
                        value={messageRecipientFilter}
                        onChange={(e) =>
                          setMessageRecipientFilter(e.target.value)
                        }
                        className="px-4 py-2.5 bg-white/5 border border-white/10 rounded-2xl text-white text-sm focus:border-blue-400/50 focus:ring-2 focus:ring-blue-400/20 transition-all duration-200 backdrop-blur-sm min-w-[140px] appearance-none bg-[url('data:image/svg+xml;charset=UTF-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22%2523ffffff%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpolyline%20points%3D%226%2C9%2012%2C15%2018%2C9%22%3E%3C%2Fpolyline%3E%3C%2Fsvg%3E')] bg-no-repeat bg-[length:16px_16px] bg-[right_12px_center] pr-10"
                        style={{
                          color: "white",
                          backgroundColor: "rgba(255, 255, 255, 0.05)",
                        }}
                      >
                        <option
                          value=""
                          style={{ backgroundColor: "#1e293b", color: "white" }}
                        >
                          All Recipients
                        </option>
                        <option
                          value="single"
                          style={{ backgroundColor: "#1e293b", color: "white" }}
                        >
                          Single Contact
                        </option>
                        <option
                          value="multiple"
                          style={{ backgroundColor: "#1e293b", color: "white" }}
                        >
                          Multiple Contacts
                        </option>
                      </select>
                    </div>

                    {/* Clear Filters Button */}
                    {(messageStatusFilter ||
                      messageDateFilter ||
                      messageTypeFilter ||
                      messageRecipientFilter) && (
                        <div className="space-y-2">
                          <label className="block text-xs font-medium text-transparent">
                            Clear
                          </label>
                          <button
                            onClick={() => {
                              setMessageStatusFilter("");
                              setMessageDateFilter("");
                              setMessageTypeFilter("");
                              setMessageRecipientFilter("");
                            }}
                            className="px-4 py-2.5 bg-red-500/20 hover:bg-red-500/30 border border-red-400/30 hover:border-red-400/50 text-red-300 hover:text-red-200 rounded-2xl text-sm transition-all duration-200 backdrop-blur-sm flex items-center space-x-2"
                          >
                            <Lucide icon="X" className="w-4 h-4" />
                            <span>Clear Filters</span>
                          </button>
                        </div>
                      )}
                  </div>
                  {/* Action Buttons for Selected Messages */}
                  {selectedScheduledMessages.length > 0 &&
                    scheduledMessagesModal && (
                      <div className="px-8 pb-4 border-b border-white/10 dark:border-slate-700/20">
                        <div className="bg-white/5 dark:bg-slate-700/10 backdrop-blur-xl rounded-3xl p-6 border border-white/20 dark:border-slate-600/20 shadow-inner">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                              <div className="w-3 h-3 rounded-full bg-gradient-to-r from-blue-400 to-purple-500"></div>
                              <span className="text-sm text-white/80 font-medium">
                                {selectedScheduledMessages.length} message
                                {selectedScheduledMessages.length > 1
                                  ? "s"
                                  : ""}{" "}
                                selected
                              </span>
                            </div>
                            <div className="flex space-x-3">
                              <button
                                type="button"
                                onClick={() => {
                                  const allIds = applyAdvancedFilters(
                                    combineScheduledMessages(
                                      getFilteredScheduledMessages()
                                    )
                                  ).map((msg) => msg.id!);
                                  setSelectedScheduledMessages(allIds);
                                }}
                                className="flex items-center space-x-2 px-4 py-2.5 bg-gradient-to-r from-blue-500/20 to-indigo-500/20 hover:from-blue-500/30 hover:to-indigo-500/30 border border-blue-400/30 hover:border-blue-400/50 text-blue-300 hover:text-blue-200 rounded-2xl transition-all duration-200 backdrop-blur-sm text-sm font-medium shadow-lg shadow-blue-500/10"
                              >
                                <Lucide
                                  icon="CheckSquare"
                                  className="w-4 h-4"
                                />
                                <span>Select All</span>
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  handleSendSelectedNow();
                                }}
                                className="flex items-center space-x-2 px-4 py-2.5 bg-gradient-to-r from-emerald-500/20 to-teal-500/20 hover:from-emerald-500/30 hover:to-teal-500/30 border border-emerald-400/30 hover:border-emerald-400/50 text-emerald-300 hover:text-emerald-200 rounded-2xl transition-all duration-200 backdrop-blur-sm text-sm font-medium shadow-lg shadow-emerald-500/10"
                              >
                                <Lucide icon="Send" className="w-4 h-4" />
                                <span>Send Selected</span>
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  if (
                                    window.confirm(
                                      `Are you sure you want to delete ${selectedScheduledMessages.length
                                      } selected message${selectedScheduledMessages.length > 1
                                        ? "s"
                                        : ""
                                      }?`
                                    )
                                  ) {
                                    handleDeleteSelected();
                                  }
                                }}
                                className="flex items-center space-x-2 px-4 py-2.5 bg-gradient-to-r from-red-500/20 to-pink-500/20 hover:from-red-500/30 hover:to-pink-500/30 border border-red-400/30 hover:border-red-400/50 text-red-300 hover:text-red-200 rounded-2xl transition-all duration-200 backdrop-blur-sm text-sm font-medium shadow-lg shadow-red-500/10"
                              >
                                <Lucide icon="Trash2" className="w-4 h-4" />
                                <span>Delete Selected</span>
                              </button>
                              <button
                                type="button"
                                onClick={() => setSelectedScheduledMessages([])}
                                className="flex items-center space-x-2 px-4 py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 text-white/80 hover:text-white rounded-2xl transition-all duration-200 backdrop-blur-sm text-sm font-medium"
                              >
                                <Lucide icon="X" className="w-4 h-4" />
                                <span>Cancel</span>
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                </div>

                {/* Messages List */}
                <div className="flex-1 overflow-y-auto px-8 pb-8">
                  <div className="mt-6 pb-24">
                    {getFilteredScheduledMessages().length > 0 ? (
                      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                        {applyAdvancedFilters(
                          combineScheduledMessages(
                            getFilteredScheduledMessages()
                          )
                        ).map((message) => (
                          <div
                            key={message.id}
                            className="relative bg-white/5 dark:bg-slate-700/10 backdrop-blur-xl border border-white/20 dark:border-slate-600/20 rounded-3xl shadow-inner overflow-hidden transition-all duration-300 hover:shadow-xl hover:scale-[1.01] flex flex-col transform-gpu"
                          >
                            {/* Enhanced Card Gradient Overlay */}
                            <div className="absolute inset-0 bg-gradient-to-br from-white/5 via-transparent to-purple-500/5 dark:from-slate-600/5 dark:via-transparent dark:to-purple-600/5 pointer-events-none" />

                            <div className="relative p-6 flex-grow">
                              <div className="flex justify-between items-start mb-6">
                                <span
                                  className={`inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium backdrop-blur-sm border transition-all duration-200 ${message.status === "sent"
                                    ? "bg-emerald-500/20 text-emerald-300 border-emerald-400/30"
                                    : message.status === "failed"
                                      ? "bg-red-500/20 text-red-300 border-red-400/30"
                                      : "bg-orange-500/20 text-orange-300 border-orange-400/30"
                                    }`}
                                >
                                  {message.status === "sent"
                                    ? "✓ Sent"
                                    : message.status === "failed"
                                      ? "✗ Failed"
                                      : "⏰ Scheduled"}
                                </span>

                                <input
                                  type="checkbox"
                                  checked={selectedScheduledMessages.includes(
                                    message.id!
                                  )}
                                  onChange={() =>
                                    toggleScheduledMessageSelection(message.id!)
                                  }
                                  className="w-5 h-5 text-blue-500 bg-white/10 border-white/20 rounded focus:ring-blue-500/50 focus:ring-2 backdrop-blur-sm"
                                />
                              </div>

                              <div className="space-y-6">
                                {/* Message Content */}
                                <div className="space-y-3">
                                  <div className="flex items-center space-x-2">
                                    <Lucide
                                      icon="MessageSquare"
                                      className="w-4 h-4 text-blue-400"
                                    />
                                    <h4 className="text-sm font-semibold text-white/90">
                                      Message Content
                                    </h4>
                                  </div>
                                  <div className="bg-white/5 dark:bg-slate-700/10 border border-white/10 dark:border-slate-600/20 rounded-2xl p-4 backdrop-blur-sm shadow-inner">
                                    <p className="text-sm text-white/80 dark:text-slate-200 leading-relaxed line-clamp-3">
                                      {message.messageContent ||
                                        message.message ||
                                        "No message content"}
                                    </p>
                                  </div>
                                </div>

                                {/* Schedule Information */}
                                <div className="grid grid-cols-1 gap-4">
                                  <div className="space-y-2">
                                    <div className="flex items-center space-x-2">
                                      <Lucide
                                        icon="Clock"
                                        className="w-4 h-4 text-purple-400"
                                      />
                                      <span className="text-xs font-medium text-white/60 uppercase tracking-wide">
                                        Scheduled Time
                                      </span>
                                    </div>
                                    <p className="text-sm text-white/90 pl-6">
                                      {message.scheduledTime
                                        ? new Date(
                                          message.scheduledTime
                                        ).toLocaleString()
                                        : "Not set"}
                                    </p>
                                  </div>

                                  <div className="space-y-2">
                                    <div className="flex items-center space-x-2">
                                      <Lucide
                                        icon={
                                          Array.isArray(message.contactIds) &&
                                            message.contactIds.length > 1
                                            ? "Users"
                                            : "User"
                                        }
                                        className="w-4 h-4 text-emerald-400"
                                      />
                                      <span className="text-xs font-medium text-white/60 uppercase tracking-wide">
                                        Recipients
                                      </span>
                                    </div>
                                    <p className="text-sm text-white/90 pl-6">
                                      {Array.isArray(message.contactIds) &&
                                        message.contactIds.length > 0
                                        ? message.contactIds.length > 1
                                          ? `${message.contactIds.length} contacts`
                                          : (() => {
                                            const phoneNumber =
                                              message.contactIds[0]
                                                ?.split("-")[1]
                                                ?.replace(/\D/g, "") || "";
                                            const contact = contacts.find(
                                              (c) =>
                                                c.phone?.replace(
                                                  /\D/g,
                                                  ""
                                                ) === phoneNumber
                                            );
                                            return (
                                              contact?.contactName ||
                                              phoneNumber ||
                                              "Unknown"
                                            );
                                          })()
                                        : message.contactId
                                          ? (() => {
                                            const phoneNumber =
                                              message.contactId
                                                ?.split("-")[1]
                                                ?.replace(/\D/g, "") || "";
                                            const contact = contacts.find(
                                              (c) =>
                                                c.phone?.replace(/\D/g, "") ===
                                                phoneNumber
                                            );
                                            return (
                                              contact?.contactName ||
                                              phoneNumber ||
                                              "Unknown"
                                            );
                                          })()
                                          : "No recipients"}
                                    </p>
                                  </div>

                                  {/* Message Settings Summary */}
                                  {(message.batchQuantity ||
                                    message.minDelay !== undefined ||
                                    message.repeatInterval > 0) && (
                                      <div className="space-y-2">
                                        <div className="flex items-center space-x-2">
                                          <Lucide
                                            icon="Settings"
                                            className="w-4 h-4 text-blue-400"
                                          />
                                          <span className="text-xs font-medium text-white/60 uppercase tracking-wide">
                                            Settings
                                          </span>
                                        </div>
                                        <div className="flex flex-wrap gap-2 pl-6">
                                          {message.batchQuantity && (
                                            <span className="inline-flex items-center px-2 py-1 rounded-lg text-xs bg-blue-500/20 text-blue-300 border border-blue-400/20 backdrop-blur-sm">
                                              Batch: {message.batchQuantity}
                                            </span>
                                          )}
                                          {message.minDelay !== undefined && (
                                            <span className="inline-flex items-center px-2 py-1 rounded-lg text-xs bg-purple-500/20 text-purple-300 border border-purple-400/20 backdrop-blur-sm">
                                              Delay: {message.minDelay}-
                                              {message.maxDelay}s
                                            </span>
                                          )}
                                          {message.repeatInterval > 0 && (
                                            <span className="inline-flex items-center px-2 py-1 rounded-lg text-xs bg-emerald-500/20 text-emerald-300 border border-emerald-400/20 backdrop-blur-sm">
                                              Repeat: {message.repeatInterval}{" "}
                                              {message.repeatUnit}
                                            </span>
                                          )}
                                          {message.infiniteLoop && (
                                            <span className="inline-flex items-center px-2 py-1 rounded-lg text-xs bg-orange-500/20 text-orange-300 border border-orange-400/20 backdrop-blur-sm">
                                              <Lucide
                                                icon="RefreshCw"
                                                className="w-3 h-3 mr-1"
                                              />
                                              Loop
                                            </span>
                                          )}
                                        </div>
                                      </div>
                                    )}
                                </div>

                                {/* Attachments */}
                                {(message.mediaUrl || message.documentUrl) && (
                                  <div className="space-y-2">
                                    <div className="flex items-center space-x-2">
                                      <Lucide
                                        icon="Paperclip"
                                        className="w-4 h-4 text-amber-400"
                                      />
                                      <span className="text-xs font-medium text-white/60 uppercase tracking-wide">
                                        Attachments
                                      </span>
                                    </div>
                                    <div className="flex flex-wrap gap-2 pl-6">
                                      {message.mediaUrl && (
                                        <span className="inline-flex items-center px-2 py-1 rounded-lg text-xs bg-emerald-500/20 text-emerald-300 border border-emerald-400/20 backdrop-blur-sm">
                                          <Lucide
                                            icon="Image"
                                            className="w-3 h-3 mr-1"
                                          />
                                          Media
                                        </span>
                                      )}
                                      {message.documentUrl && (
                                        <span className="inline-flex items-center px-2 py-1 rounded-lg text-xs bg-blue-500/20 text-blue-300 border border-blue-400/20 backdrop-blur-sm">
                                          <Lucide
                                            icon="File"
                                            className="w-3 h-3 mr-1"
                                          />
                                          {message.fileName || "Document"}
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                )}
                              </div>
                            </div>

                            <div className="relative bg-white/5 dark:bg-slate-700/10 border-t border-white/10 dark:border-slate-600/20 px-6 py-4 backdrop-blur-sm">
                              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                                <button
                                  onClick={() => {
                                    setSelectedMessageForView(message);
                                    setViewMessageDetailsModal(true);
                                  }}
                                  className="flex items-center space-x-2 px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 text-white/80 hover:text-white rounded-2xl transition-all duration-200 backdrop-blur-sm text-sm"
                                >
                                  <Lucide icon="Eye" className="w-4 h-4" />
                                  <span>View Details</span>
                                </button>

                                <div className="flex flex-wrap gap-2">
                                  <button
                                    onClick={() => handleSendNow(message)}
                                    className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-emerald-500/20 to-teal-500/20 hover:from-emerald-500/30 hover:to-teal-500/30 border border-emerald-400/30 hover:border-emerald-400/50 text-emerald-300 hover:text-emerald-200 rounded-2xl transition-all duration-200 backdrop-blur-sm text-sm shadow-lg shadow-emerald-500/10"
                                  >
                                    <Lucide icon="Send" className="w-4 h-4" />
                                    <span>Send Now</span>
                                  </button>
                                  <button
                                    onClick={() => {
                                      handleEditScheduledMessage(message);
                                      setScheduledMessagesModal(false);
                                    }}
                                    className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-blue-500/20 to-indigo-500/20 hover:from-blue-500/30 hover:to-indigo-500/30 border border-blue-400/30 hover:border-blue-400/50 text-blue-300 hover:text-blue-200 rounded-2xl transition-all duration-200 backdrop-blur-sm text-sm shadow-lg shadow-blue-500/10"
                                  >
                                    <Lucide
                                      icon="PenTool"
                                      className="w-4 h-4"
                                    />
                                    <span>Edit</span>
                                  </button>
                                  <button
                                    onClick={() => {
                                      if (
                                        window.confirm(
                                          "Are you sure you want to delete this scheduled message?"
                                        )
                                      ) {
                                        handleDeleteScheduledMessage(
                                          message.id!
                                        );
                                      }
                                    }}
                                    className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-red-500/20 to-pink-500/20 hover:from-red-500/30 hover:to-pink-500/30 border border-red-400/30 hover:border-red-400/50 text-red-300 hover:text-red-200 rounded-2xl transition-all duration-200 backdrop-blur-sm text-sm shadow-lg shadow-red-500/10"
                                  >
                                    <Lucide icon="Trash2" className="w-4 h-4" />
                                    <span>Delete</span>
                                  </button>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-16">
                        <div className="relative mx-auto mb-6 w-24 h-24">
                          <Lucide
                            icon="Calendar"
                            className="w-24 h-24 text-white/20"
                          />
                          <div className="absolute inset-0 bg-gradient-to-br from-blue-400/20 to-purple-400/20 rounded-3xl blur-xl" />
                        </div>
                        <h3 className="text-xl font-semibold text-white/90 mb-2">
                          No scheduled messages found
                        </h3>
                        <p className="text-white/60">
                          Try adjusting your filters or create a new scheduled
                          message
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </Dialog.Panel>
          </div>
        </Dialog>

        {/* Message Details Modal */}
        <Dialog
          open={viewMessageDetailsModal}
          onClose={() => setViewMessageDetailsModal(false)}
          className="relative z-50"
        >
          <div className="fixed inset-0 flex items-center justify-center p-4 bg-gradient-to-br from-slate-900/80 via-slate-800/70 to-slate-900/80 backdrop-blur-xl">
            <Dialog.Panel className="w-full max-w-2xl relative bg-white/10 dark:bg-slate-800/10 backdrop-blur-3xl rounded-3xl border border-white/20 dark:border-slate-700/20 shadow-[0_25px_50px_-12px_rgba(0,0,0,0.5)] dark:shadow-[0_25px_50px_-12px_rgba(0,0,0,0.8)] overflow-hidden transform hover:scale-[1.005] transition-all duration-300 overflow-y-auto">
              {/* Enhanced Gradient Overlay */}
              <div className="absolute inset-0 bg-gradient-to-br from-blue-400/10 via-purple-500/5 to-indigo-500/10 dark:from-blue-600/10 dark:via-purple-700/5 dark:to-indigo-600/10 pointer-events-none" />

              {/* Top Shine Effect */}
              <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/40 to-transparent" />

              <div className="relative p-8 text-white/90 dark:text-slate-200">
                <div className="flex items-center justify-between mb-6 pb-6 border-b border-white/10 dark:border-slate-700/20">
                  <Dialog.Title className="text-2xl font-bold bg-gradient-to-r from-blue-300 via-purple-300 to-indigo-300 bg-clip-text text-transparent">
                    Message Details
                  </Dialog.Title>
                  <button
                    onClick={() => setViewMessageDetailsModal(false)}
                    className="w-10 h-10 rounded-xl bg-white/5 hover:bg-white/10 dark:bg-slate-700/20 dark:hover:bg-slate-600/30 text-white/80 hover:text-white transition-all duration-200 flex items-center justify-center backdrop-blur-sm border border-white/10 shadow-lg hover:shadow-xl"
                  >
                    <Lucide icon="X" className="w-5 h-5" />
                  </button>
                </div>{" "}
                {selectedMessageForView && (
                  <div className="space-y-6">
                    {/* Message Status */}
                    <div className="flex items-center justify-between p-6 bg-white/5 dark:bg-slate-700/20 backdrop-blur-xl rounded-2xl border border-white/10 dark:border-slate-600/20 shadow-inner">
                      <span className="text-lg font-medium text-white/90">
                        Status:
                      </span>
                      <span
                        className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-semibold backdrop-blur-sm border shadow-lg ${selectedMessageForView.status === "sent"
                          ? "bg-green-500/20 dark:bg-green-600/20 text-green-300 dark:text-green-200 border-green-400/30"
                          : selectedMessageForView.status === "failed"
                            ? "bg-red-500/20 dark:bg-red-600/20 text-red-300 dark:text-red-200 border-red-400/30"
                            : "bg-orange-500/20 dark:bg-orange-600/20 text-orange-300 dark:text-orange-200 border-orange-400/30"
                          }`}
                      >
                        {selectedMessageForView.status === "sent"
                          ? "Sent"
                          : selectedMessageForView.status === "failed"
                            ? "Failed"
                            : "Scheduled"}
                      </span>
                    </div>

                    {/* Main Message Content */}
                    <div>
                      <h3 className="text-lg font-semibold mb-4 text-white/90">
                        Message Content:
                      </h3>
                      <div className="p-6 bg-white/5 dark:bg-slate-700/20 backdrop-blur-xl rounded-2xl border border-white/10 dark:border-slate-600/20 shadow-inner">
                        <p className="whitespace-pre-wrap text-white/80 dark:text-slate-300">
                          {selectedMessageForView.messageContent ||
                            selectedMessageForView.message ||
                            "No content"}
                        </p>
                      </div>
                    </div>

                    {/* Additional Messages */}
                    {selectedMessageForView.messages &&
                      selectedMessageForView.messages.length > 0 && (
                        <div>
                          <h3 className="text-lg font-semibold mb-4 text-white/90">
                            Additional Messages:
                          </h3>
                          <div className="space-y-4">
                            {selectedMessageForView.messages.map(
                              (msg: any, index: number) => (
                                <div
                                  key={index}
                                  className="p-6 bg-white/5 dark:bg-slate-700/20 backdrop-blur-xl rounded-2xl border border-white/10 dark:border-slate-600/20 shadow-inner"
                                >
                                  <div className="flex justify-between items-start mb-3">
                                    <span className="text-sm font-medium text-white/80">
                                      Message {index + 1}:
                                    </span>
                                    {selectedMessageForView.messageDelays &&
                                      selectedMessageForView.messageDelays[
                                      index
                                      ] > 0 && (
                                        <span className="text-xs text-white/60 bg-white/10 px-2 py-1 rounded-lg">
                                          Delay:{" "}
                                          {
                                            selectedMessageForView
                                              .messageDelays[index]
                                          }{" "}
                                          seconds
                                        </span>
                                      )}
                                  </div>
                                  <p className="whitespace-pre-wrap text-white/80 dark:text-slate-300">
                                    {msg.text || msg.message || "No content"}
                                  </p>
                                </div>
                              )
                            )}
                          </div>
                        </div>
                      )}

                    {/* Schedule Information */}
                    <div>
                      <h3 className="text-lg font-semibold mb-4 text-white/90">
                        Schedule Information:
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="p-4 bg-white/5 dark:bg-slate-700/20 backdrop-blur-xl rounded-2xl border border-white/10 dark:border-slate-600/20 shadow-inner">
                          <span className="font-medium text-white/90">
                            Scheduled Time:
                          </span>
                          <p className="text-white/70 mt-1">
                            {selectedMessageForView.scheduledTime
                              ? new Date(
                                selectedMessageForView.scheduledTime
                              ).toLocaleString()
                              : "Not set"}
                          </p>
                        </div>
                        {selectedMessageForView.batchQuantity && (
                          <div className="p-4 bg-white/5 dark:bg-slate-700/20 backdrop-blur-xl rounded-2xl border border-white/10 dark:border-slate-600/20 shadow-inner">
                            <span className="font-medium text-white/90">
                              Batch Size:
                            </span>
                            <p className="text-white/70 mt-1">
                              {selectedMessageForView.batchQuantity}
                            </p>
                          </div>
                        )}
                        {selectedMessageForView.minDelay !== undefined && (
                          <div className="p-4 bg-white/5 dark:bg-slate-700/20 backdrop-blur-xl rounded-2xl border border-white/10 dark:border-slate-600/20 shadow-inner">
                            <span className="font-medium text-white/90">
                              Delay Range:
                            </span>
                            <p className="text-white/70 mt-1">
                              {selectedMessageForView.minDelay} -{" "}
                              {selectedMessageForView.maxDelay} seconds
                            </p>
                          </div>
                        )}
                        {selectedMessageForView.repeatInterval > 0 && (
                          <div className="p-4 bg-white/5 dark:bg-slate-700/20 backdrop-blur-xl rounded-2xl border border-white/10 dark:border-slate-600/20 shadow-inner">
                            <span className="font-medium text-white/90">
                              Repeat:
                            </span>
                            <p className="text-white/70 mt-1">
                              Every {selectedMessageForView.repeatInterval}{" "}
                              {selectedMessageForView.repeatUnit}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Recipients */}
                    <div>
                      <h3 className="text-lg font-semibold mb-4 text-white/90">
                        Recipients:
                      </h3>
                      <div className="p-6 bg-white/5 dark:bg-slate-700/20 backdrop-blur-xl rounded-2xl border border-white/10 dark:border-slate-600/20 shadow-inner">
                        {Array.isArray(selectedMessageForView.contactIds) &&
                          selectedMessageForView.contactIds.length > 0 ? (
                          <div className="flex flex-wrap gap-2">
                            {selectedMessageForView.contactIds.map(
                              (id: string, index: number) => {
                                const phoneNumber =
                                  id?.split("-")[1]?.replace(/\D/g, "") || "";
                                const contact = contacts.find(
                                  (c) =>
                                    c.phone?.replace(/\D/g, "") === phoneNumber
                                );
                                return (
                                  <span
                                    key={id}
                                    className="inline-flex items-center px-3 py-2 rounded-full text-xs font-medium bg-blue-500/20 text-blue-300 border border-blue-400/30 backdrop-blur-sm"
                                  >
                                    {contact?.contactName ||
                                      phoneNumber ||
                                      "Unknown"}
                                  </span>
                                );
                              }
                            )}
                          </div>
                        ) : selectedMessageForView.contactId ? (
                          (() => {
                            const phoneNumber =
                              selectedMessageForView.contactId
                                ?.split("-")[1]
                                ?.replace(/\D/g, "") || "";
                            const contact = contacts.find(
                              (c) => c.phone?.replace(/\D/g, "") === phoneNumber
                            );
                            return (
                              <span className="inline-flex items-center px-3 py-2 rounded-full text-xs font-medium bg-blue-500/20 text-blue-300 border border-blue-400/30 backdrop-blur-sm">
                                {contact?.contactName ||
                                  phoneNumber ||
                                  "Unknown"}
                              </span>
                            );
                          })()
                        ) : (
                          <p className="text-white/60">
                            No recipients specified
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Media and Documents */}
                    {(selectedMessageForView.mediaUrl ||
                      selectedMessageForView.documentUrl) && (
                        <div>
                          <h3 className="text-lg font-semibold mb-4 text-white/90">
                            Attachments:
                          </h3>
                          <div className="space-y-3">
                            {selectedMessageForView.mediaUrl && (
                              <div className="flex items-center p-4 bg-white/5 dark:bg-slate-700/20 backdrop-blur-xl rounded-2xl border border-white/10 dark:border-slate-600/20 shadow-inner">
                                <Lucide
                                  icon="Image"
                                  className="w-5 h-5 mr-3 text-green-400"
                                />
                                <span className="text-white/80">
                                  Media file attached
                                </span>
                              </div>
                            )}
                            {selectedMessageForView.documentUrl && (
                              <div className="flex items-center p-4 bg-white/5 dark:bg-slate-700/20 backdrop-blur-xl rounded-2xl border border-white/10 dark:border-slate-600/20 shadow-inner">
                                <Lucide
                                  icon="File"
                                  className="w-5 h-5 mr-3 text-blue-400"
                                />
                                <span className="text-white/80">
                                  {selectedMessageForView.fileName ||
                                    "Document attached"}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                    {/* Advanced Settings */}
                    {(selectedMessageForView.activateSleep ||
                      selectedMessageForView.activeHours ||
                      selectedMessageForView.infiniteLoop) && (
                        <div>
                          <h3 className="text-lg font-semibold mb-4 text-white/90">
                            Advanced Settings:
                          </h3>
                          <div className="space-y-4">
                            {selectedMessageForView.activateSleep && (
                              <div className="p-4 bg-white/5 dark:bg-slate-700/20 backdrop-blur-xl rounded-2xl border border-white/10 dark:border-slate-600/20 shadow-inner">
                                <div className="flex items-center mb-2">
                                  <Lucide
                                    icon="Moon"
                                    className="w-5 h-5 mr-3 text-purple-400"
                                  />
                                  <span className="font-medium text-white/90">
                                    Sleep Mode:
                                  </span>
                                </div>
                                <p className="text-sm text-white/70 ml-8">
                                  Sleep after{" "}
                                  {selectedMessageForView.sleepAfterMessages}{" "}
                                  messages for{" "}
                                  {selectedMessageForView.sleepDuration} minutes
                                </p>
                              </div>
                            )}
                            {selectedMessageForView.activeHours && (
                              <div className="p-4 bg-white/5 dark:bg-slate-700/20 backdrop-blur-xl rounded-2xl border border-white/10 dark:border-slate-600/20 shadow-inner">
                                <div className="flex items-center mb-2">
                                  <Lucide
                                    icon="Clock"
                                    className="w-5 h-5 mr-3 text-blue-400"
                                  />
                                  <span className="font-medium text-white/90">
                                    Active Hours:
                                  </span>
                                </div>
                                <p className="text-sm text-white/70 ml-8">
                                  {selectedMessageForView.activeHours.start} -{" "}
                                  {selectedMessageForView.activeHours.end}
                                </p>
                              </div>
                            )}
                            {selectedMessageForView.infiniteLoop && (
                              <div className="p-4 bg-orange-500/10 dark:bg-orange-600/10 backdrop-blur-xl rounded-2xl border border-orange-400/30 shadow-inner">
                                <div className="flex items-center text-orange-300 mb-2">
                                  <Lucide
                                    icon="RefreshCw"
                                    className="w-5 h-5 mr-3"
                                  />
                                  <span className="font-medium">
                                    Infinite Loop Enabled
                                  </span>
                                </div>
                                <p className="text-sm text-orange-200 ml-8">
                                  Messages will loop indefinitely
                                </p>
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                    {/* Action Buttons */}
                    <div className="flex justify-end space-x-3 pt-6 border-t border-white/10 dark:border-slate-700/20">
                      <button
                        onClick={() => {
                          if (
                            window.confirm(
                              "Are you sure you want to delete this scheduled message?"
                            )
                          ) {
                            handleDeleteScheduledMessage(
                              selectedMessageForView.id!
                            );
                            setViewMessageDetailsModal(false);
                          }
                        }}
                        className="px-6 py-3 bg-gradient-to-r from-red-500 to-pink-600 hover:from-red-600 hover:to-pink-700 text-white rounded-2xl transition-all duration-200 font-semibold shadow-lg shadow-red-500/25 hover:shadow-red-500/40 transform hover:scale-105 flex items-center"
                      >
                        <Lucide icon="Trash2" className="w-4 h-4 mr-2" />
                        Delete
                      </button>
                      <button
                        onClick={() => {
                          handleEditScheduledMessage(selectedMessageForView);
                          setViewMessageDetailsModal(false);
                        }}
                        className="px-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white rounded-2xl transition-all duration-200 font-semibold shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40 transform hover:scale-105 flex items-center"
                      >
                        <Lucide icon="PenTool" className="w-4 h-4 mr-2" />
                        Edit
                      </button>
                      <button
                        onClick={() => {
                          handleSendNow(selectedMessageForView);
                          setViewMessageDetailsModal(false);
                        }}
                        className="px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white rounded-2xl transition-all duration-200 font-semibold shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40 transform hover:scale-105 flex items-center"
                      >
                        <Lucide icon="Send" className="w-4 h-4 mr-2" />
                        Send Now
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </Dialog.Panel>
          </div>
        </Dialog>

        {/* Template Selector Modal for individual sends */}
        <TemplateSelectorModal
          isOpen={isTemplateSelectorOpen}
          onClose={() => {
            setIsTemplateSelectorOpen(false);
            setTemplateContactsToSend([]);
            setPendingMessageToSend(null);
          }}
          onSend={handleSendTemplate}
          companyId={companyId}
          phoneIndex={phoneIndex || 0}
          contactName=""
        />

        <ToastContainer
          position="top-right"
          autoClose={5000}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
        />
      </div>
    </>
  );
}

export default Main;