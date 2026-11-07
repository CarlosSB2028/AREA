import areasFixture from '@/mocks/areas.json';
import type { ActionDto, AreaDto, ReactionDto } from '@/types/areas';

export interface MockOptions {
  delay?: number;
}

export interface MockCreateAreaPayload {
  name: string;
  description?: string;
  enabled?: boolean;
  actions: ActionDto[];
  reactions: ReactionDto[];
}

export type MockUpdateAreaPayload = Partial<MockCreateAreaPayload>;

const cloneAction = (action: ActionDto): ActionDto => ({
  ...action,
  parameters: { ...action.parameters },
  activationConfig: { ...action.activationConfig },
});

const cloneReaction = (reaction: ReactionDto): ReactionDto => ({
  ...reaction,
  parameters: { ...reaction.parameters },
  mapping: reaction.mapping ? { ...reaction.mapping } : undefined,
  condition: reaction.condition ? { ...reaction.condition } : undefined,
  activationConfig: reaction.activationConfig ? { ...reaction.activationConfig } : undefined,
});

const cloneArea = (area: AreaDto): AreaDto => ({
  ...area,
  actions: area.actions.map(cloneAction),
  reactions: area.reactions.map(cloneReaction),
});

const cloneAreas = (areas: AreaDto[]) => areas.map(cloneArea);

let mockAreas: AreaDto[] = cloneAreas(areasFixture.areas as AreaDto[]);

const wait = async (ms = 0) => {
  if (ms <= 0) {
    return;
  }
  await new Promise(resolve => setTimeout(resolve, ms));
};

const generateId = () => `area-${Math.random().toString(36).slice(2, 10)}`;

export async function listAreas(options: MockOptions = {}): Promise<AreaDto[]> {
  await wait(options.delay);
  return cloneAreas(mockAreas);
}

export async function getArea(id: string, options: MockOptions = {}): Promise<AreaDto | null> {
  await wait(options.delay);
  const found = mockAreas.find(area => area.id === id);
  return found ? cloneArea(found) : null;
}

export async function createArea(
  payload: MockCreateAreaPayload,
  options: MockOptions = {},
): Promise<AreaDto> {
  await wait(options.delay);

  const now = new Date().toISOString();
  const newArea: AreaDto = {
    id: generateId(),
    name: payload.name,
    description: payload.description || '',
    enabled: payload.enabled ?? true,
    userId: 'mock-user',
    userEmail: 'mock-user@example.com',
    actions: payload.actions.map(cloneAction),
    reactions: payload.reactions.map(cloneReaction),
    createdAt: now,
    updatedAt: now,
  };

  mockAreas = [cloneArea(newArea), ...cloneAreas(mockAreas)];
  return cloneArea(newArea);
}

export async function updateArea(
  id: string,
  updates: MockUpdateAreaPayload,
  options: MockOptions = {},
): Promise<AreaDto> {
  await wait(options.delay);

  const index = mockAreas.findIndex(area => area.id === id);
  if (index === -1) {
    throw new Error('Area not found');
  }

  const existing = mockAreas[index];
  const updated: AreaDto = {
    ...existing,
    ...updates,
    actions: (updates.actions ?? existing.actions).map(cloneAction),
    reactions: (updates.reactions ?? existing.reactions).map(cloneReaction),
    updatedAt: new Date().toISOString(),
  };

  mockAreas[index] = cloneArea(updated);
  return cloneArea(updated);
}

export async function deleteArea(id: string, options: MockOptions = {}): Promise<void> {
  await wait(options.delay);
  mockAreas = mockAreas.filter(area => area.id !== id).map(cloneArea);
}

export async function toggleArea(
  id: string,
  enabled: boolean,
  options: MockOptions = {},
): Promise<AreaDto> {
  return updateArea(id, { enabled }, options);
}

export function resetMockAreas(): void {
  mockAreas = cloneAreas(areasFixture.areas as AreaDto[]);
}
