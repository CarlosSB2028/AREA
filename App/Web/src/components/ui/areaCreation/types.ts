import { ServiceData, ConnectionData } from '../../../types';

export interface FreeLayoutBoardProps {
  services: ServiceData[];
  connections: ConnectionData[];
  onAddService: () => void;
  onRemoveService: (id: string) => void;
  onEditService: (service: ServiceData) => void;
  onUpdateService: (service: ServiceData) => void;
  onCreateConnection: (connection: ConnectionData) => void;
  onRemoveConnection: (connectionId: string) => void;
  onDuplicateService?: (id: string) => void;
}

export interface DragState {
  isDragging: boolean;
  draggedServiceId: string | null;
  offset: { x: number; y: number };
}

export interface LinkingState {
  isLinking: boolean;
  sourceId: string | null;
  targetId: string | null;
}

export interface CanvasState {
  scale: number;
  offsetX: number;
  offsetY: number;
  isPanning: boolean;
  lastMousePos: { x: number; y: number } | null;
}

export const CARD_WIDTH = 300;
export const CARD_HEIGHT = 150;
export const INITIAL_CANVAS_OFFSET_X = -4000;
export const INITIAL_CANVAS_OFFSET_Y = -4200;
