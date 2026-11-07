'use client';
import React from 'react';
import { ScrollView as RNScrollView, ScrollViewProps } from 'react-native';

type IScrollViewProps = ScrollViewProps & {
  className?: string;
  contentContainerClassName?: string;
};

const ScrollView = React.forwardRef<
  React.ElementRef<typeof RNScrollView>,
  IScrollViewProps
>(({ className, contentContainerClassName, contentContainerStyle, ...props }, ref) => {
  return (
    <RNScrollView
      ref={ref}
      contentContainerStyle={[
        contentContainerStyle,
      ]}
      {...props}
    />
  );
});

ScrollView.displayName = 'ScrollView';

export { ScrollView };
