import React, { useState, useEffect } from 'react';
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from '@/components/AppSidebar';
import { SidebarInset } from "@/components/ui/sidebar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { UserNavbar } from '@/components/UserNavbar';

interface UserProfile {
  id: string;
  username: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  country: string;
  walletAddress: string;
}

interface UpdateProfileData {
  nombre: string;
  apellidos: string;
  usuario: string;
  email: string;
  pais_id: number;
  telefono: string;
  wallet_usdt: string;
  direccion_residencia: string;
  ciudad: string;
  estado: string;
  nuevaContrasena: string;
  confirmarContrasena: string;
}

const Profile = () => {
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updating, setUpdating] = useState(false);
  const { toast } = useToast();

  // Estados para los formularios
  const [profileData, setProfileData] = useState({
    firstName: '',
    lastName: ''
  });
  
  const [contactData, setContactData] = useState({
    address: '',
    city: '',
    state: '',
    country: '',
    email: '',
    phone: ''
  });
  
  const [walletData, setWalletData] = useState({
    walletAddress: ''
  });
  
  const [passwordData, setPasswordData] = useState({
    newPassword: '',
    confirmPassword: ''
  });
  
  const [validationToken, setValidationToken] = useState('');

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          setError('No se encontró token de autenticación');
          return;
        }

        console.log('Fetching user profile from:', 'http://localhost:4000/api/perfil');
        
        const response = await fetch('http://localhost:4000/api/perfil', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        console.log('Profile response status:', response.status);

        if (response.ok) {
          const data = await response.json();
          console.log('Profile data received:', data);
          setUserProfile(data);
          
          // Inicializar los estados con los datos del usuario
          setProfileData({
            firstName: data.firstName || '',
            lastName: data.lastName || ''
          });
          
          setContactData({
            address: data.address || '',
            city: data.city || '',
            state: data.state || '',
            country: data.country || '',
            email: data.email || '',
            phone: data.phone || ''
          });
          
          setWalletData({
            walletAddress: data.walletAddress || ''
          });
        } else {
          const errorData = await response.json().catch(() => ({ message: 'Error del servidor' }));
          console.error('Profile fetch error:', errorData);
          setError(errorData.message || 'Error al cargar el perfil');
          
          toast({
            variant: "destructive",
            title: "Error",
            description: "No se pudo cargar la información del perfil",
          });
        }
      } catch (error) {
        console.error('Network error:', error);
        setError('Error de conexión al servidor');
        
        toast({
          variant: "destructive",
          title: "Error de conexión",
          description: "No se pudo conectar al servidor",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, [toast]);

  const updateProfile = async (data: Partial<UpdateProfileData>) => {
    setUpdating(true);
    
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "No se encontró token de autenticación",
        });
        return;
      }

      // Preparar los datos para enviar
      const updateData: UpdateProfileData = {
        nombre: data.nombre || profileData.firstName,
        apellidos: data.apellidos || profileData.lastName,
        usuario: userProfile?.username || '',
        email: data.email || contactData.email,
        pais_id: data.pais_id || (contactData.country === 'colombia' ? 1 : contactData.country === 'mexico' ? 2 : 3),
        telefono: data.telefono || contactData.phone,
        wallet_usdt: data.wallet_usdt || walletData.walletAddress,
        direccion_residencia: data.direccion_residencia || contactData.address,
        ciudad: data.ciudad || contactData.city,
        estado: data.estado || contactData.state,
        nuevaContrasena: data.nuevaContrasena || '',
        confirmarContrasena: data.confirmarContrasena || ''
      };

      console.log('Updating profile with data:', updateData);

      const response = await fetch('http://localhost:4000/api/perfil/update', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData),
      });

      const result = await response.json();
      console.log('Update response:', result);

      if (response.ok) {
        toast({
          title: "Éxito",
          description: "Perfil actualizado correctamente",
        });
        
        // Recargar los datos del perfil
        window.location.reload();
      } else {
        toast({
          variant: "destructive",
          title: "Error",
          description: result.message || "Error al actualizar el perfil",
        });
      }
    } catch (error) {
      console.error('Update error:', error);
      toast({
        variant: "destructive",
        title: "Error de conexión",
        description: "No se pudo conectar al servidor",
      });
    } finally {
      setUpdating(false);
    }
  };

  const handleWalletSave = () => {
    updateProfile({
      wallet_usdt: walletData.walletAddress
    });
  };

  const handleProfileSave = () => {
    updateProfile({
      nombre: profileData.firstName,
      apellidos: profileData.lastName
    });
  };

  const handleContactSave = () => {
    const paisId = contactData.country === 'colombia' ? 1 : 
                   contactData.country === 'mexico' ? 2 : 3;
    
    updateProfile({
      email: contactData.email,
      pais_id: paisId,
      telefono: contactData.phone,
      direccion_residencia: contactData.address,
      ciudad: contactData.city,
      estado: contactData.state
    });
  };

  const handlePasswordSave = () => {
    // Solo validar si el usuario ingresó una nueva contraseña
    if (passwordData.newPassword.trim()) {
      if (passwordData.newPassword !== passwordData.confirmPassword) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "La nueva contraseña y su confirmación no coinciden",
        });
        return;
      }
      
      updateProfile({
        nuevaContrasena: passwordData.newPassword,
        confirmarContrasena: passwordData.confirmPassword
      });
    } else {
      toast({
        variant: "destructive",
        title: "Información",
        description: "No se ha ingresado una nueva contraseña para cambiar",
      });
    }
  };

  if (loading) {
    return (
      <SidebarProvider>
        <div className="min-h-screen flex w-full">
          <AppSidebar />
          <SidebarInset className="flex-1">
            <div className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
              <SidebarTrigger className="-ml-1" />
              <h1 className="text-xl font-semibold text-gray-900">
                Perfil de Usuario
              </h1>
            </div>
            <div className="flex-1 p-4 md:p-8 flex items-center justify-center">
              <div className="flex items-center gap-2">
                <Loader2 className="h-6 w-6 animate-spin" />
                <span>Cargando perfil...</span>
              </div>
            </div>
          </SidebarInset>
        </div>
      </SidebarProvider>
    );
  }

  if (error) {
    return (
      <SidebarProvider>
        <div className="min-h-screen flex w-full">
          <AppSidebar />
          <SidebarInset className="flex-1">
            <div className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
              <SidebarTrigger className="-ml-1" />
              <h1 className="text-xl font-semibold text-gray-900">
                Perfil de Usuario
              </h1>
            </div>
            <div className="flex-1 p-4 md:p-8 flex items-center justify-center">
              <div className="text-center">
                <p className="text-red-600 mb-4">{error}</p>
                <Button onClick={() => window.location.reload()}>
                  Reintentar
                </Button>
              </div>
            </div>
          </SidebarInset>
        </div>
      </SidebarProvider>
    );
  }

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AppSidebar />
        <SidebarInset className="flex-1">
          <UserNavbar title="Perfil de Usuario" />

          <div className="flex-1 p-4 md:p-8">
            <div className="max-w-4xl mx-auto">
              {/* Header con información del usuario */}
              <div className="flex items-center gap-4 mb-6 p-4 bg-gray-50 rounded-lg">
                <div className="w-16 h-16 bg-gray-400 rounded-full flex items-center justify-center">
                  <div className="w-12 h-12 bg-green-500 rounded-full"></div>
                </div>
                <div>
                  <h2 className="text-xl font-bold">{userProfile?.firstName} {userProfile?.lastName}</h2>
                  <p className="text-gray-600">Usuario: {userProfile?.username}</p>
                </div>
              </div>

              <Tabs defaultValue="wallet" className="w-full">
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="wallet">Wallet</TabsTrigger>
                  <TabsTrigger value="profile">Perfil</TabsTrigger>
                  <TabsTrigger value="contact">Contacto</TabsTrigger>
                  <TabsTrigger value="password">Contraseñas</TabsTrigger>
                </TabsList>

                {/* Tab Wallet */}
                <TabsContent value="wallet">
                  <Card>
                    <CardHeader>
                      <CardTitle>Información de la Wallet</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <Label htmlFor="wallet-address">Dirección Wallet USDT(TRC20)</Label>
                        <Input 
                          id="wallet-address" 
                          value={walletData.walletAddress}
                          onChange={(e) => setWalletData({...walletData, walletAddress: e.target.value})}
                          className="mt-1"
                        />
                      </div>
                      <Button 
                        className="w-full bg-green-500 hover:bg-green-600 text-white"
                        onClick={handleWalletSave}
                        disabled={updating}
                      >
                        {updating ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                        Guardar Cambios
                      </Button>
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Tab Perfil */}
                <TabsContent value="profile">
                  <Card>
                    <CardHeader>
                      <CardTitle>Información de Perfil</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <Label htmlFor="username">Usuario</Label>
                        <Input 
                          id="username" 
                          value={userProfile?.username || ''} 
                          className="mt-1 bg-gray-100"
                          readOnly
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="first-name">Nombres</Label>
                          <Input 
                            id="first-name" 
                            value={profileData.firstName}
                            onChange={(e) => setProfileData({...profileData, firstName: e.target.value})}
                            className="mt-1"
                          />
                        </div>
                        <div>
                          <Label htmlFor="last-name">Apellidos</Label>
                          <Input 
                            id="last-name" 
                            value={profileData.lastName}
                            onChange={(e) => setProfileData({...profileData, lastName: e.target.value})}
                            className="mt-1"
                          />
                        </div>
                      </div>
                      <Button 
                        className="w-full bg-green-500 hover:bg-green-600 text-white"
                        onClick={handleProfileSave}
                        disabled={updating}
                      >
                        {updating ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                        Guardar Cambios
                      </Button>
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Tab Contacto */}
                <TabsContent value="contact">
                  <Card>
                    <CardHeader>
                      <CardTitle>Información de Contacto</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="address">Dirección</Label>
                          <Input 
                            id="address" 
                            value={contactData.address}
                            onChange={(e) => setContactData({...contactData, address: e.target.value})}
                            className="mt-1"
                          />
                        </div>
                        <div>
                          <Label htmlFor="city">Ciudad/Provincia</Label>
                          <Input 
                            id="city" 
                            value={contactData.city}
                            onChange={(e) => setContactData({...contactData, city: e.target.value})}
                            className="mt-1"
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="state">Departamento/Estado</Label>
                          <Input 
                            id="state" 
                            value={contactData.state}
                            onChange={(e) => setContactData({...contactData, state: e.target.value})}
                            className="mt-1"
                          />
                        </div>
                        <div>
                          <Label htmlFor="country">País</Label>
                          <Select 
                            value={contactData.country}
                            onValueChange={(value) => setContactData({...contactData, country: value})}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="colombia">Colombia</SelectItem>
                              <SelectItem value="mexico">México</SelectItem>
                              <SelectItem value="argentina">Argentina</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="email">Email/Correo</Label>
                          <Input 
                            id="email" 
                            value={contactData.email}
                            onChange={(e) => setContactData({...contactData, email: e.target.value})}
                            className="mt-1"
                          />
                        </div>
                        <div>
                          <Label htmlFor="phone">Teléfono/Celular</Label>
                          <Input 
                            id="phone" 
                            value={contactData.phone}
                            onChange={(e) => setContactData({...contactData, phone: e.target.value})}
                            className="mt-1"
                          />
                        </div>
                      </div>
                      <Button 
                        className="w-full bg-green-500 hover:bg-green-600 text-white"
                        onClick={handleContactSave}
                        disabled={updating}
                      >
                        {updating ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                        Guardar Cambios
                      </Button>
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Tab Contraseñas */}
                <TabsContent value="password">
                  <Card>
                    <CardHeader>
                      <CardTitle>Cambiar Contraseña</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="new-password">Nueva Contraseña (Opcional)</Label>
                          <div className="relative">
                            <Input 
                              id="new-password" 
                              type={showNewPassword ? "text" : "password"}
                              placeholder="****"
                              value={passwordData.newPassword}
                              onChange={(e) => setPasswordData({...passwordData, newPassword: e.target.value})}
                              className="mt-1 pr-10"
                            />
                            <button
                              type="button"
                              onClick={() => setShowNewPassword(!showNewPassword)}
                              className="absolute right-3 top-1/2 transform -translate-y-1/2"
                            >
                              {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </button>
                          </div>
                        </div>
                        <div>
                          <Label htmlFor="confirm-password">Confirmar Nueva Contraseña</Label>
                          <div className="relative">
                            <Input 
                              id="confirm-password" 
                              type={showConfirmPassword ? "text" : "password"}
                              placeholder="****"
                              value={passwordData.confirmPassword}
                              onChange={(e) => setPasswordData({...passwordData, confirmPassword: e.target.value})}
                              className="mt-1 pr-10"
                            />
                            <button
                              type="button"
                              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                              className="absolute right-3 top-1/2 transform -translate-y-1/2"
                            >
                              {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </button>
                          </div>
                        </div>
                      </div>
                      <Button 
                        className="w-full bg-green-500 hover:bg-green-600 text-white"
                        onClick={handlePasswordSave}
                        disabled={updating}
                      >
                        {updating ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                        Guardar Cambios
                      </Button>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
};

export default Profile;
