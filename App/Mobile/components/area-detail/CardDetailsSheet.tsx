import React, { useState, useEffect } from 'react';
import { Modal, View, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { X } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import { useThemeColors } from '@/hooks/useThemeColors';

import type { CardData, ActionDto, ReactionDto } from '@/types/area-detail';
import type { Service } from '@/types/services';
import { Input, InputField } from '@/components/ui/input';
import { Button, ButtonText } from '@/components/ui/button';
import { VStack } from '@/components/ui/vstack';
import { Heading } from '@/components/ui/heading';
import { Text } from '@/components/ui/text';

interface CardDetailsSheetProps {
  visible: boolean;
  card: CardData | null;
  onClose: () => void;
  onCardEdit?: (cardId: string, updatedCard: CardData) => void;
}

type TriggerType = 'cron' | 'webhook' | 'manual';

export function CardDetailsSheet({ visible, card, onClose, onCardEdit }: CardDetailsSheetProps) {
  const { t } = useTranslation();
  const colors = useThemeColors();
  const [editedCard, setEditedCard] = useState<CardData | null>(null);
  const [name, setName] = useState('');
  const [triggerType, setTriggerType] = useState<TriggerType>('manual');
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [services, setServices] = useState<Service[]>([]);
  const [loading] = useState(false);
  const [webhookUrl, setWebhookUrl] = useState('');
  const [cronExpression, setCronExpression] = useState('');

  useEffect(() => {
    const loadServices = async () => {
      try {
        const servicesData = require('@/mocks/services.json') as Service[];
        setServices(servicesData.filter(s => s.isActive));
      } catch (error) {
        console.error('Failed to load services:', error);
      }
    };
    loadServices();
  }, []);

  useEffect(() => {
    if (card) {
      setEditedCard(card);
      setName(card.data.name);

      if (card.type === 'action') {
        const actionData = card.data as ActionDto;
        const activationType = actionData.activationConfig?.type || 'manual';
        setTriggerType(activationType as TriggerType);
        setWebhookUrl(actionData.activationConfig?.webhook_url || '');
        setCronExpression(actionData.activationConfig?.cron_expression || '');
      }
    }
  }, [card]);

  const handleSave = () => {
    if (!editedCard) return;

    const updatedCard: CardData = {
      ...editedCard,
      data: {
        ...editedCard.data,
        name,
      },
    };

    if (editedCard.type === 'action') {
      const actionData = updatedCard.data as ActionDto;
      actionData.activationConfig = {
        type: triggerType,
        ...(triggerType === 'webhook' && {
          webhook_url: webhookUrl,
          secret_token: '',
        }),
        ...(triggerType === 'cron' && {
          cron_expression: cronExpression
        }),
      };

      if (triggerType === 'webhook' && selectedService) {
        actionData.parameters = {
          ...actionData.parameters,
          serviceId: selectedService.id,
          serviceName: selectedService.name,
        };
      }
    } else if (editedCard.type === 'reaction') {
      const reactionData = updatedCard.data as ReactionDto;
      if (selectedService) {
        reactionData.parameters = {
          ...reactionData.parameters,
          serviceId: selectedService.id,
          serviceName: selectedService.name,
        };
      }
    }

    onCardEdit?.(editedCard.id, updatedCard);
    onClose();
  };

  const renderActionSettings = () => {
    return (
      <VStack space="md" className="mt-4">
        <View>
          <Text className="text-sm font-semibold mb-2" style={{ color: colors.text }}>
            {t('areaDetail.detailsSheet.triggerType')}
          </Text>
          <View className="flex-row gap-2 flex-wrap">
            {(['manual', 'webhook', 'cron'] as TriggerType[]).map((type) => (
              <TouchableOpacity
                key={type}
                onPress={() => setTriggerType(type)}
                className="px-4 py-2 rounded-lg border"
                style={{
                  backgroundColor: triggerType === type ? colors.info : colors.card,
                  borderColor: triggerType === type ? colors.info : colors.border,
                }}
              >
                <Text
                  className="text-sm font-medium"
                  style={{
                    color: triggerType === type ? 'white' : colors.text,
                  }}
                >
                  {t(`areaDetail.detailsSheet.triggerTypes.${type}`)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {triggerType === 'webhook' && (
          <>
            <View>
              <Text className="text-sm font-semibold mb-2" style={{ color: colors.text }}>
                {t('areaDetail.detailsSheet.webhookUrlLabel')}
              </Text>
              <Input variant="outline" size="md">
                <InputField
                  value={webhookUrl}
                  onChangeText={setWebhookUrl}
                  placeholder={t('areaDetail.detailsSheet.webhookUrlPlaceholder')}
                />
              </Input>
            </View>

            <View>
              <Text className="text-sm font-semibold mb-2" style={{ color: colors.text }}>
                {t('areaDetail.detailsSheet.serviceOptionalLabel')}
              </Text>
              {loading ? (
                <ActivityIndicator size="small" color={colors.info} />
              ) : (
                <ScrollView
                  className="max-h-40 rounded-lg border"
                  style={{
                    borderColor: colors.border,
                    backgroundColor: colors.card,
                  }}
                >
                  {services.map((service) => (
                    <TouchableOpacity
                      key={service.id}
                      onPress={() => setSelectedService(service)}
                      className="p-3"
                      style={{
                        backgroundColor: selectedService?.id === service.id
                          ? colors.info + '20'
                          : colors.card,
                        borderBottomWidth: 1,
                        borderBottomColor: colors.border,
                      }}
                    >
                      <Text
                        className="text-sm"
                        style={{
                          color: selectedService?.id === service.id
                            ? colors.info
                            : colors.text,
                          fontWeight: selectedService?.id === service.id ? '600' : '400',
                        }}
                      >
                        {service.name}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              )}
            </View>
          </>
        )}

        {triggerType === 'cron' && (
          <View>
            <Text className="text-sm font-semibold mb-2" style={{ color: colors.text }}>
              {t('areaDetail.detailsSheet.cronLabel')}
            </Text>
            <Input variant="outline" size="md">
              <InputField
                value={cronExpression}
                onChangeText={setCronExpression}
                placeholder={t('areaDetail.detailsSheet.cronPlaceholder')}
              />
            </Input>
            <Text className="text-xs mt-1" style={{ color: colors.textSecondary }}>
              {t('areaDetail.detailsSheet.cronHelper')}
            </Text>
          </View>
        )}
      </VStack>
    );
  };

  const renderReactionSettings = () => {
    return (
      <VStack space="md" className="mt-4">
        <View>
          <Text className="text-sm font-semibold mb-2" style={{ color: colors.text }}>
            {t('areaDetail.detailsSheet.selectServiceLabel')}
          </Text>
          {loading ? (
            <ActivityIndicator size="small" color={colors.info} />
          ) : (
            <ScrollView
              className="max-h-60 rounded-lg border"
              style={{
                borderColor: colors.border,
                backgroundColor: colors.card,
              }}
            >
              {services.map((service) => (
                <TouchableOpacity
                  key={service.id}
                  onPress={() => setSelectedService(service)}
                  className="flex-row gap-4 justify-between p-3"
                  style={{
                    backgroundColor: selectedService?.id === service.id
                      ? colors.info + '20'
                      : colors.card,
                    borderBottomWidth: 1,
                    borderBottomColor: colors.border,
                  }}
                >
                  <Text
                    className="text-base"
                    style={{
                      color: selectedService?.id === service.id
                        ? colors.info
                        : colors.text,
                      fontWeight: selectedService?.id === service.id ? '600' : '400',
                    }}
                  >
                    {service.name}
                  </Text>
                  <Text className="text-xs mt-1" style={{ color: colors.textSecondary }}>
                    {t('areaDetail.detailsSheet.authLabel')} {service.auth}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          )}
        </View>

        {selectedService && (
          <View
            className="p-3 rounded-lg border"
            style={{
              backgroundColor: colors.info + '20',
              borderColor: colors.info,
            }}
          >
            <Text className="text-sm" style={{ color: colors.text }}>
              {t('areaDetail.detailsSheet.selectedService')}{' '}
              <Text className="font-semibold" style={{ color: colors.info }}>
                {selectedService.name}
              </Text>
            </Text>
            <Text className="text-xs mt-1" style={{ color: colors.textSecondary }}>
              {t('areaDetail.detailsSheet.selectedServiceHelper')}
            </Text>
          </View>
        )}
      </VStack>
    );
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View className="flex-1" style={{ backgroundColor: colors.backgroundSecondary }}>
        <View
          className="flex-row items-center justify-between p-4 border-b"
          style={{
            backgroundColor: colors.info,
            borderBottomColor: colors.border,
          }}
        >
          <Heading size="lg" className="text-white">
            {t('areaDetail.detailsSheet.title')}
          </Heading>
          <TouchableOpacity onPress={onClose}>
            <X size={24} color="white" />
          </TouchableOpacity>
        </View>

        <ScrollView className="flex-1 p-4">
          {card && (
            <VStack space="lg">
              <View
                className="p-3 rounded-lg border"
                style={{
                  backgroundColor: colors.info + '20',
                  borderColor: colors.info,
                }}
              >
                <Text
                  className="text-sm font-semibold uppercase"
                  style={{ color: colors.info }}
                >
                  {card.type === 'action'
                    ? t('areaDetail.detailsSheet.cardType.action')
                    : t('areaDetail.detailsSheet.cardType.reaction')}
                </Text>
              </View>
              <View>
                <Text className="text-sm font-semibold mb-2" style={{ color: colors.text }}>
                  {t('areaDetail.detailsSheet.nameLabel')}
                </Text>
                <Input variant="outline" size="md">
                  <InputField
                    value={name}
                    onChangeText={setName}
                    placeholder={t('areaDetail.detailsSheet.namePlaceholder')}
                  />
                </Input>
              </View>
              {card.type === 'action' ? renderActionSettings() : renderReactionSettings()}
            </VStack>
          )}
        </ScrollView>
        <View
          className="p-4 border-t"
          style={{
            backgroundColor: colors.card,
            borderTopColor: colors.border,
          }}
        >
          <View className="flex-row gap-3">
            <Button
              onPress={onClose}
              variant="outline"
              className="flex-1"
              style={{ borderColor: colors.border }}
            >
              <ButtonText style={{ color: colors.text }}>
                {t('areaDetail.detailsSheet.cancel')}
              </ButtonText>
            </Button>
            <Button
              onPress={handleSave}
              className="flex-1"
              style={{ backgroundColor: colors.info }}
            >
              <ButtonText className="text-white">
                {t('areaDetail.detailsSheet.save')}
              </ButtonText>
            </Button>
          </View>
        </View>
      </View>
    </Modal>
  );
}
