import { render, screen } from '@testing-library/react-native';
import React from 'react';
import { Text } from 'react-native';
import { act } from 'react-test-renderer';
import { Skeleton, SkeletonText } from '../skeleton';

describe('Skeleton', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });
  afterEach(() => {
    act(() => {
      jest.runOnlyPendingTimers();
    });
    jest.useRealTimers();
  });
  it('renders animated placeholder when not loaded', () => {
    const { toJSON } = render(<Skeleton testID="skeleton" />);
    act(() => {
      jest.advanceTimersByTime(1000);
    });
    expect(toJSON()).toBeTruthy();
  });

  it('renders children when loaded', () => {
    render(
      <Skeleton isLoaded>
        <Text>loaded</Text>
      </Skeleton>
    );
    expect(screen.getByText('loaded')).toBeTruthy();
  });

  it('supports variants', () => {
    const { getByTestId, rerender } = render(<Skeleton variant="rounded" testID="v" />);
    act(() => {
      jest.advanceTimersByTime(1000);
    });
    expect(getByTestId('v')).toBeTruthy();
    rerender(<Skeleton variant="circular" testID="v" />);
    act(() => {
      jest.advanceTimersByTime(1000);
    });
    expect(getByTestId('v')).toBeTruthy();
    rerender(<Skeleton variant="sharp" testID="v" />);
    act(() => {
      jest.advanceTimersByTime(1000);
    });
    expect(getByTestId('v')).toBeTruthy();
  });
});

describe('SkeletonText', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });
  afterEach(() => {
    act(() => {
      jest.runOnlyPendingTimers();
    });
    jest.useRealTimers();
  });
  it('renders multiple lines when not loaded', () => {
    const { toJSON } = render(<SkeletonText _lines={4} />);
    act(() => {
      jest.advanceTimersByTime(1000);
    });
    expect(toJSON()).toBeTruthy();
  });

  it('renders children when loaded', () => {
    render(
      <SkeletonText isLoaded>
        <Text>text-loaded</Text>
      </SkeletonText>
    );
    expect(screen.getByText('text-loaded')).toBeTruthy();
  });
});
