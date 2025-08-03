import React, { useState, useEffect } from 'react';
import { OrganizationLayout } from '@/components/OrganizationLayout';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Edit, Trash2, Plus } from "lucide-react";
import { toast } from "sonner";
import { apiUrl } from '@/lib/config';

interface PaymentMethod {
  id: number;
  titulo: string;
  img_qr: string;
  dato: string;
}

export default function MetPago() {
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingMethod, setEditingMethod] = useState<PaymentMethod | null>(null);
  const [formData, setFormData] = useState({
    titulo: '',
    dato: '',
    img_qr: null as File | null
  });

  // Fetch payment methods
  const fetchPaymentMethods = async () => {
    try {
      const token = localStorage.getItem('token');
      console.log("Intentando conectar a:", apiUrl('/api/metodo_pago'));
      const response = await fetch(apiUrl('/api/metodo_pago'), {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      console.log("Respuesta recibida:", response.status, response.statusText);
      
      if (response.ok) {
        const data = await response.json();
        console.log("Datos recibidos:", data);
        setPaymentMethods(data);
      } else {
        console.error("Error de respuesta:", response.status, response.statusText);
        toast.error("No se pudieron cargar los métodos de pago");
      }
    } catch (error) {
      console.error("Error fetching payment methods:", error);
      toast.error("Error de conexión");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPaymentMethods();
  }, []);

  // Handle form submission for create
  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const formDataToSend = new FormData();
    formDataToSend.append('titulo', formData.titulo);
    formDataToSend.append('dato', formData.dato);
    if (formData.img_qr) {
      formDataToSend.append('img_qr', formData.img_qr);
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(apiUrl('/api/metodo_pago'), {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formDataToSend
      });

      if (response.ok) {
        toast.success("Método de pago creado correctamente");
        setIsCreateModalOpen(false);
        setFormData({ titulo: '', dato: '', img_qr: null });
        fetchPaymentMethods();
      } else {
        toast.error("No se pudo crear el método de pago");
      }
    } catch (error) {
      console.error("Error creating payment method:", error);
      toast.error("Error de conexión");
    }
  };

  // Handle form submission for edit
  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingMethod) return;

    const formDataToSend = new FormData();
    formDataToSend.append('titulo', formData.titulo);
    formDataToSend.append('dato', formData.dato);
    if (formData.img_qr) {
      formDataToSend.append('img_qr', formData.img_qr);
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(apiUrl(`/api/metodo_pago/${editingMethod.id}`), {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formDataToSend
      });

      if (response.ok) {
        toast.success("Método de pago actualizado correctamente");
        setIsEditModalOpen(false);
        setEditingMethod(null);
        setFormData({ titulo: '', dato: '', img_qr: null });
        fetchPaymentMethods();
      } else {
        toast.error("No se pudo actualizar el método de pago");
      }
    } catch (error) {
      console.error("Error updating payment method:", error);
      toast.error("Error de conexión");
    }
  };

  // Handle delete
  const handleDelete = async (id: number) => {
    if (!confirm('¿Estás seguro de que quieres eliminar este método de pago?')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(apiUrl(`/api/metodo_pago/${id}`), {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        toast.success("Método de pago eliminado correctamente");
        fetchPaymentMethods();
      } else {
        toast.error("No se pudo eliminar el método de pago");
      }
    } catch (error) {
      console.error("Error deleting payment method:", error);
      toast.error("Error de conexión");
    }
  };

  // Open edit modal
  const openEditModal = (method: PaymentMethod) => {
    setEditingMethod(method);
    setFormData({
      titulo: method.titulo,
      dato: method.dato,
      img_qr: null
    });
    setIsEditModalOpen(true);
  };

  // Reset form
  const resetForm = () => {
    setFormData({ titulo: '', dato: '', img_qr: null });
    setEditingMethod(null);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Cargando métodos de pago...</div>
      </div>
    );
  }

  return (
    <OrganizationLayout title="Métodos de Pago">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <CardTitle className="text-2xl font-bold">Métodos de Pago</CardTitle>
          <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
            <DialogTrigger asChild>
              <Button onClick={resetForm}>
                <Plus className="w-4 h-4 mr-2" />
                Crear Método de Pago
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Crear Método de Pago</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleCreate} className="space-y-4">
                <div>
                  <Label htmlFor="titulo">Título</Label>
                  <Input
                    id="titulo"
                    value={formData.titulo}
                    onChange={(e) => setFormData({ ...formData, titulo: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="dato">Dato</Label>
                  <Input
                    id="dato"
                    value={formData.dato}
                    onChange={(e) => setFormData({ ...formData, dato: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="img_qr">Imagen QR</Label>
                  <Input
                    id="img_qr"
                    type="file"
                    accept="image/*"
                    onChange={(e) => setFormData({ ...formData, img_qr: e.target.files?.[0] || null })}
                    required
                  />
                </div>
                <div className="flex justify-end space-x-2">
                  <Button type="button" variant="outline" onClick={() => setIsCreateModalOpen(false)}>
                    Cancelar
                  </Button>
                  <Button type="submit">Crear</Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Título</TableHead>
                <TableHead>Imagen QR</TableHead>
                <TableHead>Dato</TableHead>
                <TableHead>Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paymentMethods.map((method) => (
                <TableRow key={method.id}>
                  <TableCell>{method.id}</TableCell>
                  <TableCell>{method.titulo}</TableCell>
                  <TableCell>
                    {method.img_qr && (
                      <img 
                        src={apiUrl(`/${method.img_qr.replace(/\\/g, '/')}`)} 
                        alt="QR Code" 
                        className="w-16 h-16 object-cover rounded"
                      />
                    )}
                  </TableCell>
                  <TableCell>{method.dato}</TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openEditModal(method)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDelete(method.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Edit Modal */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Método de Pago</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleEdit} className="space-y-4">
            <div>
              <Label htmlFor="edit-titulo">Título</Label>
              <Input
                id="edit-titulo"
                value={formData.titulo}
                onChange={(e) => setFormData({ ...formData, titulo: e.target.value })}
                required
              />
            </div>
            <div>
              <Label htmlFor="edit-dato">Dato</Label>
              <Input
                id="edit-dato"
                value={formData.dato}
                onChange={(e) => setFormData({ ...formData, dato: e.target.value })}
                required
              />
            </div>
            <div>
              <Label htmlFor="edit-img_qr">Imagen QR (opcional para actualizar)</Label>
              <Input
                id="edit-img_qr"
                type="file"
                accept="image/*"
                onChange={(e) => setFormData({ ...formData, img_qr: e.target.files?.[0] || null })}
              />
              {editingMethod?.img_qr && (
                <div className="mt-2">
                  <img 
                    src={apiUrl(`/${editingMethod.img_qr.replace(/\\/g, '/')}`)} 
                    alt="QR Code actual" 
                    className="w-20 h-20 object-cover rounded"
                  />
                  <p className="text-sm text-muted-foreground">Imagen actual</p>
                </div>
              )}
            </div>
            <div className="flex justify-end space-x-2">
              <Button type="button" variant="outline" onClick={() => setIsEditModalOpen(false)}>
                Cancelar
              </Button>
              <Button type="submit">Actualizar</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </OrganizationLayout>
  );
}