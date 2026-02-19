import React, { useState, useEffect, useCallback } from "react";
import Lucide from "@/components/Base/Lucide";
import Button from "@/components/Base/Button";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Dialog } from "@/components/Base/Headless";
import LoadingIcon from "@/components/Base/LoadingIcon";

interface TemplateComponent {
  type: string;
  format?: string;
  text?: string;
  example?: any;
  buttons?: Array<{
    type: string;
    text: string;
    url?: string;
    phone_number?: string;
  }>;
}

interface MessageTemplate {
  id: string;
  name: string;
  language: string;
  status: 'APPROVED' | 'PENDING' | 'REJECTED';
  category: 'MARKETING' | 'UTILITY' | 'AUTHENTICATION';
  components: TemplateComponent[];
  syncedAt?: string;
}

interface ConnectionInfo {
  connectionType: string;
  status: string;
  displayPhoneNumber?: string;
  requiresTemplates: boolean;
}

interface TemplateButton {
  type: 'URL' | 'PHONE_NUMBER' | 'QUICK_REPLY';
  text: string;
  url?: string;
  phone_number?: string;
}

interface CreateTemplateForm {
  name: string;
  category: 'MARKETING' | 'UTILITY' | 'AUTHENTICATION';
  language: string;
  headerType: 'none' | 'text';
  headerText: string;
  bodyText: string;
  bodyExamples: string[];
  footerText: string;
  buttons: TemplateButton[];
}

const LANGUAGES = [
  { code: 'en', name: 'English' },
  { code: 'en_US', name: 'English (US)' },
  { code: 'en_GB', name: 'English (UK)' },
  { code: 'ms', name: 'Malay' },
  { code: 'zh_CN', name: 'Chinese (Simplified)' },
  { code: 'zh_TW', name: 'Chinese (Traditional)' },
  { code: 'id', name: 'Indonesian' },
  { code: 'th', name: 'Thai' },
  { code: 'vi', name: 'Vietnamese' },
  { code: 'ar', name: 'Arabic' },
  { code: 'hi', name: 'Hindi' },
  { code: 'ta', name: 'Tamil' },
  { code: 'es', name: 'Spanish' },
  { code: 'pt_BR', name: 'Portuguese (Brazil)' },
  { code: 'fr', name: 'French' },
  { code: 'de', name: 'German' },
  { code: 'ja', name: 'Japanese' },
  { code: 'ko', name: 'Korean' },
];

