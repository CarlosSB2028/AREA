import React from 'react';
import { TextInput } from 'react-native';
import { Box } from '@/components/ui/box';
import { VStack } from '@/components/ui/vstack';
import { HStack } from '@/components/ui/hstack';
import { Text } from '@/components/ui/text';
import { useTranslation } from 'react-i18next';
import type { FieldData } from '@/types/areas';

interface DynamicFieldProps {
  field: FieldData;
  value: unknown;
  onChange: (name: string, value: unknown) => void;
}

export function DynamicField({ field, value, onChange }: DynamicFieldProps) {
  const { t } = useTranslation();

  const renderField = () => {
    switch (field.type) {
      case 'text':
      case 'email':
        return (
          <Box className="bg-background-50 rounded-lg px-3 py-2 border border-outline-100">
            <TextInput
              className="text-typography-900"
              placeholder={field.placeholder || `Enter ${field.name}`}
              value={value as string || ''}
              onChangeText={(text) => onChange(field.name, text)}
              keyboardType={field.type === 'email' ? 'email-address' : 'default'}
              placeholderTextColor="#9CA3AF"
            />
          </Box>
        );

      case 'number':
        return (
          <Box className="bg-background-50 rounded-lg px-3 py-2 border border-outline-100">
            <TextInput
              className="text-typography-900"
              placeholder={field.placeholder || `Enter ${field.name}`}
              value={value?.toString() || ''}
              onChangeText={(text) => {
                const num = parseFloat(text);
                onChange(field.name, isNaN(num) ? undefined : num);
              }}
              keyboardType="numeric"
              placeholderTextColor="#9CA3AF"
            />
          </Box>
        );

      case 'date':
        return (
          <Box className="bg-background-50 rounded-lg px-3 py-2 border border-outline-100">
            <TextInput
              className="text-typography-900"
              placeholder="YYYY-MM-DD"
              value={value as string || ''}
              onChangeText={(text) => onChange(field.name, text)}
              placeholderTextColor="#9CA3AF"
            />
          </Box>
        );

      case 'datetime':
        return (
          <Box className="bg-background-50 rounded-lg px-3 py-2 border border-outline-100">
            <TextInput
              className="text-typography-900"
              placeholder="YYYY-MM-DD HH:mm:ss"
              value={value as string || ''}
              onChangeText={(text) => onChange(field.name, text)}
              placeholderTextColor="#9CA3AF"
            />
          </Box>
        );

      case 'time':
        return (
          <Box className="bg-background-50 rounded-lg px-3 py-2 border border-outline-100">
            <TextInput
              className="text-typography-900"
              placeholder="HH:mm:ss"
              value={value as string || ''}
              onChangeText={(text) => onChange(field.name, text)}
              placeholderTextColor="#9CA3AF"
            />
          </Box>
        );

      default:
        return (
          <Box className="bg-background-50 rounded-lg px-3 py-2 border border-outline-100">
            <TextInput
              className="text-typography-900"
              placeholder={field.placeholder || `Enter ${field.name}`}
              value={value as string || ''}
              onChangeText={(text) => onChange(field.name, text)}
              multiline={field.type === 'array'}
              numberOfLines={field.type === 'array' ? 3 : 1}
              placeholderTextColor="#9CA3AF"
            />
          </Box>
        );
    }
  };

  return (
    <VStack space="xs">
      <HStack className="items-center justify-between">
        <Text className="text-typography-700 text-sm">
          {field.name}
          {field.mandatory && <Text className="text-danger-600"> *</Text>}
        </Text>
        {field.description && (
          <Text className="text-typography-500 text-xs flex-1 text-right ml-2">
            {field.description}
          </Text>
        )}
      </HStack>
      {renderField()}
      {field.pattern && (
        <Text className="text-typography-500 text-xs">
          {t('configurator.pattern', 'Pattern')}: {field.pattern}
        </Text>
      )}
      {field.minLength !== undefined && field.maxLength !== undefined && (
        <Text className="text-typography-500 text-xs">
          {t('configurator.length', 'Length')}: {field.minLength}-{field.maxLength}
        </Text>
      )}
      {field.minimum !== undefined && field.maximum !== undefined && (
        <Text className="text-typography-500 text-xs">
          {t('configurator.range', 'Range')}: {field.minimum}-{field.maximum}
        </Text>
      )}
    </VStack>
  );
}
