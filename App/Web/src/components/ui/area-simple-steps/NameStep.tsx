'use client';

import React from 'react';
import { Paper, Stack, TextInput, Textarea } from '@mantine/core';

interface NameStepProps {
  areaName: string;
  areaDescription: string;
  onNameChange: (name: string) => void;
  onDescriptionChange: (description: string) => void;
}

export function NameStep({
  areaName,
  areaDescription,
  onNameChange,
  onDescriptionChange,
}: NameStepProps) {
  return (
    <Paper p="xl" radius="md" withBorder mt="xl">
      <Stack gap="md">
        <TextInput
          label="AREA Name"
          placeholder="My automation"
          required
          value={areaName}
          onChange={(e) => onNameChange(e.currentTarget.value)}
          description="Give your AREA a descriptive name"
        />
        <Textarea
          label="Description (optional)"
          placeholder="This AREA does..."
          value={areaDescription}
          onChange={(e) => onDescriptionChange(e.currentTarget.value)}
          minRows={3}
          description="Explain what this AREA will do"
        />
      </Stack>
    </Paper>
  );
}
