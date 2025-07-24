import { useState, useEffect } from 'react';

interface ReferidoData {
  id: number;
  name: string;
  apellidos: string;
  username: string;
  email: string;
  nivel: string | number;
  usuario_id: number;
  sponsor_id: number | null;
  numero_directos?: number;
  numero_subordinados?: number;
  children: ReferidoData[];
}

export const useReferidos = () => {
  const [referidosData, setReferidosData] = useState<ReferidoData | null>(null);
  const [totalEquipo, setTotalEquipo] = useState(0);
  const [directos, setDirectos] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Función para obtener el usuario actual del localStorage
  const getCurrentUser = () => {
    try {
      const userInfo = localStorage.getItem('userInfo');
      return userInfo ? JSON.parse(userInfo) : null;
    } catch {
      return null;
    }
  };

  // Función para normalizar un nodo del API
  const normalizeNode = (node: any): ReferidoData => {
    return {
      id: node.usuario_id || node.id,
      name: node.name || '',
      apellidos: node.apellidos || '',
      username: node.username || '',
      email: node.correo || node.email || '',
      nivel: node.nivel || 0,
      usuario_id: node.usuario_id || node.id,
      sponsor_id: node.sponsor_id,
      numero_directos: node.numero_directos || 0,
      numero_subordinados: node.numero_subordinados || 0,
      children: []
    };
  };

  // Función para construir el árbol jerárquico
  const buildTreeFromList = (nodes: any[]): ReferidoData | null => {
    console.log('Construyendo árbol desde lista:', nodes);
    
    if (!nodes || nodes.length === 0) {
      return null;
    }

    // Normalizar todos los nodos
    const normalizedNodes = nodes.map(node => normalizeNode(node));
    
    // Encontrar el usuario raíz (sponsor_id === null)
    const rootNode = normalizedNodes.find(node => node.sponsor_id === null);
    
    if (!rootNode) {
      console.error('No se encontró usuario raíz (sponsor_id === null)');
      return null;
    }

    // Función recursiva para construir hijos
    const buildChildren = (parentId: number): ReferidoData[] => {
      return normalizedNodes
        .filter(node => node.sponsor_id === parentId)
        .map(node => ({
          ...node,
          children: buildChildren(node.usuario_id)
        }));
    };

    // Construir los hijos del usuario raíz
    const treeWithChildren = {
      ...rootNode,
      children: buildChildren(rootNode.usuario_id)
    };

    console.log('Árbol construido:', treeWithChildren);
    return treeWithChildren;
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
          setError('No hay token de autenticación');
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

        if (!response.ok) {
          const errorText = await response.text();
          console.error('Error HTTP:', response.status, errorText);
          setError(`Error del servidor (${response.status}): ${errorText}`);
          setIsLoading(false);
          return;
        }

        const data = await response.json();
        console.log('Respuesta completa del servidor:', JSON.stringify(data, null, 2));
        
        // El API devuelve un array directo según el ejemplo proporcionado
        if (Array.isArray(data) && data.length > 0) {
          console.log('Procesando array directo de referidos');
          
          const processedData = buildTreeFromList(data);
          
          if (processedData) {
            const calculatedTotals = calculateTotals(processedData);
            setReferidosData(processedData);
            setTotalEquipo(calculatedTotals.total);
            setDirectos(calculatedTotals.directos);
            setError(null);
          } else {
            setError('No se pudo construir la jerarquía de referidos');
          }
        } else {
          console.log('No se encontraron referidos en la respuesta');
          setError('No se encontraron referidos');
        }

      } catch (error) {
        console.error('Error al obtener referidos:', error);
        setError(`Error de conexión: ${error instanceof Error ? error.message : 'Error desconocido'}`);
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