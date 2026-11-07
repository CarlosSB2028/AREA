import React, { useState, useEffect } from 'react';
import { ScrollView, TextInput, Alert, TouchableOpacity, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { useThemeColors } from '@/hooks/useThemeColors';
import { 
  ArrowLeft, 
  Save, 
  Plus,
  Trash2,
  Edit,
  Play,
  Zap,
  ToggleLeft,
  ToggleRight,
  Eye,
  Edit2,
  Link as LinkIcon
} from 'lucide-react-native';
import { Box } from '@/components/ui/box';
import { HStack } from '@/components/ui/hstack';
import { VStack } from '@/components/ui/vstack';
import { Text } from '@/components/ui/text';
import { Heading } from '@/components/ui/heading';
import { Button, ButtonIcon, ButtonText } from '@/components/ui/button';
import { Badge, BadgeText } from '@/components/ui/badge';
import { useAreaEditor } from '@/contexts/AreaEditorContext';
import { useLinks } from '@/contexts/LinkContext';
import * as areaService from '@/services/area';
import * as serviceCatalog from '@/services/serviceCatalog';
import type { ActionDto, ReactionDto, BackendService, ActionDefinition, CreateAreaPayload } from '@/types/areas';

interface ServiceCardProps {
  service: BackendService;
  actionDef: ActionDefinition;
  actionData: ActionDto | ReactionDto;
  params: Record<string, unknown>;
  type: 'action' | 'reaction';
  index: number;
  onEdit?: () => void;
  onDelete?: () => void;
}

function ServiceCard({ service, actionDef, actionData, params, type, index, onEdit, onDelete }: ServiceCardProps) {
  const { t } = useTranslation();
  const colors = useThemeColors();
  const paramCount = Object.keys(params || {}).length;
  const hasParams = paramCount > 0;
  const serviceIcon = service.iconLightUrl || service.iconDarkUrl;
  const [imageError, setImageError] = React.useState(false);
  
  return (
    <TouchableOpacity onPress={onEdit} activeOpacity={0.7} disabled={!onEdit}>
      <Box
        className="rounded-lg p-4 mb-3 border shadow-sm"
        style={{
          backgroundColor: colors.card,
          borderColor: colors.info,
        }}
      >
        <VStack space="sm">
          <HStack className="items-center justify-between">
            <HStack space="sm" className="items-center flex-1">
              <Box className="w-10 h-10 rounded-lg items-center justify-center overflow-hidden" style={{ backgroundColor: colors.info + '20' }}>
                {serviceIcon && !imageError ? (
                  <Image
                    source={{ uri: serviceIcon }}
                    style={{ width: 24, height: 24 }}
                    resizeMode="contain"
                    onError={() => setImageError(true)}
                  />
                ) : (
                  <Zap size={20} color={colors.info} />
                )}
              </Box>
              <VStack className="flex-1">
                <Text className="font-semibold text-base" style={{ color: colors.text }}>
                  {actionData.name || actionDef.name}
                </Text>
                <Text className="text-xs mt-0.5" style={{ color: colors.textSecondary }}>
                  {service.name}
                </Text>
              </VStack>
            </HStack>
            {(onEdit || onDelete) && (
              <HStack space="xs">
                {onEdit && (
                  <Button size="xs" variant="outline" onPress={onEdit} className="border-blue-300">
                    <ButtonIcon as={Edit} size="sm" style={{ color: colors.info }} />
                  </Button>
                )}
                {onDelete && (
                  <Button size="xs" variant="outline" action="negative" onPress={onDelete}>
                    <ButtonIcon as={Trash2} size="sm" />
                  </Button>
                )}
              </HStack>
            )}
          </HStack>
          {(actionDef.description || hasParams) && (
            <VStack space="xs" className="pl-12">
              {actionDef.description && (
                <Text className="text-xs" style={{ color: colors.textSecondary }} numberOfLines={2}>
                  {actionDef.description}
                </Text>
              )}
              {hasParams && (
                <Badge size="sm" variant="outline" className="self-start border-blue-300">
                  <BadgeText className="text-xs text-blue-700">
                    {paramCount} {t('editor.parameters', 'param(s)')}
                  </BadgeText>
                </Badge>
              )}
            </VStack>
          )}
        </VStack>
      </Box>
    </TouchableOpacity>
  );
}

export default function AreaEditorScreen() {
  const { t } = useTranslation();
  const colors = useThemeColors();
  const params = useLocalSearchParams<{ id?: string }>();
  const areaId = params.id;
  const isEditMode = !!areaId;
  const isNewArea = !areaId;

  const {
    configuredActions,
    configuredReactions,
    removeAction,
    removeReaction,
    clearAll,
    initializeWithData
  } = useAreaEditor();

  const { links, removeLinkByIndex, initializeLinks, clearLinks } = useLinks();
  const [areaName, setAreaName] = useState('');
  const [areaDescription, setAreaDescription] = useState('');
  const [enabled, setEnabled] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [dataLoaded, setDataLoaded] = useState(false);
  const [isViewMode, setIsViewMode] = useState(isEditMode);

  const loadAreaData = React.useCallback(async (id: string) => {
    if (dataLoaded)
      return;
    setIsLoading(true);
    try {
      const area = await areaService.getArea(id);
      if (area) {
        setAreaName(area.name);
        setAreaDescription(area.description);
        setEnabled(area.enabled);
        const loadedActions = [];
        const loadedReactions = [];
        for (const action of area.actions) {
          try {
            const def = await serviceCatalog.getActionDefinitionById(action.actionDefinitionId);
            const service = await serviceCatalog.getServiceByKey(def.serviceKey);
            if (service) {
              loadedActions.push({ action, service, definition: def });
            }
          } catch {
          }
        }
        for (const reaction of area.reactions) {
          try {
            const def = await serviceCatalog.getActionDefinitionById(reaction.actionDefinitionId);
            const service = await serviceCatalog.getServiceByKey(def.serviceKey);
            if (service) {
              loadedReactions.push({ reaction, service, definition: def });
            }
          } catch {
          }
        }
        initializeWithData(loadedActions, loadedReactions);

        if (area.links && area.links.length > 0) {
          const loadedLinks: import('@/contexts/LinkContext').LinkConfig[] = [];
          for (const link of area.links) {
            let sourceIndex = -1;
            let sourceType: 'action' | 'reaction' = 'action';
            const sourceActionIndex = loadedActions.findIndex(a =>
              a.action.name === link.sourceActionName ||
              a.definition.name === link.sourceActionName
            );
            if (sourceActionIndex !== -1) {
              sourceIndex = sourceActionIndex;
              sourceType = 'action';
            } else {
              const sourceReactionIndex = loadedReactions.findIndex(r =>
                r.reaction.name === link.sourceActionName ||
                r.definition.name === link.sourceActionName
              );
              if (sourceReactionIndex !== -1) {
                sourceIndex = sourceReactionIndex;
                sourceType = 'reaction';
              }
            }

            let targetIndex = -1;
            let targetType: 'action' | 'reaction' = 'reaction';
            const targetActionIndex = loadedActions.findIndex(a =>
              a.action.name === link.targetActionName ||
              a.definition.name === link.targetActionName
            );
            if (targetActionIndex !== -1) {
              targetIndex = targetActionIndex;
              targetType = 'action';
            } else {
              const targetReactionIndex = loadedReactions.findIndex(r =>
                r.reaction.name === link.targetActionName ||
                r.definition.name === link.targetActionName
              );
              if (targetReactionIndex !== -1) {
                targetIndex = targetReactionIndex;
                targetType = 'reaction';
              }
            }

            if (sourceIndex !== -1 && targetIndex !== -1) {
              console.log(':', { sourceIndex, targetIndex, sourceType, targetType });
              loadedLinks.push({
                sourceIndex,
                targetIndex,
                sourceType,
                targetType,
                linkType: link.linkType || 'chain',
                order: link.order || 0,
                mapping: link.mapping as Record<string, string>,
                condition: link.condition,
              });
            } else {
              console.log('Skipping link - source or target not found:', { sourceIndex, targetIndex });
            }
          }
          initializeLinks(loadedLinks);
        } else {
          console.log('No links found in area');
        }

        setDataLoaded(true);
      }
    } catch {
      Alert.alert(
        t('editor.error.loadFailed', 'Load Failed'),
        t('editor.error.loadFailedMessage', 'Failed to load area data'),
        [{ text: t('common.ok', 'OK'), onPress: () => router.back() }]
      );
    } finally {
      setIsLoading(false);
    }
  }, [dataLoaded, initializeWithData, initializeLinks, t]);

  useEffect(() => {
    if (isEditMode && areaId && !dataLoaded) {
      loadAreaData(areaId);
    } else if (!isEditMode && !dataLoaded) {
      clearAll();
      clearLinks();
      setDataLoaded(true);
    }
  }, [isEditMode, areaId, dataLoaded, loadAreaData, clearAll, clearLinks]);

  const handleSave = async () => {
    if (!areaName.trim()) {
      Alert.alert(
        t('editor.error.validation', 'Validation Error'),
        t('editor.error.nameRequired', 'Area name is required')
      );
      return;
    }

    if (configuredActions.length === 0) {
      Alert.alert(
        t('editor.error.validation', 'Validation Error'),
        t('editor.error.actionRequired', 'At least one trigger is required')
      );
      return;
    }

    setIsSaving(true);
    try {
      const connectionsPayload: {
        sourceServiceId?: string;
        targetServiceId?: string;
        linkType?: string;
        mapping?: Record<string, unknown>;
        condition?: Record<string, unknown>;
        order?: number;
      }[] = [];

      if (links.length > 0) {
        links.forEach(link => {
          let sourceServiceId = '';
          let targetServiceId = '';
          if (link.sourceType === 'action' && configuredActions[link.sourceIndex] !== undefined) {
            sourceServiceId = `action_${link.sourceIndex}`;
          } else if (link.sourceType === 'reaction' && configuredReactions[link.sourceIndex] !== undefined) {
            sourceServiceId = `reaction_${link.sourceIndex}`;
          }
          if (link.targetType === 'action' && configuredActions[link.targetIndex] !== undefined) {
            targetServiceId = `action_${link.targetIndex}`;
          } else if (link.targetType === 'reaction' && configuredReactions[link.targetIndex] !== undefined) {
            targetServiceId = `reaction_${link.targetIndex}`;
          }

          if (sourceServiceId && targetServiceId) {
            connectionsPayload.push({
              sourceServiceId,
              targetServiceId,
              linkType: 'chain',
              mapping: link.mapping || {},
              condition: link.condition || {},
              order: link.order || 0,
            });
          }
        });
      } else {
        if (configuredActions.length > 0 && configuredReactions.length > 0) {
          connectionsPayload.push({
            sourceServiceId: 'action_0',
            targetServiceId: 'reaction_0',
            linkType: 'chain',
            mapping: {},
            condition: {},
            order: 0,
          });
        }
        for (let i = 0; i < configuredReactions.length - 1; i++) {
          connectionsPayload.push({
            sourceServiceId: `reaction_${i}`,
            targetServiceId: `reaction_${i + 1}`,
            linkType: 'chain',
            mapping: {},
            condition: {},
            order: i + 1,
          });
        }
      }

      const payload: CreateAreaPayload = {
        name: areaName,
        description: areaDescription,
        actions: configuredActions.map(({ action }) => ({
          actionDefinitionId: action.actionDefinitionId,
          name: action.name,
          description: action.description,
          parameters: action.parameters,
          activationConfig: action.activationConfig || { type: 'webhook' },
          serviceAccountId: action.serviceAccountId,
        })),
        reactions: configuredReactions.map(({ reaction }, index) => ({
          actionDefinitionId: reaction.actionDefinitionId,
          name: reaction.name,
          description: reaction.description,
          parameters: reaction.parameters,
          mapping: reaction.mapping || {},
          condition: (reaction.condition as unknown as Record<string, unknown>) || {},
          order: index,
          activationConfig: reaction.activationConfig || { type: 'chain' },
          serviceAccountId: reaction.serviceAccountId,
        })),
        connections: connectionsPayload,
        layoutMode: 'linear',
      };

      if (isEditMode && areaId) {
        await areaService.updateAreaComplete(areaId, payload);
        setIsViewMode(true);
        await loadAreaData(areaId);
        Alert.alert(
          t('editor.success.updated', 'Success'),
          t('editor.success.updatedMessage', 'Area updated successfully')
        );
      } else {
        await areaService.createAreaWithActions(payload);
        Alert.alert(
          t('editor.success.created', 'Success'),
          t('editor.success.createdMessage', 'Area created successfully'),
          [{ text: t('common.ok', 'OK'), onPress: () => router.back() }]
        );
      }
    } catch (error) {
      console.error('Failed to save area:', error);
      Alert.alert(
        t('editor.error.saveFailed', 'Save Failed'),
        t('editor.error.saveFailedMessage', 'Failed to save area')
      );
    } finally {
      setIsSaving(false);
    }
  };

  const handleRun = async () => {
    if (!isEditMode || !areaId) {
      Alert.alert(
        t('editor.error.run', 'Cannot Run'),
        t('editor.error.runMessage', 'Please save the area before running it')
      );
      return;
    }

    try {
      await areaService.runArea(areaId);
      Alert.alert(
        t('editor.success.run', 'Success'),
        t('editor.success.runMessage', 'Area executed successfully')
      );
    } catch (error) {
      console.error('Failed to run area:', error);
      Alert.alert(
        t('editor.error.runFailed', 'Run Failed'),
        t('editor.error.runFailedMessage', 'Failed to execute area')
      );
    }
  };

  const handleToggleEnabled = async () => {
    if (!areaId)
      return;
    const newEnabled = !enabled;
    setEnabled(newEnabled);
    try {
      await areaService.toggleArea(areaId, newEnabled);
    } catch {
      setEnabled(!newEnabled);
      Alert.alert(
        t('editor.error.toggleFailed', 'Toggle Failed'),
        t('editor.error.toggleFailedMessage', 'Failed to toggle area status')
      );
    }
  };

  const handleDelete = () => {
    if (!areaId)
      return;
    Alert.alert(
      t('editor.delete.areaTitle', 'Delete Area'),
      t('editor.delete.areaMessage', 'Are you sure you want to delete this area? This action cannot be undone.'),
      [
        { text: t('common.cancel', 'Cancel'), style: 'cancel' },
        {
          text: t('common.delete', 'Delete'),
          style: 'destructive',
          onPress: async () => {
            try {
              await areaService.deleteArea(areaId);
              Alert.alert(
                t('editor.success.deleted', 'Deleted'),
                t('editor.success.deletedMessage', 'Area deleted successfully'),
                [{ text: t('common.ok', 'OK'), onPress: () => router.back() }]
              );
            } catch (error) {
              console.error('Failed to delete area:', error);
              Alert.alert(
                t('editor.error.deleteFailed', 'Delete Failed'),
                t('editor.error.deleteFailedMessage', 'Failed to delete area')
              );
            }
          }
        }
      ]
    );
  };

  const handleAddAction = () => {
    router.push({
      pathname: '/service-selector',
      params: { type: 'action' }
    });
  };

  const handleAddReaction = () => {
    router.push({
      pathname: '/service-selector',
      params: { type: 'reaction' }
    });
  };

  const handleDeleteAction = (index: number) => {
    Alert.alert(
      t('editor.delete.title', 'Delete Action'),
      t('editor.delete.message', 'Are you sure you want to delete this action?'),
      [
        { text: t('common.cancel', 'Cancel'), style: 'cancel' },
        {
          text: t('common.delete', 'Delete'),
          style: 'destructive',
          onPress: () => removeAction(index)
        }
      ]
    );
  };

  const handleDeleteReaction = (index: number) => {
    Alert.alert(
      t('editor.delete.title', 'Delete Reaction'),
      t('editor.delete.message', 'Are you sure you want to delete this reaction?'),
      [
        { text: t('common.cancel', 'Cancel'), style: 'cancel' },
        {
          text: t('common.delete', 'Delete'),
          style: 'destructive',
          onPress: () => removeReaction(index)
        }
      ]
    );
  };

  const handleEditAction = (index: number) => {
    const configuredAction = configuredActions[index];
    if (!configuredAction) return;

    const { action, service, definition } = configuredAction;
    router.push({
      pathname: '/action-configurator',
      params: {
        type: 'action',
        serviceId: service.id,
        serviceKey: service.key,
        serviceName: service.name,
        actionDefinitionId: definition.id,
        actionName: definition.name,
        editIndex: index.toString(),
        returnTo: '/area-editor',
        existingParameters: JSON.stringify(action.parameters || {}),
        existingCardName: action.name || definition.name,
        existingActivationConfig: JSON.stringify(action.activationConfig || { type: 'webhook' }),
      }
    });
  };

  const handleEditReaction = (index: number) => {
    const configuredReaction = configuredReactions[index];
    if (!configuredReaction)
      return;

    const { reaction, service, definition } = configuredReaction;
    router.push({
      pathname: '/action-configurator',
      params: {
        type: 'reaction',
        serviceId: service.id,
        serviceKey: service.key,
        serviceName: service.name,
        actionDefinitionId: definition.id,
        actionName: definition.name,
        editIndex: index.toString(),
        returnTo: '/area-editor',
        existingParameters: JSON.stringify(reaction.parameters || {}),
        existingCardName: reaction.name || definition.name,
      }
    });
  };

  const handleCreateLink = () => {
    const totalCards = configuredActions.length + configuredReactions.length;
    if (totalCards < 2) {
      Alert.alert(
        t('editor.links.error', 'Cannot Create Link'),
        t('editor.links.needTwoCards', 'You need at least 2 cards to create a link')
      );
      return;
    }
    router.push('/link-configurator');
  };

  if (isLoading) {
    return (
      <SafeAreaView className="flex-1 bg-background-0 items-center justify-center">
        <Text className="text-typography-600">
          {t('editor.loading', 'Loading...')}
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
              {isNewArea
                ? t('editor.title.create', 'Create Area')
                : isViewMode
                  ? t('editor.title.view', 'View Area')
                  : t('editor.title.edit', 'Edit Area')}
            </Heading>
          </HStack>
          <HStack space="xs">
            {isEditMode && (
              <>
                <Button
                  size="sm"
                  variant="outline"
                  className="border-white"
                  onPress={() => setIsViewMode(!isViewMode)}
                >
                  <ButtonIcon as={isViewMode ? Edit2 : Eye} color="white" size="sm" />
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="border-white"
                  onPress={handleRun}
                >
                  <ButtonIcon as={Play} color="white" size="sm" />
                </Button>
              </>
            )}
            {!isViewMode && (
              <Button
                size="sm"
                variant="solid"
                className="bg-white"
                onPress={handleSave}
                isDisabled={isSaving}
              >
                <ButtonIcon as={Save} style={{ color: colors.info }} size="sm" />
              </Button>
            )}
          </HStack>
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
                <HStack className="items-center justify-between">
                  <Text className="font-bold text-lg" style={{ color: colors.text }}>
                    {t('editor.section.basicInfo', 'Basic Information')}
                  </Text>
                  {isEditMode && (
                    <TouchableOpacity onPress={handleToggleEnabled} disabled={isViewMode}>
                      <HStack space="xs" className="items-center">
                        {enabled ? (
                          <ToggleRight size={24} color={colors.info} />
                        ) : (
                          <ToggleLeft size={24} color={colors.disabled} />
                        )}
                        <Text className={`text-sm font-semibold`} style={{ color: enabled ? colors.info : colors.disabled }}>
                          {enabled ? t('editor.active', 'Active') : t('editor.inactive', 'Inactive')}
                        </Text>
                      </HStack>
                    </TouchableOpacity>
                  )}
                </HStack>
                <VStack space="xs">
                  <Text className="text-sm font-semibold" style={{ color: colors.text }}>
                    {t('editor.field.name', 'Name')} <Text className="text-red-500">*</Text>
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
                      placeholder={t('editor.placeholder.name', 'My automation area')}
                      value={areaName}
                      onChangeText={setAreaName}
                      placeholderTextColor={colors.textTertiary}
                      editable={!isViewMode}
                    />
                  </Box>
                </VStack>

                <VStack space="xs">
                  <Text className="text-sm font-semibold" style={{ color: colors.text }}>
                    {t('editor.field.description', 'Description')}
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
                      placeholder={t('editor.placeholder.description', 'Describe what this automation does...')}
                      value={areaDescription}
                      onChangeText={setAreaDescription}
                      multiline
                      numberOfLines={3}
                      textAlignVertical="top"
                      placeholderTextColor={colors.textTertiary}
                      editable={!isViewMode}
                    />
                  </Box>
                </VStack>
                {isEditMode && !isViewMode && (
                  <Button
                    variant="outline"
                    action="negative"
                    onPress={handleDelete}
                  >
                    <ButtonIcon as={Trash2} />
                    <ButtonText>{t('editor.deleteArea', 'Delete Area')}</ButtonText>
                  </Button>
                )}
              </VStack>
            </Box>
            <VStack space="md">
              <HStack className="items-center justify-between">
                <HStack space="sm" className="items-center">
                  <Box className="w-8 h-8 rounded-full items-center justify-center" style={{ backgroundColor: colors.info + '20' }}>
                    <Zap size={16} color={colors.info} />
                  </Box>
                  <VStack>
                    <Text className="font-bold text-lg" style={{ color: colors.text }}>
                      {t('editor.section.triggers', 'Triggers')}
                    </Text>
                    <Text className="text-xs" style={{ color: colors.textSecondary }}>
                      {t('editor.section.triggersDesc', 'When this happens...')}
                    </Text>
                  </VStack>
                  <Badge size="sm" variant="solid" style={{ backgroundColor: colors.info }}>
                    <BadgeText className="text-white">{configuredActions.length}</BadgeText>
                  </Badge>
                </HStack>
                {!isViewMode && (
                  <Button size="sm" onPress={handleAddAction} style={{ backgroundColor: colors.info }}>
                    <ButtonIcon as={Plus} size="sm" color="white" />
                  </Button>
                )}
              </HStack>
              {configuredActions.length === 0 ? (
                !isViewMode && (
                  <TouchableOpacity onPress={handleAddAction} activeOpacity={0.7}>
                    <Box className="rounded-lg p-6 items-center border-2 border-dashed" style={{ backgroundColor: colors.info + '10', borderColor: colors.info + '40' }}>
                      <Box className="w-12 h-12 rounded-full items-center justify-center mb-3" style={{ backgroundColor: colors.info + '20' }}>
                        <Plus size={24} color={colors.info} />
                      </Box>
                      <Text className="text-center font-semibold mb-1" style={{ color: colors.info }}>
                        {t('editor.empty.triggers', 'No triggers yet')}
                      </Text>
                      <Text className="text-center text-sm" style={{ color: colors.textSecondary }}>
                        {t('editor.empty.triggersDesc', 'Tap to add your first trigger')}
                      </Text>
                    </Box>
                  </TouchableOpacity>
                )
              ) : (
                configuredActions.map((configuredAction, index) => {
                  const { action, service, definition } = configuredAction;
                  return (
                    <ServiceCard
                      key={action.id || index}
                      service={service}
                      actionDef={definition}
                      actionData={action}
                      params={action.parameters}
                      type="action"
                      index={index}
                      onEdit={!isViewMode ? () => handleEditAction(index) : undefined}
                      onDelete={!isViewMode ? () => handleDeleteAction(index) : undefined}
                    />
                  );
                })
              )}
            </VStack>

            <VStack space="md">
              <HStack className="items-center justify-between">
                <HStack space="sm" className="items-center">
                  <Box className="w-8 h-8 rounded-full items-center justify-center" style={{ backgroundColor: colors.info + '20' }}>
                    <Zap size={16} color={colors.info} />
                  </Box>
                  <VStack>
                    <Text className="font-bold text-lg" style={{ color: colors.text }}>
                      {t('editor.section.actions', 'Actions')}
                    </Text>
                    <Text className="text-xs" style={{ color: colors.textSecondary }}>
                      {t('editor.section.actionsDesc', 'Then do this...')}
                    </Text>
                  </VStack>
                  <Badge size="sm" variant="solid" style={{ backgroundColor: colors.info }}>
                    <BadgeText className="text-white">{configuredReactions.length}</BadgeText>
                  </Badge>
                </HStack>
                {!isViewMode && (
                  <Button size="sm" onPress={handleAddReaction} style={{ backgroundColor: colors.info }}>
                    <ButtonIcon as={Plus} size="sm" color="white" />
                  </Button>
                )}
              </HStack>
              {configuredReactions.length === 0 ? (
                !isViewMode && (
                  <TouchableOpacity onPress={handleAddReaction} activeOpacity={0.7}>
                    <Box className="rounded-lg p-6 items-center border-2 border-dashed" style={{ backgroundColor: colors.info + '10', borderColor: colors.info + '40' }}>
                      <Box className="w-12 h-12 rounded-full items-center justify-center mb-3" style={{ backgroundColor: colors.info + '20' }}>
                        <Plus size={24} color={colors.info} />
                      </Box>
                      <Text className="text-center font-semibold mb-1" style={{ color: colors.info }}>
                        {t('editor.empty.actions', 'No actions yet')}
                      </Text>
                      <Text className="text-center text-sm" style={{ color: colors.textSecondary }}>
                        {t('editor.empty.actionsDesc', 'Tap to add an action to execute')}
                      </Text>
                    </Box>
                  </TouchableOpacity>
                )
              ) : (
                configuredReactions.map((configuredReaction, index) => {
                  const { reaction, service, definition } = configuredReaction;
                  return (
                    <ServiceCard
                      key={reaction.id || index}
                      service={service}
                      actionDef={definition}
                      actionData={reaction}
                      params={reaction.parameters}
                      type="reaction"
                      index={index}
                      onEdit={!isViewMode ? () => handleEditReaction(index) : undefined}
                      onDelete={!isViewMode ? () => handleDeleteReaction(index) : undefined}
                    />
                  );
                })
              )}
            </VStack>
            {(configuredActions.length > 0 && configuredReactions.length > 0) && (
              <VStack space="md">
                <HStack className="items-center justify-between">
                  <HStack space="sm" className="items-center">
                    <Box className="w-8 h-8 rounded-full items-center justify-center" style={{ backgroundColor: colors.info + '20' }}>
                      <LinkIcon size={16} color={colors.info} />
                    </Box>
                    <VStack>
                      <Text className="font-bold text-lg" style={{ color: colors.text }}>
                        {t('editor.section.links', 'Links')}
                      </Text>
                      <Text className="text-xs" style={{ color: colors.textSecondary }}>
                        {t('editor.section.linksDesc', 'Connect cards together')}
                      </Text>
                    </VStack>
                    <Badge size="sm" variant="solid" style={{ backgroundColor: colors.info }}>
                      <BadgeText className="text-white">{links.length}</BadgeText>
                    </Badge>
                  </HStack>
                  {!isViewMode && (
                    <Button size="sm" onPress={handleCreateLink} style={{ backgroundColor: colors.info }}>
                      <ButtonIcon as={Plus} size="sm" color="white" />
                    </Button>
                  )}
                </HStack>

                {links.length === 0 ? (
                  !isViewMode && (
                    <TouchableOpacity onPress={handleCreateLink} activeOpacity={0.7}>
                      <Box className="rounded-lg p-6 items-center border-2 border-dashed" style={{ backgroundColor: colors.info + '10', borderColor: colors.info + '40' }}>
                        <Box className="w-12 h-12 rounded-full items-center justify-center mb-3" style={{ backgroundColor: colors.info + '20' }}>
                          <LinkIcon size={24} color={colors.info} />
                        </Box>
                        <Text className="text-center font-semibold mb-1" style={{ color: colors.info }}>
                          {t('editor.empty.links', 'No links yet')}
                        </Text>
                        <Text className="text-center text-sm" style={{ color: colors.textSecondary }}>
                          {t('editor.empty.linksDesc', 'Tap to connect your cards')}
                        </Text>
                      </Box>
                    </TouchableOpacity>
                  )
                ) : (
                  links.map((link, index) => {
                    let sourceName = '';
                    let targetName = '';
                    let sourceServiceName = '';
                    let targetServiceName = '';

                    if (link.sourceType === 'action' && configuredActions[link.sourceIndex]) {
                      sourceName = configuredActions[link.sourceIndex].action.name || configuredActions[link.sourceIndex].definition.name;
                      sourceServiceName = configuredActions[link.sourceIndex].service.name;
                    } else if (link.sourceType === 'reaction' && configuredReactions[link.sourceIndex]) {
                      sourceName = configuredReactions[link.sourceIndex].reaction.name || configuredReactions[link.sourceIndex].definition.name;
                      sourceServiceName = configuredReactions[link.sourceIndex].service.name;
                    }

                    if (link.targetType === 'action' && configuredActions[link.targetIndex]) {
                      targetName = configuredActions[link.targetIndex].action.name || configuredActions[link.targetIndex].definition.name;
                      targetServiceName = configuredActions[link.targetIndex].service.name;
                    } else if (link.targetType === 'reaction' && configuredReactions[link.targetIndex]) {
                      targetName = configuredReactions[link.targetIndex].reaction.name || configuredReactions[link.targetIndex].definition.name;
                      targetServiceName = configuredReactions[link.targetIndex].service.name;
                    }

                    return (
                      <Box key={index} className="rounded-lg p-4 mb-3 border shadow-sm" style={{ backgroundColor: colors.card, borderColor: colors.info }}>
                        <VStack space="md">
                          <HStack className="items-center justify-between">
                            <Badge size="sm" variant="solid" style={{ backgroundColor: colors.info }}>
                              <BadgeText className="text-xs font-semibold text-white">
                                {link.linkType.toUpperCase()}
                              </BadgeText>
                            </Badge>
                            {!isViewMode && (
                              <HStack space="xs">
                                <Button
                                  size="xs"
                                  variant="outline"
                                  onPress={() => {
                                    router.push({
                                      pathname: '/link-configurator',
                                      params: {
                                        sourceIndex: link.sourceIndex.toString(),
                                        targetIndex: link.targetIndex.toString(),
                                        sourceType: link.sourceType,
                                        targetType: link.targetType,
                                        sourceName,
                                        targetName,
                                        sourceServiceName,
                                        targetServiceName,
                                        existingLink: JSON.stringify(link),
                                      }
                                    });
                                  }}
                                  className="border-blue-300"
                                >
                                  <ButtonIcon as={Edit} size="sm" style={{ color: colors.info }} />
                                </Button>
                                <Button
                                  size="xs"
                                  variant="outline"
                                  action="negative"
                                  onPress={() => {
                                    Alert.alert(
                                      t('editor.delete.title', 'Delete Link'),
                                      t('editor.delete.linkMessage', 'Are you sure you want to delete this link?'),
                                      [
                                        { text: t('common.cancel', 'Cancel'), style: 'cancel' },
                                        {
                                          text: t('common.delete', 'Delete'),
                                          style: 'destructive',
                                          onPress: () => removeLinkByIndex(index)
                                        }
                                      ]
                                    );
                                  }}
                                >
                                  <ButtonIcon as={Trash2} size="sm" />
                                </Button>
                              </HStack>
                            )}
                          </HStack>
                          <VStack space="xs">
                            <Text className="text-xs" style={{ color: colors.textSecondary }}>
                              {t('editor.links.from', 'From')}: <Text className="font-semibold" style={{ color: colors.text }}>{sourceName}</Text>
                            </Text>
                            <Text className="text-xs pl-4" style={{ color: colors.textSecondary }}>
                              → {t('editor.links.to', 'To')}: <Text className="font-semibold" style={{ color: colors.text }}>{targetName}</Text>
                            </Text>
                          </VStack>
                          {link.order > 0 && (
                            <Text className="text-xs" style={{ color: colors.textSecondary }}>
                              {t('editor.links.order', 'Order')}: {link.order}
                            </Text>
                          )}
                        </VStack>
                      </Box>
                    );
                  })
                )}
              </VStack>
            )}
            <Box className="h-8" />
          </VStack>
        </Box>
      </ScrollView>
    </SafeAreaView>
  );
}
