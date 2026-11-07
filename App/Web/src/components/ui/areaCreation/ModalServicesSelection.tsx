import { Modal, Button, TextInput, Space, Alert, Loader, Center } from '@mantine/core';
import { useState, useEffect } from 'react';
import { IconAlertCircle } from '@tabler/icons-react';
import Image from 'next/image';
import { getServices } from '../../../services/areasService';
import { BackendService, ModalServicesSelectionProps } from '../../../types';

export default function ModalServicesSelection({ isOpen, onClose, onSelect }: ModalServicesSelectionProps) {
    const [services, setServices] = useState<BackendService[]>([]);
    const [searchName, setSearchName] = useState<string>('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (isOpen) {
            setIsLoading(true);
            setError(null);
            getServices().then((fetchedServices) => {
                setServices(fetchedServices);
            }).catch((error) => {
                console.error('Error fetching services:', error);
                setError('Failed to load services. Please try again.');
                setServices([]);
            }).finally(() => {
                setIsLoading(false);
            });
        }
    }, [isOpen]);

    const filteredServices = services.filter(service =>
        service.name.toLowerCase().includes(searchName.toLowerCase())
    );

    return (
        <Modal opened={isOpen} onClose={onClose} title="Select a Service" size="lg">
            <TextInput
                placeholder="Search by name..."
                value={searchName}
                onChange={(event) => setSearchName(event.currentTarget.value)}
                mb="md"
            />

            {error && (
                <Alert icon={<IconAlertCircle size="1rem" />} color="red" mb="md">
                    {error}
                </Alert>
            )}

            {isLoading ? (
                <Center py="xl">
                    <Loader size="lg" />
                </Center>
            ) : (
                <div style={{ maxHeight: '500px', overflowY: 'auto' }}>
                    {filteredServices.length === 0 && !isLoading && (
                        <Center py="xl">
                            <div style={{ textAlign: 'center' }}>
                                {searchName ? 'No services found matching your search.' : 'No services available.'}
                            </div>
                        </Center>
                    )}

                    {filteredServices.map((service) => (
                        <div key={service.id} style={{ marginBottom: '8px', paddingRight: '20px', paddingLeft: '20px' }}>
                            <Button
                                variant="outline"
                                fullWidth
                                mb="sm"
                                onClick={() => {
                                    onSelect(service);
                                    onClose();
                                }}
                                style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-start' }}
                            >
                                {(service.iconLightUrl || service.iconDarkUrl) && (
                                    <Image
                                        src={service.iconLightUrl || service.iconDarkUrl || '/file.svg'}
                                        alt={service.name}
                                        width={20}
                                        height={20}
                                        style={{ objectFit: 'contain' }}
                                    />
                                )}
                                <Space w="8" />
                                {service.name}
                            </Button>
                        </div>
                    ))}
                </div>
            )}
        </Modal>
    );
}