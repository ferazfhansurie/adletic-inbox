// Lead Forms — connect Facebook Lead Ads to bisnesgpt so a WhatsApp /
// inbox auto-reply fires the moment someone fills the form.
//
// Page is split into four blocks:
//
//   1. Webhook setup card — read-only Webhook URL + Verify Token the user
//      pastes into Meta's "Webhooks → leadgen" subscription. We expose a
//      copy button per field. Token can be regenerated.
//   2. Connected forms list — each card shows Page · Form name, last lead
//      timestamp, total leads, the auto-reply preview, and Edit /
//      Disconnect / Test buttons.
//   3. Add form modal — form id, page id, label, the auto-reply message
//      (with {{name}} / {{email}} / {{phone}} tokens), submit/cancel.
//   4. Recent leads table — pulled on mount, refreshed after every
//      connect / test. Rows show timestamp, form, lead, delivery status.
//
// All API calls hit ${baseUrl}/api/lead-forms/... — endpoint shapes match
// the existing /api/templates/... pattern (companyId in path, phoneIndex
// as query string, credentials: 'include' for session cookies).

import React, { useState, useEffect, useCallback, useRef } from "react";
import Lucide from "@/components/Base/Lucide";
import Button from "@/components/Base/Button";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Dialog } from "@/components/Base/Headless";
import LoadingIcon from "@/components/Base/LoadingIcon";

interface LeadForm {
  id: string;            // our internal id (uuid)
  fb_form_id: string;    // Facebook lead form id
  fb_page_id: string;    // owning Facebook page id
  fb_page_name?: string; // resolved on the server when possible
  label: string;         // friendly name shown in the UI
  auto_reply_template: string;
  auto_reply_image_url?: string | null;
  is_active: boolean;
  total_leads: number;
  last_lead_at?: string | null;
  created_at: string;
}

interface LeadEntry {
  id: string;
  form_id: string;
  form_label: string;
  full_name: string;
  email?: string | null;
  phone?: string | null;
  delivery_status: "sent" | "queued" | "failed" | "skipped";
  delivery_error?: string | null;
  created_at: string;
}

interface WebhookInfo {
  url: string;
  verify_token: string;
}

const DEFAULT_TEMPLATE =
  "Hi {{name}} — thanks for reaching out via Facebook!\n\n" +
  "We just got your details. Someone from the Adletic team will WhatsApp " +
  "you within the next hour. While you wait, try MotionBoards (the AI " +
  "video tool we built) at https://motionboards.com — it's RM10/month, " +
  "limited time.\n\n" +
  "— Adletic Agency";

// Centralised so swapping back to staging is a one-line change.
const baseUrl = "https://bisnesgpt.jutateknologi.com";

