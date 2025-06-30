
import { useState, useEffect } from 'react';

interface ReferidoData {
  id: number;
  name: string;
  apellidos: string;
  username: string;
  email: string;
  nivel: number;
  parent_id: number | null;
  usuario_id?: number;
  sponsor_id?: number;
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
          setIsLoading(false);
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
        console.log('Headers de respuesta:', Object.fromEntries(response.headers.entries()));

        if (!response.ok) {
          const errorText = await response.text();
          console.error('Error en la respuesta:', errorText);
          throw new Error(`Error ${response.status}: ${response.statusText}`);
        }

        const data = await response.json();
        console.log('Datos completos recibidos:', JSON.stringify(data, null, 2));

        // Función para validar estructura de un nodo
        const isValidNode = (node: any): boolean => {
          return node && 
                 typeof node.id === 'number' && 
                 typeof node.name === 'string' && 
                 typeof node.apellidos === 'string' && 
                 typeof node.username === 'string' && 
                 typeof node.email === 'string' && 
                 typeof node.nivel === 'number';
        };

        // Función para normalizar un nodo y asegurar que tenga la estructura correcta
        const normalizeNode = (node: any): ReferidoData => {
          return {
            id: node.id || node.usuario_id || 0,
            name: node.name || node.nombre || '',
            apellidos: node.apellidos || node.apellido || '',
            username: node.username || node.usuario || '',
            email: node.email || '',
            nivel: node.nivel || 0,
            parent_id: node.parent_id || node.sponsor_id || null,
            usuario_id: node.usuario_id,
            sponsor_id: node.sponsor_id,
            children: Array.isArray(node.children) ? node.children.map(normalizeNode) : []
          };
        };

        // Función para calcular totales recursivamente
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

        let processedData: ReferidoData | null = null;
        let calculatedTotals = { total: 0, directos: 0 };

        // Intentar diferentes estructuras de respuesta
        if (data.success && data.data) {
          console.log('Procesando estructura con success.data');
          if (data.data.arbol && isValidNode(data.data.arbol)) {
            processedData = normalizeNode(data.data.arbol);
            setTotalEquipo(data.data.totalEquipo || 0);
            setDirectos(data.data.directos || 0);
          } else if (isValidNode(data.data)) {
            processedData = normalizeNode(data.data);
            calculatedTotals = calculateTotals(processedData);
            setTotalEquipo(calculatedTotals.total);
            setDirectos(calculatedTotals.directos);
          }
        } else if (data.arbol && isValidNode(data.arbol)) {
          console.log('Procesando estructura directa con arbol');
          processedData = normalizeNode(data.arbol);
          setTotalEquipo(data.totalEquipo || 0);
          setDirectos(data.directos || 0);
        } else if (isValidNode(data)) {
          console.log('Procesando estructura de nodo directo');
          processedData = normalizeNode(data);
          calculatedTotals = calculateTotals(processedData);
          setTotalEquipo(calculatedTotals.total);
          setDirectos(calculatedTotals.directos);
        } else if (Array.isArray(data) && data.length > 0 && isValidNode(data[0])) {
          console.log('Procesando estructura de array');
          // Si es un array, tomar el primer elemento como raíz
          processedData = normalizeNode(data[0]);
          calculatedTotals = calculateTotals(processedData);
          setTotalEquipo(calculatedTotals.total);
          setDirectos(calculatedTotals.directos);
        } else {
          console.error('Estructura de datos no reconocida. Datos recibidos:', data);
          console.error('Tipo de datos:', typeof data);
          console.error('Es array:', Array.isArray(data));
          console.error('Claves disponibles:', Object.keys(data || {}));
          
          // Intentar crear una estructura mínima si hay algún dato
          if (data && typeof data === 'object') {
            const keys = Object.keys(data);
            console.log('Intentando procesar con claves disponibles:', keys);
            
            // Buscar cualquier estructura que pueda ser un usuario
            for (const key of keys) {
              if (data[key] && typeof data[key] === 'object') {
                if (isValidNode(data[key])) {
                  processedData = normalizeNode(data[key]);
                  calculatedTotals = calculateTotals(processedData);
                  setTotalEquipo(calculatedTotals.total);
                  setDirectos(calculatedTotals.directos);
                  break;
                }
              }
            }
          }
          
          if (!processedData) {
            throw new Error('Estructura de datos no válida recibida del servidor');
          }
        }

        if (processedData) {
          console.log('Datos procesados exitosamente:', processedData);
          console.log('Total equipo:', calculatedTotals.total || totalEquipo);
          console.log('Directos:', calculatedTotals.directos || directos);
          setReferidosData(processedData);
        } else {
          throw new Error('No se pudo procesar la estructura de datos');
        }

      } catch (error) {
        console.error('Error completo al obtener referidos:', error);
        console.error('Stack trace:', error instanceof Error ? error.stack : 'No stack available');
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
