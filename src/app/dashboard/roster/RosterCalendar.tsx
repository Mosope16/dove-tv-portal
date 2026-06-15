"use client";

import { useState, useTransition } from "react";
import { assignDuty, removeDuty } from "@/lib/actions";

type DutyEntry = {
  id: string;
  date: string;
  notes: string | null;
  engineerId: string;
  engineer: { id: string; name: string; email: string };
};

type Engineer = { id: string; name: string; email: string };

const MONTH_NAMES = [
  "January","February","March","April","May","June",
  "July","August","September","October","November","December"
];
const DAY_NAMES = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];

export function RosterCalendar({
  initialEntries,
  engineers,
  isManager,
  currentUserId,
}: {
  initialEntries: DutyEntry[];
  engineers: Engineer[];
  isManager: boolean;
  currentUserId: string;
}) {
  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth()); // 0-indexed
  const [entries, setEntries] = useState<DutyEntry[]>(initialEntries);
  const [isPending, startTransition] = useTransition();
  const [toast, setToast] = useState<{ msg: string; type: "success" | "error" } | null>(null);
  const [openDay, setOpenDay] = useState<string | null>(null); // ISO date string
  const [selectedEng, setSelectedEng] = useState("");
  const [dutyNote, setDutyNote] = useState("");

  const showToast = (msg: string, type: "success" | "error") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 4000);
  };

  // Navigation
  const prevMonth = () => {
    if (month === 0) { setYear(y => y - 1); setMonth(11); }
    else setMonth(m => m - 1);
  };
  const nextMonth = () => {
    if (month === 11) { setYear(y => y + 1); setMonth(0); }
    else setMonth(m => m + 1);
  };
  const goToday = () => { setYear(today.getFullYear()); setMonth(today.getMonth()); };

  // Build calendar grid
  const firstDay = new Date(year, month, 1).getDay(); // 0=Sun
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  // All calendar cells (leading blanks + days)
  const cells: (number | null)[] = [
    ...Array(firstDay).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1)
  ];
  // Pad to complete last row
  while (cells.length % 7 !== 0) cells.push(null);

  // Build a map of date → entries for O(1) lookup
  const entryMap: Record<string, DutyEntry[]> = {};
  entries.forEach(e => {
    const key = e.date.slice(0, 10); // "YYYY-MM-DD"
    if (!entryMap[key]) entryMap[key] = [];
    entryMap[key].push(e);
  });

  const toDateKey = (day: number) => {
    const d = new Date(year, month, day);
    return d.toISOString().slice(0, 10);
  };

  const isToday = (day: number) => {
    return day === today.getDate() && month === today.getMonth() && year === today.getFullYear();
  };

  const handleAssign = (dateKey: string) => {
    if (!selectedEng) return;
    startTransition(async () => {
      const result = await assignDuty(selectedEng, dateKey, dutyNote || undefined);
      if (result?.error) {
        showToast(result.error, "error");
      } else {
        const eng = engineers.find(e => e.id === selectedEng)!;
        setEntries(prev => [
          ...prev,
          {
            id: `temp-${Date.now()}`,
            date: new Date(dateKey).toISOString(),
            notes: dutyNote || null,
            engineerId: selectedEng,
            engineer: eng,
          }
        ]);
        showToast(`${eng.name} assigned to duty.`, "success");
        setOpenDay(null);
        setSelectedEng("");
        setDutyNote("");
      }
    });
  };

  const handleRemove = (dutyId: string, engName: string) => {
    setEntries(prev => prev.filter(e => e.id !== dutyId));
    startTransition(async () => {
      const result = await removeDuty(dutyId);
      if (result?.error) {
        showToast(result.error, "error");
      } else {
        showToast(`${engName} removed from duty.`, "success");
      }
    });
  };

  return (
    <div className="space-y-6">
      {/* Toast */}
      {toast && (
        <div className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-xl shadow-lg border text-sm font-medium ${toast.type === "error" ? "bg-rose-50 border-rose-200 text-rose-800 dark:bg-rose-950/50 dark:border-rose-900/50 dark:text-rose-300" : "bg-emerald-50 border-emerald-200 text-emerald-800 dark:bg-emerald-950/50 dark:border-emerald-900/50 dark:text-emerald-300"}`}>
          {toast.msg}
        </div>
      )}

      {/* Month Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
            {MONTH_NAMES[month]} {year}
          </h2>
          <button onClick={goToday} className="px-3 py-1 text-xs font-semibold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-500/10 hover:bg-indigo-100 dark:hover:bg-indigo-500/20 rounded-lg transition-colors">
            Today
          </button>
        </div>
        <div className="flex gap-2">
          <button onClick={prevMonth} className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
          </button>
          <button onClick={nextMonth} className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
          </button>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        {/* Day labels */}
        <div className="grid grid-cols-7 border-b border-slate-100 dark:border-slate-800">
          {DAY_NAMES.map(d => (
            <div key={d} className="py-3 text-center text-[11px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500">
              {d}
            </div>
          ))}
        </div>

        {/* Cells */}
        <div className="grid grid-cols-7 divide-x divide-slate-100 dark:divide-slate-800">
          {cells.map((day, idx) => {
            const dateKey = day ? toDateKey(day) : null;
            const dayEntries = dateKey ? (entryMap[dateKey] || []) : [];
            const isTodayCell = day ? isToday(day) : false;
            const isOpen = dateKey === openDay;
            const myDuty = dayEntries.find(e => e.engineerId === currentUserId);

            return (
              <div
                key={idx}
                className={`min-h-[110px] p-2 border-b border-slate-100 dark:border-slate-800 transition-colors flex flex-col ${!day ? "bg-slate-50/50 dark:bg-slate-950/30" : ""}${isTodayCell ? " bg-indigo-50/30 dark:bg-indigo-500/5" : ""}`}
              >
                {day && (
                  <>
                    {/* Day number */}
                    <div className="flex items-center justify-between mb-1.5">
                      <span className={`text-sm font-bold w-7 h-7 flex items-center justify-center rounded-full ${isTodayCell ? "bg-indigo-600 text-white" : "text-slate-700 dark:text-slate-300"}`}>
                        {day}
                      </span>
                      {myDuty && (
                        <span className="text-[9px] font-bold bg-indigo-100 dark:bg-indigo-500/20 text-indigo-700 dark:text-indigo-300 px-1.5 py-0.5 rounded-full uppercase">You</span>
                      )}
                    </div>

                    {/* Assigned engineers */}
                    <div className="flex-1 space-y-1">
                      {dayEntries.map(entry => (
                        <div key={entry.id} className="group flex items-center gap-1 bg-slate-100 dark:bg-slate-800 rounded-lg px-2 py-1">
                          <div className={`w-1.5 h-1.5 rounded-full shrink-0 ${entry.engineerId === currentUserId ? "bg-indigo-500" : "bg-emerald-500"}`} />
                          <span className="text-[10px] font-medium text-slate-700 dark:text-slate-300 truncate flex-1">
                            {entry.engineer.name.split(" ")[0]}
                          </span>
                          {isManager && (
                            <button
                              onClick={() => handleRemove(entry.id, entry.engineer.name)}
                              disabled={isPending}
                              className="opacity-0 group-hover:opacity-100 text-rose-400 hover:text-rose-600 transition-all"
                            >
                              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" /></svg>
                            </button>
                          )}
                        </div>
                      ))}
                    </div>

                    {/* Manager: Assign button */}
                    {isManager && (
                      <button
                        onClick={() => { setOpenDay(isOpen ? null : dateKey!); setSelectedEng(""); setDutyNote(""); }}
                        className="mt-1 w-full text-[10px] text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-500/10 rounded-md py-0.5 transition-colors font-semibold"
                      >
                        + Assign
                      </button>
                    )}

                    {/* Inline assignment panel */}
                    {isOpen && isManager && (
                      <div className="mt-1 p-2 bg-white dark:bg-slate-850 border border-indigo-200 dark:border-indigo-700/50 rounded-xl shadow-lg space-y-2 z-10 relative">
                        <select
                          value={selectedEng}
                          onChange={e => setSelectedEng(e.target.value)}
                          className="w-full text-xs px-2 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        >
                          <option value="">Pick engineer…</option>
                          {engineers
                            .filter(e => !dayEntries.find(d => d.engineerId === e.id))
                            .map(e => (
                              <option key={e.id} value={e.id}>{e.name}</option>
                            ))}
                        </select>
                        <input
                          type="text"
                          value={dutyNote}
                          onChange={e => setDutyNote(e.target.value)}
                          placeholder="Note (optional)"
                          className="w-full text-xs px-2 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                        <div className="flex gap-1">
                          <button
                            onClick={() => handleAssign(dateKey!)}
                            disabled={!selectedEng || isPending}
                            className="flex-1 py-1 text-[10px] font-bold text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 rounded-lg transition-colors"
                          >
                            Save
                          </button>
                          <button
                            onClick={() => setOpenDay(null)}
                            className="px-2 py-1 text-[10px] text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                          >
                            ✕
                          </button>
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-6 text-xs text-slate-500 dark:text-slate-400">
        <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-indigo-500" /> Your duty days</div>
        <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-emerald-500" /> Colleague on duty</div>
        <div className="flex items-center gap-1.5"><div className="w-5 h-5 rounded-full bg-indigo-600 flex items-center justify-center text-white text-[9px] font-bold">1</div> Today</div>
      </div>
    </div>
  );
}
