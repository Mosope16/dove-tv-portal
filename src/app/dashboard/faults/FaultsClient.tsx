"use client";

import { useState, useTransition, useActionState } from "react";
import { createFaultReport, updateFaultReport } from "@/lib/actions";

type FaultReport = {
  id: string;
  title: string;
  description: string;
  location: string;
  priority: string;
  status: string;
  resolvedNote: string | null;
  createdAt: string;
  reporter: { id: string; name: string; email: string };
  assignee: { id: string; name: string } | null;
};

type Engineer = { id: string; name: string; role: string };

const PRIORITY_CONFIG: Record<string, { label: string; color: string; dot: string }> = {
  LOW:      { label: 'Low',      color: 'bg-slate-100 text-slate-600 dark:bg-slate-700/40 dark:text-slate-400',     dot: 'bg-slate-400' },
  MEDIUM:   { label: 'Medium',   color: 'bg-amber-100 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400',     dot: 'bg-amber-400' },
  HIGH:     { label: 'High',     color: 'bg-orange-100 text-orange-700 dark:bg-orange-500/10 dark:text-orange-400', dot: 'bg-orange-500' },
  CRITICAL: { label: 'Critical', color: 'bg-rose-100 text-rose-700 dark:bg-rose-500/10 dark:text-rose-400',         dot: 'bg-rose-500 animate-pulse' },
};

