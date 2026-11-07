import React, { useMemo } from 'react';
import Svg, { Line } from 'react-native-svg';
import { useThemeColors } from '@/hooks/useThemeColors';

import type { ActiveConnection, CardData, Connection } from '@/types/area-detail';
import { CARD_WIDTH, CARD_HEIGHT, screenWidth, screenHeight } from './constants';

const getDockPoint = (card: CardData, side: 'left' | 'right') => {
  const y = card.position.y + CARD_HEIGHT / 2;

  if (side === 'left') {
    if (card.type === 'reaction') {
      return { x: card.position.x, y };
    }

    return { x: card.position.x + CARD_WIDTH / 2, y };
  }

  return { x: card.position.x + CARD_WIDTH, y };
};

interface ConnectionLayerProps {
  cards: CardData[];
  connections: Connection[];
  activeConnection: ActiveConnection | null;
  onConnectionPress?: (connection: Connection) => void;
}

export function ConnectionLayer({ cards, connections, activeConnection, onConnectionPress }: ConnectionLayerProps) {
  const colors = useThemeColors();
  const connectorLines = useMemo(
    () =>
      connections
        .map((connection) => {
          const fromCard = cards.find((c) => c.id === connection.from);
          const toCard = cards.find((c) => c.id === connection.to);
          if (!fromCard || !toCard) return null;

          const fromPoint = getDockPoint(fromCard, 'right');
          const toPoint = getDockPoint(toCard, 'left');

          return (
            <React.Fragment key={`${connection.from}-${connection.to}`}>
              <Line
                x1={fromPoint.x}
                y1={fromPoint.y}
                x2={toPoint.x}
                y2={toPoint.y}
                stroke="transparent"
                strokeWidth={20}
                strokeLinecap="round"
                onPress={() => onConnectionPress?.(connection)}
              />
              <Line
                x1={fromPoint.x}
                y1={fromPoint.y}
                x2={toPoint.x}
                y2={toPoint.y}
                stroke={colors.info}
                strokeWidth={3}
                strokeLinecap="round"
              />
            </React.Fragment>
          );
        })
        .filter(Boolean),
    [cards, connections, onConnectionPress, colors]
  );

  return (
    <Svg
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: screenWidth * 3,
        height: screenHeight * 3,
      }}
    >
      {connectorLines}

      {activeConnection && (
        <Line
          x1={activeConnection.start.x}
          y1={activeConnection.start.y}
          x2={activeConnection.point.x}
          y2={activeConnection.point.y}
          stroke={colors.info}
          strokeWidth={3}
          strokeDasharray="6,6"
          strokeLinecap="round"
        />
      )}
    </Svg>
  );
}
