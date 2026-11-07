import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, FlatList, TouchableOpacity, Alert, ActivityIndicator, Switch} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { getAreas, getAreaStats, getAreaRuns, deleteArea, enableDisableArea } from '@/services/admin';
import type { Area, AreaStat, AreaRun } from '@/types/admin';
import { useThemeColors } from '@/hooks/useThemeColors';

export default function AreasTab() {
  const { t } = useTranslation();
  const colors = useThemeColors();
  const [areas, setAreas] = useState<Area[]>([]);
  const [areaStats, setAreaStats] = useState<AreaStat[]>([]);
  const [areaRuns, setAreaRuns] = useState<AreaRun[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [showRuns, setShowRuns] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [areasData, statsData, runsData] = await Promise.all([
        getAreas(),
        getAreaStats(),
        getAreaRuns(),
      ]);
      setAreas(Array.isArray(areasData) ? areasData : []);
      setAreaStats(Array.isArray(statsData) ? statsData : []);
      setAreaRuns(Array.isArray(runsData) ? runsData : []);
    } catch (error) {
      console.error('Error fetching areas data:', error);
      Alert.alert('Error', 'Failed to load areas data');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteArea = (area: Area) => {
    Alert.alert(
      'Delete Area',
      `Are you sure you want to delete "${area.name}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteArea(area.id.toString());
              setAreas(areas.filter((a) => a.id !== area.id));
              Alert.alert('Success', 'Area deleted successfully');
            } catch (error) {
              console.error('Error deleting area:', error);
              Alert.alert('Error', 'Failed to delete area');
            }
          },
        },
      ]
    );
  };

  const handleToggleArea = async (area: Area, enabled: boolean) => {
    try {
      await enableDisableArea(area.id.toString(), enabled);
      setAreas(
        areas.map((a) => (a.id === area.id ? { ...a, enabled } : a))
      );
    } catch (error) {
      console.error('Error toggling area:', error);
      Alert.alert('Error', 'Failed to update area status');
    }
  };

  const filteredAreas = areas.filter(
    (area) =>
      (area.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        area.user.toLowerCase().includes(searchQuery.toLowerCase())) &&
      (selectedStatus ? area.status === selectedStatus : true)
  );

  const filteredRuns = areaRuns.filter(
    (run) =>
      run.areaName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      run.user.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'success':
        return colors.success;
      case 'failed':
        return colors.error;
      case 'in progress':
        return colors.warning;
      default:
        return colors.textTertiary;
    }
  };

  const getIconName = (icon: string): keyof typeof Ionicons.glyphMap => {
    switch (icon) {
      case 'map':
        return 'map';
      case 'check':
        return 'checkmark-circle';
      case 'alert':
        return 'alert-circle';
      case 'trending-up':
        return 'trending-up';
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

  return (
    <View style={[styles.container, { backgroundColor: colors.backgroundSecondary }]}>
      <View style={styles.statsContainer}>
        {areaStats.map((stat, index) => (
          <View key={index} style={[styles.statCard, { backgroundColor: colors.card }]}>
            <Ionicons
              name={getIconName(stat.icon)}
              size={24}
              color={colors.info}
            />
            <Text style={[styles.statValue, { color: colors.text }]}>{stat.value}</Text>
            <Text style={[styles.statTitle, { color: colors.textSecondary }]}>{stat.title}</Text>
          </View>
        ))}
      </View>
      <View style={[styles.toggleContainer, { backgroundColor: colors.card }]}>
        <TouchableOpacity
          style={[
            styles.toggleButton,
            !showRuns && { backgroundColor: colors.info }
          ]}
          onPress={() => setShowRuns(false)}
        >
          <Text style={[
            styles.toggleText,
            { color: colors.textSecondary },
            !showRuns && styles.toggleTextActive
          ]}>
            {t('admin.tabs.areas')}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.toggleButton,
            showRuns && { backgroundColor: colors.info }
          ]}
          onPress={() => setShowRuns(true)}
        >
          <Text style={[
            styles.toggleText,
            { color: colors.textSecondary },
            showRuns && styles.toggleTextActive
          ]}>
            Runs
          </Text>
        </TouchableOpacity>
      </View>
      <View style={[styles.filterContainer, { backgroundColor: colors.background, borderBottomColor: colors.border }]}>
        <TextInput
          style={[styles.searchInput, { backgroundColor: colors.backgroundSecondary, color: colors.text }]}
          placeholder={showRuns ? 'Search runs...' : 'Search areas...'}
          placeholderTextColor={colors.textTertiary}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        {!showRuns && (
          <View style={styles.statusFilterContainer}>
            {['', 'success', 'failed', 'in progress'].map((status) => (
              <TouchableOpacity
                key={status}
                style={[
                  styles.statusButton,
                  { backgroundColor: colors.backgroundSecondary },
                  selectedStatus === status && { backgroundColor: colors.info },
                ]}
                onPress={() => setSelectedStatus(status)}
              >
                <Text
                  style={[
                    styles.statusButtonText,
                    { color: colors.textSecondary },
                    selectedStatus === status && styles.statusButtonTextActive,
                  ]}
                >
                  {status === '' ? t('admin.users.filterAll') : status}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </View>
      {!showRuns ? (
        <FlatList
          data={filteredAreas}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <View style={[styles.areaCard, { backgroundColor: colors.card }]}>
              <View style={styles.areaHeader}>
                <View style={styles.areaInfo}>
                  <Text style={[styles.areaName, { color: colors.text }]}>{item.name}</Text>
                  <Text style={[styles.areaDescription, { color: colors.textSecondary }]}>{item.description}</Text>
                  <Text style={[styles.areaUser, { color: colors.textTertiary }]}>User: {item.user}</Text>
                  <View style={styles.areaMetadata}>
                    <View
                      style={[
                        styles.statusBadge,
                        { backgroundColor: getStatusColor(item.status) + (colors.isDark ? '40' : '20') },
                      ]}
                    >
                      <Text
                        style={[
                          styles.statusText,
                          { color: getStatusColor(item.status) },
                        ]}
                      >
                        {item.status}
                      </Text>
                    </View>
                    <Text style={[styles.lastRun, { color: colors.textTertiary }]}>Last: {item.lastRun}</Text>
                  </View>
                </View>
                <View style={styles.areaActions}>
                  <Switch
                    value={item.enabled}
                    onValueChange={(value) => handleToggleArea(item, value)}
                    trackColor={{ false: colors.border, true: colors.success }}
                    thumbColor="#FFF"
                  />
                  <TouchableOpacity
                    onPress={() => handleDeleteArea(item)}
                    style={styles.deleteButton}
                  >
                    <Ionicons name="trash" size={20} color={colors.error} />
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          )}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={[styles.emptyText, { color: colors.textTertiary }]}>No areas found</Text>
            </View>
          }
        />
      ) : (
        <FlatList
          data={filteredRuns}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <View style={[styles.runCard, { backgroundColor: colors.card }]}>
              <View style={styles.runInfo}>
                <Text style={[styles.runAreaName, { color: colors.text }]}>{item.areaName}</Text>
                <Text style={[styles.runUser, { color: colors.textTertiary }]}>User: {item.user}</Text>
                <Text style={[styles.runTime, { color: colors.textSecondary }]}>{item.timestamp}</Text>
                <View style={styles.runMetadata}>
                  <View
                    style={[
                      styles.statusBadge,
                      { backgroundColor: getStatusColor(item.status) + (colors.isDark ? '40' : '20') },
                    ]}
                  >
                    <Text
                      style={[
                        styles.statusText,
                        { color: getStatusColor(item.status) },
                      ]}
                    >
                      {item.status}
                    </Text>
                  </View>
                  <Text style={[styles.duration, { color: colors.textTertiary }]}>Duration: {item.duration}</Text>
                </View>
              </View>
            </View>
          )}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={[styles.emptyText, { color: colors.textTertiary }]}>No runs found</Text>
            </View>
          }
        />
      )}
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
    textAlign: 'center',
  },
  toggleContainer: {
    flexDirection: 'row',
    margin: 16,
    borderRadius: 12,
    padding: 4,
  },
  toggleButton: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 8,
  },
  toggleText: {
    fontSize: 14,
    fontWeight: '500',
  },
  toggleTextActive: {
    color: '#FFF',
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
  statusFilterContainer: {
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
  },
  statusButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 16,
  },
  statusButtonText: {
    fontSize: 12,
    fontWeight: '500',
  },
  statusButtonTextActive: {
    color: '#FFF',
  },
  areaCard: {
    marginHorizontal: 16,
    marginVertical: 8,
    borderRadius: 12,
    padding: 16,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  areaHeader: {
    flexDirection: 'row',
  },
  areaInfo: {
    flex: 1,
  },
  areaName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  areaDescription: {
    fontSize: 14,
    marginBottom: 4,
  },
  areaUser: {
    fontSize: 12,
    marginBottom: 8,
  },
  areaMetadata: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flexWrap: 'wrap',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  lastRun: {
    fontSize: 12,
  },
  areaActions: {
    alignItems: 'center',
    gap: 12,
  },
  deleteButton: {
    padding: 8,
  },
  runCard: {
    marginHorizontal: 16,
    marginVertical: 8,
    borderRadius: 12,
    padding: 16,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  runInfo: {
    flex: 1,
  },
  runAreaName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  runUser: {
    fontSize: 12,
    marginBottom: 4,
  },
  runTime: {
    fontSize: 12,
    marginBottom: 8,
  },
  runMetadata: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  duration: {
    fontSize: 12,
  },
  emptyContainer: {
    padding: 40,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
  },
});
