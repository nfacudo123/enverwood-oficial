import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Users, Search, Copy, FileSpreadsheet, FileText, Settings } from "lucide-react";
import { OrganizationLayout } from '@/components/OrganizationLayout';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

interface ReferidoFlat {
  id: number;
  name: string;
  apellidos: string;
  username: string;
  email: string;
  nivel: number;
  parent_id: number | null;
  directos: number;
  subordinados: number;
}

const Refes = () => {
  const [referidosList, setReferidosList] = useState<ReferidoFlat[]>([]);
  const [filteredList, setFilteredList] = useState<ReferidoFlat[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Función para aplanar el árbol de referidos
  const flattenReferidosTree = (node: any, currentUserId?: number): ReferidoFlat[] => {
    const result: ReferidoFlat[] = [];
    
    const processNode = (n: any, level: number = 0) => {
      // Incluir TODOS los nodos EXCEPTO el usuario actual
      const nodeId = n.id || n.usuario_id || n.user_id;
      if (nodeId !== currentUserId) {
        const directos = n.children ? n.children.length : 0;
        const subordinados = countAllSubordinates(n);
        
        result.push({
          id: nodeId || Math.random(),
          name: n.name || n.nombre || 'Usuario',
          apellidos: n.apellidos || n.apellido || n.last_name || '',
          username: n.username || n.usuario || n.email?.split('@')[0] || 'usuario',
          email: n.email || '',
          nivel: level,
          parent_id: n.parent_id || n.sponsor_id || null,
          directos,
          subordinados
        });
      }
      
      // Procesar hijos recursivamente
      if (n.children && Array.isArray(n.children)) {
        n.children.forEach((child: any) => processNode(child, level + 1));
      }
    };

    processNode(node);
    return result;
  };

  // Función para contar todos los subordinados
  const countAllSubordinates = (node: any): number => {
    if (!node.children || !Array.isArray(node.children)) return 0;
    
    let count = node.children.length;
    node.children.forEach((child: any) => {
      count += countAllSubordinates(child);
    });
    
    return count;
  };

  // Función para obtener el ID del usuario actual
  const getCurrentUserId = (): number | null => {
    try {
      const userData = localStorage.getItem('user');
      if (userData) {
        const user = JSON.parse(userData);
        console.log('Usuario actual desde localStorage:', user);
        return user.id || user.usuario_id || user.user_id || null;
      }
      return null;
    } catch (error) {
      console.error('Error getting current user ID:', error);
      return null;
    }
  };

  // Función para procesar lista plana de referidos
  const processReferidosList = (referidosList: any[], currentUserId: number | null): ReferidoFlat[] => {
    return referidosList
      .filter(referido => {
        // Excluir SOLO el usuario actual - comparar todos los posibles IDs
        const referidoId = referido.id || referido.usuario_id || referido.user_id;
        const isCurrentUser = referidoId === currentUserId;
        console.log(`Comparando referido ID ${referidoId} con usuario actual ${currentUserId}: ${isCurrentUser ? 'EXCLUIR' : 'INCLUIR'}`);
        return !isCurrentUser; // Incluir todos EXCEPTO el usuario actual
      })
      .map(referido => ({
        id: referido.id || referido.usuario_id || referido.user_id || Math.random(),
        name: referido.name || referido.nombre || referido.first_name || 'Usuario',
        apellidos: referido.apellidos || referido.apellido || referido.last_name || '',
        username: referido.username || referido.usuario || referido.email?.split('@')[0] || 'usuario',
        email: referido.email || '',
        nivel: referido.nivel || referido.level || 0,
        parent_id: referido.parent_id || referido.sponsor_id || null,
        directos: referido.directos || referido.direct_count || 0,
        subordinados: referido.subordinados || referido.subordinate_count || 0
      }));
  };

  useEffect(() => {
    const fetchReferidos = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          setError('No hay token de autenticación');
          setIsLoading(false);
          return;
        }

        console.log('Obteniendo referidos...');
        const response = await fetch('http://localhost:4000/api/mis-referidos', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          throw new Error(`Error HTTP: ${response.status}`);
        }

        const data = await response.json();
        console.log('Respuesta completa del servidor:', data);

        const currentUserId = getCurrentUserId();
        console.log('ID del usuario actual:', currentUserId);
        
        let processedList: ReferidoFlat[] = [];

        // Procesar diferentes estructuras de respuesta
        if (data && typeof data === 'object') {
          // Caso 1: { success: true, data: { referidos: [...] } }
          if (data.success && data.data && data.data.referidos) {
            console.log('Procesando estructura success.data.referidos');
            processedList = processReferidosList(data.data.referidos, currentUserId);
          }
          // Caso 2: { referidos: [...] }
          else if (data.referidos && Array.isArray(data.referidos)) {
            console.log('Procesando estructura data.referidos');
            processedList = processReferidosList(data.referidos, currentUserId);
          }
          // Caso 3: Array directo
          else if (Array.isArray(data)) {
            console.log('Procesando array directo');
            processedList = processReferidosList(data, currentUserId);
          }
          // Caso 4: Estructura de árbol - necesita aplanar
          else if (data.usuario || data.user || data.data) {
            console.log('Procesando estructura de árbol');
            const treeData = data.usuario || data.user || data.data;
            processedList = flattenReferidosTree(treeData, currentUserId);
          }
        }

        console.log('Lista procesada de referidos:', processedList);
        setReferidosList(processedList);
        setFilteredList(processedList);
        setError(null);

      } catch (error) {
        console.error('Error al obtener referidos:', error);
        setError(`Error: ${error instanceof Error ? error.message : 'Error desconocido'}`);
        setReferidosList([]);
        setFilteredList([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchReferidos();
  }, []);

  // Filtrar por término de búsqueda
  useEffect(() => {
    if (!searchTerm) {
      setFilteredList(referidosList);
    } else {
      const filtered = referidosList.filter(referido =>
        referido.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
        referido.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        referido.apellidos.toLowerCase().includes(searchTerm.toLowerCase()) ||
        referido.email.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredList(filtered);
    }
    setCurrentPage(1); // Reset to first page when filtering
  }, [searchTerm, referidosList]);

  // Calcular elementos para la página actual
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentItems = filteredList.slice(startIndex, endIndex);
  const totalPages = Math.ceil(filteredList.length / itemsPerPage);

  const getInitials = (name: string, apellidos: string) => {
    const firstName = (name || '').charAt(0).toUpperCase();
    const lastName = (apellidos || '').charAt(0).toUpperCase();
    return firstName + lastName || 'U';
  };

  const getFullName = (name: string, apellidos: string) => {
    return `${name || ''} ${apellidos || ''}`.trim() || 'Usuario';
  };

  if (isLoading) {
    return (
      <OrganizationLayout title="Lista de Miembros">
        <div className="p-6 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p>Cargando lista de miembros...</p>
          </div>
        </div>
      </OrganizationLayout>
    );
  }

  if (error) {
    return (
      <OrganizationLayout title="Lista de Miembros">
        <div className="p-6 flex items-center justify-center">
          <div className="text-center">
            <p className="text-red-600 mb-4">Error: {error}</p>
            <Button onClick={() => window.location.reload()}>
              Reintentar
            </Button>
          </div>
        </div>
      </OrganizationLayout>
    );
  }

  return (
    <OrganizationLayout title="Lista de Miembros">
      <div className="p-6 space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              Mi comunidad de Referidos
            </CardTitle>
            
            {/* Controles superiores */}
            <div className="flex items-center justify-between gap-4 pt-4">
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm">
                  <Copy className="w-4 h-4 mr-2" />
                  Copy
                </Button>
                <Button variant="outline" size="sm">
                  <FileSpreadsheet className="w-4 h-4 mr-2" />
                  Excel
                </Button>
                <Button variant="outline" size="sm">
                  <FileText className="w-4 h-4 mr-2" />
                  PDF
                </Button>
                <Button variant="outline" size="sm">
                  <Settings className="w-4 h-4 mr-2" />
                  Column visibility
                </Button>
              </div>
              
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600">Search:</span>
                <Input
                  placeholder="Buscar..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-48"
                />
              </div>
            </div>
          </CardHeader>
          
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">#</TableHead>
                    <TableHead>Usuario</TableHead>
                    <TableHead>Nombre Completo</TableHead>
                    <TableHead>Correo</TableHead>
                    <TableHead className="text-center">Directos</TableHead>
                    <TableHead className="text-center">Subordinados</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {currentItems.length > 0 ? (
                    currentItems.map((referido, index) => (
                      <TableRow key={referido.id}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Avatar className="h-8 w-8">
                              <AvatarFallback className="bg-blue-500 text-white text-xs">
                                {getInitials(referido.name, referido.apellidos)}
                              </AvatarFallback>
                            </Avatar>
                            <span className="font-medium">{startIndex + index + 1}</span>
                          </div>
                        </TableCell>
                        <TableCell className="font-medium">{referido.username}</TableCell>
                        <TableCell>{getFullName(referido.name, referido.apellidos)}</TableCell>
                        <TableCell className="text-blue-600">{referido.email}</TableCell>
                        <TableCell className="text-center">{referido.directos}</TableCell>
                        <TableCell className="text-center">{referido.subordinados}</TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8">
                        <div className="text-gray-500">
                          {searchTerm ? 'No se encontraron resultados para la búsqueda' : 'No hay miembros para mostrar'}
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>

            {/* Paginación */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between mt-6">
                <p className="text-sm text-gray-600">
                  Mostrando {startIndex + 1} a {Math.min(endIndex, filteredList.length)} de {filteredList.length} resultados
                </p>
                
                <Pagination>
                  <PaginationContent>
                    <PaginationItem>
                      <PaginationPrevious 
                        onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
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
                        onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                        className={currentPage === totalPages ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                      />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </OrganizationLayout>
  );
};

export default Refes;
