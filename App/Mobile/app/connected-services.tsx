import React, { useState, useEffect } from 'react';
import { FlatList, Alert, Linking } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useFocusEffect } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, Link as LinkIcon, Unlink } from 'lucide-react-native';
import { Box } from '@/components/ui/box';
import { HStack } from '@/components/ui/hstack';
import { VStack } from '@/components/ui/vstack';
import { Text } from '@/components/ui/text';
import { Heading } from '@/components/ui/heading';
import { Button, ButtonIcon, ButtonText } from '@/components/ui/button';
import { Badge, BadgeText } from '@/components/ui/badge';
import * as serviceCatalog from '@/services/serviceCatalog';
import * as serviceConnection from '@/services/serviceConnection';
import type { BackendService } from '@/types/areas';
import type { ServiceConnectionStatus } from '@/services/serviceConnection';
import { useThemeColors } from '@/hooks/useThemeColors';
import { getServerUrl } from '@/services/storage';

function isError(error: unknown): error is Error {
  return error instanceof Error;
}

function getErrorMessage(error: unknown): string {
  if (isError(error)) {
    return error.message;
  }
  if (typeof error === 'string') {
    return error;
  }
  return 'An unknown error occurred';
}

interface ServiceCardProps {
  service: BackendService & { connectionStatus?: ServiceConnectionStatus };
  onConnect: (service: BackendService) => void;
  onDisconnect: (service: BackendService) => void;
}

function ServiceCard({ service, onConnect, onDisconnect }: ServiceCardProps) {
  const { t } = useTranslation();
  const colors = useThemeColors();
  const isConnected = !!service.connectionStatus?.isConnected;
  const userName = service.connectionStatus?.userName;

  return (
    <Box className="rounded-xl p-4 mb-3 shadow-sm" style={{ backgroundColor: colors.card, borderWidth: 1, borderColor: colors.cardBorder }}>
      <VStack space="sm">
        <HStack space="md" className="items-center">
          <Box className="w-12 h-12 rounded-lg items-center justify-center" style={{ backgroundColor: colors.info }}>
            <Text className="text-white font-bold text-lg">
              {service.name.charAt(0)}
            </Text>
          </Box>
          <VStack className="flex-1">
            <HStack space="xs" className="items-center mb-1">
              <Text className="font-semibold" style={{ color: colors.text }}>
                {service.name}
              </Text>
              <Badge
                size="sm"
                variant="solid"
                action={isConnected ? 'success' : 'muted'}
              >
                <BadgeText className="text-xs">
                  {isConnected
                    ? t('services.connected', 'Connected')
                    : t('services.notConnected', 'Not Connected')}
                </BadgeText>
              </Badge>
            </HStack>
            {isConnected && userName && (
              <Text className="text-xs" style={{ color: colors.textSecondary }}>
                {userName}
              </Text>
            )}
          </VStack>
        </HStack>
        <HStack space="sm" className="mt-2">
          {isConnected ? (
            <Button
              size="sm"
              variant="outline"
              action="secondary"
              onPress={() => onDisconnect(service)}
              className="flex-1"
              style={{ backgroundColor: colors.iconActive }}
            >
              <ButtonIcon as={Unlink} size="sm" />
              <ButtonText>{t('services.disconnect', 'Disconnect')}</ButtonText>
            </Button>
          ) : (
            <Button
              size="sm"
              variant="solid"
              action="primary"
              onPress={() => onConnect(service)}
              className="flex-1"
              style={{ backgroundColor: colors.iconActive }}
            >
              <ButtonIcon as={LinkIcon} size="sm" />
              <ButtonText>{t('services.connect', 'Connect')}</ButtonText>
            </Button>
          )}
        </HStack>
      </VStack>
    </Box>
  );
}

