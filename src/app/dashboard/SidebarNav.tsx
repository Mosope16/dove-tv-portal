"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export function SidebarNav({ role = 'STAFF' }: { role?: string }) {
  const pathname = usePathname();

  const isExactDashboard = pathname === '/dashboard';
  const isRosterActive = pathname.startsWith('/dashboard/roster');
  const isBookingsActive = pathname.startsWith('/dashboard/request') || pathname.startsWith('/dashboard/marketing');
  const isUsersActive = pathname.startsWith('/dashboard/users');
  const isWorkflowsActive = pathname.startsWith('/dashboard/workflows');
  const isInventoryActive = pathname.startsWith('/dashboard/inventory');
  const isFaultsActive = pathname.startsWith('/dashboard/faults');

  const isStudioBooking = pathname === '/dashboard/request';
  const isMarketingJob = pathname === '/dashboard/marketing';

  const isManager = role === 'ENG_MGR' || role === 'HOU';

  const getLinkClass = (isActive: boolean) => 
    `flex items-center gap-3 px-3 py-2.5 rounded-lg font-medium text-sm transition-all ${
      isActive
        ? 'text-indigo-700 bg-indigo-50 dark:bg-indigo-500/10 dark:text-indigo-300'
        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-slate-200 dark:hover:bg-slate-800/50'
    }`;

  const getSubLinkClass = (isActive: boolean) =>
    `block px-3 py-2 rounded-lg font-medium text-sm transition-all ${
      isActive
        ? 'text-indigo-700 bg-indigo-50/50 dark:text-indigo-300 dark:bg-indigo-500/10'
        : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-slate-200 dark:hover:bg-slate-800/50'
    }`;

  const getSummaryClass = (isActive: boolean) =>
    `flex items-center justify-between gap-3 px-3 py-2.5 rounded-lg font-medium text-sm transition-all cursor-pointer list-none [&::-webkit-details-marker]:hidden ${
      isActive
        ? 'text-indigo-700 bg-indigo-50 dark:bg-indigo-500/10 dark:text-indigo-300'
        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-slate-200 dark:hover:bg-slate-800/50'
    }`;

  return (
    <div className="flex-1 overflow-y-auto py-6 px-4 space-y-8 no-scrollbar">
      
      {/* OVERVIEW SECTION */}
      <div>
        <h4 className="text-[11px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider px-2 mb-3">Overview</h4>
        <nav className="space-y-1">
          <Link href="/dashboard" className={getLinkClass(isExactDashboard)}>
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg>
            Dashboard
          </Link>
          <Link href="/dashboard/roster" className={getLinkClass(isRosterActive)}>
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
            Roster & Calendar
          </Link>
          <details className="group" open={isBookingsActive}>
            <summary className={getSummaryClass(isBookingsActive)}>
              <div className="flex items-center gap-3">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                Bookings & Forms
              </div>
              <svg className="w-4 h-4 transition-transform group-open:-rotate-180 text-slate-400 group-open:text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
            </summary>
            <div className="mt-1 ml-4 pl-4 border-l border-slate-200 dark:border-slate-800 space-y-1 py-1">
              <Link href="/dashboard/request" className={getSubLinkClass(isStudioBooking)}>
                Studio booking
              </Link>
              <Link href="/dashboard/marketing" className={getSubLinkClass(isMarketingJob)}>
                Marketing Job
              </Link>
            </div>
          </details>
          <Link href="/dashboard/inventory" className={getLinkClass(isInventoryActive)}>
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" /></svg>
            Inventory Management
          </Link>
          <Link href="/dashboard/faults" className={getLinkClass(isFaultsActive)}>
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
            Fault Reports
          </Link>
        </nav>
      </div>

      {/* MANAGEMENT SECTION */}
      {isManager && (
        <div>
          <h4 className="text-[11px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider px-2 mb-3">Management</h4>
          <nav className="space-y-1">
            <Link href="/dashboard/users" className={getLinkClass(isUsersActive)}>
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
              Users
            </Link>
            <Link href="/dashboard/workflows" className={getLinkClass(isWorkflowsActive)}>
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
              Workflows
            </Link>
          </nav>
        </div>
      )}
    </div>
  );
}
