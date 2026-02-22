import React, { useState, useEffect, useRef } from "react";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Button from "@/components/Base/Button";
import Lucide from "@/components/Base/Lucide";
import axios from "axios";

interface ContactMetrics {
    daysSinceLastMessage?: number;
    totalMessages?: number;
    aiIntent?: string;
    aiSentiment?: string;
    aiStage?: string;
    hasActiveFollowup?: boolean;
}

interface Contact {
    id: string;
    name?: string;
    phone?: string;
    email?: string;
    tags?: string[];
    stage?: string;
    score?: number;
    reason?: string;
    metrics?: ContactMetrics;
}

interface PipelineStats {
    totalAnalyzed: number;
    leakedRevenue: number;
    activeOpportunities: number;
    warmLeads: number;
    hotLeads: number;
    coldLeads?: number;
    leakedLeads?: number;
    conversionRate?: number;
}

const INTENT_LABELS: Record<string, { label: string; color: string }> = {
    inquiry: { label: 'Inquiry', color: 'bg-blue-100 text-blue-700' },
    purchase: { label: 'Ready to Buy', color: 'bg-green-100 text-green-700' },
    support: { label: 'Support', color: 'bg-yellow-100 text-yellow-700' },
    complaint: { label: 'Complaint', color: 'bg-red-100 text-red-700' },
    feedback: { label: 'Feedback', color: 'bg-purple-100 text-purple-700' },
    general: { label: 'General', color: 'bg-gray-100 text-gray-500' },
    spam: { label: 'Spam', color: 'bg-gray-100 text-gray-400' },
};

const SENTIMENT_DOT: Record<string, string> = {
    positive: 'bg-green-400',
    negative: 'bg-red-400',
    neutral: 'bg-gray-400',
};

const STAGE_CFG = {
    hot: { label: 'HOT', dot: 'bg-[#f97316]', color: '#f97316', icon: '🔥' },
    warm: { label: 'WARM', dot: 'bg-[#eab308]', color: '#eab308', icon: '☀️' },
    cold: { label: 'COLD', dot: 'bg-[#3b82f6]', color: '#3b82f6', icon: '❄️' },
    leaked: { label: 'LEAKED', dot: 'bg-[#ef4444]', color: '#ef4444', icon: '💧' },
};

function timeAgo(iso: string) {
    const diff = Date.now() - new Date(iso).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'just now';
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    return `${Math.floor(hrs / 24)}d ago`;
}

function ScoreBar({ score }: { score: number }) {
    const color = score >= 75 ? '#f97316' : score >= 50 ? '#eab308' : score >= 30 ? '#3b82f6' : '#ef4444';
    return (
        <div className="flex items-center gap-2 mt-2">
            <div className="flex-1 h-1.5 bg-gray-100 border border-[#4b4b4b] overflow-hidden">
                <div className="h-full transition-all" style={{ width: `${score}%`, backgroundColor: color }} />
            </div>
            <span className="text-[9px] font-black text-[#4b4b4b] tabular-nums w-5 text-right">{score}</span>
        </div>
    );
}

