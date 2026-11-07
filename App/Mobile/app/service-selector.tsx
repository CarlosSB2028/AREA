import React, { useState, useEffect } from 'react';
import { FlatList, TextInput, Pressable, View, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, Search, Check } from 'lucide-react-native';
import { Box } from '@/components/ui/box';
import { HStack } from '@/components/ui/hstack';
import { VStack } from '@/components/ui/vstack';
import { Text } from '@/components/ui/text';
import { Heading } from '@/components/ui/heading';
import { Button, ButtonText } from '@/components/ui/button';
import { Badge, BadgeText } from '@/components/ui/badge';
import { useThemeColors } from '@/hooks/useThemeColors';
import * as serviceCatalog from '@/services/serviceCatalog';
import type { BackendService, ActionDefinition } from '@/types/areas';

interface ServiceCardProps {
  service: BackendService;
  onPress: () => void;
}

function ServiceCard({ service, onPress }: ServiceCardProps) {
  const colors = useThemeColors();
  return (
    <Pressable onPress={onPress}>
      <Box
        className="rounded-lg p-4 mb-3 border"
        style={{
          backgroundColor: colors.card,
          borderColor: colors.border,
        }}
      >
        <HStack space="sm" className="items-center">
          <Box
            className="w-12 h-12 rounded-lg items-center justify-center"
            style={{ backgroundColor: colors.info + '20' }}
          >
            <Text className="font-bold text-lg" style={{ color: colors.info }}>
              {service.name.charAt(0)}
            </Text>
          </Box>
          <VStack className="flex-1">
            <Text className="font-semibold" style={{ color: colors.text }}>
              {service.name}
            </Text>
            <HStack space="xs" className="items-center mt-1">
              <Badge
                size="sm"
                variant="outline"
                style={{ borderColor: service.isActive ? colors.success : colors.border }}
              >
                <BadgeText
                  className="text-xs"
                  style={{ color: service.isActive ? colors.success : colors.textSecondary }}
                >
                  {service.isActive ? 'Active' : 'Inactive'}
                </BadgeText>
              </Badge>
              <Badge
                size="sm"
                variant="outline"
                style={{ borderColor: colors.info }}
              >
                <BadgeText className="text-xs" style={{ color: colors.info }}>
                  {service.auth}
                </BadgeText>
              </Badge>
            </HStack>
          </VStack>
        </HStack>
      </Box>
    </Pressable>
  );
}

interface ActionCardProps {
  action: ActionDefinition;
  onPress: () => void;
  selected?: boolean;
}

function ActionCard({ action, onPress, selected }: ActionCardProps) {
  const { t } = useTranslation();
  const colors = useThemeColors();
  return (
    <Pressable onPress={onPress}>
      <Box
        className="rounded-lg p-4 mb-3 border"
        style={{
          backgroundColor: selected ? colors.info + '20' : colors.card,
          borderColor: selected ? colors.info : colors.border,
        }}
      >
        <HStack className="items-center justify-between">
          <VStack className="flex-1">
            <HStack space="xs" className="items-center mb-1">
              <Text className="font-semibold" style={{ color: colors.text }}>
                {action.name}
              </Text>
              {selected && <Check size={16} color={colors.info} />}
            </HStack>
            <Text className="text-xs mb-2" style={{ color: colors.textSecondary }}>
              {action.description}
            </Text>
            <HStack space="xs">
              {action.isEventCapable && (
                <Badge
                  size="sm"
                  variant="solid"
                  style={{ backgroundColor: colors.info }}
                >
                  <BadgeText className="text-xs text-white">
                    {t('selector.event', 'Event')}
                  </BadgeText>
                </Badge>
              )}
              {action.isExecutable && (
                <Badge
                  size="sm"
                  variant="solid"
                  style={{ backgroundColor: colors.success }}
                >
                  <BadgeText className="text-xs text-white">
                    {t('selector.executable', 'Executable')}
                  </BadgeText>
                </Badge>
              )}
            </HStack>
          </VStack>
        </HStack>
      </Box>
    </Pressable>
  );
}

