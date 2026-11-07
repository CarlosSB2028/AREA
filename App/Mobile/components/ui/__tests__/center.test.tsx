import { render, screen } from '@testing-library/react-native';
import React from 'react';
import { Text } from 'react-native';
import { Center } from '../center';

describe('Center', () => {
  it('renders children', () => {
    render(
      <Center>
        <Text>center-child</Text>
      </Center>
    );
    expect(screen.getByText('center-child')).toBeTruthy();
  });
});
