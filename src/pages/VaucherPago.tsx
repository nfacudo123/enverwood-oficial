import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { File, X } from "lucide-react";
import { OrganizationLayout } from '@/components/OrganizationLayout';
import { apiUrl } from '@/lib/config';

interface Inversion {
  id: number;
  usuario_id: number;
  monto: string;
  activo: boolean;
  fecha_creacion: string;
  creado_en: string;
  comprobante?: string;
}

const getFileName = (filePath: string) => {
  if (filePath && filePath.includes('/')) {
    return filePath.split('/').pop() || filePath;
  }
  return filePath;
};

const VaucherPago = () => {
  const [inversiones, setInversiones] = useState<Inversion[]>([]);
  const [loading, setLoading] = useState(true);
  const [isProofModalOpen, setIsProofModalOpen] = useState(false);
  const [selectedComprobante, setSelectedComprobante] = useState<string>('');

  const fetchInversiones = async () => {
    try {
      const token = localStorage.getItem('token');
      const idUser = localStorage.getItem('idUser');
      
      if (!token || !idUser) {
        setLoading(false);
        return;
      }

      const response = await fetch(apiUrl('/api/inversiones'), {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        console.log('Inversiones data:', data);
        // Filtrar inversiones por usuario actual
        const currentUserId = parseInt(idUser);
        const userInversiones = (data.inversiones || []).filter(
          (inversion: Inversion) => inversion.usuario_id === currentUserId
        );
        setInversiones(userInversiones);
      } else {
        console.error('Error fetching inversiones:', response.status);
        setInversiones([]);
      }
    } catch (error) {
      console.error('Error fetching inversiones:', error);
      setInversiones([]);
    } finally {
      setLoading(false);
    }
  };

  const handleViewComprobante = (comprobante: string) => {
    setSelectedComprobante(comprobante);
    setIsProofModalOpen(true);
  };

  useEffect(() => {
    fetchInversiones();
  }, []);

  if (loading) {
    return (
      <OrganizationLayout title="Mis Inversiones">
        <div className="p-6 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p>Cargando...</p>
          </div>
        </div>
      </OrganizationLayout>
    );
  }

  return (
    <OrganizationLayout title="Mis Inversiones">
      <div className="p-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Mis Inversiones</h1>
        </div>
        
        <div className="bg-white rounded-lg border border-gray-200">
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50">
                <TableHead className="font-medium text-gray-900">#</TableHead>
                <TableHead className="font-medium text-gray-900">Monto</TableHead>
                <TableHead className="font-medium text-gray-900">Fecha compra</TableHead>
                <TableHead className="font-medium text-gray-900">Comprobante</TableHead>
                <TableHead className="font-medium text-gray-900">Estado</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
  {inversiones.length > 0 ? (
    inversiones.map((inversion, index) => (
      <TableRow key={inversion.id}>
        <TableCell>{index + 1}</TableCell>
        <TableCell>${parseFloat(inversion.monto).toFixed(2)}</TableCell>
        <TableCell>{inversion.creado_en ? new Date(inversion.creado_en).toLocaleString() : ''}</TableCell>
        <TableCell className="text-center">
          {inversion.comprobante ? (
            <div className="flex items-center justify-center gap-2">
              <File className="w-4 h-4 text-green-600" />
              <button
                onClick={() => handleViewComprobante(inversion.comprobante!)}
                className="text-green-600 hover:text-green-800 hover:underline cursor-pointer"
              >
                Ver archivo
              </button>
            </div>
          ) : (
            <span className="text-red-600">Sin comprobante</span>
          )}
        </TableCell>
        <TableCell>{inversion.activo ? 'Realizado' : 'Pendiente'}</TableCell>
      </TableRow>
    ))
  ) : (
    <TableRow>
      <TableCell colSpan={5} className="text-center text-gray-500 py-8">
        No hay compras registradas
      </TableCell>
    </TableRow>
  )}
</TableBody>

          </Table>
        </div>
      </div>

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
                  src={apiUrl(`/${getFileName(selectedComprobante)}`)}
                  alt="Comprobante de pago" 
                  className="w-full h-auto max-h-96 object-contain rounded"
                  onError={(e) => {
                    // En caso de error al cargar la imagen, mostrar un ícono
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

export default VaucherPago;
