"use client";

import { useState } from "react";
import { UserButton, SignOutButton } from "@clerk/nextjs";
import { ThemeToggle } from "@/components/ThemeToggle";
import { SidebarNav } from "./SidebarNav";
import { NotificationBell } from "@/components/NotificationBell";

export function DashboardShell({ 
  userName, 
  userEmail, 
  role,
  children 
}: { 
  userName: string;
  userEmail: string;
  role: string;
  children: React.ReactNode;
}) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <div className="flex h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans transition-colors duration-300 overflow-hidden">
      
      {/* Mobile Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/30 dark:bg-black/50 z-40 md:hidden backdrop-blur-sm transition-opacity"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* SaaS Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 flex-col flex h-full border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 shadow-xl md:shadow-sm transition-transform duration-300 md:relative md:translate-x-0 ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        
        {/* App Title */}
        <div className="h-16 flex items-center justify-between px-6 border-b border-slate-200 dark:border-slate-800 transition-colors duration-300 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg outline-none bg-indigo-600 shadow-lg shadow-indigo-500/30 flex items-center justify-center">
               <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
            </div>
            <div>
              <h2 className="text-[17px] font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-slate-600 dark:from-white dark:to-slate-300">OMS Portal</h2>
            </div>
          </div>
          {/* Close button for mobile */}
          <button 
            className="md:hidden p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-md"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        {/* Navigation Sections */}
        <div onClick={() => {
            // Automatically close the sidebar when a mobile link is clicked
            if (window.innerWidth < 768) {
                setIsMobileMenuOpen(false);
            }
        }} className="flex-1 overflow-y-auto">
            <SidebarNav role={role} />
        </div>

        {/* User Card at Bottom */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-800 transition-colors duration-300 shrink-0">
          <div className="flex items-center gap-3 p-2 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors duration-200 cursor-pointer">
             <UserButton appearance={{ elements: { avatarBox: "w-9 h-9 shadow-sm" } }} />
             <div className="overflow-hidden flex-1">
               <h3 className="font-semibold text-sm text-slate-900 dark:text-slate-100 truncate">{userName}</h3>
               <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">{userEmail}</p>
             </div>
             <SignOutButton>
               <button className="p-1.5 text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10 rounded-lg transition-colors cursor-pointer" title="Log out">
                 <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
               </button>
             </SignOutButton>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
        
        {/* Top Navbar */}
        <header className="h-16 shrink-0 flex items-center justify-between px-6 lg:px-8 border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-950/80 backdrop-blur-md z-10 transition-colors duration-300">
          
          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button 
              className="p-2 -ml-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500/20"
              onClick={() => setIsMobileMenuOpen(true)}
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
            </button>
            <h2 className="ml-2 text-lg font-semibold tracking-tight text-slate-900 dark:text-white">OMS Portal</h2>
          </div>
          
          <div className="flex-1 hidden md:block" />

          {/* Nav Actions */}
          <div className="flex items-center gap-3 lg:gap-4">
            
            {/* Search */}
            <div className="hidden sm:block relative">
              <svg className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
              <input 
                type="text" 
                placeholder="Search resources..." 
                className="w-64 pl-9 pr-4 py-2 text-sm bg-slate-100 dark:bg-slate-900 border border-transparent rounded-full focus:bg-white dark:focus:bg-slate-950 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all dark:text-slate-200 dark:placeholder-slate-500 shadow-sm" 
              />
            </div>
            
            {/* Notification Bell */}
            <NotificationBell />
            
            <div className="w-px h-6 bg-slate-200 dark:bg-slate-800 hidden sm:block mx-1" />
            
            {/* Theme Toggle Component */}
            <ThemeToggle />
            
            <div className="md:hidden ml-1">
              <UserButton />
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8 bg-slate-50/50 dark:bg-slate-950 transition-colors duration-300">
          <div className="max-w-7xl mx-auto h-full space-y-6">
            {children}
          </div>
        </main>

      </div>
    </div>
  );
}
