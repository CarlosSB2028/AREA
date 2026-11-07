import React from 'react';
import { render } from '@testing-library/react-native';
import { Line } from 'react-native-svg';
import { ConnectionLayer } from '../ConnectionLayer';
import type { ActiveConnection, CardData, Connection } from '@/types/area-detail';
import type { ActionDto, ReactionDto } from '@/types/areas';

describe('ConnectionLayer', () => {
  const actionData: ActionDto = {
    id: 'action-1',
    actionDefinitionId: 'def-1',
    name: 'Action card',
    parameters: {},
    activationConfig: {
      type: 'manual',
    },
  };

  const reactionData: ReactionDto = {
    id: 'reaction-1',
    actionDefinitionId: 'def-2',
    name: 'Reaction card',
    parameters: {},
    order: 1,
    continue_on_error: false,
  };

  const cards: CardData[] = [
    {
      id: 'card-1',
      type: 'action',
      position: { x: 10, y: 20 },
      data: actionData,
    },
    {
      id: 'card-2',
      type: 'reaction',
      position: { x: 110, y: 220 },
      data: reactionData,
    },
  ];

  const connections: Connection[] = [
    { from: 'card-1', to: 'card-2' },
  ];

  const activeConnection: ActiveConnection = {
    from: 'card-1',
    fromDirection: 'right',
    start: { x: 110, y: 70 },
    point: { x: 200, y: 120 },
  };

  it('renders existing connections between cards', () => {
    const { UNSAFE_getAllByType } = render(
      <ConnectionLayer cards={cards} connections={connections} activeConnection={null} />
    );

    const lines = UNSAFE_getAllByType(Line);
    expect(lines).toHaveLength(2); // visible + touch
    const visibleLines = lines.filter((line) => line.props.stroke !== 'transparent');
    expect(visibleLines).toHaveLength(1);
    expect(visibleLines[0].props.x1).toBeGreaterThan(0);
    expect(visibleLines[0].props.x2).toBeGreaterThan(0);
  });

  it('renders active connection preview when provided', () => {
    const { UNSAFE_getAllByType } = render(
      <ConnectionLayer cards={cards} connections={connections} activeConnection={activeConnection} />
    );

    const lines = UNSAFE_getAllByType(Line);
    expect(lines).toHaveLength(3); // 2 for connection + 1 for active

    const previewLine = lines.find((line) => line.props.strokeDasharray);
    expect(previewLine?.props.x2).toBe(activeConnection.point.x);
    expect(previewLine?.props.y2).toBe(activeConnection.point.y);
  });
});
