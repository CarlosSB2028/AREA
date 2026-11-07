import React from 'react';
import { View, TextInput, TouchableOpacity } from 'react-native';
import { Edit3, Trash2, ArrowLeft } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Box } from '@/components/ui/box';
import { Text } from '@/components/ui/text';
import { Icon } from '@/components/ui/icon';

interface AreaHeaderProps {
  title: string;
  description: string;
  isEditing: boolean;
  onChangeTitle: (value: string) => void;
  onChangeDescription: (value: string) => void;
  onToggleEditing: () => void;
  onRequestDelete: () => void;
  onBack?: () => void;
}

export function AreaHeader({
  title,
  description,
  isEditing,
  onChangeTitle,
  onChangeDescription,
  onToggleEditing,
  onRequestDelete,
  onBack,
}: AreaHeaderProps) {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const containerStyle = React.useMemo(
    () => ({
      paddingTop: insets.top + 5,
      marginTop: -insets.top,
      zIndex: 40,
      elevation: 40,
    }),
    [insets.top]
  );

  return (
    <Box
      className="bg-blue-600 px-4 pb-4 border-b border-blue-700 shadow-md"
      style={containerStyle}
    >
      <View className="flex-row items-center justify-between">
        {onBack && (
          <TouchableOpacity
            onPress={onBack}
            className="p-2 mr-2"
            testID="back-button"
          >
            <Icon as={ArrowLeft} size="xl" className="text-white" />
          </TouchableOpacity>
        )}

        <View className="flex-1">
          {isEditing ? (
            <View>
              <TextInput
                value={title}
                onChangeText={onChangeTitle}
                className="text-xl font-bold text-white border-b border-blue-400 pb-1 mb-2"
                placeholder={t('areaDetail.header.titlePlaceholder')}
                placeholderTextColor="rgba(255,255,255,0.7)"
              />
              <TextInput
                value={description}
                onChangeText={onChangeDescription}
                className="text-sm text-white border-b border-blue-400 pb-1"
                placeholder={t('areaDetail.header.descriptionPlaceholder')}
                placeholderTextColor="rgba(255,255,255,0.7)"
                multiline
              />
            </View>
          ) : (
            <View>
              <Text className="text-xl font-bold text-white">{title}</Text>
            </View>
          )}
        </View>

        <View className="flex-row gap-2 ml-4">
          <TouchableOpacity
            onPress={onToggleEditing}
            className="p-2 bg-white rounded-full"
            testID="toggle-edit"
          >
            <Edit3 size={20} color="#2563EB" />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={onRequestDelete}
            className="p-2 bg-red-500 rounded-full"
            testID="request-delete"
          >
            <Trash2 size={20} color="white" />
          </TouchableOpacity>
        </View>
      </View>
    </Box>
  );
}
