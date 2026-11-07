import React, { useCallback } from 'react';
import { ServiceData, ConnectionData, LinkData } from '../../../../types';
import { CARD_WIDTH, CARD_HEIGHT } from '../types';

interface ConnectionsRendererProps {
  connections: ConnectionData[];
  services: ServiceData[];
  onRemoveConnection: (connectionId: string) => void;
  onEditConnection: (connectionId: string) => void;
}

const getLinkStyle = (linkType: LinkData['type']) => {
  const styles = {
    chain: { color: '#4DABF7', marker: 'url(#arrowhead)', strokeDasharray: 'none', label: '' },
    conditional: { color: '#FFD43B', marker: 'url(#arrowhead-yellow)', strokeDasharray: '5,5', label: '' },
    parallel: { color: '#51CF66', marker: 'url(#arrowhead-green)', strokeDasharray: '10,5', label: '' },
    sequential: { color: '#9775FA', marker: 'url(#arrowhead-purple)', strokeDasharray: 'none', label: '' },
  };
  return styles[linkType] || { color: '#FF6B6B', marker: 'url(#arrowhead-red)', strokeDasharray: 'none', label: '' };
};

export default function ConnectionsRenderer({
  connections,
  services,
  onEditConnection,
}: ConnectionsRendererProps) {
  const handlePathMouseEnter = useCallback((e: React.MouseEvent<SVGPathElement>) => {
    const target = e.target as SVGPathElement;
    target.style.strokeWidth = '4';
    target.style.filter = 'drop-shadow(0 4px 8px rgba(0,0,0,0.2))';
  }, []);

  const handlePathMouseLeave = useCallback((e: React.MouseEvent<SVGPathElement>) => {
    const target = e.target as SVGPathElement;
    target.style.strokeWidth = '3';
    target.style.filter = 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))';
  }, []);

  const handleButtonMouseEnter = useCallback((e: React.MouseEvent<SVGGElement | SVGElement>, midX: number, midY: number) => {
    const circle = e.currentTarget.querySelector('circle');
    if (circle) {
      circle.style.transformOrigin = `${midX}px ${midY}px`;
      circle.style.transform = 'scale(1.2)';
    }
  }, []);

  const handleButtonMouseLeave = useCallback((e: React.MouseEvent<SVGGElement | SVGElement>, midX: number, midY: number) => {
    const circle = e.currentTarget.querySelector('circle');
    if (circle) {
      circle.style.transformOrigin = `${midX}px ${midY}px`;
      circle.style.transform = 'scale(1)';
    }
  }, []);

  if (connections.length === 0) return null;

  return (
    <>
      {connections.map((connection) => {
        const sourceService = services.find(s => s.id === connection.sourceId);
        const targetService = services.find(s => s.id === connection.targetId);

        if (!sourceService || !targetService)
          return null;
        const sourcePos = sourceService.position || { x: 100, y: 100 };
        const targetPos = targetService.position || { x: 300, y: 100 };
        const sourceX = sourcePos.x + CARD_WIDTH;
        const sourceY = sourcePos.y + CARD_HEIGHT / 2;
        const targetX = targetPos.x;
        const targetY = targetPos.y + CARD_HEIGHT / 2;
        const distance = Math.abs(targetX - sourceX);
        const controlPoint1X = sourceX + Math.min(distance * 0.3, 80);
        const controlPoint2X = targetX - Math.min(distance * 0.3, 80);
        const pathD = `M ${sourceX} ${sourceY} C ${controlPoint1X} ${sourceY} ${controlPoint2X} ${targetY} ${targetX} ${targetY}`;
        const midX = (sourceX + targetX) / 2;
        const midY = (sourceY + targetY) / 2;
        const linkStyle = getLinkStyle(connection.linkData.type || 'chain');
        const linkColor = linkStyle.color;
        const arrowMarker = linkStyle.marker;

        return (
          <g
            key={connection.id}
            className="connection-group"
            style={{ transition: 'all 0.3s ease' }}
          >
            <path
              d={pathD}
              stroke={linkColor + '40'}
              strokeWidth={8}
              fill="none"
              style={{ filter: 'blur(2px)' }}
            />
            <path
              d={pathD}
              stroke={linkColor}
              strokeWidth={3}
              fill="none"
              markerEnd={arrowMarker}
              strokeDasharray={linkStyle.strokeDasharray}
              style={{
                filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))',
                transition: 'all 0.3s ease'
              }}
              onMouseEnter={handlePathMouseEnter}
              onMouseLeave={handlePathMouseLeave}
            />
            <g
              style={{ cursor: 'pointer' }}
              onClick={() => onEditConnection(connection.id)}
              onMouseEnter={(e) => handleButtonMouseEnter(e, midX, midY)}
              onMouseLeave={(e) => handleButtonMouseLeave(e, midX, midY)}
            >
              <circle
                cx={midX}
                cy={midY}
                r={16}
                fill={linkColor}
                stroke="#FFF"
                strokeWidth={2}
                style={{
                  transition: 'all 0.2s ease',
                  filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.2))',
                  transformOrigin: `${midX}px ${midY}px`
                }}
              />
              <text
                x={midX}
                y={midY + 1}
                textAnchor="middle"
                fill="white"
                fontSize={12}
                fontWeight="bold"
                style={{
                  userSelect: 'none',
                  transition: 'all 0.2s ease',
                  pointerEvents: 'none'
                }}
              >
                ⚙
              </text>
            </g>
            <g style={{ pointerEvents: 'none' }}>
              <rect
                x={midX - 25}
                y={sourceY < targetY ? midY - 25 : midY + 10}
                width={50}
                height={18}
                fill={linkColor}
                rx={9}
                ry={9}
                style={{
                  opacity: 0.9,
                  filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.1))'
                }}
              />
              <text
                x={midX}
                y={sourceY < targetY ? midY - 12 : midY + 23}
                textAnchor="middle"
                fill="white"
                fontSize={10}
                fontWeight="600"
                style={{ userSelect: 'none' }}
              >
                {`${linkStyle.label} ${connection.linkData?.order || 0}`}
              </text>
            </g>
          </g>
        );
      })}
    </>
  );
}
