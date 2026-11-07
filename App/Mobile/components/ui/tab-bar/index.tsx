import { Text } from '@/components/ui/text';
import { tva, VariantProps } from '@gluestack-ui/utils/nativewind-utils';
import React from 'react';
import { Pressable, View } from 'react-native';

const tabBarStyle = tva({
  base: 'flex-row bg-background-0 border-border-light',
  variants: {
    size: {
      sm: 'h-12 px-2',
      md: 'h-16 px-4',
      lg: 'h-20 px-6',
    },
  },
});

const tabBarItemStyle = tva({
  base: 'flex-1 flex-col items-center justify-center',
  variants: {
    isActive: {
      true: 'opacity-100',
      false: 'opacity-70',
    },
  },
});

const tabBarIconStyle = tva({
  base: 'mb-1',
  variants: {
    isActive: {
      true: 'text-main',
      false: 'text-text-secondary',
    },
  },
});

const tabBarLabelStyle = tva({
  base: 'text-xs font-medium',
  variants: {
    isActive: {
      true: 'text-main',
      false: 'text-text-secondary',
    },
  },
});

export interface TabBarProps extends VariantProps<typeof tabBarStyle> {
  tabs: {
    key: string;
    label: string;
    icon: React.ComponentType<{ className?: string; size?: number }>;
    onPress: () => void;
  }[];
  activeTab: string;
  className?: string;
}

export interface TabBarItemProps {
  label: string;
  icon: React.ComponentType<{ className?: string; size?: number }>;
  isActive: boolean;
  onPress: () => void;
}

const TabBarItem = React.forwardRef<
  React.ElementRef<typeof Pressable>,
  TabBarItemProps
>(({ label, icon: IconComponent, isActive, onPress }, ref) => {
  return (
    <Pressable
      ref={ref}
      onPress={onPress}
      className={tabBarItemStyle({ isActive })}
    >
      <View className={tabBarIconStyle({ isActive })}>
        <IconComponent size={24} />
      </View>
      <Text className={tabBarLabelStyle({ isActive })}>{label}</Text>
    </Pressable>
  );
});

export const TabBar = React.forwardRef<
  React.ElementRef<typeof View>,
  TabBarProps
>(({ tabs, activeTab, size = 'md', className, ...props }, ref) => {
  return (
    <View
      ref={ref}
      className={tabBarStyle({ size, class: className })}
      {...props}
    >
      {tabs.map((tab) => (
        <TabBarItem
          key={tab.key}
          label={tab.label}
          icon={tab.icon}
          isActive={activeTab === tab.key}
          onPress={tab.onPress}
        />
      ))}
    </View>
  );
});

TabBarItem.displayName = 'TabBarItem';
TabBar.displayName = 'TabBar';

export { TabBarItem };
