
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Building, TrendingUp, Users, DollarSign, Copy } from "lucide-react";
import Swal from 'sweetalert2';

export function DashboardContent() {
  const [userInfo, setUserInfo] = useState<any>(null);
  const [referidos, setReferidos] = useState<any[]>([]);
  const [comisiones, setComisiones] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [isWithdrawModalOpen, setIsWithdrawModalOpen] = useState(false);
  const currentUrl = window.location.origin;
  const personalRegistrationLink = `${currentUrl}/signup/${userInfo?.username || 'username'}`;

  useEffect(() => {
    const fetchUserInfo = async () => {
      try {
        const token = localStorage.getItem('token');
        console.log('Token encontrado:', token ? 'Sí' : 'No');
        if (!token) {
          console.log('No hay token, no se puede obtener perfil');
          return;
        }

        console.log('Haciendo fetch a /api/perfil...');
        const response = await fetch('http://localhost:4000/api/perfil', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        console.log('Respuesta del perfil:', response.status, response.ok);
        if (response.ok) {
          const data = await response.json();
          console.log('Datos del perfil obtenidos:', data);
          setUserInfo(data);
        } else {
          console.log('Error en respuesta del perfil:', await response.text());
        }
      } catch (error) {
        console.error('Error fetching user info:', error);
      }
    };

    const fetchComisiones = async () => {
      try {
        const token = localStorage.getItem('token');
        const idUser = localStorage.getItem('idUser');
        if (!token || !idUser) return;

        const response = await fetch(`http://localhost:4000/api/comisiones/sumatorias/${idUser}`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        if (response.ok) {
          const data = await response.json();
          setComisiones(data);
        }
      } catch (error) {
        console.error('Error fetching comisiones:', error);
      }
    };

    fetchUserInfo();
    fetchComisiones();
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
        
        console.log('Todos los referidos:', data);
        console.log('Usuario actual ID:', currentUserId);
        
        // Filtrar referidos (excluir usuario actual y semana actual)
        const today = new Date();
        const oneWeekAgo = new Date();
        oneWeekAgo.setDate(today.getDate() - 7);
        
        console.log('Fecha límite (una semana atrás):', oneWeekAgo);
        
        const filteredReferidos = data.filter((referido: any) => {
          // Excluir al usuario actual
          if (referido.usuario_id === currentUserId) {
            console.log('Excluyendo usuario actual:', referido);
            return false;
          }
          
          // Filtrar por fecha (semana actual)
          const referidoDate = new Date(referido.created_at);
          console.log('Fecha del referido:', referidoDate, 'vs límite:', oneWeekAgo);
          
          const isWithinWeek = referidoDate >= oneWeekAgo;
          console.log('¿Está dentro de la semana?', isWithinWeek, 'para:', referido.name);
          
          return isWithinWeek;
        }).map((referido: any) => ({
          id: referido.usuario_id,
          name: referido.name,
          apellidos: referido.apellidos,
          username: referido.username,
          email: referido.correo,
          created_at: referido.created_at,
        }));
        
        console.log('Referidos filtrados:', filteredReferidos);

        setReferidos(filteredReferidos);
      }
    } catch (error) {
      console.error('Error fetching referidos:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    console.log('useEffect disparado - userInfo:', userInfo);
    if (userInfo?.id) {
      console.log('Llamando fetchReferidos...');
      fetchReferidos();
    } else {
      console.log('No hay userInfo.id, no se llama fetchReferidos');
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

  const getComisionValue = (descripcion: string) => {
    if (!comisiones?.sumatorias) return "$0";
    const comision = comisiones.sumatorias.find((c: any) => c.descripcion === descripcion);
    return comision ? `$${parseFloat(comision.total).toFixed(2)}` : "$0";
  };

  const idUser = localStorage.getItem('idUser');
  const isAdmin = idUser === '1';

  // Stats comunes para ambos tipos de usuario
  const commonStats = [
    {
      title: "Comisiones Nivel 1",
      value: getComisionValue("Nivel 1"),
      icon: Users,
      color: "text-purple-600",
      bgColor: "bg-purple-50"
    },
    {
      title: "Comisiones Nivel 2",
      value: getComisionValue("Nivel 2"),
      icon: Users,
      color: "text-blue-600",
      bgColor: "bg-blue-50"
    },
    {
      title: "Comisiones Nivel 3",
      value: getComisionValue("Nivel 3"),
      icon: Users,
      color: "text-orange-600",
      bgColor: "bg-orange-50"
    },
    {
      title: "Comisiones Nivel 4",
      value: getComisionValue("Nivel 4"),
      icon: Users,
      color: "text-orange-600",
      bgColor: "bg-orange-50"
    },
    {
      title: "Comisiones Nivel 5",
      value: getComisionValue("Nivel 5"),
      icon: Users,
      color: "text-orange-600",
      bgColor: "bg-orange-50"
    },
    {
      title: "Disponible para retiro",
      value: comisiones?.total_disponible ? `$${parseFloat(comisiones.total_disponible).toFixed(2)}` : "$0",
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
      {isAdmin ? (
        // Vista para administrador (ID = 1) - muestra Comisiones Empresa y Comisiones Inversión
        <div className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2 mb-6">
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="text-lg">Comisiones Empresa</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">
                  {getComisionValue("Empresa")}
                </div>
              </CardContent>
            </Card>
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="text-lg">Comisiones Inversión</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">
                  {getComisionValue("Inversor")}
                </div>
              </CardContent>
            </Card>
          </div>
          
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {commonStats.map((stat, index) => (
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
        </div>
      ) : (
        // Vista para usuario normal (ID distinto a 1) - solo muestra Comisiones Inversión
        <div className="space-y-6">
          {/* Comisiones Inversión - Card principal centrada */}
          <div className="flex justify-center">
            <Card className="w-full max-w-4xl hover:shadow-lg transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                <CardTitle className="text-2xl font-bold">Comisiones Inversión</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-4xl font-bold">
                  {getComisionValue("Inversor")}
                </div>
              </CardContent>
            </Card>
          </div>
          
          {/* Grid de comisiones por niveles - 3 columnas, 2 filas */}
          <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-3">
            {commonStats.map((stat, index) => (
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
        </div>
      )}

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

    </div>
  );
}
