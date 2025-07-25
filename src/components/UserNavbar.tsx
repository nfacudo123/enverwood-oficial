import React, { useState, useEffect } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { SidebarTrigger } from "@/components/ui/sidebar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Copy, User, Link, LogOut, TrendingUp, Video, Bell } from "lucide-react";
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';

interface UserInfo {
  username: string;
  firstName: string;
  lastName: string;
  wallet_usdt?: string;
  estado?: string;
  email?: string;
}

interface UserNavbarProps {
  title: string;
  showSidebarTrigger?: boolean;
}

export const UserNavbar = ({ title, showSidebarTrigger = false }: UserNavbarProps) => {
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const [isWithdrawModalOpen, setIsWithdrawModalOpen] = useState(false);
  const [conferenceLink, setConferenceLink] = useState<string>("");
  const [withdrawAmount, setWithdrawAmount] = useState<string>("");
  const [availableBalance, setAvailableBalance] = useState<number>(0);
  const [alertMessage, setAlertMessage] = useState<string>("");
  const { logout } = useAuth();
  const navigate = useNavigate();

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
          setUserInfo({
            username: data.username || '',
            firstName: data.firstName || data.name || '',
            lastName: data.lastName || data.apellidos || '',
            wallet_usdt: data.wallet_usdt || '',
            estado: data.estado || '0'
          });
        }
      } catch (error) {
        console.error('Error fetching user info:', error);
      }
    };

    const fetchConferenceLink = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) return;

        const response = await fetch('http://localhost:4000/api/link', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        if (response.ok) {
          const data = await response.json();
          setConferenceLink(data.link || '');
        }
      } catch (error) {
        console.error('Error fetching conference link:', error);
      }
    };

  const fetchWithdrawals = async () => {
    try {
      const token = localStorage.getItem('token');
      const idUser = localStorage.getItem('idUser');
      if (!token || !idUser) return;

      // Obtener total de retiros (sin filtrar)
      const retirosResponse = await fetch(`http://localhost:4000/api/retiros/${idUser}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      // Obtener total disponible de comisiones
      const comisionesResponse = await fetch(`http://localhost:4000/api/comisiones/sumatorias/${idUser}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (retirosResponse.ok && comisionesResponse.ok) {
        const withdrawals = await retirosResponse.json();
        const comisiones = await comisionesResponse.json();
        
        // Sumar todos los retiros sin filtrar
        const totalRetiros = withdrawals.reduce((sum: number, w: any) => sum + parseFloat(w.monto), 0);
        
        // Obtener total disponible de comisiones
        const totalDisponible = parseFloat(comisiones.total_disponible || 0);
        
        // Calcular saldo disponible: total_disponible - total_retiros
        setAvailableBalance(totalDisponible - totalRetiros);
      }
    } catch (error) {
      console.error('Error fetching withdrawals:', error);
    }
  };

    fetchUserInfo();
    fetchConferenceLink();
    fetchWithdrawals();
  }, []);

  const showAlert = (message: string) => {
    setAlertMessage(message);
    setTimeout(() => {
      setAlertMessage("");
    }, 3000);
  };

  const getInitials = () => {
    if (userInfo?.firstName && userInfo?.lastName) {
      return `${userInfo.firstName.charAt(0)}${userInfo.lastName.charAt(0)}`.toUpperCase();
    }
    if (userInfo?.username) {
      return userInfo.username.charAt(0).toUpperCase();
    }
    return 'U';
  };

  const currentUrl = window.location.origin;
  const personalRegistrationLink = `${currentUrl}/signup/${userInfo?.username || 'username'}`;

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

  const handleCopyConferenceLink = async () => {
    if (!conferenceLink) {
      await Swal.fire({
        icon: 'warning',
        title: 'Sin link',
        text: 'No hay un link de conferencias configurado',
        confirmButtonText: 'Entendido',
        confirmButtonColor: '#f59e0b',
        background: '#fff',
        color: '#333',
      });
      return;
    }

    try {
      await navigator.clipboard.writeText(conferenceLink);
      await Swal.fire({
        icon: 'success',
        title: '¡Copiado!',
        text: 'El link de conferencias ha sido copiado al portapapeles',
        timer: 2000,
        showConfirmButton: false,
        background: '#fff',
        color: '#333',
      });
    } catch (error) {
      await Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'No se pudo copiar el link de conferencias',
        confirmButtonText: 'Entendido',
        confirmButtonColor: '#ef4444',
        background: '#fff',
        color: '#333',
      });
    }
  };

  const handleWithdrawSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const idUser = localStorage.getItem('idUser');
      
      if (!token || !idUser) {
        await Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'No se encontró información de autenticación',
          confirmButtonText: 'Entendido',
          confirmButtonColor: '#ef4444',
        });
        return;
      }

      if (!withdrawAmount || parseFloat(withdrawAmount) <= 0) {
        showAlert('Por favor ingresa un monto válido');
        return;
      }

      if (parseFloat(withdrawAmount) > availableBalance) {
        showAlert('El monto solicitado excede a tu saldo disponible');
        return;
      }

      const withdrawData = {
        usuario_id: parseInt(idUser),
        monto: parseFloat(withdrawAmount),
        wallet_usdt: userInfo?.wallet_usdt || '',
        metodo_pago: 'USDT TRC20'
      };

      const response = await fetch('http://localhost:4000/api/retiros', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(withdrawData),
      });

      if (response.ok) {
        setIsWithdrawModalOpen(false);
        setWithdrawAmount('');
        await Swal.fire({
          icon: 'success',
          title: 'Solicitud enviada',
          text: 'Tu solicitud de retiro ha sido enviada correctamente',
          confirmButtonText: 'Entendido',
          confirmButtonColor: '#22c55e',
        });
      } else {
        const errorData = await response.json().catch(() => ({ message: 'Error del servidor' }));
        await Swal.fire({
          icon: 'error',
          title: 'Error',
          text: errorData.message || 'No se pudo procesar la solicitud de retiro',
          confirmButtonText: 'Entendido',
          confirmButtonColor: '#ef4444',
        });
      }
    } catch (error) {
      console.error('Error al enviar solicitud de retiro:', error);
      await Swal.fire({
        icon: 'error',
        title: 'Error de conexión',
        text: 'No se pudo conectar al servidor',
        confirmButtonText: 'Entendido',
        confirmButtonColor: '#ef4444',
      });
    }
  };

  return (
    <>
      <div className="flex h-16 shrink-0 items-center gap-4 border-b border-border px-6 bg-background shadow-sm">
        {showSidebarTrigger && <SidebarTrigger className="-ml-1" />}
        <div className="flex-1">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-semibold text-foreground">
              {title}
            </h1>
            <div className="flex items-center gap-4">
              <div className="relative">
                <Button variant="ghost" size="icon" className="relative h-9 w-9 hover:bg-accent">
                  <Bell className="h-5 w-5 text-muted-foreground" />
                  <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-primary text-[10px] font-medium text-primary-foreground flex items-center justify-center">
                    3
                  </span>
                </Button>
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <div className="flex items-center gap-3 cursor-pointer hover:bg-accent rounded-lg p-2 transition-colors">
                    <div className="text-right">
                      <p className="text-sm font-medium text-foreground">{userInfo?.username || 'Usuario'}</p>
                      <p className="text-xs text-muted-foreground">{userInfo?.estado === '1' ? 'En línea' : 'Inactivo'}</p>
                    </div>
                    <Avatar className="h-9 w-9">
                      <AvatarFallback className="bg-primary text-primary-foreground text-sm font-medium">
                        {getInitials()}
                      </AvatarFallback>
                    </Avatar>
                  </div>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-64 bg-card shadow-lg border border-border">
                  <div className="px-3 py-2 border-b border-border">
                    <p className="text-sm font-medium text-card-foreground">{userInfo?.username || 'Usuario'}</p>
                    <p className="text-xs text-muted-foreground">{userInfo?.email || `${userInfo?.username}@enverwoood.com`}</p>
                  </div>
                  <DropdownMenuItem 
                    className="flex items-center gap-3 px-3 py-2 cursor-pointer hover:bg-accent"
                    onClick={handleProfileClick}
                  >
                    <User className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm">Mi Perfil</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem className={`flex items-center gap-3 px-3 py-2 ${userInfo?.estado === '1' ? 'text-success' : 'text-destructive'}`}>
                    <div className={`w-2 h-2 rounded-full ${userInfo?.estado === '1' ? 'bg-success' : 'bg-destructive'}`} />
                    <span className="text-sm">{userInfo?.estado === '1' ? 'Estado: Activo' : 'Estado: Inactivo'}</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem 
                    className="flex items-center gap-3 px-3 py-2 cursor-pointer hover:bg-accent"
                    onClick={handleCopyLink}
                  >
                    <Link className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm">Link de Registro</span>
                  </DropdownMenuItem>
                   <DropdownMenuItem 
                    className="flex items-center gap-3 px-3 py-2 cursor-pointer hover:bg-accent"
                    onClick={handleCopyConferenceLink}
                  >
                    <Copy className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm">Link de Conferencias</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    className="flex items-center gap-3 px-3 py-2 cursor-pointer hover:bg-accent"
                    onClick={() => setIsWithdrawModalOpen(true)}
                  >
                    <TrendingUp className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm">Retirar Ganancias</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem 
                    className="flex items-center gap-3 px-3 py-2 text-destructive cursor-pointer hover:bg-destructive/10"
                    onClick={handleLogout}
                  >
                    <LogOut className="w-4 h-4" />
                    <span className="text-sm">Cerrar Sesión</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </div>

      {/* Modal de Retiro */}
      <Dialog open={isWithdrawModalOpen} onOpenChange={setIsWithdrawModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Solicitar Retiro</DialogTitle>
          </DialogHeader>
          
          <div className="bg-accent border border-border rounded-lg p-4 mb-4">
            <p className="text-sm text-accent-foreground">
              <span className="font-medium">Alerta:</span> Puedes realizar la solicitud de tu retiro del 1 al 5 de cada mes.
              Recuerda que el valor se verá reflejado en tu Wallet el día 10 de cada mes.
            </p>
          </div>

          <div className="bg-primary/10 border border-primary/20 rounded-lg p-4 mb-4">
            <p className="text-sm text-primary">
              <span className="font-medium">Total Disponible:</span> ${availableBalance.toFixed(2)}
            </p>
          </div>

          {alertMessage && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4 animate-pulse">
              <p className="text-sm text-red-700 font-medium">
                {alertMessage}
              </p>
            </div>
          )}

          <form onSubmit={handleWithdrawSubmit} className="space-y-4">
            <div>
              <Label htmlFor="payment-method">Medio de pago</Label>
              <Input
                id="payment-method"
                defaultValue="USDT TRC20"
                readOnly
                className="mt-1 bg-gray-50"
              />
            </div>

            <div>
              <Label htmlFor="destination-account">Cuenta de Destino</Label>
              <Input
                id="destination-account"
                value={userInfo?.wallet_usdt || ''}
                readOnly
                className="mt-1 bg-gray-50"
              />
            </div>

            <div>
              <Label htmlFor="withdrawal-amount">Monto del Retiro</Label>
              <Input
                id="withdrawal-amount"
                placeholder="Monto Disponible"
                value={withdrawAmount}
                onChange={(e) => setWithdrawAmount(e.target.value)}
                type="number"
                min="0"
                step="0.01"
                className="mt-1"
              />
            </div>

            <div className="flex justify-end pt-4">
              <Button 
                type="submit"
                className="bg-primary hover:bg-primary/90 text-primary-foreground"
              >
                Solicitar
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
};
