
import React, { useState, useEffect } from 'react';
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from '@/components/AppSidebar';
import { SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

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

const Profile = () => {
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

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
          <div className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
            <SidebarTrigger className="-ml-1" />
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <h1 className="text-xl font-semibold text-gray-900">
                  Perfil de Usuario
                </h1>
              </div>
            </div>
          </div>

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
                      <div className="flex justify-center mb-4">
                        <Button className="bg-green-500 hover:bg-green-600 text-white px-8 py-2">
                          Solicitar Token para cambio de Perfil
                        </Button>
                      </div>
                      <CardTitle>Información de la Wallet</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <Label htmlFor="wallet-address">Dirección Wallet USDT(TRC20)</Label>
                        <Input 
                          id="wallet-address" 
                          value={userProfile?.walletAddress || ''} 
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <Label htmlFor="validation-token">Token para validar cambios en perfil</Label>
                        <Input 
                          id="validation-token" 
                          className="mt-1"
                        />
                      </div>
                      <Button className="w-full bg-green-500 hover:bg-green-600 text-white">
                        Guardar Cambios
                      </Button>
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Tab Perfil */}
                <TabsContent value="profile">
                  <Card>
                    <CardHeader>
                      <div className="flex justify-center mb-4">
                        <Button className="bg-green-500 hover:bg-green-600 text-white px-8 py-2">
                          Solicitar Token para cambio de Perfil
                        </Button>
                      </div>
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
                            value={userProfile?.firstName || ''} 
                            className="mt-1"
                          />
                        </div>
                        <div>
                          <Label htmlFor="last-name">Apellidos</Label>
                          <Input 
                            id="last-name" 
                            value={userProfile?.lastName || ''} 
                            className="mt-1"
                          />
                        </div>
                      </div>
                      <div>
                        <Label htmlFor="profile-token">Token para validar cambios en perfil</Label>
                        <Input 
                          id="profile-token" 
                          className="mt-1"
                        />
                      </div>
                      <Button className="w-full bg-green-500 hover:bg-green-600 text-white">
                        Guardar Cambios
                      </Button>
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Tab Contacto */}
                <TabsContent value="contact">
                  <Card>
                    <CardHeader>
                      <div className="flex justify-center mb-4">
                        <Button className="bg-green-500 hover:bg-green-600 text-white px-8 py-2">
                          Solicitar Token para cambio de Perfil
                        </Button>
                      </div>
                      <CardTitle>Información de Contacto</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="address">Dirección</Label>
                          <Input 
                            id="address" 
                            value={userProfile?.address || ''} 
                            className="mt-1"
                          />
                        </div>
                        <div>
                          <Label htmlFor="city">Ciudad/Provincia</Label>
                          <Input 
                            id="city" 
                            value={userProfile?.city || ''} 
                            className="mt-1"
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="state">Departamento/Estado</Label>
                          <Input 
                            id="state" 
                            value={userProfile?.state || ''} 
                            className="mt-1"
                          />
                        </div>
                        <div>
                          <Label htmlFor="country">País</Label>
                          <Select value={userProfile?.country || ''}>
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
                            value={userProfile?.email || ''} 
                            className="mt-1"
                          />
                        </div>
                        <div>
                          <Label htmlFor="phone">Teléfono/Celular</Label>
                          <Input 
                            id="phone" 
                            value={userProfile?.phone || ''} 
                            className="mt-1"
                          />
                        </div>
                      </div>
                      <div>
                        <Label htmlFor="contact-token">Token para validar cambios en perfil</Label>
                        <Input 
                          id="contact-token" 
                          className="mt-1"
                        />
                      </div>
                      <Button className="w-full bg-green-500 hover:bg-green-600 text-white">
                        Guardar Cambios
                      </Button>
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Tab Contraseñas */}
                <TabsContent value="password">
                  <Card>
                    <CardHeader>
                      <div className="flex justify-center mb-4">
                        <Button className="bg-green-500 hover:bg-green-600 text-white px-8 py-2">
                          Solicitar Token para cambio de Perfil
                        </Button>
                      </div>
                      <CardTitle>Información de Contraseña</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-3 gap-4">
                        <div>
                          <Label htmlFor="current-password">Contraseña Anterior</Label>
                          <div className="relative">
                            <Input 
                              id="current-password" 
                              type={showCurrentPassword ? "text" : "password"}
                              placeholder="****"
                              className="mt-1 pr-10"
                            />
                            <button
                              type="button"
                              onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                              className="absolute right-3 top-1/2 transform -translate-y-1/2"
                            >
                              {showCurrentPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </button>
                          </div>
                        </div>
                        <div>
                          <Label htmlFor="new-password">Nueva Contraseña</Label>
                          <div className="relative">
                            <Input 
                              id="new-password" 
                              type={showNewPassword ? "text" : "password"}
                              placeholder="****"
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
                          <Label htmlFor="confirm-password">Confirmar Contraseña</Label>
                          <div className="relative">
                            <Input 
                              id="confirm-password" 
                              type={showConfirmPassword ? "text" : "password"}
                              placeholder="****"
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
                      <div>
                        <Label htmlFor="password-token">Token para validar cambios en perfil</Label>
                        <Input 
                          id="password-token" 
                          className="mt-1"
                        />
                      </div>
                      <Button className="w-full bg-green-500 hover:bg-green-600 text-white">
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
