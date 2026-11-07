import { Activity, ArrowRight, Zap } from 'lucide-react-native';
import React from 'react';
import { useTranslation } from 'react-i18next';

import { Badge, BadgeText } from '@/components/ui/badge';
import { Box } from '@/components/ui/box';
import { Button, ButtonText } from '@/components/ui/button';
import { HStack } from '@/components/ui/hstack';
import { Icon } from '@/components/ui/icon';
import { Pressable } from '@/components/ui/pressable';
import { Text } from '@/components/ui/text';
import { VStack } from '@/components/ui/vstack';

export interface ActionReactionItemProps {
  actionName: string;
  reactionName: string;
  actionIcon: any;
  reactionIcon: any;
  isConnected: boolean;
  onConnect?: () => void;
  onPress?: () => void;
  actionColor?: string;
  reactionColor?: string;
}

export const ActionReactionItem: React.FC<ActionReactionItemProps> = ({
  actionName,
  reactionName,
  actionIcon,
  reactionIcon,
  isConnected,
  onConnect,
  onPress,
  actionColor = '#6366f1',
  reactionColor = '#8b5cf6',
}) => {
  const { t } = useTranslation();

  const handlePress = () => {
    if (onPress) {
      onPress();
    }
  };

  const handleConnectPress = (e?: any) => {
    try {
      e?.stopPropagation?.();
    } catch {
      // Ignore error
    }
    if (onConnect) {
      onConnect();
    }
  };

  return (
    <Pressable onPress={handlePress} testID="action-reaction-item">
      <Box className="bg-background-0 rounded-xl p-4 shadow-soft-1 border border-outline-100">
        <VStack space="md">
          {/* Status Badge */}
          <HStack justify="between" align="center">
            <Badge
              size="sm"
              variant="solid"
              action={isConnected ? 'success' : 'warning'}
            >
              <BadgeText>
                {isConnected
                  ? t('actionReaction.connected')
                  : t('actionReaction.notConnected')}
              </BadgeText>
            </Badge>
          </HStack>

          {/* Action → Reaction Flow */}
          <HStack space="sm" align="center">
            {/* Action Section */}
            <Box className="flex-1 bg-primary-50 rounded-lg p-3">
              <VStack space="sm" className="items-center">
                <Box
                  className="w-12 h-12 rounded-full items-center justify-center"
                  style={{ backgroundColor: actionColor + '20' }}
                >
                  <Icon as={actionIcon} size="lg" style={{ color: actionColor }} />
                </Box>
                <VStack space="xs" className="items-center">
                  <HStack space="xs" align="center">
                    <Icon as={Zap} size="xs" className="text-primary-600" />
                    <Text size="xs" className="text-primary-700 font-semibold">
                      {t('actionReaction.action')}
                    </Text>
                  </HStack>
                  <Text
                    size="sm"
                    className="text-typography-900 text-center font-medium"
                    numberOfLines={2}
                  >
                    {actionName}
                  </Text>
                </VStack>
              </VStack>
            </Box>

            {/* Arrow */}
            <Icon as={ArrowRight} size="xl" className="text-typography-400" />

            {/* Reaction Section */}
            <Box className="flex-1 bg-secondary-50 rounded-lg p-3">
              <VStack space="sm" className="items-center">
                <Box
                  className="w-12 h-12 rounded-full items-center justify-center"
                  style={{ backgroundColor: reactionColor + '20' }}
                >
                  <Icon
                    as={reactionIcon}
                    size="lg"
                    style={{ color: reactionColor }}
                  />
                </Box>
                <VStack space="xs" className="items-center">
                  <HStack space="xs" align="center">
                    <Icon as={Activity} size="xs" className="text-secondary-600" />
                    <Text size="xs" className="text-secondary-700 font-semibold">
                      {t('actionReaction.reaction')}
                    </Text>
                  </HStack>
                  <Text
                    size="sm"
                    className="text-typography-900 text-center font-medium"
                    numberOfLines={2}
                  >
                    {reactionName}
                  </Text>
                </VStack>
              </VStack>
            </Box>
          </HStack>

          {/* Connect Button (only if not connected) */}
          {!isConnected && onConnect && (
            <Button
              size="sm"
              variant="outline"
              action="primary"
              onPress={handleConnectPress}
              testID="connect-button"
            >
              <ButtonText>{t('actionReaction.connect')}</ButtonText>
            </Button>
          )}
        </VStack>
      </Box>
    </Pressable>
  );
};

export default ActionReactionItem;
