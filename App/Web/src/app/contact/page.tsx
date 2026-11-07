'use client';

import {
  Container,
  Title,
  Text,
  Card,
  SimpleGrid,
  Group,
  Stack,
  ThemeIcon,
  Paper,
  Box,
  TextInput,
  Textarea,
  Button,
  Select,
  Center,
  Image,
  Alert,
  Badge,
} from '@mantine/core';
import {
  IconMail,
  IconBrandGithub,
  IconBrandDiscord,
  IconMessageCircle,
  IconSend,
  IconInfoCircle,
  IconClock,
  IconPhone,
  IconWorld,
} from '@tabler/icons-react';
import { useState } from 'react';

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });

  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // here handle the form submission
    console.log('Form submitted:', formData);
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 5000);
  };

  const contactMethods = [
    {
      icon: IconMail,
      title: 'Email Support',
      description: 'Get help from our team',
      value: 'support@area-automation-platform.com',
      link: 'mailto:support@area-automation-platform.com',
      color: 'blue',
    },
    {
      icon: IconBrandGithub,
      title: 'GitHub Issues',
      description: 'Report bugs & contribute',
      value: 'github.com/area',
      link: 'https://github.com/SamTess/AREA',
      color: 'dark',
    },
    {
      icon: IconBrandDiscord,
      title: 'Discord Community',
      description: 'Join the conversation',
      value: 'Join our server',
      link: '#',
      color: 'indigo',
    },
  ];

  return (
    <Container size="md" py={80}>
      <Stack gap={60}>
        <Box ta="center">
          <Center mb="xl">
            <Image
              src="/area1.png"
              alt="AREA Logo"
              style={{ maxWidth: '100px', height: 'auto' }}
            />
          </Center>
          <Title
            order={1}
            size={44}
            fw={800}
            mb="md"
            style={{
              background: 'linear-gradient(45deg, #228be6, #15aabf)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              color: 'transparent',
            }}
          >
            Get in Touch
          </Title>
          <Text size="lg" c="#1a1a1a" maw={500} mx="auto" fw={500}>
            Questions or need help? We&apos;re here to assist you every step of the way.
          </Text>
        </Box>
        <Box>
          <SimpleGrid cols={{ base: 1, sm: 3 }} spacing="lg">
            {contactMethods.map((method, index) => (
              <Card
                key={index}
                shadow="sm"
                padding="xl"
                radius="xl"
                withBorder
                component="a"
                href={method.link}
                style={{
                  textDecoration: 'none',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  border: '1px solid #e9ecef',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-4px)';
                  e.currentTarget.style.boxShadow = '0 20px 40px rgba(0,0,0,0.12)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.12)';
                }}
              >
                <Group justify="center" mb="lg">
                  <ThemeIcon
                    size={70}
                    radius="xl"
                    variant="gradient"
                    gradient={{ from: method.color, to: `${method.color}.6` }}
                  >
                    <method.icon size={32} />
                  </ThemeIcon>
                </Group>
                <Text fw={700} size="lg" ta="center" mb="xs">
                  {method.title}
                </Text>
                <Text size="sm" c="#2c2c2c" ta="center" mb="md" fw={500}>
                  {method.description}
                </Text>
                <Badge
                  size="lg"
                  variant="filled"
                  color={method.color}
                  style={{
                    width: '100%',
                    fontSize: '14px',
                    fontWeight: 600,
                    padding: '8px 12px',
                    color: 'white'
                  }}
                >
                  {method.value}
                </Badge>
              </Card>
            ))}
          </SimpleGrid>
        </Box>

        <Paper
          shadow="xl"
          p="xl"
          radius="xl"
          withBorder
          style={{
            background: 'linear-gradient(135deg, #f8f9fa 0%, #ffffff 100%)',
            border: '1px solid #e9ecef',
          }}
        >
          <Box ta="center" mb="xl">
            <ThemeIcon
              size={60}
              radius="xl"
              variant="gradient"
              gradient={{ from: 'blue', to: 'cyan' }}
              mx="auto"
              mb="md"
            >
              <IconMessageCircle size={30} />
            </ThemeIcon>
            <Title order={2} size="h2" fw={700} mb="xs">
              Send us a Message
            </Title>
            <Text size="sm" c="#2c2c2c" fw={500}>
              We&apos;ll respond within 24 hours
            </Text>
          </Box>

          {submitted && (
            <Alert
              icon={<IconInfoCircle size={18} />}
              title="Message Sent!"
              color="green"
              mb="xl"
              withCloseButton
              onClose={() => setSubmitted(false)}
              radius="lg"
            >
              Thank you! We&apos;ll get back to you soon.
            </Alert>
          )}

          <form onSubmit={handleSubmit}>
            <Stack gap="lg">
              <SimpleGrid cols={{ base: 1, md: 2 }} spacing="md">
                <TextInput
                  label="Name"
                  placeholder="John Doe"
                  required
                  size="md"
                  radius="lg"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
                <TextInput
                  label="Email"
                  placeholder="john@example.com"
                  type="email"
                  required
                  size="md"
                  radius="lg"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </SimpleGrid>

              <Select
                label="How can we help?"
                placeholder="Choose a topic"
                required
                size="md"
                radius="lg"
                value={formData.subject}
                onChange={(value) => setFormData({ ...formData, subject: value || '' })}
                data={[
                  { value: 'support', label: 'General Support' },
                  { value: 'bug', label: 'Bug Report' },
                  { value: 'feature', label: 'Feature Request' },
                  { value: 'business', label: 'Business Inquiry' },
                  { value: 'other', label: 'Other' },
                ]}
              />

              <Textarea
                label="Message"
                placeholder="Tell us more about your inquiry..."
                required
                minRows={4}
                size="md"
                radius="lg"
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
              />

              <Group justify="center" mt="md">
                <Button
                  type="submit"
                  size="lg"
                  leftSection={<IconSend size={20} />}
                  variant="gradient"
                  gradient={{ from: 'blue', to: 'cyan' }}
                  radius="xl"
                  style={{ minWidth: '200px' }}
                >
                  Send Message
                </Button>
              </Group>
            </Stack>
          </form>
        </Paper>

        {/* Quick Info */}
        <SimpleGrid cols={{ base: 1, sm: 3 }} spacing="lg">
          <Card shadow="sm" p="lg" radius="lg" withBorder ta="center">
            <ThemeIcon size={40} radius="xl" variant="light" color="blue" mx="auto" mb="sm">
              <IconClock size={20} />
            </ThemeIcon>
            <Text fw={600} size="md" mb="xs">
              Response Time
            </Text>
            <Text size="sm" c="#2c2c2c" fw={500}>
              Within 24 hours
            </Text>
          </Card>

          <Card shadow="sm" p="lg" radius="lg" withBorder ta="center">
            <ThemeIcon size={40} radius="xl" variant="light" color="green" mx="auto" mb="sm">
              <IconPhone size={20} />
            </ThemeIcon>
            <Text fw={600} size="md" mb="xs">
              Phone Support
            </Text>
            <Text size="sm" c="#2c2c2c" fw={500}>
              +33 6 95 41 16 79
            </Text>
          </Card>

          <Card shadow="sm" p="lg" radius="lg" withBorder ta="center">
            <ThemeIcon size={40} radius="xl" variant="light" color="orange" mx="auto" mb="sm">
              <IconWorld size={20} />
            </ThemeIcon>
            <Text fw={600} size="md" mb="xs">
              Languages
            </Text>
            <Text size="sm" c="#2c2c2c" fw={500}>
              English
            </Text>
          </Card>
        </SimpleGrid>
      </Stack>
    </Container>
  );
}
