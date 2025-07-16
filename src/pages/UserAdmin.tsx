import React, { useState, useEffect } from 'react';
import { OrganizationLayout } from '@/components/OrganizationLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Users, UserCheck } from 'lucide-react';

interface User {
  id: number;
  name: string;
  email: string;
  username: string;
  apellidos: string;
  pais_id: number;
  telefono: string;
  wallet_usdt: string | null;
  direccion: string | null;
  ciudad: string | null;
  estado: string | null;
  created_at: string;
}

const UserAdmin = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [activeUsers, setActiveUsers] = useState(0);
  const [inactiveUsers, setInactiveUsers] = useState(0);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      console.log('Fetching users from API...');
      
      const token = localStorage.getItem('authToken') || 'test-token-123';
      console.log('Using token:', token);

      const response = await fetch('http://localhost:4000/api/users', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      console.log('Response status:', response.status);
      console.log('Response headers:', response.headers);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('API response data:', data);
      
      const usersArray = data.usuarios || [];
      console.log('Users array:', usersArray);
      
      setUsers(usersArray);
      
      // Calculate active/inactive users (assuming all fetched users are active for now)
      setActiveUsers(usersArray.length);
      setInactiveUsers(0); // This would come from your API logic
      
    } catch (error) {
      console.error('Error fetching users:', error);
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleEditUser = (user: User) => {
    setSelectedUser(user);
    setIsEditModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsEditModalOpen(false);
    setSelectedUser(null);
  };

  return (
    <OrganizationLayout title="Administración de Usuarios">
      <div className="p-6 space-y-6">
        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Usuarios Activos
              </CardTitle>
              <UserCheck className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{activeUsers}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Usuarios Inactivos
              </CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{inactiveUsers}</div>
            </CardContent>
          </Card>
        </div>

        {/* Administrar Section */}
        <Card>
          <CardHeader>
            <CardTitle>Administrar</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8">
                <p>Cargando usuarios...</p>
              </div>
            ) : users.length === 0 ? (
              <div className="text-center py-8">
                <p>No hay usuarios disponibles</p>
              </div>
            ) : (
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-12">#</TableHead>
                      <TableHead>Activar</TableHead>
                      <TableHead>Nombre</TableHead>
                      <TableHead>Apellido</TableHead>
                      <TableHead>Usuario</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Teléfono</TableHead>
                      <TableHead>Contraseña</TableHead>
                      <TableHead>País</TableHead>
                      <TableHead className="text-right">Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {users.map((user, index) => (
                      <TableRow key={user.id}>
                        <TableCell className="font-medium">{index + 1}</TableCell>
                        <TableCell>
                          <Badge variant="secondary" className="bg-green-100 text-green-800">
                            Activar
                          </Badge>
                        </TableCell>
                        <TableCell>{user.name}</TableCell>
                        <TableCell>{user.apellidos}</TableCell>
                        <TableCell>{user.username}</TableCell>
                        <TableCell>{user.email}</TableCell>
                        <TableCell>{user.telefono}</TableCell>
                        <TableCell>••••••••</TableCell>
                        <TableCell>{user.pais_id}</TableCell>
                        <TableCell className="text-right">
                          <Button
                            onClick={() => handleEditUser(user)}
                            variant="outline"
                            size="sm"
                          >
                            Editar Usuario
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Edit User Modal */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Editar Usuario</DialogTitle>
          </DialogHeader>
          {selectedUser && (
            <div className="grid grid-cols-2 gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nombre</Label>
                <Input
                  id="name"
                  defaultValue={selectedUser.name}
                  readOnly
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="apellidos">Apellidos</Label>
                <Input
                  id="apellidos"
                  defaultValue={selectedUser.apellidos}
                  readOnly
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="username">Usuario</Label>
                <Input
                  id="username"
                  defaultValue={selectedUser.username}
                  readOnly
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  defaultValue={selectedUser.email}
                  readOnly
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="telefono">Teléfono</Label>
                <Input
                  id="telefono"
                  defaultValue={selectedUser.telefono}
                  readOnly
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="pais">País ID</Label>
                <Input
                  id="pais"
                  defaultValue={selectedUser.pais_id.toString()}
                  readOnly
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="ciudad">Ciudad</Label>
                <Input
                  id="ciudad"
                  defaultValue={selectedUser.ciudad || 'No especificada'}
                  readOnly
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="direccion">Dirección</Label>
                <Input
                  id="direccion"
                  defaultValue={selectedUser.direccion || 'No especificada'}
                  readOnly
                />
              </div>
            </div>
          )}
          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={handleCloseModal}>
              Cerrar
            </Button>
            <Button onClick={handleCloseModal}>
              Guardar Cambios
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </OrganizationLayout>
  );
};

export default UserAdmin;