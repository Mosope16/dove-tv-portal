"use client";

import { useTransition, useState } from "react";
import { updateBookingStatus } from "@/lib/actions";

type RequestItem = {
  id: string;
  type: 'STUDIO' | 'MARKETING';
  title: string;
  requesterName: string;
  date: string;
  status: string;
};

export function WorkflowsTable({ 
  initialItems, 
  userRole 
}: { 
  initialItems: RequestItem[],
  userRole: string 
}) {
  const [items, setItems] = useState(initialItems);
  const [isPending, startTransition] = useTransition();
  const [toast, setToast] = useState<{message: string, type: 'error' | 'success'} | null>(null);

  const handleAction = async (id: string, type: 'STUDIO' | 'MARKETING', action: 'APPROVE' | 'DENY') => {
    let targetStatus: 'HOU_APPROVED' | 'APPROVED' | 'DENIED' = 'DENIED';
    
    if (action === 'APPROVE') {
      targetStatus = userRole === 'HOU' ? 'HOU_APPROVED' : 'APPROVED';
    }

    // Optimistically remove it from the action list (since their queue only looks for specific scopes)
    const previousItems = [...items];
    setItems(items.filter(item => item.id !== id));

    startTransition(async () => {
      const result = await updateBookingStatus(id, type, targetStatus);
      if (result.error) {
        setItems(previousItems); // revert
        setToast({ message: result.error, type: 'error' });
      } else {
        setToast({ message: `Request successfully ${targetStatus.replace('_', ' ').toLowerCase()}!`, type: 'success' });
      }
      setTimeout(() => setToast(null), 4000);
    });
  };

  const handlePrint = (id: string, type: string) => {
    window.open(`/print/${type.toLowerCase()}/${id}`, '_blank');
  };

  return (
    <div className="space-y-6 relative">
      {toast && (
        <div className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-xl shadow-lg border transition-all animate-in slide-in-from-top-4 ${toast.type === 'error' ? 'bg-rose-50 border-rose-200 text-rose-800 dark:bg-rose-950/50 dark:border-rose-900/50 dark:text-rose-300' : 'bg-emerald-50 border-emerald-200 text-emerald-800 dark:bg-emerald-950/50 dark:border-emerald-900/50 dark:text-emerald-300'}`}>
          <div className="flex items-center gap-3">
            <p className="text-sm font-medium">{toast.message}</p>
            <button onClick={() => setToast(null)} type="button" className="ml-auto opacity-70 hover:opacity-100 cursor-pointer">
              <svg className="w-4 h-4 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          </div>
        </div>
      )}

      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden transition-colors">
        <div className="px-6 py-5 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 flex justify-between items-center">
          <h2 className="text-base font-semibold text-slate-900 dark:text-white">Action Required</h2>
          <span className="bg-indigo-100 text-indigo-700 dark:bg-indigo-500/20 dark:text-indigo-400 px-3 py-1 rounded-full text-xs font-bold">
            {items.length} {items.length === 1 ? 'Item' : 'Items'}
          </span>
        </div>
        
        <div className="overflow-x-auto relative min-h-[150px]">
          {isPending && (
            <div className="absolute inset-0 bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm z-10 flex items-center justify-center">
               <svg className="w-8 h-8 animate-spin text-indigo-500" fill="none" viewBox="0 0 24 24">
                 <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                 <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
               </svg>
            </div>
          )}

          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 text-[11px] uppercase tracking-wider text-slate-500 dark:text-slate-400 font-semibold">
                <th className="px-6 py-4">Request Type</th>
                <th className="px-6 py-4 truncate">Details</th>
                <th className="px-6 py-4">Requester</th>
                <th className="px-6 py-4">Date</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {items.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors">
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                      item.type === 'STUDIO' ? 'bg-sky-100 text-sky-800 dark:bg-sky-500/10 dark:text-sky-400' : 'bg-fuchsia-100 text-fuchsia-800 dark:bg-fuchsia-500/10 dark:text-fuchsia-400'
                    }`}>
                      {item.type}
                    </span>
                  </td>
                  <td className="px-6 py-4 font-medium text-slate-900 dark:text-slate-100 text-sm max-w-xs truncate">
                    {item.title}
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-300">
                    {item.requesterName}
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-500 dark:text-slate-400">
                    {item.date}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button 
                        onClick={() => handlePrint(item.id, item.type)}
                        className="p-1.5 text-slate-400 hover:text-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 dark:hover:text-slate-200 rounded-lg transition-colors"
                        title="Print"
                      >
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" /></svg>
                      </button>
                      <button 
                        onClick={() => handleAction(item.id, item.type, 'APPROVE')}
                        className="p-1.5 text-indigo-400 hover:text-white hover:bg-indigo-600 rounded-lg transition-colors"
                        title="Approve"
                      >
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                      </button>
                      <button 
                        onClick={() => handleAction(item.id, item.type, 'DENY')}
                        className="p-1.5 text-rose-400 hover:text-white hover:bg-rose-500 rounded-lg transition-colors"
                        title="Deny"
                      >
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {items.length === 0 && (
                 <tr>
                    <td colSpan={5}>
                        <div className="p-12 text-center flex flex-col items-center">
                            <div className="w-16 h-16 bg-emerald-50 dark:bg-emerald-500/10 rounded-full flex items-center justify-center mb-4">
                                <svg className="w-8 h-8 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                            </div>
                            <h3 className="text-slate-900 dark:text-slate-100 font-semibold mb-1">You're all caught up!</h3>
                            <p className="text-slate-500 dark:text-slate-400 text-sm">There are no pending requests waiting for your approval.</p>
                        </div>
                    </td>
                 </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
