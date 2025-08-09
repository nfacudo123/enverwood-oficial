import React, { useState, useEffect } from 'react';
import { OrganizationLayout } from '@/components/OrganizationLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Search, Download } from 'lucide-react';
import * as XLSX from 'xlsx';
import Swal from 'sweetalert2';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { apiUrl } from '@/lib/config';

// Asegúrate de importar correctamente el ícono X de lucide-react
import { X } from 'lucide-react'; // Esta línea es la clave para solucionar el error

// Otros componentes como Dialog
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

interface Inversion {
  id: number;
  monto: string;
  activo: boolean;
  comprobante: string;
  utilrestAjustado: number;
}

const UtilAdmin: React.FC = () => {
  const [inversiones, setInversiones] = useState<Inversion[]>([]);
  const [filteredInversiones, setFilteredInversiones] = useState<Inversion[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [isProofModalOpen, setIsProofModalOpen] = useState(false);
  const [selectedComprobante, setSelectedComprobante] = useState<string>('');
  const [isUtilidadModalOpen, setIsUtilidadModalOpen] = useState(false); // Nueva variable de estado para el modal de utilidad
  const [utilidadPorcentaje, setUtilidadPorcentaje] = useState<string>(''); // Almacena el porcentaje ingresado
  const itemsPerPage = 10;

  useEffect(() => {
    fetchInversiones();
  }, []);

  useEffect(() => {
    filterInversiones();
  }, [inversiones, searchTerm]);

  const fetchInversiones = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch(apiUrl('/api/inversiones/activos'), {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setInversiones(data.inversiones || []);
      } else {
        console.error('Error al obtener inversiones');
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterInversiones = () => {
    const filtered = inversiones.filter(inversion =>
      inversion.comprobante.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inversion.monto.includes(searchTerm)
    );
    setFilteredInversiones(filtered);
    setCurrentPage(1);
  };

  const exportToExcel = () => {
    const ws = XLSX.utils.json_to_sheet(filteredInversiones.map(item => ({
      'ID': item.id,
      'Monto': item.monto,
      'Comprobante': item.comprobante,
      'Utilidad Restante': item.utilrestAjustado,
      'Estado': item.activo ? 'Activo' : 'Inactivo',
    })));
    
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Inversiones');
    XLSX.writeFile(wb, 'inversiones.xlsx');
  };

  const validateUtilidades = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(apiUrl('/api/inversiones/validar-comprobante'), {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();

        // Muestra una alerta de éxito con SweetAlert2
        Swal.fire({
          icon: 'success',
          title: 'Comprobantes validados',
          text: data.message || 'Las validaciones se realizaron correctamente.',
          confirmButtonText: 'Aceptar',
        }).then(() => {
          // Recarga la página después de que el usuario acepte la alerta
          window.location.reload();
        });
      } else {
        // Si no hay inversiones para validar, muestra la alerta
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'No se encontraron inversiones para validar.',
          confirmButtonText: 'Aceptar',
        });
      }
    } catch (error) {
      console.error('Error:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error de conexión',
        text: 'No se pudo conectar con el servidor.',
        confirmButtonText: 'Aceptar',
      });
    }
  };

  const handleAddUtilidad = async () => {
    try {
      const utilidad = (parseFloat(utilidadPorcentaje) / 100).toString(); // Convertir a porcentaje (de 10 a 0.1)

      const token = localStorage.getItem('token');
      const response = await fetch(apiUrl('/api/inversiones/validar'), {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          utilidad: utilidad, // Enviar el porcentaje como 0.1
        }),
      });

      if (response.ok) {
        const data = await response.json();

        Swal.fire({
          icon: 'success',
          title: 'Utilidad agregada',
          text: 'La utilidad se agregó correctamente.',
          confirmButtonText: 'Aceptar',
        }).then(() => {
          setIsUtilidadModalOpen(false);
          window.location.reload();
        });
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'Hubo un error al agregar la utilidad.',
          confirmButtonText: 'Aceptar',
        });
      }
    } catch (error) {
      console.error('Error:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error de conexión',
        text: 'No se pudo conectar con el servidor.',
        confirmButtonText: 'Aceptar',
      });
    }
  };

  // Cálculos de paginación
  const totalPages = Math.ceil(filteredInversiones.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentItems = filteredInversiones.slice(startIndex, endIndex);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleViewComprobante = (comprobante: string) => {
    setSelectedComprobante(comprobante);
    setIsProofModalOpen(true);
  };

  if (loading) {
    return (
      <OrganizationLayout title="Inversiones Activas">
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p>Cargando...</p>
          </div>
        </div>
      </OrganizationLayout>
    );
  }

  return (
    <OrganizationLayout title="Administración de Inversiones">
      <div className="p-6 space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              Gestión de Inversiones Activas
              <div className="flex items-center gap-2">
                <Button onClick={exportToExcel} className="flex items-center gap-2">
                  <Download className="w-4 h-4" />
                  Exportar Excel
                </Button>
                <Button onClick={validateUtilidades} className="flex items-center gap-2">
                  Validar Utilidades
                </Button>
                <Button onClick={() => setIsUtilidadModalOpen(true)} className="flex items-center gap-2">
                  Agregar Utilidad
                </Button>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="mb-6">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar por monto o comprobante..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <div className="border rounded-lg">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Monto</TableHead>
                    <TableHead>Comprobante</TableHead>
                    <TableHead>Utilidad Restante</TableHead>
                    <TableHead>Estado</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {currentItems.length > 0 ? (
                    currentItems.map((inversion) => (
                      <TableRow key={inversion.id}>
                        <TableCell>{inversion.id}</TableCell>
                        <TableCell>${inversion.monto}</TableCell>
                        <TableCell>
                          {inversion.comprobante ? (
                            <Button
                              variant="link"
                              onClick={() => handleViewComprobante(inversion.comprobante)}
                              className="text-blue-600 hover:text-blue-800"
                            >
                              Ver archivo
                            </Button>
                          ) : (
                            <span className="text-red-600">Sin comprobante</span>
                          )}
                        </TableCell>
                        <TableCell>{inversion.utilrestAjustado}</TableCell>
                        <TableCell>{inversion.activo ? 'Activo' : 'Inactivo'}</TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                        No se encontraron inversiones activas
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>

            {totalPages > 1 && (
              <div className="mt-6 flex justify-center">
                <Pagination>
                  <PaginationContent>
                    <PaginationItem>
                      <PaginationPrevious
                        onClick={() => currentPage > 1 && handlePageChange(currentPage - 1)}
                        className={currentPage === 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                      />
                    </PaginationItem>

                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                      <PaginationItem key={page}>
                        <PaginationLink
                          onClick={() => handlePageChange(page)}
                          isActive={page === currentPage}
                          className="cursor-pointer"
                        >
                          {page}
                        </PaginationLink>
                      </PaginationItem>
                    ))}

                    <PaginationItem>
                      <PaginationNext
                        onClick={() => currentPage < totalPages && handlePageChange(currentPage + 1)}
                        className={currentPage === totalPages ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                      />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              </div>
            )}

            <div className="mt-4 text-sm text-muted-foreground text-center">
              Mostrando {startIndex + 1} a {Math.min(endIndex, filteredInversiones.length)} de {filteredInversiones.length} inversiones
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Modal para agregar utilidad */}
      <Dialog open={isUtilidadModalOpen} onOpenChange={setIsUtilidadModalOpen}>
  <DialogContent className="sm:max-w-md">
    <DialogHeader>
      <DialogTitle>Agregar Utilidad</DialogTitle>
      <Button
        className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none"
        onClick={() => setIsUtilidadModalOpen(false)}
        variant="ghost"
        size="sm"
      >
        <X className="h-4 w-4" />
        <span className="sr-only">Cerrar</span>
      </Button>
    </DialogHeader>
    
    <div className="flex flex-col items-center space-y-4">
      <div className="space-y-2 w-full">
        <Input
          type="number"
          placeholder="Porcentaje de utilidad (Ej: 10 para 10%)"
          value={utilidadPorcentaje}
          onChange={(e) => setUtilidadPorcentaje(e.target.value)}
          className="w-full"
        />
      </div>
      <Button onClick={handleAddUtilidad} className="w-full mt-4">
        Agregar Utilidad
      </Button>
    </div>
  </DialogContent>
</Dialog>

      {/* Modal para mostrar comprobante */}
      <Dialog open={isProofModalOpen} onOpenChange={setIsProofModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Comprobante</DialogTitle>
            <Button
              className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none"
              onClick={() => setIsProofModalOpen(false)}
              variant="ghost"
              size="sm"
            >
              <X className="h-4 w-4" />
              <span className="sr-only">Cerrar</span>
            </Button>
          </DialogHeader>
          
          <div className="flex flex-col items-center space-y-4">
            <div className="bg-gray-50 p-4 rounded-lg border w-full">
              {selectedComprobante ? (
                <img 
                  src={apiUrl(`/${selectedComprobante.replace(/\\/g, '/')}`)}
                  alt="Comprobante de pago" 
                  className="w-full h-auto max-h-96 object-contain rounded"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.style.display = 'none';
                    const parent = target.parentElement;
                    if (parent) {
                      parent.innerHTML = '<div class="flex flex-col items-center justify-center h-32"><File class="w-16 h-16 text-gray-400 mb-2" /><span class="text-gray-500">Archivo no disponible</span></div>';
                    }
                  }}
                />
              ) : (
                <div className="flex flex-col items-center justify-center h-32">
                  <File className="w-16 h-16 text-gray-400 mb-2" />
                  <span className="text-gray-500">No hay comprobante disponible</span>
                </div>
              )}
            </div>
            
            <Button 
              onClick={() => setIsProofModalOpen(false)}
              className="w-full"
            >
              Cerrar
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </OrganizationLayout>
  );
};

export default UtilAdmin;
