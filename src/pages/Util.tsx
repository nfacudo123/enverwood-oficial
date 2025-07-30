import React, { useState, useEffect } from 'react';
import { OrganizationLayout } from '@/components/OrganizationLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Search, Download } from 'lucide-react';
import * as XLSX from 'xlsx';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

interface Utilidad {
  id: number;
  usid: number;
  val_utilidad: string;
  fecha: string;
  name: string;
  email: string;
}

const Util: React.FC = () => {
  const [utilidades, setUtilidades] = useState<Utilidad[]>([]);
  const [filteredUtilidades, setFilteredUtilidades] = useState<Utilidad[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const itemsPerPage = 10;

  useEffect(() => {
    fetchUtilidades();
  }, []);

  useEffect(() => {
    filterUtilidades();
  }, [utilidades, searchTerm]);

  const fetchUtilidades = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const idUser = parseInt(localStorage.getItem('idUser') || '0');
      
      const response = await fetch('http://localhost:4000/api/inversiones/utilidades', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        // Filtrar solo las utilidades donde usid coincida con el usuario conectado
        const utilidadesUsuario = (data.utilidades || []).filter((utilidad: Utilidad) => 
          utilidad.usid === idUser
        );
        setUtilidades(utilidadesUsuario);
      } else {
        console.error('Error al obtener utilidades del usuario');
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterUtilidades = () => {
    const filtered = utilidades.filter(utilidad =>
      utilidad.val_utilidad.includes(searchTerm) ||
      new Date(utilidad.fecha).toLocaleDateString().includes(searchTerm)
    );
    setFilteredUtilidades(filtered);
    setCurrentPage(1);
  };

  const exportToExcel = () => {
    const ws = XLSX.utils.json_to_sheet(filteredUtilidades.map(item => ({
      'ID': item.id,
      'Valor Utilidad': item.val_utilidad,
      'Fecha': new Date(item.fecha).toLocaleDateString()
    })));
    
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Mis Utilidades');
    XLSX.writeFile(wb, 'mis_utilidades.xlsx');
  };

  // Cálculos de paginación
  const totalPages = Math.ceil(filteredUtilidades.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentItems = filteredUtilidades.slice(startIndex, endIndex);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  if (loading) {
    return (
      <OrganizationLayout title="Mis Utilidades">
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
            <p className="mt-4 text-muted-foreground">Cargando mis utilidades...</p>
          </div>
        </div>
      </OrganizationLayout>
    );
  }

  return (
    <OrganizationLayout title="Mis Utilidades">
      <div className="p-6 space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              Utilidades Usuario
              <Button onClick={exportToExcel} className="flex items-center gap-2">
                <Download className="w-4 h-4" />
                Exportar Excel
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="mb-6">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar por valor o fecha..."
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
                    <TableHead>Valor Utilidad</TableHead>
                    <TableHead>Fecha</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {currentItems.length > 0 ? (
                    currentItems.map((utilidad) => (
                      <TableRow key={utilidad.id}>
                        <TableCell>{utilidad.id}</TableCell>
                        <TableCell className="text-green-600 font-semibold">
                          ${parseFloat(utilidad.val_utilidad).toFixed(2)}
                        </TableCell>
                        <TableCell>
                          {new Date(utilidad.fecha).toLocaleDateString()}
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={3} className="text-center py-8 text-muted-foreground">
                        No tienes utilidades registradas
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
              Mostrando {startIndex + 1} a {Math.min(endIndex, filteredUtilidades.length)} de {filteredUtilidades.length} utilidades
            </div>
          </CardContent>
        </Card>
      </div>
    </OrganizationLayout>
  );
};

export default Util;