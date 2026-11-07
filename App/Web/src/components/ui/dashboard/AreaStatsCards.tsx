import { SimpleGrid, Paper, Text, Group } from '@mantine/core';

interface AreaStatsCardsProps {
  areaStats: Array<{
    title: string;
    value: string;
    icon: React.ComponentType<{ size?: number }>;
  }>;
}

export function AreaStatsCards({ areaStats }: AreaStatsCardsProps) {
  return (
    <SimpleGrid cols={{ base: 1, xs: 2, md: 4 }} mb="lg">
      {areaStats.map((stat) => {
        const Icon = stat.icon;
        return (
          <Paper withBorder p="md" radius="md" key={stat.title}>
            <Group justify="space-between">
              <Text size="xs" c="dimmed" tt="uppercase">
                {stat.title}
              </Text>
              <Icon size={20} />
            </Group>
            <Group align="flex-end" gap="xs" mt={25}>
              <Text size="xl" fw={700}>
                {stat.value}
              </Text>
            </Group>
          </Paper>
        );
      })}
    </SimpleGrid>
  );
}