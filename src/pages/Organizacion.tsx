import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users } from "lucide-react";
import { OrganizationChart } from '@/components/OrganizationChart';
import { OrganizationStats } from '@/components/OrganizationStats';
import { OrganizationLayout } from '@/components/OrganizationLayout';
import { useReferidos } from '@/hooks/useReferidos';

const Organizacion = () => {
  const { referidosData, totalEquipo, directos, isLoading, error } = useReferidos();

  if (isLoading) {
    return (
      <OrganizationLayout title="Organización">
        <div className="p-6 flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent mx-auto mb-4"></div>
            <p className="text-muted-foreground text-lg">Cargando datos de organización...</p>
          </div>
        </div>
      </OrganizationLayout>
    );
  }

  if (error) {
    return (
      <OrganizationLayout title="Organización">
        <div className="p-6 flex items-center justify-center min-h-[60vh]">
          <div className="text-center max-w-md">
            <div className="bg-danger/10 border border-danger/20 rounded-xl p-6 mb-6">
              <p className="text-danger mb-4 text-lg font-medium">Error: {error}</p>
            </div>
            <button 
              onClick={() => window.location.reload()} 
              className="bg-gradient-to-r from-primary to-primary-glow text-white px-6 py-3 rounded-lg hover:shadow-lg hover:shadow-primary/25 transition-all duration-200 font-medium"
            >
              Reintentar
            </button>
          </div>
        </div>
      </OrganizationLayout>
    );
  }

  return (
    <OrganizationLayout title="Organización">
      <div className="p-6 space-y-6">
        {/* Estadísticas */}
        <OrganizationStats totalEquipo={totalEquipo} directos={directos} />

        {/* Gráfico de Organización */}
        <Card className="bg-gradient-to-br from-card to-card-variant border-border shadow-xl">
          <CardHeader className="bg-gradient-to-r from-primary/5 to-primary-glow/5 border-b border-border">
            <CardTitle className="flex items-center gap-3 text-foreground">
              <div className="p-2 bg-gradient-to-br from-primary to-primary-glow rounded-lg shadow-lg">
                <Users className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold">Gráfico de Organización</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {referidosData ? (
              <OrganizationChart data={referidosData} />
            ) : (
              <div className="text-center py-16">
                <div className="bg-muted/50 rounded-xl p-8 mx-6">
                  <Users className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground text-lg">No hay datos de organización disponibles</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </OrganizationLayout>
  );
};

export default Organizacion;
