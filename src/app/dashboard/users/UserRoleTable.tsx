"use client";

import { useTransition, useState } from "react";
import { updateUserRole } from "@/lib/actions";
import { Role } from "@prisma/client";

type User = {
  id: string;
  name: string;
  email: string;
  role: string;
};

export function UserRoleTable({ initialUsers }: { initialUsers: User[] }) {
  const [users, setUsers] = useState(initialUsers);
  const [isPending, startTransition] = useTransition();
  const [toast, setToast] = useState<{message: string, type: 'error' | 'success'} | null>(null);

  const handleRoleChange = async (userId: string, newRole: string) => {
    // Optimistic UI update
    const previousUsers = [...users];
    setUsers(users.map(u => u.id === userId ? { ...u, role: newRole } : u));

    startTransition(async () => {
      const result = await updateUserRole(userId, newRole as Role);
      if (result.error) {
        setUsers(previousUsers); // Revert on failure
        setToast({ message: result.error, type: 'error' });
      } else {
        setToast({ message: 'Role updated successfully!', type: 'success' });
      }
      
      setTimeout(() => setToast(null), 3000);
    });
  };

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {toast && (
        <div className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-xl shadow-lg border transition-all animate-in slide-in-from-top-4 ${toast.type === 'error' ? 'bg-rose-50 border-rose-200 text-rose-800 dark:bg-rose-950/50 dark:border-rose-900/50 dark:text-rose-300' : 'bg-emerald-50 border-emerald-200 text-emerald-800 dark:bg-emerald-950/50 dark:border-emerald-900/50 dark:text-emerald-300'}`}>
          <div className="flex items-center gap-3">
            {toast.type === 'error' ? (
              <svg className="w-5 h-5 text-rose-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            ) : (
              <svg className="w-5 h-5 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
            )}
            <p className="text-sm font-medium">{toast.message}</p>
            <button onClick={() => setToast(null)} type="button" className="ml-auto opacity-70 hover:opacity-100 cursor-pointer">
              <svg className="w-4 h-4 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          </div>
        </div>
      )}

      {/* Modern SaaS Data Table Area */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden transition-colors">
        <div className="px-6 py-5 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
          <h2 className="text-base font-semibold text-slate-900 dark:text-white">Active Team Members</h2>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 text-[11px] uppercase tracking-wider text-slate-500 dark:text-slate-400 font-semibold">
                <th className="px-6 py-4">Name</th>
                <th className="px-6 py-4">Email Address</th>
                <th className="px-6 py-4 w-48">Assigned Role</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 relative">
              {isPending && (
                <tr className="absolute inset-0 bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm z-10 flex items-center justify-center">
                  <td>
                    <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 font-medium">
                      <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Updating...
                    </div>
                  </td>
                </tr>
              )}
              {users.map((user) => (
                <tr key={user.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="font-semibold text-slate-900 dark:text-slate-100">{user.name}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-slate-500 dark:text-slate-400">{user.email}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="relative">
                      <select 
                        value={user.role}
                        onChange={(e) => handleRoleChange(user.id, e.target.value)}
                        disabled={isPending}
                        className="w-full appearance-none bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-sm font-medium text-slate-700 dark:text-slate-300 rounded-lg pl-3 pr-8 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <option value="STAFF">ORDINARY STAFF</option>
                        <option value="PROG_ENG">PROGRAM ENGINEER</option>
                        <option value="ENG_MGR">ENG MGR</option>
                        <option value="HOU">HEAD OF UNIT</option>
                      </select>
                      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-slate-400">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                      </div>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {users.length === 0 && !isPending && (
            <div className="p-8 text-center text-slate-500 dark:text-slate-400 text-sm">
              No users found in the system.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
