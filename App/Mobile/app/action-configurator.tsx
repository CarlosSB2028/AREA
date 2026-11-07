import React, { useState, useEffect } from 'react';
import { ScrollView, Alert, Linking, View, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams, useFocusEffect } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, Save, Link as LinkIcon, CheckCircle, AlertCircle } from 'lucide-react-native';
import { Box } from '@/components/ui/box';
import { HStack } from '@/components/ui/hstack';
import { VStack } from '@/components/ui/vstack';
import { Text } from '@/components/ui/text';
import { Heading } from '@/components/ui/heading';
import { Input, InputField } from '@/components/ui/input';
import { Button, ButtonIcon, ButtonText } from '@/components/ui/button';
import { DynamicField } from '@/components/area-editor/DynamicField';
import { TriggerConfigCard } from '@/components/area-editor/TriggerConfigCard';
import { useAreaEditor } from '@/contexts/AreaEditorContext';
import { useThemeColors } from '@/hooks/useThemeColors';
import * as serviceCatalog from '@/services/serviceCatalog';
import * as serviceConnection from '@/services/serviceConnection';
import type { ActionDefinition, FieldData, ActionDto, ReactionDto, BackendService, ActivationConfig } from '@/types/areas';
import { getServerUrl } from '@/services/storage';

