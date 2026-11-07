"use client";
import { IconGauge, IconUser , IconAutomation } from '@tabler/icons-react';
import {
  Card,
  Container,
  SimpleGrid,
  Text,
  Title,
  useMantineTheme,
} from '@mantine/core';
import classes from './FeaturesCards.module.css';

const mockdata = [
  {
    title: 'Automate your workflow',
    description:
      'Connect actions and reactions across your favorite services. When something happens in one app, trigger automated responses in another.',
    icon: IconAutomation,
  },
  {
    title: 'Privacy focused',
    description:
      'Your data stays secure and private. We never share your information with third parties. You maintain complete control over your automations.',
    icon: IconUser,
  },
  {
    title: 'Real-time synchronization',
    description:
      'Lightning-fast execution of your automations. AREA monitors your services and triggers actions instantly when conditions are met.',
    icon: IconGauge,
  },
];

export function FeaturesCards() {
  const theme = useMantineTheme();
  const features = mockdata.map((feature) => (
    <Card key={feature.title} shadow="md" radius="md" className={classes.card} padding="xl">
      <feature.icon size={50} stroke={1.5} color={theme.colors.blue[6]} />
      <Text fz="lg" fw={500} className={classes.cardTitle} mt="md">
        {feature.title}
      </Text>
      <Text fz="sm" c="dark.6" mt="sm">
        {feature.description}
      </Text>
    </Card>
  ));

  return (
    <Container size="lg" py="xl">

      <Title order={2} className={classes.title} ta="center" mt="sm">
        Powerful automation made simple
      </Title>

      <Text c="dark.6" className={classes.description} ta="center" mt="md">
        AREA empowers you to create smart automations by connecting different services together. 
        Set up triggers and actions to streamline your digital life effortlessly.
      </Text>

      <SimpleGrid cols={{ base: 1, md: 3 }} spacing="xl" mt={50}>
        {features}
      </SimpleGrid>
    </Container>
  );
}