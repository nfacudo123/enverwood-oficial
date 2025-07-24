
import React from 'react';
import { User, ChevronDown } from 'lucide-react';

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

interface OrganizationChartProps {
  data: ReferidoData;
}

interface TreeNodeProps {
  node: ReferidoData;
  isRoot?: boolean;
}

const TreeNode: React.FC<TreeNodeProps> = ({ node, isRoot = false }) => {
  // Función para convertir nivel de letra a número para colores
  const getLevelNumber = (nivel: string | number): number => {
    if (typeof nivel === 'number') return nivel;
    
    const levelMap: { [key: string]: number } = {
      'A': 0, 'B': 1, 'C': 2, 'D': 3, 'E': 4, 'F': 5
    };
    
    return levelMap[nivel] || 0;
  };

  const getLevelColor = (nivel: string | number) => {
    const levelNum = getLevelNumber(nivel);
    switch (levelNum) {
      case 0: return 'bg-blue-500 text-white'; // Usuario actual (Nivel A)
      case 1: return 'bg-green-500 text-white'; // Nivel B
      case 2: return 'bg-yellow-500 text-white'; // Nivel C
      case 3: return 'bg-orange-500 text-white'; // Nivel D
      case 4: return 'bg-red-500 text-white'; // Nivel E
      case 5: return 'bg-purple-500 text-white'; // Nivel F
      default: return 'bg-gray-500 text-white';
    }
  };

  const hasChildren = node.children && node.children.length > 0;

  return (
    <div className="flex flex-col items-center">
      {/* Nodo del usuario */}
      <div className="relative">
        <div className={`
          ${getLevelColor(node.nivel)}
          rounded-lg p-3 shadow-md border-2 border-white
          min-w-[180px] max-w-[220px] text-center
          transform hover:scale-105 transition-transform duration-200
        `}>
          <div className="flex items-center justify-center mb-2">
            <User className="w-4 h-4 mr-2" />
            <span className="text-xs font-medium">
              {isRoot ? 'TÚ' : `Nivel ${node.nivel}`}
            </span>
          </div>
          <div className="text-sm font-semibold truncate">
            {node.name} {node.apellidos}
          </div>
          <div className="text-xs opacity-90 truncate">
            @{node.username}
          </div>
        </div>
        
        {/* Línea conectora hacia abajo */}
        {hasChildren && (
          <div className="absolute top-full left-1/2 transform -translate-x-1/2">
            <div className="w-px h-6 bg-gray-300"></div>
            <ChevronDown className="w-4 h-4 text-gray-400 -mt-2 ml-2" />
          </div>
        )}
      </div>

      {/* Hijos */}
      {hasChildren && (
        <div className="mt-8">
          {/* Línea horizontal conectora */}
          {node.children.length > 1 && (
            <div className="relative mb-6">
              <div className="absolute top-0 left-0 right-0 h-px bg-gray-300 transform translate-y-[-12px]"></div>
              {node.children.map((_, index) => (
                <div
                  key={index}
                  className="absolute w-px h-3 bg-gray-300 transform translate-y-[-12px]"
                  style={{
                    left: `${(index / (node.children.length - 1)) * 100}%`,
                    marginLeft: '-0.5px'
                  }}
                ></div>
              ))}
            </div>
          )}
          
          {/* Nodos hijos */}
          <div className="flex flex-wrap justify-center gap-8">
            {node.children.map((child) => (
              <TreeNode key={child.id} node={child} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export const OrganizationChart: React.FC<OrganizationChartProps> = ({ data }) => {
  return (
    <div className="w-full overflow-auto p-6">
      <div className="min-w-full">
        <TreeNode node={data} isRoot={true} />
      </div>
      
      {/* Leyenda */}
      <div className="mt-8 p-4 bg-gray-50 rounded-lg">
        <h4 className="font-medium mb-3">Leyenda de Niveles:</h4>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-blue-500 rounded border-2 border-white"></div>
            <span>Nivel A</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-green-500 rounded border-2 border-white"></div>
            <span>Nivel B</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-yellow-500 rounded border-2 border-white"></div>
            <span>Nivel C</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-orange-500 rounded border-2 border-white"></div>
            <span>Nivel D</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-red-500 rounded border-2 border-white"></div>
            <span>Nivel E</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-purple-500 rounded border-2 border-white"></div>
            <span>Nivel F</span>
          </div>
        </div>
      </div>
    </div>
  );
};
