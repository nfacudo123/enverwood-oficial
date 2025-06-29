
import React from 'react';
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from '@/components/AppSidebar';
import { SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { DashboardContent } from '@/components/DashboardContent';
import { UserNavbar } from '@/components/UserNavbar';

const Dashboard = () => {
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AppSidebar />
        <SidebarInset className="flex-1">
          <UserNavbar />
          <div className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
            <SidebarTrigger className="-ml-1" />
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <h1 className="text-xl font-semibold text-gray-900">
                  Panel de Control
                </h1>
              </div>
            </div>
          </div>
          <DashboardContent />
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
};

export default Dashboard;
