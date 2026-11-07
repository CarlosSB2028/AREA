import React, { useEffect, useRef } from 'react';
import { Animated, View, type ViewProps } from 'react-native';
import { useDesignTokens } from '../hooks/useDesignTokens';

type SkeletonVariant = 'rounded' | 'sharp' | 'circular';

interface SkeletonProps extends ViewProps {
  variant?: SkeletonVariant;
  isLoaded?: boolean;
  speed?: number;
  startColor?: string;
}

interface SkeletonTextProps extends ViewProps {
  lines?: number;
  _lines?: number;
  gap?: number;
  isLoaded?: boolean;
  speed?: number;
  startColor?: string;
}

export const Skeleton: React.FC<SkeletonProps> = ({
  variant = 'rounded',
  isLoaded = false,
  speed = 800,
  children,
  className = '',
  style,
  ...props
}) => {
  const animatedValue = useRef(new Animated.Value(0)).current;
  const { getToken } = useDesignTokens();

  useEffect(() => {
    if (!isLoaded) {
      const animation = Animated.loop(
        Animated.sequence([
          Animated.timing(animatedValue, {
            toValue: 1,
            duration: speed,
            useNativeDriver: false,
          }),
          Animated.timing(animatedValue, {
            toValue: 0,
            duration: speed,
            useNativeDriver: false,
          }),
        ]),
        { iterations: -1 }
      );

      animation.start();

      return () => animation.stop();
    }
  }, [isLoaded, speed, animatedValue]);

  const backgroundColor = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [getToken('gray-200'), getToken('background-100')],
  });

  const variantClasses = {
    rounded: 'rounded-md',
    sharp: '',
    circular: 'rounded-full',
  };

  if (isLoaded && children) {
    return <View>{children}</View>;
  }

  return (
    <Animated.View
      className={`bg-background-200 ${variantClasses[variant]} ${className}`}
      style={[
        {
          backgroundColor,
        },
        style,
      ]}
      {...props}
    />
  );
};

export const SkeletonText: React.FC<SkeletonTextProps> = ({
  lines = 3,
  gap = 2,
  isLoaded = false,
  speed = 800,
  children,
  className = '',
  style,
  ...props
}) => {
  const animatedValue = useRef(new Animated.Value(0)).current;
  const { getToken } = useDesignTokens();
  const _lines = lines || 3;

  useEffect(() => {
    if (!isLoaded) {
      const animation = Animated.loop(
        Animated.sequence([
          Animated.timing(animatedValue, {
            toValue: 1,
            duration: speed,
            useNativeDriver: false,
          }),
          Animated.timing(animatedValue, {
            toValue: 0,
            duration: speed,
            useNativeDriver: false,
          }),
        ]),
        { iterations: -1 }
      );

      animation.start();

      return () => animation.stop();
    }
  }, [isLoaded, speed, animatedValue]);

  const backgroundColor = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [getToken('gray-200'), getToken('background-100')],
  });

  const gapClasses = {
    1: 'gap-1',
    2: 'gap-2',
    3: 'gap-3',
    4: 'gap-4',
  };

  if (isLoaded && children) {
    return <View>{children}</View>;
  }

  return (
    <View className={`${gapClasses[gap as keyof typeof gapClasses]} ${className}`} style={style} {...props}>
      {Array.from({ length: _lines }, (_, i) => (
        <Animated.View
          key={i}
          className={`bg-background-200 rounded-md h-3 ${i === _lines - 1 ? 'w-3/4' : 'w-full'}`}
          style={[
            {
              backgroundColor,
            },
          ]}
        />
      ))}
    </View>
  );
};

Skeleton.displayName = 'Skeleton';
SkeletonText.displayName = 'SkeletonText';

export type {
  SkeletonProps,
  SkeletonTextProps
};
