'use client';

import { useState, useEffect } from 'react';
import { Grid, Card, Title, TextInput } from '@mantine/core';
import { BarChart } from '@mantine/charts';
import { ServicesTable } from './ServicesTable';
import { getServices, getServicesBarData, deleteService } from '../../../services/adminService';

interface Service {
  id: number;
  name: string;
  logo: string;
}

interface ServiceBarData {
  service: string;
  usage: number;
}

export function ServicesTab() {
  const [servicesBarData, setServicesBarData] = useState<ServiceBarData[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [searchServices, setSearchServices] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const servicesData = await getServices();
        setServices(Array.isArray(servicesData) ? servicesData : []);

        const servicesBarDataResult = await getServicesBarData();
        setServicesBarData(Array.isArray(servicesBarDataResult) ? servicesBarDataResult : []);
      } catch (error) {
        console.error('Error fetching services data:', error);
        setServices([]);
        setServicesBarData([]);
      }
    };
    fetchData();
  }, []);

  const filteredServices = services.filter(service =>
    service.name.toLowerCase().includes(searchServices.toLowerCase())
  );

  const handleDeleteService = (service: Service) => {
    setServices(services.filter(s => s.id !== service.id));
    deleteService(service.id.toString());
  };

  return (
    <Grid>
      <Grid.Col span={{ base: 12, md: 6 }}>
        <Card withBorder shadow="sm" p="md" radius="md">
          <Title order={3} mb="xs">Service Usage</Title>
          <BarChart
            h={300}
            data={servicesBarData}
            dataKey="service"
            series={[{ name: 'usage', color: 'blue' }]}
            gridAxis="y"
          />
        </Card>
      </Grid.Col>
      <Grid.Col span={{ base: 12, md: 6 }}>
        <Grid>
          <Grid.Col span={12}>
            <TextInput
              placeholder="Search services by name..."
              value={searchServices}
              onChange={(event) => setSearchServices(event.currentTarget.value)}
            />
          </Grid.Col>
          <Grid.Col span={12}>
            <ServicesTable services={filteredServices} onDeleteService={handleDeleteService} />
          </Grid.Col>
        </Grid>
      </Grid.Col>
    </Grid>
  );
}