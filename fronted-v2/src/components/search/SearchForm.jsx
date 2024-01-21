import { useState } from 'react';
import { createSearchParams, useNavigate, useSearchParams } from 'react-router-dom';

import RadioGroup from '../RadioGroup';
import IconButton from '../IconButton';

import { FaTimes, FaSearch  } from 'react-icons/fa';

const SIZE_OPTIONS = [
  { value: '5', label: '5' },
  { value: '10', label: '10' },
  { value: '25', label: '25' },
];

const DEFAULT_SIZE_OPTION = SIZE_OPTIONS[1];

const SearchForm = () => {
  const [searchParams] = useSearchParams();

  const [query, setQuery] = useState(searchParams.get('q') || '');
  const [size, setSize] = useState(searchParams.get('size') || DEFAULT_SIZE_OPTION.value);

  const navigate = useNavigate();

  const handleSubmit = (event) => {
    event.preventDefault();

    const params = [[ 'q', query ], [ 'size', size ]];
    const searchParams = { search: `?${createSearchParams(params)}` };

    navigate({
      pathname: '/search/results',
      ...searchParams
    });
  };

  return (
    <div>
      <h2>Search for users</h2>

      <form className='search-form' action='post' onSubmit={handleSubmit}>
        <RadioGroup 
          options={SIZE_OPTIONS}
          value={size}
          setValue={setSize}
          optionName={'Results per page'}
        />

        <div className='search-input'>
          <div className='resettable'>
            <input
              type='text'
              name='query'
              placeholder='Search...'
              value={query}
              onChange={event => setQuery(event.target.value)}
            />
            <IconButton
              type='button'
              disabled={!query}
              onClick={() => setQuery('')}
              size='15px'
            >
              <FaTimes />
            </IconButton>
          </div>

          <IconButton type='submit' size='15px'>
            <FaSearch />
          </IconButton>
        </div>
      </form>
    </div>
  );
};

export default SearchForm;