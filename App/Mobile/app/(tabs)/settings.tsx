import { useRouter } from 'expo-router';
import { Server, HelpCircle, Globe, Moon, Sun, Check, Info } from 'lucide-react-native';
import React, { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useColorScheme } from 'nativewind';
import * as SecureStore from 'expo-secure-store';

import { Box } from '@/components/ui/box';
import { Divider } from '@/components/ui/divider';
import { Heading } from '@/components/ui/heading';
import { useDesignTokens } from '@/components/ui/hooks/useDesignTokens';
import { HStack } from '@/components/ui/hstack';
import { Pressable } from '@/components/ui/pressable';
import { Text } from '@/components/ui/text';
import { VStack } from '@/components/ui/vstack';
import { useThemeColors } from '@/hooks/useThemeColors';

const MenuItem: React.FC<{
  icon: React.ComponentType<any>;
  title: string;
  subtitle: string;
  onPress?: () => void;
  badge?: string;
}> = ({ icon: Icon, title, subtitle, onPress, badge }) => {
  const { getToken } = useDesignTokens();

  return (
    <Pressable onPress={onPress} className="p-4 rounded-lg active:bg-background-100">
      <HStack space="md" align="center" className="w-full">
        <Box className="w-10 h-10 bg-background-100 rounded-full items-center justify-center">
          <Icon size={20} color={getToken('typography-900')} />
        </Box>
        <VStack className="flex-1 gap-1">
          <Text className="text-typography-900 font-medium">
            {title}
          </Text>
          <Text size="sm" className="text-typography-600">
            {subtitle}
          </Text>
        </VStack>
        {badge && (
          <Box className="bg-primary-100 px-2 py-1 rounded">
            <Text size="xs" className="text-primary-600 font-semibold">
              {badge}
            </Text>
          </Box>
        )}
      </HStack>
    </Pressable>
  );
};

