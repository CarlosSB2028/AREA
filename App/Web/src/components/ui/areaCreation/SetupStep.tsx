import { Button, Stack, TextInput, Input, InputBase, Combobox, useCombobox, Text } from '@mantine/core';
import { useEffect, useState } from 'react';
import Image from 'next/image';
import AccountCardServices from './acountCardServices';
import { getActionsByServiceKey } from '../../../services/areasService';
import { Action, ServiceData, SetupStepProps } from '../../../types';
import ModalServicesSelection from './ModalServicesSelection';
import { getServiceConnectionStatus, initiateServiceConnection, ServiceConnectionStatus } from '../../../services/serviceConnectionService';

export default function SetupStep({ service, onServiceChange }: Omit<SetupStepProps, 'onRemove'>) {

    const combobox = useCombobox({
        onDropdownClose: () => combobox.resetSelectedOption(),
    });
    const [actions, setActions] = useState<Action[]>([]);
    const [value, setValue] = useState<string | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [serviceConnectionStatus, setServiceConnectionStatus] = useState<ServiceConnectionStatus | null>(null);
    const [loadingConnection, setLoadingConnection] = useState(false);

    useEffect(() => {
        if (service.serviceKey) {
            setLoadingConnection(true);
            getServiceConnectionStatus(service.serviceKey)
                .then((status) => {
                    setServiceConnectionStatus(status);
                })
                .catch((error) => {
                    console.error('Error fetching service connection status:', error);
                    setServiceConnectionStatus(null);
                })
                .finally(() => {
                    setLoadingConnection(false);
                });
        } else {
            setServiceConnectionStatus(null);
        }
    }, [service.serviceKey]);

    useEffect(() => {
        const handleFocus = () => {
            if (service.serviceKey && serviceConnectionStatus && !serviceConnectionStatus.isConnected) {
                getServiceConnectionStatus(service.serviceKey)
                    .then((status) => {
                        setServiceConnectionStatus(status);
                    })
                    .catch((error) => {
                        console.error('Error refreshing service connection status:', error);
                    });
            }
        };

        window.addEventListener('focus', handleFocus);
        return () => window.removeEventListener('focus', handleFocus);
    }, [service.serviceKey, serviceConnectionStatus]);

    const handleServiceConnection = async () => {
        if (!service.serviceKey) return;
        try {
            setLoadingConnection(true);
            await initiateServiceConnection(service.serviceKey, window.location.href);
        } catch (error) {
            console.error('Error initiating service connection:', error);
        } finally {
            setLoadingConnection(false);
        }
    };

    useEffect(() => {
        console.log('SetupStep useEffect - service:', {
            serviceName: service.serviceName,
            serviceKey: service.serviceKey,
            serviceId: service.serviceId
        });
        if (service.serviceKey) {
            console.log('Fetching actions for service key:', service.serviceKey);
            getActionsByServiceKey(service.serviceKey).then((fetchedActions) => {
                console.log('getActionsByServiceKey returned:', fetchedActions);
                setActions(fetchedActions);
            }).catch((error) => {
                console.error('Error fetching actions for service:', service.serviceKey, error);
                setActions([]);
            });
        } else {
            console.warn('No service key available for service:', service.serviceName);
            setActions([]);
        }
    }, [service.serviceKey, service.serviceName, service.serviceId]);

    useEffect(() => {
        console.log('SetupStep setValue useEffect - checking for existing action:', {
            actionsLength: actions.length,
            actionId: service.actionId,
            actionDefinitionId: service.actionDefinitionId
        });
        if (actions.length > 0 && service.actionDefinitionId) {
            const actionById = actions.find(a => a.id === service.actionDefinitionId);
            console.log('Found action by actionDefinitionId:', actionById);
            if (actionById) {
                setValue(actionById.id);
                console.log('Set value to:', actionById.id);
            } else {
                console.warn('Action not found with actionDefinitionId:', service.actionDefinitionId);
                setValue(null);
            }
        } else {
            console.log('No actions or no actionDefinitionId, setting value to null');
            setValue(null);
        }
    }, [service.actionId, service.actionDefinitionId, actions]);

    const options = actions.map((action) => (
        <Combobox.Option value={action.id.toString()} key={action.id}>
            <Stack gap={0}>
                <Text size="sm" fw={500}>{action.name}</Text>
                <Text size="xs" c="dimmed">{action.description}</Text>
            </Stack>
        </Combobox.Option>
    ));

    return (
        <>
            <Stack gap="xs">
                <Text size="sm" fw={500}>Choose a service <span style={{color: 'red'}}>*</span></Text>
                <Button
                    variant="outline"
                    fullWidth
                    onClick={() => setIsModalOpen(true)}
                    style={{ display: 'flex', alignItems: 'center', gap: 8 }}
                >
                { service.logo && service.serviceName ? (
                    <>
                        <Image src={service.logo} alt={service.serviceName} width={20} height={20} style={{ objectFit: 'contain' }} />
                        {service.serviceName}
                    </>
                ) : (
                    <span>Select a service</span>
                )}
                </Button>
                <TextInput
                    label="Card name"
                    placeholder="e.g., 'When I receive an email...'"
                    value={service.cardName}
                    onChange={(e) => onServiceChange?.({ ...service, cardName: e.target.value })}
                />
                <Combobox
                    store={combobox}
                    onOptionSubmit={(val) => {
                        const selectedAction = actions.find(a => a.id === val);
                        setValue(val);
                        if (selectedAction) {
                            console.log('Selected action:', selectedAction);
                            onServiceChange?.({
                                ...service,
                                event: selectedAction.name,
                                cardName: service.cardName || selectedAction.name,
                                actionDefinitionId: selectedAction.id,
                                selectedAction: undefined
                            });
                        }
                        combobox.closeDropdown();
                    }}
                >
                    <Combobox.Target>
                        <InputBase
                            component="button"
                            type="button"
                            pointer
                            label="Choose an action"
                            required={true}
                            rightSection={<Combobox.Chevron />}
                            rightSectionPointerEvents="none"
                            onClick={() => combobox.toggleDropdown()}
                        >
                            {value ? actions.find(a => a.id.toString() === value)?.name : <Input.Placeholder>Select an action</Input.Placeholder>}
                        </InputBase>
                    </Combobox.Target>

                    <Combobox.Dropdown>
                        <Combobox.Options mah={500} style={{ overflowY: 'auto' }}>{options}</Combobox.Options>
                    </Combobox.Dropdown>
                </Combobox>
                <Text size="sm" fw={500}>Account <span style={{color: 'red'}}>*</span></Text>
                {loadingConnection ? (
                    <div style={{ padding: '20px', textAlign: 'center' }}>
                        <Text size="sm" c="dimmed">Loading connection status...</Text>
                    </div>
                ) : (
                    <AccountCardServices
                        logo={serviceConnectionStatus?.avatarUrl || '/file.svg'}
                        accountName={serviceConnectionStatus?.userName || 'No account connected'}
                        email={serviceConnectionStatus?.userEmail || ''}
                        isLoggedIn={serviceConnectionStatus?.isConnected || false}
                        onView={() => console.log('View account')}
                        onChange={() => console.log('Change account')}
                        onDelete={() => console.log('Delete account')}
                        onConnect={handleServiceConnection}
                    />
                )}
            </Stack>
            <ModalServicesSelection
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSelect={(selectedService) => {
                    let logoUrl = selectedService.iconLightUrl || selectedService.iconDarkUrl;
                    if (!logoUrl && selectedService.key === 'github') {
                        logoUrl = 'https://upload.wikimedia.org/wikipedia/commons/9/91/Octicons-mark-github.svg';
                    }
                    logoUrl = logoUrl || '/file.svg';
                    const newServiceData: ServiceData = {
                        ...service,
                        logo: logoUrl,
                        serviceName: selectedService.name,
                        serviceKey: selectedService.key,
                        serviceId: selectedService.id,
                        actionId: 0,
                        event: '',
                        cardName: '',
                        fields: {},
                    };
                    onServiceChange?.(newServiceData);
                    setIsModalOpen(false);
                }}
            />
        </>
    );
}
