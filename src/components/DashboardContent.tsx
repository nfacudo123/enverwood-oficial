
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
  const [utilidades, setUtilidades] = useState<any[]>([]);
  const [comisionesDetalle, setComisionesDetalle] = useState<any[]>([]);
  const [noticias, setNoticias] = useState<any[]>([]);
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

    const fetchUtilidades = async () => {
      try {
        const token = localStorage.getItem('token');
        const idUser = parseInt(localStorage.getItem('idUser') || '0');
        if (!token || !idUser) return;

        const response = await fetch('http://localhost:4000/api/inversiones/utilidades', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        if (response.ok) {
          const data = await response.json();
          const filteredUtilidades = data.utilidades.filter((utilidad: any) => utilidad.usid === idUser);
          setUtilidades(filteredUtilidades.slice(0, 5)); // Solo los primeros 5
        }
      } catch (error) {
        console.error('Error fetching utilidades:', error);
      }
    };

    const fetchComisionesDetalle = async () => {
      try {
        const token = localStorage.getItem('token');
        const idUser = localStorage.getItem('idUser');
        if (!token || !idUser) return;

        const response = await fetch(`http://localhost:4000/api/comisiones/comisiones/${idUser}`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        if (response.ok) {
          const data = await response.json();
          setComisionesDetalle(data.slice(0, 5)); // Solo las primeras 5
        }
      } catch (error) {
        console.error('Error fetching comisiones detalle:', error);
      }
    };

    const fetchNoticias = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) return;

        const response = await fetch('http://localhost:4000/api/noticias', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        if (response.ok) {
          const data = await response.json();
          setNoticias(data.noticias.slice(0, 5)); // Solo las primeras 5 del array noticias
        }
      } catch (error) {
        console.error('Error fetching noticias:', error);
      }
    };

    fetchUserInfo();
    fetchComisiones();
    fetchUtilidades();
    fetchComisionesDetalle();
    fetchNoticias();
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
      className: "green-card-1"
    },
    {
      title: "Comisiones Nivel 2", 
      value: getComisionValue("Nivel 2"),
      icon: Users,
      className: "green-card-2"
    },
    {
      title: "Comisiones Nivel 3",
      value: getComisionValue("Nivel 3"),
      icon: Users,
      className: "green-card-3"
    },
    {
      title: "Comisiones Nivel 4",
      value: getComisionValue("Nivel 4"),
      icon: Users,
      className: "green-card-4"
    },
    {
      title: "Comisiones Nivel 5",
      value: getComisionValue("Nivel 5"),
      icon: Users,
      className: "green-card-1"
    },
    {
      title: "Disponible para retiro",
      value: comisiones?.total_disponible ? `$${parseFloat(comisiones.total_disponible).toFixed(2)}` : "$0",
      icon: DollarSign,
      className: "green-card-2"
    }
  ];

  return (
    <div className="flex-1 space-y-6 p-6 bg-background">
      {/* Welcome Header */}
      <Card className="bg-accent border border-border shadow-card">
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h3 className="text-lg font-semibold text-accent-foreground mb-2">
                Bienvenido a InvertGold {userInfo?.name || ''} {userInfo?.apellidos || ''}
              </h3>
              <p className="text-sm text-accent-foreground/80">
                Gestiona tu negocio y monitorea tus ganancias
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
                Copiar Link
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats Cards */}
      {isAdmin ? (
        // Vista para administrador (ID = 1) - muestra Comisiones Empresa y Comisiones Inversión
        <div className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2 mb-6">
            <Card className="green-card-1 text-white border-0 shadow-card">
              <CardHeader>
                <CardTitle className="text-xl text-white">Comisiones Empresa</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-4xl font-bold text-white">
                  {getComisionValue("Empresa")}
                </div>
              </CardContent>
            </Card>
            <Card className="green-card-2 text-white border-0 shadow-card">
              <CardHeader>
                <CardTitle className="text-xl text-white">Comisiones Inversión</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-4xl font-bold text-white">
                  {getComisionValue("Inversor")}
                </div>
              </CardContent>
            </Card>
          </div>
          
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {commonStats.map((stat, index) => (
              <Card key={index} className={`${stat.className} text-white border-0 shadow-card`}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-white/90">
                    {stat.title}
                  </CardTitle>
                  <div className="h-10 w-10 bg-white/20 rounded-lg flex items-center justify-center">
                    <stat.icon className="h-5 w-5 text-white" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-white">{stat.value}</div>
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
            <Card className="w-full max-w-4xl green-card-1 text-white border-0 shadow-card">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                <CardTitle className="text-3xl font-bold text-white">Comisiones Inversión</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-5xl font-bold text-white">
                  {getComisionValue("Inversor")}
                </div>
              </CardContent>
            </Card>
          </div>
          
          {/* Grid de comisiones por niveles - 3 columnas, 2 filas */}
          <div className="grid gap-6 md:grid-cols-3 lg:grid-cols-3">
            {commonStats.map((stat, index) => (
              <Card key={index} className={`${stat.className} text-white border-0 shadow-card`}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-white/90">
                    {stat.title}
                  </CardTitle>
                  <div className="h-10 w-10 bg-white/20 rounded-lg flex items-center justify-center">
                    <stat.icon className="h-5 w-5 text-white" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-white">{stat.value}</div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      <div className="grid gap-6 md:grid-cols-2">
        {/* Utilidades */}
        <Card className="bg-card border border-border shadow-card">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-card-foreground">Utilidades Recientes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-2 px-3 font-semibold text-xs text-muted-foreground">Valor Utilidad</th>
                    <th className="text-left py-2 px-3 font-semibold text-xs text-muted-foreground">Fecha</th>
                  </tr>
                </thead>
                <tbody>
                  {utilidades.map((utilidad, index) => (
                    <tr key={utilidad.id} className="border-b border-border hover:bg-accent/50">
                      <td className="py-2 px-3 text-xs text-card-foreground font-medium">${parseFloat(utilidad.val_utilidad).toFixed(2)}</td>
                      <td className="py-2 px-3 text-xs text-muted-foreground">{new Date(utilidad.fecha).toLocaleDateString()}</td>
                    </tr>
                  ))}
                  {utilidades.length === 0 && (
                    <tr>
                      <td colSpan={2} className="py-4 text-center text-xs text-muted-foreground">
                        No hay utilidades
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Comisiones */}
        <Card className="bg-card border border-border shadow-card">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-card-foreground">Comisiones Recientes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-2 px-3 font-semibold text-xs text-muted-foreground">Tipo Comisión</th>
                    <th className="text-left py-2 px-3 font-semibold text-xs text-muted-foreground">Valor</th>
                  </tr>
                </thead>
                <tbody>
                  {comisionesDetalle.map((comision, index) => (
                    <tr key={comision.id} className="border-b border-border hover:bg-accent/50">
                      <td className="py-2 px-3 text-xs text-card-foreground">{comision.tipo_comision}</td>
                      <td className="py-2 px-3 text-xs text-card-foreground font-medium">${parseFloat(comision.valor).toFixed(2)}</td>
                    </tr>
                  ))}
                  {comisionesDetalle.length === 0 && (
                    <tr>
                      <td colSpan={2} className="py-4 text-center text-xs text-muted-foreground">
                        No hay comisiones
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Noticias Recientes */}
      <Card className="bg-card border border-border shadow-card">
        <CardHeader>
          <CardTitle className="text-xl font-semibold text-card-foreground">Noticias Recientes</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {noticias.map((noticia, index) => (
              <div key={noticia.id} className="border-b border-border pb-4 last:border-b-0">
                <h4 className="text-sm font-semibold text-card-foreground mb-2">{noticia.titulo}</h4>
                <p className="text-xs text-muted-foreground line-clamp-3">{noticia.noticia}</p>
                {noticia.created_at && (
                  <p className="text-xs text-muted-foreground mt-2">
                    {new Date(noticia.created_at).toLocaleDateString()}
                  </p>
                )}
              </div>
            ))}
            {noticias.length === 0 && (
              <div className="py-8 text-center text-muted-foreground">
                No hay noticias recientes
              </div>
            )}
          </div>
        </CardContent>
      </Card>

    </div>
  );
}
