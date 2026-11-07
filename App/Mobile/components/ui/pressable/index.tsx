'use client';
import React from 'react';
import { PressableProps, Pressable as RNPressable } from 'react-native';

type IPressableProps = PressableProps & {
  className?: string;
};

const Pressable = React.forwardRef<React.ElementRef<typeof RNPressable>, IPressableProps>(
  ({ className, ...props }, ref) => {
    return (
      <RNPressable
        ref={ref}
        {...props}
      />
    );
  }
);

Pressable.displayName = 'Pressable';

export { Pressable };
