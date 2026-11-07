import React, { useEffect } from 'react';
import { View } from 'react-native';
import Animated, {
  FadeInDown,
  FadeOutDown,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { Trash2 } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';

import { REMOVE_ZONE_HEIGHT } from './constants';
import { Text } from '@/components/ui/text';

interface RemoveZoneProps {
  isDragging: boolean;
  isActive: boolean;
}

export function RemoveZone({ isDragging, isActive }: RemoveZoneProps) {
  const opacityProgress = useSharedValue(0);
  const { t } = useTranslation();

  useEffect(() => {
    const opacityTarget = !isDragging ? 0 : isActive ? 1 : 0.6;
    opacityProgress.value = withTiming(opacityTarget, { duration: 220 });
  }, [isActive, isDragging, opacityProgress]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacityProgress.value,
  }));

  return (
    <Animated.View
      pointerEvents="none"
      style={[
        {
          position: 'absolute',
          left: 0,
          right: 0,
          bottom: 0,
          height: REMOVE_ZONE_HEIGHT,
          zIndex: 0,
        },
        animatedStyle,
      ]}
    >
  <View className="flex-1 bg-error-500" />

      <Animated.View
        entering={FadeInDown.springify().damping(20)}
        exiting={FadeOutDown.duration(180)}
        className="absolute inset-0 flex-row items-center justify-center"
      >
        <View className="flex-row items-center">
          <Trash2 size={24} color="white" />
          <Text className="text-white font-medium ml-2">
            {t('areaDetail.cards.dropRemove')}
          </Text>
        </View>
      </Animated.View>
    </Animated.View>
  );
}
