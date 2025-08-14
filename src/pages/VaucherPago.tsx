import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import { File, X, Upload } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
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
  total_utilrest: number;
  name: string;
  email: string;
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
  const [uploadingId, setUploadingId] = useState<number | null>(null);
  const { toast } = useToast();

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
        const userInversiones = data.filter(
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

  const handleUploadComprobante = async (inversionId: number, file: File) => {
    try {
      setUploadingId(inversionId);
      const token = localStorage.getItem('token');
      
      if (!token) {
        toast({
          title: "Error",
          description: "No se encontró token de autenticación",
          variant: "destructive",
        });
        return;
      }

      const formData = new FormData();
      formData.append('comprobante', file);

      const response = await fetch(apiUrl(`/api/inversiones/comprobante/${inversionId}`), {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });

      if (response.ok) {
        toast({
          title: "Éxito",
          description: "Comprobante subido correctamente",
        });
        // Recargar inversiones para mostrar el nuevo comprobante
        fetchInversiones();
      } else {
        throw new Error('Error al subir el comprobante');
      }
    } catch (error) {
      console.error('Error uploading comprobante:', error);
      toast({
        title: "Error",
        description: "No se pudo subir el comprobante",
        variant: "destructive",
      });
    } finally {
      setUploadingId(null);
    }
  };

  const handleFileChange = (inversionId: number, event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      handleUploadComprobante(inversionId, file);
    }
  };

  const handleDeleteComprobante = async (inversionId: number) => {
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

      const response = await fetch(apiUrl(`/api/inversiones/${inversionId}`), {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        toast({
          title: "Éxito",
          description: "Comprobante eliminado correctamente",
        });
        // Recargar inversiones
        fetchInversiones();
      } else {
        throw new Error('Error al eliminar el comprobante');
      }
    } catch (error) {
      console.error('Error deleting comprobante:', error);
      toast({
        title: "Error",
        description: "No se pudo eliminar el comprobante",
        variant: "destructive",
      });
    }
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
                <TableHead className="font-medium text-gray-900">Utilidad restante</TableHead>
                <TableHead className="font-medium text-gray-900">Estado</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
  {inversiones.length > 0 ? (
    inversiones.map((inversion, index) => (
      <TableRow key={`${inversion.id}-${index}`}>
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
              <Button
                variant="destructive"
                size="sm"
                onClick={() => handleDeleteComprobante(inversion.id)}
                className="ml-2"
              >
                <X className="w-4 h-4 mr-1" />
                Eliminar
              </Button>
            </div>
          ) : (
            <div className="flex items-center justify-center gap-2">
              <input
                type="file"
                id={`file-${inversion.id}`}
                accept="image/*,.pdf"
                onChange={(e) => handleFileChange(inversion.id, e)}
                className="hidden"
                disabled={uploadingId === inversion.id}
              />
              <Button
                variant="outline"
                size="sm"
                onClick={() => document.getElementById(`file-${inversion.id}`)?.click()}
                disabled={uploadingId === inversion.id}
                className="text-blue-600 border-blue-600 hover:bg-blue-50"
              >
                {uploadingId === inversion.id ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                ) : (
                  <>
                    <Upload className="w-4 h-4 mr-1" />
                    Subir
                  </>
                )}
              </Button>
            </div>
          )}
        </TableCell>
        <TableCell>${inversion.total_utilrest?.toFixed(2) || '0.00'}</TableCell>
        <TableCell>{inversion.activo ? 'Realizado' : 'Pendiente'}</TableCell>
      </TableRow>
    ))
  ) : (
    <TableRow>
      <TableCell colSpan={6} className="text-center text-gray-500 py-8">
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
