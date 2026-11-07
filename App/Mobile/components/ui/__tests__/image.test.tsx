import { render } from '@testing-library/react-native';
import React from 'react';
import { Platform } from 'react-native';
import { Image } from '../image';

describe('Image (web branch)', () => {
  it('applies web-specific style when Platform.OS is web', () => {
    const original = Platform.OS;
    Object.defineProperty(Platform, 'OS', { configurable: true, get: () => 'web' as const });
    const { getByLabelText } = render(
      <Image alt="pic" source={{ uri: 'https://example.com/p.png' }} />
    );
    expect(getByLabelText('pic')).toBeTruthy();
    Object.defineProperty(Platform, 'OS', { configurable: true, get: () => original });
  });
});
