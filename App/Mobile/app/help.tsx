import { Mail, Github, MessageCircle, Send, Clock, Phone, Globe, AlertCircle, ArrowLeft } from 'lucide-react-native';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  ScrollView,
  Linking,
  Alert,
  KeyboardAvoidingView,
  Platform,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useHeaderHeight } from '@react-navigation/elements';
import { useRouter } from 'expo-router';

import { Badge, BadgeText } from '@/components/ui/badge';
import { Box } from '@/components/ui/box';
import { Button, ButtonText, ButtonIcon } from '@/components/ui/button';
import { Heading } from '@/components/ui/heading';
import { HStack } from '@/components/ui/hstack';
import { Input, InputField } from '@/components/ui/input';
import { Pressable } from '@/components/ui/pressable';
import { Text } from '@/components/ui/text';
import { VStack } from '@/components/ui/vstack';
import { useThemeColors } from '@/hooks/useThemeColors';

interface ContactMethod {
  icon: React.ComponentType<any>;
  title: string;
  description: string;
  value: string;
  link: string;
  color: string;
}

const ContactCard: React.FC<ContactMethod> = ({ icon: Icon, title, description, value, link }) => {
  const colors = useThemeColors();
  const handlePress = async () => {
    try {
      const canOpen = await Linking.canOpenURL(link);
      if (canOpen) await Linking.openURL(link);
    } catch (error) {
      console.error('Error opening link:', error);
    }
  };

  return (
    <Pressable onPress={handlePress} className="mb-4">
      <Box className="rounded-2xl p-6 shadow-soft-1" style={{ backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border }}>
        <VStack space="md" className="items-center">
          <Box className="w-16 h-16 rounded-full items-center justify-center" style={{ backgroundColor: colors.info }}>
            <Icon size={32} color="#FFFFFF" />
          </Box>
          <VStack space="xs" className="items-center">
            <Text className="font-bold text-lg text-center" style={{ color: colors.text }}>{title}</Text>
            <Text size="sm" className="text-center" style={{ color: colors.textSecondary }}>{description}</Text>
          </VStack>
          <Badge size="md" variant="solid" action="info" className="w-full">
            <BadgeText className="text-center w-full">{value}</BadgeText>
          </Badge>
        </VStack>
      </Box>
    </Pressable>
  );
};

const InfoCard: React.FC<{
  icon: React.ComponentType<any>;
  title: string;
  subtitle: string;
}> = ({ icon: Icon, title, subtitle }) => {
  const colors = useThemeColors();
  return (
    <Box className="rounded-xl p-4 shadow-soft-1 flex-1" style={{ backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border }}>
      <VStack space="sm" className="items-center">
        <Box className="w-10 h-10 rounded-full items-center justify-center" style={{ backgroundColor: `${colors.info}20` }}>
          <Icon size={20} color={colors.info} />
        </Box>
        <Text className="font-semibold text-center" style={{ color: colors.text }}>{title}</Text>
        <Text size="sm" className="text-center" style={{ color: colors.textSecondary }}>{subtitle}</Text>
      </VStack>
    </Box>
  );
};

