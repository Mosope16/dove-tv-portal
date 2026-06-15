// src/app/dashboard/marketing/page.tsx

"use client";

import { useActionState, useEffect, useState } from "react";
import { createMarketingJobRequest } from "@/lib/actions";

export default function MarketingJobFormPage() {
  const [state, formAction, isPending] = useActionState(createMarketingJobRequest, null);
  const [toast, setToast] = useState<{message: string, type: 'error' | 'success'} | null>(null);

  useEffect(() => {
    if (state?.error) {
      setToast({ message: state.error, type: 'error' });
      const timer = setTimeout(() => setToast(null), 5000);
      return () => clearTimeout(timer);
    } else if (state?.success) {
      setToast({ message: "Marketing Job submitted successfully!", type: 'success' });
      const timer = setTimeout(() => setToast(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [state]);

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500 pb-12 relative">
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
            <button onClick={() => setToast(null)} type="button" className="ml-auto opacity-70 hover:opacity-100">
              <svg className="w-4 h-4 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          </div>
        </div>
      )}

      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 border-b border-slate-200 dark:border-slate-800 pb-6">
        <div className="flex items-start gap-4">
          <div className="mt-1 text-slate-800 dark:text-slate-200">
            {/* Megaphone Icon from Image */}
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="2.5" 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              className="w-10 h-10 text-slate-700 dark:text-slate-300"
            >
              <path d="M3 11l18-5v12L3 14v-3z"></path>
              <path d="M11.6 16.8a3 3 0 11-5.8-1.6"></path>
            </svg>
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
              Request IT Coverage
            </h1>
            <p className="text-base text-slate-500 dark:text-slate-400 mt-2">
              Request IT coverage for an off-site or marketing event.
            </p>
          </div>
        </div>
      </div>

      <form action={formAction} className="space-y-8">
        
        {/* Main Details Section */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden transition-all hover:shadow-md group">
          <div className="p-8 space-y-6">
            
            {/* Location / Venue */}
            <div>
              <label htmlFor="location" className="block text-[13px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-2">
                Location / Venue
              </label>
              <input 
                type="text" 
                id="location" 
                name="location"
                placeholder="e.g. Main Auditorium, Studio B..."
                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all dark:text-white dark:placeholder-slate-500 shadow-sm text-sm"
                required
              />
            </div>
            
            {/* Schedule Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label htmlFor="dateOfAssignment" className="block text-[13px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-2">
                  Date of Assignment
                </label>
                <div className="relative">
                  <input 
                    type="date" 
                    id="dateOfAssignment" 
                    name="dateOfAssignment"
                    required
                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all dark:text-white shadow-sm color-scheme-light dark:color-scheme-dark text-sm appearance-none"
                  />
                </div>
              </div>
              
              <div>
                <label htmlFor="timeOfAssignment" className="block text-[13px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-2">
                  Time of Assignment
                </label>
                <input 
                  type="time" 
                  id="timeOfAssignment" 
                  name="timeOfAssignment"
                  required
                  className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all dark:text-white shadow-sm color-scheme-light dark:color-scheme-dark text-sm appearance-none"
                />
              </div>
            </div>

            {/* Job Description & Scope */}
            <div>
              <label htmlFor="jobDescription" className="block text-[13px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-2">
                Job Description & Scope
              </label>
              <textarea 
                id="jobDescription" 
                name="jobDescription"
                rows={5}
                placeholder="Describe exactly what needs to be done..."
                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all dark:text-white dark:placeholder-slate-500 shadow-sm text-sm resize-y"
                required
              />
            </div>

          </div>
        </div>

        {/* Form Actions */}
        <div className="pt-2">
          <button 
            type="submit" 
            disabled={isPending}
            className="w-full py-4 rounded-xl text-base font-bold text-white bg-rose-600 hover:bg-rose-700 shadow-lg shadow-rose-500/30 active:scale-[0.98] transition-all focus:ring-2 focus:ring-rose-500 focus:ring-offset-2 dark:focus:ring-offset-slate-900 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {isPending ? (
              <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            ) : (
              <svg 
                className="w-5 h-5" 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"></path>
              </svg>
            )}
            {isPending ? 'Submitting...' : 'Submit Marketing Job'}
          </button>
        </div>

      </form>
    </div>
  );
}
