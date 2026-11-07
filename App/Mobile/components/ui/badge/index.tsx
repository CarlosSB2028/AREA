import React from 'react';
import { Text, View, type TextProps, type ViewProps } from 'react-native';

type BadgeAction = 'error' | 'warning' | 'success' | 'info' | 'muted';
type BadgeVariant = 'solid' | 'outline';
type BadgeSize = 'sm' | 'md' | 'lg';

interface BadgeProps extends ViewProps {
  action?: BadgeAction;
  variant?: BadgeVariant;
  size?: BadgeSize;
  children?: React.ReactNode;
}

interface BadgeTextProps extends TextProps {
  children: React.ReactNode;
  isTruncated?: boolean;
  bold?: boolean;
  underline?: boolean;
  strikeThrough?: boolean;
  italic?: boolean;
  highlight?: boolean;
  sub?: boolean;
}

interface BadgeIconProps extends ViewProps {
  as: React.ComponentType<any>;
}

const Badge = React.forwardRef<View, BadgeProps>(
  ({ action = 'muted', variant = 'solid', size = 'md', className = '', children, style, ...props }, ref) => {
    const actionClasses = {
      error: variant === 'solid' ? 'bg-background-error' : 'bg-background-error border-error-300',
      warning: variant === 'solid' ? 'bg-background-warning' : 'bg-background-warning border-warning-300',
      success: variant === 'solid' ? 'bg-background-success' : 'bg-background-success border-success-300',
      info: variant === 'solid' ? 'bg-background-info' : 'bg-background-info border-info-300',
      muted: variant === 'solid' ? 'bg-background-muted' : 'bg-background-muted border-background-300',
    };

    const variantClasses = {
      solid: '',
      outline: 'border',
    };

    return (
      <View
        ref={ref}
        className={`flex-row items-center rounded-sm px-2 py-1 ${actionClasses[action]} ${variantClasses[variant]} ${className}`}
        style={style}
        {...props}
      >
        {children}
      </View>
    );
  }
);

const BadgeText = React.forwardRef<Text, BadgeTextProps>(
  ({ className = '', children, isTruncated, bold, underline, strikeThrough, italic, highlight, sub, style, ...props }, ref) => {
    let textClasses = 'text-typography-700 font-normal tracking-normal uppercase';
    
    if (isTruncated) textClasses += ' truncate';
    if (bold) textClasses += ' font-bold';
    if (underline) textClasses += ' underline';
    if (strikeThrough) textClasses += ' line-through';
    if (italic) textClasses += ' italic';
    if (highlight) textClasses += ' bg-highlight';
    if (sub) textClasses += ' text-xs';
    else textClasses += ' text-xs';

    return (
      <Text
        ref={ref}
        className={`${textClasses} ${className}`}
        style={style}
        {...props}
      >
        {children}
      </Text>
    );
  }
);

const BadgeIcon = React.forwardRef<View, BadgeIconProps>(
  ({ as: IconComponent, className = '', style, ...props }, ref) => {
    return (
      <View ref={ref} className={`fill-none ${className}`} style={style} {...props}>
        <IconComponent size={14} />
      </View>
    );
  }
);

Badge.displayName = 'Badge';
BadgeText.displayName = 'BadgeText';
BadgeIcon.displayName = 'BadgeIcon';

export {
    Badge, BadgeIcon, BadgeText
};

    export type {
        BadgeIconProps, BadgeProps,
        BadgeTextProps
    };
