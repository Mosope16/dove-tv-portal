import { syncCurrentUser } from "@/lib/actions";
import prisma from "@/lib/prisma";
import { WorkflowsTable } from "./WorkflowsTable";
import { redirect } from "next/navigation";

export default async function WorkflowsPage() {
  const dbUser = await syncCurrentUser();
  if (!dbUser) redirect('/');

  const role = dbUser.role;
  const isManager = role === 'ENG_MGR' || role === 'HOU';

  if (!isManager) {
    return (
      <div className="flex h-[70vh] flex-col items-center justify-center animate-in zoom-in-95 duration-500">
        <div className="w-20 h-20 bg-rose-50 dark:bg-rose-500/10 rounded-full flex items-center justify-center mb-6">
          <svg className="w-10 h-10 text-rose-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
        </div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Access Denied</h1>
        <p className="text-slate-500 dark:text-slate-400 text-center max-w-sm">
          You do not have the required clearance to view or modify workflows. 
        </p>
      </div>
    );
  }

  // The HOU only sees requests that are actively PENDING their primary approval.
  // The ENG_MGR only sees requests that have passed the HOU and are tagged HOU_APPROVED.
  const lookForStatus = role === 'HOU' ? 'PENDING' : 'HOU_APPROVED';

  // Fetch from both tables
  const studioBookingsRaw = await prisma.studioBooking.findMany({
    where: { status: lookForStatus },
    include: { requester: true },
    orderBy: { createdAt: 'asc' } // oldest first
  });

  const marketingJobsRaw = await prisma.marketingJob.findMany({
    where: { status: lookForStatus },
    include: { requester: true },
    orderBy: { createdAt: 'asc' }
  });

  // Normalize data for the Client Component Table
  const normalizedItems = [
    ...studioBookingsRaw.map(b => ({
      id: b.id,
      type: 'STUDIO' as const,
      title: b.progName,
      requesterName: b.requester.name,
      date: b.createdAt.toLocaleDateString(),
      status: b.status,
    })),
    ...marketingJobsRaw.map(m => ({
      id: m.id,
      type: 'MARKETING' as const,
      title: m.location,
      requesterName: m.requester.name,
      date: m.createdAt.toLocaleDateString(),
      status: m.status,
    }))
  ].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());


  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in duration-500 pb-12 relative">
      
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 border-b border-slate-200 dark:border-slate-800 pb-6">
        <div className="flex items-start gap-4">
          <div className="mt-1 text-slate-800 dark:text-slate-200">
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="2" 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              className="w-10 h-10 text-slate-700 dark:text-slate-300"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
              Workflows Pipeline
            </h1>
            <p className="text-base text-slate-500 dark:text-slate-400 mt-2">
              Review requests pending your tier of authorization.
            </p>
          </div>
        </div>
      </div>

      <WorkflowsTable initialItems={normalizedItems} userRole={role} />

    </div>
  );
}