export default function HelpScreen() {
  const { t } = useTranslation();
  const headerHeight = useHeaderHeight();
  const colors = useThemeColors();
  const router = useRouter();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });
  const [submitted, setSubmitted] = useState(false);
  const [messageHeight, setMessageHeight] = useState(120);

  const handleSubmit = () => {
    if (!formData.name || !formData.email || !formData.message) {
      Alert.alert(t('help.errorTitle'), t('help.errorMessage'));
      return;
    }

    console.log('Form submitted:', formData);
    setSubmitted(true);
    setFormData({ name: '', email: '', subject: '', message: '' });
    setMessageHeight(120);

    Alert.alert(t('help.successTitle'), t('help.successMessage'));
    setTimeout(() => setSubmitted(false), 3000);
  };

  const contactMethods: ContactMethod[] = [
    {
      icon: Mail,
      title: t('help.emailTitle'),
      description: t('help.emailDescription'),
      value: 'support@area-platform.com',
      link: 'mailto:support@area-platform.com',
      color: 'blue',
    },
    {
      icon: Github,
      title: t('help.githubTitle'),
      description: t('help.githubDescription'),
      value: 'github.com/area',
      link: 'https://github.com/SamTess/AREA',
      color: 'dark',
    },
    {
      icon: MessageCircle,
      title: t('help.discordTitle'),
      description: t('help.discordDescription'),
      value: t('help.discordValue'),
      link: 'https://discord.gg',
      color: 'indigo',
    },
  ];

  return (
    <SafeAreaView className="flex-1" edges={['top']} style={{ backgroundColor: colors.background }}>
      {/* Header with back button */}
      <Box className="px-6 py-4 border-b" style={{ borderBottomColor: colors.border, backgroundColor: colors.card }}>
        <HStack space="md" className="items-center">
          <Pressable onPress={() => router.back()} className="p-2 rounded-full active:bg-background-100">
            <ArrowLeft size={24} color={colors.text} />
          </Pressable>
          <Heading size="xl" style={{ color: colors.text }}>
            {t('help.title')}
          </Heading>
        </HStack>
      </Box>

      <KeyboardAvoidingView
        className="flex-1"
        style={{ backgroundColor: colors.background }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={headerHeight}
      >
        <ScrollView
          className="flex-1"
          style={{ backgroundColor: colors.background }}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode={Platform.OS === 'ios' ? 'on-drag' : 'none'}
          contentContainerStyle={{ paddingBottom: 24 }}
        >
          {/* Header */}
          <Box className="px-6 py-6">
            <Text size="lg" className="text-center" style={{ color: colors.textSecondary }}>{t('help.subtitle')}</Text>
          </Box>

          {/* Contact Methods */}
          <Box className="px-6 mb-6">
            {contactMethods.map((method, index) => (
              <ContactCard key={index} {...method} />
            ))}
          </Box>

          {/* Contact Form */}
          <Box className="mx-6 mb-6 rounded-2xl p-6 shadow-soft-2" style={{ backgroundColor: colors.card }}>
            <VStack space="lg">
              <VStack space="sm" className="items-center">
                <Box className="w-14 h-14 rounded-full items-center justify-center mb-2" style={{ backgroundColor: colors.info }}>
                  <MessageCircle size={28} color="#FFFFFF" />
                </Box>
                <Heading size="xl" className="text-center" style={{ color: colors.text }}>{t('help.formTitle')}</Heading>
                <Text size="sm" className="text-center" style={{ color: colors.textSecondary }}>{t('help.formSubtitle')}</Text>
              </VStack>

              {submitted && (
                <Box className="rounded-lg p-4" style={{ backgroundColor: `${colors.success}20`, borderWidth: 1, borderColor: colors.success }}>
                  <HStack space="sm" className="items-center">
                    <AlertCircle size={20} color={colors.success} />
                    <VStack className="flex-1">
                      <Text className="font-semibold" style={{ color: colors.success }}>{t('help.successTitle')}</Text>
                      <Text size="sm" style={{ color: colors.success }}>{t('help.successMessage')}</Text>
                    </VStack>
                  </HStack>
                </Box>
              )}

              <VStack space="md">
                {/* Nom */}
                <VStack space="xs">
                  <Text className="font-medium" style={{ color: colors.text }}>{t('help.nameLabel')}</Text>
                  <Input variant="outline" size="lg" style={{ backgroundColor: colors.background, borderColor: colors.border }}>
                    <InputField
                      placeholder={t('help.namePlaceholder')}
                      value={formData.name}
                      onChangeText={(text) => setFormData({ ...formData, name: text })}
                      returnKeyType="next"
                      style={{ color: colors.text }}
                      placeholderTextColor={colors.textTertiary}
                    />
                  </Input>
                </VStack>

                {/* Email */}
                <VStack space="xs">
                  <Text className="font-medium" style={{ color: colors.text }}>{t('help.emailLabel')}</Text>
                  <Input variant="outline" size="lg" style={{ backgroundColor: colors.background, borderColor: colors.border }}>
                    <InputField
                      placeholder={t('help.emailPlaceholder')}
                      value={formData.email}
                      onChangeText={(text) => setFormData({ ...formData, email: text })}
                      keyboardType="email-address"
                      autoCapitalize="none"
                      returnKeyType="next"
                      style={{ color: colors.text }}
                      placeholderTextColor={colors.textTertiary}
                    />
                  </Input>
                </VStack>

                {/* Sujet */}
                <VStack space="xs">
                  <Text className="font-medium" style={{ color: colors.text }}>{t('help.subjectLabel')}</Text>
                  <Input variant="outline" size="lg" style={{ backgroundColor: colors.background, borderColor: colors.border }}>
                    <InputField
                      placeholder={t('help.subjectPlaceholder')}
                      value={formData.subject}
                      onChangeText={(text) => setFormData({ ...formData, subject: text })}
                      returnKeyType="next"
                      style={{ color: colors.text }}
                      placeholderTextColor={colors.textTertiary}
                    />
                  </Input>
                </VStack>

                {/* Message */}
                <VStack space="xs">
                  <Text className="font-medium" style={{ color: colors.text }}>{t('help.messageLabel')}</Text>
                  <TextInput
                    multiline
                    placeholder={t('help.messagePlaceholder')}
                    value={formData.message}
                    onChangeText={(text) => setFormData({ ...formData, message: text })}
                    onContentSizeChange={(e) => {
                      const h = Math.max(120, Math.min(e.nativeEvent.contentSize.height, 300));
                      setMessageHeight(h);
                    }}
                    style={{
                      height: messageHeight,
                      textAlignVertical: 'top',
                      paddingTop: 12,
                      borderWidth: 1,
                      borderColor: colors.border,
                      borderRadius: 8,
                      padding: 12,
                      fontSize: 16,
                      backgroundColor: colors.background,
                      color: colors.text,
                    }}
                    placeholderTextColor={colors.textTertiary}
                    returnKeyType="done"
                    blurOnSubmit
                  />
                </VStack>

                {/* Bouton envoyer */}
                <Button size="lg" action="primary" onPress={handleSubmit} className="mt-2" style={{ backgroundColor: colors.info }}>
                  <ButtonIcon as={Send} />
                  <ButtonText className="text-white">{t('help.sendButton')}</ButtonText>
                </Button>
              </VStack>
            </VStack>
          </Box>

          {/* Quick Info Cards */}
          <Box className="px-6 mb-6">
            <HStack space="md">
              <InfoCard icon={Clock} title={t('help.responseTitle')} subtitle={t('help.responseTime')} />
              <InfoCard icon={Globe} title={t('help.languagesTitle')} subtitle={t('help.languagesSupported')} />
            </HStack>
          </Box>

          <Box className="px-6 mb-6">
            <InfoCard icon={Phone} title={t('help.phoneTitle')} subtitle={t('help.phoneNumber')} />
          </Box>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
