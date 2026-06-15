"use client";

import { useEffect, useState, useRef } from "react";
import { fetchNotifications, markNotificationRead } from "@/lib/actions";
import Link from "next/link";

type Notification = {
  id: string;
  title: string;
  message: string;
  isRead: boolean;
  link: string | null;
  createdAt: Date;
};

export function NotificationBell() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Initial Fetch on component mount
  useEffect(() => {
    async function loadNotifications() {
      try {
        const data = await fetchNotifications();
        // The dates from server actions over network boundary might come as strings in some Next versions, ensure they are dates
        setNotifications(data.map((n: any) => ({ ...n, createdAt: new Date(n.createdAt) })));
      } catch (err) {
        console.error("Failed to load notifications");
      }
    }
    loadNotifications();
  },[]);

  // Close dropdown if clicked outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const handleMarkRead = async (id: string, e?: React.MouseEvent) => {
    if (e) {
        e.preventDefault();
        e.stopPropagation();
    }
    
    // Optimistic UI updates
    setNotifications(current => 
      current.map(n => n.id === id ? { ...n, isRead: true } : n)
    );
    
    // Sync to backend
    await markNotificationRead(id);
  };

  return (
    <div className="relative z-50" ref={dropdownRef}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 rounded-full text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800 transition relative outline-none focus:ring-2 focus:ring-indigo-500/20"
      >
        {unreadCount > 0 && (
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-500 rounded-full border-2 border-white dark:border-slate-950 animate-pulse"></span>
        )}
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl rounded-2xl overflow-hidden animate-in fade-in slide-in-from-top-2 z-50">
          <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-900/50">
            <h3 className="font-semibold text-slate-900 dark:text-white text-sm">Notifications</h3>
            {unreadCount > 0 && (
              <span className="bg-rose-100 text-rose-600 dark:bg-rose-500/10 dark:text-rose-400 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                {unreadCount} New
              </span>
            )}
          </div>
          
          <div className="max-h-80 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="p-8 text-center text-sm text-slate-500 dark:text-slate-400 flex flex-col items-center">
                 <svg className="w-8 h-8 text-slate-300 dark:text-slate-600 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>
                 Nothing new here!
              </div>
            ) : (
              <ul className="divide-y divide-slate-100 dark:divide-slate-800/50 text-left">
                {notifications.map((n) => {
                  const content = (
                     <div className={`p-4 transition-colors ${!n.isRead ? 'bg-indigo-50/50 dark:bg-indigo-500/5' : 'hover:bg-slate-50 dark:hover:bg-slate-800/30'}`}>
                        <div className="flex justify-between items-start gap-2">
                           <div className="flex-1">
                              <h4 className={`text-xs font-bold mb-1 ${!n.isRead ? 'text-indigo-900 dark:text-indigo-300' : 'text-slate-700 dark:text-slate-300'}`}>
                                {n.title}
                              </h4>
                              <p className={`text-xs ${!n.isRead ? 'text-slate-700 dark:text-slate-400' : 'text-slate-500 dark:text-slate-500'}`}>
                                {n.message}
                              </p>
                              <p className="text-[9px] font-medium text-slate-400 mt-2 uppercase tracking-wide">
                                {n.createdAt.toLocaleDateString()} &bull; {n.createdAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </p>
                           </div>
                           {!n.isRead && (
                               <button 
                                 onClick={(e) => handleMarkRead(n.id, e)}
                                 className="shrink-0 p-1 rounded-md text-indigo-400 hover:text-indigo-600 hover:bg-indigo-100 dark:hover:bg-indigo-500/20 transition-colors tooltip"
                                 title="Mark as Read"
                               >
                                 <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                               </button>
                           )}
                        </div>
                     </div>
                  );

                  return (
                    <li key={n.id}>
                       {n.link ? (
                           <Link href={n.link} onClick={() => { if (!n.isRead) handleMarkRead(n.id); setIsOpen(false); }}>
                               {content}
                           </Link>
                       ) : content }
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
