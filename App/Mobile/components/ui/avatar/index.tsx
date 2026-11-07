import React from 'react';
import { Image, Text, View, type ImageProps, type TextProps, type ViewProps } from 'react-native';

type AvatarSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';

interface AvatarProps extends ViewProps {
  size?: AvatarSize;
  children?: React.ReactNode;
}

interface AvatarImageProps extends ImageProps {
  alt?: string;
}

interface AvatarFallbackTextProps extends TextProps {
  children: string;
}

type AvatarBadgeProps = ViewProps;

interface AvatarGroupProps extends ViewProps {
  children: React.ReactNode;
}

const Avatar = React.forwardRef<View, AvatarProps>(
  ({ size = 'md', className = '', children, style, ...props }, ref) => {
    const sizeClasses = {
      xs: 'w-6 h-6',
      sm: 'w-8 h-8',
      md: 'w-12 h-12',
      lg: 'w-16 h-16',
      xl: 'w-24 h-24',
      '2xl': 'w-32 h-32',
    };

    return (
      <View
        ref={ref}
        className={`rounded-full justify-center items-center relative bg-primary-600 ${sizeClasses[size]} ${className}`}
        style={style}
        {...props}
      >
        {children}
      </View>
    );
  }
);

const AvatarImage = React.forwardRef<Image, AvatarImageProps>(
  ({ className = '', style, ...props }, ref) => {
    return (
      <Image
        ref={ref}
        className={`h-full w-full rounded-full absolute z-10 ${className}`}
        style={style}
        {...props}
      />
    );
  }
);

const AvatarFallbackText = React.forwardRef<Text, AvatarFallbackTextProps>(
  ({ className = '', children, style, ...props }, ref) => {
    const initials = children?.split(' ').map(name => name[0]).join('').toUpperCase().slice(0, 2);
    
    return (
      <Text
        ref={ref}
        className={`text-typography-0 font-semibold text-base ${className}`}
        style={style}
        {...props}
      >
        {initials}
      </Text>
    );
  }
);

const AvatarBadge = React.forwardRef<View, AvatarBadgeProps>(
  ({ className = '', style, ...props }, ref) => {
    return (
      <View
        ref={ref}
        className={`w-3 h-3 bg-success-500 rounded-full absolute right-0 bottom-0 border-background-0 border-2 ${className}`}
        style={style}
        {...props}
      />
    );
  }
);

const AvatarGroup = React.forwardRef<View, AvatarGroupProps>(
  ({ className = '', children, style, ...props }, ref) => {
    return (
      <View
        ref={ref}
        className={`flex-row-reverse relative ${className}`}
        style={style}
        {...props}
      >
        {children}
      </View>
    );
  }
);

Avatar.displayName = 'Avatar';
AvatarImage.displayName = 'AvatarImage';
AvatarFallbackText.displayName = 'AvatarFallbackText';
AvatarBadge.displayName = 'AvatarBadge';
AvatarGroup.displayName = 'AvatarGroup';

export {
    Avatar, AvatarBadge, AvatarFallbackText, AvatarGroup, AvatarImage
};

    export type {
        AvatarBadgeProps, AvatarFallbackTextProps, AvatarGroupProps, AvatarImageProps, AvatarProps
    };
