import _ from "lodash";
import fakerData from "@/utils/faker";
import Button from "@/components/Base/Button";
import Pagination from "@/components/Base/Pagination";
import { FormInput, FormSelect } from "@/components/Base/Form";
import Lucide from "@/components/Base/Lucide";
import { Menu } from "@/components/Base/Headless";
import axios from "axios";
import React, { useState, useEffect, useRef, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ToastContainer, toast } from 'react-toastify';
import ReactPaginate from 'react-paginate';
import ThemeSwitcher from "@/components/ThemeSwitcher";
import { Dialog } from "@headlessui/react";

// Configuration
const baseUrl = "https://bisnesgpt.jutateknologi.com"; // Your PostgreSQL server URL

// Types
interface Employee {
  id: string;
  name: string;
  role: string;
  group?: string;
  email?: string;
  assignedContacts?: number;
  employeeId?: string;
  phoneNumber?: string;
  phoneNames?: { [key: number]: string };
  imageUrl?: string;
}

interface ContactData {
  country?: string;
  firstName?: string | null;
  lastName?: string | null;
  name?: string | null;
  email?: string | null;
  phone?: string | null;
  address1?: string | null;
  city?: string | null;
  state?: string | null;
  postalCode?: string;
  website?: string | null;
  timezone?: string | null;
  dnd?: boolean;
  dndSettings?: any;
  inboundDndSettings?: any;
  tags?: string[];
  customFields?: any[];
  source?: string | null;
}

// Upload file function (you may need to implement this for your file upload service)
const uploadFile = async (file: File): Promise<string> => {
  const formData = new FormData();
  formData.append('file', file);

  try {
    const response = await fetch(`${baseUrl}/api/upload-media`, {
      method: 'POST',
      body: formData
    });

    if (!response.ok) {
      throw new Error('File upload failed');
    }

    const data = await response.json();
    return data.url;
  } catch (error) {
    console.error('Error uploading file:', error);
    throw error;
  }
};

