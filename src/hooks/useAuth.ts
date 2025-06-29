
import { useState } from 'react';
import Swal from 'sweetalert2';

interface LoginCredentials {
  email: string;
  password: string;
}

interface User {
  id?: string;
  email: string;
  name?: string;
}

export const useAuth = () => {
  const [isLoading, setIsLoading] = useState(false);

  const login = async (credentials: LoginCredentials): Promise<boolean> => {
    setIsLoading(true);
    
    try {
      console.log('Enviando solicitud de login a:', 'http://localhost:4000/api/auth/login');
      console.log('Credenciales:', credentials);
      
      const response = await fetch('http://localhost:4000/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials),
      });

      console.log('Respuesta del servidor:', response.status);
      
      if (response.ok) {
        const data = await response.json();
        console.log('Datos recibidos:', data);
        
        // Guardar token y datos del username
        if (data.token) {
          localStorage.setItem('token', data.token);
          localStorage.setItem('idUser', data.userId);
        }
        
        const user: User = {
          id: data.user?.id,
          email: credentials.email,
          name: data.user?.name
        };
        
        localStorage.setItem('user', JSON.stringify(user));
        
        // Mostrar alerta de éxito
        await Swal.fire({
          icon: 'success',
          title: '¡Bienvenido!',
          text: 'Has iniciado sesión correctamente',
          timer: 2000,
          showConfirmButton: false,
          background: '#fff',
          color: '#333',
        });
        
        return true;
      } else {
        const errorData = await response.json().catch(() => ({ message: 'Error de servidor' }));
        console.log('Error del servidor:', errorData);
        
        // Mostrar alerta de error
        await Swal.fire({
          icon: 'error',
          title: 'Error de autenticación',
          text: errorData.message || 'Credenciales incorrectas. Por favor verifica tu email y contraseña.',
          confirmButtonText: 'Intentar de nuevo',
          confirmButtonColor: '#5b73e8',
          background: '#fff',
          color: '#333',
        });
        
        return false;
      }
    } catch (error) {
      console.error('Error de conexión:', error);
      
      // Mostrar alerta de error de conexión
      await Swal.fire({
        icon: 'error',
        title: 'Error de conexión',
        text: 'No se pudo conectar al servidor. Verifica que el backend esté ejecutándose en http://localhost:4000',
        confirmButtonText: 'Entendido',
        confirmButtonColor: '#5b73e8',
        background: '#fff',
        color: '#333',
      });
      
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('idUser');
    localStorage.removeItem('user');
  };

  const isAuthenticated = (): boolean => {
    return !!localStorage.getItem('token');
  };

  return {
    login,
    logout,
    isAuthenticated,
    isLoading
  };
};
