import { Button, TextInput, Group, Popover, Textarea, Title, Space, Badge } from '@mantine/core';
import { IconPlayerPlay, IconFileText, IconDeviceFloppy, IconTrash, IconArrowBack } from '@tabler/icons-react';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import styles from './AreaEditor.module.css';

interface AreaEditorToolbarProps {
  areaName: string;
  onNameChange: (name: string) => void;
  areaDescription: string;
  onDescriptionChange: (description: string) => void;
  onCommit: () => void;
  onRun: () => void;
  isDraft?: boolean;
  isCommitting?: boolean;
  areaId?: string;
  onDeleteDraft?: () => void;
}

export default function AreaEditorToolbar({
  areaName,
  onNameChange,
  areaDescription,
  onDescriptionChange,
  onCommit,
  onRun,
  isDraft = false,
  isCommitting = false,
  areaId,
  onDeleteDraft
}: AreaEditorToolbarProps) {
  const [opened, setOpened] = useState(false);
  const router = useRouter();

  const handleSimpleModeClick = () => {
    if (areaId) {
      router.push(`/areas/${areaId}/edit-simple`);
    } else {
      router.push('/areas/create-simple');
    }
  };

  return (
    <div className={styles.header}>
      <Group style={{ flex: 1, justifyContent: 'space-between', width: '100%' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: 1 }}>
        <Space w="15%" />
        <TextInput
          placeholder="AREA Name"
          value={areaName}
          onChange={(e) => onNameChange(e.target.value)}
          style={{ width: '300px', marginLeft: '3%' }}
        />
        {isDraft && (
          <Badge color="blue" variant="light" style={{ flexShrink: 0 }}>Draft</Badge>
        )}
        <Popover opened={opened} onChange={setOpened} position="bottom" withArrow>
            <Popover.Target>
              <Button onClick={() => setOpened((o) => !o)} variant="light">
                <IconFileText size={16} />
              </Button>
            </Popover.Target>
            <Popover.Dropdown>
              <Title order={6}>Description</Title>
              <Textarea
                placeholder="Area description"
                value={areaDescription}
                onChange={(e) => onDescriptionChange(e.target.value)}
                autosize
                minRows={3}
                maxRows={6}
                style={{ width: '300px' }}
              />
            </Popover.Dropdown>
          </Popover>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Button
            variant="outline"
            leftSection={<IconArrowBack size={16} />}
            onClick={handleSimpleModeClick}
          >
            Simple Mode
          </Button>
          {isDraft && onDeleteDraft && (
            <Button 
              onClick={onDeleteDraft}
              color="red"
              variant="light"
              leftSection={<IconTrash size={16} />}
            >
              Delete Draft
            </Button>
          )}
          <Button 
            onClick={onCommit}
            color="green"
            leftSection={<IconDeviceFloppy size={16} />}
            disabled={isCommitting}
            loading={isCommitting}
          >
            Save
          </Button>
          <Button onClick={onRun}>
            <IconPlayerPlay />
          </Button>
        </div>
      </Group>
    </div>
  );
}