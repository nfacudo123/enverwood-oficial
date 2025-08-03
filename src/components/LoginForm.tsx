
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
    <div className="min-h-screen bg-gradient-to-br from-success-dark/10 to-success/5 flex">
      {/* Left side - Illustration (hidden on mobile/tablet) */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-success-dark to-success items-center justify-center p-8">
        <div className="max-w-md text-center text-white">
          <div className="mb-8 relative">
            <img 
              src="/lovable-uploads/fc42ffcb-03d0-497d-8086-09c100b9a570.png" 
              alt="InvertGold Representative" 
              className="w-80 h-80 mx-auto object-cover rounded-full shadow-2xl border-4 border-white/20"
            />
          </div>
        </div>
      </div>

      {/* Right side - Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 lg:p-8 bg-gradient-to-bl from-white to-success/5">
        <Card className="w-full max-w-md shadow-elegant border border-success-dark/50 bg-success-dark/95 backdrop-blur-sm">
          <CardContent className="p-8">
            <div className="text-center mb-8">
              <img src="/lovable-uploads/015e7117-dc93-4a71-ac60-25cbf3535efb.png" alt="InvertGold" className="h-12 mx-auto mb-4" />
              <h1 className="text-2xl lg:text-3xl font-bold text-white mb-2">
                InvertGold Inversiones
              </h1>
              <p className="text-white/70">Inicia sesión en tu cuenta</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <label htmlFor="email" className="text-sm font-medium text-white">
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
                <label htmlFor="password" className="text-sm font-medium text-white">
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
                  <span className="ml-2 text-sm text-white/70">Recordarme</span>
                </label>
                <button
                  type="button"
                  className="text-sm text-white/80 hover:text-white font-medium"
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
