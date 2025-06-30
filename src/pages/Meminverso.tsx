import React, { useState, useEffect } from 'react';
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
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
import { Upload } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Inversion {
  id: number;
  usuario_id: number;
  monto: number;
  activo: boolean;
  fecha_creacion: string;
}

export default function Meminverso() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [inversion, setInversion] = useState<Inversion | null>(null);
  const [loading, setLoading] = useState(true);
  const [purchasing, setPurchasing] = useState(false);
  const { toast } = useToast();

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
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

      const response = await fetch(`http://localhost:4000/api/inversiones`, {
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

      const response = await fetch('http://localhost:4000/api/inversiones', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          usuario_id: parseInt(userId),
          monto: 100
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setInversion(data);
        toast({
          title: "¡Compra exitosa!",
          description: "Tu membresía G-Profits ha sido adquirida correctamente",
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

  useEffect(() => {
    checkUserInvestment();
  }, []);

  const compras = [
    {
      id: 1,
      idCompra: "60",
      precioCompra: "$50",
      fechaCompra: "2025-05-24 19:36:48",
      comprobante: "Sin comprobante",
      estado: "Pendiente",
    }
  ];

  // Mostrar botón de compra si no existe inversión para este usuario
  const shouldShowPurchaseButton = !inversion;

  if (loading) {
    return (
      <SidebarProvider>
        <div className="min-h-screen flex w-full">
          <AppSidebar />
          <SidebarInset className="flex-1">
            <div className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
              <SidebarTrigger className="-ml-1" />
              <h1 className="text-xl font-semibold text-gray-900">
                Comprar membresía G-Profits
              </h1>
            </div>
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
                <p className="mt-4 text-gray-600">Cargando...</p>
              </div>
            </div>
          </SidebarInset>
        </div>
      </SidebarProvider>
    );
  }

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AppSidebar />
        <SidebarInset className="flex-1">
          <div className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
            <SidebarTrigger className="-ml-1" />
            <h1 className="text-xl font-semibold text-gray-900">
              Comprar membresía G-Profits
            </h1>
          </div>

          <div className="flex-1 space-y-6 p-4 md:p-8">
            {shouldShowPurchaseButton ? (
              <>
                {/* Membership Card */}
                <Card className="bg-gradient-to-br from-gray-800 to-gray-900 text-white">
                  <CardContent className="p-8">
                    <div className="flex flex-col items-center space-y-6">
                      <h2 className="text-2xl font-bold">Membresía G-Profits</h2>
                      <div className="flex items-center justify-center">
                        <img 
                          src="/lovable-uploads/d11e2623-8abd-4cfb-a98f-3740f3dae6de.png" 
                          alt="G-Profits Logo" 
                          className="w-24 h-24 object-contain"
                        />
                      </div>
                      <p className="text-xl font-semibold">Valor: $100 USD</p>
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

                {/* QR Code Section */}
                <Card>
                  <CardContent className="p-6">
                    <div className="flex flex-col items-center space-y-4">
                      <div className="bg-white p-4 rounded-lg border">
                        <img 
                          src="/lovable-uploads/be1d0da5-3efa-4997-a9d3-41fc85ed4ad7.png" 
                          alt="QR Code" 
                          className="w-64 h-64 object-contain"
                        />
                      </div>
                      <p className="text-sm text-gray-600 font-mono">
                        USDT: TLnR8w2ez79LFLCUfnc7qEUCNDNWxUefx
                      </p>
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

                      <Button className="bg-green-500 hover:bg-green-600 text-white">
                        <Upload className="w-4 h-4 mr-2" />
                        Agregar Comprobante
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
                            <TableHead className="text-center">#</TableHead>
                            <TableHead className="text-center">Id compra</TableHead>
                            <TableHead className="text-center">Precio compra</TableHead>
                            <TableHead className="text-center">Fecha compra</TableHead>
                            <TableHead className="text-center">Comprobante</TableHead>
                            <TableHead className="text-center">Estado</TableHead>
                            <TableHead className="text-center">Borrar</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {compras.map((compra, index) => (
                            <TableRow key={compra.id}>
                              <TableCell className="text-center">{index + 1}</TableCell>
                              <TableCell className="text-center">{compra.idCompra}</TableCell>
                              <TableCell className="text-center">{compra.precioCompra}</TableCell>
                              <TableCell className="text-center">{compra.fechaCompra}</TableCell>
                              <TableCell className="text-center text-red-600">{compra.comprobante}</TableCell>
                              <TableCell className="text-center">{compra.estado}</TableCell>
                              <TableCell className="text-center">
                                <Button 
                                  variant="destructive" 
                                  size="sm"
                                  className="bg-red-500 hover:bg-red-600"
                                >
                                  Borrar
                                </Button>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  </CardContent>
                </Card>
              </>
            )}
          </div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
