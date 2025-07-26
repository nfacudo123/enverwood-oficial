
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
      case 0: return 'bg-primary text-white shadow-xl shadow-primary/30'; // Usuario actual (Nivel A)
      case 1: return 'bg-success text-white shadow-xl shadow-success/30'; // Nivel B
      case 2: return 'bg-emerald-500 text-white shadow-xl shadow-emerald-500/30'; // Nivel C
      case 3: return 'bg-green-600 text-white shadow-xl shadow-green-600/30'; // Nivel D
      case 4: return 'bg-teal-600 text-white shadow-xl shadow-teal-600/30'; // Nivel E
      case 5: return 'bg-green-700 text-white shadow-xl shadow-green-700/30'; // Nivel F
      default: return 'bg-green-800 text-white shadow-xl shadow-green-800/30';
    }
  };

  const hasChildren = node.children && node.children.length > 0;

  return (
    <div className="flex flex-col items-center">
      {/* Nodo del usuario */}
      <div className="relative">
        <div className={`
          ${getLevelColor(node.nivel)}
          rounded-xl p-4 border border-white/20
          min-w-[200px] max-w-[240px] text-center
          transform hover:scale-105 transition-all duration-300 hover:shadow-xl
          backdrop-blur-sm
        `}>
          <div className="flex items-center justify-center mb-2">
            <User className="w-4 h-4 mr-2" />
            <span className="text-xs font-medium">
              {isRoot ? 'TÚ' : `Nivel ${node.nivel}`}
            </span>
          </div>
          <div className="text-sm font-bold truncate mb-1">
            {node.name} {node.apellidos}
          </div>
          <div className="text-xs opacity-90 truncate bg-black/30 rounded-full px-2 py-1">
            @{node.username}
          </div>
        </div>
        
        {/* Línea conectora hacia abajo */}
        {hasChildren && (
          <div className="absolute top-full left-1/2 transform -translate-x-1/2">
            <div className="w-0.5 h-6 bg-primary"></div>
            <ChevronDown className="w-4 h-4 text-primary -mt-2 ml-2" />
          </div>
        )}
      </div>

      {/* Hijos */}
      {hasChildren && (
        <div className="mt-8">
          {/* Línea horizontal conectora */}
          {node.children.length > 1 && (
            <div className="relative mb-6">
              <div className="absolute top-0 left-0 right-0 h-0.5 bg-primary transform translate-y-[-12px]"></div>
              {node.children.map((_, index) => (
                <div
                  key={index}
                  className="absolute w-0.5 h-3 bg-primary transform translate-y-[-12px]"
                  style={{
                    left: `${(index / (node.children.length - 1)) * 100}%`,
                    marginLeft: '-1px'
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
    </div>
  );
};
