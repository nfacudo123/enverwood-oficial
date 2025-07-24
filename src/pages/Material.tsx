
import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
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
  const [isLoading, setIsLoading] = useState(false);
  const [resources, setResources] = useState<any[]>([]);
  const [isLoadingResources, setIsLoadingResources] = useState(false);
  const { toast } = useToast();

  // Check if current user is admin
  const isAdmin = localStorage.getItem('idUser') === '1';

  const fetchResources = async () => {
    setIsLoadingResources(true);
    try {
      console.log('Fetching resources from API...');
      
      // Get bearer token from localStorage or provide default
      const token = localStorage.getItem('token');
      console.log('Token from localStorage:', token ? 'Token exists' : 'No token found');
      
      const authToken = localStorage.getItem('token');
      console.log('Using auth token:', authToken);
      
      const response = await fetch('http://localhost:4000/api/recursos', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json',
        },
      });
      
      console.log('API response status:', response.status);
      console.log('API response headers:', response.headers);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('API Error Response:', errorText);
        throw new Error(`Error al cargar los recursos: ${response.status} - ${errorText}`);
      }
      
      const data = await response.json();
      console.log('API response data:', data);
      
      // Extract the recursos array from the response object
      const resourcesArray = data.recursos || [];
      console.log('Resources array:', resourcesArray);
      console.log('Is array:', Array.isArray(resourcesArray));
      
      setResources(resourcesArray);
    } catch (error) {
      console.error('Error fetching resources:', error);
      setResources([]); // Set empty array on error
      toast({
        title: "Error",
        description: `Error al cargar los recursos: ${error.message}`,
        variant: "destructive",
      });
    } finally {
      setIsLoadingResources(false);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      const token = localStorage.getItem('token');
      
      const response = await fetch(`http://localhost:4000/api/recursos/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Error al eliminar el recurso');
      }

      toast({
        title: "Éxito",
        description: "Recurso eliminado correctamente",
      });

      fetchResources(); // Refresh the list
    } catch (error) {
      toast({
        title: "Error",
        description: "Error al eliminar el recurso",
        variant: "destructive",
      });
    }
  };

  const handleViewDocument = (id: number) => {
    const token = localStorage.getItem('authToken');
    // For opening a document in a new tab with authentication, we need to create a temporary link
    // or handle the authentication differently since we can't add headers to window.open
    const url = `http://localhost:4000/api/recursos/${id}`;
    window.open(url, '_blank');
  };

  // Fetch resources on component mount
  useEffect(() => {
    fetchResources();
  }, []);

  const handleSubmit = async () => {
    if (!materialName.trim()) {
      toast({
        title: "Error",
        description: "El nombre es requerido",
        variant: "destructive",
      });
      return;
    }

    if (!selectedFile) {
      toast({
        title: "Error",
        description: "Debe seleccionar un archivo",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    
    try {
      const token = localStorage.getItem('authToken');
      
      const formData = new FormData();
      formData.append('nombre', materialName);
      formData.append('archivo', selectedFile);

      const response = await fetch('http://localhost:4000/api/recursos/subir', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Error al subir el recurso');
      }

      toast({
        title: "Éxito",
        description: "Recurso agregado correctamente",
      });

      setIsDialogOpen(false);
      setMaterialName('');
      setSelectedFile(null);
      fetchResources(); // Refresh the list
    } catch (error) {
      toast({
        title: "Error",
        description: "Error al agregar el recurso",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <OrganizationLayout title="Recursos y ayudas">
      <div className="p-6">
        <div className="mb-6 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">Recursos y ayudas</h1>
          {isAdmin && (
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
                  onClick={handleSubmit}
                  disabled={isLoading}
                  className="bg-green-600 hover:bg-green-700 text-white"
                >
                  {isLoading ? "Subiendo..." : "Agregar"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
          )}
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
                  {isAdmin && (
                    <TableHead className="font-medium text-gray-900 cursor-pointer">
                      Eliminar <span className="text-gray-400">↕</span>
                    </TableHead>
                  )}
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoadingResources ? (
                  <TableRow>
                    <TableCell colSpan={isAdmin ? 4 : 3} className="text-center py-8 text-gray-500">
                      Cargando recursos...
                    </TableCell>
                  </TableRow>
                ) : resources.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={isAdmin ? 4 : 3} className="text-center py-8 text-gray-500">
                      No data available in table
                    </TableCell>
                  </TableRow>
                ) : (
                  resources
                    .filter(resource => 
                      resource.nombre?.toLowerCase().includes(searchTerm.toLowerCase())
                    )
                    .slice(0, entriesPerPage)
                    .map((resource, index) => (
                      <TableRow key={resource.id}>
                        <TableCell>{index + 1}</TableCell>
                        <TableCell>{resource.nombre}</TableCell>
                        <TableCell>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleViewDocument(resource.id)}
                            className="bg-blue-600 text-white hover:bg-blue-700"
                          >
                            Ver
                          </Button>
                        </TableCell>
                        {isAdmin && (
                          <TableCell>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDelete(resource.id)}
                              className="bg-red-600 text-white hover:bg-red-700"
                            >
                              Eliminar
                            </Button>
                          </TableCell>
                        )}
                      </TableRow>
                    ))
                )}
              </TableBody>
            </Table>
          </div>

          {/* Pagination info and controls */}
          <div className="flex justify-between items-center mt-4">
            <span className="text-sm text-gray-600">
              Showing {resources.length > 0 ? 1 : 0} to {Math.min(entriesPerPage, resources.filter(resource => 
                resource.nombre?.toLowerCase().includes(searchTerm.toLowerCase())
              ).length)} of {resources.filter(resource => 
                resource.nombre?.toLowerCase().includes(searchTerm.toLowerCase())
              ).length} entries
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
