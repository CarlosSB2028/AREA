import { render, screen } from '@testing-library/react';
import SVGDefinitions from '../src/components/ui/areaCreation/components/SVGDefinitions';

describe('SVGDefinitions', () => {
  it('renders SVG definitions with arrow markers', () => {
    const { container } = render(<SVGDefinitions />);

    // Check that defs element is rendered
    const defs = container.querySelector('defs');
    expect(defs).toBeInTheDocument();

    // Check that all arrow markers are present
    expect(container.querySelector('#arrowhead')).toBeInTheDocument();
    expect(container.querySelector('#arrowhead-green')).toBeInTheDocument();
    expect(container.querySelector('#arrowhead-yellow')).toBeInTheDocument();
    expect(container.querySelector('#arrowhead-red')).toBeInTheDocument();
    expect(container.querySelector('#arrowhead-purple')).toBeInTheDocument();

    // Check that glow filter is present
    expect(container.querySelector('#glow')).toBeInTheDocument();
  });

  it('renders arrow markers with correct attributes', () => {
    const { container } = render(<SVGDefinitions />);

    const arrowhead = container.querySelector('#arrowhead');
    expect(arrowhead).toHaveAttribute('markerWidth', '12');
    expect(arrowhead).toHaveAttribute('markerHeight', '8');
    expect(arrowhead).toHaveAttribute('refX', '11');
    expect(arrowhead).toHaveAttribute('refY', '4');
    expect(arrowhead).toHaveAttribute('orient', 'auto');
    expect(arrowhead).toHaveAttribute('markerUnits', 'strokeWidth');
  });

  it('renders paths with correct fill colors', () => {
    const { container } = render(<SVGDefinitions />);

    const bluePath = container.querySelector('#arrowhead path');
    expect(bluePath).toHaveAttribute('fill', '#4DABF7');

    const greenPath = container.querySelector('#arrowhead-green path');
    expect(greenPath).toHaveAttribute('fill', '#51CF66');

    const yellowPath = container.querySelector('#arrowhead-yellow path');
    expect(yellowPath).toHaveAttribute('fill', '#FFD43B');

    const redPath = container.querySelector('#arrowhead-red path');
    expect(redPath).toHaveAttribute('fill', '#FF6B6B');

    const purplePath = container.querySelector('#arrowhead-purple path');
    expect(purplePath).toHaveAttribute('fill', '#9775FA');
  });
});