
import React from 'react';
import { DashboardContent } from '@/components/DashboardContent';
import { OrganizationLayout } from '@/components/OrganizationLayout';

const Dashboard = () => {
  return (
    <OrganizationLayout title="Panel de Control">
      <DashboardContent />
    </OrganizationLayout>
  );
};

export default Dashboard;
