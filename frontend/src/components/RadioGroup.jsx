import ToolTip from './ToolTip';

const RadioGroup = ({ options, value, setValue, optionName }) => {

  return (
    <label>
      <span>{optionName}:</span>
      <div className='radio-group'>
        {options.map(option => (
          <div key={`${optionName}-${option.value}`} className='radio'>
            <input
              type='radio'
              name={`${optionName}`}
              value={option.value}
              id={`radio-${optionName}-${option.value}`}
              checked={value === option.value}
              onChange={ ({ target}) => setValue(target.value) }
            />
            <label htmlFor={`radio-${optionName}-${option.value}`}>
              { option.tooltipText
                ? (
                  <ToolTip tooltipText={option.tooltipText}>
                    {option.label}
                  </ToolTip>
                ) : option.label
              }
            </label>
          </div>
          ))}
      </div>
    </label>
  );
};

export default RadioGroup;