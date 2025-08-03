import React, { useState, useEffect } from 'react';
import { OrganizationLayout } from '@/components/OrganizationLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from '@/components/ui/pagination';
import { useToast } from '@/hooks/use-toast';
import { CheckCircle, XCircle, FileDown } from 'lucide-react';
import * as XLSX from 'xlsx';

interface Retiro {
  id: number;
  usuario_id: number;
  monto: string;
  estado: string;
  fecha: string;
  wallet_usdt: string;
  metodo_pago: string;
}

interface Totales {
  pendiente: number;
  aprobado: number;
}

const Pagos: React.FC = () => {
  const [retiros, setRetiros] = useState<Retiro[]>([]);
  const [filteredRetiros, setFilteredRetiros] = useState<Retiro[]>([]);
  const [totales, setTotales] = useState<Totales>({ pendiente: 0, aprobado: 0 });
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('pendientes');
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const itemsPerPage = 10;

  useEffect(() => {
    fetchRetiros();
    fetchTotales();
  }, []);

  useEffect(() => {
    filterRetiros();
  }, [retiros, activeTab, searchTerm]);

  const fetchRetiros = async () => {
    try {
      const token = localStorage.getItem('token');
      console.log('Token disponible:', !!token);
      console.log('Haciendo petición a:', 'http://localhost:4000/api/retiros');
      
      const response = await fetch('http://localhost:4000/api/retiros', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      console.log('Respuesta status:', response.status);
      console.log('Respuesta ok:', response.ok);

      if (response.ok) {
        const data = await response.json();
        console.log('Datos de retiros recibidos:', data);
        console.log('Cantidad de retiros:', data.length);
        setRetiros(data);
      } else {
        const errorText = await response.text();
        console.log('Error response:', errorText);
        toast({
          title: "Error",
          description: `Error al obtener los retiros: ${response.status}`,
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Error fetching retiros:', error);
      toast({
        title: "Error",
        description: "Error de conexión",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchTotales = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:4000/api/retiros/sumatorias/totales', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setTotales(data);
      }
    } catch (error) {
      console.error('Error fetching totales:', error);
    }
  };

  const filterRetiros = () => {
    let filtered = retiros;

    // Filtrar por estado según el tab activo
    if (activeTab === 'pendientes') {
      filtered = filtered.filter(retiro => retiro.estado === "0" || retiro.estado === "pendiente");
    } else {
      filtered = filtered.filter(retiro => retiro.estado === "1");
    }

    // Filtrar por término de búsqueda
    if (searchTerm) {
      filtered = filtered.filter(retiro => 
        retiro.monto.toLowerCase().includes(searchTerm.toLowerCase()) ||
        retiro.wallet_usdt.toLowerCase().includes(searchTerm.toLowerCase()) ||
        retiro.metodo_pago.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredRetiros(filtered);
    setCurrentPage(1);
  };

  const handleAprobar = async (id: number) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:4000/api/retiros/aprobar/${id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        toast({
          title: "Éxito",
          description: "Retiro aprobado correctamente"
        });
        fetchRetiros();
        fetchTotales();
      } else {
        toast({
          title: "Error",
          description: "Error al aprobar el retiro",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Error approving retiro:', error);
      toast({
        title: "Error",
        description: "Error de conexión",
        variant: "destructive"
      });
    }
  };

  const handleCancelar = async (id: number) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:4000/api/retiros/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        toast({
          title: "Éxito",
          description: "Retiro cancelado correctamente"
        });
        fetchRetiros();
        fetchTotales();
      } else {
        toast({
          title: "Error",
          description: "Error al cancelar el retiro",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Error canceling retiro:', error);
      toast({
        title: "Error",
        description: "Error de conexión",
        variant: "destructive"
      });
    }
  };

  const exportToExcel = () => {
    const dataToExport = filteredRetiros.map(retiro => ({
      '#': retiro.id,
      'Monto': `$${retiro.monto}`,
      'Billetera': retiro.wallet_usdt,
      'Método de Pago': retiro.metodo_pago,
      'Fecha': new Date(retiro.fecha).toLocaleString('es-ES'),
      'Estado': (retiro.estado === "0" || retiro.estado === "pendiente") ? 'Pendiente' : 'Realizado'
    }));

    const ws = XLSX.utils.json_to_sheet(dataToExport);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, `Pagos ${activeTab}`);
    XLSX.writeFile(wb, `pagos_${activeTab}_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('es-ES', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Paginación
  const totalPages = Math.ceil(filteredRetiros.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentItems = filteredRetiros.slice(startIndex, endIndex);

  if (loading) {
    return (
      <OrganizationLayout title="Pagos">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            <p className="mt-2 text-muted-foreground">Cargando...</p>
          </div>
        </div>
      </OrganizationLayout>
    );
  }

  return (
    <OrganizationLayout title="Todos mis Pagos">
      <div className="container mx-auto p-6 space-y-6">
        {/* Tarjetas de totales */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Total Pendiente</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${totales.pendiente}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Total Pagado</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${totales.aprobado}</div>
            </CardContent>
          </Card>
        </div>

        {/* Contenido principal */}
        <Card>
          <CardHeader>
            <CardTitle>Pagos</CardTitle>
            <CardDescription>
              Gestión de retiros y pagos del sistema
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="pendientes">Pendientes</TabsTrigger>
                <TabsTrigger value="realizados">Realizados</TabsTrigger>
              </TabsList>
              
              <TabsContent value="pendientes" className="space-y-4">
                <div className="flex justify-between items-center">
                  <div className="flex items-center space-x-4">
                    <Button onClick={exportToExcel} variant="outline" size="sm">
                      <FileDown className="h-4 w-4 mr-2" />
                      Excel
                    </Button>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-muted-foreground">Buscar:</span>
                    <Input
                      placeholder="Buscar..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-64"
                    />
                  </div>
                </div>

                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>#</TableHead>
                        <TableHead>Monto</TableHead>
                        <TableHead>Billetera</TableHead>
                        <TableHead>Método de Pago</TableHead>
                        <TableHead>Fecha</TableHead>
                        <TableHead>Acciones</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {currentItems.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={6} className="text-center py-8">
                            No hay datos disponibles en la tabla
                          </TableCell>
                        </TableRow>
                      ) : (
                        currentItems.map((retiro) => (
                          <TableRow key={retiro.id}>
                            <TableCell>{retiro.id}</TableCell>
                            <TableCell>${retiro.monto}</TableCell>
                            <TableCell className="font-mono text-xs">{retiro.wallet_usdt}</TableCell>
                            <TableCell>{retiro.metodo_pago}</TableCell>
                            <TableCell>{formatDate(retiro.fecha)}</TableCell>
                            <TableCell>
                              <div className="flex space-x-2">
                                <Button
                                  size="sm"
                                  variant="default"
                                  onClick={() => handleAprobar(retiro.id)}
                                  className="bg-green-500 hover:bg-green-600"
                                >
                                  <CheckCircle className="h-4 w-4 mr-1" />
                                  Liquidar
                                </Button>
                                <Button
                                  size="sm"
                                  variant="destructive"
                                  onClick={() => handleCancelar(retiro.id)}
                                >
                                  <XCircle className="h-4 w-4 mr-1" />
                                  Cancelar pago
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>

                {/* Paginación */}
                <div className="flex items-center justify-between">
                  <div className="text-sm text-muted-foreground">
                    Mostrando {startIndex + 1} a {Math.min(endIndex, filteredRetiros.length)} de {filteredRetiros.length} entradas
                  </div>
                  {totalPages > 1 && (
                    <Pagination>
                      <PaginationContent>
                        <PaginationItem>
                          <PaginationPrevious 
                            onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                            className={currentPage === 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                          />
                        </PaginationItem>
                        {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                          <PaginationItem key={page}>
                            <PaginationLink
                              onClick={() => setCurrentPage(page)}
                              isActive={currentPage === page}
                              className="cursor-pointer"
                            >
                              {page}
                            </PaginationLink>
                          </PaginationItem>
                        ))}
                        <PaginationItem>
                          <PaginationNext 
                            onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                            className={currentPage === totalPages ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                          />
                        </PaginationItem>
                      </PaginationContent>
                    </Pagination>
                  )}
                </div>
              </TabsContent>
              
              <TabsContent value="realizados" className="space-y-4">
                <div className="flex justify-between items-center">
                  <div className="flex items-center space-x-4">
                    <Button onClick={exportToExcel} variant="outline" size="sm">
                      <FileDown className="h-4 w-4 mr-2" />
                      Excel
                    </Button>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-muted-foreground">Buscar:</span>
                    <Input
                      placeholder="Buscar..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-64"
                    />
                  </div>
                </div>

                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>#</TableHead>
                        <TableHead>Monto</TableHead>
                        <TableHead>Billetera</TableHead>
                        <TableHead>Método de Pago</TableHead>
                        <TableHead>Fecha</TableHead>
                        <TableHead>Estado</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {currentItems.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={6} className="text-center py-8">
                            No hay datos disponibles en la tabla
                          </TableCell>
                        </TableRow>
                      ) : (
                        currentItems.map((retiro) => (
                          <TableRow key={retiro.id}>
                            <TableCell>{retiro.id}</TableCell>
                            <TableCell>${retiro.monto}</TableCell>
                            <TableCell className="font-mono text-xs">{retiro.wallet_usdt}</TableCell>
                            <TableCell>{retiro.metodo_pago}</TableCell>
                            <TableCell>{formatDate(retiro.fecha)}</TableCell>
                            <TableCell>
                              <Badge variant="default" className="bg-green-100 text-green-800 border-green-200">
                                Realizado
                              </Badge>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>

                {/* Paginación */}
                <div className="flex items-center justify-between">
                  <div className="text-sm text-muted-foreground">
                    Mostrando {startIndex + 1} a {Math.min(endIndex, filteredRetiros.length)} de {filteredRetiros.length} entradas
                  </div>
                  {totalPages > 1 && (
                    <Pagination>
                      <PaginationContent>
                        <PaginationItem>
                          <PaginationPrevious 
                            onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                            className={currentPage === 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                          />
                        </PaginationItem>
                        {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                          <PaginationItem key={page}>
                            <PaginationLink
                              onClick={() => setCurrentPage(page)}
                              isActive={currentPage === page}
                              className="cursor-pointer"
                            >
                              {page}
                            </PaginationLink>
                          </PaginationItem>
                        ))}
                        <PaginationItem>
                          <PaginationNext 
                            onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                            className={currentPage === totalPages ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                          />
                        </PaginationItem>
                      </PaginationContent>
                    </Pagination>
                  )}
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </OrganizationLayout>
  );
};

export default Pagos;