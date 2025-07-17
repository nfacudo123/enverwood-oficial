import { useState, useEffect } from "react";
import { OrganizationLayout } from "@/components/OrganizationLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Eye, Download, CheckCircle } from "lucide-react";
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

  const handleAprobar = (id: number) => {
    // TODO: Implementar la funcionalidad de aprobar cuando se proporcione la URL
    toast({
      title: "Funcionalidad pendiente",
      description: "La URL para aprobar será proporcionada más tarde",
    });
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
          {showAprobar && <TableHead>Aprobar Depósitos</TableHead>}
        </TableRow>
      </TableHeader>
      <TableBody>
        {inversiones.length === 0 ? (
          <TableRow>
            <TableCell colSpan={showAprobar ? 8 : 7} className="text-center py-8">
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
                  <Button 
                    variant="default" 
                    size="sm"
                    onClick={() => handleAprobar(inversion.id)}
                  >
                    <CheckCircle className="h-4 w-4 mr-1" />
                    Aprobar
                  </Button>
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