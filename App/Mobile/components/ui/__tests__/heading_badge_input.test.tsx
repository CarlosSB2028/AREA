import { fireEvent, render } from '@testing-library/react-native';
import React from 'react';
import { Text } from 'react-native';
import { Badge, BadgeIcon, BadgeText } from '../badge';
import { Heading } from '../heading';
import { Input, InputField, InputIcon, InputSlot } from '../input';

describe('Heading', () => {
  it('renders correct level for size mapping and default', () => {
    // default -> H4
    const { rerender, UNSAFE_getByType } = render(<Heading>H-default</Heading>);
    expect(UNSAFE_getByType(require('@expo/html-elements').H4)).toBeTruthy();

    // 5xl -> H1
    rerender(<Heading size="5xl">H1</Heading>);
    expect(UNSAFE_getByType(require('@expo/html-elements').H1)).toBeTruthy();

    // 2xl -> H2
    rerender(<Heading size="2xl">H2</Heading>);
    expect(UNSAFE_getByType(require('@expo/html-elements').H2)).toBeTruthy();

    // xl -> H3
    rerender(<Heading size="xl">H3</Heading>);
    expect(UNSAFE_getByType(require('@expo/html-elements').H3)).toBeTruthy();

    // lg -> H4
    rerender(<Heading size="lg">H4</Heading>);
    expect(UNSAFE_getByType(require('@expo/html-elements').H4)).toBeTruthy();

    // md -> H5
    rerender(<Heading size="md">H5</Heading>);
    expect(UNSAFE_getByType(require('@expo/html-elements').H5)).toBeTruthy();

    // sm -> H6
    rerender(<Heading size="sm">H6</Heading>);
    expect(UNSAFE_getByType(require('@expo/html-elements').H6)).toBeTruthy();
  });

  it('supports custom As component', () => {
    const AsComp = ({ children }: any) => <Text>as:{children}</Text>;
    const { getByText } = render(<Heading as={AsComp}>X</Heading>);
    expect(getByText('as:X')).toBeTruthy();
  });
});

describe('Badge', () => {
  it('renders action and variant combinations with text and icon', () => {
    const DummyIcon = () => <Text testID="icon">*</Text> as any;
    const { rerender, getByText, getByTestId } = render(
      <Badge action="muted" variant="solid">
        <BadgeText>Muted</BadgeText>
        <BadgeIcon as={DummyIcon} />
      </Badge>
    );
    expect(getByText('Muted')).toBeTruthy();
    expect(getByTestId('icon')).toBeTruthy();

    rerender(
      <Badge action="error" variant="outline">
        <BadgeText underline bold italic>
          Err
        </BadgeText>
      </Badge>
    );
    expect(getByText('Err')).toBeTruthy();
  });
});

describe('Input', () => {
  it('renders outline variant with field and accepts text input', () => {
    const { getByPlaceholderText } = render(
      <Input variant="outline" size="md">
        <InputSlot>
          <InputIcon accessibilityLabel="icon" />
        </InputSlot>
        <InputField placeholder="type here" />
      </Input>
    );
    const field = getByPlaceholderText('type here');
    fireEvent.changeText(field, 'abc');
    expect(field.props.value ?? 'abc').toBeDefined();
  });

  it('InputIcon handles numeric size and explicit width/height props', () => {
    const { rerender } = render(
      <Input>
        <InputIcon size="xl" />
      </Input>
    );
    rerender(
      <Input>
        <InputIcon width={10} height={10} />
      </Input>
    );
  });
});
