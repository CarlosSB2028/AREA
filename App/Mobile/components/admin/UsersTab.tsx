import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, FlatList, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { getUsers, getCardUserData, deleteUser, createUser, updateUser } from '@/services/admin';
import type { User, CardUserDataPoint } from '@/types/admin';
import UserModal from './UserModal';
import { EmailNotVerifiedError } from '@/services/errors';
import { useThemeColors } from '@/hooks/useThemeColors';

export default function UsersTab() {
  const { t } = useTranslation();
  const colors = useThemeColors();
  const [users, setUsers] = useState<User[]>([]);
  const [cardData, setCardData] = useState<CardUserDataPoint[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRole, setSelectedRole] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);
  const fetchData = async () => {
    try {
      setLoading(true);
      const [usersData, cardUserData] = await Promise.all([
        getUsers(),
        getCardUserData(),
      ]);
      setUsers(Array.isArray(usersData) ? usersData : []);
      setCardData(Array.isArray(cardUserData) ? cardUserData : []);
    } catch (error) {
      console.error('Error fetching users data:', error);
      Alert.alert('Error', 'Failed to load users data');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchData();
    setRefreshing(false);
  };

  const handleAddUser = () => {
    setSelectedUser(null);
    setModalVisible(true);
  };

  const handleEditUser = (user: User) => {
    setSelectedUser(user);
    setModalVisible(true);
  };

  const handleDeleteUser = (user: User) => {
    Alert.alert(
      t('admin.users.deleteConfirmTitle'),
      t('admin.users.deleteConfirmMessage', { name: user.name }),
      [
        { text: t('admin.users.cancel'), style: 'cancel' },
        {
          text: t('admin.users.delete'),
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteUser(user.id.toString());
              setUsers(users.filter((u) => u.id !== user.id));
              Alert.alert(t('admin.users.deleteSuccess'));
              fetchData();
            } catch (error) {
              console.error('Error deleting user:', error);
              if (error instanceof EmailNotVerifiedError) {
                Alert.alert(
                  t('admin.users.emailVerificationRequired'),
                  t('admin.users.emailVerificationMessage'),
                  [{ text: 'OK' }]
                );
              } else {
                const errorMessage = error instanceof Error ? error.message : t('admin.users.deleteFailed');
                Alert.alert(errorMessage);
              }
            }
          },
        },
      ]
    );
  };
  const handleSubmitUser = async (userData: Partial<User>) => {
    try {
      if (selectedUser) {
        await updateUser(selectedUser.id.toString(), userData as any);
        Alert.alert(t('admin.users.updateSuccess'));
      } else {
        await createUser(userData as any);
        Alert.alert(t('admin.users.createSuccess'));
      }
      fetchData();
      setModalVisible(false);
      setSelectedUser(null);
    } catch (error) {
      console.error('Error saving user:', error);
      if (error instanceof EmailNotVerifiedError) {
        Alert.alert(
          t('admin.users.emailVerificationRequired'),
          t('admin.users.emailVerificationMessage'),
          [{ text: 'OK' }]
        );
      } else {
        const errorMessage = error instanceof Error ? error.message : t('admin.users.saveFailed');
        Alert.alert(errorMessage);
      }
      throw error;
    }
  };
  const filteredUsers = users.filter(
    (user) =>
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
      (selectedRole ? user.role === selectedRole : true)
  );
  const getIconName = (iconType: string): keyof typeof Ionicons.glyphMap => {
    switch (iconType) {
      case 'user':
        return 'people';
      case 'discount':
        return 'pricetag';
      case 'receipt':
        return 'receipt';
      case 'coin':
        return 'cash';
      default:
        return 'stats-chart';
    }
  };
  if (loading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: colors.backgroundSecondary }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }
  const renderHeader = () => (
    <>
      <View style={[styles.headerContainer, { backgroundColor: colors.background, borderBottomColor: colors.border }]}>
        <TouchableOpacity style={[styles.addButton, { backgroundColor: colors.info }]} onPress={handleAddUser}>
          <Ionicons name="add-circle" size={20} color="#FFF" />
          <Text style={styles.addButtonText}>{t('admin.users.addUser')}</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.statsContainer}>
        {cardData.map((card, index) => (
          <View key={index} style={[styles.statCard, { backgroundColor: colors.card }]}>
            <Ionicons
              name={getIconName(card.icon)}
              size={24}
              color={colors.info}
            />
            <Text style={[styles.statValue, { color: colors.text }]}>{card.value}</Text>
            <Text style={[styles.statTitle, { color: colors.textSecondary }]}>{card.title}</Text>
            <View style={styles.diffContainer}>
              <Ionicons
                name={card.diff >= 0 ? 'arrow-up' : 'arrow-down'}
                size={16}
                color={card.diff >= 0 ? colors.success : colors.error}
              />
              <Text
                style={[
                  styles.diffText,
                  { color: card.diff >= 0 ? colors.success : colors.error },
                ]}
              >
                {Math.abs(card.diff)}%
              </Text>
            </View>
          </View>
        ))}
      </View>
      <View style={[styles.filterContainer, { backgroundColor: colors.background, borderBottomColor: colors.border }]}>
        <TextInput
          style={[styles.searchInput, { backgroundColor: colors.backgroundSecondary, color: colors.text }]}
          placeholder={t('admin.users.searchPlaceholder')}
          placeholderTextColor={colors.textTertiary}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        <View style={styles.roleFilterContainer}>
          <TouchableOpacity
            style={[
              styles.roleButton,
              { backgroundColor: colors.backgroundSecondary },
              selectedRole === '' && { backgroundColor: colors.info }
            ]}
            onPress={() => setSelectedRole('')}
          >
            <Text style={[
              styles.roleButtonText,
              { color: colors.textSecondary },
              selectedRole === '' && styles.roleButtonTextActive
            ]}>
              {t('admin.users.filterAll')}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.roleButton,
              { backgroundColor: colors.backgroundSecondary },
              selectedRole === 'Admin' && { backgroundColor: colors.info }
            ]}
            onPress={() => setSelectedRole('Admin')}
          >
            <Text style={[
              styles.roleButtonText,
              { color: colors.textSecondary },
              selectedRole === 'Admin' && styles.roleButtonTextActive
            ]}>
              {t('admin.users.filterAdmin')}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.roleButton,
              { backgroundColor: colors.backgroundSecondary },
              selectedRole === 'User' && { backgroundColor: colors.info }
            ]}
            onPress={() => setSelectedRole('User')}
          >
            <Text style={[
              styles.roleButtonText,
              { color: colors.textSecondary },
              selectedRole === 'User' && styles.roleButtonTextActive
            ]}>
              {t('admin.users.filterUser')}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.backgroundSecondary }]}>
      <FlatList
        data={filteredUsers}
        keyExtractor={(item) => item.id.toString()}
        ListHeaderComponent={renderHeader}
        refreshing={refreshing}
        onRefresh={onRefresh}
        renderItem={({ item }) => (
          <View style={[styles.userCard, { backgroundColor: colors.card }]}>
            <View style={styles.userInfo}>
              <Text style={[styles.userName, { color: colors.text }]}>{item.name}</Text>
              <Text style={[styles.userUsername, { color: colors.textSecondary }]}>@{item.username}</Text>
              <Text style={[styles.userEmail, { color: colors.textSecondary }]}>{item.email}</Text>
              <View style={styles.roleContainer}>
                <Text
                  style={[
                    styles.roleText,
                    {
                      color: item.role === 'Admin' ? colors.error : colors.info,
                      backgroundColor: item.role === 'Admin'
                        ? (colors.isDark ? '#3F1414' : '#FFEBEE')
                        : (colors.isDark ? '#0F2940' : '#E3F2FD')
                    }
                  ]}
                >
                  {item.role}
                </Text>
              </View>
            </View>
            <View style={styles.actions}>
              <TouchableOpacity
                onPress={() => handleEditUser(item)}
                style={styles.actionButton}
              >
                <Ionicons name="create-outline" size={20} color={colors.info} />
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => handleDeleteUser(item)}
                style={styles.actionButton}
              >
                <Ionicons name="trash" size={20} color={colors.error} />
              </TouchableOpacity>
            </View>
          </View>
        )}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={[styles.emptyText, { color: colors.textTertiary }]}>{t('admin.users.noUsersFound')}</Text>
          </View>
        }
      />

      <UserModal
        visible={modalVisible}
        onClose={() => {
          setModalVisible(false);
          setSelectedUser(null);
        }}
        onSubmit={handleSubmitUser}
        user={selectedUser}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  headerContainer: {
    padding: 16,
    borderBottomWidth: 1,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    gap: 8,
  },
  addButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  statsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 8,
    gap: 8,
  },
  statCard: {
    flex: 1,
    minWidth: '45%',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 8,
  },
  statTitle: {
    fontSize: 12,
    marginTop: 4,
  },
  diffContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  diffText: {
    fontSize: 12,
    marginLeft: 4,
    fontWeight: '600',
  },
  filterContainer: {
    padding: 16,
    borderBottomWidth: 1,
  },
  searchInput: {
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 12,
  },
  roleFilterContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  roleButton: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  roleButtonText: {
    fontSize: 14,
    fontWeight: '500',
  },
  roleButtonTextActive: {
    color: '#FFFFFF',
  },
  userCard: {
    flexDirection: 'row',
    padding: 16,
    marginHorizontal: 16,
    marginVertical: 8,
    borderRadius: 12,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  userUsername: {
    fontSize: 14,
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
    marginBottom: 8,
  },
  roleContainer: {
    alignSelf: 'flex-start',
  },
  roleText: {
    fontSize: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    overflow: 'hidden',
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  actionButton: {
    padding: 8,
  },
  emptyContainer: {
    padding: 40,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
  },
});