export default function ConnectedServicesScreen() {
  const { t } = useTranslation();
  const colors = useThemeColors();
  const [services, setServices] = useState<(BackendService & { connectionStatus?: ServiceConnectionStatus })[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadServices = React.useCallback(async () => {
    setIsLoading(true);
    try {
      const catalog = await serviceCatalog.getServicesCatalog();
      let connectedServices: ServiceConnectionStatus[] = [];
      try {
        connectedServices = await serviceConnection.getConnectedServices();
      } catch (connectionError: unknown) {
        console.warn('Failed to load connection status:', getErrorMessage(connectionError));
      }
      const servicesWithStatus = catalog.map(service => {
        const connectionStatus = connectedServices.find(cs => cs.serviceKey === service.key);
        return {
          ...service,
          connectionStatus,
        };
      });
      setServices(servicesWithStatus);
    } catch (error: unknown) {
      console.error('Failed to load services:', getErrorMessage(error));
      Alert.alert(
        t('services.error', 'Error'),
        t('services.loadError', 'Failed to load services')
      );
    } finally {
      setIsLoading(false);
    }
  }, [t]);

  useEffect(() => {
    loadServices();
  }, [loadServices]);

  useFocusEffect(
    React.useCallback(() => {
      console.log('Connected services screen focused - reloading services');
      loadServices();
    }, [loadServices])
  );

  const handleConnect = async (service: BackendService) => {
    try {
      const oauthProvider = serviceConnection.mapServiceKeyToOAuthProvider(service.key);

      Alert.alert(
        t('services.connect', 'Connect Service'),
        t('services.connectMessage', `You will be redirected to ${service.name} to authorize the connection.`),
        [
          { text: t('common.cancel', 'Cancel'), style: 'cancel' },
          {
            text: t('common.continue', 'Continue'),
            onPress: async () => {
              try {
                const serverUrl = await getServerUrl();
                const redirectUri = encodeURIComponent('areamobile://oauth-callback');
                const authUrl = `${serverUrl}/api/oauth/${oauthProvider}/authorize?origin=mobile&mode=link&mobile_redirect=${redirectUri}`;
                const canOpen = await Linking.canOpenURL(authUrl);
                if (canOpen) {
                  await Linking.openURL(authUrl);
                  setTimeout(() => {
                    loadServices();
                  }, 2000);
                } else {
                  throw new Error('Cannot open URL');
                }
              } catch (error: unknown) {
                console.error('Failed to connect service:', getErrorMessage(error));
                Alert.alert(
                  t('services.error', 'Error'),
                  t('services.connectError', 'Failed to connect service')
                );
              }
            }
          }
        ]
      );
    } catch (error: unknown) {
      console.error('Failed to connect service:', getErrorMessage(error));
      Alert.alert(
        t('services.error', 'Error'),
        t('services.connectError', 'Failed to connect service')
      );
    }
  };

  const handleDisconnect = async (service: BackendService & { connectionStatus?: ServiceConnectionStatus }) => {
    const connectionStatus = service.connectionStatus;
    if (connectionStatus?.isPrimaryAuth) {
      Alert.alert(
        t('services.error', 'Error'),
        t('services.cannotDisconnect', 'Cannot disconnect your primary authentication method')
      );
      return;
    }

    if (connectionStatus?.canDisconnect === false) {
      Alert.alert(
        t('services.error', 'Error'),
        t('services.cannotDisconnect', 'This service cannot be disconnected at this time')
      );
      return;
    }

    Alert.alert(
      t('services.disconnect', 'Disconnect Service'),
      t('services.disconnectMessage', `Are you sure you want to disconnect ${service.name}?`),
      [
        { text: t('common.cancel', 'Cancel'), style: 'cancel' },
        {
          text: t('services.disconnect', 'Disconnect'),
          style: 'destructive',
          onPress: async () => {
            try {
              await serviceConnection.disconnectService(service.key);
              Alert.alert(
                t('services.success', 'Success'),
                t('services.disconnected', `${service.name} has been disconnected`)
              );
              await loadServices();
            } catch (error: unknown) {
              console.error('Failed to disconnect service:', getErrorMessage(error));
              Alert.alert(
                t('services.error', 'Error'),
                t('services.disconnectError', 'Failed to disconnect service')
              );
            }
          }
        }
      ]
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-background-0">
      <Box className="px-4 pt-4 pb-3" style={{ backgroundColor: colors.info }}>
        <HStack className="items-center justify-between mb-3">
          <HStack space="sm" className="items-center flex-1">
            <Button size="xs" variant="link" onPress={() => router.back()}>
              <ButtonIcon as={ArrowLeft} color="white" />
            </Button>
            <Heading size="lg" className="text-white">
              {t('services.title', 'Connected Services')}
            </Heading>
          </HStack>
        </HStack>
        <Text className="text-white text-sm opacity-90">
          {t('services.subtitle', 'Manage your service connections for automations')}
        </Text>
      </Box>

      {isLoading ? (
        <Box className="flex-1 items-center justify-center">
          <Text style={{ color: colors.textSecondary }}>
            {t('common.loading', 'Loading...')}
          </Text>
        </Box>
      ) : (
        <FlatList
          data={services}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <ServiceCard
              service={item}
              onConnect={handleConnect}
              onDisconnect={handleDisconnect}
            />
          )}
          contentContainerStyle={{
            padding: 16,
          }}
          ListEmptyComponent={
            <Box className="items-center justify-center py-12">
              <Text className="text-center" style={{ color: colors.textTertiary }}>
                {t('services.empty', 'No services available')}
              </Text>
            </Box>
          }
        />
      )}
    </SafeAreaView>
  );
}
