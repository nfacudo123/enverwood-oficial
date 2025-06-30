
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

  // Función para crear datos de ejemplo cuando no hay datos del servidor
  const createSampleData = (): ReferidoData => {
    return {
      id: 1,
      name: "Usuario",
      apellidos: "Actual",
      username: "usuario_actual",
      email: "usuario@example.com",
      nivel: 0,
      parent_id: null,
      children: [
        {
          id: 2,
          name: "Referido",
          apellidos: "Uno",
          username: "referido1",
          email: "referido1@example.com",
          nivel: 1,
          parent_id: 1,
          children: [
            {
              id: 3,
              name: "Sub",
              apellidos: "Referido",
              username: "subreferido1",
              email: "sub1@example.com",
              nivel: 2,
              parent_id: 2,
              children: []
            }
          ]
        },
        {
          id: 4,
          name: "Referido",
          apellidos: "Dos",
          username: "referido2",
          email: "referido2@example.com",
          nivel: 1,
          parent_id: 1,
          children: []
        }
      ]
    };
  };

  // Función para validar estructura de un nodo
  const isValidNode = (node: any): boolean => {
    if (!node || typeof node !== 'object') return false;
    
    const hasBasicFields = (
      (node.id || node.usuario_id) &&
      (node.name || node.nombre) &&
      (node.username || node.usuario || node.email)
    );
    
    console.log('Validando nodo:', node);
    console.log('Tiene campos básicos:', hasBasicFields);
    
    return hasBasicFields;
  };

  // Función para normalizar un nodo
  const normalizeNode = (node: any, nivel: number = 0): ReferidoData => {
    const normalized = {
      id: node.id || node.usuario_id || Math.random(),
      name: node.name || node.nombre || 'Usuario',
      apellidos: node.apellidos || node.apellido || node.last_name || '',
      username: node.username || node.usuario || node.email?.split('@')[0] || 'usuario',
      email: node.email || '',
      nivel: node.nivel || nivel,
      parent_id: node.parent_id || node.sponsor_id || null,
      usuario_id: node.usuario_id,
      sponsor_id: node.sponsor_id,
      children: []
    };

    // Procesar hijos si existen
    if (Array.isArray(node.children)) {
      normalized.children = node.children
        .filter(isValidNode)
        .map(child => normalizeNode(child, nivel + 1));
    } else if (Array.isArray(node.referidos)) {
      normalized.children = node.referidos
        .filter(isValidNode)
        .map(child => normalizeNode(child, nivel + 1));
    }

    return normalized;
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

  useEffect(() => {
    const fetchReferidos = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          console.log('No hay token, usando datos de ejemplo');
          const sampleData = createSampleData();
          const totals = calculateTotals(sampleData);
          setReferidosData(sampleData);
          setTotalEquipo(totals.total);
          setDirectos(totals.directos);
          setIsLoading(false);
          return;
        }

        console.log('Obteniendo referidos con token:', token.substring(0, 10) + '...');
        
        const response = await fetch('http://localhost:4000/api/mis-referidos', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        console.log('Status de respuesta:', response.status);
        console.log('Headers:', Object.fromEntries(response.headers.entries()));

        if (!response.ok) {
          const errorText = await response.text();
          console.error('Error HTTP:', response.status, errorText);
          
          // Si hay error del servidor, usar datos de ejemplo
          console.log('Error del servidor, usando datos de ejemplo');
          const sampleData = createSampleData();
          const totals = calculateTotals(sampleData);
          setReferidosData(sampleData);
          setTotalEquipo(totals.total);
          setDirectos(totals.directos);
          setError(`Error del servidor (${response.status}), mostrando datos de ejemplo`);
          setIsLoading(false);
          return;
        }

        const data = await response.json();
        console.log('Respuesta completa del servidor:', JSON.stringify(data, null, 2));
        console.log('Tipo de respuesta:', typeof data);
        console.log('Es array:', Array.isArray(data));
        
        let processedData: ReferidoData | null = null;
        let calculatedTotals = { total: 0, directos: 0 };

        // Intentar procesar diferentes estructuras
        if (data && typeof data === 'object') {
          // Caso 1: { success: true, data: {...} }
          if (data.success && data.data) {
            console.log('Procesando estructura success.data');
            if (isValidNode(data.data)) {
              processedData = normalizeNode(data.data);
            } else if (data.data.arbol && isValidNode(data.data.arbol)) {
              processedData = normalizeNode(data.data.arbol);
            }
            
            if (processedData) {
              calculatedTotals = calculateTotals(processedData);
              setTotalEquipo(data.data.totalEquipo || calculatedTotals.total);
              setDirectos(data.data.directos || calculatedTotals.directos);
            }
          }
          // Caso 2: { arbol: {...}, totalEquipo: X, directos: Y }
          else if (data.arbol && isValidNode(data.arbol)) {
            console.log('Procesando estructura con arbol');
            processedData = normalizeNode(data.arbol);
            calculatedTotals = calculateTotals(processedData);
            setTotalEquipo(data.totalEquipo || calculatedTotals.total);
            setDirectos(data.directos || calculatedTotals.directos);
          }
          // Caso 3: Objeto usuario directo
          else if (isValidNode(data)) {
            console.log('Procesando nodo directo');
            processedData = normalizeNode(data);
            calculatedTotals = calculateTotals(processedData);
            setTotalEquipo(calculatedTotals.total);
            setDirectos(calculatedTotals.directos);
          }
          // Caso 4: Array de usuarios
          else if (Array.isArray(data) && data.length > 0) {
            console.log('Procesando array de datos');
            const firstValid = data.find(isValidNode);
            if (firstValid) {
              processedData = normalizeNode(firstValid);
              calculatedTotals = calculateTotals(processedData);
              setTotalEquipo(calculatedTotals.total);
              setDirectos(calculatedTotals.directos);
            }
          }
          // Caso 5: Buscar en propiedades del objeto
          else {
            console.log('Buscando datos válidos en propiedades del objeto');
            const keys = Object.keys(data);
            console.log('Claves disponibles:', keys);
            
            for (const key of keys) {
              if (data[key] && typeof data[key] === 'object') {
                if (isValidNode(data[key])) {
                  console.log(`Encontrado datos válidos en: ${key}`);
                  processedData = normalizeNode(data[key]);
                  calculatedTotals = calculateTotals(processedData);
                  setTotalEquipo(calculatedTotals.total);
                  setDirectos(calculatedTotals.directos);
                  break;
                } else if (Array.isArray(data[key])) {
                  const validItem = data[key].find(isValidNode);
                  if (validItem) {
                    console.log(`Encontrado datos válidos en array: ${key}`);
                    processedData = normalizeNode(validItem);
                    calculatedTotals = calculateTotals(processedData);
                    setTotalEquipo(calculatedTotals.total);
                    setDirectos(calculatedTotals.directos);
                    break;
                  }
                }
              }
            }
          }
        }

        // Si no se pudo procesar ningún dato, usar datos de ejemplo
        if (!processedData) {
          console.log('No se pudo procesar datos del servidor, usando datos de ejemplo');
          processedData = createSampleData();
          calculatedTotals = calculateTotals(processedData);
          setTotalEquipo(calculatedTotals.total);
          setDirectos(calculatedTotals.directos);
          setError('No se pudieron procesar los datos del servidor, mostrando estructura de ejemplo');
        } else {
          console.log('Datos procesados exitosamente');
          setError(null);
        }

        setReferidosData(processedData);

      } catch (error) {
        console.error('Error al obtener referidos:', error);
        
        // En caso de error, usar datos de ejemplo
        const sampleData = createSampleData();
        const totals = calculateTotals(sampleData);
        setReferidosData(sampleData);
        setTotalEquipo(totals.total);
        setDirectos(totals.directos);
        setError(`Error de conexión: ${error instanceof Error ? error.message : 'Error desconocido'}. Mostrando datos de ejemplo.`);
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
