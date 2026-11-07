import { Target, Zap, Shield, Code, Github, Globe, Users, Lightbulb, Rocket, ChevronDown, ChevronUp, ArrowLeft } from 'lucide-react-native';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ScrollView, Linking } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';

import { Badge, BadgeText } from '@/components/ui/badge';
import { Box } from '@/components/ui/box';
import { Heading } from '@/components/ui/heading';
import { HStack } from '@/components/ui/hstack';
import { Image } from '@/components/ui/image';
import { Pressable } from '@/components/ui/pressable';
import { Text } from '@/components/ui/text';
import { VStack } from '@/components/ui/vstack';
import { useThemeColors } from '@/hooks/useThemeColors';

interface Feature {
  icon: React.ComponentType<any>;
  title: string;
  description: string;
  color: string;
}

interface Value {
  title: string;
  description: string;
}

interface JourneyStep {
  icon: React.ComponentType<any>;
  title: string;
  description: string;
}

interface FAQItemProps {
  question: string;
  answer: string;
}

const FeatureCard: React.FC<Feature> = ({ icon: Icon, title, description }) => {
  const colors = useThemeColors();
  return (
    <Box className="rounded-xl p-4 mb-4 shadow-soft-1" style={{ backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border }}>
      <VStack space="md" className="items-center">
        <Box className="w-12 h-12 rounded-full items-center justify-center" style={{ backgroundColor: colors.info }}>
          <Icon size={24} color="#FFFFFF" />
        </Box>
        <VStack space="xs" className="items-center">
          <Text className="font-bold text-center" style={{ color: colors.text }}>{title}</Text>
          <Text size="sm" className="text-center" style={{ color: colors.textSecondary }}>{description}</Text>
        </VStack>
      </VStack>
    </Box>
  );
};

const ValueCard: React.FC<Value> = ({ title, description }) => {
  const colors = useThemeColors();
  return (
    <Box className="rounded-xl p-4 mb-4 shadow-soft-1" style={{ backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border }}>
      <VStack space="sm">
        <Text className="font-bold" style={{ color: colors.text }}>{title}</Text>
        <Text size="sm" style={{ color: colors.textSecondary }}>{description}</Text>
      </VStack>
    </Box>
  );
};

const JourneyCard: React.FC<JourneyStep & { index: number; total: number }> = ({ icon: Icon, title, description, index, total }) => {
  const colors = useThemeColors();
  return (
    <Box className="relative">
      <HStack space="md" className="items-start">
        <Box className="w-12 h-12 rounded-full items-center justify-center" style={{ backgroundColor: colors.info }}>
          <Icon size={20} color="#FFFFFF" />
        </Box>
        <VStack space="xs" className="flex-1">
          <Text className="font-bold" style={{ color: colors.text }}>{title}</Text>
          <Text size="sm" style={{ color: colors.textSecondary }}>{description}</Text>
        </VStack>
      </HStack>
      {index < total - 1 && (
        <Box className="absolute left-6 top-12 w-0.5 h-8" style={{ backgroundColor: colors.border }} />
      )}
    </Box>
  );
};

const FAQAccordionItem: React.FC<FAQItemProps> = ({ question, answer }) => {
  const [expanded, setExpanded] = useState(false);
  const colors = useThemeColors();

  return (
    <Box className="rounded-xl mb-3 shadow-soft-1" style={{ backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border }}>
      <Pressable onPress={() => setExpanded(!expanded)} className="p-4">
        <HStack space="md" className="items-center justify-between">
          <Text className="font-semibold flex-1" style={{ color: colors.text }}>{question}</Text>
          {expanded ? (
            <ChevronUp size={20} color={colors.info} />
          ) : (
            <ChevronDown size={20} color={colors.info} />
          )}
        </HStack>
        {expanded && (
          <Text size="sm" className="mt-3" style={{ color: colors.textSecondary }}>{answer}</Text>
        )}
      </Pressable>
    </Box>
  );
};

