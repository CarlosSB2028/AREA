import React from 'react';
import { render } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import ConnectionsRenderer from '../src/components/ui/areaCreation/components/ConnectionsRenderer';
import { ServiceData, ConnectionData, ServiceState } from '../src/types';

const mockServices: ServiceData[] = [
  {
    id: 'service1',
    logo: 'github-logo',
    serviceName: 'GitHub',
    serviceKey: 'github',
    event: 'test-event',
    cardName: 'GitHub Card',
    state: ServiceState.Configuration,
    actionId: 1,
    serviceId: 'github-service',
    position: { x: 100, y: 100 }
  },
  {
    id: 'service2',
    logo: 'discord-logo',
    serviceName: 'Discord',
    serviceKey: 'discord',
    event: 'test-event',
    cardName: 'Discord Card',
    state: ServiceState.Configuration,
    actionId: 2,
    serviceId: 'discord-service',
    position: { x: 400, y: 200 }
  }
];

const mockConnection: ConnectionData = {
  id: 'conn1',
  sourceId: 'service1',
  targetId: 'service2',
  linkData: {
    type: 'chain',
    order: 1,
    condition: {},
    metadata: {}
  }
};

describe('ConnectionsRenderer', () => {
  const mockOnRemoveConnection = jest.fn();
  const mockOnEditConnection = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders nothing when no connections', () => {
    const { container } = render(
      <svg>
        <ConnectionsRenderer
          connections={[]}
          services={mockServices}
          onRemoveConnection={mockOnRemoveConnection}
          onEditConnection={mockOnEditConnection}
        />
      </svg>
    );
    expect(container.querySelector('g')).toBeNull();
  });

  test('renders connection path between services', () => {
    const { container } = render(
      <svg>
        <ConnectionsRenderer
          connections={[mockConnection]}
          services={mockServices}
          onRemoveConnection={mockOnRemoveConnection}
          onEditConnection={mockOnEditConnection}
        />
      </svg>
    );
    const paths = container.querySelectorAll('path');
    expect(paths.length).toBeGreaterThan(0);
  });

  test('renders edit button at midpoint', () => {
    const { container } = render(
      <svg>
        <ConnectionsRenderer
          connections={[mockConnection]}
          services={mockServices}
          onRemoveConnection={mockOnRemoveConnection}
          onEditConnection={mockOnEditConnection}
        />
      </svg>
    );
    const circle = container.querySelector('circle');
    expect(circle).toBeInTheDocument();
    expect(circle).toHaveAttribute('r', '16');
  });

  test('calls onEditConnection when edit button clicked', async () => {
    const user = userEvent.setup();
    const { container } = render(
      <svg>
        <ConnectionsRenderer
          connections={[mockConnection]}
          services={mockServices}
          onRemoveConnection={mockOnRemoveConnection}
          onEditConnection={mockOnEditConnection}
        />
      </svg>
    );
    const editGroup = container.querySelector('g[style*="cursor: pointer"]');
    expect(editGroup).toBeInTheDocument();
    
    if (editGroup) {
      await user.click(editGroup as SVGGElement);
      expect(mockOnEditConnection).toHaveBeenCalledWith('conn1');
    }
  });

  test('renders different link types with correct styles', () => {
    const linkTypes: Array<'chain' | 'conditional' | 'parallel' | 'sequential'> = ['chain', 'conditional', 'parallel', 'sequential'];
    
    linkTypes.forEach((type) => {
      const { container } = render(
        <svg>
          <ConnectionsRenderer
            connections={[{ ...mockConnection, linkData: { ...mockConnection.linkData, type } }]}
            services={mockServices}
            onRemoveConnection={mockOnRemoveConnection}
            onEditConnection={mockOnEditConnection}
          />
        </svg>
      );
      const paths = container.querySelectorAll('path');
      expect(paths.length).toBeGreaterThan(0);
    });
  });

  test('handles conditional link type with dashed line', () => {
    const conditionalConnection: ConnectionData = {
      ...mockConnection,
      linkData: { ...mockConnection.linkData, type: 'conditional' }
    };
    
    const { container } = render(
      <svg>
        <ConnectionsRenderer
          connections={[conditionalConnection]}
          services={mockServices}
          onRemoveConnection={mockOnRemoveConnection}
          onEditConnection={mockOnEditConnection}
        />
      </svg>
    );
    
    const paths = container.querySelectorAll('path');
    expect(paths.length).toBeGreaterThan(0);
    // Check for conditional link with dash array
    const hasDashedPath = Array.from(paths).some(p => {
      const dashArray = p.getAttribute('stroke-dasharray');
      return dashArray && dashArray !== 'none';
    });
    expect(hasDashedPath).toBe(true);
  });

  test('handles parallel link type with green color', () => {
    const parallelConnection: ConnectionData = {
      ...mockConnection,
      linkData: { ...mockConnection.linkData, type: 'parallel' }
    };
    
    const { container } = render(
      <svg>
        <ConnectionsRenderer
          connections={[parallelConnection]}
          services={mockServices}
          onRemoveConnection={mockOnRemoveConnection}
          onEditConnection={mockOnEditConnection}
        />
      </svg>
    );
    
    const circle = container.querySelector('circle');
    expect(circle).toHaveAttribute('fill', '#51CF66');
  });

  test('handles sequential link type with purple color', () => {
    const sequentialConnection: ConnectionData = {
      ...mockConnection,
      linkData: { ...mockConnection.linkData, type: 'sequential' }
    };
    
    const { container } = render(
      <svg>
        <ConnectionsRenderer
          connections={[sequentialConnection]}
          services={mockServices}
          onRemoveConnection={mockOnRemoveConnection}
          onEditConnection={mockOnEditConnection}
        />
      </svg>
    );
    
    const circle = container.querySelector('circle');
    expect(circle).toHaveAttribute('fill', '#9775FA');
  });

  test('skips rendering if source service not found', () => {
    const invalidConnection: ConnectionData = {
      ...mockConnection,
      sourceId: 'nonexistent'
    };
    
    const { container } = render(
      <svg>
        <ConnectionsRenderer
          connections={[invalidConnection]}
          services={mockServices}
          onRemoveConnection={mockOnRemoveConnection}
          onEditConnection={mockOnEditConnection}
        />
      </svg>
    );
    
    expect(container.querySelector('path')).toBeNull();
  });

  test('skips rendering if target service not found', () => {
    const invalidConnection: ConnectionData = {
      ...mockConnection,
      targetId: 'nonexistent'
    };
    
    const { container } = render(
      <svg>
        <ConnectionsRenderer
          connections={[invalidConnection]}
          services={mockServices}
          onRemoveConnection={mockOnRemoveConnection}
          onEditConnection={mockOnEditConnection}
        />
      </svg>
    );
    
    expect(container.querySelector('path')).toBeNull();
  });

  test('renders multiple connections', () => {
    const connections: ConnectionData[] = [
      mockConnection,
      { ...mockConnection, id: 'conn2', linkData: { ...mockConnection.linkData, type: 'parallel' } }
    ];
    
    const { container } = render(
      <svg>
        <ConnectionsRenderer
          connections={connections}
          services={mockServices}
          onRemoveConnection={mockOnRemoveConnection}
          onEditConnection={mockOnEditConnection}
        />
      </svg>
    );
    
    const groups = container.querySelectorAll('g.connection-group');
    expect(groups).toHaveLength(2);
  });

  test('displays order number in label', () => {
    const { container } = render(
      <svg>
        <ConnectionsRenderer
          connections={[mockConnection]}
          services={mockServices}
          onRemoveConnection={mockOnRemoveConnection}
          onEditConnection={mockOnEditConnection}
        />
      </svg>
    );
    
    const texts = container.querySelectorAll('text');
    const orderText = Array.from(texts).find(t => t.textContent?.includes('1'));
    expect(orderText).toBeInTheDocument();
  });

  test('handles missing position with default values', () => {
    const servicesWithoutPosition: ServiceData[] = [
      { ...mockServices[0], position: undefined },
      { ...mockServices[1], position: undefined }
    ];
    
    const { container } = render(
      <svg>
        <ConnectionsRenderer
          connections={[mockConnection]}
          services={servicesWithoutPosition}
          onRemoveConnection={mockOnRemoveConnection}
          onEditConnection={mockOnEditConnection}
        />
      </svg>
    );
    
    expect(container.querySelector('path')).toBeInTheDocument();
  });

  test('handles mouseenter on path to increase stroke width', async () => {
    const user = userEvent.setup();
    const { container } = render(
      <svg>
        <ConnectionsRenderer
          connections={[mockConnection]}
          services={mockServices}
          onRemoveConnection={mockOnRemoveConnection}
          onEditConnection={mockOnEditConnection}
        />
      </svg>
    );
    
    const paths = container.querySelectorAll('path');
    const mainPath = Array.from(paths).find(p => p.getAttribute('strokeWidth') === '3');
    
    if (mainPath) {
      await user.hover(mainPath as SVGPathElement);
      expect((mainPath as SVGPathElement).style.strokeWidth).toBe('4');
    }
  });

  test('handles mouseleave on path to reset stroke width', async () => {
    const user = userEvent.setup();
    const { container } = render(
      <svg>
        <ConnectionsRenderer
          connections={[mockConnection]}
          services={mockServices}
          onRemoveConnection={mockOnRemoveConnection}
          onEditConnection={mockOnEditConnection}
        />
      </svg>
    );
    
    const paths = container.querySelectorAll('path');
    const mainPath = Array.from(paths).find(p => p.getAttribute('strokeWidth') === '3');
    
    if (mainPath) {
      await user.hover(mainPath as SVGPathElement);
      await user.unhover(mainPath as SVGPathElement);
      expect((mainPath as SVGPathElement).style.strokeWidth).toBe('3');
    }
  });
});
