
import { useState, useEffect } from 'react';

interface ReferidoData {
  id: number;
  name: string;
  apellidos: string;
  username: string;
  email: string;
  nivel: number;
  parent_id: number | null;
  children: ReferidoData[];
}

export const useReferidos = () => {
  const [referidosData, setReferidosData] = useState<ReferidoData | null>(null);
  const [totalEquipo, setTotalEquipo] = useState(0);
  const [directos, setDirectos] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchReferidos = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          setError('No hay token de autenticación');
          return;
        }

        console.log('Obteniendo referidos del usuario...');
        const response = await fetch('http://localhost:4000/api/mis-referidos', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        console.log('Status de la respuesta:', response.status);
        console.log('Headers de respuesta:', response.headers);

        if (!response.ok) {
          const errorText = await response.text();
          console.error('Error en la respuesta:', errorText);
          throw new Error(`Error ${response.status}: ${response.statusText}`);
        }

        const data = await response.json();
        console.log('Datos completos recibidos:', JSON.stringify(data, null, 2));

        // Verificar diferentes estructuras posibles de respuesta
        if (data.success && data.data) {
          console.log('Estructura con success encontrada');
          setReferidosData(data.data.arbol);
          setTotalEquipo(data.data.totalEquipo || 0);
          setDirectos(data.data.directos || 0);
        } else if (data.arbol) {
          console.log('Estructura directa encontrada');
          setReferidosData(data.arbol);
          setTotalEquipo(data.totalEquipo || 0);
          setDirectos(data.directos || 0);
        } else if (data.id) {
          console.log('Estructura de árbol directo encontrada');
          setReferidosData(data);
          // Calcular totales si no vienen en la respuesta
          const calculateTotals = (node: ReferidoData): { total: number, directos: number } => {
            const directos = node.children ? node.children.length : 0;
            let total = directos;
            if (node.children) {
              node.children.forEach(child => {
                total += calculateTotals(child).total;
              });
            }
            return { total, directos };
          };
          const totals = calculateTotals(data);
          setTotalEquipo(totals.total);
          setDirectos(totals.directos);
        } else {
          console.error('Estructura de datos no reconocida:', data);
          setError('Estructura de datos no válida recibida del servidor');
        }
      } catch (error) {
        console.error('Error completo al obtener referidos:', error);
        setError(error instanceof Error ? error.message : 'Error desconocido al conectar con el servidor');
      } finally {
        setIsLoading(false);
      }
    };

    fetchReferidos();
  }, []);

  return {
    referidosData,
    totalEquipo,
    directos,
    isLoading,
    error
  };
};
