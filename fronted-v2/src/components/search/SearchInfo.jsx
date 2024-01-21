import React from 'react';

const SearchInfo = ({ query, total, time, loading }) => {

  if (loading) {
    return <span>...</span>
  }

  return (
    <React.Fragment>
      { query
        ? <span>Total results for '<span className='italic'>{query}</span>': {total}. </span>
        : <span>Total results {total}.</span>
      }
      <span>Time {time} ms.</span>
    </React.Fragment>
  );
};

export default SearchInfo;