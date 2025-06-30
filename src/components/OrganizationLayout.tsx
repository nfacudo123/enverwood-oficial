
import React from 'react';
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from '@/components/AppSidebar';

interface OrganizationLayoutProps {
  children: React.ReactNode;
}

export const OrganizationLayout: React.FC<OrganizationLayoutProps> = ({ children }) => {
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AppSidebar />
        <SidebarInset className="flex-1">
          <div className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
            <SidebarTrigger className="-ml-1" />
            <h1 className="text-xl font-semibold text-gray-900">
              Organización
            </h1>
          </div>
          {children}
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
};
