import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { Building, TrendingUp, Users, DollarSign, Copy, User, Link, LogOut } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';

export function DashboardContent() {
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const currentUrl = window.location.origin;
  const personalRegistrationLink = `${currentUrl}/signup/${user.email || user.id || 'usuario'}`;
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(personalRegistrationLink);
      await Swal.fire({
        icon: 'success',
        title: '¡Copiado!',
        text: 'El link de registro ha sido copiado al portapapeles',
        timer: 2000,
        showConfirmButton: false,
        background: '#fff',
        color: '#333',
      });
    } catch (error) {
      await Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'No se pudo copiar el link',
        confirmButtonText: 'Entendido',
        confirmButtonColor: '#5b73e8',
        background: '#fff',
        color: '#333',
      });
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleProfileClick = () => {
    navigate('/profile');
  };

  const stats = [
    {
      title: "Capital en Gestión",
      value: "$0",
      icon: Building,
      color: "text-yellow-600",
      bgColor: "bg-yellow-50"
    },
    {
      title: "Mis Rendimientos",
      value: "$0",
      icon: TrendingUp,
      color: "text-red-600",
      bgColor: "bg-red-50"
    },
    {
      title: "XXXX",
      value: "$0",
      icon: DollarSign,
      color: "text-green-600",
      bgColor: "bg-green-50"
    },
    {
      title: "Comisiones Nivel 1",
      value: "$0",
      icon: Users,
      color: "text-purple-600",
      bgColor: "bg-purple-50"
    },
    {
      title: "Comisiones Nivel 2",
      value: "$0",
      icon: Users,
      color: "text-blue-600",
      bgColor: "bg-blue-50"
    },
    {
      title: "Comisiones Nivel 3",
      value: "$0",
      icon: Users,
      color: "text-orange-600",
      bgColor: "bg-orange-50"
    },
    {
      title: "Comisiones Nivel 4",
      value: "$0",
      icon: Users,
      color: "text-orange-600",
      bgColor: "bg-orange-50"
    },
    {
      title: "Comisiones Nivel 5",
      value: "$0",
      icon: Users,
      color: "text-orange-600",
      bgColor: "bg-orange-50"
    },
    {
      title: "Disponible para retiro",
      value: "$0",
      icon: DollarSign,
      color: "text-green-600",
      bgColor: "bg-green-50"
    }
  ];

  return (
    <SidebarInset className="flex-1">
      <div className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
        <SidebarTrigger className="-ml-1" />
        <div className="flex-1">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-semibold text-gray-900">
              Panel de Control
            </h1>
            <div className="flex items-center gap-4">
              <span className="text-gray-600">Bienvenido, {user.name || user.email}</span>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Avatar className="cursor-pointer">
                    <AvatarFallback className="bg-orange-500 text-white">
                      {(user.name || user.email)?.charAt(0)?.toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuItem 
                    className="flex items-center gap-2 cursor-pointer"
                    onClick={handleProfileClick}
                  >
                    <User className="w-4 h-4" />
                    <span>Perfil</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem className="flex items-center gap-2 text-red-600">
                    <User className="w-4 h-4" />
                    <span>Usuario Inactivo</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem 
                    className="flex items-center gap-2 cursor-pointer"
                    onClick={handleCopyLink}
                  >
                    <Link className="w-4 h-4" />
                    <span>Link de Registro</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem className="flex items-center gap-2">
                    <TrendingUp className="w-4 h-4" />
                    <span>Retirar Ganancias</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem 
                    className="flex items-center gap-2 text-red-600 cursor-pointer"
                    onClick={handleLogout}
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Cerrar Sesión</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 space-y-6 p-4 md:p-8">
        {/* Welcome Header */}
        <div className="bg-gray-100 rounded-lg p-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <p className="text-sm text-gray-600">
                <span className="font-medium">Bienvenido a Enverwood</span> tu perfil es: <span className="font-medium">Estudiante - Embajador</span>
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">Link de Registro Personal:</span>
              <div className="flex items-center gap-2 bg-white rounded px-3 py-1">
                <span className="text-sm text-blue-600 truncate max-w-xs">{personalRegistrationLink}</span>
                <button
                  onClick={handleCopyLink}
                  className="bg-green-500 hover:bg-green-600 text-white px-2 py-1 rounded text-xs flex items-center gap-1"
                >
                  <Copy className="w-3 h-3" />
                  Copiar
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {stats.map((stat, index) => (
            <Card key={index} className="hover:shadow-lg transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">
                  {stat.title}
                </CardTitle>
                <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                  <stat.icon className={`h-4 w-4 ${stat.color}`} />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {/* Progreso de pack actual */}
          <Card>
            <CardHeader>
              <CardTitle>Progreso de pack actual</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="bg-red-100 text-red-800 text-center py-8 rounded-lg">
                <p className="font-medium">Sin Pack</p>
              </div>
            </CardContent>
          </Card>

          {/* Resumen de tu negocio */}
          <Card>
            <CardHeader>
              <CardTitle>Resumen de tu negocio</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-2">Patrocinador: N/A</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 p-3 rounded-lg">
                  <p className="text-sm text-gray-600">Estado:</p>
                  <p className="font-medium">Inactivo</p>
                  <p className="text-sm text-gray-600 mt-2">Volumen Equipo:</p>
                  <p className="font-medium">Sin Rango</p>
                </div>
                <div className="bg-gray-50 p-3 rounded-lg">
                  <p className="text-sm text-gray-600">Totales en equipo:</p>
                  <p className="font-medium">0</p>
                  <p className="text-sm text-gray-600 mt-2">Mis Directos:</p>
                  <p className="font-medium">1</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Afiliados Recientes */}
        <Card>
          <CardHeader>
            <CardTitle>Afiliados Recientes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2">Usuario</th>
                    <th className="text-left py-2">País</th>
                    <th className="text-left py-2">Fecha</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b">
                    <td className="py-2">gcol</td>
                    <td className="py-2">Colombia</td>
                    <td className="py-2">2024-07-08</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </SidebarInset>
  );
}
