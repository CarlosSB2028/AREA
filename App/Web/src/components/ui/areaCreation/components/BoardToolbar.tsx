import React from 'react';
import { Button, Group } from '@mantine/core';
import { IconPlus, IconLink } from '@tabler/icons-react';
import styles from '../FreeLayoutBoard.module.css';

interface BoardToolbarProps {
  onAddService: () => void;
  onToggleLinking: () => void;
  isLinking: boolean;
  canStartLinking: boolean;
}

export default function BoardToolbar({
  onAddService,
  onToggleLinking,
  isLinking,
  canStartLinking,
}: BoardToolbarProps) {
  return (
    <div className={styles.toolbar}>
      <Group>
        <Button
          leftSection={<IconPlus size={16} />}
          onClick={onAddService}
          variant="outline"
        >
          Add Service
        </Button>
        <Button
          leftSection={<IconLink size={16} />}
          onClick={onToggleLinking}
          variant={isLinking ? "filled" : "outline"}
          color={isLinking ? "red" : "blue"}
          disabled={!isLinking && !canStartLinking}
          title={!canStartLinking ? "Configure at least 2 services to create links" : ""}
        >
          {isLinking ? 'Cancel Linking' : 'Create Link'}
        </Button>
      </Group>
    </div>
  );
}
