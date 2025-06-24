
import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Eye, EyeOff, Mail } from "lucide-react";

const Signup = () => {
  const { userId } = useParams();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formData, setFormData] = useState({
    nombres: '',
    apellidos: '',
    nombreUsuario: '',
    email: '',
    confirmToken: '',
    pais: '',
    telefono: '',
    password: '',
    confirmPassword: '',
    acceptTerms: false
  });

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleGenerarCodigo = () => {
    // Lógica para generar código
    console.log('Generando código...');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Datos del formulario:', formData);
  };

  const paises = [
    'Albania', 'Afganistán', 'Argentina', 'Brasil', 'Colombia', 'España', 
    'Estados Unidos', 'Francia', 'México', 'Perú', 'Venezuela'
  ];

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
            <div className="w-12 h-12 bg-green-500 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-xl">E</span>
            </div>
            <span className="ml-3 text-white text-2xl font-semibold">enverwood</span>
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">Crear Cuenta</h1>
            <p className="text-gray-400 mt-2">Completa el formulario para registrarte</p>
          </div>
        </div>

        {/* Referido por */}
        <div className="bg-gray-800 rounded-lg p-4">
          <div className="text-center">
            <p className="text-gray-300">Referido por: <span className="text-blue-400">{userId || 'user'}</span></p>
            <p className="text-gray-500 text-sm mt-1">Puedes modificar este valor en el formulario si es necesario</p>
          </div>
        </div>

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Nombres */}
          <div>
            <Label htmlFor="nombres" className="text-white">Nombres</Label>
            <Input
              id="nombres"
              type="text"
              placeholder="Ingresar Nombre completo"
              value={formData.nombres}
              onChange={(e) => handleInputChange('nombres', e.target.value)}
              className="bg-gray-800 border-gray-700 text-white placeholder-gray-500"
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
            />
          </div>

          {/* Nombre de usuario */}
          <div>
            <Label htmlFor="nombreUsuario" className="text-white">Nombre de usuario</Label>
            <Input
              id="nombreUsuario"
              type="text"
              placeholder="gprofits"
              value={formData.nombreUsuario}
              onChange={(e) => handleInputChange('nombreUsuario', e.target.value)}
              className="bg-gray-800 border-gray-700 text-white placeholder-gray-500"
            />
          </div>

          {/* Usuario Referente */}
          <div>
            <Label htmlFor="usuarioReferente" className="text-white">Usuario Referente</Label>
            <Input
              id="usuarioReferente"
              type="text"
              value={userId || 'user'}
              readOnly
              className="bg-gray-800 border-gray-700 text-white"
            />
            <p className="text-gray-500 text-sm mt-1">Este campo se llena automáticamente desde el enlace de referido</p>
          </div>

          {/* Correo Electrónico */}
          <div>
            <Label htmlFor="email" className="text-white">Correo Electrónico</Label>
            <div className="relative">
              <Input
                id="email"
                type="email"
                placeholder="Email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                className="bg-gray-800 border-gray-700 text-white placeholder-gray-500 pl-10"
              />
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 h-4 w-4" />
              <Button
                type="button"
                onClick={handleGenerarCodigo}
                className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-red-600 hover:bg-red-700 text-white px-4 py-1 text-sm rounded"
              >
                Generar Código
              </Button>
            </div>
          </div>

          {/* Confirmar Token */}
          <div>
            <Label htmlFor="confirmToken" className="text-white">Confirmar Token</Label>
            <Input
              id="confirmToken"
              type="text"
              placeholder="Confirmar código email"
              value={formData.confirmToken}
              onChange={(e) => handleInputChange('confirmToken', e.target.value)}
              className="bg-gray-800 border-gray-700 text-white placeholder-gray-500"
            />
          </div>

          {/* País */}
          <div>
            <Label htmlFor="pais" className="text-white">País</Label>
            <Select value={formData.pais} onValueChange={(value) => handleInputChange('pais', value)}>
              <SelectTrigger className="bg-gray-800 border-gray-700 text-white">
                <SelectValue placeholder="Albania" />
              </SelectTrigger>
              <SelectContent className="bg-gray-800 border-gray-700">
                {paises.map((pais) => (
                  <SelectItem key={pais} value={pais} className="text-white hover:bg-gray-700">
                    {pais}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Teléfono o Whatsapp */}
          <div>
            <Label htmlFor="telefono" className="text-white">Teléfono o Whatsapp</Label>
            <div className="flex space-x-2">
              <Select defaultValue="+93">
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
