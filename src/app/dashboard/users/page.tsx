import { syncCurrentUser } from "@/lib/actions";
import prisma from "@/lib/prisma";
import { UserRoleTable } from "./UserRoleTable";

export default async function UsersPage() {
  const dbUser = await syncCurrentUser();
  
  if (!dbUser) {
    return (
      <div className="flex h-full items-center justify-center">
        <p className="text-slate-500 dark:text-slate-400">Error loading profile. Please try logging in again.</p>
      </div>
    );
  }

  // Security Check point
  const isManager = dbUser.role === 'ENG_MGR' || dbUser.role === 'HOU';

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
          You do not have the required clearance to view or modify User Management settings. 
        </p>
      </div>
    );
  }

  const allUsers = await prisma.user.findMany({
    orderBy: { name: 'asc' }
  });

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
              <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 00-3-3.87"></path><path d="M16 3.13a4 4 0 010 7.75"></path>
            </svg>
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
              User Management
            </h1>
            <p className="text-base text-slate-500 dark:text-slate-400 mt-2">
              Review active team members and securely assign managerial roles.
            </p>
          </div>
        </div>
      </div>

      {/* The Interactive Table Component */}
      <UserRoleTable initialUsers={allUsers} />

    </div>
  );
}
