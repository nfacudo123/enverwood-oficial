
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

  // Función para normalizar un nodo
  const normalizeNode = (node: any): ReferidoData => {
    return {
      id: node.id || node.usuario_id || Math.random(),
      name: node.name || node.nombre || 'Usuario',
      apellidos: node.apellidos || node.apellido || node.last_name || '',
      username: node.username || node.usuario || node.email?.split('@')[0] || 'usuario',
      email: node.email || '',
      nivel: node.nivel || 0,
      parent_id: node.parent_id || node.sponsor_id || null,
      usuario_id: node.usuario_id,
      sponsor_id: node.sponsor_id,
      children: []
    };
  };

  // Función para construir el árbol desde una lista plana usando sponsor_id
  const buildTreeFromList = (nodes: any[], currentUser: any): ReferidoData => {
    console.log('Construyendo árbol desde lista:', nodes);
    console.log('Usuario actual:', currentUser);
    
    // Normalizar todos los nodos
    const normalizedNodes = nodes.map(node => normalizeNode(node));
    
    // Crear el nodo raíz (usuario actual)
    const rootNode: ReferidoData = currentUser ? normalizeNode(currentUser) : {
      id: 1,
      name: "Usuario",
      apellidos: "Actual",
      username: "usuario_actual",
      email: "usuario@example.com",
      nivel: 0,
      parent_id: null,
      children: []
    };

    // Función recursiva para construir hijos
    const buildChildren = (parentId: number, nivel: number = 1): ReferidoData[] => {
      return normalizedNodes
        .filter(node => {
          // Buscar nodos que tengan como sponsor_id o parent_id al padre actual
          const isChild = node.sponsor_id === parentId || node.parent_id === parentId;
          console.log(`Nodo ${node.id} (${node.name}) - sponsor_id: ${node.sponsor_id}, parent_id: ${node.parent_id}, es hijo de ${parentId}:`, isChild);
          return isChild;
        })
        .map(node => ({
          ...node,
          nivel,
          children: buildChildren(node.id, nivel + 1)
        }));
    };

    // Construir los hijos del usuario actual
    rootNode.children = buildChildren(rootNode.id);
    console.log('Árbol construido:', rootNode);
    
    return rootNode;
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

        if (!response.ok) {
          const errorText = await response.text();
          console.error('Error HTTP:', response.status, errorText);
          
          // Si hay error del servidor, usar datos de ejemplo
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
        
        let processedData: ReferidoData | null = null;
        let calculatedTotals = { total: 0, directos: 0 };

        // Procesar diferentes estructuras de respuesta
        if (data && typeof data === 'object') {
          let referidosList: any[] = [];
          let currentUser: any = null;
          
          // Caso 1: { success: true, data: { usuario: {...}, referidos: [...] } }
          if (data.success && data.data) {
            console.log('Procesando estructura success.data');
            currentUser = data.data.usuario || data.data.user;
            referidosList = data.data.referidos || data.data.referrals || [];
          }
          // Caso 2: { usuario: {...}, referidos: [...] }
          else if (data.usuario || data.user) {
            console.log('Procesando estructura con usuario/referidos');
            currentUser = data.usuario || data.user;
            referidosList = data.referidos || data.referrals || [];
          }
          // Caso 3: Array directo de referidos
          else if (Array.isArray(data)) {
            console.log('Procesando array directo');
            referidosList = data;
          }
          // Caso 4: Buscar arrays en propiedades
          else {
            console.log('Buscando arrays en propiedades');
            const keys = Object.keys(data);
            for (const key of keys) {
              if (Array.isArray(data[key])) {
                console.log(`Encontrado array en: ${key}`);
                referidosList = data[key];
                break;
              }
            }
          }

          console.log('Usuario actual encontrado:', currentUser);
          console.log('Lista de referidos:', referidosList);

          if (referidosList.length > 0 || currentUser) {
            // Construir el árbol desde la lista
            processedData = buildTreeFromList(referidosList, currentUser);
            calculatedTotals = calculateTotals(processedData);
            
            // Usar totales del servidor si están disponibles
            setTotalEquipo(data.totalEquipo || data.total_equipo || calculatedTotals.total);
            setDirectos(data.directos || data.directos_count || calculatedTotals.directos);
            setError(null);
          } else {
            console.log('No se encontraron referidos, usando datos de ejemplo');
            processedData = createSampleData();
            calculatedTotals = calculateTotals(processedData);
            setTotalEquipo(calculatedTotals.total);
            setDirectos(calculatedTotals.directos);
            setError('No se encontraron referidos en la respuesta del servidor');
          }
        } else {
          console.log('Estructura de datos no reconocida, usando datos de ejemplo');
          processedData = createSampleData();
          calculatedTotals = calculateTotals(processedData);
          setTotalEquipo(calculatedTotals.total);
          setDirectos(calculatedTotals.directos);
          setError('Estructura de datos no reconocida del servidor');
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
