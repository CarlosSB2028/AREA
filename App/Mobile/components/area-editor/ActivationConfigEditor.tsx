import React from 'react';
import { TextInput, Pressable } from 'react-native';
import { Box } from '@/components/ui/box';
import { VStack } from '@/components/ui/vstack';
import { HStack } from '@/components/ui/hstack';
import { Text } from '@/components/ui/text';
import { Badge, BadgeText } from '@/components/ui/badge';
import { useTranslation } from 'react-i18next';
import type { ActivationConfig } from '@/types/areas';

interface ActivationConfigEditorProps {
  config: ActivationConfig;
  onChange: (config: ActivationConfig) => void;
  allowedTypes?: ActivationConfig['type'][];
  isFirstAction?: boolean;
}

export function ActivationConfigEditor({
  config,
  onChange,
  allowedTypes = ['webhook', 'cron', 'poll', 'chain'],
  isFirstAction = false
}: ActivationConfigEditorProps) {
  const { t } = useTranslation();
  const availableTypes = isFirstAction
    ? allowedTypes.filter(type => type !== 'chain')
    : allowedTypes;

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
      case 'cron':
        onChange({
          ...baseConfig,
          cron_expression: '0 */30 * * * *',
        });
        break;
      case 'poll':
        onChange({
          ...baseConfig,
          poll_interval: 300,
        });
        break;
      case 'chain':
        onChange(baseConfig);
        break;
      case 'manual':
        onChange(baseConfig);
        break;
    }
  };

  const renderTypeSelector = () => (
    <VStack space="xs">
      <Text className="text-typography-700 text-sm">
        {t('activation.type', 'Activation Type')}
      </Text>
      <HStack space="xs" className="flex-wrap">
        {availableTypes.map((type) => (
          <Pressable
            key={type}
            onPress={() => handleTypeChange(type)}
          >
            <Badge
              size="md"
              variant={config.type === type ? 'solid' : 'outline'}
              action={config.type === type ? 'info' : 'muted'}
              className="mb-2"
            >
              <BadgeText className="text-xs capitalize">
                {t(`activation.type.${type}`, type)}
              </BadgeText>
            </Badge>
          </Pressable>
        ))}
      </HStack>
    </VStack>
  );

  const renderConfigFields = () => {
    switch (config.type) {
      case 'webhook':
        return (
          <VStack space="sm">
            <VStack space="xs">
              <Text className="text-typography-700 text-sm">
                {t('activation.webhook.url', 'Webhook URL')}
              </Text>
              <Box className="bg-background-50 rounded-lg px-3 py-2 border border-outline-100">
                <TextInput
                  className="text-typography-900"
                  placeholder="https://example.com/webhook"
                  value={config.webhook_url || ''}
                  onChangeText={(text) => onChange({ ...config, webhook_url: text })}
                  placeholderTextColor="#9CA3AF"
                  autoCapitalize="none"
                  autoCorrect={false}
                />
              </Box>
            </VStack>

            <VStack space="xs">
              <Text className="text-typography-700 text-sm">
                {t('activation.webhook.secret', 'Secret Token (Optional)')}
              </Text>
              <Box className="bg-background-50 rounded-lg px-3 py-2 border border-outline-100">
                <TextInput
                  className="text-typography-900"
                  placeholder={t('activation.webhook.secretPlaceholder', 'Enter secret token')}
                  value={config.secret_token || ''}
                  onChangeText={(text) => onChange({ ...config, secret_token: text })}
                  placeholderTextColor="#9CA3AF"
                  secureTextEntry
                />
              </Box>
            </VStack>

            <VStack space="xs">
              <Text className="text-typography-700 text-sm">
                {t('activation.webhook.events', 'Events (Optional)')}
              </Text>
              <Box className="bg-background-50 rounded-lg px-3 py-2 border border-outline-100">
                <TextInput
                  className="text-typography-900"
                  placeholder={t('activation.webhook.eventsPlaceholder', 'Comma-separated events')}
                  value={config.events?.join(', ') || ''}
                  onChangeText={(text) => {
                    const events = text.split(',').map(e => e.trim()).filter(e => e);
                    onChange({ ...config, events });
                  }}
                  placeholderTextColor="#9CA3AF"
                />
              </Box>
              <Text className="text-typography-500 text-xs">
                {t('activation.webhook.eventsHelp', 'Example: push, pull_request, issues')}
              </Text>
            </VStack>
          </VStack>
        );

      case 'cron':
        return (
          <VStack space="sm">
            <VStack space="xs">
              <Text className="text-typography-700 text-sm">
                {t('activation.cron.expression', 'Cron Expression')}
              </Text>
              <Box className="bg-background-50 rounded-lg px-3 py-2 border border-outline-100">
                <TextInput
                  className="text-typography-900 font-mono"
                  placeholder="0 */30 * * * *"
                  value={config.cron_expression || ''}
                  onChangeText={(text) => onChange({ ...config, cron_expression: text })}
                  placeholderTextColor="#9CA3AF"
                  autoCapitalize="none"
                />
              </Box>
              <Text className="text-typography-500 text-xs">
                {t('activation.cron.help', 'Format: second minute hour day month weekday')}
              </Text>
            </VStack>

            <VStack space="xs">
              <Text className="text-typography-700 text-sm">
                {t('activation.cron.presets', 'Common Presets')}
              </Text>
              <HStack space="xs" className="flex-wrap">
                <Pressable onPress={() => onChange({ ...config, cron_expression: '0 */5 * * * *' })}>
                  <Badge size="sm" variant="outline" action="info" className="mb-2">
                    <BadgeText className="text-xs">
                      {t('activation.cron.every5min', 'Every 5 min')}
                    </BadgeText>
                  </Badge>
                </Pressable>
                <Pressable onPress={() => onChange({ ...config, cron_expression: '0 */30 * * * *' })}>
                  <Badge size="sm" variant="outline" action="info" className="mb-2">
                    <BadgeText className="text-xs">
                      {t('activation.cron.every30min', 'Every 30 min')}
                    </BadgeText>
                  </Badge>
                </Pressable>
                <Pressable onPress={() => onChange({ ...config, cron_expression: '0 0 * * * *' })}>
                  <Badge size="sm" variant="outline" action="info" className="mb-2">
                    <BadgeText className="text-xs">
                      {t('activation.cron.hourly', 'Hourly')}
                    </BadgeText>
                  </Badge>
                </Pressable>
                <Pressable onPress={() => onChange({ ...config, cron_expression: '0 0 0 * * *' })}>
                  <Badge size="sm" variant="outline" action="info" className="mb-2">
                    <BadgeText className="text-xs">
                      {t('activation.cron.daily', 'Daily')}
                    </BadgeText>
                  </Badge>
                </Pressable>
              </HStack>
            </VStack>
          </VStack>
        );

      case 'poll':
        return (
          <VStack space="sm">
            <VStack space="xs">
              <Text className="text-typography-700 text-sm">
                {t('activation.poll.interval', 'Poll Interval (seconds)')}
              </Text>
              <Box className="bg-background-50 rounded-lg px-3 py-2 border border-outline-100">
                <TextInput
                  className="text-typography-900"
                  placeholder="300"
                  value={config.poll_interval?.toString() || ''}
                  onChangeText={(text) => {
                    const num = parseInt(text);
                    onChange({
                      ...config,
                      poll_interval: isNaN(num) ? undefined : num,
                      interval_seconds: isNaN(num) ? undefined : num
                    });
                  }}
                  keyboardType="numeric"
                  placeholderTextColor="#9CA3AF"
                />
              </Box>
              <Text className="text-typography-500 text-xs">
                {t('activation.poll.help', 'How often to check for changes (minimum: 60 seconds)')}
              </Text>
            </VStack>
            <VStack space="xs">
              <Text className="text-typography-700 text-sm">
                {t('activation.poll.presets', 'Common Intervals')}
              </Text>
              <HStack space="xs" className="flex-wrap">
                <Pressable onPress={() => onChange({ ...config, poll_interval: 60, interval_seconds: 60 })}>
                  <Badge size="sm" variant="outline" action="info" className="mb-2">
                    <BadgeText className="text-xs">1 min</BadgeText>
                  </Badge>
                </Pressable>
                <Pressable onPress={() => onChange({ ...config, poll_interval: 300, interval_seconds: 300 })}>
                  <Badge size="sm" variant="outline" action="info" className="mb-2">
                    <BadgeText className="text-xs">5 min</BadgeText>
                  </Badge>
                </Pressable>
                <Pressable onPress={() => onChange({ ...config, poll_interval: 900, interval_seconds: 900 })}>
                  <Badge size="sm" variant="outline" action="info" className="mb-2">
                    <BadgeText className="text-xs">15 min</BadgeText>
                  </Badge>
                </Pressable>
                <Pressable onPress={() => onChange({ ...config, poll_interval: 3600, interval_seconds: 3600 })}>
                  <Badge size="sm" variant="outline" action="info" className="mb-2">
                    <BadgeText className="text-xs">1 hour</BadgeText>
                  </Badge>
                </Pressable>
              </HStack>
            </VStack>
          </VStack>
        );

      case 'chain':
        return (
          <Box className="bg-info-50 rounded-lg p-3 border border-info-200">
            <Text className="text-info-800 text-sm">
              {t('activation.chain.info', 'This action will be triggered automatically after the previous action completes.')}
            </Text>
          </Box>
        );

      case 'manual':
        return (
          <Box className="bg-warning-50 rounded-lg p-3 border border-warning-200">
            <Text className="text-warning-800 text-sm">
              {t('activation.manual.info', 'This action will only be triggered manually.')}
            </Text>
          </Box>
        );

      default:
        return null;
    }
  };

  return (
    <VStack space="md">
      {renderTypeSelector()}
      {renderConfigFields()}
    </VStack>
  );
}
