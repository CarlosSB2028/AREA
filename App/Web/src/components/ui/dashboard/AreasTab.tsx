'use client';

import { useState, useEffect } from 'react';
import { Grid, TextInput, Combobox, useCombobox, Space } from '@mantine/core';
import { AreaStatsCards } from './AreaStatsCards';
import { AreasTable } from './AreasTable';
import { AreaRunsTable } from './AreaRunsTable';
import { getAreas, getAreaRuns, getAreaStats , deleteArea, enableDisableArea} from '../../../services/adminService';

interface Area {
  id: number;
  name: string;
  description: string;
  lastRun: string;
  status: string;
  user: string;
  enabled: boolean;
}

interface AreaRun {
  id: number;
  areaName: string;
  user: string;
  timestamp: string;
  status: string;
  duration: string;
}

interface AreaStat {
  title: string;
  value: string;
  icon: React.ComponentType<{ size?: number }>;
}

export function AreasTab() {
  const [areaStats, setAreaStats] = useState<AreaStat[]>([]);
  const [areas, setAreas] = useState<Area[]>([]);
  const [areaRuns, setAreaRuns] = useState<AreaRun[]>([]);
  const [searchAreas, setSearchAreas] = useState('');
  const [selectedAreaStatus, setSelectedAreaStatus] = useState<string | null>(null);
  const [searchAreaRuns, setSearchAreaRuns] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string | null>(null);

  const comboboxArea = useCombobox({
    onDropdownClose: () => comboboxArea.resetSelectedOption(),
  });

  const comboboxStatus = useCombobox({
    onDropdownClose: () => comboboxStatus.resetSelectedOption(),
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const areasData = await getAreas();
        setAreas(Array.isArray(areasData) ? areasData : []);

        const areaRunsData = await getAreaRuns();
        setAreaRuns(Array.isArray(areaRunsData) ? areaRunsData : []);

        const areaStatsData = await getAreaStats();
        setAreaStats(Array.isArray(areaStatsData) ? areaStatsData : []);
      } catch (error) {
        console.error('Error fetching areas data:', error);
        setAreas([]);
        setAreaRuns([]);
        setAreaStats([]);
      }
    };
    fetchData();
  }, []);

  const comboboxValueAreaStatus = ['', 'success', 'failed', 'in progress'];
  const comboboxValueStatus = ['', 'success', 'failed', 'in progress'];

  const filteredAreas = areas.filter(area =>
    (area.name.toLowerCase().includes(searchAreas.toLowerCase())  ||
    area.user.toLowerCase().includes(searchAreas.toLowerCase())) &&
    (selectedAreaStatus ? area.status === selectedAreaStatus : true)
  );

  const filteredAreaRuns = areaRuns.filter(run =>
    (run.areaName.toLowerCase().includes(searchAreaRuns.toLowerCase()) ||
     run.user.toLowerCase().includes(searchAreaRuns.toLowerCase())) &&
    (selectedStatus ? run.status === selectedStatus : true)
  );

  const handleDeleteArea = (area: Area) => {
    setAreas(prevAreas => prevAreas.filter(a => a.id !== area.id));
    deleteArea(area.id.toString());
  }

  const handleToggleArea = (area: Area, enabled: boolean) => {
    setAreas(prevAreas => prevAreas.map(a => a.id === area.id ? { ...a, enabled } : a));
    enableDisableArea(area.id.toString(), enabled);
  }

  return (
    <>
      <AreaStatsCards areaStats={areaStats} />
      <Space h="md" />
      <Grid>
        <Grid.Col span={12}>
          <Grid>
            <Grid.Col span={{ base: 8, md: 10 }}>
              <TextInput
                placeholder="Search areas by name or by user..."
                value={searchAreas}
                onChange={(event) => setSearchAreas(event.currentTarget.value)}
              />
            </Grid.Col>
            <Grid.Col span={{ base: 4, md: 2 }}>
              <Combobox
                store={comboboxArea}
                onOptionSubmit={(value) => {
                  setSelectedAreaStatus(value);
                  comboboxArea.closeDropdown();
                }}
              >
                <Combobox.Target>
                  <TextInput
                    placeholder="Select status"
                    value={selectedAreaStatus || ''}
                    readOnly
                    rightSection={<Combobox.Chevron />}
                    onClick={() => comboboxArea.toggleDropdown()}
                  />
                </Combobox.Target>

                <Combobox.Dropdown>
                  <Combobox.Options>
                    {comboboxValueAreaStatus.map(status => (
                      <Combobox.Option key={status} value={status}>
                        {status === '' ? 'All' : status}
                      </Combobox.Option>
                    ))}
                  </Combobox.Options>
                </Combobox.Dropdown>
              </Combobox>
            </Grid.Col>
            <Grid.Col span={12}>
              <AreasTable areas={filteredAreas} onDeleteArea={handleDeleteArea} onToggleArea={handleToggleArea} />
            </Grid.Col>
          </Grid>
        </Grid.Col>
      </Grid>
      <Space h="md" />
      <Grid>
        <Grid.Col span={12}>
          <Grid>
            <Grid.Col span={{ base: 8, md: 10 }}>
              <TextInput
                placeholder="Search area runs by name or user..."
                value={searchAreaRuns}
                onChange={(event) => setSearchAreaRuns(event.currentTarget.value)}
              />
            </Grid.Col>
            <Grid.Col span={{ base: 4, md: 2 }}>
              <Combobox
                store={comboboxStatus}
                onOptionSubmit={(value) => {
                  setSelectedStatus(value);
                  comboboxStatus.closeDropdown();
                }}
              >
                <Combobox.Target>
                  <TextInput
                    placeholder="Select status"
                    value={selectedStatus || ''}
                    readOnly
                    rightSection={<Combobox.Chevron />}
                    onClick={() => comboboxStatus.toggleDropdown()}
                  />
                </Combobox.Target>

                <Combobox.Dropdown>
                  <Combobox.Options>
                    {comboboxValueStatus.map(status => (
                      <Combobox.Option key={status} value={status}>
                        {status === '' ? 'All' : status}
                      </Combobox.Option>
                    ))}
                  </Combobox.Options>
                </Combobox.Dropdown>
              </Combobox>
            </Grid.Col>
            <Grid.Col span={12}>
              <AreaRunsTable areaRuns={filteredAreaRuns} />
            </Grid.Col>
          </Grid>
        </Grid.Col>
      </Grid>
    </>
  );
}