export default function SettingsScreen() {
  const { t, i18n } = useTranslation();
  const router = useRouter();
  const { colorScheme, setColorScheme } = useColorScheme();
  const colors = useThemeColors();
  const [currentLanguage, setCurrentLanguage] = useState(i18n.language || 'en');
  const [expandedLanguage, setExpandedLanguage] = useState(false);
  const [expandedTheme, setExpandedTheme] = useState(false);
  const currentTheme = colorScheme;

  useEffect(() => {
    const updateLanguage = () => {
      setCurrentLanguage(i18n.language || 'en');
    };
    i18n.on('languageChanged', updateLanguage);
    return () => {
      i18n.off('languageChanged', updateLanguage);
    };
  }, [i18n]);
  const languageBadge = currentLanguage === 'fr' ? 'FR' : 'EN';
  const handleLanguageChange = useCallback((lang: 'en' | 'fr') => {
    i18n.changeLanguage(lang);
    setExpandedLanguage(false);
  }, [i18n]);

  const handleThemeChange = useCallback(async (theme: 'light' | 'dark') => {
    try {
      await SecureStore.setItemAsync('app_color_scheme', theme);
      setColorScheme(theme);
      setExpandedTheme(false);
    } catch (err) {
      console.error('Failed to save theme', err);
      setColorScheme(theme);
      setExpandedTheme(false);
    }
  }, [setColorScheme]);

  return (
    <SafeAreaView className="flex-1 bg-background-0">
      <ScrollView className="flex-1" contentContainerStyle={{ paddingBottom: 20 }}>
        <Box className="px-6 py-4" style={{ backgroundColor: colors.info }}>
          <HStack className="items-center" space="sm">
            <Box className="bg-white rounded-lg p-2">
              <Server size={24} color={colors.info} />
            </Box>
            <Heading size="xl" className="text-white mb-2">
              {t('settings.title', 'Settings')}
            </Heading>
          </HStack>
          <Text size="md" className="text-white opacity-90">
            {t('settings.subtitle', 'Configure your application preferences')}
          </Text>
        </Box>
        <VStack className="mx-6 gap-2">
          <Text className="text-xs font-semibold uppercase mb-2 mt-4" style={{ color: colors.textSecondary }}>
            {t('settings.serverSection', 'Server Configuration')}
          </Text>
          <Box
            className="rounded-xl mb-2 shadow-sm"
            style={{
              backgroundColor: colors.card,
              borderWidth: 1,
              borderColor: colors.cardBorder,
            }}
          >
            <MenuItem
              icon={Server}
              title={t('settings.serverSettings', 'Server Settings')}
              subtitle={t('settings.serverSettingsSubtitle', 'Configure backend server location')}
              onPress={() => router.push('/(tabs)/server-settings')}
            />
          </Box>
          <Text className="text-xs font-semibold uppercase mb-2 mt-4" style={{ color: colors.textSecondary }}>
            {t('settings.appSection', 'Application')}
          </Text>
          <Box
            className="rounded-xl shadow-sm"
            style={{
              backgroundColor: colors.card,
              borderWidth: 1,
              borderColor: colors.cardBorder,
            }}
          >
            <Pressable onPress={() => setExpandedLanguage(!expandedLanguage)} className="p-4">
              <HStack space="md" align="center" className="w-full">
                <Box className="w-10 h-10 bg-background-100 rounded-full items-center justify-center">
                  <Globe size={20} color={colors.text} />
                </Box>
                <VStack className="flex-1 gap-1">
                  <Text className="text-typography-900 font-medium">
                    {t('settings.language', 'Language')}
                  </Text>
                  <Text size="sm" className="text-typography-600">
                    {t('settings.languageSubtitle', 'Change app language')}
                  </Text>
                </VStack>
                <Box className="bg-primary-100 px-2 py-1 rounded">
                  <Text size="xs" className="text-primary-600 font-semibold">
                    {languageBadge}
                  </Text>
                </Box>
              </HStack>
            </Pressable>
            {expandedLanguage && (
              <VStack className="px-4 pb-4" space="xs">
                <Divider className="mb-2" />
                <TouchableOpacity
                  onPress={() => handleLanguageChange('en')}
                  className="p-3 rounded-lg"
                  style={{
                    backgroundColor: currentLanguage === 'en' ? colors.info + '20' : colors.backgroundSecondary,
                  }}
                >
                  <HStack space="sm" align="center">
                    <Text className="flex-1 font-medium" style={{ color: colors.text }}>
                      English
                    </Text>
                    {currentLanguage === 'en' && (
                      <Check size={20} color={colors.info} />
                    )}
                  </HStack>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => handleLanguageChange('fr')}
                  className="p-3 rounded-lg"
                  style={{
                    backgroundColor: currentLanguage === 'fr' ? colors.info + '20' : colors.backgroundSecondary,
                  }}
                >
                  <HStack space="sm" align="center">
                    <Text className="flex-1 font-medium" style={{ color: colors.text }}>
                      Français
                    </Text>
                    {currentLanguage === 'fr' && (
                      <Check size={20} color={colors.info} />
                    )}
                  </HStack>
                </TouchableOpacity>
              </VStack>
            )}
          </Box>

          <Box
            className="rounded-xl shadow-sm mt-2"
            style={{
              backgroundColor: colors.card,
              borderWidth: 1,
              borderColor: colors.cardBorder,
            }}
          >
            <Pressable onPress={() => setExpandedTheme(!expandedTheme)} className="p-4">
              <HStack space="md" align="center" className="w-full">
                <Box className="w-10 h-10 bg-background-100 rounded-full items-center justify-center">
                  {currentTheme === 'dark' ? (
                    <Sun size={20} color={colors.text} />
                  ) : (
                    <Moon size={20} color={colors.text} />
                  )}
                </Box>
                <VStack className="flex-1 gap-1">
                  <Text className="text-typography-900 font-medium">
                    {t('settings.appearance', 'Appearance')}
                  </Text>
                  <Text size="sm" className="text-typography-600">
                    {t('settings.appearanceSubtitle', 'Theme and display settings')}
                  </Text>
                </VStack>
                <Box className="bg-primary-100 px-2 py-1 rounded">
                  <Text size="xs" className="text-primary-600 font-semibold">
                    {currentTheme === 'dark' ? t('settings.dark', 'Dark') : t('settings.light', 'Light')}
                  </Text>
                </Box>
              </HStack>
            </Pressable>
            {expandedTheme && (
              <VStack className="px-4 pb-4" space="xs">
                <Divider className="mb-2" />
                <TouchableOpacity
                  onPress={() => handleThemeChange('light')}
                  className="p-3 rounded-lg"
                  style={{
                    backgroundColor: currentTheme === 'light' ? colors.info + '20' : colors.backgroundSecondary,
                  }}
                >
                  <HStack space="sm" align="center">
                    <Moon size={20} color={colors.text} />
                    <Text className="flex-1 font-medium" style={{ color: colors.text }}>
                      {t('settings.lightTheme', 'Light')}
                    </Text>
                    {currentTheme === 'light' && (
                      <Check size={20} color={colors.info} />
                    )}
                  </HStack>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => handleThemeChange('dark')}
                  className="p-3 rounded-lg"
                  style={{
                    backgroundColor: currentTheme === 'dark' ? colors.info + '20' : colors.backgroundSecondary,
                  }}
                >
                  <HStack space="sm" align="center">
                    <Sun size={20} color={colors.text} />
                    <Text className="flex-1 font-medium" style={{ color: colors.text }}>
                      {t('settings.darkTheme', 'Dark')}
                    </Text>
                    {currentTheme === 'dark' && (
                      <Check size={20} color={colors.info} />
                    )}
                  </HStack>
                </TouchableOpacity>
              </VStack>
            )}
          </Box>
          <Text className="text-xs font-semibold uppercase mb-2 mt-4" style={{ color: colors.textSecondary }}>
            {t('settings.supportSection', 'Help & Support')}
          </Text>
          <Box
            className="rounded-xl mb-2 shadow-sm"
            style={{
              backgroundColor: colors.card,
              borderWidth: 1,
              borderColor: colors.cardBorder,
            }}
          >
            <MenuItem
              icon={HelpCircle}
              title={t('settings.help', 'Help & Support')}
              subtitle={t('settings.helpSubtitle', 'Get help and FAQs')}
              onPress={() => router.push('/help')}
            />
          </Box>
          <Box
            className="rounded-xl shadow-sm"
            style={{
              backgroundColor: colors.card,
              borderWidth: 1,
              borderColor: colors.cardBorder,
            }}
          >
            <MenuItem
              icon={Info}
              title={t('about.title', 'About AREA')}
              subtitle={t('about.subtitle', 'Learn more about our automation platform')}
              onPress={() => router.push('/about' as any)}
            />
          </Box>
        </VStack>
      </ScrollView>
    </SafeAreaView>
  );
}
