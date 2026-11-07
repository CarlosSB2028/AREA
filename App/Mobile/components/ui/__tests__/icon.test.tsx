import { render } from '@testing-library/react-native';
import React from 'react';
import { Path } from 'react-native-svg';
import { AddIcon, Icon, createIcon } from '../icon';

describe('Icon', () => {
  it('renders with default props', () => {
    const { toJSON } = render(<Icon />);
    expect(toJSON()).toBeTruthy();
  });

  it('renders with numeric size', () => {
  const { toJSON } = render(<Icon size="xl" />);
    expect(toJSON()).toBeTruthy();
  });

  it('renders when height/width specified and size is undefined', () => {
    const { toJSON } = render(
      // Explicitly pass undefined to enter the height/width branch
      <Icon height={12} width={12} size={undefined as any} />
    );
    expect(toJSON()).toBeTruthy();
  });

  it('renders a custom icon created via exported createIcon', () => {
    const MyIcon = createIcon({
      viewBox: '0 0 24 24',
      path: (
        <>
          <Path d="M4 12H20" strokeWidth={2} />
          <Path d="M12 4V20" strokeWidth={2} />
        </>
      ),
    });
    const MyIconAny = MyIcon as any;
    const { toJSON } = render(<MyIconAny size="xl" />);
    expect(toJSON()).toBeTruthy();
  });

  it('renders a built-in AddIcon', () => {
    // Built-in icons from core createIcon may not accept string size; use width/height
    const { toJSON } = render(<AddIcon width={16} height={16} />);
    expect(toJSON()).toBeTruthy();
  });
});
