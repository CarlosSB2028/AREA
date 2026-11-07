import { renderHook, act } from '@testing-library/react';
import { useDragAndDrop } from '../src/components/ui/areaCreation/hooks/useDragAndDrop';
import { ServiceData, ServiceState } from '../src/types';

// Mock data
const mockServices: ServiceData[] = [
  {
    id: 'service-1',
    logo: 'logo1.png',
    serviceName: 'Service 1',
    event: 'event1',
    cardName: 'Card 1',
    state: ServiceState.Configuration,
    actionId: 1,
    serviceId: 'service-id-1',
    position: { x: 100, y: 100 },
  },
  {
    id: 'service-2',
    logo: 'logo2.png',
    serviceName: 'Service 2',
    event: 'event2',
    cardName: 'Card 2',
    state: ServiceState.Success,
    actionId: 2,
    serviceId: 'service-id-2',
    position: { x: 200, y: 200 },
  },
];

const mockScreenToCanvas = jest.fn((screenX: number, screenY: number) => ({
  x: screenX - 50, // Simple transformation for testing
  y: screenY - 50,
}));

const mockOnUpdateService = jest.fn();
const mockOnEditService = jest.fn();
const mockHandleServiceClick = jest.fn();

describe('useDragAndDrop', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should initialize with default drag state', () => {
    const { result } = renderHook(() =>
      useDragAndDrop(
        mockServices,
        mockOnUpdateService,
        mockOnEditService,
        mockScreenToCanvas,
        { isLinking: false },
        mockHandleServiceClick
      )
    );

    expect(result.current.dragState).toEqual({
      isDragging: false,
      draggedServiceId: null,
      offset: { x: 0, y: 0 },
    });
  });

  it('should handle single click when not in linking mode', () => {
    const { result } = renderHook(() =>
      useDragAndDrop(
        mockServices,
        mockOnUpdateService,
        mockOnEditService,
        mockScreenToCanvas,
        { isLinking: false },
        mockHandleServiceClick
      )
    );

    const mockElement = {
      getBoundingClientRect: jest.fn(() => ({
        left: 100,
        top: 100,
        width: 200,
        height: 150,
      })),
    };

    const mockEvent = {
      button: 0,
      preventDefault: jest.fn(),
      stopPropagation: jest.fn(),
      currentTarget: mockElement,
      clientX: 150,
      clientY: 125,
    } as unknown as React.MouseEvent;

    act(() => {
      result.current.handleMouseDown(mockEvent, 'service-1');
    });

    expect(result.current.dragState).toEqual({
      isDragging: true,
      draggedServiceId: 'service-1',
      offset: { x: 50, y: 25 },
    });
  });

  it('should handle single click when in linking mode', () => {
    jest.useFakeTimers();

    const { result } = renderHook(() =>
      useDragAndDrop(
        mockServices,
        mockOnUpdateService,
        mockOnEditService,
        mockScreenToCanvas,
        { isLinking: true },
        mockHandleServiceClick
      )
    );

    const mockElement = {
      getBoundingClientRect: jest.fn(() => ({
        left: 100,
        top: 100,
        width: 200,
        height: 150,
      })),
    };

    const mockEvent = {
      button: 0,
      preventDefault: jest.fn(),
      stopPropagation: jest.fn(),
      currentTarget: mockElement,
      clientX: 150,
      clientY: 125,
    } as unknown as React.MouseEvent;

    act(() => {
      result.current.handleMouseDown(mockEvent, 'service-1');
    });

    // Fast-forward timers to trigger the delayed click handler
    act(() => {
      jest.advanceTimersByTime(300);
    });

    expect(mockHandleServiceClick).toHaveBeenCalledWith('service-1');

    jest.useRealTimers();
  });

  it('should handle double click to edit service', () => {
    const { result } = renderHook(() =>
      useDragAndDrop(
        mockServices,
        mockOnUpdateService,
        mockOnEditService,
        mockScreenToCanvas,
        { isLinking: false },
        mockHandleServiceClick
      )
    );

    const mockElement = {
      getBoundingClientRect: jest.fn(() => ({
        left: 100,
        top: 100,
        width: 200,
        height: 150,
      })),
    };

    const mockEvent = {
      button: 0,
      preventDefault: jest.fn(),
      stopPropagation: jest.fn(),
      currentTarget: mockElement,
      clientX: 150,
      clientY: 125,
    } as unknown as React.MouseEvent;

    // First click
    act(() => {
      result.current.handleMouseDown(mockEvent, 'service-1');
    });

    // Second click (double click)
    act(() => {
      result.current.handleMouseDown(mockEvent, 'service-1');
    });

    expect(mockOnEditService).toHaveBeenCalledWith(mockServices[0]);
    expect(result.current.dragState.isDragging).toBe(false);
  });

  it('should ignore middle mouse button clicks', () => {
    const { result } = renderHook(() =>
      useDragAndDrop(
        mockServices,
        mockOnUpdateService,
        mockOnEditService,
        mockScreenToCanvas,
        { isLinking: false },
        mockHandleServiceClick
      )
    );

    const mockElement = {
      getBoundingClientRect: jest.fn(() => ({
        left: 100,
        top: 100,
        width: 200,
        height: 150,
      })),
    };

    const mockEvent = {
      button: 1, // Middle mouse button
      preventDefault: jest.fn(),
      stopPropagation: jest.fn(),
      currentTarget: mockElement,
      clientX: 150,
      clientY: 125,
    } as unknown as React.MouseEvent;

    act(() => {
      result.current.handleMouseDown(mockEvent, 'service-1');
    });

    expect(result.current.dragState.isDragging).toBe(false);
    expect(mockEvent.preventDefault).not.toHaveBeenCalled();
    expect(mockEvent.stopPropagation).not.toHaveBeenCalled();
  });

  it('should update service position during drag', () => {
    const { result } = renderHook(() =>
      useDragAndDrop(
        mockServices,
        mockOnUpdateService,
        mockOnEditService,
        mockScreenToCanvas,
        { isLinking: false },
        mockHandleServiceClick
      )
    );

    const mockElement = {
      getBoundingClientRect: jest.fn(() => ({
        left: 100,
        top: 100,
        width: 200,
        height: 150,
      })),
    };

    const mockEvent = {
      button: 0,
      preventDefault: jest.fn(),
      stopPropagation: jest.fn(),
      currentTarget: mockElement,
      clientX: 150,
      clientY: 125,
    } as unknown as React.MouseEvent;

    // Start drag
    act(() => {
      result.current.handleMouseDown(mockEvent, 'service-1');
    });

    expect(result.current.dragState.isDragging).toBe(true);

    // Simulate mouse move
    const mockMouseMoveEvent = {
      clientX: 200,
      clientY: 150,
    } as MouseEvent;

    // Trigger the mousemove event listener that was added
    act(() => {
      document.dispatchEvent(new MouseEvent('mousemove', mockMouseMoveEvent));
    });

    expect(mockScreenToCanvas).toHaveBeenCalledWith(150, 125); // clientX - offset.x, clientY - offset.y
    expect(mockOnUpdateService).toHaveBeenCalledWith({
      ...mockServices[0],
      position: { x: 100, y: 75 }, // Result of screenToCanvas transformation
    });
  });

  it('should end drag on mouse up', () => {
    const { result } = renderHook(() =>
      useDragAndDrop(
        mockServices,
        mockOnUpdateService,
        mockOnEditService,
        mockScreenToCanvas,
        { isLinking: false },
        mockHandleServiceClick
      )
    );

    const mockElement = {
      getBoundingClientRect: jest.fn(() => ({
        left: 100,
        top: 100,
        width: 200,
        height: 150,
      })),
    };

    const mockEvent = {
      button: 0,
      preventDefault: jest.fn(),
      stopPropagation: jest.fn(),
      currentTarget: mockElement,
      clientX: 150,
      clientY: 125,
    } as unknown as React.MouseEvent;

    // Start drag
    act(() => {
      result.current.handleMouseDown(mockEvent, 'service-1');
    });

    expect(result.current.dragState.isDragging).toBe(true);

    // End drag
    act(() => {
      document.dispatchEvent(new MouseEvent('mouseup'));
    });

    expect(result.current.dragState).toEqual({
      isDragging: false,
      draggedServiceId: null,
      offset: { x: 0, y: 0 },
    });
  });

  it('should handle non-existent service gracefully', () => {
    const { result } = renderHook(() =>
      useDragAndDrop(
        mockServices,
        mockOnUpdateService,
        mockOnEditService,
        mockScreenToCanvas,
        { isLinking: false },
        mockHandleServiceClick
      )
    );

    const mockElement = {
      getBoundingClientRect: jest.fn(() => ({
        left: 100,
        top: 100,
        width: 200,
        height: 150,
      })),
    };

    const mockEvent = {
      button: 0,
      preventDefault: jest.fn(),
      stopPropagation: jest.fn(),
      currentTarget: mockElement,
      clientX: 150,
      clientY: 125,
    } as unknown as React.MouseEvent;

    act(() => {
      result.current.handleMouseDown(mockEvent, 'non-existent-service');
    });

    expect(result.current.dragState.isDragging).toBe(false);
  });

  it('should prevent default and stop propagation on valid mouse down', () => {
    const { result } = renderHook(() =>
      useDragAndDrop(
        mockServices,
        mockOnUpdateService,
        mockOnEditService,
        mockScreenToCanvas,
        { isLinking: false },
        mockHandleServiceClick
      )
    );

    const mockElement = {
      getBoundingClientRect: jest.fn(() => ({
        left: 100,
        top: 100,
        width: 200,
        height: 150,
      })),
    };

    const mockEvent = {
      button: 0,
      preventDefault: jest.fn(),
      stopPropagation: jest.fn(),
      currentTarget: mockElement,
      clientX: 150,
      clientY: 125,
    } as unknown as React.MouseEvent;

    act(() => {
      result.current.handleMouseDown(mockEvent, 'service-1');
    });

    expect(mockEvent.preventDefault).toHaveBeenCalled();
    expect(mockEvent.stopPropagation).toHaveBeenCalled();
  });
});