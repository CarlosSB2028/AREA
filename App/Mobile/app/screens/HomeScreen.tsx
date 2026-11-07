import { router } from 'expo-router';
import { Activity, ArrowRight, Plus, Zap, TrendingUp, Github, MessageCircle, Music, Mail, FileSpreadsheet } from 'lucide-react-native';
import React, { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { FlatList, RefreshControl } from 'react-native';

import { Box } from '@/components/ui/box';
import { Button, ButtonIcon, ButtonText } from '@/components/ui/button';
import { Heading } from '@/components/ui/heading';
import { HStack } from '@/components/ui/hstack';
import { Pressable } from '@/components/ui/pressable';
import { Text } from '@/components/ui/text';
import { VStack } from '@/components/ui/vstack';
import { useThemeColors } from '@/hooks/useThemeColors';
import { useArea } from '@/contexts/AreaContext';
import { AreaListCard } from '@/components/ui/areas/AreaListCard';
import * as areaService from '@/services/area';

export default function HomeScreen() {
  const { t } = useTranslation();
  const colors = useThemeColors();
  const { areas, isRefreshing, refreshAreas, fetchAreas, hasFetched, deleteArea, toggleArea } = useArea();
  const activeCount = areas.filter((area) => area.enabled).length;
  const totalCount = areas.length;
  const recentAreas = React.useMemo(() => {
    return [...areas]
      .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
      .slice(0, 5);
  }, [areas]);

  const handleRefresh = useCallback(() => {
    refreshAreas().catch((err: unknown) => console.error(t('areas.error.refresh', 'Failed to refresh areas'), err));
  }, [refreshAreas, t]);

  const handleAreaPress = (areaId: string) => {
    router.push(`/area-editor?id=${areaId}`);
  };

  const handleCreateNew = () => {
    router.push('/area-editor');
  };

  const handleSeeAllAreas = () => {
    router.push('/(tabs)/areas');
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

  useFocusEffect(
    useCallback(() => {
      if (!hasFetched) {
        fetchAreas().catch((err: unknown) => console.error(t('areas.error.fetch', 'Failed to load areas'), err));
      }
    }, [hasFetched, fetchAreas, t])
  );

  return (
    <SafeAreaView className="flex-1 bg-background-0">
      <Box className="px-4 pt-4 pb-6" style={{ backgroundColor: colors.info }}>
        <VStack space="sm" className="mb-4">
          <HStack className="items-center" space="sm">
            <Box className="bg-white rounded-lg p-2">
              <Zap size={24} color={colors.info} />
            </Box>
            <VStack className="flex-1">
              <Heading size="xl" className="text-white">
                {t('tabs.home')}
              </Heading>
              <Text className="text-white text-sm opacity-90">
                {t('home.subtitle')}
              </Text>
            </VStack>
          </HStack>
        </VStack>
        <HStack space="sm">
          <Box className="flex-1 bg-white/10 rounded-xl p-4 backdrop-blur-sm">
            <VStack space="xs">
              <HStack space="xs" align="center">
                <Zap size={18} color="white" />
                <Text size="xs" className="text-white font-semibold uppercase">
                  {t('areas.card.active')}
                </Text>
              </HStack>
              <Heading size="2xl" className="text-white">
                {activeCount}
              </Heading>
              <Text size="xs" className="text-white opacity-80">
                {activeCount === 1
                  ? t('areas.card.enabled', 'Enabled')
                  : t('home.automationsInProgress')}
              </Text>
            </VStack>
          </Box>
          <Box className="flex-1 bg-white/10 rounded-xl p-4 backdrop-blur-sm">
            <VStack space="xs">
              <HStack space="xs" align="center">
                <Activity size={18} color="white" />
                <Text size="xs" className="text-white font-semibold uppercase">
                  {t('home.totalLabel')}
                </Text>
              </HStack>
              <Heading size="2xl" className="text-white">
                {totalCount}
              </Heading>
              <Text size="xs" className="text-white opacity-80">
                {totalCount === 1
                  ? t('tabs.areas', 'Area')
                  : t('tabs.areas', 'Areas')}
              </Text>
            </VStack>
          </Box>
        </HStack>
      </Box>
      <FlatList
        data={recentAreas}
        keyExtractor={(item) => item.id}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            tintColor={colors.info}
          />
        }
        contentContainerStyle={{
          paddingHorizontal: 16,
          paddingBottom: 16,
        }}
        ListHeaderComponent={
          <>
            <VStack space="md" className="mt-4 mb-4">
              <HStack justify="between" align="center">
                <VStack>
                  <Heading size="lg" style={{ color: colors.text }}>
                    {totalCount > 0
                      ? t('areas.header.subtitle', 'Recent Areas')
                      : t('areas.empty.title')}
                  </Heading>
                  {totalCount > 0 && (
                    <Text size="xs" style={{ color: colors.textSecondary }}>
                      {recentAreas.length} {t('areas.results.showing', 'most recent')}
                    </Text>
                  )}
                </VStack>
                {totalCount > 0 && (
                  <Button variant="link" size="sm" onPress={handleSeeAllAreas}>
                    <ButtonText style={{ color: colors.info }}>{t('home.seeAll')}</ButtonText>
                    <ButtonIcon as={ArrowRight} color={colors.info} size="sm" />
                  </Button>
                )}
              </HStack>
              {totalCount === 0 && (
                <Box
                  className="rounded-xl p-8 border-2 border-dashed"
                  style={{
                    backgroundColor: colors.card,
                    borderColor: colors.cardBorder,
                  }}
                >
                  <VStack space="md" className="items-center">
                    <Box
                      className="w-16 h-16 rounded-full items-center justify-center"
                      style={{ backgroundColor: colors.info + '20' }}
                    >
                      <Zap size={48} color={colors.info} />
                    </Box>
                    <VStack space="xs" className="items-center">
                      <Heading size="md" style={{ color: colors.text }} className="text-center">
                        {t('areas.empty.title')}
                      </Heading>
                      <Text size="sm" style={{ color: colors.textSecondary }} className="text-center px-8">
                        {t('areas.empty.description')}
                      </Text>
                    </VStack>
                    <Button
                      size="md"
                      onPress={handleCreateNew}
                      style={{ backgroundColor: colors.info }}
                      className="mt-4"
                    >
                      <ButtonIcon as={Plus} color="white" />
                      <ButtonText className="text-white">
                        {t('areas.empty.action')}
                      </ButtonText>
                    </Button>
                  </VStack>
                </Box>
              )}
            </VStack>
          </>
        }
        ListFooterComponent={
          totalCount > 0 ? (
            <VStack space="md" className="mt-4">
              {totalCount > 5 && (
                <Box
                  className="rounded-xl p-4 border"
                  style={{
                    backgroundColor: colors.card,
                    borderColor: colors.info,
                  }}
                >
                  <HStack justify="between" align="center">
                    <HStack space="md" align="center" className="flex-1">
                      <Box
                        className="w-10 h-10 rounded-full items-center justify-center"
                        style={{ backgroundColor: colors.info + '20' }}
                      >
                        <TrendingUp size={20} color={colors.info} />
                      </Box>
                      <VStack className="flex-1">
                        <Text size="sm" style={{ color: colors.text }} className="font-semibold">
                          {t('home.seeAll')}
                        </Text>
                        <Text size="xs" style={{ color: colors.textSecondary }}>
                          {t('areas.results.count', {
                            count: totalCount,
                            total: totalCount,
                            defaultValue: `View all ${totalCount} areas`
                          })}
                        </Text>
                      </VStack>
                    </HStack>
                    <Button
                      size="sm"
                      variant="solid"
                      onPress={handleSeeAllAreas}
                      style={{ backgroundColor: colors.info }}
                    >
                      <ButtonText className="text-white text-xs">
                        {t('home.seeAll')}
                      </ButtonText>
                      <ButtonIcon as={ArrowRight} color="white" size="xs" />
                    </Button>
                  </HStack>
                </Box>
              )}
              <Box
                className="rounded-xl p-6 shadow-sm"
                style={{ backgroundColor: colors.info }}
              >
                <VStack space="md">
                  <VStack space="sm">
                    <HStack space="sm" align="center">
                      <Plus size={24} color="white" />
                      <Heading size="lg" className="text-white">
                        {t('areas.header.newButton')}
                      </Heading>
                    </HStack>
                    <Text size="sm" className="text-white opacity-90">
                      {t('areas.header.subtitle')}
                    </Text>
                  </VStack>
                  <Button
                    variant="solid"
                    size="lg"
                    className="bg-white self-start"
                    onPress={handleCreateNew}
                    testID="btn-create-automation"
                  >
                    <ButtonIcon as={Plus} color={colors.info} />
                    <ButtonText style={{ color: colors.info }} className="font-semibold">
                      {t('areas.empty.action')}
                    </ButtonText>
                  </Button>
                </VStack>
              </Box>
              <VStack space="sm">
                <HStack justify="between" align="center">
                  <Heading size="md" style={{ color: colors.text }}>
                    {t('home.popularTemplatesTitle')}
                  </Heading>
                </HStack>
                <Text size="xs" style={{ color: colors.textSecondary }}>
                  {t('home.createAutomationSubtitle')}
                </Text>
                {[
                  {
                    title: t('home.template1Title'),
                    desc: t('home.template1Desc'),
                    icon: Github,
                    iconColor: '#585555ff',
                    accentColor: '#5865F2'
                  },
                  {
                    title: t('home.template2Title'),
                    desc: t('home.template2Desc'),
                    icon: Music,
                    iconColor: '#1DB954',
                    accentColor: '#E01E5A'
                  },
                  {
                    title: t('home.template3Title'),
                    desc: t('home.template3Desc'),
                    icon: Mail,
                    iconColor: '#EA4335',
                    accentColor: '#0F9D58'
                  },
                ].map((template, idx) => (
                  <Pressable key={idx} onPress={handleCreateNew}>
                    <Box
                      className="rounded-lg p-4 border"
                      style={{
                        backgroundColor: colors.card,
                        borderColor: colors.cardBorder,
                      }}
                    >
                      <HStack justify="between" align="center">
                        <HStack space="md" align="center" className="flex-1">
                          <Box
                            className="w-10 h-10 rounded-full items-center justify-center"
                            style={{
                              backgroundColor: template.iconColor + '15',
                              borderWidth: 1,
                              borderColor: template.iconColor + '30'
                            }}
                          >
                            <template.icon size={20} color={template.iconColor} />
                          </Box>
                          <VStack className="flex-1">
                            <Text size="sm" style={{ color: colors.text }} className="font-semibold">
                              {template.title}
                            </Text>
                            <Text size="xs" style={{ color: colors.textSecondary }}>
                              {template.desc}
                            </Text>
                          </VStack>
                        </HStack>
                        <Box
                          className="w-8 h-8 rounded-full items-center justify-center"
                          style={{ backgroundColor: template.accentColor + '15' }}
                        >
                          <ArrowRight size={16} color={template.accentColor} />
                        </Box>
                      </HStack>
                    </Box>
                  </Pressable>
                ))}
              </VStack>
            </VStack>
          ) : null
        }
        renderItem={({ item }) => (
          <AreaListCard
            area={item}
            onPress={() => handleAreaPress(item.id)}
            onEdit={handleAreaPress}
            onDelete={handleDeleteArea}
            onRun={handleRunArea}
            onToggle={handleToggleArea}
          />
        )}
      />
      <Box className="absolute bottom-6 right-6">
        <Pressable onPress={handleCreateNew}>
          <Box
            className="w-16 h-16 rounded-full items-center justify-center shadow-lg"
            style={{
              backgroundColor: colors.info,
              shadowColor: colors.info,
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.3,
              shadowRadius: 8,
              elevation: 8,
            }}
          >
            <Plus size={28} color="white" />
          </Box>
        </Pressable>
      </Box>
    </SafeAreaView>
  );
}
