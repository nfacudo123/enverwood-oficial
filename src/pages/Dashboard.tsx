
import React from 'react';
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from '@/components/AppSidebar';
import { SidebarInset } from "@/components/ui/sidebar";
import { DashboardContent } from '@/components/DashboardContent';
import { UserNavbar } from '@/components/UserNavbar';

const Dashboard = () => {
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AppSidebar />
        <SidebarInset className="flex-1">
          <UserNavbar title="Panel de Control" />
          <DashboardContent />
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
};

export default Dashboard;