export default function ActionConfiguratorScreen() {
  const { t } = useTranslation();
  const colors = useThemeColors();
  const { addAction, addReaction, updateAction, updateReaction } = useAreaEditor();
  const params = useLocalSearchParams<{
    type: 'action' | 'reaction';
    serviceId: string;
    serviceKey: string;
    serviceName: string;
    actionDefinitionId: string;
    actionName: string;
    returnTo: string;
    editIndex?: string;
    existingParameters?: string;
    existingCardName?: string;
    existingActivationConfig?: string;
  }>();

  const isEditMode = !!params.editIndex;
  const [actionDef, setActionDef] = useState<ActionDefinition | null>(null);
  const [fields, setFields] = useState<FieldData[]>([]);
  const [parameters, setParameters] = useState<Record<string, unknown>>({});
  const [cardName, setCardName] = useState<string>('');
  const [activationConfig, setActivationConfig] = useState<ActivationConfig>({ type: 'webhook' });
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const checkServiceConnection = React.useCallback(async () => {
    try {
      const status = await serviceConnection.getServiceConnectionStatus(params.serviceKey);
      setIsConnected(status.isConnected);
      console.log(`Service ${params.serviceKey} connection status:`, status.isConnected);
    } catch (error) {
      console.error('Failed to check service connection:', error);
      setIsConnected(false);
    }
  }, [params.serviceKey]);

  const openOAuthFlow = React.useCallback(async () => {
    try {
      const provider = serviceConnection.mapServiceKeyToOAuthProvider(params.serviceKey);
      const { getOAuthUrl } = await import('@/services/oauth');
      const oauthUrl = await getOAuthUrl(provider, true);
      
      Alert.alert(
        t('configurator.connectService', 'Connect Service'),
        t('configurator.connectMessage', `You need to connect your ${params.serviceName} account to use this action.`),
        [
          { text: t('common.cancel', 'Cancel'), style: 'cancel' },
          {
            text: t('common.continue', 'Continue'),
            onPress: async () => {
              try {
                const serverUrl = await getServerUrl();
                const redirectUri = encodeURIComponent('areamobile://oauth-callback');
                const authUrl = `${serverUrl}/api/oauth/${provider}/authorize?origin=mobile&mode=link&mobile_redirect=${redirectUri}`;
                const supported = await Linking.canOpenURL(authUrl);
                if (supported) {
                  await Linking.openURL(authUrl);
                  setTimeout(() => checkServiceConnection(), 2000);
                } else {
                  Alert.alert(
                    t('configurator.error', 'Error'),
                    t('configurator.cantOpenOAuth', 'Cannot open OAuth page')
                  );
                }
              } catch (error) {
                console.error('Failed to open OAuth:', error);
                Alert.alert(
                  t('configurator.error', 'Error'),
                  t('configurator.cantOpenOAuth', 'Cannot open OAuth page')
                );
              }
            }
          }
        ]
      );
    } catch (error) {
      console.error('Failed to open OAuth:', error);
    }
  }, [params.serviceKey, params.serviceName, t, checkServiceConnection]);

  const loadActionDefinition = React.useCallback(async () => {
    setIsLoading(true);
    try {
      const def = await serviceCatalog.getActionDefinitionById(params.actionDefinitionId);
      setActionDef(def);
      const extractedFields = serviceCatalog.getActionFieldsFromDefinition(def);
      setFields(extractedFields);
      if (params.existingCardName) {
        setCardName(params.existingCardName);
      } else {
        setCardName(params.actionName);
      }
      if (!isEditMode || !params.existingParameters) {
        const initialParams: Record<string, unknown> = {};
        extractedFields.forEach(field => {
          if (field.default !== undefined) {
            initialParams[field.name] = field.default;
          }
        });
        setParameters(initialParams);
      } else {
        try {
          const existingParams = JSON.parse(params.existingParameters);
          setParameters(existingParams);
        } catch (error) {
          console.error('Failed to parse existing parameters:', error);
          const initialParams: Record<string, unknown> = {};
          extractedFields.forEach(field => {
            if (field.default !== undefined) {
              initialParams[field.name] = field.default;
            }
          });
          setParameters(initialParams);
        }
      }
      if (isEditMode && params.existingActivationConfig) {
        try {
          const existingConfig = JSON.parse(params.existingActivationConfig);
          setActivationConfig(existingConfig);
        } catch (error) {
          console.error('Failed to parse existing activation config:', error);
          setActivationConfig({ type: 'webhook' });
        }
      }
    } catch (error) {
      console.error('Failed to load action definition:', error);
      Alert.alert(
        t('configurator.error.loadFailed', 'Load Failed'),
        t('configurator.error.loadFailedMessage', 'Failed to load action configuration'),
        [{ text: t('common.ok', 'OK'), onPress: () => router.back() }]
      );
    } finally {
      setIsLoading(false);
    }
  }, [params.actionDefinitionId, params.existingCardName, params.actionName, params.existingParameters, params.existingActivationConfig, isEditMode, t]);

  useEffect(() => {
    loadActionDefinition();
    checkServiceConnection();
  }, [loadActionDefinition, checkServiceConnection]);

  useFocusEffect(
    React.useCallback(() => {
      console.log('Action configurator screen focused - checking service connection');
      checkServiceConnection();
    }, [checkServiceConnection])
  );

  const handleFieldChange = (name: string, value: unknown) => {
    setParameters(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const validateForm = (): boolean => {
    for (const field of fields) {
      if (field.mandatory) {
        const value = parameters[field.name];
        if (value === undefined || value === null || value === '') {
          Alert.alert(
            t('configurator.error.validation', 'Validation Error'),
            t('configurator.error.requiredField', `Field "${field.name}" is required`)
          );
          return false;
        }
      }
    }

    return true;
  };

  const handleSave = async () => {
    if (!validateForm()) {
      return;
    }

    if (!actionDef)
      return;

    const service: BackendService = {
      id: params.serviceId,
      key: params.serviceKey,
      name: params.serviceName,
      auth: 'NONE',
      isActive: true,
    };

    if (params.type === 'action') {
      const actionData: ActionDto = {
        id: `temp-${Date.now()}`,
        actionDefinitionId: params.actionDefinitionId,
        name: cardName || params.actionName,
        description: actionDef.description,
        parameters,
        activationConfig,
      };
      if (isEditMode && params.editIndex) {
        updateAction(parseInt(params.editIndex), actionData, service, actionDef);
      } else {
        addAction(actionData, service, actionDef);
      }
    } else {
      const reactionData: ReactionDto = {
        id: `temp-${Date.now()}`,
        actionDefinitionId: params.actionDefinitionId,
        name: cardName || params.actionName,
        description: actionDef.description,
        parameters,
        order: 0,
        continue_on_error: false,
        activationConfig: { type: 'chain' },
      };
      if (isEditMode && params.editIndex) {
        updateReaction(parseInt(params.editIndex), reactionData, service, actionDef);
      } else {
        addReaction(reactionData, service, actionDef);
      }
    }

    if (isEditMode) {
      router.back();
    } else {
      router.back();
      router.back();
    }
  };

  if (isLoading) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center" style={{ backgroundColor: colors.backgroundSecondary }}>
        <Text style={{ color: colors.textSecondary }}>
          {t('configurator.loading', 'Loading...')}
        </Text>
      </SafeAreaView>
    );
  }

  if (!actionDef) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center" style={{ backgroundColor: colors.backgroundSecondary }}>
        <Text style={{ color: colors.textSecondary }}>
          {t('configurator.error.notFound', 'Action not found')}
        </Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1" style={{ backgroundColor: colors.backgroundSecondary }}>
      <View
        className="flex-row items-center justify-between p-4 border-b"
        style={{
          backgroundColor: colors.info,
          borderBottomColor: colors.border,
        }}
      >
        <HStack space="sm" className="items-center flex-1">
          <TouchableOpacity onPress={() => router.back()}>
            <ArrowLeft size={24} color="white" />
          </TouchableOpacity>
          <VStack className="flex-1">
            <Heading size="lg" className="text-white">
              {isEditMode
                ? t('configurator.titleEdit', 'Edit')
                : t('configurator.title', 'Configure')} {params.type === 'action' ? t('configurator.action', 'Action') : t('configurator.reaction', 'Reaction')}
            </Heading>
            <Text className="text-xs" style={{ color: 'rgba(255, 255, 255, 0.8)' }}>
              {params.serviceName} › {params.actionName}
            </Text>
          </VStack>
        </HStack>
        <TouchableOpacity onPress={handleSave}>
          <Save size={24} color="white" />
        </TouchableOpacity>
      </View>

      <ScrollView className="flex-1">
        <Box className="p-4">
          <VStack space="lg">
            {actionDef.description && (
              <Box
                className="rounded-lg p-3 border"
                style={{
                  backgroundColor: colors.info + '20',
                  borderColor: colors.info,
                }}
              >
                <Text className="text-sm" style={{ color: colors.text }}>
                  {actionDef.description}
                </Text>
              </Box>
            )}

            <Box
              className="rounded-lg p-4 border"
              style={{
                backgroundColor: colors.card,
                borderColor: colors.border,
              }}
            >
              <VStack space="md">
                <HStack className="items-center justify-between">
                  <VStack className="flex-1">
                    <Text className="font-semibold mb-1" style={{ color: colors.text }}>
                      {t('configurator.serviceConnection', 'Service Connection')}
                    </Text>
                    <HStack space="xs" className="items-center">
                      {isConnected ? (
                        <>
                          <CheckCircle size={16} color={colors.success} />
                          <Text className="text-sm" style={{ color: colors.success }}>
                            {t('configurator.connected', 'Connected to')} {params.serviceName}
                          </Text>
                        </>
                      ) : (
                        <>
                          <AlertCircle size={16} color={colors.warning} />
                          <Text className="text-sm" style={{ color: colors.warning }}>
                            {t('configurator.notConnected', 'Not connected to')} {params.serviceName}
                          </Text>
                        </>
                      )}
                    </HStack>
                  </VStack>
                  {!isConnected && (
                    <Button
                      size="sm"
                      variant="solid"
                      onPress={openOAuthFlow}
                      style={{ backgroundColor: colors.info }}
                    >
                      <ButtonIcon as={LinkIcon} size="sm" />
                      <ButtonText className="text-white">{t('configurator.connect', 'Connect')}</ButtonText>
                    </Button>
                  )}
                </HStack>
              </VStack>
            </Box>
            <VStack space="xs">
              <Text className="font-medium" style={{ color: colors.text }}>
                {t('configurator.cardName', 'Card Name')}
              </Text>
              <Text className="text-xs mb-1" style={{ color: colors.textSecondary }}>
                {t('configurator.cardNameHint', 'Optional: Give this card a custom name')}
              </Text>
              <Input variant="outline" size="md">
                <InputField
                  placeholder={params.actionName}
                  value={cardName}
                  onChangeText={setCardName}
                />
              </Input>
            </VStack>
            {params.type === 'action' && actionDef.isEventCapable && (
              <TriggerConfigCard
                config={activationConfig}
                onChange={setActivationConfig}
                actionName={cardName || params.actionName}
              />
            )}

            {fields.length > 0 && (
              <VStack space="sm">
                <Text className="font-semibold" style={{ color: colors.text }}>
                  {t('configurator.section.parameters', 'Parameters')}
                </Text>
                {fields.map((field) => (
                  <DynamicField
                    key={field.name}
                    field={field}
                    value={parameters[field.name]}
                    onChange={handleFieldChange}
                  />
                ))}
              </VStack>
            )}

            {fields.length === 0 && (
              <Box
                className="rounded-lg p-6 items-center border"
                style={{
                  backgroundColor: colors.card,
                  borderColor: colors.border,
                }}
              >
                <Text className="text-center" style={{ color: colors.textSecondary }}>
                  {t('configurator.noParameters', 'No parameters required for this action')}
                </Text>
              </Box>
            )}
          </VStack>
        </Box>
      </ScrollView>
    </SafeAreaView>
  );
}