export default function AboutScreen() {
  const { t } = useTranslation();
  const colors = useThemeColors();
  const router = useRouter();

  const features: Feature[] = [
    {
      icon: Zap,
      title: t('about.feature1Title'),
      description: t('about.feature1Desc'),
      color: 'blue',
    },
    {
      icon: Shield,
      title: t('about.feature2Title'),
      description: t('about.feature2Desc'),
      color: 'green',
    },
    {
      icon: Code,
      title: t('about.feature3Title'),
      description: t('about.feature3Desc'),
      color: 'violet',
    },
    {
      icon: Github,
      title: t('about.feature4Title'),
      description: t('about.feature4Desc'),
      color: 'orange',
    },
    {
      icon: Globe,
      title: t('about.feature5Title'),
      description: t('about.feature5Desc'),
      color: 'pink',
    },
    {
      icon: Users,
      title: t('about.feature6Title'),
      description: t('about.feature6Desc'),
      color: 'teal',
    },
  ];

  const values: Value[] = [
    {
      title: t('about.value1Title'),
      description: t('about.value1Text'),
    },
    {
      title: t('about.value2Title'),
      description: t('about.value2Text'),
    },
    {
      title: t('about.value3Title'),
      description: t('about.value3Text'),
    },
    {
      title: t('about.value4Title'),
      description: t('about.value4Text'),
    },
  ];

  const journey: JourneyStep[] = [
    {
      icon: Lightbulb,
      title: t('about.journey1Title'),
      description: t('about.journey1Text'),
    },
    {
      icon: Code,
      title: t('about.journey2Title'),
      description: t('about.journey2Text'),
    },
    {
      icon: Rocket,
      title: t('about.journey3Title'),
      description: t('about.journey3Text'),
    },
    {
      icon: Users,
      title: t('about.journey4Title'),
      description: t('about.journey4Text'),
    },
  ];

  const faqs: FAQItemProps[] = [
    {
      question: t('about.faq1Question'),
      answer: t('about.faq1Answer'),
    },
    {
      question: t('about.faq2Question'),
      answer: t('about.faq2Answer'),
    },
    {
      question: t('about.faq3Question'),
      answer: t('about.faq3Answer'),
    },
    {
      question: t('about.faq4Question'),
      answer: t('about.faq4Answer'),
    },
    {
      question: t('about.faq5Question'),
      answer: t('about.faq5Answer'),
    },
  ];

  const handleLinkPress = async (url: string) => {
    try {
      const canOpen = await Linking.canOpenURL(url);
      if (canOpen) await Linking.openURL(url);
    } catch (error) {
      console.error('Error opening link:', error);
    }
  };

  return (
    <SafeAreaView className="flex-1" edges={['top']} style={{ backgroundColor: colors.background }}>
      {/* Header with back button */}
      <Box className="px-6 py-4 border-b" style={{ borderBottomColor: colors.border, backgroundColor: colors.card }}>
        <HStack space="md" className="items-center">
          <Pressable onPress={() => router.back()} className="p-2 rounded-full active:bg-background-100">
            <ArrowLeft size={24} color={colors.text} />
          </Pressable>
          <Heading size="xl" style={{ color: colors.text }}>
            {t('about.title')}
          </Heading>
        </HStack>
      </Box>

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 24 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero Section */}
        <Box className="px-6 py-8 items-center">
          <Image
            source={require('../assets/images/area1.png')}
            alt="AREA Logo"
            className="w-24 h-24 mb-6"
            resizeMode="contain"
          />
          <Text size="lg" className="text-center mb-6" style={{ color: colors.textSecondary }}>
            {t('about.heroDescription')}
          </Text>
          <HStack space="sm" className="justify-center flex-wrap">
            <Badge size="md" variant="solid" action="info">
              <BadgeText>Automation Platform</BadgeText>
            </Badge>
            <Badge size="md" variant="solid" action="success">
              <BadgeText>Open Source</BadgeText>
            </Badge>
            <Badge size="md" variant="solid" action="warning">
              <BadgeText>Cloud-Based</BadgeText>
            </Badge>
          </HStack>
        </Box>

        {/* Mission Section */}
        <Box className="mx-6 mb-8 rounded-2xl p-6 shadow-soft-1" style={{ backgroundColor: colors.card }}>
          <HStack space="md" className="items-start mb-4">
            <Box className="w-12 h-12 rounded-full items-center justify-center" style={{ backgroundColor: colors.info }}>
              <Target size={24} color="#FFFFFF" />
            </Box>
            <VStack space="xs" className="flex-1">
              <Text className="font-bold text-lg" style={{ color: colors.text }}>{t('about.missionTitle')}</Text>
            </VStack>
          </HStack>
          <Text style={{ color: colors.textSecondary }}>{t('about.missionText')}</Text>
        </Box>

        {/* What is AREA Section */}
        <Box className="mx-6 mb-8">
          <Heading size="xl" className="mb-6 text-center" style={{ color: colors.text }}>
            {t('about.whatIsTitle')}
          </Heading>
          <Box className="rounded-2xl p-6 shadow-soft-1" style={{ backgroundColor: colors.card }}>
            <Text className="mb-4" style={{ color: colors.textSecondary }}>{t('about.whatIsText1')}</Text>
            <Text className="mb-4" style={{ color: colors.textSecondary }}>{t('about.whatIsText2')}</Text>
            <VStack space="xs" className="mb-4">
              <Text size="sm" style={{ color: colors.textSecondary }}>• {t('about.example1')}</Text>
              <Text size="sm" style={{ color: colors.textSecondary }}>• {t('about.example2')}</Text>
              <Text size="sm" style={{ color: colors.textSecondary }}>• {t('about.example3')}</Text>
              <Text size="sm" style={{ color: colors.textSecondary }}>• {t('about.example4')}</Text>
            </VStack>
            <Text style={{ color: colors.textSecondary }}>{t('about.whatIsText3')}</Text>
          </Box>
        </Box>

        {/* Features Grid */}
        <Box className="mx-6 mb-8">
          <Heading size="xl" className="mb-6 text-center" style={{ color: colors.text }}>
            {t('about.featuresTitle')}
          </Heading>
          <VStack space="md">
            {features.map((feature, index) => (
              <FeatureCard key={index} {...feature} />
            ))}
          </VStack>
        </Box>

        {/* Journey Timeline */}
        <Box className="mx-6 mb-8">
          <Heading size="xl" className="mb-6 text-center" style={{ color: colors.text }}>
            {t('about.journeyTitle')}
          </Heading>
          <VStack space="lg">
            {journey.map((step, index) => (
              <JourneyCard key={index} {...step} index={index} total={journey.length} />
            ))}
          </VStack>
        </Box>

        {/* Values Section */}
        <Box className="mx-6 mb-8">
          <Heading size="xl" className="mb-6 text-center" style={{ color: colors.text }}>
            {t('about.valuesTitle')}
          </Heading>
          <VStack space="md">
            {values.map((value, index) => (
              <ValueCard key={index} {...value} />
            ))}
          </VStack>
        </Box>

        {/* Technology Stack */}
        <Box className="mx-6 mb-8 rounded-2xl p-6 shadow-soft-1" style={{ backgroundColor: colors.card }}>
          <Heading size="lg" className="mb-4 text-center" style={{ color: colors.text }}>
            {t('about.techTitle')}
          </Heading>
          <Text className="mb-6 text-center" style={{ color: colors.textSecondary }}>{t('about.techText')}</Text>
          <VStack space="sm" className="items-center">
            <HStack space="sm" className="flex-wrap justify-center">
              <Badge size="sm" variant="outline" style={{ borderColor: colors.info }}>
                <BadgeText style={{ color: colors.info }}>React Native</BadgeText>
              </Badge>
              <Badge size="sm" variant="outline" style={{ borderColor: colors.info }}>
                <BadgeText style={{ color: colors.info }}>TypeScript</BadgeText>
              </Badge>
              <Badge size="sm" variant="outline" style={{ borderColor: colors.info }}>
                <BadgeText style={{ color: colors.info }}>Gluestack UI</BadgeText>
              </Badge>
            </HStack>
            <HStack space="sm" className="flex-wrap justify-center">
              <Badge size="sm" variant="outline" style={{ borderColor: colors.info }}>
                <BadgeText style={{ color: colors.info }}>Node.js</BadgeText>
              </Badge>
              <Badge size="sm" variant="outline" style={{ borderColor: colors.info }}>
                <BadgeText style={{ color: colors.info }}>Docker</BadgeText>
              </Badge>
              <Badge size="sm" variant="outline" style={{ borderColor: colors.info }}>
                <BadgeText style={{ color: colors.info }}>PostgreSQL</BadgeText>
              </Badge>
            </HStack>
            <HStack space="sm" className="flex-wrap justify-center">
              <Badge size="sm" variant="outline" style={{ borderColor: colors.info }}>
                <BadgeText style={{ color: colors.info }}>Jest</BadgeText>
              </Badge>
              <Badge size="sm" variant="outline" style={{ borderColor: colors.info }}>
                <BadgeText style={{ color: colors.info }}>OAuth2</BadgeText>
              </Badge>
              <Badge size="sm" variant="outline" style={{ borderColor: colors.info }}>
                <BadgeText style={{ color: colors.info }}>REST API</BadgeText>
              </Badge>
            </HStack>
          </VStack>
        </Box>

        {/* FAQ Section */}
        <Box className="mx-6 mb-8">
          <Heading size="xl" className="mb-6 text-center" style={{ color: colors.text }}>
            {t('about.faqTitle')}
          </Heading>
          <VStack space="sm">
            {faqs.map((faq, index) => (
              <FAQAccordionItem key={index} {...faq} />
            ))}
          </VStack>
        </Box>

        {/* Contact Section */}
        <Box className="mx-6 mb-8 rounded-2xl p-6 shadow-soft-1" style={{ backgroundColor: colors.card }}>
          <Heading size="lg" className="mb-4 text-center" style={{ color: colors.text }}>
            {t('about.contactTitle')}
          </Heading>
          <Text className="mb-6 text-center" style={{ color: colors.textSecondary }}>
            {t('about.contactText')}
          </Text>
          <HStack space="md" className="justify-center flex-wrap">
            <Pressable onPress={() => handleLinkPress('https://github.com/SamTess/AREA')}>
              <Badge size="lg" variant="solid" action="info" className="px-4 py-2">
                <BadgeText>{t('about.github')}</BadgeText>
              </Badge>
            </Pressable>
            <Pressable onPress={() => handleLinkPress('https://discord.gg')}>
              <Badge size="lg" variant="solid" action="success" className="px-4 py-2">
                <BadgeText>{t('about.community')}</BadgeText>
              </Badge>
            </Pressable>
            <Pressable onPress={() => handleLinkPress('https://area-platform.com/docs')}>
              <Badge size="lg" variant="solid" action="warning" className="px-4 py-2">
                <BadgeText>{t('about.documentation')}</BadgeText>
              </Badge>
            </Pressable>
          </HStack>
        </Box>
      </ScrollView>
    </SafeAreaView>
  );
}