function ContactCard({ contact }: { contact: Contact }) {
    const intent = contact.metrics?.aiIntent;
    const sentiment = contact.metrics?.aiSentiment;
    const days = contact.metrics?.daysSinceLastMessage;
    const intentCfg = intent ? INTENT_LABELS[intent] : null;
    const sentimentDot = sentiment ? SENTIMENT_DOT[sentiment] : null;

    return (
        <div className="bg-white border-[2.5px] border-[#4b4b4b] p-4 shadow-[4px_4px_0_#4b4b4b] hover:shadow-[5px_5px_0_#f26522] hover:-translate-y-[2px] hover:-translate-x-[2px] transition-transform cursor-pointer group">
            <div className="flex items-start justify-between gap-2 mb-1">
                <div className="min-w-0">
                    <div className="font-black text-[#4b4b4b] text-sm uppercase tracking-wider truncate group-hover:text-[#f26522] transition-colors">
                        {contact.name || contact.phone || contact.id}
                    </div>
                    <div className="text-[10px] font-bold text-gray-400 truncate flex items-center gap-1 mt-0.5">
                        <Lucide icon="Phone" className="w-3 h-3 stroke-[2.5] flex-shrink-0" />
                        {contact.phone || contact.id}
                    </div>
                </div>
                {sentimentDot && (
                    <div className={`w-2.5 h-2.5 rounded-full flex-shrink-0 mt-0.5 ${sentimentDot} border border-[#4b4b4b]`} title={`Sentiment: ${sentiment}`} />
                )}
            </div>

            <ScoreBar score={contact.score ?? 0} />

            {contact.reason && (
                <p className="text-[10px] text-gray-500 font-semibold mt-2 leading-snug line-clamp-2">{contact.reason}</p>
            )}

            <div className="flex flex-wrap items-center gap-1.5 mt-3">
                {intentCfg && (
                    <span className={`text-[9px] px-1.5 py-0.5 font-black uppercase tracking-wider rounded-sm ${intentCfg.color}`}>
                        {intentCfg.label}
                    </span>
                )}
                {contact.metrics?.hasActiveFollowup && (
                    <span className="text-[9px] px-1.5 py-0.5 font-black uppercase tracking-wider bg-purple-100 text-purple-700 rounded-sm">
                        Followup
                    </span>
                )}
                {typeof days === 'number' && (
                    <span className="text-[9px] px-1.5 py-0.5 font-black uppercase tracking-wider bg-gray-100 text-gray-500 rounded-sm ml-auto">
                        {days === 0 ? 'Today' : `${days}d ago`}
                    </span>
                )}
            </div>

            {(contact.tags || []).length > 0 && (
                <div className="flex flex-wrap gap-1 mt-2.5 pt-2.5 border-t border-dashed border-gray-200">
                    {(contact.tags || []).slice(0, 3).map((tag, i) => (
                        <span key={i} className="bg-white border-[1.5px] border-[#4b4b4b] text-[#4b4b4b] text-[9px] px-1.5 py-0.5 font-black uppercase tracking-widest shadow-[1px_1px_0_#4b4b4b]">
                            {tag}
                        </span>
                    ))}
                    {(contact.tags || []).length > 3 && (
                        <span className="text-[9px] text-gray-400 font-bold self-center">+{(contact.tags || []).length - 3}</span>
                    )}
                </div>
            )}
        </div>
    );
}

const STAGES = ['hot', 'warm', 'cold', 'leaked'] as const;
const BASE = import.meta.env.DEV ? 'http://localhost:3000' : 'https://bisnesgpt.jutateknologi.com';
const POLL_INTERVAL = 3000;

