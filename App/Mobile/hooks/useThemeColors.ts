import { useColorScheme } from 'nativewind';

export const useThemeColors = () => {
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === 'dark';

  return {
    primary: isDark ? '#A3A3A3' : '#333333',
    primaryLight: isDark ? '#999999' : '#666666',
    background: isDark ? '#000000' : '#FFFFFF',
    backgroundSecondary: isDark ? '#1A1A1A' : '#F5F7FA',
    text: isDark ? '#FFFFFF' : '#333333',
    textSecondary: isDark ? '#A3A3A3' : '#666666',
    textTertiary: isDark ? '#737373' : '#999999',
    border: isDark ? '#333333' : '#E0E0E0',
    borderLight: isDark ? '#262626' : '#F0F0F0',
    cardBorder: isDark ? '#2563EB20' : '#007AFF15',
    success: isDark ? '#4ADE80' : '#34C759',
    error: isDark ? '#F87171' : '#FF3B30',
    warning: isDark ? '#FBBF24' : '#FF9500',
    info: isDark ? '#3B82F6' : '#007AFF',
    card: isDark ? '#1A1A1A' : '#FFFFFF',
    cardHover: isDark ? '#262626' : '#F5F5F5',
    icon: isDark ? '#A3A3A3' : '#666666',
    iconActive: isDark ? '#FFFFFF' : '#007AFF',
    disabled: isDark ? '#404040' : '#B0B0B0',
    overlay: 'rgba(0, 0, 0, 0.5)',
    destructive: isDark ? '#EF4444' : '#FF3B30',
    isDark,
  };
};
