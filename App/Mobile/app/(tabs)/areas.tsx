import React, { useCallback, useState } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { FlatList, RefreshControl, TextInput } from 'react-native';
import { Zap, Plus, Search, Filter } from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Heading } from '@/components/ui/heading';
import { Box } from '@/components/ui/box';
import { Text } from '@/components/ui/text';
import { Button, ButtonIcon, ButtonText } from '@/components/ui/button';
import { HStack } from '@/components/ui/hstack';
import { useTranslation } from 'react-i18next';
import { AreaListCard } from '@/components/ui/areas/AreaListCard';
import { useArea } from '@/contexts/AreaContext';
import { useThemeColors } from '@/hooks/useThemeColors';
import * as areaService from '@/services/area';

function LoadingScreen() {
  const { t } = useTranslation();
  const colors = useThemeColors();
  return (
    <SafeAreaView className="flex-1 bg-background-0 items-center justify-center">
      <Box className="items-center justify-center">
        <Zap size={48} color={colors.info} />
        <Heading size="lg" className="text-typography-900 mt-4">
          {t('areas.loading.title', 'Loading Areas...')}
        </Heading>
      </Box>
    </SafeAreaView>
  );
}

export default function AreasTab() {
  const { t } = useTranslation();
  const colors = useThemeColors();
  const { areas, isLoading, isRefreshing, error, refreshAreas, clearError, fetchAreas, hasFetched, deleteArea, toggleArea } = useArea();
  const alreadyPressedRef = React.useRef(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const filteredAreas = React.useMemo(() => {
    let filtered = areas;

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(area =>
        area.name.toLowerCase().includes(query) ||
        area.description.toLowerCase().includes(query)
      );
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(area => {
        if (statusFilter === 'active') return area.enabled;
        if (statusFilter === 'inactive') return !area.enabled;
        return true;
      });
    }

    return filtered;
  }, [areas, searchQuery, statusFilter]);

  const handleRefresh = useCallback(() => {
    refreshAreas().catch((err: unknown) => console.error(t('areas.error.refresh', 'Failed to refresh areas'), err));
  }, [refreshAreas, t]);

  const handleAreaPress = (areaId: string) => {
    if (alreadyPressedRef.current) return;
    alreadyPressedRef.current = true;
    router.push(`/area-editor?id=${areaId}`);
    setTimeout(() => {
      alreadyPressedRef.current = false;
    }, 1000);
  };

  const handleCreateArea = () => {
    router.push('/area-editor');
  };

  const handleEditArea = (areaId: string) => {
    router.push(`/area-editor?id=${areaId}`);
  };

  const handleDeleteArea = async (areaId: string) => {
    try {
      await deleteArea(areaId);
    } catch (err) {
      console.error('Failed to delete area:', err);
    }
  };

  const handleRunArea = async (areaId: string) => {
    try {
      await areaService.runArea(areaId);
      console.log('Area triggered successfully');
    } catch (err) {
      console.error('Failed to run area:', err);
    }
  };

  const handleToggleArea = async (areaId: string, enabled: boolean) => {
    try {
      await toggleArea(areaId, enabled);
    } catch (err) {
      console.error('Failed to toggle area:', err);
    }
  };

  const toggleStatusFilter = () => {
    if (statusFilter === 'all') {
      setStatusFilter('active');
    } else if (statusFilter === 'active') {
      setStatusFilter('inactive');
    } else {
      setStatusFilter('all');
    }
  };

  useFocusEffect(
    useCallback(() => {
      if (!hasFetched) {
        fetchAreas().catch((err: unknown) => console.error(t('areas.error.fetch', 'Failed to load areas'), err));
      }
    }, [hasFetched, fetchAreas, t])
  );
  if (isLoading || !hasFetched) {
    return <LoadingScreen />;
  }

  return (
    <SafeAreaView className="flex-1 bg-background-0">
      <Box className="px-4 pt-4 pb-2" style={{ backgroundColor: colors.info }}>
        <HStack className="items-center justify-between mb-2">
          <HStack className="items-center" space="sm">
            <Box className="bg-white rounded-lg p-2">
              <Zap size={24} color={colors.info} />
            </Box>
            <Heading size="xl" className="text-white">
              {t('tabs.areas', 'Areas')}
            </Heading>
          </HStack>
          <Button size="sm" onPress={handleCreateArea} className="bg-white">
            <ButtonIcon as={Plus} color={colors.info} />
            <ButtonText className="text-blue-600">{t('areas.header.newButton', 'New')}</ButtonText>
          </Button>
        </HStack>
        <Text className="text-white text-sm mb-3 opacity-90">
          {t('areas.header.subtitle', 'Manage your automated workflows')}
        </Text>
        <HStack space="sm" className="mb-3">
          <Box className="flex-1 bg-white rounded-lg px-3 py-2">
            <HStack space="sm" className="items-center">
              <Search size={18} color="#9CA3AF" />
              <TextInput
                className="flex-1"
                style={{ color: colors.text }}
                placeholder={t('areas.search.placeholder', 'Search areas...')}
                value={searchQuery}
                onChangeText={setSearchQuery}
                placeholderTextColor="#9CA3AF"
              />
            </HStack>
          </Box>
          <Button size="sm" variant="outline" onPress={toggleStatusFilter} className="bg-white border-white">
            <ButtonIcon as={Filter} color={colors.info} />
            <ButtonText className="text-xs" style={{ color: colors.info }}>
              {statusFilter === 'all' ? t('areas.filter.all', 'All') :
               statusFilter === 'active' ? t('areas.filter.active', 'Active') :
               t('areas.filter.inactive', 'Inactive')}
            </ButtonText>
          </Button>
        </HStack>

        <Text className="text-white text-xs opacity-80">
          {t('areas.results.count', {
            count: filteredAreas.length,
            total: areas.length,
            defaultValue: `Showing ${filteredAreas.length} of ${areas.length} areas`
          })}
        </Text>

        {error && (
          <Box className="bg-red-100 border border-red-300 rounded-md px-3 py-2 mt-3">
            <HStack className="items-center justify-between">
              <Text className="text-red-700 text-xs flex-1">
                {error}
              </Text>
              <Button size="xs" variant="link" action="negative" onPress={clearError}>
                <ButtonText className="text-xs">{t('areas.error.dismiss', 'Dismiss')}</ButtonText>
              </Button>
            </HStack>
          </Box>
        )}
      </Box>
      <FlatList
        data={filteredAreas}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <AreaListCard
            area={item}
            onPress={() => handleAreaPress(item.id)}
            onEdit={handleEditArea}
            onDelete={handleDeleteArea}
            onRun={handleRunArea}
            onToggle={handleToggleArea}
          />
        )}
        contentContainerStyle={{
          paddingLeft: 16,
          paddingRight: 16,
          paddingTop: 8,
          paddingBottom: 16,
        }}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            tintColor={colors.info}
          />
        }
        ListEmptyComponent={
          <Box className="items-center justify-center py-12">
            <Zap size={64} color="#D1D5DB" />
            <Heading size="md" className="text-typography-600 mt-4">
              {searchQuery || statusFilter !== 'all'
                ? t('areas.empty.noResults', 'No areas found')
                : t('areas.empty.title', 'No Areas Yet')}
            </Heading>
            <Text className="text-typography-500 text-center mt-2 px-8">
              {searchQuery || statusFilter !== 'all'
                ? t('areas.empty.tryDifferentFilter', 'Try adjusting your search or filters')
                : t('areas.empty.description', 'Create your first automation area to get started')}
            </Text>
            {!searchQuery && statusFilter === 'all' && (
              <Button size="md" className="mt-6" onPress={handleCreateArea} style={{ backgroundColor: colors.info }}>
                <ButtonIcon as={Plus} color="white" />
                <ButtonText className="text-white">{t('areas.empty.action', 'Create Area')}</ButtonText>
              </Button>
            )}
          </Box>
        }
      />
    </SafeAreaView>
  );
}