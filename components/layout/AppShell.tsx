"use client";

import { cn } from "@/lib/utils";
import { Sidebar } from "./Sidebar";
import { SidebarProvider, useSidebar } from "./SidebarProvider";

function MainContent({ children }: { children: React.ReactNode }) {
  const { collapsed } = useSidebar();

  return (
    <main
      className={cn(
        "min-w-0 flex-1 overflow-x-hidden transition-[margin] duration-300 ease-in-out",
        collapsed ? "ml-16" : "ml-64",
      )}
    >
      {children}
    </main>
  );
}

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <div className="flex min-h-screen">
        <Sidebar />
        <MainContent>{children}</MainContent>
      </div>
    </SidebarProvider>
  );
}
