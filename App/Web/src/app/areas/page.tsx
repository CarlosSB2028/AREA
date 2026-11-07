'use client';
import React, { useState, useEffect, useMemo } from 'react';
import AreaListCard from '../../components/ui/areaList/AreaListCard';
import ServiceFilter from '../../components/ui/areaList/ServiceFilter';
import { IconPlus } from '@tabler/icons-react';
import { Title, TextInput, Select, Button, Group, Container, Stack, Divider, Pagination, Text } from '@mantine/core';
import { useRouter } from 'next/navigation';
import { getAreas, getServices, deleteAreabyId, runAreaById, getAreasBackend } from '../../services/areasService';
import { enableDisableArea } from '../../services/adminService';
import { Area, Service, BackendArea } from '../../types';
import { getCurrentUser } from '@/services/authService';

const isBackendArea = (area: Area | BackendArea): area is BackendArea => {
    return 'actions' in area && 'reactions' in area;
};

const getAreaStatus = (area: Area | BackendArea): string => {
    if (isBackendArea(area)) {
        return area.enabled ? 'active' : 'inactive';
    }
    return area.status;
};

const getAreaServices = (area: Area | BackendArea): string[] => {
    if (isBackendArea(area)) {
        return [];
    }
    return area.services;
};

export default function AreaListPage() {
    const [searchName, setSearchName] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [selectedServices, setSelectedServices] = useState<string[]>([]);
    const [page, setPage] = useState(1);
    const router = useRouter();
    const [areas, setAreas] = useState<(Area | BackendArea)[]>([]);
    const [services, setServices] = useState<Service[]>([]);

    useEffect(() => {
        const loadData = async () => {
            try {
                const [areasData, servicesData] = await Promise.all([getAreasBackend(), getServices()]);
                setAreas(areasData);
                const transformedServices = servicesData.map(service => ({
                    id: service.id,
                    name: service.name,
                    logo: service.iconLightUrl || service.iconDarkUrl || '/file.svg'
                }));
                setServices(transformedServices);
            } catch (error) {
                console.log('Backend mode failed, falling back to legacy mode:', error);
                try {
                    const areasData = await getAreas();
                    setAreas(areasData);
                    setServices([
                        { id: '1', name: 'GitHub', logo: '/github.svg' },
                        { id: '2', name: 'Gmail', logo: '/gmail.svg' },
                        { id: '3', name: 'Slack', logo: '/slack.svg' }
                    ]);
                } catch (legacyError) {
                    console.error('Both API modes failed:', legacyError);
                }
            }
        };
        const checkLogin = async () => {
            try {
                const user = await getCurrentUser();
                if (!user) {
                    await router.replace('/login');
                }
            } catch (err) {
                console.error('Auth check failed:', err);
                await router.replace('/login');
            }
        };
        checkLogin();
        loadData();
    }, [router]);

    const filteredAreas = useMemo(() => {
        const areasArray = Array.isArray(areas) ? areas : [];
        return areasArray.filter(area => {
            if (searchName && !area.name.toLowerCase().includes(searchName.toLowerCase())) return false;
            if (statusFilter && getAreaStatus(area) !== statusFilter) return false;
            if (selectedServices.length > 0 && !selectedServices.some(s => getAreaServices(area).includes(s))) return false;
            return true;
        });
    }, [searchName, statusFilter, selectedServices, areas]);

    const itemsPerPage = 5;
    const totalPages = Math.ceil(filteredAreas.length / itemsPerPage);
    const paginatedAreas = filteredAreas.slice((page - 1) * itemsPerPage, page * itemsPerPage);

    useEffect(() => {
        if (page > totalPages && totalPages > 0) {
            setPage(totalPages);
        } else if (totalPages === 0) {
            setPage(1);
        }
    }, [filteredAreas.length, totalPages, page]);

    const clearFilters = () => {
        setSearchName('');
        setStatusFilter('');
        setSelectedServices([]);
        setPage(1);
    };

    const handleDelete = (id: string | number) => {
        const areaId = typeof id === 'string' ? id : id.toString();
        deleteAreabyId(areaId).then(() => {
            const areasArray = Array.isArray(areas) ? areas : [];
            const updatedAreas = areasArray.filter(area => area.id !== areaId);
            setAreas(updatedAreas);
        });
    };

    const handleRun = (id: string | number) => {
        const areaId = typeof id === 'string' ? id : id.toString();
        runAreaById(areaId);
    };

    const handleEnableDisable = async (id: string | number, enable: boolean) => {
        const areaId = typeof id === 'string' ? id : id.toString();
        try {
            await enableDisableArea(areaId, enable);
            const areasData = await getAreasBackend();
            setAreas(areasData);
        } catch (error) {
            console.error('Enable/Disable failed:', error);
        }
    };

    return (
        <main>
        <Container size="lg" py="xl">
            <Stack gap="md">
                <Group justify="space-between">
                    <Title order={1}>Areas</Title>
                    <Button
                        leftSection={<IconPlus size={18} />}
                        onClick={() => router.push('/areas/create-simple')}
                    >
                        Create New Area
                    </Button>
                </Group>
                <Divider />
                <Group grow>
                    <TextInput
                        placeholder="Search by name..."
                        value={searchName}
                        onChange={(event) => setSearchName(event.currentTarget.value)}
                    />
                    <Select
                        placeholder="Filter by status"
                        data={[
                            { value: '', label: 'All' },
                            { value: 'active', label: 'Active' },
                            { value: 'inactive', label: 'Inactive' },
                        ]}
                        value={statusFilter}
                        onChange={(value) => setStatusFilter(value || '')}
                    />
                    <div style={{ flex: 1 }}>
                        <ServiceFilter
                            services={services}
                            value={selectedServices}
                            onChange={setSelectedServices}
                        />
                    </div>
                    <Button onClick={clearFilters} variant="outline" color="blue">Clear Filters</Button>
                </Group>
                <AreaListCard areas={paginatedAreas} services={services} onDelete={handleDelete} onRun={handleRun} onEnableDisable={handleEnableDisable} />
                {filteredAreas.length === 0 && (
                    <Text ta="center" c="black">No areas found.</Text>
                )}
                {totalPages > 1 && (
                    <Group justify="center" mt="md">
                        <Pagination
                            total={totalPages}
                            value={page}
                            onChange={setPage}
                            radius="xl"
                        />
                    </Group>
                )}
            </Stack>
        </Container>
        </main>
    );
}