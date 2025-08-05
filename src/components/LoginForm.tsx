
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
    <div className="min-h-screen relative overflow-hidden">
      {/* Background with financial charts */}
      <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-gray-800 to-black">
        <div className="absolute inset-0 opacity-30">
          <div className="absolute top-1/4 left-1/4 w-96 h-64 bg-gradient-to-r from-green-400/20 to-emerald-500/20 rounded-lg transform rotate-12"></div>
          <div className="absolute bottom-1/4 right-1/4 w-80 h-48 bg-gradient-to-r from-green-500/20 to-teal-400/20 rounded-lg transform -rotate-12"></div>
        </div>
        {/* Green overlay gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-green-400/80 via-green-500/70 to-emerald-600/80"></div>
      </div>

      <div className="relative z-10 min-h-screen flex">
        {/* Left side - Model with headset (hidden on mobile/tablet) */}
        <div className="hidden lg:flex lg:w-1/2 items-center justify-start pl-16">
          <div className="relative">
            <img 
              src="/lovable-uploads/21fedf2f-604a-4148-a71f-5e0c6a7449b6.png" 
              alt="Customer Service Representative" 
              className="w-96 h-auto object-cover"
            />
          </div>
        </div>

        {/* Right side - Login Form */}
        <div className="w-full lg:w-1/2 flex items-center justify-center p-6 lg:p-8 lg:pr-16">
          <Card className="w-full max-w-md shadow-2xl border-0 backdrop-blur-sm bg-green-800/90">
            <CardContent className="p-8">
              <div className="text-center mb-8">
                <div className="mb-4">
                  <h1 className="text-2xl font-bold text-yellow-400 mb-1">
                    INVERT<span className="text-white">GOLD</span>
                  </h1>
                  <p className="text-xs text-white/60 uppercase tracking-wide">
                    EL ORO, INVERSIÓN INTELIGENTE.
                  </p>
                </div>
                <h2 className="text-xl font-semibold text-white mb-2">
                  InvertGold Inversiones
                </h2>
                <p className="text-white/70 text-sm">Inicia sesión en tu cuenta</p>
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
                  className="h-12 px-4 bg-white/90 border-0 rounded-lg text-gray-900 placeholder:text-gray-500 focus:ring-2 focus:ring-green-400"
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
                    className="h-12 px-4 pr-12 bg-white/90 border-0 rounded-lg text-gray-900 placeholder:text-gray-500 focus:ring-2 focus:ring-green-400"
                    required
                    disabled={isLoading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
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
                    className="w-4 h-4 text-green-400 bg-white border-gray-300 rounded focus:ring-green-400"
                    disabled={isLoading}
                  />
                  <span className="ml-2 text-sm text-white/80">Recordarme</span>
                </label>
                <button
                  type="button"
                  className="text-sm text-white/80 hover:text-white underline"
                  disabled={isLoading}
                >
                  ¿Olvidaste tu contraseña?
                </button>
              </div>

              <Button
                type="submit"
                className="w-full h-12 bg-green-400 hover:bg-green-500 text-white font-medium rounded-lg transition-all duration-200 shadow-lg"
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
    </div>
  );
};

export default LoginForm;
