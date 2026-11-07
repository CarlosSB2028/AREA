import { render } from '@testing-library/react-native';
import React from 'react';
import HomeTab from '../index';

jest.mock('../../screens/HomeScreen', () => {
  const { Text } = require('react-native');
  return () => <Text>HomeScreenMock</Text>;
});

describe('Tabs', () => {
  it('renders HomeTab (index) with HomeScreen content', () => {
    const { getByText } = render(<HomeTab />);
    expect(getByText('HomeScreenMock')).toBeTruthy();
  });
});
