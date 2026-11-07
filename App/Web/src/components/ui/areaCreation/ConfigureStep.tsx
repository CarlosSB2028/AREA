import { TextInput, NumberInput, Select, Stack, Button, Group, ActionIcon, Alert, Textarea } from '@mantine/core';
import { DatePickerInput, TimeInput, DateTimePicker } from '@mantine/dates';
import { useState, useEffect, useRef } from 'react';
import { IconPlus, IconTrash, IconKey, IconCheck, IconClock, IconCalendar } from '@tabler/icons-react';
import { ConfigureStepProps, FieldData, Action } from '../../../types';
import { getActionDefinitionById, getActionFieldsFromActionDefinition } from '../../../services/areasService';
import { hasValidToken, storeServiceToken } from '../../../services/serviceTokenService';

export default function ConfigureStep({ service, onFieldsChange }: ConfigureStepProps) {
    const [formValues, setFormValues] = useState<Record<string, unknown>>({});
    const [data, setData] = useState<FieldData[]>([]);
    const [serviceTokens, setServiceTokens] = useState<Record<string, boolean>>({});
    const [isInitialized, setIsInitialized] = useState(false);

    const onFieldsChangeRef = useRef(onFieldsChange);

    useEffect(() => {
        onFieldsChangeRef.current = onFieldsChange;
    }, [onFieldsChange]);

    useEffect(() => {
        console.log('ConfigureStep useEffect triggered, actionDefinitionId:', service.actionDefinitionId);
        if (service.actionDefinitionId) {
            console.log('Fetching action definition for ID:', service.actionDefinitionId);
            getActionDefinitionById(service.actionDefinitionId).then((actionDef) => {
                console.log('Received action definition:', actionDef);
                const action: Action = {
                    id: actionDef.id,
                    serviceId: actionDef.serviceId,
                    serviceKey: actionDef.serviceKey,
                    serviceName: actionDef.serviceName,
                    key: actionDef.key,
                    name: actionDef.name,
                    description: actionDef.description,
                    inputSchema: actionDef.inputSchema as Action['inputSchema'],
                    outputSchema: actionDef.outputSchema,
                    isEventCapable: actionDef.isEventCapable,
                    isExecutable: actionDef.isExecutable,
                    version: actionDef.version,
                    fields: {}
                };
                const fields = getActionFieldsFromActionDefinition(action);
                setData(fields);

                setIsInitialized(false);

                if (actionDef.serviceKey) {
                    checkServiceToken(actionDef.serviceKey);
                }
            }).catch((error) => {
                console.error('Error fetching action definition:', error);
                setData([]);
            });
        } else {
            setData([]);
        }
    }, [service.actionDefinitionId]);

    const checkServiceToken = async (serviceKey: string) => {
        try {
            const tokenExists = await hasValidToken(serviceKey);
            setServiceTokens(prev => ({
                ...prev,
                [serviceKey]: tokenExists
            }));
        } catch (error) {
            console.error('Error checking service token:', error);
            setServiceTokens(prev => ({
                ...prev,
                [serviceKey]: false
            }));
        }
    };

    const handleStoreToken = async (serviceKey: string, token: string) => {
        try {
            await storeServiceToken({
                serviceKey,
                accessToken: token
            });
            setServiceTokens(prev => ({
                ...prev,
                [serviceKey]: true
            }));
        } catch (error) {
            console.error('Error storing service token:', error);
        }
    };

    useEffect(() => {
        if (service.actionDefinitionId && !isInitialized && service.fields && Object.keys(service.fields).length > 0) {
            setFormValues(service.fields);
            setIsInitialized(true);
        }
    }, [service.actionDefinitionId, service.fields, service, isInitialized]);

    const handleChange = (name: string, value: unknown) => {
        setFormValues((prev) => {
            const newFormValues = { ...prev, [name]: value };
            return newFormValues;
        });
    };

    const handleArrayChange = (name: string, index: number, value: string) => {
        setFormValues((prev) => {
            const currentArray = (prev[name] as string[]) || [];
            const newArray = [...currentArray];
            newArray[index] = value;
            return { ...prev, [name]: newArray };
        });
    };

    const addArrayItem = (name: string) => {
        setFormValues((prev) => {
            const currentArray = (prev[name] as string[]) || [];
            return { ...prev, [name]: [...currentArray, ''] };
        });
    };

    const removeArrayItem = (name: string, index: number) => {
        setFormValues((prev) => {
            const currentArray = (prev[name] as string[]) || [];
            const newArray = currentArray.filter((_, i) => i !== index);
            return { ...prev, [name]: newArray };
        });
    };

    useEffect(() => {
        console.log('ConfigureStep formValues changed, calling onFieldsChange with:', formValues);
        setTimeout(() => onFieldsChangeRef.current?.(formValues), 0);
    }, [formValues]);

    return (
        <Stack gap="md">
            {service.serviceKey && service.serviceName == "GitHub" && (
                <Stack gap="xs">
                    <Alert color="blue" variant="light">
                        <Group>
                            <IconKey size={16} />
                            <div>
                                <strong>Service Token Required</strong>
                                <div>This action requires a {service.serviceName} token to authenticate with the service.</div>
                            </div>
                        </Group>
                    </Alert>
                    <TextInput
                        label={`${service.serviceName} Token`}
                        placeholder={`Enter your ${service.serviceName} access token`}
                        type="password"
                        description={`Please provide your ${service.serviceName} access token to use this action`}
                        onChange={(e) => {
                            const tokenValue = e.target.value;
                            if (tokenValue && service.serviceKey) {
                                handleStoreToken(service.serviceKey, tokenValue);
                                handleChange('accessToken', tokenValue);
                            }
                        }}
                    />
                </Stack>
            )}

            {serviceTokens[service.serviceKey || ''] && (
                <Alert color="green" variant="light">
                    <Group>
                        <IconCheck size={16} />
                        <div>Service token configured for {service.serviceName}</div>
                    </Group>
                </Alert>
            )}

            {data.map((field, index) => {
                const commonProps = {
                    label: field.name.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' '),
                    placeholder: field.placeholder || field.description,
                    required: field.mandatory,
                    description: field.description,
                };

                if (field.default && !(field.name in formValues)) {
                    setTimeout(() => handleChange(field.name, field.default), 0);
                }

                switch (field.type) {
                    case 'text':
                        if (field.name.toLowerCase().includes('description') || field.name.toLowerCase().includes('body')) {
                            return (
                                <Textarea
                                    key={index}
                                    {...commonProps}
                                    value={(formValues[field.name] as string) || ''}
                                    onChange={(e) => handleChange(field.name, e.target.value)}
                                    minLength={field.minLength}
                                    maxLength={field.maxLength}
                                    minRows={3}
                                    autosize
                                />
                            );
                        }
                        return (
                            <TextInput
                                key={index}
                                {...commonProps}
                                value={(formValues[field.name] as string) || ''}
                                onChange={(e) => handleChange(field.name, e.target.value)}
                                minLength={field.minLength}
                                maxLength={field.maxLength}
                            />
                        );

                    case 'email':
                        return (
                            <TextInput
                                key={index}
                                {...commonProps}
                                type="email"
                                value={(formValues[field.name] as string) || ''}
                                onChange={(e) => handleChange(field.name, e.target.value)}
                                minLength={field.minLength}
                                maxLength={field.maxLength}
                            />
                        );

                    case 'number':
                        return (
                            <NumberInput
                                key={index}
                                {...commonProps}
                                value={formValues[field.name] ? Number(formValues[field.name]) : undefined}
                                onChange={(value) => handleChange(field.name, value)}
                                min={field.minimum}
                                max={field.maximum}
                            />
                        );

                    case 'datetime':
                        return (
                            <DateTimePicker
                                key={index}
                                {...commonProps}
                                leftSection={<IconCalendar size={16} />}
                                valueFormat="YYYY-MM-DD HH:mm"
                                value={formValues[field.name] ? new Date(formValues[field.name] as string) : null}
                                onChange={(value) => {
                                    if (value) {
                                        handleChange(field.name, new Date(value).toISOString());
                                    } else {
                                        handleChange(field.name, null);
                                    }
                                }}
                                clearable
                            />
                        );

                    case 'date':
                        return (
                            <DatePickerInput
                                key={index}
                                {...commonProps}
                                leftSection={<IconCalendar size={16} />}
                                valueFormat="YYYY-MM-DD"
                                value={formValues[field.name] ? new Date(formValues[field.name] as string) : null}
                                onChange={(value) => {
                                    if (value) {
                                        const dateStr = new Date(value).toISOString().split('T')[0];
                                        handleChange(field.name, dateStr);
                                    } else {
                                        handleChange(field.name, null);
                                    }
                                }}
                                clearable
                            />
                        );

                    case 'time':
                        return (
                            <TimeInput
                                key={index}
                                {...commonProps}
                                leftSection={<IconClock size={16} />}
                                value={formValues[field.name] as string || ''}
                                onChange={(e) => handleChange(field.name, e.target.value)}
                            />
                        );

                    case 'array':
                        const arrayValue = (formValues[field.name] as string[]) || [''];
                        const isEmailArray = field.items?.format === 'email';

                        return (
                            <Stack key={index} gap="xs">
                                <label style={{ fontSize: '14px', fontWeight: 500 }}>
                                    {field.name.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ') + (field.mandatory ? ' *' : '')}
                                    {field.description && (
                                        <div style={{ fontSize: '12px', color: '#666', fontWeight: 'normal' }}>
                                            {field.description}
                                        </div>
                                    )}
                                </label>
                                {arrayValue.map((item, arrayIndex) => (
                                    <Group key={arrayIndex} gap="xs">
                                        <TextInput
                                            flex={1}
                                            type={isEmailArray ? 'email' : 'text'}
                                            value={item}
                                            placeholder={isEmailArray ? `email@example.com` : `Enter ${field.name} ${arrayIndex + 1}`}
                                            onChange={(e) => handleArrayChange(field.name, arrayIndex, e.target.value)}
                                        />
                                        {arrayValue.length > (field.minItems || 1) && (
                                            <ActionIcon
                                                color="red"
                                                variant="subtle"
                                                onClick={() => removeArrayItem(field.name, arrayIndex)}
                                            >
                                                <IconTrash size={16} />
                                            </ActionIcon>
                                        )}
                                    </Group>
                                ))}
                                <Button
                                    variant="subtle"
                                    size="sm"
                                    leftSection={<IconPlus size={16} />}
                                    onClick={() => addArrayItem(field.name)}
                                >
                                    Add {isEmailArray ? 'Email' : field.name.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                                </Button>
                            </Stack>
                        );

                    case 'dropdown':
                        return (
                            <Select
                                key={index}
                                {...commonProps}
                                value={(formValues[field.name] as string) || ''}
                                onChange={(value) => handleChange(field.name, value)}
                                data={field.options || []}
                                searchable
                                clearable
                            />
                        );

                    default:
                        return null;
                }
            })}
        </Stack>
    );
}
