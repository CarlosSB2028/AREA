import type { VariantProps } from '@gluestack-ui/utils/nativewind-utils';
import React from 'react';
import { View } from 'react-native';

import { hstackStyle } from './styles';

type IHStackProps = React.ComponentProps<typeof View> &
  VariantProps<typeof hstackStyle> & { 
    className?: string;
  };

const HStack = React.forwardRef<React.ComponentRef<typeof View>, IHStackProps>(
  function HStack({ className, space, justify, align, children, ...props }, ref) {
    return (
      <View
        ref={ref}
        {...props}
        className={hstackStyle({ space, justify, align, class: className })}
      >
        {children}
      </View>
    );
  }
);

HStack.displayName = 'HStack';

export { HStack };
