import React from 'react';
import { Pressable, Alert } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Box } from '@/components/ui/box';
import { HStack } from '@/components/ui/hstack';
import { VStack } from '@/components/ui/vstack';
import { Text } from '@/components/ui/text';
import { Badge, BadgeText } from '@/components/ui/badge';
import { Icon } from '@/components/ui/icon';
import { Button, ButtonIcon, ButtonText } from '@/components/ui/button';
import { useThemeColors } from '@/hooks/useThemeColors';
import { Zap, Edit, Trash2, Play, Power, PowerOff } from 'lucide-react-native';
import type { Area, AreaDto } from '@/types/areas';

export interface AreaListCardProps {
  area: Area | AreaDto;
  onPress?: () => void;
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
  onRun?: (id: string) => void;
  onToggle?: (id: string, enabled: boolean) => void;
}

export const AreaListCard: React.FC<AreaListCardProps> = ({ area, onPress, onEdit, onDelete, onRun, onToggle }) => {
  const { t } = useTranslation();
  const colors = useThemeColors();
  const isAreaDto = 'actions' in area && 'reactions' in area;
  const services = isAreaDto ? [] : (area as Area).services || [];
  const lastRun = isAreaDto ? area.updatedAt : (area as Area).lastRun;
  const actionsCount = isAreaDto ? (area as AreaDto).actions.length : 0;
  const reactionsCount = isAreaDto ? (area as AreaDto).reactions.length : 0;

  const handleEdit = () => {
    onEdit?.(area.id);
  };

  const handleDelete = () => {
    Alert.alert(
      t('areas.card.delete.title', 'Delete Area'),
      t('areas.card.delete.message', 'Are you sure you want to delete this area?'),
      [
        {
          text: t('common.cancel', 'Cancel'),
          style: 'cancel'
        },
        {
          text: t('common.delete', 'Delete'),
          style: 'destructive',
          onPress: () => onDelete?.(area.id)
        }
      ]
    );
  };

  const handleRun = () => {
    onRun?.(area.id);
  };

  const handleToggle = () => {
    Alert.alert(
      area.enabled
        ? t('areas.card.disable.title', 'Disable Area')
        : t('areas.card.enable.title', 'Enable Area'),
      area.enabled
        ? t('areas.card.disable.message', 'Are you sure you want to disable this area?')
        : t('areas.card.enable.message', 'Are you sure you want to enable this area?'),
      [
        {
          text: t('common.cancel', 'Cancel'),
          style: 'cancel'
        },
        {
          text: t('common.confirm', 'Confirm'),
          onPress: () => onToggle?.(area.id, !area.enabled)
        }
      ]
    );
  };

  return (
    <Pressable onPress={onPress}>
      <Box
        className="rounded-lg p-4 mb-3 border shadow-sm"
        style={{
          backgroundColor: colors.card,
          borderColor: colors.info,
        }}
      >
        <VStack space="md">
          <HStack className="items-center justify-between">
            <HStack className="items-center flex-1" space="sm">
              <Box className="rounded-lg p-2" style={{ backgroundColor: colors.info }}>
                <Icon as={Zap} size="sm" className="text-white" />
              </Box>
              <VStack className="flex-1">
                <Text
                  className="font-semibold text-base"
                  style={{ color: colors.text }}
                  numberOfLines={1}
                >
                  {area.name}
                </Text>
                <HStack space="xs" className="items-center mt-1">
                  <Box
                    className="w-2 h-2 rounded-full"
                    style={{
                      backgroundColor: area.enabled ? colors.success : colors.disabled,
                    }}
                  />
                  <Text className="text-xs" style={{ color: colors.textSecondary }}>
                    {area.enabled
                      ? t('areas.card.active', 'Active')
                      : t('areas.card.inactive', 'Inactive')}
                  </Text>
                </HStack>
              </VStack>
            </HStack>
          </HStack>

          {area.description && (
            <Text className="text-sm" style={{ color: colors.textSecondary }} numberOfLines={2}>
              {area.description}
            </Text>
          )}

          {isAreaDto && (
            <HStack space="md">
              <Badge size="sm" variant="outline" className="border-blue-300">
                <BadgeText className="text-xs text-blue-600">
                  {t('areas.card.triggers', { count: actionsCount, defaultValue: `${actionsCount} Triggers` })}
                </BadgeText>
              </Badge>
              <Badge size="sm" variant="outline" className="border-blue-300">
                <BadgeText className="text-xs text-blue-600">
                  {t('areas.card.actions', { count: reactionsCount, defaultValue: `${reactionsCount} Actions` })}
                </BadgeText>
              </Badge>
            </HStack>
          )}

          {!isAreaDto && services.length > 0 && (
            <HStack space="xs" className="flex-wrap">
              {services.slice(0, 3).map((service, index) => (
                <Badge key={index} size="sm" variant="outline" className="border-blue-300">
                  <BadgeText className="text-xs text-blue-600">{service}</BadgeText>
                </Badge>
              ))}
              {services.length > 3 && (
                <Badge size="sm" variant="outline" className="border-gray-300">
                  <BadgeText className="text-xs" style={{ color: colors.textSecondary }}>
                    +{services.length - 3}
                  </BadgeText>
                </Badge>
              )}
            </HStack>
          )}

          {lastRun && (
            <Text className="text-xs" style={{ color: colors.textTertiary }}>
              {t('areas.card.lastRun', 'Last run')}: {new Date(lastRun).toLocaleDateString()}
            </Text>
          )}

          {(onEdit || onDelete || onRun || onToggle) && (
            <HStack space="sm" className="mt-3">
              {onEdit && (
                <Button
                  size="sm"
                  variant="solid"
                  onPress={handleEdit}
                  className="flex-1 rounded-lg"
                  style={{ backgroundColor: colors.info }}
                >
                  <ButtonIcon as={Edit} size="sm" color="white" />
                  <ButtonText className="text-white text-xs ml-1">
                    {t('areas.card.edit', 'Edit')}
                  </ButtonText>
                </Button>
              )}
              {onRun && (
                <Button
                  size="sm"
                  variant="solid"
                  onPress={handleRun}
                  className="flex-1 rounded-lg"
                  style={{ backgroundColor: colors.success }}
                >
                  <ButtonIcon as={Play} size="sm" color="white" />
                  <ButtonText className="text-white text-xs ml-1">
                    {t('areas.card.run', 'Run')}
                  </ButtonText>
                </Button>
              )}
              {onToggle && (
                <Button
                  size="sm"
                  variant="solid"
                  onPress={handleToggle}
                  className="flex-1 rounded-lg"
                  style={{ backgroundColor: area.enabled ? colors.warning : colors.success }}
                >
                  <ButtonIcon
                    as={area.enabled ? PowerOff : Power}
                    size="sm"
                    color="white"
                  />
                  <ButtonText className="text-white text-xs ml-1">
                    {area.enabled
                      ? t('areas.card.disable', 'Disable')
                      : t('areas.card.enable', 'Enable')}
                  </ButtonText>
                </Button>
              )}
              {onDelete && (
                <Button
                  size="sm"
                  variant="solid"
                  onPress={handleDelete}
                  className="rounded-lg"
                  style={{ backgroundColor: colors.error, minWidth: 44 }}
                >
                  <ButtonIcon as={Trash2} size="sm" color="white" />
                </Button>
              )}
            </HStack>
          )}
        </VStack>
      </Box>
    </Pressable>
  );
};
