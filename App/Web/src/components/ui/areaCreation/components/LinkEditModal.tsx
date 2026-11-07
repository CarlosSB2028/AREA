import React from 'react';
import { Modal, Button, Group } from '@mantine/core';
import { ServiceData, ConnectionData } from '../../../../types';
import LinkForm from './LinkForm';

interface LinkEditModalProps {
  opened: boolean;
  onClose: () => void;
  connection: ConnectionData | null;
  services: ServiceData[];
  onUpdate: (connection: ConnectionData) => void;
  onDelete: (connectionId: string) => void;
}

export default function LinkEditModal({
  opened,
  onClose,
  connection,
  services,
  onUpdate,
  onDelete,
}: LinkEditModalProps) {
  const [editedConnection, setEditedConnection] = React.useState<ConnectionData | null>(connection);

  React.useEffect(() => {
    setEditedConnection(connection);
  }, [connection]);

  if (!connection || !editedConnection)
    return null;

  const handleUpdate = () => {
    onUpdate(editedConnection);
    onClose();
  };

  const handleDelete = () => {
    onDelete(connection.id);
    onClose();
  };

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title="Edit Link Configuration"
      size="md"
    >
      <LinkForm
        connection={editedConnection}
        services={services}
        onChange={(updated) => setEditedConnection(updated as ConnectionData)}
        showServiceInfo={true}
      />

      <Group justify="space-between" mt="md">
        <Button
          color="red"
          variant="outline"
          onClick={handleDelete}
        >
          Delete Link
        </Button>
        <Group>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleUpdate}>
            Update Link
          </Button>
        </Group>
      </Group>
    </Modal>
  );
}
