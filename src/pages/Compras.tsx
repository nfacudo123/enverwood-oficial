import { useState, useEffect } from "react";
import { OrganizationLayout } from "@/components/OrganizationLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Eye, Download, CheckCircle, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Inversion {
  id: number;
  usuario_id: number;
  monto: string;
  fecha_inicio: string;
  fecha_termino: string | null;
  tasa_diaria: number | null;
  activo: boolean;
  creado_en: string;
  comprobante: string | null;
  name: string;
  email: string;
  apellidos: string;
  username: string;
  telefono: string;
  wallet_usdt: string | null;
  direccion: string | null;
  ciudad: string | null;
  estado: string;
  role: string;
}

export default function Compras() {
  const [inversiones, setInversiones] = useState<Inversion[]>([]);
  const [loading, setLoading] = useState(true);
  const [utilidades, setUtilidades] = useState<{ [key: number]: string }>({});
  const { toast } = useToast();

  useEffect(() => {
    fetchInversiones();
  }, []);

  const fetchInversiones = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        toast({
          title: "Error",
          description: "No se encontró token de autenticación",
          variant: "destructive",
        });
        return;
      }

      const response = await fetch('http://localhost:4000/api/inversiones', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      // Handle new JSON structure with inversiones array
      if (data && data.inversiones && Array.isArray(data.inversiones)) {
        setInversiones(data.inversiones);
      } else if (Array.isArray(data)) {
        setInversiones(data);
      } else {
        console.error('API response format not recognized:', data);
        setInversiones([]);
        toast({
          title: "Error",
          description: "Formato de datos inválido",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error fetching inversiones:', error);
      setInversiones([]); // Set empty array on error
      toast({
        title: "Error",
        description: "No se pudieron cargar las inversiones",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const inversionesPendientes = inversiones.filter(inv => !inv.activo);
  const inversionesAprobadas = inversiones.filter(inv => inv.activo);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES');
  };

  const formatMonto = (monto: string) => {
    return `$${parseFloat(monto).toLocaleString('es-ES', { minimumFractionDigits: 2 })}`;
  };

  const handleAprobar = async (id: number) => {
    try {
      const utilidad = utilidades[id];
      if (!utilidad || utilidad.trim() === '') {
        toast({
          title: "Error",
          description: "Debe ingresar una utilidad válida",
          variant: "destructive",
        });
        return;
      }

      const token = localStorage.getItem('token');
      if (!token) {
        toast({
          title: "Error",
          description: "No se encontró token de autenticación",
          variant: "destructive",
        });
        return;
      }

      console.log('Enviando solicitud a:', `http://localhost:4000/api/inversiones/validar/${id}`);
      console.log('Datos:', { utilidad: utilidad });

      const response = await fetch(`http://localhost:4000/api/inversiones/validar/${id}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          utilidad: utilidad
        }),
      });

      console.log('Response status:', response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.log('Error response:', errorText);
        throw new Error(`HTTP error! status: ${response.status} - ${errorText}`);
      }

      const responseData = await response.json();
      console.log('Success response:', responseData);

      toast({
        title: "Éxito",
        description: "Inversión validada y comisiones distribuidas correctamente",
      });

      // Limpiar el input de utilidad
      setUtilidades(prev => ({ ...prev, [id]: '' }));
      
      // Recargar los datos para actualizar la tabla
      fetchInversiones();
    } catch (error) {
      console.error('Error aprobando inversión:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "No se pudo aprobar la inversión",
        variant: "destructive",
      });
    }
  };

  const handleCaducarCiclo = async (id: number) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        toast({
          title: "Error",
          description: "No se encontró token de autenticación",
          variant: "destructive",
        });
        return;
      }

      const response = await fetch(`http://localhost:4000/api/inversiones/caducar/${id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      toast({
        title: "Éxito",
        description: "Ciclo caducado correctamente",
      });

      // Recargar los datos para actualizar la tabla
      fetchInversiones();
    } catch (error) {
      console.error('Error caducando ciclo:', error);
      toast({
        title: "Error",
        description: "No se pudo caducar el ciclo",
        variant: "destructive",
      });
    }
  };

  const InversionTable = ({ inversiones, showAprobar = false }: { inversiones: Inversion[], showAprobar?: boolean }) => (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>#</TableHead>
          <TableHead>Usuario</TableHead>
          <TableHead>Monto</TableHead>
          <TableHead>Fecha</TableHead>
          <TableHead>Ver Comprobante</TableHead>
          <TableHead>Tipo</TableHead>
          {showAprobar && <TableHead>Registrar utilidades</TableHead>}
        </TableRow>
      </TableHeader>
      <TableBody>
        {inversiones.length === 0 ? (
          <TableRow>
            <TableCell colSpan={showAprobar ? 7 : 6} className="text-center py-8">
              No data available in table
            </TableCell>
          </TableRow>
        ) : (
          inversiones.map((inversion) => (
            <TableRow key={inversion.id}>
              <TableCell>{inversion.id}</TableCell>
              <TableCell>{inversion.name} {inversion.apellidos}</TableCell>
              <TableCell>{formatMonto(inversion.monto)}</TableCell>
              <TableCell>{formatDate(inversion.fecha_inicio)}</TableCell>
              <TableCell>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => window.open(`http://localhost:4000/${inversion.comprobante}`, '_blank')}
                  disabled={!inversion.comprobante}
                >
                  <Eye className="h-4 w-4" />
                </Button>
              </TableCell>
              <TableCell>
                <Badge variant={inversion.activo ? "default" : "secondary"}>
                  {inversion.activo ? "Aprobada" : "Pendiente"}
                </Badge>
              </TableCell>
               {showAprobar && (
                <TableCell>
                  <div className="flex flex-col gap-2">
                    <Input
                      type="number"
                      min='0'
                      placeholder="Utilidad"
                      className="w-24"
                    />
                    <div className="flex gap-1">
                      <Button 
                        variant="default" 
                        size="sm"
                        onClick={() => handleAprobar(inversion.id)}
                        className="bg-green-600 hover:bg-green-700"
                        disabled={!utilidades[inversion.id] || utilidades[inversion.id].trim() === ''}
                      >
                        Aprobar
                      </Button>
                      <Button 
                        variant="default" 
                        size="sm"
                        onClick={() => handleCaducarCiclo(inversion.id)}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        Caducar ciclo
                      </Button>
                    </div>
                  </div>
                </TableCell>
               )}
            </TableRow>
          ))
        )}
      </TableBody>
    </Table>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div>Cargando...</div>
      </div>
    );
  }

  return (
    <OrganizationLayout title="Comprobantes de Depósitos">
      <div className="p-6 space-y-6">
        <div>
          <p className="text-muted-foreground">
            Comprobantes de depósitos: Aquí puedes verificar los comprobantes de pagos y aprobar los depósitos.
          </p>
        </div>

      <Tabs defaultValue="pendientes" className="space-y-4">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="pendientes">
            Pendientes ({inversionesPendientes.length})
          </TabsTrigger>
          <TabsTrigger value="aprobadas">
            Aprobadas ({inversionesAprobadas.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="pendientes">
          <Card>
            <CardHeader>
              <CardTitle>Inversiones Pendientes</CardTitle>
              <CardDescription>
                Inversiones que están pendientes de aprobación
              </CardDescription>
            </CardHeader>
            <CardContent>
              <InversionTable inversiones={inversionesPendientes} showAprobar={true} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="aprobadas">
          <Card>
            <CardHeader>
              <CardTitle>Inversiones Aprobadas</CardTitle>
              <CardDescription>
                Inversiones que ya han sido aprobadas
              </CardDescription>
            </CardHeader>
            <CardContent>
              <InversionTable inversiones={inversionesAprobadas} />
            </CardContent>
          </Card>
        </TabsContent>
        </Tabs>
      </div>
    </OrganizationLayout>
  );
}