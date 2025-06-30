import React, { useEffect, useState } from 'react';
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from '@/components/AppSidebar';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { User, Users } from "lucide-react";
import { OrganizationChart } from '@/components/OrganizationChart';

interface ReferidoData {
  id: number;
  name: string;
  apellidos: string;
  username: string;
  email: string;
  nivel: number;
  parent_id: number | null;
  children: ReferidoData[];
}

interface MisReferidosResponse {
  success: boolean;
  data: {
    totalEquipo: number;
    directos: number;
    arbol: ReferidoData;
  };
}

const Organizacion = () => {
  const [referidosData, setReferidosData] = useState<ReferidoData | null>(null);
  const [totalEquipo, setTotalEquipo] = useState(0);
  const [directos, setDirectos] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchReferidos = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          setError('No hay token de autenticación');
          return;
        }

        console.log('Obteniendo referidos del usuario...');
        const response = await fetch('http://localhost:4000/api/mis-referidos', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        console.log('Status de la respuesta:', response.status);
        console.log('Headers de respuesta:', response.headers);

        if (!response.ok) {
          const errorText = await response.text();
          console.error('Error en la respuesta:', errorText);
          throw new Error(`Error ${response.status}: ${response.statusText}`);
        }

        const data = await response.json();
        console.log('Datos completos recibidos:', JSON.stringify(data, null, 2));

        // Verificar diferentes estructuras posibles de respuesta
        if (data.success && data.data) {
          console.log('Estructura con success encontrada');
          setReferidosData(data.data.arbol);
          setTotalEquipo(data.data.totalEquipo || 0);
          setDirectos(data.data.directos || 0);
        } else if (data.arbol) {
          console.log('Estructura directa encontrada');
          setReferidosData(data.arbol);
          setTotalEquipo(data.totalEquipo || 0);
          setDirectos(data.directos || 0);
        } else if (data.id) {
          console.log('Estructura de árbol directo encontrada');
          setReferidosData(data);
          // Calcular totales si no vienen en la respuesta
          const calculateTotals = (node: ReferidoData): { total: number, directos: number } => {
            const directos = node.children ? node.children.length : 0;
            let total = directos;
            if (node.children) {
              node.children.forEach(child => {
                total += calculateTotals(child).total;
              });
            }
            return { total, directos };
          };
          const totals = calculateTotals(data);
          setTotalEquipo(totals.total);
          setDirectos(totals.directos);
        } else {
          console.error('Estructura de datos no reconocida:', data);
          setError('Estructura de datos no válida recibida del servidor');
        }
      } catch (error) {
        console.error('Error completo al obtener referidos:', error);
        setError(error instanceof Error ? error.message : 'Error desconocido al conectar con el servidor');
      } finally {
        setIsLoading(false);
      }
    };

    fetchReferidos();
  }, []);

  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const currentUser = user.name || user.email || 'Usuario';

  if (isLoading) {
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
            <div className="p-6 flex items-center justify-center">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p>Cargando datos de organización...</p>
              </div>
            </div>
          </SidebarInset>
        </div>
      </SidebarProvider>
    );
  }

  if (error) {
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
          </SidebarInset>
        </div>
      </SidebarProvider>
    );
  }

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
          
          
          <div className="p-6 space-y-6">
            {/* Estadísticas */}
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
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
};

export default Organizacion;
