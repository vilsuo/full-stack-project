import { useState } from 'react';
import { createSearchParams, useNavigate } from 'react-router-dom';

const SearchForm = () => {
  const [query, setQuery] = useState('');
  const navigate = useNavigate();

  const handleSubmit = (event) => {
    event.preventDefault();

    const searchParams = {};
    if (query) {
      const params = [[ 'q', query ]];
      searchParams.search = `?${createSearchParams(params)}`;
    }
    navigate({
      pathname: '/users',
      ...searchParams
    });
  };

  return (
    <form className='search-form' action='post' onSubmit={handleSubmit}>
      <div className='resettable'>
        <input
          type='text'
          name='query'
          placeholder='Search...'
          value={query}
          onChange={event => setQuery(event.target.value)}
        />
        <button type='button' onClick={() => setQuery('')}>×</button>
      </div>
      <button type='submit'>Search</button>
    </form>
  );
};

export default SearchForm;