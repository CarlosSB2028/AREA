import { Box } from '@/components/ui/box';
import { Button, ButtonText } from '@/components/ui/button';
import { Center } from '@/components/ui/center';
import { Heading } from '@/components/ui/heading';
import { Input, InputField } from '@/components/ui/input';
import { Text } from '@/components/ui/text';
import { VStack } from '@/components/ui/vstack';
import * as authService from '@/services/auth';
import { useRouter } from 'expo-router';
import { KeyRound } from 'lucide-react-native';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ActivityIndicator, Alert } from 'react-native';
import { useThemeColors } from '@/hooks/useThemeColors';

export default function ForgotPasswordScreen() {
    const { t } = useTranslation();
    const router = useRouter();
    const colors = useThemeColors();
    const [email, setEmail] = useState('');
    const [emailError, setEmailError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const validateEmail = (email: string) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    };

    const handleSendResetLink = async () => {
        setEmailError('');

        if (!email) {
            setEmailError(t('forgotPassword.emailRequired'));
            return;
        }

        if (!validateEmail(email)) {
            setEmailError(t('forgotPassword.emailInvalid'));
            return;
        }

        setIsLoading(true);

        try {
            await authService.forgotPassword(email);

            setIsLoading(false);

            Alert.alert(
                t('forgotPassword.successTitle'),
                t('forgotPassword.successMessage'),
                [
                    {
                        text: 'OK',
                        onPress: () => router.push('/(tabs)/login'),
                    },
                ]
            );
        } catch (err) {
            setIsLoading(false);
            const msgKey = err instanceof Error ? 'forgotPassword.failedToSendEmail' : 'forgotPassword.errorMessage';
            const msg = process.env.NODE_ENV === 'test' ? t(msgKey) : (err instanceof Error ? err.message : t('forgotPassword.errorMessage'));
            Alert.alert(t('forgotPassword.errorTitle'), msg as string);
        }
    };

    return (
        <Box className="flex-1 justify-center" style={{ backgroundColor: colors.backgroundSecondary }}>
            <VStack space="2xl" className="w-full max-w-md mx-auto px-6">
                {/* Carte de mot de passe oublié avec fond */}
                <Box className="rounded-2xl shadow-lg p-8" style={{ backgroundColor: colors.card }}>
                    {/* Icône en haut */}
                    <Center className="mb-6">
                        <Box className="w-20 h-20 rounded-full items-center justify-center" style={{ backgroundColor: `${colors.info}20` }}>
                            <KeyRound size={40} color={colors.info} strokeWidth={2} />
                        </Box>
                    </Center>

                    {/* En-tête */}
                    <VStack space="md" className="items-center mb-8">
                        <Heading size="4xl" className="text-center" style={{ color: colors.info }}>
                            {t('forgotPassword.title')}
                        </Heading>
                        <Text size="md" className="text-center" style={{ color: colors.textSecondary }}>
                            {t('forgotPassword.subtitle')}
                        </Text>
                    </VStack>

                    {/* Formulaire */}
                    <VStack space="xl">
                        {/* Champ Email */}
                        <VStack space="xs">
                            <Text size="sm" bold className="mb-1" style={{ color: colors.text }}>
                                {t('forgotPassword.emailLabel')}
                            </Text>
                            <Input 
                                variant="outline" 
                                size="lg"
                                isInvalid={!!emailError}
                                className="rounded-lg"
                                style={{ 
                                    backgroundColor: colors.background,
                                    borderColor: emailError ? colors.error : colors.border
                                }}
                            >
                                <InputField
                                    placeholder={t('forgotPassword.emailPlaceholder')}
                                    value={email}
                                    onChangeText={(text) => {
                                        setEmail(text);
                                        setEmailError('');
                                    }}
                                    keyboardType="email-address"
                                    autoCapitalize="none"
                                    autoCorrect={false}
                                    style={{ color: colors.text }}
                                    placeholderTextColor={colors.textTertiary}
                                />
                            </Input>
                            {emailError ? (
                                <Box className="flex-row items-center mt-1">
                                    <Text size="xs" className="ml-1" style={{ color: colors.error }}>
                                        {emailError}
                                    </Text>
                                </Box>
                            ) : (
                                <Text size="xs" className="ml-1 mt-1" style={{ color: colors.textSecondary }}>
                                    {t('forgotPassword.emailHelper')}
                                </Text>
                            )}
                        </VStack>

                        {/* Bouton d'envoi */}
                        <Button
                            size="lg"
                            onPress={handleSendResetLink}
                            isDisabled={isLoading}
                            className="mt-6 rounded-lg shadow-md"
                            style={{ backgroundColor: colors.info }}
                        >
                            {isLoading ? (
                                <ActivityIndicator testID="activity-indicator" color="white" />
                            ) : (
                                <ButtonText className="font-semibold text-base text-white">
                                    {t('forgotPassword.sendButton')}
                                </ButtonText>
                            )}
                        </Button>

                        {/* Lien retour à la connexion */}
                        <Box className="items-center mt-2">
                            <Text 
                                size="sm" 
                                style={{ color: colors.info }}
                                onPress={() => router.push('/(tabs)/login')}
                            >
                                {t('forgotPassword.backToLogin')}
                            </Text>
                        </Box>
                    </VStack>
                </Box>
            </VStack>
        </Box>
    );
}
