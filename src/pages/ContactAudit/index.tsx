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
    filteredOut: number;
    leakedRevenue: number;
    closedRevenue?: number;
    stages?: {
        awareness: number;
        interest: number;
        intent: number;
        consideration: number;
        decision: number;
        closed: number;
        leaked: number;
    }
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

const STAGE_CFG: Record<string, any> = {
    awareness: {
        label: 'Awareness', dot: 'bg-[#14b8a6]', color: '#14b8a6', icon: '👀', desc: 'Lead Generation',
        tooltip: {
            what: 'First-time contacts who have reached out but shown no clear buying intent yet.',
            signals: ['Just messaged for the first time', 'No product questions yet', 'May have seen an ad or referral'],
            action: 'Respond quickly, introduce your brand, and start qualifying their needs.'
        }
    },
    interest: {
        label: 'Interest', dot: 'bg-[#0ea5e9]', color: '#0ea5e9', icon: '💡', desc: 'Lead Qualification',
        tooltip: {
            what: 'Contacts actively exploring your product — asking questions and showing curiosity.',
            signals: ['Asking about features or pricing', 'Replying to follow-ups', 'Inquiring about availability'],
            action: 'Share value, case studies, and answer questions. Identify their key problem.'
        }
    },
    intent: {
        label: 'Intent', dot: 'bg-[#3b82f6]', color: '#3b82f6', icon: '👋', desc: 'Showing Buying Signals',
        tooltip: {
            what: 'Contacts who have clearly expressed a desire to buy or are showing strong purchase signals.',
            signals: ['Asked about payment or plans', 'Requested a quote', 'Expressed urgency to buy'],
            action: "Strike while the iron is hot — present your offer and make it easy to say yes."
        }
    },
    consideration: {
        label: 'Consideration', dot: 'bg-[#6366f1]', color: '#6366f1', icon: '📅', desc: 'Evaluating Options',
        tooltip: {
            what: 'Contacts comparing options, evaluating ROI, or needing a demo before deciding.',
            signals: ['Comparing with competitors', 'Asked for a demo or call', 'Multiple back-and-forth messages'],
            action: 'Schedule a call or demo. Address objections and reinforce your unique value.'
        }
    },
    decision: {
        label: 'Decision', dot: 'bg-[#8b5cf6]', color: '#8b5cf6', icon: '⚖️', desc: 'Ready to Close',
        tooltip: {
            what: 'Hot leads in active negotiation — very close to committing. Highest priority stage.',
            signals: ['Negotiating price or terms', 'Asked about contract or onboarding', 'Said they will decide soon'],
            action: "Close the deal NOW. Offer a limited incentive if stuck. Don't let them go cold."
        }
    },
    closed: {
        label: 'Closed Deal', dot: 'bg-[#10b981]', color: '#10b981', icon: '✅', desc: 'Sold / Customer',
        tooltip: {
            what: 'Existing customers who have already purchased. Valuable for upsells and referrals.',
            signals: ['Tagged as customer / sold / closed', 'Completed a transaction', 'Actively using your product'],
            action: 'Nurture the relationship. Look for upsell opportunities and ask for referrals.'
        }
    },
    leaked: {
        label: 'Leaked', dot: 'bg-[#ef4444]', color: '#ef4444', icon: '💧', desc: 'Lost / Dropped Out',
        tooltip: {
            what: "Contacts who went cold, stopped responding, or explicitly said they're not interested.",
            signals: ['No reply in 30+ days', 'Said not interested', 'Qualified lead gone silent'],
            action: 'Run a re-engagement campaign. A simple "checking in" message can revive some leads.'
        }
    },
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

const STAGES = ['awareness', 'interest', 'intent', 'consideration', 'decision', 'closed', 'leaked'] as const;
const BASE = 'https://bisnesgpt.jutateknologi.com';
const POLL_INTERVAL = 3000;

export default function ContactAudit() {
    const [status, setStatus] = useState<'idle' | 'running' | 'done' | 'error'>('idle');
    const [isChecking, setIsChecking] = useState(true); // true while initial status check is in-flight
    const [progress, setProgress] = useState(0);
    const [progressLabel, setProgressLabel] = useState('');
    const [completedAt, setCompletedAt] = useState<string | null>(null);
    const [stats, setStats] = useState<PipelineStats | null>(null);
    const [pipeline, setPipeline] = useState<Record<string, Contact[]>>({ awareness: [], interest: [], intent: [], consideration: [], decision: [], closed: [], leaked: [] });
    const [selectedStage, setSelectedStage] = useState<string>('awareness');

    const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);
    const companyIdRef = useRef<string | null>(null);

    // ── Helpers ──────────────────────────────────────────────────────────────

    function stopPolling() {
        if (pollRef.current) { clearInterval(pollRef.current); pollRef.current = null; }
    }

    function applyResults(data: any) {
        setPipeline(data.pipelineData || { awareness: [], interest: [], intent: [], consideration: [], decision: [], closed: [], leaked: [] });
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
                if (!companyId) { setIsChecking(false); return; }

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
            } finally {
                setIsChecking(false);
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
                <div className="p-6 flex-shrink-0 grid grid-cols-2 lg:grid-cols-6 gap-4 bg-[#f8fafc] border-b-[3px] border-[#4b4b4b]">
                    {[
                        { value: stats.totalAnalyzed, label: 'Analysed', color: '#3b82f6' },
                        { value: (stats.stages?.decision || 0) + (stats.stages?.consideration || 0) + (stats.stages?.intent || 0) + (stats.stages?.interest || 0), label: 'Active Pipeline', color: '#8b5cf6' },
                        { value: stats.stages?.closed || 0, label: 'Deals Closed', color: '#10b981' },
                        { value: `RM ${(stats.closedRevenue || 0).toLocaleString()}`, label: 'Closed Revenue', color: '#10b981' },
                        { value: `RM ${(stats.leakedRevenue || 0).toLocaleString()}`, label: 'Revenue at Risk', color: '#ef4444' },
                        { value: `${stats.totalAnalyzed > 0 ? Math.round(((stats.stages?.closed || 0) / stats.totalAnalyzed) * 100) : 0}%`, label: 'Win Rate', color: '#10b981' },
                    ].map(({ value, label, color }) => (
                        <div key={label} className="text-center bg-white border-2 border-[#4b4b4b] p-3 hover:-translate-y-1 hover:-translate-x-1 transition-all duration-200" style={{ boxShadow: `4px 4px 0 ${color}` }}>
                            <div className="text-xl lg:text-2xl font-black mb-1" style={{ color }}>{value}</div>
                            <div className="text-[10px] font-black uppercase tracking-widest text-[#4b4b4b] whitespace-nowrap overflow-hidden text-ellipsis">{label}</div>
                        </div>
                    ))}
                </div>
            )}

            {/* Initial check spinner */}
            {isChecking && (
                <div className="flex-1 flex flex-col items-center justify-center gap-3 text-center p-12 bg-slate-50">
                    <div className="w-10 h-10 border-[3px] border-[#4b4b4b] border-t-[#f26522] rounded-full animate-spin" />
                    <p className="font-black text-[#4b4b4b] uppercase tracking-widest text-xs">Checking audit status…</p>
                </div>
            )}

            {/* Running banner (no results yet) */}
            {!isChecking && isRunning && !stats && (
                <div className="flex-1 flex flex-col items-center justify-center gap-4 text-center p-12 bg-slate-50">
                    <div className="w-16 h-16 border-[3px] border-[#4b4b4b] flex items-center justify-center text-3xl animate-pulse">
                        🤖
                    </div>
                    <div>
                        <p className="font-black text-[#4b4b4b] uppercase tracking-widest text-sm">{progressLabel || 'Analysing…'}</p>
                        <p className="text-gray-500 text-xs mt-1 max-w-xs">
                            Audit running in the background — progress is saved. You can safely close this tab and come back.
                        </p>
                    </div>
                    <div className="text-2xl font-black text-[#f26522]">{progress}%</div>
                </div>
            )}

            {/* Empty / idle state */}
            {!isChecking && status === 'idle' && !stats && (
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

            {/* Pipeline board (Funnel Layout) */}
            {stats && (
                <div className="flex-1 overflow-hidden flex flex-col lg:flex-row bg-slate-50 min-h-0">

                    {/* Left: Funnel Diagram */}
                    <div className="w-full lg:w-[480px] flex-shrink-0 flex flex-col border-b-[3px] lg:border-b-0 lg:border-r-[3px] border-[#4b4b4b] bg-slate-50 overflow-y-auto">

                        {/* Stage info banner — updates on click */}
                        {(() => {
                            const hcfg = STAGE_CFG[selectedStage];
                            if (!hcfg?.tooltip) return null;
                            return (
                                <div
                                    className="flex-shrink-0 border-b-[3px] border-[#4b4b4b] bg-white"
                                    style={{ borderLeftColor: hcfg.color, borderLeftWidth: 5 }}
                                >
                                    {/* Top row: icon + name + desc + action pill */}
                                    <div className="flex items-start gap-3 px-5 py-3 border-b-2 border-dashed border-gray-100">
                                        <span className="text-2xl flex-shrink-0 mt-0.5">{hcfg.icon}</span>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-baseline gap-2 flex-wrap">
                                                <p className="font-black text-[#4b4b4b] text-xs uppercase tracking-widest leading-none">{hcfg.label}</p>
                                                <span className="text-[9px] font-black uppercase tracking-widest px-1.5 py-0.5 text-white" style={{ backgroundColor: hcfg.color }}>{hcfg.desc}</span>
                                            </div>
                                            <p className="text-[10px] text-gray-600 mt-1.5 leading-relaxed">{hcfg.tooltip.what}</p>
                                        </div>
                                    </div>
                                    {/* Bottom row: signals + action */}
                                    <div className="flex gap-0 divide-x-2 divide-dashed divide-gray-200">
                                        <div className="flex-1 px-4 py-2.5">
                                            <p className="text-[8px] font-black uppercase tracking-widest text-gray-400 mb-1.5">Signals</p>
                                            <ul className="space-y-0.5">
                                                {hcfg.tooltip.signals.map((s: string, i: number) => (
                                                    <li key={i} className="flex items-start gap-1.5 text-[9px] text-gray-500 leading-snug">
                                                        <span className="font-black flex-shrink-0" style={{ color: hcfg.color }}>›</span>{s}
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                        <div className="flex-1 px-4 py-2.5" style={{ backgroundColor: '#fff9f5' }}>
                                            <p className="text-[8px] font-black uppercase tracking-widest text-[#f26522] mb-1">💬 Action</p>
                                            <p className="text-[9px] text-[#4b4b4b] font-semibold leading-relaxed">{hcfg.tooltip.action}</p>
                                        </div>
                                    </div>
                                </div>
                            );
                        })()}

                        <div className="p-6 flex flex-col gap-2 items-center">
                            <div className="w-full mb-4">
                                <h3 className="font-black text-[#4b4b4b] uppercase tracking-widest text-sm">Sales Funnel</h3>
                                <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Click a stage to select &amp; view its guide</p>
                            </div>
                            {STAGES.map((stage, idx) => {
                                const cfg = STAGE_CFG[stage];
                                const count = stats.stages?.[stage as keyof NonNullable<typeof stats.stages>] || 0;
                                const isSelected = selectedStage === stage;

                                // Funnel progressive widths
                                const widths = ['w-full', 'w-[92%]', 'w-[84%]', 'w-[76%]', 'w-[68%]', 'w-[60%]', 'w-full'];
                                const widthClass = stage === 'leaked' ? 'w-[40%] mt-6' : widths[idx];

                                return (
                                    <div
                                        key={stage}
                                        onClick={() => setSelectedStage(stage)}
                                        className={`
                                        ${widthClass} cursor-pointer transition-all duration-200
                                        ${isSelected ? '-translate-y-1 translate-x-1' : 'hover:-translate-y-0.5 hover:translate-x-0.5'}
                                    `}
                                    >
                                        <div
                                            className={`
                                            w-full py-3.5 px-5 flex items-center justify-between border-[3px] border-[#4b4b4b]
                                            ${stage === 'leaked' ? 'border-dashed opacity-80' : ''}
                                        `}
                                            style={{
                                                backgroundColor: isSelected ? cfg.color : '#ffffff',
                                                boxShadow: isSelected ? `5px 5px 0 ${cfg.color}` : `3px 3px 0 #4b4b4b`
                                            }}
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-full border-2 border-[#4b4b4b] flex items-center justify-center bg-white text-base shadow-[1px_1px_0_#4b4b4b]">
                                                    {cfg.icon}
                                                </div>
                                                <div className="text-left">
                                                    <div className={`font-black uppercase tracking-widest text-sm ${isSelected ? 'text-white' : 'text-[#4b4b4b]'}`}>
                                                        {cfg.label}
                                                    </div>
                                                    <div className={`font-bold text-[9px] uppercase tracking-wider ${isSelected ? 'text-white/80' : 'text-gray-500'}`}>
                                                        {cfg.desc}
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2 flex-shrink-0">
                                                <div className={`text-xl font-black ${isSelected ? 'text-white' : 'text-[#4b4b4b]'} drop-shadow-sm`}>
                                                    {count}
                                                </div>

                                            </div>
                                        </div>
                                    </div>
                                );
                            })}

                        </div>
                    </div>

                    {/* Right: Stage Contacts List */}
                    <div className="flex-1 flex flex-col bg-white overflow-hidden relative">
                        <div className="p-4 lg:p-6 border-b-[3px] border-[#4b4b4b] bg-white flex justify-between items-center flex-shrink-0 z-10 shadow-sm">
                            <div className="flex items-center gap-3">
                                <div className="w-5 h-5 rounded-full border-[2.5px] border-[#4b4b4b]" style={{ backgroundColor: STAGE_CFG[selectedStage].color }} />
                                <h3 className="text-lg font-black uppercase tracking-widest text-[#4b4b4b]">
                                    {STAGE_CFG[selectedStage].label} Prospects
                                </h3>
                            </div>
                            <div className="text-[11px] font-black text-white px-2 py-0.5 border-2 border-[#4b4b4b]" style={{ backgroundColor: '#4b4b4b', boxShadow: `2px 2px 0 ${STAGE_CFG[selectedStage].color}` }}>
                                {(pipeline[selectedStage] || []).length}
                            </div>
                        </div>

                        <div className="flex-1 p-4 lg:p-6 overflow-y-auto w-full space-y-4">
                            <div className="max-w-3xl mx-auto space-y-4 w-full">
                                {(pipeline[selectedStage] || []).map((c, i) => (
                                    <ContactCard key={c.id || i} contact={c} />
                                ))}
                                {(pipeline[selectedStage] || []).length === 0 && (
                                    <div className="h-full flex flex-col items-center justify-center opacity-60 min-h-[300px]">
                                        <div className="text-6xl mb-4 drop-shadow-sm">{STAGE_CFG[selectedStage].icon}</div>
                                        <p className="font-black uppercase tracking-widest text-[#4b4b4b]">No contacts in this stage</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <ToastContainer position="top-right" autoClose={4000} />
        </div>
    );
}
