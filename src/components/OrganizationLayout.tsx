
import React from 'react';
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { AppSidebar } from '@/components/AppSidebar';
import { UserNavbar } from '@/components/UserNavbar';
import Footer from '@/components/Footer';
import { FloatingContactLinks } from '@/components/FloatingContactLinks';

interface OrganizationLayoutProps {
  children: React.ReactNode;
  title?: string;
}

export const OrganizationLayout: React.FC<OrganizationLayoutProps> = ({ 
  children, 
  title = "Panel de Control" 
}) => {
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AppSidebar />
        <SidebarInset className="flex-1 flex flex-col">
          <UserNavbar title={title} showSidebarTrigger={true} />
          <div className="flex-1">
            {children}
          </div>
          <Footer />
        </SidebarInset>
        <FloatingContactLinks />
      </div>
    </SidebarProvider>
  );
};
