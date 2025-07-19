import React, { useState, useEffect } from 'react';
import { OrganizationLayout } from '@/components/OrganizationLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Plus, Edit, Trash2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface TipoComision {
  id: number;
  descripcion: string;
  porcentaje: string;
}

interface ComisionFormData {
  tipo?: string;
  descripcion?: string;
  porcentaje: number;
}

const ComTipo = () => {
  const [tipos, setTipos] = useState<TipoComision[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState<ComisionFormData>({
    descripcion: '',
    porcentaje: 0
  });
  const { toast } = useToast();

  const fetchTipos = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:4000/api/comision-tipo', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setTipos(data);
      } else {
        toast({
          title: "Error",
          description: "No se pudieron cargar los tipos de comisión",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Error fetching tipos:', error);
      toast({
        title: "Error",
        description: "Error de conexión al cargar los tipos de comisión",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const token = localStorage.getItem('token');
      const payload = {
        tipo: formData.descripcion,
        porcentaje: formData.porcentaje
      };

      const response = await fetch('http://localhost:4000/api/comision-tipo', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        toast({
          title: "Éxito",
          description: "Tipo de comisión creado correctamente"
        });
        setIsDialogOpen(false);
        setFormData({ descripcion: '', porcentaje: 0 });
        fetchTipos(); // Recargar la lista
      } else {
        toast({
          title: "Error",
          description: "No se pudo crear el tipo de comisión",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Error creating tipo:', error);
      toast({
        title: "Error",
        description: "Error de conexión al crear el tipo de comisión",
        variant: "destructive"
      });
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'porcentaje' ? parseFloat(value) || 0 : value
    }));
  };

  useEffect(() => {
    fetchTipos();
  }, []);

  return (
    <OrganizationLayout title="Tipo de Comisión">
      <div className="p-6 space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-foreground">Tipos de Comisión</h1>
          
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Nuevo Tipo
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Crear Tipo de Comisión</DialogTitle>
                <DialogDescription>
                  Agrega un nuevo tipo de comisión con su porcentaje correspondiente.
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit}>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="descripcion" className="text-right">
                      Descripción
                    </Label>
                    <Input
                      id="descripcion"
                      name="descripcion"
                      value={formData.descripcion}
                      onChange={handleInputChange}
                      className="col-span-3"
                      placeholder="ej. Nivel 1"
                      required
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="porcentaje" className="text-right">
                      Porcentaje
                    </Label>
                    <Input
                      id="porcentaje"
                      name="porcentaje"
                      type="number"
                      step="0.01"
                      min="0"
                      max="1"
                      value={formData.porcentaje}
                      onChange={handleInputChange}
                      className="col-span-3"
                      placeholder="0.10"
                      required
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button type="submit">Guardar</Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Lista de Tipos de Comisión</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-4">
                <p>Cargando tipos de comisión...</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-2">ID</th>
                      <th className="text-left py-2">Descripción</th>
                      <th className="text-left py-2">Porcentaje</th>
                      <th className="text-left py-2">Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {tipos.length > 0 ? (
                      tipos.map((tipo) => (
                        <tr key={tipo.id} className="border-b">
                          <td className="py-2">{tipo.id}</td>
                          <td className="py-2">{tipo.descripcion}</td>
                          <td className="py-2">{(parseFloat(tipo.porcentaje) * 100).toFixed(2)}%</td>
                          <td className="py-2">
                            <div className="flex gap-2">
                              <Button variant="outline" size="sm">
                                <Edit className="w-4 h-4" />
                              </Button>
                              <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700">
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={4} className="py-4 text-center text-muted-foreground">
                          No hay tipos de comisión registrados
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </OrganizationLayout>
  );
};

export default ComTipo;