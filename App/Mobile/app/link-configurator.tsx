import React, { useState, useEffect } from 'react';
import { ScrollView, Alert, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, Save, ArrowRight, Info, CheckCircle, Circle } from 'lucide-react-native';
import { Box } from '@/components/ui/box';
import { HStack } from '@/components/ui/hstack';
import { VStack } from '@/components/ui/vstack';
import { Text } from '@/components/ui/text';
import { Heading } from '@/components/ui/heading';
import { Input, InputField } from '@/components/ui/input';
import { useLinks } from '@/contexts/LinkContext';
import { useAreaEditor } from '@/contexts/AreaEditorContext';
import { useThemeColors } from '@/hooks/useThemeColors';

export default function LinkConfiguratorScreen() {
  const { t } = useTranslation();
  const colors = useThemeColors();
  const { addLink, updateLink, getLinkBetween } = useLinks();
  const { configuredActions, configuredReactions } = useAreaEditor();
  const params = useLocalSearchParams<{
    sourceIndex?: string;
    targetIndex?: string;
    sourceType?: 'action' | 'reaction';
    targetType?: 'action' | 'reaction';
    sourceName?: string;
    targetName?: string;
    sourceServiceName?: string;
    targetServiceName?: string;
    existingLink?: string;
  }>();

  const isEditMode = !!params.existingLink;
  const [linkType, setLinkType] = useState<'chain' | 'conditional' | 'parallel' | 'sequential'>('chain');
  const [order, setOrder] = useState('0');
  const [condition, setCondition] = useState('{}');
  const [mapping, setMapping] = useState('{}');
  const [selectedSourceIndex, setSelectedSourceIndex] = useState<number>(
    params.sourceIndex ? parseInt(params.sourceIndex) : -1
  );
  const [selectedSourceType, setSelectedSourceType] = useState<'action' | 'reaction'>(
    params.sourceType || 'action'
  );
  const [selectedTargetIndex, setSelectedTargetIndex] = useState<number>(
    params.targetIndex ? parseInt(params.targetIndex) : -1
  );
  const [selectedTargetType, setSelectedTargetType] = useState<'action' | 'reaction'>(
    params.targetType || 'reaction'
  );

  useEffect(() => {
    if (isEditMode && params.existingLink) {
      try {
        const existingData = JSON.parse(params.existingLink);
        setLinkType(existingData.linkType || 'chain');
        setOrder(existingData.order?.toString() || '0');
        setCondition(JSON.stringify(existingData.condition || {}, null, 2));
        setMapping(JSON.stringify(existingData.mapping || {}, null, 2));
        setSelectedSourceIndex(existingData.sourceIndex);
        setSelectedSourceType(existingData.sourceType);
        setSelectedTargetIndex(existingData.targetIndex);
        setSelectedTargetType(existingData.targetType);
      } catch {
        console.error('Failed to parse existing link data');
      }
    }
  }, [isEditMode, params.existingLink]);

  const handleSave = () => {
    if (selectedSourceIndex === -1 || selectedTargetIndex === -1) {
      Alert.alert(
        t('linkConfigurator.error', 'Error'),
        t('linkConfigurator.selectBothCards', 'Please select both source and target cards')
      );
      return;
    }
    let parsedCondition = {};
    if (linkType === 'conditional') {
      try {
        parsedCondition = JSON.parse(condition);
      } catch {
        Alert.alert(
          t('linkConfigurator.error', 'Error'),
          t('linkConfigurator.invalidCondition', 'Invalid condition JSON format')
        );
        return;
      }
    }

    let parsedMapping = {};
    try {
      parsedMapping = JSON.parse(mapping);
    } catch {
      Alert.alert(
        t('linkConfigurator.error', 'Error'),
        t('linkConfigurator.invalidMapping', 'Invalid mapping JSON format')
      );
      return;
    }

    const linkData = {
      sourceIndex: selectedSourceIndex,
      targetIndex: selectedTargetIndex,
      sourceType: selectedSourceType,
      targetType: selectedTargetType,
      linkType,
      order: parseInt(order) || 0,
      mapping: parsedMapping,
      condition: linkType === 'conditional' ? parsedCondition : undefined,
    };
    const existingLink = getLinkBetween(
      selectedSourceIndex,
      selectedTargetIndex,
      selectedSourceType,
      selectedTargetType
    );

    if (existingLink) {
      updateLink(0, linkData);
    } else {
      addLink(linkData);
    }

    Alert.alert(
      t('linkConfigurator.success', 'Success'),
      t('linkConfigurator.linkSaved', 'Link configuration saved'),
      [{ text: t('common.ok', 'OK'), onPress: () => router.back() }]
    );
  };

  const getLinkTypeDescription = () => {
    switch (linkType) {
      case 'chain':
        return t('linkConfigurator.chainDesc', 'Target activates when source completes, inheriting source data.');
      case 'conditional':
        return t('linkConfigurator.conditionalDesc', 'Target activates only if specified conditions are met.');
      case 'parallel':
        return t('linkConfigurator.parallelDesc', 'Target runs simultaneously with source.');
      case 'sequential':
        return t('linkConfigurator.sequentialDesc', 'Target waits for source completion, then executes in order.');
      default:
        return '';
    }
  };

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
          <Heading size="lg" className="text-white font-bold">
            {isEditMode
              ? t('linkConfigurator.titleEdit', 'Edit Link')
              : t('linkConfigurator.title', 'Configure Link')}
          </Heading>
        </HStack>
        <TouchableOpacity onPress={handleSave}>
          <Save size={24} color="white" />
        </TouchableOpacity>
      </View>

      <ScrollView className="flex-1">
        <Box className="p-4">
          <VStack space="xl">
            <VStack space="md">
              <HStack space="xs" className="items-center mb-2">
                <Info size={16} color={colors.info} />
                <Text className="font-bold text-lg" style={{ color: colors.text }}>
                  {t('linkConfigurator.selectCards', 'Select Cards')}
                </Text>
              </HStack>
              <VStack space="sm">
                <Text className="text-sm font-semibold" style={{ color: colors.text }}>
                  {t('linkConfigurator.source', 'Source Card')}
                </Text>
                <Text className="text-xs uppercase" style={{ color: colors.textSecondary }}>
                  {t('editor.section.triggers', 'Triggers')}
                </Text>
                {configuredActions.map((configuredAction: any, index: number) => (
                  <TouchableOpacity
                    key={`action-${index}`}
                    onPress={() => {
                      setSelectedSourceIndex(index);
                      setSelectedSourceType('action');
                    }}
                    activeOpacity={0.7}
                  >
                    <Box
                      className="rounded-lg p-3 border-2"
                      style={{
                        backgroundColor: selectedSourceType === 'action' && selectedSourceIndex === index
                          ? colors.info + '20'
                          : colors.card,
                        borderColor: selectedSourceType === 'action' && selectedSourceIndex === index
                          ? colors.info
                          : colors.border,
                      }}
                    >
                      <HStack space="sm" className="items-center">
                        {selectedSourceType === 'action' && selectedSourceIndex === index ? (
                          <CheckCircle size={18} color={colors.info} />
                        ) : (
                          <Circle size={18} color={colors.textSecondary} />
                        )}
                        <VStack className="flex-1">
                          <Text className="font-semibold text-sm" style={{ color: colors.text }}>
                            {configuredAction.action.name || configuredAction.definition.name}
                          </Text>
                          <Text className="text-xs" style={{ color: colors.textSecondary }}>
                            {configuredAction.service.name}
                          </Text>
                        </VStack>
                      </HStack>
                    </Box>
                  </TouchableOpacity>
                ))}
                {configuredReactions.length > 0 && (
                  <>
                    <Text className="text-xs uppercase mt-2" style={{ color: colors.textSecondary }}>
                      {t('editor.section.actions', 'Actions')}
                    </Text>
                    {configuredReactions.map((configuredReaction: any, index: number) => (
                      <TouchableOpacity
                        key={`reaction-${index}`}
                        onPress={() => {
                          setSelectedSourceIndex(index);
                          setSelectedSourceType('reaction');
                        }}
                        activeOpacity={0.7}
                      >
                        <Box
                          className="rounded-lg p-3 border-2"
                          style={{
                            backgroundColor: selectedSourceType === 'reaction' && selectedSourceIndex === index
                              ? colors.info + '20'
                              : colors.card,
                            borderColor: selectedSourceType === 'reaction' && selectedSourceIndex === index
                              ? colors.info
                              : colors.border,
                          }}
                        >
                          <HStack space="sm" className="items-center">
                            {selectedSourceType === 'reaction' && selectedSourceIndex === index ? (
                              <CheckCircle size={18} color={colors.info} />
                            ) : (
                              <Circle size={18} color={colors.textSecondary} />
                            )}
                            <VStack className="flex-1">
                              <Text className="font-semibold text-sm" style={{ color: colors.text }}>
                                {configuredReaction.reaction.name || configuredReaction.definition.name}
                              </Text>
                              <Text className="text-xs" style={{ color: colors.textSecondary }}>
                                {configuredReaction.service.name}
                              </Text>
                            </VStack>
                          </HStack>
                        </Box>
                      </TouchableOpacity>
                    ))}
                  </>
                )}
              </VStack>
              <HStack className="items-center justify-center py-2">
                <ArrowRight size={24} color={colors.info} />
              </HStack>
              <VStack space="sm">
                <Text className="text-sm font-semibold" style={{ color: colors.text }}>
                  {t('linkConfigurator.target', 'Target Card')}
                </Text>
                <Text className="text-xs uppercase" style={{ color: colors.textSecondary }}>
                  {t('editor.section.triggers', 'Triggers')}
                </Text>
                {configuredActions.map((configuredAction: any, index: number) => (
                  <TouchableOpacity
                    key={`target-action-${index}`}
                    onPress={() => {
                      setSelectedTargetIndex(index);
                      setSelectedTargetType('action');
                    }}
                    activeOpacity={0.7}
                  >
                    <Box
                      className="rounded-lg p-3 border-2"
                      style={{
                        backgroundColor: selectedTargetType === 'action' && selectedTargetIndex === index
                          ? colors.success + '20'
                          : colors.card,
                        borderColor: selectedTargetType === 'action' && selectedTargetIndex === index
                          ? colors.success
                          : colors.border,
                      }}
                    >
                      <HStack space="sm" className="items-center">
                        {selectedTargetType === 'action' && selectedTargetIndex === index ? (
                          <CheckCircle size={18} color={colors.success} />
                        ) : (
                          <Circle size={18} color={colors.textSecondary} />
                        )}
                        <VStack className="flex-1">
                          <Text className="font-semibold text-sm" style={{ color: colors.text }}>
                            {configuredAction.action.name || configuredAction.definition.name}
                          </Text>
                          <Text className="text-xs" style={{ color: colors.textSecondary }}>
                            {configuredAction.service.name}
                          </Text>
                        </VStack>
                      </HStack>
                    </Box>
                  </TouchableOpacity>
                ))}
                {configuredReactions.length > 0 && (
                  <>
                    <Text className="text-xs uppercase mt-2" style={{ color: colors.textSecondary }}>
                      {t('editor.section.actions', 'Actions')}
                    </Text>
                    {configuredReactions.map((configuredReaction: any, index: number) => (
                      <TouchableOpacity
                        key={`target-reaction-${index}`}
                        onPress={() => {
                          setSelectedTargetIndex(index);
                          setSelectedTargetType('reaction');
                        }}
                        activeOpacity={0.7}
                      >
                        <Box
                          className="rounded-lg p-3 border-2"
                          style={{
                            backgroundColor: selectedTargetType === 'reaction' && selectedTargetIndex === index
                              ? colors.success + '20'
                              : colors.card,
                            borderColor: selectedTargetType === 'reaction' && selectedTargetIndex === index
                              ? colors.success
                              : colors.border,
                          }}
                        >
                          <HStack space="sm" className="items-center">
                            {selectedTargetType === 'reaction' && selectedTargetIndex === index ? (
                              <CheckCircle size={18} color={colors.success} />
                            ) : (
                              <Circle size={18} color={colors.textSecondary} />
                            )}
                            <VStack className="flex-1">
                              <Text className="font-semibold text-sm" style={{ color: colors.text }}>
                                {configuredReaction.reaction.name || configuredReaction.definition.name}
                              </Text>
                              <Text className="text-xs" style={{ color: colors.textSecondary }}>
                                {configuredReaction.service.name}
                              </Text>
                            </VStack>
                          </HStack>
                        </Box>
                      </TouchableOpacity>
                    ))}
                  </>
                )}
              </VStack>
            </VStack>
            <VStack space="md">
              <Text className="font-bold text-lg" style={{ color: colors.text }}>
                {t('linkConfigurator.linkType', 'Link Type')}
              </Text>
              <VStack space="sm">
                <TouchableOpacity onPress={() => setLinkType('chain')} activeOpacity={0.7}>
                  <Box
                    className="rounded-lg p-3 border-2"
                    style={{
                      backgroundColor: linkType === 'chain' ? colors.info + '20' : colors.card,
                      borderColor: linkType === 'chain' ? colors.info : colors.border,
                    }}
                  >
                    <HStack space="sm" className="items-center">
                      {linkType === 'chain' ? (
                        <CheckCircle size={20} color={colors.info} />
                      ) : (
                        <Circle size={20} color={colors.textSecondary} />
                      )}
                      <VStack space="xs" className="flex-1">
                        <Text className="font-semibold" style={{ color: colors.text }}>
                          {t('linkConfigurator.chain', 'Chain Reaction')}
                        </Text>
                        <Text className="text-xs" style={{ color: colors.textSecondary }}>
                          {t('linkConfigurator.chainDesc', 'Triggers when source completes')}
                        </Text>
                      </VStack>
                    </HStack>
                  </Box>
                </TouchableOpacity>

                <TouchableOpacity onPress={() => setLinkType('conditional')} activeOpacity={0.7}>
                  <Box
                    className="rounded-lg p-3 border-2"
                    style={{
                      backgroundColor: linkType === 'conditional' ? colors.info + '20' : colors.card,
                      borderColor: linkType === 'conditional' ? colors.info : colors.border,
                    }}
                  >
                    <HStack space="sm" className="items-center">
                      {linkType === 'conditional' ? (
                        <CheckCircle size={20} color={colors.info} />
                      ) : (
                        <Circle size={20} color={colors.textSecondary} />
                      )}
                      <VStack space="xs" className="flex-1">
                        <Text className="font-semibold" style={{ color: colors.text }}>
                          {t('linkConfigurator.conditional', 'Conditional')}
                        </Text>
                        <Text className="text-xs" style={{ color: colors.textSecondary }}>
                          {t('linkConfigurator.conditionalDesc', 'Triggers based on conditions')}
                        </Text>
                      </VStack>
                    </HStack>
                  </Box>
                </TouchableOpacity>

                <TouchableOpacity onPress={() => setLinkType('parallel')} activeOpacity={0.7}>
                  <Box
                    className="rounded-lg p-3 border-2"
                    style={{
                      backgroundColor: linkType === 'parallel' ? colors.info + '20' : colors.card,
                      borderColor: linkType === 'parallel' ? colors.info : colors.border,
                    }}
                  >
                    <HStack space="sm" className="items-center">
                      {linkType === 'parallel' ? (
                        <CheckCircle size={20} color={colors.info} />
                      ) : (
                        <Circle size={20} color={colors.textSecondary} />
                      )}
                      <VStack space="xs" className="flex-1">
                        <Text className="font-semibold" style={{ color: colors.text }}>
                          {t('linkConfigurator.parallel', 'Parallel')}
                        </Text>
                        <Text className="text-xs" style={{ color: colors.textSecondary }}>
                          {t('linkConfigurator.parallelDesc', 'Runs simultaneously')}
                        </Text>
                      </VStack>
                    </HStack>
                  </Box>
                </TouchableOpacity>

                <TouchableOpacity onPress={() => setLinkType('sequential')} activeOpacity={0.7}>
                  <Box
                    className="rounded-lg p-3 border-2"
                    style={{
                      backgroundColor: linkType === 'sequential' ? colors.info + '20' : colors.card,
                      borderColor: linkType === 'sequential' ? colors.info : colors.border,
                    }}
                  >
                    <HStack space="sm" className="items-center">
                      {linkType === 'sequential' ? (
                        <CheckCircle size={20} color={colors.info} />
                      ) : (
                        <Circle size={20} color={colors.textSecondary} />
                      )}
                      <VStack space="xs" className="flex-1">
                        <Text className="font-semibold" style={{ color: colors.text }}>
                          {t('linkConfigurator.sequential', 'Sequential')}
                        </Text>
                        <Text className="text-xs" style={{ color: colors.textSecondary }}>
                          {t('linkConfigurator.sequentialDesc', 'Waits for completion')}
                        </Text>
                      </VStack>
                    </HStack>
                  </Box>
                </TouchableOpacity>
              </VStack>

              <Box
                className="rounded-lg p-3 border"
                style={{
                  backgroundColor: colors.info + '20',
                  borderColor: colors.info,
                }}
              >
                <Text className="text-xs" style={{ color: colors.text }}>
                  {getLinkTypeDescription()}
                </Text>
              </Box>
            </VStack>
            <VStack space="sm">
              <Text className="font-bold text-lg" style={{ color: colors.text }}>
                {t('linkConfigurator.order', 'Execution Order')}
              </Text>
              <Input variant="outline" size="md">
                <InputField
                  placeholder="0"
                  keyboardType="numeric"
                  value={order}
                  onChangeText={setOrder}
                />
              </Input>
              <Text className="text-xs" style={{ color: colors.textSecondary }}>
                {t('linkConfigurator.orderDesc', 'Lower numbers execute first. Default is 0.')}
              </Text>
            </VStack>
            {linkType === 'conditional' && (
              <VStack space="sm">
                <Text className="font-bold text-lg" style={{ color: colors.text }}>
                  {t('linkConfigurator.condition', 'Condition (JSON)')}
                </Text>
                <Input className="min-h-32" variant="outline" size="md">
                  <InputField
                    placeholder='{"field": "status", "operator": "equals", "value": "success"}'
                    value={condition}
                    onChangeText={setCondition}
                    multiline
                    numberOfLines={4}
                    textAlignVertical="top"
                  />
                </Input>
                <Text className="text-xs" style={{ color: colors.textSecondary }}>
                  {t('linkConfigurator.conditionDesc', 'Specify conditions in JSON format')}
                </Text>
              </VStack>
            )}
            <VStack space="sm">
              <Text className="font-bold text-lg" style={{ color: colors.text }}>
                {t('linkConfigurator.mapping', 'Field Mapping (JSON)')}
              </Text>
              <Input className="min-h-32" variant="outline" size="md">
                <InputField
                  placeholder='{"sourceField": "targetField", "output.data": "input.value"}'
                  value={mapping}
                  onChangeText={setMapping}
                  multiline
                  numberOfLines={4}
                  textAlignVertical="top"
                />
              </Input>
              <Text className="text-xs" style={{ color: colors.textSecondary }}>
                {t('linkConfigurator.mappingDesc', 'Map output fields from source to input fields of target')}
              </Text>
            </VStack>
            <Box className="h-8" />
          </VStack>
        </Box>
      </ScrollView>
    </SafeAreaView>
  );
}
