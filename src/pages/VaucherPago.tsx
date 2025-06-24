
import React from 'react';
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { AppSidebar } from '@/components/AppSidebar';
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const VaucherPago = () => {
  // Datos de ejemplo
  const compras = [
    {
      id: 60,
      idCompra: 60,
      nombrePaquete: "",
      montoCompra: "$50",
      verComprobante: "Sin comprobante",
      fechaCompra: "2025-05-24 19:35:38",
      estado: "Pendiente"
    }
  ];

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AppSidebar />
        <SidebarInset className="flex-1">
          <div className="p-6">
            <div className="mb-6">
              <h1 className="text-2xl font-bold text-gray-900">Mis compras</h1>
            </div>
            
            <div className="bg-white rounded-lg border border-gray-200">
              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-50">
                    <TableHead className="font-medium text-gray-900">#</TableHead>
                    <TableHead className="font-medium text-gray-900">Id compra</TableHead>
                    <TableHead className="font-medium text-gray-900">Nombre del Paquete</TableHead>
                    <TableHead className="font-medium text-gray-900">Monto de compra</TableHead>
                    <TableHead className="font-medium text-gray-900">Ver Comprobante</TableHead>
                    <TableHead className="font-medium text-gray-900">Fecha compra</TableHead>
                    <TableHead className="font-medium text-gray-900">Estado</TableHead>
                    <TableHead className="font-medium text-gray-900">Borrar</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {compras.map((compra, index) => (
                    <TableRow key={compra.id}>
                      <TableCell>{index + 1}</TableCell>
                      <TableCell>{compra.idCompra}</TableCell>
                      <TableCell>{compra.nombrePaquete}</TableCell>
                      <TableCell>{compra.montoCompra}</TableCell>
                      <TableCell className="text-red-600">{compra.verComprobante}</TableCell>
                      <TableCell>{compra.fechaCompra}</TableCell>
                      <TableCell>{compra.estado}</TableCell>
                      <TableCell>
                        <Button 
                          variant="destructive" 
                          size="sm"
                          className="bg-red-500 hover:bg-red-600 text-white"
                        >
                          Borrar
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
};

export default VaucherPago;
