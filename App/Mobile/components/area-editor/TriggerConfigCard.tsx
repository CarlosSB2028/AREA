import React, { useState } from 'react';
import { TextInput, Pressable, Alert } from 'react-native';
import { Box } from '@/components/ui/box';
import { VStack } from '@/components/ui/vstack';
import { HStack } from '@/components/ui/hstack';
import { Text } from '@/components/ui/text';
import { Badge, BadgeText } from '@/components/ui/badge';
import { Button, ButtonIcon, ButtonText } from '@/components/ui/button';
import { useTranslation } from 'react-i18next';
import { useThemeColors } from '@/hooks/useThemeColors';
import { Clock, Webhook, ChevronDown, ChevronUp } from 'lucide-react-native';
import type { ActivationConfig } from '@/types/areas';

interface TriggerConfigCardProps {
  config: ActivationConfig;
  onChange: (config: ActivationConfig) => void;
  actionName?: string;
}

export function TriggerConfigCard({
  config,
  onChange,
  actionName = 'Trigger'
}: TriggerConfigCardProps) {
  const { t } = useTranslation();
  const colors = useThemeColors();
  const [isExpanded, setIsExpanded] = useState(true);

  const handleTypeChange = (type: ActivationConfig['type']) => {
    const baseConfig: ActivationConfig = { type };
    switch (type) {
      case 'webhook':
        onChange({
          ...baseConfig,
          webhook_url: '',
          events: [],
          secret_token: '',
        });
        break;
      case 'poll':
        onChange({
          ...baseConfig,
          poll_interval: 300,
          interval_seconds: 300,
        });
        break;
      default:
        onChange(baseConfig);
    }
  };

  const validatePollInterval = (value: string) => {
    const num = parseInt(value);
    if (isNaN(num)) return;
    if (num < 1) {
      Alert.alert(
        t('trigger.validation.error', 'Validation Error'),
        t('trigger.validation.minPoll', 'Minimum poll interval is 1 second'),
        [{ text: t('common.ok', 'OK') }]
      );
      return;
    }
    onChange({
      ...config,
      poll_interval: num,
      interval_seconds: num,
    });
  };

  const getTypeIcon = (type: ActivationConfig['type']) => {
    return type === 'webhook' ? Webhook : Clock;
  };

  const getTypeLabel = (type: ActivationConfig['type']) => {
    switch (type) {
      case 'webhook':
        return t('trigger.type.webhook', 'Webhook');
      case 'poll':
        return t('trigger.type.poll', 'Polling');
      default:
        return type;
    }
  };

  const renderConfigFields = () => {
    if (!isExpanded) return null;

    switch (config.type) {
      case 'webhook':
        return (
          <VStack space="md" className="mt-4">
            <VStack space="xs">
              <Text className="font-medium text-sm" style={{ color: colors.text }}>
                {t('trigger.webhook.events', 'Webhook Events (Optional)')}
              </Text>
              <Box
                className="rounded-lg px-3 py-2 border"
                style={{
                  backgroundColor: colors.backgroundSecondary,
                  borderColor: colors.border,
                }}
              >
                <TextInput
                  className="text-sm"
                  style={{ color: colors.text }}
                  placeholder={t('trigger.webhook.eventsPlaceholder', 'e.g., push, pull_request')}
                  value={config.events?.join(', ') || ''}
                  onChangeText={(text) => {
                    const events = text.split(',').map(e => e.trim()).filter(e => e);
                    onChange({ ...config, events });
                  }}
                  placeholderTextColor={colors.textTertiary}
                />
              </Box>
              <Text className="text-xs" style={{ color: colors.textSecondary }}>
                {t('trigger.webhook.eventsHelp', 'Comma-separated list of events to trigger on')}
              </Text>
            </VStack>

            <VStack space="xs">
              <Text className="font-medium text-sm" style={{ color: colors.text }}>
                {t('trigger.webhook.secret', 'Secret Token (Optional)')}
              </Text>
              <Box
                className="rounded-lg px-3 py-2 border"
                style={{
                  backgroundColor: colors.backgroundSecondary,
                  borderColor: colors.border,
                }}
              >
                <TextInput
                  className="text-sm"
                  style={{ color: colors.text }}
                  placeholder={t('trigger.webhook.secretPlaceholder', 'Enter secret for validation')}
                  value={config.secret_token || ''}
                  onChangeText={(text) => onChange({ ...config, secret_token: text })}
                  placeholderTextColor={colors.textTertiary}
                  secureTextEntry
                />
              </Box>
              <Text className="text-xs" style={{ color: colors.textSecondary }}>
                {t('trigger.webhook.secretHelp', 'Optional: Add a token for webhook validation')}
              </Text>
            </VStack>
          </VStack>
        );

      case 'poll':
        return (
          <VStack space="md" className="mt-4">
            <VStack space="xs">
              <HStack className="items-center justify-between">
                <Text className="font-medium text-sm" style={{ color: colors.text }}>
                  {t('trigger.poll.interval', 'Check Interval (seconds)')}
                </Text>
                {config.poll_interval && (
                  <Badge
                    size="sm"
                    variant="solid"
                    action="info"
                  >
                    <BadgeText className="text-xs font-semibold">
                      {config.poll_interval === 60 ? '1 min' : config.poll_interval === 300 ? '5 min' : config.poll_interval === 900 ? '15 min' : config.poll_interval === 1800 ? '30 min' : config.poll_interval === 3600 ? '1 hour' : `${Math.round(config.poll_interval / 60)} min`}
                    </BadgeText>
                  </Badge>
                )}
              </HStack>
              <Box
                className="rounded-lg px-3 py-2 border"
                style={{
                  backgroundColor: colors.backgroundSecondary,
                  borderColor: colors.border,
                }}
              >
                <TextInput
                  className="text-sm"
                  style={{ color: colors.text }}
                  placeholder="300"
                  value={config.poll_interval?.toString() || ''}
                  onChangeText={validatePollInterval}
                  keyboardType="numeric"
                  placeholderTextColor={colors.textTertiary}
                />
              </Box>
              <Text className="text-xs" style={{ color: colors.textSecondary }}>
                {t('trigger.poll.help', 'How often to check for changes (minimum: 60 seconds)')}
              </Text>
            </VStack>

            <VStack space="xs">
              <Text className="font-medium text-sm" style={{ color: colors.text }}>
                {t('trigger.poll.presets', 'Quick Select')}
              </Text>
              <HStack space="xs" className="flex-wrap">
                {[
                  { value: 60, label: '1 min' },
                  { value: 180, label: '3 min' },
                  { value: 300, label: '5 min' },
                  { value: 600, label: '10 min' },
                  { value: 900, label: '15 min' },
                  { value: 1800, label: '30 min' },
                  { value: 3600, label: '1 hour' },
                  { value: 86400, label: '24 hours' },
                ].map((item) => (
                  <Pressable
                    key={item.value}
                    onPress={() => onChange({ ...config, poll_interval: item.value, interval_seconds: item.value })}
                  >
                    <Badge
                      size="sm"
                      variant={config.poll_interval === item.value ? 'solid' : 'outline'}
                      action={config.poll_interval === item.value ? 'info' : 'muted'}
                      className="mb-2"
                    >
                      <BadgeText className="text-xs">
                        {item.label}
                      </BadgeText>
                    </Badge>
                  </Pressable>
                ))}
              </HStack>
              <Text className="text-xs mt-2" style={{ color: colors.textSecondary }}>
                {t('trigger.poll.customInfo', 'Tap badges above to select preset, or enter a custom value directly in the field')}
              </Text>
            </VStack>
          </VStack>
        );

      default:
        return null;
    }
  };

  return (
    <Box
      className="rounded-lg border overflow-hidden"
      style={{
        backgroundColor: colors.card,
        borderColor: colors.border,
      }}
    >
      <Pressable
        onPress={() => setIsExpanded(!isExpanded)}
        className="p-4 flex-row items-center justify-between"
      >
        <HStack space="md" className="items-center flex-1">
          <Box
            className="w-10 h-10 rounded-lg items-center justify-center"
            style={{ backgroundColor: colors.info + '20' }}
          >
            {React.createElement(getTypeIcon(config.type), {
              size: 20,
              color: colors.info,
            })}
          </Box>
          <VStack className="flex-1">
            <Text className="font-semibold text-sm" style={{ color: colors.text }}>
              {t('trigger.configuration', 'Trigger Configuration')}
            </Text>
            <Text className="text-xs" style={{ color: colors.textSecondary }}>
              {t('trigger.type.label', 'Type')}: {getTypeLabel(config.type)}
            </Text>
          </VStack>
        </HStack>
        {isExpanded ? (
          <ChevronUp size={20} color={colors.info} />
        ) : (
          <ChevronDown size={20} color={colors.info} />
        )}
      </Pressable>

      {isExpanded && (
        <>
          <Box
            className="h-px"
            style={{ backgroundColor: colors.border }}
          />
          <VStack space="md" className="p-4">
            <VStack space="xs">
              <Text className="font-medium text-sm" style={{ color: colors.text }}>
                {t('trigger.selectType', 'Trigger Type')}
              </Text>
              <HStack space="xs">
                <Pressable
                  onPress={() => handleTypeChange('webhook')}
                  className="flex-1"
                >
                  <Badge
                    size="md"
                    variant={config.type === 'webhook' ? 'solid' : 'outline'}
                    action={config.type === 'webhook' ? 'info' : 'muted'}
                  >
                    <BadgeText className="text-xs">
                      {t('trigger.type.webhook', 'Webhook')}
                    </BadgeText>
                  </Badge>
                </Pressable>
                <Pressable
                  onPress={() => handleTypeChange('poll')}
                  className="flex-1"
                >
                  <Badge
                    size="md"
                    variant={config.type === 'poll' ? 'solid' : 'outline'}
                    action={config.type === 'poll' ? 'info' : 'muted'}
                  >
                    <BadgeText className="text-xs">
                      {t('trigger.type.poll', 'Polling')}
                    </BadgeText>
                  </Badge>
                </Pressable>
              </HStack>
            </VStack>

            {renderConfigFields()}

            <Box
              className="rounded-lg p-3 border"
              style={{
                backgroundColor: colors.info + '10',
                borderColor: colors.info + '30',
              }}
            >
              <Text className="text-xs" style={{ color: colors.text }}>
                {config.type === 'webhook'
                  ? t('trigger.info.webhook', 'The trigger will wait for incoming webhooks with the specified events.')
                  : t('trigger.info.poll', 'The trigger will periodically check for changes at the specified interval.')}
              </Text>
            </Box>
          </VStack>
        </>
      )}
    </Box>
  );
}
