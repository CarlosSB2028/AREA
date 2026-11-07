import { Card, Text, Menu, ActionIcon, Badge, Loader } from '@mantine/core';
import Image from 'next/image';
import styles from './ServiceCard.module.css';
import { IconDotsVertical, IconClipboardCopy, IconTrash, IconSettings, IconX, IconCheck, IconEdit } from '@tabler/icons-react';
import { ServiceState, ServiceCardProps } from '../../../types';

export default function ServiceCard({ logo, serviceName, cardName, event, state, onRemove, onEdit, onDuplicate, linkInfo }: ServiceCardProps) {
    return (
        <Card radius="md" withBorder className={styles.card} style={{ width: 300 }}>
            <div className={styles.leftStripe} />
            <div className={styles.content}>
                <div className={styles.header}>
                    <div className={styles.leading}>
                        {state === ServiceState.Configuration && <Badge color="orange" variant="light"><IconSettings size={14} /></Badge>}
                        {state === ServiceState.Failed && <Badge color="red" variant="light"><IconX size={14} /></Badge>}
                        {state === ServiceState.Success && <Badge color="green" variant="light"><IconCheck size={14} /></Badge>}
                        {state === ServiceState.InProgress && (
                            <Badge color="blue" variant="light" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                                <Loader color="blue" size={12} style={{ margin: 0, verticalAlign: 'middle' }} />
                            </Badge>
                        )}
                        {logo && (
                            <div className={styles.logoWrap}>
                                <Image src={logo} alt={serviceName} width={36} height={36} className={styles.logo} />
                            </div>
                        )}
                        <div className={styles.texts}>
                            <Text fw={700} size="sm">{(cardName || serviceName).length > 15 ? (cardName || serviceName).slice(0, 15) + '...' : (cardName || serviceName)}</Text>
                            {event ? <Text size="xs" color="dimmed">{event.length > 15 ? event.slice(0, 15) + '...' : event}</Text> : null}
                        </div>
                    </div>

                    <Menu width={180} withArrow>
                        <Menu.Target>
                            <ActionIcon variant="subtle">
                                <IconDotsVertical size={18} />
                            </ActionIcon>
                        </Menu.Target>
                        <Menu.Dropdown>
                            {onEdit && <Menu.Item leftSection={<IconEdit size={16} />} onClick={onEdit}>Edit</Menu.Item>}
                            {onDuplicate && <Menu.Item leftSection={<IconClipboardCopy size={16} />} onClick={onDuplicate}>Duplicate</Menu.Item>}
                            {onRemove && <Menu.Item color="red" leftSection={<IconTrash size={16} />} onClick={onRemove}>Delete</Menu.Item>}
                        </Menu.Dropdown>
                    </Menu>
                </div>
                {linkInfo && (
                    <div style={{ marginTop: 8, padding: 8, backgroundColor: '#f8f9fa', borderRadius: 4 }}>
                        {linkInfo.type === 'chain' && linkInfo.sourceService && (
                            <Badge size="xs" color="blue" variant="light" style={{ marginRight: 4 }}>
                                Chain from {linkInfo.sourceService}
                            </Badge>
                        )}
                        {linkInfo.type === 'conditional' && linkInfo.sourceService && (
                            <Badge size="xs" color="yellow" variant="light" style={{ marginRight: 4 }}>
                                Conditional from {linkInfo.sourceService}
                            </Badge>
                        )}
                        {linkInfo.type === 'parallel' && linkInfo.sourceService && (
                            <Badge size="xs" color="green" variant="light" style={{ marginRight: 4 }}>
                                Parallel with {linkInfo.sourceService}
                            </Badge>
                        )}
                        {linkInfo.type === 'sequential' && linkInfo.sourceService && (
                            <Badge size="xs" color="purple" variant="light" style={{ marginRight: 4 }}>
                                Sequential from {linkInfo.sourceService}
                            </Badge>
                        )}
                        {linkInfo.hasChainTarget && (
                            <Badge size="xs" color="cyan" variant="light">
                                Has chain target
                            </Badge>
                        )}
                    </div>
                )}
            </div>
        </Card>
    );
}
