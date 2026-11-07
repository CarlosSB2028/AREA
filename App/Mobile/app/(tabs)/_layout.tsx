import { useAuth } from '@/contexts/AuthContext';
import { Tabs, useRouter } from 'expo-router';
import { Home, Settings, Zap, User } from 'lucide-react-native';
import { useColorScheme } from 'nativewind';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

export default function TabLayout() {
  const { t } = useTranslation();
  const { colorScheme } = useColorScheme();
  const { isAuthenticated } = useAuth();
  const router = useRouter();

  const colors = useMemo(() => ({
    'indigo-600': colorScheme === 'dark' ? 'rgb(129 140 248)' : 'rgb(99 102 241)',
    'gray-500': colorScheme === 'dark' ? 'rgb(156 163 175)' : 'rgb(107 114 128)',
    'gray-200': colorScheme === 'dark' ? 'rgb(75 85 99)' : 'rgb(229 231 235)',
    'background-0': colorScheme === 'dark' ? 'rgb(18 18 18)' : 'rgb(255 255 255)',
  }), [colorScheme]);

  const screenOptions = useMemo(() => ({
    tabBarActiveTintColor: colors['indigo-600'],
    tabBarInactiveTintColor: colors['gray-500'],
    headerShown: false,
    tabBarStyle: {
      backgroundColor: colors['background-0'],
      borderBottomWidth: 1,
      borderBottomColor: colors['gray-200'],
      marginTop: 0,
      paddingTop: 0,
      paddingBottom: 16,
      height: 60,
    },
    tabBarLabelStyle: {
      fontSize: 12,
      fontWeight: '500' as const,
    },
  }), [colors]);

  return (
    <Tabs screenOptions={screenOptions}>
      <Tabs.Screen
        name="index"
        options={{
          title: t('tabs.home'),
          tabBarIcon: ({ color, size }) => <Home size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="areas"
        options={{
          title: t('tabs.areas', 'Areas'),
          tabBarIcon: ({ color, size }) => <Zap size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: t('tabs.profile', 'Profile'),
          tabBarIcon: ({ color, size }) => <User size={size} color={color} />,
        }}
        listeners={{
          tabPress: (e) => {
            if (!isAuthenticated) {
              e.preventDefault();
              router.push('/(tabs)/login');
            }
          },
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: t('tabs.settings', 'Settings'),
          tabBarIcon: ({ color, size }) => <Settings size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="login"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="register"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="forgot-password"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="edit-profile"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="server-settings"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="admin-dashboard"
        options={{
          href: null,
        }}
      />
    </Tabs>
  );
}