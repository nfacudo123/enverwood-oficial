
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Building, TrendingUp, Users, DollarSign, Copy, ShoppingCart, UserCheck, Bitcoin } from "lucide-react";
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
    <div className="flex-1 space-y-6 p-6 bg-background">
      {/* Main Stats Cards - Green cards like template */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card className="green-card-1 text-white border-0 shadow-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white/80 text-sm font-medium">Total Sales</p>
                <p className="text-3xl font-bold text-white">{getComisionValue("Inversor").replace('$', '')}</p>
              </div>
              <div className="h-12 w-12 bg-white/20 rounded-lg flex items-center justify-center">
                <ShoppingCart className="h-6 w-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="green-card-2 text-white border-0 shadow-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white/80 text-sm font-medium">New Orders</p>
                <p className="text-3xl font-bold text-white">{referidos.length}</p>
              </div>
              <div className="h-12 w-12 bg-white/20 rounded-lg flex items-center justify-center">
                <DollarSign className="h-6 w-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="green-card-3 text-white border-0 shadow-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white/80 text-sm font-medium">New Users</p>
                <p className="text-3xl font-bold text-white">{referidos.length}</p>
              </div>
              <div className="h-12 w-12 bg-white/20 rounded-lg flex items-center justify-center">
                <UserCheck className="h-6 w-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="green-card-4 text-white border-0 shadow-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white/80 text-sm font-medium">Unique Visitors</p>
                <p className="text-3xl font-bold text-white">{comisiones?.total_disponible ? parseFloat(comisiones.total_disponible).toFixed(0) : '0'}</p>
              </div>
              <div className="h-12 w-12 bg-white/20 rounded-lg flex items-center justify-center">
                <Bitcoin className="h-6 w-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Secondary Stats Grid */}
      <div className="grid gap-6 md:grid-cols-3">
        {/* Email Sent Card */}
        <Card className="bg-card border border-border shadow-card">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-card-foreground">Email Sent</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between">
              <div>
                <p className="text-2xl font-bold text-card-foreground">{getComisionValue("Nivel 1").replace('$', '')}</p>
                <p className="text-sm text-muted-foreground">Marketplace</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-card-foreground">{referidos.length}</p>
                <p className="text-sm text-muted-foreground">Last week</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-card-foreground">{getComisionValue("Nivel 2").replace('$', '')}</p>
                <p className="text-sm text-muted-foreground">Last Month</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Revenue Card */}
        <Card className="bg-card border border-border shadow-card">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-card-foreground">Revenue</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between">
              <div>
                <p className="text-2xl font-bold text-card-foreground">{getComisionValue("Nivel 3").replace('$', '')}</p>
                <p className="text-sm text-muted-foreground">Marketplace</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-card-foreground">{getComisionValue("Nivel 4").replace('$', '')}</p>
                <p className="text-sm text-muted-foreground">Last week</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-card-foreground">{getComisionValue("Nivel 5").replace('$', '')}</p>
                <p className="text-sm text-muted-foreground">Last Month</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Monthly Earnings Card */}
        <Card className="bg-card border border-border shadow-card">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-card-foreground">Monthly Earnings</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between">
              <div>
                <p className="text-2xl font-bold text-card-foreground">{comisiones?.total_disponible ? `$${parseFloat(comisiones.total_disponible).toFixed(0)}` : '$0'}</p>
                <p className="text-sm text-muted-foreground">Marketplace</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-card-foreground">{referidos.length}</p>
                <p className="text-sm text-muted-foreground">Last week</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-card-foreground">{getComisionValue("Empresa").replace('$', '')}</p>
                <p className="text-sm text-muted-foreground">Last Month</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Candidates Table */}
      <Card className="bg-card border border-border shadow-card">
        <CardHeader>
          <CardTitle className="text-xl font-semibold text-card-foreground">Recent Candidates</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-3 px-4 font-semibold text-sm text-muted-foreground">Name</th>
                  <th className="text-left py-3 px-4 font-semibold text-sm text-muted-foreground">Position</th>
                  <th className="text-left py-3 px-4 font-semibold text-sm text-muted-foreground">Status</th>
                  <th className="text-left py-3 px-4 font-semibold text-sm text-muted-foreground">Age</th>
                  <th className="text-left py-3 px-4 font-semibold text-sm text-muted-foreground">Start date</th>
                  <th className="text-left py-3 px-4 font-semibold text-sm text-muted-foreground">Salary</th>
                </tr>
              </thead>
              <tbody>
                {referidos.slice(0, 5).map((referido, index) => (
                  <tr key={referido.id} className="border-b border-border hover:bg-accent/50">
                    <td className="py-3 px-4 text-sm text-card-foreground font-medium">
                      {referido.name} {referido.apellidos}
                    </td>
                    <td className="py-3 px-4 text-sm text-muted-foreground">
                      System Architect
                    </td>
                    <td className="py-3 px-4">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-success/10 text-success">
                        Active
                      </span>
                    </td>
                    <td className="py-3 px-4 text-sm text-muted-foreground">25</td>
                    <td className="py-3 px-4 text-sm text-muted-foreground">
                      {new Date(referido.created_at).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-4 text-sm text-muted-foreground">$320,800</td>
                  </tr>
                ))}
                {referidos.length === 0 && (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-muted-foreground">
                      No hay referidos recientes
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Copy Link Section */}
      <Card className="bg-accent border border-border shadow-card">
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h3 className="text-lg font-semibold text-accent-foreground mb-2">
                Comparte tu enlace de registro
              </h3>
              <p className="text-sm text-accent-foreground/80">
                Invita a nuevos usuarios con tu enlace personal de registro
              </p>
            </div>
            <div className="flex items-center gap-3">
              <div className="bg-background rounded-lg px-4 py-2 border border-border">
                <span className="text-sm text-foreground truncate max-w-xs">{personalRegistrationLink}</span>
              </div>
              <Button
                onClick={handleCopyLink}
                className="bg-primary hover:bg-primary/90 text-primary-foreground"
              >
                <Copy className="w-4 h-4 mr-2" />
                Copiar
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

    </div>
  );
}
