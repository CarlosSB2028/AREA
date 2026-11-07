import React from 'react';
import { render } from '@testing-library/react-native';
import { DotGridBackground } from '../DotGridBackground';

// Mock react-native-svg
jest.mock('react-native-svg', () => {
  const React = require('react');
  const { View } = require('react-native');

  const Svg = React.forwardRef((props: any, ref: any) => (
    <View ref={ref} testID="svg-container" {...props} />
  ));
  Svg.displayName = 'Svg';

  const Circle = (props: any) => (
    <View testID={`circle-${props.cx}-${props.cy}`} {...props} />
  );

  return {
    __esModule: true,
    default: Svg,
    Svg,
    Circle,
  };
});

// Mock constants
jest.mock('../constants', () => ({
  screenWidth: 400,
  screenHeight: 800,
  CARD_WIDTH: 160,
  CARD_HEIGHT: 100,
  REMOVE_ZONE_HEIGHT: 120,
}));

describe('DotGridBackground', () => {
  it('renders without crashing', () => {
    const { getByTestId } = render(<DotGridBackground />);
    expect(getByTestId('svg-container')).toBeTruthy();
  });

  it('renders svg container with correct styling', () => {
    const { getByTestId } = render(<DotGridBackground />);
    const svg = getByTestId('svg-container');

    expect(svg).toBeTruthy();
    expect(svg.props.style).toBeDefined();
  });

  it('has position absolute in style', () => {
    const { getByTestId } = render(<DotGridBackground />);
    const svg = getByTestId('svg-container');

    expect(svg.props.style.position).toBe('absolute');
  });

  it('has correct z-index for background layer', () => {
    const { getByTestId } = render(<DotGridBackground />);
    const svg = getByTestId('svg-container');

    expect(svg.props.style.zIndex).toBe(-1);
  });

  it('covers entire canvas area', () => {
    const { getByTestId } = render(<DotGridBackground />);
    const svg = getByTestId('svg-container');

    // Should be 3x the screen size
    expect(svg.props.style.width).toBe(400 * 3);
    expect(svg.props.style.height).toBe(800 * 3);
  });

  it('starts from top-left corner with offset for scrollable canvas', () => {
    const { getByTestId } = render(<DotGridBackground />);
    const svg = getByTestId('svg-container');

    // Grid extends beyond viewport for pan/zoom functionality
    expect(svg.props.style.top).toBe(-800);
    expect(svg.props.style.left).toBe(-400);
  });

  it('renders grid dots as children', () => {
    const { getByTestId } = render(<DotGridBackground />);
    const svg = getByTestId('svg-container');

    expect(svg.props.children).toBeDefined();
    expect(Array.isArray(svg.props.children)).toBe(true);
  });

  it('memoizes dots to avoid unnecessary re-renders', () => {
    const { rerender, getByTestId } = render(<DotGridBackground />);
    const firstRender = getByTestId('svg-container');
    const firstChildren = firstRender.props.children;

    rerender(<DotGridBackground />);
    const secondRender = getByTestId('svg-container');
    const secondChildren = secondRender.props.children;

    // Children should be the same reference due to useMemo
    expect(firstChildren).toBe(secondChildren);
  });

  it('renders consistent output on multiple renders', () => {
    const { getByTestId, rerender } = render(<DotGridBackground />);
    const firstRender = getByTestId('svg-container');

    rerender(<DotGridBackground />);
    const secondRender = getByTestId('svg-container');

    expect(firstRender.props.style).toEqual(secondRender.props.style);
  });

  it('creates a grid pattern with appropriate dot spacing', () => {
    const { getByTestId } = render(<DotGridBackground />);
    const svg = getByTestId('svg-container');

    // Should have multiple dots
    expect(svg.props.children.length).toBeGreaterThan(1);
  });

  it('renders at correct layer for background', () => {
    const { getByTestId } = render(<DotGridBackground />);
    const svg = getByTestId('svg-container');

    // z-index of -1 ensures it's behind all other content
    expect(svg.props.style.zIndex).toBeLessThan(0);
  });

  it('maintains fixed position with appropriate offsets', () => {
    const { getByTestId } = render(<DotGridBackground />);
    const svg = getByTestId('svg-container');

    expect(svg.props.style.position).toBe('absolute');
    expect(svg.props.style.top).toBe(-800);
    expect(svg.props.style.left).toBe(-400);
  });

  it('has sufficient size for scrollable canvas', () => {
    const { getByTestId } = render(<DotGridBackground />);
    const svg = getByTestId('svg-container');

    // 3x multiplier ensures enough space for panning
    expect(svg.props.style.width).toBeGreaterThan(400);
    expect(svg.props.style.height).toBeGreaterThan(800);
  });
});
