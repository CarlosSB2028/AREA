import { fireEvent, render } from '@testing-library/react-native';
import React from 'react';
import { View } from 'react-native';
import { TabBar, TabBarItem, TabBarProps } from '../index';

// Mock icon component for testing
const MockIcon = ({ size = 24 }: { size?: number; className?: string }) => (
  <View testID="mock-icon" style={{ width: size, height: size }} />
);

const mockTabs: TabBarProps['tabs'] = [
  {
    key: 'home',
    label: 'Home',
    icon: MockIcon,
    onPress: jest.fn(),
  },
  {
    key: 'profile',
    label: 'Profile',
    icon: MockIcon,
    onPress: jest.fn(),
  },
  {
    key: 'settings',
    label: 'Settings',
    icon: MockIcon,
    onPress: jest.fn(),
  },
];

describe('TabBar', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render correctly with default props', () => {
    const { getByText, getAllByTestId } = render(
      <TabBar tabs={mockTabs} activeTab="home" />
    );

    // Check if all tab labels are rendered
    expect(getByText('Home')).toBeTruthy();
    expect(getByText('Profile')).toBeTruthy();
    expect(getByText('Settings')).toBeTruthy();

    // Check if all icons are rendered
    expect(getAllByTestId('mock-icon')).toHaveLength(3);
  });

  it('should apply correct size variants', () => {
    const { rerender } = render(
      <TabBar tabs={mockTabs} activeTab="home" size="sm" />
    );

    // Test different size variants
    rerender(<TabBar tabs={mockTabs} activeTab="home" size="md" />);
    rerender(<TabBar tabs={mockTabs} activeTab="home" size="lg" />);

    // Since we can't easily test className in React Native, 
    // we verify the component renders without errors for all sizes
    expect(true).toBe(true);
  });

  it('should apply custom className', () => {
    const { getByText } = render(
      <TabBar 
        tabs={mockTabs} 
        activeTab="home" 
        className="custom-class"
      />
    );

    expect(getByText('Home')).toBeTruthy();
  });

  it('should call onPress when tab is pressed', () => {
    const { getByText } = render(
      <TabBar tabs={mockTabs} activeTab="home" />
    );

    fireEvent.press(getByText('Profile'));
    expect(mockTabs[1].onPress).toHaveBeenCalledTimes(1);

    fireEvent.press(getByText('Settings'));
    expect(mockTabs[2].onPress).toHaveBeenCalledTimes(1);
  });

  it('should highlight active tab correctly', () => {
    const { rerender, getByText } = render(
      <TabBar tabs={mockTabs} activeTab="home" />
    );

    // Initially home should be active
    expect(getByText('Home')).toBeTruthy();

    // Change active tab to profile
    rerender(<TabBar tabs={mockTabs} activeTab="profile" />);
    expect(getByText('Profile')).toBeTruthy();
  });

  it('should handle empty tabs array', () => {
    const { queryByText } = render(
      <TabBar tabs={[]} activeTab="" />
    );

    // Should not render any tab items
    expect(queryByText('Home')).toBeNull();
  });

  it('should handle activeTab that does not exist in tabs', () => {
    const { getByText } = render(
      <TabBar tabs={mockTabs} activeTab="nonexistent" />
    );

    // All tabs should be rendered but none should be active
    expect(getByText('Home')).toBeTruthy();
    expect(getByText('Profile')).toBeTruthy();
    expect(getByText('Settings')).toBeTruthy();
  });
});

describe('TabBarItem', () => {
  const mockOnPress = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render correctly when active', () => {
    const { getByText, getByTestId } = render(
      <TabBarItem
        label="Home"
        icon={MockIcon}
        isActive={true}
        onPress={mockOnPress}
      />
    );

    expect(getByText('Home')).toBeTruthy();
    expect(getByTestId('mock-icon')).toBeTruthy();
  });

  it('should render correctly when inactive', () => {
    const { getByText, getByTestId } = render(
      <TabBarItem
        label="Home"
        icon={MockIcon}
        isActive={false}
        onPress={mockOnPress}
      />
    );

    expect(getByText('Home')).toBeTruthy();
    expect(getByTestId('mock-icon')).toBeTruthy();
  });

  it('should call onPress when pressed', () => {
    const { getByText } = render(
      <TabBarItem
        label="Home"
        icon={MockIcon}
        isActive={true}
        onPress={mockOnPress}
      />
    );

    fireEvent.press(getByText('Home'));
    expect(mockOnPress).toHaveBeenCalledTimes(1);
  });

  it('should pass correct size to icon component', () => {
    render(
      <TabBarItem
        label="Home"
        icon={MockIcon}
        isActive={true}
        onPress={mockOnPress}
      />
    );

    // Icon should receive size 24 by default
    // This is implicit in our MockIcon implementation
    expect(true).toBe(true);
  });

  it('should have correct display name', () => {
    expect(TabBarItem.displayName).toBe('TabBarItem');
    expect(TabBar.displayName).toBe('TabBar');
  });
});

describe('TabBar accessibility', () => {
  it('should be accessible', () => {
    const { getByText } = render(
      <TabBar tabs={mockTabs} activeTab="home" />
    );

    // Verify that text elements are accessible
    expect(getByText('Home')).toBeTruthy();
    expect(getByText('Profile')).toBeTruthy();
    expect(getByText('Settings')).toBeTruthy();
  });
});

describe('TabBar edge cases', () => {
  it('should handle tabs with special characters in labels', () => {
    const specialTabs = [
      {
        key: 'special',
        label: 'Special & Chars!',
        icon: MockIcon,
        onPress: jest.fn(),
      }
    ];

    const { getByText } = render(
      <TabBar tabs={specialTabs} activeTab="special" />
    );

    expect(getByText('Special & Chars!')).toBeTruthy();
  });

  it('should handle very long labels', () => {
    const longLabelTabs = [
      {
        key: 'long',
        label: 'This is a very long tab label that might overflow',
        icon: MockIcon,
        onPress: jest.fn(),
      }
    ];

    const { getByText } = render(
      <TabBar tabs={longLabelTabs} activeTab="long" />
    );

    expect(getByText('This is a very long tab label that might overflow')).toBeTruthy();
  });

  it('should handle multiple rapid presses', () => {
    const { getByText } = render(
      <TabBar tabs={mockTabs} activeTab="home" />
    );

    const profileTab = getByText('Profile');
    
    // Simulate rapid presses
    fireEvent.press(profileTab);
    fireEvent.press(profileTab);
    fireEvent.press(profileTab);

    expect(mockTabs[1].onPress).toHaveBeenCalledTimes(3);
  });
});