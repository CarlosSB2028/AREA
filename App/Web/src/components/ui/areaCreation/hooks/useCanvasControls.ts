import { useState, useCallback, useEffect, useRef } from 'react';
import { CanvasState, INITIAL_CANVAS_OFFSET_X, INITIAL_CANVAS_OFFSET_Y } from '../types';

export function useCanvasControls(boardRef: React.RefObject<HTMLDivElement | null>) {
  const [canvasState, setCanvasState] = useState<CanvasState>(() => ({
    scale: 1,
    offsetX: INITIAL_CANVAS_OFFSET_X,
    offsetY: INITIAL_CANVAS_OFFSET_Y,
    isPanning: false,
    lastMousePos: null,
  }));

  const mousePositionRef = useRef({ x: 0, y: 0 });
  const handleWheel = useCallback((e: WheelEvent) => {
    e.preventDefault();
    if (!boardRef.current)
        return;
    const boardRect = boardRef.current.getBoundingClientRect();
    const mouseX = e.clientX - boardRect.left;
    const mouseY = e.clientY - boardRect.top;
    const delta = -e.deltaY * 0.0003;
    setCanvasState(prev => {
      const newScale = Math.min(Math.max(0.1, prev.scale + delta), 3);
      const pointX = (mouseX - prev.offsetX) / prev.scale;
      const pointY = (mouseY - prev.offsetY) / prev.scale;
      const newOffsetX = mouseX - pointX * newScale;
      const newOffsetY = mouseY - pointY * newScale;
      return {
        ...prev,
        scale: newScale,
        offsetX: newOffsetX,
        offsetY: newOffsetY,
      };
    });
  }, [boardRef]);

  const handleBoardMouseDown = useCallback((e: React.MouseEvent, boardInnerRef: React.RefObject<HTMLDivElement | null>) => {
    const isMiddleButton = e.button === 1;
    const isLeftButton = e.button === 0;
    const isOnBoard = e.target === boardRef.current || e.target === boardInnerRef.current;

    if (isMiddleButton || (isOnBoard && isLeftButton)) {
      e.preventDefault();
      setCanvasState(prev => ({
        ...prev,
        isPanning: true,
        lastMousePos: { x: e.clientX, y: e.clientY },
      }));
    }
  }, [boardRef]);
  const handleBoardMouseMove = useCallback((e: MouseEvent) => {
    if (boardRef.current) {
      const boardRect = boardRef.current.getBoundingClientRect();
      mousePositionRef.current = {
        x: e.clientX - boardRect.left,
        y: e.clientY - boardRect.top,
      };
    }

    setCanvasState(prev => {
      if (prev.isPanning && prev.lastMousePos) {
        const deltaX = e.clientX - prev.lastMousePos.x;
        const deltaY = e.clientY - prev.lastMousePos.y;
        return {
          ...prev,
          offsetX: prev.offsetX + deltaX,
          offsetY: prev.offsetY + deltaY,
          lastMousePos: { x: e.clientX, y: e.clientY },
        };
      }
      return prev;
    });
  }, [boardRef]);

  const handleBoardMouseUp = useCallback(() => {
    setCanvasState(prev => ({
      ...prev,
      isPanning: false,
      lastMousePos: null,
    }));
  }, []);

  const zoomIn = useCallback(() => {
    setCanvasState(prev => {
      const newScale = Math.min(prev.scale + 0.1, 3);
      const mouseX = mousePositionRef.current.x || (boardRef.current?.clientWidth || 0) / 2;
      const mouseY = mousePositionRef.current.y || (boardRef.current?.clientHeight || 0) / 2;
      const pointX = (mouseX - prev.offsetX) / prev.scale;
      const pointY = (mouseY - prev.offsetY) / prev.scale;
      const newOffsetX = mouseX - pointX * newScale;
      const newOffsetY = mouseY - pointY * newScale;

      return {
        ...prev,
        scale: newScale,
        offsetX: newOffsetX,
        offsetY: newOffsetY,
      };
    });
  }, [boardRef]);

  const zoomOut = useCallback(() => {
    setCanvasState(prev => {
      const newScale = Math.max(prev.scale - 0.1, 0.1);
      const mouseX = mousePositionRef.current.x || (boardRef.current?.clientWidth || 0) / 2;
      const mouseY = mousePositionRef.current.y || (boardRef.current?.clientHeight || 0) / 2;
      const pointX = (mouseX - prev.offsetX) / prev.scale;
      const pointY = (mouseY - prev.offsetY) / prev.scale;
      const newOffsetX = mouseX - pointX * newScale;
      const newOffsetY = mouseY - pointY * newScale;

      return {
        ...prev,
        scale: newScale,
        offsetX: newOffsetX,
        offsetY: newOffsetY,
      };
    });
  }, [boardRef]);

  const screenToCanvas = useCallback((screenX: number, screenY: number) => {
    if (!boardRef.current)
      return { x: 0, y: 0 };
    const boardRect = boardRef.current.getBoundingClientRect();
    return {
      x: (screenX - boardRect.left - canvasState.offsetX) / canvasState.scale,
      y: (screenY - boardRect.top - canvasState.offsetY) / canvasState.scale,
    };
  }, [boardRef, canvasState.offsetX, canvasState.offsetY, canvasState.scale]);

  useEffect(() => {
    const board = boardRef.current;
    if (!board)
			return;
    board.addEventListener('wheel', handleWheel, { passive: false });
    document.addEventListener('mousemove', handleBoardMouseMove);
    document.addEventListener('mouseup', handleBoardMouseUp);
    return () => {
      board.removeEventListener('wheel', handleWheel);
      document.removeEventListener('mousemove', handleBoardMouseMove);
      document.removeEventListener('mouseup', handleBoardMouseUp);
    };
  }, [boardRef, handleWheel, handleBoardMouseMove, handleBoardMouseUp]);

  return {
    canvasState,
    handleBoardMouseDown,
    zoomIn,
    zoomOut,
    screenToCanvas,
  };
}
