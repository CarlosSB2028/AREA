import React from 'react';
import { Stack, Text, Select, TextInput, Textarea } from '@mantine/core';
import { ServiceData, ConnectionData, LinkData } from '../../../../types';

interface LinkFormProps {
  connection: Partial<ConnectionData>;
  services: ServiceData[];
  onChange: (connection: Partial<ConnectionData>) => void;
  showServiceInfo?: boolean;
}

export default function LinkForm({
  connection,
  services,
  onChange,
  showServiceInfo = true,
}: LinkFormProps) {
  const sourceService = services.find(s => s.id === connection.sourceId);
  const targetService = services.find(s => s.id === connection.targetId);

  const handleLinkTypeChange = (value: string | null) => {
    onChange({
      ...connection,
      linkData: {
        type: value as LinkData['type'] || 'chain',
        order: connection.linkData?.order || 0,
        metadata: connection.linkData?.metadata || {},
        condition: connection.linkData?.condition || {
          field: '',
          operator: 'equals',
          value: ''
        }
      }
    });
  };

  const handleOrderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange({
      ...connection,
      linkData: {
        type: connection.linkData?.type || 'chain',
        condition: connection.linkData?.condition || {},
        metadata: connection.linkData?.metadata || {},
        order: parseInt(e.target.value) || 0
      }
    });
  };

  const handleConditionChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    try {
      const condition = JSON.parse(e.target.value);

      onChange({
        ...connection,
        linkData: {
          type: connection.linkData?.type || 'chain',
          order: connection.linkData?.order || 0,
          metadata: connection.linkData?.metadata || {},
          condition
        }
      });
    } catch (error) {
      console.error('Invalid JSON for condition', error);
    }
  };

  const getLinkTypeDescription = () => {
    switch (connection.linkData?.type) {
      case 'chain':
        return 'Chain: Target activates when source completes, inheriting source data.';
      case 'conditional':
        return 'Conditional: Target activates only if conditions are met.';
      case 'parallel':
        return 'Parallel: Target runs simultaneously with source.';
      case 'sequential':
        return 'Sequential: Target waits for source completion, then executes.';
      default:
        return '';
    }
  };

  return (
    <Stack>
      {showServiceInfo && (
        <Text size="sm" c="dimmed">
          Link from <strong>{sourceService?.serviceName}</strong>
          {' '} to <strong>{targetService?.serviceName}</strong>
        </Text>
      )}

      <Select
        label="Link Type"
        placeholder="Select link type"
        data={[
          { value: 'chain', label: 'Chain Reaction - Triggers when source completes' },
          { value: 'conditional', label: 'Conditional - Triggers based on conditions' },
          { value: 'parallel', label: 'Parallel - Runs simultaneously' },
          { value: 'sequential', label: 'Sequential - Waits for source completion' }
        ]}
        value={connection.linkData?.type || 'chain'}
        onChange={handleLinkTypeChange}
      />

      <TextInput
        label="Execution Order"
        placeholder="0"
        type="number"
        value={connection.linkData?.order?.toString() || '0'}
        onChange={handleOrderChange}
      />

      {connection.linkData?.type === 'conditional' && (
        <Textarea
          label="Condition (JSON format)"
          placeholder='{"field": "status", "operator": "equals", "value": "success"}'
          value={JSON.stringify(connection.linkData?.condition || {}, null, 2)}
          onChange={handleConditionChange}
          minRows={3}
        />
      )}

      <Text size="xs" c="dimmed">
        {getLinkTypeDescription()}
      </Text>
    </Stack>
  );
}
