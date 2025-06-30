
import React from 'react';
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { AppSidebar } from '@/components/AppSidebar';
import { UserNavbar } from '@/components/UserNavbar';

interface OrganizationLayoutProps {
  children: React.ReactNode;
}

export const OrganizationLayout: React.FC<OrganizationLayoutProps> = ({ children }) => {
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AppSidebar />
        <SidebarInset className="flex-1">
          <UserNavbar title="Organización" showSidebarTrigger={true} />
          {children}
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
};
