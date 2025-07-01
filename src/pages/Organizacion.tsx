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
        <div className="p-6 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p>Cargando datos de organización...</p>
          </div>
        </div>
      </OrganizationLayout>
    );
  }

  if (error) {
    return (
      <OrganizationLayout title="Organización">
        <div className="p-6 flex items-center justify-center">
          <div className="text-center">
            <p className="text-red-600 mb-4">Error: {error}</p>
            <button 
              onClick={() => window.location.reload()} 
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
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

        {/* Gráfico de Organización D3.js */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              Gráfico de Organización
            </CardTitle>
          </CardHeader>
          <CardContent>
            {referidosData ? (
              <OrganizationChart data={referidosData} />
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-500">No hay datos de organización disponibles</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </OrganizationLayout>
  );
};

export default Organizacion;
