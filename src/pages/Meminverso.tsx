
import React, { useState } from 'react';
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

export default function Meminverso() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
    }
  };

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
                      src="/lovable-uploads/9cb1b243-6083-4378-b9a5-de6b49b185b1.png" 
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
          </div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
