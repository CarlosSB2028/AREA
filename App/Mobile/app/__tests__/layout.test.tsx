import { render } from '@testing-library/react-native';
import React from 'react';
import RootLayout from '../_layout';

// Mock expo-router Stack to render simple text nodes
jest.mock('expo-router', () => {
  const { Fragment } = require('react');
  const { Text } = require('react-native');
  const StackComp: any = ({ children }: any) => <Fragment>{children}</Fragment>;
  StackComp.Screen = ({ name }: any) => <Text>screen:{name}</Text>;
  return { Stack: StackComp };
});

describe('RootLayout', () => {
  it('renders Stack without header', () => {
    render(<RootLayout />);
  });
});
