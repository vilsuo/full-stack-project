import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event'

import Dropdown from '../../src/components/Dropdown';

const triggerText = 'Trigger';
const actionText1 = '1st';
const actionText2 = '2nd';

const clickButtonByText = async (user, text) => {
  await user.click(screen.getByRole('button', { name: text }));
};

describe('<Dropdown />', () => {
  let mockHandler1;
  let mockHandler2;

  beforeEach(() => {
    mockHandler1 = jest.fn();
    mockHandler2= jest.fn();

    render(
      <Dropdown
        trigger={<button>{triggerText}</button>}
        menu={[
          <button onClick={mockHandler1}>{actionText1}</button>,
          <button onClick={mockHandler2}>{actionText2}</button>
        ]}
      />
    );
  });

  test('renders the trigger component', async () => {
    await screen.findByRole('button', { name: triggerText } );
  });

  test('dropdown options are not displayed by default', async () => {
    const element1 = screen.queryByRole('button', { name: actionText1 });
    expect(element1).toBe(null);

    const element2 = screen.queryByRole('button', { name: actionText2 });
    expect(element2).toBe(null);
  });

  test('clicking the trigger displays the all the dropdown options', async () => {
    const user = userEvent.setup();

    await clickButtonByText(user);

    await screen.findByRole('button', { name: actionText1 });
    await screen.findByRole('button', { name: actionText2 });
  });

  describe('when dropdown menu is open', () => {
    let user;

    beforeEach(async () => {
      user = userEvent.setup();
      await clickButtonByText(user, triggerText);
    });

    test('can click dropdown option', async () => {
      await clickButtonByText(user, actionText1);

      expect(mockHandler1.mock.calls).toHaveLength(1);
      expect(mockHandler2.mock.calls).toHaveLength(0);
    });

    test('clicking a dropdown option closes the dropdown menu', async () => {
      await clickButtonByText(user, actionText1);

      const element1 = screen.queryByRole('button', { name: actionText1 });
      expect(element1).toBe(null);

      const element2 = screen.queryByRole('button', { name: actionText2 });
      expect(element2).toBe(null);
    });
  });
});