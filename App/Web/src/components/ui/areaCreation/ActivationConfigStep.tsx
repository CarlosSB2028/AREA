import { Stack, Text, Select, Alert, Modal, Button, Group, NumberInput, SegmentedControl, TextInput } from '@mantine/core';
import { useState, useEffect } from 'react';
import { ServiceData, ActivationConfig } from '../../../types';
import { IconInfoCircle, IconAlertTriangle, IconClock, IconWebhook } from '@tabler/icons-react';

interface ActivationConfigStepProps {
  service: ServiceData;
  onServiceChange: (service: ServiceData) => void;
}

export default function ActivationConfigStep({ service, onServiceChange }: ActivationConfigStepProps) {
  if (!service.selectedAction) {
    return (
      <Stack gap="md">
        <Text size="sm" fw={500}>Activation Mode</Text>
        <Alert icon={<IconInfoCircle size={16} />} title="Select an Action First" color="yellow">
          <Text size="sm">
            Please select an action first to configure its activation mode.
          </Text>
        </Alert>
      </Stack>
    );
  }

  const isReaction = service.selectedAction.isExecutable === true && service.selectedAction.isEventCapable === false;
  const getDefaultActivationType = () => {
    if (!service.selectedAction) return 'manual';
    const isReaction = service.selectedAction.isExecutable === true && service.selectedAction.isEventCapable === false;
    const isEvent = service.selectedAction.isEventCapable === true && service.selectedAction.isExecutable === false;
    if (isReaction) return 'chain';
    if (isEvent) return 'webhook';
    return 'manual';
  };

  // eslint-disable-next-line react-hooks/rules-of-hooks
  const [activationType, setActivationType] = useState<string>(getDefaultActivationType());
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const [showWarningModal, setShowWarningModal] = useState(false);
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const [pendingActivationType, setPendingActivationType] = useState<string | null>(null);

  // eslint-disable-next-line react-hooks/rules-of-hooks
  const [cronPreset, setCronPreset] = useState<string>('custom');
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const [cronExpression, setCronExpression] = useState<string>('0 0 * * *');

  // eslint-disable-next-line react-hooks/rules-of-hooks
  const [pollInterval, setPollInterval] = useState<number>(300);

  const cronPresets = [
    { value: '*/5 * * * *', label: 'Every 5 minutes' },
    { value: '*/15 * * * *', label: 'Every 15 minutes' },
    { value: '*/30 * * * *', label: 'Every 30 minutes' },
    { value: '0 * * * *', label: 'Every hour' },
    { value: '0 0 * * *', label: 'Every day at midnight' },
    { value: '0 9 * * 1-5', label: 'Weekdays at 9 AM' },
    { value: 'custom', label: 'Custom expression' }
  ];

  const activationTypeOptions = [
    { value: 'manual', label: 'Manual' },
    { value: 'cron', label: 'CRON Schedule' },
    { value: 'webhook', label: 'Webhook' },
    { value: 'poll', label: 'Polling' },
    { value: 'chain', label: 'Chain Reaction' }
  ];

  const getFilteredActivationOptions = () => {
    if (!service.selectedAction) {
      return activationTypeOptions;
    }

    const isEvent = service.selectedAction.isEventCapable === true && service.selectedAction.isExecutable === false;
    const isReaction = service.selectedAction.isExecutable === true && service.selectedAction.isEventCapable === false;

    if (isEvent) {
      return activationTypeOptions.filter(option =>
        ['webhook', 'poll', 'manual'].includes(option.value)
      );
    } else if (isReaction) {
      return activationTypeOptions.filter(option =>
        ['cron', 'chain', 'manual'].includes(option.value)
      );
    } else {
      return activationTypeOptions;
    }
  };

  const updateActivationConfig = (type: string, additionalConfig: Partial<ActivationConfig> = {}) => {
    const newConfig: ActivationConfig = {
      type: type as ActivationConfig['type'],
      ...additionalConfig
    };
    const updatedService: ServiceData = {
      ...service,
      activationConfig: newConfig
    };
    onServiceChange(updatedService);
  };

  const handleActivationTypeChange = (newType: string) => {
    if (isReaction && activationType === 'chain' && newType !== 'chain') {
      setPendingActivationType(newType);
      setShowWarningModal(true);
    } else {
      setActivationType(newType);
      updateActivationConfig(newType);
    }
  };

  const confirmActivationTypeChange = () => {
    if (pendingActivationType) {
      setActivationType(pendingActivationType);
      updateActivationConfig(pendingActivationType);
      setPendingActivationType(null);
    }
    setShowWarningModal(false);
  };

  const cancelActivationTypeChange = () => {
    setPendingActivationType(null);
    setShowWarningModal(false);
  };

  // eslint-disable-next-line react-hooks/rules-of-hooks
  useEffect(() => {
    if (service.activationConfig) {
      if (service.activationConfig.cron_expression) {
        setCronExpression(service.activationConfig.cron_expression);
        const preset = cronPresets.find(p => p.value === service.activationConfig?.cron_expression);
        setCronPreset(preset ? preset.value : 'custom');
      }
      if (service.activationConfig.poll_interval) {
        setPollInterval(service.activationConfig.poll_interval);
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [service.activationConfig]);

  // eslint-disable-next-line react-hooks/rules-of-hooks
  useEffect(() => {
    console.log('ActivationConfigStep - useEffect TRIGGERED');
    console.log('ActivationConfigStep - useEffect - service.selectedAction:', service.selectedAction);
    console.log('ActivationConfigStep - useEffect - current activationType:', activationType);

    if (!service.selectedAction) return;

    const isEvent = service.selectedAction.isEventCapable === true && service.selectedAction.isExecutable === false;
    const isReaction = service.selectedAction.isExecutable === true && service.selectedAction.isEventCapable === false;

    console.log('ActivationConfigStep - useEffect - isEvent:', isEvent, 'isReaction:', isReaction);

    let defaultType = 'manual';
    if (isReaction) defaultType = 'chain';
    if (isEvent) defaultType = 'webhook';

    console.log('ActivationConfigStep - useEffect - defaultType should be:', defaultType);

    const validOptions = [];
    if (isEvent) {
      validOptions.push('webhook', 'poll', 'manual');
    } else if (isReaction) {
      validOptions.push('cron', 'chain', 'manual');
    } else {
      validOptions.push('manual', 'cron', 'webhook', 'poll', 'chain');
    }

    console.log('ActivationConfigStep - useEffect - validOptions:', validOptions);
    const currentTypeIsValid = validOptions.includes(activationType);
    console.log('ActivationConfigStep - useEffect - currentTypeIsValid:', currentTypeIsValid);

    if (!currentTypeIsValid || (activationType === 'manual' && defaultType !== 'manual')) {
      console.log('ActivationConfigStep - useEffect - UPDATING activation type from', activationType, 'to', defaultType);
      setActivationType(defaultType);
      updateActivationConfig(defaultType);
    } else {
      console.log('ActivationConfigStep - useEffect - NO UPDATE needed, current type is valid');
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [service.selectedAction?.id, service.selectedAction?.isEventCapable, service.selectedAction?.isExecutable]);

  return (
    <>
      <Stack gap="md">
        <Text size="sm" fw={500}>Activation Mode</Text>

        {isReaction && activationType === 'chain' && (
          <Alert icon={<IconInfoCircle size={16} />} title="Chain Reaction Mode" color="blue">
            <Text size="sm">
              This reaction will be automatically triggered by the previous action in your chain.
              This is the recommended mode for reactions.
            </Text>
          </Alert>
        )}

        <Select
          label="Trigger Type"
          placeholder="Choose how this action should be triggered"
          value={activationType}
          onChange={(value) => {
            if (value) {
              handleActivationTypeChange(value);
            }
          }}
          data={getFilteredActivationOptions()}
          required
        />

        <Text size="sm" c="dimmed">
          {activationType === 'manual' && 'Manually triggered by user action'}
          {activationType === 'cron' && 'Triggered on a schedule using CRON expressions'}
          {activationType === 'webhook' && 'Triggered by incoming webhook calls'}
          {activationType === 'poll' && 'Periodically checks for changes'}
          {activationType === 'chain' && 'Triggered by another action completion'}
        </Text>

        {/* CRON Configuration */}
        {activationType === 'cron' && (
          <Stack gap="sm" mt="md">
            <Alert icon={<IconClock size={16} />} title="Schedule Configuration" color="blue">
              <Text size="sm">Configure when this action should run</Text>
            </Alert>

            <Select
              label="Schedule Preset"
              placeholder="Choose a preset schedule"
              value={cronPreset}
              onChange={(value) => {
                if (value) {
                  setCronPreset(value);
                  if (value !== 'custom') {
                    setCronExpression(value);
                    updateActivationConfig('cron', { cron_expression: value });
                  }
                }
              }}
              data={cronPresets}
            />

            {cronPreset === 'custom' && (
              <TextInput
                label="Custom CRON Expression"
                placeholder="0 0 * * *"
                value={cronExpression}
                onChange={(e) => {
                  const value = e.currentTarget.value;
                  setCronExpression(value);
                  updateActivationConfig('cron', { cron_expression: value });
                }}
                description="Format: minute hour day month weekday"
              />
            )}

            <Text size="xs" c="dimmed">
              Current schedule: {cronExpression}
            </Text>
          </Stack>
        )}

        {/* Poll Configuration */}
        {activationType === 'poll' && (
          <Stack gap="sm" mt="md">
            <Alert icon={<IconClock size={16} />} title="Polling Configuration" color="blue">
              <Text size="sm">Configure how often to check for changes</Text>
            </Alert>

            <SegmentedControl
              value={pollInterval.toString()}
              onChange={(value) => {
                const interval = parseInt(value);
                setPollInterval(interval);
                updateActivationConfig('poll', { poll_interval: interval });
              }}
              data={[
                { label: '1 min', value: '60' },
                { label: '5 min', value: '300' },
                { label: '15 min', value: '900' },
                { label: '30 min', value: '1800' },
                { label: '1 hour', value: '3600' }
              ]}
            />

            <NumberInput
              label="Custom Interval (seconds)"
              placeholder="300"
              value={pollInterval}
              onChange={(value) => {
                const interval = typeof value === 'number' ? value : 300;
                setPollInterval(interval);
                updateActivationConfig('poll', { poll_interval: interval });
              }}
              min={1}
              max={86400}
              description="Minimum: 1 second, Maximum: 24 hours (86400 seconds)"
            />
          </Stack>
        )}

        {/* Webhook Configuration */}
        {activationType === 'webhook' && (
          <Stack gap="sm" mt="md">
            <Alert icon={<IconWebhook size={16} />} title="Webhook Configuration" color="blue">
              <Text size="sm">
                This action will be triggered when a webhook is received.
                The webhook URL will be generated after creating the area.
              </Text>
            </Alert>

            <TextInput
              label="Secret Token (Optional)"
              placeholder="Enter a secret token for webhook validation"
              onChange={(e) => {
                const value = e.currentTarget.value;
                updateActivationConfig('webhook', {
                  secret_token: value || undefined
                });
              }}
              description="Optional: Add a secret token to validate incoming webhooks"
            />
          </Stack>
        )}

        {/* Manual Configuration */}
        {activationType === 'manual' && (
          <Alert icon={<IconInfoCircle size={16} />} title="Manual Trigger" color="gray" mt="md">
            <Text size="sm">
              This action can be triggered manually from the dashboard.
              No additional configuration required.
            </Text>
          </Alert>
        )}
      </Stack>

      {/* Modal de confirmation pour changer depuis CHAIN */}
      <Modal
        opened={showWarningModal}
        onClose={cancelActivationTypeChange}
        title="Change Activation Mode"
        centered
      >
        <Stack gap="md">
          <Alert icon={<IconAlertTriangle size={16} />} title="Warning" color="orange">
            <Text size="sm">
              You are about to change from <strong>Chain Reaction</strong> mode to <strong>{pendingActivationType?.toUpperCase()}</strong> mode.
            </Text>
            <Text size="sm" mt="xs">
              Chain Reaction is the recommended mode for reactions as it ensures proper sequencing
              with the previous action. Are you sure you want to change this?
            </Text>
          </Alert>

          <Group justify="flex-end">
            <Button variant="outline" onClick={cancelActivationTypeChange}>
              Cancel
            </Button>
            <Button color="orange" onClick={confirmActivationTypeChange}>
              Change Mode
            </Button>
          </Group>
        </Stack>
      </Modal>
    </>
  );
}
