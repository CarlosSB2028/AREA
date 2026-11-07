import React from 'react';
import { Modal, Button, Group } from '@mantine/core';
import { ServiceData, ConnectionData } from '../../../../types';
import LinkForm from './LinkForm';

interface LinkConfigModalProps {
  opened: boolean;
  onClose: () => void;
  tempConnection: Partial<ConnectionData> | null;
  services: ServiceData[];
  onConnectionChange: (connection: Partial<ConnectionData>) => void;
  onConfirm: () => void;
}

export default function LinkConfigModal({
  opened,
  onClose,
  tempConnection,
  services,
  onConnectionChange,
  onConfirm,
}: LinkConfigModalProps) {
  if (!tempConnection) return null;

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title="Configure Link"
      size="md"
    >
      <LinkForm
        connection={tempConnection}
        services={services}
        onChange={onConnectionChange}
        showServiceInfo={true}
      />

      <Group justify="flex-end" mt="md">
        <Button variant="outline" onClick={onClose}>
          Cancel
        </Button>
        <Button onClick={onConfirm}>
          Create Link
        </Button>
      </Group>
    </Modal>
  );
}