const MessageTemplatesPage: React.FC = () => {
  const [templates, setTemplates] = useState<MessageTemplate[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [connectionInfo, setConnectionInfo] = useState<ConnectionInfo | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState<MessageTemplate | null>(null);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [companyId, setCompanyId] = useState<string>('');
  const [phoneIndex, setPhoneIndex] = useState<number>(0);
  
  // Create template modal state
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [createForm, setCreateForm] = useState<CreateTemplateForm>({
    name: '',
    category: 'UTILITY',
    language: 'en',
    headerType: 'none',
    headerText: '',
    bodyText: '',
    bodyExamples: [],
    footerText: '',
    buttons: []
  });

  const baseUrl = 'https://bisnesgpt.jutateknologi.com';

  // Fetch user/company data on mount
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const userEmail = localStorage.getItem("userEmail");
        if (!userEmail) return;

        const response = await fetch(
          `${baseUrl}/api/user-data?email=${encodeURIComponent(userEmail)}`,
          { credentials: "include" }
        );
        
        if (response.ok) {
          const userData = await response.json();
          setCompanyId(userData.company_id);
          setPhoneIndex(userData.phone || 0);
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    };

    fetchUserData();
  }, []);

  // Fetch connection info and templates when companyId is available
  useEffect(() => {
    if (companyId) {
      fetchConnectionInfo();
      fetchTemplates();
    }
  }, [companyId, phoneIndex]);

  const fetchConnectionInfo = async () => {
    try {
      const response = await fetch(
        `${baseUrl}/api/templates/connection-type/${companyId}?phoneIndex=${phoneIndex}`,
        { credentials: "include" }
      );
      
      if (response.ok) {
        const data = await response.json();
        setConnectionInfo(data);
      }
    } catch (error) {
      console.error("Error fetching connection info:", error);
    }
  };

  const fetchTemplates = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(
        `${baseUrl}/api/templates/${companyId}?phoneIndex=${phoneIndex}`,
        { credentials: "include" }
      );
      
      if (response.ok) {
        const data = await response.json();
        setTemplates(data.templates || []);
      }
    } catch (error) {
      console.error("Error fetching templates:", error);
      toast.error("Failed to fetch templates");
    } finally {
      setIsLoading(false);
    }
  };

  const syncTemplates = async () => {
    setIsSyncing(true);
    try {
      const response = await fetch(`${baseUrl}/api/templates/sync`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ companyId, phoneIndex })
      });
      
      if (response.ok) {
        const data = await response.json();
        toast.success(`Synced ${data.synced} templates from Meta`);
        fetchTemplates();
      } else {
        const error = await response.json();
        toast.error(error.error || 'Failed to sync templates');
      }
    } catch (error) {
      console.error("Error syncing templates:", error);
      toast.error("Failed to sync templates from Meta");
    } finally {
      setIsSyncing(false);
    }
  };

  const resetCreateForm = () => {
    setCreateForm({
      name: '',
      category: 'UTILITY',
      language: 'en',
      headerType: 'none',
      headerText: '',
      bodyText: '',
      bodyExamples: [],
      footerText: '',
      buttons: []
    });
  };

  const countVariables = (text: string): number => {
    const matches = text.match(/\{\{(\d+)\}\}/g);
    return matches ? matches.length : 0;
  };

  const handleBodyTextChange = (text: string) => {
    const varCount = countVariables(text);
    const newExamples = [...createForm.bodyExamples];
    
    // Adjust examples array size
    while (newExamples.length < varCount) {
      newExamples.push('');
    }
    while (newExamples.length > varCount) {
      newExamples.pop();
    }
    
    setCreateForm({ ...createForm, bodyText: text, bodyExamples: newExamples });
  };

  const handleAddButton = () => {
    if (createForm.buttons.length >= 3) {
      toast.warning('Maximum 3 buttons allowed');
      return;
    }
    setCreateForm({
      ...createForm,
      buttons: [...createForm.buttons, { type: 'QUICK_REPLY', text: '' }]
    });
  };

  const handleRemoveButton = (index: number) => {
    const newButtons = createForm.buttons.filter((_, i) => i !== index);
    setCreateForm({ ...createForm, buttons: newButtons });
  };

  const handleButtonChange = (index: number, field: keyof TemplateButton, value: string) => {
    const newButtons = [...createForm.buttons];
    newButtons[index] = { ...newButtons[index], [field]: value };
    setCreateForm({ ...createForm, buttons: newButtons });
  };

  const createTemplate = async () => {
    if (!createForm.name.trim()) {
      toast.error('Template name is required');
      return;
    }
    if (!createForm.bodyText.trim()) {
      toast.error('Body text is required');
      return;
    }

    // Validate variable examples
    const varCount = countVariables(createForm.bodyText);
    if (varCount > 0 && createForm.bodyExamples.some(ex => !ex.trim())) {
      toast.error('Please provide example values for all variables');
      return;
    }

    setIsCreating(true);
    try {
      const payload: any = {
        companyId,
        phoneIndex,
        name: createForm.name,
        category: createForm.category,
        language: createForm.language,
        body: {
          text: createForm.bodyText,
          examples: varCount > 0 ? createForm.bodyExamples : undefined
        }
      };

      if (createForm.headerType === 'text' && createForm.headerText.trim()) {
        payload.header = {
          format: 'TEXT',
          text: createForm.headerText
        };
      }

      if (createForm.footerText.trim()) {
        payload.footer = {
          text: createForm.footerText
        };
      }

      if (createForm.buttons.length > 0) {
        payload.buttons = createForm.buttons.filter(btn => btn.text.trim());
      }

      const response = await fetch(`${baseUrl}/api/templates/create`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        const data = await response.json();
        toast.success('Template created successfully! It will be reviewed by Meta.');
        setShowCreateModal(false);
        resetCreateForm();
        fetchTemplates();
      } else {
        const error = await response.json();
        toast.error(error.error || 'Failed to create template');
      }
    } catch (error) {
      console.error("Error creating template:", error);
      toast.error("Failed to create template");
    } finally {
      setIsCreating(false);
    }
  };

  const deleteTemplate = async (templateName: string) => {
    if (!confirm(`Are you sure you want to delete template "${templateName}"? This action cannot be undone.`)) {
      return;
    }

    try {
      const response = await fetch(
        `${baseUrl}/api/templates/${companyId}/${templateName}?phoneIndex=${phoneIndex}`,
        {
          method: 'DELETE',
          credentials: 'include'
        }
      );

      if (response.ok) {
        toast.success('Template deleted successfully');
        fetchTemplates();
      } else {
        const error = await response.json();
        toast.error(error.error || 'Failed to delete template');
      }
    } catch (error) {
      console.error("Error deleting template:", error);
      toast.error("Failed to delete template");
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'APPROVED':
        return <span className="mt-badge mt-badge-approved">Approved</span>;
      case 'PENDING':
        return <span className="mt-badge mt-badge-pending">Pending</span>;
      case 'REJECTED':
        return <span className="mt-badge mt-badge-rejected">Rejected</span>;
      default:
        return <span className="mt-badge" style={{color:'#4b4b4b',borderColor:'#4b4b4b'}}>{status}</span>;
    }
  };

  const getCategoryBadge = (category: string) => {
    switch (category) {
      case 'MARKETING':
        return <span className="mt-badge mt-badge-marketing">Marketing</span>;
      case 'UTILITY':
        return <span className="mt-badge mt-badge-utility">Utility</span>;
      case 'AUTHENTICATION':
        return <span className="mt-badge mt-badge-auth">Auth</span>;
      default:
        return <span className="mt-badge" style={{color:'#4b4b4b',borderColor:'#4b4b4b'}}>{category}</span>;
    }
  };

  const getTemplatePreview = (template: MessageTemplate): string => {
    if (!template.components) return '';
    
    const parts: string[] = [];
    
    for (const comp of template.components) {
      if (comp.type === 'HEADER' && comp.text) {
        parts.push(comp.text);
      }
      if (comp.type === 'BODY' && comp.text) {
        parts.push(comp.text);
      }
      if (comp.type === 'FOOTER' && comp.text) {
        parts.push(`[${comp.text}]`);
      }
    }
    
    return parts.join('\n\n');
  };

  const filteredTemplates = templates.filter(template => {
    const matchesSearch = template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         getTemplatePreview(template).toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || template.category === selectedCategory;
    const matchesStatus = selectedStatus === 'all' || template.status === selectedStatus;
    
    return matchesSearch && matchesCategory && matchesStatus;
  });

  if (!connectionInfo?.requiresTemplates) {
    return (
      <div style={{fontFamily:"'Inter',sans-serif",minHeight:'100vh',background:'#f5f5f5',padding:'40px 24px',display:'flex',alignItems:'center',justifyContent:'center'}}>
        <ToastContainer />
        <div style={{background:'#fff',border:'2px solid #4b4b4b',boxShadow:'6px 6px 0 #f26522',padding:'48px 40px',maxWidth:'520px',width:'100%',textAlign:'center'}}>
          <div style={{width:'56px',height:'56px',background:'#f26522',border:'2px solid #4b4b4b',display:'flex',alignItems:'center',justifyContent:'center',margin:'0 auto 24px'}}>
            <Lucide icon="Info" className="w-7 h-7 text-white" />
          </div>
          <h2 style={{fontSize:'1.4rem',fontWeight:800,color:'#4b4b4b',textTransform:'uppercase',letterSpacing:'.05em',marginBottom:'12px'}}>Templates Not Required</h2>
          <p style={{fontSize:'.9rem',color:'#8b8b8b',lineHeight:1.6,marginBottom:'20px'}}>
            Your WhatsApp connection is using the unofficial API (QR code method).
            Message templates are only required for the Official WhatsApp Business API.
          </p>
          <div style={{display:'inline-block',padding:'6px 16px',border:'2px solid #e8e8e8',background:'#f5f5f5'}}>
            <span style={{fontSize:'.78rem',fontWeight:700,color:'#8b8b8b',textTransform:'uppercase',letterSpacing:'.08em'}}>
              Connection: <span style={{color:'#4b4b4b'}}>{connectionInfo?.connectionType || 'wwebjs'}</span>
            </span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-root">
      <style>{`
        .mt-root{font-family:'Inter',sans-serif;min-height:100vh;background:#f5f5f5;padding:28px 24px}
        .mt-inner{max-width:1200px;margin:0 auto;display:flex;flex-direction:column;gap:20px}
        .mt-card{background:#fff;border:2px solid #4b4b4b;box-shadow:4px 4px 0 #f26522}
        .mt-navbar{background:#4b4b4b;padding:16px 24px;display:flex;flex-wrap:wrap;align-items:center;justify-content:space-between;gap:12px}
        .mt-icon-sq{width:44px;height:44px;background:#f26522;border:2px solid #fff;display:flex;align-items:center;justify-content:center;flex-shrink:0}
        .mt-btn{font-family:'Inter',sans-serif;font-weight:700;font-size:.72rem;text-transform:uppercase;letter-spacing:.08em;padding:8px 18px;border:2px solid #4b4b4b;background:#fff;color:#4b4b4b;cursor:pointer;transition:all .15s;display:inline-flex;align-items:center;gap:6px}
        .mt-btn:hover:not(:disabled){box-shadow:3px 3px 0 #f26522;transform:translate(-1px,-1px)}
        .mt-btn:disabled{opacity:.5;cursor:not-allowed}
        .mt-btn-primary{background:#f26522;border-color:#f26522;color:#fff}
        .mt-btn-primary:hover:not(:disabled){box-shadow:3px 3px 0 #4b4b4b}
        .mt-btn-ghost{background:rgba(255,255,255,.12);border-color:rgba(255,255,255,.3);color:#fff}
        .mt-btn-ghost:hover:not(:disabled){background:rgba(255,255,255,.2);box-shadow:none;transform:none}
        .mt-stat{background:#fff;border:2px solid #4b4b4b;box-shadow:3px 3px 0 #f26522;padding:20px}
        .mt-stat-val{font-size:2rem;font-weight:800;color:#4b4b4b;line-height:1}
        .mt-stat-approved{color:#2a7a2a}
        .mt-stat-pending{color:#8b6000}
        .mt-stat-rejected{color:#8b0000}
        .mt-stat-label{font-size:.65rem;font-weight:700;text-transform:uppercase;letter-spacing:.1em;color:#8b8b8b;margin-top:6px}
        .mt-info-banner{background:#fff8ec;border:2px solid #f26522;border-left:5px solid #f26522;padding:16px 20px;display:flex;gap:14px;align-items:flex-start}
        .mt-input{font-family:'Inter',sans-serif;width:100%;padding:10px 14px;border:2px solid #e8e8e8;background:#fff;font-size:.85rem;color:#4b4b4b;outline:none;transition:border-color .15s;box-sizing:border-box}
        .mt-input:focus{border-color:#f26522}
        .mt-select{font-family:'Inter',sans-serif;padding:10px 14px;border:2px solid #e8e8e8;background:#fff;font-size:.85rem;color:#4b4b4b;cursor:pointer;outline:none}
        .mt-select:focus{border-color:#f26522}
        .mt-template-card{background:#fff;border:2px solid #4b4b4b;cursor:pointer;transition:all .15s;display:flex;flex-direction:column}
        .mt-template-card:hover{box-shadow:4px 4px 0 #f26522;transform:translate(-2px,-2px)}
        .mt-preview-box{background:#f5f5f5;border:2px solid #e8e8e8;padding:14px}
        .mt-badge{font-size:.6rem;font-weight:800;text-transform:uppercase;letter-spacing:.1em;padding:3px 8px;border:1.5px solid;white-space:nowrap}
        .mt-badge-approved{color:#2a7a2a;border-color:#2a7a2a;background:#f0fff0}
        .mt-badge-pending{color:#8b6000;border-color:#8b6000;background:#fffbf0}
        .mt-badge-rejected{color:#8b0000;border-color:#8b0000;background:#fff0f0}
        .mt-badge-marketing{color:#5b008b;border-color:#5b008b;background:#f9f0ff}
        .mt-badge-utility{color:#00468b;border-color:#00468b;background:#f0f6ff}
        .mt-badge-auth{color:#4b4b4b;border-color:#4b4b4b;background:#f5f5f5}
        .mt-modal-wrap{position:fixed;inset:0;z-index:50;display:flex;align-items:center;justify-content:center;padding:16px}
        .mt-modal-overlay{position:fixed;inset:0;background:rgba(0,0,0,.55)}
        .mt-modal{background:#fff;border:3px solid #4b4b4b;box-shadow:6px 6px 0 #f26522;max-width:640px;width:100%;position:relative;z-index:1;max-height:90vh;display:flex;flex-direction:column}
        .mt-modal-header{background:#4b4b4b;padding:16px 24px;display:flex;align-items:center;justify-content:space-between;flex-shrink:0}
        .mt-modal-body{padding:24px;overflow-y:auto;display:flex;flex-direction:column;gap:16px}
        .mt-modal-footer{padding:16px 24px;border-top:2px solid #e8e8e8;display:flex;justify-content:flex-end;gap:10px;flex-shrink:0}
        .mt-label{font-size:.7rem;font-weight:700;text-transform:uppercase;letter-spacing:.08em;color:#4b4b4b;display:block;margin-bottom:6px}
        .mt-wa-preview{background:#e5ddd5;padding:16px;border:2px solid #e8e8e8}
        .mt-wa-bubble{background:#fff;max-width:320px;margin:0 auto;border:1px solid #e8e8e8}
        .mt-wa-btn-row{border-top:1px solid #e8e8e8}
        .mt-wa-btn{width:100%;padding:10px;text-align:center;color:#f26522;font-size:.8rem;font-weight:600;border:none;background:transparent;border-top:1px solid #e8e8e8;cursor:default}
        .mt-wa-btn:first-child{border-top:none}
        .mt-var-note{background:#fff8ec;border:2px solid #f26522;border-left:4px solid #f26522;padding:12px 16px}
        .mt-grid-4{display:grid;grid-template-columns:repeat(4,1fr);gap:14px}
        .mt-grid-3{display:grid;grid-template-columns:repeat(3,1fr);gap:14px}
        @media(max-width:1024px){.mt-grid-4{grid-template-columns:repeat(2,1fr)}.mt-grid-3{grid-template-columns:repeat(2,1fr)}}
        @media(max-width:640px){.mt-grid-4{grid-template-columns:1fr}.mt-grid-3{grid-template-columns:1fr}}
      `}</style>
      <ToastContainer />

      <div className="mt-inner">
        {/* Header */}
        <div className="mt-navbar">
          <div style={{display:'flex',alignItems:'center',gap:'14px'}}>
            <div className="mt-icon-sq">
              <Lucide icon="FileText" className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 style={{fontSize:'1.1rem',fontWeight:800,color:'#fff',textTransform:'uppercase',letterSpacing:'.06em',margin:0}}>Message Templates</h1>
              <p style={{fontSize:'.72rem',color:'rgba(255,255,255,.6)',margin:'2px 0 0',fontWeight:500}}>
                Manage your WhatsApp Business API templates
                {connectionInfo?.displayPhoneNumber && ` · ${connectionInfo.displayPhoneNumber}`}
              </p>
            </div>
          </div>

          <div style={{display:'flex',flexWrap:'wrap',gap:'8px'}}>
            <button className="mt-btn mt-btn-ghost" onClick={fetchTemplates} disabled={isLoading}>
              <Lucide icon="RefreshCw" className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
              Refresh
            </button>
            <button className="mt-btn mt-btn-ghost" onClick={syncTemplates} disabled={isSyncing}>
              {isSyncing ? <><LoadingIcon icon="oval" color="white" className="w-3.5 h-3.5" /> Syncing...</> : <><Lucide icon="Download" className="w-3.5 h-3.5" />Sync from Meta</>}
            </button>
            <button className="mt-btn mt-btn-primary" onClick={() => setShowCreateModal(true)}>
              <Lucide icon="Plus" className="w-3.5 h-3.5" />
              Create Template
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="mt-grid-4">
          <div className="mt-stat">
            <p className="mt-stat-val">{templates.length}</p>
            <p className="mt-stat-label">Total Templates</p>
          </div>
          <div className="mt-stat">
            <p className="mt-stat-val mt-stat-approved">{templates.filter(t => t.status === 'APPROVED').length}</p>
            <p className="mt-stat-label">Approved</p>
          </div>
          <div className="mt-stat">
            <p className="mt-stat-val mt-stat-pending">{templates.filter(t => t.status === 'PENDING').length}</p>
            <p className="mt-stat-label">Pending Review</p>
          </div>
          <div className="mt-stat">
            <p className="mt-stat-val mt-stat-rejected">{templates.filter(t => t.status === 'REJECTED').length}</p>
            <p className="mt-stat-label">Rejected</p>
          </div>
        </div>

        {/* Info Banner */}
        <div className="mt-info-banner">
          <div style={{width:'36px',height:'36px',background:'#f26522',border:'2px solid #4b4b4b',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>
            <Lucide icon="Info" className="w-4 h-4 text-white" />
          </div>
          <div>
            <h3 style={{fontWeight:800,fontSize:'.85rem',color:'#4b4b4b',textTransform:'uppercase',letterSpacing:'.04em',marginBottom:'4px'}}>24-Hour Messaging Window</h3>
            <p style={{fontSize:'.82rem',color:'#8b8b8b',lineHeight:1.6}}>
              With the Official WhatsApp API, you can only send free-form messages within 24 hours of receiving a customer message.
              After that, you must use an approved template to re-engage. Create templates here and they'll be submitted to Meta for review.
            </p>
          </div>
        </div>

        {/* Filters */}
        <div className="mt-card" style={{padding:'16px 20px'}}>
          <div style={{display:'flex',flexWrap:'wrap',gap:'10px'}}>
            <div style={{flex:'1',minWidth:'200px',position:'relative'}}>
              <Lucide icon="Search" className="w-4 h-4" style={{position:'absolute',left:'12px',top:'50%',transform:'translateY(-50%)',color:'#8b8b8b'}} />
              <input
                type="text"
                placeholder="Search templates..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="mt-input"
                style={{paddingLeft:'36px'}}
              />
            </div>
            <select value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)} className="mt-select">
              <option value="all">All Categories</option>
              <option value="MARKETING">Marketing</option>
              <option value="UTILITY">Utility</option>
              <option value="AUTHENTICATION">Authentication</option>
            </select>
            <select value={selectedStatus} onChange={(e) => setSelectedStatus(e.target.value)} className="mt-select">
              <option value="all">All Statuses</option>
              <option value="APPROVED">Approved</option>
              <option value="PENDING">Pending</option>
              <option value="REJECTED">Rejected</option>
            </select>
          </div>
        </div>

        {/* Templates List */}
        {isLoading ? (
          <div style={{textAlign:'center',padding:'48px 0',display:'flex',flexDirection:'column',alignItems:'center',gap:'12px'}}>
            <LoadingIcon icon="oval" className="w-10 h-10" style={{color:'#f26522'}} />
            <span style={{fontSize:'.85rem',color:'#8b8b8b',fontWeight:600,textTransform:'uppercase',letterSpacing:'.08em'}}>Loading templates...</span>
          </div>
        ) : filteredTemplates.length === 0 ? (
          <div className="mt-card" style={{padding:'48px 24px',textAlign:'center'}}>
            <div style={{width:'52px',height:'52px',background:'#f26522',border:'2px solid #4b4b4b',display:'flex',alignItems:'center',justifyContent:'center',margin:'0 auto 16px'}}>
              <Lucide icon="FileText" className="w-6 h-6 text-white" />
            </div>
            <h3 style={{fontWeight:800,fontSize:'1rem',color:'#4b4b4b',textTransform:'uppercase',letterSpacing:'.05em',marginBottom:'8px'}}>No templates found</h3>
            <p style={{fontSize:'.85rem',color:'#8b8b8b'}}>
              {templates.length === 0
                ? "Click 'Sync from Meta' to fetch your templates or create a new one"
                : "No templates match your current filters"}
            </p>
          </div>
        ) : (
          <div className="mt-grid-3">
            {filteredTemplates.map((template) => (
              <div
                key={template.id}
                className="mt-template-card"
                onClick={() => { setSelectedTemplate(template); setShowPreviewModal(true); }}
              >
                <div style={{padding:'16px',borderBottom:'2px solid #e8e8e8'}}>
                  <div style={{display:'flex',alignItems:'flex-start',justifyContent:'space-between',gap:'8px',marginBottom:'10px'}}>
                    <div style={{flex:1,minWidth:0}}>
                      <h3 style={{fontWeight:700,fontSize:'.85rem',color:'#4b4b4b',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{template.name}</h3>
                      <p style={{fontSize:'.7rem',color:'#8b8b8b',marginTop:'2px',fontWeight:600,textTransform:'uppercase',letterSpacing:'.06em'}}>Lang: {template.language}</p>
                    </div>
                    <div style={{display:'flex',flexDirection:'column',gap:'4px',alignItems:'flex-end',flexShrink:0}}>
                      {getStatusBadge(template.status)}
                      {getCategoryBadge(template.category)}
                    </div>
                  </div>

                  <div className="mt-preview-box">
                    <p style={{fontSize:'.8rem',color:'#4b4b4b',whiteSpace:'pre-wrap',overflow:'hidden',display:'-webkit-box',WebkitLineClamp:4,WebkitBoxOrient:'vertical'}}>
                      {getTemplatePreview(template) || 'No preview available'}
                    </p>
                  </div>

                  {template.components?.some(c => c.type === 'BUTTONS') && (
                    <div style={{display:'flex',flexWrap:'wrap',gap:'6px',marginTop:'10px'}}>
                      {template.components
                        .filter(c => c.type === 'BUTTONS')
                        .flatMap(c => c.buttons || [])
                        .map((btn, idx) => (
                          <span key={idx} style={{fontSize:'.65rem',fontWeight:700,padding:'3px 8px',border:'1.5px solid #f26522',color:'#f26522',textTransform:'uppercase',letterSpacing:'.06em'}}>
                            {btn.text}
                          </span>
                        ))
                      }
                    </div>
                  )}
                </div>

                <div style={{padding:'10px 16px',display:'flex',justifyContent:'flex-end'}}>
                  <button
                    onClick={(e) => { e.stopPropagation(); deleteTemplate(template.name); }}
                    style={{fontSize:'.65rem',fontWeight:800,textTransform:'uppercase',letterSpacing:'.08em',color:'#8b0000',border:'1.5px solid #8b0000',background:'transparent',padding:'4px 10px',cursor:'pointer',display:'flex',alignItems:'center',gap:'4px'}}
                  >
                    <Lucide icon="Trash2" className="w-3 h-3" />
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Preview Modal */}
      <Dialog open={showPreviewModal} onClose={() => { setShowPreviewModal(false); setSelectedTemplate(null); }}>
        <div className="mt-modal-overlay" aria-hidden="true" />
        <div className="mt-modal-wrap">
          <Dialog.Panel className="mt-modal" style={{maxWidth:'520px'}}>
            <div className="mt-modal-header">
              <div style={{display:'flex',alignItems:'center',gap:'10px'}}>
                <div style={{width:'32px',height:'32px',background:'#f26522',border:'2px solid #fff',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>
                  <Lucide icon="Eye" className="w-4 h-4 text-white" />
                </div>
                <h3 style={{fontWeight:800,fontSize:'.9rem',color:'#fff',textTransform:'uppercase',letterSpacing:'.06em',margin:0}}>Template Preview</h3>
              </div>
              <button onClick={() => setShowPreviewModal(false)} style={{width:'28px',height:'28px',background:'rgba(255,255,255,.15)',border:'1px solid rgba(255,255,255,.3)',display:'flex',alignItems:'center',justifyContent:'center',cursor:'pointer',color:'#fff'}}>
                <Lucide icon="X" className="w-4 h-4" />
              </button>
            </div>

            {selectedTemplate && (
              <div className="mt-modal-body">
                <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',flexWrap:'wrap',gap:'8px'}}>
                  <h4 style={{fontWeight:700,fontSize:'.95rem',color:'#4b4b4b',margin:0}}>{selectedTemplate.name}</h4>
                  <div style={{display:'flex',gap:'6px'}}>
                    {getStatusBadge(selectedTemplate.status)}
                    {getCategoryBadge(selectedTemplate.category)}
                  </div>
                </div>
                <p style={{fontSize:'.75rem',color:'#8b8b8b',fontWeight:600,textTransform:'uppercase',letterSpacing:'.06em',margin:0}}>Language: {selectedTemplate.language}</p>

                <div className="mt-wa-preview">
                  <div className="mt-wa-bubble">
                    {selectedTemplate.components?.map((comp, idx) => (
                      <div key={idx}>
                        {comp.type === 'HEADER' && comp.text && (
                          <div style={{padding:'10px 14px 0',fontWeight:700,color:'#222',fontSize:'.85rem'}}>{comp.text}</div>
                        )}
                        {comp.type === 'HEADER' && comp.format === 'IMAGE' && (
                          <div style={{background:'#e8e8e8',height:'120px',display:'flex',alignItems:'center',justifyContent:'center'}}>
                            <Lucide icon="Image" className="w-10 h-10 text-gray-400" />
                          </div>
                        )}
                        {comp.type === 'BODY' && comp.text && (
                          <div style={{padding:'8px 14px',color:'#333',whiteSpace:'pre-wrap',fontSize:'.82rem',lineHeight:1.5}}>{comp.text}</div>
                        )}
                        {comp.type === 'FOOTER' && comp.text && (
                          <div style={{padding:'0 14px 10px',fontSize:'.7rem',color:'#888'}}>{comp.text}</div>
                        )}
                        {comp.type === 'BUTTONS' && comp.buttons && (
                          <div className="mt-wa-btn-row">
                            {comp.buttons.map((btn, btnIdx) => (
                              <button key={btnIdx} className="mt-wa-btn">
                                {btn.type === 'URL' && <Lucide icon="ExternalLink" className="w-3.5 h-3.5 inline mr-1" />}
                                {btn.type === 'PHONE_NUMBER' && <Lucide icon="Phone" className="w-3.5 h-3.5 inline mr-1" />}
                                {btn.text}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {selectedTemplate.components?.some(c => c.text?.includes('{{')) && (
                  <div className="mt-var-note" style={{display:'flex',gap:'10px',alignItems:'flex-start'}}>
                    <Lucide icon="AlertCircle" className="w-4 h-4 flex-shrink-0" style={{color:'#f26522',marginTop:'1px'}} />
                    <div>
                      <p style={{fontWeight:700,fontSize:'.78rem',color:'#4b4b4b',margin:'0 0 4px'}}>This template has variables</p>
                      <p style={{fontSize:'.72rem',color:'#8b8b8b',margin:0}}>
                        Variables like {'{{1}}'}, {'{{2}}'} will need to be filled in when sending.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            )}
          </Dialog.Panel>
        </div>
      </Dialog>

      {/* Create Template Modal */}
      <Dialog open={showCreateModal} onClose={() => { setShowCreateModal(false); resetCreateForm(); }}>
        <div className="mt-modal-overlay" />
        <div className="mt-modal-wrap">
          <Dialog.Panel className="mt-modal">
            <div className="mt-modal-header">
              <div style={{display:'flex',alignItems:'center',gap:'10px'}}>
                <div style={{width:'32px',height:'32px',background:'#f26522',border:'2px solid #fff',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>
                  <Lucide icon="Plus" className="w-4 h-4 text-white" />
                </div>
                <h3 style={{fontWeight:800,fontSize:'.9rem',color:'#fff',textTransform:'uppercase',letterSpacing:'.06em',margin:0}}>Create Message Template</h3>
              </div>
              <button onClick={() => setShowCreateModal(false)} style={{width:'28px',height:'28px',background:'rgba(255,255,255,.15)',border:'1px solid rgba(255,255,255,.3)',display:'flex',alignItems:'center',justifyContent:'center',cursor:'pointer',color:'#fff'}}>
                <Lucide icon="X" className="w-4 h-4" />
              </button>
            </div>

            <div className="mt-modal-body">
              {/* Template Name */}
              <div>
                <label className="mt-label">Template Name <span style={{color:'#e53e3e'}}>*</span></label>
                <input type="text" value={createForm.name} onChange={(e) => setCreateForm({...createForm,name:e.target.value})} placeholder="my_template_name" className="mt-input" />
                <p style={{fontSize:'.68rem',color:'#8b8b8b',marginTop:'4px'}}>Lowercase letters, numbers, and underscores only.</p>
              </div>

              {/* Category & Language */}
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'12px'}}>
                <div>
                  <label className="mt-label">Category</label>
                  <select value={createForm.category} onChange={(e) => setCreateForm({...createForm,category:e.target.value as any})} className="mt-select" style={{width:'100%'}}>
                    <option value="UTILITY">Utility</option>
                    <option value="MARKETING">Marketing</option>
                    <option value="AUTHENTICATION">Authentication</option>
                  </select>
                </div>
                <div>
                  <label className="mt-label">Language</label>
                  <select value={createForm.language} onChange={(e) => setCreateForm({...createForm,language:e.target.value})} className="mt-select" style={{width:'100%'}}>
                    {LANGUAGES.map(lang => <option key={lang.code} value={lang.code}>{lang.name}</option>)}
                  </select>
                </div>
              </div>

              {/* Header */}
              <div>
                <label className="mt-label">Header (Optional)</label>
                <select value={createForm.headerType} onChange={(e) => setCreateForm({...createForm,headerType:e.target.value as any})} className="mt-select" style={{width:'100%',marginBottom:'8px'}}>
                  <option value="none">No Header</option>
                  <option value="text">Text Header</option>
                </select>
                {createForm.headerType === 'text' && (
                  <input type="text" value={createForm.headerText} onChange={(e) => setCreateForm({...createForm,headerText:e.target.value})} placeholder="Header text" maxLength={60} className="mt-input" />
                )}
              </div>

              {/* Body */}
              <div>
                <label className="mt-label">Body Text <span style={{color:'#e53e3e'}}>*</span></label>
                <textarea value={createForm.bodyText} onChange={(e) => handleBodyTextChange(e.target.value)} placeholder="Hello {{1}}, your order {{2}} has been shipped!" rows={4} maxLength={1024} className="mt-input" style={{resize:'none',height:'auto'}} />
                <p style={{fontSize:'.68rem',color:'#8b8b8b',marginTop:'4px'}}>Use {'{{1}}'}, {'{{2}}'}, etc. for variables. Max 1024 chars.</p>
              </div>

              {/* Variable Examples */}
              {createForm.bodyExamples.length > 0 && (
                <div style={{background:'#f5f5f5',border:'2px solid #e8e8e8',padding:'14px'}}>
                  <label className="mt-label">Example values for variables <span style={{color:'#e53e3e'}}>*</span></label>
                  <div style={{display:'flex',flexDirection:'column',gap:'8px'}}>
                    {createForm.bodyExamples.map((example, idx) => (
                      <div key={idx} style={{display:'flex',alignItems:'center',gap:'8px'}}>
                        <span style={{fontSize:'.72rem',fontWeight:700,color:'#8b8b8b',minWidth:'48px'}}>{'{{' + (idx+1) + '}}'}:</span>
                        <input type="text" value={example} onChange={(e) => { const n=[...createForm.bodyExamples]; n[idx]=e.target.value; setCreateForm({...createForm,bodyExamples:n}); }} placeholder={`Example ${idx+1}`} className="mt-input" style={{flex:1}} />
                      </div>
                    ))}
                  </div>
                  <p style={{fontSize:'.68rem',color:'#8b8b8b',marginTop:'8px'}}>Meta requires example values to understand how variables will be used.</p>
                </div>
              )}

              {/* Footer */}
              <div>
                <label className="mt-label">Footer (Optional)</label>
                <input type="text" value={createForm.footerText} onChange={(e) => setCreateForm({...createForm,footerText:e.target.value})} placeholder="Reply STOP to unsubscribe" maxLength={60} className="mt-input" />
              </div>

              {/* Buttons */}
              <div>
                <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:'8px'}}>
                  <label className="mt-label" style={{margin:0}}>Buttons (Optional)</label>
                  <button type="button" onClick={handleAddButton} className="mt-btn" style={{padding:'4px 12px',fontSize:'.65rem'}}>
                    <Lucide icon="Plus" className="w-3 h-3" /> Add Button
                  </button>
                </div>
                {createForm.buttons.length > 0 && (
                  <div style={{display:'flex',flexDirection:'column',gap:'10px'}}>
                    {createForm.buttons.map((btn, idx) => (
                      <div key={idx} style={{background:'#f5f5f5',border:'2px solid #e8e8e8',padding:'12px'}}>
                        <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:'8px'}}>
                          <span style={{fontSize:'.72rem',fontWeight:700,color:'#4b4b4b',textTransform:'uppercase',letterSpacing:'.06em'}}>Button {idx+1}</span>
                          <button type="button" onClick={() => handleRemoveButton(idx)} style={{color:'#8b0000',background:'transparent',border:'none',cursor:'pointer',display:'flex',alignItems:'center'}}>
                            <Lucide icon="Trash2" className="w-4 h-4" />
                          </button>
                        </div>
                        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'8px',marginBottom:'6px'}}>
                          <select value={btn.type} onChange={(e) => handleButtonChange(idx,'type',e.target.value)} className="mt-select">
                            <option value="QUICK_REPLY">Quick Reply</option>
                            <option value="URL">URL</option>
                            <option value="PHONE_NUMBER">Phone Number</option>
                          </select>
                          <input type="text" value={btn.text} onChange={(e) => handleButtonChange(idx,'text',e.target.value)} placeholder="Button text" maxLength={25} className="mt-input" />
                        </div>
                        {btn.type === 'URL' && <input type="url" value={btn.url||''} onChange={(e) => handleButtonChange(idx,'url',e.target.value)} placeholder="https://example.com" className="mt-input" />}
                        {btn.type === 'PHONE_NUMBER' && <input type="tel" value={btn.phone_number||''} onChange={(e) => handleButtonChange(idx,'phone_number',e.target.value)} placeholder="+60123456789" className="mt-input" />}
                      </div>
                    ))}
                  </div>
                )}
                <p style={{fontSize:'.68rem',color:'#8b8b8b',marginTop:'6px'}}>Maximum 3 buttons allowed.</p>
              </div>

              {/* Live Preview */}
              <div style={{borderTop:'2px solid #e8e8e8',paddingTop:'16px'}}>
                <label className="mt-label">Live Preview</label>
                <div className="mt-wa-preview">
                  <div className="mt-wa-bubble">
                    {createForm.headerType === 'text' && createForm.headerText && (
                      <div style={{padding:'10px 14px 0',fontWeight:700,color:'#222',fontSize:'.85rem'}}>{createForm.headerText}</div>
                    )}
                    <div style={{padding:'8px 14px',color:'#333',whiteSpace:'pre-wrap',fontSize:'.82rem',lineHeight:1.5}}>
                      {createForm.bodyText || 'Your message text will appear here...'}
                    </div>
                    {createForm.footerText && <div style={{padding:'0 14px 10px',fontSize:'.7rem',color:'#888'}}>{createForm.footerText}</div>}
                    {createForm.buttons.length > 0 && (
                      <div className="mt-wa-btn-row">
                        {createForm.buttons.filter(b => b.text).map((btn, idx) => (
                          <button key={idx} className="mt-wa-btn">
                            {btn.type === 'URL' && <Lucide icon="ExternalLink" className="w-3.5 h-3.5 inline mr-1" />}
                            {btn.type === 'PHONE_NUMBER' && <Lucide icon="Phone" className="w-3.5 h-3.5 inline mr-1" />}
                            {btn.text}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-modal-footer">
              <button className="mt-btn" onClick={() => { setShowCreateModal(false); resetCreateForm(); }}>Cancel</button>
              <button className="mt-btn mt-btn-primary" onClick={createTemplate} disabled={isCreating}>
                {isCreating ? <><LoadingIcon icon="oval" color="white" className="w-3.5 h-3.5" />Creating...</> : <><Lucide icon="Plus" className="w-3.5 h-3.5" />Create Template</>}
              </button>
            </div>
          </Dialog.Panel>
        </div>
      </Dialog>
    </div>
  );
};

export default MessageTemplatesPage;
