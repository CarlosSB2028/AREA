'use client';
import React from 'react';
import { ImageProps, Platform, Image as RNImage } from 'react-native';

type ImageStyle = {
  '2xs': string;
  'xs': string;
  'sm': string;
  'md': string;
  'lg': string;
  'xl': string;
  '2xl': string;
  'full': string;
  'none': string;
};

type IImageProps = ImageProps & {
  size?: keyof ImageStyle;
  alt?: string;
  className?: string;
};

const Image = React.forwardRef<React.ComponentRef<typeof RNImage>, IImageProps>(
  ({ size = 'md', alt, className, style, ...props }, ref) => {
    return (
      <RNImage
        ref={ref}
        style={[
          Platform.OS === 'web' 
            ? { height: 'revert-layer' as any, width: 'revert-layer' as any } 
            : undefined,
          style,
        ]}
        accessibilityLabel={alt}
        {...props}
      />
    );
  }
);

Image.displayName = 'Image';

export { Image };