export default function ServiceSelectorScreen() {
  const { t } = useTranslation();
  const colors = useThemeColors();
  const params = useLocalSearchParams<{ type: 'action' | 'reaction' }>();
  const selectionType = params.type || 'action';
  const [step, setStep] = useState<1 | 2>(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [services, setServices] = useState<BackendService[]>([]);
  const [filteredServices, setFilteredServices] = useState<BackendService[]>([]);
  const [selectedService, setSelectedService] = useState<BackendService | null>(null);
  const [actions, setActions] = useState<ActionDefinition[]>([]);
  const [filteredActions, setFilteredActions] = useState<ActionDefinition[]>([]);
  const [selectedAction, setSelectedAction] = useState<ActionDefinition | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    loadServices();
  }, []);

  useEffect(() => {
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      setFilteredServices(
        services.filter(s =>
          s.name.toLowerCase().includes(query) ||
          s.key.toLowerCase().includes(query)
        )
      );
    } else {
      setFilteredServices(services);
    }
  }, [searchQuery, services]);
  useEffect(() => {
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      setFilteredActions(
        actions.filter(a =>
          a.name.toLowerCase().includes(query) ||
          a.description.toLowerCase().includes(query)
        )
      );
    } else {
      setFilteredActions(actions);
    }
  }, [searchQuery, actions]);

  const loadServices = async () => {
    setIsLoading(true);
    try {
      const data = await serviceCatalog.getServicesCatalog();
      console.log('Services loaded:', data.length, 'services');
      setServices(data);
      setFilteredServices(data);
    } catch (error) {
      console.error('Failed to load services:', error);
      if (error && typeof error === 'object' && 'message' in error) {
        console.error('Error message:', (error as Error).message);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleServiceSelect = async (service: BackendService) => {
    setSelectedService(service);
    setSearchQuery('');
    setIsLoading(true);
    try {
      let data: ActionDefinition[];
      console.log(`Loading actions for service: ${service.name} (${service.key}), type: ${selectionType}`);
      if (selectionType === 'action') {
        data = await serviceCatalog.getServiceEvents(service.key);
        console.log(`Loaded ${data.length} triggers for ${service.name}`);
      } else {
        data = await serviceCatalog.getServiceReactions(service.key);
        console.log(`Loaded ${data.length} actions for ${service.name}`);
      }
      setActions(data);
      setFilteredActions(data);
      setStep(2);
    } catch (error) {
      console.error('Failed to load actions:', error);
      if (error && typeof error === 'object' && 'message' in error) {
        console.error('Error message:', (error as Error).message);
      }
    } finally {
      setIsLoading(false);
    }
  };
  const handleActionSelect = (action: ActionDefinition) => {
    setSelectedAction(action);
  };

  const handleConfirm = () => {
    if (selectedService && selectedAction) {
      router.push({
        pathname: '/action-configurator',
        params: {
          type: selectionType,
          serviceId: selectedService.id,
          serviceKey: selectedService.key,
          serviceName: selectedService.name,
          actionDefinitionId: selectedAction.id,
          actionName: selectedAction.name,
          returnTo: 'area-editor'
        }
      });
    }
  };

  const handleBack = () => {
    if (step === 2) {
      setStep(1);
      setSelectedService(null);
      setSelectedAction(null);
      setSearchQuery('');
      setActions([]);
      setFilteredActions([]);
    } else {
      router.back();
    }
  };

  return (
    <SafeAreaView className="flex-1" style={{ backgroundColor: colors.backgroundSecondary }}>
      <View
        className="flex-row items-center justify-between p-4 border-b"
        style={{
          backgroundColor: colors.info,
          borderBottomColor: colors.border,
        }}
      >
        <HStack space="sm" className="items-center flex-1">
          <TouchableOpacity onPress={handleBack}>
            <ArrowLeft size={24} color="white" />
          </TouchableOpacity>
          <Heading size="lg" className="text-white">
            {step === 1
              ? t('selector.title.selectService', 'Select Service')
              : t('selector.title.selectAction', selectionType === 'action' ? 'Select Trigger' : 'Select Action')}
          </Heading>
        </HStack>
        {step === 2 && selectedAction && (
          <Button
            size="sm"
            onPress={handleConfirm}
            style={{ backgroundColor: 'white' }}
          >
            <ButtonText style={{ color: colors.info }}>
              {t('common.continue', 'Continue')}
            </ButtonText>
          </Button>
        )}
      </View>
      <Box className="px-4 pt-3 pb-3">
        <Box
          className="rounded-lg px-3 py-2 border mb-3"
          style={{
            backgroundColor: colors.card,
            borderColor: colors.border,
          }}
        >
          <HStack space="sm" className="items-center">
            <Search size={18} color={colors.textSecondary} />
            <TextInput
              className="flex-1"
              style={{ color: colors.text }}
              placeholder={
                step === 1
                  ? t('selector.search.services', 'Search services...')
                  : t('selector.search.actions', 'Search actions...')
              }
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholderTextColor={colors.textSecondary}
            />
          </HStack>
        </Box>

        {step === 2 && selectedService && (
          <HStack space="xs" className="items-center">
            <Text className="text-xs" style={{ color: colors.textSecondary }}>
              {selectedService.name}
            </Text>
            <Text className="text-xs" style={{ color: colors.textSecondary }}>›</Text>
            <Text className="text-xs font-semibold" style={{ color: colors.text }}>
              {selectionType === 'action' ? t('selector.triggers', 'Triggers') : t('selector.actions', 'Actions')}
            </Text>
          </HStack>
        )}
      </Box>

      {isLoading ? (
        <Box className="flex-1 items-center justify-center">
          <Text style={{ color: colors.textSecondary }}>
            {t('common.loading', 'Loading...')}
          </Text>
        </Box>
      ) : step === 1 ? (
        <FlatList
          data={filteredServices}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <ServiceCard
              service={item}
              onPress={() => handleServiceSelect(item)}
            />
          )}
          contentContainerStyle={{
            padding: 16,
          }}
          ListEmptyComponent={
            <Box className="items-center justify-center py-12">
              <Text className="text-center" style={{ color: colors.textSecondary }}>
                {t('selector.empty.services', 'No services found')}
              </Text>
            </Box>
          }
        />
      ) : (
        <FlatList
          data={filteredActions}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <ActionCard
              action={item}
              onPress={() => handleActionSelect(item)}
              selected={selectedAction?.id === item.id}
            />
          )}
          contentContainerStyle={{
            padding: 16,
          }}
          ListEmptyComponent={
            <Box className="items-center justify-center py-12">
              <Text className="text-center" style={{ color: colors.textSecondary }}>
                {selectionType === 'action'
                  ? t('selector.empty.triggers', 'No triggers found for this service')
                  : t('selector.empty.actions', 'No actions found for this service')}
              </Text>
            </Box>
          }
        />
      )}
    </SafeAreaView>
  );
}
