'use client';

import { Drawer, Modal, Button, Text, Group, Stack } from '@mantine/core';
import { useMediaQuery } from '@mantine/hooks';
import AreaEditorToolbar from './AreaEditorToolbar';
import FreeLayoutBoard from './FreeLayoutBoard';
import InfoServiceCard from './InfoServiceCard';
import { useAreaEditor } from './useAreaEditor';
import styles from './AreaEditor.module.css';

interface AreaEditorProps {
  areaId?: string;
  draftId?: string;
}

export default function AreaEditor({ areaId, draftId }: AreaEditorProps) {
  const {
    servicesState,
    selectedService,
    modalOpened,
    setModalOpened,
    areaName,
    setAreaName,
    areaDescription,
    setAreaDescription,
    currentDraftId,
    isCommitting,
    showDraftModal,
    setShowDraftModal,
    pendingDraft,
    draftModalActions,
    handleCommit,
    handleRun,
    handleDeleteDraft,
    addNewServiceBelow,
    removeService,
    editService,
    updateService,
    connections,
    createConnection,
    removeConnection,
    duplicateService,
  } = useAreaEditor(areaId, draftId);
  const isSmall = useMediaQuery('(max-width: 768px)');
  const isMedium = useMediaQuery('(max-width: 992px)');
  const drawerSize = isSmall ? '80%' : isMedium ? '50%' : '35%';

  return (
    <div className={styles.container}>
      <Modal
        opened={showDraftModal}
        onClose={() => setShowDraftModal(false)}
        title="Draft Found"
        centered
      >
        <Stack>
          <Text>
            You have an unsaved draft from a previous session:
          </Text>
          <Text fw={500}>{pendingDraft?.name || 'Untitled Draft'}</Text>
          <Text size="sm" c="dimmed">
            Last saved: {pendingDraft?.savedAt ? new Date(pendingDraft.savedAt).toLocaleString() : 'Unknown'}
          </Text>
          <Group mt="md" justify="flex-end">
            <Button
              variant="default"
              onClick={() => {
                draftModalActions?.onReject();
                setShowDraftModal(false);
              }}
            >
              Start Fresh
            </Button>
            <Button
              onClick={() => {
                draftModalActions?.onAccept();
                setShowDraftModal(false);
              }}
            >
              Continue Editing
            </Button>
          </Group>
        </Stack>
      </Modal>

      <div className={styles.header}>
        <AreaEditorToolbar
          areaName={areaName}
          onNameChange={setAreaName}
          areaDescription={areaDescription}
          onDescriptionChange={setAreaDescription}
          onCommit={handleCommit}
          onRun={handleRun}
          isDraft={!!currentDraftId}
          isCommitting={isCommitting}
          areaId={areaId}
          onDeleteDraft={handleDeleteDraft}
        />
      </div>

      <div className={styles.boardContainer}>
        <FreeLayoutBoard
          services={servicesState}
          connections={connections}
          onAddService={() => addNewServiceBelow()}
          onRemoveService={removeService}
          onEditService={editService}
          onUpdateService={updateService}
          onCreateConnection={createConnection}
          onRemoveConnection={removeConnection}
          onDuplicateService={duplicateService}
        />
      </div>

      <Drawer
        opened={modalOpened}
        onClose={() => setModalOpened(false)}
        title="Action Details"
        position="right"
        size={drawerSize}
      >
        {selectedService && <InfoServiceCard service={selectedService} onServiceChange={updateService} />}
      </Drawer>
    </div>
  );
}