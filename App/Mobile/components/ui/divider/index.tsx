import React from 'react';
import { View, type ViewProps } from 'react-native';

type DividerOrientation = 'horizontal' | 'vertical';

interface DividerProps extends ViewProps {
  orientation?: DividerOrientation;
}

const Divider = React.forwardRef<View, DividerProps>(
  ({ orientation = 'horizontal', className = '', style, ...props }, ref) => {
    const orientationClasses = {
      horizontal: 'h-px w-full',
      vertical: 'w-px h-full',
    };

    return (
      <View
        ref={ref}
        className={`bg-background-200 ${orientationClasses[orientation]} ${className}`}
        style={style}
        {...props}
      />
    );
  }
);

Divider.displayName = 'Divider';

export { Divider };
export type { DividerProps };
