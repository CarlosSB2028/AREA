import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Modal, TextInput, TouchableOpacity, Switch, ScrollView, KeyboardAvoidingView, Platform, Alert, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import type { User } from '@/types/admin';
import { getUserById } from '@/services/admin';
import { useThemeColors } from '@/hooks/useThemeColors';

interface UserModalProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (userData: Partial<User>) => Promise<void>;
  user?: User | null;
}

export default function UserModal({ visible, onClose, onSubmit, user }: UserModalProps) {
  const { t } = useTranslation();
  const colors = useThemeColors();
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    username: '',
    email: '',
    password: '',
    isAdmin: false,
  });
  const [loading, setLoading] = useState(false);
  const [fetchingUser, setFetchingUser] = useState(false);

  useEffect(() => {
    const loadUserData = async () => {
      if (user) {
        setFetchingUser(true);
        try {
          const userData: any = await getUserById(user.id.toString());
          let firstName = '';
          let lastName = '';
          if (userData.firstname) {
            firstName = userData.firstname;
          } else if (userData.firstName) {
            firstName = userData.firstName;
          } else if (userData.name && typeof userData.name === 'string') {
            const nameParts = userData.name.split(' ');
            firstName = nameParts[0] || '';
          }
          if (userData.lastname) {
            lastName = userData.lastname;
          } else if (userData.lastName) {
            lastName = userData.lastName;
          } else if (userData.name && typeof userData.name === 'string') {
            const nameParts = userData.name.split(' ');
            lastName = nameParts.slice(1).join(' ') || '';
          }
          setFormData({
            firstName,
            lastName,
            username: userData.username || '',
            email: userData.email || '',
            password: '',
            isAdmin: userData.role === 'Admin' || userData.isAdmin === true,
          });
        } catch (error) {
          console.error('Error fetching user data:', error);
          Alert.alert(t('admin.modal.loadError'));
          onClose();
        } finally {
          setFetchingUser(false);
        }
      } else {
        setFormData({
          firstName: '',
          lastName: '',
          username: '',
          email: '',
          password: '',
          isAdmin: false,
        });
      }
    };

    if (visible) {
      loadUserData();
    }
  }, [user, visible, t, onClose]);

  const handleSubmit = async () => {
    if (!formData.firstName.trim())
      return Alert.alert(t('admin.modal.validationError'), t('admin.modal.firstNameRequired'));
    if (!formData.lastName.trim())
      return Alert.alert(t('admin.modal.validationError'), t('admin.modal.lastNameRequired'));
    if (!formData.username.trim())
      return Alert.alert(t('admin.modal.validationError'), 'Username is required');
    if (!formData.email.trim())
      return Alert.alert(t('admin.modal.validationError'), t('admin.modal.emailRequired'));
    if (!user && !formData.password.trim())
      return Alert.alert(t('admin.modal.validationError'), t('admin.modal.passwordRequired'));
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email))
      return Alert.alert(t('admin.modal.validationError'), t('admin.modal.emailInvalid'));

    try {
      setLoading(true);
      const userData: any = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        username: formData.username,
        email: formData.email,
        isAdmin: formData.isAdmin,
      };
      if (formData.password.trim())
        userData.password = formData.password;
      if (user)
        userData.id = user.id;
      await onSubmit(userData);
      onClose();
    } catch (error) {
      console.error('Error submitting user:', error);
      Alert.alert('Error', 'Failed to save user. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.modalOverlay}
      >
        <View style={[styles.modalContainer, { backgroundColor: colors.background }]}>
          <View style={[styles.modalHeader, { borderBottomColor: colors.border }]}>
            <Text style={[styles.modalTitle, { color: colors.text }]}>
              {user ? t('admin.modal.editTitle') : t('admin.modal.addTitle')}
            </Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close" size={24} color={colors.text} />
            </TouchableOpacity>
          </View>
          {fetchingUser ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={colors.primary} />
              <Text style={[styles.loadingText, { color: colors.textSecondary }]}>{t('admin.modal.loadingUserData')}</Text>
            </View>
          ) : (
            <ScrollView style={styles.modalContent}>
              <View style={styles.formGroup}>
                <Text style={[styles.label, { color: colors.text }]}>{t('admin.modal.firstNameLabel')}</Text>
                <TextInput
                  style={[styles.input, { backgroundColor: colors.backgroundSecondary, color: colors.text, borderColor: colors.border }]}
                  placeholder={t('admin.modal.firstNamePlaceholder')}
                  placeholderTextColor={colors.textTertiary}
                  value={formData.firstName}
                  onChangeText={(text) =>
                    setFormData({ ...formData, firstName: text })
                  }
                  editable={!loading}
                />
              </View>
              <View style={styles.formGroup}>
                <Text style={[styles.label, { color: colors.text }]}>{t('admin.modal.lastNameLabel')}</Text>
                <TextInput
                  style={[styles.input, { backgroundColor: colors.backgroundSecondary, color: colors.text, borderColor: colors.border }]}
                  placeholder={t('admin.modal.lastNamePlaceholder')}
                  placeholderTextColor={colors.textTertiary}
                  value={formData.lastName}
                  onChangeText={(text) =>
                    setFormData({ ...formData, lastName: text })
                  }
                  editable={!loading}
                />
              </View>
              <View style={styles.formGroup}>
                <Text style={[styles.label, { color: colors.text }]}>Username</Text>
                <TextInput
                  style={[styles.input, { backgroundColor: colors.backgroundSecondary, color: colors.text, borderColor: colors.border }]}
                  placeholder="Enter username"
                  placeholderTextColor={colors.textTertiary}
                  value={formData.username}
                  onChangeText={(text) =>
                    setFormData({ ...formData, username: text })
                  }
                  autoCapitalize="none"
                  editable={!loading}
                />
              </View>
              <View style={styles.formGroup}>
                <Text style={[styles.label, { color: colors.text }]}>{t('admin.modal.emailLabel')}</Text>
                <TextInput
                  style={[styles.input, { backgroundColor: colors.backgroundSecondary, color: colors.text, borderColor: colors.border }]}
                  placeholder={t('admin.modal.emailPlaceholder')}
                  placeholderTextColor={colors.textTertiary}
                  value={formData.email}
                  onChangeText={(text) =>
                    setFormData({ ...formData, email: text })
                  }
                  keyboardType="email-address"
                  autoCapitalize="none"
                  editable={!loading}
                />
              </View>
              {!user && (
                <View style={styles.formGroup}>
                  <Text style={[styles.label, { color: colors.text }]}>{t('admin.modal.passwordLabel')}</Text>
                  <TextInput
                    style={[styles.input, { backgroundColor: colors.backgroundSecondary, color: colors.text, borderColor: colors.border }]}
                    placeholder={t('admin.modal.passwordPlaceholder')}
                    placeholderTextColor={colors.textTertiary}
                    value={formData.password}
                    onChangeText={(text) =>
                      setFormData({ ...formData, password: text })
                    }
                    secureTextEntry
                    editable={!loading}
                  />
                </View>
              )}
              <View style={styles.formGroup}>
                <View style={styles.switchContainer}>
                  <Text style={[styles.label, { color: colors.text }]}>{t('admin.modal.administratorLabel')}</Text>
                  <Switch
                    value={formData.isAdmin}
                    onValueChange={(value) =>
                      setFormData({ ...formData, isAdmin: value })
                    }
                    disabled={loading}
                    trackColor={{ false: colors.border, true: colors.info }}
                    thumbColor={formData.isAdmin ? '#FFFFFF' : '#F4F3F4'}
                  />
                </View>
                <Text style={[styles.helperText, { color: colors.textSecondary }]}>
                  {t('admin.modal.administratorHelper')}
                </Text>
              </View>
            </ScrollView>
          )}

          <View style={[styles.modalFooter, { borderTopColor: colors.border }]}>
            <TouchableOpacity
              style={[styles.button, styles.cancelButton, { backgroundColor: colors.backgroundSecondary }]}
              onPress={onClose}
              disabled={loading || fetchingUser}
            >
              <Text style={[styles.cancelButtonText, { color: colors.textSecondary }]}>{t('admin.modal.cancelButton')}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.button,
                styles.submitButton,
                { backgroundColor: colors.info },
                (loading || fetchingUser) && { backgroundColor: colors.disabled }
              ]}
              onPress={handleSubmit}
              disabled={loading || fetchingUser}
            >
              <Text style={styles.submitButtonText}>
                {loading ? t('admin.modal.savingButton') : user ? t('admin.modal.updateButton') : t('admin.modal.addButton')}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  closeButton: {
    padding: 4,
  },
  modalContent: {
    padding: 20,
  },
  formGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  input: {
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    borderWidth: 1,
  },
  switchContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  helperText: {
    fontSize: 12,
  },
  modalFooter: {
    flexDirection: 'row',
    padding: 20,
    borderTopWidth: 1,
    gap: 12,
  },
  button: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButton: {
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  submitButton: {
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  loadingContainer: {
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
  },
});