const LeadFormsPage: React.FC = () => {
  // Identity bootstrap — same pattern as MessageTemplates.
  const [companyId, setCompanyId] = useState<string>("");
  const [phoneIndex, setPhoneIndex] = useState<number>(0);

  const [forms, setForms] = useState<LeadForm[]>([]);
  const [leads, setLeads] = useState<LeadEntry[]>([]);
  const [webhookInfo, setWebhookInfo] = useState<WebhookInfo | null>(null);

  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingLeads, setIsLoadingLeads] = useState(false);
  const [isRotatingToken, setIsRotatingToken] = useState(false);

  // Add / edit modal.
  const [showFormModal, setShowFormModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draft, setDraft] = useState({
    fb_form_id: "",
    fb_page_id: "",
    fb_page_access_token: "",
    label: "",
    auto_reply_template: DEFAULT_TEMPLATE,
    auto_reply_image_url: "",
  });

  // Remember the last phone used for "Send test" so the user doesn't
  // re-type it. Per-tab via sessionStorage is enough.
  const [lastTestPhone, setLastTestPhone] = useState<string>(() => {
    try { return sessionStorage.getItem("mb_lead_form_last_test_phone") || ""; } catch { return ""; }
  });

  // Discover wizard state. Once the user pastes a token and clicks
  // "Discover", we populate this with their FB pages + each page's
  // lead forms. Selections drop straight into `draft`, so the dumb
  // manual ID inputs become read-only previews — no more hunting for
  // ids across two different Meta UIs.
  type DiscoveredForm = { id: string; name: string; status?: string };
  type DiscoveredPage = {
    id: string;
    name: string;
    access_token: string;
    forms: DiscoveredForm[];
    error?: string;
  };
  const [discovered, setDiscovered] = useState<DiscoveredPage[] | null>(null);
  const [discoveryError, setDiscoveryError] = useState<string | null>(null);
  const [isDiscovering, setIsDiscovering] = useState(false);
  const [autoSubscribeStatus, setAutoSubscribeStatus] = useState<"idle" | "pending" | "ok" | "fail">("idle");
  const [autoSubscribeError, setAutoSubscribeError] = useState<string | null>(null);
  const [isSavingForm, setIsSavingForm] = useState(false);

  // ─────────── bootstrap ───────────
  useEffect(() => {
    (async () => {
      try {
        const userEmail = localStorage.getItem("userEmail");
        if (!userEmail) return;
        const res = await fetch(
          `${baseUrl}/api/user-data?email=${encodeURIComponent(userEmail)}`,
          { credentials: "include" }
        );
        if (res.ok) {
          const data = await res.json();
          setCompanyId(data.company_id);
          setPhoneIndex(data.phone || 0);
        }
      } catch (err) {
        console.error("[LeadForms] bootstrap failed:", err);
      }
    })();
  }, []);

  const fetchAll = useCallback(async () => {
    if (!companyId) return;
    setIsLoading(true);
    try {
      const [formsRes, webhookRes] = await Promise.all([
        fetch(`${baseUrl}/api/lead-forms/${companyId}?phoneIndex=${phoneIndex}`, { credentials: "include" }),
        fetch(`${baseUrl}/api/lead-forms/${companyId}/webhook-info`,             { credentials: "include" }),
      ]);
      if (formsRes.ok) {
        const data = await formsRes.json();
        setForms(data.forms || []);
      }
      if (webhookRes.ok) {
        const data = await webhookRes.json();
        setWebhookInfo(data);
      }
    } catch (err) {
      console.error("[LeadForms] fetchAll failed:", err);
      toast.error("Couldn't load lead forms. Try refreshing.");
    } finally {
      setIsLoading(false);
    }
  }, [companyId, phoneIndex]);

  const fetchLeads = useCallback(async () => {
    if (!companyId) return;
    setIsLoadingLeads(true);
    try {
      const res = await fetch(
        `${baseUrl}/api/lead-forms/${companyId}/leads?phoneIndex=${phoneIndex}&limit=50`,
        { credentials: "include" }
      );
      if (res.ok) {
        const data = await res.json();
        setLeads(data.leads || []);
      }
    } catch (err) {
      console.error("[LeadForms] fetchLeads failed:", err);
    } finally {
      setIsLoadingLeads(false);
    }
  }, [companyId, phoneIndex]);

  useEffect(() => {
    if (companyId) {
      fetchAll();
      fetchLeads();
    }
  }, [companyId, phoneIndex, fetchAll, fetchLeads]);

  // ─────────── form CRUD ───────────
  const resetDiscovery = () => {
    setDiscovered(null);
    setDiscoveryError(null);
    setIsDiscovering(false);
    setAutoSubscribeStatus("idle");
    setAutoSubscribeError(null);
  };

  const openAddModal = () => {
    setEditingId(null);
    setDraft({
      fb_form_id: "",
      fb_page_id: "",
      fb_page_access_token: "",
      label: "",
      auto_reply_template: DEFAULT_TEMPLATE,
      auto_reply_image_url: "",
    });
    resetDiscovery();
    setShowFormModal(true);
  };

  const openEditModal = (f: LeadForm) => {
    setEditingId(f.id);
    setDraft({
      fb_form_id: f.fb_form_id,
      fb_page_id: f.fb_page_id,
      fb_page_access_token: "", // never echo the token back; user re-pastes if rotating
      label: f.label,
      auto_reply_template: f.auto_reply_template,
      auto_reply_image_url: f.auto_reply_image_url || "",
    });
    resetDiscovery();
    setShowFormModal(true);
  };

  // Discover: paste any token (User token from Graph Explorer OR a Page
  // token), get back the user's pages + each page's lead forms. Replaces
  // the manual hunt for Form ID / Page ID across Meta surfaces.
  const runDiscover = async () => {
    const token = draft.fb_page_access_token.trim();
    if (!token) {
      toast.error("Paste your access token first");
      return;
    }
    setIsDiscovering(true);
    setDiscoveryError(null);
    setDiscovered(null);
    try {
      const res = await fetch(`${baseUrl}/api/lead-forms/${companyId}/discover`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ accessToken: token }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || `HTTP ${res.status}`);
      const pages = (data.pages || []) as DiscoveredPage[];
      setDiscovered(pages);
      const totalForms = pages.reduce((acc, p) => acc + p.forms.length, 0);
      if (pages.length === 0) {
        toast.info("No pages found for this token");
      } else {
        toast.success(`Found ${pages.length} page${pages.length === 1 ? "" : "s"} · ${totalForms} lead form${totalForms === 1 ? "" : "s"}`);
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      setDiscoveryError(msg);
      toast.error(`Discover failed: ${msg}`);
    } finally {
      setIsDiscovering(false);
    }
  };

  // Auto-subscribe: subscribe the chosen Page to the App's leadgen
  // events. This is the step that's most often missed when doing it
  // manually — we fire it silently when the user picks a Page so
  // webhooks just work after Save.
  const autoSubscribePage = async (pageId: string, pageAccessToken: string) => {
    setAutoSubscribeStatus("pending");
    setAutoSubscribeError(null);
    try {
      const res = await fetch(`${baseUrl}/api/lead-forms/${companyId}/auto-subscribe`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pageId, pageAccessToken }),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) throw new Error(data.error || `HTTP ${res.status}`);
      setAutoSubscribeStatus("ok");
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      setAutoSubscribeStatus("fail");
      setAutoSubscribeError(msg);
    }
  };

  const handlePagePick = (pageId: string) => {
    if (!discovered) return;
    const page = discovered.find((p) => p.id === pageId);
    if (!page) return;
    setDraft((d) => ({
      ...d,
      fb_page_id: page.id,
      fb_page_access_token: page.access_token,
      fb_form_id: "", // reset, user picks a form next
      label: d.label || page.name,
    }));
    autoSubscribePage(page.id, page.access_token);
  };

  const handleFormPick = (formId: string) => {
    if (!discovered) return;
    const page = discovered.find((p) => p.id === draft.fb_page_id);
    const form = page?.forms.find((f) => f.id === formId);
    if (!page || !form) return;
    setDraft((d) => ({
      ...d,
      fb_form_id: form.id,
      label: `${page.name} — ${form.name}`,
    }));
  };

  const saveForm = async () => {
    if (!draft.fb_form_id.trim() || !draft.fb_page_id.trim() || !draft.label.trim()) {
      toast.error("Form id, page id, and label are required");
      return;
    }
    if (!draft.auto_reply_template.trim()) {
      toast.error("Auto-reply message can't be empty");
      return;
    }
    setIsSavingForm(true);
    try {
      const url = editingId
        ? `${baseUrl}/api/lead-forms/${companyId}/${editingId}`
        : `${baseUrl}/api/lead-forms/${companyId}`;
      const res = await fetch(url, {
        method: editingId ? "PATCH" : "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...draft, phoneIndex }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || `HTTP ${res.status}`);
      }
      toast.success(editingId ? "Form updated" : "Form connected");
      setShowFormModal(false);
      fetchAll();
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      toast.error(`Save failed: ${msg}`);
    } finally {
      setIsSavingForm(false);
    }
  };

  const disconnectForm = async (f: LeadForm) => {
    if (!confirm(`Disconnect "${f.label}"? Existing leads keep working but new ones will be ignored.`)) return;
    try {
      const res = await fetch(`${baseUrl}/api/lead-forms/${companyId}/${f.id}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      toast.success("Form disconnected");
      fetchAll();
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      toast.error(`Disconnect failed: ${msg}`);
    }
  };

  const sendTest = async (f: LeadForm) => {
    // Prompt for the phone we should send the test message to. Keeping
    // it in sessionStorage so re-clicking Test on different forms in
    // the same session doesn't re-prompt cold every time.
    const input = window.prompt(
      "Send a test message to which phone number?\n\n" +
        "Use international format with country code, no '+' or spaces (e.g. 60123456789).\n\n" +
        "Leave blank to just preview the rendered message without sending.",
      lastTestPhone,
    );
    // null === user clicked Cancel; empty string === preview-only.
    if (input === null) return;
    const toPhone = input.trim();
    if (toPhone) {
      try { sessionStorage.setItem("mb_lead_form_last_test_phone", toPhone); } catch {}
      setLastTestPhone(toPhone);
    }

    try {
      const res = await fetch(`${baseUrl}/api/lead-forms/${companyId}/${f.id}/test`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phoneIndex, toPhone: toPhone || undefined }),
      });
      if (!res.ok) {
        const errBody = await res.json().catch(() => ({}));
        throw new Error(errBody.error || `HTTP ${res.status}`);
      }
      const data = await res.json();
      if (data.deliveryStatus === "sent") {
        toast.success(`Test sent to ${toPhone} — check WhatsApp`);
      } else if (data.deliveryStatus === "skipped") {
        toast.info("Preview only — no phone supplied. Lead saved with status 'skipped'.");
      } else if (data.deliveryStatus === "failed") {
        toast.error(`Send failed: ${data.deliveryError || "unknown"}`);
      } else {
        toast.info("Test recorded");
      }
      // Refresh both the leads table and the form list so total-leads counter ticks up.
      fetchLeads();
      fetchAll();
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      toast.error(`Test failed: ${msg}`);
    }
  };

  // ─────────── webhook helpers ───────────
  const copy = async (label: string, text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success(`${label} copied`);
    } catch {
      toast.error("Couldn't copy — copy manually");
    }
  };

  const rotateToken = async () => {
    if (!confirm("Rotate the verify token? You'll need to re-paste it into Meta.")) return;
    setIsRotatingToken(true);
    try {
      const res = await fetch(`${baseUrl}/api/lead-forms/${companyId}/webhook-info/rotate`, {
        method: "POST",
        credentials: "include",
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setWebhookInfo(data);
      toast.success("Verify token rotated");
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      toast.error(`Rotate failed: ${msg}`);
    } finally {
      setIsRotatingToken(false);
    }
  };

  // ─────────── render helpers ───────────
  const renderTemplatePreview = (tpl: string) => {
    if (!tpl) return <span className="text-slate-400">No message set</span>;
    const trimmed = tpl.length > 220 ? tpl.slice(0, 217) + "…" : tpl;
    return (
      <pre className="whitespace-pre-wrap font-sans text-xs text-slate-600 leading-relaxed">
        {trimmed}
      </pre>
    );
  };

  const formatTime = (iso?: string | null) => {
    if (!iso) return "—";
    try {
      return new Date(iso).toLocaleString();
    } catch {
      return iso;
    }
  };

  const statusBadge = (status: LeadEntry["delivery_status"]) => {
    const map: Record<LeadEntry["delivery_status"], string> = {
      sent:    "bg-emerald-50 text-emerald-700 border-emerald-200",
      queued:  "bg-amber-50 text-amber-700 border-amber-200",
      failed:  "bg-rose-50 text-rose-700 border-rose-200",
      skipped: "bg-slate-100 text-slate-500 border-slate-200",
    };
    return (
      <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded border ${map[status]}`}>
        {status}
      </span>
    );
  };

  // ─────────── markup ───────────
  return (
    <div className="p-4 md:p-6 max-w-6xl mx-auto">
      <ToastContainer position="top-right" autoClose={3000} />

      {/* Header */}
      <div className="flex items-start justify-between gap-3 mb-6 flex-wrap">
        <div>
          <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Lucide icon="Inbox" className="w-5 h-5 text-adletic-orange" />
            Lead Forms
          </h1>
          <p className="text-xs text-slate-500 mt-1 max-w-xl">
            Connect a Facebook Lead Ad to your inbox. The moment a lead is submitted,
            we send your auto-reply by WhatsApp and route the conversation here.
          </p>
        </div>
        <Button
          variant="primary"
          className="!bg-adletic-orange !border-adletic-orange hover:!bg-orange-600 flex items-center gap-1.5"
          onClick={openAddModal}
          disabled={!companyId}
        >
          <Lucide icon="Plus" className="w-4 h-4" />
          Connect a form
        </Button>
      </div>

      {/* Webhook setup card */}
      <div className="border border-slate-200 rounded-xl bg-white p-4 md:p-5 mb-6">
        <div className="flex items-start justify-between gap-3 mb-3">
          <div>
            <h2 className="text-sm font-semibold text-slate-900">Webhook setup</h2>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Paste these into Meta &rsaquo; Webhooks &rsaquo; <em>leadgen</em> when subscribing your page.
            </p>
          </div>
          <button
            type="button"
            onClick={rotateToken}
            disabled={isRotatingToken || !webhookInfo}
            className="text-[11px] font-medium text-slate-500 hover:text-rose-600 transition-colors disabled:opacity-50 flex items-center gap-1"
          >
            {isRotatingToken ? (
              <LoadingIcon icon="oval" className="w-3 h-3" />
            ) : (
              <Lucide icon="RefreshCw" className="w-3 h-3" />
            )}
            Rotate token
          </button>
        </div>

        <div className="grid md:grid-cols-2 gap-3">
          <FieldRow
            label="Callback URL"
            value={webhookInfo?.url || ""}
            placeholder="Loading…"
            onCopy={() => webhookInfo && copy("Callback URL", webhookInfo.url)}
            mono
          />
          <FieldRow
            label="Verify Token"
            value={webhookInfo?.verify_token || ""}
            placeholder="Loading…"
            onCopy={() => webhookInfo && copy("Verify Token", webhookInfo.verify_token)}
            mono
            secret
          />
        </div>
      </div>

      {/* Connected forms */}
      <div className="mb-6">
        <h2 className="text-sm font-semibold text-slate-900 mb-3">Connected forms</h2>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <LoadingIcon icon="oval" className="w-6 h-6 text-adletic-orange" />
          </div>
        ) : forms.length === 0 ? (
          <div className="border border-dashed border-slate-300 rounded-xl bg-slate-50 p-8 text-center">
            <Lucide icon="Inbox" className="w-8 h-8 mx-auto text-slate-300 mb-2" />
            <p className="text-sm text-slate-600 font-medium">No forms connected yet</p>
            <p className="text-xs text-slate-400 mt-1">
              Click <strong>Connect a form</strong> above to get started.
            </p>
          </div>
        ) : (
          <div className="grid gap-3">
            {forms.map((f) => (
              <div key={f.id} className="border border-slate-200 rounded-xl bg-white p-4 hover:border-slate-300 transition-colors">
                <div className="flex items-start justify-between gap-3 mb-3 flex-wrap">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="text-sm font-semibold text-slate-900 truncate">{f.label}</h3>
                      {f.is_active ? (
                        <span className="text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">Active</span>
                      ) : (
                        <span className="text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-slate-100 text-slate-500 border border-slate-200">Paused</span>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      <span className="font-mono">{f.fb_page_name || f.fb_page_id}</span>
                      {" · "}
                      Form <span className="font-mono">{f.fb_form_id}</span>
                    </p>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <button onClick={() => sendTest(f)} className="p-1.5 text-slate-500 hover:text-adletic-orange transition-colors" title="Send a test lead">
                      <Lucide icon="Zap" className="w-4 h-4" />
                    </button>
                    <button onClick={() => openEditModal(f)} className="p-1.5 text-slate-500 hover:text-slate-900 transition-colors" title="Edit">
                      <Lucide icon="Pencil" className="w-4 h-4" />
                    </button>
                    <button onClick={() => disconnectForm(f)} className="p-1.5 text-slate-500 hover:text-rose-600 transition-colors" title="Disconnect">
                      <Lucide icon="X" className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 mb-3">
                  {renderTemplatePreview(f.auto_reply_template)}
                </div>

                <div className="flex items-center gap-4 text-[11px] text-slate-500">
                  <span className="flex items-center gap-1">
                    <Lucide icon="Users" className="w-3 h-3" />
                    <strong className="text-slate-700">{f.total_leads}</strong> total leads
                  </span>
                  <span className="flex items-center gap-1">
                    <Lucide icon="Clock" className="w-3 h-3" />
                    Last lead {formatTime(f.last_lead_at)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Recent leads */}
      <div>
        <div className="flex items-center justify-between gap-3 mb-3">
          <h2 className="text-sm font-semibold text-slate-900">Recent leads</h2>
          <button
            onClick={fetchLeads}
            disabled={isLoadingLeads}
            className="text-[11px] font-medium text-slate-500 hover:text-slate-900 transition-colors flex items-center gap-1 disabled:opacity-50"
          >
            {isLoadingLeads ? (
              <LoadingIcon icon="oval" className="w-3 h-3" />
            ) : (
              <Lucide icon="RefreshCw" className="w-3 h-3" />
            )}
            Refresh
          </button>
        </div>

        {isLoadingLeads && leads.length === 0 ? (
          <div className="flex items-center justify-center py-8">
            <LoadingIcon icon="oval" className="w-5 h-5 text-adletic-orange" />
          </div>
        ) : leads.length === 0 ? (
          <p className="text-xs text-slate-400 italic">No leads yet — they'll show up here as soon as your first form fires.</p>
        ) : (
          <div className="border border-slate-200 rounded-xl bg-white overflow-hidden">
            <table className="w-full text-xs">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="text-left px-3 py-2 font-semibold text-slate-600 uppercase tracking-wider text-[10px]">Time</th>
                  <th className="text-left px-3 py-2 font-semibold text-slate-600 uppercase tracking-wider text-[10px]">Form</th>
                  <th className="text-left px-3 py-2 font-semibold text-slate-600 uppercase tracking-wider text-[10px]">Lead</th>
                  <th className="text-left px-3 py-2 font-semibold text-slate-600 uppercase tracking-wider text-[10px]">Status</th>
                </tr>
              </thead>
              <tbody>
                {leads.map((lead) => (
                  <tr key={lead.id} className="border-b border-slate-100 last:border-0 hover:bg-slate-50">
                    <td className="px-3 py-2 text-slate-500">{formatTime(lead.created_at)}</td>
                    <td className="px-3 py-2 text-slate-700">{lead.form_label}</td>
                    <td className="px-3 py-2">
                      <p className="font-medium text-slate-900">{lead.full_name || "—"}</p>
                      {lead.phone && <p className="text-slate-500 text-[10px]">{lead.phone}</p>}
                      {lead.email && <p className="text-slate-500 text-[10px]">{lead.email}</p>}
                    </td>
                    <td className="px-3 py-2">
                      {statusBadge(lead.delivery_status)}
                      {lead.delivery_error && (
                        <p className="text-rose-600 text-[10px] mt-0.5 truncate max-w-[220px]" title={lead.delivery_error}>
                          {lead.delivery_error}
                        </p>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add / edit modal */}
      <Dialog open={showFormModal} onClose={() => setShowFormModal(false)} size="lg">
        <Dialog.Panel className="p-5">
          <Dialog.Title className="flex items-center gap-2">
            <Lucide icon="Inbox" className="w-5 h-5 text-adletic-orange" />
            <span className="font-semibold">{editingId ? "Edit lead form" : "Connect a Facebook lead form"}</span>
          </Dialog.Title>

          <div className="mt-4 grid gap-3">

            {/* ── Step 1 — paste token + discover ─────────────────── */}
            <div>
              <label className="block text-[11px] font-semibold uppercase tracking-wider text-slate-600 mb-1">
                {editingId ? "Page Access Token (paste to update)" : "1. Paste a Facebook access token"}
              </label>
              <div className="flex gap-2">
                <div className="flex-1">
                  <Field
                    label=""
                    value={draft.fb_page_access_token}
                    onChange={(v) => { setDraft({ ...draft, fb_page_access_token: v }); resetDiscovery(); }}
                    placeholder="EAAB…"
                    mono
                    type="password"
                  />
                </div>
                <button
                  type="button"
                  onClick={runDiscover}
                  disabled={isDiscovering || !draft.fb_page_access_token.trim()}
                  className="self-start mt-0 px-3 h-[34px] inline-flex items-center gap-1.5 text-[11px] font-semibold rounded-lg bg-adletic-orange text-white hover:bg-orange-600 disabled:opacity-50 transition-colors"
                  title="Look up your pages + lead forms from this token"
                >
                  {isDiscovering ? <LoadingIcon icon="oval" className="w-3 h-3" /> : <Lucide icon="Search" className="w-3.5 h-3.5" />}
                  {isDiscovering ? "Discovering…" : "Discover"}
                </button>
              </div>
              <p className="text-[10px] text-slate-500 mt-1">
                {editingId ? (
                  "Leave blank to keep the existing token. Paste a fresh one + click Discover to rotate."
                ) : (
                  <>
                    Use a User token (with <code className="bg-slate-100 px-1 rounded">leads_retrieval</code>,{" "}
                    <code className="bg-slate-100 px-1 rounded">pages_show_list</code>,{" "}
                    <code className="bg-slate-100 px-1 rounded">pages_manage_metadata</code>) from the{" "}
                    <a className="text-adletic-orange hover:underline" href="https://developers.facebook.com/tools/explorer/" target="_blank" rel="noreferrer">Graph API Explorer</a>{" "}
                    — we'll list your pages + forms. Or paste a Page Access Token directly if you already have one.
                  </>
                )}
              </p>
              {discoveryError && (
                <p className="text-[10px] text-rose-600 mt-1">{discoveryError}</p>
              )}
            </div>

            {/* ── Step 2 — pick page + form (only when discovery succeeded) ── */}
            {discovered && discovered.length > 0 && (
              <div className="grid md:grid-cols-2 gap-3 p-3 bg-emerald-50/50 border border-emerald-200/70 rounded-lg">
                <div className="md:col-span-2 flex items-center gap-2">
                  <Lucide icon="CheckCircle2" className="w-4 h-4 text-emerald-600" />
                  <p className="text-[11px] font-semibold text-emerald-700">
                    Discovered {discovered.length} page{discovered.length === 1 ? "" : "s"} — pick one
                  </p>
                  {autoSubscribeStatus === "pending" && (
                    <span className="ml-auto text-[10px] text-slate-500 flex items-center gap-1">
                      <LoadingIcon icon="oval" className="w-3 h-3" />
                      Subscribing webhook…
                    </span>
                  )}
                  {autoSubscribeStatus === "ok" && (
                    <span className="ml-auto text-[10px] text-emerald-700 flex items-center gap-1 font-semibold">
                      <Lucide icon="CheckCircle2" className="w-3 h-3" />
                      Page subscribed
                    </span>
                  )}
                  {autoSubscribeStatus === "fail" && (
                    <span className="ml-auto text-[10px] text-rose-600 flex items-center gap-1" title={autoSubscribeError || ""}>
                      <Lucide icon="AlertCircle" className="w-3 h-3" />
                      Subscribe failed (will retry on save)
                    </span>
                  )}
                </div>
                <div>
                  <label className="block text-[11px] font-semibold uppercase tracking-wider text-slate-600 mb-1">2. Page</label>
                  <select
                    value={draft.fb_page_id}
                    onChange={(e) => handlePagePick(e.target.value)}
                    className="w-full px-3 py-2 text-xs text-slate-800 bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-adletic-orange focus:ring-2 focus:ring-orange-100"
                  >
                    <option value="">— pick a page —</option>
                    {discovered.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name} {p.forms.length ? `(${p.forms.length} form${p.forms.length === 1 ? "" : "s"})` : "(no forms)"}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-semibold uppercase tracking-wider text-slate-600 mb-1">3. Lead form</label>
                  <select
                    value={draft.fb_form_id}
                    onChange={(e) => handleFormPick(e.target.value)}
                    disabled={!draft.fb_page_id}
                    className="w-full px-3 py-2 text-xs text-slate-800 bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-adletic-orange focus:ring-2 focus:ring-orange-100 disabled:opacity-50"
                  >
                    <option value="">— pick a form —</option>
                    {(discovered.find((p) => p.id === draft.fb_page_id)?.forms || []).map((f) => (
                      <option key={f.id} value={f.id}>
                        {f.name}{f.status ? ` · ${f.status}` : ""}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            )}

            {/* ── Manual fallback — visible when discovery hasn't run ── */}
            {(!discovered || discovered.length === 0) && (
              <div className="grid md:grid-cols-2 gap-3">
                <Field
                  label="Form ID (manual)"
                  hint="Or click Discover above to pick from a list"
                  value={draft.fb_form_id}
                  onChange={(v) => setDraft({ ...draft, fb_form_id: v })}
                  placeholder="e.g. 123456789012345"
                  mono
                />
                <Field
                  label="Page ID (manual)"
                  hint="Or click Discover above to pick from a list"
                  value={draft.fb_page_id}
                  onChange={(v) => setDraft({ ...draft, fb_page_id: v })}
                  placeholder="e.g. 100123456789012"
                  mono
                />
              </div>
            )}

            <Field
              label="Label"
              hint="Internal name — only your team sees this"
              value={draft.label}
              onChange={(v) => setDraft({ ...draft, label: v })}
              placeholder="e.g. Adletic Lead Magnet — Q2"
            />
            <div>
              <label className="block text-[11px] font-semibold uppercase tracking-wider text-slate-600 mb-1">
                Auto-reply message
              </label>
              <textarea
                value={draft.auto_reply_template}
                onChange={(e) => setDraft({ ...draft, auto_reply_template: e.target.value })}
                rows={8}
                className="w-full px-3 py-2 text-xs text-slate-800 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-adletic-orange focus:ring-2 focus:ring-orange-100 resize-y leading-relaxed"
                placeholder="Hi {{name}} — thanks for reaching out!"
              />
              <p className="text-[10px] text-slate-500 mt-1.5">
                Tokens you can use: <code className="bg-slate-100 px-1 rounded">{"{{name}}"}</code>{" "}
                <code className="bg-slate-100 px-1 rounded">{"{{email}}"}</code>{" "}
                <code className="bg-slate-100 px-1 rounded">{"{{phone}}"}</code>{" "}
                <code className="bg-slate-100 px-1 rounded">{"{{form_label}}"}</code>
              </p>
            </div>

            {/* Optional image attachment — uploaded directly from the
                user's device (no public URL hosting needed). The file is
                read as a base64 data: URL via FileReader and stored in
                the same field; the server detects data: URLs and builds
                a MessageMedia(mime, base64) directly. Cap at 4 MB raw
                so the base64 payload stays well under the 50 MB Express
                body limit. */}
            <MediaUploadField
              value={draft.auto_reply_image_url}
              onChange={(v) => setDraft({ ...draft, auto_reply_image_url: v })}
            />
          </div>

          <div className="flex items-center justify-end gap-2 mt-5 pt-4 border-t border-slate-200">
            <Button variant="secondary" onClick={() => setShowFormModal(false)}>Cancel</Button>
            <Button
              variant="primary"
              className="!bg-adletic-orange !border-adletic-orange hover:!bg-orange-600 flex items-center gap-1.5"
              onClick={saveForm}
              disabled={isSavingForm}
            >
              {isSavingForm && <LoadingIcon icon="oval" className="w-3 h-3" />}
              {editingId ? "Save changes" : "Connect form"}
            </Button>
          </div>
        </Dialog.Panel>
      </Dialog>
    </div>
  );
};

// ─────────── small subcomponents ───────────

interface FieldRowProps {
  label: string;
  value: string;
  placeholder?: string;
  onCopy: () => void;
  mono?: boolean;
  secret?: boolean;
}

const FieldRow: React.FC<FieldRowProps> = ({ label, value, placeholder, onCopy, mono, secret }) => {
  const [revealed, setRevealed] = useState(!secret);
  const display = revealed ? value : value.replace(/./g, "•");
  return (
    <div>
      <label className="block text-[11px] font-semibold uppercase tracking-wider text-slate-600 mb-1">
        {label}
      </label>
      <div className="flex items-center gap-2">
        <input
          readOnly
          value={display}
          placeholder={placeholder}
          className={`flex-1 px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-700 ${mono ? "font-mono" : ""}`}
        />
        {secret && (
          <button
            type="button"
            onClick={() => setRevealed((r) => !r)}
            className="text-slate-500 hover:text-slate-900 transition-colors p-1"
            title={revealed ? "Hide" : "Reveal"}
          >
            <Lucide icon={revealed ? "EyeOff" : "Eye"} className="w-4 h-4" />
          </button>
        )}
        <button
          type="button"
          onClick={onCopy}
          disabled={!value}
          className="text-slate-500 hover:text-adletic-orange transition-colors p-1 disabled:opacity-40"
          title="Copy"
        >
          <Lucide icon="Copy" className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

// ── MediaUploadField ──────────────────────────────────────────────────
//
// File picker that converts the chosen media to a base64 data: URL and
// stores it in `value`. The server treats data: URLs the same as https
// URLs for MessageMedia, so the user never needs a public host.
//
// Accepts: JPG / PNG / GIF / WebP / MP4 / WebM. Anything starting with
// "image/" or "video/" is fine.
//
// Why MP4 too: WhatsApp only animates GIFs reliably when they're sent
// as MP4 with `sendVideoAsGif: true` (the server adds that flag for
// any video/* mime). So if the user wants an animated GIF, they should
// upload an MP4 — this is what most GIF-export tools (Giphy, etc.)
// already produce.
//
// Limit: 8 MB raw — bigger than the 4 MB image cap because short MP4
// "GIFs" routinely run 5–7 MB. Base64 expands by ~33 %, still fits well
// under the server's 50 MB body limit.
const MEDIA_MAX_BYTES = 8 * 1024 * 1024;

const MediaUploadField: React.FC<{
  value: string;
  onChange: (v: string) => void;
}> = ({ value, onChange }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [reading, setReading] = useState(false);

  // Sniff the mime out of a data: URL so we can decide whether to render
  // the preview as <video> (MP4/WebM) or <img> (everything else).
  const valueMime = (() => {
    const m = /^data:([^;,]+)/.exec(value || "");
    return m ? m[1] : "";
  })();
  const isVideo = valueMime.startsWith("video/");

  const onPick = (file: File | undefined) => {
    if (!file) return;
    const ok = file.type.startsWith("image/") || file.type.startsWith("video/");
    if (!ok) {
      toast.error("Pick an image (JPG / PNG / GIF / WebP) or video (MP4 / WebM).");
      return;
    }
    if (file.size > MEDIA_MAX_BYTES) {
      const mb = (file.size / 1024 / 1024).toFixed(1);
      toast.error(`File is ${mb} MB — max is 8 MB. Compress it first.`);
      return;
    }
    setReading(true);
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = String(reader.result || "");
      if (!dataUrl.startsWith("data:")) {
        toast.error("Couldn't read that file. Try another one.");
        setReading(false);
        return;
      }
      onChange(dataUrl);
      setReading(false);
    };
    reader.onerror = () => {
      toast.error("FileReader failed. Try another file.");
      setReading(false);
    };
    reader.readAsDataURL(file);
  };

  return (
    <div>
      <label className="block text-[11px] font-semibold uppercase tracking-wider text-slate-600 mb-1">
        Image / GIF / video (optional)
      </label>
      <div className="flex items-start gap-3">
        {value ? (
          <div className="relative shrink-0">
            {isVideo ? (
              <video
                src={value}
                muted
                loop
                playsInline
                autoPlay
                className="h-16 w-16 object-cover rounded-lg border border-slate-200 bg-black"
              />
            ) : (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={value}
                alt="Auto-reply attachment preview"
                className="h-16 w-16 object-cover rounded-lg border border-slate-200"
                onError={(e) => { (e.currentTarget as HTMLImageElement).style.opacity = "0.3"; }}
              />
            )}
            <button
              type="button"
              onClick={() => onChange("")}
              title="Remove attachment"
              className="absolute -top-1.5 -right-1.5 h-5 w-5 rounded-full bg-slate-900 text-white flex items-center justify-center hover:bg-rose-600 transition-colors"
            >
              <Lucide icon="X" className="w-3 h-3" />
            </button>
            {isVideo && (
              <span className="absolute bottom-1 left-1 px-1 py-0.5 rounded text-[8px] font-bold uppercase tracking-wider bg-black/60 text-white">
                GIF
              </span>
            )}
          </div>
        ) : (
          <div className="h-16 w-16 shrink-0 flex items-center justify-center rounded-lg border border-dashed border-slate-300 bg-slate-50">
            <Lucide icon="Image" className="w-5 h-5 text-slate-300" />
          </div>
        )}
        <div className="flex-1">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*,video/mp4,video/webm,video/quicktime"
            className="hidden"
            onChange={(e) => onPick(e.target.files?.[0])}
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={reading}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-semibold rounded-lg border border-slate-200 bg-white text-slate-700 hover:border-adletic-orange hover:text-adletic-orange transition-colors disabled:opacity-50"
          >
            {reading ? (
              <LoadingIcon icon="oval" className="w-3 h-3" />
            ) : (
              <Lucide icon={value ? "RefreshCw" : "Upload"} className="w-3.5 h-3.5" />
            )}
            {reading ? "Reading…" : value ? "Replace" : "Upload"}
          </button>
          <p className="text-[10px] text-slate-500 mt-1.5">
            Pick a JPG, PNG, GIF, WebP, MP4, or WebM. The auto-reply text
            becomes its caption. Max 8 MB.
          </p>
          <p className="text-[10px] text-slate-400 mt-0.5 italic">
            For an animated GIF, upload it as MP4 — WhatsApp will play it
            as a looping GIF. Static GIF files often display as a still image.
          </p>
        </div>
      </div>
    </div>
  );
};

interface FieldProps {
  label: string;
  hint?: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  mono?: boolean;
  type?: "text" | "password";
}

const Field: React.FC<FieldProps> = ({ label, hint, value, onChange, placeholder, mono, type = "text" }) => {
  const [revealed, setRevealed] = useState(false);
  const isSecret = type === "password";
  return (
    <div>
      {label && (
        <label className="block text-[11px] font-semibold uppercase tracking-wider text-slate-600 mb-1">
          {label}
        </label>
      )}
      <div className="relative">
        <input
          type={isSecret && !revealed ? "password" : "text"}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          autoComplete={isSecret ? "off" : undefined}
          className={`w-full px-3 py-2 text-xs text-slate-800 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-adletic-orange focus:ring-2 focus:ring-orange-100 ${mono ? "font-mono" : ""} ${isSecret ? "pr-9" : ""}`}
        />
        {isSecret && (
          <button
            type="button"
            onClick={() => setRevealed((r) => !r)}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-900 p-0.5"
            title={revealed ? "Hide" : "Reveal"}
          >
            <Lucide icon={revealed ? "EyeOff" : "Eye"} className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
      {hint && <p className="text-[10px] text-slate-500 mt-1">{hint}</p>}
    </div>
  );
};

export default LeadFormsPage;
