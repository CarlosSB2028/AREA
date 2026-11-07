import React, { useRef, useState } from 'react';
import { Text } from '@mantine/core';
import ServiceCard from './ServiceCard';
import { ServiceState, ConnectionData } from '../../../types';
import styles from './FreeLayoutBoard.module.css';
import { FreeLayoutBoardProps } from './types';
import { useCanvasControls } from './hooks/useCanvasControls';
import { useDragAndDrop } from './hooks/useDragAndDrop';
import { useLinkManagement } from './hooks/useLinkManagement';
import BoardToolbar from './components/BoardToolbar';
import ZoomControls from './components/ZoomControls';
import ConnectionsRenderer from './components/ConnectionsRenderer';
import LinkConfigModal from './components/LinkConfigModal';
import LinkEditModal from './components/LinkEditModal';
import SVGDefinitions from './components/SVGDefinitions';

export default function FreeLayoutBoard({
  services,
  connections,
  onAddService,
  onRemoveService,
  onEditService,
  onUpdateService,
  onCreateConnection,
  onRemoveConnection,
  onDuplicateService,
}: FreeLayoutBoardProps) {
  const boardRef = useRef<HTMLDivElement>(null);
  const boardInnerRef = useRef<HTMLDivElement>(null);
  const [editModalOpened, setEditModalOpened] = useState(false);
  const [editingConnection, setEditingConnection] = useState<ConnectionData | null>(null);
  const { canvasState, handleBoardMouseDown, zoomIn, zoomOut, screenToCanvas } = useCanvasControls(boardRef);
  const {
    linkingState,
    linkModalOpened,
    tempConnection,
    handleServiceClick,
    startLinking,
    cancelLinking,
    confirmLink,
    canStartLinking,
    setLinkModalOpened,
    setTempConnection,
  } = useLinkManagement(services, onCreateConnection);
  const { dragState, handleMouseDown } = useDragAndDrop(
    services,
    onUpdateService,
    onEditService,
    screenToCanvas,
    linkingState,
    handleServiceClick
  );

  const handleToggleLinking = () => {
    if (linkingState.isLinking) {
      cancelLinking();
    } else {
      startLinking();
    }
  };

  const handleLinkModalClose = () => {
    setLinkModalOpened(false);
    setTempConnection(null);
    cancelLinking();
  };

  const handleEditConnection = (connectionId: string) => {
    const connection = connections.find(c => c.id === connectionId);
    if (connection) {
      setEditingConnection(connection);
      setEditModalOpened(true);
    }
  };

  const handleUpdateConnection = (updatedConnection: ConnectionData) => {
    onRemoveConnection(updatedConnection.id);
    onCreateConnection(updatedConnection);
  };

  const handleDeleteConnection = (connectionId: string) => {
    onRemoveConnection(connectionId);
  };

  return (
    <div className={styles.container}>
      <BoardToolbar
        onAddService={onAddService}
        onToggleLinking={handleToggleLinking}
        isLinking={linkingState.isLinking}
        canStartLinking={canStartLinking}
      />

      <div
        ref={boardRef}
        className={`${styles.board} ${canvasState.isPanning ? styles.panning : ''}`}
        onMouseDown={(e) => handleBoardMouseDown(e, boardInnerRef)}
        onContextMenu={(e) => e.preventDefault()}
      >
        <div
          ref={boardInnerRef}
          className={styles.boardInner}
          style={{
            transform: `translate(${canvasState.offsetX}px, ${canvasState.offsetY}px) scale(${canvasState.scale})`,
            transition: canvasState.isPanning ? 'none' : 'transform 0.1s ease-out',
          }}
        >
          <div className={styles.boardContent}>
            {services.map((service, index) => {
              const position = service.position || {
                x: 4500 + (index % 3) * 320,
                y: 4500 + Math.floor(index / 3) * 170
              };

              const isSelected = linkingState.sourceId === service.id;
              const isLinkingMode = linkingState.isLinking;
              const isConfigured = service.state === ServiceState.Success ||
                (service.actionDefinitionId && service.serviceName && service.event);
              const canLink = !isLinkingMode || isConfigured;

              const linkInfo = (() => {
                const fields = service.fields || {};

                if (fields._chainSource) {
                  return {
                    type: 'chain' as const,
                    sourceService: fields._chainSource as string
                  };
                }
                if (fields._conditionalSource) {
                  return {
                    type: 'conditional' as const,
                    sourceService: fields._conditionalSource as string
                  };
                }
                if (fields._parallelWith) {
                  return {
                    type: 'parallel' as const,
                    sourceService: fields._parallelWith as string
                  };
                }
                if (fields._sequentialSource) {
                  return {
                    type: 'sequential' as const,
                    sourceService: fields._sequentialSource as string
                  };
                }

                if (fields._hasChainTarget) {
                  return {
                    hasChainTarget: true
                  };
                }

                return undefined;
              })();

              return (
                <div
                  key={service.id}
                  data-service-id={service.id}
                  className={`${styles.serviceWrapper} ${isSelected ? styles.selected : ''} ${isLinkingMode ? styles.linkingMode : ''} ${!canLink ? styles.notConfigured : ''}`}
                  style={{
                    left: position.x,
                    top: position.y,
                    cursor: isLinkingMode
                      ? (canLink ? 'pointer' : 'not-allowed')
                      : (dragState.isDragging ? 'grabbing' : 'grab'),
                    opacity: isLinkingMode && !canLink ? 0.5 : 1,
                  }}
                  onMouseDown={(e) => handleMouseDown(e, service.id)}
                >
                  <ServiceCard
                    logo={service.logo}
                    serviceName={service.serviceName}
                    cardName={service.cardName}
                    event={service.event}
                    state={service.state}
                    onRemove={() => onRemoveService(service.id)}
                    onEdit={() => onEditService(service)}
                    onDuplicate={onDuplicateService ? () => onDuplicateService(service.id) : undefined}
                    linkInfo={linkInfo}
                  />

                  {isLinkingMode && !canLink && (
                    <div style={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      right: 0,
                      bottom: 0,
                      backgroundColor: 'rgba(255, 0, 0, 0.1)',
                      border: '2px dashed #ff6b6b',
                      borderRadius: '8px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      zIndex: 10,
                      pointerEvents: 'none'
                    }}>
                      <Text size="xs" color="red" fw={600} style={{
                        backgroundColor: 'white',
                        padding: '4px 8px',
                        borderRadius: '4px',
                        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                      }}>
                        Configure service first
                      </Text>
                    </div>
                  )}
                </div>
              );
            })}

            <svg
              className={styles.connections}
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                overflow: 'visible',
                pointerEvents: 'auto',
                zIndex: 1
              }}
            >
              <SVGDefinitions />
              <ConnectionsRenderer
                connections={connections}
                services={services}
                onRemoveConnection={onRemoveConnection}
                onEditConnection={handleEditConnection}
              />
            </svg>
          </div>
        </div>
        <ZoomControls
        scale={canvasState.scale}
        onZoomIn={zoomIn}
        onZoomOut={zoomOut}
      />
      </div>

      <LinkConfigModal
        opened={linkModalOpened}
        onClose={handleLinkModalClose}
        tempConnection={tempConnection}
        services={services}
        onConnectionChange={setTempConnection}
        onConfirm={confirmLink}
      />

      <LinkEditModal
        opened={editModalOpened}
        onClose={() => setEditModalOpened(false)}
        connection={editingConnection}
        services={services}
        onUpdate={handleUpdateConnection}
        onDelete={handleDeleteConnection}
      />
    </div>
  );
}