export default function ContactAudit() {
    const [status, setStatus] = useState<'idle' | 'running' | 'done' | 'error'>('idle');
    const [progress, setProgress] = useState(0);
    const [progressLabel, setProgressLabel] = useState('');
    const [completedAt, setCompletedAt] = useState<string | null>(null);
    const [stats, setStats] = useState<PipelineStats | null>(null);
    const [pipeline, setPipeline] = useState<Record<string, Contact[]>>({ hot: [], warm: [], cold: [], leaked: [] });
    const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);
    const companyIdRef = useRef<string | null>(null);

    // ── Helpers ──────────────────────────────────────────────────────────────

    function stopPolling() {
        if (pollRef.current) { clearInterval(pollRef.current); pollRef.current = null; }
    }

    function applyResults(data: any) {
        setPipeline(data.pipelineData || { hot: [], warm: [], cold: [], leaked: [] });
        setStats(data.stats || null);
        setCompletedAt(data.completedAt || null);
        setStatus('done');
        setProgress(100);
        stopPolling();
    }

    async function getCompanyId(): Promise<string | null> {
        if (companyIdRef.current) return companyIdRef.current;
        const userDataStr = localStorage.getItem('userData');
        if (!userDataStr) return null;
        const email = JSON.parse(userDataStr).email;
        const res = await axios.get(`${BASE}/api/user-context?email=${email}`);
        companyIdRef.current = res.data.companyId || null;
        return companyIdRef.current;
    }

    async function pollStatus(companyId: string) {
        try {
            const res = await axios.get(`${BASE}/api/audit/status/${companyId}`);
            const d = res.data;

            if (d.status === 'running') {
                setStatus('running');
                setProgress(d.progress ?? 0);
                setProgressLabel(d.progressLabel ?? 'Analysing…');
            } else if (d.status === 'done') {
                applyResults(d);
                toast.success(`AI Audit complete — ${d.stats?.totalAnalyzed ?? 0} contacts analysed.`);
            } else if (d.status === 'error') {
                setStatus('error');
                stopPolling();
                toast.error(`Audit failed: ${d.message}`);
            } else if (d.status === 'idle') {
                // Server restarted mid-audit — stop polling
                setStatus('idle');
                stopPolling();
            }
        } catch {
            // network hiccup — keep polling
        }
    }

    // ── On mount: check for existing/running audit ────────────────────────────
    useEffect(() => {
        (async () => {
            try {
                const companyId = await getCompanyId();
                if (!companyId) return;

                const res = await axios.get(`${BASE}/api/audit/status/${companyId}`);
                const d = res.data;

                if (d.status === 'done') {
                    applyResults(d);
                } else if (d.status === 'running') {
                    setStatus('running');
                    setProgress(d.progress ?? 0);
                    setProgressLabel(d.progressLabel ?? 'Analysing…');
                    // Resume polling
                    pollRef.current = setInterval(() => pollStatus(companyId), POLL_INTERVAL);
                }
            } catch {
                // ignore — just show empty state
            }
        })();

        return () => stopPolling();
    }, []);

    // ── Start audit ───────────────────────────────────────────────────────────
    async function startAudit() {
        try {
            const companyId = await getCompanyId();
            if (!companyId) { toast.error('Not authenticated'); return; }

            setStatus('running');
            setProgress(0);
            setProgressLabel('Starting…');
            stopPolling();

            // Business context is fetched automatically from the company's
            // existing AI assistant prompt — no form needed
            await axios.post(`${BASE}/api/audit/run`, { companyId });

            // Start polling
            pollRef.current = setInterval(() => pollStatus(companyId), POLL_INTERVAL);

        } catch (err: any) {
            const msg = err?.response?.data?.error || err?.message || 'Unknown error';
            toast.error(`Failed to start audit: ${msg}`);
            setStatus('idle');
        }
    }

    // ── Render ────────────────────────────────────────────────────────────────
    const isRunning = status === 'running';

    return (
        <div className="h-full bg-white relative flex flex-col font-['Inter'] rounded-tl-xl overflow-hidden border-l border-t border-slate-200">

            {/* Header */}
            <div className="flex w-full items-center justify-between pl-6 pr-6 pt-5 pb-5 sticky top-0 z-10 bg-white border-b-[3px] border-[#4b4b4b]">
                <div className="flex items-center gap-4">
                    <div className="p-2 sm:p-2.5 bg-white border-2 border-[#4b4b4b] shadow-[3px_3px_0_#4b4b4b]">
                        <Lucide icon="Wand2" className="w-6 h-6 text-[#4b4b4b]" />
                    </div>
                    <div>
                        <h2 className="text-lg sm:text-xl font-black text-[#4b4b4b] uppercase tracking-widest leading-none mb-1 mt-0.5">
                            AI Pipeline Audit
                        </h2>
                        <p className="text-[11px] font-bold text-gray-500 uppercase tracking-widest leading-none">
                            {completedAt
                                ? `Last run: ${timeAgo(completedAt)} · uses your AI assistant prompt`
                                : 'GPT reads every chat using your bot\'s business context'}
                        </p>
                    </div>
                </div>

                <Button
                    variant="primary"
                    onClick={startAudit}
                    disabled={isRunning}
                    className="bg-[#f26522] border-2 border-[#4b4b4b] text-white font-black uppercase tracking-wider text-[11px] sm:text-[12px] px-5 py-2.5 shadow-[3px_3px_0_#4b4b4b] hover:-translate-y-[2px] hover:-translate-x-[2px] hover:shadow-[5px_5px_0_#4b4b4b] transition-all disabled:opacity-75 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:hover:translate-x-0 disabled:hover:shadow-[3px_3px_0_#4b4b4b]"
                >
                    {isRunning ? (
                        <div className="flex items-center gap-2">
                            <Lucide icon="Loader" className="w-4 h-4 animate-spin" />
                            <span>{progressLabel || 'Analysing…'} {progress > 0 ? `${progress}%` : ''}</span>
                        </div>
                    ) : (
                        <div className="flex items-center gap-2">
                            <Lucide icon="Sparkles" className="w-4 h-4" />
                            {status === 'done' ? 'Re-run Audit' : 'Run AI Audit'}
                        </div>
                    )}
                </Button>
            </div>

            {/* Progress bar */}
            {isRunning && (
                <div className="w-full h-1 bg-gray-100 flex-shrink-0">
                    <div className="h-full bg-[#f26522] transition-all duration-700" style={{ width: `${progress}%` }} />
                </div>
            )}

            {/* Stats */}
            {stats && (
                <div className="p-6 flex-shrink-0 grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4 bg-[#f8fafc] border-b-[3px] border-[#4b4b4b]">
                    {[
                        { value: stats.totalAnalyzed, label: 'Analysed', color: '#3b82f6' },
                        { value: `RM ${stats.leakedRevenue.toLocaleString()}`, label: 'Revenue at Risk', color: '#ef4444' },
                        { value: stats.hotLeads, label: 'Hot Leads', color: '#f97316' },
                        { value: stats.warmLeads, label: 'Warm Leads', color: '#eab308' },
                        { value: stats.coldLeads ?? 0, label: 'Cold Leads', color: '#3b82f6' },
                        { value: `${stats.conversionRate ?? 0}%`, label: 'Hot Rate', color: '#10b981' },
                    ].map(({ value, label, color }) => (
                        <div key={label} className="text-center bg-white border-2 border-[#4b4b4b] p-4 hover:-translate-y-1 hover:-translate-x-1 transition-all duration-200" style={{ boxShadow: `4px 4px 0 ${color}` }}>
                            <div className="text-2xl font-black mb-1" style={{ color }}>{value}</div>
                            <div className="text-[10px] font-black uppercase tracking-widest text-[#4b4b4b]">{label}</div>
                        </div>
                    ))}
                </div>
            )}

            {/* Running banner (no results yet) */}
            {isRunning && !stats && (
                <div className="flex-1 flex flex-col items-center justify-center gap-4 text-center p-12 bg-slate-50">
                    <div className="w-16 h-16 border-[3px] border-[#4b4b4b] flex items-center justify-center text-3xl animate-pulse">
                        🤖
                    </div>
                    <div>
                        <p className="font-black text-[#4b4b4b] uppercase tracking-widest text-sm">{progressLabel || 'Analysing…'}</p>
                        <p className="text-gray-500 text-xs mt-1 max-w-xs">
                            You can navigate away — the audit runs in the background and results will be here when you return.
                        </p>
                    </div>
                    <div className="text-2xl font-black text-[#f26522]">{progress}%</div>
                </div>
            )}

            {/* Empty / idle state */}
            {status === 'idle' && !stats && (
                <div className="flex-1 flex flex-col items-center justify-center gap-4 text-center p-12 bg-slate-50">
                    <div className="w-16 h-16 border-[3px] border-dashed border-[#4b4b4b] flex items-center justify-center text-3xl">🤖</div>
                    <div>
                        <p className="font-black text-[#4b4b4b] uppercase tracking-widest text-sm">No audit yet</p>
                        <p className="text-gray-500 text-xs mt-1 max-w-xs">
                            Click <strong>Run AI Audit</strong> — GPT-4o reads every conversation, tags each contact, and builds your pipeline automatically.
                        </p>
                    </div>
                </div>
            )}

            {/* Pipeline board */}
            {stats && (
                <div className="flex-1 overflow-x-auto p-6 flex gap-6 bg-slate-50 min-h-0">
                    {STAGES.map(stage => {
                        const cfg = STAGE_CFG[stage];
                        const items = (pipeline[stage] || []) as Contact[];
                        return (
                            <div
                                key={stage}
                                className="flex-shrink-0 w-80 flex flex-col bg-white border-[3px] border-[#4b4b4b] max-h-full overflow-hidden"
                                style={{ boxShadow: `6px 6px 0 ${cfg.color}` }}
                            >
                                <div className="w-full bg-white border-b-[3px] border-[#4b4b4b] px-5 py-3.5 flex justify-between items-center flex-shrink-0">
                                    <span className="font-black text-sm uppercase tracking-widest flex items-center gap-2.5 text-[#4b4b4b]">
                                        <div className={`w-3 h-3 ${cfg.dot} border-2 border-[#4b4b4b]`} />
                                        {cfg.label}
                                    </span>
                                    <span className="text-[11px] font-black text-white px-2 py-0.5" style={{ backgroundColor: '#4b4b4b', boxShadow: `2px 2px 0 ${cfg.color}` }}>
                                        {items.length}
                                    </span>
                                </div>

                                <div className="flex-1 w-full overflow-y-auto px-4 py-4 space-y-4 bg-slate-50/50">
                                    {items.map((c, i) => <ContactCard key={c.id || i} contact={c} />)}
                                    {items.length === 0 && (
                                        <div className="text-center py-12 opacity-70">
                                            <div className="text-4xl mb-3">{cfg.icon}</div>
                                            <p className="text-[10px] font-black text-[#4b4b4b] uppercase tracking-widest">No contacts here</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            <ToastContainer position="top-right" autoClose={4000} />
        </div>
    );
}
