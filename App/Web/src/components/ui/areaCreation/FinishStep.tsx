import { Text, Button, Alert, Stack } from '@mantine/core';
import { useState } from 'react';
import { IconCheck, IconAlertCircle } from '@tabler/icons-react';
import { FinishStepProps } from '../../../types';

export default function FinishStep({ service }: FinishStepProps) {
    const [isCreating, setIsCreating] = useState(false);
    const [createStatus, setCreateStatus] = useState<'idle' | 'success' | 'error'>('idle');
    const [errorMessage, setErrorMessage] = useState('');

    const handleCreate = async () => {
        setIsCreating(true);
        setCreateStatus('idle');
        setErrorMessage('');

        try {
            console.log('Creating service configuration:', {
                serviceName: service.serviceName,
                serviceKey: service.serviceKey,
                actionId: service.actionId,
                actionDefinitionId: service.actionDefinitionId,
                event: service.event,
                fields: service.fields,
                cardName: service.cardName,
                serviceId: service.serviceId
            });

            await new Promise(resolve => setTimeout(resolve, 1000));
            setCreateStatus('success');
        } catch (error) {
            console.error('Error creating service configuration:', error);
            setCreateStatus('error');
            setErrorMessage(error instanceof Error ? error.message : 'An unknown error occurred');
        } finally {
            setIsCreating(false);
        }
    };

    return (
        <Stack gap="md">
            <Text size="sm">
                Review your service configuration and create it when ready.
            </Text>
            <div style={{ background: '#f8f9fa', padding: '16px', borderRadius: '8px' }}>
                <Text fw={500} size="sm">Service: {service.serviceName}</Text>
                <Text size="sm" c="dimmed">Action ID: {service.actionId}</Text>
                <Text size="sm" c="dimmed">Card Name: {service.cardName}</Text>
                {service.fields && Object.keys(service.fields).length > 0 && (
                    <Text size="sm" c="dimmed">
                        Fields: {Object.keys(service.fields).length} configured
                    </Text>
                )}
            </div>

            {createStatus === 'success' && (
                <Alert icon={<IconCheck size="1rem" />} title="Success!" color="green">
                    Service configuration created successfully!
                </Alert>
            )}

            {createStatus === 'error' && (
                <Alert icon={<IconAlertCircle size="1rem" />} title="Error" color="red">
                    Failed to create service configuration: {errorMessage}
                </Alert>
            )}

            <div style={{ display: 'flex', gap: '12px' }}>
                <Button
                    onClick={handleCreate}
                    loading={isCreating}
                    disabled={createStatus === 'success'}
                    flex={1}
                >
                    {createStatus === 'success' ? 'Created' : 'Create Service'}
                </Button>
            </div>
        </Stack>
    );
}
