import { useState, useEffect } from 'react';
import { OrganizationLayout } from "@/components/OrganizationLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiUrl } from '@/lib/config';

interface Noticia {
  id: number;
  titulo: string;
  noticia: string;
  created_at?: string;
}

export default function News() {
  const [noticias, setNoticias] = useState<Noticia[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newNoticia, setNewNoticia] = useState({
    titulo: '',
    noticia: ''
  });
  const { toast } = useToast();

  // Obtener noticias
  const fetchNoticias = async () => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem('token');
      if (!token) {
        toast({
          title: "Error",
          description: "No se encontró token de autenticación",
          variant: "destructive",
        });
        return;
      }

      const response = await fetch(apiUrl('/api/noticias'), {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      // Ensure data is always an array
      if (Array.isArray(data)) {
        setNoticias(data);
      } else if (data && Array.isArray(data.noticias)) {
        setNoticias(data.noticias);
      } else {
        setNoticias([]);
        toast({
          title: "Advertencia",
          description: "No se encontraron noticias",
          variant: "default"
        });
      }
    } catch (error) {
      console.error('Error fetching noticias:', error);
      setNoticias([]);
      toast({
        title: "Error",
        description: "Error de conexión",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Agregar noticia
  const handleAddNoticia = async () => {
    if (!newNoticia.titulo.trim() || !newNoticia.noticia.trim()) {
      toast({
        title: "Error",
        description: "Por favor completa todos los campos",
        variant: "destructive"
      });
      return;
    }

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

      const response = await fetch(apiUrl('/api/noticias'), {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newNoticia),
      });

      if (response.ok) {
        toast({
          title: "Éxito",
          description: "Noticia agregada correctamente"
        });
        setNewNoticia({ titulo: '', noticia: '' });
        setIsDialogOpen(false);
        fetchNoticias();
      } else {
        toast({
          title: "Error",
          description: "No se pudo agregar la noticia",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Error adding noticia:', error);
      toast({
        title: "Error",
        description: "Error de conexión",
        variant: "destructive"
      });
    }
  };

  // Eliminar noticia
  const handleDeleteNoticia = async (id: number) => {
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

      const response = await fetch(apiUrl(`/api/noticias/${id}`), {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        toast({
          title: "Éxito",
          description: "Noticia eliminada correctamente"
        });
        fetchNoticias();
      } else {
        toast({
          title: "Error",
          description: "No se pudo eliminar la noticia",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Error deleting noticia:', error);
      toast({
        title: "Error",
        description: "Error de conexión",
        variant: "destructive"
      });
    }
  };

  useEffect(() => {
    fetchNoticias();
  }, []);

  return (
    <OrganizationLayout title="Noticias">
      <main className="flex-1 p-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Noticias</h1>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-green-600 hover:bg-green-700 text-white">
                <Plus className="w-4 h-4 mr-2" />
                Agregar Noticias
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Agregar Noticia</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="titulo">Título:</Label>
                  <Input
                    id="titulo"
                    value={newNoticia.titulo}
                    onChange={(e) => setNewNoticia({ ...newNoticia, titulo: e.target.value })}
                    placeholder="Ingrese el título de la noticia"
                  />
                </div>
                <div>
                  <Label htmlFor="noticia">Noticia:</Label>
                  <Textarea
                    id="noticia"
                    value={newNoticia.noticia}
                    onChange={(e) => setNewNoticia({ ...newNoticia, noticia: e.target.value })}
                    placeholder="Ingrese el contenido de la noticia"
                    rows={4}
                  />
                </div>
                <div className="flex justify-end space-x-2">
                  <Button 
                    variant="outline" 
                    onClick={() => setIsDialogOpen(false)}
                  >
                    Cerrar
                  </Button>
                  <Button 
                    onClick={handleAddNoticia}
                    className="bg-green-600 hover:bg-green-700 text-white"
                  >
                    Agregar
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Lista de Noticias</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="mb-4 flex justify-between items-center">
              <div className="flex items-center space-x-2">
                <span>Show</span>
                <select className="border rounded px-2 py-1">
                  <option>10</option>
                  <option>25</option>
                  <option>50</option>
                </select>
                <span>entries</span>
              </div>
              <div className="flex items-center space-x-2">
                <span>Search:</span>
                <Input className="w-48" placeholder="Buscar..." />
              </div>
            </div>

            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-16">#</TableHead>
                  <TableHead>Título</TableHead>
                  <TableHead>Noticia</TableHead>
                  <TableHead className="w-24">Eliminar</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-8">
                      Cargando...
                    </TableCell>
                  </TableRow>
                ) : noticias.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-8 text-orange-600">
                      No data available in table
                    </TableCell>
                  </TableRow>
                ) : (
                  Array.isArray(noticias) ? noticias.map((noticia, index) => (
                    <TableRow key={noticia.id}>
                      <TableCell>{index + 1}</TableCell>
                      <TableCell>{noticia.titulo}</TableCell>
                      <TableCell>{noticia.noticia}</TableCell>
                      <TableCell>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDeleteNoticia(noticia.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  )) : (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center py-8 text-red-600">
                        Error: Los datos no tienen el formato esperado
                      </TableCell>
                    </TableRow>
                  )
                )}
              </TableBody>
            </Table>

            <div className="mt-4 flex justify-between items-center">
              <div className="text-sm text-gray-600">
                Showing 0 to 0 of 0 entries
              </div>
              <div className="flex space-x-2">
                <Button variant="outline" size="sm">Previous</Button>
                <Button variant="outline" size="sm">Next</Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </OrganizationLayout>
  );
}