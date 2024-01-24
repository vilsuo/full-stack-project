import { getByRole, render } from '@testing-library/react';
import userEvent from '@testing-library/user-event'

import RadioGroup from '../../src/components/RadioGroup';
import { useState } from 'react';

const options = [
  { value: '1', label: 'option A' },
  { value: '2', label: 'option B' },
  { value: '3', label: 'option C' },
  { value: '4', label: 'option D' },
];

const Wrapper = ({ initialValue }) => {
  const [value, setValue] = useState(initialValue);

  return (
    <RadioGroup
      options={options}
      value={value}
      setValue={setValue}
      optionName='Numbers'
    />
  );
};

const clickOption = async (user, container, option) => {
  const radioInput = getOption(container, option);
  await user.click(radioInput);
};

const getOption = (container, option) => {
  return getByRole(container, 'radio', { name: option.label });
};

describe('<RadioGroup />', () => {
  test('no options are checked if not given a value', () => {
    const value = null;
    const { container } = render(<Wrapper initialValue={value} />);

    const radioInputs = container.querySelectorAll("input[type='radio'");

    expect(radioInputs).toHaveLength(options.length);

    radioInputs.forEach(radioInput =>
      expect(radioInput.checked).toBe(false)
    );
  });

  test('when value is given, only that value is checked', () => {
    const value = options[1].value;
    const { container } = render(<Wrapper initialValue={value} />);

    const radioInputs = container.querySelectorAll("input[type='radio'");
    radioInputs.forEach(radioInput =>
      expect(radioInput.checked).toBe(radioInput.value === value)
    );
  });

  test('radio input can be clicked', async () => {
    const user = userEvent.setup();

    const value = options[1].value;
    const { container } = render(<Wrapper initialValue={value} />);

    await clickOption(user, container, options[2]);
  });

  describe('user checking option', () => {
    let container;

    const initialOption = options[1]
    const optionToSelect = options[2];

    beforeEach(async () => {
      const user = userEvent.setup();
      container = render(<Wrapper initialValue={initialOption.value} />).container;
      await clickOption(user, container, optionToSelect);
    });

    test('after selecting an option, the option is set to selected', async () => {
      expect(getOption(container, optionToSelect).checked).toBe(true);
    });
  
    test('when selecting a new option, the old option is deselected', async () => {
      expect(getOption(container, initialOption).checked).toBe(false);
    });
  });
});