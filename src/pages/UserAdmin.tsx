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
import { Users, UserCheck, Search, FileDown, Filter, X } from 'lucide-react';
import { toast } from 'sonner';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import * as XLSX from 'xlsx';
import { apiUrl } from '@/lib/config';

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
  estado: number | string | null;
  created_at: string;
}

const UserAdmin = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [activeUsers, setActiveUsers] = useState(0);
  const [inactiveUsers, setInactiveUsers] = useState(0);
  const [paises, setPaises] = useState<Array<{ id: number; nombre: string }>>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [editFormData, setEditFormData] = useState({
    name: '',
    email: '',
    username: '',
    apellidos: '',
    pais_id: 0,
    telefono: '',
    ciudad: '',
    direccion: '',
    estado: 1,
    password: '',
    confirmPassword: ''
  });
  const [updating, setUpdating] = useState(false);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      console.log('Fetching users from API...');
      
      const token = localStorage.getItem('token');
      console.log('Token from localStorage:', token ? 'Token exists' : 'No token found');
      
      if (!token) {
        console.error('No authentication token found');
        setUsers([]);
        setLoading(false);
        return;
      }

      console.log('Making request to:', apiUrl('/api/users'));
      const response = await fetch(apiUrl('/api/users'), {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      console.log('Response status:', response.status);
      console.log('Response ok:', response.ok);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Response error:', errorText);
        throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
      }
      
      const data = await response.json();
      console.log('Full API response:', data);
      console.log('Response type:', typeof data);
      console.log('Response keys:', Object.keys(data));
      
      // Handle the usuarios array from the response
      if (!data.usuarios) {
        console.error('Expected "usuarios" property in response but got:', data);
        throw new Error('Invalid response format - missing "usuarios" array');
      }
      
      const usersArray = data.usuarios;
      console.log('Users array length:', usersArray.length);
      console.log('First user sample:', usersArray[0]);
      
      setUsers(usersArray);
      setFilteredUsers(usersArray);
      
      // Calculate active/inactive users based on estado field (handle both string and number)
      const active = usersArray.filter((user: User) => user.estado === 1 || user.estado === '1').length;
      const inactive = usersArray.filter((user: User) => user.estado === null || user.estado === 0 || user.estado === '0').length;
      
      setActiveUsers(active);
      setInactiveUsers(inactive);
      
    } catch (error) {
      console.error('Error fetching users:', error);
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchPaises = async () => {
    try {
      const response = await fetch(apiUrl('/api/paises'));
      if (response.ok) {
        const data = await response.json();
        setPaises(data.paises);
      }
    } catch (error) {
      console.error('Error fetching countries:', error);
    }
  };

  useEffect(() => {
    fetchUsers();
    fetchPaises();
  }, []);

  const handleEditUser = (user: User) => {
    setSelectedUser(user);
    setEditFormData({
      name: user.name,
      email: user.email,
      username: user.username,
      apellidos: user.apellidos,
      pais_id: user.pais_id,
      telefono: user.telefono,
      ciudad: user.ciudad || '',
      direccion: user.direccion || '',
      estado: user.estado === null || user.estado === 0 || user.estado === '0' ? 0 : 1,
      password: '',
      confirmPassword: ''
    });
    setIsEditModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsEditModalOpen(false);
    setSelectedUser(null);
    setEditFormData({
      name: '',
      email: '',
      username: '',
      apellidos: '',
      pais_id: 0,
      telefono: '',
      ciudad: '',
      direccion: '',
      estado: 1,
      password: '',
      confirmPassword: ''
    });
  };

  const handleInputChange = (field: string, value: string | number) => {
    setEditFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleUpdateUser = async () => {
    if (!selectedUser) return;

    // Validar contraseñas si se ingresaron
    if (editFormData.password && editFormData.password !== editFormData.confirmPassword) {
      toast.error('Las contraseñas no coinciden');
      return;
    }

    try {
      setUpdating(true);
      
      const token = localStorage.getItem('token');
      if (!token) {
        toast.error('No hay token de autenticación');
        return;
      }

      // Preparar datos para enviar
      const updateData: any = {
        name: editFormData.name,
        email: editFormData.email,
        username: editFormData.username,
        apellidos: editFormData.apellidos,
        pais_id: Number(editFormData.pais_id),
        telefono: editFormData.telefono,
        wallet_usdt: null,
        direccion: editFormData.direccion || null,
        ciudad: editFormData.ciudad || null,
        estado: Number(editFormData.estado)
      };

      // Solo incluir password si se ingresó una nueva
      if (editFormData.password) {
        updateData.password = editFormData.password;
      }

      const response = await fetch(apiUrl(`/api/usuarios/${selectedUser.id}`), {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData)
      });

      if (!response.ok) {
        const errorData = await response.text();
        throw new Error(`Error ${response.status}: ${errorData}`);
      }

      toast.success('Usuario actualizado exitosamente');
      handleCloseModal();
      fetchUsers(); // Recargar la lista de usuarios
      
    } catch (error) {
      console.error('Error updating user:', error);
      toast.error('Error al actualizar el usuario');
    } finally {
      setUpdating(false);
    }
  };

  const getPaisName = (paisId: number) => {
    const pais = paises.find(p => p.id === paisId);
    return pais ? pais.nombre : `País ${paisId}`;
  };

  const handleSearch = (term: string) => {
    setSearchTerm(term);
    applyFilters(term, statusFilter);
  };

  const handleStatusFilter = (status: string) => {
    setStatusFilter(status);
    applyFilters(searchTerm, status);
  };

  const applyFilters = (search: string, status: string) => {
    let filtered = users;

    // Apply search filter
    if (search.trim()) {
      filtered = filtered.filter(user =>
        user.name.toLowerCase().includes(search.toLowerCase()) ||
        user.apellidos.toLowerCase().includes(search.toLowerCase()) ||
        user.username.toLowerCase().includes(search.toLowerCase()) ||
        user.email.toLowerCase().includes(search.toLowerCase()) ||
        user.telefono.includes(search) ||
        getPaisName(user.pais_id).toLowerCase().includes(search.toLowerCase())
      );
    }

    // Apply status filter
    if (status !== 'all') {
      if (status === 'active') {
        filtered = filtered.filter(user => user.estado === 1 || user.estado === '1');
      } else if (status === 'inactive') {
        filtered = filtered.filter(user => user.estado === null || user.estado === 0 || user.estado === '0');
      }
    }

    setFilteredUsers(filtered);
  };

  const clearFilters = () => {
    setSearchTerm('');
    setStatusFilter('all');
    setFilteredUsers(users);
  };

  const exportToExcel = () => {
    const dataToExport = filteredUsers.map((user, index) => ({
      '#': index + 1,
      'Estado': user.estado === null || user.estado === 0 || user.estado === '0' ? 'Inactivo' : 'Activo',
      'Nombre': user.name,
      'Apellido': user.apellidos,
      'Usuario': user.username,
      'Email': user.email,
      'Teléfono': user.telefono,
      'País': getPaisName(user.pais_id),
      'Ciudad': user.ciudad || '',
      'Dirección': user.direccion || '',
      'Fecha de Creación': new Date(user.created_at).toLocaleDateString()
    }));

    const worksheet = XLSX.utils.json_to_sheet(dataToExport);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Usuarios');
    XLSX.writeFile(workbook, `usuarios_${new Date().toISOString().split('T')[0]}.xlsx`);
    toast.success('Archivo Excel exportado exitosamente');
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
            {/* Filters Section */}
            <div className="bg-green-50 p-4 rounded-lg border border-green-200 mb-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                {/* Search Input */}
                <div className="space-y-2">
                  <Label htmlFor="search">Buscar Usuario</Label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="search"
                      placeholder="Buscar por nombre, usuario, email..."
                      value={searchTerm}
                      onChange={(e) => handleSearch(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>

                {/* Status Filter */}
                <div className="space-y-2">
                  <Label>Filtrar por Estado</Label>
                  <Select value={statusFilter} onValueChange={handleStatusFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="Todos los estados" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos</SelectItem>
                      <SelectItem value="active">Activos</SelectItem>
                      <SelectItem value="inactive">Inactivos</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Export Button */}
                <Button onClick={exportToExcel} variant="outline" className="flex items-center gap-2">
                  <FileDown className="h-4 w-4" />
                  Exportar Excel
                </Button>

                {/* Clear Filters Button */}
                <Button onClick={clearFilters} variant="outline" className="flex items-center gap-2">
                  <X className="h-4 w-4" />
                  Limpiar Filtros
                </Button>
              </div>
              
              {/* Results Summary */}
              <div className="mt-3 text-sm text-muted-foreground">
                Mostrando {filteredUsers.length} de {users.length} usuarios
                {searchTerm && ` • Búsqueda: "${searchTerm}"`}
                {statusFilter !== 'all' && ` • Estado: ${statusFilter === 'active' ? 'Activos' : 'Inactivos'}`}
              </div>
            </div>
            {loading ? (
              <div className="text-center py-8">
                <p>Cargando usuarios...</p>
              </div>
            ) : filteredUsers.length === 0 ? (
              <div className="text-center py-8">
                <p>{users.length === 0 ? 'No hay usuarios disponibles' : 'No se encontraron usuarios con los filtros aplicados'}</p>
              </div>
            ) : (
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-12">#</TableHead>
                      <TableHead>Estado</TableHead>
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
                     {filteredUsers.map((user, index) => (
                      <TableRow key={user.id}>
                        <TableCell className="font-medium">{index + 1}</TableCell>
                         <TableCell>
                            {user.estado === null || user.estado === 0 || user.estado === '0' ? (
                              <Badge variant="destructive" className="bg-red-100 text-red-800">
                                Inactivo
                              </Badge>
                            ) : (
                              <Badge variant="secondary" className="bg-green-100 text-green-800">
                                Activo
                              </Badge>
                            )}
                         </TableCell>
                        <TableCell>{user.name}</TableCell>
                        <TableCell>{user.apellidos}</TableCell>
                        <TableCell>{user.username}</TableCell>
                        <TableCell>{user.email}</TableCell>
                        <TableCell>{user.telefono}</TableCell>
                        <TableCell>••••••••</TableCell>
                        <TableCell>{getPaisName(user.pais_id)}</TableCell>
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
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <DialogTitle>
                  Editar Usuario {selectedUser?.name} {selectedUser?.apellidos}
                </DialogTitle>
                <p className="text-sm text-muted-foreground">
                  Creado en: {selectedUser && new Date(selectedUser.created_at).toLocaleDateString()}
                </p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="estado_modal">Estado:</Label>
                <select
                  id="estado_modal"
                  value={editFormData.estado}
                  onChange={(e) => handleInputChange('estado', Number(e.target.value))}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <option value="1">Activo</option>
                  <option value="0">Inactivo</option>
                </select>
              </div>
            </div>
          </DialogHeader>
          {selectedUser && (
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nombre</Label>
                  <Input
                    id="name"
                    value={editFormData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="apellidos">Apellidos</Label>
                  <Input
                    id="apellidos"
                    value={editFormData.apellidos}
                    onChange={(e) => handleInputChange('apellidos', e.target.value)}
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="username">Usuario</Label>
                  <Input
                    id="username"
                    value={editFormData.username}
                    onChange={(e) => handleInputChange('username', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    value={editFormData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="nueva_password">Nueva Contraseña</Label>
                  <Input
                    id="nueva_password"
                    type="password"
                    value={editFormData.password}
                    onChange={(e) => handleInputChange('password', e.target.value)}
                    placeholder="Ingrese nueva contraseña"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirmar_password">Confirmar Contraseña</Label>
                  <Input
                    id="confirmar_password"
                    type="password"
                    value={editFormData.confirmPassword}
                    onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                    placeholder="Confirme la contraseña"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="telefono">Teléfono</Label>
                  <Input
                    id="telefono"
                    value={editFormData.telefono}
                    onChange={(e) => handleInputChange('telefono', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="pais">País</Label>
                  <select
                    id="pais"
                    value={editFormData.pais_id}
                    onChange={(e) => handleInputChange('pais_id', Number(e.target.value))}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {paises.map((pais) => (
                      <option key={pais.id} value={pais.id}>
                        {pais.nombre}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="ciudad">Ciudad</Label>
                  <Input
                    id="ciudad"
                    value={editFormData.ciudad}
                    onChange={(e) => handleInputChange('ciudad', e.target.value)}
                    placeholder="Ciudad"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="direccion">Dirección</Label>
                  <Input
                    id="direccion"
                    value={editFormData.direccion}
                    onChange={(e) => handleInputChange('direccion', e.target.value)}
                    placeholder="Dirección"
                  />
                </div>
              </div>
            </div>
          )}
          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={handleCloseModal}>
              Cerrar
            </Button>
            <Button onClick={handleUpdateUser} disabled={updating}>
              {updating ? 'Guardando...' : 'Guardar Cambios'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </OrganizationLayout>
  );
};

export default UserAdmin;