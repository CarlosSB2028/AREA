import React, { useCallback, useEffect } from 'react';
import { Alert, StyleProp, ViewStyle, TouchableOpacity } from 'react-native';
import Animated, {
  interpolateColor,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { Plus } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';

const AnimatedTouchableOpacity = Animated.createAnimatedComponent(TouchableOpacity);

interface AddCardButtonProps {
  isRemoveZoneActive: boolean;
  onAddAction: () => void;
  onAddReaction: () => void;
  style?: StyleProp<ViewStyle>;
  testID?: string;
}

export function AddCardButton({
  isRemoveZoneActive,
  onAddAction,
  onAddReaction,
  style,
  testID,
}: AddCardButtonProps) {
  const highlight = useSharedValue(0);
  const { t } = useTranslation();

  useEffect(() => {
    highlight.value = withTiming(isRemoveZoneActive ? 1 : 0, {
      duration: 160,
    });
  }, [highlight, isRemoveZoneActive]);

  const animatedStyle = useAnimatedStyle(() => ({
    backgroundColor: interpolateColor(
      highlight.value,
      [0, 1],
      ['#6366f1', '#4338ca']
    ),
    transform: [
      {
        scale: 1 - highlight.value * 0.05,
      },
    ],
  }));

  const handlePress = useCallback(() => {
    Alert.alert(
      t('areaDetail.alerts.addCardTitle'),
      t('areaDetail.alerts.addCardMessage'),
      [
        { text: t('areaDetail.alerts.addCardCancel'), style: 'cancel' },
        {
          text: t('areaDetail.alerts.addCardAction'),
          onPress: onAddAction,
        },
        {
          text: t('areaDetail.alerts.addCardReaction'),
          onPress: onAddReaction,
        },
      ]
    );
  }, [onAddAction, onAddReaction, t]);

  return (
    <AnimatedTouchableOpacity
      onPress={handlePress}
      className="rounded-full p-4 shadow-lg bg-primary-500"
      style={[animatedStyle, style]}
      testID={testID}
    >
      <Plus size={24} color="white" />
    </AnimatedTouchableOpacity>
  );
}
