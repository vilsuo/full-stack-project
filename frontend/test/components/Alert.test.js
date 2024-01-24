import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import Alert from '../../src/components/Alert';

describe('<Alert />', () => {
  const prefix = 'Message';
  const messages = [ 'test message 1', 'test message 2' ];
  const alert = { prefix, details: messages[0] };

  test('renders single message', () => {
    render(<Alert alert={alert} />);

    const element = screen.getByText(new RegExp(alert.details));
    expect(element).toBeDefined();
  });

  test('renders array of messages in a single alert', () => {
    const otherAlert = { ...alert, details: messages }
    render(<Alert alert={otherAlert} />);

    const element1 = screen.getByText(new RegExp(otherAlert.details[0]));
    const element2 = screen.getByText(new RegExp(otherAlert.details[1]));

    expect(element1).toBeDefined();
    expect(element1).toBe(element2);
  });

  test('can reset message', async () => {
    const mockHandler = jest.fn();

    render(<Alert alert={alert} clearAlert={mockHandler} />);

    const user = userEvent.setup()
    const button = await screen.findByRole('button');
    await user.click(button)

    expect(mockHandler.mock.calls).toHaveLength(1);
  });
});