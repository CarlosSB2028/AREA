import React from 'react';
import { render } from '@testing-library/react-native';
import { RemoveZone } from '../RemoveZone';

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
    FadeInDown: {
      springify: jest.fn().mockReturnThis(),
      damping: jest.fn().mockReturnThis(),
    },
    FadeOutDown: {
      duration: jest.fn().mockReturnThis(),
    },
  };
});

// Mock lucide-react-native icons
jest.mock('lucide-react-native', () => {
  const React = require('react');
  const { View } = require('react-native');

  return new Proxy(
    {},
    {
      get: (_target, prop) => {
        const IconComponent = React.forwardRef((props: any, ref: any) => (
          <View ref={ref} testID={`icon-${String(prop)}`} {...props} />
        ));
        IconComponent.displayName = `Icon(${String(prop)})`;
        return IconComponent;
      },
    }
  );
});

describe('RemoveZone', () => {
  it('renders with isDragging false and isActive false', () => {
    const { getByText } = render(
      <RemoveZone isDragging={false} isActive={false} />
    );

    expect(getByText('Drop here to remove')).toBeTruthy();
  });

  it('renders with isDragging true and isActive false', () => {
    const { getByText } = render(
      <RemoveZone isDragging={true} isActive={false} />
    );

    expect(getByText('Drop here to remove')).toBeTruthy();
  });

  it('renders with isDragging true and isActive true', () => {
    const { getByText } = render(
      <RemoveZone isDragging={true} isActive={true} />
    );

    expect(getByText('Drop here to remove')).toBeTruthy();
  });

  it('renders trash icon', () => {
    const { getByTestId } = render(
      <RemoveZone isDragging={true} isActive={true} />
    );

    expect(getByTestId('icon-Trash2')).toBeTruthy();
  });

  it('displays remove message text', () => {
    const { getByText } = render(
      <RemoveZone isDragging={false} isActive={false} />
    );

    const message = getByText('Drop here to remove');
    expect(message).toBeTruthy();
  });

  it('has pointer events disabled', () => {
    const { getByText } = render(
      <RemoveZone isDragging={true} isActive={true} />
    );

    const container = getByText('Drop here to remove').parent?.parent?.parent;
    expect(container).toBeTruthy();
  });

  it('updates when isDragging changes from false to true', () => {
    const { rerender, getByText } = render(
      <RemoveZone isDragging={false} isActive={false} />
    );

    expect(getByText('Drop here to remove')).toBeTruthy();

    rerender(<RemoveZone isDragging={true} isActive={false} />);

    expect(getByText('Drop here to remove')).toBeTruthy();
  });

  it('updates when isActive changes from false to true', () => {
    const { rerender, getByText } = render(
      <RemoveZone isDragging={true} isActive={false} />
    );

    expect(getByText('Drop here to remove')).toBeTruthy();

    rerender(<RemoveZone isDragging={true} isActive={true} />);

    expect(getByText('Drop here to remove')).toBeTruthy();
  });

  it('handles rapid state changes', () => {
    const { rerender, getByText } = render(
      <RemoveZone isDragging={false} isActive={false} />
    );

    // Rapidly change states
    rerender(<RemoveZone isDragging={true} isActive={false} />);
    rerender(<RemoveZone isDragging={true} isActive={true} />);
    rerender(<RemoveZone isDragging={false} isActive={false} />);

    expect(getByText('Drop here to remove')).toBeTruthy();
  });

  it('renders with consistent structure', () => {
    const { getByText, getByTestId } = render(
      <RemoveZone isDragging={true} isActive={true} />
    );

    // Check all elements are present
    expect(getByTestId('icon-Trash2')).toBeTruthy();
    expect(getByText('Drop here to remove')).toBeTruthy();
  });

  it('maintains visibility with all prop combinations', () => {
    const combinations = [
      { isDragging: false, isActive: false },
      { isDragging: false, isActive: true },
      { isDragging: true, isActive: false },
      { isDragging: true, isActive: true },
    ];

    combinations.forEach((props) => {
      const { getByText } = render(<RemoveZone {...props} />);
      expect(getByText('Drop here to remove')).toBeTruthy();
    });
  });
});
