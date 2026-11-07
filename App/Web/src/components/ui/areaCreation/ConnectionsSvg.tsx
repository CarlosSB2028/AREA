import React from 'react';
import { ServiceData, ConnectionData } from '../../../types';

interface ConnectionsSvgProps {
  connections: ConnectionData[];
  services: ServiceData[];
  onRemoveConnection: (connectionId: string) => void;
}

export default function ConnectionsSvg({
  connections,
  services,
  onRemoveConnection,
}: ConnectionsSvgProps) {
  if (connections.length === 0) return null;

  return (
    <svg
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        zIndex: 1,
      }}
    >
      <defs>
        <marker
          id="arrowhead"
          markerWidth="10"
          markerHeight="7"
          refX="10"
          refY="3.5"
          orient="auto"
        >
          <polygon points="0 0, 10 3.5, 0 7" fill="#4DABF7" />
        </marker>
      </defs>

      {connections.map(connection => {
        const sourceService = services.find(s => s.id === connection.sourceId);
        const targetService = services.find(s => s.id === connection.targetId);

        if (!sourceService || !targetService) return null;

        const sourcePos = sourceService.position || { x: 100, y: 100 };
        const targetPos = targetService.position || { x: 300, y: 100 };

        const sourceX = sourcePos.x + 150;
        const sourceY = sourcePos.y + 75;
        const targetX = targetPos.x;
        const targetY = targetPos.y + 75;

        const pathD = `M ${sourceX} ${sourceY} C ${sourceX + 50} ${sourceY} ${targetX - 50} ${targetY} ${targetX} ${targetY}`;
        const midX = (sourceX + targetX) / 2;
        const midY = (sourceY + targetY) / 2;

        return (
          <g key={connection.id}>
            <path
              d={pathD}
              stroke="#4DABF7"
              strokeWidth={2}
              fill="none"
              markerEnd="url(#arrowhead)"
            />
            <circle
              cx={midX}
              cy={midY}
              r={10}
              fill="#FF6B6B"
              onClick={() => onRemoveConnection(connection.id)}
              style={{ cursor: 'pointer', pointerEvents: 'all' }}
            />
            <text
              x={midX}
              y={midY + 3}
              textAnchor="middle"
              fill="white"
              fontSize={12}
              style={{ cursor: 'pointer', userSelect: 'none', pointerEvents: 'all' }}
              onClick={() => onRemoveConnection(connection.id)}
            >
              ×
            </text>
          </g>
        );
      })}
    </svg>
  );
}