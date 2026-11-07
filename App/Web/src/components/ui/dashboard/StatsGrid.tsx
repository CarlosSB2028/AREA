import {
  IconArrowDownRight,
  IconArrowUpRight,
  IconCoin,
  IconDiscount2,
  IconReceipt2,
  IconUserPlus,
} from '@tabler/icons-react';
import { Group, Paper, SimpleGrid, Text } from '@mantine/core';

const icons = {
  user: IconUserPlus,
  discount: IconDiscount2,
  receipt: IconReceipt2,
  coin: IconCoin,
};

interface StatsGridProps {
  title: string;
  icon: keyof typeof icons;
  value: string;
  diff: number;
}

export function StatsGrid({ data }: { data: StatsGridProps[] }) {
  const totalCards = 4;
  const stats = Array.from({ length: totalCards }, (_, index) => {
    const stat = data[index];
    if (stat) {
      const Icon = icons[stat.icon];
      const DiffIcon = stat.diff > 0 ? IconArrowUpRight : IconArrowDownRight;

      return (
        <Paper withBorder p="md" radius="md" key={stat.title}>
          <Group justify="space-between">
            <Text size="xs" c="dimmed" tt="uppercase">
              {stat.title}
            </Text>
            <Icon />
          </Group>

          <Group align="flex-end" gap="xs" mt={25}>
            <Text size="xl" fw={700}>
              {stat.value}
            </Text>
            <Text c={stat.diff > 0 ? 'teal' : 'red'} fz="sm" fw={500}>
              <span>{stat.diff}%</span>
              <DiffIcon size={16} stroke={1.5} />
            </Text>
          </Group>

          <Text fz="xs" c="dimmed" mt={7}>
            Compared to previous month
          </Text>
        </Paper>
      );
    } else {
      return (
        <Paper withBorder p="md" radius="md" key={`empty-${index}`}>
          <Group justify="space-between">
            <Text size="xs" c="dimmed" tt="uppercase">
            </Text>
          </Group>

          <Group align="flex-end" gap="xs" mt={25}>
            <Text size="xl" fw={700}>
            </Text>
          </Group>
          <Text fz="xs" c="dimmed" mt={7}>
          </Text>
        </Paper>
      );
    }
  });
  return (
    <div >
      <SimpleGrid cols={{ base: 1, xs: 2, md: 4 }}>{stats}</SimpleGrid>
    </div>
  );
}