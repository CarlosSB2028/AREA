import { Box } from '@/components/ui/box';
import { Button, ButtonText } from '@/components/ui/button';
import { Center } from '@/components/ui/center';
import { Heading } from '@/components/ui/heading';
import { Input, InputField, InputIcon, InputSlot } from '@/components/ui/input';
import { Text } from '@/components/ui/text';
import { VStack } from '@/components/ui/vstack';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'expo-router';
import { EyeIcon, EyeOffIcon, UserPlus } from 'lucide-react-native';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ActivityIndicator, Alert, ScrollView } from 'react-native';
import { useThemeColors } from '@/hooks/useThemeColors';

export default function RegisterScreen() {
    const { t } = useTranslation();
    const { register, isLoading, clearError } = useAuth();
    const router = useRouter();
    const colors = useThemeColors();
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [firstNameError, setFirstNameError] = useState('');
    const [lastNameError, setLastNameError] = useState('');
    const [usernameError, setUsernameError] = useState('');
    const [emailError, setEmailError] = useState('');
    const [passwordError, setPasswordError] = useState('');
    const [confirmPasswordError, setConfirmPasswordError] = useState('');

    const handleShowPassword = () => {
        setShowPassword((prev) => !prev);
    };

    const handleShowConfirmPassword = () => {
        setShowConfirmPassword((prev) => !prev);
    };

    const validateEmail = (email: string) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    };

    const handleRegister = async () => {
        setFirstNameError('');
        setLastNameError('');
        setUsernameError('');
        setEmailError('');
        setPasswordError('');
        setConfirmPasswordError('');
        clearError();

        let hasError = false;

        if (!firstName) {
            setFirstNameError(t('register.firstNameRequired') || 'First name is required');
            hasError = true;
        } else if (firstName.length < 2) {
            setFirstNameError(t('register.firstNameTooShort') || 'First name is too short');
            hasError = true;
        }

        if (!lastName) {
            setLastNameError(t('register.lastNameRequired') || 'Last name is required');
            hasError = true;
        } else if (lastName.length < 2) {
            setLastNameError(t('register.lastNameTooShort') || 'Last name is too short');
            hasError = true;
        }

        if (!username) {
            setUsernameError(t('register.usernameRequired') || 'Username is required');
            hasError = true;
        } else if (username.length < 3) {
            setUsernameError(t('register.usernameTooShort') || 'Username must be at least 3 characters');
            hasError = true;
        } else if (username.length > 50) {
            setUsernameError(t('register.usernameTooLong') || 'Username must not exceed 50 characters');
            hasError = true;
        }

        if (!email) {
            setEmailError(t('register.emailRequired'));
            hasError = true;
        } else if (!validateEmail(email)) {
            setEmailError(t('register.emailInvalid'));
            hasError = true;
        }

        if (!password) {
            setPasswordError(t('register.passwordRequired'));
            hasError = true;
        } else if (password.length < 8) {
            setPasswordError(t('register.passwordTooShort'));
            hasError = true;
        }

        if (!confirmPassword) {
            setConfirmPasswordError(t('register.confirmPasswordRequired'));
            hasError = true;
        } else if (password !== confirmPassword) {
            setConfirmPasswordError(t('register.passwordMismatch'));
            hasError = true;
        }

        if (hasError) {
            return;
        }

        try {
            await register(email, password, firstName, lastName, username);
            Alert.alert(
                t('register.successTitle') || 'Inscription réussie',
                t('register.successMessage') || 'Votre compte a été créé avec succès',
                [
                    {
                        text: 'OK',
                        onPress: () => router.replace('/(tabs)'),
                    },
                ]
            );
        } catch (err) {
            const msg = err instanceof Error ? err.message : (t('register.errorMessage') || "L'inscription a échoué");
            Alert.alert(
                t('register.errorTitle') || 'Erreur',
                msg
            );
        }
    };

    return (
        <ScrollView className="flex-1" style={{ backgroundColor: colors.backgroundSecondary }}>
            <Box className="flex-1 justify-center py-8">
                <VStack space="2xl" className="w-full max-w-md mx-auto px-6">
                    {/* Registration card with background */}
                    <Box className="rounded-2xl shadow-lg p-8" style={{ backgroundColor: colors.card }}>
                        {/* Top icon */}
                        <Center className="mb-6">
                            <Box className="w-20 h-20 rounded-full items-center justify-center" style={{ backgroundColor: `${colors.info}20` }}>
                                <UserPlus size={40} color={colors.info} strokeWidth={2} />
                            </Box>
                        </Center>

                        {/* Header */}
                        <VStack space="md" className="items-center mb-8">
                            <Heading size="4xl" className="text-center" style={{ color: colors.info }}>
                                {t('register.title')}
                            </Heading>
                            <Text size="md" className="text-center" style={{ color: colors.textSecondary }}>
                                {t('register.subtitle')}
                            </Text>
                        </VStack>

                        <VStack space="xl">
                            <VStack space="xs">
                                <Text size="sm" bold className="mb-1" style={{ color: colors.text }}>
                                    {t('register.firstNameLabel') || 'First Name'}
                                </Text>
                                <Input
                                    variant="outline"
                                    size="lg"
                                    isInvalid={!!firstNameError}
                                    className="rounded-lg" style={{ backgroundColor: colors.background, borderColor: colors.border }}
                                >
                                    <InputField
                                        placeholder={t('register.firstNamePlaceholder') || 'Enter your first name'}
                                        value={firstName}
                                        onChangeText={(text) => {
                                            setFirstName(text);
                                            setFirstNameError('');
                                        }}
                                        autoCapitalize="words"
                                        autoCorrect={false}
                                        style={{ color: colors.text }}
                                        placeholderTextColor={colors.textTertiary}
                                    />
                                </Input>
                                {firstNameError ? (
                                    <Box className="flex-row items-center mt-1">
                                        <Text size="xs" className="ml-1" style={{ color: colors.error }}>
                                            {firstNameError}
                                        </Text>
                                    </Box>
                                ) : (
                                    <Text size="xs" className="ml-1 mt-1" style={{ color: colors.textSecondary }}>
                                        {t('register.firstNameHelper') || 'Your first name'}
                                    </Text>
                                )}
                            </VStack>
                            <VStack space="xs">
                                <Text size="sm" bold className="mb-1" style={{ color: colors.text }}>
                                    {t('register.lastNameLabel') || 'Last Name'}
                                </Text>
                                <Input
                                    variant="outline"
                                    size="lg"
                                    isInvalid={!!lastNameError}
                                    className="rounded-lg" style={{ backgroundColor: colors.background, borderColor: colors.border }}
                                >
                                    <InputField
                                        placeholder={t('register.lastNamePlaceholder') || 'Enter your last name'}
                                        value={lastName}
                                        onChangeText={(text) => {
                                            setLastName(text);
                                            setLastNameError('');
                                        }}
                                        autoCapitalize="words"
                                        autoCorrect={false}
                                    />
                                </Input>
                                {lastNameError ? (
                                    <Box className="flex-row items-center mt-1">
                                        <Text size="xs" className="ml-1" style={{ color: colors.error }}>
                                            {lastNameError}
                                        </Text>
                                    </Box>
                                ) : (
                                    <Text size="xs" className="ml-1 mt-1" style={{ color: colors.textSecondary }}>
                                        {t('register.lastNameHelper') || 'Your last name'}
                                    </Text>
                                )}
                            </VStack>

                            <VStack space="xs">
                                <Text size="sm" bold className="mb-1" style={{ color: colors.text }}>
                                    {'Username'}
                                </Text>
                                <Input
                                    variant="outline"
                                    size="lg"
                                    isInvalid={!!usernameError}
                                    className="rounded-lg" style={{ backgroundColor: colors.background, borderColor: colors.border }}
                                >
                                    <InputField
                                        placeholder={'Choose a username'}
                                        value={username}
                                        onChangeText={(text) => {
                                            setUsername(text);
                                            setUsernameError('');
                                        }}
                                        autoCapitalize="none"
                                        autoCorrect={false}
                                    />
                                </Input>
                                {usernameError ? (
                                    <Box className="flex-row items-center mt-1">
                                        <Text size="xs" className="ml-1" style={{ color: colors.error }}>
                                            {usernameError}
                                        </Text>
                                    </Box>
                                ) : (
                                    <Text size="xs" className="ml-1 mt-1" style={{ color: colors.textSecondary }}>
                                        {t('register.usernameHelper') || 'At least 3 characters'}
                                    </Text>
                                )}
                            </VStack>

                            {/* Email Field */}
                            <VStack space="xs">
                                <Text size="sm" bold className="mb-1" style={{ color: colors.text }}>
                                    {t('register.emailLabel')}
                                </Text>
                                <Input
                                    variant="outline"
                                    size="lg"
                                    isInvalid={!!emailError}
                                    className="rounded-lg" style={{ backgroundColor: colors.background, borderColor: colors.border }}
                                >
                                    <InputField
                                        placeholder={t('register.emailPlaceholder')}
                                        value={email}
                                        onChangeText={(text) => {
                                            setEmail(text);
                                            setEmailError('');
                                        }}
                                        keyboardType="email-address"
                                        autoCapitalize="none"
                                        autoCorrect={false}
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
                                        {t('register.emailHelper')}
                                    </Text>
                                )}
                            </VStack>

                            <VStack space="xs">
                                <Text size="sm" bold className="mb-1" style={{ color: colors.text }}>
                                    {t('register.passwordLabel')}
                                </Text>
                                <Input
                                    variant="outline"
                                    size="lg"
                                    isInvalid={!!passwordError}
                                    className="rounded-lg" style={{ backgroundColor: colors.background, borderColor: colors.border }}
                                >
                                    <InputField
                                        type={showPassword ? 'text' : 'password'}
                                        placeholder={t('register.passwordPlaceholder')}
                                        value={password}
                                        onChangeText={(text) => {
                                            setPassword(text);
                                            setPasswordError('');
                                        }}
                                        autoCapitalize="none"
                                        autoCorrect={false}
                                    />
                                    <InputSlot className="pr-3" onPress={handleShowPassword}>
                                        <InputIcon
                                            as={showPassword ? EyeIcon : EyeOffIcon}
                                            style={{ color: colors.textSecondary }}
                                        />
                                    </InputSlot>
                                </Input>
                                {passwordError ? (
                                    <Box className="flex-row items-center mt-1">
                                        <Text size="xs" className="ml-1" style={{ color: colors.error }}>
                                            {passwordError}
                                        </Text>
                                    </Box>
                                ) : (
                                    <Text size="xs" className="ml-1 mt-1" style={{ color: colors.textSecondary }}>
                                        {t('register.passwordHelper')}
                                    </Text>
                                )}
                            </VStack>

                            <VStack space="xs">
                                <Text size="sm" bold className="mb-1" style={{ color: colors.text }}>
                                    {t('register.confirmPasswordLabel')}
                                </Text>
                                <Input
                                    variant="outline"
                                    size="lg"
                                    isInvalid={!!confirmPasswordError}
                                    className="rounded-lg" style={{ backgroundColor: colors.background, borderColor: colors.border }}
                                >
                                    <InputField
                                        type={showConfirmPassword ? 'text' : 'password'}
                                        placeholder={t('register.confirmPasswordPlaceholder')}
                                        value={confirmPassword}
                                        onChangeText={(text) => {
                                            setConfirmPassword(text);
                                            setConfirmPasswordError('');
                                        }}
                                        autoCapitalize="none"
                                        autoCorrect={false}
                                    />
                                    <InputSlot className="pr-3" onPress={handleShowConfirmPassword}>
                                        <InputIcon
                                            as={showConfirmPassword ? EyeIcon : EyeOffIcon}

                                        />
                                    </InputSlot>
                                </Input>
                                {confirmPasswordError ? (
                                    <Box className="flex-row items-center mt-1">
                                        <Text size="xs" className="ml-1" style={{ color: colors.error }}>
                                            {confirmPasswordError}
                                        </Text>
                                    </Box>
                                ) : (
                                    <Text size="xs" className="ml-1 mt-1" style={{ color: colors.textSecondary }}>
                                        {t('register.confirmPasswordHelper')}
                                    </Text>
                                )}
                            </VStack>

                            <Button
                                size="lg"
                                onPress={handleRegister}
                                isDisabled={isLoading}
                                className="mt-6 rounded-lg shadow-md" style={{ backgroundColor: colors.info }}
                            >
                                {isLoading ? (
                                    <ActivityIndicator testID="activity-indicator" color="white" />
                                ) : (
                                    <ButtonText className="font-semibold text-base">
                                        {t('register.registerButton')}
                                    </ButtonText>
                                )}
                            </Button>
                        </VStack>
                    </Box>

                    <Box className="items-center mt-4">
                        <Text size="sm" style={{ color: colors.textSecondary }}>
                            {t('register.hasAccount')}{' '}
                            <Text
                                size="sm"
                                bold
                                style={{ color: colors.info }}
                                onPress={() => router.push('/(tabs)/login')}
                            >
                                {t('register.signIn')}
                            </Text>
                        </Text>
                    </Box>
                </VStack>
            </Box>
        </ScrollView>
    );
}
