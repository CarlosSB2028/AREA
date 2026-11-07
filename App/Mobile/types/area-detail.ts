import type { ActionDto, ReactionDto } from './areas';

export interface CardDockPosition {
  x: number;
  y: number;
}

export type CardType = 'action' | 'reaction';

export interface CardData {
  id: string;
  type: CardType;
  data: ActionDto | ReactionDto;
  position: CardDockPosition;
}

export type { ActionDto, ReactionDto } from './areas';

export interface Connection {
  from: string;
  to: string;
  order?: number;
}

export interface ActiveConnection {
  from: string;
  fromDirection: 'left' | 'right';
  start: CardDockPosition;
  point: CardDockPosition;
}
