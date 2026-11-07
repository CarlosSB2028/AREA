import { renderHook, act } from '@testing-library/react';
import { useCanvasControls } from '../src/components/ui/areaCreation/hooks/useCanvasControls';

describe('useCanvasControls', () => {
  let mockBoardRef: React.RefObject<HTMLDivElement>;

  beforeEach(() => {
    const mockElement = {
      getBoundingClientRect: jest.fn(() => ({
        left: 0,
        top: 0,
        width: 800,
        height: 600,
        right: 800,
        bottom: 600,
      })),
      clientWidth: 800,
      clientHeight: 600,
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
    } as unknown as HTMLDivElement;

    mockBoardRef = {
      current: mockElement,
    };

    // Mock document event listeners
    document.addEventListener = jest.fn();
    document.removeEventListener = jest.fn();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('initializes with default canvas state', () => {
    const { result } = renderHook(() => useCanvasControls(mockBoardRef));

    expect(result.current.canvasState).toEqual({
      scale: 1,
      offsetX: -4000, // INITIAL_CANVAS_OFFSET_X
      offsetY: -4200, // INITIAL_CANVAS_OFFSET_Y
      isPanning: false,
      lastMousePos: null,
    });
  });

  it('handles zoom in', () => {
    const { result } = renderHook(() => useCanvasControls(mockBoardRef));

    act(() => {
      result.current.zoomIn();
    });

    expect(result.current.canvasState.scale).toBe(1.1);
  });

  it('handles zoom out', () => {
    const { result } = renderHook(() => useCanvasControls(mockBoardRef));

    act(() => {
      result.current.zoomOut();
    });

    expect(result.current.canvasState.scale).toBe(0.9);
  });

  it('prevents zoom below minimum', () => {
    const { result } = renderHook(() => useCanvasControls(mockBoardRef));

    // Zoom out multiple times to reach minimum
    act(() => {
      for (let i = 0; i < 20; i++) {
        result.current.zoomOut();
      }
    });

    expect(result.current.canvasState.scale).toBe(0.1);
  });

  it('prevents zoom above maximum', () => {
    const { result } = renderHook(() => useCanvasControls(mockBoardRef));

    // Zoom in multiple times to reach maximum
    act(() => {
      for (let i = 0; i < 30; i++) {
        result.current.zoomIn();
      }
    });

    expect(result.current.canvasState.scale).toBe(3);
  });

  it('handles mouse down for panning', () => {
    const { result } = renderHook(() => useCanvasControls(mockBoardRef));

    const mockEvent = {
      preventDefault: jest.fn(),
      button: 1, // Middle button
      clientX: 100,
      clientY: 100,
      target: mockBoardRef.current,
    } as unknown as React.MouseEvent;

    act(() => {
      result.current.handleBoardMouseDown(mockEvent, { current: null });
    });

    expect(result.current.canvasState.isPanning).toBe(true);
    expect(result.current.canvasState.lastMousePos).toEqual({ x: 100, y: 100 });
    expect(mockEvent.preventDefault).toHaveBeenCalled();
  });

  it('converts screen coordinates to canvas coordinates', () => {
    const { result } = renderHook(() => useCanvasControls(mockBoardRef));

    const canvasCoords = result.current.screenToCanvas(100, 100);

    // With default state (scale: 1, offsetX: -4000, offsetY: -4200)
    // screenX - boardRect.left - offsetX = 100 - 0 - (-4000) = 4100
    // canvasX = 4100 / 1 = 4100
    expect(canvasCoords).toEqual({ x: 4100, y: 4300 });
  });

  it('handles wheel events for zooming', () => {
    const { result } = renderHook(() => useCanvasControls(mockBoardRef));

    const mockWheelEvent = {
      preventDefault: jest.fn(),
      clientX: 400, // Center of board
      clientY: 300,
      deltaY: -100, // Zoom in
    } as unknown as WheelEvent;

    // Mock the board's addEventListener to trigger the wheel handler
    const wheelCall = (mockBoardRef.current!.addEventListener as jest.Mock).mock.calls.find(
      ([event]) => event === 'wheel'
    );

    expect(wheelCall).toBeDefined();

    const wheelHandler = wheelCall![1];
    act(() => {
      wheelHandler(mockWheelEvent);
    });

    expect(result.current.canvasState.scale).toBeGreaterThan(1);
    expect(mockWheelEvent.preventDefault).toHaveBeenCalled();
  });

  it('cleans up event listeners on unmount', () => {
    const { unmount } = renderHook(() => useCanvasControls(mockBoardRef));

    unmount();

    expect(mockBoardRef.current!.removeEventListener).toHaveBeenCalledWith('wheel', expect.any(Function));
    expect(document.removeEventListener).toHaveBeenCalledWith('mousemove', expect.any(Function));
    expect(document.removeEventListener).toHaveBeenCalledWith('mouseup', expect.any(Function));
  });
});