import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Eye, EyeOff } from "lucide-react";
import Swal from 'sweetalert2';
import { apiUrl } from '@/lib/config';

const Signup = () => {
  const { username } = useParams();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [sponsorId, setSponsorId] = useState<number | null>(null);
  const [paises, setPaises] = useState<Array<{ id: number; nombre: string }>>([]);
  const [formData, setFormData] = useState({
    name: '',
    apellidos: '',
    username: '',
    email: '',
    pais_id: '',
    telefono: '',
    password: '',
    confirmPassword: '',
    acceptTerms: false
  });

  // Función para obtener países desde la API
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
  }, []);

  // Función para obtener el sponsorId basado en el username
  useEffect(() => {
    const fetchSponsorId = async () => {
      if (username) {
        try {
          console.log('Obteniendo sponsorId para username:', username);
          const response = await fetch(apiUrl(`/api/users/u/${username}`));
          
          if (response.ok) {
            const userData = await response.json();
            console.log('Datos del sponsor encontrados:', userData);
            console.log('ID del sponsor:', userData.id);
            setSponsorId(userData.id);
          } else {
            console.error('No se pudo obtener el sponsorId para el username:', username);
            setSponsorId(null);
          }
        } catch (error) {
          console.error('Error al obtener sponsorId:', error);
          setSponsorId(null);
        }
      }
    };

    fetchSponsorId();
  }, [username]);

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validación de contraseñas
    if (formData.password !== formData.confirmPassword) {
      await Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Las contraseñas no coinciden',
        confirmButtonColor: '#5b73e8',
      });
      return;
    }

    // Validación de términos
    if (!formData.acceptTerms) {
      await Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Debes aceptar los términos y condiciones',
        confirmButtonColor: '#5b73e8',
      });
      return;
    }

    // Preparar datos para envío - asegurándose de incluir sponsorId
    const registrationData = {
      name: formData.name,
      apellidos: formData.apellidos,
      username: formData.username,
      email: formData.email,
      password: formData.password,
      pais_id: parseInt(formData.pais_id),
      telefono: formData.telefono,
      sponsorId: sponsorId // Esto debe ser el ID numérico del sponsor
    };

    try {
      console.log('Enviando datos de registro con sponsorId:', registrationData);
      console.log('SponsorId siendo enviado:', sponsorId);
      
      const response = await fetch(apiUrl('/api/auth/register'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(registrationData),
      });

      if (response.ok) {
        const data = await response.json();
        console.log('Registro exitoso:', data);
        
        await Swal.fire({
          icon: 'success',
          title: '¡Registro exitoso!',
          text: 'Tu cuenta ha sido creada correctamente',
          confirmButtonColor: '#5b73e8',
        });
        
        // Redireccionar al login
        window.location.href = '/';
      } else {
        const errorData = await response.json().catch(() => ({ message: 'Error de servidor' }));
        console.error('Error en el registro:', errorData);
        
        await Swal.fire({
          icon: 'error',
          title: 'Error en el registro',
          text: errorData.message || 'Ha ocurrido un error durante el registro',
          confirmButtonColor: '#5b73e8',
        });
      }
    } catch (error) {
      console.error('Error de conexión:', error);
      
      await Swal.fire({
        icon: 'error',
        title: 'Error de conexión',
        text: 'No se pudo conectar al servidor. Verifica tu conexión a internet.',
        confirmButtonColor: '#5b73e8',
      });
    }
  };

  const codigosPais = [
    { codigo: '+355', pais: 'Albania' },
    { codigo: '+93', pais: 'Afganistán' },
    { codigo: '+54', pais: 'Argentina' },
    { codigo: '+55', pais: 'Brasil' },
    { codigo: '+57', pais: 'Colombia' },
    { codigo: '+34', pais: 'España' },
    { codigo: '+1', pais: 'Estados Unidos' },
    { codigo: '+33', pais: 'Francia' },
    { codigo: '+52', pais: 'México' },
    { codigo: '+51', pais: 'Perú' },
    { codigo: '+58', pais: 'Venezuela' }
  ];

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-md space-y-6">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center">
            <img src="/lovable-uploads/394439db-ab1d-41f3-b2af-ebc4055c72d3.png" alt="InvertGold" className="w-12 h-12" />
            <span className="ml-3 text-white text-2xl font-semibold">InvertGold</span>
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">Crear Cuenta</h1>
            <p className="text-gray-400 mt-2">Completa el formulario para registrarte</p>
          </div>
        </div>

        {/* Referido por */}
        {username && (
          <div className="bg-gray-800 rounded-lg p-4">
            <div className="text-center">
              <p className="text-gray-300">Referido por: <span className="text-blue-400">{username}</span></p>
              
            </div>
          </div>
        )}

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Campo oculto para sponsorId */}
          {sponsorId && (
            <input type="hidden" name="sponsorId" value={sponsorId} />
          )}

          {/* Nombres */}
          <div>
            <Label htmlFor="name" className="text-white">Nombres</Label>
            <Input
              id="name"
              type="text"
              placeholder="Ingresar Nombre completo"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              className="bg-gray-800 border-gray-700 text-white placeholder-gray-500"
              required
            />
          </div>

          {/* Apellidos */}
          <div>
            <Label htmlFor="apellidos" className="text-white">Apellidos</Label>
            <Input
              id="apellidos"
              type="text"
              placeholder="Ingresar apellidos completos"
              value={formData.apellidos}
              onChange={(e) => handleInputChange('apellidos', e.target.value)}
              className="bg-gray-800 border-gray-700 text-white placeholder-gray-500"
              required
            />
          </div>

          {/* Nombre de usuario */}
          <div>
            <Label htmlFor="username" className="text-white">Nombre de usuario</Label>
            <Input
              id="username"
              type="text"
              placeholder="Usuario"
              value={formData.username}
              onChange={(e) => handleInputChange('username', e.target.value)}
              className="bg-gray-800 border-gray-700 text-white placeholder-gray-500"
              required
            />
          </div>

          {/* Correo Electrónico */}
          <div>
            <Label htmlFor="email" className="text-white">Correo Electrónico</Label>
            <Input
              id="email"
              type="email"
              placeholder="Email"
              value={formData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              className="bg-gray-800 border-gray-700 text-white placeholder-gray-500"
              required
            />
          </div>

          {/* País */}
          <div>
            <Label htmlFor="pais" className="text-white">País</Label>
            <Select value={formData.pais_id} onValueChange={(value) => handleInputChange('pais_id', value)}>
              <SelectTrigger className="bg-gray-800 border-gray-700 text-white">
                <SelectValue placeholder="Seleccionar país" />
              </SelectTrigger>
              <SelectContent className="bg-gray-800 border-gray-700">
                {paises.map((pais) => (
                  <SelectItem key={pais.id} value={pais.id.toString()} className="text-white hover:bg-gray-700">
                    {pais.nombre}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Teléfono o Whatsapp */}
          <div>
            <Label htmlFor="telefono" className="text-white">Teléfono o Whatsapp</Label>
            <div className="flex space-x-2">
              <Select defaultValue="+57">
                <SelectTrigger className="bg-gray-800 border-gray-700 text-white w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-gray-800 border-gray-700">
                  {codigosPais.map((item) => (
                    <SelectItem key={item.codigo} value={item.codigo} className="text-white hover:bg-gray-700">
                      {item.codigo}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Input
                id="telefono"
                type="tel"
                placeholder="Whatsapp"
                value={formData.telefono}
                onChange={(e) => handleInputChange('telefono', e.target.value)}
                className="bg-gray-800 border-gray-700 text-white placeholder-gray-500 flex-1"
                required
              />
            </div>
          </div>

          {/* Contraseña */}
          <div>
            <Label htmlFor="password" className="text-white">Contraseña</Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="Contraseña"
                value={formData.password}
                onChange={(e) => handleInputChange('password', e.target.value)}
                className="bg-gray-800 border-gray-700 text-white placeholder-gray-500 pr-10"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-300"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          {/* Confirmar Contraseña */}
          <div>
            <Label htmlFor="confirmPassword" className="text-white">Confirmar Contraseña</Label>
            <div className="relative">
              <Input
                id="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                placeholder="Confirmar Contraseña"
                value={formData.confirmPassword}
                onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                className="bg-gray-800 border-gray-700 text-white placeholder-gray-500 pr-10"
                required
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-300"
              >
                {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          {/* Términos y condiciones */}
          <div className="flex items-center space-x-2">
            <Checkbox
              id="terms"
              checked={formData.acceptTerms}
              onCheckedChange={(checked) => handleInputChange('acceptTerms', !!checked)}
              className="border-gray-700 data-[state=checked]:bg-green-500"
            />
            <label htmlFor="terms" className="text-gray-300 text-sm">
              Estoy de acuerdo y acepto los Términos y condiciones.
            </label>
          </div>

          {/* Ya tienes una cuenta */}
          <div className="text-center">
            <p className="text-gray-400">
              ¿Ya tienes una cuenta?{' '}
              <Link to="/" className="text-green-400 hover:text-green-300">
                Ingresar
              </Link>
            </p>
          </div>

          {/* Botón de registro */}
          <Button
            type="submit"
            className="w-full bg-white text-gray-900 hover:bg-gray-100 font-medium py-3"
          >
            CREAR CUENTA
          </Button>
        </form>
      </div>
    </div>
  );
};

export default Signup;
