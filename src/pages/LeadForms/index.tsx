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

import React, { useState, useEffect, useCallback } from "react";
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
  });

  // Remember the last phone used for "Send test" so the user doesn't
  // re-type it. Per-tab via sessionStorage is enough.
  const [lastTestPhone, setLastTestPhone] = useState<string>(() => {
    try { return sessionStorage.getItem("mb_lead_form_last_test_phone") || ""; } catch { return ""; }
  });
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
  const openAddModal = () => {
    setEditingId(null);
    setDraft({ fb_form_id: "", fb_page_id: "", fb_page_access_token: "", label: "", auto_reply_template: DEFAULT_TEMPLATE });
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
    });
    setShowFormModal(true);
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
            <div className="grid md:grid-cols-2 gap-3">
              <Field
                label="Form ID"
                hint="From Meta Ads Manager → Lead form → Form details"
                value={draft.fb_form_id}
                onChange={(v) => setDraft({ ...draft, fb_form_id: v })}
                placeholder="e.g. 123456789012345"
                mono
              />
              <Field
                label="Page ID"
                hint="The Facebook Page that owns the form"
                value={draft.fb_page_id}
                onChange={(v) => setDraft({ ...draft, fb_page_id: v })}
                placeholder="e.g. 100123456789012"
                mono
              />
            </div>
            <Field
              label="Label"
              hint="Internal name — only your team sees this"
              value={draft.label}
              onChange={(v) => setDraft({ ...draft, label: v })}
              placeholder="e.g. Adletic Lead Magnet — Q2"
            />
            <Field
              label={editingId ? "Page Access Token (paste to update)" : "Page Access Token"}
              hint={
                editingId
                  ? "Leave blank to keep the existing token. Paste a fresh one to rotate."
                  : "Long-lived Page Access Token from Meta Graph API. Required so we can fetch lead details when a submission fires."
              }
              value={draft.fb_page_access_token}
              onChange={(v) => setDraft({ ...draft, fb_page_access_token: v })}
              placeholder="EAAB…"
              mono
              type="password"
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
      <label className="block text-[11px] font-semibold uppercase tracking-wider text-slate-600 mb-1">
        {label}
      </label>
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
