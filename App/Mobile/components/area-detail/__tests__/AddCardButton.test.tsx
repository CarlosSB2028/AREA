import React from 'react';
import { Alert } from 'react-native';
import { fireEvent, render } from '@testing-library/react-native';
import { AddCardButton } from '../AddCardButton';
import i18n from '@/i18n';

describe('AddCardButton', () => {
  const alertSpy = jest.spyOn(Alert, 'alert').mockImplementation(() => undefined);

  afterEach(() => {
    alertSpy.mockClear();
  });

  afterAll(() => {
    alertSpy.mockRestore();
  });

  it('opens alert and triggers callbacks when options are selected', () => {
    const onAddAction = jest.fn();
    const onAddReaction = jest.fn();

    const { getByTestId } = render(
      <AddCardButton
        isRemoveZoneActive={false}
        onAddAction={onAddAction}
        onAddReaction={onAddReaction}
        testID="add-card"
      />
    );

    fireEvent.press(getByTestId('add-card'));

    expect(alertSpy).toHaveBeenCalledWith(
      i18n.t('areaDetail.alerts.addCardTitle'),
      i18n.t('areaDetail.alerts.addCardMessage'),
      expect.any(Array)
    );

    const buttons = alertSpy.mock.calls[0]?.[2] ?? [];
    const findButton = (label: string) =>
      buttons.find((button) => button?.text === label);

    findButton(i18n.t('areaDetail.alerts.addCardAction'))?.onPress?.();
    expect(onAddAction).toHaveBeenCalled();

    findButton(i18n.t('areaDetail.alerts.addCardReaction'))?.onPress?.();
    expect(onAddReaction).toHaveBeenCalled();
  });
});
