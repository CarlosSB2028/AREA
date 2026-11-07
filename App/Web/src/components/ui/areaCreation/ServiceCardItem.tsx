import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { IconGripVertical, IconPlus } from '@tabler/icons-react';
import { Button, Center } from '@mantine/core';
import ServiceCard from './ServiceCard';
import { ServiceData } from '../../../types';

interface ServiceCardItemProps {
  service: ServiceData;
  onRemove?: () => void;
  onClick?: () => void;
  onAdd?: () => void;
  onUp?: () => void;
  onDown?: () => void;
  onDuplicate?: () => void;
  isDragging: boolean;
}

export default function ServiceCardItem({ service, onRemove, onClick, onAdd, isDragging, onUp, onDown, onDuplicate }: ServiceCardItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
  } = useSortable({
    id: service.id,
    animateLayoutChanges: () => false
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition: isDragging ? 'none' : 'transform 200ms ease-out',
    marginBottom: 16,
    opacity: isDragging ? 0.6 : 1,
    position: 'relative' as const,
    zIndex: isDragging ? 100 : 1,
    touchAction: 'none',
    willChange: isDragging ? 'transform' : 'auto'
  };

  return (
    <div style={{ width: 'fit-content', margin: '0 auto', position: 'relative', zIndex: 2 }}>
      <div ref={setNodeRef} style={style} onDoubleClick={onClick}>
        <div
          style={{
            position: 'absolute',
            left: '-28px',
            top: '50%',
            transform: 'translateY(-50%)',
            cursor: 'grab',
            padding: '8px',
            touchAction: 'none',
            background: isDragging ? '#f0f0f0' : 'transparent',
            borderRadius: '4px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
          {...attributes}
          {...listeners}
        >
          <IconGripVertical size={18} color={isDragging ? "#555" : "#aaa"} />
        </div>
        <ServiceCard
          logo={service.logo}
          serviceName={service.serviceName}
          cardName={service.cardName}
          event={service.event}
          state={service.state}
          onRemove={onRemove}
          onEdit={onClick}
          onUp={onUp}
          onDown={onDown}
          onDuplicate={onDuplicate}
        />
      </div>
      {onAdd && (
        <Center style={{ marginTop: 8 }}>
          <Button
            variant="light"
            size="xs"
            onClick={onAdd}
          >
            <IconPlus size={14} />
          </Button>
        </Center>
      )}
    </div>
  );
}