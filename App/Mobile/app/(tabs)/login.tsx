import { Box } from '@/components/ui/box';
import { Button, ButtonText } from '@/components/ui/button';
import { Center } from '@/components/ui/center';
import { Heading } from '@/components/ui/heading';
import { HStack } from '@/components/ui/hstack';
import { Input, InputField, InputIcon, InputSlot } from '@/components/ui/input';
import { Text } from '@/components/ui/text';
import { VStack } from '@/components/ui/vstack';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { EyeIcon, EyeOffIcon, LockKeyhole } from 'lucide-react-native';
import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { ActivityIndicator, Alert, Image, Linking } from 'react-native';
import { getOAuthProviders, OAuthProvider } from '@/services/oauth';
import { useThemeColors } from '@/hooks/useThemeColors';
import { getApiUrl } from '@/services/api.config';

export default function LoginScreen() {
  const { t } = useTranslation();
  const { login, isLoading, clearError } = useAuth();
  const router = useRouter();
  const params = useLocalSearchParams();
  const colors = useThemeColors();
  const [showPassword, setShowPassword] = useState(false);
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [identifierError, setIdentifierError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [oauthProviders, setOauthProviders] = useState<OAuthProvider[]>([]);

  useEffect(() => {
    const shouldReload = params.reloadProviders === 'true';

    if (shouldReload) {
      loadOAuthProviders();
      router.replace('/(tabs)/login');
    } else if (oauthProviders.length === 0) {
      loadOAuthProviders();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.reloadProviders]);

  const loadOAuthProviders = async () => {
    try {
      const providers = await getOAuthProviders();
      setOauthProviders(providers);
    } catch (error) {
      console.error('Failed to load OAuth providers:', error);
    }
  };

  const handleShowPassword = () => {
    setShowPassword((prev) => !prev);
  };

  const handleOAuthLogin = async (provider: OAuthProvider) => {
    try {
      const apiUrl = await getApiUrl();
      const redirectUri = encodeURIComponent('areamobile://oauth-callback');
      const authUrl = `${apiUrl}/api/oauth/${provider.providerKey.toLowerCase()}/authorize?origin=mobile&mode=login&mobile_redirect=${redirectUri}`;
      const canOpen = await Linking.canOpenURL(authUrl);
      if (canOpen) {
        await Linking.openURL(authUrl);
      } else {
        throw new Error('Cannot open URL');
      }
    } catch (error) {
      console.error('OAuth login error:', error);
      Alert.alert(
        t('login.errorTitle'),
        t('login.oauthError', 'Failed to initiate OAuth login')
      );
    }
  };

  const handleLogin = async () => {
    setIdentifierError('');
    setPasswordError('');
    clearError();

    let hasError = false;

    if (!identifier) {
      setIdentifierError(t('login.emailRequired') || 'Email or username is required');
      hasError = true;
    }

    if (!password) {
      setPasswordError(t('login.passwordRequired'));
      hasError = true;
    } else if (password.length < 8) {
      setPasswordError(t('login.passwordTooShort'));
      hasError = true;
    }

    if (hasError) {
      return;
    }

    try {
      await login(identifier, password);
      Alert.alert(
        t('login.successTitle') || 'Connexion réussie',
        t('login.successMessage') || 'Vous êtes maintenant connecté',
        [
          {
            text: 'OK',
            onPress: () => router.replace('/(tabs)'),
          },
        ]
      );
    } catch (err) {
      const msg = err instanceof Error ? err.message : (t('login.errorMessage') || 'La connexion a échoué');
      Alert.alert(
        t('login.errorTitle') || 'Erreur',
        msg
      );
    }
  };

  return (
    <Box className="flex-1 justify-center" style={{ backgroundColor: colors.backgroundSecondary }}>
      <VStack space="2xl" className="w-full max-w-md mx-auto px-6">
        {/* Carte de login avec fond */}
        <Box className="rounded-2xl shadow-lg p-8" style={{ backgroundColor: colors.card }}>
          {/* Icône en haut */}
          <Center className="mb-6">
            <Box className="w-20 h-20 rounded-full items-center justify-center" style={{ backgroundColor: `${colors.info}20` }}>
              <LockKeyhole size={40} color={colors.info} strokeWidth={2} />
            </Box>
          </Center>

          {/* En-tête */}
          <VStack space="md" className="items-center mb-8">
            <Heading size="4xl" className="text-center" style={{ color: colors.info }}>
              {t('login.title')}
            </Heading>
            <Text size="md" className="text-center" style={{ color: colors.textSecondary }}>
              {t('login.subtitle')}
            </Text>
          </VStack>

          <VStack space="xl">
            <VStack space="xs">
              <Text size="sm" bold className="mb-1" style={{ color: colors.text }}>
                {t('login.emailLabel') || 'Email or Username'}
              </Text>
              <Input
                variant="outline"
                size="lg"
                isInvalid={!!identifierError}
                className="rounded-lg"
                style={{
                  backgroundColor: colors.background,
                  borderColor: identifierError ? colors.error : colors.border
                }}
              >
                <InputField
                  placeholder={t('login.emailPlaceholder') || 'Enter email or username'}
                  value={identifier}
                  onChangeText={(text) => {
                    setIdentifier(text);
                    setIdentifierError('');
                  }}
                  autoCapitalize="none"
                  autoCorrect={false}
                  style={{ color: colors.text }}
                  placeholderTextColor={colors.textTertiary}
                />
              </Input>
              {identifierError ? (
                <Box className="flex-row items-center mt-1">
                  <Text size="xs" className="ml-1" style={{ color: colors.error }}>
                    ⚠️ {identifierError}
                  </Text>
                </Box>
              ) : (
                <Text size="xs" className="ml-1 mt-1" style={{ color: colors.textSecondary }}>
                  {t('login.emailHelper') || 'Your email or username'}
                </Text>
              )}
            </VStack>

            <VStack space="xs">
              <Text size="sm" bold className="mb-1" style={{ color: colors.text }}>
                {t('login.passwordLabel')}
              </Text>
              <Input
                variant="outline"
                size="lg"
                isInvalid={!!passwordError}
                className="rounded-lg"
                style={{
                  backgroundColor: colors.background,
                  borderColor: passwordError ? colors.error : colors.border
                }}
              >
                <InputField
                  type={showPassword ? 'text' : 'password'}
                  placeholder={t('login.passwordPlaceholder')}
                  value={password}
                  onChangeText={(text) => {
                    setPassword(text);
                    setPasswordError('');
                  }}
                  autoCapitalize="none"
                  autoCorrect={false}
                  style={{ color: colors.text }}
                  placeholderTextColor={colors.textTertiary}
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
                    ⚠️ {passwordError}
                  </Text>
                </Box>
              ) : (
                <Text size="xs" className="ml-1 mt-1" style={{ color: colors.textSecondary }}>
                  {t('login.passwordHelper')}
                </Text>
              )}
            </VStack>

            {/* Bouton de connexion */}
            <Button
              size="lg"
              onPress={handleLogin}
              isDisabled={isLoading}
              className="mt-6 rounded-lg shadow-md"
              style={{ backgroundColor: colors.info }}
            >
              {isLoading ? (
                <ActivityIndicator color="white" />
              ) : (
                <ButtonText className="font-semibold text-base text-white">
                  {t('login.loginButton')}
                </ButtonText>
              )}
            </Button>

            {/* Lien mot de passe oublié */}
            <Box className="items-center mt-2">
              <Text
                size="sm"
                style={{ color: colors.info }}
                onPress={() => router.push('/(tabs)/forgot-password')}
              >
                {t('login.forgotPassword')}
              </Text>
            </Box>

            {/* Divider avec texte */}
            <HStack space="md" className="items-center my-4">
              <Box className="flex-1 h-[1px]" style={{ backgroundColor: colors.border }} />
              <Text size="sm" style={{ color: colors.textSecondary }}>
                {t('login.orContinueWith')}
              </Text>
              <Box className="flex-1 h-[1px]" style={{ backgroundColor: colors.border }} />
            </HStack>

            {oauthProviders.length > 0 && (
              <Box className="flex-wrap flex-row justify-center" style={{ gap: 12 }}>
                {oauthProviders.map((provider) => (
                  <Button
                    key={provider.providerKey}
                    size="sm"
                    variant="outline"
                    onPress={() => handleOAuthLogin(provider)}
                    className="rounded-xl"
                    style={{
                      backgroundColor: colors.background,
                      borderColor: colors.border,
                      width: '20%',
                      aspectRatio: 1,
                      padding: 8
                    }}
                  >
                    <VStack space="xs" className="items-center justify-center flex-1">
                      <Image
                        source={{ uri: provider.providerLogoUrl }}
                        style={{ width: 32, height: 32 }}
                        resizeMode="contain"
                      />
                    </VStack>
                  </Button>
                ))}
              </Box>
            )}
          </VStack>
        </Box>

        {/* Section inscription */}
        <Box className="items-center mt-4">
          <Text size="sm" style={{ color: colors.textSecondary }}>
            {t('login.noAccount')}{' '}
            <Text
              size="sm"
              bold
              style={{ color: colors.info }}
              onPress={() => router.push('/(tabs)/register')}
            >
              {t('login.signUp')}
            </Text>
          </Text>
        </Box>
      </VStack>
    </Box>
  );
}
