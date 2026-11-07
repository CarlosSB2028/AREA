import { render } from '@testing-library/react-native';
import React from 'react';
import Index from '../index';

jest.mock('expo-router', () => {
  const actual = jest.requireActual('expo-router');
  const { Text } = require('react-native');
  return { ...actual, Redirect: ({ href }: any) => <Text>{`redirect:${href}`}</Text> };
});

describe('Index route', () => {
  it('redirects to tabs', () => {
    const { getByText } = render(<Index />);
    expect(getByText('redirect:/(tabs)')).toBeTruthy();
  });
});
