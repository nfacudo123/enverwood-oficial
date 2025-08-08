import React, { useState, useEffect } from 'react';
import { OrganizationLayout } from "@/components/OrganizationLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import { Upload, Leaf, Check, File, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiUrl } from '@/lib/config';

interface Inversion {
  id: number;
  usuario_id: number;
  monto: number;
  activo: boolean;
  fecha_creacion: string;
  creado_en: string;
  comprobante?: string;
}

interface PaymentMethod {
  id: number;
  titulo: string;
  img_qr: string;
  dato: string;
  opdolar: string;
  converdolar: string;
}

export default function Meminverso() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [inversion, setInversion] = useState<Inversion | null>(null);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [loading, setLoading] = useState(true);
  const [purchasing, setPurchasing] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [montoInversion, setMontoInversion] = useState<string>('');
  const [isProofModalOpen, setIsProofModalOpen] = useState(false);
  const { toast } = useToast();

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  const fetchPaymentMethods = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(apiUrl('/api/metodo_pago'), {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setPaymentMethods(data);
      }
    } catch (error) {
      console.error('Error fetching payment methods:', error);
    }
  };

  const checkUserInvestment = async () => {
    try {
      const token = localStorage.getItem('token');
      const userId = localStorage.getItem('idUser');
      
      if (!token || !userId) {
        setLoading(false);
        return;
      }

      const response = await fetch(apiUrl(`/api/inversiones`), {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        console.log('Inversiones data:', data);
        console.log('Current user ID:', userId);
        
        // Buscar inversión que coincida con el usuario_id actual
        const userInvestment = data.find((investment: any) => 
          investment.usuario_id === parseInt(userId)
        );
        
        console.log('User investment found:', userInvestment);
        setInversion(userInvestment || null);
      } else if (response.status === 404) {
        // No investment found
        setInversion(null);
      }
    } catch (error) {
      console.error('Error checking investment:', error);
      setInversion(null);
    } finally {
      setLoading(false);
    }
  };

  const handlePurchase = async () => {
    const monto = parseFloat(montoInversion);
    
    if (!monto || monto <= 0) {
      toast({
        title: "Error",
        description: "La inversión tiene que ser mayor a cero",
        variant: "destructive",
      });
      return;
    }

    setPurchasing(true);
    try {
      const token = localStorage.getItem('token');
      const userId = localStorage.getItem('idUser');
      
      if (!token || !userId) {
        toast({
          title: "Error",
          description: "No se encontró información de usuario",
          variant: "destructive",
        });
        return;
      }

      const response = await fetch(apiUrl('/api/inversiones'), {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          usuario_id: parseInt(userId),
          monto: monto
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setInversion(data);
        setMontoInversion('');
        toast({
          title: "¡Compra exitosa!",
          description: "Tu membresía InvertGold ha sido adquirida correctamente",
        });
      } else {
        const errorData = await response.json();
        toast({
          title: "Error en la compra",
          description: errorData.message || "Error al procesar la compra",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error purchasing membership:', error);
      toast({
        title: "Error",
        description: "Error de conexión al servidor",
        variant: "destructive",
      });
    } finally {
      setPurchasing(false);
    }
  };

  const handleDelete = async () => {
    if (!inversion) return;
    
    setDeleting(true);
    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        toast({
          title: "Error",
          description: "No se encontró información de usuario",
          variant: "destructive",
        });
        return;
      }

      const response = await fetch(apiUrl(`/api/inversiones/${inversion.id}`), {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        setInversion(null);
        toast({
          title: "Eliminado",
          description: "La inversión ha sido eliminada correctamente",
        });
      } else {
        const errorData = await response.json();
        toast({
          title: "Error",
          description: errorData.message || "Error al eliminar la inversión",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error deleting investment:', error);
      toast({
        title: "Error",
        description: "Error de conexión al servidor",
        variant: "destructive",
      });
    } finally {
      setDeleting(false);
    }
  };

  const handleUploadProof = async () => {
    if (!selectedFile || !inversion) {
      toast({
        title: "Error",
        description: "Por favor selecciona un archivo",
        variant: "destructive",
      });
      return;
    }

    setUploading(true);
    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        toast({
          title: "Error",
          description: "No se encontró información de usuario",
          variant: "destructive",
        });
        return;
      }

      const formData = new FormData();
      formData.append('comprobante', selectedFile);

      const response = await fetch(apiUrl(`/api/inversiones/comprobante/${inversion.id}`), {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        setSelectedFile(null);
        
        // Limpiar el input file
        const fileInput = document.getElementById('comprobante') as HTMLInputElement;
        if (fileInput) {
          fileInput.value = '';
        }
        
        toast({
          title: "¡Comprobante subido!",
          description: "Tu comprobante ha sido enviado correctamente",
        });

        // Recargar los datos de la inversión para mostrar el comprobante actualizado
        await checkUserInvestment();
      } else {
        const errorData = await response.json();
        toast({
          title: "Error al subir comprobante",
          description: errorData.message || "Error al subir el archivo",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error uploading proof:', error);
      toast({
        title: "Error",
        description: "Error de conexión al servidor",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  useEffect(() => {
    checkUserInvestment();
    fetchPaymentMethods();
  }, []);

  // Función para extraer el nombre del archivo de la ruta completa
  const getFileName = (filePath: string) => {
    if (filePath && filePath.includes('/')) {
      // Extraer solo el nombre del archivo de la ruta 'soportes/nombre_archivo'
      return filePath.split('/').pop() || filePath;
    }
    return filePath;
  };

  // Mostrar botón de compra si no existe inversión para este usuario o si no tiene comprobante
  const shouldShowPurchaseButton = !inversion || !inversion.comprobante;

  if (loading) {
    return (
      <OrganizationLayout title="Comprar membresía InvertGold">
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Cargando...</p>
          </div>
        </div>
      </OrganizationLayout>
    );
  }

  return (
    <OrganizationLayout title="Comprar membresía InvertGold">
      <div className="flex-1 space-y-6 p-4 md:p-8">
        {shouldShowPurchaseButton ? (
          <>
            {/* Membership Card */}
            <Card className="bg-gradient-to-br from-gray-800 to-gray-900 text-white">
              <CardContent className="p-8">
                <div className="flex flex-col items-center space-y-6">
                  <h2 className="text-2xl font-bold">Membresía InvertGold</h2>
                  <div className="flex items-center justify-center">
                    <Leaf className="w-24 h-24 text-green-400" />
                  </div>
                  
                  <div className="w-full max-w-md space-y-4">
                    <Label htmlFor="monto" className="text-white text-lg">
                      Monto de inversión (USD)
                    </Label>
                    <Input
                      id="monto"
                      type="number"
                      min="1"
                      step="0.01"
                      placeholder="Ingresa el monto a invertir"
                      value={montoInversion}
                      onChange={(e) => setMontoInversion(e.target.value)}
                      className="bg-white text-gray-900 text-center text-lg"
                    />
                  </div>
                  
                  <Button 
                    onClick={handlePurchase}
                    disabled={purchasing}
                    className="bg-transparent border-2 border-white text-white hover:bg-white hover:text-gray-900 px-16 py-3 text-lg font-semibold rounded-lg transition-colors"
                  >
                    {purchasing ? "PROCESANDO..." : "COMPRAR"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </>
        ) : (
          <>
            {/* Información de compra */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-800">
                Para realizar la compra, debes Escanear el código QR y enviar el monto solicitado al siguiente QR de USDT que se encuentra en pantalla. Una vez enviado, toma una captura de pantalla de la transacción y agrega tu comprobante. La compra tardará unos momentos en ser validada.
              </p>
            </div>

            {/* Payment Methods Section */}
            <Card>
              <CardContent className="p-6">
                <div className="grid grid-cols-2 gap-4">
                  {paymentMethods.map((method) => (
                    <div key={method.id} className="flex flex-col items-center space-y-2 p-4 border rounded-lg">
                      <h3 className="font-semibold text-lg">{method.titulo}</h3>
                      <div className="bg-white p-2 rounded-lg border">
                        <img 
                          src={apiUrl(`/${method.img_qr.replace(/\\/g, '/')}`)} 
                          alt={`QR Code ${method.titulo}`} 
                          className="w-32 h-32 object-contain"
                        />
                      </div>
                      <p className="text-sm text-gray-600 font-mono text-center break-all">
                        {method.dato}
                      </p>
                      {method.opdolar === '1.00' && inversion && (
                        <div className="text-center mt-2 p-2 bg-blue-50 rounded-lg border">
                          <p className="text-sm font-medium text-blue-800">
                            Total en COP: ${(parseFloat(method.converdolar) * inversion.monto).toLocaleString('es-CO')}
                          </p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Upload Section */}
            <Card>
              <CardContent className="p-6">
                <div className="space-y-4">
                  <p className="text-sm text-gray-600">
                    Por favor debes enviar tu comprobante para continuar con el proceso.
                  </p>
                  
                  <div className="space-y-2">
                    <Label htmlFor="comprobante">Subir imagen</Label>
                    <div className="flex items-center gap-4">
                      <Input
                        id="comprobante"
                        type="file"
                        accept="image/*"
                        onChange={handleFileChange}
                        className="flex-1"
                      />
                      <span className="text-sm text-gray-500">
                        {selectedFile ? selectedFile.name : "Ningún archivo seleccionado"}
                      </span>
                    </div>
                  </div>

                  <Button 
                    onClick={handleUploadProof}
                    disabled={uploading || !selectedFile}
                    className="bg-green-500 hover:bg-green-600 text-white"
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    {uploading ? "Subiendo..." : "Agregar Comprobante"}
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Tabla de compras */}
            <Card>
              <CardContent className="p-6">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="text-center">Monto</TableHead>
                        <TableHead className="text-center">Fecha compra</TableHead>
                        <TableHead className="text-center">Comprobante</TableHead>
                        <TableHead className="text-center">Estado</TableHead>
                        <TableHead className="text-center">Acción</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      <TableRow>
                        <TableCell className="text-center">${inversion?.monto}</TableCell>
                        <TableCell className="text-center">
                          {inversion?.creado_en ? new Date(inversion.creado_en).toLocaleString() : ''}
                        </TableCell>
                        <TableCell className="text-center">
                          {inversion?.comprobante ? (
                            <div className="flex items-center justify-center gap-2">
                              <File className="w-4 h-4 text-green-600" />
                              <button
                                onClick={() => setIsProofModalOpen(true)}
                                className="text-green-600 hover:text-green-800 hover:underline cursor-pointer"
                              >
                                Ver archivo
                              </button>
                            </div>
                          ) : (
                            <span className="text-red-600">Sin comprobante</span>
                          )}
                        </TableCell>
                        <TableCell className="text-center">
                          {inversion?.activo ? 'Realizado' : 'Pendiente'}
                        </TableCell>
                        <TableCell className="text-center">
                          {!inversion?.activo ? (
                            <Button 
                              variant="destructive" 
                              size="sm"
                              className="bg-red-500 hover:bg-red-600"
                              onClick={handleDelete}
                              disabled={deleting}
                            >
                              {deleting ? "Eliminando..." : "Borrar"}
                            </Button>
                          ) : (
                            <div className="flex justify-center">
                              <Check className="w-5 h-5 text-green-500" />
                            </div>
                          )}
                        </TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </>
        )}
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
              {inversion?.comprobante ? (
                <img 
                  src={apiUrl(`/${getFileName(inversion.comprobante)}`)}
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
}
