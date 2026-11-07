import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import { ArrowLeft, Camera, Save } from 'lucide-react-native';
import React, { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Alert, BackHandler, ScrollView, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { Avatar, AvatarBadge, AvatarFallbackText, AvatarImage } from '@/components/ui/avatar';
import { Box } from '@/components/ui/box';
import { Button, ButtonIcon, ButtonText } from '@/components/ui/button';
import { Heading } from '@/components/ui/heading';
import { useDesignTokens } from '@/components/ui/hooks/useDesignTokens';
import { HStack } from '@/components/ui/hstack';
import { Icon } from '@/components/ui/icon';
import { Input, InputField } from '@/components/ui/input';
import { Pressable } from '@/components/ui/pressable';
import { Text } from '@/components/ui/text';
import { VStack } from '@/components/ui/vstack';
import { useAuth } from '@/contexts/AuthContext';
import { getCurrentUser, updateUserProfile, uploadAvatarImage } from '@/services/auth';
import { useThemeColors } from '@/hooks/useThemeColors';

interface ProfileFormData {
  email: string;
  username: string;
  firstName: string;
  lastName: string;
  password: string;
}

export default function EditProfileScreen() {
  const { t } = useTranslation();
  const { user, updateUser } = useAuth();
  const router = useRouter();
  const { getToken } = useDesignTokens();
  const colors = useThemeColors();

  const [formData, setFormData] = useState<ProfileFormData>({
    email: '',
    username: '',
    firstName: '',
    lastName: '',
    password: '',
  });
  const [avatar, setAvatar] = useState('');
  const [avatarFile, setAvatarFile] = useState<string | null>(null);
  const [originalAvatarSrc, setOriginalAvatarSrc] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingUser, setIsLoadingUser] = useState(true);
  const [errors, setErrors] = useState<Partial<ProfileFormData>>({});
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' | 'warning' } | null>(null);

  const [initialValues, setInitialValues] = useState<ProfileFormData>({
    email: '',
    username: '',
    firstName: '',
    lastName: '',
    password: '',
  });

  useFocusEffect(
    React.useCallback(() => {
      const loadUserData = async () => {
        try {
          setIsLoadingUser(true);
          let userData = await getCurrentUser();
          if (!userData && user)
            userData = user;
          if (userData) {
            const profileData: ProfileFormData = {
              email: userData.email || '',
              username: userData.username || '',
              firstName: userData.firstname || '',
              lastName: userData.lastname || '',
              password: '',
            };
            setFormData(profileData);
            setInitialValues(profileData);
            setAvatar(userData.avatarUrl || '');
            setOriginalAvatarSrc(userData.avatarUrl || '');
            setErrors({});
            setAvatarFile(null);
          }
        } catch (error) {
          console.error('Failed to load user data:', error);
          if (user) {
            const profileData: ProfileFormData = {
              email: user.email || '',
              username: user.username || '',
              firstName: user.firstname || '',
              lastName: user.lastname || '',
              password: '',
            };
            setFormData(profileData);
            setInitialValues(profileData);
            setAvatar(user.avatarUrl || '');
            setOriginalAvatarSrc(user.avatarUrl || '');
          } else {
            setNotification({
              message: t('editProfile.loadError', 'Failed to load profile data'),
              type: 'error',
            });
          }
        } finally {
          setIsLoadingUser(false);
        }
      };

      loadUserData();
    }, [user, t])
  );

  const hasUnsavedChanges = useCallback(() => {
    return (
      formData.email !== initialValues.email ||
      formData.username !== initialValues.username ||
      formData.firstName !== initialValues.firstName ||
      formData.lastName !== initialValues.lastName ||
      formData.password !== initialValues.password ||
      avatarFile !== null
    );
  }, [formData, initialValues, avatarFile]);

  const validateForm = useCallback((): boolean => {
    const newErrors: Partial<ProfileFormData> = {};

    if (!formData.email.trim()) {
      newErrors.email = t('editProfile.emailRequired');
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email)) {
        newErrors.email = t('editProfile.emailInvalid');
      }
    }

    if (!formData.firstName.trim()) {
      newErrors.firstName = t('editProfile.firstNameRequired', 'First name is required');
    } else if (formData.firstName.length > 100) {
      newErrors.firstName = t('editProfile.firstNameTooLong', 'First name must be at most 100 characters');
    }
    if (!formData.lastName.trim()) {
      newErrors.lastName = t('editProfile.lastNameRequired', 'Last name is required');
    } else if (formData.lastName.length > 100) {
      newErrors.lastName = t('editProfile.lastNameTooLong', 'Last name must be at most 100 characters');
    }
    if (formData.password && formData.password.length < 6) {
      newErrors.password = t('editProfile.passwordTooShort', 'Password must be at least 6 characters');
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData, t]);

  const handleSave = useCallback(async () => {
    if (!validateForm())
      return;
    setIsLoading(true);
    try {
      try {
        await getCurrentUser();
      } catch (authError) {
        console.error('User not authenticated:', authError);
        setNotification({
          message: t('editProfile.sessionExpired', 'Your session has expired. Please log in again.'),
          type: 'error',
        });
        setIsLoading(false);
        return;
      }
      let avatarUrl = originalAvatarSrc;
      if (avatarFile) {
        try {
          console.log('Uploading avatar from:', avatarFile);
          avatarUrl = await uploadAvatarImage(avatarFile);
          console.log('Avatar uploaded successfully:', avatarUrl);
          setOriginalAvatarSrc(avatarUrl);
        } catch (uploadError) {
          console.error('Failed to upload avatar:', uploadError);
          setNotification({
            message: t('editProfile.avatarUploadFailed', 'Failed to upload avatar. Profile will be updated without avatar change.'),
            type: 'warning',
          });
          avatarUrl = originalAvatarSrc;
        }
      }
      if (user?.id) {
        const updateData: {
          firstname?: string;
          lastname?: string;
          username?: string;
          password?: string;
          avatarUrl?: string;
        } = {
          firstname: formData.firstName,
          lastname: formData.lastName,
        };
        if (formData.username)
          updateData.username = formData.username;
        if (formData.password && formData.password.trim() !== '') {
          updateData.password = formData.password;
        }
        if (avatarFile && avatarUrl) {
          updateData.avatarUrl = avatarUrl;
        }
        const updatedUser = await updateUserProfile(user.id, updateData);
        if (updateUser) {
          await updateUser(updatedUser);
        }
        setAvatar(updatedUser.avatarUrl || '');
        setOriginalAvatarSrc(updatedUser.avatarUrl || '');
        setAvatarFile(null);
        const updatedFormData: ProfileFormData = {
          email: updatedUser.email || '',
          username: updatedUser.username || '',
          firstName: updatedUser.firstname || '',
          lastName: updatedUser.lastname || '',
          password: '',
        };
        setFormData(updatedFormData);
        setInitialValues(updatedFormData);

        setNotification({
          message: t('editProfile.successMessage', 'Profile updated successfully!'),
          type: 'success',
        });
        setTimeout(() => {
          router.back();
        }, 1500);
      }
    } catch (error: any) {
      console.error('Failed to update profile', error);
      if (error.response?.status === 403) {
        setNotification({
          message: t('editProfile.unauthorized', 'You are not authorized to update your profile.'),
          type: 'error',
        });
      } else if (error.response?.status === 404) {
        setNotification({
          message: t('editProfile.userNotFound', 'User not found. Please try logging in again.'),
          type: 'error',
        });
      } else if (error.response?.status === 400) {
        const errorMessage = error.response?.data?.error || t('editProfile.invalidRequest', 'Invalid request. Please check your input.');
        setNotification({
          message: errorMessage,
          type: 'error',
        });
      } else {
        setNotification({
          message: t('editProfile.updateError', 'Failed to update profile. Please try again.'),
          type: 'error',
        });
      }
    } finally {
      setIsLoading(false);
    }
  }, [validateForm, formData, avatarFile, user, updateUser, t, router, originalAvatarSrc]);

  const handleBackPress = useCallback(() => {
    if (hasUnsavedChanges()) {
      Alert.alert(
        t('editProfile.unsavedChangesTitle'),
        t('editProfile.unsavedChangesMessage'),
        [
          {
            text: t('editProfile.keepEditing'),
            style: 'cancel',
          },
          {
            text: t('editProfile.discardChanges'),
            style: 'destructive',
            onPress: () => {
              setFormData(initialValues);
              setAvatar(originalAvatarSrc);
              setAvatarFile(null);
              router.back();
            },
          },
          {
            text: t('editProfile.saveChanges'),
            onPress: handleSave,
          },
        ]
      );
    } else {
      router.back();
    }
  }, [hasUnsavedChanges, initialValues, originalAvatarSrc, t, router, handleSave]);
  useEffect(() => {
    const onBackPress = () => {
      if (hasUnsavedChanges()) {
        handleBackPress();
        return true;
      }
      return false;
    };
    const subscription = BackHandler.addEventListener('hardwareBackPress', onBackPress);
    return () => subscription.remove();
  }, [hasUnsavedChanges, handleBackPress]);

  const getUserInitials = () => {
    if (formData.firstName && formData.lastName) {
      return `${formData.firstName[0]}${formData.lastName[0]}`.toUpperCase();
    }
    if (user?.name) {
      return user.name.substring(0, 2).toUpperCase();
    }
    return 'U';
  };

  const handleChangePhoto = () => {
    Alert.alert(
      t('editProfile.changePhoto'),
      t('editProfile.changePhotoMessage'),
      [
        {
          text: t('editProfile.cancel'),
          style: 'cancel',
        },
        {
          text: t('editProfile.camera'),
          onPress: pickImageFromCamera,
        },
        {
          text: t('editProfile.gallery'),
          onPress: pickImageFromGallery,
        },
      ]
    );
  };

  const pickImageFromCamera = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert(
        t('editProfile.permissionDenied'),
        t('editProfile.cameraPermissionMessage')
      );
      return;
    }

    try {
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        if (result.assets[0].fileSize && result.assets[0].fileSize > 5 * 1024 * 1024) {
          setNotification({
            message: t('editProfile.fileTooLarge', 'File size must be less than 5MB'),
            type: 'error',
          });
          return;
        }
        setAvatar(result.assets[0].uri);
        setAvatarFile(result.assets[0].uri);
      }
    } catch (error) {
      console.error('Camera error:', error);
      Alert.alert(t('editProfile.error'), t('editProfile.cameraError'));
    }
  };

  const pickImageFromGallery = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert(
        t('editProfile.permissionDenied'),
        t('editProfile.galleryPermissionMessage')
      );
      return;
    }

    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        if (result.assets[0].fileSize && result.assets[0].fileSize > 5 * 1024 * 1024) {
          setNotification({
            message: t('editProfile.fileTooLarge', 'File size must be less than 5MB'),
            type: 'error',
          });
          return;
        }
        setAvatar(result.assets[0].uri);
        setAvatarFile(result.assets[0].uri);
      }
    } catch (error) {
      console.error('Gallery error:', error);
      Alert.alert(t('editProfile.error'), t('editProfile.galleryError'));
    }
  };

  if (isLoadingUser) {
    return (
      <SafeAreaView className="flex-1 bg-background-0">
        <Box className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color={getToken('primary-500')} />
          <Text className="text-typography-600 mt-4">
            {t('editProfile.loading', 'Loading profile...')}
          </Text>
        </Box>
      </SafeAreaView>
    );
  }

  if (!user) {
    return (
      <SafeAreaView className="flex-1 bg-background-0">
        <Box className="flex-1 items-center justify-center px-6">
          <Text className="text-typography-900 text-center">
            {t('editProfile.noUser', 'Failed to load user data.')}
          </Text>
        </Box>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-background-0">
      <Box className="px-6 py-4" style={{ backgroundColor: colors.info }}>
        <HStack space="md" align="center">
          <Pressable onPress={handleBackPress}>
            <Icon as={ArrowLeft} size="xl" className="text-white" />
          </Pressable>
          <Heading size="xl" className="text-white flex-1">
            {t('editProfile.title')}
          </Heading>
          <Button
            size="sm"
            onPress={handleSave}
            isDisabled={isLoading || !hasUnsavedChanges()}
            style={{ backgroundColor: 'white' }}
          >
            <ButtonIcon as={Save} color={colors.info} />
            <ButtonText className="text-blue-600 font-semibold">{t('editProfile.save')}</ButtonText>
          </Button>
        </HStack>
      </Box>

      <ScrollView className="flex-1" contentContainerStyle={{ paddingBottom: 32 }}>
        {notification && (
          <Box
            className="mx-6 mt-4 p-4 rounded-lg"
            style={{
              backgroundColor:
                notification.type === 'success' ? '#d1fae5' :
                notification.type === 'error' ? '#fee2e2' :
                '#fef3c7',
            }}
          >
            <HStack space="sm" align="center" className="justify-between">
              <Text
                className="flex-1"
                style={{
                  color:
                    notification.type === 'success' ? '#065f46' :
                    notification.type === 'error' ? '#991b1b' :
                    '#78350f',
                }}
              >
                {notification.message}
              </Text>
              <Pressable onPress={() => setNotification(null)}>
                <Text style={{ color: getToken('typography-500') }}>✕</Text>
              </Pressable>
            </HStack>
          </Box>
        )}

        {/* Avatar Section */}
        <Box className="items-center py-8">
          <Box className="relative">
            <Avatar size="2xl">
              <AvatarFallbackText>{getUserInitials()}</AvatarFallbackText>
              {avatar && (
                <AvatarImage source={{ uri: avatar }} />
              )}
              <AvatarBadge />
            </Avatar>
            <Pressable
              onPress={handleChangePhoto}
              className="absolute bottom-0 right-0 bg-background-0 rounded-full p-3 border-2 border-primary-500"
              style={{
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.3,
                shadowRadius: 4,
                elevation: 6,
              }}
            >
              <Camera size={20} color={getToken('primary-500')} />
            </Pressable>
          </Box>
          <Text className="text-typography-600 mt-3">
            {t('editProfile.changePhoto')}
          </Text>
        </Box>

        <VStack className="px-6 gap-6">
          <VStack className="gap-2">
            <Text className="text-typography-900 font-medium">
              {t('editProfile.emailLabel')}
            </Text>
            <Input variant="outline" size="lg" isReadOnly>
              <InputField
                placeholder={t('editProfile.emailPlaceholder')}
                value={formData.email}
                keyboardType="email-address"
                autoCapitalize="none"
                editable={false}
              />
            </Input>
            <Text size="sm" className="text-typography-500">
              {t('editProfile.emailReadOnly', 'Email cannot be changed')}
            </Text>
          </VStack>

          <VStack className="gap-2">
            <Text className="text-typography-900 font-medium">
              {t('editProfile.usernameLabel', 'Username')}
            </Text>
            <Input variant="outline" size="lg" isInvalid={!!errors.username}>
              <InputField
                placeholder={t('editProfile.usernamePlaceholder', 'Username')}
                value={formData.username}
                onChangeText={(text) => {
                  setFormData({ ...formData, username: text });
                  if (errors.username) {
                    setErrors({ ...errors, username: undefined });
                  }
                }}
                maxLength={50}
                autoCapitalize="none"
              />
            </Input>
            <Text size="xs" className="text-typography-500 text-right">
              {formData.username.length}/50 characters
            </Text>
            {errors.username && (
              <Text size="sm" className="text-error-600">{errors.username}</Text>
            )}
          </VStack>

          <VStack className="gap-2">
            <Text className="text-typography-900 font-medium">
              {t('editProfile.firstNameLabel', 'First Name')}
            </Text>
            <Input variant="outline" size="lg" isInvalid={!!errors.firstName}>
              <InputField
                placeholder={t('editProfile.firstNamePlaceholder', 'First Name')}
                value={formData.firstName}
                onChangeText={(text) => {
                  setFormData({ ...formData, firstName: text });
                  if (errors.firstName) {
                    setErrors({ ...errors, firstName: undefined });
                  }
                }}
                maxLength={100}
              />
            </Input>
            <Text size="xs" className="text-typography-500 text-right">
              {formData.firstName.length}/100 characters
            </Text>
            {errors.firstName && (
              <Text size="sm" className="text-error-600">{errors.firstName}</Text>
            )}
          </VStack>

          <VStack className="gap-2">
            <Text className="text-typography-900 font-medium">
              {t('editProfile.lastNameLabel', 'Last Name')}
            </Text>
            <Input variant="outline" size="lg" isInvalid={!!errors.lastName}>
              <InputField
                placeholder={t('editProfile.lastNamePlaceholder', 'Last Name')}
                value={formData.lastName}
                onChangeText={(text) => {
                  setFormData({ ...formData, lastName: text });
                  if (errors.lastName) {
                    setErrors({ ...errors, lastName: undefined });
                  }
                }}
                maxLength={100}
              />
            </Input>
            <Text size="xs" className="text-typography-500 text-right">
              {formData.lastName.length}/100 characters
            </Text>
            {errors.lastName && (
              <Text size="sm" className="text-error-600">{errors.lastName}</Text>
            )}
          </VStack>

          <VStack className="gap-2">
            <Text className="text-typography-900 font-medium">
              {t('editProfile.passwordLabel', 'New Password (optional)')}
            </Text>
            <Input variant="outline" size="lg" isInvalid={!!errors.password}>
              <InputField
                placeholder={t('editProfile.passwordPlaceholder', 'Leave empty to keep current password')}
                value={formData.password}
                onChangeText={(text) => {
                  setFormData({ ...formData, password: text });
                  if (errors.password) {
                    setErrors({ ...errors, password: undefined });
                  }
                }}
                secureTextEntry
              />
            </Input>
            <Text size="sm" className="text-typography-500">
              {t('editProfile.passwordHelper', 'Leave empty to keep current password')}
            </Text>
            {errors.password && (
              <Text size="sm" className="text-error-600">{errors.password}</Text>
            )}
          </VStack>
        </VStack>
      </ScrollView>
    </SafeAreaView>
  );
}
