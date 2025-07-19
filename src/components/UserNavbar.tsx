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
import { Copy, User, Link, LogOut, TrendingUp, Video } from "lucide-react";
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';

interface UserInfo {
  username: string;
  firstName: string;
  lastName: string;
}

interface UserNavbarProps {
  title: string;
  showSidebarTrigger?: boolean;
}

export const UserNavbar = ({ title, showSidebarTrigger = false }: UserNavbarProps) => {
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const [isWithdrawModalOpen, setIsWithdrawModalOpen] = useState(false);
  const [conferenceLink, setConferenceLink] = useState<string>("");
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
            lastName: data.lastName || data.apellidos || ''
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

    fetchUserInfo();
    fetchConferenceLink();
  }, []);

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

  const handleWithdrawSubmit = () => {
    setIsWithdrawModalOpen(false);
    Swal.fire({
      icon: 'success',
      title: 'Solicitud enviada',
      text: 'Tu solicitud de retiro ha sido enviada correctamente',
      confirmButtonText: 'Entendido',
      confirmButtonColor: '#22c55e',
    });
  };

  return (
    <>
      <div className="flex h-16 shrink-0 items-center gap-2 border-b px-4 bg-white">
        {showSidebarTrigger && <SidebarTrigger className="-ml-1" />}
        <div className="flex-1">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-semibold text-gray-900">
              {title}
            </h1>
            <div className="flex items-center gap-3">
              <span className="text-sm text-gray-700">
                Bienvenido, {userInfo?.username || 'Usuario'}
              </span>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Avatar className="h-10 w-10 cursor-pointer">
                    <AvatarFallback className="bg-orange-500 text-white text-sm font-medium">
                      {getInitials()}
                    </AvatarFallback>
                  </Avatar>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56 bg-white">
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
                   <DropdownMenuItem 
                    className="flex items-center gap-2 cursor-pointer"
                    onClick={handleCopyConferenceLink}
                  >
                    <Copy className="w-4 h-4" />
                    <span>Copiar Link de Conferencias</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    className="flex items-center gap-2 cursor-pointer"
                    onClick={() => setIsWithdrawModalOpen(true)}
                  >
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

      {/* Modal de Retiro */}
      <Dialog open={isWithdrawModalOpen} onOpenChange={setIsWithdrawModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Solicitar Retiro</DialogTitle>
          </DialogHeader>
          
          <div className="bg-teal-50 border border-teal-200 rounded-lg p-3 mb-4">
            <p className="text-sm text-teal-700">
              <span className="font-medium">Alerta:</span> Puedes realizar la solicitud de tu retiro del 1 al 5 de cada mes.
              Recuerda que el valor se verá reflejado en tu Wallet el día 10 de cada mes.
            </p>
          </div>

          <div className="space-y-4">
            <div>
              <Label htmlFor="payment-method">Medio de pago</Label>
              <Input
                id="payment-method"
                defaultValue="USDT TRC20"
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="destination-account">Cuenta de Destino</Label>
              <Input
                id="destination-account"
                defaultValue="4444"
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="withdrawal-amount">Monto del Retiro</Label>
              <Input
                id="withdrawal-amount"
                placeholder="Monto Disponible"
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="auth-code">Código de Autentificación</Label>
              <Input
                id="auth-code"
                className="mt-1"
              />
            </div>

            <Button 
              onClick={handleWithdrawSubmit}
              className="w-full bg-green-500 hover:bg-green-600 text-white"
            >
              Solicitar Token de retiro
            </Button>
          </div>

          <div className="flex justify-end pt-4">
            <Button 
              onClick={handleWithdrawSubmit}
              className="bg-green-500 hover:bg-green-600 text-white"
            >
              Solicitar
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};
