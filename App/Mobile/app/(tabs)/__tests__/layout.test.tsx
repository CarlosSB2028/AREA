import { AuthProvider } from '@/contexts/AuthContext';
import { render } from '@testing-library/react-native';
import React from 'react';
import TabLayout from '../_layout';

jest.mock('expo-router', () => {
  const captured: any = { tabsProps: null, screens: [] };
  const TabsComp: any = ({ children, ...props }: any) => {
    captured.tabsProps = props;
    return children ?? null;
  };
  TabsComp.Screen = (props: any) => {
    captured.screens.push(props);
    return null;
  };
  return { 
    Tabs: TabsComp, 
    __captured: captured,
    useRouter: () => ({
      push: jest.fn(),
      replace: jest.fn(),
    }),
  };
});

// Mock expo-secure-store
jest.mock('expo-secure-store', () => ({
  getItemAsync: jest.fn(),
  setItemAsync: jest.fn(),
  deleteItemAsync: jest.fn(),
}));

// Helper pour wrapper avec AuthProvider
const renderWithAuth = (component: React.ReactElement) => {
  return render(<AuthProvider>{component}</AuthProvider>);
};

describe('TabLayout', () => {
  beforeEach(() => {
    const expoRouter = require('expo-router');
    expoRouter.__captured.screens = [];
    expoRouter.__captured.tabsProps = null;
  });
  it('renders without crashing', () => {
    renderWithAuth(<TabLayout />);
  });
});
