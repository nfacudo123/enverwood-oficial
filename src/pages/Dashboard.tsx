
import React from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LogOut, User, BarChart3, Settings } from "lucide-react";

const Dashboard = () => {
  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/';
  };

  const user = JSON.parse(localStorage.getItem('user') || '{}');

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-bold text-gray-900">
                Enverwood Inversiones
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-gray-700">Bienvenido, {user.name || user.email}</span>
              <Button 
                onClick={handleLogout}
                variant="outline"
                size="sm"
                className="flex items-center space-x-2"
              >
                <LogOut className="w-4 h-4" />
                <span>Cerrar Sesión</span>
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Panel de Control</h2>
            <p className="text-gray-600">Gestiona tus inversiones y consulta tu portafolio</p>
          </div>

          {/* Dashboard Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Portafolio Total</CardTitle>
                <BarChart3 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">$124,562.89</div>
                <p className="text-xs text-muted-foreground">
                  +2.5% desde el mes pasado
                </p>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Inversiones Activas</CardTitle>
                <User className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">12</div>
                <p className="text-xs text-muted-foreground">
                  3 nuevas este mes
                </p>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Rendimiento Mensual</CardTitle>
                <Settings className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">+8.2%</div>
                <p className="text-xs text-muted-foreground">
                  Objetivo: +6.0%
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle>Actividad Reciente</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between py-2 border-b">
                  <div>
                    <p className="font-medium">Inversión en Tech Fund</p>
                    <p className="text-sm text-gray-500">Hace 2 horas</p>
                  </div>
                  <span className="text-green-600 font-medium">+$5,000</span>
                </div>
                <div className="flex items-center justify-between py-2 border-b">
                  <div>
                    <p className="font-medium">Dividendo Energy Corp</p>
                    <p className="text-sm text-gray-500">Hace 1 día</p>
                  </div>
                  <span className="text-green-600 font-medium">+$230</span>
                </div>
                <div className="flex items-center justify-between py-2">
                  <div>
                    <p className="font-medium">Retiro parcial</p>
                    <p className="text-sm text-gray-500">Hace 3 días</p>
                  </div>
                  <span className="text-red-600 font-medium">-$2,500</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
