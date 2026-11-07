import { render } from '@testing-library/react-native';
import React from 'react';
import { Text } from 'react-native';

import { Avatar, AvatarBadge, AvatarFallbackText, AvatarGroup, AvatarImage } from '../avatar';
import { Button, ButtonGroup, ButtonIcon, ButtonSpinner, ButtonText } from '../button';

describe('Button suite', () => {
  it('renders Button with text and spinner', () => {
    const { getByText } = render(
      <Button accessibilityLabel="btn">
        <ButtonSpinner />
        <ButtonText>Click me</ButtonText>
      </Button>
    );
    expect(getByText('Click me')).toBeTruthy();
  });

  it('ButtonIcon uses numeric size branch', () => {
    const { getByTestId } = render(
      <Button>
        <ButtonIcon
          // render as a simple Text to observe it exists
          as={(props: any) => <Text {...props} testID="icon-numeric" />}
          size="md"
        />
      </Button>
    );
    expect(getByTestId('icon-numeric')).toBeTruthy();
  });

  it('ButtonIcon uses explicit height/width branch when size is undefined', () => {
    const { getByTestId } = render(
      <Button>
        <ButtonIcon
          as={(props: any) => <Text {...props} testID="icon-explicit" />}
          height={20}
          width={20}
        />
      </Button>
    );
    expect(getByTestId('icon-explicit')).toBeTruthy();
  });

  it('ButtonIcon falls back to parent variants when using preset size', () => {
    const { getByTestId } = render(
      <Button action="secondary" size="lg" variant="outline">
        <ButtonIcon as={(p: any) => <Text {...p} testID="icon-default" />} size="md" />
      </Button>
    );
    expect(getByTestId('icon-default')).toBeTruthy();
  });

  it('ButtonGroup renders with space and attached props', () => {
    const { getByLabelText } = render(
      <ButtonGroup space="sm" isAttached flexDirection="row">
        <Button accessibilityLabel="btn-1">
          <ButtonText>One</ButtonText>
        </Button>
        <Button accessibilityLabel="btn-2">
          <ButtonText>Two</ButtonText>
        </Button>
      </ButtonGroup>
    );
    expect(getByLabelText('btn-1')).toBeTruthy();
    expect(getByLabelText('btn-2')).toBeTruthy();
  });
});

describe('Avatar suite', () => {
  it('renders Avatar with Image and Badge', () => {
    const { getByTestId } = render(
      <Avatar accessibilityLabel="avatar-root">
        <AvatarImage testID="avatar-image" source={{ uri: 'https://example.com/pic.png' }} />
        <AvatarBadge testID="avatar-badge" />
      </Avatar>
    );
    expect(getByTestId('avatar-image')).toBeTruthy();
    expect(getByTestId('avatar-badge')).toBeTruthy();
  });

  it('AvatarFallbackText renders initials from name and slices to 2 chars', () => {
    const { getByText, rerender, queryByText } = render(
      <Avatar>
        <AvatarFallbackText>John Doe</AvatarFallbackText>
      </Avatar>
    );
    expect(getByText('JD')).toBeTruthy();

    rerender(
      <Avatar>
        <AvatarFallbackText>A B C</AvatarFallbackText>
      </Avatar>
    );
    // Sliced to first two initials only
    expect(getByText('AB')).toBeTruthy();

    rerender(
      <Avatar>
        {/* undefined children path */}
        {/* @ts-expect-error testing undefined path intentionally */}
        <AvatarFallbackText>{undefined}</AvatarFallbackText>
      </Avatar>
    );
    // Should render nothing when children is undefined
    expect(queryByText(/./)).toBeNull();
  });

  it('AvatarGroup renders children', () => {
    const { getByText } = render(
      <AvatarGroup>
        <Avatar>
          <AvatarFallbackText>Jane Doe</AvatarFallbackText>
        </Avatar>
        <Avatar>
          <AvatarFallbackText>John Snow</AvatarFallbackText>
        </Avatar>
      </AvatarGroup>
    );
    expect(getByText('JD')).toBeTruthy();
    expect(getByText('JS')).toBeTruthy();
  });
});
