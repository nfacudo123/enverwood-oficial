import React, { useState, useEffect } from 'react';
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
import Swal from 'sweetalert2';
import { apiUrl } from '@/lib/config';
import { format, toZonedTime } from 'date-fns-tz';

interface UserPaymentMethod {
  title: string;
  value: string;
}

interface HorarioRetiro {
  id: number;
  horario: string;
  hora_inicio: string;
  horario_fin: string;
  fecha: string;
  hora_fin: string;
  fee: string;
  mensaje_retiro: string;
}

interface WithdrawModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const WithdrawModal = ({ isOpen, onClose }: WithdrawModalProps) => {
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

  useEffect(() => {
    if (isOpen) {
      fetchUserInfo();
      fetchWithdrawals();
      fetchHorariosRetiro();
    }
  }, [isOpen]);

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

  const timeZone = 'America/Bogota';

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

  const now = toZonedTime(new Date(), 'America/Bogota'); // Hora actual en zona horaria de Bogotá
  let available = false;
  let fee = 0;
  const futureSchedules: string[] = [];

  for (const horario of horarios) {
  // Obtener la fecha y hora de inicio y fin
  const staras = format(toZonedTime(new Date(horario.fecha), 'America/Bogota'),'yyyy-MM-dd');
  const fitaras = format(toZonedTime(new Date(horario.horario_fin), 'America/Bogota'),'yyyy-MM-dd');
 
  // 2. Concatenar con hora (ej: "2025-08-19T08:00:00")
  const startString = `${staras}T${horario.hora_inicio}`;
  const endString = `${fitaras}T${horario.hora_fin}`;

  // 3. Crear fechas directamente en Bogotá
  const startDate = toZonedTime(new Date(startString), timeZone);
  const endDate = toZonedTime(new Date(endString), timeZone);

  console.log('tesset'+startDate );

  // Verificar si la hora actual está dentro del rango de fechas de los horarios de retiro
  if (now >= startDate && now <= endDate) {
    available = true; // Si la hora actual está dentro del rango de la fecha/hora
    fee = parseFloat(horario.fee); // Obtener la comisión
    break; // Salimos del loop cuando encontramos un horario válido
  } else if (startDate > now) {
    // Si la fecha de inicio es mayor que la hora actual, se considera un horario futuro
    futureSchedules.push(
      `Desde: ${format(startDate, 'dd/MM/yyyy')} hasta ${format(endDate, 'dd/MM/yyyy')}, en horarios desde ${format(startDate, 'hh:mm a')} hasta la(s) ${format(endDate, 'hh:mm a')} `
    );
  }
}


  setIsWithdrawEnabled(available); // Habilitar/deshabilitar retiro
  setCurrentFee(fee); // Establecer la comisión
  setNextSchedules(futureSchedules); // Mostrar los próximos horarios
};

  const showAlert = (message: string) => {
    setAlertMessage(message);
    setTimeout(() => {
      setAlertMessage("");
    }, 3000);
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
        onClose();
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
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Solicitar Retiro</DialogTitle>
        </DialogHeader>
        
       <div className={`border rounded-lg p-4 mb-4 ${isWithdrawEnabled ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
  <p className="text-sm">
    <span className="font-medium">
      {isWithdrawEnabled ? 
        (horariosRetiro.find(h => {
          const scheduleDate = new Date(h.horario + "T" + h.hora_inicio); // Hora de inicio del horario de retiro
          const now = new Date();
          const timeDiff = Math.abs(now.getTime() - scheduleDate.getTime());
          const hourInMs = 60 * 60 * 1000;
          return timeDiff <= hourInMs; // Verifica si está dentro de una hora del horario de retiro
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
  );
};