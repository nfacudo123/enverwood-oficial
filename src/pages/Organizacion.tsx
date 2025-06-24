
import React from 'react';
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from '@/components/AppSidebar';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { User, Users } from "lucide-react";

const Organizacion = () => {
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const currentUser = user.name || user.email || 'Usuario';

  // Datos de ejemplo para el gráfico de referidos
  const referidosData = [
    { name: 'gcol', level: 1, parent: currentUser },
    { name: 'maria123', level: 2, parent: 'gcol' },
    { name: 'carlos_r', level: 2, parent: 'gcol' },
    { name: 'ana_lopez', level: 3, parent: 'maria123' },
    { name: 'pedro_m', level: 3, parent: 'carlos_r' },
  ];

  const renderNode = (name: string, level: number, isCurrentUser = false) => (
    <div 
      key={name}
      className={`
        flex flex-col items-center p-3 rounded-lg border-2 min-w-[120px]
        ${isCurrentUser 
          ? 'bg-blue-50 border-blue-300 text-blue-800' 
          : level === 1 
            ? 'bg-green-50 border-green-300 text-green-800'
            : level === 2
              ? 'bg-yellow-50 border-yellow-300 text-yellow-800'
              : 'bg-purple-50 border-purple-300 text-purple-800'
        }
      `}
    >
      <User className="w-6 h-6 mb-1" />
      <span className="text-sm font-medium text-center break-words">{name}</span>
      {isCurrentUser && <span className="text-xs">Tú</span>}
      {!isCurrentUser && <span className="text-xs">Nivel {level}</span>}
    </div>
  );

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
            <div className="grid gap-4 md:grid-cols-3">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Total en Equipo
                  </CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">5</div>
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
                  <div className="text-2xl font-bold">1</div>
                  <p className="text-xs text-muted-foreground">
                    referidos directos
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Niveles Activos
                  </CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">3</div>
                  <p className="text-xs text-muted-foreground">
                    niveles de profundidad
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Gráfico de Organización */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  Gráfico de Referidos
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col items-center space-y-8 p-4">
                  {/* Usuario actual */}
                  <div className="flex justify-center">
                    {renderNode(currentUser, 0, true)}
                  </div>
                  
                  {/* Línea conectora */}
                  <div className="w-px h-8 bg-gray-300"></div>
                  
                  {/* Nivel 1 */}
                  <div className="flex justify-center gap-8">
                    {referidosData.filter(r => r.level === 1).map(referido => (
                      <div key={referido.name} className="flex flex-col items-center">
                        {renderNode(referido.name, referido.level)}
                        
                        {/* Líneas conectoras para nivel 2 */}
                        {referidosData.filter(r => r.level === 2 && r.parent === referido.name).length > 0 && (
                          <>
                            <div className="w-px h-8 bg-gray-300 mt-4"></div>
                            <div className="flex gap-4 mt-4">
                              {referidosData.filter(r => r.level === 2 && r.parent === referido.name).map(nivel2 => (
                                <div key={nivel2.name} className="flex flex-col items-center">
                                  {renderNode(nivel2.name, nivel2.level)}
                                  
                                  {/* Líneas conectoras para nivel 3 */}
                                  {referidosData.filter(r => r.level === 3 && r.parent === nivel2.name).length > 0 && (
                                    <>
                                      <div className="w-px h-8 bg-gray-300 mt-4"></div>
                                      <div className="flex gap-4 mt-4">
                                        {referidosData.filter(r => r.level === 3 && r.parent === nivel2.name).map(nivel3 => (
                                          <div key={nivel3.name}>
                                            {renderNode(nivel3.name, nivel3.level)}
                                          </div>
                                        ))}
                                      </div>
                                    </>
                                  )}
                                </div>
                              ))}
                            </div>
                          </>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
                
                {/* Leyenda */}
                <div className="mt-8 p-4 bg-gray-50 rounded-lg">
                  <h4 className="font-medium mb-3">Leyenda:</h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 bg-blue-200 border-2 border-blue-300 rounded"></div>
                      <span>Usuario Actual</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 bg-green-200 border-2 border-green-300 rounded"></div>
                      <span>Nivel 1</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 bg-yellow-200 border-2 border-yellow-300 rounded"></div>
                      <span>Nivel 2</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 bg-purple-200 border-2 border-purple-300 rounded"></div>
                      <span>Nivel 3</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
};

export default Organizacion;
