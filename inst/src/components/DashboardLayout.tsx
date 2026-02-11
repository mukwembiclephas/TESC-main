import { ReactNode } from "react";
import AppSidebar from "./AppSidebar";
import { SidebarProvider } from "@/components/ui/sidebar";

interface DashboardLayoutProps {
  children: ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <AppSidebar />
        <div className="flex-1 flex flex-col">
          <main className="flex-1 p-6 overflow-auto">{children}</main>
        </div>
      </div>
    </SidebarProvider>
  );
}
