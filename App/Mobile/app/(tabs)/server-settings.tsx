import React, { useState, useEffect } from 'react';
import { ScrollView, Alert, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { useThemeColors } from '@/hooks/useThemeColors';
import { ArrowLeft, Save, RefreshCw, Server, AlertCircle } from 'lucide-react-native';
import { Box } from '@/components/ui/box';
import { HStack } from '@/components/ui/hstack';
import { VStack } from '@/components/ui/vstack';
import { Text } from '@/components/ui/text';
import { Heading } from '@/components/ui/heading';
import { Button, ButtonIcon, ButtonText } from '@/components/ui/button';
import { saveServerUrl, getServerUrl, clearServerUrl } from '@/services/storage';
import { updateCachedServerUrl } from '@/services/api.config';

export default function ServerSettingsScreen() {
  const { t } = useTranslation();
  const colors = useThemeColors();
  const [serverUrl, setServerUrl] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
 // localhost par default a l'utilisatuer de le changer dans la config du back
  const defaultUrl = 'http://127.0.0.1:8080';

  useEffect(() => {
    loadServerUrl();
  }, []);

  const loadServerUrl = async () => {
    try {
      const storedUrl = await getServerUrl();
      setServerUrl(storedUrl || defaultUrl);
    } catch (error) {
      console.error('Failed to load server URL:', error);
      setServerUrl(defaultUrl);
    } finally {
      setIsLoading(false);
    }
  };

  const validateUrl = (url: string): boolean => {
    try {
      const parsed = new URL(url);
      return parsed.protocol === 'http:' || parsed.protocol === 'https:';
    } catch {
      return false;
    }
  };

  const handleSave = async () => {
    if (!serverUrl.trim()) {
      Alert.alert(
        t('serverSettings.error', 'Error'),
        t('serverSettings.urlRequired', 'Server URL is required')
      );
      return;
    }

    if (!validateUrl(serverUrl)) {
      Alert.alert(
        t('serverSettings.error', 'Error'),
        t('serverSettings.invalidUrl', 'Please enter a valid URL (http:// or https://)')
      );
      return;
    }

    try {
      const response = await fetch(`${serverUrl}/actuator/health`);
      if (!response.ok) {
        throw new Error('Health check failed');
      }
    } catch (error) {
      console.error('Health check error:', error);
      Alert.alert(
        t('serverSettings.error', 'Error'),
        t('serverSettings.healthCheckFailed', 'Server health check failed. Please verify the URL.')
      );
      return;
    }

    setIsSaving(true);
    try {
      await saveServerUrl(serverUrl);
      updateCachedServerUrl(serverUrl);
      Alert.alert(
        t('serverSettings.success', 'Success'),
        t('serverSettings.urlSaved', 'Server URL saved successfully. Redirecting to login...'),
        [
          {
            text: t('common.ok', 'OK'),
            onPress: () => router.push('/(tabs)/login?reloadProviders=true')
          }
        ]
      );
    } catch (error) {
      console.error('Failed to save server URL:', error);
      Alert.alert(
        t('serverSettings.error', 'Error'),
        t('serverSettings.saveFailed', 'Failed to save server URL')
      );
    } finally {
      setIsSaving(false);
    }
  };

  const handleReset = () => {
    Alert.alert(
      t('serverSettings.resetTitle', 'Reset to Default'),
      t('serverSettings.resetMessage', 'Are you sure you want to reset to the default server URL?'),
      [
        { text: t('common.cancel', 'Cancel'), style: 'cancel' },
        {
          text: t('common.reset', 'Reset'),
          style: 'destructive',
          onPress: async () => {
            try {
              await clearServerUrl();
              updateCachedServerUrl(null);
              setServerUrl(defaultUrl);
              Alert.alert(
                t('serverSettings.success', 'Success'),
                t('serverSettings.resetSuccess', 'Server URL reset to default. Redirecting to login...'),
                [
                  { 
                    text: t('common.ok', 'OK'), 
                    onPress: () => router.push('/(tabs)/login?reloadProviders=true')
                  }
                ]
              );
            } catch (error) {
              console.error('Failed to reset server URL:', error);
              Alert.alert(
                t('serverSettings.error', 'Error'),
                t('serverSettings.resetFailed', 'Failed to reset server URL')
              );
            }
          }
        }
      ]
    );
  };

  if (isLoading) {
    return (
      <SafeAreaView className="flex-1 bg-background-0 items-center justify-center">
        <Text className="text-typography-600">
          {t('common.loading', 'Loading...')}
        </Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-background-0">
      <Box className="px-4 pt-4 pb-4 shadow-md" style={{ backgroundColor: colors.info }}>
        <HStack className="items-center justify-between mb-3">
          <HStack space="sm" className="items-center flex-1">
            <Button size="xs" variant="link" onPress={() => router.back()}>
              <ButtonIcon as={ArrowLeft} color="white" />
            </Button>
            <Heading size="xl" className="text-white font-bold">
              {t('serverSettings.title', 'Server Settings')}
            </Heading>
          </HStack>
          <Button
            size="sm"
            variant="solid"
            className="bg-white"
            onPress={handleSave}
            isDisabled={isSaving}
          >
            <ButtonIcon as={Save} style={{ color: colors.info }} size="sm" />
          </Button>
        </HStack>
      </Box>

      <ScrollView className="flex-1 bg-background-50">
        <Box className="p-4">
          <VStack space="lg">
            <Box
              className="rounded-lg p-4 shadow-sm border"
              style={{
                backgroundColor: colors.card,
                borderColor: colors.border,
              }}
            >
              <VStack space="md">
                <HStack space="sm" className="items-center">
                  <Box
                    className="w-12 h-12 rounded-full items-center justify-center"
                    style={{ backgroundColor: colors.info + '20' }}
                  >
                    <Server size={24} color={colors.info} />
                  </Box>
                  <VStack className="flex-1">
                    <Text className="font-bold text-lg" style={{ color: colors.text }}>
                      {t('serverSettings.serverAddress', 'Server Address')}
                    </Text>
                    <Text className="text-xs" style={{ color: colors.textSecondary }}>
                      {t('serverSettings.subtitle', 'Configure the backend server location')}
                    </Text>
                  </VStack>
                </HStack>

                <VStack space="xs">
                  <Text className="text-sm font-semibold" style={{ color: colors.text }}>
                    {t('serverSettings.urlLabel', 'Backend Server URL')} <Text className="text-red-500">*</Text>
                  </Text>
                  <Box
                    className="rounded-lg px-4 py-3 border"
                    style={{
                      backgroundColor: colors.backgroundSecondary,
                      borderColor: colors.border,
                    }}
                  >
                    <TextInput
                      className="text-base"
                      style={{ color: colors.text }}
                      placeholder="http://127.0.0.1:8080"
                      value={serverUrl}
                      onChangeText={setServerUrl}
                      placeholderTextColor={colors.textTertiary}
                      autoCapitalize="none"
                      autoCorrect={false}
                      keyboardType="url"
                    />
                  </Box>
                  <VStack space="xs">
                    <Text className="text-xs" style={{ color: colors.textSecondary }}>
                      {t('serverSettings.urlHelper', 'Enter the full URL including protocol (http:// or https://)')}
                    </Text>
                    <Text className="text-xs font-semibold" style={{ color: colors.error || '#ef4444' }}>
                      {t('serverSettings.urlNoTrailingSlash', '⚠ URL must not end with a trailing slash (/)')}
                    </Text>
                  </VStack>
                </VStack>

                <Box
                  className="rounded-lg p-3 border"
                  style={{
                    backgroundColor: colors.warning + '10',
                    borderColor: colors.warning + '40',
                  }}
                >
                  <HStack space="xs" className="items-start">
                    <AlertCircle size={16} color={colors.warning} style={{ marginTop: 2 }} />
                    <VStack className="flex-1">
                      <Text className="text-xs font-semibold" style={{ color: colors.warning }}>
                        {t('serverSettings.warningTitle', 'Important')}
                      </Text>
                      <Text className="text-xs mt-1" style={{ color: colors.text }}>
                        {t('serverSettings.warningMessage', 'Make sure your device and server are on the same network. You may need to restart the app after changing the URL.')}
                      </Text>
                    </VStack>
                  </HStack>
                </Box>

                <VStack space="sm">
                  <Text className="text-sm font-semibold" style={{ color: colors.text }}>
                    {t('serverSettings.examples', 'Examples:')}
                  </Text>
                  <VStack space="xs" className="pl-3">
                    <Text className="text-xs" style={{ color: colors.textSecondary }}>
                      • Local network: http://127.0.0.1:8080
                    </Text>
                    <Text className="text-xs" style={{ color: colors.textSecondary }}>
                      • Localhost (emulator): http://10.0.2.2:8080
                    </Text>
                    <Text className="text-xs" style={{ color: colors.textSecondary }}>
                      • Production: https://api.example.com
                    </Text>
                  </VStack>
                </VStack>

                <Button
                  variant="outline"
                  onPress={handleReset}
                  className="border-orange-400"
                >
                  <ButtonIcon as={RefreshCw} className="text-orange-600" />
                  <ButtonText className="text-orange-600">
                    {t('serverSettings.resetButton', 'Reset to Default')}
                  </ButtonText>
                </Button>
              </VStack>
            </Box>

            <Box
              className="rounded-lg p-4 border"
              style={{
                backgroundColor: colors.info + '10',
                borderColor: colors.info + '40',
              }}
            >
              <VStack space="xs">
                <Text className="text-sm font-semibold" style={{ color: colors.info }}>
                  {t('serverSettings.currentUrl', 'Current Server URL:')}
                </Text>
                <Text className="text-xs font-mono" style={{ color: colors.text }}>
                  {serverUrl}
                </Text>
              </VStack>
            </Box>
          </VStack>
        </Box>
      </ScrollView>
    </SafeAreaView>
  );
}
