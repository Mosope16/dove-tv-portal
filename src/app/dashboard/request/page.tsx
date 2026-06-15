"use client";

import { useActionState, useEffect, useState } from "react";
import { createBookingRequest } from "@/lib/actions";

export default function StudioBookingFormPage() {
  const [state, formAction, isPending] = useActionState(createBookingRequest, null);
  const [toast, setToast] = useState<{message: string, type: 'error' | 'success'} | null>(null);

  useEffect(() => {
    if (state?.error) {
      setToast({ message: state.error, type: 'error' });
      const timer = setTimeout(() => setToast(null), 5000);
      return () => clearTimeout(timer);
    } else if (state?.success) {
      setToast({ message: "Booking requested successfully!", type: 'success' });
      const timer = setTimeout(() => setToast(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [state]);

  const todayStr = new Date().toISOString().split('T')[0];

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
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 text-xs font-semibold mb-3">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            New Request
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
             Studio/Engineering Booking
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">
            Complete the form below to request programme recording, studio time, or engineering resources.
          </p>
        </div>
      </div>

      <form action={formAction} className="space-y-8">
        {/* Main Details Section */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden transition-all hover:shadow-md group">
          <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
            <h2 className="text-sm font-semibold text-slate-900 dark:text-white flex items-center gap-2">
              <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Programme Overview
            </h2>
          </div>
          
          <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="md:col-span-2 lg:col-span-2">
              <label htmlFor="progName" className="block text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wider mb-2">Name of Prog</label>
              <input 
                type="text" 
                id="progName" 
                name="progName"
                placeholder="e.g. Open Heavens"
                className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all dark:text-white dark:placeholder-slate-500 shadow-sm"
                required
              />
            </div>
            
            <div>
              <label htmlFor="duration" className="block text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wider mb-2">Duration</label>
              <input 
                type="text" 
                id="duration" 
                name="duration"
                placeholder="e.g. 4 hours"
                className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all dark:text-white dark:placeholder-slate-500 shadow-sm"
              />
            </div>

            <div>
              <label htmlFor="type" className="block text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wider mb-2">Live or Recording</label>
              <select 
                id="type" 
                name="type"
                defaultValue=""
                className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all dark:text-white shadow-sm cursor-pointer"
              >
                <option value="" disabled>Select format...</option>
                <option value="Recording">Recording</option>
                <option value="Live">Live</option>
              </select>
            </div>
          </div>
        </div>

        {/* Schedule Section */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden transition-all hover:shadow-md group">
          <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
            <h2 className="text-sm font-semibold text-slate-900 dark:text-white flex items-center gap-2">
              <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              Schedule
            </h2>
          </div>
          
          <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label htmlFor="dateOfBooking" className="block text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wider mb-2">Date of Booking</label>
              <input 
                type="date" 
                id="dateOfBooking" 
                name="dateOfBooking"
                defaultValue={todayStr}
                readOnly
                className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl outline-none transition-all dark:text-slate-400 shadow-sm opacity-80 cursor-not-allowed color-scheme-light dark:color-scheme-dark"
              />
            </div>
            
            <div>
              <label htmlFor="dateOfRecording" className="block text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wider mb-2">Date of Recording</label>
              <input 
                type="date" 
                id="dateOfRecording" 
                name="dateOfRecording"
                min={todayStr}
                required
                className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all dark:text-white shadow-sm color-scheme-light dark:color-scheme-dark"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="startTime" className="block text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wider mb-2">Start Time</label>
                <input 
                  type="time" 
                  id="startTime" 
                  name="startTime"
                  required
                  className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all dark:text-white shadow-sm color-scheme-light dark:color-scheme-dark"
                />
              </div>
              <div>
                <label htmlFor="endTime" className="block text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wider mb-2">End Time</label>
                <input 
                  type="time" 
                  id="endTime" 
                  name="endTime"
                  required
                  className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all dark:text-white shadow-sm color-scheme-light dark:color-scheme-dark"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Personnel Section */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden transition-all hover:shadow-md group">
          <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
            <h2 className="text-sm font-semibold text-slate-900 dark:text-white flex items-center gap-2">
              <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              Personnel
            </h2>
          </div>
          
          <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <div>
                <label htmlFor="producer" className="block text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wider mb-2">Name of Producer</label>
                <input 
                  type="text" 
                  id="producer" 
                  name="producer"
                  placeholder="e.g. Deji Akinniyi"
                  className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all dark:text-white dark:placeholder-slate-500 shadow-sm"
                />
              </div>
              <div>
                <label htmlFor="producerEmail" className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
                  Producer Email <span className="normal-case font-normal text-slate-400">(for reminder)</span>
                </label>
                <input 
                  type="email" 
                  id="producerEmail" 
                  name="producerEmail"
                  placeholder="producer@example.com"
                  className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all dark:text-white dark:placeholder-slate-500 shadow-sm text-sm"
                />
              </div>
            </div>
            
            <div className="space-y-3">
              <div>
                <label htmlFor="presenter" className="block text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wider mb-2">Name of Presenter</label>
                <input 
                  type="text" 
                  id="presenter" 
                  name="presenter"
                  placeholder="Enter presenter name"
                  className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all dark:text-white dark:placeholder-slate-500 shadow-sm"
                />
              </div>
              <div>
                <label htmlFor="presenterEmail" className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
                  Presenter Email <span className="normal-case font-normal text-slate-400">(for reminder)</span>
                </label>
                <input 
                  type="email" 
                  id="presenterEmail" 
                  name="presenterEmail"
                  placeholder="presenter@example.com"
                  className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all dark:text-white dark:placeholder-slate-500 shadow-sm text-sm"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Administration Section */}
        <div className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl shadow-inner border border-slate-200 dark:border-slate-800 overflow-hidden transition-all">
          <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800">
            <h2 className="text-sm font-semibold text-slate-900 dark:text-white flex items-center gap-2">
              <svg className="w-4 h-4 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Sign-offs (Admin Use Only)
            </h2>
          </div>
          
          <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-8 opacity-70 cursor-not-allowed">
            <div className="space-y-3">
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">APPROVED By: (Name and sign)</label>
              <div className="h-12 border-b-2 border-dashed border-slate-300 dark:border-slate-700 relative">
                <span className="absolute bottom-1 right-2 text-xs text-slate-400 italic">Signature / Date</span>
              </div>
            </div>
            
            <div className="space-y-3">
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">Received By: (Name and sign)</label>
              <div className="h-12 border-b-2 border-dashed border-slate-300 dark:border-slate-700 relative">
                <span className="absolute bottom-1 right-2 text-xs text-slate-400 italic">Signature</span>
              </div>
            </div>
          </div>
        </div>

        {/* Form Actions */}
        <div className="flex justify-end gap-4 pt-4">
          <button 
            type="button" 
            className="px-6 py-2.5 rounded-xl text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors focus:ring-2 focus:ring-slate-400 focus:outline-none"
          >
            Cancel
          </button>
          <button 
            type="submit" 
            disabled={isPending}
            className="px-6 py-2.5 rounded-xl text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 shadow-md shadow-indigo-500/20 active:scale-95 transition-all focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:focus:ring-offset-slate-900 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isPending ? (
              <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            ) : (
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            )}
            {isPending ? 'Submitting...' : 'Submit Request'}
          </button>
        </div>

      </form>
    </div>
  );
}
