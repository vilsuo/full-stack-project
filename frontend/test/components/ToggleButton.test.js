import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import ToggleButton from '../../src/components/ToggleButton';

describe('<ToggleButton />', () => {
  test.each([
    { value: false, label: 'on' },
    { value: true, label: 'off' }
  ])('can be toggled $label', async ({ value, label }) => {
    const mockHandler = jest.fn();
    const toggled = value;

    const user = userEvent.setup();

    render(
      <ToggleButton
        toggled={toggled}
        setToggled={mockHandler}
      >
        Toggle Me!
      </ToggleButton>
    );

    const button = screen.getByRole('button', { name: /Toggle Me!/i });
    await user.click(button);

    expect(mockHandler.mock.calls).toHaveLength(1);
    expect(mockHandler).toHaveBeenCalledWith(!toggled);
  });
});