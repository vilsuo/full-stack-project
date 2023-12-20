import { useState } from 'react';
import { createSearchParams, useNavigate, useSearchParams } from 'react-router-dom';

const SearchForm = () => {
  const [searchParams] = useSearchParams();

  const [query, setQuery] = useState(searchParams.get('q'));
  const navigate = useNavigate();

  const handleSubmit = (event) => {
    event.preventDefault();

    const searchParams = {};
    if (query) {
      const params = [[ 'q', query ]];
      searchParams.search = `?${createSearchParams(params)}`;
    }
    navigate({
      pathname: '/search/results',
      ...searchParams
    });
  };

  return (
    <div className='search-form'>
      <h2>Search for users</h2>

      <form action='post' onSubmit={handleSubmit}>
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
    </div>
  );
};

export default SearchForm;