const STATUS_CONFIG: Record<string, { label: string; color: string }> = {
  OPEN:        { label: 'Open',        color: 'bg-sky-100 text-sky-700 dark:bg-sky-500/10 dark:text-sky-400' },
  IN_PROGRESS: { label: 'In Progress', color: 'bg-violet-100 text-violet-700 dark:bg-violet-500/10 dark:text-violet-400' },
  RESOLVED:    { label: 'Resolved',    color: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400' },
  CLOSED:      { label: 'Closed',      color: 'bg-slate-200 text-slate-500 dark:bg-slate-700/30 dark:text-slate-500' },
};

// ── Report Form ─────────────────────────────────────────────────────
function ReportForm({ onSubmitted }: { onSubmitted: (report: any) => void }) {
  const [state, action, isPending] = useActionState(createFaultReport, null);
  const [success, setSuccess] = useState(false);

  if (success) {
    return (
      <div className="py-8 text-center">
        <div className="w-14 h-14 bg-emerald-100 dark:bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto mb-3">
          <svg className="w-7 h-7 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
        </div>
        <p className="font-bold text-slate-900 dark:text-white text-lg">Report submitted!</p>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Engineering has been notified.</p>
        <button onClick={() => setSuccess(false)} className="mt-4 text-sm text-indigo-600 dark:text-indigo-400 hover:underline">Submit another report</button>
      </div>
    );
  }

  return (
    <form
      action={async (formData) => {
        const result = await createFaultReport(null, formData);
        if (result?.success) setSuccess(true);
      }}
      className="space-y-4"
    >
      <div>
        <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
          Fault Title <span className="text-rose-500">*</span>
        </label>
        <input name="title" type="text" required placeholder="e.g. Microphone 3 outputting static"
          className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all" />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
            Location <span className="text-rose-500">*</span>
          </label>
          <input name="location" type="text" required placeholder="e.g. Studio A, Control Room, OB Van"
            className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all" />
        </div>
        <div>
          <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Priority</label>
          <select name="priority" defaultValue="MEDIUM"
            className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all">
            <option value="LOW">Low — Non-urgent</option>
            <option value="MEDIUM">Medium — Needs attention</option>
            <option value="HIGH">High — Affects broadcast</option>
            <option value="CRITICAL">Critical — Broadcast down!</option>
          </select>
        </div>
      </div>
      <div>
        <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
          Description <span className="text-rose-500">*</span>
        </label>
        <textarea name="description" rows={4} required placeholder="Describe the fault in detail — what you observed, when it started, what you've already tried..."
          className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all resize-none" />
      </div>
      {state?.error && (
        <div className="bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-900/50 text-rose-700 dark:text-rose-400 text-sm px-4 py-3 rounded-xl">{state.error}</div>
      )}
      <button type="submit" disabled={isPending}
        className="w-full py-3 font-semibold text-white bg-rose-600 hover:bg-rose-700 disabled:opacity-60 rounded-xl transition-colors flex items-center justify-center gap-2">
        {isPending
          ? <><svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>Submitting…</>
          : <><svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" /></svg>Submit Fault Report</>}
      </button>
    </form>
  );
}

// ── Fault Card (Manager/Eng view) ────────────────────────────────────
function FaultCard({ fault, engineers, currentUserId, isPrivileged, onUpdate }: {
  fault: FaultReport;
  engineers: Engineer[];
  currentUserId: string;
  isPrivileged: boolean;
  onUpdate: (id: string, updates: any) => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const [resolveNote, setResolveNote] = useState('');
  const [isPending, startTransition] = useTransition();
  const prio = PRIORITY_CONFIG[fault.priority] || PRIORITY_CONFIG.MEDIUM;
  const stat = STATUS_CONFIG[fault.status] || STATUS_CONFIG.OPEN;
  const timeAgo = (dateStr: string) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const m = Math.floor(diff / 60000);
    if (m < 60) return `${m}m ago`;
    const h = Math.floor(m / 60);
    if (h < 24) return `${h}h ago`;
    return `${Math.floor(h / 24)}d ago`;
  };

  const handleUpdate = (updates: any) => {
    startTransition(async () => {
      const result = await updateFaultReport(fault.id, updates);
      if (result?.success) onUpdate(fault.id, updates);
    });
  };

  return (
    <div className={`bg-white dark:bg-slate-900 rounded-2xl border shadow-sm overflow-hidden transition-all ${fault.priority === 'CRITICAL' ? 'border-rose-300 dark:border-rose-700/50' : 'border-slate-200 dark:border-slate-800'}`}>
      {/* Card Header */}
      <div className="px-5 py-4 flex items-start gap-3">
        <div className={`mt-0.5 w-2.5 h-2.5 rounded-full shrink-0 ${prio.dot}`} />
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-3 flex-wrap">
            <div>
              <h3 className="font-semibold text-slate-900 dark:text-white text-sm leading-snug">{fault.title}</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                📍 {fault.location} · Reported by <span className="font-medium">{fault.reporter.name}</span> · {timeAgo(fault.createdAt)}
              </p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${prio.color}`}>{prio.label}</span>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${stat.color}`}>{stat.label}</span>
            </div>
          </div>
          {fault.assignee && (
            <p className="text-xs text-indigo-600 dark:text-indigo-400 mt-1.5 font-medium">
              👷 Assigned to {fault.assignee.name}
            </p>
          )}
        </div>
        <button onClick={() => setExpanded(e => !e)} className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors shrink-0">
          <svg className={`w-4 h-4 transition-transform ${expanded ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
        </button>
      </div>

      {/* Expanded */}
      {expanded && (
        <div className="px-5 pb-5 border-t border-slate-100 dark:border-slate-800 pt-4 space-y-4">
          <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-wrap">{fault.description}</p>
          {fault.resolvedNote && (
            <div className="bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-900/30 rounded-xl px-4 py-3">
              <p className="text-xs font-bold text-emerald-700 dark:text-emerald-400 mb-1 uppercase tracking-wider">Resolution Note</p>
              <p className="text-sm text-emerald-800 dark:text-emerald-300">{fault.resolvedNote}</p>
            </div>
          )}

          {/* Manager/Eng Actions */}
          {isPrivileged && fault.status !== 'CLOSED' && (
            <div className="space-y-3 pt-2 border-t border-slate-100 dark:border-slate-800">
              {/* Assign to engineer */}
              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5 uppercase tracking-wider">Assign To</label>
                <select
                  value={fault.assignee?.id || ''}
                  onChange={e => handleUpdate({ assigneeId: e.target.value })}
                  disabled={isPending}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="">Unassigned</option>
                  {engineers.map(e => (
                    <option key={e.id} value={e.id}>{e.name} ({e.role})</option>
                  ))}
                </select>
              </div>

              {/* Status transitions */}
              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5 uppercase tracking-wider">Update Status</label>
                <div className="flex flex-wrap gap-2">
                  {fault.status === 'OPEN' && (
                    <button onClick={() => handleUpdate({ status: 'IN_PROGRESS' })} disabled={isPending}
                      className="px-3 py-1.5 text-xs font-semibold text-violet-700 dark:text-violet-400 bg-violet-50 dark:bg-violet-500/10 hover:bg-violet-100 dark:hover:bg-violet-500/20 rounded-lg transition-colors disabled:opacity-50">
                      → Mark In Progress
                    </button>
                  )}
                  {(fault.status === 'OPEN' || fault.status === 'IN_PROGRESS') && (
                    <div className="flex-1 flex gap-2 items-stretch">
                      <input
                        type="text"
                        value={resolveNote}
                        onChange={e => setResolveNote(e.target.value)}
                        placeholder="Resolution note (optional)"
                        className="flex-1 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      />
                      <button
                        onClick={() => handleUpdate({ status: 'RESOLVED', resolvedNote: resolveNote || undefined })}
                        disabled={isPending}
                        className="px-3 py-1.5 text-xs font-semibold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 hover:bg-emerald-100 disabled:opacity-50 rounded-lg transition-colors whitespace-nowrap">
                        ✓ Resolve
                      </button>
                    </div>
                  )}
                  {fault.status === 'RESOLVED' && (
                    <button onClick={() => handleUpdate({ status: 'CLOSED' })} disabled={isPending}
                      className="px-3 py-1.5 text-xs font-semibold text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors disabled:opacity-50">
                      Close Ticket
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ── Main Client Component ────────────────────────────────────────────
export function FaultsClient({
  initialFaults,
  engineers,
  currentUserId,
  isPrivileged,
}: {
  initialFaults: FaultReport[];
  engineers: Engineer[];
  currentUserId: string;
  isPrivileged: boolean;
}) {
  const [faults, setFaults] = useState(initialFaults);
  const [filterStatus, setFilterStatus] = useState<string>('OPEN');
  const [filterPriority, setFilterPriority] = useState<string>('ALL');
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);

  const showToast = (msg: string, type: 'success' | 'error') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 4000);
  };

  const handleUpdate = (id: string, updates: any) => {
    setFaults(prev => prev.map(f => f.id === id ? {
      ...f,
      ...(updates.status && { status: updates.status }),
      ...(updates.resolvedNote && { resolvedNote: updates.resolvedNote }),
      ...(updates.assigneeId !== undefined && {
        assignee: updates.assigneeId
          ? engineers.find(e => e.id === updates.assigneeId) || f.assignee
          : null
      }),
    } : f));
    showToast('Fault report updated.', 'success');
  };

  const filtered = faults
    .filter(f => filterStatus === 'ALL' ? true : f.status === filterStatus)
    .filter(f => filterPriority === 'ALL' ? true : f.priority === filterPriority);

  const stats = {
    open: faults.filter(f => f.status === 'OPEN').length,
    inProgress: faults.filter(f => f.status === 'IN_PROGRESS').length,
    critical: faults.filter(f => f.priority === 'CRITICAL' && f.status !== 'CLOSED').length,
    resolved: faults.filter(f => f.status === 'RESOLVED' || f.status === 'CLOSED').length,
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Toast */}
      {toast && (
        <div className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-xl shadow-lg border text-sm font-medium ${toast.type === 'error' ? 'bg-rose-50 border-rose-200 text-rose-800' : 'bg-emerald-50 border-emerald-200 text-emerald-800'}`}>
          {toast.msg}
        </div>
      )}

      {/* Left: Submit Form */}
      <div className="space-y-6">
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-800 bg-rose-50/50 dark:bg-rose-500/5">
            <h2 className="font-semibold text-slate-900 dark:text-white flex items-center gap-2">
              <svg className="w-4 h-4 text-rose-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" /></svg>
              Report a Fault
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Alert engineering about broken gear or technical issues</p>
          </div>
          <div className="p-5">
            <ReportForm onSubmitted={(r) => setFaults(prev => [r, ...prev])} />
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-3">
          {[ 
            { label: 'Open', value: stats.open, color: 'text-sky-700 dark:text-sky-400', bg: 'bg-sky-50 dark:bg-sky-500/10' },
            { label: 'In Progress', value: stats.inProgress, color: 'text-violet-700 dark:text-violet-400', bg: 'bg-violet-50 dark:bg-violet-500/10' },
            { label: 'Critical', value: stats.critical, color: 'text-rose-700 dark:text-rose-400', bg: 'bg-rose-50 dark:bg-rose-500/10' },
            { label: 'Resolved', value: stats.resolved, color: 'text-emerald-700 dark:text-emerald-400', bg: 'bg-emerald-50 dark:bg-emerald-500/10' },
          ].map(s => (
            <div key={s.label} className={`${s.bg} rounded-xl px-4 py-3`}>
              <div className={`text-2xl font-bold ${s.color}`}>{s.value}</div>
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-0.5">{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Right: Ticket List */}
      <div className="lg:col-span-2 space-y-4">
        {/* Filters */}
        <div className="flex flex-wrap gap-2 items-center">
          <div className="flex gap-1 bg-slate-100 dark:bg-slate-800 rounded-xl p-1">
            {['OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED', 'ALL'].map(s => (
              <button key={s} onClick={() => setFilterStatus(s)}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${filterStatus === s ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700'}`}>
                {s === 'IN_PROGRESS' ? 'In Progress' : s === 'ALL' ? 'All' : s.charAt(0) + s.slice(1).toLowerCase()}
              </button>
            ))}
          </div>
          <select value={filterPriority} onChange={e => setFilterPriority(e.target.value)}
            className="px-3 py-2 text-xs font-semibold rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500">
            <option value="ALL">All Priorities</option>
            <option value="CRITICAL">Critical</option>
            <option value="HIGH">High</option>
            <option value="MEDIUM">Medium</option>
            <option value="LOW">Low</option>
          </select>
          <span className="text-xs text-slate-400 ml-auto">{filtered.length} ticket{filtered.length !== 1 ? 's' : ''}</span>
        </div>

        {/* Fault Cards */}
        <div className="space-y-3">
          {filtered.map(fault => (
            <FaultCard
              key={fault.id}
              fault={fault}
              engineers={engineers}
              currentUserId={currentUserId}
              isPrivileged={isPrivileged}
              onUpdate={handleUpdate}
            />
          ))}
          {filtered.length === 0 && (
            <div className="text-center py-16 text-slate-400">
              <svg className="w-12 h-12 mx-auto mb-3 opacity-30" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              <p className="font-semibold">No fault reports here</p>
              <p className="text-sm mt-1">Everything looks good in this category.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
