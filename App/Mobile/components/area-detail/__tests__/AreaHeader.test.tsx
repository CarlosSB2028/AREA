import React from 'react';
import { fireEvent, render } from '@testing-library/react-native';
import { AreaHeader } from '../AreaHeader';
import i18n from '@/i18n';

describe('AreaHeader', () => {
  const onChangeTitle = jest.fn();
  const onChangeDescription = jest.fn();
  const onToggleEditing = jest.fn();
  const onRequestDelete = jest.fn();

  const defaultProps = {
    title: 'My Automation',
    description: 'Keep workflows flowing',
    isEditing: false,
    onChangeTitle,
    onChangeDescription,
    onToggleEditing,
    onRequestDelete,
  };

  beforeEach(() => {
    onChangeTitle.mockClear();
    onChangeDescription.mockClear();
    onToggleEditing.mockClear();
    onRequestDelete.mockClear();
  });

  it('renders display mode and triggers edit/delete actions', () => {
    const { getByTestId } = render(<AreaHeader {...defaultProps} />);

    fireEvent.press(getByTestId('toggle-edit'));
    expect(onToggleEditing).toHaveBeenCalled();

    fireEvent.press(getByTestId('request-delete'));
    expect(onRequestDelete).toHaveBeenCalled();
  });

  it('renders editable fields and propagates changes', () => {
    const { getByPlaceholderText } = render(
      <AreaHeader
        {...defaultProps}
        isEditing
      />
    );

    fireEvent.changeText(
      getByPlaceholderText(i18n.t('areaDetail.header.titlePlaceholder')),
      'Updated'
    );
    expect(onChangeTitle).toHaveBeenCalledWith('Updated');

    fireEvent.changeText(
      getByPlaceholderText(i18n.t('areaDetail.header.descriptionPlaceholder')),
      'Details'
    );
    expect(onChangeDescription).toHaveBeenCalledWith('Details');
  });
});
