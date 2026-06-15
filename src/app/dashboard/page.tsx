import { syncCurrentUser } from "@/lib/actions";
import prisma from "@/lib/prisma";
import Link from "next/link";

export default async function DashboardPage() {
  const dbUser = await syncCurrentUser();
  
  if (!dbUser) {
    return (
      <div className="flex h-full items-center justify-center">
        <p className="text-slate-500 dark:text-slate-400">Error loading profile. Please try logging in again.</p>
      </div>
    );
  }

  const isManager = dbUser.role === 'ENG_MGR' || dbUser.role === 'HOU';

  let totalBookings = 0;
  let pendingBookings = 0;
  let yourRequests = 0;
  let recentBookings: any[] = [];

  if (isManager) {
    totalBookings = await prisma.studioBooking.count();
    pendingBookings = await prisma.studioBooking.count({ where: { status: 'PENDING' } });
    yourRequests = await prisma.studioBooking.count({ where: { requesterId: dbUser.id } });
    recentBookings = await prisma.studioBooking.findMany({ 
      orderBy: { createdAt: 'desc' }, 
      take: 5,
      include: { requester: true }
    });
  } else {
    totalBookings = await prisma.studioBooking.count({ where: { requesterId: dbUser.id } });
    pendingBookings = await prisma.studioBooking.count({ where: { requesterId: dbUser.id, status: 'PENDING' } });
    yourRequests = await prisma.studioBooking.count({ where: { requesterId: dbUser.id, status: 'APPROVED' } });
    recentBookings = await prisma.studioBooking.findMany({ 
      where: { requesterId: dbUser.id }, 
      orderBy: { createdAt: 'desc' }, 
      take: 5,
      include: { requester: true }
    });
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            {isManager ? "Operations Overview" : "My Overview"}
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Welcome back, {dbUser.name}</p>
        </div>
        <div className="inline-flex items-center gap-3 bg-white dark:bg-slate-900 px-4 py-2 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 transition-colors">
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
          <div>
            <span className="block text-[10px] text-slate-400 uppercase tracking-widest font-semibold">Your Role</span>
            <span className="font-semibold text-sm text-slate-700 dark:text-slate-200">{dbUser.role}</span>
          </div>
        </div>
      </div>

      {/* Modern SaaS Statistic Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Card 1 */}
        <div className="relative overflow-hidden bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 group hover:shadow-md transition-all">
          <div className="absolute top-0 left-0 w-1 h-full bg-indigo-500 rounded-l-2xl"></div>
          <div className="flex justify-between items-start">
            <div>
              <p className="text-slate-500 dark:text-slate-400 text-xs font-semibold uppercase tracking-wider mb-2">
                {isManager ? "Total Bookings" : "My Total Bookings"}
              </p>
              <h3 className="text-3xl font-bold text-slate-900 dark:text-white">{totalBookings}</h3>
            </div>
            <div className="p-3 bg-indigo-50 dark:bg-indigo-500/10 rounded-xl text-indigo-600 dark:text-indigo-400">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
            </div>
          </div>
        </div>
        
        {/* Card 2 */}
        <div className="relative overflow-hidden bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 group hover:shadow-md transition-all">
          <div className="absolute top-0 left-0 w-1 h-full bg-amber-500 rounded-l-2xl"></div>
          <div className="flex justify-between items-start">
            <div>
              <p className="text-slate-500 dark:text-slate-400 text-xs font-semibold uppercase tracking-wider mb-2">
                {isManager ? "Pending Approvals" : "My Pending Requests"}
              </p>
              <h3 className="text-3xl font-bold text-slate-900 dark:text-white">{pendingBookings}</h3>
            </div>
            <div className="p-3 bg-amber-50 dark:bg-amber-500/10 rounded-xl text-amber-600 dark:text-amber-400">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            </div>
          </div>
        </div>
        
        {/* Card 3 */}
        <div className="relative overflow-hidden bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 group hover:shadow-md transition-all">
          <div className="absolute top-0 left-0 w-1 h-full bg-emerald-500 rounded-l-2xl"></div>
          <div className="flex justify-between items-start">
            <div>
              <p className="text-slate-500 dark:text-slate-400 text-xs font-semibold uppercase tracking-wider mb-2">
                {isManager ? "Your Requests" : "Approved Requests"}
              </p>
              <h3 className="text-3xl font-bold text-slate-900 dark:text-white">{yourRequests}</h3>
            </div>
            <div className="p-3 bg-emerald-50 dark:bg-emerald-500/10 rounded-xl text-emerald-600 dark:text-emerald-400">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
            </div>
          </div>
        </div>
      </div>

      {/* Modern SaaS Data Table Area */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden transition-colors">
        
        <div className="px-6 py-5 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-900/50">
          <h2 className="text-base font-semibold text-slate-900 dark:text-white">Recent Studio Requests</h2>
          <Link href="/dashboard/request" className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 hover:shadow-md hover:shadow-indigo-500/20 active:scale-95 transition-all outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:focus:ring-offset-slate-900 flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
            New Request
          </Link>
        </div>
        
        {recentBookings.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 text-[11px] uppercase tracking-wider text-slate-500 dark:text-slate-400 font-semibold">
                  <th className="px-6 py-4">Program Name</th>
                  {isManager && <th className="px-6 py-4 flex-shrink-0">Requester</th>}
                  <th className="px-6 py-4">Date & Time</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {recentBookings.map((booking: any) => (
                  <tr key={booking.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-medium text-slate-900 dark:text-slate-100">{booking.progName}</div>
                      <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">{booking.mode} &bull; {booking.duration}</div>
                    </td>
                    {isManager && (
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-slate-700 dark:text-slate-300">{booking.requester.name}</div>
                      </td>
                    )}
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-slate-900 dark:text-slate-100">{booking.dateOfRecording.toLocaleDateString()}</div>
                      <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">{booking.timeOfRecording}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                        booking.status === 'APPROVED' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-500/10 dark:text-emerald-400' :
                        booking.status === 'PENDING' ? 'bg-amber-100 text-amber-800 dark:bg-amber-500/10 dark:text-amber-400' :
                        booking.status === 'DENIED' ? 'bg-rose-100 text-rose-800 dark:bg-rose-500/10 dark:text-rose-400' :
                        'bg-slate-100 text-slate-800 dark:bg-slate-500/10 dark:text-slate-400'
                      }`}>
                        {booking.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Link 
                        href={`/print/studio/${booking.id}`} 
                        target="_blank"
                        className="inline-flex p-1.5 text-slate-400 hover:text-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 dark:hover:text-slate-200 rounded-lg transition-colors"
                        title="Print Request"
                      >
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" /></svg>
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-16 flex flex-col items-center justify-center text-center">
            <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800/50 rounded-2xl flex items-center justify-center mb-4 transition-colors">
              <svg className="h-8 w-8 text-slate-400 dark:text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h3 className="text-slate-900 dark:text-slate-100 text-lg font-semibold mb-1">No requests right now</h3>
            <p className="text-slate-500 dark:text-slate-400 text-sm max-w-sm">
              {isManager 
                ? "There are currently no recent studio requests in the system."
                : "You haven't submitted any studio requests yet. Click the button above to book your first session."}
            </p>
          </div>
        )}
      </div>

    </div>
  );
}