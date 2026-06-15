// src/app/dashboard/layout.tsx
import { UserButton } from "@clerk/nextjs";
import { currentUser } from "@clerk/nextjs/server";
import Link from "next/link";
import { ThemeToggle } from "@/components/ThemeToggle";
import { SidebarNav } from "./SidebarNav";

import { DashboardShell } from "./DashboardShell";

import { syncCurrentUser } from "@/lib/actions";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const dbUser = await syncCurrentUser();
  
  if (!dbUser) {
    return <div>Error loading profile.</div>;
  }

  const userName = dbUser.name || 'Employee';
  const userEmail = dbUser.email || 'staff@broadcast.local';
  const userRole = dbUser.role;

  return (
    <DashboardShell userName={userName} userEmail={userEmail} role={userRole}>
      {children}
    </DashboardShell>
  );
}