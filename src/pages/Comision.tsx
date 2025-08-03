import React, { useState, useEffect } from 'react';
import { OrganizationLayout } from '@/components/OrganizationLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from '@/components/ui/pagination';
import { useToast } from '@/hooks/use-toast';
import { FileDown } from 'lucide-react';
import * as XLSX from 'xlsx';
import { apiUrl } from '@/lib/config';

interface Comision {
  id: number;
  nombre_beneficiario: string;
  apellido_beneficiario: string;
  tipo_comision: string;
  valor: number;
}

const Comision: React.FC = () => {
  const [comisiones, setComisiones] = useState<Comision[]>([]);
  const [filteredComisiones, setFilteredComisiones] = useState<Comision[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const itemsPerPage = 10;

  useEffect(() => {
    fetchComisiones();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    filterComisiones();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [comisiones, searchTerm]);

  const fetchComisiones = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const idUser = localStorage.getItem('idUser');
      if (!idUser || !token) {
        toast({
          title: "Error",
          description: "Usuario no autenticado",
          variant: "destructive"
        });
        setLoading(false);
        return;
      }
      const response = await fetch(apiUrl(`/api/comisiones/comisiones/${idUser}`), {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setComisiones(data);
      } else {
        toast({
          title: "Error",
          description: "Error al obtener las comisiones",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Error fetching comisiones:', error);
      toast({
        title: "Error",
        description: "Error de conexión",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const filterComisiones = () => {
    let filtered = comisiones;

    if (searchTerm) {
      filtered = filtered.filter(comision => 
        comision.nombre_beneficiario.toLowerCase().includes(searchTerm.toLowerCase()) ||
        comision.apellido_beneficiario.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredComisiones(filtered);
    setCurrentPage(1);
  };

  const exportToExcel = () => {
    const dataToExport = filteredComisiones.map(comision => ({
      '#': comision.id,
      'Nombre(s)': comision.nombre_beneficiario,
      'Apellido(s)': comision.apellido_beneficiario,
      'Tipo Comisión': comision.tipo_comision,
      'Valor': comision.valor.toLocaleString('es-CO', { style: 'currency', currency: 'COP' }),
    }));

    const ws = XLSX.utils.json_to_sheet(dataToExport);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Comisiones');
    XLSX.writeFile(wb, `comisiones_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  // Paginación
  const totalPages = Math.ceil(filteredComisiones.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentItems = filteredComisiones.slice(startIndex, endIndex);

  if (loading) {
    return (
      <OrganizationLayout title="Liquidaciones">
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
    <OrganizationLayout title="Todas mis Comisiones">
      <div className="container mx-auto p-6 space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Historial de mis Comisiones</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex justify-between items-center mb-4">
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
                    <TableHead>Nombre(s)</TableHead>
                    <TableHead>Apellido(s)</TableHead>
                    <TableHead>Tipo Comisión</TableHead>
                    <TableHead>Valor</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {currentItems.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-8">
                        No hay datos disponibles en la tabla
                      </TableCell>
                    </TableRow>
                  ) : (
                    currentItems.map((comision) => (
                      <TableRow key={comision.id}>
                        <TableCell>{comision.id}</TableCell>
                        <TableCell>{comision.nombre_beneficiario}</TableCell>
                        <TableCell>{comision.apellido_beneficiario}</TableCell>
                        <TableCell>{comision.tipo_comision}</TableCell>
                        <TableCell>
                          {comision.valor.toLocaleString('es-CO', { style: 'currency', currency: 'COP' })}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>

            <div className="flex items-center justify-between mt-4">
              <div className="text-sm text-muted-foreground">
                Mostrando {filteredComisiones.length === 0 ? 0 : startIndex + 1} a {Math.min(endIndex, filteredComisiones.length)} de {filteredComisiones.length} entradas
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
          </CardContent>
        </Card>
      </div>
    </OrganizationLayout>
  );
};

export default Comision;
