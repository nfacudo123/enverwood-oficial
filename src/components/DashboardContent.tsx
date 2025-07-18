
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Building, TrendingUp, Users, DollarSign, Copy } from "lucide-react";
import Swal from 'sweetalert2';

export function DashboardContent() {
  const [userInfo, setUserInfo] = useState<any>(null);
  const [referidos, setReferidos] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const currentUrl = window.location.origin;
  const personalRegistrationLink = `${currentUrl}/signup/${userInfo?.username || 'username'}`;

  useEffect(() => {
    const fetchUserInfo = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) return;

        const response = await fetch('http://localhost:4000/api/perfil', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        if (response.ok) {
          const data = await response.json();
          setUserInfo(data);
        }
      } catch (error) {
        console.error('Error fetching user info:', error);
      }
    };

    fetchUserInfo();
  }, []);

  const fetchReferidos = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const response = await fetch('http://localhost:4000/api/mis-referidos', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        
        // Obtener ID del usuario actual
        const currentUserId = userInfo?.id;
        
        // Filtrar referidos (excluir usuario actual y última semana)
        const oneWeekAgo = new Date();
        oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
        
        const filteredReferidos = data.filter((referido: any) => {
          // Excluir al usuario actual
          if (referido.usuario_id === currentUserId) return false;
          
          // Filtrar por fecha (última semana)
          const referidoDate = new Date(referido.created_at);
          return referidoDate >= oneWeekAgo;
        }).map((referido: any) => ({
          id: referido.usuario_id,
          name: referido.name,
          apellidos: referido.apellidos,
          username: referido.username,
          email: referido.correo,
          created_at: referido.created_at,
        }));

        setReferidos(filteredReferidos);
      }
    } catch (error) {
      console.error('Error fetching referidos:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (userInfo?.id) {
      fetchReferidos();
    }
  }, [userInfo]);

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
    <div className="flex-1 space-y-6 p-4 md:p-8">
      {/* Welcome Header */}
      <div className="bg-gray-100 rounded-lg p-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <p className="text-sm text-gray-600">
              <span className="font-medium">
                Bienvenido a Enverwood {userInfo?.name || ''} {userInfo?.apellidos || ''}
              </span>
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
          <CardTitle>Afiliados Recientes (Última Semana)</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-4">
              <p>Cargando referidos...</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2">Nombre</th>
                    <th className="text-left py-2">Usuario</th>
                    <th className="text-left py-2">Email</th>
                    <th className="text-left py-2">Fecha</th>
                  </tr>
                </thead>
                <tbody>
                  {referidos.length > 0 ? (
                    referidos.map((referido) => (
                      <tr key={referido.id} className="border-b">
                        <td className="py-2">{referido.name} {referido.apellidos}</td>
                        <td className="py-2">{referido.username}</td>
                        <td className="py-2">{referido.email}</td>
                        <td className="py-2">
                          {referido.created_at 
                            ? new Date(referido.created_at).toLocaleDateString('es-ES') 
                            : 'N/A'
                          }
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={4} className="py-4 text-center text-gray-500">
                        No hay referidos recientes de la última semana
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
