import { syncCurrentUser } from "@/lib/actions";
import prisma from "@/lib/prisma";
import { redirect } from "next/navigation";
import { FaultsClient } from "./FaultsClient";

export default async function FaultsPage() {
  const dbUser = await syncCurrentUser();
  if (!dbUser) redirect("/");

  const isPrivileged = dbUser.role === "ENG_MGR" || dbUser.role === "HOU" || dbUser.role === "PROG_ENG";

  // All fault reports — managers see all, staff see all (for visibility) but can only control their own
  const rawFaults = await prisma.faultReport.findMany({
    include: {
      reporter: { select: { id: true, name: true, email: true } },
      assignee: { select: { id: true, name: true } },
    },
    orderBy: [
      // Critical first, then newest
      { priority: 'desc' },
      { createdAt: 'desc' },
    ]
  });

  const faults = rawFaults.map(f => ({
    ...f,
    createdAt: f.createdAt.toISOString(),
    updatedAt: f.updatedAt.toISOString(),
  }));

  // All engineers + managers who can be assigned
  const engineers = await prisma.user.findMany({
    where: { role: { in: ['PROG_ENG', 'ENG_MGR'] } },
    select: { id: true, name: true, role: true },
    orderBy: { name: 'asc' },
  });

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-12 animate-in fade-in duration-500">
      {/* Page Header */}
      <div className="flex items-start gap-4 border-b border-slate-200 dark:border-slate-800 pb-6">
        <div className="mt-1">
          <svg className="w-10 h-10 text-rose-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
            Fault Reports
          </h1>
          <p className="text-base text-slate-500 dark:text-slate-400 mt-1">
            {isPrivileged
              ? "View, assign, and resolve technical faults reported from the floor."
              : "Report technical issues instantly to the engineering team. They'll be alerted right away."}
          </p>
        </div>

        {/* Critical Faults Badge */}
        {(() => {
          const criticalCount = faults.filter(f => f.priority === 'CRITICAL' && f.status !== 'CLOSED' && f.status !== 'RESOLVED').length;
          return criticalCount > 0 ? (
            <div className="ml-auto flex items-center gap-2 bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-700/30 rounded-xl px-4 py-2.5">
              <span className="w-2 h-2 bg-rose-500 rounded-full animate-pulse" />
              <span className="text-sm font-bold text-rose-700 dark:text-rose-400">{criticalCount} Critical</span>
            </div>
          ) : null;
        })()}
      </div>

      <FaultsClient
        initialFaults={faults as any}
        engineers={engineers as any}
        currentUserId={dbUser.id}
        isPrivileged={isPrivileged}
      />
    </div>
  );
}
