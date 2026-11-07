import React, { useMemo } from 'react';
import Svg, { Circle } from 'react-native-svg';

import { screenWidth, screenHeight } from './constants';

const DOT_SPACING = 30;
const DOT_SIZE = 2;

export function DotGridBackground() {
  const dots = useMemo(() => {
    const items: React.ReactElement[] = [];

    for (let x = 0; x < screenWidth * 3; x += DOT_SPACING) {
      for (let y = 0; y < screenHeight * 3; y += DOT_SPACING) {
        items.push(
          <Circle
            key={`${x}-${y}`}
            cx={x}
            cy={y}
            r={DOT_SIZE}
            fill="#e5e7eb"
          />
        );
      }
    }

    return items;
  }, []);

  return (
    <Svg
      style={{
        position: 'absolute',
        top: -screenHeight,
        left: -screenWidth,
        width: screenWidth * 3,
        height: screenHeight * 3,
        zIndex: -1,
      }}
    >
      {dots}
    </Svg>
  );
}
