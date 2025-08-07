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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Copy, User, Link, LogOut, TrendingUp, Video } from "lucide-react";
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { ThemeToggle } from '@/components/ThemeToggle';
import Swal from 'sweetalert2';
import { apiUrl } from '@/lib/config';

interface UserInfo {
  username: string;
  firstName: string;
  lastName: string;
  wallet_usdt?: string;
  met_pago?: string;
  estado?: string;
  email?: string;
  foto?: string;
}

interface UserPaymentMethod {
  title: string;
  value: string;
}

interface UserNavbarProps {
  title: string;
  showSidebarTrigger?: boolean;
}

interface HorarioRetiro {
  id: number;
  horario: string;
  fee: string;
  mensaje_retiro: string;
}

export const UserNavbar = ({ title, showSidebarTrigger = false }: UserNavbarProps) => {
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const [isWithdrawModalOpen, setIsWithdrawModalOpen] = useState(false);
  const [conferenceLink, setConferenceLink] = useState<string>("");
  const [withdrawAmount, setWithdrawAmount] = useState<string>("");
  const [availableBalance, setAvailableBalance] = useState<number>(0);
  const [alertMessage, setAlertMessage] = useState<string>("");
  const [userPaymentMethods, setUserPaymentMethods] = useState<UserPaymentMethod[]>([]);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string>("");
  const [selectedDestinationAccount, setSelectedDestinationAccount] = useState<string>("");
  const [horariosRetiro, setHorariosRetiro] = useState<HorarioRetiro[]>([]);
  const [isWithdrawEnabled, setIsWithdrawEnabled] = useState<boolean>(false);
  const [currentFee, setCurrentFee] = useState<number>(0);
  const [nextSchedules, setNextSchedules] = useState<string[]>([]);
  const { logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserInfo = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) return;

        const response = await fetch(apiUrl('/api/perfil'), {
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
            firstName: data.name || '',
            lastName: data.apellidos || '',
            wallet_usdt: data.wallet_usdt || '',
            met_pago: data.met_pago || '',
            estado: data.estado || '0',
            email: data.email || '',
            foto: data.foto || ''
          });

          // Parse user payment methods
          if (data.met_pago && data.wallet_usdt) {
            const methodNames = data.met_pago.split(', ');
            const methodValues = data.wallet_usdt.split(', ');
            const parsedMethods = methodNames.map((name: string, index: number) => ({
              title: name,
              value: methodValues[index] || ''
            }));
            setUserPaymentMethods(parsedMethods);
          }
        }
      } catch (error) {
        console.error('Error fetching user info:', error);
      }
    };

    const fetchConferenceLink = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) return;

        const response = await fetch(apiUrl('/api/link'), {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        if (response.ok) {
          const data = await response.json();
          if (Array.isArray(data)) {
            const conferenceData = data.find((link: any) => link.id === 1);
            setConferenceLink(conferenceData?.link || '');
          } else {
            setConferenceLink(data.link || '');
          }
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
      const retirosResponse = await fetch(apiUrl(`/api/retiros/${idUser}`), {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      // Obtener total disponible de comisiones
      const comisionesResponse = await fetch(apiUrl(`/api/comisiones/sumatorias/${idUser}`), {
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

  const fetchHorariosRetiro = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const response = await fetch(apiUrl('/api/tiempo-retiro'), {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        setHorariosRetiro(data);
        checkWithdrawAvailability(data);
      }
    } catch (error) {
      console.error('Error fetching horarios retiro:', error);
    }
  };

  const checkWithdrawAvailability = (horarios: HorarioRetiro[]) => {
    if (!horarios || horarios.length === 0) {
      setIsWithdrawEnabled(false);
      return;
    }

    const now = new Date();
    let available = false;
    let fee = 0;
    const nextDates: string[] = [];

    for (const horario of horarios) {
      const scheduleDate = new Date(horario.horario);
      
      // Check if current time is within the schedule range (considering a 1-hour window)
      const timeDiff = Math.abs(now.getTime() - scheduleDate.getTime());
      const hourInMs = 60 * 60 * 1000;
      
      if (timeDiff <= hourInMs) {
        available = true;
        // Store fee percentage, will be calculated later based on withdrawal amount
        fee = parseFloat(horario.fee);
        break;
      } else if (scheduleDate > now) {
        // Collect future schedules
        nextDates.push(scheduleDate.toLocaleString('es-ES', {
          year: 'numeric',
          month: '2-digit', 
          day: '2-digit',
          hour: '2-digit',
          minute: '2-digit'
        }));
      }
    }

    setIsWithdrawEnabled(available);
    setCurrentFee(fee);
    setNextSchedules(nextDates.slice(0, 3)); // Show next 3 schedules
  };

    fetchUserInfo();
    fetchConferenceLink();
    fetchWithdrawals();
    fetchHorariosRetiro();
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

      // Apply fee percentage to withdrawal amount
      const feeAmount = (parseFloat(withdrawAmount) * currentFee) / 100;
      const finalAmount = parseFloat(withdrawAmount) - feeAmount;
      if (finalAmount <= 0) {
        showAlert('El monto después de descontar la comisión debe ser mayor a 0');
        return;
      }

      const withdrawData = {
        usuario_id: parseInt(idUser),
        monto: finalAmount,
        wallet_usdt: selectedDestinationAccount,
        metodo_pago: selectedPaymentMethod
      };

      const response = await fetch(apiUrl('/api/retiros'), {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(withdrawData),
      });

      if (response.ok) {
        setIsWithdrawModalOpen(false);
        setWithdrawAmount("");
        setSelectedPaymentMethod("");
        setSelectedDestinationAccount("");
        setAlertMessage("");
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

  const handlePaymentMethodChange = (value: string) => {
    setSelectedPaymentMethod(value);
    // Find the corresponding destination account
    const selectedMethod = userPaymentMethods.find(method => method.title === value);
    if (selectedMethod) {
      setSelectedDestinationAccount(selectedMethod.value);
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
              <ThemeToggle />
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <div className="flex items-center gap-3 cursor-pointer hover:bg-accent rounded-lg p-2 transition-colors">
                    <div className="text-right">
                      <p className="text-sm font-medium text-foreground">
                        {userInfo?.firstName && userInfo?.lastName 
                          ? `${userInfo.firstName} ${userInfo.lastName}` 
                          : userInfo?.username || 'Usuario'}
                      </p>
                      <div className={`flex items-center gap-1 ${userInfo?.estado === '1' ? 'text-success' : 'text-destructive'}`}>
                        <div className={`w-2 h-2 rounded-full ${userInfo?.estado === '1' ? 'bg-success' : 'bg-destructive'}`} />
                        <span className="text-xs">{userInfo?.estado === '1' ? 'Usuario Activo' : 'Usuario Inactivo'}</span>
                      </div>
                    </div>
                    <Avatar className="h-9 w-9">
                      {userInfo?.foto ? (
                        <AvatarImage 
                          src={apiUrl(`/${userInfo.foto.replace(/\\/g, '/')}`)}
                          alt="Profile Picture"
                        />
                      ) : null}
                      <AvatarFallback className="bg-primary text-primary-foreground text-sm font-medium">
                        {getInitials()}
                      </AvatarFallback>
                    </Avatar>
                  </div>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-64 bg-card shadow-lg border border-border">
                  <div className="px-3 py-2 border-b border-border">
                    <p className="text-sm font-medium text-card-foreground">{userInfo?.firstName + ' '+ userInfo?.lastName  || 'Usuario'}</p>
                    <p className="text-xs text-muted-foreground">{userInfo?.email || `${userInfo?.username}@enverwoood.com`}</p>
                  </div>
                  <DropdownMenuItem 
                    className="flex items-center gap-3 px-3 py-2 cursor-pointer hover:bg-accent"
                    onClick={handleProfileClick}
                  >
                    <User className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm">Mi Perfil</span>
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
          
          <div className={`border rounded-lg p-4 mb-4 ${isWithdrawEnabled ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
            <p className="text-sm">
              <span className="font-medium">
                {isWithdrawEnabled ? 
                  (horariosRetiro.find(h => {
                    const scheduleDate = new Date(h.horario);
                    const now = new Date();
                    const timeDiff = Math.abs(now.getTime() - scheduleDate.getTime());
                    const hourInMs = 60 * 60 * 1000;
                    return timeDiff <= hourInMs;
                  })?.mensaje_retiro || 'Retiros disponibles') :
                  'Los retiros están disponibles en los horarios:'
                }
              </span>
              {!isWithdrawEnabled && nextSchedules.length > 0 && (
                <div className="mt-2">
                  {nextSchedules.map((date, index) => (
                    <div key={index} className="text-red-700">• {date}</div>
                  ))}
                </div>
              )}
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
              <Select value={selectedPaymentMethod} onValueChange={handlePaymentMethodChange}>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Selecciona un método de pago" />
                </SelectTrigger>
                <SelectContent>
                  {userPaymentMethods.map((method, index) => (
                    <SelectItem key={index} value={method.title}>
                      {method.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="destination-account">Cuenta de Destino</Label>
              <Input
                id="destination-account"
                value={selectedDestinationAccount}
                readOnly
                className="mt-1 bg-gray-50"
                placeholder="Selecciona un método de pago primero"
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
                disabled={!isWithdrawEnabled}
              />
              {withdrawAmount && (
                <div className="mt-2 text-xs text-muted-foreground">
                  {localStorage.getItem('idUser') === '1' && (
                    <p>Comisión ({currentFee}%): ${((parseFloat(withdrawAmount) * currentFee) / 100).toFixed(2)}</p>
                  )}
                  <p>Monto final: ${(parseFloat(withdrawAmount) - ((parseFloat(withdrawAmount) * currentFee) / 100)).toFixed(2)}</p>
                </div>
              )}
            </div>

            <div className="flex justify-end pt-4">
              <Button 
                type="submit"
                className="bg-primary hover:bg-primary/90 text-primary-foreground"
                disabled={!isWithdrawEnabled}
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
