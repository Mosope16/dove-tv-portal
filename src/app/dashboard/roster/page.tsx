import { syncCurrentUser } from "@/lib/actions";
import prisma from "@/lib/prisma";
import { redirect } from "next/navigation";
import { RosterCalendar } from "./RosterCalendar";

export default async function RosterPage() {
  const dbUser = await syncCurrentUser();
  if (!dbUser) redirect("/");

  const isManager = dbUser.role === "ENG_MGR" || dbUser.role === "HOU";

  // Fetch all PROG_ENG engineers (candidates for duty)
  const engineers = await prisma.user.findMany({
    where: { role: "PROG_ENG" },
    select: { id: true, name: true, email: true },
    orderBy: { name: "asc" },
  });

  // Fetch the current month's roster entries by default
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth(), 1);
  const end = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);

  const rawEntries = await prisma.dutyRoster.findMany({
    where: { date: { gte: start, lte: end } },
    include: { engineer: { select: { id: true, name: true, email: true } } },
    orderBy: { date: "asc" },
  });

  const entries = rawEntries.map((e) => ({
    ...e,
    date: e.date.toISOString(),
    createdAt: e.createdAt.toISOString(),
  }));

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-12 animate-in fade-in duration-500">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 border-b border-slate-200 dark:border-slate-800 pb-6">
        <div className="flex items-start gap-4">
          <div className="mt-1">
            <svg className="w-10 h-10 text-slate-700 dark:text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
              Roster & Duty Calendar
            </h1>
            <p className="text-base text-slate-500 dark:text-slate-400 mt-1">
              {isManager
                ? "Assign Program Engineers to duty days. Click any day to assign."
                : "View your upcoming duty schedule and your colleagues on shift."}
            </p>
          </div>
        </div>

        {/* Engineers on duty today */}
        {(() => {
          const todayKey = new Date().toISOString().slice(0, 10);
          const todayDuty = entries.filter(e => e.date.slice(0, 10) === todayKey);
          return todayDuty.length > 0 ? (
            <div className="bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-200 dark:border-indigo-700/30 rounded-xl px-4 py-3 shrink-0">
              <p className="text-xs font-bold text-indigo-700 dark:text-indigo-400 uppercase tracking-wider mb-2">On duty today</p>
              <div className="flex flex-col gap-1">
                {todayDuty.map(e => (
                  <div key={e.id} className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-indigo-600 flex items-center justify-center text-white text-[10px] font-bold">
                      {e.engineer.name[0]}
                    </div>
                    <span className="text-sm font-medium text-indigo-900 dark:text-indigo-200">{e.engineer.name}</span>
                  </div>
                ))}
              </div>
            </div>
          ) : null;
        })()}
      </div>

      <RosterCalendar
        initialEntries={entries as any}
        engineers={engineers}
        isManager={isManager}
        currentUserId={dbUser.id}
      />

      {/* Engineer List (Managers only) */}
      {isManager && engineers.length > 0 && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800">
            <h2 className="font-semibold text-slate-900 dark:text-white">Program Engineers</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">All engineers eligible for duty assignment</p>
          </div>
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {engineers.map(eng => {
              const thisMonthDuty = entries.filter(e => e.engineerId === eng.id).length;
              const onDutyToday = entries.some(e => e.engineerId === eng.id && e.date.slice(0, 10) === new Date().toISOString().slice(0, 10));
              return (
                <div key={eng.id} className="px-6 py-4 flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm shrink-0">
                    {eng.name.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase()}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-slate-900 dark:text-white text-sm">{eng.name}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">{eng.email}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    {onDutyToday && (
                      <span className="flex items-center gap-1.5 text-xs font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 px-2.5 py-1 rounded-full">
                        <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                        On duty today
                      </span>
                    )}
                    <span className="text-xs text-slate-500 dark:text-slate-400">
                      <span className="font-bold text-slate-700 dark:text-slate-300">{thisMonthDuty}</span> day{thisMonthDuty !== 1 ? "s" : ""} this month
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
