import React, { useState, useEffect } from 'react';
import { OrganizationLayout } from "@/components/OrganizationLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Plus, Edit, Trash2, Clock } from "lucide-react";
import { format } from 'date-fns';

interface HorarioRetiro {
  id: number;
  horario: string;
  fee: string;
  mensaje_retiro: string;
}

interface FormData {
  horario: string;
  fee: string;
  mensaje_retiro: string;
}

const HorarioRetiros = () => {
  const [horarios, setHorarios] = useState<HorarioRetiro[]>([]);
  const [loading, setLoading] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedHorario, setSelectedHorario] = useState<HorarioRetiro | null>(null);
  const [formData, setFormData] = useState<FormData>({
    horario: '',
    fee: '',
    mensaje_retiro: ''
  });
  const { toast } = useToast();

  const fetchHorarios = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:4000/api/tiempo-retiro', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Error al cargar horarios');
      }

      const data = await response.json();
      setHorarios(data);
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: "Error",
        description: "No se pudieron cargar los horarios",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateHorario = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:4000/api/tiempo-retiro', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          horario: formData.horario,
          fee: parseFloat(formData.fee),
          mensaje_retiro: formData.mensaje_retiro
        })
      });

      if (!response.ok) {
        throw new Error('Error al crear horario');
      }

      toast({
        title: "Éxito",
        description: "Horario creado correctamente"
      });

      setIsCreateModalOpen(false);
      setFormData({ horario: '', fee: '', mensaje_retiro: '' });
      fetchHorarios();
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: "Error",
        description: "No se pudo crear el horario",
        variant: "destructive"
      });
    }
  };

  const handleEditHorario = async () => {
    if (!selectedHorario) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:4000/api/tiempo-retiro/${selectedHorario.id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          horario: formData.horario,
          fee: parseFloat(formData.fee),
          mensaje_retiro: formData.mensaje_retiro
        })
      });

      if (!response.ok) {
        throw new Error('Error al actualizar horario');
      }

      toast({
        title: "Éxito",
        description: "Horario actualizado correctamente"
      });

      setIsEditModalOpen(false);
      setSelectedHorario(null);
      setFormData({ horario: '', fee: '', mensaje_retiro: '' });
      fetchHorarios();
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: "Error",
        description: "No se pudo actualizar el horario",
        variant: "destructive"
      });
    }
  };

  const handleDeleteHorario = async (id: number) => {
    if (!confirm('¿Estás seguro de que quieres eliminar este horario?')) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:4000/api/tiempo-retiro/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Error al eliminar horario');
      }

      toast({
        title: "Éxito",
        description: "Horario eliminado correctamente"
      });

      fetchHorarios();
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: "Error",
        description: "No se pudo eliminar el horario",
        variant: "destructive"
      });
    }
  };

  const openEditModal = (horario: HorarioRetiro) => {
    setSelectedHorario(horario);
    setFormData({
      horario: horario.horario,
      fee: horario.fee,
      mensaje_retiro: horario.mensaje_retiro
    });
    setIsEditModalOpen(true);
  };

  const formatDateTime = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return format(date, 'dd/MM/yyyy HH:mm');
    } catch (error) {
      return dateString;
    }
  };

  useEffect(() => {
    fetchHorarios();
  }, []);

  return (
    <OrganizationLayout title="Horario de Retiros">
      <main className="flex-1 p-6 space-y-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-xl font-semibold">
              Gestión de Horarios de Retiro
            </CardTitle>
            <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Crear Horario
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Crear Nuevo Horario</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="horario">Horario</Label>
                    <Input
                      id="horario"
                      type="datetime-local"
                      value={formData.horario}
                      onChange={(e) => setFormData({ ...formData, horario: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="fee">Fee (%)</Label>
                    <Input
                      id="fee"
                      type="number"
                      step="0.01"
                      min="0"
                      max="100"
                      value={formData.fee}
                      onChange={(e) => setFormData({ ...formData, fee: e.target.value })}
                      placeholder="Ej: 2.5 para 2.5%"
                    />
                  </div>
                  <div>
                    <Label htmlFor="mensaje">Mensaje de Retiro</Label>
                    <Textarea
                      id="mensaje"
                      value={formData.mensaje_retiro}
                      onChange={(e) => setFormData({ ...formData, mensaje_retiro: e.target.value })}
                    />
                  </div>
                  <Button onClick={handleCreateHorario} className="w-full">
                    Crear Horario
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8">
                <p>Cargando horarios...</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Horario</TableHead>
                    <TableHead>Fee</TableHead>
                    <TableHead>Mensaje</TableHead>
                    <TableHead>Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {horarios.map((horario) => (
                    <TableRow key={horario.id}>
                      <TableCell>{horario.id}</TableCell>
                      <TableCell>{formatDateTime(horario.horario)}</TableCell>
                      <TableCell>
                        <Badge variant="secondary">{horario.fee}%</Badge>
                      </TableCell>
                      <TableCell className="max-w-xs truncate">
                        {horario.mensaje_retiro}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => openEditModal(horario)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleDeleteHorario(horario.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </main>

      {/* Modal de Edición */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Horario</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="edit-horario">Horario</Label>
              <Input
                id="edit-horario"
                type="datetime-local"
                value={formData.horario}
                onChange={(e) => setFormData({ ...formData, horario: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="edit-fee">Fee (%)</Label>
              <Input
                id="edit-fee"
                type="number"
                step="0.01"
                min="0"
                max="100"
                value={formData.fee}
                onChange={(e) => setFormData({ ...formData, fee: e.target.value })}
                placeholder="Ej: 2.5 para 2.5%"
              />
            </div>
            <div>
              <Label htmlFor="edit-mensaje">Mensaje de Retiro</Label>
              <Textarea
                id="edit-mensaje"
                value={formData.mensaje_retiro}
                onChange={(e) => setFormData({ ...formData, mensaje_retiro: e.target.value })}
              />
            </div>
            <Button onClick={handleEditHorario} className="w-full">
              Actualizar Horario
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </OrganizationLayout>
  );
};

export default HorarioRetiros;