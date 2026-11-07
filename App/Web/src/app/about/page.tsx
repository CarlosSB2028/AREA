'use client';

import {
  Container,
  Title,
  Text,
  Card,
  SimpleGrid,
  Group,
  Badge,
  Stack,
  ThemeIcon,
  Timeline,
  Accordion,
  Paper,
  Box,
  List,
  Center,
  Image,
} from '@mantine/core';
import {
  IconRocket,
  IconUsers,
  IconBulb,
  IconTarget,
  IconCode,
  IconWorld,
  IconShield,
  IconCloud,
  IconBrandGithub,
  IconApi,
  IconPlugConnected,
} from '@tabler/icons-react';

export default function AboutPage() {
  const features = [
    {
      icon: IconPlugConnected,
      title: 'Seamless Integration',
      description:
        'Connect multiple services and platforms effortlessly with our intuitive interface and powerful API.',
      color: 'blue',
    },
    {
      icon: IconCloud,
      title: 'Cloud-Based Solution',
      description:
        'Access your automations anywhere, anytime with our secure cloud infrastructure.',
      color: 'cyan',
    },
    {
      icon: IconShield,
      title: 'Secure & Reliable',
      description:
        'Enterprise-grade security with OAuth2 authentication and encrypted data transmission.',
      color: 'green',
    },
    {
      icon: IconApi,
      title: 'RESTful API',
      description:
        'Comprehensive API documentation for developers to build custom integrations and workflows.',
      color: 'violet',
    },
    {
      icon: IconCode,
      title: 'Open Source',
      description:
        'Built with modern technologies and open-source principles, fostering innovation and collaboration.',
      color: 'orange',
    },
    {
      icon: IconWorld,
      title: 'Global Accessibility',
      description:
        'Multi-language support and worldwide service availability for international users.',
      color: 'pink',
    },
  ];

  const teamValues = [
    {
      title: 'Innovation',
      description:
        'We constantly push boundaries to create cutting-edge automation solutions that simplify complex workflows.',
    },
    {
      title: 'User-Centric',
      description:
        'Every feature is designed with our users in mind, ensuring intuitive experiences and powerful functionality.',
    },
    {
      title: 'Transparency',
      description:
        'We believe in open communication, clear documentation, and honest practices in everything we do.',
    },
    {
      title: 'Collaboration',
      description:
        'Working together with our community to build better tools and foster meaningful connections.',
    },
  ];

  return (
    <Container size="lg" py={60}>
      {/* Hero Section */}
      <Stack gap={40}>
        <Box ta="center">
          <Center mb="xl">
            <Image
              src="/area1.png"
              alt="AREA Logo"
              style={{ maxWidth: '150px', height: 'auto' }}
            />
          </Center>
          <Title order={1} size={48} fw={900} mb="md">
            About AREA
          </Title>
          <Text size="xl" c="dark" maw={800} mx="auto">
            Action REAction - The ultimate automation platform that connects your favorite services
            and creates powerful workflows to boost your productivity.
          </Text>
          <Group justify="center" mt="xl">
            <Badge size="lg" variant="gradient" gradient={{ from: 'blue', to: 'cyan' }}>
              Automation Platform
            </Badge>
            <Badge size="lg" variant="gradient" gradient={{ from: 'teal', to: 'lime' }}>
              Open Source
            </Badge>
            <Badge size="lg" variant="gradient" gradient={{ from: 'orange', to: 'red' }}>
              Cloud-Based
            </Badge>
          </Group>
        </Box>

        {/* Mission Section */}
        <Paper shadow="sm" p="xl" radius="md" withBorder>
          <Group align="flex-start" gap="xl">
            <ThemeIcon size={60} radius="md" variant="gradient" gradient={{ from: 'blue', to: 'cyan' }}>
              <IconTarget size={32} />
            </ThemeIcon>
            <Box style={{ flex: 1 }}>
              <Title order={2} mb="md">
                Our Mission
              </Title>
              <Text size="lg" c="dark">
                At AREA, we&apos;re on a mission to democratize automation and make it accessible to everyone.
                We believe that technology should work for you, not the other way around. Our platform
                empowers users to create custom workflows that connect their favorite services, automate
                repetitive tasks, and unlock new possibilities in their digital lives.
              </Text>
            </Box>
          </Group>
        </Paper>

        {/* What is AREA Section */}
        <Box>
          <Title order={2} mb="xl" ta="center">
            What is AREA?
          </Title>
          <Paper shadow="sm" p="xl" radius="md" withBorder>
            <Text size="lg" mb="md">
              AREA stands for <strong>Action REAction</strong> - an innovative automation platform inspired
              by services like IFTTT and Zapier. Our platform allows you to create intelligent connections
              between different web services, applications, and IoT devices.
            </Text>
            <Text size="lg" mb="md">
              With AREA, you can set up <strong>&quot;Actions&quot;</strong> that trigger <strong>&quot;Reactions&quot;</strong>
              across multiple platforms. For example:
            </Text>
            <List spacing="sm" size="lg" mb="md">
              <List.Item>When you receive an email (Action) → Send a notification to Slack (Reaction)</List.Item>
              <List.Item>When you post on Twitter (Action) → Save to Google Drive (Reaction)</List.Item>
              <List.Item>When a new file is uploaded (Action) → Analyze and categorize it (Reaction)</List.Item>
              <List.Item>When weather changes (Action) → Adjust your smart home settings (Reaction)</List.Item>
            </List>
            <Text size="lg">
              The possibilities are endless, and our intuitive interface makes it easy to create complex
              workflows without writing a single line of code.
            </Text>
          </Paper>
        </Box>

        {/* Features Grid */}
        <Box>
          <Title order={2} mb="xl" ta="center">
            Why Choose AREA?
          </Title>
          <SimpleGrid cols={{ base: 1, sm: 2, md: 3 }} spacing="lg">
            {features.map((feature, index) => (
              <Card key={index} shadow="sm" padding="lg" radius="md" withBorder>
                <ThemeIcon
                  size={50}
                  radius="md"
                  variant="gradient"
                  gradient={{ from: feature.color, to: `${feature.color}.7` }}
                  mb="md"
                >
                  <feature.icon size={26} />
                </ThemeIcon>
                <Text fw={600} size="lg" mb="xs">
                  {feature.title}
                </Text>
                <Text size="sm" c="dark">
                  {feature.description}
                </Text>
              </Card>
            ))}
          </SimpleGrid>
        </Box>

        {/* Timeline */}
        <Box>
          <Title order={2} mb="xl" ta="center">
            Our Journey
          </Title>
          <Timeline active={3} bulletSize={24} lineWidth={2}>
            <Timeline.Item
              bullet={<IconBulb size={12} />}
              title="Conception & Planning"
            >
              <Text c="dark" size="sm">
                The idea of AREA was born from a vision to simplify digital workflows and make
                automation accessible to everyone. Our team researched existing solutions and
                identified opportunities for innovation.
              </Text>
            </Timeline.Item>

            <Timeline.Item
              bullet={<IconCode size={12} />}
              title="Development Phase"
            >
              <Text c="dark" size="sm">
                We built AREA using cutting-edge technologies including Next.js, TypeScript, and
                modern cloud infrastructure. Our focus was on creating a scalable, secure, and
                user-friendly platform.
              </Text>
            </Timeline.Item>

            <Timeline.Item
              bullet={<IconRocket size={12} />}
              title="Launch & Growth"
            >
              <Text c="dark" size="sm">
                After rigorous testing and refinement, we launched AREA to the public. The platform
                quickly gained traction among individuals and businesses looking to streamline their
                workflows.
              </Text>
            </Timeline.Item>

            <Timeline.Item
              bullet={<IconUsers size={12} />}
              title="Community & Future"
            >
              <Text c="dark" size="sm">
                Today, AREA continues to evolve with new features, integrations, and improvements
                driven by our growing community. We&apos;re committed to making automation simple,
                powerful, and accessible to all.
              </Text>
            </Timeline.Item>
          </Timeline>
        </Box>

        {/* Values Section */}
        <Box>
          <Title order={2} mb="xl" ta="center">
            Our Values
          </Title>
          <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="lg">
            {teamValues.map((value, index) => (
              <Paper key={index} shadow="sm" p="xl" radius="md" withBorder>
                <Title order={3} size="h4" mb="sm">
                  {value.title}
                </Title>
                <Text c="dark">{value.description}</Text>
              </Paper>
            ))}
          </SimpleGrid>
        </Box>

        {/* Technology Stack */}
        <Box>
          <Title order={2} mb="xl" ta="center">
            Built With Modern Technology
          </Title>
          <Paper shadow="sm" p="xl" radius="md" withBorder>
            <Text size="lg" mb="lg">
              AREA is built using industry-leading technologies to ensure performance, security, and
              scalability:
            </Text>
            <SimpleGrid cols={{ base: 2, sm: 3, md: 4 }} spacing="md">
              <Badge size="xl" variant="light" color="blue">Next.js</Badge>
              <Badge size="xl" variant="light" color="cyan">React</Badge>
              <Badge size="xl" variant="light" color="blue">TypeScript</Badge>
              <Badge size="xl" variant="light" color="violet">Mantine UI</Badge>
              <Badge size="xl" variant="light" color="green">Node.js</Badge>
              <Badge size="xl" variant="light" color="orange">Docker</Badge>
              <Badge size="xl" variant="light" color="red">Jest</Badge>
              <Badge size="xl" variant="light" color="teal">Cypress</Badge>
              <Badge size="xl" variant="light" color="grape">OAuth2</Badge>
              <Badge size="xl" variant="light" color="pink">REST API</Badge>
              <Badge size="xl" variant="light" color="indigo">PostgreSQL</Badge>
              <Badge size="xl" variant="light" color="lime">CI/CD</Badge>
            </SimpleGrid>
          </Paper>
        </Box>

        <Box>
          <Title order={2} mb="xl" ta="center">
            Frequently Asked Questions
          </Title>
          <Accordion variant="separated" radius="md">
            <Accordion.Item value="what-is-area">
              <Accordion.Control icon={<IconBulb size={20} />}>
                What exactly is AREA?
              </Accordion.Control>
              <Accordion.Panel>
                AREA (Action REAction) is an automation platform that connects different web services
                and applications. It allows you to create workflows where an action on one service
                triggers a reaction on another, helping you automate repetitive tasks and boost
                productivity.
              </Accordion.Panel>
            </Accordion.Item>

            <Accordion.Item value="how-it-works">
              <Accordion.Control icon={<IconPlugConnected size={20} />}>
                How does AREA work?
              </Accordion.Control>
              <Accordion.Panel>
                AREA works by connecting to your favorite services through secure OAuth2 authentication.
                You create &quot;Areas&quot; which consist of an Action (trigger) and one or more Reactions
                (responses). When the action occurs, AREA automatically executes the reactions you&apos;ve
                configured.
              </Accordion.Panel>
            </Accordion.Item>

            <Accordion.Item value="services">
              <Accordion.Control icon={<IconWorld size={20} />}>
                What services does AREA support?
              </Accordion.Control>
              <Accordion.Panel>
                AREA supports a wide range of popular services including email providers, social media
                platforms, cloud storage, productivity tools, and more. We&apos;re constantly adding new
                integrations based on user feedback and demand.
              </Accordion.Panel>
            </Accordion.Item>

            <Accordion.Item value="security">
              <Accordion.Control icon={<IconShield size={20} />}>
                Is my data secure with AREA?
              </Accordion.Control>
              <Accordion.Panel>
                Absolutely. We take security seriously and implement industry-standard practices including
                OAuth2 authentication, encrypted data transmission, and secure storage. We never store
                your service passwords, and you can revoke access at any time.
              </Accordion.Panel>
            </Accordion.Item>

            <Accordion.Item value="open-source">
              <Accordion.Control icon={<IconBrandGithub size={20} />}>
                Is AREA open source?
              </Accordion.Control>
              <Accordion.Panel>
                Yes! AREA is built with open-source principles in mind. We believe in transparency and
                community collaboration. You can find our code, contribute to the project, and even
                host your own instance if you prefer.
              </Accordion.Panel>
            </Accordion.Item>
          </Accordion>
        </Box>

        {/* Contact Section */}
        <Paper shadow="sm" p="xl" radius="md" withBorder style={{ textAlign: 'center' }}>
          <Title order={2} mb="md">
            Get in Touch
          </Title>
          <Text size="lg" c="dark" mb="xl" maw={600} mx="auto">
            Have questions or feedback? We&apos;d love to hear from you! Join our community, contribute to
            the project, or reach out to our team.
          </Text>
          <Group justify="center" gap="md">
            <Badge
              size="xl"
              variant="light"
              color="blue"
              leftSection={<IconBrandGithub size={16} />}
              style={{ cursor: 'pointer' }}
            >
              GitHub
            </Badge>
            <Badge
              size="xl"
              variant="light"
              color="cyan"
              leftSection={<IconUsers size={16} />}
              style={{ cursor: 'pointer' }}
            >
              Community
            </Badge>
            <Badge
              size="xl"
              variant="light"
              color="violet"
              leftSection={<IconApi size={16} />}
              style={{ cursor: 'pointer' }}
            >
              Documentation
            </Badge>
          </Group>
        </Paper>
      </Stack>
    </Container>
  );
}
