
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
    <div className="min-h-screen bg-gradient-to-br from-success/5 to-success/10 flex">
      {/* Left side - Illustration (hidden on mobile/tablet) */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-success to-success-dark items-center justify-center p-8">
        <div className="max-w-md text-center text-white">
          <div className="mb-8 relative">
            <div className="w-80 h-80 mx-auto relative">
              {/* Security Lock Icon */}
              <div className="absolute top-8 left-8 w-16 h-16 bg-success-light rounded-full flex items-center justify-center shadow-lg">
                <Lock className="w-8 h-8 text-white" />
              </div>
              
              {/* Phone mockup */}
              <div className="absolute top-16 right-8 w-48 h-80 bg-white rounded-3xl shadow-2xl overflow-hidden">
                <div className="h-6 bg-gray-800 rounded-t-3xl flex items-center justify-center">
                  <div className="w-2 h-2 bg-gray-600 rounded-full"></div>
                </div>
                <div className="p-6 h-full bg-gradient-to-br from-success-light to-success">
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
                <div className="w-full h-full bg-gradient-to-t from-success-dark to-success relative overflow-hidden">
                  <div className="absolute top-8 left-1/2 transform -translate-x-1/2 w-8 h-8 bg-success-light rounded-full"></div>
                  <div className="absolute bottom-16 left-1/2 transform -translate-x-1/2 w-12 h-16 bg-success rounded-lg"></div>
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
        <Card className="w-full max-w-md shadow-elegant border border-success/20 bg-white/95 backdrop-blur-sm">
          <CardContent className="p-8">
            <div className="text-center mb-8">
              <img src="/lovable-uploads/015e7117-dc93-4a71-ac60-25cbf3535efb.png" alt="InvertGold" className="h-12 mx-auto mb-4" />
              <h1 className="text-2xl lg:text-3xl font-bold text-success-dark mb-2">
                InvertGold Inversiones
              </h1>
              <p className="text-success/70">Inicia sesión en tu cuenta</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <label htmlFor="email" className="text-sm font-medium text-success-dark">
                  Correo electrónico
                </label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="ejemplo@gmail.com"
                  className="h-12 px-4 border-success/30 focus:border-success focus:ring-success/30"
                  required
                  disabled={isLoading}
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="password" className="text-sm font-medium text-success-dark">
                  Contraseña
                </label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••"
                    className="h-12 px-4 pr-12 border-success/30 focus:border-success focus:ring-success/30"
                    required
                    disabled={isLoading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-success/60 hover:text-success"
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
                    className="w-4 h-4 text-success border-success/30 rounded focus:ring-success/30"
                    disabled={isLoading}
                  />
                  <span className="ml-2 text-sm text-success/70">Recordarme</span>
                </label>
                <button
                  type="button"
                  className="text-sm text-success hover:text-success-dark font-medium"
                  disabled={isLoading}
                >
                  ¿Olvidaste tu contraseña?
                </button>
              </div>

              <Button
                type="submit"
                className="w-full h-12 bg-gradient-to-r from-success to-success-dark text-white font-medium rounded-lg hover:from-success-dark hover:to-success transition-all duration-200 shadow-lg hover:shadow-success/30"
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
