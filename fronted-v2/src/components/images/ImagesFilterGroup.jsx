import { IMAGE_PRIVACIES, OPTION_NONE } from '../../constants';

const FILTER_OPTIONS = [
  OPTION_NONE,
  ...IMAGE_PRIVACIES,
];

const ImagesFilterGroup = ({ filter, setFilter }) => {

  return (
    <label>
      <span>Filter:</span>
      <div className='radio-group'>
        {FILTER_OPTIONS.map(option => (
          <div key={`filter-privacy-${option.value}`} className='radio'>
              <input
                type='radio'
                name='filter'
                value={option.value}
                id={`radio-filter-privacy-${option.value}`}
                checked={filter === option.value}
                onChange={ ({ target}) => setFilter(target.value) }
              />
              <label htmlFor={`radio-filter-privacy-${option.value}`}>{option.label}</label>
          </div>
          ))}
      </div>
    </label>
  );
};

export default ImagesFilterGroup;