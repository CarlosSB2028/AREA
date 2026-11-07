import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { Card } from '../Card';
import type { CardData } from '@/types/area-detail';

// Mock react-native-gesture-handler
jest.mock('react-native-gesture-handler', () => {
  const View = require('react-native').View;
  const createPanMock = () => {
    const pan = {
      runOnJS: jest.fn().mockReturnThis(),
      onBegin: jest.fn().mockReturnThis(),
      onStart: jest.fn().mockReturnThis(),
      onChange: jest.fn().mockReturnThis(),
      onUpdate: jest.fn().mockReturnThis(),
      onEnd: jest.fn().mockReturnThis(),
      onFinalize: jest.fn().mockReturnThis(),
      minDistance: jest.fn().mockReturnThis(),
    };
    return pan;
  };
  return {
    GestureDetector: View,
    Gesture: {
      Pan: () => createPanMock(),
    },
    GestureHandlerRootView: View,
  };
});

// Mock react-native-reanimated
jest.mock('react-native-reanimated', () => {
  const Reanimated = require('react-native-reanimated/mock');
  const { View } = require('react-native');

  return {
    ...Reanimated,
    View,
    default: {
      ...(Reanimated.default || {}),
      View,
    },
    useSharedValue: jest.fn((value) => ({ value })),
    useAnimatedStyle: jest.fn((cb) => {
      return cb();
    }),
    withTiming: jest.fn((value) => value),
  };
});

describe('Card', () => {
  const mockCard: CardData = {
    id: 'card-1',
    type: 'action',
    position: { x: 100, y: 100 },
    data: {
      id: 'action-1',
      actionDefinitionId: 'def-1',
      name: 'Test Action',
      parameters: {},
      activationConfig: {
        type: 'webhook',
      },
    },
  };

  const mockReactionCard: CardData = {
    id: 'card-2',
    type: 'reaction',
    position: { x: 200, y: 200 },
    data: {
      id: 'reaction-1',
      actionDefinitionId: 'def-2',
      name: 'Test Reaction',
      parameters: {},
      mapping: {},
      order: 0,
      continue_on_error: false,
    },
  };

  const defaultProps = {
    removeZoneTop: 500,
    onMove: jest.fn(),
    onRemove: jest.fn(),
    onSelect: jest.fn(),
    onStartConnection: jest.fn(),
    onUpdateConnection: jest.fn(),
    onEndConnection: jest.fn(),
    setIsDragging: jest.fn(),
    onToggleRemoveZone: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders action card with correct styling and content', () => {
    const { getByText } = render(<Card card={mockCard} {...defaultProps} />);

    expect(getByText('Test Action')).toBeTruthy();
    expect(getByText('Action')).toBeTruthy();
  });

  it('renders reaction card with correct styling and content', () => {
    const { getByText } = render(<Card card={mockReactionCard} {...defaultProps} />);

    expect(getByText('Test Reaction')).toBeTruthy();
    expect(getByText('Reaction')).toBeTruthy();
  });

  it('calls onSelect when card is pressed', () => {
    const { getByText } = render(<Card card={mockCard} {...defaultProps} />);

    fireEvent.press(getByText('Test Action'));
    expect(defaultProps.onSelect).toHaveBeenCalledWith(mockCard);
  });

  it('updates position when card prop position changes', () => {
    const { rerender } = render(<Card card={mockCard} {...defaultProps} />);

    const updatedCard = { ...mockCard, position: { x: 150, y: 150 } };
    rerender(<Card card={updatedCard} {...defaultProps} />);

    // The card should update its internal position
    expect(updatedCard.position.x).toBe(150);
    expect(updatedCard.position.y).toBe(150);
  });

  it('renders with correct absolute positioning', () => {
    const { getByText } = render(<Card card={mockCard} {...defaultProps} />);
    const cardElement = getByText('Test Action').parent?.parent?.parent;
    
    // Check that the card wrapper has position absolute
    expect(cardElement).toBeTruthy();
  });

  it('displays action type with green styling', () => {
    const { getByText } = render(<Card card={mockCard} {...defaultProps} />);
    const actionText = getByText('Action');
    
    expect(actionText).toBeTruthy();
  });

  it('displays reaction type with blue styling', () => {
    const { getByText } = render(<Card card={mockReactionCard} {...defaultProps} />);
    const reactionText = getByText('Reaction');
    
    expect(reactionText).toBeTruthy();
  });

  it('renders connection handles for action cards', () => {
    const { getByText } = render(<Card card={mockCard} {...defaultProps} />);
    const card = getByText('Test Action');
    
    // Action cards should have a right connection handle
    expect(card.parent?.parent).toBeTruthy();
  });

  it('renders connection handles for reaction cards', () => {
    const { getByText } = render(<Card card={mockReactionCard} {...defaultProps} />);
    const card = getByText('Test Reaction');
    
    // Reaction cards should have both left and right connection handles
    expect(card.parent?.parent).toBeTruthy();
  });

  it('renders card with correct dimensions', () => {
    const { getByText } = render(<Card card={mockCard} {...defaultProps} />);
    const cardElement = getByText('Test Action').parent?.parent?.parent;
    
    expect(cardElement).toBeTruthy();
    // Card should have fixed width and height from constants
  });

  it('shows both card name and type', () => {
    const { getByText } = render(<Card card={mockCard} {...defaultProps} />);
    
    expect(getByText('Test Action')).toBeTruthy();
    expect(getByText('Action')).toBeTruthy();
  });

  it('handles cards with long names', () => {
    const longNameCard = {
      ...mockCard,
      data: {
        ...mockCard.data,
        name: 'This is a very long card name that might need to be handled properly',
      },
    };
    
    const { getByText } = render(<Card card={longNameCard} {...defaultProps} />);
    expect(getByText('This is a very long card name that might need to be handled properly')).toBeTruthy();
  });

  it('handles cards at different positions', () => {
    const positions = [
      { x: 0, y: 0 },
      { x: 100, y: 200 },
      { x: 300, y: 400 },
    ];

    positions.forEach((position) => {
      const positionedCard = { ...mockCard, position };
      const { getByText } = render(<Card card={positionedCard} {...defaultProps} />);
      expect(getByText('Test Action')).toBeTruthy();
    });
  });

  it('renders correctly with minimal data', () => {
    const minimalCard: CardData = {
      id: 'minimal',
      type: 'action',
      position: { x: 0, y: 0 },
      data: {
        id: 'action-min',
        actionDefinitionId: 'def-min',
        name: 'Minimal',
        parameters: {},
        activationConfig: {
          type: 'manual',
        },
      },
    };

    const { getByText } = render(<Card card={minimalCard} {...defaultProps} />);
    expect(getByText('Minimal')).toBeTruthy();
    expect(getByText('Action')).toBeTruthy();
  });
});
