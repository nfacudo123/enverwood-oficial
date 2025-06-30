
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { User, Users } from "lucide-react";

interface OrganizationStatsProps {
  totalEquipo: number;
  directos: number;
}

export const OrganizationStats: React.FC<OrganizationStatsProps> = ({ 
  totalEquipo, 
  directos 
}) => {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Total en Equipo
          </CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{totalEquipo}</div>
          <p className="text-xs text-muted-foreground">
            miembros activos
          </p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Mis Directos
          </CardTitle>
          <User className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{directos}</div>
          <p className="text-xs text-muted-foreground">
            referidos directos
          </p>
        </CardContent>
      </Card>
    </div>
  );
};
