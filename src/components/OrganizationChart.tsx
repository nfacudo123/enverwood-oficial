
import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';

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

interface OrganizationChartProps {
  data: ReferidoData;
}

export const OrganizationChart: React.FC<OrganizationChartProps> = ({ data }) => {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!data || !svgRef.current) return;

    // Clear previous chart
    d3.select(svgRef.current).selectAll("*").remove();

    // Set up dimensions
    const margin = { top: 20, right: 90, bottom: 30, left: 90 };
    const width = 960 - margin.left - margin.right;
    const height = 500 - margin.bottom - margin.top;

    // Create SVG
    const svg = d3.select(svgRef.current)
      .attr("width", width + margin.right + margin.left)
      .attr("height", height + margin.top + margin.bottom);

    const g = svg.append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    // Create tree layout
    const tree = d3.tree<ReferidoData>().size([height, width]);

    // Convert data to hierarchy
    const root = d3.hierarchy(data, d => d.children);
    
    // Generate tree layout
    tree(root);

    // Create links
    const link = g.selectAll(".link")
      .data(root.descendants().slice(1))
      .enter().append("path")
      .attr("class", "link")
      .attr("d", (d: any) => {
        return `M${d.y},${d.x}C${(d.y + d.parent.y) / 2},${d.x} ${(d.y + d.parent.y) / 2},${d.parent.x} ${d.parent.y},${d.parent.x}`;
      })
      .style("fill", "none")
      .style("stroke", "#ccc")
      .style("stroke-width", "2px");

    // Create nodes
    const node = g.selectAll(".node")
      .data(root.descendants())
      .enter().append("g")
      .attr("class", "node")
      .attr("transform", (d: any) => `translate(${d.y},${d.x})`);

    // Add circles for nodes
    node.append("circle")
      .attr("r", 10)
      .style("fill", (d: any) => {
        if (d.depth === 0) return "#4f46e5"; // Root user - blue
        if (d.depth === 1) return "#059669"; // Level 1 - green
        if (d.depth === 2) return "#d97706"; // Level 2 - orange
        if (d.depth === 3) return "#dc2626"; // Level 3 - red
        return "#7c3aed"; // Level 4+ - purple
      })
      .style("stroke", "#fff")
      .style("stroke-width", "3px");

    // Add labels
    node.append("text")
      .attr("dy", ".35em")
      .attr("x", (d: any) => d.children ? -13 : 13)
      .style("text-anchor", (d: any) => d.children ? "end" : "start")
      .style("font-size", "12px")
      .style("font-family", "Arial, sans-serif")
      .text((d: any) => `${d.data.name} ${d.data.apellidos}`);

    // Add username below name
    node.append("text")
      .attr("dy", "1.5em")
      .attr("x", (d: any) => d.children ? -13 : 13)
      .style("text-anchor", (d: any) => d.children ? "end" : "start")
      .style("font-size", "10px")
      .style("font-family", "Arial, sans-serif")
      .style("fill", "#666")
      .text((d: any) => `@${d.data.username}`);

  }, [data]);

  return (
    <div className="w-full overflow-auto">
      <svg ref={svgRef} className="w-full"></svg>
      
      {/* Legend */}
      <div className="mt-4 p-4 bg-gray-50 rounded-lg">
        <h4 className="font-medium mb-3">Leyenda de Niveles:</h4>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-indigo-600 rounded-full border-2 border-white"></div>
            <span>Usuario Actual</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-emerald-600 rounded-full border-2 border-white"></div>
            <span>Nivel 1</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-amber-600 rounded-full border-2 border-white"></div>
            <span>Nivel 2</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-red-600 rounded-full border-2 border-white"></div>
            <span>Nivel 3</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-violet-600 rounded-full border-2 border-white"></div>
            <span>Nivel 4+</span>
          </div>
        </div>
      </div>
    </div>
  );
};
