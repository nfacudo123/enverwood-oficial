
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { OrganizationLayout } from '@/components/OrganizationLayout';

const Material = () => {
  const [entriesPerPage, setEntriesPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [materialName, setMaterialName] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  return (
    <OrganizationLayout title="Recursos y ayudas">
      <div className="p-6">
        <div className="mb-6 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">Recursos y ayudas</h1>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-green-600 hover:bg-green-700 text-white">
                + Agregar Recurso
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle className="text-lg font-semibold">Agregar Recurso</DialogTitle>
                <hr className="mt-2" />
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nombre:</Label>
                  <Input
                    id="name"
                    value={materialName}
                    onChange={(e) => setMaterialName(e.target.value)}
                    className="w-full"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="file">Subir Archivo:</Label>
                  <div className="flex">
                    <Input
                      id="file"
                      type="file"
                      onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                      className="hidden"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      className="bg-gray-600 text-white hover:bg-gray-700"
                      onClick={() => document.getElementById('file')?.click()}
                    >
                      Seleccionar archivo
                    </Button>
                    <div className="ml-3 flex-1 flex items-center text-sm text-gray-500">
                      {selectedFile ? selectedFile.name : 'Ningún archivo seleccionado'}
                    </div>
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setIsDialogOpen(false);
                    setMaterialName('');
                    setSelectedFile(null);
                  }}
                  className="bg-gray-600 text-white hover:bg-gray-700"
                >
                  Cerrar
                </Button>
                <Button
                  type="button"
                  onClick={() => {
                    // Handle form submission here
                    console.log('Material name:', materialName);
                    console.log('Selected file:', selectedFile);
                    setIsDialogOpen(false);
                    setMaterialName('');
                    setSelectedFile(null);
                  }}
                  className="bg-green-600 hover:bg-green-700 text-white"
                >
                  Agregar
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
        
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Material</h2>
          </div>

          {/* Controls */}
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">Show</span>
              <Select value={entriesPerPage.toString()} onValueChange={(value) => setEntriesPerPage(Number(value))}>
                <SelectTrigger className="w-20 h-8">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="10">10</SelectItem>
                  <SelectItem value="25">25</SelectItem>
                  <SelectItem value="50">50</SelectItem>
                  <SelectItem value="100">100</SelectItem>
                </SelectContent>
              </Select>
              <span className="text-sm text-gray-600">entries</span>
            </div>
            
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">Search:</span>
              <Input
                placeholder=""
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-48 h-8"
              />
            </div>
          </div>

          {/* Table */}
          <div className="border border-gray-200 rounded">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50">
                  <TableHead className="font-medium text-gray-900 cursor-pointer">
                    # <span className="text-gray-400">↕</span>
                  </TableHead>
                  <TableHead className="font-medium text-gray-900 cursor-pointer">
                    Nombre <span className="text-gray-400">↕</span>
                  </TableHead>
                  <TableHead className="font-medium text-gray-900 cursor-pointer">
                    Ver <span className="text-gray-400">↕</span>
                  </TableHead>
                  <TableHead className="font-medium text-gray-900 cursor-pointer">
                    Documento <span className="text-gray-400">↕</span>
                  </TableHead>
                  <TableHead className="font-medium text-gray-900 cursor-pointer">
                    Eliminar <span className="text-gray-400">↕</span>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 text-gray-500">
                    No data available in table
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>

          {/* Pagination info and controls */}
          <div className="flex justify-between items-center mt-4">
            <span className="text-sm text-gray-600">
              Showing 0 to 0 of 0 entries
            </span>
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                disabled
                className="bg-gray-600 text-white border-gray-600"
              >
                Previous
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                disabled
                className="bg-gray-600 text-white border-gray-600"
              >
                Next
              </Button>
            </div>
          </div>
        </div>
      </div>
    </OrganizationLayout>
  );
};

export default Material;