function Main() {
  const [employeeList, setEmployeeList] = useState<Employee[]>([]);
  const [showAddUserButton, setShowAddUserButton] = useState(false);
  const [contactData, setContactData] = useState<ContactData>({});
  const [response, setResponse] = useState<string>('');
  const [qrCodeImage, setQrCodeImage] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDataLoaded, setIsDataLoaded] = useState<boolean>(false);
  const navigate = useNavigate();
  const [employeeIdToDelete, setEmployeeIdToDelete] = useState<string>('');
  const [currentUserEmail, setCurrentUserEmail] = useState<string | null>(null);
  const [role, setRole] = useState<string>("");
  const [phoneCount, setPhoneCount] = useState<number>(1);
  const [currentPage, setCurrentPage] = useState(0);
  const itemsPerPage = 21;
  const [companyId, setCompanyId] = useState<string>("");

  // Add new state variables for blast message
  const [blastMessageModal, setBlastMessageModal] = useState(false);
  const [blastMessage, setBlastMessage] = useState('');
  const [blastStartTime, setBlastStartTime] = useState<Date | null>(null);
  const [selectedEmployees, setSelectedEmployees] = useState<Employee[]>([]);
  const [isScheduling, setIsScheduling] = useState(false);
  const [messages, setMessages] = useState<Array<{ text: string; delayAfter: number }>>([{ text: '', delayAfter: 0 }]);
  const [batchQuantity, setBatchQuantity] = useState(10);
  const [repeatInterval, setRepeatInterval] = useState(0);
  const [repeatUnit, setRepeatUnit] = useState<'minutes' | 'hours' | 'days'>('days');
  const [minDelay, setMinDelay] = useState(0);
  const [maxDelay, setMaxDelay] = useState(0);
  const [activateSleep, setActivateSleep] = useState(false);
  const [sleepAfterMessages, setSleepAfterMessages] = useState<number | null>(null);
  const [sleepDuration, setSleepDuration] = useState<number | null>(null);
  const [activeTimeStart, setActiveTimeStart] = useState('09:00');
  const [activeTimeEnd, setActiveTimeEnd] = useState('17:00');
  const [infiniteLoop, setInfiniteLoop] = useState(false);
  const [selectedMedia, setSelectedMedia] = useState<File | null>(null);
  const [selectedDocument, setSelectedDocument] = useState<File | null>(null);

  const [groups, setGroups] = useState<string[]>([]);
  const [selectedGroup, setSelectedGroup] = useState<string>('');
  const [phoneNames, setPhoneNames] = useState<{ [key: number]: string }>({});
  const [companyData, setCompanyData] = useState<any>(null);

  const toggleModal = (id?: string) => {
    setIsModalOpen(!isModalOpen);
    setEmployeeIdToDelete(id!);
  };

  useEffect(() => {
    fetchUserContext();
  }, []);

  const fetchUserContext = async () => {
    try {
      setIsLoading(true);
      const userEmail = localStorage.getItem('userEmail');
      if (!userEmail) {
        toast.error("No user email found");
        return;
      }

      setCurrentUserEmail(userEmail);

      console.log('Fetching user context for email:', userEmail);

      // Fetch user context which includes user data, company data, and employees
      const response = await axios.get(`${baseUrl}/api/user-page-context?email=${encodeURIComponent(userEmail)}`);
      const data = response.data;

      console.log('User context data received:', data);

      // Set user data
      setRole(data.role);
      setCompanyId(data.companyId);
      setCurrentUserEmail(data.email);

      console.log('Setting companyId:', data.companyId);

      // Set company data
      setCompanyData(data.companyData);
      setPhoneCount(data.companyData.phoneCount || 1);
      setPhoneNames(data.phoneNames || {});

      // Set employees
      setEmployeeList(data.employees || []);

      // Filter employees based on role
      const filteredEmployees = data.role === "3"
        ? data.employees.filter((employee: Employee) => employee.email === userEmail)
        : data.employees;

      setEmployeeList(filteredEmployees);
      setShowAddUserButton(data.role === "1");

      // Fetch groups
      if (data.companyId) {
        await fetchGroups(data.companyId);
      }

      setIsDataLoaded(true);
      console.log('User context loaded successfully');

    } catch (error) {
      console.error('Error fetching user context:', error);
      toast.error("Failed to fetch user data");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchGroups = async (companyId: string) => {
    try {
      const response = await axios.get(`${baseUrl}/api/company-groups?companyId=${companyId}`);
      setGroups(response.data || []);
    } catch (error) {
      console.error('Error fetching groups:', error);
    }
  };

  // Update the updatePhoneName function to use API
  const updatePhoneName = async (index: number, name: string) => {
    try {
      // You'll need to implement this API endpoint in your server
      const response = await axios.put(`${baseUrl}/api/update-phone-name`, {
        companyId,
        phoneIndex: index,
        phoneName: name
      });

      if (response.data.success) {
        setPhoneNames(prev => ({ ...prev, [index]: name }));
        toast.success(`Phone ${index + 1} name updated successfully`);
      } else {
        throw new Error(response.data.message || 'Failed to update phone name');
      }
    } catch (error) {
      console.error('Error updating phone name:', error);
      toast.error('Failed to update phone name');
    }
  };

  const handleDeleteEmployee = async (employeeEmail: string) => {
    try {
      if (!employeeEmail) {
        throw new Error('Employee email not found');
      }

      if (!isDataLoaded) {
        throw new Error('Data is still loading. Please wait a moment and try again.');
      }

      if (!companyId) {
        throw new Error('Company ID not available. Please wait for data to load.');
      }

      setIsLoading(true);
      console.log('Attempting to delete employee:', { email: employeeEmail, companyId });

      // Delete user via API
      const response = await axios.delete(`${baseUrl}/api/delete-user`, {
        data: {
          email: employeeEmail,
          companyId: companyId
        }
      });

      if (response.data.success) {
        // Update UI
        const updatedEmployeeList = employeeList.filter(employee => employee.email !== employeeEmail);
        setEmployeeList(updatedEmployeeList);

        toast.success('Employee deleted successfully');
        toggleModal();
      } else {
        throw new Error(response.data.message || 'Failed to delete employee');
      }
    } catch (error) {
      console.error("Error deleting employee:", error);
      if (axios.isAxiosError(error)) {
        console.error('API Error details:', {
          status: error.response?.status,
          data: error.response?.data
        });
        toast.error(`Failed to delete employee: ${error.response?.data?.message || error.message}`);
      } else {
        toast.error('Failed to delete employee: ' + (error instanceof Error ? error.message : 'Unknown error'));
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handlePageChange = ({ selected }: { selected: number }) => {
    setCurrentPage(selected);
  };

  const [searchTerm, setSearchTerm] = useState("");

  const filteredEmployees = useMemo(() => {
    let filtered = employeeList;

    if (searchTerm.trim()) {
      const lowercaseSearchTerm = searchTerm.toLowerCase();
      filtered = filtered.filter(employee =>
        employee.name.toLowerCase().includes(lowercaseSearchTerm) ||
        employee.email?.toLowerCase().includes(lowercaseSearchTerm) ||
        employee.employeeId?.toLowerCase().includes(lowercaseSearchTerm) ||
        employee.phoneNumber?.toLowerCase().includes(lowercaseSearchTerm)
      );
    }

    if (selectedGroup) {
      filtered = filtered.filter(employee => employee.group === selectedGroup);
    }

    return filtered;
  }, [employeeList, searchTerm, selectedGroup]);

  const paginatedEmployees = filteredEmployees
    .sort((a, b) => {
      const roleOrder = { "1": 0, "2": 1, "3": 2, "4": 3, "5": 4 };
      return roleOrder[a.role as keyof typeof roleOrder] - roleOrder[b.role as keyof typeof roleOrder];
    })
    .slice(currentPage * itemsPerPage, (currentPage + 1) * itemsPerPage);

  const handleEmployeeSelection = (employee: Employee) => {
    setSelectedEmployees(prev => {
      const isSelected = prev.some(e => e.id === employee.id);
      if (isSelected) {
        return prev.filter(e => e.id !== employee.id);
      } else {
        return [...prev, employee];
      }
    });
  };

  const [phoneIndex, setPhoneIndex] = useState<number>(0);

  const sendBlastMessage = async () => {
    // Validation checks
    if (selectedEmployees.length === 0) {
      toast.error("No employees selected!");
      return;
    }

    if (!blastStartTime) {
      toast.error("Please select a start time for the blast message.");
      return;
    }

    if (messages.some(msg => !msg.text.trim())) {
      toast.error("Please fill in all message fields");
      return;
    }

    setIsScheduling(true);

    try {
      let mediaUrl = '';
      let documentUrl = '';
      let fileName = '';
      let mimeType = '';

      // Handle media and document uploads
      if (selectedMedia) {
        try {
          mediaUrl = await uploadFile(selectedMedia);
          mimeType = selectedMedia.type;
        } catch (error) {
          console.error('Error uploading media:', error);
          toast.error("Failed to upload media file");
          return;
        }
      }

      if (selectedDocument) {
        try {
          documentUrl = await uploadFile(selectedDocument);
          fileName = selectedDocument.name;
          mimeType = selectedDocument.type;
        } catch (error) {
          console.error('Error uploading document:', error);
          toast.error("Failed to upload document");
          return;
        }
      }

      // Process employee phone numbers
      const chatIds = selectedEmployees
        .map(employee => employee.phoneNumber)
        .filter((phone): phone is string => phone !== undefined && phone !== null)
        .map(phone => phone.replace(/\D/g, '') + "@c.us");

      const allMessages = [];

      // Add first message to the array
      if (messages.length > 0 && messages[0].text.trim()) {
        allMessages.push({
          text: messages[0].text,
          isMain: true,
          delayAfter: 0
        });
      }

      // Add additional messages
      if (messages.length > 1) {
        messages.slice(1).forEach((msg, idx) => {
          if (msg.text.trim()) {
            allMessages.push({
              text: msg.text,
              isMain: false,
              delayAfter: msg.delayAfter || 0
            });
          }
        });
      }

      const scheduledMessageData = {
        chatIds,
        phoneIndex: 0, // Default phone index
        messages: allMessages,
        messageDelays: messages.slice(1).map(msg => msg.delayAfter),
        batchQuantity,
        companyId,
        createdAt: new Date().toISOString(),
        repeatInterval,
        repeatUnit,
        scheduledTime: blastStartTime.toISOString(),
        status: "scheduled",
        v2: companyData?.v2 || false,
        whapiToken: companyData?.whapiToken || '',
        minDelay,
        maxDelay,
        activateSleep,
        sleepAfterMessages: activateSleep ? sleepAfterMessages : null,
        sleepDuration: activateSleep ? sleepDuration : null,
        activeHours: {
          start: activeTimeStart,
          end: activeTimeEnd
        },
        infiniteLoop,
        numberOfBatches: 1,
        isConsolidated: true,
        recipients: selectedEmployees.map(emp => ({
          name: emp.name,
          phone: emp.phoneNumber
        }))
      };

      // If there's media, send it first
      if (mediaUrl || documentUrl) {
        const mediaScheduledTime = new Date(blastStartTime);
        mediaScheduledTime.setMinutes(mediaScheduledTime.getMinutes() - 1);

        const mediaMessageData = {
          ...scheduledMessageData,
          mediaUrl,
          documentUrl,
          fileName,
          mimeType,
          message: '',
          scheduledTime: mediaScheduledTime.toISOString(),
          messages: [],
          messageDelays: [],
        };

        try {
          const mediaResponse = await axios.post(`${baseUrl}/api/schedule-message/${companyId}`, mediaMessageData);
          if (!mediaResponse.data.success) {
            throw new Error(mediaResponse.data.message || "Failed to schedule media message");
          }
        } catch (error) {
          console.error('Error scheduling media message:', error);
          if (axios.isAxiosError(error) && error.response?.data) {
            console.error('Server error details:', error.response.data);
          }
          throw error;
        }
      }

      // Schedule the text messages
      const response = await axios.post(`${baseUrl}/api/schedule-message/${companyId}`, scheduledMessageData);

      if (response.data.success) {
        toast.success(`Blast messages scheduled successfully for ${selectedEmployees.length} employees.`);
        toast.info(`Messages will be sent at: ${blastStartTime.toLocaleString()} (local time)`);

        // Reset form and close modal
        setBlastMessageModal(false);
        setBlastMessage("");
        setBlastStartTime(null);
        setSelectedEmployees([]);
        setMessages([{ text: '', delayAfter: 0 }]);
        setBatchQuantity(10);
        setRepeatInterval(0);
        setRepeatUnit('days');
        setSelectedMedia(null);
        setSelectedDocument(null);
      } else {
        toast.error(response.data.message || "Failed to schedule messages");
      }

    } catch (error) {
      console.error('Error scheduling blast messages:', error);
      if (axios.isAxiosError(error) && error.response) {
        const errorMessage = error.response.data.error || 'Unknown server error';
        toast.error(`Failed to schedule message: ${errorMessage}`);
      } else {
        toast.error("An unexpected error occurred while scheduling blast messages.");
      }
    } finally {
      setIsScheduling(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#f8fafc]">
      {/* Header Section */}
      <div className="sticky top-0 z-40 bg-white border-b-4 border-[#4b4b4b] shadow-[0_4px_0_rgba(75,75,75,0.1)]">
        <div className="px-6 py-5">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex items-center space-x-4">
              <h2 className="text-2xl font-black text-[#4b4b4b] uppercase tracking-wider">Users Directory</h2>
              <div className="px-3 py-1 bg-white border-2 border-[#4b4b4b] shadow-[2px_2px_0_#f26522]">
                <span className="text-xs font-black text-[#4b4b4b] uppercase tracking-wider">
                  {employeeList.length} Users
                </span>
              </div>
            </div>
            <div className="flex items-center flex-wrap gap-4">
              <div className="relative w-full md:w-auto">
                <FormInput
                  type="text"
                  className="w-full md:w-72 pl-10 pr-4 py-2 bg-white border-2 border-[#4b4b4b] text-[#4b4b4b] placeholder-[#4b4b4b] font-bold text-xs uppercase tracking-wider focus:ring-0 focus:border-[#f26522] shadow-[inset_2px_2px_0_rgba(0,0,0,0.05)] transition-colors"
                  placeholder="SEARCH USERS..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <Lucide
                  icon="Search"
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-[#4b4b4b] stroke-[3]"
                />
              </div>
              <ThemeSwitcher />
              <div className="flex items-center px-4 py-2 bg-white border-2 border-[#4b4b4b] shadow-[2px_2px_0_#4b4b4b]">
                <Lucide icon="User" className="w-4 h-4 mr-2 text-[#4b4b4b] stroke-[3]" />
                <span className="text-xs font-black text-[#4b4b4b] uppercase tracking-wider truncate max-w-[120px]">
                  {currentUserEmail && currentUserEmail.split('@')[0]}
                </span>
              </div>
            </div>
          </div>

          {/* Controls Section */}
          <div className="flex items-center justify-between mt-6 pb-2 border-b-4 border-[#4b4b4b] border-dashed">
            <div className="flex items-center flex-wrap gap-3">
              <Link to="settings">
                <Button variant="primary" className="bg-white border-2 border-[#4b4b4b] text-[#4b4b4b] font-black uppercase tracking-wider text-xs px-4 py-2 shadow-[2px_2px_0_#4b4b4b] hover:-translate-y-0.5 hover:-translate-x-0.5 hover:shadow-[4px_4px_0_#4b4b4b] transition-all">
                  <Lucide icon="Settings" className="w-4 h-4 mr-2 stroke-[3]" />
                  Settings
                </Button>
              </Link>
              {role === "1" && (
                <Button
                  variant="primary"
                  onClick={() => setBlastMessageModal(true)}
                  className="bg-[#f26522] border-2 border-[#4b4b4b] text-white font-black uppercase tracking-wider text-xs px-4 py-2 shadow-[2px_2px_0_#4b4b4b] hover:-translate-y-0.5 hover:-translate-x-0.5 hover:shadow-[4px_4px_0_#4b4b4b] transition-all"
                >
                  <Lucide icon="Send" className="w-4 h-4 mr-2 stroke-[3]" />
                  Send Blast Message
                </Button>
              )}
              <Menu>
                <Menu.Button as={Button} variant="outline-secondary" className="bg-white border-2 border-[#4b4b4b] text-[#4b4b4b] font-black uppercase tracking-wider text-xs px-4 py-2 shadow-[2px_2px_0_#4b4b4b] hover:-translate-y-0.5 hover:-translate-x-0.5 hover:shadow-[4px_4px_0_#4b4b4b] transition-all">
                  <Lucide icon="Users" className="w-4 h-4 mr-2 stroke-[3]" />
                  {selectedGroup || "All Groups"}
                  <Lucide icon="ChevronDown" className="w-4 h-4 ml-2 stroke-[3]" />
                </Menu.Button>
                <Menu.Items className="absolute z-50 mt-2 w-56 bg-white border-4 border-[#4b4b4b] shadow-[6px_6px_0_#f26522] rounded-none focus:outline-none">
                  <div className="py-1">
                    <Menu.Item>
                      {({ active }) => (
                        <button
                          onClick={() => setSelectedGroup('')}
                          className={`${active ? 'bg-[#f26522] text-white' : 'text-[#4b4b4b]'
                            } flex items-center w-full px-4 py-3 text-xs font-black uppercase tracking-wider border-b-2 border-gray-100 last:border-b-0`}
                        >
                          <Lucide icon="Users" className="w-4 h-4 mr-2 stroke-[3]" />
                          All Groups
                        </button>
                      )}
                    </Menu.Item>
                    {groups.map(group => (
                      <Menu.Item key={group}>
                        {({ active }) => (
                          <button
                            onClick={() => setSelectedGroup(group)}
                            className={`${active ? 'bg-[#f26522] text-white' : 'text-[#4b4b4b]'
                              } flex items-center w-full px-4 py-3 text-xs font-black uppercase tracking-wider border-b-2 border-gray-100 last:border-b-0`}
                          >
                            <Lucide icon="Users" className="w-4 h-4 mr-2 stroke-[3]" />
                            {group}
                          </button>
                        )}
                      </Menu.Item>
                    ))}
                  </div>
                </Menu.Items>
              </Menu>
            </div>
            <div className="flex items-center space-x-4">
              {phoneCount >= 2 && (
                <Menu>
                  <Menu.Button as={Button} variant="outline-secondary" className="bg-white border-2 border-[#4b4b4b] text-[#4b4b4b] font-black uppercase tracking-wider text-xs px-4 py-2 shadow-[2px_2px_0_#4b4b4b] hover:-translate-y-0.5 hover:-translate-x-0.5 hover:shadow-[4px_4px_0_#4b4b4b] transition-all">
                    <Lucide icon="Phone" className="w-4 h-4 mr-2 stroke-[3]" />
                    Phone Names
                    <Lucide icon="ChevronDown" className="w-4 h-4 ml-2 stroke-[3]" />
                  </Menu.Button>
                  <Menu.Items className="absolute right-0 z-50 mt-2 w-80 bg-white border-4 border-[#4b4b4b] shadow-[6px_6px_0_#3b82f6] rounded-none focus:outline-none">
                    <div className="p-2">
                      {Object.entries(phoneNames).map(([index, phoneName]) => (
                        <Menu.Item key={index}>
                          {({ active }) => (
                            <div className={`${active ? 'bg-gray-100' : ''
                              } px-4 py-3 border-b-2 border-[#4b4b4b] last:border-b-0 flex items-center justify-between group transition-colors`}>
                              <div className="flex flex-col">
                                <span className="font-black text-[#4b4b4b] uppercase tracking-wider text-sm">
                                  {companyData?.[`phone${index}`] || `Phone ${index}`}
                                </span>
                                <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                                  {phoneName || `Phone ${index}`}
                                </span>
                              </div>
                              <button
                                onClick={() => {
                                  const newName = prompt(`Enter new name for ${phoneName || `Phone ${index}`}`, phoneName);
                                  if (newName) updatePhoneName(parseInt(index), newName);
                                }}
                                className="p-2 bg-white border-2 border-[#4b4b4b] text-[#f26522] shadow-[2px_2px_0_#4b4b4b] hover:translate-y-0.5 hover:translate-x-0.5 hover:shadow-none transition-all"
                              >
                                <Lucide icon="Pencil" className="w-4 h-4 stroke-[3]" />
                              </button>
                            </div>
                          )}
                        </Menu.Item>
                      ))}
                    </div>
                  </Menu.Items>
                </Menu>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Loading Indicator */}
      {isLoading && !isDataLoaded && (
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-[#4b4b4b] border-t-transparent animate-spin mx-auto mb-4 shadow-[2px_2px_0_#f26522]"></div>
            <p className="text-sm font-black text-[#4b4b4b] uppercase tracking-wider">Loading user data...</p>
          </div>
        </div>
      )}

      {/* Main Content */}
      {isDataLoaded && (
        <div className="flex-1 px-6 py-8 relative">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 relative z-10">
            {paginatedEmployees.map((employee, index) => (
              <div
                key={index}
                className="bg-white border-4 border-[#4b4b4b] shadow-[4px_4px_0_#f26522] hover:-translate-y-1 hover:-translate-x-1 hover:shadow-[8px_8px_0_#f26522] transition-all duration-300 flex flex-col"
              >
                <div className="p-5 flex-1 flex flex-col">
                  <div className="flex items-start gap-4">
                    {employee.imageUrl ? (
                      <div className="w-16 h-16 border-4 border-[#4b4b4b] shadow-[2px_2px_0_#4b4b4b] overflow-hidden flex-shrink-0">
                        <img
                          src={employee.imageUrl}
                          alt={employee.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ) : (
                      <div className="w-16 h-16 bg-[#f26522] text-white border-4 border-[#4b4b4b] shadow-[2px_2px_0_#4b4b4b] flex items-center justify-center flex-shrink-0">
                        <Lucide icon="User" className="w-8 h-8 stroke-[3]" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <h3 className="text-base font-black text-[#4b4b4b] uppercase tracking-wider truncate mb-1">
                        {employee.name}
                      </h3>
                      <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider truncate mb-2">
                        {employee.email}
                      </p>
                      <div className="flex items-center flex-wrap gap-2">
                        <span className={`inline-flex items-center px-2 py-1 text-[10px] font-black uppercase tracking-wider border-2 border-[#4b4b4b] shadow-[1px_1px_0_#4b4b4b] ${employee.role === "1" ? 'bg-[#c084fc] text-white' :
                          employee.role === "2" ? 'bg-[#3b82f6] text-white' :
                            employee.role === "3" ? 'bg-[#10b981] text-white' :
                              employee.role === "4" ? 'bg-[#eab308] text-[#4b4b4b]' :
                                'bg-gray-200 text-[#4b4b4b]'
                          }`}>
                          {employee.role === "1" ? 'Admin' :
                            employee.role === "2" ? 'Sales' :
                              employee.role === "3" ? 'Observer' :
                                employee.role === "4" ? 'Manager' :
                                  employee.role === "5" ? 'Supervisor' : 'Other'}
                        </span>
                      </div>
                    </div>
                    <div className="flex flex-col space-y-2 border-l-2 border-[#4b4b4b] pl-4 border-dashed">
                      {(role === "1" || (role !== "1" && employee.email === currentUserEmail)) && (
                        <button
                          onClick={() => navigate(`crud-form`, { state: { contactId: employee.email, contact: { ...employee, id: employee.email }, companyId: companyId || '' } })}
                          className="p-2 bg-white border-2 border-[#4b4b4b] text-[#f26522] shadow-[2px_2px_0_#4b4b4b] hover:-translate-y-0.5 hover:-translate-x-0.5 hover:shadow-[3px_3px_0_#4b4b4b] transition-all duration-200"
                          aria-label="Edit"
                        >
                          <Lucide icon="Pencil" className="w-4 h-4 stroke-[3]" />
                        </button>
                      )}
                      {role === "1" && (
                        <button
                          onClick={() => toggleModal(employee.email)}
                          className="p-2 bg-white border-2 border-[#4b4b4b] text-red-500 shadow-[2px_2px_0_#4b4b4b] hover:-translate-y-0.5 hover:-translate-x-0.5 hover:shadow-[3px_3px_0_#4b4b4b] transition-all duration-200 mt-2"
                          aria-label="Delete"
                        >
                          <Lucide icon="Trash" className="w-4 h-4 stroke-[3]" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          <div className="mt-10 flex justify-center relative z-10 block">
            <ReactPaginate
              breakLabel={<span className="font-black text-[#4b4b4b] tracking-wider px-2 block">...</span>}
              nextLabel={<div className="flex items-center text-xs font-black uppercase tracking-wider block">Next <Lucide icon="ChevronRight" className="w-4 h-4 ml-1 stroke-[3] block" /></div>}
              previousLabel={<div className="flex items-center text-xs font-black uppercase tracking-wider block"><Lucide icon="ChevronLeft" className="w-4 h-4 mr-1 stroke-[3] block" /> Prev</div>}
              onPageChange={handlePageChange}
              pageRangeDisplayed={3}
              marginPagesDisplayed={1}
              pageCount={Math.ceil(filteredEmployees.length / itemsPerPage)}
              renderOnZeroPageCount={null}
              containerClassName="flex justify-center flex-wrap items-center gap-2 bg-white border-4 border-[#4b4b4b] shadow-[4px_4px_0_#f26522] p-3 block"
              pageClassName="inline-flex block"
              pageLinkClassName="inline-flex items-center justify-center min-w-[32px] h-8 px-2 bg-white border-2 border-[#4b4b4b] text-[#4b4b4b] hover:-translate-y-0.5 hover:-translate-x-0.5 hover:shadow-[2px_2px_0_#4b4b4b] text-xs font-black transition-all block"
              previousClassName="inline-flex block"
              nextClassName="inline-flex block"
              previousLinkClassName="inline-flex items-center px-4 py-2 bg-white border-2 border-[#4b4b4b] text-[#4b4b4b] hover:-translate-y-0.5 hover:-translate-x-0.5 hover:shadow-[2px_2px_0_#4b4b4b] text-xs font-black transition-all disabled:opacity-50 disabled:cursor-not-allowed block"
              nextLinkClassName="inline-flex items-center px-4 py-2 bg-white border-2 border-[#4b4b4b] text-[#4b4b4b] hover:-translate-y-0.5 hover:-translate-x-0.5 hover:shadow-[2px_2px_0_#4b4b4b] text-xs font-black transition-all disabled:opacity-50 disabled:cursor-not-allowed block"
              disabledClassName="opacity-50 cursor-not-allowed block"
              activeClassName="font-bold block"
              activeLinkClassName="!bg-[#f26522] !text-white shadow-[2px_2px_0_#4b4b4b]"
              breakClassName="flex items-center justify-center block"
            />
          </div>
        </div>
      )}

      {/* Rest of the modals remain unchanged */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="fixed inset-0 bg-[#4b4b4b] opacity-80" onClick={() => toggleModal()}></div>
          <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
            <div className="relative transform overflow-hidden bg-white border-4 border-[#4b4b4b] shadow-[8px_8px_0_#f26522] text-left transition-all sm:my-8 sm:w-full sm:max-w-lg">
              <div className="bg-white px-4 pb-4 pt-5 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                  <div className="mx-auto flex h-12 w-12 flex-shrink-0 items-center justify-center bg-red-100 border-4 border-[#4b4b4b] shadow-[2px_2px_0_#4b4b4b] sm:mx-0 sm:h-10 sm:w-10">
                    <Lucide icon="AlertTriangle" className="h-6 w-6 text-red-600 stroke-[3]" aria-hidden="true" />
                  </div>
                  <div className="mt-3 text-center sm:ml-4 sm:mt-0 sm:text-left">
                    <h3 className="text-xl font-black text-[#4b4b4b] uppercase tracking-wider">
                      Delete User
                    </h3>
                    <div className="mt-2 text-left">
                      <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                        Are you sure you want to delete this user? This action cannot be undone.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6 border-t-4 border-[#4b4b4b]">
                <button
                  type="button"
                  onClick={() => handleDeleteEmployee(employeeIdToDelete)}
                  disabled={!isDataLoaded || isLoading}
                  className={`inline-flex w-full justify-center px-4 py-2 text-xs font-black uppercase tracking-wider text-white border-2 border-[#4b4b4b] shadow-[2px_2px_0_#4b4b4b] hover:translate-y-0.5 hover:translate-x-0.5 hover:shadow-none transition-all sm:ml-3 sm:w-auto ${!isDataLoaded || isLoading
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-red-500'
                    }`}
                >
                  {isLoading ? 'Deleting...' : 'Delete'}
                </button>
                <button
                  type="button"
                  onClick={() => toggleModal()}
                  className="mt-3 inline-flex w-full justify-center px-4 py-2 text-xs font-black uppercase tracking-wider text-[#4b4b4b] bg-white border-2 border-[#4b4b4b] shadow-[2px_2px_0_#4b4b4b] hover:translate-y-0.5 hover:translate-x-0.5 hover:shadow-none transition-all sm:mt-0 sm:w-auto"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <Dialog open={blastMessageModal} onClose={() => setBlastMessageModal(false)} className="relative z-50">
        <div className="fixed inset-0 bg-[#4b4b4b] opacity-80" aria-hidden="true" />
        <div className="fixed inset-0 flex items-center justify-center p-4">
          <Dialog.Panel className="w-full max-w-2xl transform overflow-hidden bg-white border-4 border-[#4b4b4b] shadow-[8px_8px_0_#f26522] p-6 sm:p-8 text-left transition-all max-h-[90vh] overflow-y-auto">
            <Dialog.Title className="text-xl sm:text-2xl font-black text-[#4b4b4b] uppercase tracking-wider mb-6 border-b-4 border-[#4b4b4b] pb-4">
              Send Blast Message to Employees
            </Dialog.Title>

            {/* Employee Selection */}
            <div className="mb-6">
              <label className="block text-sm font-black text-[#4b4b4b] uppercase tracking-wider mb-2">
                Select Employees
              </label>
              <div className="max-h-40 overflow-y-auto bg-white border-4 border-[#4b4b4b] shadow-[inset_2px_2px_0_rgba(0,0,0,0.1)] p-3">
                {employeeList.map((employee) => (
                  <div key={employee.id} className="flex items-center space-x-3 mb-3 last:mb-0">
                    <input
                      type="checkbox"
                      checked={selectedEmployees.some(e => e.id === employee.id)}
                      onChange={() => handleEmployeeSelection(employee)}
                      className="w-5 h-5 rounded-none border-2 border-[#4b4b4b] text-[#f26522] focus:ring-0 focus:ring-offset-0 cursor-pointer"
                    />
                    <span className="text-sm font-bold text-[#4b4b4b]">{employee.name}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Messages Section */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-black text-[#4b4b4b] uppercase tracking-wider">Messages</label>
                <button
                  type="button"
                  className="bg-white border-2 border-[#4b4b4b] text-[#f26522] font-black uppercase tracking-wider text-[10px] px-3 py-1.5 shadow-[2px_2px_0_#4b4b4b] hover:-translate-y-0.5 hover:-translate-x-0.5 hover:shadow-[3px_3px_0_#4b4b4b] transition-all"
                  onClick={() => setMessages([...messages, { text: '', delayAfter: 0 }])}
                >
                  Add Message
                </button>
              </div>
              <div className="space-y-4">
                {messages.map((msg, index) => (
                  <div key={index} className="p-4 bg-[#f8fafc] border-4 border-[#4b4b4b]">
                    <textarea
                      className="w-full p-3 bg-white border-2 border-[#4b4b4b] text-[#4b4b4b] font-medium text-sm focus:ring-0 focus:border-[#f26522] shadow-[inset_2px_2px_0_rgba(0,0,0,0.05)] resize-y min-h-[80px]"
                      placeholder={`Message ${index + 1}...`}
                      value={msg.text}
                      onChange={(e) => {
                        const newMessages = [...messages];
                        newMessages[index].text = e.target.value;
                        setMessages(newMessages);
                      }}
                    />
                    {index > 0 && (
                      <div className="mt-3 flex items-center flex-wrap gap-2">
                        <label className="text-xs font-black text-[#4b4b4b] uppercase tracking-wider whitespace-nowrap">Delay after:</label>
                        <div className="flex items-center whitespace-nowrap">
                          <input
                            type="number"
                            value={msg.delayAfter}
                            onChange={(e) => {
                              const newMessages = [...messages];
                              newMessages[index].delayAfter = parseInt(e.target.value) || 0;
                              setMessages(newMessages);
                            }}
                            className="w-20 px-2 py-1.5 text-center bg-white border-y-2 border-l-2 border-[#4b4b4b] text-[#4b4b4b] font-black text-sm focus:ring-0 focus:border-[#4b4b4b] shadow-[inset_2px_2px_0_rgba(0,0,0,0.05)]"
                            min="0"
                          />
                          <span className="bg-gray-200 border-2 border-[#4b4b4b] px-3 py-1.5 text-xs font-black text-[#4b4b4b] uppercase tracking-wider shadow-[inset_2px_2px_0_rgba(0,0,0,0.05)]">sec</span>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Schedule Time & Batch Settings */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6">
              <div>
                <label className="block text-sm font-black text-[#4b4b4b] uppercase tracking-wider mb-2">
                  Schedule Time
                </label>
                <input
                  type="datetime-local"
                  onChange={(e) => setBlastStartTime(new Date(e.target.value))}
                  className="w-full p-2.5 bg-white border-2 border-[#4b4b4b] text-[#4b4b4b] font-bold text-sm focus:ring-0 focus:border-[#f26522] shadow-[inset_2px_2px_0_rgba(0,0,0,0.05)]"
                />
              </div>
              <div>
                <label className="block text-sm font-black text-[#4b4b4b] uppercase tracking-wider mb-2">
                  Batch Settings
                </label>
                <div className="flex items-center">
                  <input
                    type="number"
                    value={batchQuantity}
                    onChange={(e) => setBatchQuantity(parseInt(e.target.value) || 1)}
                    className="w-16 sm:w-20 p-2.5 text-center bg-white border-y-2 border-l-2 border-[#4b4b4b] text-[#4b4b4b] font-black text-sm focus:ring-0 focus:border-[#4b4b4b] shadow-[inset_2px_2px_0_rgba(0,0,0,0.05)]"
                    min="1"
                  />
                  <span className="flex-1 bg-gray-200 border-2 border-[#4b4b4b] px-3 py-2.5 text-[10px] sm:text-xs font-black text-[#4b4b4b] uppercase tracking-wider shadow-[inset_2px_2px_0_rgba(0,0,0,0.05)] whitespace-nowrap">msg/batch</span>
                </div>
              </div>
            </div>

            {/* Media Upload */}
            <div className="mb-6 p-5 border-4 border-[#4b4b4b] bg-yellow-50">
              <label className="block text-sm font-black text-[#4b4b4b] uppercase tracking-wider mb-4 border-b-2 border-[#4b4b4b] pb-2">
                Attachments
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className="block text-[10px] sm:text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Media</label>
                  <div className="relative">
                    <input
                      type="file"
                      onChange={(e) => setSelectedMedia(e.target.files?.[0] || null)}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      accept="image/*,video/*"
                    />
                    <div className="bg-[#f26522] text-white border-2 border-[#4b4b4b] px-4 py-2 text-xs font-black uppercase tracking-wider shadow-[2px_2px_0_#4b4b4b] text-center pointer-events-none w-full truncate">
                      {selectedMedia ? selectedMedia.name : "CHOOSE IMAGE/VIDEO"}
                    </div>
                  </div>
                </div>
                <div>
                  <label className="block text-[10px] sm:text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Document</label>
                  <div className="relative">
                    <input
                      type="file"
                      onChange={(e) => setSelectedDocument(e.target.files?.[0] || null)}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      accept=".pdf,.doc,.docx,.txt"
                    />
                    <div className="bg-[#3b82f6] text-white border-2 border-[#4b4b4b] px-4 py-2 text-xs font-black uppercase tracking-wider shadow-[2px_2px_0_#4b4b4b] text-center pointer-events-none w-full truncate">
                      {selectedDocument ? selectedDocument.name : "CHOOSE DOCUMENT"}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Sleep Settings & Active Hours & Infinite Loop */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div className="p-4 border-4 border-[#4b4b4b] bg-indigo-50">
                <label className="flex items-center space-x-3 mb-4 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={activateSleep}
                    onChange={(e) => setActivateSleep(e.target.checked)}
                    className="w-5 h-5 rounded-none border-2 border-[#4b4b4b] text-indigo-600 focus:ring-0 focus:ring-offset-0"
                  />
                  <span className="text-sm font-black text-[#4b4b4b] uppercase tracking-wider leading-none">
                    Sleep Mode
                  </span>
                </label>
                {activateSleep && (
                  <div className="space-y-3 pt-3 border-t-2 border-[#4b4b4b] border-dashed">
                    <div className="flex items-center justify-between gap-2">
                      <label className="text-[10px] font-bold text-gray-600 uppercase tracking-wider whitespace-nowrap">Sleep after:</label>
                      <div className="flex items-center">
                        <input
                          type="number"
                          value={sleepAfterMessages || ''}
                          onChange={(e) => setSleepAfterMessages(parseInt(e.target.value) || null)}
                          className="w-14 sm:w-16 p-1 text-center bg-white border-y-2 border-l-2 border-[#4b4b4b] text-[#4b4b4b] font-black text-sm focus:ring-0 shadow-[inset_1px_1px_0_rgba(0,0,0,0.05)]"
                          min="1"
                        />
                        <span className="bg-gray-200 border-2 border-[#4b4b4b] px-2 py-1 text-[10px] font-black text-[#4b4b4b] uppercase tracking-wider">msgs</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between gap-2">
                      <label className="text-[10px] font-bold text-gray-600 uppercase tracking-wider whitespace-nowrap">Duration:</label>
                      <div className="flex items-center">
                        <input
                          type="number"
                          value={sleepDuration || ''}
                          onChange={(e) => setSleepDuration(parseInt(e.target.value) || null)}
                          className="w-14 sm:w-16 p-1 text-center bg-white border-y-2 border-l-2 border-[#4b4b4b] text-[#4b4b4b] font-black text-sm focus:ring-0 shadow-[inset_1px_1px_0_rgba(0,0,0,0.05)]"
                          min="1"
                        />
                        <span className="bg-gray-200 border-2 border-[#4b4b4b] px-2 py-1 text-[10px] font-black text-[#4b4b4b] uppercase tracking-wider">sec</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
              <div className="space-y-4">
                <div className="p-4 border-4 border-[#4b4b4b] bg-pink-50">
                  <label className="block text-sm font-black text-[#4b4b4b] uppercase tracking-wider mb-4 border-b-2 border-[#4b4b4b] pb-2">
                    Active Hours
                  </label>
                  <div className="flex items-center space-x-2 sm:space-x-4">
                    <div className="flex-1">
                      <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">Start</label>
                      <input
                        type="time"
                        value={activeTimeStart}
                        onChange={(e) => setActiveTimeStart(e.target.value)}
                        className="w-full px-1 sm:px-2 py-1.5 bg-white border-2 border-[#4b4b4b] text-[#4b4b4b] font-bold text-xs sm:text-sm focus:ring-0"
                      />
                    </div>
                    <div className="flex-1">
                      <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">End</label>
                      <input
                        type="time"
                        value={activeTimeEnd}
                        onChange={(e) => setActiveTimeEnd(e.target.value)}
                        className="w-full px-1 sm:px-2 py-1.5 bg-white border-2 border-[#4b4b4b] text-[#4b4b4b] font-bold text-xs sm:text-sm focus:ring-0"
                      />
                    </div>
                  </div>
                </div>
                <div className="p-3 border-4 border-[#4b4b4b] bg-white flex items-center justify-center hover:bg-gray-50 transition-colors">
                  <label className="flex items-center space-x-3 cursor-pointer w-full justify-center">
                    <input
                      type="checkbox"
                      checked={infiniteLoop}
                      onChange={(e) => setInfiniteLoop(e.target.checked)}
                      className="w-5 h-5 rounded-none border-2 border-[#4b4b4b] text-[#10b981] focus:ring-0 focus:ring-offset-0 cursor-pointer text-center"
                    />
                    <span className="text-sm font-black text-[#4b4b4b] uppercase tracking-wider leading-none">
                      Infinite Loop
                    </span>
                  </label>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="mt-8 pt-6 border-t-4 border-[#4b4b4b] flex flex-col sm:flex-row justify-end gap-3 sm:gap-4">
              <button
                type="button"
                onClick={() => setBlastMessageModal(false)}
                className="w-full sm:w-auto bg-white border-2 border-[#4b4b4b] text-[#4b4b4b] font-black uppercase tracking-wider text-xs px-6 py-2.5 shadow-[2px_2px_0_#4b4b4b] hover:-translate-y-0.5 hover:-translate-x-0.5 hover:shadow-[3px_3px_0_#4b4b4b] transition-all order-2 sm:order-1 text-center"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={sendBlastMessage}
                disabled={isScheduling}
                className="w-full sm:w-auto bg-[#10b981] border-2 border-[#4b4b4b] text-white font-black uppercase tracking-wider text-xs px-6 py-2.5 shadow-[2px_2px_0_#4b4b4b] hover:-translate-y-0.5 hover:-translate-x-0.5 hover:shadow-[3px_3px_0_#4b4b4b] transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:hover:translate-x-0 disabled:hover:shadow-[2px_2px_0_#4b4b4b] order-1 sm:order-2 text-center"
              >
                {isScheduling ? "Scheduling..." : "Schedule Message"}
              </button>
            </div>
          </Dialog.Panel>
        </div>
      </Dialog>
    </div>
  );
}

export default Main;