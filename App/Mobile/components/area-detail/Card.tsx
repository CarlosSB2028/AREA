import React, { useEffect } from 'react';
import { View, TouchableOpacity } from 'react-native';
import {
  Gesture,
  GestureDetector,
  type GestureStateChangeEvent,
  type GestureUpdateEvent,
  type PanGestureHandlerEventPayload,
} from 'react-native-gesture-handler';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
} from 'react-native-reanimated';
import { useTranslation } from 'react-i18next';

import type { CardData, CardDockPosition } from '@/types/area-detail';
import { CARD_WIDTH, CARD_HEIGHT } from './constants';
import { Text } from '@/components/ui/text';

interface CardProps {
  card: CardData;
  removeZoneTop: number;
  onMove: (id: string, position: CardDockPosition) => void;
  onRemove: (id: string) => void;
  onSelect: (card: CardData) => void;
  onStartConnection: (cardId: string, direction: 'left' | 'right', startPoint: CardDockPosition) => void;
  onUpdateConnection: (point: CardDockPosition | null) => void;
  onEndConnection: (cardId: string, point: CardDockPosition | null) => void;
  setIsDragging: (dragging: boolean) => void;
  onToggleRemoveZone: (active: boolean) => void;
}

export function Card({
  card,
  removeZoneTop,
  onMove,
  onRemove,
  onSelect,
  onStartConnection,
  onUpdateConnection,
  onEndConnection,
  setIsDragging,
  onToggleRemoveZone,
}: CardProps) {
  const translateX = useSharedValue(card.position.x);
  const translateY = useSharedValue(card.position.y);
  const isOverRemoveZone = useSharedValue(false);
  const { t } = useTranslation();

  useEffect(() => {
    translateX.value = card.position.x;
    translateY.value = card.position.y;
  }, [card.position.x, card.position.y, translateX, translateY]);

  const basePan = Gesture.Pan().runOnJS(true);
  const cardPanGesture =
    typeof (basePan as any).minDistance === 'function'
      ? (basePan as any).minDistance(10)
      : basePan;

  const cardPan = cardPanGesture
    .onBegin(() => {
      setIsDragging(true);
    })
    .onUpdate((event: GestureUpdateEvent<PanGestureHandlerEventPayload>) => {
      translateX.value = card.position.x + event.translationX;
      translateY.value = card.position.y + event.translationY;
      const hoveringRemoveZone = event.absoluteY >= removeZoneTop;
      if (hoveringRemoveZone !== isOverRemoveZone.value) {
        isOverRemoveZone.value = hoveringRemoveZone;
        onToggleRemoveZone(hoveringRemoveZone);
      }
    })
    .onEnd((event: GestureStateChangeEvent<PanGestureHandlerEventPayload>) => {
      const newX = card.position.x + event.translationX;
      const newY = card.position.y + event.translationY;
      const dropOnRemoveZone = event.absoluteY >= removeZoneTop;

      if (dropOnRemoveZone) {
        onRemove(card.id);
      } else {
        onMove(card.id, { x: newX, y: newY });
      }

      if (isOverRemoveZone.value) {
        isOverRemoveZone.value = false;
        onToggleRemoveZone(false);
      }
      setIsDragging(false);
    });

  const createConnectionGesture = (direction: 'left' | 'right') => {
    let startPoint: CardDockPosition | null = null;

    return Gesture.Pan()
      .runOnJS(true)
      .onBegin(() => {
        const offsetX = direction === 'left' ? 0 : CARD_WIDTH;
        startPoint = {
          x: card.position.x + offsetX,
          y: card.position.y + CARD_HEIGHT / 2,
        };
        onStartConnection(card.id, direction, startPoint!);
      })
      .onChange((event: GestureUpdateEvent<PanGestureHandlerEventPayload>) => {
        const updatePoint: CardDockPosition = {
          x: event.translationX,
          y: event.translationY,
        };
        onUpdateConnection(updatePoint);
        if (isOverRemoveZone.value) {
          isOverRemoveZone.value = false;
          onToggleRemoveZone(false);
        }
      })
      .onEnd((event: GestureStateChangeEvent<PanGestureHandlerEventPayload>) => {
        const finalPoint: CardDockPosition = {
          x: event.translationX,
          y: event.translationY,
        };
        onEndConnection(card.id, finalPoint);
      })
      .onFinalize(() => {
        onUpdateConnection(null);
        if (isOverRemoveZone.value) {
          isOverRemoveZone.value = false;
          onToggleRemoveZone(false);
        }
      });
  };
  let leftConnection;
  if (card.type === 'reaction') {
      leftConnection = createConnectionGesture('left');
  }
  const rightConnection = createConnectionGesture('right');
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
      {
        scale: withTiming(isOverRemoveZone.value ? 0.92 : 1, {
          duration: 160,
        }),
      },
    ],
    opacity: withTiming(isOverRemoveZone.value ? 0.65 : 1, {
      duration: 160,
    }),
  }));

  return (
    <GestureDetector gesture={cardPan}>
      <Animated.View
        style={[
          {
            position: 'absolute',
            width: CARD_WIDTH,
            height: CARD_HEIGHT,
            zIndex: 10,
          },
          animatedStyle,
        ]}
      >
        <TouchableOpacity
          onPress={() => onSelect(card)}
          activeOpacity={0.9}
          className="flex-1 rounded-lg border bg-white shadow-sm p-3 border-blue-300"
        >
          <Text className="font-semibold text-base text-gray-900 mb-1">
            {card.data.name}
          </Text>
          <Text className="text-xs text-blue-600 font-medium uppercase">
            {card.type === 'action'
              ? t('areaDetail.cards.typeLabel.action')
              : t('areaDetail.cards.typeLabel.reaction')}
          </Text>

          {leftConnection &&
            <GestureDetector gesture={leftConnection}>
                <View
                className="absolute left-[-10] w-6 h-6 bg-white rounded-full border-2 border-blue-500 shadow-md"
                style={{ top: '50%' }}
                />
            </GestureDetector>
          }

          <GestureDetector gesture={rightConnection}>
            <View
              className="absolute right-[-10] w-6 h-6 bg-white rounded-full border-2 border-blue-500 shadow-md"
              style={{ top: '50%' }}
            />
          </GestureDetector>
        </TouchableOpacity>
      </Animated.View>
    </GestureDetector>
  );
}
