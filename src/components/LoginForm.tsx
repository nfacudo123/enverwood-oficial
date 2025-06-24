
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Eye, EyeOff, Lock, Loader2 } from "lucide-react";
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';

const LoginForm = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  
  const { login, isLoading } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Iniciando proceso de login:', { email, password, rememberMe });
    
    const success = await login({ email, password });
    
    if (success) {
      console.log('Login exitoso, redirigiendo al dashboard');
      navigate('/dashboard');
    } else {
      console.log('Login fallido');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Left side - Illustration (hidden on mobile/tablet) */}
      <div className="hidden lg:flex lg:w-1/2 gradient-bg items-center justify-center p-8">
        <div className="max-w-md text-center text-white">
          <div className="mb-8 relative">
            <div className="w-80 h-80 mx-auto relative">
              {/* Security Lock Icon */}
              <div className="absolute top-8 left-8 w-16 h-16 bg-pink-400 rounded-full flex items-center justify-center shadow-lg">
                <Lock className="w-8 h-8 text-white" />
              </div>
              
              {/* Phone mockup */}
              <div className="absolute top-16 right-8 w-48 h-80 bg-white rounded-3xl shadow-2xl overflow-hidden">
                <div className="h-6 bg-gray-800 rounded-t-3xl flex items-center justify-center">
                  <div className="w-2 h-2 bg-gray-600 rounded-full"></div>
                </div>
                <div className="p-6 h-full bg-gradient-to-br from-orange-400 to-pink-500">
                  <div className="w-12 h-12 bg-white rounded-full mx-auto mb-4 flex items-center justify-center">
                    <div className="w-6 h-6 bg-gray-300 rounded-full"></div>
                  </div>
                  <div className="space-y-3">
                    <div className="h-8 bg-white/20 rounded-lg"></div>
                    <div className="h-8 bg-white/20 rounded-lg"></div>
                    <div className="h-10 bg-white/30 rounded-lg mt-6"></div>
                  </div>
                </div>
              </div>
              
              {/* Character illustration */}
              <div className="absolute bottom-0 left-0 w-32 h-40">
                <div className="w-full h-full bg-gradient-to-t from-purple-600 to-purple-400 rounded-t-full relative overflow-hidden">
                  <div className="absolute top-8 left-1/2 transform -translate-x-1/2 w-8 h-8 bg-purple-300 rounded-full"></div>
                  <div className="absolute bottom-16 left-1/2 transform -translate-x-1/2 w-12 h-16 bg-purple-500 rounded-lg"></div>
                </div>
              </div>
            </div>
          </div>
          <h2 className="text-3xl font-bold mb-4">Seguridad Garantizada</h2>
          <p className="text-lg opacity-90">
            Protegemos tu información con los más altos estándares de seguridad
          </p>
        </div>
      </div>

      {/* Right side - Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 lg:p-8">
        <Card className="w-full max-w-md shadow-elegant border-0">
          <CardContent className="p-8">
            <div className="text-center mb-8">
              <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-2">
                Enverwood Inversiones
              </h1>
              <p className="text-gray-600">Inicia sesión en tu cuenta</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <label htmlFor="email" className="text-sm font-medium text-gray-700">
                  Correo electrónico
                </label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="ejemplo@gmail.com"
                  className="h-12 px-4 border-gray-200 focus:border-purple-500 focus:ring-purple-500"
                  required
                  disabled={isLoading}
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="password" className="text-sm font-medium text-gray-700">
                  Contraseña
                </label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••"
                    className="h-12 px-4 pr-12 border-gray-200 focus:border-purple-500 focus:ring-purple-500"
                    required
                    disabled={isLoading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    disabled={isLoading}
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                    disabled={isLoading}
                  />
                  <span className="ml-2 text-sm text-gray-600">Recordarme</span>
                </label>
                <button
                  type="button"
                  className="text-sm text-purple-600 hover:text-purple-700 font-medium"
                  disabled={isLoading}
                >
                  ¿Olvidaste tu contraseña?
                </button>
              </div>

              <Button
                type="submit"
                className="w-full h-12 gradient-primary text-white font-medium rounded-lg hover:opacity-90 transition-opacity"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Iniciando sesión...
                  </>
                ) : (
                  'Iniciar Sesión'
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default LoginForm;
