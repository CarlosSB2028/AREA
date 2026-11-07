'use client';

import React, { useState } from 'react';
import { Stack, Group, Text, TextInput, Button, Pill } from '@mantine/core';
import type { FieldData } from '@/types';

interface ArrayInputProps {
  field: FieldData;
  value: unknown;
  onChange: (value: unknown) => void;
}

export function ArrayInput({ field, value, onChange }: ArrayInputProps) {
  const arrayValue = Array.isArray(value) ? value : [];
  const [inputValue, setInputValue] = useState('');

  return (
    <div>
      <Text size="sm" fw={500} mb={5}>
        {field.name}
        {field.mandatory && <span style={{ color: 'red' }}> *</span>}
      </Text>
      {field.description && (
        <Text size="xs" c="dimmed" mb={8}>
          {field.description}
        </Text>
      )}
      <Stack gap="xs">
        <Group
          gap="xs"
          style={{ flexWrap: 'wrap', minHeight: arrayValue.length > 0 ? 'auto' : '40px' }}
        >
          {arrayValue.map((item: unknown, index: number) => (
            <Pill
              key={index}
              withRemoveButton
              onRemove={() => {
                const newArray = arrayValue.filter((_: unknown, i: number) => i !== index);
                onChange(newArray);
              }}
            >
              {String(item)}
            </Pill>
          ))}
          {arrayValue.length === 0 && (
            <Text size="sm" c="dimmed" style={{ padding: '8px' }}>
              No items yet. Add items below.
            </Text>
          )}
        </Group>
        <Group gap="xs">
          <TextInput
            placeholder={field.placeholder || 'Type and press Enter or click Add'}
            value={inputValue}
            onChange={(e) => setInputValue(e.currentTarget.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && inputValue.trim()) {
                e.preventDefault();
                const newArray = [...arrayValue, inputValue.trim()];
                onChange(newArray);
                setInputValue('');
              }
            }}
            style={{ flex: 1 }}
          />
          <Button
            size="sm"
            onClick={() => {
              if (inputValue.trim()) {
                const newArray = [...arrayValue, inputValue.trim()];
                onChange(newArray);
                setInputValue('');
              }
            }}
            disabled={!inputValue.trim()}
          >
            Add
          </Button>
        </Group>
      </Stack>
    </div>
  );
}
