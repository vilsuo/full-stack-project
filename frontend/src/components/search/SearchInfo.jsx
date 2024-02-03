import React from 'react';
import Spinner from '../Spinner';

const SearchInfo = ({ query, total, time, loading }) => {

  if (loading) return <Spinner />;

  return (
    <React.Fragment>
      { query
        ? <span>Total results for &quot<span className='italic'>{query}</span>&quot: {total}. </span>
        : <span>No search query. Total results {total}. </span>
      }
      <span>Time {time} ms.</span>
    </React.Fragment>
  );
};

export default SearchInfo;