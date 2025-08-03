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
import { Checkbox } from "@/components/ui/checkbox";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ChevronDown, Eye, EyeOff, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { UserNavbar } from '@/components/UserNavbar';
import { apiUrl } from '@/lib/config';

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
  foto?: string;
}

interface PaymentMethod {
  id: number;
  titulo: string;
  img_qr: string;
  dato: string;
}

const Profile = () => {
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updating, setUpdating] = useState(false);
  const [paises, setPaises] = useState<Array<{ id: number; nombre: string }>>([]);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [selectedPaymentMethods, setSelectedPaymentMethods] = useState<string[]>([]);
  const [paymentMethodValues, setPaymentMethodValues] = useState<{ [key: string]: string }>({});
  const [paymentMethodsOpen, setPaymentMethodsOpen] = useState(false);
  const { toast } = useToast();

  // Estados para los formularios
  const [profileData, setProfileData] = useState({
    firstName: '',
    lastName: '',
    foto: null as File | null
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
    walletAddress: '',
    selectedMethods: '',
    methodValues: ''
  });
  
  const [passwordData, setPasswordData] = useState({
    newPassword: '',
    confirmPassword: ''
  });

  useEffect(() => {
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
    
    fetchPaises();
    fetchPaymentMethods();
  }, []);

  const fetchPaymentMethods = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(apiUrl('/api/metodo_pago'), {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setPaymentMethods(data);
      }
    } catch (error) {
      console.error('Error fetching payment methods:', error);
    }
  };

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          setError('No se encontró token de autenticación');
          console.log('No token found in localStorage');
          return;
        }

        console.log('Token found:', token);
        console.log('Fetching user profile from:', apiUrl('/api/perfil'));
        
        const response = await fetch(apiUrl('/api/perfil'), {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        console.log('Profile GET response status:', response.status);
        console.log('Profile GET response headers:', response.headers);

        if (response.ok) {
          const data = await response.json();
          console.log('Profile data received:', data);
          
          // Mapear los datos de la API al formato del interface UserProfile
          const mappedProfile = {
            id: data.id,
            username: data.username,
            firstName: data.name,
            lastName: data.apellidos,
            email: data.email,
            phone: data.telefono,
            address: data.direccion,
            city: data.ciudad,
            state: data.estado,
            country: data.pais_id?.toString(),
            walletAddress: data.wallet_usdt,
            foto: data.foto
          };
          
          setUserProfile(mappedProfile);
          
          // Inicializar los estados con los datos del usuario según el JSON del API
          setProfileData({
            firstName: data.name || '',
            lastName: data.apellidos || '',
            foto: null
          });
          
          setContactData({
            address: data.direccion || '',
            city: data.ciudad || '',
            state: data.estado || '',
            country: data.pais_id?.toString() || '',
            email: data.email || '',
            phone: data.telefono || ''
          });
          
          setWalletData({
            walletAddress: data.wallet_usdt || '',
            selectedMethods: data.met_pago || '',
            methodValues: data.wallet_usdt || ''
          });

          // Parse existing payment methods if they exist
          if (data.met_pago) {
            const existingMethods = data.met_pago.split(', ');
            setSelectedPaymentMethods(existingMethods);
            
            // Parse existing values if they exist
            if (data.wallet_usdt) {
              const existingValues = data.wallet_usdt.split(', ');
              const valuesMap: { [key: string]: string } = {};
              existingMethods.forEach((method, index) => {
                valuesMap[method] = existingValues[index] || '';
              });
              setPaymentMethodValues(valuesMap);
            }
          }
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

  const updateProfile = async (updateData: any) => {
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

      console.log('Updating profile with data:', updateData);
      console.log('Using Bearer token:', token);

      const response = await fetch(apiUrl('/api/perfil/update'), {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData),
      });

      console.log('Update PUT response status:', response.status);
      const result = await response.json();
      console.log('Update PUT response data:', result);

      if (response.ok) {
        toast({
          title: "Éxito",
          description: "Perfil actualizado correctamente",
        });
        
        // Recargar los datos del perfil después de la actualización
        const profileResponse = await fetch(apiUrl('/api/perfil'), {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        if (profileResponse.ok) {
          const updatedData = await profileResponse.json();
          console.log('Updated profile data after PUT:', updatedData);
          setUserProfile(updatedData);
          
          // Actualizar estados locales según el JSON del API
          setProfileData({
            firstName: updatedData.name || '',
            lastName: updatedData.apellidos || '',
            foto: null
          });
          
          setContactData({
            address: updatedData.direccion || '',
            city: updatedData.ciudad || '',
            state: updatedData.estado || '',
            country: updatedData.pais_id?.toString() || '',
            email: updatedData.email || '',
            phone: updatedData.telefono || ''
          });
          
          setWalletData({
            walletAddress: updatedData.wallet_usdt || '',
            selectedMethods: updatedData.met_pago || '',
            methodValues: updatedData.wallet_usdt || ''
          });

          // Parse updated payment methods if they exist
          if (updatedData.met_pago) {
            const existingMethods = updatedData.met_pago.split(', ');
            setSelectedPaymentMethods(existingMethods);
            
            // Parse updated values if they exist
            if (updatedData.wallet_usdt) {
              const existingValues = updatedData.wallet_usdt.split(', ');
              const valuesMap: { [key: string]: string } = {};
              existingMethods.forEach((method, index) => {
                valuesMap[method] = existingValues[index] || '';
              });
              setPaymentMethodValues(valuesMap);
            }
          }
        }
      } else {
        console.error('Update failed:', result);
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
    console.log('Saving wallet data:', walletData);
    
    // Prepare the values string
    const currentSelected = selectedPaymentMethods || [];
    const currentValues = paymentMethodValues || {};
    const methodValuesArray = currentSelected.map(method => currentValues[method] || '');
    const methodValuesString = methodValuesArray.join(', ');
    const selectedMethodsString = currentSelected.join(', ');
    
    updateProfile({
      wallet_usdt: methodValuesString,
      met_pago: selectedMethodsString
    });
  };

  const handlePaymentMethodToggle = (methodTitle: string) => {
    setSelectedPaymentMethods(prev => {
      const currentSelected = prev || [];
      const isSelected = currentSelected.includes(methodTitle);
      let newSelected;
      
      if (isSelected) {
        newSelected = currentSelected.filter(method => method !== methodTitle);
        // Remove the value for this method
        setPaymentMethodValues(prevValues => {
          const newValues = { ...(prevValues || {}) };
          delete newValues[methodTitle];
          return newValues;
        });
      } else {
        newSelected = [...currentSelected, methodTitle];
      }
      
      return newSelected;
    });
  };

  const handlePaymentMethodValueChange = (methodTitle: string, value: string) => {
    setPaymentMethodValues(prev => ({
      ...(prev || {}),
      [methodTitle]: value
    }));
  };

  const uploadPhoto = async () => {
    if (!profileData.foto) return;
    
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

      // Obtener el ID del usuario del perfil
      const userId = userProfile?.id;
      if (!userId) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "No se pudo obtener el ID del usuario",
        });
        return;
      }

      const reader = new FileReader();
      reader.onloadend = async () => {
        try {
          const base64String = reader.result as string;
          const photoData = base64String.split(',')[1]; // Remover el prefijo data:image/...;base64,
          
          const response = await fetch(apiUrl(`/api/perfil/foto/${userId}`), {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ foto: photoData }),
          });

          if (response.ok) {
            toast({
              title: "Éxito",
              description: "Foto de perfil actualizada correctamente",
            });
          } else {
            const errorData = await response.json();
            toast({
              variant: "destructive",
              title: "Error",
              description: errorData.message || "Error al subir la foto",
            });
          }
        } catch (error) {
          console.error('Error uploading photo:', error);
          toast({
            variant: "destructive",
            title: "Error",
            description: "Error al subir la foto",
          });
        }
      };
      
      reader.readAsDataURL(profileData.foto);
    } catch (error) {
      console.error('Error uploading photo:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Error al procesar la imagen",
      });
    }
  };

  const handleProfileSave = async () => {
    console.log('Saving profile data:', profileData);
    
    // Subir foto por separado si existe
    if (profileData.foto) {
      await uploadPhoto();
    }
    
    // Actualizar nombre y apellidos
    updateProfile({
      name: profileData.firstName,
      apellidos: profileData.lastName
    });
  };

  const handlePhotoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validar que sea una imagen
      if (file.type.startsWith('image/')) {
        setProfileData({...profileData, foto: file});
        
        // Subir automáticamente la foto cuando se selecciona
        await uploadPhotoFile(file);
      } else {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Por favor selecciona un archivo de imagen válido",
        });
      }
    }
  };

  const uploadPhotoFile = async (file: File) => {
    try {
      console.log('Archivo seleccionado:', file);
      console.log('Tipo de archivo:', file.type);
      console.log('Tamaño del archivo:', file.size);
      
      const token = localStorage.getItem('token');
      if (!token) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "No se encontró token de autenticación",
        });
        return;
      }

      const userId = userProfile?.id;
      console.log('User ID:', userId);
      if (!userId) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "No se pudo obtener el ID del usuario",
        });
        return;
      }

      // Crear FormData para enviar el archivo
      const formData = new FormData();
      formData.append('foto', file);
      
      console.log('FormData creado con archivo:', file.name);
      
      const response = await fetch(apiUrl(`/api/perfil/foto/${userId}`), {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          // NO incluir Content-Type para FormData, el navegador lo establece automáticamente
        },
        body: formData,
      });

      console.log('Response status:', response.status);
      const responseText = await response.text();
      console.log('Response text:', responseText);

      let responseData;
      try {
        responseData = JSON.parse(responseText);
      } catch (e) {
        console.error('Error parsing response JSON:', e);
        responseData = { message: responseText };
      }

      if (response.ok) {
        toast({
          title: "Éxito",
          description: "Foto de perfil subida automáticamente",
        });
        
        setTimeout(() => {
          window.location.reload();
        }, 1000);
      } else {
        console.error('Error response:', responseData);
        toast({
          variant: "destructive",
          title: "Error",
          description: responseData.message || responseData.error || "Error al subir la foto",
        });
      }
    } catch (error) {
      console.error('Error uploading photo:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Error al procesar la imagen",
      });
    }
  };

  const handleContactSave = () => {
    console.log('Saving contact data:', contactData);
    
    updateProfile({
      email: contactData.email,
      pais_id: parseInt(contactData.country),
      telefono: contactData.phone,
      direccion: contactData.address,
      ciudad: contactData.city,
      estado: contactData.state
    });
  };

  const handlePasswordSave = () => {
    console.log('Attempting to save password...');
    
    // Validación mejorada según el JSON del API
    if (passwordData.newPassword.trim()) {
      if (passwordData.newPassword !== passwordData.confirmPassword) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "La nueva contraseña y su confirmación no coinciden",
        });
        return;
      }
      
      console.log('Saving new password');
      updateProfile({
        password: passwordData.newPassword,
        confirmarContrasena: passwordData.confirmPassword
      });
      
      // Limpiar campos después del intento de actualización
      setPasswordData({
        newPassword: '',
        confirmPassword: ''
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
            <UserNavbar title="Perfil de Usuario" />
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
            <UserNavbar title="Perfil de Usuario" />
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
                <div className="w-16 h-16 bg-gray-400 rounded-full flex items-center justify-center overflow-hidden">
                  {userProfile?.foto ? (
                    <img 
                      src={apiUrl(`/${userProfile.foto.replace(/\\/g, '/')}`)}	
                      alt="Profile Picture" 
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-12 h-12 bg-green-500 rounded-full"></div>
                  )}
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
                        <Label htmlFor="payment-methods">Selecciona método de Pago</Label>
                        <Popover open={paymentMethodsOpen} onOpenChange={setPaymentMethodsOpen}>
                          <PopoverTrigger asChild>
                            <Button
                              variant="outline"
                              role="combobox"
                              aria-expanded={paymentMethodsOpen}
                              className="w-full justify-between mt-1"
                            >
                              {(selectedPaymentMethods || []).length > 0
                                ? `${(selectedPaymentMethods || []).length} método(s) seleccionado(s)`
                                : "Selecciona métodos de pago"}
                              <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-4">
                            <div className="space-y-2">
                              <div className="text-sm font-medium mb-3">Selecciona métodos de pago:</div>
                              {(paymentMethods || []).map((method) => (
                                <div key={method.id} className="flex items-center space-x-2">
                                  <Checkbox
                                    id={`method-${method.id}`}
                                    checked={(selectedPaymentMethods || []).includes(method.titulo)}
                                    onCheckedChange={() => handlePaymentMethodToggle(method.titulo)}
                                  />
                                  <label
                                    htmlFor={`method-${method.id}`}
                                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                                  >
                                    {method.titulo}
                                  </label>
                                </div>
                              ))}
                              {(paymentMethods || []).length === 0 && (
                                <div className="text-sm text-gray-500">No hay métodos de pago disponibles</div>
                              )}
                            </div>
                          </PopoverContent>
                        </Popover>
                      </div>

                      {/* Dynamic inputs for selected payment methods */}
                      {(selectedPaymentMethods || []).map((methodTitle) => (
                        <div key={methodTitle}>
                          <Label htmlFor={`method-${methodTitle}`}>
                            Número de {methodTitle}
                          </Label>
                          <Input
                            id={`method-${methodTitle}`}
                            value={(paymentMethodValues || {})[methodTitle] || ''}
                            onChange={(e) => handlePaymentMethodValueChange(methodTitle, e.target.value)}
                            className="mt-1"
                            placeholder={`Ingresa tu número de ${methodTitle}`}
                          />
                        </div>
                      ))}

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
                      
                      {/* Campo para foto de perfil */}
                      <div>
                        <Label htmlFor="foto">Foto de Perfil</Label>
                        <div className="mt-1 flex items-center gap-4">
                        <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center overflow-hidden">
                          {profileData.foto ? (
                            <img 
                              src={URL.createObjectURL(profileData.foto)} 
                              alt="Preview" 
                              className="w-full h-full object-cover"
                            />
                          ) : userProfile?.foto ? (
                            <img 
                              src={apiUrl(`/${userProfile.foto.replace(/\\/g, '/')}`)}
                              alt="Profile Picture" 
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-12 h-12 bg-green-500 rounded-full"></div>
                          )}
                          </div>
                          <Input
                            id="foto"
                            type="file"
                            accept="image/*"
                            onChange={handlePhotoChange}
                            className="flex-1"
                          />
                        </div>
                        <p className="text-xs text-gray-500 mt-1">
                          Formatos permitidos: JPG, PNG, GIF. Tamaño máximo: 5MB
                        </p>
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
                          <Label htmlFor="city">Ciudad / Provincia</Label>
                          <Input 
                            id="city" 
                            value={contactData.city}
                            onChange={(e) => setContactData({...contactData, city: e.target.value})}
                            className="mt-1"
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-1 gap-4">
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
                              {paises.map((pais) => (
                                <SelectItem key={pais.id} value={pais.id.toString()}>
                                  {pais.nombre}
                                </SelectItem>
                              ))}
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
